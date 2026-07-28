import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PieChart } from "./PieChart";

describe("PieChart", () => {
  const data = [
    { label: "Food", value: 60, color: "#dc1e32", count: 3, icon: "🍔" },
    { label: "Bills", value: 40, color: "#fa6414", count: 1, icon: "📄" },
  ];

  it("renders a legend row per slice with label, count and formatted value", () => {
    render(<PieChart data={data} formatValue={(v) => `$${v.toFixed(2)}`} />);

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Bills")).toBeInTheDocument();
    expect(screen.getByText("$60.00")).toBeInTheDocument();
    expect(screen.getByText("$40.00")).toBeInTheDocument();
    expect(screen.getByText("3×")).toBeInTheDocument();
    expect(screen.getByText("1×")).toBeInTheDocument();
  });

  it("renders the center label and value when provided", () => {
    render(
      <PieChart
        data={data}
        formatValue={(v) => `$${v.toFixed(2)}`}
        centerValue="$100.00"
        centerLabel="4 transactions"
      />,
    );

    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText("4 transactions")).toBeInTheDocument();
  });

  it("renders nothing for an empty/zero-total dataset", () => {
    const { container } = render(
      <PieChart data={[]} formatValue={(v) => `$${v}`} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("draws one arc segment per slice", () => {
    const { container } = render(
      <PieChart data={data} formatValue={(v) => `$${v.toFixed(2)}`} />,
    );

    expect(container.querySelectorAll("circle")).toHaveLength(data.length);
  });
});
