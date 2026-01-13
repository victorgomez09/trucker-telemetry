package com.trucker.api.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.trucker.api.entity.JobEntity;
import com.trucker.api.entity.JobEventEntity;
import com.trucker.api.entity.JobEventTypeEnum;
import com.trucker.api.entity.UserEntity;
import com.trucker.api.repository.JobRepository;
import com.trucker.api.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @Value("${trucker.economy.fuel-price-per-liter}")
    private double fuelPrice;

    public List<JobEntity> getJobsForCurrentUser(String username) {
        return jobRepository.findByUserUsernameOrderByCreatedAtDesc(username);
    }

    @Transactional
    public JobEntity processAndSaveJob(JobEntity job, String username) {
        System.out.println("job income: " + job.getIncome());
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        job.setUser(user);

        // 1. Calcular el coste del combustible basado en los litros del DTO
        // Asumiendo que añadiste totalFuelLiters a tu JobRequest
        double fuelCost = job.getTotalFuelLiters() * fuelPrice;

        // 2. Calcular multas y otros eventos
        double penaltyExpenses = calculatePenaltyExpenses(job.getEvents());

        // 3. Beneficio Neto Final
        // Ingreso Bruto - Gastos de Combustible - Multas
        long netIncome = Math.round(job.getIncome() - fuelCost - penaltyExpenses);

        job.setIncome(netIncome);
        job.setFuelCost(fuelCost);

        if (job.getEvents() != null) {
            job.getEvents().forEach(event -> {
                event.setJob(job);
            });
        }

        job.setCreatedAt(new Date());
        job.setCargoDamagePerc(Float.parseFloat(String.valueOf(Math.round(job.getCargoDamagePerc() * 100))));

        return jobRepository.save(job);
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }

    private double calculatePenaltyExpenses(List<JobEventEntity> events) {
        if (events == null)
            return 0.0;
        return events.stream()
                .filter(e -> e.getType() == JobEventTypeEnum.SPEEDING || e.getType() == JobEventTypeEnum.CRASH)
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                .sum();
    }
}