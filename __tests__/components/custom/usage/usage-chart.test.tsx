import { render, screen } from "@testing-library/react";
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
});
