import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Filter,
  Search,
  TrendingUp,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ExpenseDTO,
  ExpensePayload,
  createExpense,
  deleteExpense,
  filterExpenses,
  listExpenses,
  updateExpense,
  fetchIncome,
  upsertIncome,
} from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

type FilterType = "all" | "date" | "month" | "year" | "months" | "range";

const monthOptions = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

const getFilterFn = (filter: FilterType, params: any) => {
  switch (filter) {
    case "date":
      return () => filterExpenses.byDate(params.date);
    case "month":
      return () => filterExpenses.byMonth(params.month, params.year);
    case "year":
      return () => filterExpenses.byYear(params.year);
    case "months":
      return () => filterExpenses.byMonths(params.months, params.year);
    case "range":
      return () =>
        filterExpenses.byMonthRange(params.start, params.end, params.year);
    default:
      return () => listExpenses();
  }
};

const groupByCategory = (items: ExpenseDTO[]) => {
  const map: Record<string, number> = {};
  items.forEach((e) => {
    map[e.category] = (map[e.category] ?? 0) + e.amount;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

const groupByDate = (items: ExpenseDTO[]) => {
  const map: Record<string, number> = {};
  items.forEach((e) => {
    map[e.expenseDate] = (map[e.expenseDate] ?? 0) + e.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, amount]) => ({ date, amount }));
};

// Custom tooltip for pie charts to ensure tooltip content shows properly
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, padding: 8 }}>
        <div className="font-medium">{d.name}</div>
        <div className="text-sm text-muted-foreground">₹{d.value.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload || payload[0];
    return (
      <div style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, padding: 8 }}>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted-foreground">₹{(d.value ?? d).toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

const colors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#6366F1"];

const ExpensesPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [filter, setFilter] = useState<FilterType>("all");
  const [date, setDate] = useState<string>("");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [months, setMonths] = useState<string>("");
  const [range, setRange] = useState({
    start: 1,
    end: 12,
    year: new Date().getFullYear(),
  });
  const [editing, setEditing] = useState<ExpenseDTO | null>(null);
  const [form, setForm] = useState<ExpensePayload>({
    amount: 0,
    category: "",
    description: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });
  const [incomeInput, setIncomeInput] = useState<number>(0);
  // index of hovered bar in the category bar chart (used to apply colored shadow)
  const [hoverBar, setHoverBar] = useState<number | null>(null);

  // income
  const incomeQuery = useQuery({
    queryKey: ["income"],
    queryFn: fetchIncome,
  });

  const incomeValue = incomeQuery.data?.data?.amount ?? 0;

  useEffect(() => {
    if (incomeValue) {
      setIncomeInput(incomeValue);
    }
  }, [incomeValue]);

  // expenses with filters
  const expensesQuery = useQuery({
    queryKey: ["expenses", filter, date, month, year, months, range],
    queryFn: () =>
      getFilterFn(filter, {
        date,
        month,
        year,
        months: months
          .split(",")
          .map((m) => parseInt(m.trim(), 10))
          .filter(Boolean),
        start: range.start,
        end: range.end,
      })(),
    placeholderData: (previousData) => previousData,
  });

  // categories
  const categoriesQuery = useQuery({
    queryKey: ["expense-categories"],
    queryFn: filterExpenses.categories,
  });

  const onSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    toast({ title: message });
  };

  // mutations – v5 object syntax
  const createMutation = useMutation({
    mutationFn: (payload: ExpensePayload) => createExpense(payload),
    onSuccess: () => onSuccess("Expense saved"),
    onError: (err: any) =>
      toast({
        title: "Failed to save expense",
        description: err?.response?.data?.message,
        variant: "destructive",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ExpensePayload> }) =>
      updateExpense(id, payload),
    onSuccess: () => {
      setEditing(null);
      onSuccess("Expense updated");
    },
    onError: (err: any) =>
      toast({
        title: "Failed to update",
        description: err?.response?.data?.message,
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => onSuccess("Expense deleted"),
  });

  const incomeMutation = useMutation({
    mutationFn: (amount: number) => upsertIncome(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast({ title: "Income updated" });
    },
  });

  const expenses: ExpenseDTO[] = (expensesQuery.data as { data?: ExpenseDTO[] } | undefined)?.data ?? [];
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryData = useMemo(() => groupByCategory(expenses), [expenses]);
  const trendData = useMemo(() => groupByDate(expenses), [expenses]);

  const handleSubmit = () => {
    if (!form.category || !form.amount) {
      toast({
        title: "Amount and category are required",
        variant: "destructive",
      });
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
    setForm({
      amount: 0,
      category: "",
      description: "",
      expenseDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleDelete = (id: number) => deleteMutation.mutate(id);

  const categories = (categoriesQuery.data as { data?: string[] } | undefined)
    ?.data ?? [];

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Expenses &amp; Income</h1>
          <p className="text-muted-foreground">
            All data is loaded from the Expenses microservice.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <Button variant="hero" size="sm" onClick={() => setEditing(null)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </motion.div>
      </div>

      {/* summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card variant="glass">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-3xl font-bold mt-1">
              ₹{totalExpenses.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Income (per month)</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={incomeInput}
                onChange={(e) => setIncomeInput(parseFloat(e.target.value))}
                className="bg-secondary"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => incomeMutation.mutate(incomeInput)}
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Net (Income - Expenses)
              </p>
              <p
                className={`text-2xl font-bold ${
                  incomeValue - totalExpenses >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                ₹{(incomeValue - totalExpenses).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* new expense form */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">New Expense</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-5 gap-4">
          <div className="flex items-center rounded overflow-hidden">
            {/* triangular buttons: square background matches page and triangle icon uses primary color */}
            <Button
              variant="ghost"
              size="sm"
              aria-label="decrease"
              className="p-2 min-w-0 bg-background border border-border rounded-sm focus-visible:ring-0 focus:ring-0"
              onClick={() => setForm({ ...form, amount: Math.max(0, (form.amount || 0) - 10) })}
            >
              <ArrowDown className="w-4 h-4 text-primary" />
            </Button>

            {/* center input: match page background */}
            <Input
              type="number"
              placeholder="Amount (₹)"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: parseFloat(e.target.value || '0') })
              }
              className="no-spinner bg-background text-foreground border-0 text-center rounded-none focus-visible:ring-0 focus:outline-none"
            />

            <Button
              variant="ghost"
              size="sm"
              aria-label="increase"
              className="p-2 min-w-0 bg-background border border-border rounded-sm"
              onClick={() => setForm({ ...form, amount: (form.amount || 0) + 10 })}
            >
              <ArrowUp className="w-4 h-4 text-primary" />
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="bg-secondary border-0">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Or type new category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-secondary border-0 flex-1"
            />
          </div>
          <Input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="bg-secondary border-0"
          />
          <Input
            type="date"
            value={form.expenseDate}
            onChange={(e) =>
              setForm({ ...form, expenseDate: e.target.value })
            }
            className="bg-secondary border-0"
          />
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editing ? "Update" : "Add"}
          </Button>
        </CardContent>
      </Card>

      {/* charts */}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expenses Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                />
                <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} fill="url(#trendGradient)" name="Amount" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={4}>
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Category Bar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                {/* SVG filters for colored glow per bar (uses colored blur to avoid white artifact) */}
                <defs>
                  {colors.map((c, i) => (
                    <filter id={`bar-shadow-${i}`} key={i} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
                      {/* blur source */}
                      <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
                      {/* flood with color */}
                      <feFlood floodColor={c} floodOpacity="0.28" result="color" />
                      {/* keep color only where blurred shape exists */}
                      <feComposite in="color" in2="blur" operator="in" result="coloredBlur" />
                      {/* merge colored blur with source graphic */}
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  ))}
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="value">
                  {categoryData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={colors[index % colors.length]}
                      onMouseEnter={() => setHoverBar(index)}
                      onMouseLeave={() => setHoverBar(null)}
                      // apply SVG filter to the bar when hovered to create a colored glow
                      filter={hoverBar === index ? `url(#bar-shadow-${index})` : undefined}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* keep the rest of your JSX exactly as you had it (list, filters etc.) */}
    </div>
  );
};

export default ExpensesPage;
