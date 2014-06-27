define(["intern!object",
	"intern/chai!assert",
	"require"
	], function (registerSuite, assert, require) {
	
	// Not needed by Chrome 35/Win7, but needed by FF30/Win7... 
	// var DELAY_FOR_CHANGE_EVENT = 2500;
	// var TEST_TIMEOUT_MS = 12000;
	
	var checkNumberOfOptions = function (remote, selectId, expectedNumberOfOptions) {
		return remote
			.elementById(selectId)
			.elementsByTagName("OPTION")
			.then(function (result) {
				assert.strictEqual(result.length, expectedNumberOfOptions,
					selectId + " number of options is not the expected one");
			});
	};
	
	var updateAndCheckNumberOfOptions = function (
		remote, selectId, updateId, expectedNumberOfOptions) {
		return remote
				.elementById(updateId)
				.click()
				.end()
				.elementById(selectId)
				.elementsByTagName("OPTION")
				.then(function (result) {
					assert.strictEqual(result.length, expectedNumberOfOptions,
						selectId + " number of options is not the expected one");
				});
	};
	
	// Check the state of the widget after selecting options using the keyboard.
	// The most important is checking that the delite/Selection parent class
	// is correctly kept in sync (that is, its selectedItem/selectedItems
	// properties are correctly updated by the widget).
	var checkKeyboardNavigationSingleSelection = function (remote, selectId) {
		if (!/chrome|internet explorer/.test(remote.environmentType.browserName)) {
			// Webdriver issues for now with FF 
			return;
		}
		var selItemNullStr = "widget.selectedItem is null";
		// Expression executed in the browser for collecting data allowing to
		// check the state of the widget.
		var executeExpr = "return {" +
			"widgetSelectedItemText: " +
			"(" + selectId + ".selectedItem ? " + selectId +
			".selectedItem.text : '" + selItemNullStr + "'), " +
			"widgetValueNodeSelectedIndex: " + selectId +
			".valueNode.selectedIndex, " +
			// Do not rely on HTMLSelectElement.selectedOptions for counting
			// the selected options, because it is not universally supported by
			// browsers. At least IE10/Win does not support it. Hence going
			// through a utility function in the HTML test file:
			"widgetValueNodeNSelectedOptions: getSelectedOptionsArray(" + selectId +
			").length, " +
			"widgetSelectionChangeCounter: " + selectId +
			"._selection_change_counter" +
			"};";
		return remote
			.execute(selectId + ".focus(); " + executeExpr)
			.then(function (value) {
				// The first option is initially selected by default
				// text = update #1 because the item has been already updated
				// in the previous test cases
				assert.strictEqual(value.widgetSelectedItemText, "Option 1 update #1",
					"(single) after focus, " + selectId + ".selectedItem.text");
				assert.strictEqual(value.widgetValueNodeSelectedIndex, 0,
					"(single) after focus, " + selectId + ".valueNode.selectedIndex");
				assert.strictEqual(value.widgetValueNodeNSelectedOptions, 1,
					"(single) after focus, " + selectId + ".valueNode_nSelectedOptions");
				// No selection-change event initially
				assert.strictEqual(value.widgetSelectionChangeCounter, 0,
					"(single) after focus, " + selectId +
					"._selection_change_counter (internal testing counter)");
			})
			.end()
			.keys("\uE015") // arrow down
			.execute(executeExpr)
			.then(function (value) {
				// Now the second option should be selected
				// arrow update #1 because the item has been already updated
				// in the previous test cases
				assert.strictEqual(value.widgetSelectedItemText, "Option 2 update #1",
					"(single) after first arrow down key, " + selectId + ".selectedItem.text");
				assert.strictEqual(value.widgetValueNodeSelectedIndex, 1,
					"(single) after first arrow down key, " + selectId + ".valueNode.selectedIndex");
				assert.strictEqual(value.widgetValueNodeNSelectedOptions, 1,
					"(single) after first arrow down key, " + selectId + ".valueNode_nSelectedOptions");
				assert.strictEqual(value.widgetSelectionChangeCounter, 1,
					"(single) after first arrow down key, " + selectId +
					"._selection_change_counter (internal testing counter)");
			})
			.end()
			.keys("\uE015") // arrow down
			.execute(executeExpr)
			.then(function (value) {
				// Now the third option should be selected
				assert.strictEqual(value.widgetSelectedItemText, "Option 3 update #1",
					"(single) after second arrow down key, " + selectId + ".selectedItem.text");
				assert.strictEqual(value.widgetValueNodeSelectedIndex, 2,
					"(single) after second arrow down key, " + selectId +
					".valueNode.selectedIndex");
				assert.strictEqual(value.widgetValueNodeNSelectedOptions, 1,
					"(single) after second arrow down key, " + selectId +
					".valueNode_nSelectedOptions");
				assert.strictEqual(value.widgetSelectionChangeCounter, 2,
					"(single) after second arrow down key, " + selectId +
					"._selection_change_counter (internal testing counter)");
			})
			.end()
			.keys("\uE013") // arrow up
			.execute(executeExpr)
			.then(function (value) {
				// Now the second option should be selected again
				assert.strictEqual(value.widgetSelectedItemText, "Option 2 update #1",
					"(single) after arrow up key, " + selectId + ".selectedItem.text");
				assert.strictEqual(value.widgetValueNodeSelectedIndex, 1,
					"(single) after arrow up key, " + selectId +
					".valueNode.selectedIndex");
				assert.strictEqual(value.widgetValueNodeNSelectedOptions, 1,
					"(single) after arrow up key, " + selectId +
					".valueNode_nSelectedOptions");
				assert.strictEqual(value.widgetSelectionChangeCounter, 3,
					"(single) after arrow up key, " + selectId +
					"._selection_change_counter (internal testing counter)");
			})
			.end();
	};
	
	var checkKeyboardNavigationMultipleSelection = function (remote, selectId) {
		if (!/Chrome/.test(remote.environmentType.browserName)) {
			// Keyboard shortcuts for multi-selects are browser dependent.
			// For now testing Chrome only.
			return;
		}
		var selItemNullStr = "widget.selectedItem is null";
		// Expression executed in the browser for collecting data allowing to
		// check the state of the widget.
		var executeExpr = "return {" +
			"widgetSelectedItemText: " +
			"(" + selectId + ".selectedItem ? " + selectId +
			".selectedItem.text : '" + selItemNullStr + "'), " +
			"widgetValueNodeSelectedIndex: " + selectId +
			".valueNode.selectedIndex, " +
			"widgetValueNodeNSelectedOptions: " + selectId +
			".valueNode.selectedOptions.length, " +
			"widgetSelectionChangeCounter: " + selectId +
			"._selection_change_counter" +
			"};";
		return remote
			.execute(selectId + ".focus(); " + executeExpr)
			.then(function (value) {
				// In a multiple-select no option is selected initially 
				// (holds for the widget's delite/Selection API as for the
				// native select). 
				assert.strictEqual(value.widgetSelectedItemText, selItemNullStr,
					"(multiple) after focus, " + selectId + ".selectedItem.text");
				assert.strictEqual(value.widgetValueNodeSelectedIndex, -1,
					"(multiple) after focus, " + selectId + ".valueNode.selectedIndex");
				assert.strictEqual(value.widgetValueNodeNSelectedOptions, 0,
					"(multiple) after focus, " + selectId +
					".valueNode_nSelectedOptions");
				// No selection-change event initially
				assert.strictEqual(value.widgetSelectionChangeCounter, 0,
					"(multiple) after focus, " + selectId +
					"._selection_change_counter (internal testing counter)");
			})
			.end()
			.keys("\uE015") // arrow down
			.execute(executeExpr)
			.then(function (value) {
				// Now the first option should be selected
				assert.strictEqual(value.widgetSelectedItemText, "Option 1",
					"(multiple) after first arrow down key, " + selectId +
					".selectedItem.text");
				assert.strictEqual(value.widgetValueNodeSelectedIndex, 0,
					"(multiple) after first arrow down key, " + selectId +
					".valueNode.selectedIndex");
				assert.strictEqual(value.widgetValueNodeNSelectedOptions, 1,
					"(multiple) after first arrow down key, " + selectId +
					".valueNode_nSelectedOptions");
				// Changed from no option selected to one option selected: one 
				// single select-change event from delite/Selection
				assert.strictEqual(value.widgetSelectionChangeCounter, 1,
					"(multiple) after first arrow down key, " + selectId +
					"._selection_change_counter (internal testing counter)");
			})
			.end()
			.keys("\uE015") // arrow down again
			.execute(executeExpr)
			.then(function (value) {
				// Now the second option should be selected (instead of the first)
				assert.strictEqual(value.widgetSelectedItemText, "Option 2",
					"(multiple) after second arrow down key, " + selectId +
					".selectedItem.text");
				assert.strictEqual(value.widgetValueNodeSelectedIndex, 1,
					"(multiple) after second arrow down key, " + selectId +
					".valueNode.selectedIndex");
				// still one single option selected so far
				assert.strictEqual(value.widgetValueNodeNSelectedOptions, 1,
					"(multiple) after second arrow down key, " + selectId +
					".valueNode_nSelectedOptions");
				// In a multi-select the change from one option selected to another
				// option selected involves two delite/Selection's select-change events:
				// one for the deselection of the first option, another for the selection
				// of the second. Hence:
				assert.strictEqual(value.widgetSelectionChangeCounter, 3,
					"(multiple) after second arrow down key, " + selectId +
					"._selection_change_counter (internal testing counter)");
			})
			.end()
			.keys("\uE008\uE015") // SHIFT-arrow down (extend the selection)
			.keys("\uE008") // release shift
			.execute(executeExpr)
			.then(function (value) {
				// Now the second and third options should be selected
				assert.strictEqual(value.widgetSelectedItemText, "Option 3",
					"(multiple) after shift arrow down key, " + selectId +
					".selectedItem.text");
				assert.strictEqual(value.widgetValueNodeSelectedIndex, 1,
					"(multiple) after shift arrow down key, " + selectId +
					".valueNode.selectedIndex");
				assert.strictEqual(value.widgetValueNodeNSelectedOptions, 2,
					"(multiple) after shift arrow down key, " + selectId +
					".valueNode_nSelectedOptions");
				// Changed from one option selected to two option selected: one 
				// single additional select-change event from delite/Selection
				assert.strictEqual(value.widgetSelectionChangeCounter, 4,
					"(multiple) after shift arrow down key, " + selectId +
					"._selection_change_counter (internal testing counter)");
			})
			.end()
			// For (native) multi-selects, the keyboard shortcuts are browser-dependent...
			// Here the Chrome way is tested.
			.keys("\uE009\uE013") // CTRL-arrow up (reduce the selection)
			.keys("\uE009") // release ctrl
			.execute(executeExpr)
			.then(function (value) {
				// Now the second option should be selected again
				assert.strictEqual(value.widgetSelectedItemText, "Option 2",
					"(multiple) after arrow up key, " + selectId + ".selectedItem.text");
				assert.strictEqual(value.widgetValueNodeSelectedIndex, 1,
					"(multiple) after arrow up key, " + selectId +
					".valueNode.selectedIndex");
				assert.strictEqual(value.widgetValueNodeNSelectedOptions, 1,
					"(multiple) after arrow up key, " + selectId +
					".valueNode_nSelectedOptions");
				// Changed from two options selected to one option selected: one 
				// single additional select-change event from delite/Selection
				assert.strictEqual(value.widgetSelectionChangeCounter, 5,
					"(multiple) after arrow up key, " + selectId +
					"._selection_change_counter (internal testing counter)");
			})
			.end();
	};

	var nOptions = 40;
	
	registerSuite({
		name: "deliteful/Select - functional",

		"setup": function () {
			return this.remote
				.get(require.toUrl("./Select.html"))
				.waitForCondition("ready", 15000); // large timeout because of sauce...
		},
		/* The content of Select.html:
		1. deliteful/Select created declaratively (with default store):
		2. deliteful/Select created programmatically (with default store):
		3. deliteful/Select created declaratively (with user's store):
		4. deliteful/Select created programmatically (with user's store):
		5. deliteful/Select created declaratively with no options (empty):
		6. deliteful/Select created programmatically with no options (empty):
		7. deliteful/Select created declaratively with larger font-size, font-family:Courier, 
		border-radius, and background-color (with default store):
		*/
		"init (declaratively, default store)": function () {
			return checkNumberOfOptions(this.remote, "select1", nOptions);
		},
		"init (programmatically, default store)": function () {
			return checkNumberOfOptions(this.remote, "select2", nOptions);
		},
		"init (declaratively, user's store)": function () {
			return checkNumberOfOptions(this.remote, "select3", nOptions);
		},
		"init (programmatically, user's store)": function () {
			return checkNumberOfOptions(this.remote, "select4", nOptions);
		},
		"init (declaratively, empty)": function () {
			return checkNumberOfOptions(this.remote, "select5", 0/*empty*/);
		},
		"init (programmatically, empty)": function () {
			return checkNumberOfOptions(this.remote, "select6", 0/*empty*/);
		},
		
		// Check that after pressing the update button the Select widget still has
		// the expected number of options and the options now contain the 
		// updated text content.
		"update (declaratively, default store)": function () {
			return updateAndCheckNumberOfOptions(
				this.remote, "select1", "update1", nOptions);
		},
		"update (programmatically, default store)": function () {
			return updateAndCheckNumberOfOptions(
				this.remote, "select2", "update2", nOptions);
		},
		"update (declaratively, user's store)": function () {
			return updateAndCheckNumberOfOptions(
				this.remote, "select3", "update3", nOptions);
		},
		"update (programmatically, user's store)": function () {
			return updateAndCheckNumberOfOptions(
				this.remote, "select4", "update4", nOptions);
		},
		
		"keyboard navigation selectionMode = single": function () {
			// this.timeout = TEST_TIMEOUT_MS;
			return checkKeyboardNavigationSingleSelection(this.remote, "select1");
		},
		"keyboard navigation selectionMode = multiple": function () {
			// this.timeout = TEST_TIMEOUT_MS;
			return checkKeyboardNavigationMultipleSelection(this.remote, "d_select_form3");
		}
	});
});
