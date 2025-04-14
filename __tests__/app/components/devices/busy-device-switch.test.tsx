import { render, screen, waitFor } from "@testing-library/react";
import { BusyDeviceSwitch } from "../../../../src/components/custom/devices/busy-device-switch";
import { turnOffDeviceAction } from "../../../../src/lib/actions/device-actions";
import userEvent from "@testing-library/user-event";

// Mock the device action
jest.mock("../../../../src/lib/actions/device-actions", () => ({
  turnOffDeviceAction: jest.fn(),
}));

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  jest.spyOn(console, "error").mockRestore();
});

describe("BusyDeviceSwitch", () => {
  const defaultProps = {
    deviceId: "test-device-1",
    deviceIp: "192.168.1.1",
    isCurrentUser: true,
    userEmail: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders switch with correct initial state", () => {
    render(<BusyDeviceSwitch {...defaultProps} />);

    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toBeEnabled();
    expect(switchElement).toHaveAttribute("aria-checked", "true");
  });

  it("renders disabled switch with correct tooltip when not current user", () => {
    const nonCurrentUserProps = {
      ...defaultProps,
      isCurrentUser: false,
    };

    render(<BusyDeviceSwitch {...nonCurrentUserProps} />);

    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeDisabled();
    expect(switchElement).toHaveAttribute(
      "title",
      `Only ${defaultProps.userEmail} can turn off this device`,
    );
  });

  it("handles device turn off action correctly on success", async () => {
    const user = userEvent.setup();
    (turnOffDeviceAction as jest.Mock).mockResolvedValue({ success: true });

    render(<BusyDeviceSwitch {...defaultProps} />);
    const switchElement = screen.getByRole("switch");

    // Initial state
    expect(switchElement).toHaveAttribute("aria-checked", "true");
    expect(switchElement).toBeEnabled();

    // Click the switch
    await user.click(switchElement);

    // Immediately after click, before action completes
    expect(switchElement).toHaveAttribute("aria-checked", "false");
    expect(switchElement).toBeDisabled();

    // Verify action was called
    expect(turnOffDeviceAction).toHaveBeenCalledWith(
      defaultProps.deviceId,
      defaultProps.deviceIp,
    );

    // After successful action, switch should stay off and disabled (waiting for revalidation)
    await waitFor(() => {
      expect(switchElement).toHaveAttribute("aria-checked", "false");
      expect(switchElement).toBeDisabled();
    });
  });

  it("reverts switch state when action returns success: false", async () => {
    const user = userEvent.setup();
    (turnOffDeviceAction as jest.Mock).mockResolvedValue({
      success: false,
      error: "Failed to turn off device",
    });

    render(<BusyDeviceSwitch {...defaultProps} />);
    const switchElement = screen.getByRole("switch");

    // Click the switch
    await user.click(switchElement);

    // Verify action was called
    expect(turnOffDeviceAction).toHaveBeenCalledWith(
      defaultProps.deviceId,
      defaultProps.deviceIp,
    );

    // After unsuccessful action, switch should revert to original state
    await waitFor(() => {
      expect(switchElement).toHaveAttribute("aria-checked", "true");
      expect(switchElement).toBeEnabled();
    });
  });

  it("reverts switch state when action throws error", async () => {
    const user = userEvent.setup();
    (turnOffDeviceAction as jest.Mock).mockRejectedValue(
      new Error("Network error"),
    );

    render(<BusyDeviceSwitch {...defaultProps} />);
    const switchElement = screen.getByRole("switch");

    // Click the switch
    await user.click(switchElement);

    // Verify action was called
    expect(turnOffDeviceAction).toHaveBeenCalledWith(
      defaultProps.deviceId,
      defaultProps.deviceIp,
    );

    // After error, switch should revert to original state
    await waitFor(() => {
      expect(switchElement).toHaveAttribute("aria-checked", "true");
      expect(switchElement).toBeEnabled();
    });
  });
});
