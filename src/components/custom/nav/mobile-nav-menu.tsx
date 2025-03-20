"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/custom/nav/nav-links";
import { cn } from "@/lib/utils";

export function MobileNav() {
  // Initialize state from localStorage if available
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  //TODO: see if we need to keep the menu open when the page is refreshed
  //   // Load menu state from localStorage on component mount
  //   useEffect(() => {
  //     const storedMenuState = localStorage.getItem("mobileMenuOpen");
  //     if (storedMenuState) {
  //       setIsMenuOpen(storedMenuState === "true");
  //     }
  //   }, []);

  //   // Save menu state to localStorage whenever it changes
  //   useEffect(() => {
  //     localStorage.setItem("mobileMenuOpen", isMenuOpen.toString());
  //   }, [isMenuOpen]);

  // Reset menu state when viewport changes to desktop size
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)"); // md breakpoint

    // Initial check
    if (mediaQuery.matches && isMenuOpen) {
      setIsMenuOpen(false);
    }

    // Add listener for viewport changes
    const handleViewportChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        // Viewport changed to desktop
        setIsMenuOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      // If the click is inside the menu or on the toggle button, don't close
      if (
        menuRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      ) {
        return;
      }

      setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="md:hidden">
      {/* Mobile Menu Toggle */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-label="Toggle menu"
        className={`text-accent-foreground cursor-pointer ${
          isMenuOpen && "bg-accent"
        }`}
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Expandable Mobile Menu */}
      <div
        ref={menuRef}
        className={cn(
          "bg-accent/70 absolute top-16 right-0 left-0 overflow-hidden border-b transition-all duration-300 ease-in-out",
          isMenuOpen
            ? "max-h-40 opacity-100"
            : "max-h-0 border-transparent opacity-0",
        )}
      >
        <div className="px-4 py-2">
          <nav className="flex w-full flex-col items-end space-y-2">
            <NavLinks
              className=""
              itemClassName="py-3 text-base font-medium pr-[12px] rounded-md transition-colors"
              isMobile={true}
              onClick={toggleMenu}
            />
          </nav>
        </div>
      </div>
    </div>
  );
}
