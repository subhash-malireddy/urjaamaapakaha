"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, LineChartIcon as ChartLine, ShieldCheck } from "lucide-react";

type NavLinksProps = IconProps & {
  itemClassName?: string;
  isAdmin: boolean;
};

type IconProps =
  | {
      showIcons?: false;
    }
  | {
      showIcons: true;
      iconClassName?: string;
    };

export function NavLinks({
  isAdmin,
  itemClassName = "",
  ...restProps
}: NavLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/usage", label: "Usage", icon: ChartLine },
    ...(isAdmin
      ? [{ href: "/admin", label: "Admin", icon: ShieldCheck } as const]
      : []),
  ] as const;

  const showIcons = restProps.showIcons;

  const iconClassName = showIcons === true ? restProps.iconClassName : "";

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "group relative inline-flex items-center transition-colors md:gap-2 md:text-sm md:font-medium",
              "hover:text-primary text-muted-foreground",
              isActive && "text-primary",
              itemClassName,
            )}
          >
            {showIcons && (
              <link.icon className={cn("h-4 w-4", iconClassName)} />
            )}
            <span className="relative">
              {link.label}
              <span
                className={cn(
                  "hidden md:block",
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
