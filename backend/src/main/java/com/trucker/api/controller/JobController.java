package com.trucker.api.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trucker.api.dto.JobDto;
import com.trucker.api.entity.JobEntity;
import com.trucker.api.mapper.JobMapper;
import com.trucker.api.service.JobService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final JobMapper jobMapper;

    @GetMapping("/list")
    public ResponseEntity<List<JobDto>> list() {
        return ResponseEntity.ok(
                jobService.getAllJobs().stream()
                        .map(jobMapper::toDto)
                        .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getById(Long id) {
        JobDto jobDto = jobMapper.toDto(jobService.getJobById(id));
        if (jobDto == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(jobDto);
    }

    @GetMapping("/stats/summary")
    public ResponseEntity<?> getGlobalStats() {
        List<JobEntity> allJobs = jobService.getAllJobs();

        long totalEarned = allJobs.stream().mapToLong(JobEntity::getIncome).sum();
        int totalDistance = allJobs.stream().mapToInt(JobEntity::getDistanceKm).sum();
        long totalJobs = allJobs.size();

        return ResponseEntity.ok(Map.of(
                "totalEarned", totalEarned,
                "totalDistanceKm", totalDistance,
                "totalJobs", totalJobs));
    }

    @PostMapping
    public ResponseEntity<JobDto> create(@RequestBody JobDto jobDto) {
        return ResponseEntity.ok(jobMapper.toDto(jobService.processAndSaveJob(jobMapper.toEntity(jobDto))));
    }
}
