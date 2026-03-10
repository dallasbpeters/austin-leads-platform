"use client";

import { useState, useTransition } from "react";
import { AlertCircle, LockKeyhole } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInForm({ callbackUrl = "/dashboard" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("The admin credentials were not accepted.");
        return;
      }

      router.push(result?.url || callbackUrl);
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg shadow-black/5">
      <CardHeader className="space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Admin access</p>
          <CardTitle className="mt-2 text-3xl tracking-tight">Sign in to platform ops</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button disabled={isPending} type="submit">
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
