import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { Layers, Mail, Lock, User, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function Login() {
  const { login, isLoading: authLoading } = useAuth();
  const { _ } = useLanguage();
  void _; // used for i18n keys
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const googleLogin = trpc.auth.googleLogin.useMutation();
  const emailRegister = trpc.auth.register.useMutation();
  const emailLogin = trpc.auth.login.useMutation();

  // Load Google Identity Services script
  useEffect(() => {
    if (mode !== "login") return;
    if (document.getElementById("google-script")) {
      initGoogleButton();
      return;
    }
    const script = document.createElement("script");
    script.id = "google-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogleButton;
    document.body.appendChild(script);
  }, [mode]);

  const initGoogleButton = () => {
    if (!window.google || !googleButtonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
      callback: handleGoogleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      shape: "rectangular",
    });
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      toast.error("Google sign-in failed");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await googleLogin.mutateAsync({ idToken: response.credential });
      if (res.success && res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken);
        toast.success("Signed in with Google!");
      } else {
        toast.error(res.error || "Google sign-in failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Google sign-in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await emailLogin.mutateAsync({ email, password });
      if (res.success && res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken);
        toast.success("Welcome back!");
      } else {
        toast.error(res.error || "Login failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await emailRegister.mutateAsync({ email, password, name });
      if (res.success && res.accessToken && res.refreshToken) {
        login(res.accessToken, res.refreshToken);
        toast.success("Account created successfully!");
      } else {
        toast.error(res.error || "Registration failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 -ml-3">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Sign in to your AI Design Studio account"
                : "Start creating with AI-powered design tools"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google Sign In (login mode only) */}
            {mode === "login" && (
              <>
                <div ref={googleButtonRef} className="flex justify-center" />
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
                    or continue with email
                  </span>
                </div>
              </>
            )}

            {/* Form */}
            <form
              onSubmit={mode === "login" ? handleEmailLogin : handleRegister}
              className="space-y-3"
            >
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="flex items-center gap-2 text-sm">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                  <Mail className="w-3.5 h-3.5" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm">
                  <Lock className="w-3.5 h-3.5" /> Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Min 8 chars, A-Z, a-z, 0-9" : "Your password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || authLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Please wait...
                  </>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Toggle mode */}
            <div className="text-center text-sm">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-primary hover:underline font-medium"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
