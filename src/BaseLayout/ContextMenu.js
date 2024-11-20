import Building                                 from '../Building.js';

import Building_AwesomeSink                     from '../Building/AwesomeSink.js';
import Building_Beacon                          from '../Building/Beacon.js';
import Building_Conveyor                        from '../Building/Conveyor.js';
import Building_Door                            from '../Building/Door.js';
import Building_DroneStation                    from '../Building/DroneStation.js';
import Building_DropPod                         from '../Building/DropPod.js';
import Building_HyperTube                       from '../Building/HyperTube.js';
import Building_Light                           from '../Building/Light.js';
import Building_Locomotive                      from '../Building/Locomotive.js';
import Building_MapMarker                       from '../Building/MapMarker.js';
import Building_Miner                           from '../Building/Miner.js';
import Building_Pipeline                        from '../Building/Pipeline.js';
import Building_Portal                          from '../Building/Portal.js';
import Building_PowerLine                       from '../Building/PowerLine.js';
import Building_PowerPole                       from '../Building/PowerPole.js';
import Building_PowerStorage                    from '../Building/PowerStorage.js';
import Building_PowerSwitch                     from '../Building/PowerSwitch.js';
import Building_Production                      from '../Building/Production.js';
import Building_RadarTower                      from '../Building/RadarTower.js';
import Building_RailroadSwitchControl           from '../Building/RailroadSwitchControl.js';
import Building_ResourceDeposit                 from '../Building/ResourceDeposit.js';
import Building_Sign                            from '../Building/Sign.js';
import Building_SmartSplitter                   from '../Building/SmartSplitter.js';
import Building_SpaceElevator                   from '../Building/SpaceElevator.js';
import Building_TradingPost                     from '../Building/TradingPost.js';
import Building_TrainStation                    from '../Building/TrainStation.js';
import Building_TruckStation                    from '../Building/TruckStation.js';
import Building_Vehicle                         from '../Building/Vehicle.js';

import Modal_Debug                              from '../Modal/Debug.js';
import Modal_Map_Paste                          from '../Modal/Map/Paste.js';
import Modal_Node_SpawnAround                   from '../Modal/Node/SpawnAround.js';
import Modal_Object_ColorSlot                   from '../Modal/Object/ColorSlot.js';
import Modal_Object_CustomColor                 from '../Modal/Object/CustomColor.js';
import Modal_Object_Pattern                     from '../Modal/Object/Pattern.js';
import Modal_Object_Position                    from '../Modal/Object/Position.js';
import Modal_Object_SpawnAround                 from '../Modal/Object/SpawnAround.js';

export default class BaseLayout_ContextMenu
{
    constructor(options)
    {
        this.baseLayout = options.baseLayout;
        this.marker     = options.marker;
    }

