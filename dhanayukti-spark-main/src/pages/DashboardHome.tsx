import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  listExpenses,
  fetchIncome,
  listInvestments,
  getWalletBalance,
} from "@/services/api";

const DashboardHome = () => {
  // React Query v5: object syntax
  const expensesQuery = useQuery({
    queryKey: ["expenses"],
    queryFn: listExpenses,
  });

  const incomeQuery = useQuery({
    queryKey: ["income"],
    queryFn: fetchIncome,
  });

  const investmentsQuery = useQuery({
    queryKey: ["investments"],
    queryFn: listInvestments,
  });

  const walletQuery = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: getWalletBalance,
  });

  const expenses = expensesQuery.data?.data ?? [];
  const incomeAmount = incomeQuery.data?.data?.amount ?? 0;
  const walletBalance = walletQuery.data?.data ?? 0;
  const investmentTotal = (investmentsQuery.data?.data ?? []).reduce(
    (s: number, i: any) => s + i.targetAmount,
    0
  );

  const stats = [
    {
      title: "Wallet Balance",
      // full formatted value
      value: `₹${walletBalance.toLocaleString()}`,
      // truncated display value for the card
      display: `₹${walletBalance.toLocaleString().slice(0, 6)}...`,
      change: "",
      isPositive: true,
      icon: Wallet,
      color: "from-primary to-success",
    },
    {
      title: "Monthly Income",
      value: `₹${incomeAmount.toLocaleString()}`,
      display: `₹${incomeAmount.toLocaleString()}`,
      change: "",
      isPositive: true,
      icon: TrendingUp,
      color: "from-success to-emerald-400",
    },
    {
      title: "Monthly Expenses",
      value: `₹${expenses
        .filter((e: any) =>
          e.expenseDate.startsWith(new Date().toISOString().slice(0, 7))
        )
        .reduce((s: number, e: any) => s + e.amount, 0)
        .toLocaleString()}`,
      display: `₹${expenses
        .filter((e: any) =>
          e.expenseDate.startsWith(new Date().toISOString().slice(0, 7))
        )
        .reduce((s: number, e: any) => s + e.amount, 0)
        .toLocaleString()}`,
      change: "",
      isPositive: true,
      icon: TrendingDown,
      color: "from-warning to-orange-400",
    },
    {
      title: "Investments",
      value: `₹${investmentTotal.toLocaleString()}`,
      display: `₹${investmentTotal.toLocaleString()}`,
      change: "",
      isPositive: true,
      icon: PiggyBank,
      color: "from-blue-500 to-cyan-400",
    },
  ];

  const monthlySeries = useMemo(() => {
    const map: Record<
      string,
      { month: string; income: number; expenses: number }
    > = {};
    expenses.forEach((e: any) => {
      const month = e.expenseDate.slice(0, 7);
      if (!map[month]) map[month] = { month, income: incomeAmount, expenses: 0 };
      map[month].expenses += e.amount;
    });
    return Object.values(map)
      .sort((a, b) => (a.month > b.month ? 1 : -1))
      .slice(-6);
  }, [expenses, incomeAmount]);

  const pieData = useMemo(() => {
    const catMap: Record<string, number> = {};
    expenses.forEach((e: any) => {
      catMap[e.category] = (catMap[e.category] ?? 0) + e.amount;
    });
    return Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
    }));
  }, [expenses]);

  const recent = [...expenses]
    .sort((a: any, b: any) => (a.expenseDate < b.expenseDate ? 1 : -1))
    .slice(0, 5);

  const colors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#6366F1"];

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 12,
            padding: 8,
          }}
        >
          <div className="font-medium">{d.name}</div>
          <div className="text-sm text-muted-foreground">
            ₹{d.value.toLocaleString()}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview powered by live services</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              variant="glass"
              className="relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
            >
              <div
                className={`absolute inset-0 opacity-5 bg-gradient-to-br ${stat.color}`}
              />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <div className="relative inline-block">
                      <p
                        className="text-3xl font-bold truncate peer"
                        title={stat.value}
                        aria-label={stat.value}
                      >
                        {stat.display}
                      </p>

                      {/* Styled tooltip that shows the full amount on hover/focus or when hovering the whole card */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 peer-hover:opacity-100 peer-focus:opacity-100 transition-opacity duration-150 z-50">
                        <div className="bg-card border border-border rounded-md p-2 text-sm shadow-card">
                          {stat.value}
                        </div>
                      </div>
                    </div>
                    {stat.change && (
                      <div
                        className={`flex items-center gap-1 mt-2 text-sm ${
                          stat.isPositive ? "text-success" : "text-destructive"
                        }`}
                      >
                        {stat.isPositive ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {stat.change}
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlySeries}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number, name: string) => [
                      `₹${value.toLocaleString()}`,
                      name,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass" className="h-full">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: colors[index % colors.length],
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-muted-foreground">
                No expenses recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recent.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium">
                        {tx.description || tx.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tx.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tx.expenseDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
