package com.dhan.Stonks.Service;

public interface WalletService {
    void topUp(Long userId, double amount);
    void debit(Long userId, double amount);
    double getBalance(Long userId);
}