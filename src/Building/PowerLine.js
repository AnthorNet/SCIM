/* global Infinity */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import Building                                 from '../Building.js';

export default class Building_PowerLine extends Building
{
    static clipboard = {source: null, target: null};

    static get availableConnections()
    {
        return [
            '.PowerInput', '.PowerConnection', '.PowerConnection1', '.PowerConnection2',
            '.PowerTowerConnection',
            '.FGPowerConnection', '.FGPowerConnection1',
            '.SlidingShoe',
            '.UpstreamConnection', '.DownstreamConnection'
        ];
    }

    static getColor(baseLayout, currentObject, currentObjectSource = null, currentObjectTarget = null)
    {
        if(baseLayout.showCircuitsColors === true)
        {
            if(currentObjectSource === null)
            {
                currentObjectSource = baseLayout.saveGameParser.getTargetObject(currentObject.extra.source.pathName);
            }
            if(currentObjectSource === null && currentObjectTarget === null)
            {
                currentObjectSource = baseLayout.saveGameParser.getTargetObject(currentObject.extra.target.pathName);
            }
            if(currentObjectSource === null && currentObjectTarget !== null)
            {
                currentObjectSource = currentObjectTarget;
            }

            if(currentObjectSource !== null)
            {
                let powerLineCircuit = baseLayout.circuitSubSystem.getObjectCircuit(currentObjectSource);
                    if(powerLineCircuit !== null)
                    {
                        let circuitColor = baseLayout.circuitSubSystem.getCircuitColor(powerLineCircuit.circuitId);
                            return 'rgb(' + circuitColor[0] + ', ' + circuitColor[1] + ', ' + circuitColor[2] + ')';
                    }
            }
        }

        return ((currentObject.className === '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C') ? '#00ff00' : '#0000ff');
    }

