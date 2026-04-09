"use client";

import { useActionState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUser,
  updateUser,
} from "@/app/admin/(dashboard)/usuarios/actions";

export type UserFormData = {
  id: string;
  name: string;
  email: string;
  roleName: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserFormData;
};

const INITIAL_STATE = { success: false, error: undefined };

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrador" },
  { value: "INSTRUCTOR", label: "Instructor" },
];

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const isEditing = !!user;
  const action = isEditing
    ? updateUser.bind(null, user.id)
    : createUser;

  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (state.success) onOpenChange(false);
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar usuario" : "Nuevo usuario"}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user?.name ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {isEditing ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={!isEditing}
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleName">Rol</Label>
            <Select
              name="roleName"
              defaultValue={user?.roleName ?? "INSTRUCTOR"}
            >
              <SelectTrigger id="roleName">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
