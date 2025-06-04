import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TimePeriodSelector from "@/components/custom/usage/time-period-selector";

describe("TimePeriodSelector", () => {
  const mockOnSelect = jest.fn();

  const originalHasPointerCapture =
    window.HTMLElement.prototype.hasPointerCapture;
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
  const originalReleasePointerCapture =
    window.HTMLElement.prototype.releasePointerCapture;

  beforeEach(() => {
    jest.clearAllMocks();
    window.HTMLElement.prototype.hasPointerCapture = jest
      .fn()
      .mockImplementation((_pointerId: any) => true);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    window.HTMLElement.prototype.releasePointerCapture = jest.fn();
  });

  afterEach(() => {
    window.HTMLElement.prototype.hasPointerCapture = originalHasPointerCapture;
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    window.HTMLElement.prototype.releasePointerCapture =
      originalReleasePointerCapture;
  });

  describe("Rendering", () => {
    it("renders with default selected value", () => {
      // Arrange & Act
      render(
        <TimePeriodSelector
          onSelect={mockOnSelect}
          selectedValue="current week"
        />,
      );

      // Assert
      expect(screen.getByText("current week")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders with custom selected value", () => {
      // Arrange & Act
      render(
        <TimePeriodSelector
          onSelect={mockOnSelect}
          selectedValue="current month"
        />,
      );

      // Assert
      expect(screen.getByText("current month")).toBeInTheDocument();
    });

    it("renders with accessibility attributes", () => {
      // Arrange & Act
      render(
        <TimePeriodSelector
          onSelect={mockOnSelect}
          selectedValue="current week"
        />,
      );

      // Assert
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute(
        "aria-label",
        "Select time period for usage data",
      );
      expect(trigger).toHaveAttribute(
        "aria-describedby",
        "time-period-description",
      );

      const description = screen.getByText(
        "Choose a time period to filter your usage statistics",
      );
      expect(description).toHaveClass("sr-only");
      expect(description).toHaveAttribute("id", "time-period-description");
    });
  });

  describe("User Interaction", () => {
    it("does not call onSelect when user selects current week because it is the default value", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <TimePeriodSelector
          onSelect={mockOnSelect}
          selectedValue="current week"
        />,
      );

      // Act
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const currentWeekOption = screen.getByText("Current Week");
      await user.click(currentWeekOption);

      // Assert
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it("calls onSelect when user selects current month", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <TimePeriodSelector
          onSelect={mockOnSelect}
          selectedValue="current week"
        />,
      );

      // Act
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const currentMonthOption = screen.getByText("Current Month");
      await user.click(currentMonthOption);

      // Assert
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith("current month");
    });

    it("calls onSelect when user selects current billing period", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <TimePeriodSelector
          onSelect={mockOnSelect}
          selectedValue="current week"
        />,
      );

      // Act
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const currentBillingOption = screen.getByText("Current Billing Period");
      await user.click(currentBillingOption);

      // Assert
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith("current billing period");
    });

    it("displays all available options when opened", async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <TimePeriodSelector
          onSelect={mockOnSelect}
          selectedValue="current week"
        />,
      );

      // Act
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      // Assert
      expect(screen.getByText("Current Week")).toBeInTheDocument();
      expect(screen.getByText("Current Month")).toBeInTheDocument();
      expect(screen.getByText("Current Billing Period")).toBeInTheDocument();
    });
  });
});
