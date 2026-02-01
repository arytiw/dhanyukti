package com.Razorpay.Razorpay.Controller;


import java.util.Map;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Razorpay.Razorpay.DTO.CreateOrderRequest;
import com.Razorpay.Razorpay.DTO.VerifyPaymentRequest;
import com.Razorpay.Razorpay.Service.RazorpayService;
import com.razorpay.Order;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/razorpay")
@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
public class RazorpayController {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayController.class);

    private final RazorpayService razorpayService;

    public RazorpayController(RazorpayService razorpayService) {
        this.razorpayService = razorpayService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody @Valid CreateOrderRequest request) throws Exception {

        logger.info("Received create order request: amount={}, currency={}", request.getAmount(), request.getCurrency());

        Order order = razorpayService.createOrder(request.getAmount(),request.getCurrency());

        // Log full order JSON and id
        try {
            JSONObject ordJson = new JSONObject(order.toString());
            logger.info("Created Razorpay order id={} amount={}", ordJson.optString("id"), ordJson.optInt("amount"));
            return ResponseEntity.ok(ordJson.toString());
        } catch (Exception e) {
            logger.warn("Unable to parse order JSON, returning raw toString()", e);
            return ResponseEntity.ok(order.toString());
        }

    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody VerifyPaymentRequest request) {

        logger.info("Received verify payment request: razorpay_order_id={}, razorpay_payment_id={}", request.getRazorpayOrderId(), request.getRazorpayPaymentId());

        boolean verified = razorpayService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        logger.info("Payment verification result for order {} : {}", request.getRazorpayOrderId(), verified);

        if (verified) {
            return ResponseEntity.ok(Map.of("status", "PAYMENT_VERIFIED"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "INVALID_SIGNATURE"));
        }
    }
}
