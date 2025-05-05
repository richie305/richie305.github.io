import "@testing-library/jest-dom";

// Set test environment flag
global.window = {
  ...global.window,
  isTestEnvironment: true,
};

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockResolvedValue({ data: [], error: null }),
  update: jest.fn().mockResolvedValue({ data: [], error: null }),
  delete: jest.fn().mockResolvedValue({ data: [], error: null }),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: [], error: null }),
};

// Mock window.supabase
global.supabase = mockSupabase;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock navigator.geolocation
const geolocationMock = {
  getCurrentPosition: jest.fn(),
};
global.navigator.geolocation = geolocationMock;

// Mock document
document.body.innerHTML = '<div id="root"></div>';