    /*
     * ADD/DELETE
     */
    static add(baseLayout, currentObject)
    {
        baseLayout.setupSubLayer('playerPowerGridLayer');

        // Orphaned power lines (Most likely when mods are removed)
        if(currentObject.extra.source.pathName === '' || currentObject.extra.target.pathName === '')
        {
            console.log('Deleting orphaned power line...');
            Building_PowerLine.delete({baseLayout: baseLayout, options: {pathName: currentObject.pathName}});
            return null;
        }

        let currentObjectSource = baseLayout.saveGameParser.getTargetObject(currentObject.extra.source.pathName);
        let currentObjectTarget = baseLayout.saveGameParser.getTargetObject(currentObject.extra.target.pathName);

            if(currentObjectSource !== null && currentObjectTarget !== null)
            {
                let currentObjectSourceOuterPath    = baseLayout.saveGameParser.getTargetObject(currentObjectSource.outerPathName);
                let currentObjectTargetOuterPath    = baseLayout.saveGameParser.getTargetObject(currentObjectTarget.outerPathName);

                    if(currentObjectSourceOuterPath !== null && currentObjectSourceOuterPath.transform !== undefined && currentObjectTargetOuterPath !== null && currentObjectTargetOuterPath.transform !== undefined)
                    {
                        // Check if source and target have the proper wire connection?
                        Building_PowerLine.checkWirePowerConnection(baseLayout, currentObjectSource, currentObject);
                        Building_PowerLine.checkWirePowerConnection(baseLayout, currentObjectTarget, currentObject);

                        // Does source or target have a connection anchor?
                        let sourceTranslation = currentObjectSourceOuterPath.transform.translation;
                            if(baseLayout.detailedModels !== null && baseLayout.detailedModels[currentObjectSourceOuterPath.className] !== undefined && baseLayout.detailedModels[currentObjectSourceOuterPath.className].powerConnection !== undefined)
                            {
                                let currentModel        = baseLayout.detailedModels[currentObjectSourceOuterPath.className];
                                    sourceTranslation   = BaseLayout_Math.getPointRotation(
                                        [
                                            sourceTranslation[0] + (currentModel.powerConnection[0] * currentModel.scale) + ((currentModel.xOffset !== undefined) ? currentModel.xOffset : 0),
                                            sourceTranslation[1] + (currentModel.powerConnection[1] * currentModel.scale) + ((currentModel.yOffset !== undefined) ? currentModel.yOffset : 0)
                                        ],
                                        sourceTranslation,
                                        currentObjectSourceOuterPath.transform.rotation
                                    );
                                    sourceTranslation[2]    = currentObjectSourceOuterPath.transform.translation[2];
                            }
                        let targetTranslation = currentObjectTargetOuterPath.transform.translation;
                            if(baseLayout.detailedModels !== null && baseLayout.detailedModels[currentObjectTargetOuterPath.className] !== undefined && baseLayout.detailedModels[currentObjectTargetOuterPath.className].powerConnection !== undefined)
                            {
                                let currentModel        = baseLayout.detailedModels[currentObjectTargetOuterPath.className];
                                    targetTranslation   = BaseLayout_Math.getPointRotation(
                                        [
                                            targetTranslation[0] + (currentModel.powerConnection[0] * currentModel.scale) + ((currentModel.xOffset !== undefined) ? currentModel.xOffset : 0),
                                            targetTranslation[1] + (currentModel.powerConnection[1] * currentModel.scale) + ((currentModel.yOffset !== undefined) ? currentModel.yOffset : 0)
                                        ],
                                        targetTranslation,
                                        currentObjectTargetOuterPath.transform.rotation
                                    );
                                    targetTranslation[2]    = currentObjectTargetOuterPath.transform.translation[2];
                            }

                        // Add the power line!
                        let powerline       = L.powerLine([
                                baseLayout.satisfactoryMap.unproject(sourceTranslation),
                                baseLayout.satisfactoryMap.unproject(targetTranslation)
                            ], {
                                pathName    : currentObject.pathName,
                                color       : Building_PowerLine.getColor(baseLayout, currentObject, currentObjectSource, currentObjectTarget),
                                weight      : 2,
                                interactive : false
                            });

                        baseLayout.playerLayers.playerPowerGridLayer.elements.push(powerline);

                        //TODO: Is powerline distance using building anchor or center?
                        //let powerLineDistance = BaseLayout_Math.getDistance(currentObjectSourceOuterPath.transform.translation, currentObjectTargetOuterPath.transform.translation) / 100;
                        let powerLineDistance = BaseLayout_Math.getDistance(sourceTranslation, targetTranslation) / 100;
                            baseLayout.playerLayers.playerPowerGridLayer.distance += powerLineDistance;

                        if(baseLayout.playerLayers.playerPowerGridLayer.filtersCount !== undefined)
                        {
                            let powerLineClassName = '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C';
                                if(baseLayout.playerLayers.playerPowerGridLayer.filtersCount[powerLineClassName] === undefined)
                                {
                                    baseLayout.playerLayers.playerPowerGridLayer.filtersCount[powerLineClassName] = {distance: 0};
                                }
                                baseLayout.playerLayers.playerPowerGridLayer.filtersCount[powerLineClassName].distance += powerLineDistance;
                        }

                        return {layer: 'playerPowerGridLayer', marker: powerline};
                    }
            }

        return null;
    }

    static delete(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.options.pathName);
            if(currentObject !== null)
            {
                // Unlink source power connection
                let currentObjectSource = baseLayout.saveGameParser.getTargetObject(currentObject.extra.source.pathName);
                    if(currentObjectSource !== null)
                    {
                        Building_PowerLine.unlinkConnection(baseLayout, currentObjectSource, currentObject);
                    }

                // Unlink target power connection
                let currentObjectTarget = baseLayout.saveGameParser.getTargetObject(currentObject.extra.target.pathName);
                    if(currentObjectTarget !== null)
                    {
                        Building_PowerLine.unlinkConnection(baseLayout, currentObjectTarget, currentObject);
                    }

                if(currentObjectSource !== null && currentObjectTarget !== null)
                {
                    let currentObjectSourceOuterPath    = baseLayout.saveGameParser.getTargetObject(currentObjectSource.outerPathName);
                    let currentObjectTargetOuterPath    = baseLayout.saveGameParser.getTargetObject(currentObjectTarget.outerPathName);

                    if(currentObjectSourceOuterPath !== null && currentObjectTargetOuterPath !== null)
                    {
                        baseLayout.playerLayers.playerPowerGridLayer.distance -= BaseLayout_Math.getDistance(currentObjectSourceOuterPath.transform.translation, currentObjectTargetOuterPath.transform.translation) / 100;
                    }
                }

                // Clear blueprintProxy
                baseLayout.blueprintSubSystem.deleteFromProxy(currentObject);
            }

