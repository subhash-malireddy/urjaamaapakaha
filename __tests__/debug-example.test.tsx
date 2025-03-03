import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// This is a simple component for demonstration purposes
const Counter = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);

  // This function can be debugged by setting a breakpoint here
  const increment = () => {
    // You can set a breakpoint here to inspect the count value
    const newCount = count + 1;
    setCount(newCount);
    return newCount;
  };

  // This function can be debugged by setting a breakpoint here
  const decrement = () => {
    // You can set a breakpoint here to inspect the count value
    const newCount = count - 1;
    setCount(newCount);
    return newCount;
  };

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment} data-testid="increment">
        Increment
      </button>
      <button onClick={decrement} data-testid="decrement">
        Decrement
      </button>
    </div>
  );
};

describe("Counter Component (Debugging Example)", () => {
  it("increments the count when the increment button is clicked", () => {
    // Arrange
    render(<Counter initialCount={5} />);

    // You can set a breakpoint here to inspect the initial state
    expect(screen.getByText("Count: 5")).toBeInTheDocument();

    // Act
    fireEvent.click(screen.getByTestId("increment"));

    // You can set a breakpoint here to inspect the updated state
    // Assert
    expect(screen.getByText("Count: 6")).toBeInTheDocument();
  });

  it("decrements the count when the decrement button is clicked", () => {
    // Arrange
    render(<Counter initialCount={10} />);

    // You can set a breakpoint here to inspect the initial state
    expect(screen.getByText("Count: 10")).toBeInTheDocument();

    // Act
    fireEvent.click(screen.getByTestId("decrement"));

    // You can set a breakpoint here to inspect the updated state
    // Assert
    expect(screen.getByText("Count: 9")).toBeInTheDocument();
  });

  // This test demonstrates how to debug complex logic
  it("demonstrates debugging with complex logic", () => {
    // This is a function with complex logic that you might want to debug
    const complexCalculation = (a: number, b: number): number => {
      // You can set a breakpoint here to inspect the input values
      const result = a * b + Math.pow(a, 2) - Math.sqrt(b);
      // You can set a breakpoint here to inspect the result
      return result;
    };

    // You can set a breakpoint here to see the test execution
    const result = complexCalculation(3, 4);

    // You can set a breakpoint here to inspect the assertion
    expect(result).toBeCloseTo(14.0, 1);
  });
});
