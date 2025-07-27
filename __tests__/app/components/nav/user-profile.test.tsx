import { UserProfile } from "@/components/custom/nav/user-profile";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";
import { signOut } from "next-auth/react";

// Mock the next-auth/react module
jest.mock("next-auth/react", () => ({
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const signOutMock = signOut as jest.Mock;

  it("renders UserProfileLoader when user is undefined", () => {
    render(<UserProfile user={undefined} />);

    // Should render the loader div with correct classes
    const loader = document.querySelector(".bg-muted-foreground");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass(
      "bg-muted-foreground",
      "relative",
      "h-8",
      "w-8",
      "animate-pulse",
      "cursor-pointer",
      "rounded-full",
      "transition-all",
      "duration-1000",
      "hover:scale-125",
    );
  });

  it("displays user initials when email is provided but user name is not", () => {
    render(<UserProfile user={{ email: "test@example.com" }} />);
    expect(screen.getByText("TE")).toBeInTheDocument();
  });

  it("displays user initials when name is provided but email is not", () => {
    render(<UserProfile user={{ name: "Jest User" }} />);
    expect(screen.getByText("JE")).toBeInTheDocument();
  });

  it("displays user initials from name when both name and email are provided", () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText("TE")).toBeInTheDocument();
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

  it("calls signOut with correct callback URL when sign out button is clicked", async () => {
    render(<UserProfile user={mockUser} />);

    // Open dropdown menu
    const button = screen.getByRole("button");
    await userEvent.click(button);

    // Click sign out button
    const signOutButton = screen.getByText("Sign out");
    await userEvent.click(signOutButton);

    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/auth/signin" });
  });

  it("handles user with only email correctly", () => {
    const userWithEmailOnly = { email: "user@test.com" };
    render(<UserProfile user={userWithEmailOnly} />);

    // Should show initials from email
    expect(screen.getByText("US")).toBeInTheDocument();
  });

  it("handles user with only name correctly", () => {
    const userWithNameOnly = { name: "John Doe" };
    render(<UserProfile user={userWithNameOnly} />);

    // Should show initials from name
    expect(screen.getByText("JO")).toBeInTheDocument();
  });
});
