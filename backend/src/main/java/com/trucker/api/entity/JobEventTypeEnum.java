package com.trucker.api.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum JobEventTypeEnum {
    JOB_STARTED(0),
    JOB_FINISHED(1),
    TOLL(2),
    CRASH(4),
    SPEEDING(4); // Si ambos son 4, puedes mapearlos igual o distinguirlos por texto

    private final int code;

    JobEventTypeEnum(int code) {
        this.code = code;
    }

    // Método para que Jackson sepa convertir el número al Enum
    @JsonValue
    public int getCode() {
        return code;
    }

    // Método para buscar el Enum por ID numérico
    public static JobEventTypeEnum fromCode(int code) {
        for (JobEventTypeEnum type : JobEventTypeEnum.values()) {
            if (type.code == code) return type;
        }
        return null;
    }
}