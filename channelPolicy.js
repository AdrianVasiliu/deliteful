/**
 * This module sets has() flags based on the current browser:
 *
 * - `has("phone-channel")`: `true` for small screens, `false` otherwise.
 * - `has("tablet-channel")`: `true` for medium screens, `false` otherwise.
 * - `has("desktop-channel")`: `true` for large screens, `false` otherwise.
 * - `has("channel-breakpoints")`: an object containing the underlying media queries 
 * breakpoints definition. The object has the following properties:
 *   * `small`: a string defining the upper bound of the `device-width` media feature 
 * matched for "phone-channel". Default value: "480px".
 *   * `medium`: a string defining the upper bound of the `device-width` media feature 
 * matched for "phone-channel". Default value: "1024px".
 * 
 * Uses the media query feature `max-width: <breakpointSize>`. The default values for `breakpointSize`
 * for each channel are the following:
 * - `has("phone-channel")`: min-widget: XXX
 * - `has("tablet-channel")`: min-widget: XXX
 * - `has("desktop-channel")`: min-widget: XXX
 * 
 * The default values can be modified the following way: 
 * 
 * ```html
 * <script>
 *   // configuring RequireJS
 *   require.config({
 *     ...
 *     config: {
 *       "deliteful/channelPolicy": {
 *          breakpoints: "{'small': '280px', 'medium': '724px', large: ''}"
 *       }
 *     }
 *  });
 * ```
 * </script>
 * 
 * The module returns the `has()` function.
 * 
 * TODO: improve doc.
 * 
 * @module deliteful/channelPolicy
 */
define(["dcl/dcl", "requirejs-dplugins/has", "module", "decor/Evented"],
	function (dcl, has, module, Evented) {
	/* jshint maxcomplexity:20 */
	
	var breakpoints =
		// TODO: rename to phone / tablet / desktop ? Impact on ResponsiveColumns.
		// TODO: remove large/desktop? Impact on ResponsiveColumns.
		module.config().breakpoints ||
		// ResponsiveColumns: {small: "480px", medium: "1024px", large: ""}
		// Bootstrap:
		{small: "480px", medium: "768px", large: ""};
		// JSON.stringify(module.config().breakpoints) || "{'small': '480px', 'medium': '1024px', 'large': ''}";
	
	has.add("channel-breakpoints", breakpoints);
		
	// var parsedBreakpoints = JSON.parse(breakpoints.replace(/\'/g, "\""));
		
	var smallMaxSize = breakpoints.small;
	var mediumMaxSize = breakpoints.medium;
	var mqSmall = window.matchMedia( "(min-device-width: " + smallMaxSize + ")" );
	var mqMedium = window.matchMedia( "(min-device-width: " + mediumMaxSize + ")" );
	
	has.add("phone-channel", function () {
		return !mqSmall.matches && !mqMedium.matches;
	});
	has.add("tablet-channel", function () {
		return mqSmall.matches && !mqMedium.matches;
	});
	has.add("desktop-channel", function () {
		return mqSmall.matches && mqMedium.matches;
	});
	
	return has;
});
