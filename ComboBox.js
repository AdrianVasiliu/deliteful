/** @module deliteful/ComboBox */
define([
	"dcl/dcl",
	"dojo/dom-class", // TODO: replace (when replacement confirmed)
	"delite/register",
	"delite/FormWidget",
	"delite/HasDropDown",
	// "delite/StoreMap",
	// "delite/Selection",
	"./list/List",
	"delite/handlebars!./ComboBox/ComboBox.html",
	"requirejs-dplugins/i18n!./ComboBox/nls/ComboBox",
	"delite/theme!./ComboBox/themes/{{theme}}/ComboBox.css"
], function (dcl, domClass, register, FormWidget, HasDropDown,
		/*StoreMap, Selection,*/ List, template, messages) {

	/**
	 * A form-aware and store-aware widget leveraging the native HTML5 `<select>`
	 * element.
	 * It has the following characteristics:
	 * * The corresponding custom tag is `<d-combobox>`.
	 * * Store support (limitation: to avoid graphic glitches, the updates to the
	 * store should not be done while the native dropdown of the select is open).
	 * * The item rendering has the limitations of the `<option>` elements of the
	 * native `<select>`, in particular it is text-only.
	 * 
	 * TODO: improve doc.
	 * 
	 * Remarks:
	 * * The option items must be added, removed or updated exclusively using
	 * the store API. Direct operations using the DOM API are not supported.
	 * * The handling of the selected options of the underlying native `<select>`
	 * must be done using the API inherited by deliteful/ComboBox from delite/Selection.
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
	 * <d-select id="select1"></d-select>
	 * @example <caption>Using user's store</caption>
	 * JS:
	 * require(["delite/register", "dstore/Memory", "dstore/Observable",
	 *         "deliteful/ComboBox", "requirejs-domready/domReady!"],
	 *   function (register, Memory, Observable) {
	 *     register.parse();
	 *     var store = new (Memory.createSubclass(Observable))({});
	 *     select1.store = store;
	 *     store.add({text: "Option 1", value: "1"});
	 *     ...
	 *   });
	 * HTML:
	 * <d-select selectionMode="multiple" id="select1"></d-select>
	 * 
	 * @class module:deliteful/ComboBox
	 * @augments module:delite/FormWidget
	 * @augments module:delite/Store
	 */
	return register("d-combobox", [HTMLElement, HasDropDown, FormWidget/*, StoreMap, Selection*/],
		/** @lends module:deliteful/ComboBox# */ {
		
		// Note: the properties `store` and `query` are inherited from delite/Store, and
		// the property `disabled` is inherited from delite/FormWidget.
		
		baseClass: "d-combobox",
		
		/**
		 * The chosen selection mode.
		 *
		 * Valid values are:
		 *
		 * 1. "single": Only one option can be selected at a time.
		 * 2. "multiple": Several options can be selected (by taping or using the
		 * control key modifier).
		 *
		 * Changing this value impacts the currently selected items to adapt the
		 * selection to the new mode. However, regardless of the selection mode,
		 * it is always possible to set several selected items using the
		 * `selectedItem` or `selectedItems` properties.
		 * The mode will be enforced only when using `setSelected` and/or
		 * `selectFromEvent` APIs.
		 *
		 * @member {string} module:deliteful/ComboBox#selectionMode
		 * @default "single"
		 */
		// The purpose of the above pseudo-property is to adjust the documentation
		// of selectionMode as provided by delite/Selection.
		
		template: template,
		
		/**
		 * TBD.
		 * @member {boolean} module:deliteful/ComboBox#autoComplete
		 * @default false
		 */
		autoComplete: false,
		
		// TBD
		incrementalEnabled: false,
		
		/**
		 * The chosen selection mode.
		 *
		 * Valid values are:
		 *
		 * 1. "single": Only one option can be selected at a time.
		 * 2. "multiple": Several options can be selected (by taping or using the
		 * control key modifier).
		 *
		 * Changing this value impacts the currently selected items to adapt the
		 * selection to the new mode. However, regardless of the selection mode,
		 * it is always possible to set several selected items using the
		 * `selectedItem` or `selectedItems` properties.
		 * The mode will be enforced only when using `setSelected` and/or
		 * `selectFromEvent` APIs.
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
		
		/*
		startup: function () {
			
		},
		*/
		
		buildRendering: dcl.superCall(function (sup) {
			return function () {
				// this.valueNode = this.querySelector("input") || this.ownerDocument.createElement("input");
				sup.call(this);
				console.log("ComboBox.buildRendering");
				
				/*
				this.list = this.querySelector("d-list");
				if (this.list) {
					// Declarative case (list specified declaratively inside the declarative ComboBox)
					console.log(" ==> ComboBox.buildRendering initializes this.list and this.dropDown");
					this._initList();
				}
				*/
			};
		}),
		
		/*
		preCreate: function () {
			var observe = this.observe(function (oldValues) {
				if ("list" in oldValues) {
					console.log("ComboBox.preCreate oldValues.list: " + oldValues.list + " this.list: " + this.list);
					if (this.list) {
						this.list.style.height = "inherit";
						this.dropDown = this.list;
					}
				}
			});
		},
		*/
		
		postCreate: function () {
			console.log("ComboBox.postCreate sets dropDown to " + this.list);
			/*
			this.list = this.querySelector("d-list");
				if (this.list) {
					// Declarative case (list specified declaratively inside the declarative ComboBox)
					console.log(" ==> ComboBox.buildRendering initializes this.list and this.dropDown");
					this._initList();
				}
				console.log("ComboBox.buildRendering sets list to: " + this.list);
				
				this._buttonNode = this.input;
				console.log("ComboBox.buildRendering sets _buttonNode to: " + this._buttonNode);
				
				*/
			/*
			if (this.list) {
				this.list.style.height = "inherit";
				this.dropDown = this.list;
			}*/
 		},
 		
 		/*
 		 var filter = function(o) {
				console.log("filter o:");
				console.log(o); 
				return o.label.indexOf("a") != -1;
			};
 		 */
		
		refreshRendering: function (oldValues) {
			console.log("ComboBox.refreshRendering oldValues.list: " + 
				oldValues.list + " this.list: " + this.list);
			if ("list" in oldValues) {
				// Programmatic case (list passed as ComboBox' ctor arg)
				console.log("   ==> ComboBox.refreshRendering initializes this.list and this.dropDown");
				this._initList();
			} else if (!this.list) {
				this.list = this.querySelector("d-list");
				if (this.list) {
					// Declarative case (list specified declaratively inside the declarative ComboBox)
					console.log(" ==> ComboBox.buildRendering initializes this.list and this.dropDown");
					this._initList();
				}
			}
		},
		
		_initList: function() {
			domClass.add(this.list, "d-combobox-list-hidden");
			this.list.placeAt(this); // TODO change of list must remove from DOM => custom setter
			this.list.style.height = "inherit";
			if (this.autoComplete) {
				// do not give focus to the popup, otherwise the user can't type in the input field
				this.list.focusOnOpen = false;
			}
			// this.forceWidth = true; // TODO checkme
			this.list.isAriaListbox = true;
			/* // TODO comment
			if (this.list.selectionMode === "none") {
				this.list.selectionMode = "single";
			}*/
			this.list.selectionMode = this.selectionMode;
			this.dropDown = this.list;
				
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
				
			this.list.on("selection-change", function (evt) {
				console.log("oldValue: " + evt.oldValue);
				console.log("newValue: " + evt.newValue);
				if (this.selectionMode === "single") {
					var selectedItem = this.list.selectedItem;
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
						var selectedItem = this.list.selectedItem;
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
				this.list.query = function(obj) {
					// TODO: case-sensitiveness, startsWith/contains
					return obj.label.indexOf(txt) === 0;
				};
				console.log("on(input) calls openDropDown");
				this.openDropDown(); // reopen if closed
			}.bind(this), this.input);
		},
		
		closeDropDown: dcl.superCall(function (sup) {
			return function () {
				console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
				// Reinit the query. Necessary such that after closing the dropdown
				// in autocomplete mode with a text in the input field not matching
				// any item, when the dropdown will be reopen it shows all items
				// instead of being empty 
				this.list.query = {};
				sup.apply(this, arguments);
			};
		}),
		
		/*
		_onBlur: dcl.superCall(function (sup) {
			return function () {
				alert("_onBlur");
				// sup.apply(this, arguments);
			};
		}),
		*/
		
		_onTouchNode: dcl.superCall(function (sup) {
			return function (node, by) {
				if (this.getEnclosingWidget(node) !== this) {
					return sup.apply(this, arguments);
				}
			};
		})
		
		/*
		hasSelectionModifier: function () {
			// Override of the method from delite/Selection
			return this.list.hasSelectionModifier();
		},
		
		getIdentity: function (renderItem) {
			// Override of delite/Selection's method
			return this.list.getIdentity(renderItem);
		},
		
		updateRenderers: function () {
			// Override of delite/Selection's method
			// Trigger rerendering from scratch:
			this.notifyCurrentValue("renderItems");
		},
		
		_setValueAttr: function (value) {
			if (this.valueNode) {
				this.valueNode.value = value;
			}
			this._set("value", value);
		},
		
		_setSelectionModeAttr: function (value) {
			// Override of the setter from delite/Selection to forward to List
			this.list.selectionMode = value;
		}
		*/
		
	});
});
