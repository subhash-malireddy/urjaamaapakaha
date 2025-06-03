import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsageChart from "@/components/custom/usage/usage-chart";
import { type UsageChartProps } from "@/components/custom/usage/usage-chart";

describe("UsageChart", () => {
  const defaultProps: UsageChartProps = {
    data: undefined,
    timePeriod: "current week",
    isFetchingData: false,
    totalUserConsumption: 50,
    totalOverallConsumption: 100,
    isDataAvailable: true,
  };

  describe("Basic Rendering", () => {
    it("renders card with correct title", () => {
      render(<UsageChart {...defaultProps} />);

      expect(
        screen.getByText("Power Consumption Overview"),
      ).toBeInTheDocument();
    });

    it("shows description with time period", () => {
      render(<UsageChart {...defaultProps} />);

      expect(
        screen.getByText("Showing consumption data for current week"),
      ).toBeInTheDocument();
    });

    it("renders all three chart type selector buttons with proper labels", () => {
      render(<UsageChart {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Line chart" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Bar chart" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Area chart" }),
      ).toBeInTheDocument();
    });
  });

  describe("Chart Type Selection", () => {
    it("has bar chart as default selection", () => {
      render(<UsageChart {...defaultProps} />);

      const barButton = screen.getByRole("button", { name: "Bar chart" });
      const lineButton = screen.getByRole("button", { name: "Line chart" });
      const areaButton = screen.getByRole("button", { name: "Area chart" });

      expect(barButton).toHaveAttribute("aria-pressed", "true");
      expect(lineButton).toHaveAttribute("aria-pressed", "false");
      expect(areaButton).toHaveAttribute("aria-pressed", "false");
    });

    it("renders correct chart when chart type button is clicked", async () => {
      const user = userEvent.setup();
      render(<UsageChart {...defaultProps} />);

      const lineButton = screen.getByRole("button", { name: "Line chart" });
      const barButton = screen.getByRole("button", { name: "Bar chart" });
      const areaButton = screen.getByRole("button", { name: "Area chart" });

      await user.click(lineButton);

      expect(lineButton).toHaveAttribute("aria-pressed", "true");
      expect(barButton).toHaveAttribute("aria-pressed", "false");
      expect(areaButton).toHaveAttribute("aria-pressed", "false");

      await user.click(barButton);

      expect(lineButton).toHaveAttribute("aria-pressed", "false");
      expect(barButton).toHaveAttribute("aria-pressed", "true");
      expect(areaButton).toHaveAttribute("aria-pressed", "false");

      await user.click(areaButton);

      expect(lineButton).toHaveAttribute("aria-pressed", "false");
      expect(barButton).toHaveAttribute("aria-pressed", "false");
      expect(areaButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Loading States", () => {
    it("shows loading message when isFetchingData is true", () => {
      const props = {
        ...defaultProps,
        isFetchingData: true,
      };

      render(<UsageChart {...props} />);

      expect(screen.getByText("Loading chart...")).toBeInTheDocument();
    });

    it("shows loading message when isDataAvailable is false; because it's the intial render", () => {
      const props = {
        ...defaultProps,
        isDataAvailable: false,
      };

      render(<UsageChart {...props} />);

      expect(screen.getByText("Loading chart...")).toBeInTheDocument();
    });

    it("disables chart type buttons when loading", () => {
      const props = {
        ...defaultProps,
        isFetchingData: true,
      };

      render(<UsageChart {...props} />);

      expect(screen.getByRole("button", { name: "Line chart" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Bar chart" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Area chart" })).toBeDisabled();
    });

    it("shows loading placeholders in footer when loading", () => {
      const props = {
        ...defaultProps,
        isFetchingData: true,
      };

      render(<UsageChart {...props} />);

      // Check for loading placeholders by looking for elements with animate-pulse class
      expect(screen.getByTestId("user-percentage-loading")).toBeInTheDocument();
      expect(
        screen.getByTestId("user-consumption-loading"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("total-consumption-loading"),
      ).toBeInTheDocument();
    });

    it("shows actual values in footer when not loading", () => {
      render(<UsageChart {...defaultProps} />);

      expect(
        screen.getByText(/Your usage represents 50\.0% of total consumption/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/50\.00 kWh of 100\.00 kWh total/),
      ).toBeInTheDocument();
    });
  });
});
