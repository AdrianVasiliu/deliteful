/**
 * This module TBD
 * It returns the `has()` function.
 * 
 * Example:
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
 * @module deliteful/channelPolicy
 */
define(["dcl/dcl", "requirejs-dplugins/has", "module", "decor/Evented"], 
	function (dcl, has, module, Evented) {
	/* jshint maxcomplexity:20 */

	// var channelPolicy = dcl([Evented], /** @lends module:deliteful/channelPolicy# */ {
	// });
	
	// dcl.mix(channelPolicy, has);
	
	var breakpoints =
		// TODO: rename to phone / tablet / desktop ? Impact on ResponsiveColumns.
		// TODO: remove large/desktop? Impact on ResponsiveColumns.
		module.config().breakpoints || {small: "480px", medium: "1024px", large: ""};
		// JSON.stringify(module.config().breakpoints) || "{'small': '480px', 'medium': '1024px', 'large': ''}";
			
	has.add("channel-breakpoints", breakpoints);
		
	// var parsedBreakpoints = JSON.parse(breakpoints.replace(/\'/g, "\""));
		
	var smallMaxSize = breakpoints.small;
	var mediumMaxSize = breakpoints.medium;
	var mqSmall = window.matchMedia( "(min-width: " + smallMaxSize + ")" );
	var mqMedium = window.matchMedia( "(min-width: " + mediumMaxSize + ")" );
		
	has.add("phone-channel", function () {
		return !mqSmall.matches && !mqMedium.matches;
	});
	has.add("tablet-channel", function () {
		return mqSmall.matches && !mqMedium.matches;
	});
	has.add("desktop-channel", function () {
		return mqSmall.matches && mqMedium.matches;
	});
		
	function changeHandler() {
		console.log("changeHandler");
	};
	mqSmall.addListener(changeHandler);
	mqMedium.addListener(changeHandler);
		
	return has; // channelPolicy;
});
