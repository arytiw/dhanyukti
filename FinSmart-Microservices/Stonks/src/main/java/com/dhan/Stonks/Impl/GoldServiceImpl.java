package com.dhan.Stonks.Impl;

import com.dhan.Stonks.Entity.GoldTrade;
import com.dhan.Stonks.Repository.GoldTradeRepository;
import com.dhan.Stonks.Service.GoldService;
import com.dhan.Stonks.Service.MarketDataService;
import com.dhan.Stonks.Service.WalletService;
import org.springframework.stereotype.Service;

@Service
public class GoldServiceImpl implements GoldService {

    private final GoldTradeRepository repository;
    private final WalletService walletService;
    private final MarketDataService marketDataService;

    public GoldServiceImpl(GoldTradeRepository repository, 
                           WalletService walletService,
                           MarketDataService marketDataService) {
        this.repository = repository;
        this.walletService = walletService;
        this.marketDataService = marketDataService;
    }

    @Override
    public void buyGold(Long userId, double grams) {
        double pricePerGram = marketDataService.getRealGoldPrice();
        walletService.debit(userId, grams * pricePerGram);
        repository.save(new GoldTrade(userId, grams, pricePerGram, "BUY"));
    }

    @Override
    public void sellGold(Long userId, double grams) {
        double pricePerGram = marketDataService.getRealGoldPrice();
        walletService.topUp(userId, grams * pricePerGram);
        repository.save(new GoldTrade(userId, grams, pricePerGram, "SELL"));
    }

    @Override
    public void importGold(Long userId, double grams, double originalPrice) {
        // No wallet debit
        repository.save(new GoldTrade(userId, grams, originalPrice, "IMPORT"));
    }
}