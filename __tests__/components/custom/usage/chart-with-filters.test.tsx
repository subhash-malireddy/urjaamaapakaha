import { act, render, screen, waitFor } from "@testing-library/react";
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

      //for the initial render, isDataAvailable should be null - signalling that there is no attempt to fetch data yet
      expect(capturedUsageChartProps.isDataAvailable).toBe(false);

      expect(mockGetUsageDataAction).toHaveBeenCalledWith(
        "current week",
        mockDateRange,
        undefined, // deviceId is null initially
      );

      //check for loading state before/while data fetch - should be true
      await waitFor(() => {
        expect(capturedUsageSummaryProps.isFetchingData).toBe(true);
      });

      //check for loading state after data fetch - should be false
      await waitFor(() => {
        expect(capturedUsageChartProps.isFetchingData).toBe(false);
      });
    });
  });

  describe("Device Selection Handling", () => {
    it("handles specific device selection correctly", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for initial render and data fetch
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });

      // Clear previous calls
      mockGetUsageDataAction.mockClear();

      // Simulate device selection
      const handleDeviceSelect = capturedFiltersFormProps.handleDeviceSelect;
      act(() => {
        handleDeviceSelect("device-1");
      });

      // Wait for state update and new data fetch to complete
      await waitFor(() => {
        expect(capturedFiltersFormProps.selectedDeviceValue).toBe("device-1");
      });

      expect(mockGetUsageDataAction).toHaveBeenCalledWith(
        "current week",
        mockDateRange,
        "device-1",
      );

      expect(capturedFiltersFormProps.selectedDeviceAlias).toBe(
        "Kitchen Light",
      );
      expect(screen.getByText(/Kitchen Light/)).toBeInTheDocument();
    });

    it("handles 'All' device selection correctly", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for initial render and data fetch
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });

      // First select a specific device
      const handleDeviceSelect = capturedFiltersFormProps.handleDeviceSelect;
      act(() => {
        handleDeviceSelect("device-1");
      });

      // Wait for first selection to complete
      await waitFor(() => {
        expect(capturedFiltersFormProps.selectedDeviceValue).toBe("device-1");
      });

      expect(mockGetUsageDataAction).toHaveBeenCalledWith(
        "current week",
        mockDateRange,
        "device-1",
      );

      // Clear previous calls
      mockGetUsageDataAction.mockClear();

      // Now select "All"
      act(() => {
        handleDeviceSelect("All");
      });

      // Wait for "All" selection to complete
      await waitFor(() => {
        expect(capturedFiltersFormProps.selectedDeviceValue).toBe("All");
      });

      expect(mockGetUsageDataAction).toHaveBeenCalledWith(
        "current week",
        mockDateRange,
        undefined,
      );

      expect(capturedFiltersFormProps.selectedDeviceAlias).toBe("All");
      expect(screen.getByText(/All Devices/)).toBeInTheDocument();
    });

    it("triggers data fetch when device is selected", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for initial render and data fetch
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalledWith(
          "current week",
          mockDateRange,
          undefined,
        );
      });

      // Clear previous calls
      mockGetUsageDataAction.mockClear();

      // Select a specific device
      const handleDeviceSelect = capturedFiltersFormProps.handleDeviceSelect;
      act(() => {
        handleDeviceSelect("device-1");
      });
      //check for loading state - should be true
      expect(capturedUsageSummaryProps.isFetchingData).toBe(true);

      // Wait for new data fetch to complete
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalledWith(
          "current week",
          mockDateRange,
          "device-1",
        );
      });
      //check for loading state - should be false
      expect(capturedUsageSummaryProps.isFetchingData).toBe(false);
    });

    it("updates child component props when device changes", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for initial render and data fetch
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });

      // Clear previous calls to isolate our test
      mockGetUsageDataAction.mockClear();

      // Select a specific device
      const handleDeviceSelect = capturedFiltersFormProps.handleDeviceSelect;
      act(() => {
        handleDeviceSelect("device-2");
      });

      // Wait for all updates to complete
      await waitFor(() => {
        expect(capturedFiltersFormProps.selectedDeviceAlias).toBe(
          "Living Room TV",
        );
      });

      expect(mockGetUsageDataAction).toHaveBeenCalledWith(
        "current week",
        mockDateRange,
        "device-2",
      );

      expect(capturedUsageSummaryProps.selectedDeviceAlias).toBe(
        "Living Room TV",
      );
    });

    it("handles device not found in devices list", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for initial render and data fetch
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });

      // Clear previous calls
      mockGetUsageDataAction.mockClear();

      // Select a device that doesn't exist
      const handleDeviceSelect = capturedFiltersFormProps.handleDeviceSelect;
      act(() => {
        handleDeviceSelect("non-existent-device");
      });

      // Wait for state update to complete
      await waitFor(() => {
        expect(capturedFiltersFormProps.selectedDeviceValue).toBe(
          "non-existent-device",
        );
      });

      expect(mockGetUsageDataAction).toHaveBeenCalledWith(
        "current week",
        mockDateRange,
        "non-existent-device",
      );

      // Should default to "All" for alias when device not found
      expect(capturedFiltersFormProps.selectedDeviceAlias).toBe("All");
    });
  });

  describe("Time Period Selection Handling", () => {
    const mockNewDateRange = {
      start: new Date("2024-01-08"),
      end: new Date("2024-01-14"),
      formatted: {
        start: "January 8, 2024",
        end: "January 14, 2024",
      },
    };

    it("handles time period selection correctly", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for initial render
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });

      // Clear previous calls and setup new date range
      mockGetUsageDataAction.mockClear();
      mockGetDateRangeForTimePeriod.mockReturnValue(mockNewDateRange);

      // Simulate time period selection
      const handleTimePeriodSelect =
        capturedFiltersFormProps.handleTimePeriodSelect;
      act(() => {
        handleTimePeriodSelect("current month");
      });

      // Wait for state update
      await waitFor(() => {
        expect(capturedFiltersFormProps.selectedTimePeriod).toBe(
          "current month",
        );
      });

      expect(mockGetDateRangeForTimePeriod).toHaveBeenCalledWith(
        "current month",
      );
      expect(mockGetUsageDataAction).toHaveBeenCalledWith(
        "current month",
        mockNewDateRange,
        undefined,
      );
    });

    it("updates date range display when time period changes", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for initial render
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });

      // Setup new date range for time period change
      mockGetDateRangeForTimePeriod.mockReturnValue(mockNewDateRange);

      // Change time period
      const handleTimePeriodSelect =
        capturedFiltersFormProps.handleTimePeriodSelect;
      act(() => {
        handleTimePeriodSelect("current billing period");
      });

      // Wait for update and check new date range display
      await waitFor(() => {
        expect(screen.getByText(/January 8, 2024/)).toBeInTheDocument();
      });

      expect(screen.getByText(/January 14, 2024/)).toBeInTheDocument();
    });

    it("passes updated time period to child components", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for initial render
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });

      // Change time period
      const handleTimePeriodSelect =
        capturedFiltersFormProps.handleTimePeriodSelect;
      act(() => {
        handleTimePeriodSelect("current month");
      });

      // Wait for props to update
      await waitFor(() => {
        expect(capturedFiltersFormProps.selectedTimePeriod).toBe(
          "current month",
        );
      });

      expect(capturedUsageSummaryProps.timePeriod).toBe("current month");
      expect(capturedUsageChartProps.timePeriod).toBe("current month");
    });

    it("triggers data fetch with selected device when time period changes", async () => {
      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for initial render
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalled();
      });

      // First select a device
      const handleDeviceSelect = capturedFiltersFormProps.handleDeviceSelect;
      act(() => {
        handleDeviceSelect("device-1");
      });

      await waitFor(() => {
        expect(capturedFiltersFormProps.selectedDeviceValue).toBe("device-1");
      });

      // Clear calls and setup new date range
      mockGetUsageDataAction.mockClear();
      mockGetDateRangeForTimePeriod.mockReturnValue(mockNewDateRange);

      // Change time period
      const handleTimePeriodSelect =
        capturedFiltersFormProps.handleTimePeriodSelect;
      act(() => {
        handleTimePeriodSelect("current billing period");
      });

      // Should fetch with selected device and new time period
      await waitFor(() => {
        expect(mockGetUsageDataAction).toHaveBeenCalledWith(
          "current billing period",
          mockNewDateRange,
          "device-1",
        );
      });
    });
  });

  describe("Consumption Calculations", () => {
    it("calculates totals correctly when data is loaded", async () => {
      const mockUsageData = {
        message: "Success",
        data: {
          userConsumption: [
            { date: new Date("2024-01-01"), consumption: 15 },
            { date: new Date("2024-01-02"), consumption: 25 },
          ],
          totalConsumption: [
            { date: new Date("2024-01-01"), consumption: 50 },
            { date: new Date("2024-01-02"), consumption: 75 },
          ],
        },
      };

      mockGetUsageDataAction.mockResolvedValue(mockUsageData);

      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for data to load and check calculated totals
      await waitFor(() => {
        expect(capturedUsageSummaryProps.userConsumption).toBe(40); // 15 + 25
      });

      expect(capturedUsageSummaryProps.totalConsumption).toBe(125); // 50 + 75
      expect(capturedUsageChartProps.totalUserConsumption).toBe(40);
      expect(capturedUsageChartProps.totalOverallConsumption).toBe(125);
    });

    it("handles decimal consumption values correctly", async () => {
      const mockUsageData = {
        message: "Success",
        data: {
          userConsumption: [
            { date: new Date("2024-01-01"), consumption: 12.5 },
            { date: new Date("2024-01-02"), consumption: 7.3 },
          ],
          totalConsumption: [
            { date: new Date("2024-01-01"), consumption: 45.8 },
            { date: new Date("2024-01-02"), consumption: 32.2 },
          ],
        },
      };

      mockGetUsageDataAction.mockResolvedValue(mockUsageData);

      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for data to load and check calculated totals
      await waitFor(() => {
        expect(capturedUsageSummaryProps.userConsumption).toBe(19.8); // 12.5 + 7.3
      });

      expect(capturedUsageSummaryProps.totalConsumption).toBe(78); // 45.8 + 32.2
    });

    it("updates totals when data changes after device selection", async () => {
      // Initial data
      const initialData = {
        message: "Success",
        data: {
          userConsumption: [{ date: new Date("2024-01-01"), consumption: 10 }],
          totalConsumption: [{ date: new Date("2024-01-01"), consumption: 20 }],
        },
      };

      // New data after device selection
      const newData = {
        message: "Success",
        data: {
          userConsumption: [{ date: new Date("2024-01-01"), consumption: 30 }],
          totalConsumption: [{ date: new Date("2024-01-01"), consumption: 60 }],
        },
      };

      mockGetUsageDataAction
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(newData);

      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for initial data
      await waitFor(() => {
        expect(capturedUsageSummaryProps.userConsumption).toBe(10);
      });

      expect(capturedUsageSummaryProps.totalConsumption).toBe(20);

      // Select device to trigger new data fetch
      const handleDeviceSelect = capturedFiltersFormProps.handleDeviceSelect;
      act(() => {
        handleDeviceSelect("device-1");
      });

      // Wait for updated totals
      await waitFor(() => {
        expect(capturedUsageSummaryProps.userConsumption).toBe(30);
      });

      expect(capturedUsageSummaryProps.totalConsumption).toBe(60);
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined usageData gracefully", async () => {
      mockGetUsageDataAction.mockResolvedValue(undefined as any);

      render(<ChartWithFilters devices={mockDevices} />);

      // Should not crash and maintain zero totals
      await waitFor(() => {
        expect(capturedUsageSummaryProps.userConsumption).toBe(0);
      });
      expect(capturedUsageSummaryProps.totalConsumption).toBe(0);
      expect(capturedUsageChartProps.data).toBeUndefined();
    });

    it("handles empty consumption arrays", async () => {
      const emptyData = {
        message: "Success",
        data: {
          userConsumption: [],
          totalConsumption: [],
        },
      };

      mockGetUsageDataAction.mockResolvedValue(emptyData);

      render(<ChartWithFilters devices={mockDevices} />);

      // Wait for data and verify zero totals
      await waitFor(() => {
        expect(capturedUsageSummaryProps.userConsumption).toBe(0);
      });

      expect(capturedUsageSummaryProps.totalConsumption).toBe(0);
      expect(capturedUsageChartProps.data).toEqual(emptyData.data);
    });

    it("handles missing data property", async () => {
      const malformedData = {
        message: "Success",
        data: undefined,
      };

      mockGetUsageDataAction.mockResolvedValue(malformedData as any);

      render(<ChartWithFilters devices={mockDevices} />);

      // Should handle gracefully without crashing
      await waitFor(() => {
        expect(capturedUsageSummaryProps.userConsumption).toBe(0);
      });

      expect(capturedUsageSummaryProps.totalConsumption).toBe(0);
      expect(capturedUsageChartProps.data).toBeUndefined();
    });

    it("handles data fetch errors gracefully", async () => {
      mockGetUsageDataAction.mockRejectedValue(new Error("Network error"));

      render(<ChartWithFilters devices={mockDevices} />);

      // Component should still render without crashing
      expect(screen.getByTestId("filters-form")).toBeInTheDocument();
      expect(screen.getByTestId("usage-summary")).toBeInTheDocument();
      expect(screen.getByTestId("usage-chart")).toBeInTheDocument();

      await waitFor(() => {
        // Should maintain initial state
        expect(capturedUsageSummaryProps.userConsumption).toBe(0);
        expect(capturedUsageSummaryProps.totalConsumption).toBe(0);
      });
    });
  });
});
