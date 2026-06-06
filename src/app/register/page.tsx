"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeBall, Pupil } from "@/components/ui/animated-eyes";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import MultiStepProgress from "@/components/auth/MultiStepProgress";
import {
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Globe,
  UploadCloud,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// Common countries list
const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Germany", "France",
  "India", "Australia", "Singapore", "Japan", "Brazil", "South Africa"
];

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

export default function RegisterPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  // Step tracker (0: Personal Info, 1: Account Setup, 2: Terms & Conditions)
  const [currentStep, setCurrentStep] = useState(0);

  // Mouse tracking
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"PROCUREMENT_OFFICER" | "VENDOR" | "MANAGER" | "ADMIN">("PROCUREMENT_OFFICER");
  const [adminInviteCode, setAdminInviteCode] = useState("");

  // Avatar upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Terms and conditions
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailPromo, setEmailPromo] = useState(false);

  // Validation & availability errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submittingError, setSubmittingError] = useState<string | null>(null);

  // Character animation states
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);

  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);

  // Track mouse coordinates
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
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

  const purplePos = useCharacterPosition(purpleRef, mouseX, mouseY);
  const blackPos = useCharacterPosition(blackRef, mouseX, mouseY);
  const orangePos = useCharacterPosition(orangeRef, mouseX, mouseY);
  const yellowPos = useCharacterPosition(yellowRef, mouseX, mouseY);

  const passwordHidden = password.length > 0 && !showPassword;
  const passwordPeeking = password.length > 0 && showPassword;

  // Debounced email check
  useEffect(() => {
    if (!email) {
      setEmailError(null);
      return;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      setEmailError("Invalid email format");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!data.available) {
          setEmailError("Email already registered.");
        } else {
          setEmailError(null);
        }
      } catch (err) {
        console.error(err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  // File Upload logic
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image file size must be under 2MB");
      return;
    }

    // Validate format
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WEBP formats are allowed");
      return;
    }

    setUploadError(null);
    setUploadingAvatar(true);

    // Read file for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Convert to base64 for API upload
      const base64Reader = new FileReader();
      base64Reader.readAsDataURL(file);
      base64Reader.onloadend = async () => {
        const dataUrl = base64Reader.result as string;

        const res = await fetch("/api/upload/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, fileName: file.name }),
        });

        const data = await res.json();
        if (data.success) {
          setAvatarUrl(data.url);
        } else {
          setUploadError(data.error || "Failed to upload avatar");
        }
        setUploadingAvatar(false);
      };
    } catch {
      setUploadError("An error occurred during image upload");
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarUrl(null);
    setUploadError(null);
  };

  // Step validation
  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 0) {
      if (!firstName.trim()) errors.firstName = "First name is required";
      if (!lastName.trim()) errors.lastName = "Last name is required";
      if (!email.trim()) errors.email = "Email is required";
      else if (emailError) errors.email = emailError;
    }

    if (step === 1) {
      if (!password) errors.password = "Password is required";
      else if (password.length < 8) errors.password = "Password must be at least 8 characters";
      if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
      if (role === "ADMIN" && adminInviteCode !== "VB-ADMIN-2026") {
        errors.adminInviteCode = "Invalid admin invite code";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingError(null);

    if (!validateStep(currentStep)) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            country,
            additionalInfo,
            password,
            confirmPassword,
            role,
            avatarUrl,
            termsAccepted,
          }),
        });

        const data = await res.json();
        if (data.success) {
          router.push(`/register/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          if (data.errors) {
            const mapped: Record<string, string> = {};
            data.errors.forEach((err: { field: string; message: string }) => {
              mapped[err.field] = err.message;
            });
            setValidationErrors(mapped);
            // Go to step with error
            if (mapped.firstName || mapped.lastName || mapped.email) {
              setCurrentStep(0);
            } else if (mapped.password || mapped.confirmPassword || mapped.role) {
              setCurrentStep(1);
            }
          } else {
            setSubmittingError(data.error || "Failed to submit registration");
          }
        }
      } catch {
        setSubmittingError("Network error. Please check your internet connection.");
      }
    });
  };

  const steps = [
    { label: "Personal Info", icon: "1" },
    { label: "Account Setup", icon: "2" },
    { label: "Terms & Conditions", icon: "3" },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[hsl(var(--background))]">
      
      {/* ── Left Side: Animated Characters (Reused) ── */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsl(249,82%,38%) 0%, hsl(249,82%,50%) 50%, hsl(262,80%,45%) 100%)",
        }}
      >
        {/* Brand Logo header */}
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

      {/* ── Right Side: Multistep registration form ── */}
      <div className="relative flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        
        {/* Dark/Light theme toggle */}
        <button
          type="button"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-5 right-5 p-2.5 rounded-full transition-all duration-200
            text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]
            hover:bg-[hsl(var(--muted))] focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[hsl(var(--ring))]"
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 top-2.5 left-2.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        <div className="w-full max-w-[480px] py-8">
          
          {/* Header titles */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--foreground))] mb-2">
              Create your account
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Join VendorBridge ERP portal to collaborate instantly.
            </p>
          </div>

          {/* Stepper Progress bar */}
          <MultiStepProgress currentStep={currentStep} steps={steps} />

          {/* Form wrapper */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ── STEP 1: Personal Info ── */}
            {currentStep === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="flex items-center gap-1.5">
                      <UserIcon className="size-4 text-[hsl(var(--muted-foreground))]" /> First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      placeholder="Jane"
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      className={cn(validationErrors.firstName && "border-red-500")}
                    />
                    {validationErrors.firstName && (
                      <p className="text-xs text-red-500 font-medium">{validationErrors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      placeholder="Doe"
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      className={cn(validationErrors.lastName && "border-red-500")}
                    />
                    {validationErrors.lastName && (
                      <p className="text-xs text-red-500 font-medium">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="size-4 text-[hsl(var(--muted-foreground))]" /> Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="jane.doe@company.com"
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    className={cn((validationErrors.email || emailError) && "border-red-500")}
                  />
                  {emailError && (
                    <div className="flex items-start gap-1.5 text-xs text-red-500 font-medium mt-1">
                      <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                      <span>
                        {emailError}{" "}
                        {emailError.includes("registered") && (
                          <a href="/login" className="underline font-bold text-primary hover:text-primary/80">
                            Login instead
                          </a>
                        )}
                      </span>
                    </div>
                  )}
                  {validationErrors.email && !emailError && (
                    <p className="text-xs text-red-500 font-medium">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="size-4 text-[hsl(var(--muted-foreground))]" /> Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    placeholder="+1 (555) 019-2834"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="flex items-center gap-1.5">
                    <Globe className="size-4 text-[hsl(var(--muted-foreground))]" /> Country / Region
                  </Label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="flex h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))]
                      bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))]
                      focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="additionalInfo" className="flex items-center gap-1.5">
                    <FileText className="size-4 text-[hsl(var(--muted-foreground))]" /> Additional Info / Notes
                  </Label>
                  <textarea
                    id="additionalInfo"
                    value={additionalInfo}
                    placeholder="Tell us about your organization or procurement needs..."
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-[var(--radius)] border border-[hsl(var(--border))]
                      bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))]
                      placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2
                      focus:ring-[hsl(var(--ring))] focus:ring-offset-2"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 2: Account Setup ── */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Role selection dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role Type *</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as typeof role)}
                    className="flex h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))]
                      bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))]
                      focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2"
                  >
                    <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
                    <option value="VENDOR">Vendor partner</option>
                    <option value="MANAGER">Manager / Approver</option>
                    <option value="ADMIN">System Administrator (Restricted)</option>
                  </select>
                </div>

                {/* Restricted admin invite code field */}
                {role === "ADMIN" && (
                  <div className="space-y-1.5 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 animate-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="adminInviteCode" className="text-yellow-600 dark:text-yellow-400 font-semibold">
                      Admin Invite Code *
                    </Label>
                    <Input
                      id="adminInviteCode"
                      placeholder="Enter invite code"
                      value={adminInviteCode}
                      onChange={(e) => setAdminInviteCode(e.target.value)}
                      className={cn(validationErrors.adminInviteCode && "border-red-500")}
                    />
                    {validationErrors.adminInviteCode ? (
                      <p className="text-xs text-red-500 font-medium">{validationErrors.adminInviteCode}</p>
                    ) : (
                      <p className="text-[10px] text-yellow-600/80 dark:text-yellow-400/80">
                        Demo code: <code className="font-mono bg-yellow-500/20 px-1 py-0.5 rounded">VB-ADMIN-2026</code>
                      </p>
                    )}
                  </div>
                )}

                {/* Password field */}
                <div className="space-y-1.5">
                  <Label htmlFor="password flex items-center gap-1.5">
                    <Lock className="size-4 text-[hsl(var(--muted-foreground))]" /> Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="••••••••"
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn("pr-10", validationErrors.password && "border-red-500")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    >
                      {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-xs text-red-500 font-medium">{validationErrors.password}</p>
                  )}
                  {/* Password strength meter */}
                  <PasswordStrengthMeter password={password} />
                </div>

                {/* Confirm Password field */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      placeholder="••••••••"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn("pr-10", validationErrors.confirmPassword && "border-red-500")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Avatar upload */}
                <div className="space-y-2">
                  <Label>Profile Picture (Optional)</Label>
                  <div className="flex items-center gap-4">
                    {avatarPreview ? (
                      <div className="relative size-16 rounded-full border overflow-hidden flex-shrink-0 group">
                        <img src={avatarPreview} alt="Avatar Preview" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="avatar-upload"
                        className="size-16 rounded-full border border-dashed flex flex-col items-center justify-center cursor-pointer bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] transition-colors"
                      >
                        <UploadCloud className="size-5 text-[hsl(var(--muted-foreground))]" />
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">Upload</span>
                      </label>
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="text-xs space-y-0.5">
                      <p className="font-semibold">Drag-and-drop or click to upload</p>
                      <p className="text-[hsl(var(--muted-foreground))]">Max 2MB file size. JPEG, PNG, WEBP.</p>
                      {uploadingAvatar && <p className="text-primary font-medium">Uploading image...</p>}
                      {uploadError && <p className="text-red-500 font-medium">{uploadError}</p>}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ── STEP 3: Terms & Conditions ── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="termsAccepted"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted((e.target as HTMLInputElement).checked)}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="termsAccepted" className="font-semibold text-sm cursor-pointer">
                        I accept the Terms of Service & Privacy Policy *
                      </Label>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] leading-normal">
                        By checking this box, you agree to the VendorBridge Service Agreement, user rules, data sharing policies, and security regulations.
                      </p>
                      {validationErrors.termsAccepted && (
                        <p className="text-xs text-red-500 font-medium">{validationErrors.termsAccepted}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="emailPromo"
                      checked={emailPromo}
                      onChange={(e) => setEmailPromo((e.target as HTMLInputElement).checked)}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="emailPromo" className="font-semibold text-sm cursor-pointer">
                        Subscribe to communications (Optional)
                      </Label>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] leading-normal">
                        Receive monthly newsletters, platform release notes, security advisories, and procurement insights.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submitting overall errors */}
                {submittingError && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs text-red-600 dark:text-red-400 font-semibold animate-shake">
                    <AlertCircle className="size-4 mt-0.5 shrink-0" />
                    <span>{submittingError}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Action navigation buttons ── */}
            <div className="flex items-center justify-between pt-4 gap-4 border-t border-[hsl(var(--border))]">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  disabled={isPending}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 2 ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending || !termsAccepted || uploadingAvatar}
                  className="flex items-center gap-2 relative overflow-hidden"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Signing up...
                    </span>
                  ) : (
                    <>
                      Register Account <CheckCircle className="size-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

          </form>

          {/* Bottom redirection Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-bold text-[hsl(var(--foreground))] hover:text-primary hover:underline transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
