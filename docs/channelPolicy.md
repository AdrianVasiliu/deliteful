---
layout: default
title: deliteful/channelPolicy
---

# deliteful/channelPolicy

This module augments the `has()` tests with media query based tests,
such that widgets can rely on `has()` API for determining the channel.
Using this approach in conjunction with an optimizing compiler at build time, it is possible
to optimize out unwanted code paths for specific channel policies.


The `channelPolicy` module defines the following `has`-features:

* `has("ie")` - internet explorer; note that unlike dojo, `has("ie")` is truthy for IE11
* `has("phone-channel")`: small screen.
* `has("tablet-channel")`: medium screen.
* `has("desktop-channel")`: large screen.

## Using channelPolicy

Example of use for determining different code paths depending on the channel:

```js
require(["deliteful/channelPolicy", ...], function (has, ...) {
	if (has("phone-channel")) { // only for the phone channel (small screen)
	  ...
	} else { // tablet and desktop channels (medium and large screens)
	  ...
	}
});
```

Example of use for conditional loading of dependent modules depending on the channel:

```js
require(["deliteful/channelPolicy!phone-channel?myapp/PhoneModule:tablet-channel?myapp/TabletModule:myapp/DesktopModule"], 
	function (Module) {
	// The Module argument points to the return value of either PhoneModule, TabletModule,
	// or DesktopModule depending on the channel.
	...
});
```

Example of use by a responsive widget which wants to share the same default breakpoint values
with the the multichannel widgets:

```js
require(["deliteful/channelPolicy", ...], 
	function (has, ...) {
	var breakpoints = has("channel-breakpoints");
	var smallBreakpoint = breakpoints.small;
	var mediumBreakpoint = breakpoints.medium;
	// Use these values as default values for creating media queries
	...
});
```

## Configuring channelPolicy

The default breakpoint values can be modified the following way: 

```html
<script>
  // configuring RequireJS
  require.config({
    ...
    config: {
      "deliteful/channelPolicy": {
         breakpoints: {small: "280px", medium: "724px", large: ""}
      }
    }
 });
```
</script>
 
