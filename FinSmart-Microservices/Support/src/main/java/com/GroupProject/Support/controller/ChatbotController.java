package com.GroupProject.Support.controller;

import com.GroupProject.Support.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
public class ChatbotController {
    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public String chat(@RequestBody ChatRequest request) {
        try {
            return geminiService.getGeminiResponse(request.getMessage());
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public static class ChatRequest {
        private String message;
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
} 