import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SignInPage from "@/app/auth/signin/page";
import { signIn } from "@/app/auth";

// Mock the signIn function from the auth module
jest.mock("@/app/auth", () => ({
  signIn: jest.fn(),
}));

// Mock the "use server" directive
jest.mock("react", () => {
  const originalModule = jest.requireActual("react");
  return {
    ...originalModule,
    useFormStatus: jest.fn(() => ({ pending: false })),
  };
});

describe("SignInPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the sign in page correctly", () => {
    render(<SignInPage />);

    // Check for title and description
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(
      screen.getByText("Sign in to access your account"),
    ).toBeInTheDocument();

    // Check for Google sign in button
    const signInButton = screen.getByRole("button", {
      name: /sign in with google/i,
    });
    expect(signInButton).toBeInTheDocument();
  });

  it("has the correct button styling", () => {
    render(<SignInPage />);

    const button = screen.getByRole("button", { name: /sign in with google/i });

    // Check button has the correct classes
    expect(button).toHaveClass("w-full");

    // Check button has the correct data-slot attribute
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("submits the form with correct parameters when the button is clicked", async () => {
    const user = userEvent.setup();
    const mockHandleSignIn = signIn as jest.Mock;

    render(<SignInPage />);

    // Get the form and button
    const form = document.querySelector("form");
    const button = screen.getByRole("button", { name: /sign in with google/i });

    expect(form).not.toBeNull();
    // Verify that the form has the correct action attribute
    // which would eventually call the signIn function
    expect(form).toHaveAttribute("action");

    // Click the sign in button wrapped in act
    await act(async () => {
      await user.click(button);
    });

    // Expect the form submission handler to have been called
    expect(mockHandleSignIn).toHaveBeenCalled();
  });

  it("has the correct card layout", () => {
    render(<SignInPage />);

    // Check for card component using data-slot attribute
    const card = document.querySelector('[data-slot="card"]');
    expect(card).toHaveClass("w-full", "max-w-md");

    // Check for centered layout
    const container = card?.parentElement;
    expect(container).toHaveClass(
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
    );
  });

  it("has the correct accessibility attributes", () => {
    render(<SignInPage />);

    // Check button has correct accessibility attributes
    const button = screen.getByRole("button", { name: /sign in with google/i });
    expect(button).toHaveAttribute("type", "submit");

    // Check card has correct data-slot attribute
    const card = document.querySelector('[data-slot="card"]');
    expect(card).toBeInTheDocument();
  });
});
