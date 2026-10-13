import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LangToggle } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, Layers, ArrowLeft, Coins, CreditCard, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Plan = {
  id: number;
  slug: string;
  name: string;
  credits: number;
  priceUsd: string;
  priceTry: string | null;
  description: string | null;
  features: string | unknown;
  isPopular: number;
};

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { _ } = useLanguage();
  const { data: plans, isLoading } = trpc.pricing.list.useQuery();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      toast.info(_("toast_signin_first"));
      navigate("/login");
      return;
    }
    setSelectedPlan(plan);
    setShowDialog(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success(
      `${selectedPlan.name} ${_("pricing_credits")}: ${selectedPlan.credits} ${_("pricing_credits")}`,
      { duration: 4000 }
    );
    setProcessing(false);
    setShowDialog(false);
    navigate("/workspace");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur-md fixed top-0 w-full z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Layers className="w-6 h-6 text-primary" />
            <span>AI Design Studio</span>
          </Link>
          <div className="flex items-center gap-1">
            <LangToggle />
            <ThemeToggle />
            {user && (
              <Link to="/workspace">
                <Button variant="ghost" size="sm">{_("nav_workspace")}</Button>
              </Link>
            )}
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> {_("nav_exit")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              {_("pricing_badge")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{_("pricing_title")}</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">{_("pricing_subtitle")}</p>
          </div>

          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted/50" />
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans?.map((plan) => {
              const features: string[] = plan.features
                ? (typeof plan.features === "string"
                    ? JSON.parse(plan.features)
                    : Array.isArray(plan.features)
                    ? plan.features
                    : [])
                : [];
              return (
                <Card
                  key={plan.id}
                  className={`relative border-border/50 bg-background/60 backdrop-blur transition-all hover:shadow-md cursor-pointer ${
                    plan.isPopular
                      ? "ring-2 ring-primary shadow-lg shadow-primary/10"
                      : ""
                  }`}
                  onClick={() => handleSelectPlan(plan as Plan)}
                >
                  {plan.isPopular ? (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  ) : null}
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">${plan.priceUsd}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          {_("pricing_onetime")}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-primary">
                        {plan.credits} {_("pricing_credits")}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center mb-4">
                      {plan.description}
                    </p>

                    <ul className="space-y-2 mb-6 flex-1">
                      {features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.isPopular ? "default" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan as Plan);
                      }}
                    >
                      {_("pricing_select")} {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-10 text-center text-sm text-muted-foreground space-y-1">
            <p>{_("pricing_standard_trace")} &nbsp;|&nbsp; {_("pricing_precision_trace")}</p>
            <p>{_("pricing_bgremove")} &nbsp;|&nbsp; {_("pricing_upscale")}</p>
            <p className="text-xs mt-2">{_("pricing_expire_note")}</p>
          </div>
        </div>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {_("pricing_dialog_title")}
            </DialogTitle>
            <DialogDescription>{_("pricing_dialog_desc")}</DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    {selectedPlan.name} {_("pricing_dialog_package")}
                  </span>
                  <span className="text-lg font-bold">${selectedPlan.priceUsd}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedPlan.credits} {_("pricing_credits")} {_("pricing_dialog_package")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedPlan.description}
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>{_("pricing_dialog_note")}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDialog(false)}
                  disabled={processing}
                >
                  {_("pricing_cancel")}
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleConfirmPurchase}
                  disabled={processing}
                >
                  {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {processing ? _("pricing_processing") : _("pricing_confirm")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
