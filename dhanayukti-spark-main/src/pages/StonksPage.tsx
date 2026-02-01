import { useState, useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  buyGold,
  buyStock,
  createRazorpayOrder,
  getWalletBalance,
  sellGold,
  sellStock,
  topUpWallet,
  verifyPayment,
} from "@/services/api";
import { useAuthContext } from "@/context/AuthContext";
import {
  AlertCircle,
  Wallet,
  CreditCard,
  TrendingUp,
  Gem,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    const existing = document.querySelector(
      "script[src='https://checkout.razorpay.com/v1/checkout.js']",
    );
    if (existing) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const StonksPage = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { logout } = useAuthContext();

  const [topupAmount, setTopupAmount] = useState(0);
  const [stockForm, setStockForm] = useState({ symbol: "", quantity: 1 });
  const [goldForm, setGoldForm] = useState({ grams: 0 });

  // v5 useQuery
  const walletQuery = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: getWalletBalance,
  });

  useEffect(() => {
    if (walletQuery.error) {
      const err = walletQuery.error as any;
      if (err?.message === "AUTH_EXPIRED") logout();
    }
  }, [walletQuery.error, logout]);

  // v5 useMutation
  const topupMutation = useMutation({
    mutationFn: topUpWallet,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet-balance"] });
      toast({ title: "Wallet updated" });
    },
  });

  const stockBuyMutation = useMutation({
    mutationFn: (vars: { symbol: string; quantity: number }) =>
      buyStock(vars.symbol, vars.quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet-balance"] });
      toast({ title: "Stock order placed" });
    },
  });

  const stockSellMutation = useMutation({
    mutationFn: (vars: { symbol: string; quantity: number }) =>
      sellStock(vars.symbol, vars.quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet-balance"] });
      toast({ title: "Stock sell placed" });
    },
  });

  const goldBuyMutation = useMutation({
    mutationFn: (grams: number) => buyGold(grams),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet-balance"] });
      toast({ title: "Gold buy placed" });
    },
  });

  const goldSellMutation = useMutation({
    mutationFn: (grams: number) => sellGold(grams),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet-balance"] });
      toast({ title: "Gold sell placed" });
    },
  });

  const handleTopup = async () => {
    try {
      if (!topupAmount || topupAmount <= 0) {
        toast({ title: "Enter a valid amount", variant: "destructive" });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({
          title: "Failed to load Razorpay",
          variant: "destructive",
        });
        return;
      }

      const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!key || key === 'your_razorpay_key_id_here' || key === 'rzp_test_your_actual_key_here' || key === 'rzp_test_1234567890123456') {
        toast({
          title: "Razorpay key required",
          description: "Please set a valid VITE_RAZORPAY_KEY_ID in your .env file. Get your key from Razorpay dashboard.",
          variant: "destructive",
        });
        return;
      }

      const order = await createRazorpayOrder(topupAmount, "INR");

      const rzp = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Dhanyukti Wallet",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verify = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verify.data.status === "PAYMENT_VERIFIED") {
              await topupMutation.mutateAsync(topupAmount);
            } else {
              toast({
                title: "Payment verification failed",
                variant: "destructive",
              });
            }
          } catch (err: any) {
            toast({
              title: "Payment verification failed",
              description: err?.response?.data?.status,
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: () => toast({ title: "Payment cancelled" }),
        },
        theme: { color: "#16a34a" },
      });

      rzp.open();
    } catch (err: any) {
      toast({
        title: "Unable to start payment",
        description: err?.response?.data?.status,
        variant: "destructive",
      });
    }
  };

  const walletBalance = (walletQuery.data as any)?.data ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet & Trading</h1>
          <p className="text-muted-foreground">
            All trades use server-side prices; wallet updates after each action.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ₹{walletBalance.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Add Funds (Razorpay)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              type="number"
              value={topupAmount}
              onChange={(e) => setTopupAmount(parseFloat(e.target.value))}
              placeholder="Amount"
            />
            <Button
              onClick={handleTopup}
              disabled={topupMutation.isPending}
            >
              Pay
            </Button>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Note
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Top-ups are applied only after Razorpay verification. Prices are
            fetched server-side; frontend never sends prices.
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stocks */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Stocks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Symbol (US stocks only)"
                value={stockForm.symbol}
                onChange={(e) =>
                  setStockForm({
                    ...stockForm,
                    symbol: e.target.value.toUpperCase(),
                  })
                }
              />
              <Input
                type="number"
                placeholder="Qty"
                value={stockForm.quantity}
                onChange={(e) =>
                  setStockForm({
                    ...stockForm,
                    quantity: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  stockBuyMutation.mutate({ ...stockForm })
                }
                disabled={stockBuyMutation.isPending}
              >
                Buy
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  stockSellMutation.mutate({ ...stockForm })
                }
                disabled={stockSellMutation.isPending}
              >
                Sell
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gold */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="w-4 h-4" />
              Gold (24K)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="number"
              placeholder="Grams"
              value={goldForm.grams}
              onChange={(e) =>
                setGoldForm({ grams: parseFloat(e.target.value) || 0 })
              }
            />
            <div className="flex gap-2">
              <Button
                onClick={() => goldBuyMutation.mutate(goldForm.grams)}
                disabled={goldBuyMutation.isPending}
              >
                Buy
              </Button>
              <Button
                variant="outline"
                onClick={() => goldSellMutation.mutate(goldForm.grams)}
                disabled={goldSellMutation.isPending}
              >
                Sell
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Charts</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Trading history and market charts require backend price/time-series
          endpoints. Current Stonks service exposes only wallet and trade
          actions, so charts will render once those endpoints are available.
        </CardContent>
      </Card>
    </div>
  );
};

export default StonksPage;
