import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class SubSystem_Overclocking
{
    constructor(options)
    {
        this.baseLayout     = options.baseLayout;
    }

    getClockSpeed(currentObject)
    {
        let currentPotential = this.baseLayout.getObjectProperty(currentObject, 'mCurrentPotential');
            if(currentPotential !== null)
            {
                return currentPotential;
            }

        let pendingPotential = this.baseLayout.getObjectProperty(currentObject, 'mPendingPotential');
            if(pendingPotential !== null)
            {
                return pendingPotential;
            }

       return 1;
    }

    updateClockSpeed(currentObject, clockSpeed, useOwnPowershards = false, isFromSelection = false)
    {
            clockSpeed          = Math.max(1, Math.min(Math.round(clockSpeed * 1000000) / 1000000, 250));
        let totalPowerShards    = Math.ceil((clockSpeed - 100) / 50);
        let stopLooking         = false;

        if(totalPowerShards > 0)
        {
            let potentialInventory  = this.baseLayout.getObjectInventory(currentObject, 'mInventoryPotential', true);
                if(potentialInventory !== null)
                {
                    let mInventoryStacks  = this.baseLayout.getObjectProperty(potentialInventory, 'mInventoryStacks');
                        if(mInventoryStacks === null)
                        {
                            potentialInventory.properties.push({
                                name    : "mInventoryStacks",
                                type    : "Array",
                                value   : {
                                        type    : "Struct",
                                        values  : [
                                            [{
                                                name: "Item",
                                                type: "Struct",
                                                value: {
                                                    type        : "InventoryItem",
                                                    itemName    : { levelName: "", pathName: "" },
                                                    properties  : [{ name: "NumItems", type: "Int", value: 0 }]
                                                }
                                            }],
                                            [{
                                                name: "Item",
                                                type: "Struct",
                                                value: {
                                                    type        : "InventoryItem",
                                                    itemName    : { levelName: "", pathName: "" },
                                                    properties  : [{ name: "NumItems", type: "Int", value: 0 }]
                                                }
                                            }],
                                            [{
                                                name: "Item",
                                                type: "Struct",
                                                value: {
                                                    type        : "InventoryItem",
                                                    itemName    : { levelName: "", pathName: "" },
                                                    properties  : [{ name: "NumItems", type: "Int", value: 0 }]
                                                }
                                            }]
                                        ]
                                    },
                                structureSubType: "InventoryStack"
                            });

                            console.log('Adding missing mInventoryStacks to: ' + currentObject.pathName);
                        }

                    for(let i = 0; i < potentialInventory.properties.length; i++)
                    {
                        if(potentialInventory.properties[i].name === 'mInventoryStacks')
                        {
                            for(let j = 0; j < totalPowerShards; j++)
                            {
                                if(useOwnPowershards === true || parseInt(useOwnPowershards) === 1)
                                {
                                    let result = this.baseLayout.removeFromStorage('/Game/FactoryGame/Resource/Environment/Crystal/Desc_CrystalShard.Desc_CrystalShard_C');
                                        if(result === false)
                                        {
                                            console.log('No power shard found for "' + currentObject.pathName + '"... Stopping!');

                                            stopLooking = true;
                                            clockSpeed  = Math.min(clockSpeed, 100 + (j * 50)); // Downgrade...

                                            break;
                                        }
                                }

                                potentialInventory.properties[i].value.values[j][0].value.itemName.pathName = '/Game/FactoryGame/Resource/Environment/Crystal/Desc_CrystalShard.Desc_CrystalShard_C';
                                this.baseLayout.setObjectProperty(potentialInventory.properties[i].value.values[j][0].value, 'NumItems', 1, 'Int');
                            }
                        }

                        if(stopLooking === true && isFromSelection === false)
                        {
                            BaseLayout_Modal.alert('We could not find enough "Power Shards" in your containers, the buidling was not totally overclocked.');
                        }
                    }
                }
        }

        this.baseLayout.setObjectProperty(currentObject, 'mCurrentPotential', clockSpeed / 100, 'Float');
        this.baseLayout.setObjectProperty(currentObject, 'mPendingPotential', clockSpeed / 100, 'Float');

        // UPDATE 8: Update mDynamicProductionCapacity to force circuits capacity?
        let mPowerInfo = this.baseLayout.getObjectProperty(currentObject, 'mPowerInfo');
            if(mPowerInfo !== null)
            {
                let powerInfo = this.baseLayout.saveGameParser.getTargetObject(mPowerInfo.pathName);
                    if(powerInfo !== null)
                    {
                        let mDynamicProductionCapacity = this.baseLayout.getObjectProperty(powerInfo, 'mDynamicProductionCapacity');
                            if(mDynamicProductionCapacity !== null)
                            {
                                let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
                                    if(buildingData !== null && buildingData.category === 'generator')
                                    {
                                        let mPowerProductionExponent    = buildingData.powerProductionExponent || 1.3;
                                            if(this.baseLayout.saveGameParser.header.saveVersion >= 33)
                                            {
                                                mPowerProductionExponent = 1.0;
                                            }

                                        this.baseLayout.setObjectProperty(
                                            powerInfo,
                                            'mDynamicProductionCapacity',
                                            (buildingData.powerGenerated * Math.pow(clockSpeed / 100, 1 / mPowerProductionExponent)),
                                            'Float'
                                        );
                                    }
                            }
                    }
            }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/FrackingSmasher/Build_FrackingSmasher.Build_FrackingSmasher_C')
        {
            // Update all linked extractors
            let satellites  = Building_FrackingSmasher.getSatellites(this.baseLayout, currentObject);
                for(let i = 0; i < satellites.length; i++)
                {
                    if(satellites[i].options.extractorPathName !== undefined)
                    {
                        let currentExtractor = this.baseLayout.saveGameParser.getTargetObject(satellites[i].options.extractorPathName);
                            if(currentExtractor !== null)
                            {
                                this.baseLayout.setObjectProperty(currentExtractor, 'mCurrentPotential', clockSpeed / 100, 'Float');
                                this.baseLayout.setObjectProperty(currentExtractor, 'mPendingPotential', clockSpeed / 100, 'Float');
                            }
                    }
                }
        }

        if(stopLooking === true && isFromSelection === true)
        {
            return false;
        }

        return true;
    }

    getProductionBoost(currentObject)
    {
        let currentPotential = this.baseLayout.getObjectProperty(currentObject, 'mCurrentProductionBoost');
            if(currentPotential !== null)
            {
                return currentPotential;
            }

        let pendingPotential = this.baseLayout.getObjectProperty(currentObject, 'mPendingProductionBoost');
            if(pendingPotential !== null)
            {
                return pendingPotential;
            }

       return 1;
    }

    /**
     * MODALS
     */
    updateObjectClockSpeed(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);

        BaseLayout_Modal.form({
            title       : 'Update "<strong>' + buildingData.name + '</strong>" clock speed',
            container   : '#leafletMap',
            inputs      : [
                {
                    name        : 'clockSpeed',
                    inputType   : 'number',
                    value       : baseLayout.overclockingSubSystem.getClockSpeed(currentObject) * 100,
                    min         : 1,
                    max         : 250
                },
                {
                    label       : 'Use power shards from your containers?',
                    name        : 'useOwnPowershards',
                    inputType   : 'toggle'
                }
            ],
            callback    : function(values)
            {
                return baseLayout.overclockingSubSystem.updateClockSpeed(currentObject, values.clockSpeed, parseInt(values.useOwnPowershards));
            }
        });
    }

    updateOutputMultiplier(marker)
    {

    }

    /*
     * TOOLTIP PANELS
     */
    getOverclockingPanel(currentObject, top = 312, left = 34)
    {
        if(this.baseLayout.unlockSubSystem.haveOverclocking() === true)
        {
            let content                 = [];
            let clockSpeed              = this.getClockSpeed(currentObject);
            let potentialInventory      = this.baseLayout.getObjectInventory(currentObject, 'mInventoryPotential');

                content.push('<div style="position: absolute;margin-top: ' + (parseInt(top) + 2) + 'px;margin-left: ' + (parseInt(left) + 2) + 'px; width: 318px;height: 97px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/ManufacutringMenu_OverclockBackground.png?v=' + this.baseLayout.scriptVersion + ')">');
                content.push('<table style="margin: 10px;width: 298px;"><tr>');
                content.push('<td><span class="text-small">Clockspeed:</span><br /><strong class="lead text-warning">' + +(Math.round(clockSpeed * 10000) / 100) + ' %</strong></td>');

                if(potentialInventory !== null)
                {
                    for(let i = 0; i < 3; i++)
                    {
                        content.push('<td width="62">');
                        content.push('<div class="text-center"><table class="mr-auto ml-auto"><tr><td>' + this.baseLayout.setInventoryTableSlot(
                            [((potentialInventory[i] === undefined) ? null : potentialInventory[i])],
                            null,
                            56,
                            '',
                            this.baseLayout.itemsData.Desc_CrystalShard_C.image
                        ) + '</td></tr></table></div>');
                        content.push('</td>');
                    }
                }

                content.push('</tr><tr>');
                content.push('<td><div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + Math.min(100, (clockSpeed * 10000) / 100) + '%"></div></div></td>');

                if(potentialInventory !== null)
                {
                    for(let i = 0; i < 3; i++)
                    {
                        let potentialProgress = Math.min(100, ((clockSpeed * 10000) / 100 - (100 + (i * 50))) * 2);
                            content.push('<td><div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + potentialProgress + '%"></div></div></td>');
                    }
                }

                content.push('</tr></table>');
                content.push('</div>');

            return content.join('');
        }

        return '<div style="position: absolute;margin-top: ' + top + 'px;margin-left: ' + left + 'px; width: 322px;height: 105px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/OverclockPanelLocked.png?v=' + this.baseLayout.scriptVersion + ');"></div>';
    }

    getProductionAmplifierPanel(currentObject, top = 312, left = 366)
    {
        if(this.baseLayout.unlockSubSystem.haveProductionBoost() === true)
        {
            let content                 = [];
            let productionBoost         = this.getProductionBoost(currentObject);
            let potentialInventory      = this.baseLayout.getObjectInventory(currentObject, 'mInventoryPotential');

                content.push('<div style="position: absolute;margin-top: ' + (parseInt(top) + 2) + 'px;margin-left: ' + (parseInt(left) + 2) + 'px; width: 96px;height: 97px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/ManufacutringMenu_ProductionBoostBackground.png?v=' + this.baseLayout.scriptVersion + ')">');
                content.push('<table style="margin: 5px;width: 86px;">');
                content.push('<tr><td>');
                    content.push('<div style="position: relative;background: #FFFFFF;border: 1px solid #000000;border-radius: 5px;overflow: hidden;padding: 5px;">');

                        let inventoryImage = '<div class="text-center"><table class="mr-auto ml-auto"><tr><td>' + this.baseLayout.setInventoryTableSlot(
                                [((potentialInventory[3] === undefined) ? null : potentialInventory[3])],
                                null,
                                40,
                                '',
                                this.baseLayout.toolsData.Desc_WAT1_C.image
                            ) + '</td></tr></table></div>';

                        if(potentialInventory[3] !== undefined && potentialInventory[3] !== null)
                        {
                            content.push('<div style="position: absolute;top: 50%;left: 50%;margin-top: -150px;margin-left: -150px;width: 300px;height: 300px;background-image: linear-gradient(135deg, #9f6d9f 23.81%, #855b85 23.81%, #855b85 25%, #bd82bd 25%, #bd82bd 48.81%, #855b85 48.81%, #855b85 50%, #9f6d9f 50%, #9f6d9f 73.81%, #855b85 73.81%, #855b85 75%, #bd82bd 75%, #bd82bd 98.81%, #855b85 98.81%, #855b85 100%);background-size: 30px 30px;animation: productionBoost 20s linear infinite;">');
                            content.push('</div>');
                            content.push('<div style="animation: interference 4s infinite;">' + inventoryImage + '</div>');
                        }
                        else
                        {
                            content.push(inventoryImage);
                        }



                    content.push('</div>');
                content.push('</td></tr>');

                content.push('<tr><td style="' + BaseLayout_Tooltip.defaultTextStyle + 'text-align: center;line-height: 10px;"><span style="font-size: 70%;">Output Multiplier:</span><br /><strong style="color: #a671a6;font-size: 120%;">x' + productionBoost + '</strong></td></tr>');

                content.push('</table>');
                content.push('</div>');

            return content.join('');
        }

        return '<div style="position: absolute;margin-top: ' + top + 'px;margin-left: ' + left + 'px; width: 100px;height: 105px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/ProductionAmplifierPanelLocked.png?v=' + this.baseLayout.scriptVersion + ');"></div>';
    }
}