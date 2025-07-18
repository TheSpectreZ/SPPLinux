if (!window.InvokeNative) {
	window.InvokeNative = function (InFuncName, ...theArgs) {
		console.log("No Native Invoke: " + JSON.stringify({ func: InFuncName, args: theArgs }))
	}
}


function AddEnumeratorProperty(InProp, InParentDiv) {

	const bReadOnly = (InProp.access == "ReadOnly");
	//const newSelect = document.createElement("select");
	let currentEnumValues = window.enumMap[InProp.metaInfo];

	const newPropDiv = document.createElement("input");
	newPropDiv.type = "text";
	//newPropDiv.disabled = true;

	//newInput.onclick = function () {
	//	window.OpenPop(newInput,
	//		[
	//			{
	//				Name: "TestA"
	//			},
	//			{
	//				Name: "TestB"
	//			}
	//		])
	//};

	//newSelect.disabled = bReadOnly;
	//newSelect.id = "PropertyEnum";

	//let currentSelection = 0;
	//for (const curValue of currentEnumValues) {
	//	const newOption = document.createElement("option");
	//	newOption.innerHTML = curValue;
	//	newOption.value = curValue;
	//	if (InProp.value == curValue) {
	//		currentSelection = newSelect.childElementCount;
	//	}
	//	newSelect.appendChild(newOption);
	//}
	//newSelect.selectedIndex = currentSelection;

	InParentDiv.appendChild(newPropDiv);

	//jquery ui
	//$(newSelect).selectmenu();
	
	if (bReadOnly == false) {
		const newBinding = new EnumeratorBinding(InProp);
		newBinding.addBinding(newPropDiv);
		return newBinding;
	}

	return null;
}

function AddBooleanProperty(InProp, InParentDiv) {

	const bReadOnly = (InProp.access == "ReadOnly");
	const newInput = document.createElement("input");
	newInput.type = "checkbox";

	newInput.disabled = bReadOnly;
	InParentDiv.appendChild(newInput);

	if (bReadOnly == false) {
		const newBinding = new BooleanBinding(InProp);
		newBinding.addBinding(newInput);
		return newBinding;
	}
	else {
		if (InProp.data.value == "true") {
			newInput.checked = true;
		}
	}

	return null;
}

function AddIntegerProperty(InProp, InParentDiv) {

	const bReadOnly = (InProp.access == "ReadOnly");
	const newInput = document.createElement("input");
	newInput.type = "text";
	newInput.disabled = bReadOnly;
	InParentDiv.appendChild(newInput);

	if (bReadOnly == false) {
		const newBinding = new NumericInputBinding(InProp);
		newBinding.addBinding(newInput);
		return newBinding;
	}
	else {
		newInput.value = InProp.data.value;
	}

	return null;
}

function AddFloatProperty(InProp, InParentDiv) {

	const bReadOnly = (InProp.access == "ReadOnly");
	const newInput = document.createElement("input");
	newInput.type = "text";
	newInput.disabled = bReadOnly;
	InParentDiv.appendChild(newInput);

	if (bReadOnly == false) {
		const newBinding = new NumericInputBinding(InProp);
		newBinding.addBinding(newInput);
		return newBinding;
	}
	else {
		newInput.value = InProp.data.value;
	}
	return null;
}

function AddStringProperty(InProp, InParentDiv) {

	const bReadOnly = (InProp.access == "ReadOnly");
	const newInput = document.createElement("input");
	newInput.type = "text";
	newInput.disabled = bReadOnly;
	InParentDiv.appendChild(newInput);

	if (bReadOnly == false) {
		const newBinding = new TextInputBinding(
			{
				object: InProp.data,
				property: "value"
			});
		newBinding.addBinding(newInput);
	}
	else {
		newInput.value = InProp.data.value;
	}
}

function AddObjectReferenceProperty(InProp, InParentDiv, bReadOnly) {

	//const bReadOnly = (InProp.access == "ReadOnly");
	const newInput = document.createElement("input");
	newInput.type = "text";
	newInput.disabled = bReadOnly;

	newInput.onclick = function () {
		window.OpenPop(newInput,
			[
				{
					Name: "TestA"
				},
				{
					Name: "TestB"
				}
			])
	};

	InParentDiv.appendChild(newInput);

	if (bReadOnly == false) {
		const newBinding = new ObjectReferenceInputBinding(InProp);
		newBinding.addBinding(newInput);
	}
	else {
		newInput.value = InProp.data.value;
	}
}
function AddDynamicArrayProperty(InProp, InParentDiv, bReadOnly, InPanel) {

	//const bReadOnly = (InProp.access == "ReadOnly");
	const newArray = document.createElement("div");
	//newArray.innerHTML = "+- ()";	

	for (const curValue of InProp.value) {
		const newElement = document.createElement("div");
		AddPropData(curValue, newElement, false);
		newArray.appendChild(newElement);
	}

	{
		const newElement = document.createElement("button");
		newElement.innerHTML = "+";
		newElement.onclick = function () {
			InProp.addElement();
			InPanel.RebuildProperty(InProp);
		};

		newArray.appendChild(newElement);
	}
	{
		const newElement = document.createElement("button");
		newElement.innerHTML = "-";
		newElement.onclick = function () {
			InProp.removeElement();
			InPanel.RebuildProperty(InProp);
		};
		newArray.appendChild(newElement);
	}

	InParentDiv.appendChild(newArray);

	//if (bReadOnly == false) {
	//	const newBinding = new ObjectReferenceInputBinding(InProp);
	//	newBinding.addBinding(newInput);
	//}
	//else {
	//	newInput.value = InProp.data.value;
	//}
}


