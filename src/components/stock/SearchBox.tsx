"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const DEBOUNCE_MS = 350;

export function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  // Raw value updates instantly so typing feels responsive; only the
  // debounced value gets written to the URL (and therefore the query key),
  // which is what protects against showing stale results for a query the
  // user has already replaced (requirement #1).
  const [prevExternalValue, setPrevExternalValue] = useState(value);
  const [rawValue, setRawValue] = useState(value);

  // Resync the local buffer when the external (URL) value changes from
  // somewhere other than our own debounce below — e.g. the back button, or
  // a filter reset that also clears q. Adjusted during render, following
  // React's guidance for state derived from props, rather than via an
  // effect (which would cause an extra render pass and trip the
  // set-state-in-effect lint rule for no benefit here).
  if (value !== prevExternalValue) {
    setPrevExternalValue(value);
    setRawValue(value);
  }

  const debouncedValue = useDebouncedValue(rawValue, DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <Input
      type="search"
      value={rawValue}
      onChange={(e) => setRawValue(e.target.value)}
      placeholder="Search stock items..."
      aria-label="Search stock items"
      className="w-full"
    />
  );
}
