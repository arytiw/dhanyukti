package com.tax_microservice.Tax.Service.ServiceImpl;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.tax_microservice.Tax.Model.TaxProfile;
import com.tax_microservice.Tax.Repository.TaxProfileRepository;
import com.tax_microservice.Tax.Service.TaxProfileService;

import jakarta.transaction.Transactional;

@Service
public class TaxProfileServiceImpl implements TaxProfileService {

    private static final Logger log = LoggerFactory.getLogger(TaxProfileServiceImpl.class);

    private final TaxProfileRepository taxRepo;

    public TaxProfileServiceImpl(TaxProfileRepository taxRepo) {
        this.taxRepo = taxRepo;
    }

    @Override
    @Transactional
    public TaxProfile saveOrUpdateForUser(Long userId, TaxProfile input) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        if (input == null) {
            throw new IllegalArgumentException("TaxProfile cannot be null");
        }

        log.info("Saving/Updating TaxProfile for userId={}", userId);

        // Ensure one profile per user: load existing or create new
        TaxProfile profile = taxRepo.findByUserId(userId).orElseGet(TaxProfile::new);
        profile.setUserId(userId);

        // Copy client fields
        profile.setPanNumber(input.getPanNumber());
        profile.setAnnualIncome(input.getAnnualIncome());
        profile.setFinancialYear(input.getFinancialYear());
        profile.setFilingStatus(input.getFilingStatus());
        profile.setEmployer(input.getEmployer());

        // Calculate deductions & taxPaid using your slab logic
        double annualIncome = input.getAnnualIncome();
        double deduction;

        if (annualIncome >= 2_400_001) {
            deduction = annualIncome * 0.30;
        } else if (annualIncome > 2_000_000 && annualIncome <= 2_400_000) {
            deduction = annualIncome * 0.25;
        } else if (annualIncome > 1_600_000 && annualIncome <= 2_000_000) {
            deduction = annualIncome * 0.20;
        } else if (annualIncome > 1_200_000 && annualIncome <= 1_600_000) {
            deduction = annualIncome * 0.15;
        } else if (annualIncome > 800_000 && annualIncome <= 1_200_000) {
            deduction = annualIncome * 0.10;
        } else if (annualIncome > 400_000 && annualIncome <= 800_000) {
            deduction = annualIncome * 0.05;
        } else {
            deduction = 0.0;
        }

        profile.setDeductions(deduction);
        profile.setTaxPaid(deduction);

        TaxProfile saved = taxRepo.save(profile);
        log.info("TaxProfile saved with id={} for userId={}", saved.getId(), userId);
        return saved;
    }

    @Override
    public Optional<TaxProfile> getByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        return taxRepo.findByUserId(userId);
    }

    @Override
    @Transactional
    public void deleteForUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        taxRepo.findByUserId(userId).ifPresent(profile -> {
            log.info("Deleting TaxProfile id={} for userId={}", profile.getId(), userId);
            taxRepo.delete(profile);
        });
    }
}
