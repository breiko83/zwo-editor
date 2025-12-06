import { renderHook, act } from '@testing-library/react-hooks';
import { useFirebaseSync } from '../useFirebaseSync';
import { BarType, Instruction } from '../../Editor';

// Mock Firebase
jest.mock('../../../firebase', () => ({
  firebaseApp: {},
}));

const mockOnValue = jest.fn();
const mockUpdate = jest.fn();
const mockRef = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockSignOut = jest.fn();

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({})),
  onValue: (...args: any[]) => mockOnValue(...args),
  ref: (...args: any[]) => mockRef(...args),
  update: (...args: any[]) => mockUpdate(...args),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
}));

// Mock xmlService
jest.mock('../../../../services/xmlService', () => ({
  xmlService: {
    createWorkoutXml: jest.fn(() => '<workout_file></workout_file>'),
  },
}));

describe('useFirebaseSync', () => {
  let setAuthor: jest.Mock;
  let setName: jest.Mock;
  let setDescription: jest.Mock;
  let setBars: jest.Mock;
  let setInstructions: jest.Mock;
  let setTags: jest.Mock;
  let setDurationType: jest.Mock;
  let setSportType: jest.Mock;
  let setMessage: jest.Mock;
  let setUser: jest.Mock;

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      clear: () => {
        store = {};
      },
    };
  })();

  // Mock window.history
  const mockReplaceState = jest.fn();

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    Object.defineProperty(window.history, 'replaceState', {
      value: mockReplaceState,
      writable: true,
    });
  });

  beforeEach(() => {
    setAuthor = jest.fn();
    setName = jest.fn();
    setDescription = jest.fn();
    setBars = jest.fn();
    setInstructions = jest.fn();
    setTags = jest.fn();
    setDurationType = jest.fn();
    setSportType = jest.fn();
    setMessage = jest.fn();
    setUser = jest.fn();

    localStorage.clear();
    jest.clearAllMocks();

    // Default mock implementations
    mockOnValue.mockImplementation((ref, callback) => {
      callback({ val: () => null });
      return jest.fn(); // unsubscribe function
    });

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn(); // unsubscribe function
    });
  });

  describe('Initialization', () => {
    it('should show loading message on mount', () => {
      renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      expect(setMessage).toHaveBeenCalledWith({
        visible: true,
        class: 'loading',
        text: 'Loading..',
      });
    });

    it('should update URL history with workout id', () => {
      renderHook(() =>
        useFirebaseSync({
          id: 'test-id-123',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      expect(mockReplaceState).toHaveBeenCalledWith('', '', '/editor/test-id-123');
    });

    it('should load workout from Firebase when it exists', () => {
      const mockWorkout = {
        author: 'Test Author',
        name: 'Test Workout',
        description: 'Test Description',
        workout: [{ id: '1', type: 'bar', time: 300, power: 0.75, cadence: 85 }],
        instructions: [{ id: '1', text: 'Test', time: 0, length: 0 }],
        tags: ['test', 'easy'],
        durationType: 'time',
        sportType: 'bike',
      };

      mockOnValue.mockImplementation((ref, callback) => {
        callback({ val: () => mockWorkout });
        return jest.fn();
      });

      renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      expect(setAuthor).toHaveBeenCalledWith('Test Author');
      expect(setName).toHaveBeenCalledWith('Test Workout');
      expect(setDescription).toHaveBeenCalledWith('Test Description');
      expect(setBars).toHaveBeenCalledWith(mockWorkout.workout);
      expect(setInstructions).toHaveBeenCalledWith(mockWorkout.instructions);
      expect(setTags).toHaveBeenCalledWith(['test', 'easy']);
      expect(setDurationType).toHaveBeenCalledWith('time');
      expect(setSportType).toHaveBeenCalledWith('bike');
      expect(setMessage).toHaveBeenCalledWith({ visible: false });
      expect(localStorage.getItem('id')).toBe('test-id');
    });

    it('should handle when workout does not exist on server and is new', () => {
      localStorage.setItem('id', 'different-id');

      mockOnValue.mockImplementation((ref, callback) => {
        callback({ val: () => null });
        return jest.fn();
      });

      renderHook(() =>
        useFirebaseSync({
          id: 'new-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      expect(setBars).toHaveBeenCalledWith([]);
      expect(setInstructions).toHaveBeenCalledWith([]);
      expect(setName).toHaveBeenCalledWith('');
      expect(setDescription).toHaveBeenCalledWith('');
      expect(setAuthor).toHaveBeenCalledWith('');
      expect(setTags).toHaveBeenCalledWith([]);
      expect(localStorage.getItem('id')).toBe('new-id');
    });

    it('should not reset workout when refreshing with same id', () => {
      localStorage.setItem('id', 'test-id');

      mockOnValue.mockImplementation((ref, callback) => {
        callback({ val: () => null });
        return jest.fn();
      });

      renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      // Should not reset workout data
      expect(setBars).not.toHaveBeenCalled();
      expect(setInstructions).not.toHaveBeenCalled();
      expect(setMessage).toHaveBeenCalledWith({ visible: false });
    });

    it('should handle auth state changes', () => {
      const mockUser = { uid: 'user-123', email: 'test@example.com' };

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return jest.fn();
      });

      renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      expect(setUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('saveWorkout', () => {
    it('should save workout to Firebase when user is logged in', async () => {
      mockUpdate.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      const mockUser = { uid: 'user-123' } as any;
      const bars: BarType[] = [{ id: '1', type: 'bar', time: 300, power: 0.75, cadence: 85 }];
      const instructions: Instruction[] = [{ id: '1', text: 'Test', time: 0, length: 0 }];

      await act(async () => {
        await result.current.saveWorkout(
          mockUser,
          'Test Author',
          'Test Workout',
          'Test Description',
          'bike',
          'time',
          ['test'],
          bars,
          instructions
        );
      });

      expect(setMessage).toHaveBeenCalledWith({
        visible: true,
        class: 'loading',
        text: 'Saving..',
      });

      expect(mockUpdate).toHaveBeenCalled();
      expect(setMessage).toHaveBeenCalledWith({
        visible: true,
        class: 'success',
        text: 'Workout saved!',
      });
    });

    it('should throw error when user is not logged in', async () => {
      const { result } = renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      await expect(
        result.current.saveWorkout(null, 'Author', 'Name', 'Desc', 'bike', 'time', [], [], [])
      ).rejects.toThrow('User must be logged in to save');
    });

    it('should show error message when save fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockUpdate.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      const mockUser = { uid: 'user-123' } as any;

      await act(async () => {
        await result.current.saveWorkout(
          mockUser,
          'Author',
          'Name',
          'Desc',
          'bike',
          'time',
          [],
          [],
          []
        );
      });

      expect(setMessage).toHaveBeenCalledWith({
        visible: true,
        class: 'error',
        text: 'Cannot save workout',
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteWorkout', () => {
    it('should delete workout from Firebase when user is logged in', async () => {
      mockUpdate.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      const mockUser = { uid: 'user-123' } as any;
      const onSuccess = jest.fn();

      await act(async () => {
        await result.current.deleteWorkout(mockUser, onSuccess);
      });

      expect(mockUpdate).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should not delete when user is not logged in', async () => {
      const { result } = renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      const onSuccess = jest.fn();
      await result.current.deleteWorkout(null, onSuccess);

      expect(mockUpdate).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should show error message when delete fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockUpdate.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      const mockUser = { uid: 'user-123' } as any;
      const onSuccess = jest.fn();

      await act(async () => {
        await result.current.deleteWorkout(mockUser, onSuccess);
      });

      expect(setMessage).toHaveBeenCalledWith({
        visible: true,
        class: 'error',
        text: 'Cannot delete workout',
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('should sign out user', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      await result.current.logout();

      expect(mockSignOut).toHaveBeenCalled();
      expect(setUser).toHaveBeenCalledWith(null);
    });

    it('should handle logout errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSignOut.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      await result.current.logout();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from Firebase listeners on unmount', () => {
      const unsubscribeOnValue = jest.fn();
      const unsubscribeAuth = jest.fn();

      mockOnValue.mockReturnValue(unsubscribeOnValue);
      mockOnAuthStateChanged.mockReturnValue(unsubscribeAuth);

      const { unmount } = renderHook(() =>
        useFirebaseSync({
          id: 'test-id',
          setAuthor,
          setName,
          setDescription,
          setBars,
          setInstructions,
          setTags,
          setDurationType,
          setSportType,
          setMessage,
          setUser,
        })
      );

      unmount();

      expect(unsubscribeOnValue).toHaveBeenCalled();
      expect(unsubscribeAuth).toHaveBeenCalled();
    });
  });
});
