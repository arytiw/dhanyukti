package com.Razorpay.Razorpay.Service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

@Service
public class RazorpayService {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayService.class);

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    public RazorpayService(RazorpayClient razorpayClient) {
        this.razorpayClient = razorpayClient;
    }

    public Order createOrder(int amount, String currency) throws Exception {

        logger.info("Creating Razorpay order for amount: {}", amount);

        JSONObject request = new JSONObject();
        request.put("amount", amount * 100);
        request.put("currency", currency);
        request.put("receipt", "rcpt_" + System.currentTimeMillis());

        Order order = razorpayClient.orders.create(request);
        try {
            JSONObject ordJson = new JSONObject(order.toString());
            logger.info("Order created: id={}, amount={}", ordJson.optString("id"), ordJson.optInt("amount"));
        } catch (Exception e) {
            logger.warn("Unable to parse order JSON: {}", order.toString());
        }
        return order;
    }

    public boolean verifyPayment(String orderId, String paymentId, String signature) {

        logger.info("Verifying payment for orderId={}", orderId);

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean verified = Utils.verifyPaymentSignature(options, keySecret);
            logger.info("verifyPayment signature validation result for paymentId {}: {}", paymentId, verified);
            return verified;
        } catch (Exception e) {
            logger.error("Payment verification failed", e);
            return false;
        }
    }
}