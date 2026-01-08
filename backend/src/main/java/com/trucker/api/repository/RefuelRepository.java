package com.trucker.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trucker.api.entity.RefuelEntity;

@Repository
public interface RefuelRepository extends JpaRepository<RefuelEntity, Long> {
}