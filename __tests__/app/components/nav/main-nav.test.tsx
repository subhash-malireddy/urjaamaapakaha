import { render, screen } from "@testing-library/react";
import { MainNav } from "@/components/custom/nav/main-nav";
import { ROLES_OBJ } from "@/lib/roles";

// Mock the child components
jest.mock("@/components/custom/nav/nav-links", () => ({
  NavLinks: jest.fn(({ isAdmin, itemClassName }) => (
    <div
      data-testid="nav-links-mock"
      data-is-admin={isAdmin}
      data-item-class-name={itemClassName}
    >
      NavLinks Component
    </div>
  )),
}));

jest.mock("@/components/custom/nav/logo", () => ({
  Logo: jest.fn(() => <div data-testid="logo-mock">Logo Component</div>),
}));

jest.mock("@/components/custom/nav/user-profile", () => ({
  UserProfile: jest.fn(({ user }) => (
    <div data-testid="user-profile-mock" data-user={JSON.stringify(user)}>
      UserProfile Component
    </div>
  )),
}));

jest.mock("@/components/custom/nav/mobile-nav-bottom", () => ({
  MobileNav: jest.fn(({ isAdmin }) => (
    <div data-testid="mobile-nav-mock" data-is-admin={isAdmin}>
      MobileNav Component
    </div>
  )),
}));

jest.mock("@/components/custom/nav/floating-theme-toggle", () => ({
  ThemeToggle: jest.fn(() => (
    <div data-testid="theme-toggle-mock">ThemeToggle Component</div>
  )),
}));

describe("MainNav", () => {
  const mockSession = {
    user: {
      name: "Test User",
      email: "test@example.com",
      image: "/user.png",
      role: ROLES_OBJ.MEMBER,
    },
    expires: "2023-01-01",
  };

  const mockAdminSession = {
    user: {
      name: "Admin User",
      email: "admin@example.com",
      image: "/admin.png",
      role: ROLES_OBJ.ADMIN,
    },
    expires: "2023-01-01",
  };

  it("renders all child components correctly", () => {
    render(<MainNav session={mockSession} />);

    // Check if all child components are rendered
    expect(screen.getByTestId("logo-mock")).toBeInTheDocument();
    expect(screen.getByTestId("nav-links-mock")).toBeInTheDocument();
    expect(screen.getByTestId("user-profile-mock")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-nav-mock")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle-mock")).toBeInTheDocument();
  });

  it("passes correct user data to UserProfile component", () => {
    render(<MainNav session={mockSession} />);

    const userProfileMock = screen.getByTestId("user-profile-mock");
    expect(
      JSON.parse(userProfileMock.getAttribute("data-user") || "{}"),
    ).toEqual(mockSession.user);
  });

  it("passes correct isAdmin=false to NavLinks and MobileNav when user is not admin", () => {
    render(<MainNav session={mockSession} />);

    const navLinksMock = screen.getByTestId("nav-links-mock");
    const mobileNavMock = screen.getByTestId("mobile-nav-mock");

    expect(navLinksMock).toHaveAttribute("data-is-admin", "false");
    expect(mobileNavMock).toHaveAttribute("data-is-admin", "false");
  });

  it("passes correct isAdmin=true to NavLinks and MobileNav when user is admin", () => {
    render(<MainNav session={mockAdminSession} />);

    const navLinksMock = screen.getByTestId("nav-links-mock");
    const mobileNavMock = screen.getByTestId("mobile-nav-mock");

    expect(navLinksMock).toHaveAttribute("data-is-admin", "true");
    expect(mobileNavMock).toHaveAttribute("data-is-admin", "true");
  });

  it("handles null session correctly", () => {
    render(<MainNav session={null} />);

    // User should be undefined in this case
    const userProfileMock = screen.getByTestId("user-profile-mock");
    expect(userProfileMock.getAttribute("data-user")).toBe(null);

    // isAdmin should be false
    const navLinksMock = screen.getByTestId("nav-links-mock");
    const mobileNavMock = screen.getByTestId("mobile-nav-mock");

    expect(navLinksMock).toHaveAttribute("data-is-admin", "false");
    expect(mobileNavMock).toHaveAttribute("data-is-admin", "false");
  });

  it("has correct styling for header", () => {
    const { container } = render(<MainNav session={mockSession} />);

    // Check if the header has the right classes
    const header = container.querySelector("header");
    expect(header).toHaveClass(
      "bg-background sticky top-0 z-50 w-full border-b",
    );

    // Check inner container
    const headerInner = header?.querySelector("div");
    expect(headerInner).toHaveClass(
      "flex h-14 items-center justify-between px-3 md:h-16 md:px-4",
    );
  });

  it("shows NavLinks only in desktop view", () => {
    render(<MainNav session={mockSession} />);

    // Check the wrapper div has the right classes
    const navLinksWrapper = screen.getByTestId("nav-links-mock").parentElement;
    expect(navLinksWrapper).toHaveClass(
      "hidden items-center space-x-6 md:flex",
    );
  });
});
