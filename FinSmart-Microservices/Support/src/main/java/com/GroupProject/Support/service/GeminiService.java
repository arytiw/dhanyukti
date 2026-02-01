package com.GroupProject.Support.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class GeminiService {
    @Value("${gemini.api.key}")
    private String apiKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getGeminiResponse(String userMessage) throws Exception {
        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey;

        String systemPrompt =
                "You are Dhanyukti, a senior financial analyst and personal finance assistant. " +
                "Always give clear, actionable, and concise answers about personal finance, " +
                "including budgeting, expenses, income planning, investments, taxation, and Indian financial context when relevant. " +
                "Do not give legal or tax filings advice, only general guidance. " +
                "Keep responses focused and under 300 words unless the user asks for detail. ";

        String fullPrompt = systemPrompt + "User question: " + userMessage;

        String requestBody = "{ \"contents\": [{ \"parts\": [{ \"text\": \"" +
                fullPrompt.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r") +
                "\" }] }] }";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        int statusCode = response.statusCode();
        String body = response.body();

        if (statusCode == 429) {
            return "Rate limit exceeded. The AI assistant can only handle a limited number of requests per minute. Please wait a minute and try again.";
        }
        if (statusCode != 200) {
            String friendly = parseErrorBody(body);
            if (friendly != null) return friendly;
            return "The AI service is temporarily unavailable. Please try again in a moment.";
        }

        try {
            GeminiResponse geminiResponse = objectMapper.readValue(body, GeminiResponse.class);
            if (geminiResponse != null && geminiResponse.candidates != null && geminiResponse.candidates.length > 0 &&
                    geminiResponse.candidates[0].content != null && geminiResponse.candidates[0].content.parts != null &&
                    geminiResponse.candidates[0].content.parts.length > 0 && geminiResponse.candidates[0].content.parts[0].text != null) {
                return geminiResponse.candidates[0].content.parts[0].text.trim();
            }
        } catch (Exception e) {
            System.err.println("Error parsing Gemini response: " + e.getMessage());
        }

        String friendly = parseErrorBody(body);
        if (friendly != null) return friendly;
        return "The AI returned an unexpected response. Please try rephrasing your question or try again later.";
    }

    /** Parse API error JSON (e.g. error.message) and return a short user-friendly message, or null. */
    private String parseErrorBody(String body) {
        if (body == null || body.isBlank()) return null;
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode err = root.path("error");
            if (!err.isMissingNode()) {
                JsonNode msgNode = err.path("message");
                if (!msgNode.isMissingNode()) {
                    String msg = msgNode.asText();
                    if (!msg.isBlank()) return msg;
                }
                String status = err.path("status").asText("");
                if ("RESOURCE_EXHAUSTED".equals(status)) return "Rate limit exceeded. Please wait a minute and try again.";
            }
        } catch (Exception ignored) { }
        return null;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GeminiResponse {
        public Candidate[] candidates;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Candidate {
        public Content content;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Content {
        public Part[] parts;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Part {
        public String text;
    }
} 