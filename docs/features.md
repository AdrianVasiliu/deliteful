---
layout: default
title: deliteful/features
---

# deliteful/features

This module augments the `has()` tests (`requirejs-dplugins/has`) with media query based tests,
such that multichannel widgets can rely on the `has()` API for determining the channel.
Using this approach in conjunction with an optimizing compiler at build time, it is possible
to optimize out unwanted code paths for specific channel policies.

The `deliteful/features` module sets the following `has`-features:

* `has("phone-like-channel")`: `true` for small screens, `false` otherwise.
* `has("tablet-like-channel")`: `true` for medium screens, `false` otherwise.
* `has("desktop-like-channel")`: `true` for large screens, `false` otherwise.
* `has("breakpoint-small-screen")`: A string describing the maximum screen size value
for the phone-like channel. If the screen size is smaller than this value, the
`"phone-like-channel"` flag is set to `true`, otherwise it is set to `false`. Default
value: "480px".
* `has("breakpoint-medium-screen")`: A string describing the maximum screen size value
for the tablet-like channel. If the screen size is smaller than this value and larger
than the value of the `"breakpoint-small-screen"` flag, the `"phone-like-channel"`
flag is set to `true`, otherwise it is set to `false`. Default value: "1024px".

The flags `"phone-like-channel"`, `"tablet-like-channel"`, and `"desktop-like-channel"`
are set depending on the screen size, using CSS media queries that compare the actual
screen width (the `device-width` media feature) with the corresponding breakpoint values.
Note that the screen size is the only criteria used for determining the channel. When a
channel flag is set to `true`, the other channel flags are set to `false`.

## Using deliteful/features

Example of use for determining different code paths depending on the channel:

```js
require(["deliteful/features", ...], function (has, ...) {
	if (has("phone-like-channel")) { // only for the phone channel (small screen)
	  ...
	} else { // tablet-like and desktop-like channels (medium and large screens)
	  ...
	}
});
```

Example of use for conditional loading of dependent modules depending on the channel:

```js
require(["deliteful/features!phone-like-channel?myapp/PhoneModule:tablet-like-channel?myapp/TabletModule:myapp/DesktopModule", ...],
	function (Module, ...) {
	// The Module argument points to the return value of either PhoneModule, TabletModule,
	// or DesktopModule depending on the channel.
	...
});
```

Example of use by a responsive widget which shares the default breakpoint values with the 
multichannel widgets:

```js
require(["deliteful/features", ...],
	function (has, ...) {
	var smallBreakpoint = has("breakpoint-small-screen");
	var mediumBreakpoint = has("breakpoint-medium-screen");
	// Use these values as default values for creating media queries
	...
});
```

## Configuring deliteful/features

The default values of the breakpoints can be configured using `require.config()`,
for instance:

```html
<script>
  // configuring RequireJS
  require.config({
    ...
    config: {
      "requirejs-dplugins/has": {
        "breakpoint-small-screen": "280px",
        "breakpoint-medium-screen: "724px"
      }
    }
  });
</script>
```

The channel flags can be configured statically using `require.config()`, for instance:

```html
<script>
  // configuring RequireJS
  require.config({
    ...
    config: {
      "requirejs-dplugins/has": {
        "phone-like-channel": false,
        "tablet-like-channel": true,
        "desktop-like-channel": false,
      }
    }
  });
</script>
```
Note that only one channel flag should be set to `true`.

