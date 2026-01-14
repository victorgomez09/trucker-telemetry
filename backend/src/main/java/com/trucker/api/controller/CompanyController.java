package com.trucker.api.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trucker.api.dto.CompanySummaryResponse;
import com.trucker.api.service.CompanyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/{id}/summary")
    public ResponseEntity<CompanySummaryResponse> getSummary(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanySummary(id));
    }

    @GetMapping("/{id}/check-membership/{username}")
    public ResponseEntity<Boolean> checkMembership(
            @PathVariable Long id,
            @PathVariable String username) {
        boolean isMember = companyService.isUserInCompany(id, username);
        return ResponseEntity.ok(isMember);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinCompany(@PathVariable Long id, Principal principal) {
        companyService.addMember(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}