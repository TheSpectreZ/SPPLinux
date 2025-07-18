class EnumValue {
    constructor(InName, InParent) {
        this.name = InName;
        this.parent = InParent;
    }

    toJSON() {
        return {
            name: this.name,
            enum: this.parent.name
        }
    };

    fromJSON(inObj) {
        this.name = inObj.name;
    }
}

window.enumMap = {};

class Enum {
    static globalEnums = {};
    constructor(enumName, ...values) {

        //console.log("Registered Global Enum: " + enumName);

        this.name = enumName;
        this.values = [];

        let valuesString = [];

        for (const curValue of values) {
            let curEnum = new EnumValue(curValue, this);
            this.values.push(curEnum);
            valuesString.push(curValue);

            //console.log(" - " + curValue);

            this[curValue] = curEnum;
        }

        window.enumMap[enumName] = valuesString;

        Object.freeze(this)

        Enum.globalEnums[enumName] = this;
    }

    static GetEnum(InEnumName) {
        return Enum.globalEnums[InEnumName];
    }

    GetValue(InString) {
        for (const curValue of this.values) {
            if (curValue.name === InString) {
                return curValue;
            }
        }
        return null;
    }

    GetFirstEnum() {
        return this.values[0];
    }

    toJSON() {
        return this.name;
    };
}
