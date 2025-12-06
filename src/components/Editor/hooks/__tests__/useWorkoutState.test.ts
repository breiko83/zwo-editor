import { renderHook, act } from '@testing-library/react-hooks';
import { useWorkoutState } from '../useWorkoutState';
import { BarType, Instruction } from '../../Editor';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useWorkoutState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with default values when localStorage is empty', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      expect(result.current.id).toBe('test-id');
      expect(result.current.bars).toEqual([]);
      expect(result.current.ftp).toBe(200);
      expect(result.current.weight).toBe(75);
      expect(result.current.instructions).toEqual([]);
      expect(result.current.tags).toEqual([]);
      expect(result.current.name).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.author).toBe('');
      expect(result.current.sportType).toBe('bike');
      expect(result.current.durationType).toBe('time');
      expect(result.current.paceUnitType).toBe('metric');
    });

    it('should initialize with values from localStorage', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 300, power: 0.75, cadence: 85 },
      ];
      const instructions: Instruction[] = [
        { id: '1', text: 'Test instruction', time: 0, length: 0 },
      ];

      localStorage.setItem('currentWorkout', JSON.stringify(bars));
      localStorage.setItem('ftp', '250');
      localStorage.setItem('weight', '80');
      localStorage.setItem('instructions', JSON.stringify(instructions));
      localStorage.setItem('tags', JSON.stringify(['test', 'easy']));
      localStorage.setItem('name', 'Test Workout');
      localStorage.setItem('description', 'Test Description');
      localStorage.setItem('author', 'Test Author');
      localStorage.setItem('sportType', 'run');
      localStorage.setItem('durationType', 'distance');
      localStorage.setItem('paceUnitType', 'imperial');

      const { result } = renderHook(() => useWorkoutState('test-id'));

      expect(result.current.bars).toEqual(bars);
      expect(result.current.ftp).toBe(250);
      expect(result.current.weight).toBe(80);
      expect(result.current.instructions).toEqual(instructions);
      expect(result.current.tags).toEqual(['test', 'easy']);
      expect(result.current.name).toBe('Test Workout');
      expect(result.current.description).toBe('Test Description');
      expect(result.current.author).toBe('Test Author');
      expect(result.current.sportType).toBe('run');
      expect(result.current.durationType).toBe('distance');
      expect(result.current.paceUnitType).toBe('imperial');
    });

    it('should load running times from localStorage', () => {
      const runningTimes = {
        oneMile: '6:00',
        fiveKm: '20:00',
        tenKm: '42:00',
        halfMarathon: '1:30:00',
        marathon: '3:15:00',
      };

      localStorage.setItem('runningTimes', JSON.stringify(runningTimes));

      const { result } = renderHook(() => useWorkoutState('test-id'));

      expect(result.current.runningTimes).toEqual(runningTimes);
    });

    it('should fallback to old localStorage keys for running times', () => {
      localStorage.setItem('oneMileTime', '6:00');
      localStorage.setItem('fiveKmTime', '20:00');
      localStorage.setItem('tenKmTime', '42:00');
      localStorage.setItem('halfMarathonTime', '1:30:00');
      localStorage.setItem('marathonTime', '3:15:00');

      const { result } = renderHook(() => useWorkoutState('test-id'));

      expect(result.current.runningTimes).toEqual({
        oneMile: '6:00',
        fiveKm: '20:00',
        tenKm: '42:00',
        halfMarathon: '1:30:00',
        marathon: '3:15:00',
      });
    });
  });

  describe('State Updates', () => {
    it('should update id', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setId('new-id');
      });

      expect(result.current.id).toBe('new-id');
    });

    it('should update bars and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      const newBars: BarType[] = [
        { id: '1', type: 'bar', time: 300, power: 0.75, cadence: 85 },
      ];

      act(() => {
        result.current.setBars(newBars);
      });

      expect(result.current.bars).toEqual(newBars);
      expect(localStorage.getItem('currentWorkout')).toBe(JSON.stringify(newBars));
    });

    it('should update ftp and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setFtp(250);
      });

      expect(result.current.ftp).toBe(250);
      expect(localStorage.getItem('ftp')).toBe('250');
    });

    it('should update weight and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setWeight(80);
      });

      expect(result.current.weight).toBe(80);
      expect(localStorage.getItem('weight')).toBe('80');
    });

    it('should update instructions and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      const newInstructions: Instruction[] = [
        { id: '1', text: 'New instruction', time: 0, length: 0 },
      ];

      act(() => {
        result.current.setInstructions(newInstructions);
      });

      expect(result.current.instructions).toEqual(newInstructions);
      expect(localStorage.getItem('instructions')).toBe(JSON.stringify(newInstructions));
    });

    it('should update tags and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setTags(['test', 'hard']);
      });

      expect(result.current.tags).toEqual(['test', 'hard']);
      expect(localStorage.getItem('tags')).toBe(JSON.stringify(['test', 'hard']));
    });

    it('should update name and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setName('New Workout Name');
      });

      expect(result.current.name).toBe('New Workout Name');
      expect(localStorage.getItem('name')).toBe('New Workout Name');
    });

    it('should update description and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setDescription('New Description');
      });

      expect(result.current.description).toBe('New Description');
      expect(localStorage.getItem('description')).toBe('New Description');
    });

    it('should update author and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setAuthor('New Author');
      });

      expect(result.current.author).toBe('New Author');
      expect(localStorage.getItem('author')).toBe('New Author');
    });

    it('should update sportType and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setSportType('run');
      });

      expect(result.current.sportType).toBe('run');
      expect(localStorage.getItem('sportType')).toBe('run');
    });

    it('should update durationType and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setDurationType('distance');
      });

      expect(result.current.durationType).toBe('distance');
      expect(localStorage.getItem('durationType')).toBe('distance');
    });

    it('should update paceUnitType and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setPaceUnitType('imperial');
      });

      expect(result.current.paceUnitType).toBe('imperial');
      expect(localStorage.getItem('paceUnitType')).toBe('imperial');
    });

    it('should update runningTimes and persist to localStorage', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      const newRunningTimes = {
        oneMile: '5:30',
        fiveKm: '19:00',
        tenKm: '40:00',
        halfMarathon: '1:25:00',
        marathon: '3:00:00',
      };

      act(() => {
        result.current.setRunningTimes(newRunningTimes);
      });

      expect(result.current.runningTimes).toEqual(newRunningTimes);
      expect(localStorage.getItem('runningTimes')).toBe(JSON.stringify(newRunningTimes));
    });

    it('should update actionId', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      act(() => {
        result.current.setActionId('bar-1');
      });

      expect(result.current.actionId).toBe('bar-1');
    });

    it('should update selectedInstruction', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      const instruction: Instruction = { id: '1', text: 'Test', time: 100, length: 0 };

      act(() => {
        result.current.setSelectedInstruction(instruction);
      });

      expect(result.current.selectedInstruction).toEqual(instruction);
    });
  });

  describe('resetWorkout', () => {
    it('should reset workout to empty state', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      // Set some initial state
      act(() => {
        result.current.setBars([{ id: '1', type: 'bar', time: 300, power: 0.75, cadence: 85 }]);
        result.current.setInstructions([{ id: '1', text: 'Test', time: 0, length: 0 }]);
        result.current.setName('Test Workout');
        result.current.setDescription('Test Description');
        result.current.setAuthor('Test Author');
        result.current.setTags(['test']);
      });

      // Reset
      act(() => {
        result.current.resetWorkout();
      });

      expect(result.current.bars).toEqual([]);
      expect(result.current.instructions).toEqual([]);
      expect(result.current.name).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.author).toBe('');
      expect(result.current.tags).toEqual([]);
    });

    it('should reset workout state', () => {
      const { result } = renderHook(() => useWorkoutState('test-id'));

      // Set some initial state
      act(() => {
        result.current.setBars([{ id: '1', type: 'bar', time: 300, power: 0.75, cadence: 85 }]);
        result.current.setInstructions([{ id: '1', text: 'Test', time: 0, length: 0 }]);
        result.current.setName('Test Workout');
        result.current.setDescription('Test Description');
        result.current.setAuthor('Test Author');
        result.current.setTags(['test']);
      });

      // Reset
      act(() => {
        result.current.resetWorkout();
      });

      // Check that state is reset
      expect(result.current.bars).toEqual([]);
      expect(result.current.instructions).toEqual([]);
      expect(result.current.name).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.author).toBe('');
      expect(result.current.tags).toEqual([]);
    });
  });
});
