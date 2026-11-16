import Image from "next/image";
import { HelpFooter } from "@/components/contact/help-footer";

export default function RegistroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-flow flex min-h-svh flex-col">
      <main className="public-shell flex-1 py-10">
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
      <HelpFooter subject="Duda sobre el registro de socio" />
    </div>
  );
}
