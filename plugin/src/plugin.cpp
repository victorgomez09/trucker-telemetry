#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <fstream>
#include <shlobj.h>
#include <string>
#include <vector>
#include <math.h>

#include "scssdk.h"
#include "scssdk_telemetry.h"
#include "eurotrucks2/scssdk_telemetry_eut2.h"
#include <shellapi.h>

#define PLUGIN_EXPORT extern "C" __declspec(dllexport)
#define MAX_EVENTS 128

#pragma pack(push, 1)
struct GameplayEvents
{
    int32_t type;
    int64_t value;
    char text[128];
    uint64_t timestamp;
};

struct Ets2Data
{
    float speed;
    float rpm;
    int32_t gear;
    float fuel_consumption;
    float cargo_damage;
    float cargo_weight;

    uint64_t job_income;
    int32_t planned_distance;
    float navigation_distance;
    char city_source[64];
    char city_destination[64];
    char company_source[64];
    char company_destination[64];
    char cargo_name[64];
    char truck_name[64];

    float last_refuel_amount;
    float last_refuel_cost;
    int32_t refuel_event_triggered;

    int32_t event_count;
    int32_t next_event_index;
    GameplayEvents events[MAX_EVENTS];

    int32_t job_finished;

    float x, y, z;
    float speed_limit;
    int32_t is_cheater;
};
#pragma pack(pop)

HANDLE hMapFile = NULL;
Ets2Data *shared_data = nullptr;
scs_log_t game_log = nullptr;
std::string dynamic_backup_path;

// --- PERSISTENCIA ---
std::string get_ets2_config_path()
{
    wchar_t szPath[MAX_PATH];
    if (SUCCEEDED(SHGetFolderPathW(NULL, CSIDL_PERSONAL, NULL, 0, szPath)))
    {
        std::wstring final_path_w = szPath;
        final_path_w += L"\\Euro Truck Simulator 2\\telemetry_cache.bin";
        return std::string(final_path_w.begin(), final_path_w.end());
    }
    return "telemetry_cache.bin";
}

void save_to_disk()
{
    if (dynamic_backup_path.empty() || !shared_data)
        return;
    std::ofstream outfile(dynamic_backup_path, std::ios::binary | std::ios::trunc);
    if (outfile.is_open())
    {
        outfile.write(reinterpret_cast<const char *>(shared_data), sizeof(Ets2Data));
        outfile.close();
    }
}

void load_from_disk()
{
    if (dynamic_backup_path.empty() || !shared_data)
        return;
    std::ifstream infile(dynamic_backup_path, std::ios::binary);
    if (infile.is_open())
    {
        infile.read(reinterpret_cast<char *>(shared_data), sizeof(Ets2Data));
        infile.close();
    }
}

void add_gameplay_event(int32_t type, int64_t value, const char *description)
{
    if (!shared_data)
        return;
    int idx = shared_data->next_event_index;
    shared_data->events[idx].type = type;
    shared_data->events[idx].value = value;
    shared_data->events[idx].timestamp = GetTickCount64();
    strncpy(shared_data->events[idx].text, description, 127);
    shared_data->events[idx].text[127] = '\0';
    shared_data->next_event_index = (idx + 1) % MAX_EVENTS;
    if (shared_data->event_count < MAX_EVENTS)
        shared_data->event_count++;

    if (game_log)
    {
        char buf[256];
        sprintf(buf, "[Bridge] Evento: %s (Tipo %d)", description, type);
        game_log(SCS_LOG_TYPE_message, buf);
    }
    save_to_disk();
}

// --- TELEMETRÍA (EJECUCIÓN CONTINUA) ---
SCSAPI_VOID telemetry_store(const scs_string_t name, const scs_u32_t index, const scs_value_t *const value, const scs_context_t context)
{
    if (!shared_data || !value)
        return;

    if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_speed) == 0)
        shared_data->speed = value->value_float.value * 3.6f;
    else if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_engine_rpm) == 0)
        shared_data->rpm = value->value_float.value;
    else if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_engine_gear) == 0)
        shared_data->gear = value->value_s32.value;
    else if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_fuel_average_consumption) == 0)
        shared_data->fuel_consumption = value->value_float.value * 100.0f;
    else if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_wear_chassis) == 0)
        shared_data->cargo_damage = value->value_float.value;
    else if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_navigation_speed_limit) == 0)
        shared_data->speed_limit = value->value_float.value * 3.6f;
    else if (strcmp(name, SCS_TELEMETRY_TRUCK_CHANNEL_navigation_distance) == 0)
        shared_data->navigation_distance = value->value_float.value;
}

// --- HANDLERS DE EVENTOS ---
SCSAPI_VOID gameplay_handler(const scs_event_t event, const void *const event_info, const scs_context_t context)
{
    const struct scs_telemetry_gameplay_event_t *ev = static_cast<const struct scs_telemetry_gameplay_event_t *>(event_info);

    if (strcmp(ev->id, SCS_TELEMETRY_GAMEPLAY_EVENT_job_delivered) == 0)
    {
        shared_data->job_finished = 1;
        add_gameplay_event(2, shared_data->job_income, "Trabajo Entregado");
        memset(shared_data->city_source, 0, 64);
        memset(shared_data->city_destination, 0, 64);
        for (const scs_named_value_t *attr = ev->attributes; attr->name; ++attr)
        {
            if (strcmp(attr->name, "distance.km") == 0)
            {
                float km = attr->value.value_float.value;
                shared_data->planned_distance = (int32_t)km;
                char b[256];
                sprintf(b, "[Bridge] Scan Result -> Planned distance: '%s'",
                        shared_data->planned_distance);
                game_log(SCS_LOG_TYPE_message, b);
            }
        }
    }
    else if (strcmp(ev->id, SCS_TELEMETRY_GAMEPLAY_EVENT_job_cancelled) == 0)
    {
        add_gameplay_event(3, 0, "Trabajo Cancelado");
        memset(shared_data->city_source, 0, 64);
        memset(shared_data->city_destination, 0, 64);
    }
}

