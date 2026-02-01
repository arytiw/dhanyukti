package com.expenses_micro.Expenses.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExpenseDTO {
    private Long id;
    private double amount;
    private String category;
    private String description;
    private LocalDate expenseDate;
    private LocalDateTime createdAt;
    private Long userId;

    public ExpenseDTO() {
    	super();
    }

    public ExpenseDTO(Long id, double amount, String category, String description, LocalDate expenseDate, LocalDateTime createdAt, Long userId) {
        this.id = id;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.expenseDate = expenseDate;
        this.createdAt = createdAt;
        this.userId = userId;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public double getAmount() {
        return amount;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // toString
    @Override
    public String toString() {
        return "ExpenseDTO{" +
                "id=" + id +
                ", amount=" + amount +
                ", category='" + category + '\'' +
                ", description='" + description + '\'' +
                ", expenseDate=" + expenseDate +
                ", createdAt=" + createdAt +
                ", userId=" + userId +
                '}';
    }
}