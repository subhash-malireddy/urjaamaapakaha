import { render, screen } from "@testing-library/react";
import { EmptyTableContent } from "@/components/custom/devices/empty-table-content";

describe("EmptyTableContent", () => {
  it("renders the message passed in props", () => {
    render(
      <table>
        <tbody>
          <EmptyTableContent colSpan={2} message="No items found" />
        </tbody>
      </table>,
    );

    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("applies the correct colspan to the cell", () => {
    render(
      <table>
        <tbody>
          <EmptyTableContent colSpan={4} message="Test message" />
        </tbody>
      </table>,
    );

    const cell = screen.getByText("Test message");
    expect(cell.getAttribute("colspan")).toBe("4");
  });

  it("applies the correct styling classes", () => {
    render(
      <table>
        <tbody>
          <EmptyTableContent colSpan={2} message="Test message" />
        </tbody>
      </table>,
    );

    const cell = screen.getByText("Test message");
    expect(cell).toHaveClass("text-muted-foreground", "h-24", "text-center");
  });
});
