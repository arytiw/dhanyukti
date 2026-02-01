package com.expenses_micro.Expenses.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expenses_micro.Expenses.Model.Income;
import com.expenses_micro.Expenses.Security.JwtUserDetails;
import com.expenses_micro.Expenses.Service.IncomeService;

@RestController
@RequestMapping("/api/income")
@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
public class IncomeController {

    private final IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    private Long getUserIdFromAuth(Authentication authen) {
        if (authen != null && authen.getPrincipal() instanceof JwtUserDetails jwt) {
            return jwt.getUserId();
        }
        throw new IllegalArgumentException("Invalid or missing JWT token - userId cannot be extracted");
    }

    @GetMapping
    public ResponseEntity<Income> getIncome(Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        Income income = incomeService.getCurrentIncomeForUser(userId);
        return ResponseEntity.ok(income);
    }

    public record IncomeRequest(double amount) {}

    @PostMapping
    public ResponseEntity<Income> setOrUpdateIncome(@RequestBody IncomeRequest request, Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        Income income = incomeService.setOrUpdateIncomeForUser(userId, request.amount());
        return ResponseEntity.ok(income);
    }
}


