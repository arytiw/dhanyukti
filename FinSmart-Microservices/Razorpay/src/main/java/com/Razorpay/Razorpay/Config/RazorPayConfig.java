package com.Razorpay.Razorpay.Config;


import com.razorpay.RazorpayClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RazorPayConfig {

    private static final Logger logger = LoggerFactory.getLogger(RazorPayConfig.class);

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws Exception {
        logger.info("Initializing Razorpay Client");
        return new RazorpayClient(keyId, keySecret);
    }
}