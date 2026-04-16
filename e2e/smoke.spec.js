import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("home page loads and shows logo and buttons for anonymous users", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("img", { name: "logo" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Registrate" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Inicia Sesión" })
    ).toBeVisible();
    await expect(
      page.getByText(
        "En esta página podrás ver y participar en eventos de la fundación Patas Arriba"
      )
    ).toBeVisible();
  });

  test("navigating to /login shows the login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Acceso")).toBeVisible();
    await expect(
      page.getByLabel("Correo Electronico o Nombre de Usuario")
    ).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: "Accede" })).toBeDisabled();
  });

  test("navigating to /signup shows the registration form", async ({
    page,
  }) => {
    await page.goto("/signup");

    await expect(page.getByText("Registro")).toBeVisible();
    await expect(page.getByLabel("Correo Electronico")).toBeVisible();
    await expect(page.getByLabel("Nombre de Usuario")).toBeVisible();
    await expect(page.getByLabel("Nombre Completo")).toBeVisible();
    await expect(page.getByLabel("Número de Móvil")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "registrate" })
    ).toBeDisabled();
  });

  test("unknown routes show 404 page", async ({ page }) => {
    await page.goto("/nonexistent-page");

    await expect(page.getByText(/no encontrad|not found/i)).toBeVisible();
  });

  test("protected routes redirect anonymous users", async ({ page }) => {
    await page.goto("/event");

    // OnlyPrivate redirects to /login
    await expect(page).toHaveURL(/\/login/);
  });
});