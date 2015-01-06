/** @module deliteful/_ComboPopup */
define([
	"delite/register",
	"delite/Widget",
	"delite/handlebars!./ComboPopup.html"
], function (register, Widget, template) {
	/**
	 * A widget used as centered popup by deliteful/Combobox.
	 * 
	 * @class module:deliteful/Combobox/_ComboPopup
	 * @augments module:delite/Widget
	 * @private
	 */
	return register("d-combo-popup", [HTMLElement, Widget],
		/** @lends module:deliteful/_ComboPopup# */ {
		
		baseClass: "d-combo-popup",
		
		template: template,
		
		/**
		 * The instance of `deliteful/Combobox` for which _ComboPopup is used.
		 * @member {boolean} module:deliteful/Combobox/_ComboPopup#combobox
		 * @default null
		 */
		combobox: null,
		
		okHandler: function () {
			this.combobox._validateMultiple(this.combobox.inputNode);
			this.combobox.closeDropDown();
		},
		
		cancelHandler: function () {
			this.combobox.list.selectedItems = this.combobox._selectedItems;
			this.combobox.closeDropDown();
		}
	});
});
