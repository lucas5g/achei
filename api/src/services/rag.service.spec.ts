import { describe, expect, it } from "bun:test";
import { RagService } from "./rag.service";

describe("RagService", async () => {

  const service = new RagService()


  it("should be ok", () => {
    expect(true).toBe(true);
  });
});