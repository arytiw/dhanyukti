import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  getPortfolio,
  buyStock,
  sellStock,
  importStock,
  buyGold,
  sellGold,
  importGold,
  PortfolioResponse,
} from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

type TransactionMode = "buy" | "sell" | "import";

const InvestmentsPage = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Stock form state
  const [stockForm, setStockForm] = useState({
    symbol: "",
    quantity: 0,
    mode: "buy" as TransactionMode,
    originalPrice: 0,
  });

  // Gold form state
  const [goldForm, setGoldForm] = useState({
    grams: 0,
    mode: "buy" as TransactionMode,
    originalPrice: 0,
  });

  // Portfolio data query
  const portfolioQuery = useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      try {
        const response = await getPortfolio();
        return response.data;
      } catch (error: any) {
        // Handle CORS and other network errors gracefully
        if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK') {
          throw new Error('CORS_ERROR');
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry CORS errors
      if (error.message === 'CORS_ERROR') {
        return false;
      }
      return failureCount < 3;
    },
    refetchInterval: false, // Disable auto-refresh until CORS is fixed
  });

  const portfolio: PortfolioResponse = portfolioQuery.data || {
    totalWalletBalance: 0,
    totalPortfolioValue: 0,
    totalProfitLoss: 0,
    stockHoldings: [],
    goldHolding: { grams: 0, currentValue: 0, profitLoss: 0 },
  };

  // Stock mutations
  const stockMutation = useMutation({
    mutationFn: async () => {
      const { symbol, quantity, mode, originalPrice } = stockForm;
      
      if (mode === "buy") {
        return buyStock(symbol, quantity);
      } else if (mode === "sell") {
        return sellStock(symbol, quantity);
      } else {
        return importStock(symbol, quantity, originalPrice);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      toast({ title: `Stock ${stockForm.mode} successful` });
      setStockForm({ symbol: "", quantity: 0, mode: "buy", originalPrice: 0 });
    },
    onError: (err: any) => {
      const isCorsError = err.message?.includes('CORS') || err.code === 'ERR_NETWORK';
      toast({
        title: `Stock ${stockForm.mode} failed`,
        description: isCorsError 
          ? "CORS error: Please configure the Stonks microservice to allow frontend requests"
          : err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    },
  });

  // Gold mutations
  const goldMutation = useMutation({
    mutationFn: async () => {
      const { grams, mode, originalPrice } = goldForm;
      
      if (mode === "buy") {
        return buyGold(grams);
      } else if (mode === "sell") {
        return sellGold(grams);
      } else {
        return importGold(grams, originalPrice);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      toast({ title: `Gold ${goldForm.mode} successful` });
      setGoldForm({ grams: 0, mode: "buy", originalPrice: 0 });
    },
    onError: (err: any) => {
      const isCorsError = err.message?.includes('CORS') || err.code === 'ERR_NETWORK';
      toast({
        title: `Gold ${goldForm.mode} failed`,
        description: isCorsError 
          ? "CORS error: Please configure the Stonks microservice to allow frontend requests"
          : err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    },
  });

  // Calculate total stocks P&L
  const totalStockPL = useMemo(() => {
    return portfolio.stockHoldings.reduce((acc, stock) => acc + stock.profitLoss, 0);
  }, [portfolio.stockHoldings]);

  // Format P&L display
  const formatPL = (value: number) => {
    const isPositive = value >= 0;
    const prefix = isPositive ? "+" : "";
    const color = isPositive ? "text-green-600" : "text-red-600";
    return { text: `${prefix}₹${value.toLocaleString()}`, color };
  };

  // Chart data: last 6 months (one point per month); current value for this month, estimated for past months
  const chartData = useMemo(() => {
    const monthsCount = 6;
    const now = new Date();
    return Array.from({ length: monthsCount }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1 - i), 1);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      // Latest month = current portfolio value; earlier months = approximate (slight growth back in time)
      const growthPerMonth = 0.02;
      const monthsFromNow = monthsCount - 1 - i;
      const value = monthsFromNow === 0
        ? portfolio.totalPortfolioValue
        : Math.round(portfolio.totalPortfolioValue / Math.pow(1 + growthPerMonth, monthsFromNow));
      return { month: label, value, fullMonth: d.toISOString().slice(0, 7) };
    });
  }, [portfolio.totalPortfolioValue]);

  const handleStockSubmit = () => {
    if (!stockForm.symbol || stockForm.quantity <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter valid symbol and quantity",
        variant: "destructive",
      });
      return;
    }
    
    if (stockForm.mode === "import" && stockForm.originalPrice <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter valid original price for import",
        variant: "destructive",
      });
      return;
    }
    
    stockMutation.mutate();
  };

  const handleGoldSubmit = () => {
    if (goldForm.grams <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter valid grams amount",
        variant: "destructive",
      });
      return;
    }
    
    if (goldForm.mode === "import" && goldForm.originalPrice <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter valid original price for import",
        variant: "destructive",
      });
      return;
    }
    
    goldMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Investment Portfolio</h1>
          <p className="text-muted-foreground">
            Live data from Stonks microservice
          </p>
        </motion.div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => qc.invalidateQueries({ queryKey: ["portfolio"] })}
          disabled={portfolioQuery.isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${portfolioQuery.isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* CORS Error Message */}
      {portfolioQuery.error?.message === 'CORS_ERROR' && (
        <Card variant="glass" className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-red-600">CORS Configuration Required</h3>
                <p className="text-sm text-muted-foreground">
                  The Stonks microservice needs CORS configuration to allow requests from the frontend.
                </p>
                <div className="text-sm space-y-1">
                  <p className="font-medium">Backend Fix Required:</p>
                  <p className="text-muted-foreground">
                    Add CORS configuration in your Stonks microservice to allow origin: <code className="bg-secondary px-1 rounded">http://localhost:8081</code>
                  </p>
                  <p className="text-muted-foreground">
                    Add <code className="bg-secondary px-1 rounded">@CrossOrigin</code> annotation to controllers or configure global CORS policy.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {portfolioQuery.isLoading && (
        <Card variant="glass">
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground">Loading portfolio data...</p>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card variant="glass">
          <CardContent className="p-6 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Wallet Balance</p>
              <p className="text-2xl font-bold">₹{portfolio.totalWalletBalance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="glass">
          <CardContent className="p-6 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
              <p className="text-2xl font-bold">₹{portfolio.totalPortfolioValue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="glass">
          <CardContent className="p-6 flex items-center gap-3">
            {portfolio.totalProfitLoss >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-600" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
              <p className={`text-2xl font-bold ${formatPL(portfolio.totalProfitLoss).color}`}>
                {formatPL(portfolio.totalProfitLoss).text}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Performance Chart */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Portfolio Performance (Last 6 Months)</CardTitle>
          <p className="text-sm text-muted-foreground">Estimated trend; latest value is current portfolio</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Portfolio Value"]}
                labelFormatter={(_, payload) => payload[0]?.payload?.fullMonth ?? ""}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stocks and Gold Tabs */}
      <Tabs defaultValue="stocks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="gold">Gold</TabsTrigger>
        </TabsList>

        {/* Stocks Tab */}
        <TabsContent value="stocks" className="space-y-4">
          {/* Stocks Performance Summary */}
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stocks Performance</p>
                  <p className={`text-3xl font-bold ${formatPL(totalStockPL).color}`}>
                    {formatPL(totalStockPL).text}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Holdings Count</p>
                  <p className="text-2xl font-bold">{portfolio.stockHoldings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Transaction Form */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Stock Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock-symbol">Stock Symbol</Label>
                  <Input
                    id="stock-symbol"
                    placeholder="e.g., AAPL, GOOGL"
                    value={stockForm.symbol}
                    onChange={(e) => setStockForm({ ...stockForm, symbol: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock-quantity">Quantity</Label>
                  <Input
                    id="stock-quantity"
                    type="number"
                    placeholder="Number of shares"
                    value={stockForm.quantity || ""}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Transaction Type</Label>
                <RadioGroup
                  value={stockForm.mode}
                  onValueChange={(value: TransactionMode) => setStockForm({ ...stockForm, mode: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buy" id="stock-buy" />
                    <Label htmlFor="stock-buy">Buy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sell" id="stock-sell" />
                    <Label htmlFor="stock-sell">Sell</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="import" id="stock-import" />
                    <Label htmlFor="stock-import">Import</Label>
                  </div>
                </RadioGroup>
              </div>

              {stockForm.mode === "import" && (
                <div className="space-y-2">
                  <Label htmlFor="stock-original-price">Original Price (per share)</Label>
                  <Input
                    id="stock-original-price"
                    type="number"
                    step="0.01"
                    placeholder="Cost per share"
                    value={stockForm.originalPrice || ""}
                    onChange={(e) => setStockForm({ ...stockForm, originalPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              <Button
                onClick={handleStockSubmit}
                disabled={stockMutation.isPending}
                className="w-full"
              >
                {stockMutation.isPending ? "Processing..." : `${stockForm.mode.charAt(0).toUpperCase() + stockForm.mode.slice(1)} Stock`}
              </Button>
            </CardContent>
          </Card>

          {/* Stock Holdings Table */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Stock Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolio.stockHoldings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No stock holdings found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3">Symbol</th>
                        <th className="text-right p-3">Quantity</th>
                        <th className="text-right p-3">Avg Buy Price</th>
                        <th className="text-right p-3">Current Price</th>
                        <th className="text-right p-3">Current Value</th>
                        <th className="text-right p-3">Profit/Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.stockHoldings.map((stock, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="p-3 font-medium">{stock.symbol}</td>
                          <td className="p-3 text-right">{stock.quantity}</td>
                          <td className="p-3 text-right">₹{stock.avgBuyPrice.toFixed(2)}</td>
                          <td className="p-3 text-right">₹{stock.currentPrice.toFixed(2)}</td>
                          <td className="p-3 text-right">₹{stock.currentValue.toLocaleString()}</td>
                          <td className={`p-3 text-right font-medium ${formatPL(stock.profitLoss).color}`}>
                            {formatPL(stock.profitLoss).text}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gold Tab */}
        <TabsContent value="gold" className="space-y-4">
          {/* Gold Performance Summary */}
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gold Performance</p>
                  <p className={`text-3xl font-bold ${formatPL(portfolio.goldHolding.profitLoss).color}`}>
                    {formatPL(portfolio.goldHolding.profitLoss).text}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Holdings</p>
                  <p className="text-2xl font-bold">{portfolio.goldHolding.grams}g</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gold Transaction Form */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Gold Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gold-grams">Grams</Label>
                <Input
                  id="gold-grams"
                  type="number"
                  step="0.1"
                  placeholder="Amount in grams"
                  value={goldForm.grams || ""}
                  onChange={(e) => setGoldForm({ ...goldForm, grams: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-3">
                <Label>Transaction Type</Label>
                <RadioGroup
                  value={goldForm.mode}
                  onValueChange={(value: TransactionMode) => setGoldForm({ ...goldForm, mode: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buy" id="gold-buy" />
                    <Label htmlFor="gold-buy">Buy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sell" id="gold-sell" />
                    <Label htmlFor="gold-sell">Sell</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="import" id="gold-import" />
                    <Label htmlFor="gold-import">Import</Label>
                  </div>
                </RadioGroup>
              </div>

              {goldForm.mode === "import" && (
                <div className="space-y-2">
                  <Label htmlFor="gold-original-price">Original Price (per gram)</Label>
                  <Input
                    id="gold-original-price"
                    type="number"
                    step="0.01"
                    placeholder="Cost per gram"
                    value={goldForm.originalPrice || ""}
                    onChange={(e) => setGoldForm({ ...goldForm, originalPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              <Button
                onClick={handleGoldSubmit}
                disabled={goldMutation.isPending}
                className="w-full"
              >
                {goldMutation.isPending ? "Processing..." : `${goldForm.mode.charAt(0).toUpperCase() + goldForm.mode.slice(1)} Gold`}
              </Button>
            </CardContent>
          </Card>

          {/* Gold Holdings */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Gold Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolio.goldHolding.grams === 0 ? (
                <p className="text-muted-foreground text-center py-8">No gold holdings found</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Grams</p>
                    <p className="text-2xl font-bold">{portfolio.goldHolding.grams}g</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="text-2xl font-bold">₹{portfolio.goldHolding.currentValue.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Profit/Loss</p>
                    <p className={`text-2xl font-bold ${formatPL(portfolio.goldHolding.profitLoss).color}`}>
                      {formatPL(portfolio.goldHolding.profitLoss).text}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentsPage;
