/* global parseFloat */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_RadarTower
{
    static getCoverageRadius()
    {
        return 1000 * 100;
    }

    static getCollectablesInCoverageRadius(baseLayout, currentObject)
    {
        let playerCollectables      = baseLayout.satisfactoryMap.collectableMarkers;
        let collectablesInRadius    = {};
        let currentRadius           = Building_RadarTower.getCoverageRadius();

            for(let pathName in playerCollectables)
            {
                let currentCollectableMarker    = playerCollectables[pathName];
                    if(['smallRocks', 'largeRocks', 'sporeFlowers', 'pillars'].includes(currentCollectableMarker.options.type) === false)
                    {

                        let collectableObject           = baseLayout.saveGameParser.getTargetObject(pathName);
                            if(collectableObject !== null)
                            {
                                let currentDistance = BaseLayout_Math.getDistance(currentObject.transform.translation, collectableObject.transform.translation);
                                    if(currentDistance < currentRadius)
                                    {
                                        switch(collectableObject.className)
                                        {
                                            case '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C':
                                                if(currentCollectableMarker.options.extractorPathName === undefined)
                                                {
                                                    let className = collectableObject.className + '|' + currentCollectableMarker.options.type + '|' + currentCollectableMarker.options.purity;
                                                        if(collectablesInRadius[className] === undefined)
                                                        {
                                                            collectablesInRadius[className] = {
                                                                type    : currentCollectableMarker.options.type,
                                                                purity  : currentCollectableMarker.options.purity,
                                                                qty     : 0
                                                            };
                                                        }

                                                        collectablesInRadius[className].qty++;
                                                }
                                                break;
                                            case '/Game/FactoryGame/Resource/BP_FrackingSatellite.BP_FrackingSatellite_C':
                                            case '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C':
                                                //console.log(collectableObject, currentCollectableMarker);
                                                break;
                                            default:
                                                let collectedStatus = baseLayout.collectablesSubSystem.getStatusFromPathName(pathName);
                                                    if(collectedStatus === false)
                                                    {
                                                        if(collectablesInRadius[collectableObject.className] === undefined)
                                                        {
                                                            collectablesInRadius[collectableObject.className] = {qty: 0};
                                                        }

                                                        collectablesInRadius[collectableObject.className].qty++;
                                                    }
                                        }

                                    }
                            }
                    }
            }

        //console.log('collectablesInRadius', collectablesInRadius);
        return collectablesInRadius;
    }

    static getTowerName(baseLayout, currentObject)
    {
        let mMapText = baseLayout.getObjectProperty(currentObject, 'mMapText');
            return mMapText;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-pen',
            text        : 'Update label',
            callback    : Building_RadarTower.updateMapText
        });
        contextMenu.push('-');

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateMapText(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let mMapText        = Building_RadarTower.getTowerName(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>Beacon</strong>" label',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mMapText',
                    inputType   : 'text',
                    value       : ((mMapText !== null) ? mMapText.replace('Radar Tower: ', '') : '')
                }],
                callback    : function(values)
                {
                    baseLayout.deleteObjectProperty(currentObject, 'mMapText');

                    if(values.mMapText !== '')
                    {
                        currentObject.properties.push({
                            name                        : 'mMapText',
                            type                        : 'Text',
                            flags                       : 18,
                            historyType                 : 255,
                            hasCultureInvariantString   : 1,
                            value                       : values.mMapText
                        });
                    }
                }
            });
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content     = [];

        content.push('<div style="position: absolute;margin-top: 40px;margin-left: 24px; width: 450px;height: 30px;font-size: 12px;align-items: center;">');
        content.push('<div style="width: 100%;display: block;line-height: 1;font-size: 12px;color: #5b5b5b;text-align: center;">');

        let mMapText = Building_RadarTower.getTowerName(baseLayout, currentObject);
            if(mMapText !== null)
            {
                content.push('Tower name: <strong class="text-warning" style="font-size: 14px;">' + mMapText + '</strong>');
            }

        content.push('</div>');
        content.push('</div>');

        let isPowered   = baseLayout.getBuildingIsOn(currentObject) && baseLayout.getBuildingIsPowered(currentObject);
            if(isPowered === true)
            {
                // COLLECTABLE IN RADIUS
                let collectablesInRadius    = Building_RadarTower.getCollectablesInCoverageRadius(baseLayout, currentObject);
                let weakInventory           = [];
                let nodeInventory           = [];
                    for(let className in collectablesInRadius)
                    {
                        if(className === '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
                        {
                            weakInventory.push({
                                name    : baseLayout.toolsData.Desc_HardDrive_C.name,
                                image   : baseLayout.toolsData.Desc_HardDrive_C.image,
                                qty     : collectablesInRadius[className].qty
                            });
                        }
                        else
                        {
                            if(collectablesInRadius[className].type !== undefined && collectablesInRadius[className].purity !== undefined)
                            {
                                let itemData = baseLayout.getItemDataFromClassName(collectablesInRadius[className].type);
                                    nodeInventory.push({
                                        name            : itemData.name,
                                        image           : itemData.image,
                                        qty             : collectablesInRadius[className].qty,
                                        backgroundColor : ((collectablesInRadius[className].purity === 'pure') ? '#80b139' : ((collectablesInRadius[className].purity === 'normal') ? '#f26418' : '#d23430'))
                                    });
                            }
                            else
                            {
                                let itemData = baseLayout.getItemDataFromClassName(className);
                                    weakInventory.push({
                                        name    : itemData.name,
                                        image   : itemData.image,
                                        qty     : collectablesInRadius[className].qty
                                    });
                            }
                        }
                    }

                content.push('<div style="position: absolute;margin-top: 73px;margin-left: 24px; width: 450px;height: 300px;font-size: 12px;">');
                content.push(baseLayout.setInventoryTableSlot(weakInventory, null, 48, 'justify-content-center', null, 9));
                content.push('<hr class="border-warning">');
                content.push(baseLayout.setInventoryTableSlot(nodeInventory, null, 48, 'justify-content-center', null, 9));
                content.push('</div>');
            }
            else
            {
                content.push('<div style="position: absolute;margin-top: 73px;margin-left: 24px; width: 450px;height: 300px;font-size: 12px;">');
                content.push('<strong class="text-warning" style="font-size: 24px;">NO POWER</strong>');
                content.push('</div>');
            }

        // STAND BY
        content.push(BaseLayout_Tooltip.getStandByPanel(baseLayout, currentObject, 408, 422, 435, 352));

        content.push('<div style="position: absolute;margin-top: 371px;margin-left: 210px; width: 80px;' + BaseLayout_Tooltip.styleLabels + '"><strong>SCAN DETAILS</strong></div>');

        return '<div style="width: 500px;height: 485px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/RadarTower_Background.png?v=' + baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }

    static bindTooltip(baseLayout, currentObject, tooltipOptions)
    {
        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, 'playerOrientationLayer');
            if(marker !== null)
            {
                let position    = [baseLayout.satisfactoryMap.unproject([0, 0]), baseLayout.satisfactoryMap.unproject([10000, 0])];
                let meterWeight = baseLayout.satisfactoryMap.leafletMap.latLngToContainerPoint(position[1]).x - baseLayout.satisfactoryMap.leafletMap.latLngToContainerPoint(position[0]).x;
                let radius      = Building_RadarTower.getCoverageRadius() / 10000 * meterWeight * 2;

                    marker.options.radiusMarker = L.circle(baseLayout.satisfactoryMap.unproject(currentObject.transform.translation), {
                        interactive : false,
                        opacity     : 0.25,
                        color       : '#FA9549',
                        radius      : 0,
                        weight      : radius
                    }).addTo(baseLayout.playerLayers.playerOrientationLayer.subLayer);

                    if(baseLayout.satisfactoryMap.leafletMap.Building_RadarTower_zoomend === undefined)
                    {
                        baseLayout.satisfactoryMap.leafletMap.Building_RadarTower_zoomend = baseLayout.satisfactoryMap.leafletMap.on('zoomend', function(){
                            if(marker.options.radiusMarker !== undefined)
                            {
                                Building_RadarTower.unbindTooltip(baseLayout, currentObject);
                                Building_RadarTower.bindTooltip(baseLayout, currentObject, tooltipOptions);
                            }
                        });
                    }
            }
    }
    static unbindTooltip(baseLayout, currentObject)
    {
        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, 'playerOrientationLayer');
            if(marker !== null && marker.options.radiusMarker !== undefined)
            {
                baseLayout.playerLayers.playerOrientationLayer.subLayer.removeLayer(marker.options.radiusMarker);
                delete marker.options.radiusMarker;
            }
    }
}