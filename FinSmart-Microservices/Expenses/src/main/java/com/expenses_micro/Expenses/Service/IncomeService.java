package com.expenses_micro.Expenses.Service;

import com.expenses_micro.Expenses.Model.Income;

public interface IncomeService {

    Income getCurrentIncomeForUser(Long userId);

    Income setOrUpdateIncomeForUser(Long userId, double amount);
}


