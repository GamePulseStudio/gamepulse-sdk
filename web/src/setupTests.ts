// Jest setup file for Gamepulse Web SDK tests

// Mock fetch for testing
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeEach(() => {
  // Reset fetch mock before each test
  (fetch as jest.Mock).mockClear();
  
  // Mock console methods
  console.warn = jest.fn();
  console.error = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  // Restore console methods after each test
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.log = originalConsole.log;
});

// Helper function to mock successful fetch responses
export const mockFetchSuccess = (data: any = {}, status = 200) => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
};

// Helper function to mock fetch errors
export const mockFetchError = (error: Error) => {
  (fetch as jest.Mock).mockRejectedValueOnce(error);
};

// Helper function to mock network failures
export const mockNetworkError = () => {
  mockFetchError(new Error('Network error'));
};
