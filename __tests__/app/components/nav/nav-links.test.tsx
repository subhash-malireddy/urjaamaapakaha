import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NavLinks } from "@/components/custom/nav/nav-links";

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ href, children, className }: any) => {
      return (
        <a href={href} className={className}>
          {children}
        </a>
      );
    },
  };
});

import { usePathname } from "next/navigation";

describe("NavLinks", () => {
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
  });

  it("renders home and usage links for non-admin users", () => {
    render(<NavLinks isAdmin={false} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Usage")).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("renders admin link for admin users", () => {
    render(<NavLinks isAdmin={true} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Usage")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("applies active class to the current path", () => {
    mockUsePathname.mockReturnValue("/usage");

    render(<NavLinks isAdmin={false} />);

    const homeLink = screen.getByText("Home").closest("a");
    const usageLink = screen.getByText("Usage").closest("a");

    expect(homeLink).toHaveClass("text-muted-foreground");
    expect(usageLink).toHaveClass("text-primary");
  });

  it("renders icons when showIcons is true", () => {
    render(<NavLinks isAdmin={false} showIcons={true} />);

    // Find SVG elements (icons)
    const icons = document.querySelectorAll("svg");
    expect(icons.length).toBe(2); // Home and Usage icons
  });

  it("doesn't render icons when showIcons is false", () => {
    render(<NavLinks isAdmin={false} showIcons={false} />);

    // Should not find any SVG elements
    const icons = document.querySelectorAll("svg");
    expect(icons.length).toBe(0);
  });

  it("applies custom className to items", () => {
    render(<NavLinks isAdmin={false} itemClassName="custom-class" />);

    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveClass("custom-class");
    });
  });

  it("applies custom className to icons", () => {
    render(
      <NavLinks
        isAdmin={false}
        showIcons={true}
        iconClassName="custom-icon-class"
      />,
    );

    const icons = document.querySelectorAll("svg");
    icons.forEach((icon) => {
      expect(icon).toHaveClass("custom-icon-class");
    });
  });
});
