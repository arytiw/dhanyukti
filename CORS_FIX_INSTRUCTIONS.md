# CORS Configuration Fix for Stonks Microservice

## Problem
The frontend at `http://localhost:8081` cannot access the Stonks microservice at `http://localhost:8127` due to CORS (Cross-Origin Resource Sharing) restrictions.

## Solution Options

### Option 1: Add @CrossOrigin Annotation to Controllers

Add the `@CrossOrigin` annotation to your Stonks microservice controllers:

```java
@RestController
@RequestMapping("/portfolio")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8081"})
public class PortfolioController {
    // Your controller methods
}

@RestController
@RequestMapping("/stocks")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8081"})
public class StockController {
    // Your controller methods
}

@RestController
@RequestMapping("/gold")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8081"})
public class GoldController {
    // Your controller methods
}

@RestController
@RequestMapping("/wallet")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8081"})
public class WalletController {
    // Your controller methods
}
```

### Option 2: Global CORS Configuration (Recommended)

Create a CORS configuration class in your Stonks microservice:

```java
package com.stonks.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:8080", 
                    "http://localhost:8081",
                    "http://127.0.0.1:8080",
                    "http://127.0.0.1:8081"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:8080");
        configuration.addAllowedOrigin("http://localhost:8081");
        configuration.addAllowedOrigin("http://127.0.0.1:8080");
        configuration.addAllowedOrigin("http://127.0.0.1:8081");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### Option 3: Application Properties Configuration

Add CORS configuration to your `application.properties` or `application.yml`:

**application.properties:**
```properties
# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:8080,http://localhost:8081
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
spring.web.cors.max-age=3600
```

**application.yml:**
```yaml
spring:
  web:
    cors:
      allowed-origins:
        - http://localhost:8080
        - http://localhost:8081
      allowed-methods:
        - GET
        - POST
        - PUT
        - DELETE
        - OPTIONS
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600
```

## Quick Test

After implementing any of the above solutions:

1. Restart your Stonks microservice
2. Refresh the frontend application
3. Navigate to the Investments page
4. The CORS error should be resolved

## Additional Notes

- Make sure your Stonks microservice is running on port 8127
- The frontend is currently running on port 8081 (not 8080 as configured in vite.config.ts)
- For production, replace localhost origins with your actual domain names
- Consider using environment variables for allowed origins in production

## Verification

You can verify CORS is working by checking the browser's Network tab - you should see successful OPTIONS preflight requests followed by the actual API calls.