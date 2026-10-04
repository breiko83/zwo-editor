import { renderHook, act } from '@testing-library/react-hooks';
import { useWorkoutState } from '../useWorkoutState';
import { HISTORY_COALESCE_MS, HISTORY_LIMIT } from '../useWorkoutHistory';
import { BarType } from '../../../../types/workout';

const bar = (id: string, time = 300): BarType => ({
  id,
  time,
  type: 'bar',
  power: 1,
  cadence: 0,
});

describe('useWorkoutHistory (via useWorkoutState)', () => {
  let now: number;
  let nowSpy: jest.SpyInstance;

  // Simulate a separate user action, outside of the coalescing window
  const later = () => {
    now += HISTORY_COALESCE_MS + 1;
  };

  beforeEach(() => {
    localStorage.clear();
    now = 1000000;
    nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it('starts with nothing to undo or redo', () => {
    const { result } = renderHook(() => useWorkoutState('test-id'));

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('undoes and redoes bar changes', () => {
    const { result } = renderHook(() => useWorkoutState('test-id'));

    act(() => result.current.setBars([bar('a')]));
    later();
    act(() => result.current.setBars([bar('a'), bar('b')]));

    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.bars.map((b) => b.id)).toEqual(['a']);
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.bars).toEqual([]);
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.redo());
    act(() => result.current.redo());
    expect(result.current.bars.map((b) => b.id)).toEqual(['a', 'b']);
    expect(result.current.canRedo).toBe(false);
  });

  it('restores instructions and metadata together with bars', () => {
    const { result } = renderHook(() => useWorkoutState('test-id'));

    act(() => {
      result.current.setBars([bar('a')]);
      result.current.setInstructions([{ id: 'i1', text: 'Go', time: 0, length: 0 }]);
      result.current.setName('My workout');
    });
    later();
    act(() => result.current.resetWorkout());

    expect(result.current.bars).toEqual([]);

    act(() => result.current.undo());
    expect(result.current.bars.map((b) => b.id)).toEqual(['a']);
    expect(result.current.instructions.map((i) => i.id)).toEqual(['i1']);
    expect(result.current.name).toBe('My workout');
  });

  it('groups rapid successive changes (e.g. dragging) into one undo step', () => {
    const { result } = renderHook(() => useWorkoutState('test-id'));

    act(() => result.current.setBars([bar('a', 300)]));
    later();
    act(() => result.current.setBars([bar('a', 310)]));
    now += 50;
    act(() => result.current.setBars([bar('a', 320)]));
    now += 50;
    act(() => result.current.setBars([bar('a', 330)]));

    act(() => result.current.undo());
    expect(result.current.bars[0].time).toBe(300);
  });

  it('clears redo stack after a new change', () => {
    const { result } = renderHook(() => useWorkoutState('test-id'));

    act(() => result.current.setBars([bar('a')]));
    later();
    act(() => result.current.setBars([bar('a'), bar('b')]));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.setBars([bar('c')]));
    expect(result.current.canRedo).toBe(false);
  });

  it('does not record the restored state as a new change', () => {
    const { result } = renderHook(() => useWorkoutState('test-id'));

    act(() => result.current.setBars([bar('a')]));
    later();
    act(() => result.current.undo());

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('bumps the history revision on undo and redo', () => {
    const { result } = renderHook(() => useWorkoutState('test-id'));
    const initial = result.current.historyRevision;

    act(() => result.current.setBars([bar('a')]));
    expect(result.current.historyRevision).toBe(initial);

    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.historyRevision).toBe(initial + 2);
  });

  it('limits the number of undo steps', () => {
    const { result } = renderHook(() => useWorkoutState('test-id'));

    for (let i = 0; i < HISTORY_LIMIT + 10; i++) {
      later();
      act(() => result.current.setBars([bar(`b${i}`)]));
    }

    let steps = 0;
    while (result.current.canUndo) {
      act(() => result.current.undo());
      steps++;
    }
    expect(steps).toBe(HISTORY_LIMIT);
  });
});
