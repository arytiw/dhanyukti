import React, { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
import { listExpenses, listInvestments, getPortfolio } from "@/services/api";

const colors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#6366F1"];

const formatCurrency = (v: number) => `₹${v?.toLocaleString?.() ?? v}`;

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
          {formatCurrency(d.value)}
        </div>
      </div>
    );
  }
  return null;
};

const AreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const v = payload[0].value ?? 0;
    return (
      <div
        style={{
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: 12,
          padding: 8,
        }}
      >
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted-foreground">
          {formatCurrency(v)}
        </div>
      </div>
    );
  }
  return null;
};

const ReportsPage: React.FC = () => {
  const { toast } = useToast();

  const expensesQuery = useQuery({
    queryKey: ["expenses"],
    queryFn: listExpenses,
  });
  const investmentsQuery = useQuery({
    queryKey: ["investments"],
    queryFn: listInvestments,
  });
  const portfolioQuery = useQuery({
    queryKey: ["portfolio"],
    queryFn: getPortfolio,
  });

  const expenses = expensesQuery.data?.data ?? [];
  const investments = investmentsQuery.data?.data ?? [];
  const portfolio = portfolioQuery.data?.data ?? null;

  const thisMonth = new Date().toISOString().slice(0, 7);

  const expensesThisMonth = useMemo(
    () => expenses.filter((e: any) => e.expenseDate.startsWith(thisMonth)),
    [expenses, thisMonth]
  );

  const expenseTableCols = ["Date", "Category", "Description", "Amount"];

  const monthlySeries = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const month = e.expenseDate?.slice(0, 7) ?? "";
      if (month) map[month] = (map[month] ?? 0) + (e.amount ?? 0);
    });

    const res: { month: string; expenses: number; label: string }[] = [];
    const monthsCount = 12;
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      res.push({ month: m, expenses: map[m] ?? 0, label });
    }
    return res;
  }, [expenses]);

  const expensePie = useMemo(() => {
    const catMap: Record<string, number> = {};
    expenses.forEach(
      (e: any) =>
        (catMap[e.category] = (catMap[e.category] ?? 0) + e.amount)
    );
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const investPie = useMemo(() => {
    if (portfolio) {
      const list: { name: string; value: number }[] = [];
      (portfolio.stockHoldings || []).forEach((s: any) =>
        list.push({ name: s.symbol, value: s.currentValue ?? 0 })
      );
      if (portfolio.goldHolding && (portfolio.goldHolding.currentValue ?? 0) > 0) {
        list.push({
          name: "Gold",
          value: portfolio.goldHolding.currentValue,
        });
      }
      return list;
    }

    const map: Record<string, number> = {};
    investments.forEach((i: any) => {
      const name = i.goalName || "Other";
      map[name] = (map[name] ?? 0) + (i.targetAmount ?? 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [investments, portfolio]);

  const investSeries = useMemo(() => {
    const map: Record<string, number> = {};
    investments.forEach((i: any) => {
      const m = i.startDate?.slice(0, 7) ?? "";
      if (m) map[m] = (map[m] ?? 0) + (i.targetAmount ?? 0);
    });
    const res: { month: string; value: number; label: string }[] = [];
    const monthsCount = 12;
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      res.push({ month: m, value: map[m] ?? 0, label });
    }
    return res;
  }, [investments]);

  const tableRef = useRef<HTMLDivElement | null>(null);
  const expenseChartRef = useRef<HTMLDivElement | null>(null);
  const investChartRef = useRef<HTMLDivElement | null>(null);
  const expenseSummaryRef = useRef<HTMLDivElement | null>(null);
  const investSummaryRef = useRef<HTMLDivElement | null>(null);

  const expenseSummary = useMemo(() => {
    const total = expenses.reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
    const count = expenses.length;
    const byMonth = monthlySeries.reduce((s, r) => s + r.expenses, 0);
    const avgMonth = monthlySeries.length ? byMonth / monthlySeries.length : 0;
    return { total, count, avgMonth, monthsCount: monthlySeries.length };
  }, [expenses, monthlySeries]);

  const investSummary = useMemo(() => {
    const total = (investments as any[]).reduce((s, i) => s + (i.targetAmount ?? 0), 0);
    const portfolioTotal = portfolio?.totalPortfolioValue ?? 0;
    return { goalsTotal: total, goalsCount: investments.length, portfolioTotal };
  }, [investments, portfolio]);

  const generatePDF = async (which: "expenses" | "investments" = "expenses") => {
    try {
      const htmlToImage = await import("html-to-image");
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;

      const sections: { node: HTMLDivElement | null; title: string }[] = [];
      if (which === "expenses") {
        sections.push({
          node: expenseSummaryRef.current,
          title: "Expenses Summary (Last 12 Months)",
        });
        sections.push({
          node: tableRef.current,
          title: "Expenses — This Month",
        });
        sections.push({
          node: expenseChartRef.current,
          title: "Expenses Analytics (12 Months)",
        });
      } else {
        sections.push({
          node: investSummaryRef.current,
          title: "Investments Summary",
        });
        sections.push({
          node: investChartRef.current,
          title: "Investments Overview (12 Months)",
        });
      }

      let y = margin;
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        if (!s.node) continue;
        const dataUrl = await htmlToImage.toPng(s.node, { cacheBust: true });
        const img = new Image();
        img.src = dataUrl;
        await new Promise((res) => (img.onload = res));

        const imgWidth = pageWidth;
        const imgHeight = (img.height * imgWidth) / img.width;

        if (y + imgHeight + 20 > doc.internal.pageSize.getHeight()) {
          doc.addPage();
          y = margin;
        }

        doc.setFontSize(14);
        doc.text(s.title, margin, y + 6);
        y += 8;
        doc.addImage(dataUrl, "PNG", margin, y, imgWidth, imgHeight);
        y += imgHeight + 12;
      }

      doc.save(
        `dhanyukti_${which}_report_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
      toast({ title: "PDF generated", description: "Report downloaded" });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Unable to generate PDF",
        description:
          "Please ensure `html-to-image` and `jspdf` are installed (npm i html-to-image jspdf), or try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate downloadable expense and investment reports in our app
            theme.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => generatePDF("expenses")}>
            Download Expenses PDF
          </Button>
          <Button onClick={() => generatePDF("investments")}>
            Download Investments PDF
          </Button>
        </div>
      </div>

      {/* Expenses Summary — included in PDF */}
      <Card variant="glass" className="print:block">
        <CardContent ref={expenseSummaryRef} className="p-4">
          <p className="text-sm text-muted-foreground">Last 12 months</p>
          <p className="text-2xl font-bold">Total expenses: {formatCurrency(expenseSummary.total)}</p>
          <p className="text-sm">Transactions: {expenseSummary.count} · Avg per month: {formatCurrency(expenseSummary.avgMonth)}</p>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Expenses — This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={tableRef} className="p-2 bg-card rounded-lg">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  {expenseTableCols.map((c) => (
                    <th key={c} className="pb-2 pr-4">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expensesThisMonth.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No expenses this month
                    </td>
                  </tr>
                ) : (
                  expensesThisMonth.map((e: any) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="py-3">{e.expenseDate}</td>
                      <td className="py-3">{e.category}</td>
                      <td className="py-3">{e.description || "—"}</td>
                      <td className="py-3">
                        ₹{e.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Investments Summary — included in PDF */}
      <Card variant="glass" className="print:block">
        <CardContent ref={investSummaryRef} className="p-4">
          <p className="text-sm text-muted-foreground">Investment goals & portfolio</p>
          <p className="text-2xl font-bold">Portfolio value: {formatCurrency(investSummary.portfolioTotal)}</p>
          <p className="text-sm">Goals: {investSummary.goalsCount} · Total target: {formatCurrency(investSummary.goalsTotal)}</p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expenses */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Expenses Analytics (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={expenseChartRef}
              className="flex flex-col gap-4 h-[520px]"
            >
              <div className="flex-1 min-h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySeries}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="label"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`} />
                    <Tooltip content={<AreaTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#F59E0B"
                      fill="#F59E0B33"
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePie}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      paddingAngle={4}
                      labelLine={false}
                      label={({ name, value }: any) =>
                        `${name}: ${formatCurrency(value)}`
                      }
                    >
                      {expensePie.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={colors[idx % colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investments */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Investments Overview (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={investChartRef}
              className="flex flex-col gap-4 h-[520px]"
            >
              {portfolio && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Portfolio Value
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(portfolio.totalPortfolioValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Stocks</p>
                    <p className="text-lg font-semibold">
                      {(portfolio.stockHoldings || []).length}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={investSeries}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="label"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`} />
                    <Tooltip content={<AreaTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F633"
                      name="Target"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={investPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      paddingAngle={4}
                      labelLine={false}
                      label={({ name, value }: any) =>
                        `${name}: ${formatCurrency(value)}`
                      }
                    >
                      {investPie.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={colors[idx % colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
