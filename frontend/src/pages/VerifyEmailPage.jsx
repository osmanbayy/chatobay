import React, { useEffect, useState } from "react";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useAuthStore } from "../store/useAuthStore";
import { ShieldCheckIcon } from "lucide-react";
import { LoaderIcon } from "react-hot-toast";

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyEmailPage = () => {
  const { verifyEmail, resendVerificationCode, isVerifyingEmail, isResendingCode, authUser } = useAuthStore();
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!secondsLeft) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!code || code.length !== 6) return;

    try {
      await verifyEmail(code);
    } catch {
      // handled in store via toast
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    await resendVerificationCode();
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <div className="flex items-center justify-center w-full p-4">
      <div className="relative w-full max-w-4xl md:h-[600px] h-[520px]">
        <BorderAnimatedContainer>
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-cyan-500/10">
              <ShieldCheckIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-100">Check your inbox</h1>
            <p className="max-w-md mt-3 text-sm text-slate-400">
              We sent a 6-digit verification code to <span className="text-slate-200">{authUser?.email}</span>. Enter the code below to continue to your onboarding.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-sm mt-8 space-y-6">
              <div className="flex justify-center">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(value);
                  }}
                  className="w-full px-6 py-4 text-2xl text-center rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 tracking-[0.6rem] outline-none focus:border-cyan-400 transition"
                  placeholder="------"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingEmail || code.length !== 6}
                className="w-full py-3 text-sm font-medium transition-colors rounded-lg bg-cyan-500 text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400"
              >
                {isVerifyingEmail ? <LoaderIcon className="w-5 h-5 mx-auto animate-spin" /> : "Verify Email"}
              </button>
            </form>

            <div className="mt-6 text-sm text-slate-400">
              <p>Didn't get the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResendingCode || secondsLeft > 0}
                className="mt-2 font-medium text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResendingCode ? "Sending..." : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
              </button>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

