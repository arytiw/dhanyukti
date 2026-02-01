package com.dhan.Stonks.Controller;

import com.dhan.Stonks.DTO.PortfolioResponse;
import com.dhan.Stonks.Security.UserPrincipal;
import com.dhan.Stonks.Service.PortfolioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/portfolio")
@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
public class PortfolioController {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioController.class);
    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public ResponseEntity<PortfolioResponse> getPortfolio(@AuthenticationPrincipal UserPrincipal user) {
        logger.info("PORTFOLIO: Fetching portfolio for User: {}", user.getId());
        PortfolioResponse response = portfolioService.getPortfolio(user.getId());
        logger.info("PORTFOLIO: Data retrieved successfully for User: {}", user.getId());
        return ResponseEntity.ok(response);
    }
}