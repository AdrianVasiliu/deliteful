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
		// module.config().breakpoints || "{'small': '480px', 'medium': '1024px', 'large': ''}";
		JSON.stringify(module.config().breakpoints) || "{'small': '480px', 'medium': '1024px', 'large': ''}";
			
	has.add("d-breakpoints", breakpoints);
		
	var parsedBreakpoints = JSON.parse(breakpoints.replace(/\'/g, "\""));
		
	var smallMaxSize = parsedBreakpoints.small;
	var mediumMaxSize = parsedBreakpoints.medium;
	var mqSmall = window.matchMedia( "(min-width: " + smallMaxSize + ")" );
	var mqMedium = window.matchMedia( "(min-width: " + mediumMaxSize + ")" );
		
	has.add("d-policy-small", function () {
		return !mqSmall.matches && !mqMedium.matches;
	});
	has.add("d-policy-medium", function () {
		return mqSmall.matches && !mqMedium.matches;
	});
	has.add("d-policy-large", function () {
		return mqSmall.matches && mqMedium.matches;
	});
		
	function changeHandler() {
		console.log("changeHandler");
	};
	mqSmall.addListener(changeHandler);
	mqMedium.addListener(changeHandler);
		
	/*
	channelPolicy.add("toto", "tata");
	console.log("channelPolicy small: " + channelPolicy("d-policy-small"));
	console.log("channelPolicy toto: " + channelPolicy("toto"));
	console.log("has small: " + has("d-policy-small"));
	
	console.log("channelPolicy add: " + channelPolicy.add);
	console.log("has add: " + has.add);
	*/
	
	return has; // channelPolicy;
});
