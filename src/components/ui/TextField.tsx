interface TextFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  hint?: string;
}

export function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  disabled = false,
  hint,
}: TextFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-[48px] w-full rounded-[10px] border bg-white px-3.5 text-base text-foreground outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20 disabled:bg-background ${
          error ? "border-red-600" : "border-[#7B8794]"
        }`}
      />
      {hint ? (
        <p id={hintId} className="mt-1.5 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
