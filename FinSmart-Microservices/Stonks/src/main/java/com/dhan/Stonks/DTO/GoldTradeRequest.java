package com.dhan.Stonks.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class GoldTradeRequest {
    @NotNull @Min(0)
    private Double grams;

    public Double getGrams() { return grams; }
    public void setGrams(Double grams) { this.grams = grams; }
}