import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../../../../src/components/custom/nav/floating-theme-toggle";

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn().mockImplementation(() => {
      console.log("setTheme called");
    }),
  }),
}));

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

  it("toggles theme when clicked", () => {
    const { getByLabelText } = render(<ThemeToggle />);
    const mockConsoleLog = jest.fn();
    jest.spyOn(console, "log").mockImplementation(mockConsoleLog);

    const button = getByLabelText("Toggle theme");
    fireEvent.click(button);

    //* since we are mocking the setTheme function to console.log, we can check if the console.log is called.
    expect(mockConsoleLog).toHaveBeenCalledWith("setTheme called");
  });
});
