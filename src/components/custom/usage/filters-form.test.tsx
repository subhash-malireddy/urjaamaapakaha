import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import FiltersForm from "./filters-form";
import { type DeviceSelectionList } from "@/lib/zod/usage";
import { type TimePeriod } from "@/lib/usage-utils";

// Mock the child components
jest.mock("./device-selector", () => {
  return function MockDeviceSelector({
    onSelect,
    selectedDeviceValue,
    selectedDeviceAlias,
    devices,
  }: {
    onSelect: (deviceId: string) => void;
    selectedDeviceValue: string;
    selectedDeviceAlias: string;
    devices: DeviceSelectionList;
  }) {
    return (
      <div data-testid="device-selector">
        <span data-testid="selected-device">{selectedDeviceAlias}</span>
        <span data-testid="selected-device-value">{selectedDeviceValue}</span>
        <span data-testid="devices-count">{devices.length}</span>
        <button
          type="button"
          onClick={() => onSelect("device-1")}
          data-testid="select-device"
        >
          Select Device
        </button>
      </div>
    );
  };
});

jest.mock("./time-period-selector", () => {
  return function MockTimePeriodSelector({
    onSelect,
    selectedValue,
  }: {
    onSelect: (timePeriod: TimePeriod) => void;
    selectedValue: TimePeriod;
  }) {
    return (
      <div data-testid="time-period-selector">
        <span data-testid="selected-time-period">{selectedValue}</span>
        <button
          type="button"
          onClick={() => onSelect("current month")}
          data-testid="select-time-period"
        >
          Select Time Period
        </button>
      </div>
    );
  };
});

// Mock data
const mockDevices: DeviceSelectionList = [
  { id: "device-1", alias: "Living Room TV" },
  { id: "device-2", alias: "Bedroom Speaker" },
  { id: "device-3", alias: "Kitchen Display" },
];

const emptyDevices: DeviceSelectionList = [];

const defaultProps = {
  devices: mockDevices,
  selectedDeviceValue: "All",
  selectedDeviceAlias: "All",
  selectedTimePeriod: "current week" as TimePeriod,
  handleDeviceSelect: jest.fn(),
  handleTimePeriodSelect: jest.fn(),
};

