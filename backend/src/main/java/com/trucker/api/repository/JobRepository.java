package com.trucker.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trucker.api.entity.JobEntity;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long> {

}
