import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "../pages/SignUpPage";
import { handleUserSignup } from "../handlers/authHandler";
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("../handlers/authHandler", () => ({
  handleUserSignup: vi.fn(),
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

const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

describe("Signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  const renderSignup = () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
  };

  test("renders the signup form", () => {
    renderSignup();
    expect(screen.getByRole("heading", { name: "register" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create_user/i })).toBeInTheDocument();
    expect(screen.getByText(/\[ have access\? \]/i)).toBeInTheDocument();
    expect(screen.getByText("login")).toBeInTheDocument();
  });

  test("updates input fields on change", () => {
    renderSignup();
    const usernameInput = screen.getByPlaceholderText("username");
    const emailInput = screen.getByPlaceholderText("email");
    const passwordInput = screen.getByPlaceholderText("password");

    fireEvent.change(usernameInput, { target: { value: "johndoe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });

    expect(usernameInput).toHaveValue("johndoe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(passwordInput).toHaveValue("secret123");
  });

  test("submits form and navigates on success", async () => {
    const mockData = { accessToken: "fake-token" };
    (handleUserSignup as vi.Mock).mockResolvedValue(mockData);

    renderSignup();

    fireEvent.change(screen.getByPlaceholderText("username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create_user/i }));

    await waitFor(() => {
      expect(handleUserSignup).toHaveBeenCalledWith("johndoe", "john@example.com", "secret123");
    });

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('accessToken', 'fake-token');
    });
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("shows alert on signup failure", async () => {
    const errorMsg = "Username already taken";
    (handleUserSignup as vi.Mock).mockRejectedValue({
      response: { data: { msg: errorMsg } },
    });

    renderSignup();

    fireEvent.change(screen.getByPlaceholderText("username"), {
      target: { value: "takenuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "taken@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "password" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create_user/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(errorMsg);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows generic alert if error has no response data", async () => {
    (handleUserSignup as vi.Mock).mockRejectedValue(new Error("Network error"));

    renderSignup();

    fireEvent.change(screen.getByPlaceholderText("username"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "password" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create_user/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Signup Failed");
    });
  });
});