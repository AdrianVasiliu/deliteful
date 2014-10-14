/** @module deliteful/ComboBox */
define([
	"dcl/dcl",
	"dojo/dom-class", // TODO: replace (when replacement confirmed)
	"delite/register",
	"delite/FormWidget",
	"delite/HasDropDown",
	"delite/Viewport",
	"delite/keys",
	"./list/List",
	"./LinearLayout",
	"./Button",
	"delite/handlebars!./ComboBox/ComboBox.html",
	"requirejs-dplugins/i18n!./ComboBox/nls/ComboBox",
	"delite/theme!./ComboBox/themes/{{theme}}/ComboBox.css"
], function (dcl, domClass, register, FormWidget, HasDropDown,
		Viewport, keys, List, LinearLayout, Button, template, messages) {
	/**
	 * A form-aware and store-aware widget leveraging the deliteful/list/List widget
	 * for rendering the options.
	 * The corresponding custom tag is `<d-combobox>`.
	 * 
	 * TODO: improve doc.
	 * 
	 * Remark: the option items must be added, removed or updated exclusively using
	 * the List API. Direct operations using the DOM API are not supported.
	 * 
	 * @example <caption>Using the default store</caption>
	 * JS:
	 * require(["delite/register", "deliteful/ComboBox", "requirejs-domready/domReady!"],
	 *   function (register) {
	 *     register.parse();
	 *     combobox1.store.add({text: "Option 1", value: "1"});
	 *     ...
	 *   });
	 * HTML:
	 * <d-combobox id="combobox1"></d-combobox>
	 * 
	 * @class module:deliteful/ComboBox
	 * @augments module:delite/HasDropDown
	 * @augments module:delite/FormWidget
	 */
	return register("d-combobox", [HTMLElement, HasDropDown, FormWidget],
		/** @lends module:deliteful/ComboBox# */ {
		
		// Note: the property `disabled` is inherited from delite/FormWidget.
		
		baseClass: "d-combobox",
		
		template: template,
		
		/**
		 * TBD.
		 * @member {boolean} module:deliteful/ComboBox#autoFilter
		 * @default false
		 */
		autoFilter: false,
		
		/**
		 * The chosen selection mode.
		 *
		 * Valid values are:
		 *
		 * 1. "single": Only one option can be selected at a time.
		 * 2. "multiple": Several options can be selected.
		 *
		 * The value of this property determines the value of the `selectionMode`
		 * property of the List instance used by this widget for displaying the options:
		 * * The value"single" is mapped into "radio".
		 * * The value "multiple" is mapped into "multiple".
		 * 
		 * Note that, regardless of the selection mode, it is always possible to set 
		 * several selected items using the `selectedItem` or `selectedItems` properties
		 * of the List instance.
		 * The mode will be enforced only when using `setSelected` and/or
		 * `selectFromEvent` APIs of the List.
		 *
		 * @member {string} module:deliteful/ComboBox#selectionMode
		 * @default "single"
		 */
		selectionMode: "single",
		
		/**
		 * The list TBD.
		 * @member {module:deliteful/list/List} module:deliteful/ComboBox#list
		 * @default null
		 */
		list: null,

		// The default text displayed in the input for a multiple choice
		_multipleChoiceMsg: messages["multiple-choice"],
		
		refreshRendering: function (oldValues) {
			console.log("ComboBox.refreshRendering oldValues.list: " +
				oldValues.list + " this.list: " + this.list);
			if ("list" in oldValues) {
				// Programmatic case (list passed as ComboBox' ctor arg or set after the
				// initialization phase)
				console.log("   ==> ComboBox.refreshRendering initializes this.list and this.dropDown");
				this._initList(true/*addToDom*/);
			} else if ("selectionMode" in oldValues) {
				if (this.list) {
					this.list.selectionMode = this.selectionMode === "single" ?
						"radio" : "multiple";
				}
			}
		},
		
		attachedCallback: function () {
			// Declarative case (list specified declaratively inside the declarative ComboBox)
			if (!this.list) {
				this.list = this.querySelector("d-list");
				if (this.list) {
					console.log(" ==> ComboBox.buildRendering initializes this.list and this.dropDown");
					this._initList(false/*addToDom*/);
				}
			}
			
			// To provide graphic feedback for focus, react to focus/blur events
			// on the underlying native select. The CSS class is used instead
			// of the focus pseudo-class because the browsers give the focus
			// to the underlying select, not to the widget.
			this.on("focus", function (evt) {
				domClass.toggle(this, "d-combobox-focus", evt.type === "focus");
			}.bind(this), this);
			this.on("blur", function (evt) {
				domClass.toggle(this, "d-combobox-focus", evt.type === "focus");
			}.bind(this), this);
			
			// TODO: this brutal way is only temporary 
			var box = Viewport.getEffectiveBox(this.ownerDocument);
			if (true || box.w < 300 || box.h < 300) {
				this.dropDownPosition = ["center"];
			}
		},
		
		_initList: function (addToDom) {
			// TODO temp debug
			/*
			this.on("keydown", function (evt) {
				console.log("keydown on this, this.id: " + this.id);
				console.log("   target: " + evt.target);
			}, this);
			this.on("keydown", function (evt) {
				console.log("keydown on this.input, this.id: " + this.id);
				console.log("   target: " + evt.target);
			}, this.input);
			*/
			
			// Class added on the list such that ComboBox' theme can have a specific
			// CSS selector for elements inside the List when used as dropdown in
			// the combo. 
			domClass.add(this.list, "d-combobox-list");
			
			// The drop-down is hidden initially
			domClass.add(this.list, "d-combobox-list-hidden");
			
			if (addToDom) {
				// TODO CHECKME change of list must remove from DOM => custom setter??
				this.list.placeAt(this);
			}
			this.list.style.height = "inherit";
			if (this.autoFilter) {
				// do not give focus to the popup, otherwise the user can't type in the input field
				// TODO CHECKME this.list.focusOnOpen = false;
				// this.list.focusOnOpen = false;
			}
			// this.forceWidth = true; // TODO checkme
			this.autoWidth = false; // TODO checkme 
			this.forceWidth = false; // TODO checkme
			
			// The role=listbox is required for the list part of a combobox by the
			// aria spec of role=combobox
			this.list.isAriaListbox = true;
			
			this.list.focusDescendants = false;
			
			this.list.selectionMode = this.selectionMode === "single" ?
				"radio" : "multiple";
			
			var dropDown = this._createCenteredDropDownForMultiChoice(this.list);
			dropDown.style.width = "100%";
			this.dropDown = dropDown; // delite/HasDropDown's property
			// this.dropDown = this.list; // delite/HasDropDown's property
			
			this.list.on("keynav-child-navigated", function(evt) {
				console.log("ComboBox got keynav-child-navigated:");
				console.log("oldValue: " + (evt.oldValue ? evt.oldValue.id : "null"));
				console.log("newValue: " + (evt.newValue ? evt.newValue.id : "null"));
				var input = this._popupInput || this.input;
				if (evt.newValue) {
					this.list.selectFromEvent(evt, evt.newValue, evt.newValue, true);
					console.log("new selectedItems: ");
					console.log(this.list.selectedItems);
					if (this._popupInput) {}
					input.setAttribute("aria-activedescendant", evt.newValue.id);
				} else {
					input.removeAttribute("aria-activedescendant");
				}
			}.bind(this));
			
			// List already filled
			var firstItemRenderer = this.list.getItemRendererByIndex(0);
			console.log("firstItemRenderer: " + firstItemRenderer);
			if (firstItemRenderer) {
				this.input.value = firstItemRenderer.item[this.list.labelAttr];
			} else {
				// For future updates:
				var initDone = false;
				console.log("==== ComboBox installs listener of query-success");
				this.list.on("query-success", function () {
					console.log("=== ComboBox got query-success");
					if (!initDone) {
						var firstItemRenderer = this.list.getItemRendererByIndex(0);
						console.log("now got firstItemRenderer: " + firstItemRenderer);
						var input = this._popupInput || this.input;
						if (firstItemRenderer && !initDone) {
							input.value = firstItemRenderer.item[this.list.labelAttr];
						}
						initDone = true;
					}
				}.bind(this));
			}
			
			var actionHandler = function(event, list) {
				var renderer = list.getEnclosingRenderer(event.target);
				console.log("ComboBox actionHandler on event.target: " + event.target);
				console.log("  renderer: " + renderer);
				if (renderer) {
					this.closeDropDown(true/*refocus*/);
				}
			}.bind(this);
			
			this.list.on("click", function (event) {
				actionHandler(event, this.list);
			}.bind(this));
			this.list.on("keydown", function (event) {
				if (event.keyCode === keys.ENTER) {
					actionHandler(event, this.list);
				}
			}.bind(this));
							
			this.list.on("selection-change", function () {
				console.log("selection-change");
				var selectedItem;
				var input = this._popupInput || this.input;
				if (this.selectionMode === "single") {
					selectedItem = this.list.selectedItem;
					console.log("selection-change, selectedItem: " +
						(selectedItem ? selectedItem.label : selectedItem));
					input.value = selectedItem ? selectedItem[this.list.labelAttr] : "";
				} else { // selectionMode "multiple"
					var selectedItems = this.list.selectedItems;
					var n = selectedItems ? selectedItems.length : 0;
					console.log("selection mode is multiple, n: " + n);
					if (n > 1) {
						input.value = this._multipleChoiceMsg;
					} else if (n === 1) {
						selectedItem = this.list.selectedItem;
						input.value = selectedItem ? selectedItem[this.list.labelAttr] : "";
					} else { // no option selected
						input.value = "";
					}
				}
			}.bind(this));
			
			this.on("input", function () {
				this.list.selectedItem = null;
				var txt = this.input.value;
				this.list.query = function (obj) {
					return this._filterFunction(obj.label, txt);
				}.bind(this);
				console.log("on(input) calls openDropDown");
				this.openDropDown(); // reopen if closed
			}.bind(this), this.input);
		},
		
		_createCenteredDropDownForMultiChoice: function (list) {
			var topLayout = new LinearLayout({width:"100%"});
			
			this._popupInput = document.createElement("input");
			domClass.add(this._popupInput, "d-combobox-popup-input");
			this._popupInput.setAttribute("role", "combobox");
			this._popupInput.setAttribute("autocomplete", "off");
			this._popupInput.setAttribute("aria-autocomplete", "list");
			this._popupInput.setAttribute("type", "search");
			this.on("input", function () {
				this.list.selectedItem = null;
				var txt = this._popupInput.value;
				this.list.query = function (obj) {
					return this._filterFunction(obj.label, txt);
				}.bind(this);
				console.log("on(input) calls openDropDown");
				this.openDropDown(); // reopen if closed
			}.bind(this), this._popupInput);
			topLayout.addChild(this._popupInput);
			
			domClass.add(list, "fill");
			topLayout.addChild(list);
			var bottomLayout = new LinearLayout({vertical: false, width: "100%"});
			var cancelButton = new Button({label: "Cancel"});
			var okButton = new Button({label: "OK"});
			okButton.onclick = function () {
				this.closeDropDown();
			}.bind(this);
			cancelButton.onclick = function () {
				this.closeDropDown(); // TODO: restore initial value 
			}.bind(this);
			bottomLayout.addChild(cancelButton);
			var centralSpan = document.createElement("span");
			domClass.add(centralSpan, "fill");
			bottomLayout.addChild(centralSpan);
			bottomLayout.addChild(okButton);
			okButton.startup();
			bottomLayout.startup();
			topLayout.addChild(bottomLayout);
			topLayout.startup();
			return topLayout;
		},
		
		_filterFunction: function (itemLabel, queryTxt) {
			// TODO: case-sensitiveness, startsWith/contains, fancy locals support...
			queryTxt = queryTxt.toLocaleUpperCase();
			itemLabel = itemLabel.toLocaleUpperCase();
			return itemLabel.indexOf(queryTxt) === 0;
		},
		
		closeDropDown: dcl.superCall(function (sup) {
			return function () {
				// Reinit the query. Necessary such that after closing the dropdown
				// in autoFilter mode with a text in the input field not matching
				// any item, when the dropdown will be reopen it shows all items
				// instead of being empty 
				this.list.query = {};
				sup.apply(this, arguments);
			};
		})
	});
});
