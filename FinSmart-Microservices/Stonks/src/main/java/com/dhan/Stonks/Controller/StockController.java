package com.dhan.Stonks.Controller;

import com.dhan.Stonks.DTO.StockTradeRequest;
import com.dhan.Stonks.Security.UserPrincipal;
import com.dhan.Stonks.Service.StockService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stocks")
@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
public class StockController {

    private static final Logger logger = LoggerFactory.getLogger(StockController.class);
    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping("/buy")
    public ResponseEntity<String> buy(@AuthenticationPrincipal UserPrincipal user, 
                                      @RequestBody StockTradeRequest req) {
        logger.info("STOCK: Buy request - User: {}, Symbol: {}, Qty: {}", user.getId(), req.getSymbol(), req.getQuantity());
        stockService.buyStock(user.getId(), req.getSymbol(), req.getQuantity());
        logger.info("STOCK: Buy successful for User: {}", user.getId());
        return ResponseEntity.ok("Success: Bought " + req.getQuantity() + " shares of " + req.getSymbol());
    }

    @PostMapping("/sell")
    public ResponseEntity<String> sell(@AuthenticationPrincipal UserPrincipal user, 
                                       @RequestBody StockTradeRequest req) {
        logger.info("STOCK: Sell request - User: {}, Symbol: {}, Qty: {}", user.getId(), req.getSymbol(), req.getQuantity());
        stockService.sellStock(user.getId(), req.getSymbol(), req.getQuantity());
        logger.info("STOCK: Sell successful for User: {}", user.getId());
        return ResponseEntity.ok("Success: Sold " + req.getQuantity() + " shares of " + req.getSymbol());
    }

    @PostMapping("/import")
    public ResponseEntity<String> importStock(@AuthenticationPrincipal UserPrincipal user,
                                              @RequestBody StockTradeRequest req,
                                              @RequestParam double originalPrice) {
        logger.info("STOCK: Import request - User: {}, Symbol: {}, Price: {}", user.getId(), req.getSymbol(), originalPrice);
        stockService.importStock(user.getId(), req.getSymbol(), req.getQuantity(), originalPrice);
        logger.info("STOCK: Import saved for User: {}", user.getId());
        return ResponseEntity.ok("Success: Imported " + req.getQuantity() + " shares of " 
                + req.getSymbol() + " at historical price $" + originalPrice);
    }
}