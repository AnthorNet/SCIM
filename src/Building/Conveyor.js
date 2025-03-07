import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Polygon                       from '../BaseLayout/Polygon.js';

import Building                                 from '../Building.js';

import Building_HyperTube                       from '../Building/HyperTube.js';
import Building_Pipeline                        from '../Building/Pipeline.js';

import SubSystem_ConveyorChainActor             from '../SubSystem/ConveyorChainActor.js';

export default class Building_Conveyor extends Building
{
    static clipboard = {entry: null, exit: null};

    static get availableConnections(){ return ['.ConveyorAny0', '.ConveyorAny1', '.Input0', '.Input1', '.Input2', '.Input3', '.InPut3', '.Input4', '.Input5', '.Input6', '.Output0', '.Output1', '.Output2', '.Output3']; }

    /*
     * ADD
     */
    static add(baseLayout, currentObject)
    {
        let mapLayer     = 'playerUnknownLayer';
        let buildingData = baseLayout.getBuildingDataFromClassName(currentObject.className);
            if(buildingData !== null)
            {
                mapLayer = buildingData.mapLayer;
            }

        baseLayout.setupSubLayer(mapLayer);
        let splineData  = BaseLayout_Math.extractSplineData(baseLayout, currentObject);
        let beltOptions = {
                pathName    : currentObject.pathName,
                weight      : 135,
                opacity     : 0.9
            };
            if(buildingData !== null)
            {
                beltOptions.color = buildingData.mapColor;
            }

        // Pipeline indicator...
        let mFlowIndicator = baseLayout.getObjectProperty(currentObject, 'mFlowIndicator');
            if(mFlowIndicator !== null)
            {
                let flowIndicatorObject = baseLayout.saveGameParser.getTargetObject(mFlowIndicator.pathName);
                    if(flowIndicatorObject !== null)
                    {
                        let fluidColor  = beltOptions.color;
                        let fluidType   = Building_Pipeline.getFluidItem(baseLayout, currentObject);
                            if(fluidType !== null && fluidType.color !== undefined)
                            {
                                fluidColor = fluidType.color;
                            }

                        beltOptions.extraPattern = L.polygon(BaseLayout_Polygon.generateForms(
                            baseLayout,
                            flowIndicatorObject.transform,
                            mFlowIndicator.pathName,
                            {
                                width: 220,
                                length: 140,
                                offset: 0,
                                xShift: 0,
                                yShift: 0
                            }),
                            {
                                originPathName  : currentObject.pathName,
                                fillColor       : fluidColor,
                                fillOpacity     : 1,
                                color           : '#999999',
                                interactive     : false
                            }
                        );
                    }
            }

        let belt = L.conveyor(splineData.points, beltOptions);
            if(Building_Conveyor.isConveyorBelt(currentObject) === false) // Conveyor are handled with the tooltips bind
            {
                belt.on('mouseover', function(marker){
                    let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.sourceTarget.options.pathName);
                    let slotColor           = baseLayout.buildableSubSystem.getObjectPrimaryColor(currentObject);

                    marker.sourceTarget.setStyle({color: 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')'});
                });
                belt.on('mouseout', function(marker){
                    let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.sourceTarget.options.pathName);
                        if(currentObject !== null)
                        {
                            let buildingData = baseLayout.getBuildingDataFromClassName(currentObject.className);
                                if(buildingData !== null)
                                {
                                    marker.sourceTarget.setStyle({color: buildingData.mapColor});
                                }
                        }
                });
            }

        baseLayout.bindMouseEvents(belt);

        if(baseLayout.playerLayers[mapLayer].distance !== undefined)
        {
            baseLayout.playerLayers[mapLayer].distance += splineData.distance;
        }

        baseLayout.playerLayers[mapLayer].elements.push(belt);

        if(baseLayout.playerLayers[mapLayer].filtersCount !== undefined)
        {
            if(baseLayout.playerLayers[mapLayer].filtersCount[currentObject.className] === undefined)
            {
                baseLayout.playerLayers[mapLayer].filtersCount[currentObject.className] = {distance: 0};
            }
            baseLayout.playerLayers[mapLayer].filtersCount[currentObject.className].distance += splineData.distance;
        }

        // RADIOACTIVITY
        if(baseLayout.useRadioactivity)
        {
            let radioactiveInventory    = [];
            let mConveyorChainActor     = baseLayout.getObjectProperty(currentObject, 'mConveyorChainActor');
                if(mConveyorChainActor !== null)
                {
                    let conveyorChainActorSubsystem = new SubSystem_ConveyorChainActor({baseLayout: baseLayout, pathName: mConveyorChainActor.pathName});
                    let beltItems                   = conveyorChainActorSubsystem.getBeltItems(currentObject.pathName);
                        for(let i = 0; i < beltItems.length; i++)
                        {
                            let currentItemData = baseLayout.getItemDataFromClassName(beltItems[i].itemName.pathName);
                                if(currentItemData !== null)
                                {
                                    if(currentItemData.radioactiveDecay !== undefined)
                                    {
                                        radioactiveInventory.push({position: beltItems[i].position, radioactiveDecay: currentItemData.radioactiveDecay});
                                    }
                                }
                        }
                }
                else
                {
                    if(currentObject.extra !== undefined && currentObject.extra.items.length > 0)
                    {
                        for(let i = 0; i < currentObject.extra.items.length; i++)
                        {
                            let currentItemData = baseLayout.getItemDataFromClassName(currentObject.extra.items[i].itemName.pathName, false);
                                if(currentItemData !== null)
                                {
                                    if(currentItemData.radioactiveDecay !== undefined)
                                    {
                                        radioactiveInventory.push({position: currentObject.extra.items[i].position, radioactiveDecay: currentItemData.radioactiveDecay});
                                    }
                                }
                        }
                    }
                }

            if(radioactiveInventory.length > 0)
            {
                for(let i = 0; i < radioactiveInventory.length; i++)
                {
                    let currentObjectPosition   = radioactiveInventory[i].position;
                    let currentBeltDistance     = 0;

                    // Loop each belt segments trying to figure if the item is in
                    for(let s = 1; s < splineData.originalData.length; s++)
                    {
                        let segmentDistance = BaseLayout_Math.getDistance(splineData.originalData[s], splineData.originalData[s-1]);
                            if(currentObjectPosition >= currentBeltDistance && currentObjectPosition <= (currentBeltDistance + segmentDistance))
                            {
                                baseLayout.addRadioactivityDot({
                                    pathName    : currentObject.pathName + '_' + i,
                                    transform   : {
                                        translation : [
                                            currentObject.transform.translation[0] + (splineData.originalData[s-1].x + (splineData.originalData[s].x - splineData.originalData[s-1].x) * ((currentObjectPosition - currentBeltDistance) / segmentDistance)),
                                            currentObject.transform.translation[1] + (splineData.originalData[s-1].y + (splineData.originalData[s].y - splineData.originalData[s-1].y) * ((currentObjectPosition - currentBeltDistance) / segmentDistance)),
                                            currentObject.transform.translation[2]
                                        ]
                                    }
                                }, [{qty: 1, radioactiveDecay: radioactiveInventory[i].radioactiveDecay}]);

                                break;
                            }

                        currentBeltDistance += segmentDistance;
                    }
                }
            }
        }

        return {layer: mapLayer, marker: belt};
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        if(Building_Conveyor.isConveyorBelt(currentObject))
        {
            let conveyorAny0 = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.ConveyorAny0');
                if(conveyorAny0 !== null)
                {
                    let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny0, 'mConnectedComponent');
                        if(mConnectedComponent === null)
                        {
                            contextMenu.push({
                                icon        : 'fa-portal-exit',
                                text        : 'Use input as teleporter exit',
                                callback    : Building_Conveyor.storeTeleporterExit,
                                className   : 'Building_Conveyor_storeTeleporterExit'
                            });
                        }
                }

            let conveyorAny1 = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.ConveyorAny1');
                if(conveyorAny1 !== null)
                {
                    let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny1, 'mConnectedComponent');
                        if(mConnectedComponent === null)
                        {
                            contextMenu.push({
                                icon        : 'fa-portal-enter',
                                text        : 'Use output as teleporter entry',
                                callback    : Building_Conveyor.storeTeleporterEntry,
                                className   : 'Building_Conveyor_storeTeleporterEntry'
                            });
                        }
                }
        }

        let usePool = Building_Conveyor.availableConveyorBelts;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorLift') === true)
            {
                usePool = Building_Conveyor.availableConveyorLifts;
            }

        let poolIndex   = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && (poolIndex > 0 || poolIndex < (usePool.length - 1)))
            {
                if(poolIndex > 0)
                {
                    let downgradeData = baseLayout.getBuildingDataFromClassName(usePool[poolIndex - 1]);
                        if(downgradeData !== null)
                        {
                            contextMenu.push({
                                icon        : 'fa-level-down-alt',
                                text        : 'Downgrade to "' + downgradeData.name + '"',
                                callback    : Building_Conveyor.downgradeConveyor,
                                className   : 'Building_Conveyor_downgradeConveyor'
                            });
                        }
                }
                if(poolIndex < (usePool.length - 1))
                {
                    let upgradeData = baseLayout.getBuildingDataFromClassName(usePool[poolIndex + 1]);
                        if(upgradeData !== null)
                        {
                            contextMenu.push({
                                icon        : 'fa-level-up-alt',
                                text        : 'Upgrade to "' + upgradeData.name + '"',
                                callback    : Building_Conveyor.upgradeConveyor,
                                className   : 'Building_Conveyor_upgradeConveyor'
                            });
                        }
                }
            }

            contextMenu.push({
                icon        : 'fa-box-open',
                text        : baseLayout.translate._('Clear inventory'),
                callback    : Building_Conveyor.clearInventory,
                className   : 'Building_Conveyor_clearInventory'
            });

            contextMenu.push('-');

        return contextMenu;
    }

    /**
     * TELEPORT
     */
    static storeTeleporterEntry(marker)
    {
        let baseLayout      = marker.baseLayout;
        let conveyorAny1    = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + '.ConveyorAny1');
            if(conveyorAny1 !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny1, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        Building_Conveyor.clipboard.entry = marker.relatedTarget.options.pathName + '.ConveyorAny1';
                    }
            }

        if(Building_Conveyor.clipboard.entry !== null && Building_Conveyor.clipboard.exit !== null)
        {
            Building_Conveyor.validateTeleporter(baseLayout);
        }
    }

    static storeTeleporterExit(marker)
    {
        let baseLayout      = marker.baseLayout;
        let conveyorAny0    = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + '.ConveyorAny0');
            if(conveyorAny0 !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny0, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        Building_Conveyor.clipboard.exit = marker.relatedTarget.options.pathName + '.ConveyorAny0';
                    }
            }

        if(Building_Conveyor.clipboard.entry !== null && Building_Conveyor.clipboard.exit !== null)
        {
            Building_Conveyor.validateTeleporter(baseLayout);
        }
    }

    static validateTeleporter(baseLayout)
    {
        let conveyorAny0    = baseLayout.saveGameParser.getTargetObject(Building_Conveyor.clipboard.exit);
            if(conveyorAny0 !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny0, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        baseLayout.setObjectProperty(conveyorAny0, 'mConnectedComponent', {pathName: Building_Conveyor.clipboard.entry}, 'Object');
                    }
            }

        let conveyorAny1    = baseLayout.saveGameParser.getTargetObject(Building_Conveyor.clipboard.entry);
            if(conveyorAny1 !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny1, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        baseLayout.setObjectProperty(conveyorAny1, 'mConnectedComponent', {pathName: Building_Conveyor.clipboard.exit}, 'Object');
                    }
            }

        BaseLayout_Modal.notification({
            message: 'Conveyor belts teleporter added!'
        });

        Building_Conveyor.clipboard.entry   = null;
        Building_Conveyor.clipboard.exit    = null;
    }

    /**
     * DOWNGRADE/UPGRADE
     */
    static downgradeConveyor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let usePool         = Building_Conveyor.availableConveyorBelts;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorLift') === true)
            {
                usePool = Building_Conveyor.availableConveyorLifts;
            }

        let poolIndex       = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && poolIndex > 0)
            {
                currentObject.className = usePool[poolIndex - 1];
                baseLayout.updateBuiltWithRecipe(currentObject);
            }
    }

    static upgradeConveyor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let usePool         = Building_Conveyor.availableConveyorBelts;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorLift') === true)
            {
                usePool = Building_Conveyor.availableConveyorLifts;
            }

        let poolIndex       = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && poolIndex < (usePool.length - 1))
            {
                currentObject.className = usePool[poolIndex + 1];
                baseLayout.updateBuiltWithRecipe(currentObject);
            }
    }

    /**
     * CLEAR
     */
    static clearInventory(marker, updateRadioactivityLayer = true)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        // RADIOACTIVITY
        Building_Conveyor.refreshRadioactivity(baseLayout, currentObject);
        baseLayout.radioactivityLayerNeedsUpdate = true;

        let mConveyorChainActor = baseLayout.getObjectProperty(currentObject, 'mConveyorChainActor');
            if(mConveyorChainActor !== null)
            {
                let conveyorChainActorSubsystem = new SubSystem_ConveyorChainActor({baseLayout: baseLayout, pathName: mConveyorChainActor.pathName});
                    conveyorChainActorSubsystem.killMe();
            }

        currentObject.extra.items = [];

        if(updateRadioactivityLayer === true)
        {
            baseLayout.updateRadioactivityLayer();
        }
    }

    static refreshRadioactivity(baseLayout, currentObject)
    {
        if(baseLayout.useRadioactivity)
        {
            let mConveyorChainActor = baseLayout.getObjectProperty(currentObject, 'mConveyorChainActor');
                if(mConveyorChainActor !== null)
                {
                    let conveyorChainActorSubsystem = new SubSystem_ConveyorChainActor({baseLayout: baseLayout, pathName: mConveyorChainActor.pathName});
                    let beltItems                   = conveyorChainActorSubsystem.getBeltItems(currentObject.pathName);
                        for(let i = 0; i < beltItems.length; i++)
                        {
                            let currentItemData = baseLayout.getItemDataFromClassName(beltItems[i].itemName.pathName);
                                if(currentItemData !== null)
                                {
                                    if(currentItemData.radioactiveDecay !== undefined)
                                    {
                                        delete baseLayout.playerLayers.playerRadioactivityLayer.elements[currentObject.pathName + '_' + i];
                                    }
                                }
                        }
                }
                else
                {
                    if(currentObject.extra !== undefined && currentObject.extra.items.length > 0)
                    {
                        for(let i = 0; i < currentObject.extra.items.length; i++)
                        {
                            let currentItemData = baseLayout.getItemDataFromClassName(currentObject.extra.items[i].itemName.pathName);
                                if(currentItemData !== null)
                                {
                                    if(currentItemData.radioactiveDecay !== undefined)
                                    {
                                        delete baseLayout.playerLayers.playerRadioactivityLayer.elements[currentObject.pathName + '_' + i];
                                    }
                                }
                        }
                    }
                }
        }
    }



    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, tooltip, currentObject)
    {
        let beltInventory       = [];
        let mConveyorChainActor = baseLayout.getObjectProperty(currentObject, 'mConveyorChainActor');
            if(mConveyorChainActor !== null)
            {
                let conveyorChainActorSubsystem = new SubSystem_ConveyorChainActor({baseLayout: baseLayout, pathName: mConveyorChainActor.pathName});
                    beltInventory               = conveyorChainActorSubsystem.getBeltInventory(currentObject.pathName);
            }
            else
            {
                // UPDATE 8
                if(currentObject.extra !== undefined && currentObject.extra.items.length > 0)
                {
                    for(let i = 0; i < currentObject.extra.items.length; i++)
                    {
                        let currentItemData = baseLayout.getItemDataFromClassName(currentObject.extra.items[i].itemName.pathName);
                            if(currentItemData !== null)
                            {
                                beltInventory.push({
                                    className   : currentItemData.className,
                                    name        : currentItemData.name,
                                    image       : currentItemData.image,
                                    qty         : 1
                                });
                            }
                    }
                }
            }

        let beltData        = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let distance        = '';

        // Belt
        let splineData      = BaseLayout_Math.extractSplineData(baseLayout, currentObject);
            if(splineData !== null)
            {
                distance = ' (' + new Intl.NumberFormat(baseLayout.language).format(Math.round(splineData.distance * 10) / 10) + 'm)';
            }

        // Conveyor lift
        let mTopTransform = baseLayout.getObjectProperty(currentObject, 'mTopTransform');
            if(mTopTransform !== null)
            {
                for(let i = 0; i < mTopTransform.values.length; i++)
                {
                    if(mTopTransform.values[i].name === 'Translation')
                    {
                        let height      = Math.abs(mTopTransform.values[i].value.values.z) / 100;
                            distance    = ' (' + new Intl.NumberFormat(baseLayout.language).format(Math.round(height * 10) / 10) + 'm)';
                    }
                }
            }

        let content         = [];

            // HEADER
            if(beltData !== null)
            {
                content.push('<div><strong>' + beltData.name + distance + '</strong></div>');
            }
            else
            {
                content.push('<div><strong>' + currentObject.className + distance + '</strong></div>');
            }

            // INVENTORY
            content.push('<div style="' + tooltip.genericStorageBackgroundStyle + '" class="mt-3">');
                content.push('<div style="margin: 0 auto;width: 400px;">');
                    if(beltInventory.length > 0)
                    {
                        content.push(baseLayout.setInventoryTableSlot(beltInventory));
                    }
                content.push('</div>');
            content.push('</div>');

        return '<div class="d-flex" style="' + tooltip.genericTooltipBackgroundStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }

    static bindTooltip(baseLayout, currentObject, tooltipOptions)
    {
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let mapLayer        = 'playerUnknownLayer';
            if(buildingData !== null)
            {
                mapLayer = buildingData.mapLayer;
            }

        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, mapLayer);
            if(marker !== null)
            {
                let slotColor = baseLayout.buildableSubSystem.getObjectPrimaryColor(currentObject);
                    marker.setStyle({color: 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')'});

                    if(typeof marker.setDashArray === 'function')
                    {
                        marker.setDashArray(baseLayout);
                    }
            }

        Building_Conveyor.bindConnectedComponents(baseLayout, currentObject);
    }

    static bindConnectedComponents(baseLayout, currentObject)
    {
        if(currentObject.children === undefined)
        {
            return;
        }

        // Loop conveyor children to find ConveyorAny connections
        for(let i = 0; i < currentObject.children.length; i++)
        {
            let conveyorAny = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                if(conveyorAny !== null)
                {
                    let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny, 'mConnectedComponent');
                        if(mConnectedComponent !== null)
                        {
                            let endsWith = '.' + mConnectedComponent.pathName.split('.').pop();
                                if(Building_Conveyor.availableConnections.includes(endsWith) || Building_HyperTube.availableConnections.includes(endsWith))
                                {
                                    let connectedComponent  = baseLayout.saveGameParser.getTargetObject(mConnectedComponent.pathName.replace(endsWith, ''));
                                        if(connectedComponent !== null)
                                        {
                                            let buildingData    = baseLayout.getBuildingDataFromClassName(connectedComponent.className);
                                            let mapLayer        = 'playerUnknownLayer';
                                                if(buildingData !== null)
                                                {
                                                    mapLayer = buildingData.mapLayer;
                                                }

                                            let connectedMarker     = baseLayout.getMarkerFromPathName(connectedComponent.pathName, mapLayer);
                                                if(connectedMarker !== null)
                                                {
                                                    connectedMarker.setStyle({color: '#00FF00'});

                                                    if(typeof connectedMarker.setDashArray === 'function')
                                                    {
                                                        connectedMarker.setDashArray(baseLayout);
                                                    }
                                                }
                                        }
                                }
                        }
                }
        }
    }
    static unbindTooltip(baseLayout, currentObject)
    {
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let mapLayer        = 'playerUnknownLayer';
            if(buildingData !== null)
            {
                mapLayer = buildingData.mapLayer;
            }

        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, mapLayer);
            if(marker !== null)
            {
                if(buildingData !== null)
                {
                    marker.setStyle({color: buildingData.mapColor});
                }

                if(typeof marker.removeDashArray === 'function')
                {
                    marker.removeDashArray();
                }
            }

        Building_Conveyor.unbindConnectedComponents(baseLayout, currentObject);
    }

    static unbindConnectedComponents(baseLayout, currentObject)
    {
        if(currentObject.children === undefined)
        {
            return;
        }

        // Loop conveyor children to find ConveyorAny connections
        for(let i = 0; i < currentObject.children.length; i++)
        {
            let conveyorAny = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                if(conveyorAny !== null)
                {
                    let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny, 'mConnectedComponent');
                        if(mConnectedComponent !== null)
                        {
                            let endsWith = '.' + mConnectedComponent.pathName.split('.').pop();
                                if(Building_Conveyor.availableConnections.includes(endsWith) || Building_HyperTube.availableConnections.includes(endsWith))
                                {
                                    let connectedComponent  = baseLayout.saveGameParser.getTargetObject(mConnectedComponent.pathName.replace(endsWith, ''));
                                        if(connectedComponent !== null)
                                        {
                                            let buildingData    = baseLayout.getBuildingDataFromClassName(connectedComponent.className);
                                            let mapLayer        = 'playerUnknownLayer';
                                                if(buildingData !== null)
                                                {
                                                    mapLayer = buildingData.mapLayer;
                                                }

                                            let connectedMarker     = baseLayout.getMarkerFromPathName(connectedComponent.pathName, mapLayer);
                                                if(connectedMarker !== null)
                                                {
                                                    if(buildingData !== null)
                                                    {
                                                        connectedMarker.setStyle({color: buildingData.mapColor});
                                                    }

                                                    if(typeof connectedMarker.removeDashArray === 'function')
                                                    {
                                                        connectedMarker.removeDashArray();
                                                    }
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
    L.Conveyor = L.Polyline.extend({
        initialize: function(latlngs, options)
        {
            L.Polyline.prototype.initialize.call(this, latlngs, options);

            this.weight = options.weight;

            let self                = this;
                this.updateCallback = function()
                {
                    self._updateWeight(this);
                };
        },

        onAdd: function(map)
        {
            L.Polyline.prototype.onAdd.call(this, map);
            map.on('zoomend', this.updateCallback);
            this._updateWeight(map);
        },

        onRemove: function(map)
        {
            map.off('zoomend', this.updateCallback);
            L.Polyline.prototype.onRemove.call(this, map);
        },

        setDashArray(baseLayout)
        {
            // Check conveyor direction
            let flowDirection   = 1;
            let conveyorAny0    = baseLayout.saveGameParser.getTargetObject(this.options.pathName + '.ConveyorAny0'); //TODO: Dynamic?!
                if(conveyorAny0 !== null)
                {
                    let mDirection = baseLayout.getObjectProperty(conveyorAny0, 'mDirection');
                        if(mDirection.value === 'EFactoryConnectionDirection::FCD_INPUT')
                        {
                            flowDirection = -1;
                        }
                }

            // Flow animation
            this.options.currentDashOffset  = 0;
            this.options.dashArrayAnimation = setInterval(() => {
                this.options.currentDashOffset++;
                this.setStyle({
                    dashOffset: flowDirection * this.options.currentDashOffset * (this.options.weight / 4)
                });
            }, 25);

            return this.setStyle({dashArray: (this.options.weight * 1.5) + " " + (this.options.weight  * 1.5)});
        },

        removeDashArray()
        {
            clearInterval(this.options.dashArrayAnimation);
            return this.setStyle({dashArray: null});
        },

        _updateWeight: function(map)
        {
            return this.setStyle({weight: this._getWeight(map, this.weight)});
        },

        _getWeight: function(map, weight)
        {
            let position    = [window.SCIM.map.unproject([0, 0]), window.SCIM.map.unproject([10000, 0])];
            let meterWeight = map.latLngToContainerPoint(position[1]).x - map.latLngToContainerPoint(position[0]).x;

            return Math.max(2, (weight / 10000 * meterWeight));
        }
    });

    L.conveyor = function(latlngs, options)
    {
        return new L.Conveyor(latlngs, options || { weight: 100 });
    };

    (function(){
        let _originalFillStroke = L.Canvas.prototype._fillStroke;
            L.Canvas.include({
                _fillStroke: function(ctx, layer)
                {
                    //TODO: Wait for https://github.com/Leaflet/Leaflet/pull/7867
                    ctx.lineDashOffset = Number(layer.options.dashOffset || 0);

                    return _originalFillStroke.call(this, ctx, layer);
                }
            });
    })();
}