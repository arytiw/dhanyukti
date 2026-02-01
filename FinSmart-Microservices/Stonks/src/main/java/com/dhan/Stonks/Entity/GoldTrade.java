package com.dhan.Stonks.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gold_trade")
public class GoldTrade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private double grams;
    private double pricePerGram;
    private String type; // BUY, SELL, IMPORT
    private LocalDateTime createdAt;

    public GoldTrade() {}
    public GoldTrade(Long userId, double grams, double pricePerGram, String type) {
        this.userId = userId;
        this.grams = grams;
        this.pricePerGram = pricePerGram;
        this.type = type;
        this.createdAt = LocalDateTime.now();
    }

    public double getGrams() { return grams; }
    public double getPricePerGram() { return pricePerGram; }
    public String getType() { return type; }
}