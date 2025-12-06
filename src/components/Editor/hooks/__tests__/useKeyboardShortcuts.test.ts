import { renderHook } from '@testing-library/react-hooks';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let removeBar: jest.Mock;
  let addTimeToBar: jest.Mock;
  let removeTimeToBar: jest.Mock;
  let addPowerToBar: jest.Mock;
  let removePowerToBar: jest.Mock;

  beforeEach(() => {
    removeBar = jest.fn();
    addTimeToBar = jest.fn();
    removeTimeToBar = jest.fn();
    addPowerToBar = jest.fn();
    removePowerToBar = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not trigger shortcuts when actionId is undefined', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        actionId: undefined,
        removeBar,
        addTimeToBar,
        removeTimeToBar,
        addPowerToBar,
        removePowerToBar,
      })
    );

    // Press various keys
    const event = new KeyboardEvent('keydown', { keyCode: 8 });
    window.dispatchEvent(event);

    expect(removeBar).not.toHaveBeenCalled();
  });

  it('should call removeBar on Backspace (keyCode 8)', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        actionId: 'bar-1',
        removeBar,
        addTimeToBar,
        removeTimeToBar,
        addPowerToBar,
        removePowerToBar,
      })
    );

    const event = new KeyboardEvent('keydown', { keyCode: 8, bubbles: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(removeBar).toHaveBeenCalledWith('bar-1');
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should call removeTimeToBar on Left Arrow (keyCode 37)', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        actionId: 'bar-1',
        removeBar,
        addTimeToBar,
        removeTimeToBar,
        addPowerToBar,
        removePowerToBar,
      })
    );

    const event = new KeyboardEvent('keydown', { keyCode: 37 });
    window.dispatchEvent(event);

    expect(removeTimeToBar).toHaveBeenCalledWith('bar-1');
  });

  it('should call addTimeToBar on Right Arrow (keyCode 39)', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        actionId: 'bar-1',
        removeBar,
        addTimeToBar,
        removeTimeToBar,
        addPowerToBar,
        removePowerToBar,
      })
    );

    const event = new KeyboardEvent('keydown', { keyCode: 39 });
    window.dispatchEvent(event);

    expect(addTimeToBar).toHaveBeenCalledWith('bar-1');
  });

  it('should call addPowerToBar on Up Arrow (keyCode 38)', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        actionId: 'bar-1',
        removeBar,
        addTimeToBar,
        removeTimeToBar,
        addPowerToBar,
        removePowerToBar,
      })
    );

    const event = new KeyboardEvent('keydown', { keyCode: 38 });
    window.dispatchEvent(event);

    expect(addPowerToBar).toHaveBeenCalledWith('bar-1');
  });

  it('should call removePowerToBar on Down Arrow (keyCode 40)', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        actionId: 'bar-1',
        removeBar,
        addTimeToBar,
        removeTimeToBar,
        addPowerToBar,
        removePowerToBar,
      })
    );

    const event = new KeyboardEvent('keydown', { keyCode: 40 });
    window.dispatchEvent(event);

    expect(removePowerToBar).toHaveBeenCalledWith('bar-1');
  });

  it('should ignore key presses from input elements', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        actionId: 'bar-1',
        removeBar,
        addTimeToBar,
        removeTimeToBar,
        addPowerToBar,
        removePowerToBar,
      })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { keyCode: 8, bubbles: true });
    Object.defineProperty(event, 'target', { value: input, writable: false });
    input.dispatchEvent(event);

    expect(removeBar).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should ignore key presses from textarea elements', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        actionId: 'bar-1',
        removeBar,
        addTimeToBar,
        removeTimeToBar,
        addPowerToBar,
        removePowerToBar,
      })
    );

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    const event = new KeyboardEvent('keydown', { keyCode: 8, bubbles: true });
    Object.defineProperty(event, 'target', { value: textarea, writable: false });
    textarea.dispatchEvent(event);

    expect(removeBar).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('should not trigger callbacks for unrecognized keys', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        actionId: 'bar-1',
        removeBar,
        addTimeToBar,
        removeTimeToBar,
        addPowerToBar,
        removePowerToBar,
      })
    );

    // Press a random key (e.g., keyCode 65 for 'A')
    const event = new KeyboardEvent('keydown', { keyCode: 65 });
    window.dispatchEvent(event);

    expect(removeBar).not.toHaveBeenCalled();
    expect(addTimeToBar).not.toHaveBeenCalled();
    expect(removeTimeToBar).not.toHaveBeenCalled();
    expect(addPowerToBar).not.toHaveBeenCalled();
    expect(removePowerToBar).not.toHaveBeenCalled();
  });

  it('should update event listeners when actionId changes', () => {
    const { rerender } = renderHook(
      ({ actionId }) =>
        useKeyboardShortcuts({
          actionId,
          removeBar,
          addTimeToBar,
          removeTimeToBar,
          addPowerToBar,
          removePowerToBar,
        }),
      { initialProps: { actionId: 'bar-1' } }
    );

    // Trigger with initial actionId
    let event = new KeyboardEvent('keydown', { keyCode: 37 });
    window.dispatchEvent(event);
    expect(removeTimeToBar).toHaveBeenCalledWith('bar-1');

    // Change actionId
    removeTimeToBar.mockClear();
    rerender({ actionId: 'bar-2' });

    // Trigger with new actionId
    event = new KeyboardEvent('keydown', { keyCode: 37 });
    window.dispatchEvent(event);
    expect(removeTimeToBar).toHaveBeenCalledWith('bar-2');
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        actionId: 'bar-1',
        removeBar,
        addTimeToBar,
        removeTimeToBar,
        addPowerToBar,
        removePowerToBar,
      })
    );

    unmount();

    // Trigger event after unmount
    const event = new KeyboardEvent('keydown', { keyCode: 37 });
    window.dispatchEvent(event);

    expect(removeTimeToBar).not.toHaveBeenCalled();
  });
});
