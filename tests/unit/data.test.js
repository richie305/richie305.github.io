import {
  fetchFoodLogs,
  fetchBathroomLogs,
  addFoodLog,
  addBathroomLog,
  updateFoodLog,
  updateBathroomLog,
  deleteFoodLog,
  deleteBathroomLog,
  fetchFavorites,
  addFavorite,
  updateFavorite,
  deleteFavorite,
} from "../../app.js";

describe("Data Functions", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("Food Logs", () => {
    test("fetchFoodLogs returns empty array when no data", async () => {
      const logs = await fetchFoodLogs();
      expect(logs).toEqual([]);
      expect(global.supabase.from).toHaveBeenCalledWith("food_logs");
    });

    test("addFoodLog calls insert with correct data", async () => {
      const log = {
        type: "kibble",
        quantity: "1 cup",
        stolen: false,
        location: "kitchen",
        timestamp: Date.now(),
      };
      await addFoodLog(log);
      expect(global.supabase.from).toHaveBeenCalledWith("food_logs");
      expect(global.supabase.insert).toHaveBeenCalledWith([log]);
    });
  });

  describe("Bathroom Logs", () => {
    test("fetchBathroomLogs returns empty array when no data", async () => {
      const logs = await fetchBathroomLogs();
      expect(logs).toEqual([]);
      expect(global.supabase.from).toHaveBeenCalledWith("bathroom_logs");
    });

    test("addBathroomLog calls insert with correct data", async () => {
      const log = {
        type: "pee",
        location: "outside",
        size: "small",
        consistency: "normal",
        timestamp: Date.now(),
      };
      await addBathroomLog(log);
      expect(global.supabase.from).toHaveBeenCalledWith("bathroom_logs");
      expect(global.supabase.insert).toHaveBeenCalledWith([log]);
    });
  });

  describe("Favorites", () => {
    test("fetchFavorites returns empty array when no data", async () => {
      const favorites = await fetchFavorites();
      expect(favorites).toEqual([]);
      expect(global.supabase.from).toHaveBeenCalledWith("favorites");
    });

    test("addFavorite calls insert with correct data", async () => {
      const favorite = {
        name: "Morning routine",
        type: "pee",
        location: "outside",
        size: "small",
        consistency: "normal",
      };
      await addFavorite(favorite);
      expect(global.supabase.from).toHaveBeenCalledWith("favorites");
      expect(global.supabase.insert).toHaveBeenCalledWith([favorite]);
    });
  });
});
