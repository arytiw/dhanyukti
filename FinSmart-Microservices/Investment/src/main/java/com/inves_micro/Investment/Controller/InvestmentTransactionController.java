package com.inves_micro.Investment.Controller;



import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inves_micro.Investment.Model.InvestmentTransaction;
import com.inves_micro.Investment.Security.JwtUserDetails;
import com.inves_micro.Investment.Service.InvestmentTransactionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/investments/transactions")
@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
public class InvestmentTransactionController {

    private static final Logger logger =
            LoggerFactory.getLogger(InvestmentTransactionController.class);

    private final InvestmentTransactionService service;

    public InvestmentTransactionController(InvestmentTransactionService service) {
        this.service = service;
    }

    private Long getUserIdFromAuth(Authentication authen) {
        if (authen != null && authen.getPrincipal() instanceof JwtUserDetails jwt) {
            return jwt.getUserId();
        }
        throw new IllegalArgumentException("Invalid or missing JWT token - userId cannot be extracted");
    }

    @PostMapping("/{investmentid}")
    public ResponseEntity<InvestmentTransaction> create(@PathVariable Long investmentid, @Valid @RequestBody InvestmentTransaction tx, Authentication authen) {

        logger.info("Entered InvestmentTransactionController.create for investmentId={}", investmentid);

        Long userId = getUserIdFromAuth(authen);
        logger.info("Creating transaction for investmentId={} userId={}", investmentid, userId);

        InvestmentTransaction created = service.createTransaction(tx, userId, investmentid);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{investmentId}")
    public ResponseEntity<List<InvestmentTransaction>> getAllForInvestment(
            @PathVariable Long investmentId,
            Authentication authen) {

        Long userId = getUserIdFromAuth(authen);
        return ResponseEntity.ok(service.getTransactionsForInvestment(investmentId, userId));
    }

    @GetMapping("/inves-trans/{investmenttransId}")
    public ResponseEntity<InvestmentTransaction> getById(
            @PathVariable Long investmenttransId,
            Authentication authen) {

        Long userId = getUserIdFromAuth(authen);
        Optional<InvestmentTransaction> tx = service.getTransactionById(investmenttransId, userId);
        return tx.map(ResponseEntity::ok)
                 .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvestmentTransaction> update(
            @PathVariable Long id,
            @RequestBody InvestmentTransaction updatedTx,
            Authentication authen) {

        Long userId = getUserIdFromAuth(authen);
        InvestmentTransaction saved = service.updateTransaction(id, updatedTx, userId);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authen) {

        Long userId = getUserIdFromAuth(authen);
        service.deleteTransaction(id, userId);
        return ResponseEntity.noContent().build();
    }
}
