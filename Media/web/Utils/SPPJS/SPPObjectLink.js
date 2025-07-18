var SPP = SPP || {};

const SPP.NativeTypesPoD = {
		"float" : "Number",
		"double" : "Number",
		"int8_t" : "Number",
		"uint8_t" : "Number",
		"int16_t" : "Number",
		"uint16_t" : "Number",
		"int32_t" : "Number",
		"uint32_t" : "Number",
		"int64_t" : "Number",
		"uint64_t" : "Number",
		"bool" : "Bool"
	};
	
class ObjectLink {
  constructor(InObjId) {
    this._objID = InObjId;
  }

  speak() {
    console.log(`${this.name} makes a noise.`);
  }
}
	
	
function AppendPath(InValue, CurPath)
	{
		if(CurPath.length == 0)
		{
			return InValue;
		}
		else
		{
			return CurPath + "." + InValue;
		}	
	}
	
	function NativeStructToInput(memberElement, subTypes, tableCol, curPath) {
	
		var tbl = document.createElement('table');		
		var tbdy = document.createElement('tbody');
		
		tbl.setAttribute("class", "styled-table");
		
		memberElement.value.forEach(function(memberData) {					
			NativeTypeToInput(memberData, subTypes, tbdy, AppendPath(memberElement.name, curPath));	
		});
		
		tbl.appendChild(tbdy);
		tableCol.appendChild(tbl);
	}
	
	function NativeEnumToInput(memberElement, subTypeEnum, tableCol, curPath) {
		
		var eumSelect = document.createElement("SELECT");
		eumSelect.setAttribute("id", memberElement.name + "EVALUE");		
		eumSelect.propPath = AppendPath(memberElement.name, curPath);
			
		subTypeEnum.values.forEach(function(curValue) {	
			var curOpt = document.createElement("option");
			curOpt.setAttribute("value", curValue);
			var txtNode = document.createTextNode(curValue);
			curOpt.appendChild(txtNode);

			eumSelect.appendChild(curOpt);
		});
				
		eumSelect.value = memberElement.value;
		
		tableCol.appendChild(eumSelect);
	}
	
	function NativeTypeToInput(memberElement, subTypes, tableBody, curPath)
	{
		let memberyTypeName = memberElement.type;
		//console.log("memberyTypeName: " + memberyTypeName);
		
		if( memberyTypeName in NativeTypesPoD )
		{
			//console.log(" POD");
			
			var tr = document.createElement('tr');
			var tdN = document.createElement('td');
			var tdV = document.createElement('td');
						
			tdN.setAttribute("class", "alnright");
			tdN.appendChild(document.createTextNode(memberElement.name));
	
			var x = document.createElement("INPUT");
			x.setAttribute("type", "text");
			x.setAttribute("value", memberElement.value);
			x.propPath = AppendPath(memberElement.name, curPath);
			
			if(NativeTypesPoD[memberyTypeName] == "Number")
			{
				setInputFilter(x, function(value) {
				  return /^-?\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a RegExp
				});
			}

			tdV.appendChild(x);
			
			tr.appendChild(tdN);
			tr.appendChild(tdV);
			
			tableBody.appendChild(tr);
		}
		else if( memberyTypeName in subTypes )
		{
			let curSubType = subTypes[memberyTypeName];		
							
			var tr = document.createElement('tr');
			var tdN = document.createElement('td');
			var tdV = document.createElement('td');
			
			tdN.setAttribute("class", "alnright");
			tdN.appendChild(document.createTextNode(memberElement.name));
				
			//console.log(" SUB");
			if( curSubType.type == "enum" )
			{
				//console.log("ENUM");				
				NativeEnumToInput(memberElement, curSubType, tdV, curPath);
			}
			else
			{
				//console.log(" SUB");
				NativeStructToInput(memberElement, subTypes, tdV, curPath);				
			}
			
			tr.appendChild(tdN);
			tr.appendChild(tdV);
				
			tableBody.appendChild(tr);
		}
	}
	
	function generateObjTable(divID, TableData, subTypes) {
		$(divID).empty();
		
		var tbl = document.createElement('table');		
		var tbdy = document.createElement('tbody');
		
		tbl.setAttribute("class", "styled-table");
	
		TableData.forEach(function(memberData) {					
			NativeTypeToInput(memberData, subTypes, tbdy, "");	
		});
		
		tbl.appendChild(tbdy);
		
		$(divID).append(tbl);
	}