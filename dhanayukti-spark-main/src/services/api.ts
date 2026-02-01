import axios, { AxiosError, AxiosInstance } from "axios";

// Base URLs can be overridden via Vite envs when deploying behind a gateway
// If env vars are empty strings, use relative URLs (for nginx proxy in Docker)
const getBaseUrl = (envVar: string | undefined, defaultUrl: string): string => {
  if (envVar === "" || envVar === undefined) {
    // Use relative URL - will be proxied by nginx
    return "";
  }
  return envVar ?? defaultUrl;
};

const base = {
  user: getBaseUrl(import.meta.env.VITE_USER_API, "http://localhost:8099"),
  expenses: getBaseUrl(import.meta.env.VITE_EXPENSE_API, "http://localhost:8123"),
  investments: getBaseUrl(import.meta.env.VITE_INVESTMENT_API, "http://localhost:8124"),
  tax: getBaseUrl(import.meta.env.VITE_TAX_API, "http://localhost:8125"),
  razorpay: getBaseUrl(import.meta.env.VITE_RAZORPAY_API, "http://localhost:8126"),
  stonks: getBaseUrl(import.meta.env.VITE_STONKS_API, "http://localhost:8127"),
};

let authToken: string | null = null;
let userId: number | null = null;

export const setAuth = (token: string | null, uid: number | null) => {
  authToken = token;
  userId = uid;
};

const STORAGE_KEY = "dhanyukti_auth";

function getTokenForRequest(): string | null {
  if (authToken) return authToken;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

const buildClient = (baseURL: string, withJwt = true): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    if (withJwt) {
      const token = getTokenForRequest();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (resp) => resp,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Bubble up so callers can logout and redirect
        error.message = "AUTH_EXPIRED";
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

const authClient = buildClient(base.user);
const expenseClient = buildClient(base.expenses);
const investmentClient = buildClient(base.investments);
const taxClient = buildClient(base.tax);
const razorpayClient = buildClient(base.razorpay, false); // Razorpay endpoints are public
const stonksClient = buildClient(base.stonks, false);

// ---------- Auth ----------
export interface SignupPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  address: string;
  contactNumber: string;
  city: string;
  state: string;
  password: string;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  address: string;
  contactNumber: string;
  city: string;
  state: string;
}

export const login = async (username: string, password: string) => {
  const { data } = await authClient.post<{ token: string; userId: number }>("/api/auth/login", {
    username,
    password,
  });
  return data;
};

export const signup = async (payload: SignupPayload) => {
  const { data } = await authClient.post<{ message: string; userId: number }>("/api/auth/register", payload);
  return data;
};

export const getUserProfile = () => authClient.get<UserProfile>("/api/users/profile");
export const updateUserProfile = (payload: Partial<SignupPayload>) => 
  authClient.put<UserProfile>("/api/users/profile", payload);

// ---------- Expenses & Income ----------
export interface ExpensePayload {
  amount: number;
  category: string;
  description?: string;
  expenseDate: string; // ISO yyyy-MM-dd
}

export interface ExpenseDTO extends ExpensePayload {
  id: number;
  createdAt: string;
  userId: number;
}

export const listExpenses = () => expenseClient.get<ExpenseDTO[]>("/api/expenses");
export const createExpense = (payload: ExpensePayload) => expenseClient.post<ExpenseDTO>("/api/expenses", payload);
export const updateExpense = (id: number, payload: Partial<ExpensePayload>) =>
  expenseClient.put<ExpenseDTO>(`/api/expenses/${id}`, payload);
export const deleteExpense = (id: number) => expenseClient.delete<void>(`/api/expenses/${id}`);

export const filterExpenses = {
  byDate: (date: string) => expenseClient.get<ExpenseDTO[]>(`/api/expenses/by-date/${date}`),
  byMonth: (month: number, year: number) =>
    expenseClient.get<ExpenseDTO[]>(`/api/expenses/by-month/${month}/${year}`),
  byYear: (year: number) => expenseClient.get<ExpenseDTO[]>(`/api/expenses/by-year/${year}`),
  byMonths: (months: number[], year: number) =>
    expenseClient.get<ExpenseDTO[]>(`/api/expenses/by-months`, { params: { months, year } }),
  byMonthRange: (start: number, end: number, year: number) =>
    expenseClient.get<ExpenseDTO[]>(`/api/expenses/by-month-range`, { params: { start, end, year } }),
  categories: () => expenseClient.get<string[]>(`/api/expenses/categories`),
};

export const fetchIncome = () => expenseClient.get<{ id: number; amount: number; userId: number }>("/api/income");
export const upsertIncome = (amount: number) => expenseClient.post("/api/income", { amount });

// ---------- Investments ----------
export interface Investment {
  id: number;
  goalName: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  userId: number;
}

export interface InvestmentTransaction {
  id: number;
  amount: number;
  mode: string;
  dateTime: string;
  note?: string;
  investmentId: number;
  userId: number;
}

export const createInvestment = (payload: Omit<Investment, "id" | "status" | "userId">) =>
  investmentClient.post<Investment>("/api/investments", payload);
export const listInvestments = () => investmentClient.get<Investment[]>("/api/investments");
export const getInvestment = (id: number) => investmentClient.get<Investment>(`/api/investments/${id}`);
export const markInvestmentComplete = (id: number) => investmentClient.put<void>(`/api/investments/${id}/complete`);

export const investmentFilters = {
  startDate: (date: string) => investmentClient.get<Investment[]>(`/api/investments/by-start-date/${date}`),
  startMonth: (month: number, year: number) =>
    investmentClient.get<Investment[]>(`/api/investments/by-start-month/${month}/${year}`),
  startYear: (year: number) => investmentClient.get<Investment[]>(`/api/investments/by-start-year/${year}`),
  endDate: (date: string) => investmentClient.get<Investment[]>(`/api/investments/by-end-date/${date}`),
  endMonth: (month: number, year: number) =>
    investmentClient.get<Investment[]>(`/api/investments/by-end-month/${month}/${year}`),
  endYear: (year: number) => investmentClient.get<Investment[]>(`/api/investments/by-end-year/${year}`),
};

export const createInvestmentTx = (investmentId: number, payload: Omit<InvestmentTransaction, "id" | "userId" | "investmentId">) =>
  investmentClient.post<InvestmentTransaction>(`/api/investments/transactions/${investmentId}`, payload);
export const listInvestmentTx = (investmentId: number) =>
  investmentClient.get<InvestmentTransaction[]>(`/api/investments/transactions/${investmentId}`);
export const updateInvestmentTx = (id: number, payload: Partial<InvestmentTransaction>) =>
  investmentClient.put<InvestmentTransaction>(`/api/investments/transactions/${id}`, payload);
export const deleteInvestmentTx = (id: number) =>
  investmentClient.delete<void>(`/api/investments/transactions/${id}`);

// ---------- Tax Profile ----------
export interface TaxProfile {
  id: number;
  pan: string;
  filingStatus: string;
  annualIncome: number;
  deductions: number;
  regime: string;
  userId: number;
}

export const getTaxProfile = () => taxClient.get<TaxProfile>("/api/tax-profile");
export const saveTaxProfile = (payload: Omit<TaxProfile, "id" | "userId">) =>
  taxClient.post<TaxProfile>("/api/tax-profile", payload);
export const deleteTaxProfile = () => taxClient.delete<void>("/api/tax-profile");

// ---------- Razorpay ----------
export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
};

