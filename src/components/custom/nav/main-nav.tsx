import { ThemeToggle } from "@/components/custom/nav/theme-toggle";
import { ProfileMenu } from "@/components/custom/nav/profile-menu";
import { NavLinks } from "@/components/custom/nav/nav-links";
import { Logo } from "@/components/custom/nav/logo";
import { MobileNav } from "./mobile-nav-menu";

export function MainNav() {
  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          <NavLinks itemClassName="px-3 py-2" />
          <ThemeToggle />
          <ProfileMenu />
        </nav>
        {/* Mobile Navigation */}
        <nav className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <ProfileMenu />
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}
