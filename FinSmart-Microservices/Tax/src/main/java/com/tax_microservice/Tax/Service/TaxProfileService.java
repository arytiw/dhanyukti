package com.tax_microservice.Tax.Service;

import java.util.Optional;

import com.tax_microservice.Tax.Model.TaxProfile;

public interface TaxProfileService {

    // Create or update the single tax profile for this user
    TaxProfile saveOrUpdateForUser(Long userId, TaxProfile taxProfile);

    // Get the single tax profile for this user
    Optional<TaxProfile> getByUserId(Long userId);

    // Delete the tax profile for this user (if exists)
    void deleteForUser(Long userId);
}
