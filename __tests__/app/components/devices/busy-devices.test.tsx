import { render, screen, within } from "@testing-library/react";
import { BusyDevices } from "@/components/custom/devices/busy-devices";

jest.mock("@/components/custom/devices/busy-device-switch", () => ({
  BusyDeviceSwitch: ({ deviceId, isCurrentUser }: any) => (
    <div
      data-testid={`switch-${deviceId}`}
      data-is-current-user={isCurrentUser}
    >
      Mocked BusyDeviceSwitch
    </div>
  ),
}));

jest.mock("@/components/custom/devices/busy-device-switch-mobile", () => ({
  BusyDeviceSwitchMobile: () => (
    <div role="switch">Mocked BusyDeviceSwitchMobile</div>
  ),
}));

jest.mock("@/components/custom/devices/inline-time-edit", () => ({
  InlineTimeEdit: ({
    value,
    onSave,
  }: {
    value: Date | null;
    onSave: (newValue: Date) => void;
  }) => (
    <div data-testid="inline-time-edit">
      <span>{value ? value.toISOString() : "Not specified"}</span>
      <button onClick={() => onSave(new Date())}>Edit</button>
    </div>
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

    const desktopView = screen.getByTestId("desktop-view");
    const mobileView = screen.getByTestId("mobile-view");

    expect(desktopView.classList).toContain("md:block");
    expect(mobileView.classList).toContain("md:hidden");

    const emptyContentElement_desktop = within(desktopView).getByText(
      "No devices currently in use",
    );
    expect(emptyContentElement_desktop).toBeInTheDocument();

    const emptyContentElement_mobile = within(mobileView).getByText(
      "No devices currently in use",
    );
    expect(emptyContentElement_mobile).toBeInTheDocument();
  });

  it("renders devices list with correct data", () => {
    render(
      <BusyDevices
        devices={mockDevices}
        currentUserEmail="user1@example.com"
      />,
    );

    // Check if device names are rendered
    expect(screen.getAllByText("Device 1")).toHaveLength(2); // desktop and mobile
    expect(screen.getAllByText("Device 2")).toHaveLength(2);

    // Check if BusyDeviceSwitch components are rendered with correct props
    const device1Switches = screen.getAllByTestId("switch-1");
    const device2Switches = screen.getAllByTestId("switch-2");

    device1Switches.forEach((switchEl) => {
      expect(switchEl).toHaveAttribute("data-is-current-user", "true");
    });

    device2Switches.forEach((switchEl) => {
      expect(switchEl).toHaveAttribute("data-is-current-user", "false");
    });
  });

  it("formats estimated time correctly", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );
    expect(screen.getAllByText(/Mar 20, 2024/).length).toBe(2); // desktop and mobile
    expect(screen.getAllByText(/Not specified/).length).toBe(2);
  });

  it("renders correct table headers in desktop view", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );
    const desktopView = screen.getByTestId("desktop-view");

    expect(screen.getByText("In-Use Devices")).toBeInTheDocument();
    expect(within(desktopView).getByText("Device Name")).toBeInTheDocument();
    expect(within(desktopView).getByText("Being Used By")).toBeInTheDocument();
    expect(
      within(desktopView).getByText("Estimated Use Until"),
    ).toBeInTheDocument();
    expect(within(desktopView).getByText("Turn Off")).toBeInTheDocument();
  });

  it("renders mobile view with correct device details", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );

    const mobileView = screen.getByTestId("mobile-view");
    const deviceCards = within(mobileView).getAllByRole("group");

    expect(deviceCards).toHaveLength(2);

    // Check first device card
    const firstCard = deviceCards[0];
    expect(within(firstCard).getByText("Device 1")).toBeInTheDocument();
    expect(within(firstCard).getByText("Being Used By:")).toBeInTheDocument();
    expect(
      within(firstCard).getByText("user1@example.com"),
    ).toBeInTheDocument();
    expect(within(firstCard).getByText("Estimated Until:")).toBeInTheDocument();
    expect(within(firstCard).getByText(/Mar 20, 2024/)).toBeInTheDocument();

    // Check second device card
    const secondCard = deviceCards[1];
    expect(within(secondCard).getByText("Device 2")).toBeInTheDocument();
    expect(within(secondCard).getByText("Being Used By:")).toBeInTheDocument();
    expect(
      within(secondCard).getByText("user2@example.com"),
    ).toBeInTheDocument();
    expect(
      within(secondCard).getByText("Estimated Until:"),
    ).toBeInTheDocument();
    expect(within(secondCard).getByText("Not specified")).toBeInTheDocument();
  });
});
