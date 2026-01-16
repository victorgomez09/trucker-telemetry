package com.trucker.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.trucker.api.dto.UserStatsResponse;
import com.trucker.api.entity.JobEntity;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long> {

    @Query("""
                SELECT new com.trucker.api.dto.UserStatsResponse(
                    COUNT(j),
                    SUM(CAST(j.distanceKm as double)),
                    SUM(CAST(j.income as double)),
                    AVG(CAST(j.fuelComsumption as double))
                )
                FROM JobEntity j
                WHERE j.user.username = :username
            """)
    UserStatsResponse getUserStats(String username);

    List<JobEntity> findTop10ByOrderByCreatedAtDesc();

    List<JobEntity> findByUserUsernameOrderByCreatedAtDesc(String username);
}
