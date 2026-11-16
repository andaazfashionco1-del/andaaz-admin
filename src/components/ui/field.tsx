import { cn } from "@/lib/format";

type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Label + control + hint/error wrapper used by every form control. */
export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  const text = (
    <>
      {label}
      {required && <span className="ml-0.5 text-pink">*</span>}
    </>
  );
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
          {text}
        </label>
      ) : (
        <span className="text-sm font-semibold text-ink">{text}</span>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-pink" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export const controlClasses =
  "w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-muted/70 transition focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10 disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted aria-[invalid=true]:border-pink";
