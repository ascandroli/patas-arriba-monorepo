import { test, expect } from "@playwright/test";
import { SEED_ADMIN, SEED_USER } from "./global-setup.js";

/**
 * Happy path: Admin creates an event → User joins → User creates a car group →
 * Second user joins the event → Second user joins the car group.
 *
 * Uses API calls for login to get auth tokens, then sets them in localStorage
 * so the browser sessions are authenticated without going through the UI each time.
 */

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5005";

// Tomorrow's date for the event
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const eventDate = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

async function loginViaAPI(request, credential, password) {
  const response = await request.post(`${SERVER_URL}/api/auth/login`, {
    data: { credential, password },
  });
  const body = await response.json();
  return body.authToken;
}

async function authenticateInBrowser(page, token) {
  await page.goto("/");
  await page.evaluate((t) => localStorage.setItem("authToken", t), token);
  await page.reload();
}

test.describe("Happy path: Event lifecycle with car groups", () => {
  let adminToken;
  let userToken;
  let eventId;

  test.describe.configure({ mode: "serial" });

  test("admin logs in and creates an event", async ({ page, request }) => {
    adminToken = await loginViaAPI(request, SEED_ADMIN.email, SEED_ADMIN.password);
    await authenticateInBrowser(page, adminToken);

    // Navigate to create event
    await page.goto("/event/create");
    await expect(page.getByRole("heading", { name: "Crear Evento" })).toBeVisible();

    // Fill the event form
    // Category select
    await page.getByLabel("Categoria").click();
    await page.getByRole("option", { name: "Recogida" }).click();

    // Title
    await page.getByLabel("Título").fill("E2E Test Recogida");

    // Location
    await page.getByLabel("Lugar").fill("Madrid Centro");

    // Date
    await page.getByLabel("Fecha").fill(eventDate);

    // Time
    await page.getByLabel("Hora").fill("10:00");

    // Car organization
    await page.getByLabel("Requiere grupos de coches").click();
    await page.getByRole("option", { name: "Si, permitir organizarse en coches" }).click();

    // Task assignments
    await page.getByLabel("Requiere asignar tareas").click();
    await page.getByRole("option", { name: "No, el evento no requiere" }).click();

    // Submit
    const submitButton = page.getByRole("button", { name: "Crear Evento" });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Should redirect to the event details page
    await expect(page).toHaveURL(/\/event\/[a-f0-9]+/, { timeout: 10_000 });

    // Admin is auto-joined to the event
    await expect(page.getByText("¡Ya estas apuntado al evento!")).toBeVisible();

    // Extract the event ID from the URL for subsequent tests
    const url = page.url();
    eventId = url.split("/event/")[1];
  });

  test("user joins the event", async ({ page, request }) => {
    userToken = await loginViaAPI(request, SEED_USER.email, SEED_USER.password);
    await authenticateInBrowser(page, userToken);

    // Navigate to the event details
    await page.goto(`/event/${eventId}`);

    // Should see the join button
    const joinButton = page.getByRole("button", { name: "¡Unete al evento!" });
    await expect(joinButton).toBeVisible();
    await joinButton.click();

    // Should now show the "already joined" message
    await expect(page.getByText("¡Ya estas apuntado al evento!")).toBeVisible();

    // Should see the car group options since the event has car organization
    await expect(page.getByText("No tienes coche asignado")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Voy con mi coche" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Buscar coche" })
    ).toBeVisible();
  });

  test("user creates a car group", async ({ page, request }) => {
    userToken = userToken || await loginViaAPI(request, SEED_USER.email, SEED_USER.password);
    await authenticateInBrowser(page, userToken);

    // Navigate to the create car group page
    await page.goto(`/event/${eventId}/add-car-group`);
    await expect(page.getByText("Crea un grupo de coche")).toBeVisible();

    // Fill the car group form
    await page.getByLabel("Plazas disponibles").fill("3");
    await page.getByLabel("Marca y modelo del coche").fill("Toyota Corolla");
    await page.getByLabel("Color del coche").fill("Blanco");
    await page.getByLabel("Dirección de recogida").fill("Puerta del Sol");
    await page.getByLabel("Hora de recogida").fill("09:00");

    // Submit
    const submitButton = page.getByRole("button", {
      name: "Crear Grupo de coche",
    });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Should redirect back to event details
    await expect(page).toHaveURL(new RegExp(`/event/${eventId}`), {
      timeout: 10_000,
    });

    // Should now see the car group assigned
    await expect(page.getByText("¡Ya tienes un coche asignado!")).toBeVisible();
  });

  test("a second user signs up, gets activated, joins event, and joins the car group", async ({
    page,
    request,
  }) => {
    // Create a second user via API
    const uniqueId = Date.now();
    const secondUser = {
      email: `second-${uniqueId}@test.com`,
      username: `second${`${uniqueId}`.slice(-6)}`,
      fullName: "Second User",
      phoneCode: 34,
      phoneNumber: `7${`${uniqueId}`.slice(-8)}`,
      password: "SecondPass1",
    };

    // Sign up
    await request.post(`${SERVER_URL}/api/auth/signup`, {
      data: secondUser,
    });

    // Activate the user: admin sets role to "user"
    adminToken = adminToken || await loginViaAPI(request, SEED_ADMIN.email, SEED_ADMIN.password);

    // Find the user ID via the users list endpoint
    const usersResponse = await request.get(`${SERVER_URL}/api/user`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const users = await usersResponse.json();
    const newUser = users.find((u) => u.username === secondUser.username);

    // Activate: PATCH role validation
    await request.patch(
      `${SERVER_URL}/api/user/${newUser._id}/user-role-validation`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    // Login as second user
    const secondUserToken = await loginViaAPI(
      request,
      secondUser.email,
      secondUser.password
    );
    await authenticateInBrowser(page, secondUserToken);

    // Join the event
    await page.goto(`/event/${eventId}`);
    const joinButton = page.getByRole("button", { name: "¡Unete al evento!" });
    await expect(joinButton).toBeVisible();
    await joinButton.click();

    await expect(page.getByText("¡Ya estas apuntado al evento!")).toBeVisible();

    // Search for a car group
    await page.getByRole("button", { name: "Buscar coche" }).click();
    await expect(page).toHaveURL(
      new RegExp(`/event/${eventId}/search-car-group`),
      { timeout: 10_000 }
    );

    // Should see available car groups
    await expect(page.getByText("Coches disponibles")).toBeVisible();

    // Select the car group by clicking the + icon button
    await page.locator("[data-testid=AddIcon]").first().click();

    // Button text changes when a group is selected
    const joinCarButton = page.getByRole("button", {
      name: /Unete al grupo de coche/,
    });
    await expect(joinCarButton).toBeEnabled();
    await joinCarButton.click();

    // Should redirect back to event details
    await expect(page).toHaveURL(new RegExp(`/event/${eventId}`), {
      timeout: 10_000,
    });

    // Should now show the car group is assigned
    await expect(page.getByText("¡Ya tienes un coche asignado!")).toBeVisible();
  });
});