package com.inves_micro.Investment.Service;

import java.time.LocalDate;
import java.util.List;

import com.inves_micro.Investment.Model.Investment;

public interface InvestmentService {

    Investment addinvestment(Investment inves);
    Investment getInvestmentById(Long Id);
    Investment getByUserId(Long UserId);
    List<Investment> getallInvestment();

    List<Investment> BystartDateandUserId(LocalDate date,Long UserId);
    List<Investment> ByMonthandUserId(int month,int year,Long UserId);
    List<Investment> ByYearandUserId(int year,Long UserId);
    List<Investment> ByendDateandUserId(LocalDate enddate,Long UserId);
    List<Investment> ByendMonthandUserId(int month,int year,Long UserId);
    List<Investment> ByendYearandUserId(int year,Long UserId);

    
}
