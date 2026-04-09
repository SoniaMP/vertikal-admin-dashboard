"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "./user-form-dialog";

export function CreateUserButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo usuario
      </Button>
      <UserFormDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
