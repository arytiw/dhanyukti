package com.expenses_micro.Expenses.Service.ServiceImpl;

import com.expenses_micro.Expenses.Model.Income;
import com.expenses_micro.Expenses.Repository.IncomeRepository;
import com.expenses_micro.Expenses.Service.IncomeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;

    public IncomeServiceImpl(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    @Override
    public Income getCurrentIncomeForUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User id cannot be null");
        }
        return incomeRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional
    public Income setOrUpdateIncomeForUser(Long userId, double amount) {
        if (userId == null) {
            throw new IllegalArgumentException("User id cannot be null");
        }
        if (amount < 0) {
            throw new IllegalArgumentException("Income amount must be zero or positive");
        }

        Income existing = incomeRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
        if (existing == null) {
            Income income = new Income();
            income.setUserId(userId);
            income.setAmount(amount);
            return incomeRepository.save(income);
        } else {
            existing.setAmount(amount);
            return incomeRepository.save(existing);
        }
    }
}


