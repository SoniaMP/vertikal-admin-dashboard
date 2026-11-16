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
      <main className="mx-auto w-full max-w-[920px] flex-1 px-5 py-10">
        <Image
          src="/logo-horizontal-color.png"
          alt="Club Vertikal"
          width={190}
          height={38}
          className="mb-11"
          priority
        />
        {children}
      </main>
      <HelpFooter subject="Duda sobre un curso" />
    </div>
  );
}
