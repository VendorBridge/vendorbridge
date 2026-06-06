"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeBall, Pupil } from "@/components/ui/animated-eyes";
import { Eye, EyeOff, Mail, Sparkles, AlertCircle, Clock, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { loginAction } from "./actions";
import type { LoginError } from "./actions";

// ─── Countdown hook ───────────────────────────────────
function useCountdown(ms: number | null) {
  const [remaining, setRemaining] = useState<number | null>(ms);
  useEffect(() => {
    if (!ms) { setRemaining(null); return; }
    setRemaining(ms);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1000) { clearInterval(interval); return null; }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [ms]);
  if (!remaining) return null;
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ─── Character animation helpers ─────────────────────
type CharPos = { faceX: number; faceY: number; bodySkew: number };

function useCharacterPosition(
  ref: React.RefObject<HTMLDivElement | null>,
  mouseX: number,
  mouseY: number
): CharPos {
  if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
  const rect = ref.current.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 3;
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  return {
    faceX: Math.max(-15, Math.min(15, dx / 20)),
    faceY: Math.max(-10, Math.min(10, dy / 30)),
    bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
  };
}

// ─── Main Page ────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  const [rateLimitMs, setRateLimitMs] = useState<number | null>(null);
  const countdown = useCountdown(rateLimitMs);

  // Mouse tracking
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  // Animation states
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);

  // Character refs for position calculation
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Purple blinking
  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => { setIsPurpleBlinking(false); schedule(); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  // Black blinking
  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => { setIsBlackBlinking(false); schedule(); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  // Look at each other when typing
  useEffect(() => {
    if (!isTyping) { setIsLookingAtEachOther(false); return; }
    setIsLookingAtEachOther(true);
    const t = setTimeout(() => setIsLookingAtEachOther(false), 800);
    return () => clearTimeout(t);
  }, [isTyping]);

  // Purple sneaky peek when password visible
  useEffect(() => {
    if (!showPassword || password.length === 0) { setIsPurplePeeking(false); return; }
    const t = setTimeout(() => {
      setIsPurplePeeking(true);
      setTimeout(() => setIsPurplePeeking(false), 800);
    }, Math.random() * 3000 + 2000);
    return () => clearTimeout(t);
  }, [showPassword, password, isPurplePeeking]);

  // Character positions from mouse
  const purplePos = useCharacterPosition(purpleRef, mouseX, mouseY);
  const blackPos = useCharacterPosition(blackRef, mouseX, mouseY);
  const orangePos = useCharacterPosition(orangeRef, mouseX, mouseY);
  const yellowPos = useCharacterPosition(yellowRef, mouseX, mouseY);

  // Derived animation flags
  const passwordHidden = password.length > 0 && !showPassword;
  const passwordPeeking = password.length > 0 && showPassword;

  // ── Submit handler ─────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setRateLimitMs(null);

    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    if (remember) fd.set("remember", "on");

    startTransition(async () => {
      const result = await loginAction(fd);
      if (result.success) {
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setLoginError(result.error);
        if (result.error.type === "RATE_LIMITED") {
          setRateLimitMs(result.error.remainingMs);
        }
      }
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left: Animated Characters + Branding ── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 text-white"
        style={{ background: "linear-gradient(135deg, hsl(249,82%,38%) 0%, hsl(249,82%,50%) 50%, hsl(262,80%,45%) 100%)" }}>

        {/* VendorBridge logo */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">VendorBridge</span>
            <p className="text-xs text-white/60 font-medium">Procurement & Vendor ERP</p>
          </div>
        </div>

        {/* Characters stage */}
        <div className="relative z-20 flex items-end justify-center" style={{ height: "500px" }}>
          <div className="relative" style={{ width: "550px", height: "400px" }}>

            {/* Purple — Back layer */}
            <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "70px", width: "180px",
                height: isTyping || passwordHidden ? "440px" : "400px",
                backgroundColor: "#6C3FF5",
                borderRadius: "10px 10px 0 0",
                zIndex: 1,
                transform: passwordPeeking
                  ? "skewX(0deg)"
                  : isTyping || passwordHidden
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}>
              <div className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: passwordPeeking ? "20px" : isLookingAtEachOther ? "55px" : `${45 + purplePos.faceX}px`,
                  top: passwordPeeking ? "35px" : isLookingAtEachOther ? "65px" : `${40 + purplePos.faceY}px`,
                }}>
                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#1a1a2e"
                  isBlinking={isPurpleBlinking}
                  forceLookX={passwordPeeking ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={passwordPeeking ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#1a1a2e"
                  isBlinking={isPurpleBlinking}
                  forceLookX={passwordPeeking ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={passwordPeeking ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
              </div>
            </div>

            {/* Black — Middle layer */}
            <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "240px", width: "120px", height: "310px",
                backgroundColor: "#1a1a2e",
                borderRadius: "8px 8px 0 0",
                zIndex: 2,
                transform: passwordPeeking
                  ? "skewX(0deg)"
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : isTyping || passwordHidden
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                      : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}>
              <div className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: passwordPeeking ? "10px" : isLookingAtEachOther ? "32px" : `${26 + blackPos.faceX}px`,
                  top: passwordPeeking ? "28px" : isLookingAtEachOther ? "12px" : `${32 + blackPos.faceY}px`,
                }}>
                <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#1a1a2e"
                  isBlinking={isBlackBlinking}
                  forceLookX={passwordPeeking ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={passwordPeeking ? -4 : isLookingAtEachOther ? -4 : undefined} />
                <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#1a1a2e"
                  isBlinking={isBlackBlinking}
                  forceLookX={passwordPeeking ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={passwordPeeking ? -4 : isLookingAtEachOther ? -4 : undefined} />
              </div>
            </div>

            {/* Orange — Front left semi-circle */}
            <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "0px", width: "240px", height: "200px",
                backgroundColor: "#FF9B6B",
                borderRadius: "120px 120px 0 0",
                zIndex: 3,
                transform: passwordPeeking ? "skewX(0deg)" : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}>
              <div className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: passwordPeeking ? "50px" : `${82 + orangePos.faceX}px`,
                  top: passwordPeeking ? "85px" : `${90 + orangePos.faceY}px`,
                }}>
                <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e"
                  forceLookX={passwordPeeking ? -5 : undefined}
                  forceLookY={passwordPeeking ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e"
                  forceLookX={passwordPeeking ? -5 : undefined}
                  forceLookY={passwordPeeking ? -4 : undefined} />
              </div>
            </div>

            {/* Yellow — Front right capsule */}
            <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "310px", width: "140px", height: "230px",
                backgroundColor: "#E8D754",
                borderRadius: "70px 70px 0 0",
                zIndex: 4,
                transform: passwordPeeking ? "skewX(0deg)" : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}>
              <div className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: passwordPeeking ? "20px" : `${52 + yellowPos.faceX}px`,
                  top: passwordPeeking ? "35px" : `${40 + yellowPos.faceY}px`,
                }}>
                <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e"
                  forceLookX={passwordPeeking ? -5 : undefined}
                  forceLookY={passwordPeeking ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e"
                  forceLookX={passwordPeeking ? -5 : undefined}
                  forceLookY={passwordPeeking ? -4 : undefined} />
              </div>
              {/* Mouth */}
              <div className="absolute rounded-full transition-all duration-200 ease-out"
                style={{
                  width: "52px", height: "4px",
                  backgroundColor: "#1a1a2e",
                  left: passwordPeeking ? "44px" : `${44 + yellowPos.faceX}px`,
                  top: passwordPeeking ? "88px" : `${88 + yellowPos.faceY}px`,
                }} />
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="bg-grid-white absolute inset-0 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 size-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="absolute bottom-1/3 left-1/4 size-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>

      {/* ── Right: Login Form ── */}
      <div className="relative flex items-center justify-center p-8 bg-[hsl(var(--background))]">

        {/* Theme toggle — top right */}
        <button
          type="button"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-5 right-5 p-2 rounded-full transition-colors duration-200
            text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]
            hover:bg-[hsl(var(--muted))] focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[hsl(var(--ring))]">
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 top-2 left-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="size-9 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(var(--primary))" }}>
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[hsl(var(--foreground))]">VendorBridge</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] mb-2">
              Welcome back!
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Sign in to your VendorBridge account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                disabled={isPending}
                aria-label="Email address"
                className="h-12"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isPending}
                  aria-label="Password"
                  className="h-12 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                    "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  )}>
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label htmlFor="remember"
                className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember((e.target as HTMLInputElement).checked)}
                  disabled={isPending}
                  aria-label="Remember for 30 days"
                />
                <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors">
                  Remember for 30 days
                </span>
              </label>
              <a href="/forgot-password"
                className="text-sm font-medium text-[hsl(var(--primary))] hover:underline transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Error messages */}
            {loginError && (
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-xl border text-sm animate-in fade-in slide-in-from-top-1 duration-300",
                loginError.type === "RATE_LIMITED"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
              )}>
                {loginError.type === "RATE_LIMITED"
                  ? <Clock className="size-4 mt-0.5 shrink-0" />
                  : <AlertCircle className="size-4 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium">{loginError.message}</p>
                  {loginError.type === "RATE_LIMITED" && countdown && (
                    <p className="mt-0.5 text-xs opacity-80">Try again in {countdown}</p>
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={isPending || loginError?.type === "RATE_LIMITED"}
              className="w-full h-12 text-base font-semibold relative overflow-hidden group">
              <span className={cn("transition-opacity", isPending && "opacity-0")}>
                Sign in
              </span>
              {isPending && (
                <span className="absolute inset-0 flex items-center justify-center gap-2">
                  <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in...
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[hsl(var(--border))]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[hsl(var(--background))] px-2 text-[hsl(var(--muted-foreground))]">
                or continue with
              </span>
            </div>
          </div>

          {/* Google login */}
          <Button
            variant="outline"
            type="button"
            className="w-full h-12 font-medium gap-3"
            onClick={() => alert("Google OAuth setup required — configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env")}>
            <svg className="size-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          {/* Sign up link */}
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-8">
            Don&apos;t have an account?{" "}
            <a href="/register"
              className="font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] hover:underline transition-colors">
              Sign up
            </a>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 rounded-lg border border-dashed border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
            <p className="font-semibold mb-1 text-[hsl(var(--foreground))]">Demo credentials</p>
            <div className="space-y-0.5">
              <p>Admin: admin@vendorbridge.com / Admin@123</p>
              <p>Procurement: procurement@vendorbridge.com / Proc@123</p>
              <p>Manager: manager@vendorbridge.com / Mgr@123</p>
              <p>Vendor: vendor@vendorbridge.com / Vend@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
