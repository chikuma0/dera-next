interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = "h-8 w-8" }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-foreground ${className}`}></div>
    </div>
  );
}