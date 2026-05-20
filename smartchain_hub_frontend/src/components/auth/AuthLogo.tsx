import Image from "next/image";
import Link from "next/link";

interface AuthLogoProps {
  size?: "sm" | "md" | "lg";
}

export function AuthLogo({ size = "md" }: AuthLogoProps) {
  const heights: Record<string, number> = { sm: 36, md: 44, lg: 56 };
  const h = heights[size];
  const w = Math.round(h * 3.5);

  return (
    <Link href="/" className="inline-flex items-center justify-center">
      <Image
        src="/logo-full.png"
        alt="SmartChain Hub"
        width={w}
        height={h}
        className="object-contain"
        priority
      />
    </Link>
  );
}
