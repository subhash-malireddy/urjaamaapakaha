import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BusyDeviceSwitchMobile } from "../../../../src/components/custom/devices/busy-device-switch-mobile";

jest.mock(
  "../../../../src/components/custom/devices/busy-device-switch",
  () => ({
    BusyDeviceSwitch: () => <div role="switch">Mocked Switch</div>,
  }),
);

const mockProps = {
  deviceId: "test-device-1",
  deviceIp: "192.168.1.1",
  isCurrentUser: true,
  userEmail: "test@example.com",
};

afterAll(() => {
  jest.resetAllMocks();
});

describe("BusyDeviceSwitchMobile", () => {
  it("renders DeviceSwitch within a container", () => {
    render(<BusyDeviceSwitchMobile {...mockProps} />);
    const containerElement = screen.getByTestId("busy-device-switch-mobile");
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
    render(<BusyDeviceSwitchMobile {...mockProps} />);
    const containerElement = screen.getByTestId("busy-device-switch-mobile");
    if (containerElement) {
      await userEvent.click(containerElement);
      expect(mockPreventDefault).toHaveBeenCalledTimes(2);
      //pointerevent isn't available in Jest yet.
    }
  });
});
