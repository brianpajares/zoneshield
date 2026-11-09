import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("checks a suspicious message and shows actionable signals", async ({ page }) => {
  await page.goto("/es");
  await page
    .getByLabel("Mensaje o enlace sospechoso")
    .fill("Tu cuenta será bloqueada. Ingresa tu clave: https://bancoandin0-seguro.top/login");
  await page.getByRole("button", { name: "Analizar señales" }).click();
  await expect(page.getByRole("heading", { name: "Varias señales de riesgo" })).toBeVisible();
  await expect(page.getByText("El dominio podría imitar una marca conocida")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué hacer ahora" })).toBeVisible();
});

test("shows useful controls on a 360px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/es");
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  await expect(page.getByRole("button", { name: "Cómo funciona" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }).getByRole("button", { name: "Probar gratis" }),
  ).toBeVisible();
  const pageWidth = await page.locator("body").evaluate((element) => element.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(360);
});

test("has no serious accessibility findings in its starting state @a11y", async ({ page }) => {
  await page.goto("/es");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
});

test("serves each language and rejects unsupported routes", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/es$/);
  for (const locale of ["es", "en", "pt"]) {
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response?.headers()["x-frame-options"]).toBe("DENY");
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
  }
  const missing = await page.goto("/fr");
  expect(missing?.status()).toBe(404);
});

test("keeps the analyzed message and suspicious URL off the network", async ({ page }) => {
  await page.goto("/es");
  const marker = "private-message-74926";
  const requests: string[] = [];
  page.on("request", (request) => requests.push(`${request.url()} ${request.postData() ?? ""}`));
  await page
    .getByLabel("Mensaje o enlace sospechoso")
    .fill(`Tu cuenta será bloqueada. Ingresa tu clave: https://bancoandin0-seguro.top/login?secret=${marker}`);
  await page.getByRole("button", { name: "Analizar señales" }).click();
  await expect(page.getByRole("heading", { name: "Varias señales de riesgo" })).toBeVisible();
  await page.getByLabel("Mensaje o enlace sospechoso").fill("Gracias por tu mensaje.");
  await expect(page.getByRole("heading", { name: "Varias señales de riesgo" })).toHaveCount(0);
  await page.getByRole("button", { name: "Limpiar" }).click();
  await expect(page.getByLabel("Mensaje o enlace sospechoso")).toHaveValue("");
  expect(requests.filter((request) => request.includes(marker) || request.includes("bancoandin0-seguro"))).toEqual([]);
});
