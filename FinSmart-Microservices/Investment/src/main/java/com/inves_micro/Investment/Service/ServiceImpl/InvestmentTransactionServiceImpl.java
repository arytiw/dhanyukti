package com.inves_micro.Investment.Service.ServiceImpl;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.inves_micro.Investment.Model.InvestmentTransaction;
import com.inves_micro.Investment.Repository.InvestmentRepository;
import com.inves_micro.Investment.Repository.InvestmentTransactionRepository;
import com.inves_micro.Investment.Service.InvestmentTransactionService;

@Service
public class InvestmentTransactionServiceImpl implements InvestmentTransactionService {

    private static final Logger logger =
            LoggerFactory.getLogger(InvestmentTransactionServiceImpl.class);

    private final InvestmentTransactionRepository txRepo;
    private final InvestmentRepository investmentRepo;

    public InvestmentTransactionServiceImpl(InvestmentTransactionRepository txRepo,
                                            InvestmentRepository investmentRepo) {
        this.txRepo = txRepo;
        this.investmentRepo = investmentRepo;
    }

    @Override
    public InvestmentTransaction createTransaction(InvestmentTransaction tx,
                                                   Long userId,
                                                   Long investmentId) {
        logger.info("Creating transaction for userId={} investmentId={}", userId, investmentId);

        // ensure investment exists and belongs to this user
        investmentRepo.findById(investmentId)
                .filter(inv -> inv.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Investment not found for id " + investmentId + " and userId " + userId));

        tx.setUserId(userId);
        tx.setInvestmentId(investmentId);

        InvestmentTransaction saved = txRepo.save(tx);
        logger.debug("Transaction saved with id={}", saved.getId());
        return saved;
    }

    @Override
    public List<InvestmentTransaction> getAllTransactionsForUser(Long userId) {
        logger.info("Fetching all transactions for userId={}", userId);
        return txRepo.findByUserId(userId);
    }

    @Override
    public List<InvestmentTransaction> getTransactionsForInvestment(Long investmentId, Long userId) {
        logger.info("Fetching transactions for investmentId={} userId={}", investmentId, userId);
        return txRepo.findByInvestmentIdAndUserId(investmentId, userId);
    }

    @Override
    public Optional<InvestmentTransaction> getTransactionById(Long id, Long userId) {
        logger.info("Fetching transaction id={} for userId={}", id, userId);
        return txRepo.findById(id)
                .filter(tx -> tx.getUserId().equals(userId));
    }

    @Override
    public InvestmentTransaction updateTransaction(Long id,
                                                   InvestmentTransaction updatedTx,
                                                   Long userId) {
        InvestmentTransaction existing = txRepo.findById(id)
                .filter(tx -> tx.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Transaction not found for id " + id + " and userId " + userId));

        if (updatedTx.getAmount() != null) existing.setAmount(updatedTx.getAmount());
        if (updatedTx.getMode() != null) existing.setMode(updatedTx.getMode());
        if (updatedTx.getDateTime() != null) existing.setDateTime(updatedTx.getDateTime());
        if (updatedTx.getNote() != null) existing.setNote(updatedTx.getNote());

        InvestmentTransaction saved = txRepo.save(existing);
        logger.info("Updated transaction id={} for userId={}", id, userId);
        return saved;
    }

    @Override
    public void deleteTransaction(Long id, Long userId) {
        InvestmentTransaction existing = txRepo.findById(id)
                .filter(tx -> tx.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Transaction not found for id " + id + " and userId " + userId));
        txRepo.delete(existing);
        logger.info("Deleted transaction id={} for userId={}", id, userId);
    }
}
