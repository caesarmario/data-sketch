import { asciiSkeletonHTML } from 'ascii-reveal/core';

// Deterministic library markup is identical during prerender and hydration.
// CSS is scoped locally instead of duplicating the library stylesheet per image.
export const asciiPlaceholderHTML = asciiSkeletonHTML({
  variant: 'dither', rows: 64, animate: false, css: false,
});
