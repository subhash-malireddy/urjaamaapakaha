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

  describe.only("Chart Type Selection", () => {
    it("has bar chart as default selection", () => {
      render(<UsageChart {...defaultProps} />);

      const barButton = screen.getByRole("button", { name: "Bar chart" });
      const lineButton = screen.getByRole("button", { name: "Line chart" });
      const areaButton = screen.getByRole("button", { name: "Area chart" });

      expect(barButton).toHaveAttribute("aria-pressed", "true");
      expect(lineButton).toHaveAttribute("aria-pressed", "false");
      expect(areaButton).toHaveAttribute("aria-pressed", "false");
    });

    it("changes to line chart when line button is clicked", async () => {
      const user = userEvent.setup();
      render(<UsageChart {...defaultProps} />);

      const lineButton = screen.getByRole("button", { name: "Line chart" });
      const barButton = screen.getByRole("button", { name: "Bar chart" });

      await user.click(lineButton);

      expect(lineButton).toHaveAttribute("aria-pressed", "true");
      expect(barButton).toHaveAttribute("aria-pressed", "false");
    });

    it("changes to area chart when area button is clicked", async () => {
      const user = userEvent.setup();
      render(<UsageChart {...defaultProps} />);

      const areaButton = screen.getByRole("button", { name: "Area chart" });
      const barButton = screen.getByRole("button", { name: "Bar chart" });

      await user.click(areaButton);

      expect(areaButton).toHaveAttribute("aria-pressed", "true");
      expect(barButton).toHaveAttribute("aria-pressed", "false");
    });
  });
});
