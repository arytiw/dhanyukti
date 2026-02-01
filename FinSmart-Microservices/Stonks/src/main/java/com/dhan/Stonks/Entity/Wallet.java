package com.dhan.Stonks.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "wallet")
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private double balance;

    public Wallet() {}
    public Wallet(Long userId, double balance) {
        this.userId = userId;
        this.balance = balance;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
}