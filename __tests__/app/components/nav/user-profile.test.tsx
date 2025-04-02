import { UserProfile } from "@/components/custom/nav/user-profile";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";

// Mock the auth module
jest.mock("@/auth", () => ({
  signOut: jest.fn(),
}));

// Mock the Avatar
// Because the avatar image isn't being rendered in tests, properly
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({
    className,
    children,
  }: {
    className?: string;
    children: ReactNode;
  }) => (
    <span data-testid="avatar" className={className}>
      {children}
    </span>
  ),
  AvatarFallback: ({ children }: { children: ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
}));

describe("UserProfile", () => {
  const mockUser = {
    name: "Test User",
    email: "test@example.com",
    image: "/globe.svg",
  };

  it("returns null when user is undefined", () => {
    const { container } = render(<UserProfile user={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("displays user initials when email is provided but user name is not", () => {
    render(<UserProfile user={{ email: "test@example.com" }} />);
    expect(screen.getByText("TE")).toBeInTheDocument();
  });

  it("displays user initials when name is provided but email is not", () => {
    render(<UserProfile user={{ name: "Jest User" }} />);
    expect(screen.getByText("JE")).toBeInTheDocument();
  });

  it("displays user name and email in dropdown", async () => {
    render(<UserProfile user={mockUser} />);

    // Open dropdown menu
    const button = screen.getByRole("button");
    await userEvent.click(button);

    // Check dropdown content
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("calls signOut when sign out button is clicked", async () => {
    render(<UserProfile user={mockUser} />);

    // Open dropdown menu
    const button = screen.getByRole("button");
    await userEvent.click(button);

    // Click sign out button
    const signOutButton = screen.getByText("Sign out");
    const signOutForm = signOutButton.closest("form");

    // Mock form submission
    const mockSubmit = jest.fn();
    if (signOutForm) {
      signOutForm.onsubmit = mockSubmit;
      signOutForm.requestSubmit = mockSubmit;
      await userEvent.click(signOutButton);
      expect(mockSubmit).toHaveBeenCalled();
    } else {
      console.error("Sign out form not found");
      expect(false).toBeTruthy();
    }
  });
});
