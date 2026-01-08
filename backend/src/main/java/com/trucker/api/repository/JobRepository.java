package com.trucker.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.trucker.api.entity.JobEntity;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long> {

// Obtener los últimos trabajos realizados
    List<JobEntity> findTop10ByOrderByCreatedAtDesc();

    // Consulta para el Dashboard: Calcula la eficiencia (Euros por Kilómetro)
    @Query("SELECT j.sourceCity, j.destinationCity, (j.income * 1.0 / j.distanceKm) as efficiency " +
           "FROM Job j WHERE j.distanceKm > 0 ORDER BY j.createdAt DESC")
    List<Object[]> getJobsEfficiency();
}
