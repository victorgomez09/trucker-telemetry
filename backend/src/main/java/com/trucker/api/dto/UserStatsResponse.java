package com.trucker.api.dto;

public record UserStatsResponse(
        Long totalJobs,
        Double totalKm,
        Double totalIncome,
        Double avgConsumption) {

    public UserStatsResponse(
            Long totalJobs,
            Double totalKm,
            Double totalIncome,
            Double avgConsumption) {
        this.totalJobs = (totalJobs == null) ? 0L : totalJobs;
        this.totalKm = (totalKm == null) ? 0.0 : totalKm;
        this.totalIncome = (totalIncome == null) ? 0.0 : totalIncome;
        this.avgConsumption = (avgConsumption == null) ? 0.0 : avgConsumption;
    }

}