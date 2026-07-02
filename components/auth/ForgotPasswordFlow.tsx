"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/LanguageProvider";

type ForgotStep = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordFlow() {
  const [step, setStep] = useState<ForgotStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { dir, t } = useI18n();

  const currentTitle = useMemo(() => {
    switch (step) {
      case "email":
        return t("auth.forgotTitle");
      case "otp":
        return t("auth.forgotOtpTitle");
      case "reset":
        return t("auth.forgotResetTitle");
      case "success":
        return t("auth.forgotSuccessTitle");
      default:
        return t("auth.forgotTitle");
    }
  }, [step, t]);

  const currentDescription = useMemo(() => {
    switch (step) {
      case "email":
        return t("auth.forgotDescription");
      case "otp":
        return t("auth.forgotOtpDescription", { email });
      case "reset":
        return t("auth.forgotResetDescription");
      case "success":
        return t("auth.forgotSuccessDescription");
      default:
        return "";
    }
  }, [email, step, t]);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.message || err.message || fallback;
    }
    return err instanceof Error ? err.message : fallback;
  };

  //========================= API CALLS ==========================//
  //==============================================================//
  const sendOtpMutation = useMutation({
    mutationFn: async (payload: { email: string }) => {
      const response = await api.post("/auth/forgot-password/send-otp", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setError("");
      setMessage(data?.message || t("auth.otpSent"));
      setOtp("");
      setStep("otp");
    },
    onError: (err: unknown) => {
      setMessage("");
      setError(getErrorMessage(err, t("auth.failedToSendOtp")));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      const response = await api.post("/auth/forgot-password/verify-otp", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setError("");
      setMessage(data?.message || t("auth.otpVerified"));
      setResetToken(data?.data?.reset_token || "");
      setPassword("");
      setConfirmPassword("");
      setStep("reset");
    },
    onError: (err: unknown) => {
      setMessage("");
      setError(getErrorMessage(err, t("auth.failedToVerifyOtp")));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (payload: {
      reset_token: string;
      password: string;
      confirm_password: string;
    }) => {
      const response = await api.post("/auth/forgot-password/reset", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setError("");
      setMessage(data?.message || t("auth.passwordResetSuccess"));
      setStep("success");
    },
    onError: (err: unknown) => {
      setMessage("");
      setError(getErrorMessage(err, t("auth.failedToResetPassword")));
    },
  });

  const isBusy =
    sendOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    resetPasswordMutation.isPending;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    sendOtpMutation.mutate({ email: email.trim() });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    verifyOtpMutation.mutate({ email: email.trim(), otp: otp.trim() });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    resetPasswordMutation.mutate({
      reset_token: resetToken,
      password,
      confirm_password: confirmPassword,
    });
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8" dir={dir}>
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-[30px]">
          {currentTitle}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {currentDescription}
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("auth.emailAddress")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.exampleEmail")}
              required
              className="h-12 rounded-xl border-slate-300 px-4"
            />
          </div>

          <Button
            type="submit"
            disabled={isBusy || !email.trim()}
            className="h-12 w-full rounded-xl bg-blue text-white hover:bg-blue-light"
          >
            {sendOtpMutation.isPending ? t("auth.sendingOtp") : t("auth.sendOtp")}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("auth.oneTimePassword")}
            </label>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={t("auth.enterSixDigitOtp")}
              inputMode="numeric"
              required
              className="h-12 rounded-xl border-slate-300 px-4 tracking-[0.35em] text-center text-lg"
            />
            <p className="mt-2 text-xs text-slate-500">
              {t("auth.otpExpires")}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => {
                setError("");
                setMessage("");
                sendOtpMutation.mutate({ email: email.trim() });
              }}
              className="h-12 flex-1 rounded-xl border-slate-300"
            >
              {sendOtpMutation.isPending ? t("auth.resendingOtp") : t("auth.resendOtp")}
            </Button>
            <Button
              type="submit"
              disabled={isBusy || otp.trim().length !== 6}
              className="h-12 flex-1 rounded-xl bg-blue text-white hover:bg-blue-light"
            >
              {verifyOtpMutation.isPending ? t("auth.verifyingOtp") : t("auth.verifyOtp")}
            </Button>
          </div>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("auth.newPassword")}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.enterNewPassword")}
              required
              minLength={6}
              className="h-12 rounded-xl border-slate-300 px-4"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t("auth.confirmNewPassword")}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth.confirmNewPasswordPlaceholder")}
              required
              minLength={6}
              className="h-12 rounded-xl border-slate-300 px-4"
            />
          </div>

          <Button
            type="submit"
            disabled={
              isBusy ||
              !resetToken ||
              password.length < 6 ||
              confirmPassword.length < 6
            }
            className="h-12 w-full rounded-xl bg-blue text-white hover:bg-blue-light"
          >
            {resetPasswordMutation.isPending ? t("auth.updatingPassword") : t("auth.resetPassword")}
          </Button>
        </form>
      )}

      {step === "success" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
            {t("auth.passwordUpdatedMessage")}
          </div>
          <Button asChild className="h-12 w-full rounded-xl bg-blue text-white hover:bg-blue-light">
            <Link href="/auth/signin">{t("auth.backToSignIn")}</Link>
          </Button>
        </div>
      )}

      {step !== "success" && (
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-5 text-sm">
          <button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");

              if (step === "otp") {
                setStep("email");
                return;
              }

              if (step === "reset") {
                setStep("otp");
              }
            }}
            className={`font-medium text-slate-500 hover:text-slate-800 ${step === "email" ? "invisible" : "visible"}`}
          >
            {t("auth.back")}
          </button>

          <Link href="/auth/signin" className="font-medium text-orange hover:underline">
            {t("auth.returnToSignIn")}
          </Link>
        </div>
      )}
    </div>
  );
}
