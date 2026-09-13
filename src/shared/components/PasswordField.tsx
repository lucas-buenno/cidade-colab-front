import { EyeSlash } from "@phosphor-icons/react";
import { forwardRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import visibilityUrl from "@/assets/icons/visibility.svg";
import { TextField } from "@/shared/components/TextField";
import { messages } from "@/shared/i18n/pt-BR";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

export const PasswordField = forwardRef<HTMLInputElement, Props>(
  function PasswordField({ id, label, error, hint, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const toggleLabel = visible ? messages.password.hide : messages.password.show;

    return (
      <TextField
        {...props}
        id={id}
        ref={ref}
        label={label}
        error={error}
        hint={hint}
        type={visible ? "text" : "password"}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={toggleLabel}
            aria-pressed={visible}
            data-testid={`${id}-toggle-visibility`}
            className="inline-flex size-11 cursor-pointer items-center justify-center text-field-placeholder hover:text-field-ink"
          >
            {visible ? (
              <EyeSlash className="size-6" aria-hidden="true" />
            ) : (
              <img
                src={visibilityUrl}
                alt=""
                width={24}
                height={24}
                className="block size-6"
                aria-hidden="true"
              />
            )}
          </button>
        }
      />
    );
  },
);
