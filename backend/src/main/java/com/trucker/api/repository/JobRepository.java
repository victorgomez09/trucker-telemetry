package com.trucker.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trucker.api.entity.JobEntity;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long> {

// Obtener los últimos trabajos realizados
    List<JobEntity> findTop10ByOrderByCreatedAtDesc();

    List<JobEntity> findByUserUsernameOrderByCreatedAtDesc(String username);
}
