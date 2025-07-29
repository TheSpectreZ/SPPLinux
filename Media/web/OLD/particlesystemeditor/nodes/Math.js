(function(global){

    const LiteGraph = global.LiteGraph;

	function Math_Float() {
		this.addOutput("value", "float");
		this.addWidget("number","",1,"value", {x: 10, y: 10, width: 100} );
		this.properties = { value: 1 };
		
		this.size = [180, 40];
		this.resizable = false;
		this.widgets_up = true;
	}

	Math_Float.prototype.onExecute = function() {
		this.setOutputData(0, this.properties.value);
	}

	Math_Float.title = "Float";
	LiteGraph.registerNodeType("Math/Float", Math_Float);

	function Math_FloatRange() {
		this.addInput("Min", "float");
		this.addInput("Max", "float");

		this.properties = { Min: 0, Max: 0 };

		this.widgets = [];
		this.widgets[0] = this.addWidget("number", "", 0, "Min", { x: 50, y: 0, width: 100 });
		
		this.widgets[1] = this.addWidget("number", "", 0, "Max", { x: 50, y: 28, width: 100 });
		
		this.widgets_up = true;

		this._data = {
			min: 0,
			max: 0
		};

		this.addOutput("value", "FloatRange");
	}

	Math_FloatRange.prototype.onConnectionsChange =  function(Type, slot, bConnected, linkInfo, inputInfo) {

		if(!linkInfo || Type != LiteGraph.INPUT || slot > 1)
			return;

		if(bConnected)
			this.widgets[slot].hidden = true;
		else
			this.widgets[slot].hidden = false;

	}

	Math_FloatRange.prototype.onExecute = function() {

		if(this.widgets[0].hidden) {
			var value = this.getInputData(0);
			this._data.min = value ? value : 0;
		} else {
			this._data.min = this.properties.Min;
		}

		if(this.widgets[1].hidden) {
			var value = this.getInputData(1);
			this._data.max = value ? value : 0;
		} else {
			this._data.max = this.properties.Max;
		}

		this.setOutputData(0, this._data);
	}

	Math_FloatRange.title = "Float Range";
	LiteGraph.registerNodeType("Math/FloatRange", Math_FloatRange);

	function Math_Vector2() {
		this.addOutput("value", "vec2");
		
		this.addWidget("number","x",0,"x", {width: 100, y: 5 });
		this.addWidget("number","y",0,"y", {width: 100, y: 30});
		
		this.size = [180, 60];
		this.resizable = false;
		this.widgets_up = true;

		this.properties = { x: 0, y:0 };
		this.data = {
			x: 1.0,
			y: 1.0
		};
	}

	Math_Vector2.prototype.onExecute = function() {
		this.data.x = this.properties.x;
		this.data.y = this.properties.y;

		this.setOutputData(0, this.data);
	}

	Math_Vector2.title = "Vector2";
	LiteGraph.registerNodeType("Math/Vector2", Math_Vector2);

	function Math_MakeVector2() {
		this.addInput("x", "float");
		this.addInput("y", "float");

		this.addOutput("value", "vec2");
	}

	Math_MakeVector2.prototype.onExecute = function() {
		let x = this.getInputData(0);
		let y = this.getInputData(1);

		let vector = {
			x: 0,
			y: 0
		};

		vector.x = x;
		vector.y = y;

		this.setOutputData(0, vector);
	}
	
	Math_MakeVector2.title = "Make Vector2";
	LiteGraph.registerNodeType("Math/MakeVector2", Math_MakeVector2);

	function Math_BreakVector2() {
		this.addInput("value", "vec2");

		this.addOutput("x", "float");
		this.addOutput("y", "float");
	}

	Math_BreakVector2.prototype.onExecute = function() {
		var value = this.getInputData(0);

		this.setOutputData(0, value.x);
		this.setOutputData(1, value.y);
	}

	Math_BreakVector2.title = "Break Vector2";
	LiteGraph.registerNodeType("Math/BreakVector2", Math_BreakVector2);

	function Math_Vector2Range() {

		this.addInput("Min", "float", {pos: [12, 15]});
		this.addInput("Max", "float", {pos: [12, 38]});
		this.addInput("Scale", "vec2", {pos: [12, 63]});

		this.properties = { Min: 0, Max: 0, scaleX: 0, scaleY: 0, Type: "XY" };
		
		this.addOutput("value", "Vec2Range");
		
		this.widgets = [];
		this.widgets[0] = this.addWidget("number", "", 0, "Min", { x: 50, y: 5 , width: 100 });		
		this.widgets[1] = this.addWidget("number", "", 0, "Max", { x: 50, y: 30, width: 100 });

		this.widgets[2] = this.addWidget("number", "x", 0, "scaleX", {x: 0, y: 75, width: 100});
		this.widgets[3] = this.addWidget("number", "y", 0, "scaleY", {x: 0, y: 100, width: 100});
		
		this.addWidget("combo", "Type ", "XY", "Type", { values: ["XY", "X/Y"], x: 175, y: 30, width: 100 } );
		
		this._FullSize = [280, 130];
		this._SmallSize = [280, 80];

		this.size = this._FullSize;
		this.resizable = false;
		this.widgets_up = true;

		this._data = {
			type: "XY",
			min: 1,
			max: 1,
			scale: {
				x: 1,
				y: 1,
			}
		};
	}
	
	Math_Vector2Range.prototype.onConnectionsChange =  function(Type, slot, bConnected, linkInfo, inputInfo) {

		if(!linkInfo || Type != LiteGraph.INPUT || slot > 2)
			return;

		if(slot < 2) {
			if(bConnected)
				this.widgets[slot].hidden = true;
			else
				this.widgets[slot].hidden = false;
		}
		else {
			if(bConnected) {
				this.widgets[2].hidden = true;
				this.widgets[3].hidden = true;

				this.size = this._SmallSize;
			}
			else {
				this.widgets[2].hidden = false;
				this.widgets[3].hidden = false;
				
				this.size = this._FullSize;
			}
		}
	}

	Math_Vector2Range.prototype.onExecute = function() {

		if(this.widgets[0].hidden) {
			var value = this.getInputData(0);
			this._data.min = value ? value : 0;
		} else {
			this._data.min = this.properties.Min;
		}

		if(this.widgets[1].hidden) {
			var value = this.getInputData(1);
			this._data.max = value ? value : 0;
		} else {
			this._data.max = this.properties.Max;
		}

		if(this.widgets[2].hidden) {
			var value = this.getInputData(2);
			this._data.scale.x = value.x ? value.x : 1;
			this._data.scale.y = value.y ? value.y : 1;
		} else {
			this._data.scale.x = this.properties.scaleX;
			this._data.scale.y = this.properties.scaleY;
		}

		this._data.type = this.properties.Type;

		this.setOutputData(0, this._data);
	}

	Math_Vector2Range.title = "Vector2 Range";
	LiteGraph.registerNodeType("Math/Vector2Range", Math_Vector2Range);

	function Math_Vector3() {
		this.addOutput("value", "vec3");

		this.addWidget("number","x",0,"x", {width: 100, y: 5});
		this.addWidget("number","y",0,"y", {width: 100, y: 30});
		this.addWidget("number","z",0,"z", {width: 100, y: 55});

		this.size = [180, 85];
		this.resizable = false;
		this.widgets_up = true;

		this.properties = { x:0, y:0, z:0 };
		this.data = {
			x: 1,
			y: 1,
			z: 1
		};
	}

	Math_Vector3.prototype.onExecute = function() {
		this.data.x = this.properties.x;
		this.data.y = this.properties.y;
		this.data.z = this.properties.z;
		
		this.setOutputData(0, this.data);
	}

	Math_Vector3.title = "Vector3";
	LiteGraph.registerNodeType("Math/Vector3", Math_Vector3);

	function Math_MakeVector3() {
		this.addInput("x", "float");
		this.addInput("y", "float");
		this.addInput("z", "float");

		this.addOutput("value", "vec3");
	}

	Math_MakeVector3.prototype.onExecute = function() {
		let x = this.getInputData(0);
		let y = this.getInputData(1);
		let z = this.getInputData(2);

		let vector = {
			x: 0,
			y: 0,
			z: 0
		};

		vector.x = x;
		vector.y = y;
		vector.z = z;

		this.setOutputData(0, vector);
	}
	
	Math_MakeVector3.title = "Make Vector3";
	LiteGraph.registerNodeType("Math/MakeVector3", Math_MakeVector3);

	function Math_BreakVector3() {
		this.addInput("value", "vec3");

		this.addOutput("x", "float");
		this.addOutput("y", "float");
		this.addOutput("z", "float");
	}

	Math_BreakVector3.prototype.onExecute = function() {
		var value = this.getInputData(0);

		this.setOutputData(0, value.x);
		this.setOutputData(1, value.y);
		this.setOutputData(2, value.z);
	}

	Math_BreakVector3.title = "Break Vector3";
	LiteGraph.registerNodeType("Math/BreakVector3", Math_BreakVector3);

	function Math_Vector3Range() {
		this.addInput("Min", "float", {pos: [12, 15]});
		this.addInput("Max", "float", {pos: [12, 38]});
		this.addInput("Scale", "vec3", {pos: [12, 63]});
		
		this.addOutput("value", "Vec3Range");

		this.properties = { Min: 0, Max: 0, scaleX: 0, scaleY: 0, scaleZ: 0, Type: "XYZ" };
		
		this.widgets = [];
		this.widgets[0] = this.addWidget("number", "", 0, "Min", { x: 50, y: 5 , width: 100 });		
		this.widgets[1] = this.addWidget("number", "", 0, "Max", { x: 50, y: 30, width: 100 });

		this.widgets[2] = this.addWidget("number", "x", 0, "scaleX", {x: 0, y:  75, width: 100});
		this.widgets[3] = this.addWidget("number", "y", 0, "scaleY", {x: 0, y:  100, width: 100});
		this.widgets[4] = this.addWidget("number", "z", 0, "scaleZ", {x: 0, y:  125, width: 100});

		this.addWidget("combo", "Type ", "XYZ", "Type", { values: ["XYZ", "X/Y/Z"], x: 170, y: 30, width: 125 } );

		this._FullSize = [300, 155];
		this._SmallSize = [300, 80];

		this.size = this._FullSize;
		this.resizable = false;
		this.widgets_up = true;

		this._data = {
			type: "XYZ",
			min: 1,
			max: 1,
			scale: {
				x: 1,
				y: 1,
				z: 1
			}
		};
	}

	Math_Vector3Range.prototype.onConnectionsChange =  function(Type, slot, bConnected, linkInfo, inputInfo) {

		if(!linkInfo || Type != LiteGraph.INPUT || slot > 2)
			return;

		if(slot < 2) {
			if(bConnected)
				this.widgets[slot].hidden = true;
			else
				this.widgets[slot].hidden = false;
		}
		else {
			if(bConnected) {
				this.widgets[2].hidden = true;
				this.widgets[3].hidden = true;
				this.widgets[4].hidden = true;

				this.size = this._SmallSize;
			}
			else {
				this.widgets[2].hidden = false;
				this.widgets[3].hidden = false;
				this.widgets[4].hidden = false;

				this.size = this._FullSize;
			}
		}
	}

	Math_Vector3Range.prototype.onExecute = function() {

		if(this.widgets[0].hidden) {
			var value = this.getInputData(0);
			this._data.min = value ? value : 0;
		} else {
			this._data.min = this.properties.Min;
		}

		if(this.widgets[1].hidden) {
			var value = this.getInputData(1);
			this._data.max = value ? value : 0;
		} else {
			this._data.max = this.properties.Max;
		}

		if(this.widgets[2].hidden) {
			var value = this.getInputData(2);
			this._data.scale.x = value.x ? value.x : 1;
			this._data.scale.y = value.y ? value.y : 1;
			this._data.scale.z = value.z ? value.z : 1;
		} else {
			this._data.scale.x = this.properties.scaleX;
			this._data.scale.y = this.properties.scaleY;
			this._data.scale.z = this.properties.scaleZ;
		}

		this._data.type = this.properties.Type;

		this.setOutputData(0, this._data);
	}

	Math_Vector3Range.title = "Vector3 Range";
	LiteGraph.registerNodeType("Math/Vector3Range", Math_Vector3Range);

	function Math_Vector4() {
		this.addOutput("value", "vec4");

		this.addWidget("number","x",0,"x", {width: 100, y: 5});
		this.addWidget("number","y",0,"y", {width: 100, y: 30});
		this.addWidget("number","z",0,"z", {width: 100, y: 55});
		this.addWidget("number","w",0,"w", {width: 100, y: 80});

		this.size = [ 180, 110 ];
		this.resizable = false;
		this.widgets_up = true;

		this.properties = { x:0, y:0, z:0, w:0 };
		this.data = {
			x: 1,
			y: 1,
			z: 1,
			w: 1
		};
	}

	Math_Vector4.prototype.onExecute = function() {
		this.data.x = this.properties.x;
		this.data.y = this.properties.y;
		this.data.z = this.properties.z;
		this.data.w = this.properties.w;

		this.setOutputData(0, this.data);
	}

	Math_Vector4.title = "Vector4";
	LiteGraph.registerNodeType("Math/Vector4", Math_Vector4);

	function Math_MakeVector4() {
		this.addInput("x", "float");
		this.addInput("y", "float");
		this.addInput("z", "float");
		this.addInput("w", "float");

		this.addOutput("value", "vec4");
	}

	Math_MakeVector4.prototype.onExecute = function() {
		let x = this.getInputData(0);
		let y = this.getInputData(1);
		let z = this.getInputData(2);
		let w = this.getInputData(3);

		let vector = {
			x: 0,
			y: 0,
			z: 0,
			w: 0
		};

		vector.x = x;
		vector.y = y;
		vector.z = z;
		vector.w = w;

		this.setOutputData(0, vector);
	}
	
	Math_MakeVector4.title = "Make Vector4";
	LiteGraph.registerNodeType("Math/MakeVector4", Math_MakeVector4);

	function Math_BreakVector4() {
		this.addInput("value", "vec4");

		this.addOutput("x", "float");
		this.addOutput("y", "float");
		this.addOutput("z", "float");
		this.addOutput("w", "float");
	}

	Math_BreakVector4.prototype.onExecute = function() {
		var value = this.getInputData(0);

		this.setOutputData(0, value.x);
		this.setOutputData(1, value.y);
		this.setOutputData(2, value.z);
		this.setOutputData(3, value.w);
	}

	Math_BreakVector4.title = "Break Vector4";
	LiteGraph.registerNodeType("Math/BreakVector4", Math_BreakVector4);

	function Math_Vector4Range() {

		this.addInput("Min", "float", {pos: [12, 15]});
		this.addInput("Max", "float", {pos: [12, 38]});
		this.addInput("Scale", "vec4", {pos: [12, 63]});

		this.addOutput("value", "Vec4Range");

		this.properties = { Min: 0, Max: 0, scaleX: 0, scaleY: 0, scaleZ: 0, scaleW: 0, Type: "XYZW" };
		
		this.widgets = [];
		this.widgets[0] = this.addWidget("number", "", 0, "Min", { x: 50, y: 5 , width: 100 });		
		this.widgets[1] = this.addWidget("number", "", 0, "Max", { x: 50, y: 30, width: 100 });

		this.widgets[2] = this.addWidget("number", "x", 0, "scaleX", {x: 0, y:  75, width: 100});
		this.widgets[3] = this.addWidget("number", "y", 0, "scaleY", {x: 0, y:  100, width: 100});
		this.widgets[4] = this.addWidget("number", "z", 0, "scaleZ", {x: 0, y:  125, width: 100});
		this.widgets[5] = this.addWidget("number", "w", 0, "scaleW", {x: 0, y:  150, width: 100});
		
		this.addWidget("combo", "Type ", "XYZW", "Type", { values: ["XYZW", "XYZ/W", "X/Y/Z/W"], x: 170, y: 30, width: 125 } );

		this._FullSize = [300, 180];
		this._SmallSize = [300, 80];

		this.size = this._FullSize;
		this.resizable = false;
		this.widgets_up = true;

		this._data = {
			type: "XYZW",
			min: 1,
			max: 1,
			scale: {
				x: 1,
				y: 1,
				z: 1,
				w: 1
			}
		};
	}

	Math_Vector4Range.prototype.onConnectionsChange =  function(Type, slot, bConnected, linkInfo, inputInfo) {

		if(!linkInfo || Type != LiteGraph.INPUT || slot > 2)
			return;

		if(slot < 2) {
			if(bConnected)
				this.widgets[slot].hidden = true;
			else
				this.widgets[slot].hidden = false;
		}
		else {
			if(bConnected) {
				this.widgets[2].hidden = true;
				this.widgets[3].hidden = true;
				this.widgets[4].hidden = true;
				this.widgets[5].hidden = true;

				this.size = this._SmallSize;
			}
			else {
				this.widgets[2].hidden = false;
				this.widgets[3].hidden = false;
				this.widgets[4].hidden = false;
				this.widgets[5].hidden = false;

				this.size = this._FullSize;
			}
		}
	}


	Math_Vector4Range.prototype.onExecute = function() {

		if(this.widgets[0].hidden) {
			var value = this.getInputData(0);
			this._data.min = value ? value : 0;
		} else {
			this._data.min = this.properties.Min;
		}

		if(this.widgets[1].hidden) {
			var value = this.getInputData(1);
			this._data.max = value ? value : 0;
		} else {
			this._data.max = this.properties.Max;
		}

		if(this.widgets[2].hidden) {
			var value = this.getInputData(2);
			this._data.scale.x = value.x ? value.x : 1;
			this._data.scale.y = value.y ? value.y : 1;
			this._data.scale.z = value.z ? value.z : 1;
			this._data.scale.w = value.w ? value.w : 1;
		} else {
			this._data.scale.x = this.properties.scaleX;
			this._data.scale.y = this.properties.scaleY;
			this._data.scale.z = this.properties.scaleZ;
			this._data.scale.w = this.properties.scaleW;
		}

		this._data.type = this.properties.Type;

		this.setOutputData(0, this._data);
	}

	Math_Vector4Range.title = "Vector4 Range";
	LiteGraph.registerNodeType("Math/Vector4Range", Math_Vector4Range);

})(this);