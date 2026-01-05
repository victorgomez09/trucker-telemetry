#ifndef SDK_BRIDGE_H
#define SDK_BRIDGE_H

#include <stdint.h>

#pragma pack(push, 8)
typedef const char* scs_string_t;

typedef struct scs_value_t {
    uint32_t type;
    uint32_t _pad; 
    union {
        uint8_t bool_val;
        float float_val;
        double double_val; // <--- Añade esto
        int32_t i32_val;
        uint64_t u64_val;
        scs_string_t string_val;
    } value;
} scs_value_t;

typedef void (*scs_telemetry_channel_callback_t)(const scs_string_t name, const uint32_t index, const scs_value_t *const value, void* context);

// Layout exacto para evitar el error de "Unknown Event"
typedef struct scs_telemetry_init_params_v101_t {
    // 0 - 15 (Base params)
    void* event_log;
    void* common_params;

    // 16 - 31 (Event registration)
    void* register_for_event;
    void* unregister_from_event;

    // 32 - 47 (Channel registration) - AQUÍ ESTÁ EL CAMBIO
    // Añadimos dos punteros de relleno porque el juego tiene miembros intermedios en x64
    void* _pad_config1;
    void* _pad_config2;

    // 48 - 63 (La función que realmente queremos)
    uint32_t (*register_for_channel)(const scs_string_t name, const uint32_t index, const uint32_t type, const uint32_t flags, scs_telemetry_channel_callback_t callback, void* context);
    void* unregister_from_channel;

} scs_telemetry_init_params_v101_t;
#pragma pack(pop)

#endif