describe("FiltersForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the filters form container", () => {
      // Arrange & Act
      render(<FiltersForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("filters-form")).toBeInTheDocument();
      expect(screen.getByTestId("filters-form")).toHaveClass(
        "flex w-full flex-col gap-2",
      );
    });

    it("renders the form element with correct structure", () => {
      // Arrange & Act
      render(<FiltersForm {...defaultProps} />);

      // Assert
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass("flex w-full justify-between");
    });

    it("renders Device label with correct styling", () => {
      // Arrange & Act
      render(<FiltersForm {...defaultProps} />);

      // Assert
      const deviceLabel = screen.getByText("Device");
      expect(deviceLabel).toBeInTheDocument();
      expect(deviceLabel).toHaveClass("text-lg");
      expect(deviceLabel).toHaveAttribute("for", "device-selector");
    });

    it("renders Time Period label with correct styling", () => {
      // Arrange & Act
      render(<FiltersForm {...defaultProps} />);

      // Assert
      const timePeriodLabel = screen.getByText("Time Period");
      expect(timePeriodLabel).toBeInTheDocument();
      expect(timePeriodLabel).toHaveClass("text-lg");
      expect(timePeriodLabel).toHaveAttribute("for", "time-period-selector");
    });

    it("renders DeviceSelector component with correct props", () => {
      // Arrange & Act
      render(<FiltersForm {...defaultProps} />);

      // Assert
      const deviceSelector = screen.getByTestId("device-selector");
      expect(deviceSelector).toBeInTheDocument();
      expect(screen.getByTestId("selected-device")).toHaveTextContent("All");
      expect(screen.getByTestId("devices-count")).toHaveTextContent("3");
    });

    it("renders TimePeriodSelector component with correct props", () => {
      // Arrange & Act
      render(<FiltersForm {...defaultProps} />);

      // Assert
      const timePeriodSelector = screen.getByTestId("time-period-selector");
      expect(timePeriodSelector).toBeInTheDocument();
      expect(screen.getByTestId("selected-time-period")).toHaveTextContent(
        "current week",
      );
    });
  });

  describe("Props Integration", () => {
    it("passes correct devices to DeviceSelector", () => {
      // Arrange & Act
      render(<FiltersForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("devices-count")).toHaveTextContent("3");
    });

    it("handles empty devices list", () => {
      // Arrange & Act
      render(<FiltersForm {...defaultProps} devices={emptyDevices} />);

      // Assert
      expect(screen.getByTestId("devices-count")).toHaveTextContent("0");
    });

    it("displays correct selected device information", () => {
      // Arrange & Act
      render(
        <FiltersForm
          {...defaultProps}
          selectedDeviceValue="device-1"
          selectedDeviceAlias="Living Room TV"
        />,
      );

      // Assert
      expect(screen.getByTestId("selected-device")).toHaveTextContent(
        "Living Room TV",
      );
    });

    it("displays correct selected time period", () => {
      // Arrange & Act
      render(
        <FiltersForm {...defaultProps} selectedTimePeriod="current month" />,
      );

      // Assert
      expect(screen.getByTestId("selected-time-period")).toHaveTextContent(
        "current month",
      );
    });
  });

  describe("Event Handlers", () => {
    it("does not interfere with individual component handlers", async () => {
      // Arrange
      const user = userEvent.setup();
      const mockHandleDeviceSelect = jest.fn();
      const mockHandleTimePeriodSelect = jest.fn();

      render(
        <FiltersForm
          {...defaultProps}
          handleDeviceSelect={mockHandleDeviceSelect}
          handleTimePeriodSelect={mockHandleTimePeriodSelect}
        />,
      );

      // Act
      await user.click(screen.getByTestId("select-device"));
      await user.click(screen.getByTestId("select-time-period"));

      // Assert
      expect(mockHandleDeviceSelect).toHaveBeenCalledTimes(1);
      expect(mockHandleTimePeriodSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("Layout and Styling", () => {
    it("applies correct CSS classes to form sections", () => {
      // Arrange & Act
      render(<FiltersForm {...defaultProps} />);

      // Assert
      const deviceSection = screen.getByText("Device").closest("div");
      expect(deviceSection).toHaveClass("flex flex-col gap-2");

      const timePeriodSection = screen.getByText("Time Period").closest("div");
      expect(timePeriodSection).toHaveClass(
        "flex flex-col justify-around gap-2",
      );
    });

    it("maintains responsive layout structure", () => {
      // Arrange & Act
      render(<FiltersForm {...defaultProps} />);

      // Assert
      const form = document.querySelector("form");
      expect(form).toHaveClass("flex w-full justify-between");
    });
  });

  describe("Edge Cases", () => {
    it("handles all TimePeriod types correctly", () => {
      const timePeriods: TimePeriod[] = [
        "current week",
        "current month",
        "current billing period",
      ];

      timePeriods.forEach((period) => {
        // Arrange & Act
        const { unmount } = render(
          <FiltersForm {...defaultProps} selectedTimePeriod={period} />,
        );

        // Assert
        expect(screen.getByTestId("selected-time-period")).toHaveTextContent(
          period,
        );

        unmount();
      });
    });

    it("handles special device selection values", () => {
      // Arrange & Act
      render(
        <FiltersForm
          {...defaultProps}
          selectedDeviceValue=""
          selectedDeviceAlias=""
        />,
      );

      // Assert
      expect(screen.getByTestId("selected-device")).toHaveTextContent("");
    });

    it("renders correctly with minimal props", () => {
      // Arrange
      const minimalProps = {
        devices: [],
        selectedDeviceValue: "",
        selectedDeviceAlias: "",
        selectedTimePeriod: "current week" as TimePeriod,
        handleDeviceSelect: jest.fn(),
        handleTimePeriodSelect: jest.fn(),
      };

      // Act & Assert
      expect(() => render(<FiltersForm {...minimalProps} />)).not.toThrow();
    });
  });
});
