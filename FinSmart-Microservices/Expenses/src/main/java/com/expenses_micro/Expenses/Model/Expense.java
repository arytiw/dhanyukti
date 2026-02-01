package com.expenses_micro.Expenses.Model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(value = 1, message = "Minimum Expense should be 1Rs")
    @Column(nullable = false)
    private double amount;

    @NotBlank(message = "Category is required")
    @Size(min = 3, max = 50, message = "Category should be between 3–50 characters")
    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 255)
    private String description;

    @NotNull(message = "Date of expenditure is required")
    @Column(nullable = false)
    private LocalDate expenseDate;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    //  Instead of @ManyToOne User, just store userId
    @Column(nullable = false, name = "user_id")
    private Long userId;

    // Constructors
    public Expense() {
    }

    public Expense(Long id, double amount, String category, String description, LocalDate expenseDate, LocalDateTime createdAt, Long userId) {
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
        return "Expense{" +
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
