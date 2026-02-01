package com.dhan.Stonks.Impl;

import com.dhan.Stonks.Entity.Wallet;
import com.dhan.Stonks.Repository.WalletRepository;
import com.dhan.Stonks.Service.WalletService;
import org.springframework.stereotype.Service;

@Service
public class WalletServiceImpl implements WalletService {
    private final WalletRepository walletRepository;

    public WalletServiceImpl(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Override
    public void topUp(Long userId, double amount) {
        Wallet wallet = walletRepository.findByUserId(userId).orElse(new Wallet(userId, 0.0));
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet);
    }

    @Override
    public void debit(Long userId, double amount) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        if (wallet.getBalance() < amount) throw new RuntimeException("Insufficient funds");
        wallet.setBalance(wallet.getBalance() - amount);
        walletRepository.save(wallet);
    }

    @Override
    public double getBalance(Long userId) {
        return walletRepository.findByUserId(userId).map(Wallet::getBalance).orElse(0.0);
    }
}