/**
 * This module sets `has()` flags that can be used by multichannel widgets to determine
 * the required channel:
 *
 * - `has("phone-like-channel")`: `true` for small screens, `false` otherwise.
 * - `has("tablet-like-channel")`: `true` for medium screens, `false` otherwise.
 * - `has("desktop-like-channel")`: `true` for large screens, `false` otherwise.
 * 
 * These flags are set depending on the screen size, using CSS media queries that
 * compare the actual screen width (the `device-width` media feature) with the corresponding
 * breakpoint values. Note that the screen size is the only criteria used for determining
 * the channel. The values of breakpoint sizes are available using the following flags:
 * 
 * - `has("breakpoint-small-screen")`: A string describing the maximum screen size value
 * for the phone-like channel. If the screen size is smaller than this value, the
 * `"phone-like-channel"` flag is set to `true`, otherwise it is set to `false`. Default
 * value: "480px".
 * - `has("breakpoint-medium-screen")`: A string describing the maximum screen size value
 * for the tablet-like channel. If the screen size is smaller than this value and larger
 * than the value of the `"breakpoint-small-screen"` flag, the `"phone-like-channel"`
 * flag is set to `true`, otherwise it is set to `false`. Default value: "1024px".
 * 
 * The default values of the breakpoints can be configured using `require.config()`,
 * for instance:
 * 
 * ```html
 * <script>
 *   // configuring RequireJS
 *   require.config({
 *     ...
 *     config: {
 *       "requirejs-dplugins/has": {
 *         "breakpoint-small-screen": "280px",
 *         "breakpoint-medium-screen: "724px"
 *       }
 *     }
 *   });
 * </script>
 * ```
 * 
 * The channel can be configured statically using `require.config()`, for instance:
 * 
 * ```html
 * <script>
 *   // configuring RequireJS
 *   require.config({
 *     ...
 *     config: {
 *       "requirejs-dplugins/has": {
 *         "phone-like-channel": false,
 *         "tablet-like-channel: true,
 *         "desktop-like-channel: true,
 *       }
 *     }
 *   });
 * </script>
 * ```
 * Note that only one channel flag should be set to `true`.
 * 
 * The module returns the `has()` function returned by the module `requirejs-dplugins/has`.
 * 
 * @module deliteful/features
 */
define(["requirejs-dplugins/has", "module"],
	function (has, module) {
	
	// Default values. No-op if already set via require.config for requirejs-dplugins/has.
	has.add("breakpoint-small-screen", "480px");
	has.add("breakpoint-medium-screen", "1024px");
	
	// Use the device-width media feature rather than width, such that, on
	// desktop/laptop, the selected channel does not depend on the actual size of the
	// viewport. Thus, the selected channel depends only on the static characteristics
	// of the device (its screen width), which fits the use-case of multichannel
	// widgets that need a statically determined channel. Otherwise it would be confusing
	// to get a different channel depending on whether the app is initially loaded
	// in a small or large viewport.
	var mqSmall =
		window.matchMedia("(min-device-width: " + has("breakpoint-small-screen") + ")");
	var mqMedium =
		window.matchMedia("(min-device-width: " + has("breakpoint-medium-screen") + ")");
	
	has.add("phone-like-channel", function () {
		return !mqSmall.matches && !mqMedium.matches;
	});
	has.add("tablet-like-channel", function () {
		return mqSmall.matches && !mqMedium.matches;
	});
	has.add("desktop-like-channel", function () {
		return mqSmall.matches && mqMedium.matches;
	});
	
	return has;
});
