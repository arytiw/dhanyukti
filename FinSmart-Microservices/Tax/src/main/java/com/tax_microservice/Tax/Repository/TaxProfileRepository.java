package com.tax_microservice.Tax.Repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tax_microservice.Tax.Model.TaxProfile;


public interface TaxProfileRepository extends JpaRepository<TaxProfile, Long> {

    Optional<TaxProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    boolean existsByPanNumber(String panNumber);
}
