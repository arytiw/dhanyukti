package com.inves_micro.Investment.Service.ServiceImpl;


import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inves_micro.Investment.Model.Investment;
import com.inves_micro.Investment.Repository.InvestmentRepository;
import com.inves_micro.Investment.Service.InvestmentService;

@Service
@Transactional
public class InvestmentServiceImpl implements InvestmentService {

    private static final Logger logger = LoggerFactory.getLogger(InvestmentServiceImpl.class);

    private final InvestmentRepository investmentRepository;

    public InvestmentServiceImpl(InvestmentRepository investmentRepository) {
        this.investmentRepository = investmentRepository;
    }

    @Override
    public Investment addinvestment(Investment inves) {
        logger.info("Adding new investment for userId={} startDate={}", 
                    inves.getId(), inves.getStartDate());
        Investment saved = investmentRepository.save(inves);
        logger.debug("Investment saved with id={}", saved.getId());
        return saved;
    }

    @Override
    public Investment getInvestmentById(Long id) {
        logger.info("Fetching investment by id={}", id);
        return investmentRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Investment not found for id={}", id);
                    return new RuntimeException("Investment not found with id: " + id);
                });
    }

    @Override
    public Investment getByUserId(Long userId) {
        logger.info("Fetching first investment for userId={}", userId);
        List<Investment> list = investmentRepository.findByUserId(userId);
        if (list.isEmpty()) {
            logger.warn("No investments found for userId={}", userId);
            return null;
        }
        return list.get(0);  // or handle as per your use‑case
    }

    @Override
    public List<Investment> getallInvestment() {
        logger.info("Fetching all investments");
        return investmentRepository.findAll();
    }

    @Override
    public List<Investment> BystartDateandUserId(LocalDate date, Long userId) {
        logger.info("Fetching investments by startDate={} for userId={}", date, userId);
        return investmentRepository.findByStartDateAndUserId(date, userId);
    }

    @Override
    public List<Investment> ByMonthandUserId(int month, int year, Long userId) {
        logger.info("Fetching investments by month={} year={} for userId={}", 
                    month, year, userId);
        return investmentRepository.findByMonthAndUserId(month, year, userId);
    }

    @Override
    public List<Investment> ByYearandUserId(int year, Long userId) {
        logger.info("Fetching investments by year={} for userId={}", year, userId);
        return investmentRepository.findByYearAndUserId(year, userId);
    }

    @Override
    public List<Investment> ByendDateandUserId(LocalDate enddate, Long userId) {
        logger.info("Fetching investments by endDate={} for userId={}", enddate, userId);
        return investmentRepository.findByEndDateAndUserId(enddate, userId);
    }

    @Override
    public List<Investment> ByendMonthandUserId(int month, int year, Long userId) {
        logger.info("Fetching investments by end month={} year={} for userId={}", 
                    month, year, userId);
        return investmentRepository.findByEndMonthAndUserId(month, year, userId);
    }

    @Override
    public List<Investment> ByendYearandUserId(int year, Long userId) {
        logger.info("Fetching investments by end year={} for userId={}", year, userId);
        return investmentRepository.findByEndYearAndUserId(year, userId);
    }

    // Optional helper if you want to expose mark-as-completed from service
    public void markAsCompleted(Long id) {
        logger.info("Marking investment id={} as Completed", id);
        investmentRepository.markasCompleted(id);
    }
}
