import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import Login from "../pages/LoginPage";
import { handleUserLogin } from "../handlers/authHandler";

vi.mock('../handlers/authHandler', () => ({
  handleUserLogin: vi.fn().mockResolvedValue({ accessToken: 'fake-token' }),
}));
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


describe("Login", () => {
  const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
  const setItemSpy = vi.fn();

  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: vi.fn((key: string) => store[key] || null),

      setItem: setItemSpy.mockImplementation(
        (key: string, value: string) => {
          store[key] = value;
        }
      ),

      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

  it("renders the login form", () => {
    renderLogin();

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Username or Email")
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText("Signup")).toBeInTheDocument();
  });

  it("updates input fields", () => {
    renderLogin();

    const identifier = screen.getByPlaceholderText("Username or Email");
    const password = screen.getByPlaceholderText("Password");

    fireEvent.change(identifier, {
      target: { value: "testuser" },
    });

    fireEvent.change(password, {
      target: { value: "password123" },
    });

    expect(identifier).toHaveValue("testuser");
    expect(password).toHaveValue("password123");
  });

  it("logs in successfully", async () => {
    vi.mocked(handleUserLogin).mockResolvedValue({
      accessToken: "fake-token",
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Username or Email"), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    await waitFor(() => {
      expect(handleUserLogin).toHaveBeenCalledWith(
        "testuser",
        "password123"
      );

      expect(setItemSpy).toHaveBeenCalledWith(
        "accessToken",
        "fake-token"
      );

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows server error message", async () => {
    vi.mocked(handleUserLogin).mockRejectedValue({
      response: {
        data: {
          msg: "Invalid credentials",
        },
      },
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Username or Email"), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrong" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Invalid credentials");
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows generic error when no server message exists", async () => {
    vi.mocked(handleUserLogin).mockRejectedValue(
      new Error("Network error")
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Username or Email"), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /login/i })
    );

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Login Failed");
    });
  });
});