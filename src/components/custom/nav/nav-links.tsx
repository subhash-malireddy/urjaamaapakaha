"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  className?: string;
  itemClassName?: string;
  isMobile?: boolean;
  onClick?: () => void;
}

export function NavLinks({
  itemClassName = "",
  isMobile = false,
  onClick,
}: NavLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: "/about", label: "About" },
    { href: "/usage", label: "Usage" },
  ];

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "group relative inline-block text-sm font-medium transition-colors",
              "hover:text-primary text-muted-foreground",
              isActive && "text-primary",
              // Mobile specific styles
              isMobile && "hover:bg-accent/30 block w-full text-right",
              isMobile && isActive && "bg-accent/80",
              itemClassName,
            )}
            onClick={onClick}
          >
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
