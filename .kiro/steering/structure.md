# Project Structure

## Repository Organization

The repository contains two main applications:

### Frontend Application: `dhanayukti-spark-main/`
React-based web application with the following structure:

```
dhanayukti-spark-main/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── DashboardSidebar.tsx
│   │   ├── NavLink.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/              # Route components
│   │   ├── DashboardLayout.tsx
│   │   ├── DashboardHome.tsx
│   │   ├── ExpensesPage.tsx
│   │   ├── InvestmentsPage.tsx
│   │   ├── TaxPage.tsx
│   │   ├── StonksPage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── NotFound.tsx
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layer
│   │   └── api.ts
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   ├── assets/             # Static assets
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static public assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

### Backend Microservices: `FinSmart-Microservices/`
Spring Boot microservices with individual service directories:

```
FinSmart-Microservices/
├── Eureka/Eureka/          # Service discovery server
├── User/                   # User management service
├── Expenses/               # Expense tracking service
├── Investment/             # Investment management service
├── Tax/                    # Tax calculation service
├── Stonks/                 # Stock market data service
├── Razorpay/              # Payment processing service
└── Support/               # Customer support service
```

Each microservice follows standard Spring Boot structure:
```
ServiceName/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/[service-package]/
│   │   │       ├── controller/     # REST controllers
│   │   │       ├── service/        # Business logic
│   │   │       ├── repository/     # Data access layer
│   │   │       ├── entity/         # JPA entities
│   │   │       ├── dto/            # Data transfer objects
│   │   │       ├── config/         # Configuration classes
│   │   │       └── Application.java # Main class
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application.yml
│   └── test/                       # Test classes
├── target/                         # Build output
├── pom.xml                        # Maven configuration
└── .settings/                     # Eclipse IDE settings
```

## Architecture Patterns

### Frontend Patterns
- **Component-based architecture** with functional components
- **Custom hooks** for reusable logic
- **Context API** for global state management
- **Protected routes** for authentication
- **Service layer** for API communication
- **Atomic design** principles with ui/ component library

### Backend Patterns
- **Microservices architecture** with service discovery
- **Layered architecture**: Controller → Service → Repository → Entity
- **DTO pattern** for data transfer
- **JWT-based authentication** across services
- **Spring Security** for authorization
- **JPA/Hibernate** for data persistence

## Naming Conventions

### Frontend
- **Components**: PascalCase (e.g., `DashboardSidebar.tsx`)
- **Pages**: PascalCase with "Page" suffix (e.g., `ExpensesPage.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuthContext`)
- **Services**: camelCase (e.g., `api.ts`)
- **CSS classes**: Tailwind utility classes

### Backend
- **Packages**: lowercase with dots (e.g., `com.expenses-micro`)
- **Classes**: PascalCase (e.g., `ExpenseController`)
- **Methods**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE
- **Database tables**: snake_case (implied)

## Key Conventions
- **Port 8080** for frontend development server
- **JWT tokens** for authentication across all services
- **MySQL** as primary database for all services
- **Eureka server** must be started before other microservices
- **Lombok** annotations for reducing boilerplate code
- **shadcn/ui** components for consistent UI design