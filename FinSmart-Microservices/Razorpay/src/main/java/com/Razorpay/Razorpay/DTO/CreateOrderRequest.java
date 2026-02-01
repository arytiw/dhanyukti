package com.Razorpay.Razorpay.DTO;

import jakarta.validation.constraints.Min;


public class CreateOrderRequest {

    @Min(value = 1, message = "Amount must be >= 1")
    private int amount;

    private String currency = "INR";

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}