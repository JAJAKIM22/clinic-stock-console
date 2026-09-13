import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "./client";
import { getProducts } from "./products";

vi.mock("./client", () => ({
  apiFetch: vi
    .fn()
    .mockResolvedValue({ products: [], total: 0, skip: 0, limit: 10 }),
}));

describe("getProducts", () => {
  it("hits the plain list endpoint with limit/skip pagination when no search or category is set", async () => {
    await getProducts({ page: 2 });

    const calledPath = vi.mocked(apiFetch).mock.calls[0][0];
    expect(calledPath).toContain("/products?");
    expect(calledPath).toContain("limit=10");
    expect(calledPath).toContain("skip=10"); // page 2 -> skip 10 at 10/page
  });

  it("hits the category endpoint when only a category is set", async () => {
    await getProducts({ category: "furniture", page: 1 });

    const calledPath = vi.mocked(apiFetch).mock.calls[0][0];
    expect(calledPath).toContain("/products/category/furniture?");
  });

  it("prefers search over category when both are set, per the documented API limitation", async () => {
    // DummyJSON doesn't expose one endpoint that accepts both q and
    // category together — getProducts has to pick one. This test locks
    // in the documented decision (search wins) so a future change to that
    // precedence is a deliberate, visible one rather than an accident.
    await getProducts({ q: "chair", category: "furniture", page: 1 });

    const calledPath = vi.mocked(apiFetch).mock.calls[0][0];
    expect(calledPath).toContain("/products/search?");
    expect(calledPath).toContain("q=chair");
    expect(calledPath).not.toContain("/products/category/");
  });
});
