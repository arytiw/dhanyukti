package com.dhan.Stonks.Service;

public interface GoldService {
    void buyGold(Long userId, double grams);
    void sellGold(Long userId, double grams);
    void importGold(Long userId, double grams, double originalPrice);
}