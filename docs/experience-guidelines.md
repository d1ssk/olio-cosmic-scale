# Internationalization, accessibility, and visual design

## Japanese and English

Support `ja` and `en` from the first shared component. User-visible prose uses translation keys; explanatory content is parallel in meaning rather than mechanically literal. Mathematical/unit symbols (`m`, `AU`, `ly`, `pc`, `kpc`, `Mpc`, `Gpc`) are not translated.

Language resolution is URL parameter, saved preference, browser language, then Japanese. Manual selection persists locally and updates `?lang=` without losing the current scene.

## Writing style

Copy is concise and scientifically qualified. State representation choices directly, for example:

> The star markers are enlarged for visibility; their positions are to scale.

> This visualization adopts 10 pc as the Solar-neighborhood reference span.

> The BAO feature is a statistical excess in pair separation near this scale.

Avoid categorical wording that hides adopted conventions or representation limits.

## Input and accessibility

Default scene controls are left/one-finger drag to orbit, secondary/modified drag to pan, wheel/pinch to zoom, click/tap to select/focus where supported, Reset for the canonical camera, and Escape to clear selection where applicable. Define camera limits per scene. Avoid blocking page touch scrolling more than needed.

Support keyboard navigation, semantic controls and labels, visible focus, readable contrast, touch targets, and `prefers-reduced-motion`. Do not encode scientific categories only by color. Bridge animation reduces or disappears with reduced motion.

## Visual direction

The interface is quiet, scientific, spacious, and responsive. Centralize CSS design tokens. Avoid game-like chrome, heavy cards, excessive gradients, sci-fi glow, arbitrary starfields, decorative motion, and any element competing with bars, objects, labels, and numbers. Dark/light theming is optional.

On mobile, condense secondary conversions and labels before compromising the primary scale relationship. Keep the full-viewport shell usable with browser safe areas and modern desktop/mobile input.

## Runtime performance

Lazy-load scenes and heavy assets, cap labels, avoid driving static Three.js geometry from frequent React state updates, use bounded device-pixel ratio, instancing/points, and deterministic level of detail. The application should remain practical on typical modern phones and desktops.
