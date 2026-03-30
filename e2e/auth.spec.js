import { test, expect } from "@playwright/test";
import { SEED_USER } from "./global-setup.js";

const uniqueSuffix = `${Date.now()}`.slice(-6);
const TEST_USER = {
  email: `e2e-${uniqueSuffix}@test.com`,
  username: `e2e${uniqueSuffix}`,
  fullName: "Test User",
  phoneCode: "34",
  phoneNumber: `6${uniqueSuffix}000`,
  password: "TestPass1",
};

test.describe("Signup flow", () => {
  test("can fill and submit the signup form", async ({ page }) => {
    await page.goto("/signup");

    await page.getByLabel("Correo Electronico").first().fill(TEST_USER.email);
    await page.getByLabel("Nombre de Usuario").fill(TEST_USER.username);
    await page.getByLabel("Nombre Completo").fill(TEST_USER.fullName);
    await page.getByLabel("Número de Móvil").fill(TEST_USER.phoneNumber);
    // "Contraseña" matches both password fields; use first() for password, last() for confirm
    await page.getByLabel("Contraseña").first().fill(TEST_USER.password);
    await page.getByLabel("Confirmar Contraseña").fill(TEST_USER.password);

    const submitButton = page.getByRole("button", { name: "registrate" });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // After successful signup, redirects to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test("signup shows validation errors for invalid email", async ({ page }) => {
    await page.goto("/signup");

    const emailField = page.getByLabel("Correo Electronico").first();
    await emailField.fill("invalid-email");
    await emailField.blur();

    await expect(page.getByText("Formato incorrecto")).toBeVisible();
  });

  test("signup shows validation errors for weak password", async ({ page }) => {
    await page.goto("/signup");

    const passwordField = page.getByLabel("Contraseña").first();
    await passwordField.fill("weak");
    await passwordField.blur();

    await expect(
      page.getByText(/al menos 6 caractéres/i)
    ).toBeVisible();
  });
});

test.describe("Login flow", () => {
  test("login with non-existent user shows error", async ({ page }) => {
    await page.goto("/login");

    await page
      .getByLabel("Correo Electronico o Nombre de Usuario")
      .fill("nonexistent@test.com");
    await page.getByLabel("Contraseña").fill("SomePass1");

    await page.getByRole("button", { name: "Accede" }).click();

    await expect(
      page.getByRole("alert")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("login with wrong password shows error", async ({ page, request }) => {
    // First create a user via API
    const uniqueId = Date.now();
    const user = {
      email: `logintest-${uniqueId}@test.com`,
      username: `logintest${uniqueId}`,
      fullName: "Login Test",
      phoneCode: 34,
      phoneNumber: `${uniqueId}`.slice(-9),
      password: "CorrectPass1",
    };

    const serverURL = process.env.SERVER_URL || "http://localhost:5005";
    await request.post(`${serverURL}/api/auth/signup`, { data: user });

    await page.goto("/login");
    await page
      .getByLabel("Correo Electronico o Nombre de Usuario")
      .fill(user.email);
    await page.getByLabel("Contraseña").fill("WrongPass1");
    await page.getByRole("button", { name: "Accede" }).click();

    // User is "pending" so we expect a role-related or password error
    await expect(
      page.getByRole("alert")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("submit button is disabled until both fields are filled", async ({
    page,
  }) => {
    await page.goto("/login");

    const submitButton = page.getByRole("button", { name: "Accede" });
    await expect(submitButton).toBeDisabled();

    await page
      .getByLabel("Correo Electronico o Nombre de Usuario")
      .fill("someone@test.com");
    await expect(submitButton).toBeDisabled();

    await page.getByLabel("Contraseña").fill("SomePass1");
    await expect(submitButton).toBeEnabled();
  });
});

test.describe("Successful login", () => {
  test("can log in with a valid activated user and see the home page", async ({
    page,
  }) => {
    await page.goto("/login");

    await page
      .getByLabel("Correo Electronico o Nombre de Usuario")
      .fill(SEED_USER.email);
    await page.getByLabel("Contraseña").fill(SEED_USER.password);

    await page.getByRole("button", { name: "Accede" }).click();

    // After login, should redirect to home and show logged-in content
    await expect(page).toHaveURL("/", { timeout: 10_000 });

    // The home page should show upcoming events instead of the welcome screen
    await expect(
      page.getByRole("button", { name: "Inicia Sesión" })
    ).not.toBeVisible();
  });
});

test.describe("Navigation guards", () => {
  test("anonymous user accessing /event is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/event");
    await expect(page).toHaveURL(/\/login/);
  });

  test("anonymous user accessing /user/own is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/user/own");
    await expect(page).toHaveURL(/\/login/);
  });
});