import { NavLinks } from "@/components/custom/nav/nav-links";
import { Logo } from "@/components/custom/nav/logo";
import { UserProfile } from "@/components/custom/nav/user-profile";
import { MobileNav } from "@/components/custom/nav/mobile-nav-bottom";
import { ThemeToggle } from "@/components/custom/nav/floating-theme-toggle";

export function MainNav() {
  return (
    <>
      <header className="bg-background sticky top-0 z-50 w-full border-b">
        <div className="flex h-14 items-center justify-between px-3 md:h-16 md:px-4">
          {/* Logo */}
          <Logo />

          {/* Navigation and Profile */}
          <nav className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden items-center space-x-6 md:flex">
              <NavLinks itemClassName="px-3 py-2" />
            </div>
            <UserProfile isLoggedIn />
          </nav>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <MobileNav />

      {/* Theme Toggle */}
      <ThemeToggle />
    </>
  );
}
