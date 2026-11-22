import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BusinessForm } from "./BusinessForm";
import { businessFormDefaults, type BusinessFormValues } from "./schema";

afterEach(() => {
  cleanup();
});

describe("BusinessForm", () => {
  it("renders the required field labels", () => {
    render(<BusinessForm submitLabel="Save" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("Business name")).toBeTruthy();
    expect(screen.getByLabelText("Owner name")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Phone")).toBeTruthy();
    expect(screen.getByLabelText("City")).toBeTruthy();
  });

  it("shows a name error and does not submit an empty form", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BusinessForm submitLabel="Save" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Business name is required")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit once with the parsed values when the form is valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<BusinessForm submitLabel="Save" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Spice Corner" } });
    fireEvent.change(screen.getByLabelText("Owner name"), { target: { value: "Asha Rao" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "Asha@Example.com" } });
    fireEvent.change(screen.getByLabelText("Phone"), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText("State"), { target: { value: "Karnataka" } });
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Bengaluru" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const values = onSubmit.mock.calls[0][0] as BusinessFormValues;
    expect(values.name).toBe("Spice Corner");
    expect(values.email).toBe("asha@example.com");
    expect(values.country).toBe(businessFormDefaults.country);
  });
});
