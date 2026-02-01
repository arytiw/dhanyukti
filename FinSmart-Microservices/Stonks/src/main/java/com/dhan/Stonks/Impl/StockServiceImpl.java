package com.dhan.Stonks.Impl;

import com.dhan.Stonks.Entity.StockTrade;
import com.dhan.Stonks.Repository.StockTradeRepository;
import com.dhan.Stonks.Service.MarketDataService;
import com.dhan.Stonks.Service.StockService;
import com.dhan.Stonks.Service.WalletService;
import org.springframework.stereotype.Service;

@Service
public class StockServiceImpl implements StockService {

    private final StockTradeRepository repository;
    private final WalletService walletService;
    private final MarketDataService marketDataService; // Inject this!

    public StockServiceImpl(StockTradeRepository repository, 
                            WalletService walletService, 
                            MarketDataService marketDataService) {
        this.repository = repository;
        this.walletService = walletService;
        this.marketDataService = marketDataService;
    }

    @Override
    public void buyStock(Long userId, String symbol, int quantity) {
        // 1. Fetch Real Price
        double price = marketDataService.getRealStockPrice(symbol);
        
        // 2. Calculate & Debit
        double total = price * quantity;
        walletService.debit(userId, total);

        // 3. Save
        repository.save(new StockTrade(userId, symbol, quantity, price, "BUY"));
    }

    @Override
    public void sellStock(Long userId, String symbol, int quantity) {
        double price = marketDataService.getRealStockPrice(symbol);
        walletService.topUp(userId, price * quantity);
        repository.save(new StockTrade(userId, symbol, quantity, price, "SELL"));
    }

    @Override
    public void importStock(Long userId, String symbol, int quantity, double originalBuyPrice) {
        // 1. Do NOT touch the wallet (it was bought years ago)
        // 2. Save with type "IMPORT" so we can calculate average price later
        repository.save(new StockTrade(userId, symbol, quantity, originalBuyPrice, "IMPORT"));
    }
}