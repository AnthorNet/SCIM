/* global Intl */
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_SpaceElevator
{
    /*
     * Found it :)
    baseLayout.saveGameParser.objects["Persistent_Level:PersistentLevel.GamePhaseManager"].properties[4].name = "mIsGameCompleted"

        mSpaceElevatorState => {
			"name": "mSpaceElevatorState",
			"type": "Byte",
			"value": {
				"enumName": "ESpaceElevatorState",
				"valueName": "ESES_Seal" // ESES_Send
			}
		},

    Edit 1 : Of course that is not so simple, i'm doing more research...
    Edit 2 : Solved, remove "mIsGameCompleted" and "mPALaunchSequenceValues" then correctly set "mCurrentGamePhase" value to "/Game/FactoryGame/GamePhases/GP_Project_Assembly_Phase_0.GP_Project_Assembly_Phase_0" and "mTargetGamePhase" to "/Game/FactoryGame/GamePhases/GP_Project_Assembly_Phase_1.GP_Project_Assembly_Phase_1"...Voila ! Game phase fully reset to starting point =)

    */

    static get availablePhases()
    {
        return {
            GP_Project_Assembly_Phase_0: {
                pathName    : '/Game/FactoryGame/GamePhases/GP_Project_Assembly_Phase_0.GP_Project_Assembly_Phase_0',
                phase       : 0,
                display     : 'Establishing Phase',
                unlock      : 'Tier 1 & 2',
                cost        : null
            },
            GP_Project_Assembly_Phase_1: {
                pathName    : '/Game/FactoryGame/GamePhases/GP_Project_Assembly_Phase_1.GP_Project_Assembly_Phase_1',
                phase       : 1,
                display     : 'Distribution Platform',
                unlock      : 'Tier 3 & 4',
                cost        : {
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_1.Desc_SpaceElevatorPart_1_C"   : 50
                }
            },
            GP_Project_Assembly_Phase_2: {
                pathName    : '/Game/FactoryGame/GamePhases/GP_Project_Assembly_Phase_2.GP_Project_Assembly_Phase_2',
                phase       : 2,
                display     : 'Construction Dock',
                unlock      : 'Tier 5 & 6',
                cost        : {
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_1.Desc_SpaceElevatorPart_1_C"   : 1000,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_2.Desc_SpaceElevatorPart_2_C"   : 1000,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_3.Desc_SpaceElevatorPart_3_C"   : 100
                }
            },
            GP_Project_Assembly_Phase_3: {
                pathName    : '/Game/FactoryGame/GamePhases/GP_Project_Assembly_Phase_3.GP_Project_Assembly_Phase_3',
                phase       : 3,
                display     : 'Main Body',
                unlock      : 'Tier 7 & 8',
                cost        : {
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_2.Desc_SpaceElevatorPart_2_C"   : 2500,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_4.Desc_SpaceElevatorPart_4_C"   : 500,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_5.Desc_SpaceElevatorPart_5_C"   : 100
                }
            },
            GP_Project_Assembly_Phase_4: {
                pathName    : '/Game/FactoryGame/GamePhases/GP_Project_Assembly_Phase_4.GP_Project_Assembly_Phase_4',
                phase       : 4,
                display     : 'Propulsion',
                unlock      : 'Tier 9',
                cost        : {
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_7.Desc_SpaceElevatorPart_7_C"   : 500,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_6.Desc_SpaceElevatorPart_6_C"   : 500,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_9.Desc_SpaceElevatorPart_9_C"   : 100,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_8.Desc_SpaceElevatorPart_8_C"   : 250
                }
            },
            GP_Project_Assembly_Phase_5: {
                pathName    : '/Game/FactoryGame/GamePhases/GP_Project_Assembly_Phase_5.GP_Project_Assembly_Phase_5',
                phase       : 5,
                display     : 'Assembly',
                unlock      : 'Project Assembly launch',
                cost        : {
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_9.Desc_SpaceElevatorPart_9_C"   : 1000,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_10.Desc_SpaceElevatorPart_10_C" : 1000,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_12.Desc_SpaceElevatorPart_12_C" : 256,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_11.Desc_SpaceElevatorPart_11_C" : 200
                }
            },
            GP_Project_Assembly_Phase_6: {
                pathName    : '/Game/FactoryGame/GamePhases/GP_Project_Assembly_Phase_6.GP_Project_Assembly_Phase_6',
                phase       : 6,
                display     : 'Project Assembly launch'
            },
            GP_Project_Assembly_Phase_7: {
                pathName    : '/Game/FactoryGame/GamePhases/GP_Project_Assembly_Phase_7.GP_Project_Assembly_Phase_7',
                phase       : 7,
                display     : 'The end!'
            }
        };
    }

    static getManager(baseLayout)
    {
        return baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.GamePhaseManager');
    }

    static getCurrentPhase(baseLayout)
    {
        let phaseManager = Building_SpaceElevator.getManager(baseLayout);
            if(phaseManager !== null)
            {
                let mCurrentGamePhase   = baseLayout.getObjectProperty(phaseManager, 'mCurrentGamePhase');
                    if(mCurrentGamePhase !== null)
                    {
                        let pathName = mCurrentGamePhase.pathName.split('.');
                            return pathName[1];
                    }
            }

        return 'GP_Project_Assembly_Phase_0';
    }

    static getNextPhase(baseLayout)
    {
        let phaseManager = Building_SpaceElevator.getManager(baseLayout);
            if(phaseManager !== null)
            {
                let mTargetGamePhase   = baseLayout.getObjectProperty(phaseManager, 'mTargetGamePhase');
                    if(mTargetGamePhase !== null)
                    {
                        let pathName = mTargetGamePhase.pathName.split('.');
                            return pathName[1];
                    }
            }

        return null;
    }

    static getPhasePaidOffCosts(baseLayout)
    {
        let itemsCost       = {};
        let nextPhase       = Building_SpaceElevator.getNextPhase(baseLayout);

            if(nextPhase !== null)
            {
                let phaseManager    = Building_SpaceElevator.getManager(baseLayout);
                    if(phaseManager !== null)
                    {
                        let mTargetGamePhasePaidOffCosts = baseLayout.getObjectProperty(phaseManager, 'mTargetGamePhasePaidOffCosts');
                            if(mTargetGamePhasePaidOffCosts !== null)
                            {
                                    for(let i = 0 ; i < mTargetGamePhasePaidOffCosts.values.length; i++)
                                    {
                                        let itemClass   = null;
                                        let amount      = null;
                                            for(let j = 0 ; j < mTargetGamePhasePaidOffCosts.values[i].length; j++)
                                            {
                                                if(mTargetGamePhasePaidOffCosts.values[i][j].name === 'ItemClass')
                                                {
                                                    itemClass = mTargetGamePhasePaidOffCosts.values[i][j].value.pathName;
                                                }
                                                if(mTargetGamePhasePaidOffCosts.values[i][j].name === 'Amount')
                                                {
                                                    amount = mTargetGamePhasePaidOffCosts.values[i][j].value;
                                                }
                                            }

                                        if(itemClass !== null && amount !== null)
                                        {
                                            itemsCost[itemClass] = amount;
                                        }
                                    }

                                return itemsCost;
                            }
                    }
            }

        return null;
    }

    static updatePhase(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let phaseManager        = Building_SpaceElevator.getManager(baseLayout);
        let availablePhases     = Building_SpaceElevator.availablePhases;

        let phaseOptions        = [];
            for(let phaseId in availablePhases)
            {
                phaseOptions.push({
                    value   : phaseId,
                    text    :     ((availablePhases[phaseId].phase !== undefined) ? 'PHASE ' + availablePhases[phaseId].phase + ': ' : '')
                                + availablePhases[phaseId].display
                                + ((availablePhases[phaseId].unlock !== undefined) ? ' (' + availablePhases[phaseId].unlock + ')' : '')
                });
            }

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" phase',
                container   : '#leafletMap',
                inputs      : [{
                    name            : 'mGamePhase',
                    inputType       : 'select',
                    value           : Building_SpaceElevator.getCurrentPhase(baseLayout),
                    inputOptions    : phaseOptions
                }],
                callback    : function(values)
                {
                    // Swicth current phase
                    baseLayout.setObjectProperty(phaseManager, 'mCurrentGamePhase', {levelName: '', pathName: availablePhases[values.mGamePhase].pathName}, 'Object');

                    // Do we have another phase next?
                    let phaseIds            = Object.keys(availablePhases);
                    let currentPhaseIndex   = phaseIds.indexOf(values.mGamePhase);
                        if(currentPhaseIndex !== -1 && phaseIds[currentPhaseIndex + 1] !== undefined)
                        {
                            baseLayout.setObjectProperty(phaseManager, 'mTargetGamePhase', {levelName: '', pathName: availablePhases[phaseIds[currentPhaseIndex + 1]].pathName}, 'Object');
                        }

                    baseLayout.deleteObjectProperty(phaseManager, 'mTargetGamePhasePaidOffCosts');

                    if(values.mGamePhase !== 'GP_Project_Assembly_Phase_5' && values.mGamePhase !== 'GP_Project_Assembly_Phase_6')
                    {
                        baseLayout.deleteObjectProperty(phaseManager, 'mPALaunchSequenceValues');
                    }
                    if(values.mGamePhase !== 'GP_Project_Assembly_Phase_7')
                    {
                        baseLayout.deleteObjectProperty(phaseManager, 'mIsGameCompleted');
                    }
                    else
                    {
                        baseLayout.deleteObjectProperty(phaseManager, 'mTargetGamePhase');
                    }
                }
            });
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let phaseManager    = Building_SpaceElevator.getManager(baseLayout);
            if(phaseManager !== null)
            {
                let mCurrentGamePhase   = baseLayout.getObjectProperty(phaseManager, 'mCurrentGamePhase');
                    if(mCurrentGamePhase !== null)
                    {
                        contextMenu.push({
                            text        : 'Update phase',
                            callback    : Building_SpaceElevator.updatePhase
                        });
                    }

                let mTargetGamePhasePaidOffCosts = baseLayout.getObjectProperty(phaseManager, 'mTargetGamePhasePaidOffCosts');
                    if(mTargetGamePhasePaidOffCosts !== null)
                    {
                        contextMenu.push({
                            text        : 'Empty next phase inventory',
                            callback    : Building_SpaceElevator.emptyPhaseInventory
                        });
                    }
            }

        contextMenu.push('-');

        return contextMenu;
    }

    static emptyPhaseInventory(marker)
    {
        let baseLayout      = marker.baseLayout;
        let phaseManager    = Building_SpaceElevator.getManager(baseLayout);
            if(phaseManager !== null)
            {
                baseLayout.deleteObjectProperty(phaseManager, 'mTargetGamePhasePaidOffCosts');
                baseLayout.deleteObjectProperty(phaseManager, 'mSpaceElevatorState');
            }
    }


    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content             = [];
        let nextPhaseName       = Building_SpaceElevator.getNextPhase(baseLayout);
            if(nextPhaseName !== null)
            {
                let nextPhase   = Building_SpaceElevator.availablePhases[nextPhaseName];

                // Slots
                if(nextPhase.cost !== null)
                {
                    let itemsCost = Building_SpaceElevator.getPhasePaidOffCosts(baseLayout);

                    content.push('<div style="position: absolute;margin-top: 52px;margin-left: 59px;width: 141px;height: 180px;color: #FFFFFF;">');
                    for(let itemClass in nextPhase.cost)
                    {
                        let itemData = baseLayout.getItemDataFromClassName(itemClass);
                            content.push('<div style="width: 141px; height: 40px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_SpaceElevatorCapsuleSlot.png?v=' + baseLayout.scriptVersion + ') no-repeat;margin-bottom: 5px;">');
                                content.push('<table><tr>');
                                    content.push('<td>');
                                        if(itemData !== null)
                                        {
                                            content.push('<img src="' + itemData.image + '" style="width: 30px;height: 30px;padding-top: 6px;" />');
                                        }
                                    content.push('</td>');
                                    content.push('<td style="font-size: 10px;">');
                                        if(itemData !== null)
                                        {
                                            content.push(itemData.name + '<br />');
                                        }

                                        content.push(new Intl.NumberFormat(baseLayout.language).format(((itemsCost !== null && itemsCost[itemClass] !== undefined) ? itemsCost[itemClass] : 0)) + ' / ' + new Intl.NumberFormat(baseLayout.language).format(nextPhase.cost[itemClass]));
                                        content.push('<div class="progress"><div class="progress-bar" style="width: ' + (((itemsCost !== null && itemsCost[itemClass] !== undefined) ? itemsCost[itemClass] : 0) / nextPhase.cost[itemClass]) + '%"></div></div>')
                                    content.push('</td>');
                                content.push('</tr></table>');
                            content.push('</div>');
                    }
                    content.push('</div>');
                }

                // Header
                content.push('<div style="position: absolute;margin-top: 12px;margin-left: 328px;width: 160px;height: 98px;display: flex;align-items: center;"><div style="width: 100%;display: block;text-align: center;color: #5b5b5b;font-size: 12px;line-height: 12px;">');
                    //content.push('<div><strong>' + buildingData.name + '</strong></div>');
                    content.push('<div><strong class="text-warning">' + nextPhase.display + '</strong></div>');

                    content.push('<div style="padding-top: 5px;font-size: 9px;">Delivery will unlock:<br /><strong>' + nextPhase.unlock + '</strong></div>');

                    content.push('<div style="padding-top: 5px;font-size: 9px;">Status:</div>');
                    content.push('<div class="text-warning"><strong>');
                    //if(sealStatus === true)
                    {
                        //content.push('Seal Crate');
                    }
                    //else
                    {
                        //content.push('Load Crate');
                    }
                    content.push('</strong></div>');
                content.push('</div></div>');

                // Seal
                //if(sealStatus === true)
                {
                    //content.push('<div style="position :absolute;margin-top: 171px;margin-left: 333px;width: 75px; height: 36px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/SpaceElevator_Pusher.png?v=' + baseLayout.scriptVersion + ') no-repeat;"></div>');
                    //content.push('<div style="position :absolute;margin-top: 194px;margin-left: 374px;width: 126px; height: 117px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/SpaceElevator_Seal.png?v=' + baseLayout.scriptVersion + ') no-repeat;" class="blink"></div>');
                }
            }

        return '<div style="width: 500px;height: 330px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_SpaceElevator_BG.png?v=' + baseLayout.scriptVersion + ') no-repeat;margin: -7px;">' + content.join('') + '</div>';
    }
}