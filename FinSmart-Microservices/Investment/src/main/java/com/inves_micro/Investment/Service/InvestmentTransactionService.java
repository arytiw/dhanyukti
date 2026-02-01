package com.inves_micro.Investment.Service;



import java.util.List;
import java.util.Optional;

import com.inves_micro.Investment.Model.InvestmentTransaction;

public interface InvestmentTransactionService {

    InvestmentTransaction createTransaction(InvestmentTransaction tx, Long userId, Long investmentId);

    List<InvestmentTransaction> getAllTransactionsForUser(Long userId);

    List<InvestmentTransaction> getTransactionsForInvestment(Long investmentId, Long userId);

    Optional<InvestmentTransaction> getTransactionById(Long id, Long userId);

    InvestmentTransaction updateTransaction(Long id, InvestmentTransaction updatedTx, Long userId);

    void deleteTransaction(Long id, Long userId);
}

