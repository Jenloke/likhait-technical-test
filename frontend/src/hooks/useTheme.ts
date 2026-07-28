/**
 * Custom hook backing the hidden theme picker. No Context — mirrors the
 * app's existing hook style (useMediaQuery, useCategories): local state
 * plus a side effect, safe for more than one component to call since they
 * all read/write the same localStorage key and DOM attribute.
 */

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_THEME_ID, THEMES, ThemeId } from "../constants/themes";

const STORAGE_KEY = "expense-tracker-theme";

function isThemeId(value: string | null): value is ThemeId {
  return value !== null && THEMES.some((theme) => theme.id === value);
}

function readStoredTheme(): ThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isThemeId(stored) ? stored : DEFAULT_THEME_ID;
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
  }, []);

  return { theme, setTheme, themes: THEMES };
}
