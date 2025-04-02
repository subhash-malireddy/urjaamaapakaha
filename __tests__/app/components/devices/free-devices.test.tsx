import { render, screen } from "@testing-library/react";
import { FreeDevices } from "@/components/custom/devices/free-devices";

jest.mock("@/components/custom/devices/device-usage-time-picker", () => {
  return {
    DeviceUsageTimePicker: ({ deviceId }: { deviceId: string }) => (
      <div
        data-testid="device-usage-time-picker-mock"
        data-device-id={deviceId}
      >
        <div data-testid="free-device-switch-mock" data-device-id={deviceId} />
      </div>
    ),
  };
});

const mockDevices = [
  {
    id: "1",
    alias: "Device 1",
    mac_address: "00:00:00:00:00:01",
    ip_address: "192.168.1.1",
    is_archived: null,
    previous_aliases: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "2",
    alias: "Device 2",
    mac_address: "00:00:00:00:00:02",
    ip_address: "192.168.1.2",
    is_archived: null,
    previous_aliases: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
];
describe("FreeDevices", () => {
  describe("Desktop View", () => {
    it("renders both desktop and mobile views", () => {
      render(<FreeDevices devices={mockDevices} />);

      expect(screen.getByTestId("desktop-view")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-view")).toBeInTheDocument();
    });

    it("displays correct heading", () => {
      render(<FreeDevices devices={mockDevices} />);

      expect(screen.getByText("Available Devices")).toBeInTheDocument();
    });

    it("renders device switches for each device in desktop view", () => {
      render(<FreeDevices devices={mockDevices} />);

      const desktopView = screen.getByTestId("desktop-view");
      const switches = desktopView.querySelectorAll(
        "[data-testid='free-device-switch-mock']",
      );

      expect(switches).toHaveLength(mockDevices.length);
      switches.forEach((switchEl, index) => {
        expect(switchEl).toHaveAttribute(
          "data-device-id",
          mockDevices[index].id,
        );
      });
    });

    it("renders device switches for each device in mobile view", () => {
      render(<FreeDevices devices={mockDevices} />);

      const mobileView = screen.getByTestId("mobile-view");
      const switches = mobileView.querySelectorAll(
        "[data-testid='free-device-switch-mock']",
      );

      expect(switches).toHaveLength(mockDevices.length);
      switches.forEach((switchEl, index) => {
        expect(switchEl).toHaveAttribute(
          "data-device-id",
          mockDevices[index].id,
        );
      });
    });

    it("displays device names correctly in desktop and mobile views", () => {
      render(<FreeDevices devices={mockDevices} />);

      mockDevices.forEach((device) => {
        const cells = screen.getAllByText(device.alias);
        expect(cells).toHaveLength(2); // Should appear in both views
      });
    });

    it("shows empty state message when no devices are available", () => {
      render(<FreeDevices devices={[]} />);

      const emptyMessages = screen.getAllByText("No available devices found");
      expect(emptyMessages).toHaveLength(2); // One for desktop, one for mobile
    });
  });
});
