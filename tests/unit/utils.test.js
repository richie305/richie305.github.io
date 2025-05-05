import { capitalize, formatTimestamp } from "../../app.js";

describe("Utility Functions", () => {
  describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
      expect(capitalize("test")).toBe("Test");
      expect(capitalize("hello world")).toBe("Hello world");
    });

    it("should handle empty strings", () => {
      expect(capitalize("")).toBe("");
    });

    it("should handle null or undefined", () => {
      expect(capitalize(null)).toBe("");
      expect(capitalize(undefined)).toBe("");
    });
  });

  describe("formatTimestamp", () => {
    it("should format timestamp correctly", () => {
      const timestamp = Date.now();
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Matches date format
      expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/); // Matches time format
    });
  });
});
