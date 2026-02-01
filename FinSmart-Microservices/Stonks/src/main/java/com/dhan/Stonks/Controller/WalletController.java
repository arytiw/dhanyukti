package com.dhan.Stonks.Controller;

import com.dhan.Stonks.DTO.WalletTopupRequest;
import com.dhan.Stonks.Security.UserPrincipal;
import com.dhan.Stonks.Service.WalletService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wallet")
@CrossOrigin(origins = {"http://localhost"}, allowCredentials = "true")
public class WalletController {

    private static final Logger logger = LoggerFactory.getLogger(WalletController.class);
    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping("/topup")
    public ResponseEntity<String> topUp(@AuthenticationPrincipal UserPrincipal user, 
                                        @RequestBody WalletTopupRequest req) {
        logger.info("WALLET: Topup request - User: {}, Amount: {}", user.getId(), req.getAmount());
        
        if (user == null) {
            logger.error("WALLET: UserPrincipal is NULL. Security context failed.");
            return ResponseEntity.status(403).body("User not authenticated");
        }

        walletService.topUp(user.getId(), req.getAmount());
        logger.info("WALLET: Topup successful. User: {}", user.getId());
        return ResponseEntity.ok("Success: Topped up " + req.getAmount());
    }

    @GetMapping("/balance")
    public ResponseEntity<?> balance(@AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            logger.warn("WALLET: balance called with no principal");
            return ResponseEntity.status(401).body("Not authenticated");
        }
        logger.info("WALLET: Checking balance for User: {}", user.getId());
        return ResponseEntity.ok(walletService.getBalance(user.getId()));
    }
}