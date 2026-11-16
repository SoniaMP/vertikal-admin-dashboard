import Image from "next/image";
import { HelpFooter } from "@/components/contact/help-footer";

export default function RegistroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <Image
          src="/logo-horizontal-color.png"
          alt="Club Vertikal"
          width={200}
          height={40}
          className="mx-auto mb-4"
          priority
        />
      </div>
      {children}
      <HelpFooter subject="Duda sobre el registro de socio" />
    </div>
  );
}
