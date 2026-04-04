"use client";

import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const emailSchema = z.string().email();

type EmailChipInputProps = {
  value: string[];
  onChange: (emails: string[]) => void;
  id?: string;
};

export function EmailChipInput({ value, onChange, id }: EmailChipInputProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addEmail() {
    const trimmed = draft.trim().toLowerCase();
    if (!trimmed) return;

    const result = emailSchema.safeParse(trimmed);
    if (!result.success) {
      setError("Email inválido");
      return;
    }

    if (value.includes(trimmed)) {
      setError("Email duplicado");
      return;
    }

    onChange([...value, trimmed]);
    setDraft("");
    setError(null);
  }

  function removeEmail(email: string) {
    onChange(value.filter((e) => e !== email));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          type="email"
          placeholder="email@ejemplo.com"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          aria-invalid={!!error}
        />
        <Button type="button" variant="outline" onClick={addEmail}>
          Añadir
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((email) => (
            <Badge key={email} variant="secondary" className="gap-1 pr-1">
              {email}
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
                aria-label={`Eliminar ${email}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
