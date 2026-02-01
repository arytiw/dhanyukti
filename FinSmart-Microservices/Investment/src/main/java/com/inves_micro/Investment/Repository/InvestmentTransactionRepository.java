package com.inves_micro.Investment.Repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inves_micro.Investment.Model.InvestmentTransaction;

@Repository
public interface InvestmentTransactionRepository extends JpaRepository<InvestmentTransaction, Long> {

    List<InvestmentTransaction> findByInvestmentId(Long investmentId);

    List<InvestmentTransaction> findByUserId(Long userId);

    List<InvestmentTransaction> findByInvestmentIdAndUserId(Long investmentId, Long userId);
}

