"use client";

import { forwardRef, useId, useState } from "react";

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "className"
> & {
  className?: string;
  /** Accessible label for the toggle button (locale-specific). */
  showLabel?: string;
  hideLabel?: string;
};

/**
 * Password input with a show/hide toggle.
 *
 * Security notes:
 * - Toggling only changes `type` between "password" and "text" client-side.
 *   The value is never logged, transmitted, or persisted by this component.
 * - We keep `autoComplete` and `name` from the parent so password managers
 *   still work as expected.
 * - We add `spellCheck=false`, `autoCorrect=off`, `autoCapitalize=off` to
 *   prevent IMEs / mobile keyboards from leaking the visible value into
 *   suggestion dictionaries while the user is in "show" mode.
 * - The toggle button is `type="button"` so it never submits the form.
 * - When the input loses focus we auto-revert to hidden so the password
 *   isn't left visible if the user walks away.
 */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput(
    {
      className = "w-full rounded border border-white/15 bg-black px-3 py-2 pr-10 text-white outline-none focus:border-white/40",
      showLabel = "Show password",
      hideLabel = "Hide password",
      onBlur,
      ...rest
    },
    ref
  ) {
    const [visible, setVisible] = useState(false);
    const id = useId();

    return (
      <div className="relative">
        <input
          ref={ref}
          id={rest.id ?? id}
          type={visible ? "text" : "password"}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          {...rest}
          onBlur={(e) => {
            // Auto-hide on blur as a safety measure.
            setVisible(false);
            onBlur?.(e);
          }}
          className={className}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 flex items-center px-2 text-white/50 hover:text-white/90 focus:text-white/90 focus:outline-none"
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </div>
    );
  }
);

function Eye() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.94 18.94 0 0 1 4.22-5.22" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a18.93 18.93 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
