"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Sparkles, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { PublicGuard } from "@/components/guards/AuthGuard";

function EmailVerificationContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Get email from localStorage or query params
  useEffect(() => {
    const storedEmail = localStorage.getItem('verificationEmail');
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('verificationEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle key press for backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      setIsLoading(false);
      return;
    }

    try {
      const apiService = (await import('@/lib/apiService')).default;
      const result = await apiService.verifyEmailOTP(email, otpString);
      
      setIsVerified(true);
      console.log("✅ Email verified successfully!", result.data.user);
      
      // Clean up temporary data
      localStorage.removeItem('verificationEmail');
      localStorage.removeItem('tempPassword');
      
      // Redirect to login page after successful verification
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      console.error("❌ OTP verification failed:", error.message);
      setError(error.message || "Invalid OTP. Please try again.");
    }

    setIsLoading(false);
  };

  // Resend OTP
  const handleResend = async () => {
    if (timeLeft > 0) return;
    
    setError("");
    setIsResending(true);

    try {
      const apiService = (await import('@/lib/apiService')).default;
      await apiService.generateEmailOTP(email);
      
      // Start countdown (60 seconds)
      setTimeLeft(60);
      console.log("✅ OTP resent successfully");
      
    } catch (error) {
      console.error("❌ Failed to resend OTP:", error.message);
      setError(error.message || "Failed to resend OTP. Please try again.");
    }

    setIsResending(false);
  };

  if (isVerified) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. Redirecting to login page...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <div className="mb-6">
          <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
            <p className="text-gray-600 mt-2">
              We've sent a 6-digit code to<br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Enter Verification Code</Label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    required
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={isResending || timeLeft > 0}
                className="text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : 
                 timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Code'}
              </button>
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Check your spam folder if you don't see the email.</p>
        </div>
      </div>
    </div>
  );
}

export default function EmailVerification() {
  return (
    <PublicGuard>
      <EmailVerificationContent />
    </PublicGuard>
  );
}
