import { render, screen } from "@testing-library/react";
import { FreeDevices } from "../../../../src/components/custom/devices/free-devices";

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
  it("renders empty state when no devices are provided", () => {
    render(<FreeDevices devices={[]} />);
    expect(screen.getByText("No available devices found")).toBeInTheDocument();
  });

  it("renders devices list when devices are provided", () => {
    render(<FreeDevices devices={mockDevices} />);
    expect(screen.getByText("Device 1")).toBeInTheDocument();
    expect(screen.getByText("Device 2")).toBeInTheDocument();
  });

  it("renders header correctly", () => {
    render(<FreeDevices devices={mockDevices} />);
    expect(screen.getByText("Available Devices")).toBeInTheDocument();
    expect(screen.getByText("Device Name")).toBeInTheDocument();
    expect(screen.getByText("Turn On")).toBeInTheDocument();
  });

  it("renders disabled switches for each device", () => {
    render(<FreeDevices devices={mockDevices} />);
    const switches = screen.getAllByRole("switch");
    expect(switches).toHaveLength(2);
    switches.forEach((switchEl) => {
      expect(switchEl).toBeDisabled();
      expect(switchEl).toHaveAttribute(
        "title",
        "Coming soon! Button will be enabled in future updates",
      );
    });
  });
});
