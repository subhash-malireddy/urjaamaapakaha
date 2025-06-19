import { render, screen, within } from "@testing-library/react";
import UsageSummary from "@/components/custom/usage/usage-summary";

describe("UsageSummary", () => {
  const defaultProps = {
    userConsumption: 50,
    totalConsumption: 100,
    timePeriod: "Today",
    isFetchingData: false,
    isDataAvailable: true,
    selectedDeviceAlias: "All",
  };

  describe("Initial render", () => {
    it("renders both mobile and desktop views", () => {
      render(<UsageSummary {...defaultProps} />);

      const desktopView = screen.getByTestId("desktop-view");
      const mobileView = screen.getByTestId("mobile-view");

      expect(desktopView).toBeInTheDocument();
      expect(mobileView).toBeInTheDocument();
      expect(desktopView).toHaveClass("hidden", "md:grid");
      expect(mobileView).toHaveClass("md:hidden");
    });

    it("renders all three cards with titles", () => {
      render(<UsageSummary {...defaultProps} />);

      expect(screen.getByText("Your Consumption")).toBeInTheDocument();
      expect(screen.getByText("Total Consumption")).toBeInTheDocument();
      expect(screen.getByText("Your Share")).toBeInTheDocument();
    });

    it("displays consumption values correctly across both mobile and desktop views", () => {
      render(<UsageSummary {...defaultProps} />);

      const desktopView = screen.getByTestId("desktop-view");
      const mobileView = screen.getByTestId("mobile-view");

      //check user consumption values in both views
      expect(desktopView).toHaveTextContent("50.00 kWh");
      const mobileUserKwh = within(mobileView).getByText("50.00");
      expect(mobileUserKwh.nextSibling).toHaveTextContent("Your kWh");

      //check total consumption values in both views
      expect(desktopView).toHaveTextContent("100.00 kWh");
      const mobileTotalKwh = within(mobileView).getByText("100.00");
      expect(mobileTotalKwh.nextSibling).toHaveTextContent("Total kWh");

      //check your share values in both views
      expect(desktopView).toHaveTextContent("50.0%");
      const mobileYourShare = within(mobileView).getByText("50.0%");
      expect(mobileYourShare.nextSibling).toHaveTextContent("Your share");
    });

    it("shows time period information", () => {
      render(<UsageSummary {...defaultProps} />);

      expect(screen.getByText("For today")).toBeInTheDocument();
    });

    it("shows device information for all devices", () => {
      render(<UsageSummary {...defaultProps} />);

      expect(screen.getByText("All devices combined")).toBeInTheDocument();
    });

    it("shows device information for specific device", () => {
      const props = {
        ...defaultProps,
        selectedDeviceAlias: "Kitchen Light",
      };

      render(<UsageSummary {...props} />);

      expect(screen.getByText("For Kitchen Light")).toBeInTheDocument();
    });
  });

  describe("Loading states", () => {
    it("shows loading when isFetchingData is true", () => {
      const props = {
        ...defaultProps,
        isFetchingData: true,
      };

      render(<UsageSummary {...props} />);

      const loadingElements = screen.getAllByRole("generic");
      const animatingElements = loadingElements.filter((el) =>
        el.className.includes("animate-pulse"),
      );

      expect(animatingElements.length).toBeGreaterThan(0);
    });

    it("shows loading when isDataAvailable is false", () => {
      const props = {
        ...defaultProps,
        isDataAvailable: false,
      };

      render(<UsageSummary {...props} />);

      const loadingElements = screen.getAllByRole("generic");
      const animatingElements = loadingElements.filter((el) =>
        el.className.includes("animate-pulse"),
      );

      expect(animatingElements.length).toBeGreaterThan(0);
    });
  });

  describe("Efficiency calculations", () => {
    it("shows excellent efficiency for usage <= 50%", () => {
      const props = {
        ...defaultProps,
        userConsumption: 25,
        totalConsumption: 100,
      };

      render(<UsageSummary {...props} />);

      expect(screen.getByText("excellent")).toBeInTheDocument();
      expect(screen.getByText("excellent")).toHaveClass(
        "font-medium text-green-700 dark:text-green-600",
      );
    });

    it("shows good efficiency for usage between 50% and 75%", () => {
      const props = {
        ...defaultProps,
        userConsumption: 60,
        totalConsumption: 100,
      };

      render(<UsageSummary {...props} />);

      expect(screen.getByText("good")).toBeInTheDocument();
      expect(screen.getByText("good")).toHaveClass(
        "font-medium text-yellow-700 dark:text-yellow-600",
      );
    });

    it("shows needs attention for usage > 75%", () => {
      const props = {
        ...defaultProps,
        userConsumption: 80,
        totalConsumption: 100,
      };

      render(<UsageSummary {...props} />);

      expect(screen.getByText("needs attention")).toBeInTheDocument();
      expect(screen.getByText("needs attention")).toHaveClass(
        "font-medium text-red-700 dark:text-red-600",
      );
    });

    it("applies efficiency colors to mobile view percentage", () => {
      const props = {
        ...defaultProps,
        userConsumption: 25,
        totalConsumption: 100,
      };

      render(<UsageSummary {...props} />);

      const mobileView = screen.getByTestId("mobile-view");
      const percentageElement = mobileView.querySelector(".text-green-700");
      expect(percentageElement).toBeInTheDocument();
      expect(percentageElement).toHaveTextContent("25.0%");
    });
  });

  describe("Edge cases", () => {
    it("handles zero total consumption", () => {
      const props = {
        ...defaultProps,
        userConsumption: 10,
        totalConsumption: 0,
      };

      render(<UsageSummary {...props} />);

      const percentageElements = screen.getAllByText("0.0%");
      expect(percentageElements).toHaveLength(2); //both mobile and desktop view
      expect(screen.getByText("excellent")).toBeInTheDocument();
    });

    it("handles decimal values correctly", () => {
      const props = {
        ...defaultProps,
        userConsumption: 12.345,
        totalConsumption: 56.789,
      };

      render(<UsageSummary {...props} />);

      expect(screen.getByText("12.35 kWh")).toBeInTheDocument();
      expect(screen.getByText("56.79 kWh")).toBeInTheDocument();
    });
  });
});
