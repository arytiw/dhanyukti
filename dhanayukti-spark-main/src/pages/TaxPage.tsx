import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  deleteTaxProfile,
  getTaxProfile,
  saveTaxProfile,
  TaxProfile,
} from "@/services/api";
import { IndianRupee, ShieldCheck } from "lucide-react";

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const TaxPage = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState<Omit<TaxProfile, "id" | "userId">>({
    pan: "",
    filingStatus: "",
    annualIncome: 0,
    deductions: 0,
    regime: "",
  });

  // v5 useQuery
  const profileQuery = useQuery({
    queryKey: ["tax-profile"],
    queryFn: getTaxProfile,
    retry: false,
  });

  useEffect(() => {
    if (profileQuery.data?.data) {
      const {
        pan,
        filingStatus,
        annualIncome,
        deductions,
        regime,
      } = profileQuery.data.data;
      setForm({ pan, filingStatus, annualIncome, deductions, regime });
    }
  }, [profileQuery.data]);

  // v5 useMutation
  const saveMutation = useMutation({
    mutationFn: saveTaxProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tax-profile"] });
      toast({ title: "Tax profile saved" });
    },
    onError: (err: any) =>
      toast({
        title: "Save failed",
        description: err?.response?.data?.message,
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTaxProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tax-profile"] });
      setForm({
        pan: "",
        filingStatus: "",
        annualIncome: 0,
        deductions: 0,
        regime: "",
      });
      toast({ title: "Tax profile deleted" });
    },
  });

  const handleSubmit = () => {
    if (!panRegex.test(form.pan)) {
      toast({
        title: "Invalid PAN",
        description: "PAN must match AAAAA9999A",
        variant: "destructive",
      });
      return;
    }
    if (!form.filingStatus || !form.regime) {
      toast({
        title: "Filing status and regime are required",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(form);
  };

  const profile = profileQuery.data?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Tax Profile</h1>
          <p className="text-muted-foreground">
            Data stored in Tax microservice
          </p>
        </motion.div>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="PAN"
            value={form.pan}
            onChange={(e) =>
              setForm({ ...form, pan: e.target.value.toUpperCase() })
            }
          />
          <Input
            placeholder="Filing Status (e.g., Individual, HUF)"
            value={form.filingStatus}
            onChange={(e) =>
              setForm({ ...form, filingStatus: e.target.value })
            }
          />
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              className="pl-9"
              placeholder="Annual Income"
              value={form.annualIncome}
              onChange={(e) =>
                setForm({
                  ...form,
                  annualIncome: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <Input
            type="number"
            placeholder="Deductions"
            value={form.deductions}
            onChange={(e) =>
              setForm({
                ...form,
                deductions: parseFloat(e.target.value),
              })
            }
          />
          <Select
            value={form.regime}
            onValueChange={(v) => setForm({ ...form, regime: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tax Regime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New Regime</SelectItem>
              <SelectItem value="old">Old Regime</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {profile && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Current Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">PAN</p>
              <p className="font-semibold">{profile.pan}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Filing Status</p>
              <p className="font-semibold">{profile.filingStatus}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Annual Income</p>
              <p className="font-semibold">
                ₹{profile.annualIncome.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Deductions</p>
              <p className="font-semibold">
                ₹{profile.deductions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Regime</p>
              <p className="font-semibold">{profile.regime}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaxPage;
