import { render, screen } from "@testing-library/react";
import { FreeDevices } from "../../../../src/components/custom/devices/free-devices";

// Mock the Switch component used directly in free-devices.tsx
jest.mock("@/components/ui/switch", () => ({
  Switch: ({ id, title }: { id: string; title: string }) => (
    <div
      data-testid={`switch-${id}`}
      role="switch"
      aria-checked="false"
      title={title}
    ></div>
  ),
}));

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
    it("renders empty state when no devices are provided", () => {
      render(<FreeDevices devices={[]} />);
      const desktopView = screen.getByTestId("desktop-view");
      expect(desktopView).toBeInTheDocument();
      expect(desktopView).toHaveTextContent("No available devices found");
    });

    it("renders devices list when devices are provided", () => {
      render(<FreeDevices devices={mockDevices} />);
      const desktopView = screen.getByTestId("desktop-view");
      expect(desktopView).toBeInTheDocument();
      expect(desktopView).toHaveTextContent("Device 1");
      expect(desktopView).toHaveTextContent("Device 2");
    });

    it("renders header correctly", () => {
      render(<FreeDevices devices={mockDevices} />);
      const desktopView = screen.getByTestId("desktop-view");
      expect(desktopView).toBeInTheDocument();
      expect(screen.getByText("Device Name")).toBeInTheDocument();
      expect(screen.getByText("Turn On")).toBeInTheDocument();
    });
  });

  describe("Mobile View", () => {
    it("renders empty state when no devices are provided", () => {
      render(<FreeDevices devices={[]} />);
      const mobileView = screen.getByTestId("mobile-view");
      expect(mobileView).toBeInTheDocument();
      expect(mobileView).toHaveTextContent("No available devices found");
    });

    it("renders devices list when devices are provided", () => {
      render(<FreeDevices devices={mockDevices} />);
      const mobileView = screen.getByTestId("mobile-view");
      expect(mobileView).toBeInTheDocument();
      expect(mobileView).toHaveTextContent("Device 1");
      expect(mobileView).toHaveTextContent("Device 2");
    });
  });

  it("renders switches for each device in both views", () => {
    render(<FreeDevices devices={mockDevices} />);

    // Check all switches
    const switchElements = screen.getAllByRole("switch");
    expect(switchElements).toHaveLength(4); // 2 devices x 2 views = 4 switches

    // Verify all switches have the correct title
    switchElements.forEach((switchEl) => {
      expect(switchEl).toHaveAttribute(
        "title",
        "Coming soon! Button will be enabled in future updates",
      );
    });
  });

  it("renders heading correctly", () => {
    render(<FreeDevices devices={mockDevices} />);
    expect(screen.getByText("Available Devices")).toBeInTheDocument();
  });
});
