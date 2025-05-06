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
  formatTimestamp,
  capitalize,
} from './app.js';

describe('Utility Functions', () => {
  test('formatTimestamp should format timestamps correctly', () => {
    const timestamp = 1620000000000; // May 3, 2021
    const formatted = formatTimestamp(timestamp);
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  test('capitalize should capitalize the first letter of a string', () => {
    expect(capitalize('test')).toBe('Test');
    expect(capitalize('TEST')).toBe('TEST');
    expect(capitalize('')).toBe('');
    expect(capitalize(null)).toBe('');
  });
});

export {
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
  formatTimestamp,
  capitalize,
};
