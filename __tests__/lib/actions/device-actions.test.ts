import {
  turnOnDeviceAction,
  turnOffDeviceAction,
} from "@/lib/actions/device-actions";
import { auth } from "@/auth";
import { turnOnDevice, turnOffDevice } from "@/lib/data/devices";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/data/devices", () => ({
  turnOnDevice: jest.fn(),
  turnOffDevice: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.spyOn(console, "error").mockImplementation(() => {});

describe("turnOnDeviceAction", () => {
  const mockDeviceId = "test-device-1";
  const mockDeviceIp = "192.168.1.1";
  const mockUserEmail = "test@example.com";
  const mockDeviceData = {
    id: mockDeviceId,
    mac_address: "00:00:00:00:00:01",
    ip_address: mockDeviceIp,
    alias: "Test Device",
    is_archived: false,
    previous_aliases: [],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when user is not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: null });

    const result = await turnOnDeviceAction(
      mockDeviceId,
      mockDeviceIp,
      undefined,
    );

    expect(result).toEqual({
      success: false,
      error: "Unauthorized. Please sign in.",
    });
    expect(turnOnDevice).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns error when deviceId is not provided", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });

    const result = await turnOnDeviceAction("", mockDeviceIp);

    expect(result).toEqual({
      success: false,
      error: "Device ID is required",
    });
    expect(turnOnDevice).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns error when deviceIp is not provided", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });

    const result = await turnOnDeviceAction(mockDeviceId, "");

    expect(result).toEqual({
      success: false,
      error: "Device ip is required",
    });
    expect(turnOnDevice).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("successfully turns on device and revalidates path", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });
    (turnOnDevice as jest.Mock).mockResolvedValue(mockDeviceData);

    const result = await turnOnDeviceAction(mockDeviceId, mockDeviceIp);

    expect(result).toEqual({
      success: true,
      data: mockDeviceData,
    });
    expect(turnOnDevice).toHaveBeenCalledWith(
      mockDeviceId,
      mockDeviceIp,
      mockUserEmail,
      undefined,
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("successfully turns on device with estimated usage time", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });
    (turnOnDevice as jest.Mock).mockResolvedValue(mockDeviceData);

    const estimatedUseTime = new Date();
    const result = await turnOnDeviceAction(
      mockDeviceId,
      mockDeviceIp,
      estimatedUseTime,
    );

    expect(result).toEqual({
      success: true,
      data: mockDeviceData,
    });
    expect(turnOnDevice).toHaveBeenCalledWith(
      mockDeviceId,
      mockDeviceIp,
      mockUserEmail,
      estimatedUseTime,
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("handles errors from turnOnDevice", async () => {
    const mockError = new Error("Database error");
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });
    (turnOnDevice as jest.Mock).mockRejectedValue(mockError);

    const result = await turnOnDeviceAction(mockDeviceId, mockDeviceIp);

    expect(result).toEqual({
      success: false,
      error: "Database error",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("handles non-Error objects thrown by turnOnDevice", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });
    (turnOnDevice as jest.Mock).mockRejectedValue("String error");

    const result = await turnOnDeviceAction(mockDeviceId, mockDeviceIp);

    expect(result).toEqual({
      success: false,
      error: "Failed to turn on device",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("turnOffDeviceAction", () => {
  const mockDeviceId = "test-device-1";
  const mockDeviceIp = "192.168.1.1";
  const mockUserEmail = "test@example.com";
  const mockDeviceData = {
    id: mockDeviceId,
    mac_address: "00:00:00:00:00:01",
    ip_address: mockDeviceIp,
    alias: "Test Device",
    is_archived: false,
    previous_aliases: [],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when user is not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: null });

    const result = await turnOffDeviceAction(mockDeviceId, mockDeviceIp);

    expect(result).toEqual({
      success: false,
      error: "Unauthorized. Please sign in.",
    });
    expect(turnOffDevice).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns error when deviceId is not provided", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });

    const result = await turnOffDeviceAction("", mockDeviceIp);

    expect(result).toEqual({
      success: false,
      error: "Device ID is required",
    });
    expect(turnOffDevice).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns error when deviceIp is not provided", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });

    const result = await turnOffDeviceAction(mockDeviceId, "");

    expect(result).toEqual({
      success: false,
      error: "Device ip is required",
    });
    expect(turnOffDevice).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("successfully turns off device and revalidates path", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });
    (turnOffDevice as jest.Mock).mockResolvedValue(mockDeviceData);

    const result = await turnOffDeviceAction(mockDeviceId, mockDeviceIp);

    expect(result).toEqual({
      success: true,
      data: mockDeviceData,
    });
    expect(turnOffDevice).toHaveBeenCalledWith(mockDeviceId, mockDeviceIp);
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("handles errors from turnOffDevice", async () => {
    const mockError = new Error("Database error");
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });
    (turnOffDevice as jest.Mock).mockRejectedValue(mockError);

    const result = await turnOffDeviceAction(mockDeviceId, mockDeviceIp);

    expect(result).toEqual({
      success: false,
      error: "Database error",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("handles non-Error objects thrown by turnOffDevice", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: mockUserEmail } });
    (turnOffDevice as jest.Mock).mockRejectedValue("String error");

    const result = await turnOffDeviceAction(mockDeviceId, mockDeviceIp);

    expect(result).toEqual({
      success: false,
      error: "Failed to turn off device",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
