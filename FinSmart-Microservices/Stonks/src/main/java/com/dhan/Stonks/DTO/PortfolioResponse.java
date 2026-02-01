package com.dhan.Stonks.DTO;

import java.util.List;

public class PortfolioResponse {
    private double totalWalletBalance;
    private double totalPortfolioValue;
    private double totalProfitLoss;
    private List<StockHolding> stockHoldings;
    private GoldHolding goldHolding;

    public double getTotalWalletBalance() { return totalWalletBalance; }
    public void setTotalWalletBalance(double totalWalletBalance) { this.totalWalletBalance = totalWalletBalance; }
    public double getTotalPortfolioValue() { return totalPortfolioValue; }
    public void setTotalPortfolioValue(double totalPortfolioValue) { this.totalPortfolioValue = totalPortfolioValue; }
    public double getTotalProfitLoss() { return totalProfitLoss; }
    public void setTotalProfitLoss(double totalProfitLoss) { this.totalProfitLoss = totalProfitLoss; }
    public List<StockHolding> getStockHoldings() { return stockHoldings; }
    public void setStockHoldings(List<StockHolding> stockHoldings) { this.stockHoldings = stockHoldings; }
    public GoldHolding getGoldHolding() { return goldHolding; }
    public void setGoldHolding(GoldHolding goldHolding) { this.goldHolding = goldHolding; }

    public static class StockHolding {
        public String symbol;
        public int quantity;
        public double avgBuyPrice;
        public double currentPrice;
        public double currentValue;
        public double profitLoss;
    }

    public static class GoldHolding {
        public double grams;
        public double avgBuyPrice;
        public double currentPrice;
        public double currentValue;
        public double profitLoss;
    }
}