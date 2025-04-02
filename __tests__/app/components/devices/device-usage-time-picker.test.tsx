import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeviceUsageTimePicker } from "@/components/custom/devices/device-usage-time-picker";
import { turnOnDeviceAction } from "@/lib/actions/device-actions";
import userEvent from "@testing-library/user-event";
import * as utils from "@/lib/utils";

// Mock the dependencies
jest.mock("@/lib/actions/device-actions", () => ({
  turnOnDeviceAction: jest.fn(),
}));

jest.mock("@/lib/utils", () => {
  const originalModule = jest.requireActual("@/lib/utils");
  return {
    ...originalModule,
    getCurrentTimePlusOneMin: jest.fn(),
    isTimeInFuture: jest.fn(),
  };
});

describe("DeviceUsageTimePicker Component", () => {
  const mockDeviceId = "test-device-1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with a switch", () => {
    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
  });

  it("opens dialog when switch is toggled ON and initializes with current time + 1 minute", async () => {
    (utils.getCurrentTimePlusOneMin as jest.Mock).mockImplementation(
      () => "14:31",
    );

    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Click the switch to toggle it ON
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Check if dialog content appears with the correct time
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Turn On Device")).toBeInTheDocument();

      const timeInput = screen.getByLabelText(/estimated usage time/i);
      expect(timeInput).toHaveValue("14:31"); // From our mock date + 1 minute
    });
  });

  it("shows error when time is set to past time", async () => {
    // Mock isTimeInFuture to return false for this test
    (utils.isTimeInFuture as jest.Mock).mockReturnValue(false);
    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Click the switch to toggle it ON
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Set time to a value that would be in the past (mock will return false)
    const timeInput = await screen.findByLabelText(/estimated usage time/i);
    fireEvent.change(timeInput, { target: { value: "14:00" } });

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText("Time must be in the future"),
      ).toBeInTheDocument();

      // Check that the "With Timer" button is disabled
      const withTimerButton = screen.getByRole("button", {
        name: /turn on with timer/i,
      });
      expect(withTimerButton).toBeDisabled();
    });
  });

  it("allows valid future times", async () => {
    // Mock isTimeInFuture to return true for this test
    (utils.isTimeInFuture as jest.Mock).mockReturnValue(true);

    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Click the switch to toggle it ON
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Set time to a value that would be in the future (mock will return true)
    const timeInput = await screen.findByLabelText(/estimated usage time/i);
    fireEvent.change(timeInput, { target: { value: "15:30" } });

    // Check that error message is not shown
    await waitFor(() => {
      expect(
        screen.queryByText("Time must be in the future"),
      ).not.toBeInTheDocument();

      // Check that the "With Timer" button is enabled
      const withTimerButton = screen.getByRole("button", {
        name: /turn on with timer/i,
      });
      expect(withTimerButton).not.toBeDisabled();
    });
  });

  it("resets switch state when dialog is closed", async () => {
    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Toggle the switch ON to open dialog
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Wait for dialog to appear
    const dialog = await screen.findByRole("dialog");

    // Close the dialog
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    // Check that dialog is closed and switch is off
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      const updatedSwitch = screen.getByRole("switch");
      expect(updatedSwitch).toHaveAttribute("aria-checked", "false");
    });
  });

  it("calls turnOnDeviceAction with device ID when Turn On Without Timer is clicked", async () => {
    // Mock successful response
    (turnOnDeviceAction as jest.Mock).mockResolvedValue({ success: true });

    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Open the dialog by toggling the switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Click the Turn On Without Timer button
    const turnOnButton = await screen.findByRole("button", {
      name: /turn on without timer/i,
    });
    fireEvent.click(turnOnButton);

    await waitFor(() => {
      expect(turnOnDeviceAction).toHaveBeenCalledWith(mockDeviceId);
    });

    // Dialog should close and switch should stay ON after successful turn on
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      const updatedSwitch = screen.getByRole("switch");
      expect(updatedSwitch).toHaveAttribute("aria-checked", "true");
    });
  });

  it("calls turnOnDeviceAction with device ID and estimated time when With Timer is clicked", async () => {
    // Mock successful response
    (turnOnDeviceAction as jest.Mock).mockResolvedValue({ success: true });

    // Ensure isTimeInFuture returns true
    (utils.isTimeInFuture as jest.Mock).mockReturnValue(true);

    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Open the dialog by toggling the switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Change the time input to a valid future time
    const timeInput = await screen.findByLabelText(/estimated usage time/i);
    expect(timeInput).toHaveValue("14:31"); // Confirm it starts with current time + 1 min

    fireEvent.change(timeInput, { target: { value: "15:30" } });

    // Click the With Timer button
    const timerButton = screen.getByRole("button", {
      name: /turn on with timer/i,
    });
    fireEvent.click(timerButton);

    await waitFor(() => {
      expect(turnOnDeviceAction).toHaveBeenCalledWith(
        mockDeviceId,
        expect.any(Date),
      );
    });

    // Dialog should close and switch should stay ON after successful turn on
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      const updatedSwitch = screen.getByRole("switch");
      expect(updatedSwitch).toHaveAttribute("aria-checked", "true");
    });
  });

  it("resets switch when direct turn on action fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    (turnOnDeviceAction as jest.Mock).mockResolvedValue({
      success: false,
      error: "Failed to turn on device",
    });

    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Open the dialog by toggling the switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    expect(switchElement).toHaveAttribute("aria-checked", "true");
    // Click the Turn On Without Timer button
    const turnOnButton = await screen.findByRole("button", {
      name: /turn on without timer/i,
    });

    await userEvent.click(turnOnButton);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error turning on device directly:"),
      expect.any(Error),
    );

    // Switch should be reset to OFF when action fails
    expect(switchElement).toHaveAttribute("aria-checked", "false");

    consoleErrorSpy.mockRestore();
  });

  it("resets switch when turn on with timer fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    (turnOnDeviceAction as jest.Mock).mockResolvedValue({
      success: false,
      error: "Failed to turn on device",
    });

    // Ensure isTimeInFuture returns true
    (utils.isTimeInFuture as jest.Mock).mockReturnValue(true);

    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Open the dialog by toggling the switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    expect(switchElement).toHaveAttribute("aria-checked", "true");
    // Click the With Timer button
    const timerButton = await screen.findByRole("button", {
      name: /turn on with timer/i,
    });
    await userEvent.click(timerButton);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error turning on device with estimated time:"),
      expect.any(Error),
    );

    // Switch should be reset to OFF when action fails
    expect(switchElement).toHaveAttribute("aria-checked", "false");

    consoleErrorSpy.mockRestore();
  });

  it("resets switch to OFF state when there's an error turning on the device", async () => {
    // Mock the turnOnDeviceAction to fail
    (turnOnDeviceAction as jest.Mock).mockResolvedValue({
      success: false,
      error: "Failed to turn on device",
    });

    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Find and click the switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Dialog should be open now
    const turnOnButton = screen.getByText("Turn On With Timer");
    await userEvent.click(turnOnButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      // Check that switch has been reset to OFF
      expect(switchElement).toHaveAttribute("data-state", "unchecked");
    });
  });

  it("resets switch to OFF state when dialog is closed using the X button", async () => {
    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Find and click the switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Dialog should be open now
    const closeXButton = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeXButton);

    // Check that switch has been reset to OFF
    await waitFor(() => {
      expect(switchElement).toHaveAttribute("aria-checked", "false");
    });
  });

  it("keeps switch ON when device is successfully turned on", async () => {
    (turnOnDeviceAction as jest.Mock).mockResolvedValue({
      success: true,
    });
    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Find and click the switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Dialog should be open now
    const turnOnButton = screen.getByText("Turn On With Timer");
    await userEvent.click(turnOnButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      // Check that switch remains ON
      expect(switchElement).toHaveAttribute("data-state", "checked");
    });
  });

  it("resets switch to OFF state when dialog is closed using the Escape key", async () => {
    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Find and click the switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Wait for dialog to appear
    const dialog = await screen.findByRole("dialog");

    // Close the dialog with Escape key
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    // Check that switch has been reset to OFF
    await waitFor(() => {
      expect(switchElement).toHaveAttribute("aria-checked", "false");
    });
  });

  it("prevents device from turning on and sets error when time is in the past", async () => {
    // Mock to make the validation fail at the time of button click
    (utils.isTimeInFuture as jest.Mock).mockReturnValueOnce(false);
    (utils.getCurrentTimePlusOneMin as jest.Mock).mockReturnValue("15:30");
    const turnOnActionSpy = turnOnDeviceAction as jest.Mock;

    render(<DeviceUsageTimePicker deviceId={mockDeviceId} />);

    // Open the dialog
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // // At this point, we want the time to appear valid
    // (utils.isTimeInFuture as jest.Mock).mockReturnValue(true);

    // // Set the time (which appears valid for now)
    // const timeInput = await screen.findByLabelText(/estimated usage time/i);
    // fireEvent.change(timeInput, { target: { value: "15:30" } });

    // Now make the validation fail right before clicking the button

    // Try to turn on with an invalid time
    const timerButton = screen.getByRole("button", {
      name: /turn on with timer/i,
    });
    await userEvent.click(timerButton);

    // Verify the error was set and the action was not called
    expect(screen.getByText("Time must be in the future")).toBeInTheDocument();
    expect(turnOnActionSpy).not.toHaveBeenCalled();

    // Button should be disabled after the error is shown
    expect(timerButton).toBeDisabled();
  });
});
