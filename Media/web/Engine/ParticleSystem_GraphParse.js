let ResolverTable = {
    "Node_SetParticleAttribute": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {
            let particles = ResolverCastValue(InInstance, InNode.getInputLink(0));
            let particleSetValue = ResolverCastValue(InInstance, InNode.getInputLink(1));
            let particleValueType = InNode.base_properties[0].value;



            return nullptr;
        }
    },
    "Node_ParticleType": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {
            return InNode.base_properties[0].value;
        }
    },
    "Node_EmitEnd": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {

            var slotPosition = InNode.findInputSlot("position");
            var slotColor = InNode.findInputSlot("color");
            var slotSize = InNode.findInputSlot("size");
            var slotVelocity = InNode.findInputSlot("velocity");

            let resolvedPosition = ResolverCastValue(InInstance, InNode.getInputLink(slotPosition));
            let resolvedColor = ResolverCastValue(InInstance, InNode.getInputLink(slotColor));
            let resolvedSize = ResolverCastValue(InInstance, InNode.getInputLink(slotSize));
            let resolvedVelocity = ResolverCastValue(InInstance, InNode.getInputLink(slotVelocity));

            return {
                position: resolvedPosition,
                color: resolvedColor,
                size: resolvedSize,
                velocity: resolvedVelocity
            };
        }
    },
    "Node_EmitBegin": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {

            if (InOutputSlot === 0) {
                let resolvedType = ResolverCastValue(InInstance, InNode.getInputLink(0));
                let resolvedValue = ResolverCastValue(InInstance, InNode.getInputLink(1));

                if (!resolvedType || !resolvedValue) {
                    return null;
                }

                let curDataStore = InInstance.datastore[InNode.id];

                curDataStore.accum += resolvedValue;
                let newParticles = Math.floor(curDataStore.accum);

                if (newParticles > 0) {
                    var slotPosition = InNode.findInputSlot("position");
                    var slotColor = InNode.findInputSlot("color");
                    var slotSize = InNode.findInputSlot("size");
                    var slotVelocity = InNode.findInputSlot("velocity");
                    var slotLifetime = InNode.findInputSlot("lifetime");

                    curDataStore.accum -= newParticles;

                    for (var i = 0; i < newParticles; i++) {

                        let resolvedPosition = ResolverCastValue(InInstance, InNode.getInputLink(slotPosition));
                        let resolvedLifetime = ResolverCastValue(InInstance, InNode.getInputLink(slotLifetime));
                        let resolvedColor = ResolverCastValue(InInstance, InNode.getInputLink(slotColor));
                        let resolvedSize = ResolverCastValue(InInstance, InNode.getInputLink(slotSize));
                        let resolvedVelocity = ResolverCastValue(InInstance, InNode.getInputLink(slotVelocity));

                        InInstance.createParticle(
                            {
                                position: resolvedPosition,
                                color: resolvedColor,
                                size: resolvedSize,
                                velocity: resolvedVelocity,
                                lifetime: resolvedLifetime,
                            });

                    }
                }

                return InInstance.particles;
            }
            else if (InOutputSlot === 1) {
                return InInstance.particles[InInstance.activeParticleUpdate].position;
            }
            else if (InOutputSlot === 2) {
                return InInstance.particles[InInstance.activeParticleUpdate].color;
            }
            else if (InOutputSlot === 3) {
                return InInstance.particles[InInstance.activeParticleUpdate].size;
            }
            else if (InOutputSlot === 4) {
                return InInstance.particles[InInstance.activeParticleUpdate].velocity;
            }
            else if (InOutputSlot === 5) {
                return (InInstance.particles[InInstance.activeParticleUpdate].age / InInstance.particles[InInstance.activeParticleUpdate].lifetime);
            }

            throw new Error("unfounded output");
        }
    },
    "Node_DeltaTime": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {
            return SystemTiming.deltaTime;
        }
    },
    "MathAdd": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {
            return ResolverCastValue(InInstance, InNode.getInputLink(0)) +
                ResolverCastValue(InInstance, InNode.getInputLink(1));
        }
    },
    "MathMultiply": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {
            let ValueA = ResolverCastValue(InInstance, InNode.getInputLink(0));
            let ValueB = ResolverCastValue(InInstance, InNode.getInputLink(1));

            if (typeof ValueA === "number" && typeof ValueB === "number") {
                return ValueA * ValueB;
            } else if (typeof ValueA === "object" && typeof ValueB === "number") {
                return ValueA.clone().multiplyScalar(ValueB);
            } else {
                throw new Error("cant multiply?!");
            }

            return null;

        }
    },
    "Widget_ColorPicker": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {
            return new THREE.Vector4(InNode.base_properties[0].value,
                InNode.base_properties[1].value,
                InNode.base_properties[2].value,
                InNode.base_properties[3].value);
        }
    },
    "FloatNode": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {
            return InNode.properties.panel[0].value;
        }
    },

    "Node_FloatWidget": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {
            return InNode.base_properties[0].value;
        }
    },

    "Node_FloatToVector3": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {
            let floatValue = ResolverCastValue(InInstance, InNode.getInputLink(0));
            return new THREE.Vector3(floatValue, floatValue, floatValue);
        }
    },

    "Widget_RandomFloat": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {
            let min = InNode.base_properties[0].value;
            let max = InNode.base_properties[1].value;

            return (Math.random() * (max - min) + min);
        }
    },

    "Widget_Vector3": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {

            let xIn = InNode.getInputLink(0);
            let yIn = InNode.getInputLink(1);
            let zIn = InNode.getInputLink(2);

            let x = xIn ? ResolverCastValue(InInstance, xIn) : InNode.base_properties[0].value;
            let y = yIn ? ResolverCastValue(InInstance, yIn) : InNode.base_properties[1].value;
            let z = zIn ? ResolverCastValue(InInstance, zIn) : InNode.base_properties[2].value;

            return new THREE.Vector3(x, y, z);
        }
    },


    "Widget_Vector4": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {

            let xIn = InNode.getInputLink(0);
            let yIn = InNode.getInputLink(1);
            let zIn = InNode.getInputLink(2);
            let wIn = InNode.getInputLink(3);

            let x = xIn ? ResolverCastValue(InInstance, xIn) : InNode.base_properties[0].value;
            let y = yIn ? ResolverCastValue(InInstance, yIn) : InNode.base_properties[1].value;
            let z = zIn ? ResolverCastValue(InInstance, zIn) : InNode.base_properties[2].value;
            let w = wIn ? ResolverCastValue(InInstance, wIn) : InNode.base_properties[3].value;

            return new THREE.Vector4(x, y, z, w);
        }
    },

    "Widget_GraphPoints": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {

            let xIn = ResolverCastValue(InInstance, InNode.getInputLink(0));
            let yOut = InNode.sampleCurve(xIn);

            return yOut;
        }
    },

    "BreakVector4Node": {
        ResolveValue: function (InInstance, InNode, InOutputSlot) {

            let vecIn = ResolverCastValue(InInstance, InNode.getInputLink(0));

            if (vecIn) {
                let oArray = vecIn.toArray();
                return oArray[InOutputSlot];
            }

            return null;
        }
    }
}

function ResolverCastValue(InInstance, InLink) {

    if (!InLink) {
        return null;
    }

    var inputNode = ParticleLayerPanelInstance.lGraph.getNodeById(InLink.origin_id);
    return ResolverTable[inputNode.constructor.name].ResolveValue(InInstance, inputNode, InLink.origin_slot);
}