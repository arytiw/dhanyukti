package com.dhan.Stonks;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class TestTokenGenerator {
    public static void main(String[] args) {
        // This MUST match the jwt.secret in your application.properties
        String secret = "KGJkNjRmNzA1ZjUyYjI5Mjc4ZjM4ZjllMjc0MjM1Mzg4ODBmMWY2NGU2NDBlNjBmZGE2MTM1Yjg5MTQzYzA1Nyk=";
        
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        Key key = Keys.hmacShaKeyFor(keyBytes);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", 101L); // <--- WE ARE PRETENDING TO BE USER ID 101

        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject("testUser")
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
                .signWith(key)
                .compact();

        System.out.println("Copy this token for Postman:");
        System.out.println(token);
    }
}