package com.inves_micro.Investment.Model;



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
@Table(name = "investment_trans")
public class InvestmentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(value = 1, message = "Amount must be greater than 0")
    @NotNull(message = "Amount is required")
    @Column(nullable = false)
    private Double amount;

    @NotBlank(message = "Mode of investment is required")
    @Size(min = 3, max = 50, message = "Mode should be between 3 to 50 characters")
    @Column(nullable = false, length = 50)
    private String mode;   // e.g. "SIP", "Lump Sum", "Auto-Debit"

    @NotNull(message = "Transaction datetime is required")
    @Column(nullable = false)
    private LocalDateTime dateTime = LocalDateTime.now();

    @Size(max = 255, message = "Note should not exceed 255 characters")
    @Column(length = 255)
    private String note;

    
    @Column(name = "investment_id")
    private Long investmentId;

    
    @Column(name = "user_id")
    private Long userId;

    // Constructors
    public InvestmentTransaction() {
    }

    public InvestmentTransaction(Long id, Double amount, String mode, LocalDateTime dateTime, String note, Long investmentId, Long userId) {
        this.id = id;
        this.amount = amount;
        this.mode = mode;
        this.dateTime = dateTime;
        this.note = note;
        this.investmentId = investmentId;
        this.userId = userId;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Double getAmount() {
        return amount;
    }

    public String getMode() {
        return mode;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public String getNote() {
        return note;
    }

    public Long getInvestmentId() {
        return investmentId;
    }

    public Long getUserId() {
        return userId;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public void setInvestmentId(Long investmentId) {
        this.investmentId = investmentId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // toString
    @Override
    public String toString() {
        return "InvestmentTransaction{" +
                "id=" + id +
                ", amount=" + amount +
                ", mode='" + mode + '\'' +
                ", dateTime=" + dateTime +
                ", note='" + note + '\'' +
                ", investmentId=" + investmentId +
                ", userId=" + userId +
                '}';
    }
}

