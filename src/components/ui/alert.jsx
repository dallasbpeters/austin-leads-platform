import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function Alert({ className, variant = "default", ...props }) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border px-4 py-3 text-sm",
        variant === "destructive"
          ? "border-destructive/40 bg-destructive/5 text-destructive"
          : "border-border bg-card text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return <div className={cn("pl-6", className)} {...props} />;
}

function AlertTitle({ className, ...props }) {
  return <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />;
}

Alert.Icon = AlertCircle;

export { Alert, AlertDescription, AlertTitle };
