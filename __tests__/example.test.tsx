import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("Example test", () => {
  it("renders a heading", () => {
    // Arrange
    render(<h1>Hello, Jest!</h1>);

    // Act
    const heading = screen.getByText("Hello, Jest!");

    // Assert
    expect(heading).toBeInTheDocument();
  });

  it("performs basic math", () => {
    expect(1 + 1).toBe(2);
  });
});
