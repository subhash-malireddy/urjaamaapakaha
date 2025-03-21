import { render, screen } from "@testing-library/react";
import { ThemeToggle } from "../../../../src/components/custom/nav/floating-theme-toggle";

describe("ThemeToggle", () => {
  it("renders the icons correctly", () => {
    render(
      <div className="light">
        <ThemeToggle />
      </div>,
    );

    const button = screen.getByLabelText("Toggle theme");
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();

    const sunIcon = button.querySelector(".lucide-sun");
    const moonIcon = button.querySelector(".lucide-moon");
    expect(sunIcon).toBeInTheDocument();
    expect(sunIcon?.classList.contains("scale-100")).toBe(true);
    expect(sunIcon?.classList.contains("dark:scale-0")).toBe(true);
    expect(moonIcon).toBeInTheDocument();
    expect(moonIcon?.classList.contains("scale-0")).toBe(true);
    expect(moonIcon?.classList.contains("dark:scale-100")).toBe(true);
  });

  it("has the correct accessibility attributes", () => {
    render(<ThemeToggle />);

    const button = screen.getByLabelText("Toggle theme");
    expect(button).toHaveAttribute("aria-label", "Toggle theme");
  });

  it("has the correct styling classes", () => {
    render(<ThemeToggle />);

    const button = screen.getByLabelText("Toggle theme");
    expect(button).toHaveClass(
      "fixed right-8 bottom-[4.5rem] z-50 rounded-full opacity-60",
    );
  });

  // Note: The actual theme toggle functionality is commented out in the component
  // When implemented, add tests for the toggle behavior
});
