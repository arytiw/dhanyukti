package com.dhan.Stonks.Service;

public interface StockService {
    void buyStock(Long userId, String symbol, int quantity);
    void sellStock(Long userId, String symbol, int quantity);
    // New Method for "Old Data"
    void importStock(Long userId, String symbol, int quantity, double originalBuyPrice);
}