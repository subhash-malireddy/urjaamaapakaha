import { render, screen } from "@testing-library/react";
import { MobileNav } from "@/components/custom/nav/mobile-nav-bottom";

// Mock NavLinks component
jest.mock("@/components/custom/nav/nav-links", () => ({
  NavLinks: jest.fn(({ isAdmin, itemClassName, showIcons, iconClassName }) => (
    <div
      data-testid="nav-links-mock"
      data-is-admin={isAdmin}
      data-item-class-name={itemClassName}
      data-show-icons={showIcons}
      data-icon-class-name={iconClassName}
    >
      NavLinks Component
    </div>
  )),
}));

describe("MobileNav", () => {
  it("renders correctly", () => {
    render(<MobileNav isAdmin={false} />);

    // Check if the component renders
    const navElement = screen.getByTestId("nav-links-mock");
    expect(navElement).toBeInTheDocument();
  });

  it("passes correct props to NavLinks when not admin", () => {
    render(<MobileNav isAdmin={false} />);

    const navElement = screen.getByTestId("nav-links-mock");
    expect(navElement).toHaveAttribute("data-is-admin", "false");
    expect(navElement).toHaveAttribute(
      "data-item-class-name",
      "flex h-full w-full flex-col items-center justify-center gap-0 text-xs",
    );
    expect(navElement).toHaveAttribute("data-show-icons", "true");
    expect(navElement).toHaveAttribute(
      "data-icon-class-name",
      "mb-0.5 h-5 w-5",
    );
  });

  it("passes correct props to NavLinks when admin", () => {
    render(<MobileNav isAdmin={true} />);

    const navElement = screen.getByTestId("nav-links-mock");
    expect(navElement).toHaveAttribute("data-is-admin", "true");
  });

  it("has correct styling for mobile view", () => {
    const { container } = render(<MobileNav isAdmin={false} />);

    // Check if the component has the correct styling classes
    const navContainer = container.firstChild;
    expect(navContainer).toHaveClass(
      "bg-background fixed right-0 bottom-0 left-0 z-50 border-t md:hidden",
    );

    const innerContainer = navContainer?.firstChild;
    expect(innerContainer).toHaveClass("flex h-14 items-center justify-around");
  });
});
