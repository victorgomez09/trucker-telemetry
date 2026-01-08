package com.trucker.api.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.trucker.api.entity.JobEntity;
import com.trucker.api.entity.JobEventEntity;
import com.trucker.api.entity.RefuelEntity;
import com.trucker.api.repository.JobRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public List<JobEntity> getAllJobs() {
        return jobRepository.findAll();
    }

    public JobEntity getJobById(Long id) {
        return jobRepository.findById(id).orElse(null);
    }

    /**
     * Procesa el reporte final de un trabajo.
     * Calcula gastos, beneficios netos y vincula las relaciones.
     */
    @Transactional
    public JobEntity processAndSaveJob(JobEntity job) {
        // 1. Vincular los eventos (Multas, Peajes) al objeto Job
        if (job.getEvents() != null) {
            job.getEvents().forEach(event -> event.setJob(job));
        }

        // 2. Vincular los repostajes al objeto Job
        if (job.getRefuels() != null) {
            job.getRefuels().forEach(refuel -> refuel.setJob(job));
        }

        // 3. Calcular Gastos Totales
        double fuelExpenses = calculateFuelExpenses(job.getRefuels());
        double otherExpenses = calculateOtherExpenses(job.getEvents());

        // 4. Calcular Beneficio Neto (Net Income)
        // Guardamos el bruto original en una variable por si quieres mostrarlo
        long grossIncome = job.getIncome(); 
        long netIncome = Math.round(grossIncome - fuelExpenses - otherExpenses);
        
        // Actualizamos el income para que la DB refleje el dinero REAL ganado
        job.setIncome(netIncome);

        // 5. Guardar todo en cascada
        return jobRepository.save(job);
    }

    /**
     * Suma todos los costes de los repostajes realizados durante el viaje.
     */
    private double calculateFuelExpenses(List<RefuelEntity> refuels) {
        if (refuels == null) return 0.0;
        return refuels.stream()
                .mapToDouble(RefuelEntity::getTotalCost)
                .sum();
    }

    /**
     * Suma el coste de multas y otros eventos negativos.
     */
    private double calculateOtherExpenses(List<JobEventEntity> events) {
        if (events == null) return 0.0;
        return events.stream()
                .filter(e -> "FINE".equalsIgnoreCase(e.getType().name()) || "TOLL".equalsIgnoreCase(e.getType().name()))
                .mapToDouble(JobEventEntity::getAmount)
                .sum();
    }
}