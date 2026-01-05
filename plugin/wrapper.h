// wrapper.h
#ifndef WRAPPER_H
#define WRAPPER_H

#include <stdint.h>
#include <stddef.h>

// --- TRUCO DE PRODUCCIÓN ---
// Forzamos las macros que el SDK de SCS intenta definir. 
// Al definirlas nosotros aquí, el SDK verá que ya existen (en teoría) 
// o al menos usará nuestras versiones vacías que no rompen la sintaxis.

#undef SCSSDK_HEADER
#undef SCSSDK_FOOTER
#define SCSSDK_HEADER
#define SCSSDK_FOOTER

#undef SCSAPI
#define SCSAPI 
#define SCSAPI_RESULT uint32_t
#define SCSAPI_VOID void

// Estas dos líneas evitan el error "Unknown compiler"
#ifndef __GNUC__
#define __GNUC__ 9
#endif
#ifndef SCS_OS_LINUX
#define SCS_OS_LINUX 1
#endif

// --- INCLUDES ---
// Importante: No incluyas "scssdk.h" directamente si te da problemas, 
// ve directo a los que necesitas, pero aquí los pondremos en orden de dependencia.

#include "sdk/scssdk.h"
#include "sdk/scssdk_value.h"
#include "sdk/scssdk_telemetry.h"
#include "sdk/common/scssdk_telemetry_common_channels.h"
#include "sdk/common/scssdk_telemetry_truck_common_channels.h"

#endif