package com.inves_micro.Investment.Controller;


import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inves_micro.Investment.Model.Investment;
import com.inves_micro.Investment.Security.JwtUserDetails;
import com.inves_micro.Investment.Service.InvestmentService;   // adjust package if different

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/investments")
@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
public class InvestmentController {

    private static final Logger logger = LoggerFactory.getLogger(InvestmentController.class);

    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    private Long getUserIdFromAuth(Authentication authen) {
        if (authen != null && authen.getPrincipal() instanceof JwtUserDetails jwt) {
            return jwt.getUserId();
        }
        throw new IllegalArgumentException("Invalid or missing JWT token - userId cannot be extracted");
    }

    @PostMapping
    public ResponseEntity<Investment> addInvestment(
            @Valid @RequestBody Investment investment,
            Authentication authen) {

        Long userId = getUserIdFromAuth(authen);
        investment.setUserId(userId); // will always be non-null
        Investment created = investmentService.addinvestment(investment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Investment> getInvestmentById(@PathVariable Long id,
                                                        Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        logger.info("Fetching investment id={} for userId={}", id, userId);

        Investment inv = investmentService.getInvestmentById(id);
        // Optional: enforce ownership check here if needed
        return ResponseEntity.ok(inv);
    }

    @GetMapping
    public ResponseEntity<List<Investment>> getAllForUser(Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        logger.info("Fetching all investments for userId={}", userId);
        return ResponseEntity.ok(investmentService.getByUserId(userId) == null
                ? List.of()
                : investmentService.BystartDateandUserId(null, userId)); // or simply use repo.findByUserId in service
    }

    @GetMapping("/by-start-date/{date}")
    public ResponseEntity<List<Investment>> getByStartDate(
            Authentication authen,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(investmentService.BystartDateandUserId(date, userId));
    }

    @GetMapping("/by-start-month/{month}/{year}")
    public ResponseEntity<List<Investment>> getByStartMonth(
            Authentication authen,
            @PathVariable int month,
            @PathVariable int year) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(investmentService.ByMonthandUserId(month, year, userId));
    }

    @GetMapping("/by-start-year/{year}")
    public ResponseEntity<List<Investment>> getByStartYear(
            Authentication authen,
            @PathVariable int year) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(investmentService.ByYearandUserId(year, userId));
    }

    @GetMapping("/by-end-date/{date}")
    public ResponseEntity<List<Investment>> getByEndDate(
            Authentication authen,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(investmentService.ByendDateandUserId(date, userId));
    }

    @GetMapping("/by-end-month/{month}/{year}")
    public ResponseEntity<List<Investment>> getByEndMonth(
            Authentication authen,
            @PathVariable int month,
            @PathVariable int year) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(investmentService.ByendMonthandUserId(month, year, userId));
    }

    @GetMapping("/by-end-year/{year}")
    public ResponseEntity<List<Investment>> getByEndYear(
            Authentication authen,
            @PathVariable int year) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(investmentService.ByendYearandUserId(year, userId));
    }

    // Optional: mark as completed
    @PutMapping("/{id}/complete")
    public ResponseEntity<Void> markAsCompleted(@PathVariable Long id, Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        logger.info("Marking investment id={} as completed for userId={}", id, userId);
        // call service method you added earlier
        // investmentService.markAsCompleted(id);
        return ResponseEntity.noContent().build();
    }
}
