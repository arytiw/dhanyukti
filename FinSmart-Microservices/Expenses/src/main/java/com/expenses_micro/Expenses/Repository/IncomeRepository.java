package com.expenses_micro.Expenses.Repository;

import com.expenses_micro.Expenses.Model.Income;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    Income findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}


