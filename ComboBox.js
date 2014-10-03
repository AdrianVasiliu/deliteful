/** @module deliteful/ComboBox */
define([
	"dcl/dcl",
	"dojo/dom-class", // TODO: replace (when replacement confirmed)
	"delite/register",
	"delite/FormWidget",
	"delite/HasDropDown",
	"./list/List",
	"delite/handlebars!./ComboBox/ComboBox.html",
	"requirejs-dplugins/i18n!./ComboBox/nls/ComboBox",
	"delite/theme!./ComboBox/themes/{{theme}}/ComboBox.css"
], function (dcl, domClass, register, FormWidget, HasDropDown,
		List, template, messages) {

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
		},
		
		_initList: function (addToDom) {
			// TODO temp debug
			this.on("keydown", function (evt) {
				console.log("keydown on this, this.id: " + this.id);
				console.log("   target: " + evt.target);
			}, this);
			this.on("keydown", function (evt) {
				console.log("keydown on this.input, this.id: " + this.id);
				console.log("   target: " + evt.target);
			}, this.input);
			
			// The drop-down is hidden initially
			domClass.add(this.list, "d-combobox-list-hidden");
			
			if (addToDom) {
				// TODO CHECKME change of list must remove from DOM => custom setter??
				this.list.placeAt(this);
			}
			this.list.style.height = "inherit";
			if (this.autoFilter) {
				// do not give focus to the popup, otherwise the user can't type in the input field
				this.list.focusOnOpen = false;
			}
			// this.forceWidth = true; // TODO checkme
			
			// The role=listbox is required for the list part of a combobox by the
			// aria spec of role=combobox
			this.list.isAriaListbox = true;
			
			this.list.selectionMode = this.selectionMode === "single" ?
				"radio" : "multiple";
						
			this.dropDown = this.list; // delite/HasDropDown's property
			
			this.dropDown.handleKey = function (evt) {
				console.log("got key evt: " + evt);
				console.log(evt);
				this.list._keynavKeyDownHandler(evt);
			}.bind(this);
				
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
						if (firstItemRenderer && !initDone) {
							this.input.value = firstItemRenderer.item[this.list.labelAttr];
						}
						initDone = true;
					}
				}.bind(this));
			}
				
			this.list.on("selection-change", function () {
				var selectedItem;
				if (this.selectionMode === "single") {
					selectedItem = this.list.selectedItem;
					console.log("selection-change, selectedItem: " +
						(selectedItem ? selectedItem.label : selectedItem));
					this.input.value = selectedItem ? selectedItem[this.list.labelAttr] : "";
					this.closeDropDown(true/*refocus*/);
				} else { // selectionMode "multiple"
					var selectedItems = this.list.selectedItems;
					var n = selectedItems ? selectedItems.length : 0;
					console.log("selection mode is multiple, n: " + n);
					if (n > 1) {
						this.input.value = this._multipleChoiceMsg;
					} else if (n === 1) {
						selectedItem = this.list.selectedItem;
						this.input.value = selectedItem ? selectedItem[this.list.labelAttr] : "";
					} else { // no option selected
						this.input.value = "";
					}
				}
			}.bind(this));
			
			this.on("input", function () {
				this.list.selectedItem = null;
				var txt = this.input.value;
				console.log("txt: " + txt);
				this.list.query = function (obj) {
					// TODO: case-sensitiveness, startsWith/contains
					return obj.label.indexOf(txt) === 0;
				};
				console.log("on(input) calls openDropDown");
				this.openDropDown(); // reopen if closed
			}.bind(this), this.input);
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
