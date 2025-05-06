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
    beforeEach(() => {
      global.supabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
    });

    test("fetchFavorites returns empty array when no data", async () => {
      global.supabase.select.mockResolvedValue({ data: [], error: null });
      const favorites = await fetchFavorites();
      expect(favorites).toEqual([]);
      expect(global.supabase.from).toHaveBeenCalledWith("favorites");
      expect(global.supabase.select).toHaveBeenCalledWith("*");
      expect(global.supabase.order).toHaveBeenCalledWith("id", {
        ascending: true,
      });
    });

    test("fetchFavorites returns data when available", async () => {
      const mockFavorites = [
        {
          id: 1,
          name: "Morning Bathroom",
          type: "bathroom",
          location: "outside",
        },
        { id: 2, name: "Breakfast", type: "food", location: "inside" },
      ];
      global.supabase.select.mockResolvedValue({
        data: mockFavorites,
        error: null,
      });
      const favorites = await fetchFavorites();
      expect(favorites).toEqual(mockFavorites);
    });

    test("addFavorite calls insert with correct data", async () => {
      const favorite = {
        name: "Morning Bathroom",
        type: "bathroom",
        location: "outside",
        size: "medium",
        consistency: "normal",
      };
      global.supabase.insert.mockResolvedValue({
        data: [favorite],
        error: null,
      });
      await addFavorite(favorite);
      expect(global.supabase.from).toHaveBeenCalledWith("favorites");
      expect(global.supabase.insert).toHaveBeenCalledWith([favorite]);
    });

    test("updateFavorite calls update with correct data", async () => {
      const favorite = {
        id: 1,
        name: "Updated Name",
        type: "food",
        location: "inside",
      };
      global.supabase.update.mockResolvedValue({ data: favorite, error: null });
      await updateFavorite(1, favorite);
      expect(global.supabase.from).toHaveBeenCalledWith("favorites");
      expect(global.supabase.update).toHaveBeenCalledWith(favorite);
      expect(global.supabase.eq).toHaveBeenCalledWith("id", 1);
    });

    test("deleteFavorite calls delete with correct id", async () => {
      global.supabase.delete.mockResolvedValue({ data: null, error: null });
      await deleteFavorite(1);
      expect(global.supabase.from).toHaveBeenCalledWith("favorites");
      expect(global.supabase.delete).toHaveBeenCalled();
      expect(global.supabase.eq).toHaveBeenCalledWith("id", 1);
    });

    test("addFavorite throws error when insert fails", async () => {
      const error = new Error("Insert failed");
      global.supabase.insert.mockResolvedValue({ data: null, error });
      await expect(addFavorite({ name: "Test" })).rejects.toThrow(
        "Insert failed",
      );
    });

    test("updateFavorite throws error when update fails", async () => {
      const error = new Error("Update failed");
      global.supabase.update.mockResolvedValue({ data: null, error });
      await expect(updateFavorite(1, { name: "Test" })).rejects.toThrow(
        "Update failed",
      );
    });

    test("deleteFavorite throws error when delete fails", async () => {
      const error = new Error("Delete failed");
      global.supabase.delete.mockResolvedValue({ data: null, error });
      await expect(deleteFavorite(1)).rejects.toThrow("Delete failed");
    });
  });
});
