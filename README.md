# Dhanyukti

A full-stack personal finance application with expense tracking, investments, tax planning, and AI-powered support. Built with Spring Boot microservices, React (Vite), and Docker.

## Architecture

- **Frontend**: React + Vite + TypeScript + Tailwind CSS (in `dhanayukti-spark-main/`)
- **Backend**: Spring Boot microservices (Eureka, User, Expenses, Investment, Tax, Razorpay, Stonks, Support)
- **Database**: MySQL (runs inside Docker)
- **Gateway**: Nginx (proxies all API traffic on port 80)

## Prerequisites

- **Docker** and **Docker Compose** (for containerized setup)
- **OR** for local development: Java 21, Maven 3.9+, Node.js 20+, MySQL 8+

---

## Quick Start (Docker)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd dhanyukti-main
```

### 2. Create environment file

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- `MYSQL_ROOT_PASSWORD` – MySQL root password
- `JWT_SECRET` – Must be identical for all services (use the default for dev, or generate a base64 secret)
- `SPRING_MAIL_USERNAME` / `SPRING_MAIL_PASSWORD` – For email (signup, etc.)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` – For payments
- `VITE_RAZORPAY_KEY_ID` – Same as Razorpay key (used at build time for frontend)
- `GEMINI_API_KEY` – For AI support chat (optional; Help page will show errors if missing)

See `.env.example` for all variables.

### 3. Build the Docker image

```bash
docker build -t dhanyukti-app .
```

Optional: pass Razorpay key at build time if not in `.env`:

```bash
docker build -t dhanyukti-app --build-arg VITE_RAZORPAY_KEY_ID=rzp_test_xxx .
```

### 4. Run the container

```bash
docker run --env-file .env -p 80:80 -p 8761:8761 dhanyukti-app
```

- **Port 80**: Main app (frontend + API via nginx)
- **Port 8761**: Eureka dashboard (optional)

### 5. Access the app

1. Open **http://localhost** in your browser
2. Wait **60–90 seconds** for all services to start (MySQL, Eureka, microservices)
3. If you see "Application is starting", wait a bit and refresh
4. Sign up or log in and use the app

---

## Local Development (without Docker)

### Backend (microservices)

1. Start **MySQL** and create databases: `user-microservice`, `expense-microservice`, `investment-microservice`, `tax-microservice`, `wealth_db`
2. Start **Eureka** first (port 8761)
3. Set env vars (or use `application.properties` defaults) and run each service:
   - User (8099)
   - Expenses (8123)
   - Investment (8124)
   - Tax (8125)
   - Razorpay (8126)
   - Stonks (8127)
   - Support (9093)

### Frontend

```bash
cd dhanayukti-spark-main
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**. Set `VITE_*_API` in `.env` to point to your backend URLs (e.g. `http://localhost:8099` for User).

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password | Yes |
| `JWT_SECRET` | JWT signing secret (base64); must match across User, Stonks, Expenses, Investment, Tax | Yes |
| `SPRING_MAIL_USERNAME` | Gmail for signup emails | Yes |
| `SPRING_MAIL_PASSWORD` | Gmail app password | Yes |
| `RAZORPAY_KEY_ID` | Razorpay API key | Yes (for payments) |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | Yes (for payments) |
| `VITE_RAZORPAY_KEY_ID` | Same as Razorpay key (build-time for frontend) | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for Help chat | Optional |
| `ALPHAVANTAGE_API_KEY` | For stock data (Stonks) | Optional |
| `GOLDAPI_API_KEY` | For gold prices (Stonks) | Optional |

---

## Project Structure

```
.
├── dhanayukti-spark-main/     # React frontend
├── FinSmart-Microservices/    # Spring Boot microservices
│   ├── Eureka/                # Service registry (8761)
│   ├── User/                  # Auth, profile (8099)
│   ├── Expenses/              # Expenses, income (8123)
│   ├── Investment/            # Investment goals (8124)
│   ├── Tax/                   # Tax profile (8125)
│   ├── Razorpay/              # Payments (8126)
│   ├── Stonks/                # Stocks, gold, wallet (8127)
│   └── Support/               # AI chat (9093)
├── Dockerfile
├── nginx.conf
├── supervisord.conf
├── .env.example
└── README.md
```

---

## Troubleshooting

- **502 Bad Gateway**: Services are still starting. Wait 60–90 seconds and refresh.
- **403 Forbidden on API**: Ensure you're logged in and the JWT token is valid. Check that `JWT_SECRET` is identical in `.env` for all services.
- **Expenses / Investments 403**: Rebuild the image after security config changes (OPTIONS permit, CORS).
- **Gemini rate limit (429)**: Wait a minute before retrying the Help chat.

---

## License

MIT (or your preferred license)
