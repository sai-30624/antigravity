import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLayout } from "./AuthLayout";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/auth/reset-password", { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to reset password.");
      // Fallback for mocked mode
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <CardHeader className="space-y-1 pb-6 pt-8">
          <CardTitle className="text-2xl text-center text-white/90">Reset password</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="p-4 text-sm text-center text-blue-200 bg-blue-950/50 border border-blue-900/50 rounded-lg backdrop-blur-sm">
                If an account exists for {email}, a password reset link has been sent.
              </div>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11">
                <Link to="/login">Return to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-200 bg-red-950/50 border border-red-900/50 rounded-lg text-center backdrop-blur-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-zinc-300 font-medium">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="student@university.edu" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500 focus-visible:border-blue-500/50 h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.6)] h-11 text-base font-medium rounded-lg mt-2"
                disabled={loading}
              >
                {loading ? "Sending link..." : "Send reset link"}
              </Button>
            </form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="flex justify-center border-t border-white/5 pt-5 pb-6 bg-white/[0.02]">
            <p className="text-sm text-zinc-400">
              Remember your password?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </AuthLayout>
  );
}
