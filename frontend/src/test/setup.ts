import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia; components that read viewport
// breakpoints via useMediaQuery need a stub so they don't throw in tests.
// Defaults to "no match" (desktop); override window.matchMedia per-test to
// exercise a mobile/tablet branch.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
