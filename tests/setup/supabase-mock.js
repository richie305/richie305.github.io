const mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
  ascending: jest.fn().mockResolvedValue({ data: [], error: null }),
  descending: jest.fn().mockResolvedValue({ data: [], error: null }),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  insert: jest.fn().mockResolvedValue({ data: [], error: null }),
  update: jest.fn().mockResolvedValue({ data: [], error: null }),
  delete: jest.fn().mockResolvedValue({ data: [], error: null }),
};

global.supabase = mockSupabaseClient;
