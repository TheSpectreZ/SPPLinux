//JSTypes

//Boolean
//Number
//BigInt
//String
//Symbol

let EnumPropertyTypes = new Enum("EnumPropertyTypes", "number", "bool", "string", "enum", "object", "DynamicArray", "ObjectReference", "unknown");

function GetValueType(InValue) {
    let isNumber = (typeof InValue === "number");
    let isString = (typeof InValue === "string");
    let isBoolean = (typeof InValue == "boolean");
    let isObject = (typeof InValue === "object");
    let isEnumValue = false;

    if (isObject) {
        isEnumValue = (InValue.constructor.name == "EnumValue");
    }

    if (isNumber) {
        return EnumPropertyTypes.number;
    } else if (isBoolean) {
        return EnumPropertyTypes.bool;
    } else if (isString) {
        return EnumPropertyTypes.string;
    } else if (isEnumValue) {
        return EnumPropertyTypes.enum;
    } else if (isObject) {
        return EnumPropertyTypes.object;
    }

    return EnumPropertyTypes.unknown;
}
function stringToBoolean(stringValue) {
    switch (stringValue?.toLowerCase()?.trim()) {
        case "true":
        case "yes":
        case "1":
            return true;

        case "false":
        case "no":
        case "0":
        case null:
        case undefined:
            return false;

        default:
            return JSON.parse(stringValue);
    }
}

function GetDefaultValueFromType(InOurType, InCtype) {

    if (!InOurType) {
        throw new Error("Why no type?!");
    }

    if (InOurType === EnumPropertyTypes.number) {
        return Number(0);
    } else if (InOurType === EnumPropertyTypes.bool) {
        return Boolean(false);
    } else if (InOurType === EnumPropertyTypes.string) {
        return "";
    } else if (InOurType === EnumPropertyTypes.enum) {
        if (!InCtype) {
            throw new Error("Needs Ctype!!!");
        }
        let foundEnum = Enum.GetEnum(InCtype);
        let enumValue = foundEnum.GetFirstEnum();
        return enumValue;
    } else if (InOurType === EnumPropertyTypes.ObjectReference) {
        return "Null";
    } 

    throw new Error("No conversion");
    return null;
}
function GetValueAsType(InOurType, InValue, InCtype) {

    if (!InOurType) {
        throw new Error("Why no type?!");
    }

    let valueType = GetValueType(InValue);

    if (InOurType === valueType) {
        return InValue;
    } else {
        if (InOurType === EnumPropertyTypes.number) {
            return Number(InValue);
        } else if (InOurType === EnumPropertyTypes.bool) {

            if (valueType === EnumPropertyTypes.string) {
                return Boolean(stringToBoolean(InValue));
            } else {
                return Boolean(InValue);
            }

        } else if (InOurType === EnumPropertyTypes.string) {
            return string(InValue);
        } else if (InOurType === EnumPropertyTypes.enum) {

            if (!InCtype) {
                throw new Error("Needs Ctype!!!");
            }

            console.log("GetValueAsType enum: " + InCtype + " : " + InValue);

            if (valueType === EnumPropertyTypes.string) {

                let foundEnum = Enum.GetEnum(InCtype);
                let enumValue = foundEnum.GetValue(InValue);

                console.log(" -  " + foundEnum.name);
                console.log(" -  " + enumValue.name);

                return Enum.GetEnum(InCtype).GetValue(InValue);
            }

            throw new Error("Enum Fail");
            return null;
        } else if (InOurType === EnumPropertyTypes.ObjectReference) {
            if (valueType === EnumPropertyTypes.string) {
                return InValue;
            }            
        } else if (InOurType === EnumPropertyTypes.DynamicArray) {
            return InValue;
        }

        throw new Error("No conversion");
        return null;
    }
}

class DataWrapper {
    constructor() {
        this.type = EnumPropertyTypes.unknown;
        this.metaInfo = "";
        this.value = null;
    }

    static Build(InType, InMetaInfo, InValue) {
        let outWrapper = new DataWrapper();

        if (typeof InType === "object" && InType.constructor.name == "EnumValue") {
            outWrapper.type = InType;
        } else {
            if (!(typeof InType === "string")) {
                throw new Error("must be string or enumvalue");
            }
            outWrapper.type = EnumPropertyTypes.GetValue(InType);
        }

        outWrapper.metaInfo = InMetaInfo;

        if (outWrapper.type === EnumPropertyTypes.DynamicArray) {

            outWrapper.innerType = EnumPropertyTypes.GetValue(InValue.type);
            outWrapper.innerMetaInfo = InValue.metaInfo;
            outWrapper.value = [];

            for (const currentValue of InValue.value) {
                outWrapper.value.push(DataWrapper.Build(InValue.type,
                    InValue.metaInfo,
                    currentValue));
            }
        }
        else {
            outWrapper.valueSet(InValue);
        }        

        return outWrapper;
    }

