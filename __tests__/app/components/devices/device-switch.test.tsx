import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DeviceSwitch,
  DeviceSwitchMobile,
} from "../../../../src/components/custom/devices/device-switch";

afterAll(() => {
  jest.resetAllMocks();
});

describe("DeviceSwitch", () => {
  it("renders enabled switch for current user", () => {
    render(
      <DeviceSwitch id="1" isCurrentUser={true} userEmail="user@example.com" />,
    );
    const switchElement = screen.getByRole("switch");
    expect(switchElement).not.toBeDisabled();
    expect(switchElement).toHaveAttribute(
      "title",
      "Click to turn off this device",
    );
  });

  it("renders disabled switch for other users", () => {
    render(
      <DeviceSwitch
        id="1"
        isCurrentUser={false}
        userEmail="otheruser@example.com"
      />,
    );
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeDisabled();
    expect(switchElement).toHaveAttribute(
      "title",
      "Only otheruser@example.com can turn off this device",
    );
  });

  it("calls onToggle when switch is clicked", async () => {
    const mockOnToggle = jest.fn();
    render(
      <DeviceSwitch
        id="1"
        isCurrentUser={true}
        userEmail="user@example.com"
        onToggle={mockOnToggle}
      />,
    );
    const switchElement = screen.getByRole("switch");
    await userEvent.click(switchElement);
    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });
});

describe("DeviceSwitchMobile", () => {
  it("renders DeviceSwitch within a container", () => {
    render(
      <DeviceSwitchMobile
        switchProps={{
          id: "1",
          isCurrentUser: true,
          userEmail: "user@example.com",
        }}
      />,
    );
    const containerElement = screen.getByRole("switch").closest("div");
    expect(containerElement).toHaveClass(
      "absolute top-0 right-0 bottom-0 flex cursor-default items-center px-4",
    );
  });

  it("prevents default behavior on click and pointer down", async () => {
    const mockPreventDefault = jest.fn();
    // spy on the pointer event and mouse event's preventDefault function
    jest
      .spyOn(Event.prototype, "preventDefault")
      .mockImplementation(mockPreventDefault);
    render(
      <DeviceSwitchMobile
        switchProps={{
          id: "1",
          isCurrentUser: true,
          userEmail: "user@example.com",
        }}
      />,
    );
    const containerElement = screen.getByRole("switch").closest("div");
    if (containerElement) {
      await userEvent.click(containerElement);
      expect(mockPreventDefault).toHaveBeenCalledTimes(2);
      //pointerevent isn't available in Jest yet.
    }
  });
});
