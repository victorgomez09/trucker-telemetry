#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <fstream>
#include <shlobj.h>
#include <string>
#include <vector>

#include "scssdk.h"
#include "scssdk_telemetry.h"
#include "eurotrucks2/scssdk_telemetry_eut2.h"

#define PLUGIN_EXPORT extern "C" __declspec(dllexport)
#define MAX_EVENTS 128

// Estructuras con alineación de 1 byte para compatibilidad con Rust
#pragma pack(push, 1)
struct GameplayEvents {
    int32_t type; // 1: Multa, 2: Entrega, 3: Peaje, 4: Ferry, 5: Tren
    int64_t value;
    char description[128];
    uint64_t timestamp;
};

struct Ets2Data {
    // TELEMETRY DATA
    float speed;
    float rpm;
    int gear;
    float fuel_consumption;
    float cargo_damage;
    float cargo_weight;

    // JOB DATA
    uint64_t job_income;
    int32_t planned_distance;
    char city_source[64];
    char city_destination[64];
    char company_source[64];
    char company_destination[64];
    char cargo_name[64];

    // GAMEPLAY EVENTS
    int32_t event_count;
    int32_t next_event_index;
    GameplayEvents events[MAX_EVENTS];

    int32_t job_finished;

    float x, y, z;          // actual position
    float speed_limit;      // Speed limiter of the road
    int32_t is_cheater;
};
#pragma pack(pop)

// Variables Globales
HANDLE hMapFile = NULL;
Ets2Data* shared_data = nullptr;
scs_log_t game_log = nullptr;
std::string dynamic_backup_path;

// --- LÓGICA DE DETECCIÓN DINÁMICA ---
std::string get_ets2_config_path() {
    LPWSTR lpCmdLine = GetCommandLineW();
    int argc;
    LPWSTR* argv = CommandLineToArgvW(lpCmdLine, &argc);
    
    std::wstring custom_home = L"";
    for (int i = 0; i < argc; i++) {
        if (wcscmp(argv[i], L"-homedir") == 0 && (i + 1) < argc) {
            custom_home = argv[i + 1];
            break;
        }
    }
    LocalFree(argv);

    std::wstring final_path_w;
    if (!custom_home.empty()) {
        final_path_w = custom_home;
        // Si el homedir es una ruta base, ETS2 suele crear la subcarpeta dentro
        // Pero normalmente apunta directamente a donde está el game.log
    } else {
        wchar_t szPath[MAX_PATH];
        if (SUCCEEDED(SHGetFolderPathW(NULL, CSIDL_PERSONAL, NULL, 0, szPath))) {
            final_path_w = szPath;
            final_path_w += L"\\Euro Truck Simulator 2";
        }
    }

    std::string full_path(final_path_w.begin(), final_path_w.end());
    if (!full_path.empty() && full_path.back() != '\\') full_path += "\\";
    full_path += "telemetry_cache.bin";

    return full_path;
}

// --- PERSISTENCIA ---
void save_to_disk() {
    if (dynamic_backup_path.empty()) return;
    std::ofstream outfile(dynamic_backup_path, std::ios::binary | std::ios::trunc);
    if (outfile.is_open()) {
        outfile.write(reinterpret_cast<const char*>(shared_data), sizeof(Ets2Data));
        outfile.close();
    }
}

void load_from_disk() {
    if (dynamic_backup_path.empty()) return;
    std::ifstream infile(dynamic_backup_path, std::ios::binary);
    if (infile.is_open()) {
        infile.read(reinterpret_cast<char*>(shared_data), sizeof(Ets2Data));
        infile.close();
    }
}

void add_gameplay_event(int32_t type, int64_t value, const char* description) {
    if (!shared_data) return;

    int idx = shared_data->next_event_index;
    shared_data->events[idx].type = type;
    shared_data->events[idx].value = value;
    shared_data->events[idx].timestamp = GetTickCount64();
    strncpy(shared_data->events[idx].description, description, 127);

    shared_data->next_event_index = (idx + 1) % MAX_EVENTS;
    if (shared_data->event_count < MAX_EVENTS) {
        shared_data->event_count++;
    }
    save_to_disk();
}

