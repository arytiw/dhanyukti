# Technology Stack

## Frontend (dhanayukti-spark-main)

### Core Technologies
- **React 18.3.1** - UI library with hooks and functional components
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 5.4.19** - Build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing

### UI Framework & Styling
- **shadcn/ui** - Component library built on Radix UI primitives
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Framer Motion 11.18.2** - Animation library
- **Lucide React** - Icon library

### State Management & Data Fetching
- **TanStack React Query 5.83.0** - Server state management
- **React Context** - Global state (Auth)
- **React Hook Form 7.61.1** - Form handling
- **Zod 3.25.76** - Schema validation

### Additional Libraries
- **Axios 1.13.2** - HTTP client
- **Recharts 2.15.4** - Chart library
- **date-fns 3.6.0** - Date utilities

## Backend (FinSmart-Microservices)

### Core Technologies
- **Java 21** - Programming language
- **Spring Boot 3.5.7** - Application framework
- **Spring Cloud 2025.0.0** - Microservices framework
- **Maven** - Build tool and dependency management

### Microservices Architecture
- **Netflix Eureka** - Service discovery
- **Spring Cloud Gateway** - API gateway (implied)
- **Spring Security** - Authentication and authorization
- **JWT (jjwt 0.11.5)** - Token-based authentication

### Data & Persistence
- **Spring Data JPA** - Data access layer
- **MySQL** - Primary database
- **Lombok** - Code generation for POJOs
- **ModelMapper 3.1.1** - Object mapping

### Additional Dependencies
- **Spring Validation** - Input validation
- **Spring Boot Test** - Testing framework

## Common Development Commands

### Frontend Commands
```bash
# Development
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build

# Package management
npm install          # Install dependencies
```

### Backend Commands
```bash
# Maven commands (run from each microservice directory)
mvn spring-boot:run  # Start the service
mvn clean install   # Build and install
mvn test            # Run tests
mvn clean package   # Create JAR file

# Start Eureka server first, then other services
cd FinSmart-Microservices/Eureka/Eureka && mvn spring-boot:run
cd FinSmart-Microservices/User && mvn spring-boot:run
cd FinSmart-Microservices/Expenses && mvn spring-boot:run
# ... repeat for other services
```

## Development Environment
- **Node.js & npm** - Required for frontend development
- **Java 21** - Required for backend development
- **MySQL** - Database server
- **IDE**: Eclipse metadata suggests Eclipse IDE usage for backend