package com.dhan.Stonks.Controller;

import com.dhan.Stonks.DTO.GoldTradeRequest;
import com.dhan.Stonks.Security.UserPrincipal;
import com.dhan.Stonks.Service.GoldService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gold")
@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
public class GoldController {

    private static final Logger logger = LoggerFactory.getLogger(GoldController.class);
    private final GoldService goldService;

    public GoldController(GoldService goldService) {
        this.goldService = goldService;
    }

    @PostMapping("/buy")
    public ResponseEntity<String> buy(@AuthenticationPrincipal UserPrincipal user, 
                                      @RequestBody GoldTradeRequest req) {
        logger.info("GOLD: Buy request - User: {}, Grams: {}", user.getId(), req.getGrams());
        goldService.buyGold(user.getId(), req.getGrams());
        logger.info("GOLD: Buy successful for User: {}", user.getId());
        return ResponseEntity.ok("Success: Bought " + req.getGrams() + "g of Gold");
    }

    @PostMapping("/sell")
    public ResponseEntity<String> sell(@AuthenticationPrincipal UserPrincipal user, 
                                       @RequestBody GoldTradeRequest req) {
        logger.info("GOLD: Sell request - User: {}, Grams: {}", user.getId(), req.getGrams());
        goldService.sellGold(user.getId(), req.getGrams());
        logger.info("GOLD: Sell successful for User: {}", user.getId());
        return ResponseEntity.ok("Success: Sold " + req.getGrams() + "g of Gold");
    }

    @PostMapping("/import")
    public ResponseEntity<String> importGold(@AuthenticationPrincipal UserPrincipal user, 
                                             @RequestBody GoldTradeRequest req, 
                                             @RequestParam double originalPrice) {
        logger.info("GOLD: Import request - User: {}, Grams: {}, OrigPrice: {}", user.getId(), req.getGrams(), originalPrice);
        goldService.importGold(user.getId(), req.getGrams(), originalPrice);
        logger.info("GOLD: Import saved for User: {}", user.getId());
        return ResponseEntity.ok("Success: Imported " + req.getGrams() + "g of Gold at avg price " + originalPrice);
    }
}