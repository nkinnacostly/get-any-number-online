"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        // Redirect to dashboard on successful login
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { error } = await signInWithGoogle();
      if (error) {
        setError("Google login failed. Please try again.");
      }
      // Note: Google OAuth will redirect the user, so we don't need to handle success here
    } catch (err) {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-16 md:pt-20">
      <Card className="w-full max-w-md bg-card rounded-lg shadow-lg border border-border">
        <CardHeader className="space-y-4 md:space-y-6 pt-6 md:pt-8 pb-4 md:pb-6">
          {/* SMS Pool Logo */}
          <div className="flex justify-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg border border-border">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-primary-foreground rounded-sm"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-primary-foreground/80 rounded-sm"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-primary-foreground/80 rounded-sm"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-primary-foreground rounded-sm"></div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <CardTitle className="text-xl md:text-2xl font-bold text-card-foreground">
              Welcome to SMS Pool
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-muted-foreground">
              Your Gateway to SMS Verification
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-6 px-6 md:px-8 pb-6 md:pb-8">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-sm">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1 md:space-y-2">
              <Label
                htmlFor="email"
                className="text-foreground font-medium text-sm"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background border-border text-foreground focus:border-primary focus:ring-primary h-10 md:h-11"
              />
            </div>

            <div className="space-y-1 md:space-y-2">
              <Label
                htmlFor="password"
                className="text-foreground font-medium text-sm"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background border-border text-foreground focus:border-primary focus:ring-primary h-10 md:h-11"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs md:text-sm text-primary hover:text-primary/80 hover:underline"
                onClick={async () => {
                  if (!email) {
                    setError("Please enter your email address first");
                    return;
                  }

                  try {
                    setLoading(true);
                    setError("");
                    setSuccess("");
                    const { error } = await resetPassword(email);
                    if (error) {
                      setError(error.message);
                    } else {
                      setSuccess(
                        "Password reset email sent! Check your inbox."
                      );
                    }
                  } catch (err) {
                    setError("Failed to send reset email. Please try again.");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 md:py-2.5 rounded-md transition-all duration-200 h-10 md:h-11"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="text-center text-xs md:text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              className="text-foreground font-medium hover:underline"
              onClick={() => router.push("/signup")}
            >
              Sign up
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs md:text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-border hover:bg-muted text-foreground font-medium py-2 md:py-2.5 rounded-md h-10 md:h-11"
            onClick={handleGoogleLogin}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google account
          </Button>
        </CardContent>
      </Card>

      {/* Legal Disclaimer */}
      {/* <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground text-center max-w-sm md:max-w-md px-2 md:px-4">
        By clicking "Sign in", you agree to SMS Pool's{" "}
        <a href="#" className="underline hover:text-foreground">
          User Agreement
        </a>
        , and{" "}
        <a href="#" className="underline hover:text-foreground">
          Privacy Policy
        </a>{" "}
        we prioritize your privacy and trust, providing secure SMS verification
        services while safeguarding your personal information
      </div> */}
    </div>
  );
}
