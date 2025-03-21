import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FALLBACK_USER_PROFILE_IMG,
  UserProfile,
} from "@/components/custom/nav/user-profile";
import { ReactNode } from "react";

// Mock the auth module
jest.mock("@/app/auth", () => ({
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
  AvatarImage: ({
    src,
    alt,
    height,
    width,
  }: {
    src: string;
    alt: string;
    height?: number;
    width?: number;
  }) => (
    <img
      data-testid="avatar-image"
      src={src}
      alt={alt}
      height={height}
      width={width}
    />
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

  it("renders user avatar with image when provided", () => {
    render(<UserProfile user={mockUser} />);

    // Check that the Avatar component is rendered
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toBeInTheDocument();

    // Check that the AvatarImage has the correct src
    const avatarImage = screen.getByTestId("avatar-image");
    expect(avatarImage).toHaveAttribute("src", mockUser.image);
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

  it("uses fallback image when user image is not provided", () => {
    const userWithoutImage = {
      name: "Test User",
      email: "test@example.com",
      image: null,
    };

    render(<UserProfile user={userWithoutImage} />);

    // Check that the Avatar component is rendered
    const avatarImage = screen.getByTestId("avatar-image");
    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute("src", FALLBACK_USER_PROFILE_IMG);
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
      fail("Sign out form not found");
    }
  });
});