    getContextMenu(currentObject)
    {
        let contextMenu = [];

        if(this.marker.options.mapMarkerId !== undefined)
        {
            return Building_MapMarker.addContextMenu(this.baseLayout, this.marker.options.mapMarkerId, contextMenu);
        }

        if(currentObject !== null)
        {
            if(Building_PowerLine.isPowerline(currentObject))
            {
                return false;
            }

            let faunaData   = this.baseLayout.faunaSubsystem.getDataFromClassName(currentObject.className);
                if(faunaData !== null)
                {
                    contextMenu.push({
                        icon        : faunaData.image,
                        text        : faunaData.name
                    });
                    contextMenu.push({
                        icon        : 'fa-arrows-alt',
                        text        : this.baseLayout.translate._('Update position'),
                        callback    : Modal_Object_Position.getHTML
                    });
                    contextMenu.push('-');
                    contextMenu.push({
                        icon        : 'fa-trash-alt',
                        text        : 'Delete',
                        callback    : this.baseLayout.faunaSubsystem.delete
                    });
                }

            let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
                switch(currentObject.className)
                {
                    case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                        contextMenu.push({
                            text        : this.baseLayout.players[currentObject.pathName].getDisplayName()
                        });
                        contextMenu.push({
                            icon        : 'fa-arrows-alt',
                            text        : this.baseLayout.translate._('Update position'),
                            callback    : Modal_Object_Position.getHTML
                        });
                        contextMenu.push('-');
                        contextMenu.push({
                            icon    : 'fa-box',
                            text    : 'Edit inventory',
                            callback: this.baseLayout.editPlayerStorageBuildingInventory
                        });
                        break;
                    case '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C':
                        let mDecorationDescriptor           = this.baseLayout.getObjectProperty(currentObject, 'mDecorationDescriptor');
                            if(mDecorationDescriptor !== null)
                            {
                                buildingData                    = this.baseLayout.getItemDataFromClassName(mDecorationDescriptor.pathName);
                                if(buildingData !== null)
                                {
                                    buildingData.mapUseSlotColor    = false;
                                }
                            }
                        break;
                    case '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C':
                        buildingData                        = this.baseLayout.toolsData.BP_ItemDescriptorPortableMiner_C;
                        buildingData.mapUseSlotColor        = false;
                        break;
                    case '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorIntegratedBiomass.Build_GeneratorIntegratedBiomass_C':
                    case '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C':
                        return [{
                            icon        : 'fa-terminal',
                            text        : 'Advanced Debug',
                            callback    : Modal_Debug.getHTML
                        }];
                    case '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C':
                        contextMenu.push({
                            text        : 'Loot Crate'
                        });
                        contextMenu.push({
                            icon        : 'fa-arrows-alt',
                            text        : this.baseLayout.translate._('Update position'),
                            callback    : Modal_Object_Position.getHTML
                        });
                        /*
                        contextMenu.push({
                            text    : 'Move "Loot Crate" to player inventory',
                            callback: SubSystem_Player.fillInventoryFrom
                        });
                        */
                        contextMenu.push('-');
                        contextMenu.push({
                            icon        : 'fa-trash-alt',
                            text        : 'Delete',
                            callback    : this.baseLayout.deletePlayerLootCrate
                        });
                        break;
                    case '/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C':
                        contextMenu = Building_Beacon.addContextMenu(this.baseLayout, currentObject, contextMenu);
                        break;
                    case '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C':
                        contextMenu = Building_ResourceDeposit.addContextMenu(this.baseLayout, currentObject, contextMenu);
                        break;
                    case '/Game/FactoryGame/World/Benefit/NutBush/BP_NutBush.BP_NutBush_C':
                    case '/Game/FactoryGame/World/Benefit/BerryBush/BP_BerryBush.BP_BerryBush_C':
                    case '/Game/FactoryGame/World/Benefit/Mushroom/BP_Shroom_01.BP_Shroom_01_C':
                        contextMenu.push({
                            text        : 'Consumable'
                        });

                        let consumableStatus = this.baseLayout.collectablesSubSystem.getStatusFromPathName(currentObject.pathName);
                            if(consumableStatus === true)
                            {
                                contextMenu.push({
                                    icon        : 'fa-acorn',
                                    text        : 'Respawn',
                                    callback    : this.baseLayout.collectablesSubSystem.resetMarker
                                });
                            }
                            else
                            {
                                contextMenu.push({
                                    icon        : 'fa-acorn',
                                    text        : 'Collect',
                                    callback    : this.baseLayout.collectablesSubSystem.clearMarker
                                });
                            }

                        contextMenu.push('-');

                        contextMenu.push({
                            icon        : 'fa-portal-exit',
                            text        : 'Teleport player',
                            callback    : this.baseLayout.teleportPlayer
                        });
                        break;

                    case '/Script/FactoryGame.FGItemPickup_Spawnable':
                    case '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_SpitterParts.BP_SpitterParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaSpitterParts.BP_AlphaSpitterParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_HogParts.BP_HogParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_CliffHogParts.BP_CliffHogParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaHogParts.BP_AlphaHogParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_NuclearHogParts.BP_NuclearHogParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_StingerParts.BP_StingerParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaStingerParts.BP_AlphaStingerParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_EliteStingerParts.BP_EliteStingerParts_C':
                    case '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_CrabEggParts.BP_CrabEggParts_C':
                        contextMenu.push({
                            text        : 'Dropped Items'
                        });
                        contextMenu.push({
                            icon        : 'fa-portal-exit',
                            text        : 'Teleport player',
                            callback    : this.baseLayout.teleportPlayer
                        });

                        contextMenu.push({
                            icon        : 'fa-arrows-alt',
                            text        : this.baseLayout.translate._('Update position'),
                            callback    : Modal_Object_Position.getHTML
                        });

                        contextMenu.push('-');
                        contextMenu.push({
                            icon        : 'fa-trash-alt',
                            text        : 'Delete',
                            callback    : this.baseLayout.deleteItemPickUp
                        });
                        break;
                    case '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal.BP_Crystal_C':
                    case '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk2.BP_Crystal_mk2_C':
                    case '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk3.BP_Crystal_mk3_C':
                    case '/Game/FactoryGame/Prototype/WAT/BP_WAT1.BP_WAT1_C':
                    case '/Game/FactoryGame/Prototype/WAT/BP_WAT2.BP_WAT2_C':
                        contextMenu.push({
                            text        : 'Collectable'
                        });

                        let collectedStatus = this.baseLayout.collectablesSubSystem.getStatusFromPathName(currentObject.pathName);
                            if(collectedStatus === true)
                            {
                                contextMenu.push({
                                    icon        : 'fa-acorn',
                                    text        : 'Respawn',
                                    callback    : this.baseLayout.collectablesSubSystem.resetMarker
                                });
                            }
                            else
                            {
                                contextMenu.push({
                                    icon        : 'fa-acorn',
                                    text        : 'Collect',
                                    callback    : this.baseLayout.collectablesSubSystem.clearMarker
                                });
                            }

                        contextMenu.push('-');

                    case '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C':
                    case '/Game/FactoryGame/Resource/BP_FrackingCore.BP_FrackingCore_C':
                    case '/Game/FactoryGame/Resource/BP_FrackingSatellite.BP_FrackingSatellite_C':
                    case '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C':
                    case '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C':
                        contextMenu.push({
                            icon        : 'fa-portal-exit',
                            text        : 'Teleport player',
                            callback    : this.baseLayout.teleportPlayer
                        });

                        if(currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C' || currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C')
                        {
                            if(this.baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName] !== undefined)
                            {
                                let contextMenuText = ((this.baseLayout.satisfactoryMap.collectableMarkers[currentObject.pathName].options.type === 'Desc_LiquidOil_C') ? 'Spawn an Oil Extractor' : 'Spawn a Miner');
                                    if(currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C')
                                    {
                                        contextMenuText = 'Spawn a Geothermal Generator';
                                    }

                                contextMenu.push('-');
                                contextMenu.push({
                                    text    : contextMenuText,
                                    callback: Modal_Node_SpawnAround.getHTML
                                });
                            }
                        }

                        if(currentObject.className === '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
                        {
                            contextMenu = Building_DropPod.addContextMenu(this.baseLayout, currentObject, contextMenu);
                        }
                        break;
                }

            if(buildingData !== null)
            {
                contextMenu.push({text: buildingData.name, icon: buildingData.image});

                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/RadarTower/Build_RadarTower.Build_RadarTower_C')
                {
                    contextMenu = Building_RadarTower.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_Portal.Build_Portal_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_PortalSatellite.Build_PortalSatellite_C')
                {
                    contextMenu = Building_Portal.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }

                if(buildingData.category === 'frame' || buildingData.category === 'foundation' || buildingData.category === 'roof')
                {
                    contextMenu.push({
                        icon        : 'fa-redo fa-spin',
                        text        : this.baseLayout.translate._('Rotate "%1$s" by 90°', buildingData.name),
                        callback    : this.baseLayout.rotationPlayerFoundation
                    });

                    contextMenu.push({
                        icon        : 'fa-share',
                        text        : this.baseLayout.translate._('Pivot "%1$s" from the top-left corner', buildingData.name),
                        callback    : this.baseLayout.pivotPlayerFoundation
                    });

                    if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal') === false && currentObject.className.includes('_Corner_') === false)
                    {
                        contextMenu.push('-');

                        contextMenu.push({
                            icon        : 'fa-building',
                            text        : this.baseLayout.translate._('Spawn around "%1$s"', buildingData.name),
                            callback    : Modal_Object_SpawnAround.getHTML
                        });

                        if(this.baseLayout.clipboard !== null && this.baseLayout.clipboard.originalLocationOnly === undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-paste',
                                text        : this.baseLayout.translate._('Paste %1$s items', this.baseLayout.clipboard.data.length),
                                callback    : Modal_Map_Paste.getHTML
                            });
                        }
                    }

                    contextMenu.push('-');

                    contextMenu.push({
                        icon        : 'fa-portal-exit',
                        text        : this.baseLayout.translate._('Teleport player on "%1$s"', buildingData.name),
                        callback    : this.baseLayout.teleportPlayer
                    });

                    contextMenu.push('-');
                }

                if(
                      (buildingData.category === 'generator' || (buildingData.powerUsed !== undefined && buildingData.powerUsed > 0) || currentObject.className === '/Game/FactoryGame/Buildable/Factory/HadronCollider/Build_HadronCollider.Build_HadronCollider_C')
                    && buildingData.category !== 'pad'
                    && buildingData.category !== 'logistic' && buildingData.category !== 'dockstation' && buildingData.category !== 'vehicle'
                    && buildingData.category !== 'pipe'
                    && buildingData.category !== 'hyperTube'
                    && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/CeilingLight/Build_CeilingLight.Build_CeilingLight_C'
                    && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/Floodlight/Build_FloodlightWall.Build_FloodlightWall_C'
                    && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/PowerStorage/Build_PowerStorageMk1.Build_PowerStorageMk1_C'
                    && currentObject.className !== '/Game/FactoryGame/Events/Christmas/Buildings/SnowDispenser/Build_SnowDispenser.Build_SnowDispenser_C'
                )
                {
                    contextMenu.push({
                        icon        : 'fa-power-off',
                        text        : 'Turn ' + ((this.baseLayout.getBuildingIsOn(currentObject) === false) ? '<strong class="text-success">On' : '<strong class="text-danger">Off</strong>'),
                        className   : 'Building_PowerSwitch_turn' + ((this.baseLayout.getBuildingIsOn(currentObject) === false) ? 'On' : 'Off'),
                        callback    : this.baseLayout.updateObjectProductionPausedStatus
                    });

                    if(buildingData.category !== 'light' && buildingData.category !== 'tower' && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
                    {
                        if(this.baseLayout.unlockSubSystem.haveOverclocking() === true)
                        {
                            contextMenu.push({
                                icon        : 'fa-tachometer-alt-slow',
                                text        : this.baseLayout.translate._('Update clock speed'),
                                callback    : this.baseLayout.overclockingSubSystem.updateObjectClockSpeed
                            });
                        }
                    }

                    /*
                    if(buildingData.category === 'production')
                    {
                        contextMenu.push({
                            icon        : 'fa-flame',
                            text        : this.baseLayout.translate._('Update output multiplier'),
                            callback    : this.baseLayout.overclockingSubSystem.updateOutputMultiplier
                        });
                    }
                    */

                    contextMenu.push('-');
                }

                if(buildingData.category === 'wall' && (currentObject.className.includes('_Door_') || currentObject.className.includes('_CDoor_') || currentObject.className.includes('_SDoor_') || currentObject.className.includes('_Gate_Automated_')))
                {
                    contextMenu = Building_Door.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(buildingData.category === 'sign')
                {
                    contextMenu = Building_Sign.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/DroneStation/Build_DroneStation.Build_DroneStation_C')
                {
                    contextMenu = Building_DroneStation.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/TruckStation/Build_TruckStation.Build_TruckStation_C')
                {
                    contextMenu = Building_TruckStation.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(buildingData.category === 'light')
                {
                    contextMenu = Building_Light.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }

                if(Building_Locomotive.isLocomotive(currentObject))
                {
                    contextMenu = Building_Locomotive.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                else
                {
                    if(buildingData.category === 'vehicle')
                    {
                        contextMenu = Building_Vehicle.addContextMenu(this.baseLayout, currentObject, contextMenu);
                    }
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C')
                {
                    contextMenu = Building_TrainStation.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/PowerStorage/Build_PowerStorageMk1.Build_PowerStorageMk1_C')
                {
                    contextMenu = Building_PowerStorage.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(
                        currentObject.className === '/Game/FactoryGame/Buildable/Factory/PowerSwitch/Build_PowerSwitch.Build_PowerSwitch_C'
                     || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PriorityPowerSwitch/Build_PriorityPowerSwitch.Build_PriorityPowerSwitch_C'
                )
                {
                    contextMenu = Building_PowerSwitch.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C')
                {
                    contextMenu = Building_RailroadSwitchControl.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(
                        currentObject.className === '/Game/FactoryGame/Buildable/Factory/CA_SplitterSmart/Build_ConveyorAttachmentSplitterSmart.Build_ConveyorAttachmentSplitterSmart_C'
                     || currentObject.className === '/Game/FactoryGame/Buildable/Factory/CA_SplitterProgrammable/Build_ConveyorAttachmentSplitterProgrammable.Build_ConveyorAttachmentSplitterProgrammable_C'
                )
                {
                    contextMenu = Building_SmartSplitter.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(
                        currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorBelt') === true
                     || currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorLift') === true
                )
                {
                    contextMenu = Building_Conveyor.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PowerPole') === true)
                {
                    contextMenu = Building_PowerPole.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(Building_Pipeline.isPipeline(currentObject) || currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PipePump') === true)
                {
                    contextMenu = Building_Pipeline.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/MinerM') === true) // No k, because minermk1 has an uppercase one :D
                {
                    contextMenu = Building_Miner.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/SpaceElevator/Build_SpaceElevator.Build_SpaceElevator_C')
                {
                    contextMenu = Building_SpaceElevator.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/ResourceSink/Build_ResourceSink.Build_ResourceSink_C')
                {
                    contextMenu = Building_AwesomeSink.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipeHyperStart/Build_PipeHyperStart.Build_PipeHyperStart_C')
                {
                    contextMenu = Building_HyperTube.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }
                if(buildingData.category === 'production')
                {
                    contextMenu = Building_Production.addContextMenu(this.baseLayout, currentObject, contextMenu);
                }

                if(
                       (buildingData.category === 'storage' && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/CentralStorage/Build_CentralStorage.Build_CentralStorage_C')
                    || buildingData.category === 'vehicle'
                    || Building_Locomotive.isLocomotive(currentObject) || Building.isFreightWagon(currentObject)
                    || ['/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C',
                        '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'].includes(currentObject.className)
                )
                {
                    let inventoryType = 'solid';
                        if(Building_Locomotive.isLocomotive(currentObject))
                        {
                            inventoryType = 'multiple';
                        }
                        if(Building.isFreightWagon(currentObject))
                        {
                            let storage = this.baseLayout.getObjectProperty(currentObject, 'mStorageInventory');
                                if(storage !== null)
                                {
                                    let storageObject = this.baseLayout.saveGameParser.getTargetObject(storage.pathName);
                                        if(storageObject !== null)
                                        {
                                            let mAdjustedSizeDiff = this.baseLayout.getObjectProperty(storageObject, 'mAdjustedSizeDiff');
                                                if(mAdjustedSizeDiff !== null && mAdjustedSizeDiff === -31)
                                                {
                                                    inventoryType = 'liquid';
                                                }
                                        }

                                }
                        }

                        if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C', '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'].includes(currentObject.className))
                        {
                            inventoryType = 'liquid';
                        }

                        if(inventoryType === 'solid')
                        {
                            contextMenu.push({
                                icon    : 'fa-box',
                                text    : this.baseLayout.translate._('Edit inventory'),
                                callback: this.baseLayout.editPlayerStorageBuildingInventory
                            });
                        }

                        contextMenu.push({
                            icon    : ((inventoryType === 'liquid') ? 'fa-water-rise' : 'fa-box-full'),
                            text    : this.baseLayout.translate._('Fill inventory'),
                            callback: this.baseLayout.fillPlayerStorageBuildingInventoryModal
                        });
                        contextMenu.push({
                            icon    : ((inventoryType === 'liquid') ? 'fa-water-lower' : 'fa-box-open'),
                            text    : this.baseLayout.translate._('Clear inventory'),
                            callback: this.baseLayout.clearPlayerStorageBuildingInventory
                        });

                        if(inventoryType !== 'liquid')
                        {
                            contextMenu.push('-');
                        }
                }

                let currentObjectPipeNetwork = this.baseLayout.pipeNetworkSubSystem.getObjectPipeNetwork(currentObject);
                    if(currentObjectPipeNetwork !== null)
                    {
                        contextMenu.push({
                            icon        : 'fa-water',
                            text        : this.baseLayout.translate._('Update pipe network fluid'),
                            callback    : this.baseLayout.pipeNetworkSubSystem.updateFluid.bind(this.baseLayout.pipeNetworkSubSystem)
                        });
                        contextMenu.push('-');
                    }

                if(
                        buildingData.category === 'generator' || (buildingData.powerUsed !== undefined && buildingData.powerUsed > 0) || buildingData.category === 'powerPole'
                     || currentObject.className === '/Game/FactoryGame/Buildable/Factory/HadronCollider/Build_HadronCollider.Build_HadronCollider_C'
                )
                {
                    contextMenu.push({
                        icon        : 'fa-plug',
                        text        : 'Use input as wire source',
                        callback    : Building_PowerLine.storeNewWireSource,
                        className   : 'Building_PowerLine_storeNewWireSource'
                    });

                    if(Building_PowerLine.clipboard.source !== null)
                    {
                        contextMenu.push({
                            icon        : 'fa-plug',
                            text        : 'Use input as wire target',
                            callback    : Building_PowerLine.storeNewWireTarget,
                            className   : 'Building_PowerLine_storeNewWireTarget'
                        });
                    }

                    contextMenu.push('-');
                }

                if([
                    '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StorageIntegrated.Build_StorageIntegrated_C',
                    '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StorageBlueprint.Build_StorageBlueprint_C',
                    '/Game/FactoryGame/Buildable/Factory/TradingPost/Build_TradingPost.Build_TradingPost_C'
                ].includes(currentObject.className) === false)
                {
                    contextMenu.push({
                        icon        : 'fa-arrows-alt',
                        text        : this.baseLayout.translate._('Update position'),
                        callback    : Modal_Object_Position.getHTML
                    });

                    if(buildingData.category === 'frame' || buildingData.category === 'foundation' || buildingData.category === 'roof')
                    {
                        let isWorldGridAligned = this.baseLayout.worldGridSubSystem.isOnGrid(currentObject);
                            if(isWorldGridAligned === false)
                            {
                                contextMenu.push({
                                    icon        : 'fa-magnet',
                                    text        : this.baseLayout.translate._('Align to world grid'),
                                    callback    : this.baseLayout.worldGridSubSystem.snapToGrid
                                });
                            }
                    }
                }

                if(buildingData.mapUseSlotColor === undefined || buildingData.mapUseSlotColor !== false)
                {
                    contextMenu.push('-');

                    contextMenu.push({
                        icon        : 'fa-palette',
                        text        : this.baseLayout.translate._('Update color swatch'),
                        callback    : Modal_Object_ColorSlot.getHTML,
                        className   : 'Modal_Object_ColorSlot'
                    });

                    let slotIndex = this.baseLayout.buildableSubSystem.getObjectColorSlot(currentObject);
                        if(slotIndex === 255)
                        {
                            contextMenu.push({
                                icon        : 'fa-paint-brush',
                                text        : this.baseLayout.translate._('Update custom color'),
                                callback    : Modal_Object_CustomColor.getHTML,
                                className   : 'Modal_Object_CustomColor'
                            });
                        }
                }

                if(buildingData.category === 'foundation')
                {
                    contextMenu.push('-');
                    contextMenu.push({
                        icon        : 'fa-shapes',
                        text        : this.baseLayout.translate._('Update pattern'),
                        callback    : Modal_Object_Pattern.getHTML,
                        className   : 'Modal_Object_Pattern'
                    });

                    let PatternDesc = this.baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject, 'PatternDesc');
                        if(PatternDesc !== null)
                        {
                            contextMenu.push({
                                icon        : 'fa-shapes fa-spin',
                                text        : this.baseLayout.translate._('Rotate pattern by 90°'),
                                callback    : this.baseLayout.buildableSubSystem.rotateObjectPattern
                            });
                        }
                }

                if(buildingData.switchMaterial !== undefined || buildingData.switchSkin !== undefined)
                {
                    contextMenu.push('-');

                    if(buildingData.category === 'foundation' || (buildingData.category === 'frame' && buildingData.className !== '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_Frame_01.Build_Wall_Frame_01_C'))
                    {
                        if(buildingData.switchMaterial.Ficsit !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', ((buildingData.className.includes('Build_Stair')) ? 'FICSIT Stairs' : 'FICSIT Foundation')),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['foundation', 'Ficsit'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Concrete !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', ((buildingData.className.includes('Build_Stair')) ? 'Concrete Stairs' : 'Concrete Foundation')),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['foundation', 'Concrete'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.GripMetal !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', ((buildingData.className.includes('Build_Stair')) ? 'Grip Metal Stairs' : 'Grip Metal Foundation')),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['foundation', 'GripMetal'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.ConcretePolished !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', ((buildingData.className.includes('Build_Stair')) ? 'Coated Concrete Stairs' : 'Coated Concrete Foundation')),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['foundation', 'ConcretePolished'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Asphalt !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', ((buildingData.className.includes('Build_Stair')) ? 'Asphalt Stairs' : 'Asphalt Foundation')),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['foundation', 'Asphalt'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Frame !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Frame Foundation'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['foundation', 'Frame'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                    }

                    if(buildingData.category === 'wall' || (buildingData.category === 'frame' && buildingData.className === '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_Frame_01.Build_Wall_Frame_01_C'))
                    {
                        if(buildingData.switchMaterial.Ficsit !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'FICSIT Wall'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['wall', 'Ficsit'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Concrete !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Concrete Wall'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['wall', 'Concrete'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Steel !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Steel Wall'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['wall', 'Steel'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Frame !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Frame Wall'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['wall', 'Frame'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                    }

                    if(buildingData.category === 'roof')
                    {
                        if(buildingData.switchMaterial.Ficsit !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'FICSIT Roof'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['roof', 'Ficsit'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Tar !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Tar Roof'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['roof', 'Tar'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Metal !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Metal Roof'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['roof', 'Metal'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Glass !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Glass Roof'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['roof', 'Glass'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                    }

                    if(buildingData.category === 'pillar')
                    {
                        if(buildingData.switchMaterial.Metal !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Metal Pillar'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['pillar', 'Metal'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Concrete !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Concrete Pillar'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['pillar', 'Concrete'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.Frame !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Frame Pillar'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['pillar', 'Frame'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                    }

                    if(buildingData.category === 'walkway')
                    {
                        if(buildingData.switchMaterial.Catwalk !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Catwalk'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['walkway', 'Catwalk'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                    }

                    if(buildingData.category === 'catwalk')
                    {
                        if(buildingData.switchMaterial.Walkway !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Walkway'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['catwalk', 'Walkway'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                    }

                    if(buildingData.switchMaterial !== undefined && buildingData.category === 'pipe')
                    {
                        if(buildingData.switchMaterial.Ficsit !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Pipeline (Indicator)'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['pipe', 'Ficsit'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                        if(buildingData.switchMaterial.NoIndicator !== undefined)
                        {
                            contextMenu.push({
                                icon        : 'fa-magic',
                                text        : this.baseLayout.translate._('Switch to "%1$s"', 'Pipeline (No Indicator)'),
                                callback    : this.baseLayout.buildableSubSystem.switchObjectMaterial,
                                argument    : ['pipe', 'NoIndicator'],
                                className   : 'buildableSubSystem_switchObjectMaterial'
                            });
                        }
                    }

                    if(buildingData.switchSkin !== undefined)
                    {
                        let SkinDesc  = this.baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject, 'SkinDesc');
                            if(SkinDesc !== null)
                            {
                                contextMenu.push({
                                    icon        : 'fa-magic',
                                    text        : this.baseLayout.translate._('Switch to "%1$s" skin', 'Default'),
                                    callback    : this.baseLayout.buildableSubSystem.switchObjectSkin,
                                    argument    : 'Default',
                                    className   : 'buildableSubSystem_switchObjectSkin'
                                });
                            }
                            else
                            {
                                if(buildingData.switchSkin.Ficsmas !== undefined)
                                {
                                    contextMenu.push({
                                        icon        : 'fa-magic',
                                        text        : this.baseLayout.translate._('Switch to "%1$s" skin', 'FICS*MAS'),
                                        callback    : this.baseLayout.buildableSubSystem.switchObjectSkin,
                                        argument    : 'Ficsmas',
                                        className   : 'buildableSubSystem_switchObjectSkin'
                                    });
                                }
                            }
                    }
                }


                if([
                    '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StorageIntegrated.Build_StorageIntegrated_C',
                    '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StorageBlueprint.Build_StorageBlueprint_C',
                    '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C',
                    '/Game/FactoryGame/Buildable/Factory/TradingPost/Build_TradingPost.Build_TradingPost_C'
                ].includes(currentObject.className) === false)
                {
                    contextMenu.push('-');
                    contextMenu.push({
                        icon        : 'fa-trash-alt',
                        text        : this.baseLayout.translate._('Delete building'),
                        callback    : this.baseLayout.deleteGenericBuilding
                    });
                }
            }
        }

        if(contextMenu.length > 0)
        {
            contextMenu.push('-');
        }
        contextMenu.push({
            icon        : 'fa-terminal',
            text        : this.baseLayout.translate._('Advanced Debug'),
            callback    : Modal_Debug.getHTML
        });

        return contextMenu;
    }
}

L.Map.mergeOptions({contextmenuItems: []});

L.Map.ContextMenu = L.Handler.extend({
    _touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',

    statics: { BASE_CLS: 'leaflet-contextmenu' },

    initialize: function(map)
    {
        L.Handler.prototype.initialize.call(this, map);

        this._items                     = [];
        this._visible                   = false;

        let container                   = this._container = L.DomUtil.create('div', L.Map.ContextMenu.BASE_CLS, map._container);
            container.style.zIndex      = 10000;
            container.style.position    = 'absolute';

        if(map.options.contextmenuWidth)
        {
            container.style.width = map.options.contextmenuWidth + 'px';
        }

        L.DomEvent
            .on(container, 'click', L.DomEvent.stop)
            .on(container, 'mousedown', L.DomEvent.stop)
            .on(container, 'dblclick', L.DomEvent.stop)
            .on(container, 'contextmenu', L.DomEvent.stop);
    },

    insertItem: function (options, baseLayout)
    {
        let item = this._createItem(this._container, options, baseLayout);
            this._items.push(item);

        return item.element;
    },

    _createItem: function(container, options, baseLayout)
    {
        if(options === '-')
        {
            let separator = this._insertElement('div', L.Map.ContextMenu.BASE_CLS + '-separator', container);
                return {id: L.Util.stamp(separator), element: separator};
        }
        if(options.callback === undefined)
        {
            let title           = this._insertElement('h6', L.Map.ContextMenu.BASE_CLS + '-title', container);
                title.innerHTML = options.text;

                if(options.icon)
                {
                    title.innerHTML = '<img src="' + options.icon + '" style="width: 24px;" class="mr-2">' + title.innerHTML;
                }

                return {id: L.Util.stamp(title), element: title};
        }

        let element             = this._insertElement('a', L.Map.ContextMenu.BASE_CLS + '-item', container);
        let callback            = this._createCallback(options.callback, options.context, baseLayout, options.argument);

            element.innerHTML   = '<i class="fas ' + ((options.icon) ? options.icon : '') + ' fa-fw mr-2"></i>' + options.text;
            element.href        = '#';

        L.DomEvent
            .on(element, 'mouseover', this._onItemMouseOver, this)
            .on(element, 'mouseout', this._onItemMouseOut, this)
            .on(element, 'mousedown', L.DomEvent.stopPropagation)
            .on(element, 'click', callback);

        if(L.Browser.touch)
        {
            L.DomEvent.on(element, this._touchstart, L.DomEvent.stopPropagation);
        }

        // Devices without a mouse fire "mouseover" on tap, but never “mouseout"
        if(!L.Browser.pointer)
        {
            L.DomEvent.on(element, 'click', this._onItemMouseOut, this);
        }

        return {
            id: L.Util.stamp(element),
            element: element,
            callback: callback
        };
    },

    _createCallback: function(callback, context, baseLayout, argument)
    {
        return () => {
            let data                = {};
                data.containerPoint = this._showLocation.containerPoint;
                data.layerPoint     = this._map.containerPointToLayerPoint(data.containerPoint);
                data.latlng         = this._map.layerPointToLatLng(data.layerPoint);
                data.relatedTarget  = this._showLocation.relatedTarget;
                data.baseLayout     = baseLayout;

            this._hide();

            if(callback)
            {
                callback.call(context || this._map, data, argument);
            }
        };
    },

    _insertElement: function(tagName, className, container)
    {
        let element              = document.createElement(tagName);
            element.className    = className;

        container.appendChild(element);

        return element;
    },

    showAtPoint: function(pt, data)
    {
        if(pt instanceof L.LatLng)
        {
            pt = this._map.latLngToContainerPoint(pt);
        }

        if(this._items.length > 0)
        {
            this._showLocation = {containerPoint: pt};

            if(data && data.relatedTarget)
            {
                this._showLocation.relatedTarget = data.relatedTarget;
            }

            this._setPosition(pt);

            if(!this._visible)
            {
                this._container.style.display = 'block';
                this._visible = true;
                this._map.on('mousedown zoomstart movestart', this._hide, this);
            }
        }
        L.DomEvent.stopPropagation(data);
    },

    _hide: function()
    {
        if(this._visible)
        {
            this._visible                   = false;
            this._container.style.display   = 'none';

            for(let i = 0; i < this._items.length; i++)
            {
                let element = this._items[i].element;
                    if(this._items[i].callback)
                    {
                        L.DomEvent
                            .off(element, 'mouseover', this._onItemMouseOver, this)
                            .off(element, 'mouseover', this._onItemMouseOut, this)
                            .off(element, 'mousedown', L.DomEvent.stopPropagation)
                            .off(element, 'click', this._items[i].callback);

                        if(L.Browser.touch)
                        {
                            L.DomEvent.off(element, this._touchstart, L.DomEvent.stopPropagation);
                        }

                        if(!L.Browser.pointer)
                        {
                            L.DomEvent.on(element, 'click', this._onItemMouseOut, this);
                        }
                    }

                this._container.removeChild(element);
            }

            this._items = [];

            this._map.off('mousedown zoomstart movestart', this._hide, this);
        }
    },

    _setPosition: function(pt)
    {
        let mapSize         = this._map.getSize();
        let containerSize   = this._getElementSize(this._container);

        this._container._leaflet_pos = pt;

        if(pt.x + containerSize.x > mapSize.x)
        {
            this._container.style.left      = 'auto';
            this._container.style.right     = Math.min(Math.max(mapSize.x - pt.x, 0), mapSize.x - containerSize.x - 1) + 'px';
        }
        else
        {
            this._container.style.left      = Math.max(pt.x, 0) + 'px';
            this._container.style.right     = 'auto';
        }

        if(pt.y + containerSize.y > mapSize.y)
        {
            this._container.style.top       = 'auto';
            this._container.style.bottom    = Math.min(Math.max(mapSize.y - pt.y, 0), mapSize.y - containerSize.y - 1) + 'px';
        }
        else
        {
            this._container.style.top       = Math.max(pt.y, 0) + 'px';
            this._container.style.bottom    = 'auto';
        }
    },

    _getElementSize: function(element)
    {
        let initialDisplay  = element.style.display;
        let size            = {};

            element.style.left = '-999999px';
            element.style.right = 'auto';
            element.style.display = 'block';

            size.x = element.offsetWidth;
            size.y = element.offsetHeight;

            element.style.left = 'auto';
            element.style.display = initialDisplay;

        return size;
    },

    _onItemMouseOver: function(e)
    {
        L.DomUtil.addClass(e.target || e.srcElement, 'over');
    },

    _onItemMouseOut: function(e)
    {
        L.DomUtil.removeClass(e.target || e.srcElement, 'over');
    }
});

L.Mixin.ContextMenu = {
    bindContextMenu: function(baseLayout)
    {
        this.baseLayout = baseLayout;
        this._items     = [];
        this.on('contextmenu', this._showContextMenu, this);

        return this;
    },

    _showContextMenu: function(e)
    {
        if(this.baseLayout !== undefined)
        {
            let currentMarkerOptions = this.baseLayout.getContextMenu(this);
                if(currentMarkerOptions !== false && currentMarkerOptions.length > 0)
                {
                    for(let i = 0; i < currentMarkerOptions.length; i++)
                    {
                        this._items.push(this._map.contextmenu.insertItem(
                            currentMarkerOptions[i],
                            this.baseLayout
                        ));
                    }

                    this._map.contextmenu.showAtPoint(
                        this._map.mouseEventToContainerPoint(e.originalEvent),
                        L.extend({relatedTarget: this}, e)
                    );
                }
        }
    }
};

L.Map.addInitHook('addHandler', 'contextmenu', L.Map.ContextMenu);
L.Path.include(L.Mixin.ContextMenu);