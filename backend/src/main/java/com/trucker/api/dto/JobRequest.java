package com.trucker.api.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record JobRequest(
    @JsonProperty("cargo_damage") Double cargoDamage,
    @JsonProperty("cargo_name") String cargoName,
    @JsonProperty("truck_name") String truckName,
    @JsonProperty("city_source") String citySource,
    @JsonProperty("company_source") String companySource,
    @JsonProperty("city_destination") String cityDestination,
    @JsonProperty("company_destination") String companyDestination,
    @JsonProperty("planned_distance") Double plannedDistance,
    @JsonProperty("fuel_comsumption") Double fuelComsumption,
    @JsonProperty("fuel_cost") Double fuelCost,
    @JsonProperty("job_income") Long jobIncome,
    @JsonProperty("total_fuel_liters") Double totalFuelLiters,
    @JsonProperty("cargo_mass_kg") Double cargoMassKg,
    List<JobEventRequest> events
) {}