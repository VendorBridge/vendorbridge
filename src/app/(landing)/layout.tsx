import { Inter, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "../globals.css";
import "./landing.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`landing-page dark ${inter.variable} ${jakarta.variable} ${spaceGrotesk.variable}`}
    >
      {children}
    </div>
  );
}
