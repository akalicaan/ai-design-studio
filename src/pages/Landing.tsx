import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LangToggle } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Scissors,
  Image,
  ZoomIn,
  Layers,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Sparkles,
  Palette,
} from "lucide-react";

export default function Landing() {
  const { _ } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur-md fixed top-0 w-full z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Layers className="w-6 h-6 text-primary" />
            <span>AI Design Studio</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#tools" className="hover:text-foreground transition">{_("nav_tools")}</a>
            <a href="#how-it-works" className="hover:text-foreground transition">{_("nav_how_it_works")}</a>
            <Link to="/pricing" className="hover:text-foreground transition">{_("nav_pricing")}</Link>
          </div>
          <div className="flex items-center gap-1">
            <LangToggle />
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">{_("nav_sign_in")}</Button>
            </Link>
            <Link to="/workspace">
              <Button size="sm">{_("nav_start_designing")}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-8">
            <Zap className="w-4 h-4 text-primary" />
            {_("hero_badge")}
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
            {_("hero_title_1")}
            <br />
            <span className="text-primary">{_("hero_title_2")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            {_("hero_desc")}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/workspace">
              <Button size="lg" className="gap-2">
                {_("hero_cta_primary")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg">
                {_("hero_cta_secondary")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">{_("tools_title")}</h2>
            <p className="text-muted-foreground">{_("tools_subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-background/60 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Scissors className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{_("tool_vectorize_title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{_("tool_vectorize_desc")}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  {_("tool_vectorize_credit")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Image className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{_("tool_bgremove_title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{_("tool_bgremove_desc")}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  {_("tool_bgremove_credit")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ZoomIn className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{_("tool_upscale_title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{_("tool_upscale_desc")}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  {_("tool_upscale_credit")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{_("tool_pattern_title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{_("tool_pattern_desc")}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  {_("tool_pattern_credit")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur border-border/50 ring-2 ring-primary/20">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{_("tool_aipattern_title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{_("tool_aipattern_desc")}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  {_("tool_aipattern_credit")}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">{_("hiw_title")}</h2>
            <p className="text-muted-foreground">{_("hiw_subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: _("hiw_step1_title"), desc: _("hiw_step1_desc") },
              { step: "02", title: _("hiw_step2_title"), desc: _("hiw_step2_desc") },
              { step: "03", title: _("hiw_step3_title"), desc: _("hiw_step3_desc") },
            ].map((item) => (
              <div key={item.step} className="relative">
                <span className="text-5xl font-bold text-muted/30 absolute -top-4 -left-2">
                  {item.step}
                </span>
                <div className="pt-8">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, label: _("trust_private"), sub: _("trust_private_sub") },
              { icon: Zap, label: _("trust_fast"), sub: _("trust_fast_sub") },
              { icon: Layers, label: _("trust_ready"), sub: _("trust_ready_sub") },
              { icon: Check, label: _("trust_own"), sub: _("trust_own_sub") },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-2">
                <b.icon className="w-6 h-6 text-primary" />
                <div className="font-medium text-sm">{b.label}</div>
                <div className="text-xs text-muted-foreground">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">AI Design Studio</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="hover:text-foreground">{_("footer_pricing")}</Link>
            <Link to="/workspace" className="hover:text-foreground">{_("footer_workspace")}</Link>
            <span>© 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
