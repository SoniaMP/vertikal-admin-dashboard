import type { Metadata } from "next";
import { Albert_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

// A geometric grotesque: round bowls, even colour, nothing decorative. One
// family carries the whole product; weight and size do the hierarchy.
// Albert Sans is a variable font, so `next/font/google` takes no weight
// list: asking for one makes the import fail to compile.
const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Every route inherits this unless it sets its own, so it has to be the club,
// not the admin panel: the public pages are the ones people actually land on.
export const metadata: Metadata = {
  title: "Club Vertikal",
  description:
    "Club de escalada y espeleología: altas de socio, renovaciones y cursos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables go on <html>, not <body>: `--font-sans` is declared
    // at :root, so a reference to a variable defined further down the tree
    // never resolves and the page silently falls back to the system face.
    <html
      lang="es"
      className={`${albertSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
