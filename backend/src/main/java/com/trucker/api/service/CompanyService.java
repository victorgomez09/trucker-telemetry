package com.trucker.api.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trucker.api.dto.CompanyJobProjection;
import com.trucker.api.dto.CompanySummaryResponse;
import com.trucker.api.entity.CompanyEntity;
import com.trucker.api.entity.UserEntity;
import com.trucker.api.repository.CompanyRepository;
import com.trucker.api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public CompanySummaryResponse getCompanySummary(Long companyId) {
        CompanyEntity company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        // Obtener estadísticas globales
        Object[] stats = (Object[]) companyRepository.getRawStats(companyId)[0];
        Long totalJobs = (Long) stats[0];
        Double totalKms = (Double) stats[1];

        // Obtener lista de trabajos proyectada
        List<CompanyJobProjection> jobs = companyRepository.findAllJobsByCompanyId(companyId);

        return new CompanySummaryResponse(
                company.getName(),
                company.getTag(),
                totalJobs != null ? totalJobs : 0L,
                totalKms != null ? totalKms : 0.0,
                jobs);
    }

    @Transactional(readOnly = true)
    public boolean isUserInCompany(Long companyId, String username) {
        return companyRepository.existsByIdAndMembersUsername(companyId, username);
    }

    @Transactional
    public void addMember(Long companyId, String username) {
        CompanyEntity company = companyRepository.findById(companyId).orElseThrow();
        UserEntity user = userRepository.findByUsername(username).orElseThrow();

        user.getCompanies().add(company);
        userRepository.save(user);
    }
}
