package com.expenses_micro.Expenses.Controller;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.expenses_micro.Expenses.DTO.ExpenseDTO;
import com.expenses_micro.Expenses.Model.Expense;
import com.expenses_micro.Expenses.Security.JwtUserDetails;
import com.expenses_micro.Expenses.Service.ExpenseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
public class ExpenseController {
    
    private static final Logger logger = LoggerFactory.getLogger(ExpenseController.class);
    private final ExpenseService expenseService;
    
    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }
    
    
    private Long getUserIdFromAuth(Authentication authen) {
        // Extract userId from JWT token stored in Authentication
        if (authen != null && authen.getPrincipal() instanceof JwtUserDetails jwt) {
            return jwt.getUserId();
        }
        throw new IllegalArgumentException("Invalid or missing JWT token - userId cannot be extracted");
    }
    
    @PostMapping
    public ResponseEntity<ExpenseDTO> addExpense(@Valid @RequestBody Expense expense, Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        logger.info("The User Id fetched is: {}", userId);
        logger.info("Adding expense for userId: {}", userId);
        
        ExpenseDTO created = expenseService.createExpense(expense, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDTO> getExpenseById(@PathVariable Long id, Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        logger.info("Fetching expense ID {} for userId: {}", id, userId);
        
        ExpenseDTO expense = expenseService.getByIdAndUser(id, userId);
        return ResponseEntity.ok(expense);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(
            @PathVariable Long id,
            @RequestBody ExpenseDTO expenseDto,
            Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        ExpenseDTO updated = expenseService.updateExpense(id, expenseDto, userId);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id, Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        logger.info("Deleting expense ID: {} for userId: {}", id, userId);
        expenseService.deleteExpense(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses(Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        logger.info("Fetching all expenses for userId: {}", userId);
        return ResponseEntity.ok(expenseService.getByUserId(userId));
    }
    
    @GetMapping("/by-date/{date}")
    public ResponseEntity<List<ExpenseDTO>> getByDate(
            Authentication authen,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(expenseService.getByDateAndUser(date, userId));
    }

    @GetMapping("/by-month/{month}/{year}")
    public ResponseEntity<List<ExpenseDTO>> getByMonth(
            Authentication authen,
            @PathVariable int month,
            @PathVariable int year) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(expenseService.getByMonthAndUser(month, year, userId));
    }

    @GetMapping("/by-year/{year}")
    public ResponseEntity<List<ExpenseDTO>> getByYear(Authentication authen, @PathVariable int year) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(expenseService.getByYearAndUser(year, userId));
    }

    @GetMapping("/by-months")
    public ResponseEntity<List<ExpenseDTO>> getByMonths(
            Authentication authen,
            @RequestParam List<Integer> months,
            @RequestParam int year) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(expenseService.getByMonthsAndUser(months, year, userId));
    }

    @GetMapping("/by-month-range")
    public ResponseEntity<List<ExpenseDTO>> getByMonthRange(
            Authentication authen,
            @RequestParam int start,
            @RequestParam int end,
            @RequestParam int year) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(expenseService.getByMonthRangeAndUser(start, end, year, userId));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories(Authentication authen) {
        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(expenseService.getDistinctCategoriesForUser(userId));
    }
}
