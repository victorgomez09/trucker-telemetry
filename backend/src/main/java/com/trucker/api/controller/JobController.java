package com.trucker.api.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trucker.api.dto.DashboardResponse;
import com.trucker.api.dto.JobRequest;
import com.trucker.api.dto.JobResponse;
import com.trucker.api.dto.UserStatsResponse;
import com.trucker.api.mapper.JobMapper;
import com.trucker.api.service.JobService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final JobMapper jobMapper;

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<JobResponse>> getMyJobs(Principal principal) {
        return ResponseEntity
                .ok(jobService.getJobsForCurrentUser(principal.getName()).stream().map(jobMapper::toDto).toList());
    }

    // @GetMapping("/{id}")
    // @PreAuthorize("hasRole('USER')")
    // public ResponseEntity<JobResponse> getById(Long id) {
    // JobResponse jobDto = jobMapper.toDto(jobService.getJobById(id));
    // if (jobDto == null) {
    // return ResponseEntity.notFound().build();
    // }

    // return ResponseEntity.ok(jobDto);
    // }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboardData(Principal principal) {
        String username = principal.getName();

        UserStatsResponse stats = jobService.getUserStats(username);
        List<JobResponse> userJobs = jobService.getJobsForCurrentUser(username).stream().map(jobMapper::toDto).toList();

        return ResponseEntity.ok(new DashboardResponse(stats, userJobs));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<JobResponse> create(@RequestBody JobRequest jobDto, Principal principal) {
        return ResponseEntity
                .ok(jobMapper.toDto(jobService.processAndSaveJob(jobMapper.toEntity(jobDto), principal.getName())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
