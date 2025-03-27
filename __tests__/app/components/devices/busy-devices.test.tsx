import { render, screen } from "@testing-library/react";
import { BusyDevices } from "../../../../src/components/custom/devices/busy-devices";

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
    usage: {
      user_email: "user1@example.com",
      estimated_use_time: new Date("2024-03-20T15:00:00"),
    },
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
    usage: {
      user_email: "user2@example.com",
      estimated_use_time: null,
    },
  },
];

describe("BusyDevices", () => {
  it("renders empty state when no devices are provided", () => {
    render(<BusyDevices devices={[]} currentUserEmail="test@example.com" />);
    expect(screen.getByText("No devices currently in use")).toBeInTheDocument();
  });

  it("renders devices list when devices are provided", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );
    expect(screen.getByText("Device 1")).toBeInTheDocument();
    expect(screen.getByText("Device 2")).toBeInTheDocument();
  });

  it("renders header correctly", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );
    expect(screen.getByText("In-Use Devices")).toBeInTheDocument();
    expect(screen.getByText("Device Name")).toBeInTheDocument();
    expect(screen.getByText("Being Used By")).toBeInTheDocument();
    expect(screen.getByText("Estimated Use Until")).toBeInTheDocument();
    expect(screen.getByText("Turn Off")).toBeInTheDocument();
  });

  it("shows user emails correctly", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );
    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    expect(screen.getByText("user2@example.com")).toBeInTheDocument();
  });

  it("formats estimated time correctly", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );
    expect(screen.getByText(/Mar 20, 2024/)).toBeInTheDocument();
    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });

  it("enables switch only for current user's devices", () => {
    render(
      <BusyDevices
        devices={mockDevices}
        currentUserEmail="user1@example.com"
      />,
    );
    const switches = screen.getAllByRole("switch");

    // First switch should be enabled (user's device)
    expect(switches[0]).not.toBeDisabled();
    expect(switches[0]).toHaveAttribute(
      "title",
      "Click to turn off this device",
    );

    // Second switch should be disabled (other user's device)
    expect(switches[1]).toBeDisabled();
    expect(switches[1]).toHaveAttribute(
      "title",
      "Only user2@example.com can turn off this device",
    );
  });
});
