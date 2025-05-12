import { render, screen } from "@testing-library/react";
import { LogoAndTitle } from "../../../../src/components/custom/nav/logo";

describe("Logo Component", () => {
  test("renders the logo correctly", () => {
    render(<LogoAndTitle />);

    // Check if the logo is in the document
    const logoElement = screen.getByText(/Urjaamapakaha/i);
    expect(logoElement).toBeInTheDocument();

    // Check if the link is present
    const linkElement = screen.getByRole("link", { name: /Urjaamapakaha/i });
    expect(linkElement).toHaveAttribute("href", "/");

    // Check if the letter 'U' is present
    const letterElement = screen.getByText(/^U$/i);
    expect(letterElement).toBeInTheDocument();
  });
});
