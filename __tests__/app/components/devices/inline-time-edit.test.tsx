import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InlineTimeEdit } from "@/components/custom/devices/inline-time-edit";
import React from "react";
import { getDateTimeLocalValue } from "@/lib/utils";

// Mock the server action
jest.mock("@/lib/actions/usage-actions", () => ({
  updateEstimatedTimeAction: jest.fn(),
}));

// Mock useActionState hook
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    useActionState: jest.fn((action, initialState) => {
      return [initialState, jest.fn(), false];
    }),
  };
});

describe("InlineTimeEdit", () => {
  const mockDeviceId = "device-123";
  const mockDate = new Date("2025-01-01T12:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks between tests
    (React.useActionState as jest.Mock).mockImplementation(
      (action, initialState) => {
        return [initialState, jest.fn(), false];
      },
    );
  });

  // 1. Rendering Tests
  describe("Rendering", () => {
    it("renders in non-editing mode initially", () => {
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={mockDate} />,
      );

      // Should show formatted time
      expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument();
      expect(screen.getByTitle("Edit time")).toBeInTheDocument();

      // Should not show the form elements
      expect(
        screen.queryByLabelText("Set estimated use until time"),
      ).not.toBeInTheDocument();
    });

    it("renders 'Not specified' when estimated time is null", () => {
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={null} />,
      );

      expect(screen.getByText("Not specified")).toBeInTheDocument();
    });

    it("renders input with empty value when estimated time is null", () => {
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={null} />,
      );

      expect(screen.getByText("Not specified")).toBeInTheDocument();

      // Enter edit mode
      fireEvent.click(screen.getByTitle("Edit time"));
      const input = screen.getByLabelText("Set estimated use until time");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(""); // Input should be empty
    });
  });

  // 2. Interaction Tests
  describe("Interactions", () => {
    it("enters edit mode when clicking the edit button", async () => {
      const user = userEvent.setup();
      const oneHour = 60 * 60 * 1000;
      render(
        <InlineTimeEdit
          deviceId={mockDeviceId}
          estimatedUseUntil={new Date(Date.now() + oneHour)}
        />,
      );

      await user.click(screen.getByTitle("Edit time"));

      // Should show the datetime input
      expect(
        screen.getByLabelText("Set estimated use until time"),
      ).toBeInTheDocument();
      expect(screen.getByTitle("Confirm time")).toBeInTheDocument();
      expect(screen.getByTitle("Cancel edit")).toBeInTheDocument();
    });

    it("enters edit mode when clicking the time text", async () => {
      const user = userEvent.setup();
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={mockDate} />,
      );

      await user.click(screen.getByText(/Jan 1, 2025/));

      expect(
        screen.getByLabelText("Set estimated use until time"),
      ).toBeInTheDocument();
    });

    it("exits edit mode when clicking cancel button", async () => {
      const user = userEvent.setup();
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={mockDate} />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));
      expect(
        screen.getByLabelText("Set estimated use until time"),
      ).toBeInTheDocument();

      // Click cancel
      await user.click(screen.getByTitle("Cancel edit"));

      // Should be back in view mode
      expect(
        screen.queryByLabelText("Set estimated use until time"),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument();
    });

    it("exits edit mode when pressing Escape key", async () => {
      const user = userEvent.setup();
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={mockDate} />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Press Escape
      const input = screen.getByLabelText("Set estimated use until time");
      await user.type(input, "{Escape}");

      // Should be back in view mode
      expect(
        screen.queryByLabelText("Set estimated use until time"),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument();
    });

    it("exits edit mode when clicked outside the component", async () => {
      const user = userEvent.setup();
      render(
        <div data-testid="outer-element">
          <InlineTimeEdit
            deviceId={mockDeviceId}
            estimatedUseUntil={mockDate}
          />
        </div>,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Click outside the component
      const outerElement = screen.getByTestId("outer-element");
      await user.click(outerElement);

      // Should be back in view mode
      expect(
        screen.queryByLabelText("Set estimated use until time"),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument();
    });
  });

  // 3. Validation Tests
  describe("Validation", () => {
    it("shows error for past date", async () => {
      const user = userEvent.setup();
      // Mock current date to be fixed for testing
      //   const realDate = Date;
      //   global.Date = class extends Date {
      //     constructor(date) {
      //       if (date) {
      //         return super(date);
      //       }
      //       return new realDate("2025-01-02T12:00:00Z"); // Mock "now" as Jan 2, 2025
      //     }
      //   } as any;

      const oneHour = 60 * 60 * 1000;
      const pastDate = new Date(Date.now() - oneHour);
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={mockDate} />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Set a past date (Jan 1, 2025 is before our mocked "now")
      const input = screen.getByLabelText("Set estimated use until time");
      await user.clear(input);
      await user.type(input, pastDate.toISOString().slice(0, 16));

      // Check for error message
      expect(
        screen.getByText("**Time must be in the future"),
      ).toBeInTheDocument();

      const confirmButton = screen.getByTitle("Time must be in the future");
      // Confirm button should be disabled
      expect(confirmButton).toBeDisabled();

      //   // Restore original Date
      //   global.Date = realDate;
    });

    it("shows error for unchanged time", async () => {
      const user = userEvent.setup();
      const oneHour = 60 * 60 * 1000;
      const futureDate = new Date(Date.now() + oneHour);
      render(
        <InlineTimeEdit
          deviceId={mockDeviceId}
          estimatedUseUntil={futureDate}
        />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Get the initial value and modify it slightly, then revert back
      const input = screen.getByLabelText("Set estimated use until time");
      const initialValue = input.getAttribute("value");

      // Change the value to make it dirty
      await user.clear(input);
      await user.type(input, futureDate.toISOString().slice(0, 16));

      // Then change it back to the original value
      await user.clear(input);
      await user.type(input, initialValue!);

      // Check for error message
      expect(
        screen.getByText("**No change made to the time"),
      ).toBeInTheDocument();

      // Confirm button should be disabled
      expect(screen.getByTitle("No change made to the time")).toBeDisabled();
    });

    it("shows error for invalid date format", async () => {
      const user = userEvent.setup();
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={mockDate} />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Set an invalid date format
      const input = screen.getByLabelText("Set estimated use until time");
      await user.clear(input);
      await user.type(input, "275760-09-13T00:00:00"); // Invalid date

      // Check for error message
      expect(screen.getByText("**Invalid date format")).toBeInTheDocument();

      // Confirm button should be disabled
      expect(screen.getByTitle("Invalid date format")).toBeDisabled();
    });

    it("disables submit button when input is invalid", async () => {
      const user = userEvent.setup();
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={mockDate} />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Clear the input (making it empty)
      const input = screen.getByLabelText("Set estimated use until time");
      await user.clear(input);

      // Check that the submit button is disabled
      expect(screen.getByTitle("Time is required")).toBeDisabled();
    });
  });

  // 4. Form Submission Tests
  describe("Form Submission", () => {
    it("submits the form with updated time(valid time)", async () => {
      const user = userEvent.setup();
      const mockFormAction = jest.fn();
      const oneHour = 60 * 60 * 1000;
      const futureDate = new Date(Date.now() + oneHour);

      // Mock the useActionState to return our mock form action
      (React.useActionState as jest.Mock).mockImplementation(
        (action, initialState) => {
          return [initialState, mockFormAction, false];
        },
      );

      render(
        <InlineTimeEdit
          deviceId={mockDeviceId}
          estimatedUseUntil={futureDate}
        />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Update the time to a new future time
      const input = screen.getByLabelText("Set estimated use until time");
      const newFutureDate = new Date(Date.now() + 4 * oneHour); // 4 hours in future
      await user.clear(input);
      await user.type(input, newFutureDate.toISOString().slice(0, 16));

      // Get the form element
      const form = input.closest("form");
      expect(form).not.toBeNull();

      // Use fireEvent to submit the form properly
      fireEvent.submit(form!);

      // Check that the form action was called
      expect(mockFormAction).toHaveBeenCalled();
      // Check that the form data contains the correct values
      const formData = mockFormAction.mock.calls[0][0];
      expect(formData.get("deviceId")).toBe(mockDeviceId);
      expect(formData.get("estimatedTime")).toBe(
        newFutureDate.toISOString().slice(0, 16),
      );
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      const oneHour = 60 * 60 * 1000;
      const futureDate = new Date(Date.now() + oneHour);

      // Mock the useActionState to indicate loading state
      (React.useActionState as jest.Mock).mockImplementation(
        (action, initialState) => {
          return [initialState, jest.fn(), true]; // isPending = true
        },
      );

      render(
        <InlineTimeEdit
          deviceId={mockDeviceId}
          estimatedUseUntil={futureDate}
        />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      const loadingStateButton = screen.getByTitle("Updating...");
      // Check for loading spinner
      expect(loadingStateButton).toBeInTheDocument();
      expect(loadingStateButton).toBeDisabled();

      // Confirm button should not be in the dom during loading
      expect(screen.queryByTitle("Confirm time")).not.toBeInTheDocument();
    });

    it("displays server error when submission fails", async () => {
      const user = userEvent.setup();
      const oneHour = 60 * 60 * 1000;
      const futureDate = new Date(Date.now() + oneHour);

      // Mock the useActionState to return an error state
      const errorState = {
        message: "Server error occurred",
        error: "Server Error",
        updatedTime: undefined,
      };

      (React.useActionState as jest.Mock).mockImplementation(
        (_action, _initialState) => {
          return [errorState, jest.fn(), false];
        },
      );

      render(
        <InlineTimeEdit
          deviceId={mockDeviceId}
          estimatedUseUntil={futureDate}
        />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Check for error message
      expect(screen.getByText("**Server error occurred")).toBeInTheDocument();
    });

    //TODO:: flaky test - improve it
    it("updates display time when submission succeeds", async () => {
      const user = userEvent.setup();
      const oneHour = 60 * 60 * 1000;
      const futureDate = new Date(Date.now() + oneHour);
      const newDate = new Date(Date.now() + 2 * oneHour); // 2 hours in future

      // First render with normal state
      const { rerender } = render(
        <InlineTimeEdit
          deviceId={mockDeviceId}
          estimatedUseUntil={futureDate}
        />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Now mock a successful response
      const successState = {
        message: "",
        error: undefined,
        updatedTime: newDate.toISOString(),
      };

      (React.useActionState as jest.Mock).mockImplementation(
        (_action, _initialState) => {
          return [successState, jest.fn(), false];
        },
      );

      // Rerender to trigger the useEffect that responds to serverState changes
      rerender(
        <InlineTimeEdit
          deviceId={mockDeviceId}
          estimatedUseUntil={futureDate}
        />,
      );

      // Should exit edit mode and show the new time
      expect(
        screen.queryByLabelText("Set estimated use until time"),
      ).not.toBeInTheDocument();

      // // Format the expected date string for the assertion
      // // This is a bit tricky because the exact format depends on the locale and timezone
      // const formattedNewDate = newDate.toLocaleString("en-US", {
      //   year: "numeric",
      //   month: "short",
      //   day: "numeric",
      //   hour: "numeric",
      //   minute: "2-digit",
      //   hour12: true,
      // });

      // Check that the new time is displayed (using a partial match)
      const dateElements = screen.getAllByText((content) => {
        return (
          content.includes(newDate.getFullYear().toString()) &&
          content.includes(newDate.getDate().toString())
        );
      });
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  // 5. Keyboard Navigation Tests
  describe("Keyboard Navigation", () => {
    it.only("submits the form when pressing Enter in the input field", async () => {
      const user = userEvent.setup();
      const mockFormAction = jest.fn();
      const oneHour = 60 * 60 * 1000;
      const futureDate = new Date(Date.now() + oneHour);

      // Mock the useActionState to return our mock form action
      (React.useActionState as jest.Mock).mockImplementation(
        (action, initialState) => {
          return [initialState, mockFormAction, false];
        },
      );

      render(
        <InlineTimeEdit
          deviceId={"d9df82f94a462befde8d8a7d2a64fabf"}
          estimatedUseUntil={futureDate}
        />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Update the time to a new future time
      const input = screen.getByLabelText("Set estimated use until time");
      const newFutureDate = new Date(futureDate.getTime() + 3 * oneHour);
      await user.clear(input);
      await user.type(input, getDateTimeLocalValue(newFutureDate));

      // Press Enter in the input field
      await user.type(input, "{Enter}");

      // Check that the form action was called
      expect(mockFormAction).toHaveBeenCalled();
    });

    it("cancels editing when pressing Escape", async () => {
      const user = userEvent.setup();
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={mockDate} />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Press Escape
      await user.keyboard("{Escape}");

      // Should be back in view mode
      expect(
        screen.queryByLabelText("Set estimated use until time"),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument();
    });

    it("allows tabbing between input and buttons", async () => {
      const user = userEvent.setup();
      const oneHour = 60 * 60 * 1000;
      const futureDate = new Date(Date.now() + oneHour);
      render(
        <InlineTimeEdit
          deviceId={mockDeviceId}
          estimatedUseUntil={futureDate}
        />,
      );

      // Enter edit mode
      await user.click(screen.getByTitle("Edit time"));

      // Get the elements in expected tab order
      const input = screen.getByLabelText("Set estimated use until time");
      const confirmButton = screen.getByTitle("Confirm time");
      const cancelButton = screen.getByTitle("Cancel edit");

      // Check initial focus is on input
      expect(input).toHaveFocus();

      //change the input value to trigger validation and enable confirm button
      await user.clear(input);
      const newFutureDate = new Date(Date.now() + 3 * oneHour); // 24 hours in future
      await user.type(input, getDateTimeLocalValue(newFutureDate));

      // Tab to confirm button
      await user.tab();
      expect(confirmButton).toHaveFocus();

      // Tab to cancel button
      await user.tab();
      expect(cancelButton).toHaveFocus();
    });
  });

  // 6. Accessibility Tests
  describe("Accessibility", () => {
    it("has appropriate ARIA attributes", () => {
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={mockDate} />,
      );

      // Enter edit mode
      fireEvent.click(screen.getByTitle("Edit time"));

      // Input should have appropriate aria-label
      const input = screen.getByLabelText("Set estimated use until time");
      expect(input).toHaveAttribute(
        "aria-label",
        "Set estimated use until time",
      );

      // Error message should have role="alert" when present
      const clientError = "Time is required";
      fireEvent.change(input, { target: { value: "" } }); // Trigger error

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(clientError);
    });

    it("provides clear button titles for screen readers", async () => {
      // const user = userEvent.setup();
      const mockFormAction = jest.fn();
      (React.useActionState as jest.Mock).mockImplementation(
        (action, initialState) => {
          return [initialState, mockFormAction, false];
        },
      );
      const oneHour = 60 * 60 * 1000;
      const futureDate = new Date(Date.now() + oneHour);
      render(
        <InlineTimeEdit
          deviceId={mockDeviceId}
          estimatedUseUntil={futureDate}
        />,
      );
      // Check edit button has title
      expect(screen.getByTitle("Edit time")).toBeInTheDocument();

      // Enter edit mode
      fireEvent.click(screen.getByTitle("Edit time"));

      // Check confirm and cancel buttons have titles
      expect(screen.getByTitle("Confirm time")).toBeInTheDocument();
      expect(screen.getByTitle("Cancel edit")).toBeInTheDocument();
    });

    it("maintains focus management during interactions", async () => {
      const user = userEvent.setup();
      render(
        <InlineTimeEdit deviceId={mockDeviceId} estimatedUseUntil={mockDate} />,
      );

      // Enter edit mode by clicking edit button
      const editButton = screen.getByTitle("Edit time");
      await user.click(editButton);

      // Input should be focused automatically
      expect(
        screen.getByLabelText("Set estimated use until time"),
      ).toHaveFocus();

      // Cancel and return to view mode
      await user.click(screen.getByTitle("Cancel edit"));

      // Re-enter edit mode by clicking the time text
      await user.click(screen.getByText(/Jan 1, 2025/));

      // Input should be focused again
      expect(
        screen.getByLabelText("Set estimated use until time"),
      ).toHaveFocus();
    });
  });
});
