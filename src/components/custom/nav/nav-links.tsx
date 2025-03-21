"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, LineChartIcon as ChartLine, ShieldCheck } from "lucide-react";

interface NavLinksProps {
  itemClassName?: string;
  showIcons?: boolean;
  onClick?: () => void;
}

export function NavLinks({
  itemClassName = "",
  showIcons = false,
  onClick,
}: NavLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/usage", label: "Usage", icon: ChartLine },
    { href: "/admin", label: "Admin", icon: ShieldCheck },
  ] as const;

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "group relative inline-flex items-center gap-2 text-sm font-medium transition-colors",
              "hover:text-primary text-muted-foreground",
              isActive && "text-primary",
              itemClassName,
            )}
            onClick={onClick}
          >
            {showIcons && <link.icon className="h-4 w-4" />}
            <span className="relative">
              {link.label}
              <span
                className={cn(
                  "bg-primary absolute bottom-0 left-1/2 h-[2px] transition-all duration-300",
                  "-translate-x-1/2 transform",
                  isActive ? "w-full" : "w-0 group-hover:w-full",
                )}
              />
            </span>
          </Link>
        );
      })}
    </>
  );
}