// --- HANDLERS ---
SCSAPI_VOID gameplay_handler(const scs_event_t event, const void* const event_info, const scs_context_t context) {
    const struct scs_telemetry_gameplay_event_t* ev = static_cast<const struct scs_telemetry_gameplay_event_t*>(event_info);

    if (strcmp(ev->id, SCS_TELEMETRY_GAMEPLAY_EVENT_player_fined) == 0) {
        int64_t amount = 0; char offence[64] = "Infraccion";
        for (const scs_named_value_t* attr = ev->attributes; attr->name; ++attr) {
            if (strcmp(attr->name, "fine.amount") == 0) amount = attr->value.value_s64.value;
            if (strcmp(attr->name, "fine.offence") == 0) strncpy(offence, attr->value.value_string.value, 63);
        }
        add_gameplay_event(1, amount, offence);
    }
    else if (strcmp(ev->id, SCS_TELEMETRY_GAMEPLAY_EVENT_player_tollgate_paid) == 0) {
        int64_t amount = 0;
        for (const scs_named_value_t* attr = ev->attributes; attr->name; ++attr) {
            if (strcmp(attr->name, "pay.amount") == 0) amount = attr->value.value_s64.value;
        }
        add_gameplay_event(3, amount, "Peaje");
    }
    else if (strcmp(ev->id, SCS_TELEMETRY_GAMEPLAY_EVENT_player_use_ferry) == 0) {
        int64_t amount = 0;
        for (const scs_named_value_t* attr = ev->attributes; attr->name; ++attr) {
            if (strcmp(attr->name, "pay.amount") == 0) amount = attr->value.value_s64.value;
        }
        add_gameplay_event(4, amount, "Ferry");
    }
    else if (strcmp(ev->id, SCS_TELEMETRY_GAMEPLAY_EVENT_player_use_train) == 0) {
        int64_t amount = 0;
        for (const scs_named_value_t* attr = ev->attributes; attr->name; ++attr) {
            if (strcmp(attr->name, "pay.amount") == 0) amount = attr->value.value_s64.value;
        }
        add_gameplay_event(5, amount, "Tren");
    }
    else if (strcmp(ev->id, SCS_TELEMETRY_GAMEPLAY_EVENT_job_delivered) == 0) {
        shared_data->job_finished = 1;
        for (const scs_named_value_t* attr = ev->attributes; attr->name; ++attr) {
            if (strcmp(attr->name, "revenue") == 0) shared_data->job_income = attr->value.value_s64.value;
        }
        add_gameplay_event(2, shared_data->job_income, "Trabajo Entregado");
        save_to_disk();
    }
    else if (strcmp(ev->id, SCS_TELEMETRY_GAMEPLAY_EVENT_job_cancelled) == 0) {
        int64_t penalty = 0;
        for (const scs_named_value_t* attr = ev->attributes; attr->name; ++attr) {
            if (strcmp(attr->name, "cancel.penalty") == 0) penalty = attr->value.value_s64.value;
        }
        add_gameplay_event(3, penalty, "Trabajo Cancelado");
        memset(shared_data->city_source, 0, 320); 
        shared_data->job_finished = 0;
        if (!dynamic_backup_path.empty()) _unlink(dynamic_backup_path.c_str()); 
    }
}

SCSAPI_VOID telemetry_store(const scs_string_t name, const scs_u32_t index, const scs_value_t* const value, const scs_context_t context) {
    if (!shared_data || !value) return;
    if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_speed) == 0) shared_data->speed = value->value_float.value * 3.6f;
    else if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_engine_rpm) == 0) shared_data->rpm = value->value_float.value;
    else if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_engine_gear) == 0) shared_data->gear = value->value_s32.value;
    else if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_fuel_average_consumption) == 0) shared_data->fuel_consumption = value->value_float.value * 100.0f;
    else if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_wear_chassis) == 0) shared_data->cargo_damage = value->value_float.value;

    // Anti-Cheat
    if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_world_placement) == 0) {
        shared_data->x = value->value_dplacement.position.x;
        shared_data->z = value->value_dplacement.position.z;
        
        float dist = sqrt(pow(shared_data->x - last_x, 2) + pow(shared_data->z - last_y, 2));
        if (dist > 500.0f && shared_data->speed < 5.0f) { 
            shared_data->is_cheater = 1;
        }
        last_x = shared_data->x; last_y = shared_data->z;
    }
    
    // Speed limiter
    if (strcmp(name, SCS_TELEMETRY_NAVIGATION_CHANNEL_speed_limit) == 0) {
        shared_data->speed_limit = value->value_float.value * 3.6f;
    }
}

