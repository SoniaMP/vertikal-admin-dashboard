import Image from "next/image";
import { HelpFooter } from "@/components/contact/help-footer";

export const metadata = {
  title: "Cursos - Club Vertikal",
  description: "Cursos y actividades del Club Vertikal: fechas, plazas y precios.",
};

export default function CursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-flow flex min-h-svh flex-col">
      <div className="public-sheet flex flex-1 flex-col">
        <main className="public-shell flex-1 py-10">
          {/* The intrinsic size of the file, with the drawn size left to CSS.
              Declaring a rounded 190x38 instead told `next/image` a ratio the
              image does not have, and it warned on every page load. */}
          <Image
            src="/logo-horizontal-color.png"
            alt="Club Vertikal"
            width={2654}
            height={653}
            className="mb-11 h-auto w-[190px]"
            priority
          />
          {children}
        </main>
        <HelpFooter subject="Duda sobre un curso" />
      </div>
    </div>
  );
}
