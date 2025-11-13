// useProfile Hook Tests
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile } from '@/lib/hooks/useProfile';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useProfile Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches profile data successfully', async () => {
    const mockProfile = {
      id: 'test-user-id',
      display_name: 'Test User',
      pronouns: 'they/them',
      bio: 'Test bio',
      interests: ['hiking', 'coding'],
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useProfile('test-user-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProfile);
  });

  it('handles errors correctly', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Profile not found'),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useProfile('invalid-user-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