SCSAPI_VOID configuration_handler(const scs_event_t event, const void* const event_info, const scs_context_t context) {
    const struct scs_telemetry_configuration_t* conf = static_cast<const struct scs_telemetry_configuration_t*>(event_info);
    
    if (strcmp(conf->id, SCS_TELEMETRY_CONFIG_job) == 0) {
        if (!conf->attributes || !conf->attributes[0].name) {
            memset(shared_data->city_source, 0, 320);
            shared_data->job_income = 0;
            shared_data->job_finished = 0;
            if (!dynamic_backup_path.empty()) _unlink(dynamic_backup_path.c_str());
            return;
        }

        char old_source[64], old_dest[64], old_cargo[64];
        strncpy(old_source, shared_data->city_source, 63);
        strncpy(old_dest, shared_data->city_destination, 63);
        strncpy(old_cargo, shared_data->cargo_name, 63);

        for (const scs_named_value_t* attr = conf->attributes; attr->name; ++attr) {
            if (strcmp(attr->name, "source_city") == 0) strncpy(shared_data->city_source, attr->value.value_string.value, 63);
            else if (strcmp(attr->name, "destination_city") == 0) strncpy(shared_data->city_destination, attr->value.value_string.value, 63);
            else if (strcmp(attr->name, "source_company") == 0) strncpy(shared_data->company_source, attr->value.value_string.value, 63);
            else if (strcmp(attr->name, "destination_company") == 0) strncpy(shared_data->company_destination, attr->value.value_string.value, 63);
            else if (strcmp(attr->name, "cargo") == 0) strncpy(shared_data->cargo_name, attr->value.value_string.value, 63);
            else if (strcmp(attr->name, "cargo_mass") == 0) shared_data->cargo_weight = attr->value.value_float.value;
            else if (strcmp(attr->name, "income") == 0) shared_data->job_income = attr->value.value_u64.value;
            else if (strcmp(attr->name, "planned_distance_km") == 0) shared_data->planned_distance = attr->value.value_s32.value;
        }

        if (strcmp(old_source, shared_data->city_source) != 0 || 
            strcmp(old_dest, shared_data->city_destination) != 0 || 
            strcmp(old_cargo, shared_data->cargo_name) != 0) {
            
            shared_data->job_finished = 0;
            add_gameplay_event(4, 0, "Trabajo en curso");
            save_to_disk();
            if (game_log) game_log(SCS_LOG_TYPE_message, "[Bridge] Nuevo trabajo guardado.");
        }
    }
}

// --- INIT & SHUTDOWN ---
PLUGIN_EXPORT SCSAPI_RESULT scs_telemetry_init(const scs_u32_t version, const scs_telemetry_init_params_t* const params) {
    const scs_telemetry_init_params_v100_t* v100 = static_cast<const scs_telemetry_init_params_v100_t*>(params);
    game_log = v100->common.log;

    hMapFile = CreateFileMappingA(INVALID_HANDLE_VALUE, NULL, PAGE_READWRITE, 0, sizeof(Ets2Data), "ETS2_RUST_SHMEM");
    shared_data = (Ets2Data*)MapViewOfFile(hMapFile, FILE_MAP_ALL_ACCESS, 0, 0, sizeof(Ets2Data));
    
    // Detectamos la ruta dinámicamente
    dynamic_backup_path = get_ets2_config_path();
    
    // Intentamos cargar
    load_from_disk();

    v100->register_for_event(SCS_TELEMETRY_EVENT_gameplay, gameplay_handler, nullptr);
    v100->register_for_event(SCS_TELEMETRY_EVENT_configuration, configuration_handler, nullptr);

    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_speed, SCS_U32_NIL, SCS_VALUE_TYPE_float, 0, telemetry_store, nullptr);
    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_engine_rpm, SCS_U32_NIL, SCS_VALUE_TYPE_float, 0, telemetry_store, nullptr);
    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_engine_gear, SCS_U32_NIL, SCS_VALUE_TYPE_s32, 0, telemetry_store, nullptr);
    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_fuel_average_consumption, SCS_U32_NIL, SCS_VALUE_TYPE_float, 0, telemetry_store, nullptr);
    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_wear_chassis, SCS_U32_NIL, SCS_VALUE_TYPE_float, 0, telemetry_store, nullptr);

    if (game_log) {
        std::string msg = "[Bridge] Path detectado: " + dynamic_backup_path;
        game_log(SCS_LOG_TYPE_message, msg.c_str());
    }

    return SCS_RESULT_ok;
}

PLUGIN_EXPORT SCSAPI_VOID scs_telemetry_shutdown(void) {
    if (shared_data) UnmapViewOfFile(shared_data);
    if (hMapFile) CloseHandle(hMapFile);
}