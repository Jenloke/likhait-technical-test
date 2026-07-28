/**
 * Breakpoint hooks backing the app's inline-style responsive branches.
 * Inline React.CSSProperties can't express @media queries, so components
 * branch on these booleans instead.
 */

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handleChange = () => setMatches(mql.matches);

    handleChange();
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

// The desktop layout assumes a fixed 360px sidebar plus a 12-across month
// grid that doesn't reflow below its content's intrinsic width — below this,
// that combination no longer fits and the compact layout takes over instead.
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}
