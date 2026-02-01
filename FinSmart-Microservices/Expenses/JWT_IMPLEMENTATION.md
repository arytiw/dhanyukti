# JWT Authentication Implementation for Expenses Microservice

## Overview
Your Expenses microservice is now secured with JWT (JSON Web Token) authentication. Only users with a valid JWT token can access the expense endpoints.

## How It Works

### 1. **Token Generation** (From Auth Service)
The Auth service generates a JWT token containing:
- `username`: The user's username
- `userId`: The user's ID
- `exp`: Token expiration time (24 hours by default)

Example token payload:
```json
{
  "userId": 1,
  "sub": "lucky@example.com",
  "iat": 1699000000,
  "exp": 1699086400
}
```

### 2. **Authentication Flow**

```
Client Request
    ↓
Authorization Header: "Bearer <JWT_TOKEN>"
    ↓
JwtAuthenticationFilter
    ↓
Validates Token Signature & Expiration
    ↓
Extracts username and userId from Token
    ↓
Sets SecurityContext with JwtUserDetails
    ↓
ExpenseController receives request
    ↓
Extracts userId from Authentication object
    ↓
Performs operation with userId
```

## Required Files Created

### 1. **JwtUtil.java**
- Generates JWT tokens
- Validates token signatures
- Extracts claims (username, userId, expiration)

### 2. **JwtAuthenticationFilter.java**
- Intercepts HTTP requests
- Extracts JWT token from "Authorization" header
- Validates token and sets SecurityContext

### 3. **JwtUserDetails.java**
- Custom user details class
- Contains username and userId
- Used by the filter to create Authentication object

### 4. **SecurityConfig.java**
- Spring Security configuration
- Configures CORS for frontend
- Sets up stateless session management
- Adds JWT filter to security chain

## How to Use

### Step 1: Get JWT Token from Auth Service
Send login credentials to the Auth service:
```bash
POST http://localhost:8099/api/auth/login
Content-Type: application/json

{
  "username": "Luckysharma92",
  "password": "lucky@123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Step 2: Use Token to Access Expenses API
Add the token to the Authorization header:
```bash
POST http://localhost:8123/api/expenses
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "description": "Lunch",
  "amount": 500.00,
  "category": "Food",
  "date": "2024-11-13"
}
```

### Step 3: All Other Endpoints
Use the same Authorization header pattern for:
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/{id}` - Get expense by ID
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `GET /api/expenses/by-date/{date}` - Get by date
- `GET /api/expenses/by-month/{month}/{year}` - Get by month
- etc.

## Token Extraction in Controller

The `getUserIdFromAuth()` method now:
1. Checks if Authentication principal is JwtUserDetails
2. Extracts userId directly from the token claims
3. No database lookup needed!

```java
private Long getUserIdFromAuth(Authentication authen) {
    if (authen != null && authen.getPrincipal() instanceof JwtUserDetails) {
        JwtUserDetails userDetails = (JwtUserDetails) authen.getPrincipal();
        return userDetails.getUserId();
    }
    throw new IllegalArgumentException("Invalid or missing JWT token");
}
```

## Security Configuration Details

### Public Endpoints (No JWT Required)
- `/api/auth/**` - Authentication endpoints
- `/health` - Health check
- `/actuator/**` - Actuator endpoints

### Protected Endpoints (JWT Required)
- All other endpoints under `/api/expenses/**`

### CORS Configuration
- Allowed origins: `http://localhost:3000`, `http://localhost:5173`
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Credentials allowed: Yes

## Testing in Postman

1. **Login First**
   - Method: POST
   - URL: `http://localhost:8099/api/auth/login`
   - Body: `{"username": "Luckysharma92", "password": "lucky@123"}`
   - Copy the token from response

2. **Add Expense**
   - Method: POST
   - URL: `http://localhost:8123/api/expenses`
   - Headers: `Authorization: Bearer <paste_token_here>`
   - Body: `{"description": "Lunch", "amount": 500, "category": "Food", "date": "2024-11-13"}`

3. **Get All Expenses**
   - Method: GET
   - URL: `http://localhost:8123/api/expenses`
   - Headers: `Authorization: Bearer <token>`

## Configuration in application.properties

```properties
# JWT Configuration
jwt.secret=ThisIsAVerySecureSecretKeyForJWTTokenGenerationAndValidationPurposeOnly12345
jwt.expiration=86400000  # 24 hours in milliseconds
```

**Note**: Change the `jwt.secret` to a more secure value in production!

## Dependencies Added to pom.xml

```xml
<!-- JWT Dependencies -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

## Error Handling

If you send a request without a valid token:
```
401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token"
}
```

If token is expired:
```
401 Unauthorized
Token has expired
```

## Next Steps

1. ✅ Build the project: `mvn clean install`
2. ✅ Run the application
3. ✅ Test with Postman using the flow described above
4. ✅ Update your frontend to include the Authorization header in all requests
5. Consider implementing refresh token mechanism for better UX
6. Update the jwt.secret to a secure value in production

## Summary

Your Expenses microservice is now **fully JWT-secured**! 🔒

- Users must have a valid JWT token to add expenses
- Token is validated on every request
- userId is extracted directly from the token (no database lookup needed)
- All your existing endpoints now require authentication
- Frontend can send expenses with just the JWT token in the Authorization header
