package com.trucker.api.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.trucker.api.entity.JobEntity;
import com.trucker.api.entity.JobEventEntity;
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

    @Transactional
    public JobEntity processAndSaveJob(JobEntity jobRequest) {
        // 1. Calcular el total de gastos (multas y peajes)
        long totalExpenses = jobRequest.getEvents().stream()
                .filter(event -> event.getEventType() == 1 || event.getEventType() == 3) // Multas y Peajes
                .mapToLong(JobEventEntity::getAmount)
                .sum();

        // 2. Calcular ingreso neto
        // El ingreso bruto viene en jobRequest.getIncome()
        long netIncome = jobRequest.getIncome() - totalExpenses;
        
        // Actualizamos el ingreso antes de guardar
        jobRequest.setIncome(netIncome);

        // 3. Vincular eventos al objeto Job para JPA
        if (jobRequest.getEvents() != null) {
            jobRequest.getEvents().forEach(event -> event.setJob(jobRequest));
        }

        return jobRepository.save(jobRequest);
    }
}