import { render, screen } from "@testing-library/react";
import { LogoAndTitle } from "../../../../src/components/custom/nav/logo-title";

describe("Logo Component", () => {
  test("renders the logo correctly", () => {
    render(<LogoAndTitle />);

    // Check if the App title is in the document
    const appTitleElement = screen.getByText(/Urjaamapakaha/i);
    expect(appTitleElement).toBeInTheDocument();

    // Check if the link is present
    const linkElement = screen.getByRole("link", { name: /Urjaamapakaha/i });
    expect(linkElement).toHaveAttribute("href", "/");

    // Check if the logo is present
    const logoElement = screen.getByTestId("logo");
    expect(logoElement).toBeInTheDocument();
  });
});