export const createRazorpayOrder = async (amount: number, currency = "INR"): Promise<RazorpayOrder> => {
  const { data } = await razorpayClient.post<string | RazorpayOrder>("/api/razorpay/create-order", { amount, currency });
  if (typeof data === "string") {
    return JSON.parse(data) as RazorpayOrder;
  }
  return data as RazorpayOrder;
};

export const verifyPayment = (payload: {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}) => razorpayClient.post<{ status: string }>("/api/razorpay/verify-payment", payload);

// ---------- Stonks (wallet, stocks, gold) ----------
const stonksAuthClient = buildClient(base.stonks, true); // Use JWT auth for Stonks

export interface StockHolding {
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
}

export interface GoldHolding {
  grams: number;
  currentValue: number;
  profitLoss: number;
}

export interface PortfolioResponse {
  totalWalletBalance: number;
  totalPortfolioValue: number;
  totalProfitLoss: number;
  stockHoldings: StockHolding[];
  goldHolding: GoldHolding;
}

// Portfolio endpoint
export const getPortfolio = () => stonksAuthClient.get<PortfolioResponse>("/portfolio");

// Wallet operations
export const getWalletBalance = () => stonksAuthClient.get<number>("/wallet/balance");
export const topUpWallet = (amount: number) =>
  stonksAuthClient.post<string>("/wallet/topup", { amount });

// Stock operations
export const buyStock = (symbol: string, quantity: number) =>
  stonksAuthClient.post<string>("/stocks/buy", { symbol, quantity });
export const sellStock = (symbol: string, quantity: number) =>
  stonksAuthClient.post<string>("/stocks/sell", { symbol, quantity });
export const importStock = (symbol: string, quantity: number, originalPrice: number) =>
  stonksAuthClient.post<string>(`/stocks/import?originalPrice=${originalPrice}`, { symbol, quantity });

// Gold operations
export const buyGold = (grams: number) => stonksAuthClient.post<string>("/gold/buy", { grams });
export const sellGold = (grams: number) => stonksAuthClient.post<string>("/gold/sell", { grams });
export const importGold = (grams: number, originalPrice: number) =>
  stonksAuthClient.post<string>(`/gold/import?originalPrice=${originalPrice}`, { grams });

export type ApiError = AxiosError<{ message?: string; error?: string }>;

