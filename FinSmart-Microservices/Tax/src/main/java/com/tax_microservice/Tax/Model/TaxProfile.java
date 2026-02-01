package com.tax_microservice.Tax.Model;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(
    name = "tax_profiles",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_taxprofile_user", columnNames = "user_id"),
        @UniqueConstraint(name = "uk_taxprofile_pan", columnNames = "pan_number")
    }
)
public class TaxProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "PAN number is required")
    @Pattern(regexp = "[A-Z]{5}[0-9]{4}[A-Z]", message = "Invalid PAN number format")
    @Column(name = "pan_number", nullable = false, length = 10)
    private String panNumber;

    @PositiveOrZero(message = "Annual income must be non-negative")
    @Column(name = "annual_income", nullable = false)
    private Double annualIncome;

    @PositiveOrZero(message = "Deductions must be non-negative")
    @Column(nullable = false)
    private Double deductions;

    @PositiveOrZero(message = "Tax paid must be non-negative")
    @Column(name = "tax_paid", nullable = false)
    private Double taxPaid;


    @Pattern(
        regexp = "^[0-9]{2}-[0-9]{2}$|^[0-9]{4}-[0-9]{4}$",
        message = "Financial year must be in format '25-26' or '2024-2025'"
    )
    @Column(name = "financial_year", nullable = false)
    private String financialYear;

    @NotBlank(message = "Filing status is required")
    @Pattern(regexp = "PENDING|FILED|REVIEW", message = "Filing status must be PENDING, FILED, or REVIEW")
    @Column(name = "filing_status", nullable = false, length = 10)
    private String filingStatus;

    @Size(max = 100, message = "Employer name can be up to 100 characters")
    @Column(length = 100)
    private String employer;

    // microservice-style: just store userId, no User entity
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Constructors
    public TaxProfile() {
    }

    public TaxProfile(Long id, String panNumber, Double annualIncome, Double deductions, Double taxPaid, String financialYear, String filingStatus, String employer, Long userId) {
        this.id = id;
        this.panNumber = panNumber;
        this.annualIncome = annualIncome;
        this.deductions = deductions;
        this.taxPaid = taxPaid;
        this.financialYear = financialYear;
        this.filingStatus = filingStatus;
        this.employer = employer;
        this.userId = userId;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getPanNumber() {
        return panNumber;
    }

    public Double getAnnualIncome() {
        return annualIncome;
    }

    public Double getDeductions() {
        return deductions;
    }

    public Double getTaxPaid() {
        return taxPaid;
    }

    public String getFinancialYear() {
        return financialYear;
    }

    public String getFilingStatus() {
        return filingStatus;
    }

    public String getEmployer() {
        return employer;
    }

    public Long getUserId() {
        return userId;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public void setAnnualIncome(Double annualIncome) {
        this.annualIncome = annualIncome;
    }

    public void setDeductions(Double deductions) {
        this.deductions = deductions;
    }

    public void setTaxPaid(Double taxPaid) {
        this.taxPaid = taxPaid;
    }

    public void setFinancialYear(String financialYear) {
        this.financialYear = financialYear;
    }

    public void setFilingStatus(String filingStatus) {
        this.filingStatus = filingStatus;
    }

    public void setEmployer(String employer) {
        this.employer = employer;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // toString
    @Override
    public String toString() {
        return "TaxProfile{" +
                "id=" + id +
                ", panNumber='" + panNumber + '\'' +
                ", annualIncome=" + annualIncome +
                ", deductions=" + deductions +
                ", taxPaid=" + taxPaid +
                ", financialYear='" + financialYear + '\'' +
                ", filingStatus='" + filingStatus + '\'' +
                ", employer='" + employer + '\'' +
                ", userId=" + userId +
                '}';
    }
}
