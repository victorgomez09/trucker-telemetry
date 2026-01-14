package com.trucker.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.trucker.api.dto.CompanyJobProjection;
import com.trucker.api.entity.CompanyEntity;

@Repository
public interface CompanyRepository extends JpaRepository<CompanyEntity, Long> {

    // Consulta para las estadísticas (Ya la teníamos)
    @Query("SELECT COUNT(j), SUM(j.distanceKm) FROM JobEntity j WHERE j.company.id = :companyId")
    Object[] getRawStats(Long companyId);

    // Consulta para la lista de trabajos (Proyección)
    @Query("""
                SELECT new com.trucker.api.dto.CompanyJobProjection(
                    j.sourceCity, j.destinationCity, j.cargoName, j.cargoMassKg, j.createdAt
                )
                FROM JobEntity j
                WHERE j.company.id = :companyId
                ORDER BY j.createdAt DESC
            """)
    List<CompanyJobProjection> findAllJobsByCompanyId(Long companyId);

    boolean existsByIdAndMembersUsername(Long companyId, String username);
}