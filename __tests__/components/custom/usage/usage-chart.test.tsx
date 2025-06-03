import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsageChart from "@/components/custom/usage/usage-chart";
import { type UsageChartProps } from "@/components/custom/usage/usage-chart";

// Mock recharts components
jest.mock("recharts", () => ({
  ...jest.requireActual("recharts"),
  AreaChart: ({ children, ...props }: any) => (
    <div data-testid="area-chart" {...props}>
      {children}
    </div>
  ),
  BarChart: ({ children, ...props }: any) => (
    <div data-testid="bar-chart" {...props}>
      {children}
    </div>
  ),
  LineChart: ({ children, ...props }: any) => (
    <div data-testid="line-chart" {...props}>
      {children}
    </div>
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
}));

// Mock ChartContainer from UI library
jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children, ...props }: any) => (
    <div data-testid="chart-container" {...props}>
      {children}
    </div>
  ),
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content" />,
  ChartLegend: () => <div data-testid="chart-legend" />,
  ChartLegendContent: () => <div data-testid="chart-legend-content" />,
}));

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

  describe("Data Display Behavior", () => {
    it("shows no data message when data is undefined", () => {
      render(<UsageChart {...defaultProps} />);

      expect(screen.getByText("No data to display")).toBeInTheDocument();
    });

    it("shows no data message when data arrays are empty", () => {
      const props = {
        ...defaultProps,
        data: {
          userConsumption: [],
          totalConsumption: [],
        },
      };

      render(<UsageChart {...props} />);

      expect(screen.getByText("No data to display")).toBeInTheDocument();
    });

    it("renders chart when valid data is provided", async () => {
      const user = userEvent.setup();
      const validData = {
        userConsumption: [
          { date: new Date("2024-01-01"), consumption: 10 },
          { date: new Date("2024-01-02"), consumption: 15 },
        ],
        totalConsumption: [
          { date: new Date("2024-01-01"), consumption: 20 },
          { date: new Date("2024-01-02"), consumption: 30 },
        ],
      };

      const props = {
        ...defaultProps,
        data: validData,
      };

      render(<UsageChart {...props} />);

      // Should render chart with default type (bar)
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      expect(screen.queryByText("No data to display")).not.toBeInTheDocument();

      // Test that chart type changes work with data
      await user.click(screen.getByRole("button", { name: "Line chart" }));
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Area chart" }));
      expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    });

    it("handles data with only user consumption", () => {
      const partialData = {
        userConsumption: [{ date: new Date("2024-01-01"), consumption: 10 }],
        totalConsumption: [],
      };

      const props = {
        ...defaultProps,
        data: partialData,
      };

      render(<UsageChart {...props} />);

      // Should render chart even with partial data
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("handles data with only total consumption", () => {
      const partialData = {
        userConsumption: [],
        totalConsumption: [{ date: new Date("2024-01-01"), consumption: 20 }],
      };

      const props = {
        ...defaultProps,
        data: partialData,
      };

      render(<UsageChart {...props} />);

      // Should render chart even with partial data
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  describe("Footer Information", () => {
    it("displays correct user percentage calculation", () => {
      const props = {
        ...defaultProps,
        totalUserConsumption: 25,
        totalOverallConsumption: 100,
      };

      render(<UsageChart {...props} />);

      expect(
        screen.getByText(/Your usage represents 25\.0% of total consumption/),
      ).toBeInTheDocument();
    });

    it("displays consumption totals in correct format", () => {
      const props = {
        ...defaultProps,
        totalUserConsumption: 12.345,
        totalOverallConsumption: 67.89,
      };

      render(<UsageChart {...props} />);

      expect(
        screen.getByText(/12\.35 kWh of 67\.89 kWh total/),
      ).toBeInTheDocument();
    });
  });
});
