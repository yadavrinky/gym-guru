import { render, screen } from "@testing-library/react";
import Navigation from "../components/Navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Navigation", () => {
  it("hides on public routes", () => {
    const { usePathname } = require("next/navigation") as { usePathname: jest.Mock };
    usePathname.mockReturnValue("/");

    const { container } = render(<Navigation />);
    expect(container.firstChild).toBeNull();
  });

  it("renders app links on protected routes", () => {
    const { usePathname } = require("next/navigation") as { usePathname: jest.Mock };
    usePathname.mockReturnValue("/dashboard");

    render(<Navigation />);
    expect(screen.getByText("GYM GURU")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /analytics/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ai trainer/i })).toBeInTheDocument();
  });
});

