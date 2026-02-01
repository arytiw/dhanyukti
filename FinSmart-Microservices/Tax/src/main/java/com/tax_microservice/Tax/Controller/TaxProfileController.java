package com.tax_microservice.Tax.Controller;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tax_microservice.Tax.Model.TaxProfile;
import com.tax_microservice.Tax.Security.JwtUserDetails;
import com.tax_microservice.Tax.Service.TaxProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tax-profile")
@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
public class TaxProfileController {

    private static final Logger log = LoggerFactory.getLogger(TaxProfileController.class);

    private final TaxProfileService service;

    public TaxProfileController(TaxProfileService service) {
        this.service = service;
    }

    private Long getUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof JwtUserDetails jwt) {
            Long userId = jwt.getUserId();
            log.debug("Extracted userId={} from JwtUserDetails", userId);
            return userId;
        }
        log.warn("Failed to extract userId: invalid or missing JWT token");
        throw new IllegalArgumentException("Invalid or missing JWT token");
    }

    // create or update single tax profile for logged-in user
    @PostMapping
    public ResponseEntity<TaxProfile> save(@Valid @RequestBody TaxProfile input,
                                           Authentication auth) {
        Long userId = getUserId(auth);
        log.info("Request to save/update TaxProfile for userId={}", userId);

        TaxProfile saved = service.saveOrUpdateForUser(userId, input);
        log.info("TaxProfile saved with id={} for userId={}", saved.getId(), userId);

        return ResponseEntity.status(HttpStatus.OK).body(saved);
    }

    @GetMapping
    public ResponseEntity<TaxProfile> get(Authentication auth) {
        Long userId = getUserId(auth);
        log.info("Request to get TaxProfile for userId={}", userId);

        Optional<TaxProfile> profile = service.getByUserId(userId);
        if (profile.isPresent()) {
            log.info("Found TaxProfile id={} for userId={}", profile.get().getId(), userId);
            return ResponseEntity.ok(profile.get());
        } else {
            log.info("No TaxProfile found for userId={}", userId);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(Authentication auth) {
        Long userId = getUserId(auth);
        log.info("Request to delete TaxProfile for userId={}", userId);

        service.deleteForUser(userId);
        log.info("Deleted TaxProfile for userId={}", userId);

        return ResponseEntity.noContent().build();
    }
}