//
//{
//	"name" : "",
//	"access" : "",
//  "description" : "",
//	"data" : {
//		"type" : "",
//		"metaInfo" : "",
//		"value" : ""
//	}
//}

function AddPropData(InData, InDiv, bReadOnly, InPanel) {
	
	if (InData.type === EnumPropertyTypes.number) {
		if (InData.metaInfo == "float" || InData.metaInfo == "double") {
			return AddFloatProperty(InData, InDiv, bReadOnly, InPanel);
		}
		else {
			return AddIntegerProperty(InData, InDiv, bReadOnly, InPanel);
		}
	}
	else if (InData.type === EnumPropertyTypes.bool) {
		return AddBooleanProperty(InData, InDiv, bReadOnly, InPanel);
	}
	else if (InData.type === EnumPropertyTypes.string) {
		return AddStringProperty(InData, InDiv, bReadOnly, InPanel);
	}
	else if (InData.type === EnumPropertyTypes.enum) {
		return AddEnumeratorProperty(InData, InDiv, bReadOnly, InPanel);
	}
	else if (InData.type === EnumPropertyTypes.ObjectReference) {
		return AddObjectReferenceProperty(InData, InDiv, bReadOnly, InPanel);
	}
	else if (InData.type === EnumPropertyTypes.DynamicArray) {
		return AddDynamicArrayProperty(InData, InDiv, bReadOnly, InPanel);
	}

	return null;
}

function AddProperty(InProp, InParentDiv, InPanel) {

	console.log("AddProperty: " + InProp.name);

	const propDiv = document.createElement("div");

	propDiv.className = 'PropertyPanel';

	const propNameDiv = document.createElement("div");
	const propValueDiv = document.createElement("div");

	propNameDiv.className = 'PropertyName';
	propValueDiv.className = 'PropertyValue';
	propNameDiv.innerHTML = InProp.name;

	propDiv.appendChild(propNameDiv);
	propDiv.appendChild(propValueDiv);

	const bReadOnly = (InProp.access == "ReadOnly");
	AddPropData(InProp.data, propValueDiv, bReadOnly, InPanel);
		
	InParentDiv.appendChild(propDiv);
	return propDiv;
}

//if (CHROME_DEBUG)
  //  ContentBrowserInit(TestAssets);

class PropertyPanel {
	constructor(InTopDiv) {
		this.owningDiv = InTopDiv;
		this.activeProperties = [];
	}

	SetProperties(InProperties) {
		this.properties = InProperties;

		this.Rebuild();
	}

	SetJSONProperties(InJSONString) {
		console.log("SetJSONProperties: " + InJSONString);		
		let parsedObject = JSON.parse(InJSONString);
		this.properties = [];

		for (const currentProp of parsedObject.properties) {
			let objectProp = PropertyWithMeta.BuildFromPoD(currentProp);
			this.properties.push(objectProp);
		}

		this.Rebuild();
	}


	RebuildProperty(InProperty) {
		this.Rebuild();
	}

	Rebuild() {
		this.owningDiv.innerHTML = "";
		this.activeProperties = [];
		//this.owningDiv.className = 'PropertyPanel';

		for (const currentProp of this.properties) {

			let newProp = AddProperty(currentProp, this.owningDiv, this);
			if (newProp) {
				this.activeProperties.push(
					{
						Property: currentProp,
						PropertyDiv: newProp						
					}
				);
			}
		}

		console.dir(this.properties);
	}

	UpdateBindings() {
		for (const curBinding of this.activeProperties) {
			curBinding.UpdateBindings();
		}
	}

	GetJSON() {
		return JSON.stringify(this.properties, null, 2);
	}
}

//const div = document.getElementById('TestProp');
//const buttonTestEle = document.getElementById('btnRun');

//if (div) {
//	new PropertyPanel(div, jsonData);

//	//$("select").each(function (element) {
//	//	$(this).selectmenu();
//	//});
//}


//if (buttonTestEle) {
//	buttonTestEle.addEventListener("click", function () {
//		console.log(curCurrentPanel.GetJSON());
//		console.log("click");
//	});

//}