    valueSet(InValue) {
        if (this.type === EnumPropertyTypes.DynamicArray) {
            throw new Error("hmmmmmmm");
        }

        if (this.type === EnumPropertyTypes.ObjectReference) {
            // validate
        }

        this.value = GetValueAsType(this.type, InValue, this.metaInfo);
    }

    addElement() {
        if (this.type === EnumPropertyTypes.DynamicArray) {

            this.value.push(DataWrapper.Build(this.innerType,
                this.innerMetaInfo,
                GetDefaultValueFromType(this.innerType) ));

        } else {
            throw new Error("Not Array");
        }
    }

    removeElement() {
        if (this.type === EnumPropertyTypes.DynamicArray) {
            this.value.pop();
        } else {
            throw new Error("Not Array");
        }
    }

    toJSON() {
        let oValue = this.value;
        if (typeof this.value === "object") {
            oValue = this.value.toJSON();
        }
        return {
            type: this.type.toJSON(),
            metaInfo: this.metaInfo,
            value: oValue,
        };
    }

    fromJSON(inObj) {
        if (this.type === inObj.type) {
            if (inObj.type === "enum") {
                this.value = Enum.GetEnum(inObj.value.parentName).GetValue(inObj.value.name);
            }
            else if (this.value.fromJson) {
                this.value.fromJson(inObj.value);
            } else {
                this.value = inObj.value;
            }
        }
    }
}

class PropertyWithMeta {
    constructor() {
        //this.type = EnumPropertyTypes.unknown;
        this.name = "UNSET";
        this.access = "";
        this.description = "";
        this.data = new DataWrapper();
        this.changedEvents = [];

        Object.defineProperty(this, "value", {
            get: this.valueGetter,
            set: this.valueSetter
        });
        Object.defineProperty(this, "type", {
            get: this.typeGetter,
            set: this.typeSetter
        });
    }

    typeGetter() {
        return this.data.type;
    }

    typeSetter(InValue) {

        if (!(typeof InValue === "object" && InValue.constructor.name == "EnumValue")) {
            throw new Error("Must be enum value!!!");
        }

        this.data.type = InValue;
    }
    
    static BuildFromValue(InName, InValue, InCallerObject) {

        let newProp = new PropertyWithMeta();

        let enumType = GetValueType(InValue);

        let isType = "";
        let Ctype = "";

        if (newProp.type === EnumPropertyTypes.number) {
            isType = "number";
            Ctype = "float";
        } else if (newProp.type === EnumPropertyTypes.bool) {
            isType = "bool";
        } else if (newProp.type === EnumPropertyTypes.string) {
            isType = "string";
        } else if (newProp.type === EnumPropertyTypes.enum) {
            isType = "enum";
            Ctype = InValue.parent.name;
        } else if (newProp.type === EnumPropertyTypes.object) {
            isType = "object";
        }

        newProp.name = InName;
        newProp.data = DataWrapper.Build(isType, Ctype, InValue);

        // Listen for the event.
        if (InCallerObject) {
            newProp.changedEvents.push(InCallerObject);
        }

        return newProp;
    }

    // Examples 
    // 
    // {
    //    "name" : "Materials",
    //        "access" : "",
    //            "description" : "",
    //                "data" : {
    //        "type" : "DynamicArray",
    //            "value" : {
    //            "type" : "ObjectReference",
    //                "metaInfo" : "OMaterial",
    //                    "value" : ["Mesh.Materias.Basic", "Mesh.Materias.Basic2"]
    //        }
    //    }
    //},
    //{
    //    "name" : "bCollidable",
    //        "access" : "",
    //            "description" : "",
    //                "data" : {
    //        "type" : "bool",
    //            "value" : "true"
    //    }
    //},
    //{
    //    "name" : "enumTest",
    //        "access" : "",
    //            "description" : "",
    //                "data" : {
    //        "type" : "enum",
    //            "metaInfo" : "ETestEnum",
    //                "value" : "small"
    //    }
    //}

    static BuildFromPoD(InProperty) {        

        try {
            console.log("BuildFromPoD: " + JSON.stringify(InProperty, null, 2));
        } catch (error) {
        }

        let newProp = new PropertyWithMeta();

        //newProp.type = EnumPropertyTypes.GetValue(InProperty.data.type);
        newProp.name = InProperty.name;
        newProp.data = DataWrapper.Build(InProperty.data.type,
            InProperty.data.metaInfo,
            InProperty.data.value);
                
        return newProp;
    }

    valueGetter() {
        return this.data.value;
    }

    valueSetter(InValue) {

        this.data.valueSet(InValue);

        for (const curItem of this.changedEvents) {
            if (curItem.onPropertyChanged) {
                curItem.onPropertyChanged(this.name, this.data.value);
            }
        }
    }

    toJSON() {
        let oValue = this.data.value;
        if (typeof this.data.value === "object") {
            oValue = this.data.value.toJSON();
        }
        return {
            name: this.name,
            data: oValue,
        };
    }

    fromJSON(inObj) {
        if (inObj.name === this.name) {
            this.data.fromJSON(inObj);
        }
    }
}