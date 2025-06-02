import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeviceSelector from "@/components/custom/usage/device-selector";
import { type DeviceSelectionList } from "@/lib/zod/usage";

// Mock data
const mockDevices: DeviceSelectionList = [
  { id: "device-1", alias: "Living Room TV" },
  { id: "device-2", alias: "Bedroom Speaker" },
  { id: "device-3", alias: "Kitchen Display" },
];

const emptyDevices: DeviceSelectionList = [];

const defaultProps = {
  devices: mockDevices,
  onSelect: jest.fn(),
  selectedDeviceValue: "All",
  selectedDeviceAlias: "All",
};

describe("DeviceSelector", () => {
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
    it("renders with devices available", () => {
      render(<DeviceSelector {...defaultProps} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("All")).toBeInTheDocument();
    });

    it("renders with no devices available", () => {
      render(
        <DeviceSelector
          {...defaultProps}
          devices={emptyDevices}
          selectedDeviceValue=""
          selectedDeviceAlias=""
        />,
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeDisabled();
      expect(screen.getByText("No devices available")).toBeInTheDocument();
    });

    it("displays selected device alias", () => {
      render(
        <DeviceSelector
          {...defaultProps}
          selectedDeviceValue="device-1"
          selectedDeviceAlias="Living Room TV"
        />,
      );

      expect(screen.getByText("Living Room TV")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it('does not call onSelect when "All" is selected because it is the default value', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn().mockImplementation((value) => {
        console.log("mockOnSelect value", value);
      });

      render(<DeviceSelector {...defaultProps} onSelect={mockOnSelect} />);
      screen.debug(undefined, 30000);
      const combobox = screen.getByRole("combobox");
      await user.click(combobox);

      // the selected content and the options are rendered
      const allOptions = screen.getAllByText("All");
      await waitFor(() => {
        expect(allOptions).toHaveLength(2);
      });

      screen.debug(undefined, 30000);

      await user.click(allOptions[1]); // Click the option, not the selected value

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it("calls onSelect when a device is selected", async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();

      render(<DeviceSelector {...defaultProps} onSelect={mockOnSelect} />);

      const combobox = screen.getByRole("combobox");
      await user.click(combobox);

      await waitFor(() => {
        expect(screen.getByText("Living Room TV")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Living Room TV"));

      expect(mockOnSelect).toHaveBeenCalledWith("device-1");
    });

    it("shows all device options when opened", async () => {
      const user = userEvent.setup();

      render(<DeviceSelector {...defaultProps} />);

      const combobox = screen.getByRole("combobox");
      await user.click(combobox);

      await waitFor(() => {
        expect(screen.getByText("Living Room TV")).toBeInTheDocument();
        expect(screen.getByText("Bedroom Speaker")).toBeInTheDocument();
        expect(screen.getByText("Kitchen Display")).toBeInTheDocument();
      });
    });

    it("does not allow interaction when disabled (no devices)", async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();

      render(
        <DeviceSelector
          {...defaultProps}
          devices={emptyDevices}
          onSelect={mockOnSelect}
          selectedDeviceValue=""
          selectedDeviceAlias=""
        />,
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeDisabled();

      await user.click(combobox);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty selectedDeviceAlias gracefully", () => {
      render(
        <DeviceSelector
          {...defaultProps}
          selectedDeviceAlias=""
          selectedDeviceValue=""
        />,
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeInTheDocument();
    });

    it("renders correct device count in description", () => {
      const singleDevice: DeviceSelectionList = [
        { id: "device-1", alias: "Single Device" },
      ];

      render(<DeviceSelector {...defaultProps} devices={singleDevice} />);

      expect(screen.getByText(/1 device available/i)).toBeInTheDocument();
    });

    it("shows correct description for multiple devices", () => {
      render(<DeviceSelector {...defaultProps} />);

      expect(screen.getByText(/3 devices available/i)).toBeInTheDocument();
    });
  });
});
