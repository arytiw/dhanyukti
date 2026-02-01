package com.dhan.Stonks.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_trade")
public class StockTrade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String symbol;
    private int quantity;
    private double price;
    private String type; // BUY, SELL
    private LocalDateTime createdAt;

    public StockTrade() {}
    public StockTrade(Long userId, String symbol, int quantity, double price, String type) {
        this.userId = userId;
        this.symbol = symbol;
        this.quantity = quantity;
        this.price = price;
        this.type = type;
        this.createdAt = LocalDateTime.now();
    }

    public String getSymbol() { return symbol; }
    public int getQuantity() { return quantity; }
    public double getPrice() { return price; }
    public String getType() { return type; }
}