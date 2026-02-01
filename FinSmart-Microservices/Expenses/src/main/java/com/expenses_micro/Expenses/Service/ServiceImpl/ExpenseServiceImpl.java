package com.expenses_micro.Expenses.Service.ServiceImpl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.expenses_micro.Expenses.DTO.ExpenseDTO;
import com.expenses_micro.Expenses.Model.Expense;
import com.expenses_micro.Expenses.Repository.ExpenseRepository;
import com.expenses_micro.Expenses.Service.ExpenseService;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expRepo;
    private final ModelMapper modelMapper;

    private static final Logger logger = LoggerFactory.getLogger(ExpenseServiceImpl.class);

    public ExpenseServiceImpl(ExpenseRepository expRepo, ModelMapper modelMapper) {
        this.expRepo = expRepo;
        this.modelMapper = modelMapper;
    }

    private ExpenseDTO convertToDTO(Expense e) {
        return modelMapper.map(e, ExpenseDTO.class);
    }

    @Override
    public ExpenseDTO createExpense(Expense e, Long userId) {
        if (e == null) {
            throw new IllegalArgumentException("Expense cannot be null");
        }
        
        // userId is already validated by JWT authentication filter
        e.setUserId(userId);
        Expense saved = expRepo.save(e);
        logger.info("Expense created for userId: {}", userId);
        return convertToDTO(saved);
    }

    @Override
    public void deleteExpense(Long id, Long userId) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid expense ID");
        }

        Expense expense = expRepo.findByIdAndUserId(id, userId);
        if (expense == null) {
            throw new IllegalArgumentException("Expense not found or unauthorized");
        }

        expRepo.deleteById(id);
        logger.info("Expense deleted. ID: {}", id);
    }

    @Override
    public List<ExpenseDTO> getByDateAndUser(LocalDate date, Long userId) {
        if (date == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }
        return expRepo.findByExpenseDateAndUserId(date, userId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDTO> getByMonthAndUser(int month, int year, Long userId) {
        return expRepo.findByMonthAndUserId(month, year, userId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDTO> getByYearAndUser(int year, Long userId) {
        return expRepo.findByYearAndUserId(year, userId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public ExpenseDTO getByIdAndUser(Long id, Long userId) {
        Expense expense = expRepo.findByIdAndUserId(id, userId);
        if (expense == null) {
            throw new IllegalArgumentException("Expense not found");
        }
        return convertToDTO(expense);
    }

    @Override
    public List<ExpenseDTO> getByUserId(Long userId) {
        return expRepo.findByUserId(userId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public ExpenseDTO updateExpense(Long id, ExpenseDTO expenseDto, Long userId) {
        Expense expense = expRepo.findByIdAndUserId(id, userId);
        if (expense == null) {
            throw new IllegalArgumentException("Expense not found");
        }
        
        expense.setAmount(expenseDto.getAmount());
        expense.setCategory(expenseDto.getCategory());
        expense.setDescription(expenseDto.getDescription());
        expense.setExpenseDate(expenseDto.getExpenseDate());
        
        Expense updated = expRepo.save(expense);
        return convertToDTO(updated);
    }

    @Override
    public List<ExpenseDTO> getByMonthsAndUser(List<Integer> months, int year, Long userId) {
        List<Expense> all = expRepo.findByUserId(userId);
        return all.stream()
            .filter(e -> months.contains(e.getExpenseDate().getMonthValue()) && e.getExpenseDate().getYear() == year)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDTO> getByMonthRangeAndUser(int start, int end, int year, Long userId) {
        List<Expense> all = expRepo.findByUserId(userId);
        return all.stream()
            .filter(e -> {
                int m = e.getExpenseDate().getMonthValue();
                return m >= start && m <= end && e.getExpenseDate().getYear() == year;
            })
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<String> getDistinctCategoriesForUser(Long userId) {
        return expRepo.findDistinctCategoriesByUserId(userId);
    }
}