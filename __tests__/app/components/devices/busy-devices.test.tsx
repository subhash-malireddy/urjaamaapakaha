import { render, screen, within } from "@testing-library/react";
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

const NUM_VIEWS = 2; // desktop and mobile view

describe("BusyDevices", () => {
  const originalInnerWidth = global.innerWidth;

  afterEach(() => {
    global.innerWidth = originalInnerWidth;
    jest.restoreAllMocks();
  });

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

  it("renders devices list when devices are provided", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );
    expect(screen.getAllByText("Device 1")).toHaveLength(2);
    expect(screen.getAllByText("Device 2")).toHaveLength(2);
  });

  it("renders desktop view correctly", () => {
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

  it("shows user emails correctly", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );
    expect(screen.getAllByText("user1@example.com").length).toBe(2);
    expect(screen.getAllByText("user2@example.com").length).toBe(2);
  });

  it("formats estimated time correctly", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );
    expect(screen.queryAllByText(/Mar 20, 2024/).length).toBe(2); //one for desktop and one for mobile view
    expect(screen.queryAllByText(/Not specified/).length).toBe(2);
  });

  it("enables switch only for current user's devices", () => {
    render(
      <BusyDevices
        devices={mockDevices}
        currentUserEmail="user1@example.com"
      />,
    );
    const switches = screen.getAllByRole("switch");

    expect(switches).toHaveLength(mockDevices.length * NUM_VIEWS);

    expect(switches[0]).not.toBeDisabled();
    expect(switches[0]).toHaveAttribute(
      "title",
      "Click to turn off this device",
    );

    expect(switches[1]).toBeDisabled();
    expect(switches[1]).toHaveAttribute(
      "title",
      "Only user2@example.com can turn off this device",
    );

    //switches in mobile view
    expect(switches[2]).not.toBeDisabled();
    expect(switches[2]).toHaveAttribute(
      "title",
      "Click to turn off this device",
    );

    expect(switches[3]).toBeDisabled();
    expect(switches[3]).toHaveAttribute(
      "title",
      "Only user2@example.com can turn off this device",
    );
  });

  it("renders mobile view correctly", () => {
    render(
      <BusyDevices devices={mockDevices} currentUserEmail="test@example.com" />,
    );

    const detailsElements = screen.getAllByRole("group");
    expect(detailsElements).toHaveLength(2);

    detailsElements.forEach((element, index) => {
      expect(element).toHaveTextContent(mockDevices[index].alias);
      expect(element).toHaveTextContent(mockDevices[index].usage.user_email);
      expect(element).toHaveTextContent("Being Used By:");
      expect(element).toHaveTextContent("Estimated Until:");
    });
  });
});
