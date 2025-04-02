import { render, screen } from "@testing-library/react";
import { FreeDeviceSwitch } from "@/components/custom/devices/free-device-switch";
import userEvent from "@testing-library/user-event";

describe("FreeDeviceSwitch", () => {
  const mockDeviceId = "test-device-1";
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with initial state", () => {
    render(
      <FreeDeviceSwitch
        deviceId={mockDeviceId}
        onCheckedChange={mockOnToggle}
      />,
    );

    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeDisabled();
    expect(switchElement).toHaveAttribute("id", `turn-on-${mockDeviceId}`);
    expect(switchElement).toHaveAttribute(
      "title",
      "Click to turn on this device",
    );
  });

  it("can be rendered in checked state", () => {
    render(
      <FreeDeviceSwitch
        deviceId={mockDeviceId}
        onCheckedChange={mockOnToggle}
        checked={true}
      />,
    );

    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveAttribute("data-state", "checked");
  });

  it("can be disabled when specified", () => {
    render(
      <FreeDeviceSwitch
        deviceId={mockDeviceId}
        onCheckedChange={mockOnToggle}
        disabled={true}
      />,
    );

    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeDisabled();
  });

  it("calls onToggle when toggled", async () => {
    render(
      <FreeDeviceSwitch
        deviceId={mockDeviceId}
        onCheckedChange={mockOnToggle}
      />,
    );

    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);

    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  //   const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  //   const failingToggle = () => {
  //     throw new Error("Toggle failed");
  //   };

  //   render(
  //     <FreeDeviceSwitch
  //       deviceId={mockDeviceId}
  //       onCheckedChange={failingToggle}
  //     />,
  //   );

  //   const switchElement = screen.getByRole("switch");
  //   await userEvent.click(switchElement);

  //   expect(consoleErrorSpy).toHaveBeenCalledWith(
  //     "Error toggling device:",
  //     expect.any(Error),
  //   );

  //   consoleErrorSpy.mockRestore();
  // });
});
