import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
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
    getCurrentDatePlusOneMin: jest
      .fn()
      .mockImplementation(originalModule.getCurrentDatePlusOneMin),
    getCurrentDatePlusEightHours: jest
      .fn()
      .mockImplementation(originalModule.getCurrentDatePlusEightHours),
    isDateInFuture: jest.fn().mockImplementation(originalModule.isDateInFuture),
  };
});

const oneMinute = 60 * 1000; // One minute in milliseconds
const oneHour = 60 * oneMinute; // One hour in milliseconds
const nineHours = 9 * oneHour; // Eight hours in milliseconds
const futureDate = new Date(Date.now() + oneHour); // Future date for testing
const futureDateLocalValue = utils.getDateTimeLocalValue(futureDate);

describe("DeviceUsageTimePicker Component", () => {
  const mockDeviceId = "test-device-1";
  const mockDeviceIp = "192.168.1.1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with a switch", () => {
    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
  });

  it("opens dialog when switch is toggled ON and initializes with current time + 1 minute", async () => {
    const initialDate = new Date(futureDate.getTime() + oneMinute);
    const initialDateLocalValue = utils.getDateTimeLocalValue(initialDate);

    (utils.getCurrentDatePlusOneMin as jest.Mock).mockImplementation(
      () => initialDate,
    );

    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

    // Click the switch to toggle it ON
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Check if dialog content appears with the correct time
    await waitFor(() => {
      const dialogElement = screen.getByRole("dialog");
      expect(dialogElement).toBeInTheDocument();
      expect(screen.getByText("Turn On Device")).toBeInTheDocument();

      const dateTimeInput =
        within(dialogElement).getByLabelText(/Estimated use until/i);
      expect(dateTimeInput).toHaveValue(initialDateLocalValue); // From our mock date + 1 minute
    });
  });

  it("shows error when time is set to past time", async () => {
    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

    // Click the switch to toggle it ON
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Set time to a value that would be in the past (mock will return false)
    const dateTimeInput = await screen.findByLabelText(/Estimated use until/i);
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, "2023-01-01T00:00");

    // Check for error message
    expect(screen.getByText("Time must be in the future")).toBeInTheDocument();

    // Check that the "With Timer" button is disabled
    const withTimerButton = screen.getByRole("button", {
      name: /turn on with timer/i,
    });
    expect(withTimerButton).toBeDisabled();
  });

  it("shows error when time is set beyond max allowed time", async () => {
    const ninHoursLocalValue = utils.getDateTimeLocalValue(
      new Date(Date.now() + nineHours),
    );
    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

    // Click the switch to toggle it ON
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Set time to a value that would be in the past (mock will return false)
    const dateTimeInput = await screen.findByLabelText(/Estimated use until/i);
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, ninHoursLocalValue);

    // Check for error message
    expect(
      screen.getByText("A device cannot be blocked for more than 8 hours"),
    ).toBeInTheDocument();

    // Check that the "With Timer" button is disabled
    const withTimerButton = screen.getByRole("button", {
      name: /turn on with timer/i,
    });
    expect(withTimerButton).toBeDisabled();
  });

  it("it handles validation errors when handleTurnOn function is invoked by preventing turing device on", async () => {
    // Mock to make sure the confirm button is enabled
    (utils.getCurrentDatePlusOneMin as jest.Mock).mockReturnValueOnce(
      futureDate,
    );
    const turnOnActionSpy = turnOnDeviceAction as jest.Mock;

    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );
    // Open the dialog
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Try to turn on with an invalid time
    const timerButton = screen.getByRole("button", {
      name: /turn on with timer/i,
    });

    expect(timerButton).not.toBeDisabled();

    //mock the isDateInFuture function to return false to trigger validation error after clicking the timer button
    (utils.isDateInFuture as jest.Mock).mockReturnValueOnce(false);

    await userEvent.click(timerButton);

    // Verify the error was set and the action was not called
    expect(screen.getByText("Time must be in the future")).toBeInTheDocument();
    expect(turnOnActionSpy).not.toHaveBeenCalled();

    // Button should be disabled after the error is shown
    expect(timerButton).toBeDisabled();
  });

  it("allows valid future times", async () => {
    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

    // Click the switch to toggle it ON
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Set time to a value that would be in the future (mock will return true)
    const dateTimeInput = await screen.findByLabelText(/Estimated use until/i);
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, futureDateLocalValue);

    // Check that error message is not shown
    expect(
      screen.queryByText("Time must be in the future"),
    ).not.toBeInTheDocument();

    // Check that the "With Timer" button is enabled
    const withTimerButton = screen.getByRole("button", {
      name: /turn on with timer/i,
    });
    expect(withTimerButton).not.toBeDisabled();
  });

  it("resets switch state when dialog is closed", async () => {
    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

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

    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

    // Open the dialog by toggling the switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Click the Turn On Without Timer button
    const turnOnButton = await screen.findByRole("button", {
      name: /turn on without timer/i,
    });
    fireEvent.click(turnOnButton);

    await waitFor(() => {
      expect(turnOnDeviceAction).toHaveBeenCalledWith(
        mockDeviceId,
        mockDeviceIp,
      );
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
    (utils.getCurrentDatePlusOneMin as jest.Mock).mockReturnValue(futureDate);

    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

    // Open the dialog by toggling the switch
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    // Click the With Timer button
    const timerButton = screen.getByRole("button", {
      name: /turn on with timer/i,
    });
    fireEvent.click(timerButton);

    await waitFor(() => {
      expect(turnOnDeviceAction).toHaveBeenCalledWith(
        mockDeviceId,
        mockDeviceIp,
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

    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

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
    (utils.getCurrentDatePlusOneMin as jest.Mock).mockReturnValue(futureDate);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    (turnOnDeviceAction as jest.Mock).mockResolvedValue({
      success: false,
      error: "Failed to turn on device",
    });

    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

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

  it("resets switch to OFF state when dialog is closed using the X button", async () => {
    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

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
    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

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
    render(
      <DeviceUsageTimePicker deviceId={mockDeviceId} deviceIp={mockDeviceIp} />,
    );

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
});
