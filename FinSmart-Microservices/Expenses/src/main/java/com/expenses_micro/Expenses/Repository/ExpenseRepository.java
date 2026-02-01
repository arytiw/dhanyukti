package com.expenses_micro.Expenses.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.expenses_micro.Expenses.Model.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    Expense findByIdAndUserId(Long id, Long userId);
    
    List<Expense> findByUserId(Long userId);

    List<Expense> findByExpenseDateAndUserId(LocalDate expenseDate, Long userId);

    @Query("SELECT e FROM Expense e WHERE MONTH(e.expenseDate) = :month AND YEAR(e.expenseDate) = :year AND e.userId = :userId")
    List<Expense> findByMonthAndUserId(@Param("month") int month, @Param("year") int year, @Param("userId") Long userId);

    @Query("SELECT e FROM Expense e WHERE YEAR(e.expenseDate) = :year AND e.userId = :userId")
    List<Expense> findByYearAndUserId(@Param("year") int year, @Param("userId") Long userId);

    @Query("SELECT DISTINCT e.category FROM Expense e WHERE e.userId = :userId ORDER BY e.category ASC")
    List<String> findDistinctCategoriesByUserId(@Param("userId") Long userId);
}