SCSAPI_VOID configuration_handler(const scs_event_t event, const void *const event_info, const scs_context_t context)
{
    const struct scs_telemetry_configuration_t *conf = static_cast<const struct scs_telemetry_configuration_t *>(event_info);

    // Configuración del Camión
    if (strcmp(conf->id, SCS_TELEMETRY_CONFIG_truck) == 0)
    {
        std::string brand = "", model = "";
        for (const scs_named_value_t *val = conf->attributes; val->name; ++val)
        {
            if (strcmp(val->name, "brand") == 0)
                brand = val->value.value_string.value;
            if (strcmp(val->name, "name") == 0)
                model = val->value.value_string.value;
        }
        std::string full = brand + " " + model;
        strncpy(shared_data->truck_name, full.c_str(), 63);
        shared_data->truck_name[63] = '\0';
    }

    // Configuración del Trabajo (Aquí está el fix del Deep Scan)
    if (strcmp(conf->id, SCS_TELEMETRY_CONFIG_job) == 0)
    {
        bool found_src = false;
        bool found_dst = false;
        for (const scs_named_value_t *attr = conf->attributes; attr->name; ++attr)
        {
            if (attr->value.type == SCS_VALUE_TYPE_string)
            {
                const char *val = attr->value.value_string.value;
                if (val && strlen(val) > 0)
                {
                    if (strcmp(attr->name, "source.city") == 0)
                    {
                        strncpy(shared_data->city_source, val, 63);
                        found_src = true;
                    }
                    else if (strcmp(attr->name, "destination.city") == 0)
                    {
                        strncpy(shared_data->city_destination, val, 63);
                        found_dst = true;
                    }
                    else if (strcmp(attr->name, "cargo") == 0)
                    {
                        strncpy(shared_data->cargo_name, val, 63);
                    }
                    if (strcmp(attr->name, "planned.distance.km") == 0)
                    {
                        shared_data->planned_distance = attr->value.value_s32.value;
                    }
                }
            }
            if (strcmp(attr->name, "planned_distance.km") == 0)
            {
                shared_data->planned_distance = attr->value.value_u32.value;
            }
            else if (strcmp(attr->name, "income") == 0)
            {
                shared_data->job_income = attr->value.value_u64.value;
            }
        }

        if (game_log)
        {
            char b[256];
            sprintf(b, "[Bridge] Scan Result -> Origen: '%s' | Destino: '%s'",
                    shared_data->city_source, shared_data->city_destination);
            game_log(SCS_LOG_TYPE_message, b);
        }

        shared_data->job_finished = 0;
        add_gameplay_event(4, 0, "Trabajo en curso");
        save_to_disk();
    }
}

// --- INICIALIZACIÓN ---
PLUGIN_EXPORT SCSAPI_RESULT scs_telemetry_init(const scs_u32_t version, const scs_telemetry_init_params_t *const params)
{
    const scs_telemetry_init_params_v100_t *v100 = static_cast<const scs_telemetry_init_params_v100_t *>(params);
    game_log = v100->common.log;

    hMapFile = CreateFileMappingA(INVALID_HANDLE_VALUE, NULL, PAGE_READWRITE, 0, sizeof(Ets2Data), "ETS2_RUST_SHMEM");
    shared_data = (Ets2Data *)MapViewOfFile(hMapFile, FILE_MAP_ALL_ACCESS, 0, 0, sizeof(Ets2Data));

    dynamic_backup_path = get_ets2_config_path();
    load_from_disk();

    v100->register_for_event(SCS_TELEMETRY_EVENT_gameplay, gameplay_handler, nullptr);
    v100->register_for_event(SCS_TELEMETRY_EVENT_configuration, configuration_handler, nullptr);

    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_speed, SCS_U32_NIL, SCS_VALUE_TYPE_float, 0, telemetry_store, nullptr);
    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_engine_rpm, SCS_U32_NIL, SCS_VALUE_TYPE_float, 0, telemetry_store, nullptr);
    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_engine_gear, SCS_U32_NIL, SCS_VALUE_TYPE_s32, 0, telemetry_store, nullptr);
    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_fuel_average_consumption, SCS_U32_NIL, SCS_VALUE_TYPE_float, 0, telemetry_store, nullptr);
    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_wear_chassis, SCS_U32_NIL, SCS_VALUE_TYPE_float, 0, telemetry_store, nullptr);
    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_navigation_speed_limit, SCS_U32_NIL, SCS_VALUE_TYPE_float, 0, telemetry_store, nullptr);
    v100->register_for_channel(SCS_TELEMETRY_TRUCK_CHANNEL_navigation_distance, SCS_U32_NIL, SCS_VALUE_TYPE_float, 0, telemetry_store, nullptr);

    if (game_log)
        game_log(SCS_LOG_TYPE_message, "[Bridge] Plugin Inicializado Correctamente");

    return SCS_RESULT_ok;
}

PLUGIN_EXPORT SCSAPI_VOID scs_telemetry_shutdown(void)
{
    if (shared_data)
        UnmapViewOfFile(shared_data);
    if (hMapFile)
        CloseHandle(hMapFile);
}