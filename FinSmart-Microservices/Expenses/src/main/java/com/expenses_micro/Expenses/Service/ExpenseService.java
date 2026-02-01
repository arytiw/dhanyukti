package com.expenses_micro.Expenses.Service;

import java.time.LocalDate;
import java.util.List;

import com.expenses_micro.Expenses.DTO.ExpenseDTO;
import com.expenses_micro.Expenses.Model.Expense;

public interface ExpenseService {
    
    ExpenseDTO createExpense(Expense e, Long userId);
    
    ExpenseDTO getByIdAndUser(Long id, Long userId);
    
    List<ExpenseDTO> getByDateAndUser(LocalDate date, Long userId);
    
    List<ExpenseDTO> getByMonthAndUser(int month, int year, Long userId);
    
    List<ExpenseDTO> getByYearAndUser(int year, Long userId);
    
    void deleteExpense(Long id, Long userId);
    
    List<ExpenseDTO> getByUserId(Long userId);
    
    ExpenseDTO updateExpense(Long id, ExpenseDTO expenseDto, Long userId);
    
    List<ExpenseDTO> getByMonthsAndUser(List<Integer> months, int year, Long userId);
    
    List<ExpenseDTO> getByMonthRangeAndUser(int start, int end, int year, Long userId);

    List<String> getDistinctCategoriesForUser(Long userId);
}