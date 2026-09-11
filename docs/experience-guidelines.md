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

Default scene controls are left/one-finger drag to orbit, secondary/modified drag to pan, wheel/pinch to zoom, click/tap to select/focus where supported, Reset for the canonical camera, and Escape to clear selection where applicable. All scenes use the original fixed world-up OrbitControls rotation, damping, pan and zoom. Reset restores the canonical camera. Define camera limits per scene. Avoid blocking page touch scrolling more than needed.

Support keyboard navigation, semantic controls and labels, visible focus, readable contrast, touch targets, and `prefers-reduced-motion`. Do not encode scientific categories only by color. Bridge animation reduces or disappears with reduced motion.

## Visual direction

The interface is quiet, scientific, spacious, and responsive. Centralize CSS design tokens. Avoid game-like chrome, heavy cards, excessive gradients, sci-fi glow, arbitrary starfields, decorative motion, and any element competing with bars, objects, labels, and numbers. The chosen theme is dark: canvas `#0a101a`, panels based on `#111b29`, burgundy accent `#b96878` (secondary `#743448`), and subtly rounded 6 px corners. Scenes and bridges share the canvas background to avoid a color jump. Keep these values in CSS tokens.

Keep the bottom previous/next scale dock in the same position across scenes and bridges. The top logarithmic axis uses decade ticks and scene dots; scene names appear only on hover or keyboard focus.

At viewport widths up to 1440 px or heights up to 850 px, use compact header and navigation spacing. Above the mobile breakpoint, also reduce HUD card widths, title/readout sizes, and panel padding; long explanation/control panels scroll within the available HUD row. Compact button heights apply only to fine pointers so touch targets retain their normal size. Larger desktop windows keep the spacious layout.

Main and secondary reference values use the same serif font family. Render scientific notation with a multiplication sign and superscript exponent; do not display raw E notation visually. Always show m, pc, AU and ly conversions except duplication of the primary unit; do not add extra prefixed-meter conversions.

On mobile, keep conversions readable and use flowing rows for heading, readout, canvas, explanatory credits, and controls. All implemented scenes use this layout so panels do not cover the models. BAO and Cosmic Web keep at least 280 px of canvas height; their explanation and settings flow below it and are reached by scrolling the scene, without a nested scrolling panel. Keep the full-viewport shell usable with browser safe areas and modern desktop/mobile input.

## Runtime performance

Lazy-load scenes and heavy assets, cap labels, avoid driving static Three.js geometry from frequent React state updates, use bounded device-pixel ratio, instancing/points, and deterministic level of detail. The application should remain practical on typical modern phones and desktops.
