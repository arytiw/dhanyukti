package com.dhan.Stonks.Service;

import com.dhan.Stonks.DTO.PortfolioResponse;
import com.dhan.Stonks.Entity.*;
import com.dhan.Stonks.Repository.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class PortfolioService {

    private final StockTradeRepository stockRepo;
    private final GoldTradeRepository goldRepo;
    private final WalletRepository walletRepo;
    private final MarketDataService marketDataService;

    public PortfolioService(StockTradeRepository stockRepo, GoldTradeRepository goldRepo, 
                            WalletRepository walletRepo, MarketDataService marketDataService) {
        this.stockRepo = stockRepo;
        this.goldRepo = goldRepo;
        this.walletRepo = walletRepo;
        this.marketDataService = marketDataService;
    }

    public PortfolioResponse getPortfolio(Long userId) {
        PortfolioResponse response = new PortfolioResponse();
        
        // 1. Wallet Balance
        response.setTotalWalletBalance(walletRepo.findByUserId(userId)
            .map(Wallet::getBalance).orElse(0.0));

        // 2. Stock Holdings Calculation
        List<StockTrade> stockTrades = stockRepo.findByUserId(userId);
        Map<String, PortfolioResponse.StockHolding> stockMap = new HashMap<>();

        for (StockTrade trade : stockTrades) {
            stockMap.putIfAbsent(trade.getSymbol(), new PortfolioResponse.StockHolding());
            PortfolioResponse.StockHolding h = stockMap.get(trade.getSymbol());
            h.symbol = trade.getSymbol();

            // ✅ FIX IS HERE: Added "|| 'IMPORT'.equalsIgnoreCase..."
            if ("BUY".equalsIgnoreCase(trade.getType()) || "IMPORT".equalsIgnoreCase(trade.getType())) {
                double totalCost = (h.quantity * h.avgBuyPrice) + (trade.getQuantity() * trade.getPrice());
                h.quantity += trade.getQuantity();
                h.avgBuyPrice = (h.quantity == 0) ? 0 : totalCost / h.quantity;
            } else if ("SELL".equalsIgnoreCase(trade.getType())) {
                h.quantity -= trade.getQuantity();
            }
        }

        // Finalize Stock Values with Real-time Data
        List<PortfolioResponse.StockHolding> finalStocks = new ArrayList<>();
        double totalStockValue = 0;
        double totalStockPL = 0;

        for (PortfolioResponse.StockHolding h : stockMap.values()) {
            if (h.quantity > 0) {
                h.currentPrice = marketDataService.getRealStockPrice(h.symbol);
                h.currentValue = h.quantity * h.currentPrice;
                h.profitLoss = h.currentValue - (h.quantity * h.avgBuyPrice);
                
                totalStockValue += h.currentValue;
                totalStockPL += h.profitLoss;
                finalStocks.add(h);
            }
        }
        response.setStockHoldings(finalStocks);

        // 3. Gold Holdings Calculation (This was already correct, but keeping it for completeness)
        List<GoldTrade> goldTrades = goldRepo.findByUserId(userId);
        PortfolioResponse.GoldHolding goldH = new PortfolioResponse.GoldHolding();
        
        for (GoldTrade trade : goldTrades) {
            if ("BUY".equalsIgnoreCase(trade.getType()) || "IMPORT".equalsIgnoreCase(trade.getType())) {
                double totalCost = (goldH.grams * goldH.avgBuyPrice) + (trade.getGrams() * trade.getPricePerGram());
                goldH.grams += trade.getGrams();
                goldH.avgBuyPrice = (goldH.grams == 0) ? 0 : totalCost / goldH.grams;
            } else if ("SELL".equalsIgnoreCase(trade.getType())) {
                goldH.grams -= trade.getGrams();
            }
        }

        if (goldH.grams > 0) {
            goldH.currentPrice = marketDataService.getRealGoldPrice();
            goldH.currentValue = goldH.grams * goldH.currentPrice;
            goldH.profitLoss = goldH.currentValue - (goldH.grams * goldH.avgBuyPrice);
        }
        response.setGoldHolding(goldH);

        // 4. Grand Totals
        response.setTotalPortfolioValue(totalStockValue + goldH.currentValue);
        response.setTotalProfitLoss(totalStockPL + goldH.profitLoss);

        return response;
    }
}