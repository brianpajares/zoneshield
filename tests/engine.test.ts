import { describe, expect, it } from "vitest";
import { extractUrl, score } from "../lib/engine";
import cases from "./casos-de-prueba.json";

describe("ZoneShield v1 deterministic engine", () => {
  it.each(cases)("$id", (testCase) => {
    expect(score(testCase.input)).toEqual(testCase.expected);
  });

  it("keeps every probability finite and inside its valid range", () => {
    for (const input of [
      {},
      { message: "" },
      { message: "URGENTE paga con Pix y comparte tu código" },
      { url: "https://example.com" },
      { message: "a".repeat(100_000) },
    ]) {
      const result = score(input);
      expect(Number.isFinite(result.probability)).toBe(true);
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(1);
    }
  });

  it("extracts links without sending the surrounding message anywhere", () => {
    expect(extractUrl("Revisa esto: https://acceso.example/pago.")).toBe("https://acceso.example/pago");
    expect(extractUrl("No hay enlace aquí")).toBe("");
  });
});
