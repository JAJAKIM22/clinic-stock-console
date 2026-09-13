import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  it("does not update immediately when the input value changes", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });

    // Before the debounce delay elapses, the hook should still report the
    // previous value — this is the whole point of debouncing the search
    // input: it must not fire a request for every keystroke.
    expect(result.current).toBe("a");
    vi.useRealTimers();
  });

  it("updates to the latest value once the delay elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("ab");
    vi.useRealTimers();
  });

  it("resets the timer on rapid successive changes, only committing the final value", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: "abc" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Total elapsed time is 400ms, but the second change reset the timer,
    // so only 200ms has passed since the *last* change — the debounced
    // value should still be the original, not "ab" or "abc".
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("abc");
    vi.useRealTimers();
  });
});
