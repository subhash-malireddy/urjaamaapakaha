import { render, screen, waitFor } from "@testing-library/react";
import ChartWithFilters from "@/components/custom/usage/chart-with-filters";
import { type DeviceSelectionList } from "@/lib/zod/usage";
import { getUsageDataAction } from "@/lib/actions/usage-actions";
import { getDateRangeForTimePeriod } from "@/lib/usage-utils";

// Create prop capture variables
let capturedFiltersFormProps: any = {};
let capturedUsageSummaryProps: any = {};
let capturedUsageChartProps: any = {};

// Mock child components
jest.mock("@/components/custom/usage/filters-form", () => {
  return function MockFiltersForm(props: any) {
    capturedFiltersFormProps = props;
    return <div data-testid="filters-form">FiltersForm Mock</div>;
  };
});

jest.mock("@/components/custom/usage/usage-summary", () => {
  return function MockUsageSummary(props: any) {
    capturedUsageSummaryProps = props;
    return <div data-testid="usage-summary">UsageSummary Mock</div>;
  };
});

jest.mock("@/components/custom/usage/usage-chart", () => {
  return function MockUsageChart(props: any) {
    capturedUsageChartProps = props;
    return <div data-testid="usage-chart">UsageChart Mock</div>;
  };
});

// Mock external functions
jest.mock("@/lib/actions/usage-actions", () => ({
  getUsageDataAction: jest.fn(),
}));

jest.mock("@/lib/usage-utils", () => ({
  getDateRangeForTimePeriod: jest.fn(),
}));

const mockGetUsageDataAction = getUsageDataAction as jest.MockedFunction<
  typeof getUsageDataAction
>;
const mockGetDateRangeForTimePeriod =
  getDateRangeForTimePeriod as jest.MockedFunction<
    typeof getDateRangeForTimePeriod
  >;

describe("ChartWithFilters", () => {
  const mockDevices: DeviceSelectionList = [
    { id: "device-1", alias: "Kitchen Light" },
    { id: "device-2", alias: "Living Room TV" },
  ];

  const mockDateRange = {
    start: new Date("2024-01-01"),
    end: new Date("2024-01-07"),
    formatted: {
      start: "January 1, 2024",
      end: "January 7, 2024",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear prop captures
    capturedFiltersFormProps = {};
    capturedUsageSummaryProps = {};
    capturedUsageChartProps = {};

    // Default mock implementations
    mockGetDateRangeForTimePeriod.mockReturnValue(mockDateRange);
    mockGetUsageDataAction.mockResolvedValue({
      message: "Success",
      data: {
        userConsumption: [{ date: new Date("2024-01-01"), consumption: 10 }],
        totalConsumption: [{ date: new Date("2024-01-01"), consumption: 20 }],
      },
    });
  });

  describe("Initial Rendering & Default State", () => {
    it("renders all child components", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      expect(screen.getByTestId("filters-form")).toBeInTheDocument();
      expect(screen.getByTestId("usage-summary")).toBeInTheDocument();
      expect(screen.getByTestId("usage-chart")).toBeInTheDocument();

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });
    });

    it("shows correct initial date range description", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      expect(screen.getByText(/Showing usage for/)).toBeInTheDocument();
      expect(screen.getByText(/All Devices/)).toBeInTheDocument();
      expect(screen.getByText(/January 1, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/January 7, 2024/)).toBeInTheDocument();

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });
    });

    it("calls getDateRangeForTimePeriod with default time period", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      expect(mockGetDateRangeForTimePeriod).toHaveBeenCalledWith(
        "current week",
      );

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });
    });

    it("passes correct default props to FiltersForm", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      expect(capturedFiltersFormProps.devices).toEqual(mockDevices);
      expect(capturedFiltersFormProps.selectedDeviceValue).toBe("All");
      expect(capturedFiltersFormProps.selectedDeviceAlias).toBe("All");
      expect(capturedFiltersFormProps.selectedTimePeriod).toBe("current week");
      expect(typeof capturedFiltersFormProps.handleDeviceSelect).toBe(
        "function",
      );
      expect(typeof capturedFiltersFormProps.handleTimePeriodSelect).toBe(
        "function",
      );

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });
    });

    it("passes correct initial props to UsageSummary", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      expect(capturedUsageSummaryProps.userConsumption).toBe(0); // Initial calculation with null data
      expect(capturedUsageSummaryProps.totalConsumption).toBe(0); // Initial calculation with null data
      expect(capturedUsageSummaryProps.timePeriod).toBe("current week");
      expect(capturedUsageSummaryProps.isFetchingData).toBe(true); // Should be pending initially
      expect(capturedUsageSummaryProps.isDataAvailable).toBe(false); // usageData is null initially
      expect(capturedUsageSummaryProps.selectedDeviceAlias).toBe("All");

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });
    });

    it("passes correct initial props to UsageChart", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      expect(capturedUsageChartProps.isDataAvailable).toBe(false); // usageData is null initially
      expect(capturedUsageChartProps.data).toBeUndefined(); // usageData?.data is undefined initially
      expect(capturedUsageChartProps.timePeriod).toBe("current week");
      expect(capturedUsageChartProps.isFetchingData).toBe(true); // Should be pending initially
      expect(capturedUsageChartProps.totalUserConsumption).toBe(0); // Initial calculation
      expect(capturedUsageChartProps.totalOverallConsumption).toBe(0); // Initial calculation

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });
    });

    it("triggers data fetch on initial render", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalledWith(
          "current week",
          mockDateRange,
          undefined, // deviceId is null initially
        );
      });
    });
  });
});
