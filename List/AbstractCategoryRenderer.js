define(["dcl/dcl",
        "dojo/dom-class",
        "dojo/dom-construct",
        "delite/Widget",
        "./Measurable"
], function (dcl, domClass, domConstruct, Widget, Measurable) {

	return dcl([Widget, Measurable], {

		// The category to render
		category: "",
		_setCategoryAttr: function (value) {
			this._set("category", value);
			this.renderCategory(value);
		},

		buildRendering: function () {
			this.style.display = "block";
			this._isCategoryCell = true;
		},

		// Method that render the category in the widget GUI
		/*jshint unused:false */
		renderCategory: function (category) {
			// abstract method
		},

	});
});