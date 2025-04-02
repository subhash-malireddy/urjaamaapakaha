import { render, screen, waitFor } from "@testing-library/react";
import { FreeDeviceSwitch } from "@/components/custom/devices/free-device-switch";
import { turnOnDeviceAction } from "@/lib/actions/device-actions";
import userEvent from "@testing-library/user-event";

// Mock the server action
jest.mock("@/lib/actions/device-actions", () => ({
  turnOnDeviceAction: jest.fn(),
}));

describe("FreeDeviceSwitch", () => {
  const mockDeviceId = "test-device-1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with initial state", () => {
    render(<FreeDeviceSwitch deviceId={mockDeviceId} />);

    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeDisabled();
    expect(switchElement).toHaveAttribute("id", `turn-on-${mockDeviceId}`);
    expect(switchElement).toHaveAttribute(
      "title",
      "Click to turn on this device",
    );
  });

  it("disables switch during loading state, thus preventing multiple clicks", async () => {
    // Mock the action to delay response
    (turnOnDeviceAction as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100),
        ),
    );

    render(<FreeDeviceSwitch deviceId={mockDeviceId} />);

    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    expect(switchElement).toBeDisabled();

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(switchElement).not.toBeDisabled();
    });
  });

  it("calls turnOnDeviceAction when toggled", async () => {
    (turnOnDeviceAction as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<FreeDeviceSwitch deviceId={mockDeviceId} />);

    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    expect(turnOnDeviceAction).toHaveBeenCalledWith(mockDeviceId);
  });

  it("handles error when turnOnDeviceAction fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    (turnOnDeviceAction as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: "This should fail",
    });

    render(<FreeDeviceSwitch deviceId={mockDeviceId} />);

    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error turning on device:",
        new Error("This should fail"),
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
