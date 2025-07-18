   let prevSerialize = LGraphNode.prototype.serialize
LGraphNode.prototype.serialize = function () {
    let o = prevSerialize.call(this);

    if (this.base_properties) {
        o.base_properties = [];
        for (const curProp of this.base_properties) {
            o.base_properties.push(curProp.toJSON());
        }
    }

    return o;
}

let prevConfigure = LGraphNode.prototype.configure
LGraphNode.prototype.configure = function (info) {

    //UGLY TODO
    if (this.base_properties) {
        this.base_properties_backup = this.base_properties;
        delete this.base_properties;
    }

    prevConfigure.call(this, info);

    if (this.base_properties_backup) {
        this.base_properties = this.base_properties_backup;
        delete this.base_properties_backup;
    }

    if (info.base_properties && this.base_properties.length == info.base_properties.length) {
        for (var i = 0; i < this.base_properties.length; i++) {
            this.base_properties[i].fromJSON(info.base_properties[i]);
        }
    }
}
