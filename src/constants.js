/**
 * Default transition applied when no `transition` prop or config is set.
 * Override per-link via the `transition` prop, or globally via `TransitionConfig.defaultTransition`.
 */
export const DEFAULT_TRANSITION = 'slide';
/**
 * Default `view-transition-name` applied to the `<TransitionView>` outlet.
 * The built-in stylesheet targets this name — if you change it here you must
 * also update your CSS rules to match.
 */
export const DEFAULT_OUTLET_NAME = 'vtr-page';