        // Delete
        baseLayout.saveGameParser.deleteObject(marker.options.pathName);
        baseLayout.deleteMarkerFromElements('playerPowerGridLayer', marker);
    }

    /*
     * DAISY CHAINS!!!
     */
    static storeNewWireSource(marker, powerConnectionType = '.PowerConnection')
    {
        let baseLayout      = marker.baseLayout;
        let powerConnection = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + powerConnectionType);
            if(powerConnection !== null)
            {
                Building_PowerLine.clipboard.source = marker.relatedTarget.options.pathName + powerConnectionType;
            }

        if(Building_PowerLine.clipboard.source !== null && Building_PowerLine.clipboard.target !== null)
        {
            Building_PowerLine.validateNewWire(baseLayout);
        }
    }

    static storeNewWireTarget(marker, powerConnectionType = '.PowerConnection')
    {
        let baseLayout      = marker.baseLayout;
        let powerConnection = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + powerConnectionType);
            if(powerConnection !== null)
            {
                Building_PowerLine.clipboard.target = marker.relatedTarget.options.pathName + powerConnectionType;
            }

        if(Building_PowerLine.clipboard.source !== null && Building_PowerLine.clipboard.target !== null)
        {
            Building_PowerLine.validateNewWire(baseLayout);
        }
    }

    static validateNewWire(baseLayout)
    {
        let powerConnectionSource = baseLayout.saveGameParser.getTargetObject(Building_PowerLine.clipboard.source);
        let powerConnectionTarget = baseLayout.saveGameParser.getTargetObject(Building_PowerLine.clipboard.target);
            if(powerConnectionSource !== null && powerConnectionTarget !== null)
            {
                let mWiresSource    = baseLayout.getObjectProperty(powerConnectionSource, 'mWires');
                    if(mWiresSource === null)
                    {
                        powerConnectionSource.properties.push({
                            name    : 'mWires',
                            type    : 'Array',
                            value   : {type: 'Object', values: []}
                        });

                        mWiresSource = baseLayout.getObjectProperty(powerConnectionSource, 'mWires');
                    }

                let mWiresTarget    = baseLayout.getObjectProperty(powerConnectionTarget, 'mWires');
                    if(mWiresTarget === null)
                    {
                        powerConnectionTarget.properties.push({
                            name    : 'mWires',
                            type    : 'Array',
                            value   : {type: 'Object', values: []}
                        });

                        mWiresTarget = baseLayout.getObjectProperty(powerConnectionTarget, 'mWires');
                    }

                let newWire = {
                    type            : 1,
                    className       : '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C',
                    pathName        : baseLayout.generateFastPathName({pathName: 'Persistent_Level:PersistentLevel.Build_PowerLine_C_XXX'}),
                    needTransform   : 1,
                    transform       : {
                        rotation        : [0, 0, 0, 1],
                        translation     : [0, 0, 0]
                    },
                    entity          : {pathName: 'Persistent_Level:PersistentLevel.BuildableSubsystem'},
                    properties      : [],
                    extra           : {
                        count           : 0,
                        source          : {pathName: Building_PowerLine.clipboard.source},
                        target          : {pathName: Building_PowerLine.clipboard.target}
                    }
                };

                mWiresSource.values.push({pathName: newWire.pathName});
                mWiresTarget.values.push({pathName: newWire.pathName});

                baseLayout.saveGameParser.addObject(newWire);
                new Promise((resolve) => {
                    baseLayout.parseObject(newWire, resolve);
                }).then((result) => {
                    baseLayout.addElementToLayer(result.layer, result.marker);

                    BaseLayout_Modal.notification({
                        message: 'New wire added!'
                    });
                });
            }

        Building_PowerLine.clipboard.source = null;
        Building_PowerLine.clipboard.target = null;
    }

    /*
     * UTILITIES
     */
    static checkWirePowerConnection(baseLayout, currentObject, currentWireObject)
    {
        let mWires = baseLayout.getObjectProperty(currentObject, 'mWires');

            // Create the missing property...
            if(mWires === null)
            {
                currentObject.properties.push({
                    name    : 'mWires',
                    type    : 'Array',
                    value   : {
                        type    : 'Object',
                        values  : [{
                            levelName   : ((currentWireObject.levelName !== undefined) ? currentWireObject.levelName : 'Persistent_Level'),
                            pathName    : currentWireObject.pathName
                        }]
                    }
                });

                return;
            }

            // Check if wire is properly connected...
            for(let i = 0; i < mWires.values.length; i++)
            {
                if(mWires.values[i].pathName === currentWireObject.pathName)
                {
                    return;
                }
            }

            // Wasn't found, add it!
            mWires.values.push({
                levelName   : ((currentWireObject.levelName !== undefined) ? currentWireObject.levelName : 'Persistent_Level'),
                pathName    : currentWireObject.pathName
            });
    }

    static deleteWiresFromPowerConnection(baseLayout, currentObjectPowerConnection)
    {
        let currentObjectWires = baseLayout.getObjectProperty(currentObjectPowerConnection, 'mWires');
            if(currentObjectWires !== null)
            {
                let wires = [];
                    for(let i = 0; i < currentObjectWires.values.length; i++)
                    {
                        let wireMarker = baseLayout.getMarkerFromPathName(currentObjectWires.values[i].pathName, 'playerPowerGridLayer');
                            if(wireMarker === null) // Most likely a mod so try a larger search...
                            {
                                wireMarker = baseLayout.getMarkerFromPathName(currentObjectWires.values[i].pathName);
                            }


                        if(wireMarker !== null)
                        {
                            wireMarker.baseLayout   = baseLayout;
                            wires.push(wireMarker);
                        }
                    }

                if(wires.length > 0)
                {
                    for(let i = 0; i < wires.length; i++)
                    {
                        Building_PowerLine.delete(wires[i]);
                    }
                }
            }
    }

    static redrawWiresFromPowerConnection(baseLayout, currentObjectPowerConnection, fastDelete)
    {
        let mWires = baseLayout.getObjectProperty(currentObjectPowerConnection, 'mWires');
            if(mWires !== null)
            {
                for(let i = 0; i < mWires.values.length; i++)
                {
                    let currentWire = baseLayout.saveGameParser.getTargetObject(mWires.values[i].pathName);
                        new Promise((resolve) => {
                            baseLayout.parseObject(currentWire, resolve);
                        }).then((result) => {
                            let oldMarker = baseLayout.getMarkerFromPathName(currentWire.pathName, result.layer);
                                baseLayout.deleteMarkerFromElements(result.layer, oldMarker, fastDelete);
                                baseLayout.addElementToLayer(result.layer, result.marker);
                        });
                }
            }
    }

    static unlinkConnection(baseLayout, currentObjectPowerConnection, targetObject)
    {
        let mWires = baseLayout.getObjectProperty(currentObjectPowerConnection, 'mWires');
            if(mWires !== null)
            {
                for(let j = 0; j < mWires.values.length; j++)
                {
                    if(mWires.values[j].pathName === targetObject.pathName)
                    {
                        mWires.values.splice(j, 1);
                        break;
                    }
                }

                // Empty properties...
                if(mWires.values.length <= 0)
                {
                    currentObjectPowerConnection.properties = currentObjectPowerConnection.properties.filter(property => property.name !== 'mWires');

                    let mHiddenConnections  = baseLayout.getObjectProperty(currentObjectPowerConnection, 'mHiddenConnections');
                        if(mHiddenConnections === null) // Train station have "mHiddenConnections" property so we need to keep "mCircuitID"
                        {
                            currentObjectPowerConnection.properties = [];
                        }
                }
            }
    }

    /**
     * TOOLTIP
     */
    static bindConnectedComponents(baseLayout, currentObject)
    {
        if(currentObject.children === undefined)
        {
            return;
        }

        // Loop children to find power connections
        for(let i = 0; i < currentObject.children.length; i++)
        {
            let currentChildren = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                if(currentChildren !== null)
                {
                    let mWires = baseLayout.getObjectProperty(currentChildren, 'mWires');
                        if(mWires !== null)
                        {
                            for(let i = 0; i < mWires.values.length; i++)
                            {
                                let currentWire = baseLayout.saveGameParser.getTargetObject(mWires.values[i].pathName);
                                    if(currentWire !== null)
                                    {
                                        let connectedMarker     = baseLayout.getMarkerFromPathName(currentWire.pathName, 'playerPowerGridLayer');
                                            if(connectedMarker !== null)
                                            {
                                                connectedMarker.setStyle({color: '#FF0000'});
                                                connectedMarker.setDashArray(baseLayout);
                                            }
                                    }
                            }
                        }
                }
        }
    }

    static unbindConnectedComponents(baseLayout, currentObject)
    {
        if(currentObject.children === undefined)
        {
            return;
        }

        // Loop children to find power connections
        for(let i = 0; i < currentObject.children.length; i++)
        {
            let currentChildren = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                if(currentChildren !== null)
                {
                    let mWires = baseLayout.getObjectProperty(currentChildren, 'mWires');
                        if(mWires !== null)
                        {
                            for(let i = 0; i < mWires.values.length; i++)
                            {
                                let currentWire = baseLayout.saveGameParser.getTargetObject(mWires.values[i].pathName);
                                    if(currentWire !== null)
                                    {
                                        let connectedMarker     = baseLayout.getMarkerFromPathName(currentWire.pathName, 'playerPowerGridLayer');
                                            if(connectedMarker !== null)
                                            {
                                                connectedMarker.setStyle({color: Building_PowerLine.getColor(baseLayout, currentWire)});
                                                connectedMarker.removeDashArray();
                                            }
                                    }
                            }
                        }
                }
        }
    }
}

