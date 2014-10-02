define([
	"intern!object",
	"intern/chai!assert",
	"dojo/dom-geometry", // TODO: replace (when replacement confirmed)
	"dstore/Memory",
	"delite/keys",
	"dojo/on",
	"dojo/dom-style",
	"delite/register",
	"deliteful/ComboBox",
	"deliteful/list/List",
	"delite/focus"
], function (registerSuite, assert, domGeom, Memory, keys, on, domStyle,
	register, ComboBox, List, focus) {
	
	var container, list, popup, comboBox;

	var isVisible = function (/*DomNode*/ node) {
		// Return true if node/widget is visible
		var p;
		return (domStyle.get(node, "display") !== "none") &&
			(domStyle.get(node, "visibility") !== "hidden") &&
			(p = domGeom.position(node, true), p.y + p.h >= 0 && p.x + p.w >= 0 && p.h && p.w);
	};
	
	var isHidden = function (/*DomNode*/ node) {
		// Return true if node/widget is hidden
		var p;
		return (domStyle.get(node, "display") === "none") ||
			(domStyle.get(node, "visibility") === "hidden") ||
			(p = domGeom.position(node, true), p.y + p.h < 0 || p.x + p.w < 0 || p.h <= 0 || p.w <= 0);
	};

	function key(node, keyCode) {
		on.emit(node, "keydown", {
			keyCode: keyCode,
			bubbles: true
		});
		on.emit(node, "keyup", {
			keyCode: keyCode,
			bubbles: true
		});
	}

	function click(node) {
		on.emit(node, "pointerdown", {
			bubbles: true
		});

		on.emit(node, "pointerup", {
			bubbles: true
		});

		on.emit(node, "click", {
			bubbles: true
		});
	}

	registerSuite({
		name: "ComboBox",
		setup: function () {
			container = document.createElement("div");
			document.body.appendChild(container);

			var dataStore = new Memory({
				idProperty: "label",
				data: [
					{ label: "France", sales: 500, profit: 50, region: "EU" },
					{ label: "Germany", sales: 450, profit: 48, region: "EU" },
					{ label: "UK", sales: 700, profit: 60, region: "EU" },
					{ label: "USA", sales: 2000, profit: 250, region: "America" },
					{ label: "Canada", sales: 600, profit: 30, region: "America" },
					{ label: "Brazil", sales: 450, profit: 30, region: "America" },
					{ label: "China", sales: 500, profit: 40, region: "Asia" },
					{ label: "Japan", sales: 900, profit: 100, region: "Asia" }
				]
			});
			list = new List({store: dataStore, righttextAttr: "sales", categoryAttr: "region"});
			list.startup();
		},

		basic: function () {
			// setup
			comboBox = new ComboBox({list: list}).placeAt("container");
			comboBox.startup();
			
			var popup = comboBox.dropDown;
			assert.ok(!!popup, "popup exists");

			// open
			click(comboBox);
			var anchorPos = domGeom.position(comboBox),
				dropDownPos = domGeom.position(popup);
			assert(Math.abs(anchorPos.x - dropDownPos.x) < 1, "drop down and anchor left aligned");
			assert(Math.abs(anchorPos.w - dropDownPos.w) < 1, "drop down same width as anchor");
			assert.ok(isVisible(popup), "popup visible");
			
			// Test for delite #267 (behavior of delite/popup used in conjunction
			// with delite/focus)
			click(popup);
			assert.notOk(isHidden(popup), "clicking the popup should not hide it");
			
			// close
			comboBox.closeDropDown();
			assert.ok(isHidden(popup), "popup hidden");

			// open by space
			key(comboBox, keys.SPACE);
			assert.ok(!!popup, "popup exists");
			assert.ok(isVisible(popup), "popup visible again");

			// Test for delite #267 (behavior of delite/popup used in conjunction
			// with delite/focus)
			click(popup);
			assert.notOk(isHidden(popup), "clicking the popup should not hide it");
			
			// close 2
			comboBox.closeDropDown();
			assert.ok(isHidden(popup), "popup hidden again");
		},

		destroy: function () {
			// setup
			comboBox = new ComboBox({list: list}).placeAt(container);
			popup = comboBox.dropDown;
			assert.ok(!!popup, "popup exists");

			// open
			click(comboBox);
			assert.ok(isVisible(popup), "popup visible");
			assert.strictEqual(1, require("delite/popup")._stack.length, "in popup manager stack");

			// destroy
			comboBox.destroy();
			assert.strictEqual(0, require("delite/popup")._stack.length, "popup was closed");
		},

		teardown: function () {
			container.parentNode.removeChild(container);
		}
	});
});
