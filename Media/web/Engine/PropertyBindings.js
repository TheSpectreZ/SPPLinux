function EnumeratorBinding(InProp) {

	if (!(typeof InProp.value === "object" && InProp.value.constructor.name == "EnumValue")) {
		throw new Error("Bad Enum Prop");
	}

	const _this = this;
	const _prop = InProp;
	this.elementBindings = [];
	this.value = InProp.value;
	this.parentEnum = this.value.parent;
	this.enumList = window.enumMap[InProp.metaInfo];

	this.enumSelector = [];
	this.selectionFunction = function (idx) {	
		_this.value = _this.parentEnum.GetValue(_this.enumList[idx]);
		_this.UpdateBindings();
	}

	for (var i = 0; i < _this.enumList.length; i++) {
		this.enumSelector.push(
			{
				Name: this.enumList[i],
				Selected: this.selectionFunction
			}
		)
	}	

	this.addBinding = function (InElement) {

		if (!(typeof InElement === "object" && InElement.constructor.name == "HTMLInputElement")) {
			throw new Error("must be input");
		}

		//InElement.addEventListener("change", function (event) {
			//_this.valueSetter(InElement.value);
		//});

		InElement.onclick = function () {
			window.OpenPop(InElement, _this.enumSelector);
		};

		InElement.value = _this.value.name;

		this.elementBindings.push(InElement)		
		return _this
	}

	this.UpdateBindings = function () {
		for (const currentElement of _this.elementBindings) {
			currentElement.value = _this.value.name;
		}
	}
}
function TextInputBinding(InBinder) {
	const _this = this;
	this.elementBindings = [];
	this.value = InBinder.object[InBinder.property];
	this.valueGetter = function () {
		return _this.value;
	}
	this.valueSetter = function (val) {
		_this.value = val;

		for (var i = 0; i < _this.elementBindings.length; i++) {
			var binding = _this.elementBindings[i]
			binding.value = val
		}
	}
	this.addBinding = function (InElement) {
		if (!(typeof InElement === "object" && InElement.constructor.name == "HTMLInputElement")) {
			throw new Error("must be input");
		}

		InElement.addEventListener("change", function (event) {
			_this.valueSetter(InElement.value);
		});

		this.elementBindings.push(InElement)
		InElement.value = _this.value
		return _this
	}

	Object.defineProperty(InBinder.object, InBinder.property, {
		get: this.valueGetter,
		set: this.valueSetter
	});

	InBinder.object[InBinder.property] = this.value;
}

function NumericInputBinding(InBinder) {
	const _this = this;
	this.elementBindings = [];

	this.setValue = function (val) {
		InBinder.valueSet(val);
		_this.UpdateBindings();
	}
	this.addBinding = function (InElement) {
		if (!(typeof InElement === "object" && InElement.constructor.name == "HTMLInputElement")) {
			throw new Error("must be input");
		}

		InElement.addEventListener("change", function (event) {
			_this.setValue(InElement.value);
		});

		this.elementBindings.push(InElement)
		InElement.value = InBinder.value
		return _this
	}
	this.UpdateBindings = function () {
		let cleansedValue = InBinder.value;
		for (var i = 0; i < _this.elementBindings.length; i++) {
			var binding = _this.elementBindings[i]
			binding.value = cleansedValue
		}
	}
}
function BooleanBinding(InBinder) {
	const _this = this;
	this.elementBindings = [];

	this.setValue = function (val) {
		InBinder.valueSet(val);
		_this.UpdateBindings();
	}
	this.addBinding = function (InElement) {
		if (!(typeof InElement === "object" && InElement.constructor.name == "HTMLInputElement" && InElement.type === "checkbox")) {
			throw new Error("must be input");
		}

		InElement.addEventListener("change", function (event) {
			_this.setValue(InElement.checked ? "true" : "false");
		});

		this.elementBindings.push(InElement)
		InElement.checked = InBinder.value;
		return _this
	}

	this.UpdateBindings = function () {
		let cleansedValue = InBinder.value;
		for (var i = 0; i < _this.elementBindings.length; i++) {
			var binding = _this.elementBindings[i];
			binding.checked = cleansedValue;
		}
	}
}
function ObjectReferenceInputBinding(InBinder) {
	const _this = this;
	this.elementBindings = [];

	this.setValue = function (val) {
		InBinder.valueSet(val);
		_this.UpdateBindings();
	}
	this.addBinding = function (InElement) {
		InElement.addEventListener("change", function (event) {
			_this.setValue(InElement.value);
		});

		this.elementBindings.push(InElement)
		InElement.value = InBinder.value
		return _this
	}
	this.UpdateBindings = function () {
		let cleansedValue = InBinder.value;
		for (var i = 0; i < _this.elementBindings.length; i++) {
			var binding = _this.elementBindings[i]
			binding.value = cleansedValue
		}
	}
}