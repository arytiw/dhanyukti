package com.dhan.Stonks.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Iterator;

@Service
public class MarketDataService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${alphavantage.api.key}")
    private String alphaApiKey;

    @Value("${goldapi.api.key}")
    private String goldApiKey;

    public MarketDataService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public double getRealStockPrice(String symbol) {
        // AlphaVantage API Call
        String url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" 
                     + symbol + "&apikey=" + alphaApiKey;
        try {
            String jsonResponse = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode timeSeries = root.path("Time Series (Daily)");
            
            // Get the latest available date
            Iterator<String> fieldNames = timeSeries.fieldNames();
            if (fieldNames.hasNext()) {
                String latestDate = fieldNames.next();
                return timeSeries.get(latestDate).path("4. close").asDouble();
            }
        } catch (Exception e) {
            System.err.println("Stock API Failed: " + e.getMessage());
        }
        return 150.0; // Fallback if API fails (e.g. rate limit)
    }

    public double getRealGoldPrice() {
        // GoldAPI Call
        String url = "https://www.goldapi.io/api/XAU/INR";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-access-token", goldApiKey);
            headers.set("Content-Type", "application/json");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("price_gram_24k").asDouble();
        } catch (Exception e) {
             System.err.println("Gold API Failed: " + e.getMessage());
        }
        return 12151.0; // Fallback
    }
}