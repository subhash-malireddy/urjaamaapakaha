import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeviceSwitchMobile } from "../../../../src/components/custom/devices/busy-device-switch-mobile";

afterAll(() => {
  jest.resetAllMocks();
});

describe("DeviceSwitchMobile", () => {
  it("renders DeviceSwitch within a container", () => {
    render(<DeviceSwitchMobile />);
    const containerElement = screen.getByRole("switch").closest("div");
    expect(containerElement).toHaveClass(
      "absolute top-0 right-0 bottom-0 flex cursor-default items-center p-3",
    );
  });

  it("prevents default behavior on click and pointer down", async () => {
    const mockPreventDefault = jest.fn();
    // spy on the pointer event and mouse event's preventDefault function
    jest
      .spyOn(Event.prototype, "preventDefault")
      .mockImplementation(mockPreventDefault);
    render(<DeviceSwitchMobile />);
    const containerElement = screen.getByRole("switch").closest("div");
    if (containerElement) {
      await userEvent.click(containerElement);
      expect(mockPreventDefault).toHaveBeenCalledTimes(2);
      //pointerevent isn't available in Jest yet.
    }
  });
});