if('undefined' !== typeof L) // Avoid worker error
{
    L.PowerLine = L.Polyline.extend({
        setDashArray(baseLayout)
        {
            let currentObject   = baseLayout.saveGameParser.getTargetObject(this.options.pathName);

            // Check powerline direction
            let flowDirection   = 1;

            if(currentObject.extra !== undefined)
            {
                let target          = currentObject.extra.target.pathName.split('.');
                    target.pop();
                let targetObject    = baseLayout.saveGameParser.getTargetObject(target.join('.'));


                if(targetObject !== null)
                {
                    let targetBuildingData = baseLayout.getBuildingDataFromClassName(targetObject.className);
                        if(targetBuildingData !== null && targetBuildingData.category !== 'generator' && targetBuildingData.category !== 'powerPole')
                        {
                            flowDirection = -1;
                        }
                }
            }

            // Flow animation
            this.options.currentDashOffset  = 0;
            this.options.dashArrayAnimation = setInterval(() => {
                this.options.currentDashOffset++;
                this.setStyle({
                    dashOffset: flowDirection * this.options.currentDashOffset * (this.options.weight)
                });
            }, 25);

            return this.setStyle({dashArray: (this.options.weight * 10) + " " + (this.options.weight  * 10)});
        },

        removeDashArray()
        {
            clearInterval(this.options.dashArrayAnimation);
            return this.setStyle({dashArray: null});
        }
    });

    L.powerLine = function(latlngs, options)
    {
        return new L.PowerLine(latlngs, options);
    };
}