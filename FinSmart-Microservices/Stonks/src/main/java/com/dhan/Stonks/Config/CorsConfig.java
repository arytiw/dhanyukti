package com.dhan.Stonks.Config;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")                // Apply to all API paths
                        .allowedOriginPatterns("*")         // Allow ALL origins (localhost:3000, etc.)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow ALL standard methods
                        .allowedHeaders("*")                // Allow ALL headers (Authorization, etc.)
                        .allowCredentials(true);            // Allow credentials (cookies/tokens)
            }
        };
    }
}
