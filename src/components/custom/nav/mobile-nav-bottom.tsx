"use client";

import { Home, LineChartIcon as ChartLine, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Usage",
      href: "/usage",
      icon: ChartLine,
    },
    {
      name: "Admin",
      href: "/admin",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-background fixed right-0 bottom-0 left-0 z-50 border-t md:hidden">
      <div className="flex h-14 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center",
                "transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <item.icon className="mb-0.5 h-5 w-5" />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
