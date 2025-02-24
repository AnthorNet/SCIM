/* global L, Promise, Intl, Sentry, parseFloat */
import SaveParser_FicsIt                        from './SaveParser/FicsIt.js';

import BaseLayout_ContextMenu                   from './BaseLayout/ContextMenu.js';
import BaseLayout_History                       from './BaseLayout/History.js';
import BaseLayout_Math                          from './BaseLayout/Math.js';
import BaseLayout_Modal                         from './BaseLayout/Modal.js';
import BaseLayout_Polygon                       from './BaseLayout/Polygon.js';
import BaseLayout_Tooltip                       from './BaseLayout/Tooltip.js';

import SubSystem_Buildable                      from './SubSystem/Buildable.js';
import SubSystem_Blueprint                      from './SubSystem/Blueprint.js';
import SubSystem_CentralStorage                 from './SubSystem/CentralStorage.js';
import SubSystem_Circuit                        from './SubSystem/Circuit.js';
import SubSystem_Collectables                   from './SubSystem/Collectables.js';
import SubSystem_ConveyorChainActor             from './SubSystem/ConveyorChainActor.js';
import SubSystem_Fauna                          from './SubSystem/Fauna.js';
import SubSystem_Foliage                        from './SubSystem/Foliage.js';
import SubSystem_GameRules                      from './SubSystem/GameRules.js';
import SubSystem_GameState                      from './SubSystem/GameState.js';
import SubSystem_Map                            from './SubSystem/Map.js';
import SubSystem_Overclocking                   from './SubSystem/Overclocking.js';
import SubSystem_PipeNetwork                    from './SubSystem/PipeNetwork.js';
import SubSystem_Player                         from './SubSystem/Player.js';
import SubSystem_Portal                         from './SubSystem/Portal.js';
import SubSystem_Railroad                       from './SubSystem/Railroad.js';
import SubSystem_Schematic                      from './SubSystem/Schematic.js';
import SubSystem_Statistics                     from './SubSystem/Statistics.js';
import SubSystem_Time                           from './SubSystem/Time.js';
import SubSystem_Unlock                         from './SubSystem/Unlock.js';
import SubSystem_Vehicle                        from './SubSystem/Vehicle.js';
import SubSystem_WorldGrid                      from './SubSystem/WorldGrid.js';

import Modal_Map_Collectables                   from './Modal/Map/Collectables.js';
import Modal_Map_GameRules                      from './Modal/Map/GameRules.js';
import Modal_Map_Hotbars                        from './Modal/Map/Hotbars.js';
import Modal_Map_Players                        from './Modal/Map/Players.js';
import Modal_Map_Todo                           from './Modal/Map/Todo.js';
import Modal_Map_Options                        from './Modal/Map/Options.js';

import Modal_Statistics_Game                    from './Modal/Statistics/Game.js';
import Modal_Statistics_Production              from './Modal/Statistics/Production.js';
import Modal_Statistics_Storage                 from './Modal/Statistics/Storage.js';

import Modal_Buildings                          from './Modal/Buildings.js';
import Modal_ColorSlots                         from './Modal/ColorSlots.js';
import Modal_LightColorSlots                    from './Modal/LightColorSlots.js';
import Modal_Power_Circuits                     from './Modal/Power/Circuits.js';
import Modal_Schematics                         from './Modal/Schematics.js';
import Modal_Selection                          from './Modal/Selection.js';
import Modal_Trains                             from './Modal/Trains.js';

import Building                                 from './Building.js';
import Building_Beacon                          from './Building/Beacon.js';
import Building_Conveyor                        from './Building/Conveyor.js';
import Building_FrackingExtractor               from './Building/FrackingExtractor.js';
import Building_FrackingSmasher                 from './Building/FrackingSmasher.js';
import Building_HyperTube                       from './Building/HyperTube.js';
import Building_Locomotive                      from './Building/Locomotive.js';
import Building_MapMarker                       from './Building/MapMarker.js';
import Building_Pipeline                        from './Building/Pipeline.js';
import Building_Light                           from './Building/Light.js';
import Building_Portal                          from './Building/Portal.js';
import Building_PowerLine                       from './Building/PowerLine.js';
import Building_RadarTower                      from './Building/RadarTower.js';
import Building_RailroadSwitchControl           from './Building/RailroadSwitchControl.js';
import Building_RailroadTrack                   from './Building/RailroadTrack.js';
import Building_ResourceDeposit                 from './Building/ResourceDeposit.js';
import Building_Sign                            from './Building/Sign.js';
import Building_Vehicle                         from './Building/Vehicle.js';

import Building_DigitalStorage_NetworkCable     from './Building/DigitalStorage/NetworkCable.js';

import Lib_MapMarker                            from './Lib/L.MapMarker.js';

export default class BaseLayout
{
    constructor(options)
    {
        this.useDebug                           = (options.debug !== undefined) ? options.debug : false;
        this.useBuild                           = (options.build !== undefined) ? options.build : 'EarlyAccess';
        this.scriptVersion                      = (options.version !== undefined) ? options.version : Math.floor(Math.random() * Math.floor(9999999999));
        this.staticUrl                          = options.staticUrl;
        this.statisticsUrl                      = options.statisticsUrl;
        this.tetrominoUrl                       = options.tetrominoUrl;
        this.usersUrl                           = options.usersUrl;

        this.satisfactoryMap                    = options.satisfactoryMap;
        this.saveGameParser                     = options.saveGameParser;

        this.saveGameRailVehicles               = [];
        this.frackingSmasherCores               = {};

        this.gameMode                           = [];
        this.players                            = {};
        this.buildingDataClassNameHashTable     = {};
        this.radioactivityLayerNeedsUpdate      = false;

        this.updateAltitudeLayersIsRunning      = false;
        this.altitudeSliderControl              = null;
        this.selectionControl                   = null;
        this.clipboard                          = null;
        this.clipboardControl                   = null;
        this.history                            = null;

        this.dataUrl                            = options.dataUrl;
        this.buildingsData                      = null;
        this.buildingsCategories                = {};
        this.itemsData                          = null;
        this.itemsCategories                    = {};
        this.toolsData                          = null;
        this.toolsCategories                    = {};
        this.recipesData                        = null;
        this.schematicsData                     = null;

        this.modsData                           = null;
        this.modsUrl                            = options.modsUrl;

        this.language                           = options.language;
        this.translate                          = options.translate;

        this.collectedHardDrives                = new HardDrives({language: options.language});
        this.localStorage                       = this.collectedHardDrives.getLocaleStorage();

        this.showPlayersOnLoad                  = (this.localStorage !== null && this.localStorage.getItem('mapShowPlayersOnLoad') !== null) ? (this.localStorage.getItem('mapShowPlayersOnLoad') === 'true') : true;
        this.showStructuresOnLoad               = (this.localStorage !== null && this.localStorage.getItem('mapShowStructuresOnLoad') !== null) ? (this.localStorage.getItem('mapShowStructuresOnLoad') === 'true') : true;
        this.showBuildingsOnLoad                = (this.localStorage !== null && this.localStorage.getItem('mapShowBuildingsOnLoad') !== null) ? (this.localStorage.getItem('mapShowBuildingsOnLoad') === 'true') : true;
        this.showGeneratorsOnLoad               = (this.localStorage !== null && this.localStorage.getItem('mapShowGeneratorsOnLoad') !== null) ? (this.localStorage.getItem('mapShowGeneratorsOnLoad') === 'true') : true;
        this.showTransportationOnLoad           = (this.localStorage !== null && this.localStorage.getItem('mapShowTransportationOnLoad') !== null) ? (this.localStorage.getItem('mapShowTransportationOnLoad') === 'true') : true;
        this.showNodesOnMiners                  = (this.localStorage !== null && this.localStorage.getItem('mapShowNodesOnMiners') !== null) ? (this.localStorage.getItem('mapShowNodesOnMiners') === 'true') : false;
        this.showCollected                      = (this.localStorage !== null && this.localStorage.getItem('mapShowCollected') !== null) ? (this.localStorage.getItem('mapShowCollected') === 'true') : true;
        this.showCircuitsColors                 = (this.localStorage !== null && this.localStorage.getItem('mapShowCircuitsColors') !== null) ? (this.localStorage.getItem('mapShowCircuitsColors') === 'true') : true;

        this.showPatterns                       = (this.localStorage !== null && this.localStorage.getItem('mapShowPatterns') !== null) ? (this.localStorage.getItem('mapShowPatterns') === 'true') : true;
        this.showVehicleExtraMarker             = (this.localStorage !== null && this.localStorage.getItem('mapShowVehicleExtraMarker') !== null) ? (this.localStorage.getItem('mapShowVehicleExtraMarker') === 'true') : false;

        this.useRadioactivity                   = (this.localStorage !== null && this.localStorage.getItem('mapUseRadioactivity') !== null) ? (this.localStorage.getItem('mapUseRadioactivity') === 'true') : true;
        this.useFogOfWar                        = (this.localStorage !== null && this.localStorage.getItem('mapUseFogOfWar') !== null) ? (this.localStorage.getItem('mapUseFogOfWar') === 'true') : true;
        this.showInternalCoordinates            = (this.localStorage !== null && this.localStorage.getItem('mapInternalCoordinates') !== null) ? (this.localStorage.getItem('mapInternalCoordinates') === 'true') : true;
        this.useGlobalStats                     = (this.localStorage !== null && this.localStorage.getItem('mapUseGlobalStats') !== null) ? (this.localStorage.getItem('mapUseGlobalStats') === 'true') : true;
        this.mapStructuresModelsQuality         = (this.localStorage !== null && this.localStorage.getItem('mapStructuresModelsQuality') !== null) ? this.localStorage.getItem('mapStructuresModelsQuality') : 'medium';
        this.mapModelsQuality                   = (this.localStorage !== null && this.localStorage.getItem('mapModelsQuality') !== null) ? this.localStorage.getItem('mapModelsQuality') : 'high';

        this.detailedModels                     = {};

        this.playerLayersNotUsingAltitude       = ['playerRadioactivityLayer', 'playerLightsHaloLayer', 'playerPositionLayer', 'playerFogOfWar', 'playerResourceDepositsLayer', 'playerItemsPickupLayer'];

        this.setDefaultLayers();
    }

    setDefaultLayers()
    {
        this.delayedBadgeCount                  = null;
        this.playerLayers                       = {
            playerRadioactivityLayer                : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: {}},
            playerLightsHaloLayer                   : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: []},

            playerFoundationsLayer                  : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerRoofsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerLightsLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerPillarsLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerBeamsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerWallsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerWalkwaysLayer                     : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerSignsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: [], filters: []},
            playerStatuesLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerStructuresLayer', elements: []},

            playerHUBTerminalLayer                  : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: []},
            playerFicsmasLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: []},
            playerUnknownLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: []},
            playerOrientationLayer                  : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: [], count: 0},

            playerCratesLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerInformationLayer', elements: [], count: 0},
            playerMinersLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], filters: []},
            playerProductorsLayer                   : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], filters: []},
            playerPortalsLayer                      : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], filters: []},
            playerPadsLayer                         : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], filters: []},

            playerBiomassGeneratorsLayer            : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},
            playerCoalGeneratorsLayer               : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},
            playerFuelGeneratorsLayer               : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},
            playerNuclearGeneratorsLayer            : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},
            playerGeoThermalGeneratorsLayer         : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},
            playerStorageGeneratorsLayer            : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: []},

            playerStoragesLayer                     : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], filters: []},

            playerVehiculesLayer                    : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], count: 0, filters: []},
            playerDronesLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], count: 0/*, filters: []*/},
            playerBeltsLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], distance: 0, filters: []},
            playerPipesLayer                        : {layerGroup: null, subLayer: null, mainDivId: '#playerBuildingLayer', elements: [], distance: 0, filters: []},
            playerPipesHyperLayer                   : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], distance: 0, filters: []},

            playerTracksLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: [], distance: 0, filters: []},
            playerTrainsLayer                       : {layerGroup: null, subLayer: null, mainDivId: '#playerTransportationLayer', elements: []},

            playerPowerGridLayer                    : {layerGroup: null, subLayer: null, mainDivId: '#playerGeneratorsLayer', elements: [], count: 0, distance: 0, filters: []},

            // Last...
            playerResourceDepositsLayer             : {layerGroup: null, subLayer: null, elements: [], filters: []},
            playerItemsPickupLayer                  : {layerGroup: null, subLayer: null, elements: []},
            playerPositionLayer                     : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer'},
            playerSpaceRabbitLayer                  : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer', count: 0},
            playerFaunaLayer                        : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer', filters: []},
            playerFogOfWar                          : {layerGroup: null, subLayer: null, elements: [], mainDivId: '#playerInformationLayer'}
        };

        // Reset mods layer...
        for(let modId in this.modsData)
        {
            if(this.modsData[modId].isLoaded !== undefined && this.modsData[modId].isLoaded === true)
            {
                let layerId = 'playerMods' + modId + 'Layer';
                    this.setupModSubLayer(modId, layerId);
            }
        }

        this.playerStatistics = {
            collectables : {
                '/Game/FactoryGame/World/Benefit/NutBush/BP_NutBush.BP_NutBush_C': {items: [], layerId: 'berylNut', needDiscovery: true},
                '/Game/FactoryGame/World/Benefit/BerryBush/BP_BerryBush.BP_BerryBush_C': {items: [], layerId: 'paleBerry', needDiscovery: true},
                '/Game/FactoryGame/World/Benefit/Mushroom/BP_Shroom_01.BP_Shroom_01_C': {items: [], layerId: 'baconAgaric', needDiscovery: true},

                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal.BP_Crystal_C': {items: [], layerId: 'greenSlugs', needDiscovery: true},
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk2.BP_Crystal_mk2_C': {items: [], layerId: 'yellowSlugs', needDiscovery: true},
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk3.BP_Crystal_mk3_C': {items: [], layerId: 'purpleSlugs', needDiscovery: true},

                '/Game/FactoryGame/Prototype/WAT/BP_WAT1.BP_WAT1_C': {items: [], layerId: 'somersloops', needDiscovery: true},
                '/Game/FactoryGame/Prototype/WAT/BP_WAT2.BP_WAT2_C': {items: [], layerId: 'mercerSpheres', needDiscovery: true},

                '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C': {items: [], layerId: 'hardDrives', needDiscovery: true},

                '/Game/FactoryGame/Character/Creature/Enemy/CrabHatcher/Char_CrabHatcher.Char_CrabHatcher_C': {items: [], layerId: 'playerFaunaLayer'}
            }
        };

        $('.setBaseLayer').show();
    }

    reset()
    {
        console.time('resetBaseLayout');

        $('#downloadSaveGame').off('click');
        $('.updateTitleLayerState').off('click');
        $('.updatePlayerLayerState').off('click');
        $('.updatePlayerLayerFilter').off('click');
        $('#playerModsLayer .col-12').empty();
        $('#statisticsModal').off('show.bs.modal');
        $('#statisticsModal').off('hide.bs.modal');
        $('#statisticsModal a[data-toggle="tab"]').off('shown.bs.tab');
        $('#researchModal').off('show.bs.modal');
        $('#optionsModal').off('show.bs.modal');
        $('#buildingsModal').off('show.bs.modal');
        $('#colorSlotsModal').off('click');
        $('#lightSlotsModal').off('click');
        $('#modalPowerCircuitsBreakPriority').off('click').hide();
        $('#modalCentralStorage').off('click').hide();
        $('#modalPowerCircuits').off('click');

        for(let pathName in this.satisfactoryMap.collectableMarkers)
        {
            if(['sporeFlowers', 'smallRocks', 'largeRocks'].includes(this.satisfactoryMap.collectableMarkers[pathName].options.layerId))
            {
                if(this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[pathName].options.layerId].hasLayer(this.satisfactoryMap.collectableMarkers[pathName]) === false)
                {
                    this.satisfactoryMap.collectableMarkers[pathName].addTo(
                        this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[pathName].options.layerId]
                    );
                }
            }
            else
            {
                if(this.satisfactoryMap.collectableMarkers[pathName] instanceof L.Circle === false)
                {
                    this.satisfactoryMap.collectableMarkers[pathName].setOpacity(1);
                }

                // RESET NODES
                if(this.satisfactoryMap.collectableMarkers[pathName].options.purity !== undefined)
                {
                    if(this.showNodesOnMiners === false)
                    {
                        if(this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[pathName].options.layerId].hasLayer(this.satisfactoryMap.collectableMarkers[pathName]) === false)
                        {
                            this.satisfactoryMap.collectableMarkers[pathName].addTo(
                                this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[pathName].options.layerId]
                            );
                        }
                    }
                    else
                    {
                        this.satisfactoryMap.collectableMarkers[pathName].setOpacity(1);
                    }
                }
            }

            delete this.satisfactoryMap.collectableMarkers[pathName].options.extractorPathName;
        }
        $('.updateLayerState[data-collected]').each((i, el) => {
            let total = $(el).attr('data-total');
                $(el).attr('data-collected', 0);
                $(el).find('.badge').html(new Intl.NumberFormat(this.language).format(total));
        });

        for(let layerId in this.playerLayers)
        {
            $('.updatePlayerLayerState[data-id=' + layerId + ']').removeClass(window.SCIM.outlineClass).hide();
            $(this.playerLayers[layerId].mainDivId).hide();
            $('.updatePlayerLayerState[data-id=' + layerId + '] .badge-layer').empty();

            if(this.playerLayers[layerId].subLayer !== null)
            {
                this.playerLayers[layerId].layerGroup.removeLayer(this.playerLayers[layerId].subLayer);
                this.playerLayers[layerId].subLayer = null;
                this.satisfactoryMap.leafletMap.removeLayer(this.playerLayers[layerId].layerGroup);
            }
            if(this.playerLayers[layerId].filters !== undefined)
            {
                this.playerLayers[layerId].filters      = [];
                this.playerLayers[layerId].filtersCount = {};

                $('.updatePlayerLayerFilter[data-id=' + layerId + ']').hide().addClass('btn-warning');
            }
        }

        this.satisfactoryMap.leafletMap.removeControl(this.altitudeSliderControl);
        this.altitudeSliderControl  = null;

        this.satisfactoryMap.leafletMap.removeControl(this.selectionControl);
        this.selectionControl       = null;

        this.satisfactoryMap.leafletMap.removeControl(this.clipboardControl);
        this.clipboardControl       = null;

        if(this.history !== null)
        {
            this.history.removeControl();
            this.history = null;
        }


        $('#saveGameInformation').empty();

        $('#statisticsModalProduction').empty();
        $('#statisticsModalStorage').empty();

        $('#statisticsModalSchematics').empty();
        $('#statisticsModalAlternateRecipes').empty();
        $('#statisticsModalMAM').empty();
        $('#statisticsModalAwesomeSink').empty();
        $('#statisticsModalSpecial').empty();

        $('#statisticsPlayerInventory').empty();
        $('#statisticsPlayerHotBars').empty();
        $('#statisticsModalCollectables').empty();
        $('#statisticsModalOptions').empty();

        $('#buildingsModalExtraction').empty();
        $('#buildingsModalProduction').empty();
        $('#buildingsModalGenerators').empty();
        $('#buildingsModalStorage').empty();
        $('#buildingsModalDockstation').empty();

        $('#statisticsModalTrains').empty();

        $('#genericModal .modal-title').empty();
        $('#genericModal .modal-body').empty();

        $('#buildingsButton').hide();
        $('#trainsButton').hide();
        $('#statisticsButton').hide();
        $('#researchButton').hide();
        $('#optionsButton').hide();
        $('#altitudeSliderInputs').hide();
        $('#mods_resource_nodes').hide();

        this.detailedModels = {};

        console.timeEnd('resetBaseLayout');
    }

    draw()
    {
        this.collectedHardDrives.resetCollected();

        this.saveGameParser.load(() => {
            // Hold sub system to get better performance (Needed to parse objects)
            this.buildableSubSystem     = new SubSystem_Buildable({baseLayout: this});
            this.blueprintSubSystem     = new SubSystem_Blueprint({baseLayout: this});
            this.circuitSubSystem       = new SubSystem_Circuit({baseLayout: this});
            this.gameStateSubSystem     = new SubSystem_GameState({baseLayout: this});
            this.pipeNetworkSubSystem   = new SubSystem_PipeNetwork({baseLayout: this});
            this.portalSubSystem        = new SubSystem_Portal({baseLayout: this});
            this.railroadSubSystem      = new SubSystem_Railroad({baseLayout: this});
            this.timeSubSystem          = new SubSystem_Time({baseLayout: this});
            this.vehicleSubSystem       = new SubSystem_Vehicle({baseLayout: this});

            if(this.buildingsData === null)
            {
                return new Promise((resolve) => {
                    $('#loaderProgressBar .progress-bar').css('width', '60%');
                    $('.loader h6').html(this.translate._('Loading game data...'));
                    window.requestAnimationFrame(resolve);
                }).then(() => {
                    $.getJSON(this.dataUrl + '?v=' + this.scriptVersion, (data) => {
                        this.buildingsData          = data.buildingsData;
                        this.buildingsCategories    = data.buildingsCategories;
                        this.itemsData              = data.itemsData;
                        this.itemsCategories        = data.itemsCategories;
                        this.toolsData              = data.toolsData;
                        this.toolsCategories        = data.toolsCategories;

                        this.faunaSubsystem         = new SubSystem_Fauna({
                            baseLayout  : this,
                            data        : data.faunaData,
                            categories  : data.faunaCategories
                        });

                        this.recipesData            = data.recipesData;
                        this.schematicsData         = data.schematicsData;
                        this.modsData               = data.modsData;

                        this.loadDetailedModels();
                    });
                });
            }
            else
            {
                this.loadDetailedModels();
            }
        });
    }

    loadDetailedModels()
    {
        return new Promise((resolve) => {
            $('.loader h6').html(this.translate._('Loading detailed models...'));
            window.requestAnimationFrame(resolve);
        }).then(() => {
            $.getJSON(this.staticUrl + '/js/InteractiveMap/build/detailedModels.json?v=' + this.scriptVersion, (data) => {
                for(let className in data)
                {
                    this.detailedModels[className] = data[className];

                    // Special case
                    if(className === '/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C')
                    {
                        this.detailedModels['/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C']         = JSON.parse(JSON.stringify(data[className]));
                        this.detailedModels['/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].scale   = 2.3;
                    }
                }

                // Preload mods
                if(this.saveGameParser.header.modMetadata !== undefined && this.saveGameParser.header.modMetadata !== '' && this.saveGameParser.header.modMetadata !== 'INVALID_METADATA')
                {
                    this.preloadMods();
                }
                else
                {
                    this.renderObjects();
                }
            });
        });
    }

    preloadMods()
    {
        let promises        = [];
        let availableMods   = {};
            try
            {
                availableMods = JSON.parse(this.saveGameParser.header.modMetadata);
            }
            catch(e){}

            if(availableMods.Mods !== undefined && availableMods.Mods.length > 0)
            {
                for(let i = 0; i < availableMods.Mods.length; i++)
                {
                    if(this.modsData[availableMods.Mods[i].Reference] !== undefined)
                    {
                        promises.push(new Promise((resolve) => { this.loadMod(availableMods.Mods[i].Reference, resolve); }));
                    }
                }
            }

        return Promise.all(promises).then(() => {
            window.requestAnimationFrame(() => { this.renderObjects(); });
        });
    }

    loadMod(modId, resolve)
    {
        if(modId === 'KLib'){ modId = 'SatisfactoryPlus'; }

        // Check if the modId exists...
        if(this.modsData[modId] !== undefined)
        {
            if(this.modsData[modId].loading === undefined)
            {
                this.modsData[modId].loading = true;
                console.time('Loading mod: ' + this.modsData[modId].name);

                $.getJSON(this.modsUrl + '/id/' + modId, (data) => {
                    if(data.Buildings !== undefined)
                    {
                        let layerId = 'playerMods' + modId + 'Layer';
                            this.setupModSubLayer(modId, layerId);

                        for(let building in data.Buildings)
                        {
                            this.buildingsData[building]            = data.Buildings[building];
                            this.buildingsData[building].mapLayer   = layerId;

                            if(this.buildingsData[building].detailedModel !== undefined)
                            {
                                if(this.detailedModels[this.buildingsData[building].className] === undefined)
                                {
                                    this.detailedModels[this.buildingsData[building].className] = JSON.parse(this.buildingsData[building].detailedModel);
                                }

                                delete this.buildingsData[building].detailedModel;
                            }

                            // Add radial button
                            let htmlButton = '<button class="btn btn-warning updatePlayerLayerFilter m-1 p-1" style="display: none;" data-id="' + layerId + '" data-filter="' + this.buildingsData[building].className + '" data-hover="tooltip" title="' + this.buildingsData[building].name + '">\
                                                  <span class="badge badge-secondary badge-layer"></span><img src="' + this.buildingsData[building].image + '" style="width: 40px;" />\
                                              </button>';
                            $('#playerModsLayer .updatePlayerLayerState[data-id="' + layerId + '"] .radial div').append(htmlButton);
                        }
                    }
                    if(data.Items !== undefined)
                    {
                        for(let item in data.Items)
                        {
                            this.itemsData[item] = data.Items[item];
                        }
                    }
                    if(data.Tools !== undefined)
                    {
                        for(let tool in data.Tools)
                        {
                            this.toolsData[tool] = data.Tools[tool];
                        }
                    }
                    if(data.Recipes !== undefined)
                    {
                        for(let recipe in data.Recipes)
                        {
                            if(this.recipesData[recipe] !== undefined && this.recipesData[recipe].className !== data.Recipes[recipe].className)
                            {
                                this.recipesData[modId + '|#|' + recipe] = data.Recipes[recipe];
                            }
                            else
                            {
                                this.recipesData[recipe] = data.Recipes[recipe];
                            }
                        }
                    }
                    if(data.Schematics !== undefined)
                    {
                        for(let schematic in data.Schematics)
                        {
                            this.schematicsData[schematic] = data.Schematics[schematic];
                        }
                    }

                    // Mod is loaded, add object waiting in queue...
                    this.modsData[modId].loading = false;
                    if(this.modsData[modId].queue !== undefined)
                    {
                        while(this.modsData[modId].queue.length > 0)
                        {
                            this.modsData[modId].queue.shift()();
                        }
                    }

                    console.timeEnd('Loading mod: ' + this.modsData[modId].name);
                    return resolve();
                }).fail(() => {
                    console.log('FAILED Loading mod:' + this.modsData[modId].name);
                    console.timeEnd('Loading mod: ' + this.modsData[modId].name);

                    delete this.modsData[modId];
                    return resolve();
                  });

                return;
            }
            else
            {
                // Add object to queue until the mod is fully loaded...
                if(this.modsData[modId].loading === true)
                {
                    if(this.modsData[modId].queue === undefined)
                    {
                        this.modsData[modId].queue = [];
                    }

                    this.modsData[modId].queue.push(resolve);
                    return;
                }
            }
        }

        return resolve();
    }

    renderObjects()
    {
        // Switch some collectables to 0 opacity
        for(let pathName in this.satisfactoryMap.collectableMarkers)
        {
            if(['sporeFlowers', 'smallRocks', 'largeRocks'].includes(this.satisfactoryMap.collectableMarkers[pathName].options.layerId))
            {
                this.satisfactoryMap.collectableMarkers[pathName].removeFrom(
                    this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[pathName].options.layerId]
                );
            }
        }

        return new Promise((resolve) => {
            let header                  = this.saveGameParser.getHeader();
            let pad                     = function(num, size) { return ('000' + num).slice(size * -1); },
                time                    = parseFloat(header.playDurationSeconds).toFixed(3),
                hours                   = Math.floor(time / 60 / 60),
                minutes                 = Math.floor(time / 60) % 60,
                seconds                 = Math.floor(time - minutes * 60);

                $('#saveGameInformation').html('<strong>' + header.sessionName + '</strong> <em><small>(' + hours + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's)</small></em>');

            $('.loader h6').html(this.translate._('Rendering objects (%1$s%)...', 0));
            console.time('renderObjects');
            window.requestAnimationFrame(resolve);
        }).then(() => {
            this.parseObjects();
        });
    }

    parseObjects(i = 0, objectsKeys = null)
    {
        if(objectsKeys === null)
        {
            let objects             = this.saveGameParser.getObjects();
                objectsKeys         = Object.keys(objects);

                // Performance warning!!!
                if(objectsKeys.length > 500000)  { this.mapStructuresModelsQuality  = 'medium'; }
                if(objectsKeys.length > 750000)  { this.showPatterns                = false; }
                if(objectsKeys.length > 1000000) { this.mapStructuresModelsQuality  = 'low'; this.mapModelsQuality  = 'medium'; }
        }

        let countObjects            = objectsKeys.length;
        let parseObjectsProgress    = Math.round(i / countObjects * 100);
        let promises                = [];

        for(i; i < countObjects; i++)
        {
            let currentObject = this.saveGameParser.getTargetObject(objectsKeys[i]);
                if(currentObject === null)
                {
                    continue;
                }
                /*
                if(currentObject.className.includes('Subsystem'))
                {
                    console.log('Subsystem', currentObject)
                }
                /**/
                /*
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/ProjectAssembly/BP_ProjectAssembly.BP_ProjectAssembly_C')
                {
                    console.log(currentObject);
                }
                /**/
                //if(currentObject.className.includes('Rock')){ console.log(currentObject); }

            // Add menu to nodes/foliages...
            if([
                '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C',
                '/Game/FactoryGame/Resource/BP_FrackingSatellite.BP_FrackingSatellite_C',
                '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C',

                '/Game/FactoryGame/World/Hazard/SporeCloudPlant/BP_SporeFlower.BP_SporeFlower_C',
                '/Game/FactoryGame/Equipment/C4Dispenser/BP_DestructibleSmallRock.BP_DestructibleSmallRock_C',
                '/Game/FactoryGame/Equipment/C4Dispenser/BP_DestructibleLargeRock.BP_DestructibleLargeRock_C'
            ].includes(currentObject.className))
            {
                if(this.satisfactoryMap.collectableMarkers[currentObject.pathName] !== undefined)
                {
                    this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.pathName = currentObject.pathName;
                    this.satisfactoryMap.collectableMarkers[currentObject.pathName].bindContextMenu(this);

                    if(['sporeFlowers', 'smallRocks', 'largeRocks'].includes(this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId))
                    {
                        let mHasBeenFractured = this.getObjectProperty(currentObject, 'mHasBeenFractured');
                            if(mHasBeenFractured === null || this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId === 'sporeFlowers')
                            {
                                this.satisfactoryMap.collectableMarkers[currentObject.pathName].addTo(
                                    this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId]
                                );
                            }
                            else
                            {
                                let layerId         = this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId;
                                let dataCollected   = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected')) + 1;
                                let dataTotal       = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-total'));

                                $('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected', dataCollected);
                                $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(this.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.language).format(dataTotal));
                            }
                    }
                }

                continue;
            }

            // Mod nodes
            if([
                // Refined Power
                '/RefinedPower/World/ResourceNodes/Thorium/BP_Thorium.BP_Thorium_C',
                // Ficsit Farming
                '/FicsitFarming/World/ResourceNodes/Dirt/BP_DirtNode.BP_DirtNode_C'
            ].includes(currentObject.className))
            {
                if(this.satisfactoryMap.collectableMarkers[currentObject.pathName] === undefined)
                {
                    $('#mods_resource_nodes').show();

                    let nodeType    = currentObject.className.split('.').pop();
                    let nodePurity  = 'impure';
                    let mNodePurity = this.getObjectProperty(currentObject, 'mNodePurity');
                        if(mNodePurity !== null)
                        {
                            console.log('mNodePurity', mNodePurity);
                        }
                    let layoutId    = nodeType + '_' + nodePurity.charAt(0).toUpperCase() + nodePurity.slice(1);
                        if(this.satisfactoryMap.availableLayers[layoutId] === undefined)
                        {
                            this.satisfactoryMap.availableLayers[layoutId] = L.layerGroup();
                        }

                    let button      = $('.updateLayerState[data-type="' + nodeType + '"][data-purity="' + nodePurity + '"]');
                        button.attr('data-total', parseInt(button.attr('data-total')) + 1);
                        button.find('.badge').html(new Intl.NumberFormat(this.language).format(parseInt(button.attr('data-total'))));
                        button.parent().parent().parent().show();

                    let currentMarkerOptions    = {
                            pathName    : currentObject.pathName,
                            color       : button.attr('data-outside'),
                            fillColor   : button.attr('data-inside'),
                            icon        : button.attr('data-image')
                        };
                    let tooltip                 = '<div class="d-flex" style="border: 25px solid #7f7f7f;border-image: url(' + this.staticUrl + '/js/InteractiveMap/img/genericTooltipBackground.png) 25 repeat;background: #7f7f7f;margin: -7px;color: #FFFFFF;text-shadow: 1px 1px 1px #000000;line-height: 16px;font-size: 12px;">\
                                                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                                                        ' + ((button.attr('data-original-title') !== undefined) ? button.attr('data-original-title') : button.attr('title')) + '\
                                                    </div>\
                                                </div>';
                    let currentMarker           = L.mapMarker(this.satisfactoryMap.unproject(currentObject.transform.translation), currentMarkerOptions)
                                                    .bindTooltip(tooltip)
                                                    .addTo(this.satisfactoryMap.availableLayers[layoutId]);

                        this.satisfactoryMap.collectableMarkers[currentObject.pathName]                     = currentMarker;
                        this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId     = layoutId;
                        this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.pathName    = currentObject.pathName;
                        this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.purity      = nodePurity;
                }

                this.satisfactoryMap.collectableMarkers[currentObject.pathName].bindContextMenu(this);

                continue;
            }
            //if(currentObject.className.includes('Node')){ console.log(currentObject); }

            if(currentObject.className === '/Script/FactoryGame.FGPipeNetwork')
            {
                this.pipeNetworkSubSystem.add(currentObject);
                continue;
            }

            if(currentObject.className === '/Script/FactoryGame.FGBlueprintProxy')
            {
                this.blueprintSubSystem.add(currentObject);
                continue;
            }

            if(currentObject.className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C')
            {
                this.gameMode.push(currentObject);
                continue;
            }
            if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C')
            {
                let mOwnedPawn  = this.getObjectProperty(currentObject, 'mOwnedPawn');
                    if(mOwnedPawn !== null)
                    {
                        this.players[currentObject.pathName] = new SubSystem_Player({baseLayout: this, player: currentObject});

                        // Moving view before rendering objects...
                        if(
                                (this.saveGameParser.playerHostPathName !== null && this.saveGameParser.playerHostPathName === currentObject.pathName)
                             || (this.saveGameParser.playerHostPathName === null && Object.keys(this.players).length === 1) // Update 8, get first player...
                        )
                        {
                            let targetPlayer = this.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                                if(targetPlayer !== null)
                                {
                                    this.satisfactoryMap.leafletMap.setView(this.satisfactoryMap.unproject(targetPlayer.transform.translation), 7);
                                }
                        }
                    }

                continue;
            }

            if(currentObject.className === '/Game/FactoryGame/Character/Creature/BP_CreatureSpawner.BP_CreatureSpawner_C')
            {
                this.faunaSubsystem.creatureSpawners.push(currentObject.pathName);
                promises.push(new Promise((resolve) => { return resolve(this.faunaSubsystem.add(currentObject)); }));

                continue;
            }
            if(currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C')
            {
                Building_ResourceDeposit.add(this, currentObject);
                continue;
            }
            if(currentObject.className.startsWith('/Game/FactoryGame/Resource/Environment/AnimalParts/BP_'))
            {
                this.addAnimalParts(currentObject);
                continue;
            }

            // Store collectables total
            if([
                '/Game/FactoryGame/World/Benefit/NutBush/BP_NutBush.BP_NutBush_C',
                '/Game/FactoryGame/World/Benefit/BerryBush/BP_BerryBush.BP_BerryBush_C',
                '/Game/FactoryGame/World/Benefit/Mushroom/BP_Shroom_01.BP_Shroom_01_C',
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal.BP_Crystal_C',
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk2.BP_Crystal_mk2_C',
                '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk3.BP_Crystal_mk3_C',
                '/Game/FactoryGame/Prototype/WAT/BP_WAT1.BP_WAT1_C',
                '/Game/FactoryGame/Prototype/WAT/BP_WAT2.BP_WAT2_C',
                '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C'
            ].includes(currentObject.className))
            {
                if(this.satisfactoryMap.collectableMarkers[currentObject.pathName] !== undefined)
                {
                    this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.pathName = currentObject.pathName;
                    this.satisfactoryMap.collectableMarkers[currentObject.pathName].bindContextMenu(this);

                    if(currentObject.className === '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
                    {
                        let haveDropPod = this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId].hasLayer(this.satisfactoryMap.collectableMarkers[currentObject.pathName]);
                            if(haveDropPod === false)
                            {
                                this.satisfactoryMap.collectableMarkers[currentObject.pathName].addTo(
                                    this.satisfactoryMap.availableLayers[this.satisfactoryMap.collectableMarkers[currentObject.pathName].options.layerId]
                                );
                            }
                    }
                }
                else
                {
                    console.log('Unknown collectable?', currentObject)
                }

                this.playerStatistics.collectables[currentObject.className].items.push(currentObject.pathName);

                if(this.playerStatistics.collectables[currentObject.className].needDiscovery !== undefined && this.playerStatistics.collectables[currentObject.className].needDiscovery === true)
                {
                    if(this.playerStatistics.collectables[currentObject.className].discovered === undefined)
                    {
                        this.playerStatistics.collectables[currentObject.className].discovered = 0;
                    }
                    this.playerStatistics.collectables[currentObject.className].discovered++;
                }

                continue;
            }


            if(currentObject.className === '/Game/FactoryGame/Character/Creature/Enemy/CrabHatcher/Char_CrabHatcher.Char_CrabHatcher_C')
            {
                this.playerStatistics.collectables[currentObject.className].items.push(currentObject.pathName);
            }

            if([
                '/RefinedPower/World/ResourceNodes/WaterTurbine/BP_WaterTurbineNode_Medium.BP_WaterTurbineNode_Medium_C',
                '/RefinedPower/World/ResourceNodes/WaterTurbine/BP_WaterTurbineNode_Fast.BP_WaterTurbineNode_Fast_C'
            ].includes(currentObject.className))
            {
                continue; // Too much so skip...
            }

            // Skip
            if([
                '/Game/FactoryGame/Buildable/Factory/TradingPost/BP_StartingPod.BP_StartingPod_C',
                '/Game/FactoryGame/Character/Player/Char_Player.Char_Player_C',
                '/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole.Build_SignPole_C',
                '/Game/FactoryGame/Buildable/Factory/Pipeline/FlowIndicator/Build_PipelineFlowIndicator.Build_PipelineFlowIndicator_C',

                '/Game/FactoryGame/Schematics/Progression/BP_SchematicManager.BP_SchematicManager_C',
                '/Game/FactoryGame/Recipes/Research/BP_ResearchManager.BP_ResearchManager_C',
                '/Game/FactoryGame/Unlocks/BP_UnlockSubsystem.BP_UnlockSubsystem_C',
                '/Game/FactoryGame/Events/BP_EventSubsystem.BP_EventSubsystem_C',

                '/Game/FactoryGame/Schematics/Progression/BP_GamePhaseManager.BP_GamePhaseManager_C',

                '/Game/FactoryGame/Buildable/Factory/PipeHyper/FGPipeConnectionComponentHyper.FGPipeConnectionComponentHyper_C',

                '/Game/FactoryGame/Resource/BP_FrackingCore.BP_FrackingCore_C',

                // HUB PARTS
                '/Game/FactoryGame/Buildable/Factory/WorkBench/Build_WorkBenchIntegrated.Build_WorkBenchIntegrated_C',
                '/Game/FactoryGame/Buildable/Factory/Mam/Build_MamIntegrated.Build_MamIntegrated_C',
                '/Game/FactoryGame/Buildable/Factory/HubTerminal/Build_HubTerminal.Build_HubTerminal_C',
                '/Game/FactoryGame/Prototype/TetrominoRecipeDesigner/Build_TetrominoGame_Computer.Build_TetrominoGame_Computer_C',

                '/Game/FactoryGame/Buildable/Vehicle/BP_VehicleTargetPoint.BP_VehicleTargetPoint_C',

                // MODS
                '/Game/EfficiencyCheckerMod/Buildings/EfficiencyChecker/Build_Pipeline_Stub.Build_Pipeline_Stub_C'
            ].includes(currentObject.className))
            {
                continue;
            }

            // Fix some save/games bugs and/or old object conversion
            currentObject = SaveParser_FicsIt.callADA(this, currentObject);
                if(currentObject === null)
                {
                    continue;
                }

            /*
            '/Script/FactoryGame.FGInventoryComponent',
            '/Script/FactoryGame.FGInventoryComponentEquipment',
            '/Script/FactoryGame.FGInventoryComponentTrash',
            '/Script/FactoryGame.FGPowerInfoComponent',
            '/Script/FactoryGame.FGRecipeShortcut',
            '/Script/FactoryGame.FGHealthComponent',
             */
            if(
                    currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C'
                 || (currentObject.className.startsWith('/Script/FactoryGame.') && currentObject.className !== '/Script/FactoryGame.FGItemPickup_Spawnable')
                 || currentObject.className.startsWith('/Game/FactoryGame/-Shared/Blueprint/BP_')
            )
            {
                continue;
            }

            // Update extracted core availability to get satellite status
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/FrackingSmasher/Build_FrackingSmasher.Build_FrackingSmasher_C')
            {
                let mExtractableResource = this.getObjectProperty(currentObject, 'mExtractableResource');
                    if(mExtractableResource !== null)
                    {
                        this.frackingSmasherCores[mExtractableResource.pathName] = currentObject.pathName;
                    }
            }

            promises.push(new Promise((resolve) => { this.parseObject(currentObject, resolve); }));

            // Wait for promise to complete before launching next batch!
            let progress    = Math.round(i / countObjects * 100);
                if(progress > parseObjectsProgress)
                {
                    return Promise.all(promises).then(() => {
                        $('#loaderProgressBar .progress-bar').css('width', (60 + progress * 0.3) + '%');
                        $('.loader h6').html(this.translate._('Rendering objects (%1$s%)...', progress));
                        window.requestAnimationFrame(() => { this.parseObjects((i + 1), objectsKeys); });
                    });
                }
        }

        console.timeEnd('renderObjects');

        this.minAltitude                = Number.MAX_SAFE_INTEGER;
        this.maxAltitude                = Number.MIN_SAFE_INTEGER;

        // Hold sub system to get better performance
        this.centralStorageSubSystem    = new SubSystem_CentralStorage({baseLayout: this});
        this.collectablesSubSystem      = new SubSystem_Collectables({baseLayout: this});
        this.foliageSubSystem           = new SubSystem_Foliage({baseLayout: this});
        this.gameRulesSubSystem         = new SubSystem_GameRules({baseLayout: this});
        this.mapSubSystem               = new SubSystem_Map({baseLayout: this});
        this.overclockingSubSystem      = new SubSystem_Overclocking({baseLayout: this});
        this.schematicSubSystem         = new SubSystem_Schematic({baseLayout: this});
        this.statisticsSubSystem        = new SubSystem_Statistics({baseLayout: this});
        this.unlockSubSystem            = new SubSystem_Unlock({baseLayout: this});
        this.worldGridSubSystem         = new SubSystem_WorldGrid({baseLayout: this});

        console.time('addMapLayers');

        return this.addLayers();
    }

    parseObject(currentObject, resolve, skipMod = false)
    {
        if(currentObject === null)
        {
            return resolve(null);
        }

        if(currentObject.className.startsWith('/Game/FactoryGame/') === false)
        {
            for(let modId in this.modsData)
            {
                if(currentObject.className.startsWith('/' + modId + '/') === true || currentObject.className.startsWith('/Game/' + modId + '/') === true || (currentObject.className.startsWith('/KLib/') === true) && modId === 'SatisfactoryPlus') //TODO: Add mods multiple references...
                {
                    if(this.modsData[modId].queuedPathName === undefined)
                    {
                        this.modsData[modId].queuedPathName = [];
                    }

                    if(this.modsData[modId].queuedPathName.includes(currentObject.pathName) === false)
                    {
                        this.modsData[modId].queuedPathName.push(currentObject.pathName);

                        return this.loadMod(modId, () => {
                            return this.parseObject(currentObject, resolve, skipMod);
                        });
                    }
                }
            }

            //TODO: Sentry new mod?
        }

        // Check for blueprints proxies...
        this.blueprintSubSystem.addToProxy(currentObject);

        // Hold portals for performance...
        this.portalSubSystem.add(currentObject);

        // Add priority switches to circuits
        this.circuitSubSystem.addPrioritySwitch(currentObject);

        // Needed when moving players
        if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C' && this.players[currentObject.pathName] !== undefined)
        {
            return resolve({layer: 'playerPositionLayer', marker: this.players[currentObject.pathName].addMarker()});
        }

        // Skip on pasting
        if(['/Game/FactoryGame/Buildable/Factory/SignPole/Build_SignPole.Build_SignPole_C', '/Game/FactoryGame/Buildable/Factory/Pipeline/FlowIndicator/Build_PipelineFlowIndicator.Build_PipelineFlowIndicator_C'].includes(currentObject.className))
        {
            return resolve(null);
        }
        // Skip, was a closed beta bug...
        if(currentObject.className === '/Script/FactoryGame.FGAmmoTypeHoming')
        {
            return resolve(null);
        }

        if(currentObject.className === '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C')
        {
            return resolve(this.addDecoration(currentObject));
        }
        if(currentObject.className === '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C')
        {
            return resolve(this.addPortableMiner(currentObject));
        }

        if(currentObject.className === '/Script/FactoryGame.FGItemPickup_Spawnable' || currentObject.className === '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C')
        {
            return resolve(this.addItemPickup(currentObject));
        }

        if(currentObject.className === '/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C' || currentObject.className === '/CrashSiteBeacons/BP_Beacon_Child.BP_Beacon_Child_C')
        {
            return resolve(Building_Beacon.add(this, currentObject));
        }

        if(currentObject.className === '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C')
        {
            return resolve(this.addPlayerLootCrate(currentObject));
        }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C')
        {
            this.railroadSubSystem.railroadSwitchControls.push(currentObject.pathName);
        }

        if(Building_PowerLine.isPowerline(currentObject))
        {
            return resolve(Building_PowerLine.add(this, currentObject));
        }

        // Network cable mods
        if(currentObject.className === '/DigitalStorage/Buildables/NetworkCable/Build_DS_NetworkCable.Build_DS_NetworkCable_C')
        {
            return resolve(Building_DigitalStorage_NetworkCable.add(this, currentObject));
        }

        if(
                Building_Conveyor.isConveyorBelt(currentObject) || Building_Pipeline.isPipeline(currentObject)
             // Hyper tubes
             || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipeHyper/Build_PipeHyper.Build_PipeHyper_C'
             || currentObject.className === '/Game/InfiniteLogistics/Buildable/InfinitePipeHyper/Build_InfinitePipeHyper.Build_InfinitePipeHyper_C'
        )
        {
            return resolve(Building_Conveyor.add(this, currentObject));
        }
        if(Building_RailroadTrack.isRailroadTrack(currentObject))
        {
            return resolve(Building_RailroadTrack.add(this, currentObject));
        }

        // Add fauna
        if(currentObject.className.includes('/Game/FactoryGame/Character/Creature/Wildlife/') || currentObject.className.includes('/Game/FactoryGame/Character/Creature/Enemy/'))
        {
            return resolve(this.faunaSubsystem.add(currentObject));
        }

        // Add buildings data...
        let isCurrentObjectBuilding = this.getBuildingDataFromClassName(currentObject.className);
            if(isCurrentObjectBuilding !== null)
            {
                return resolve(this.addGenericBuilding(currentObject, isCurrentObjectBuilding));
            }
            else
            {
                if(currentObject.className.indexOf('Build_') !== -1 || currentObject.className.startsWith('/CoveredConveyor'))
                {
                    if(typeof Sentry !== 'undefined' && this.useDebug === true)
                    {
                        Sentry.setContext('className', {className: currentObject.className});
                        Sentry.setContext('mBuiltWithRecipe', this.getObjectProperty(currentObject, 'mBuiltWithRecipe'));
                        Sentry.captureMessage('Missing building className: ' + currentObject.className);
                    }

                    console.log('Missing building className', currentObject.className);

                    // Create a dummy data...
                    let newBuildingData = {
                        mapLayer        : 'playerUnknownLayer',
                        className       : currentObject.className,
                        name            : currentObject.className.split('/').pop(),
                        category        : 'unknown',
                        mapColor        : '#FFFFFF',
                        mapWeight       : 3
                    };
                        this.buildingsData[currentObject.className] = newBuildingData;

                    return resolve(this.addGenericBuilding(currentObject, newBuildingData));
                }
                else
                {
                    if(
                           this.useDebug === true
                        && currentObject.className.startsWith('/Game/FactoryGame/Equipment/') === false
                        && currentObject.className.startsWith('/Script/FactoryGame.') === false
                        && currentObject.className !== '/Game/FactoryGame/Testing/BoomBox/BP_TapePickup.BP_TapePickup_C' // Ignore picked up tapes
                        && ['/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C', '/Script/FactoryGame.FGTrainStationIdentifier', '/Script/FactoryGame.FGTrain'].includes(currentObject.className) === false
                    )
                    {
                        //console.log('Unknown?', currentObject);
                    }
                }
            }

        // /Script/FactoryGame.***
        return resolve(null);
    }

    addLayers(i = 0)
    {
        let layersKeys = Object.keys(this.playerLayers);
            for(i; i < layersKeys.length; i++)
            {
                let layerId = layersKeys[i];
                    if(layerId !== 'playerRadioactivityLayer' && layerId !== 'playerFogOfWar' && layerId !== 'playerPositionLayer' && this.playerLayers[layerId].elements !== undefined)
                    {
                        let currentLayerLength = this.playerLayers[layerId].elements.length;
                            // Remove from map if too much objects?
                            if(['playerFoundationsLayer', 'playerRoofsLayer', 'playerWallsLayer'].includes(layerId) && currentLayerLength > 250000)
                            {
                                if(this.playerLayers[layerId].layerGroup.hasLayer(this.playerLayers[layerId].subLayer))
                                {
                                    this.playerLayers[layerId].layerGroup.removeLayer(this.playerLayers[layerId].subLayer);
                                    $('.updatePlayerLayerState[data-id=' + layerId + ']').removeClass(window.SCIM.outlineClass);
                                }
                            }

                            for(let j = 0; j < currentLayerLength; j++)
                            {
                                this.addElementToLayer(layerId, this.playerLayers[layerId].elements[j]);
                            }

                        this.setBadgeLayerCount(layerId);

                        let progress = Math.round(i / layersKeys.length * 100);
                            return new Promise((resolve) => {
                                $('#loaderProgressBar .progress-bar').css('width', (90 + progress * 0.1) + '%');

                                let layerTitle = $('.updatePlayerLayerState[data-id=' + layerId + ']').attr('title');
                                    if(layerId === 'playerLightsHaloLayer')
                                    {
                                        layerTitle = 'Lights halo';
                                    }
                                $('.loader h6').html(this.translate._('Adding map layers (%1$s)...', layerTitle));

                                window.requestAnimationFrame(resolve);
                            }).then(() => {
                                this.addLayers((i + 1));
                            });
                    }
            }

        console.timeEnd('addMapLayers');

        return new Promise((resolve) => {
            $('#loaderProgressBar .progress-bar').css('width', '100%');
            $('.loader h6').html(this.translate._('Finalization of statistics and controls...'));
            window.requestAnimationFrame(resolve);
        }).then(() => {
            // Altitude slider
            this.altitudeSliderControl = L.control.sliderControl({
                baseLayout  : this,
                minAltitude : Math.floor(this.minAltitude),
                maxAltitude : Math.ceil(this.maxAltitude)
            });
            this.satisfactoryMap.leafletMap.addControl(this.altitudeSliderControl);
            this.altitudeSliderControl.startSlider();

            // Collectables (Force refreshing status and icons after loading)
            this.collectablesSubSystem.get();

            // Refresh MapMarkers layers to push them on top
            for(let index in this.satisfactoryMap.activeLayers)
            {
                let layerId = this.satisfactoryMap.activeLayers[index];
                    this.satisfactoryMap.leafletMap.removeLayer(this.satisfactoryMap.availableLayers[layerId]);
                    this.satisfactoryMap.leafletMap.addLayer(this.satisfactoryMap.availableLayers[layerId]);
            }

            // Player position
            for(let pathName in this.players)
            {
                this.players[pathName].addMarker();
            }

            // Global modals
            $('#statisticsModal').on('show.bs.modal', () => {
                $('#statisticsModal a.nav-link[href="#statisticsModalProduction"]').removeClass('active').click();
            });

            // Reset all statistics tabs on close...
            $('#statisticsModal').on('hide.bs.modal', () => {
                $('#statisticsModal .tab-content .tab-pane').html('');
            });

            // Swicth statistics tabs
            $('#statisticsModal a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
                let newTab = $(e.target).attr('href');
                    switch(newTab)
                    {
                        case '#statisticsModalProduction':
                            if($('#statisticsModalProduction').html() === '')
                            {
                                let statisticsProduction = new Modal_Statistics_Production({baseLayout: this});
                                    $('#statisticsModalProduction').html(statisticsProduction.parse());
                            }
                            break;
                        case '#statisticsModalStorage':
                            if($('#statisticsModalStorage').html() === '')
                            {
                                let statisticsStorage = new Modal_Statistics_Storage({baseLayout: this});
                                    $('#statisticsModalStorage').html(statisticsStorage.parse());
                            }
                            break;
                        case '#statisticsModalConsumables':
                            if($('#statisticsModalConsumables').html() === '')
                            {
                                let statisticsGame = new Modal_Statistics_Game({baseLayout: this});
                                    $('#statisticsModalConsumables').html(statisticsGame.parseConsumables());
                            }
                            break;
                        case '#statisticsModalCreatures':
                            if($('#statisticsModalCreatures').html() === '')
                            {
                                let statisticsGame = new Modal_Statistics_Game({baseLayout: this});
                                    $('#statisticsModalCreatures').html(statisticsGame.parseCreatures());
                            }
                            break;
                        case '#statisticsModalCrafting':
                            if($('#statisticsModalCrafting').html() === '')
                            {
                                let statisticsGame = new Modal_Statistics_Game({baseLayout: this});
                                    $('#statisticsModalCrafting').html(statisticsGame.parseCrafting());
                            }
                            break;
                        case '#statisticsModalBuilt':
                            if($('#statisticsModalBuilt').html() === '')
                            {
                                let statisticsGame = new Modal_Statistics_Game({baseLayout: this});
                                    $('#statisticsModalBuilt').html(statisticsGame.parseBuilt());
                            }
                            break;
                        case '#statisticsModalPartsUsed':
                            if($('#statisticsModalPartsUsed').html() === '')
                            {
                                let statisticsGame = new Modal_Statistics_Game({baseLayout: this});
                                    $('#statisticsModalPartsUsed').html(statisticsGame.parsePartsUsed());
                            }
                            break;
                    }
            });

            $('#researchModal').on('show.bs.modal', () => {
                let statisticsSchematics = new Modal_Schematics({
                        baseLayout      : this
                    });
                    statisticsSchematics.parseSchematics();
                    statisticsSchematics.parseAlternateRecipes();
                    statisticsSchematics.parseMAM();
                    statisticsSchematics.parseAwesomeSink();
                    statisticsSchematics.parseSpecial();
            });
            $('#colorSlotsModal').on('click', () => {
                let colorSlots = new Modal_ColorSlots({baseLayout: this});
                    colorSlots.parse();
            });
            $('#lightSlotsModal').on('click', () => {
                let lightColorSlots = new Modal_LightColorSlots({baseLayout: this});
                    lightColorSlots.parse();
            });
            $('#modalPowerCircuits').on('click', () => {
                let modalPowerCircuits = new Modal_Power_Circuits({
                        baseLayout      : this
                    });
                    modalPowerCircuits.parse();
            });

            $('#optionsModal a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
                let target = $(e.target).attr('href');
                    switch(target)
                    {
                        case '#statisticsPlayerInventory':
                            let mapPlayers      = new Modal_Map_Players({baseLayout: this});
                                mapPlayers.parse();
                            break;
                        case '#statisticsPlayerHotBars':
                            let mapHotbars      = new Modal_Map_Hotbars({baseLayout: this});
                                mapHotbars.parse();
                            break;
                        case '#statisticsModalCollectables':
                            let mapCollectables = new Modal_Map_Collectables({baseLayout: this});
                                mapCollectables.parse();
                            break;
                        case '#statisticsPlayerTodo':
                            let mapTodos        = new Modal_Map_Todo({baseLayout: this});
                                mapTodos.parse();
                            break;
                        case '#statisticsModalOptions':
                            let mapOptions      = new Modal_Map_Options({baseLayout: this});
                                mapOptions.parse();
                            break;
                        case '#statisticsModalRules':
                            let mapRules        = new Modal_Map_GameRules({baseLayout: this});
                                mapRules.parse();
                            break;
                    }
            });
            $('#optionsModal').on('show.bs.modal', () => {
                $('#optionsModal a.active[data-toggle="tab"]').trigger('shown.bs.tab');
            });

            $('#buildingsModal').on('show.bs.modal', () => {
                let modalBuildings = new Modal_Buildings({
                        baseLayout      : this
                    });
                    modalBuildings.parse();
            });
            $('#trainsModal').on('show.bs.modal', () => {
                let modalTrains = new Modal_Trains({
                        baseLayout      : this
                    });
                    modalTrains.parse();
            });

            $('#buildingsButton').show();
            $('#trainsButton').show();
            $('#statisticsButton').show();
            $('#researchButton').show();
            $('#optionsButton').show();

            // Delay radioactivity to avoid canvas error when map isn't fully loaded...
            window.requestAnimationFrame(() => { this.updateRadioactivityLayer(); });

            this.history = new BaseLayout_History({
                baseLayout      : this
            });

            // End...
            window.SCIM.hideLoader();

            $('.updateTitleLayerState').css('cursor', 'pointer').on('click', (e) => {
                $(e.currentTarget).closest('div[id]').find('.updatePlayerLayerState').each((i, el) => {
                    this.updatePlayerLayerState($(el), $(el).attr('data-id'));
                });
            });
            $('.updatePlayerLayerState').on('click', (e) => {
                this.updatePlayerLayerState($(e.currentTarget), $(e.currentTarget).attr('data-id'));
            });
            $('.updatePlayerLayerFilter').on('click', (e) => {
                e.stopPropagation(); // Prevent update layer state...
                this.updatePlayerLayerFilter($(e.currentTarget), $(e.currentTarget).attr('data-id'), $(e.currentTarget).attr('data-filter'));
            });

            // Add download event
            $('#downloadSaveGame').on('click', () => {
                window.SCIM.showLoader();
                $('.loader h6').html('Saving...');

                // Clean subsystems...
                this.circuitSubSystem.cleanCircuits();

                // Save...
                this.saveGameParser.save(this);
            });

            // Clipboard control
            this.clipboardControl = new L.Control.ClipboardControl({baseLayout: this});
            this.satisfactoryMap.leafletMap.addControl(this.clipboardControl);

            // Selection control
            this.selectionControl = new L.Control.Selection({baseLayout: this});
            this.satisfactoryMap.leafletMap.addControl(this.selectionControl);
        });
    }

    updateRadioactivityLayer()
    {
        if(this.radioactivityLayerNeedsUpdate === true)
        {
            console.time('updateRadioactiveData');
            this.setupSubLayer('playerRadioactivityLayer');
            this.playerLayers.playerRadioactivityLayer.subLayer.setData({data: this.playerLayers.playerRadioactivityLayer.elements});
            this.radioactivityLayerNeedsUpdate = false;
            console.timeEnd('updateRadioactiveData');
        }
    }

    addElementToLayer(layerId, element, updateAltitudeSlider = false)
    {
        element.addTo(this.playerLayers[layerId].subLayer);

        if(this.playerLayersNotUsingAltitude.includes(layerId) === false && element.options.pathName !== undefined)
        {
            let currentObject = this.saveGameParser.getTargetObject(element.options.pathName);
                if(currentObject !== null)
                {
                    this.minAltitude = Math.min(this.minAltitude, Math.floor(currentObject.transform.translation[2]));
                    this.maxAltitude = Math.max(this.maxAltitude, Math.ceil(currentObject.transform.translation[2]));

                    if(updateAltitudeSlider === true)
                    {
                        this.altitudeSliderControl.updateSliderAltitudes(this.minAltitude, this.maxAltitude);
                    }
                }
        }

        if(element.options.extraPattern !== undefined)
        {
            element.options.extraPattern.addTo(this.playerLayers[layerId].subLayer);
        }
        if(element.options.extraMarker !== undefined)
        {
            element.options.extraMarker.addTo(this.playerLayers[layerId].subLayer);
        }
    }

    addAnimalParts(currentObject)
    {
        this.setupSubLayer('playerItemsPickupLayer', false);
        let itemId      = 'Desc_SpitterParts_C';
            if([
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_HogParts.BP_HogParts_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_CliffHogParts.BP_CliffHogParts_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaHogParts.BP_AlphaHogParts_C',
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_NuclearHogParts.BP_NuclearHogParts_C'
            ].includes(currentObject.className))
            {
                itemId  = 'Desc_HogParts_C';
            }
            if([
                '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_StingerParts.BP_StingerParts_C'
            ].includes(currentObject.className))
            {
                itemId  = 'Desc_StingerParts_C';
            }

        let itemMarker  = L.mapMarker(
                this.satisfactoryMap.unproject(currentObject.transform.translation),
                {
                    pathName    : currentObject.pathName,
                    itemId      : itemId,
                    itemQty     : 1,
                    icon        : this.toolsData[itemId].image
                }
            );
            this.bindMouseEvents(itemMarker);

        this.playerLayers.playerItemsPickupLayer.elements.push(itemMarker);
        itemMarker.addTo(this.playerLayers.playerItemsPickupLayer.subLayer);

        return itemMarker;
    }

    addItemPickup(currentObject)
    {
        let mPickupItems = this.getObjectProperty(currentObject, 'mPickupItems');
            if(mPickupItems !== null && mPickupItems.values[0].value.properties[0] !== null && mPickupItems.values[0].value.properties[0].value > 0)
            {
                let itemId = this.getItemDataFromClassName(mPickupItems.values[0].value.itemName.pathName);
                    if(itemId !== null)
                    {
                        itemId = itemId.id;

                        this.setupSubLayer('playerItemsPickupLayer', false);

                        let iconImage   = 'https://static.satisfactory-calculator.com/img/mapUnknownIcon.png';
                            if(this.itemsData[itemId] !== undefined)
                            {
                                iconImage = this.itemsData[itemId].image;
                            }
                            else
                            {
                                if(this.toolsData[itemId] !== undefined)
                                {
                                    iconImage = this.toolsData[itemId].image;
                                }
                            }

                        let itemMarker = L.mapMarker(
                                this.satisfactoryMap.unproject(currentObject.transform.translation),
                                {
                                    pathName    : currentObject.pathName,
                                    itemId      : itemId,
                                    itemQty     : mPickupItems.values[0].value.properties[0].value,
                                    icon        : iconImage
                                }
                            );
                            this.bindMouseEvents(itemMarker);

                        this.playerLayers.playerItemsPickupLayer.elements.push(itemMarker);
                        itemMarker.addTo(this.playerLayers.playerItemsPickupLayer.subLayer);

                        return {layer: 'playerItemsPickupLayer', marker: itemMarker};
                    }
            }

        return null;
    }

    deleteItemPickUp(marker)
    {
        let inGameBuggedSpawnable   = SaveParser_FicsIt.getBuggedItemPickup(marker.baseLayout);
        let splittedPathName        = marker.relatedTarget.options.pathName.split(':')
            if(inGameBuggedSpawnable.includes(splittedPathName[1]))
            {
                //TODO: May be avoid spamming too much alert on that if selection is used?
                BaseLayout_Modal.alert('That dropped item is not saving properly in-game and cannot be deleted...<br /><em>' + marker.relatedTarget.options.pathName + '</em>');
                return;
            }

        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

            // Game dropped items...
            if(currentObject.className === '/Script/FactoryGame.FGItemPickup_Spawnable')
            {
                let collectable = {pathName: currentObject.pathName};
                    if(currentObject.levelName !== undefined)
                    {
                        collectable.levelName = currentObject.levelName;
                    }
                baseLayout.saveGameParser.collectables.push(collectable);
            }

        baseLayout.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
        baseLayout.deleteMarkerFromElements('playerItemsPickupLayer', marker.relatedTarget);
        baseLayout.setBadgeLayerCount('playerItemsPickupLayer');
    }

    addPlayerLootCrate(currentObject)
    {
        this.setupSubLayer('playerCratesLayer');

        let crate = L.mapMarker(
            this.satisfactoryMap.unproject(currentObject.transform.translation),
            {
                pathName        : currentObject.pathName,
                color           : '#FFFFFF',
                fillColor       : '#b3b3b3',
                icon            : this.staticUrl + '/img/mapLootCrateIcon.png'
            }
        );

        this.playerLayers.playerCratesLayer.count++;
        this.bindMouseEvents(crate);
        this.playerLayers.playerCratesLayer.elements.push(crate);

        return {layer: 'playerCratesLayer', marker: crate};
    }

    deletePlayerLootCrate(marker)
    {
        let baseLayout = marker.baseLayout;
            baseLayout.saveGameParser.deleteObject(marker.relatedTarget.options.pathName);
            baseLayout.deleteMarkerFromElements('playerCratesLayer', marker.relatedTarget);
            baseLayout.playerLayers.playerCratesLayer.count--;
            baseLayout.setBadgeLayerCount('playerCratesLayer');
    }

    spawnNewLootCrateNearPlayer()
    {
        let playerPosition  = [0, 0, 0];
        let playerRotation  = [-0, 0, -0.4999995529651642, 0.8660256862640381];

        for(let pathName in this.players)
        {
            // Find target
            let mOwnedPawn  = this.getObjectProperty(this.players[pathName].player, 'mOwnedPawn');
                if(mOwnedPawn !== null)
                {
                    let player = this.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                        if(player !== null)
                        {
                            playerPosition = player.transform.translation;
                            playerRotation = player.transform.rotation;

                            break; // No need to check further...
                        }
                }
        }

        let cratePathName   = this.generateFastPathName({pathName: 'Persistent_Level:PersistentLevel.BP_Crate_C_XXX'});
        let newLootCrate    = {
            type                : 1,
            className           : '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C',
            pathName            : cratePathName,
            transform           : {
                rotation            : playerRotation,
                translation         : [
                    playerPosition[0] + (Math.floor(Math.random() * (800 + 1)) - 400),
                    playerPosition[1] + (Math.floor(Math.random() * (800 + 1)) - 400),
                    playerPosition[2] + Math.floor(Math.random() * (400 + 1))
                ]
            },
            children                : [{pathName: cratePathName + ".inventory"}],
            properties              : [{
                name                    : 'mInventory',
                type                    : 'Object',
                value                   : {pathName: cratePathName + '.inventory'}
            }],
            entity                  : {levelName: '', pathName: ''}
        };
        this.saveGameParser.addObject(newLootCrate);

        let newLootCrateInventory = {
            type                    : 0,
            className               : '/Script/FactoryGame.FGInventoryComponent',
            pathName                : cratePathName + '.inventory',
            outerPathName           : cratePathName,
            children                : [],
            properties              : [
                {
                    name                : 'mInventoryStacks',
                    type                : 'Array',
                    value               : {type: 'Struct', values: []}, // Push items
                    structureSubType    : 'InventoryStack'
                },
                {
                    name                : 'mArbitrarySlotSizes',
                    type                : 'Array',
                    index               : 0,
                    value               : {type: 'Int', values: []} // Push 0 value for each slot used
                },
                {
                    name                : 'mAllowedItemDescriptors',
                    type                : 'Array',
                    index               : 0,
                    value               : {type: 'Object', values: [{levelName: '', pathName: ''}]}
                }
            ]
        };
        this.saveGameParser.addObject(newLootCrateInventory);

        let result = this.addPlayerLootCrate(newLootCrate);
            this.addElementToLayer(result.layer, result.marker);

        return newLootCrateInventory;
    }

    rotationPlayerFoundation(marker, angle = 90)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            if(baseLayout.history !== null)
            {
                baseLayout.history.add({
                    name: 'Undo: Rotate by ' + angle + '°',
                    values: [{
                        pathName: marker.relatedTarget.options.pathName,
                        callback: 'refreshMarkerPosition',
                        properties: {transform: JSON.parse(JSON.stringify(currentObject.transform))}
                    }]
                });
            }

        currentObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(currentObject.transform.rotation, angle);

        baseLayout.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});
    }

    pivotPlayerFoundation(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

        BaseLayout_Modal.form({
            title       : 'Pivot "' + buildingData.name + '" from the top-left corner',
            container   : '#leafletMap',
            inputs      : [
                {
                    label       : 'Angle (Between -180° and 180°)',
                    name        : 'angle',
                    inputType   : 'number',
                    min         : -180,
                    max         : 180,
                    value       : 0,
                }
            ],
            callback: function(values)
            {
                let angle  = Math.min(180, Math.max(-180, parseInt(values.angle)));

                if(baseLayout.history !== null)
                {
                    baseLayout.history.add({
                        name: 'Undo: Pivot by ' + angle + '°',
                        values: [{
                            pathName: marker.relatedTarget.options.pathName,
                            callback: 'refreshMarkerPosition',
                            properties: {transform: JSON.parse(JSON.stringify(currentObject.transform))}
                        }]
                    });
                }

                let center          = [currentObject.transform.translation[0], currentObject.transform.translation[1]];
                let topLeftCorner   = BaseLayout_Math.getPointRotation(
                        [center[0] - 400, center[1] - 400],
                        center,
                        currentObject.transform.rotation
                    );

                currentObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(currentObject.transform.rotation, angle);

                let newCenter       = BaseLayout_Math.getPointRotation(
                        [topLeftCorner[0] + 400, topLeftCorner[1] + 400],
                        topLeftCorner,
                        currentObject.transform.rotation
                    );

                currentObject.transform.translation[0] = newCenter[0];
                currentObject.transform.translation[1] = newCenter[1];

                baseLayout.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});
            }
        });
    }

    refreshMarkerPosition(properties, fastDelete = false)
    {
        let refreshSliderBoundaries     = (properties.transform.translation[2] !== properties.object.transform.translation[2]);
        let mSplineData                 = this.getObjectProperty(properties.object, 'mSplineData');
        let splineRotation              = (properties.splineRotation !== undefined) ? properties.splineRotation : 0;

        // Move extra properties
        let extraPropertiesPathName     = [];
        let mHubTerminal    = this.getObjectProperty(properties.object, 'mHubTerminal');
            if(mHubTerminal !== null)
            {
                extraPropertiesPathName.push(mHubTerminal.pathName);
            }
        let mWorkBench      = this.getObjectProperty(properties.object, 'mWorkBench');
            if(mWorkBench !== null)
            {
                extraPropertiesPathName.push(mWorkBench.pathName);
            }
        let mSignPoles = this.getObjectProperty(properties.object, 'mSignPoles');
            if(mSignPoles !== null)
            {
                for(let j = 0; j < mSignPoles.values.length; j++)
                {
                    extraPropertiesPathName.push(mSignPoles.values[j].pathName);
                }
            }
        let mFlowIndicator = this.getObjectProperty(properties.object, 'mFlowIndicator');
            if(mFlowIndicator !== null)
            {
                extraPropertiesPathName.push(mFlowIndicator.pathName);
            }

        for(let i = 0; i < extraPropertiesPathName.length; i++)
        {
            let extraObject = this.saveGameParser.getTargetObject(extraPropertiesPathName[i]);
                if(extraObject !== null)
                {
                    let newExtraTransform   = JSON.parse(JSON.stringify(properties.transform));
                    let angleOffset         = BaseLayout_Math.getQuaternionToEuler(properties.transform.rotation).yaw - BaseLayout_Math.getQuaternionToEuler(extraObject.transform.rotation).yaw;
                    let xOffset             = properties.object.transform.translation[0] - extraObject.transform.translation[0];
                    let yOffset             = properties.object.transform.translation[1] - extraObject.transform.translation[1];
                        if(mSplineData !== null)
                        {
                            if(splineRotation !== 0)
                            {
                                angleOffset                 = splineRotation;
                                newExtraTransform.rotation  = BaseLayout_Math.getNewQuaternionRotate(extraObject.transform.rotation, angleOffset);
                            }
                            else
                            {
                                angleOffset                 = 0;
                                newExtraTransform.rotation  = extraObject.transform.rotation;
                            }
                        }

                        if((xOffset !== 0 || yOffset !== 0) && angleOffset !== 0)
                        {
                            let translationRotation = BaseLayout_Math.getPointRotation(
                                    [newExtraTransform.translation[0] - xOffset, newExtraTransform.translation[1] - yOffset],
                                    newExtraTransform.translation,
                                    BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], angleOffset)
                                );
                                newExtraTransform.translation[0]  = translationRotation[0];
                                newExtraTransform.translation[1]  = translationRotation[1];
                        }
                        else
                        {
                            newExtraTransform.translation[0]   -= xOffset;
                            newExtraTransform.translation[1]   -= yOffset;
                        }

                        newExtraTransform.translation[2]   -= properties.object.transform.translation[2] - extraObject.transform.translation[2];

                    extraObject.transform = newExtraTransform;
                }
        }

        properties.object.transform = JSON.parse(JSON.stringify(properties.transform));

        // Delete and add again!
        return new Promise((resolve) => {
            this.parseObject(properties.object, resolve);
        }).then((result) => {
            this.deleteMarkerFromElements(result.layer, properties.marker, fastDelete);

            if(result.marker.options.haloMarker !== undefined)
            {
                this.playerLayers.playerLightsHaloLayer.subLayer.addLayer(result.marker.options.haloMarker);
            }

            this.addElementToLayer(result.layer, result.marker, refreshSliderBoundaries);

            if(properties.object.children !== undefined)
            {
                for(let j = 0; j < properties.object.children.length; j++)
                {
                    let childrenPathName    = properties.object.children[j].pathName;
                    let childrenType        = '.' + childrenPathName.split('.').pop();

                        if(Building_PowerLine.availableConnections.indexOf(childrenType) !== -1)
                        {
                            let currentObjectChildren = this.saveGameParser.getTargetObject(properties.object.pathName + childrenType);
                                if(currentObjectChildren !== null)
                                {
                                    Building_PowerLine.redrawWiresFromPowerConnection(this, currentObjectChildren, fastDelete);
                                }
                        }

                        if(Building_DigitalStorage_NetworkCable.availableConnections.indexOf(childrenType) !== -1)
                        {
                            let currentObjectChildren = this.saveGameParser.getTargetObject(properties.object.pathName + childrenType);
                                if(currentObjectChildren !== null)
                                {
                                    Building_DigitalStorage_NetworkCable.redrawCablesFromPowerConnection(this, currentObjectChildren, fastDelete);
                                }
                        }
                }
            }
        });
    }

    teleportPlayer(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let newTransform    = JSON.parse(JSON.stringify(currentObject.transform));

        let selectOptions   = [];
            for(let pathName in baseLayout.players)
            {
                selectOptions.push({
                    text    : baseLayout.players[pathName].getDisplayName(),
                    value   : pathName
                });
            }

            if(selectOptions.length === 1) // Don't ask if there is only one player on the map...
            {
                return baseLayout.players[selectOptions[0].value].teleportTo(newTransform);
            }

        BaseLayout_Modal.form({
            title       : "Teleport player",
            container   : '#leafletMap',
            inputs      : [
                {
                    name            : 'playerPathName',
                    inputType       : 'select',
                    inputOptions    : selectOptions
                }
            ],
            callback    : function(values)
            {
                return baseLayout.players[values.playerPathName].teleportTo(newTransform);
            }
        });
    }

    editPlayerStorageBuildingInventory(marker, inventoryProperty = 'mStorageInventory')
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
            {
                inventoryProperty   = 'mInventory';
            }
            if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C')
            {
                let mOwnedPawn = baseLayout.players[marker.relatedTarget.options.pathName].getOwnedPawn();
                    if(mOwnedPawn !== null)
                    {
                        inventoryProperty   = 'mInventory';
                        currentObject       = mOwnedPawn;
                    }
            }

        let inventory           = baseLayout.getObjectInventory(currentObject, inventoryProperty);
        let inventoryOptions    = [];
        let selectOptions       = baseLayout.generateInventoryOptions(currentObject);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);
            if(buildingData === null)
            {
                buildingData            = {};
                buildingData.maxSlot    = inventory.length;

                if(currentObject.className === '/Game/FactoryGame/Character/Player/Char_Player.Char_Player_C')
                {
                    buildingData.name = baseLayout.players[marker.relatedTarget.options.pathName].getDisplayName();
                }
            }

        for(let i = 0; i < buildingData.maxSlot; i++)
        {
            let newInventorySlot = {
                label           : '#' + (i + 1),
                name            : 'slot' + (i + 1),
                inputType       : 'inventoryItem',
                inputOptions    : selectOptions
            };

            if(inventory[i] !== undefined && inventory[i] !== null)
            {
                newInventorySlot.value  = inventory[i].className;
                newInventorySlot.qty    = inventory[i].qty;
            }
            else
            {
                newInventorySlot.value = 'NULL';
                newInventorySlot.qty    = 0;
            }

            inventoryOptions.push(newInventorySlot);
        }

        BaseLayout_Modal.form({
            title       : '"<strong>' + buildingData.name + '</strong>" Inventory',
            container   : '#leafletMap',
            inputs      : inventoryOptions,
            callback    : function(values)
            {
                let oldInventory = baseLayout.getObjectInventory(currentObject, inventoryProperty, true);
                    for(let i = 0; i < oldInventory.properties.length; i++)
                    {
                        if(oldInventory.properties[i].name === 'mInventoryStacks')
                        {
                            oldInventory = oldInventory.properties[i].value.values;

                            for(let j = 0; j < buildingData.maxSlot; j++)
                            {
                                if(oldInventory[j] !== undefined)
                                {
                                    if(values['slot' + (j + 1)] === 'NULL')
                                    {
                                        oldInventory[j][0].value.itemName.pathName = "";
                                        baseLayout.setObjectProperty(oldInventory[j][0].value, 'NumItems', 0, 'Int');
                                    }
                                    else
                                    {
                                        oldInventory[j][0].value.itemName.pathName = values['slot' + (j + 1)];
                                        baseLayout.setObjectProperty(oldInventory[j][0].value, 'NumItems', Math.max(1, parseInt(values['QTY_slot' + (j + 1)])), 'Int');
                                    }
                                }

                            }
                            break;
                        }
                    }

                delete baseLayout.playerLayers.playerRadioactivityLayer.elements[currentObject.pathName];
                baseLayout.radioactivityLayerNeedsUpdate = true;
                baseLayout.getObjectRadioactivity(currentObject, inventoryProperty);
                baseLayout.updateRadioactivityLayer();
            }
        });
    }

    fillPlayerStorageBuildingInventoryModal(marker, inventoryProperty = 'mStorageInventory')
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C', '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'].includes(currentObject.className))
            {
                // Buffer only have the fluidBox, the fluid is handled with the pipe network ;)
                return baseLayout.fillPlayerStorageBuildingInventory(currentObject, null);
            }

        let selectOptions       = baseLayout.generateInventoryOptions(currentObject, false, inventoryProperty);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);

        BaseLayout_Modal.form({
            title       : 'Fill "<strong>' + buildingData.name + '</strong>" Inventory',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'fillWith',
                inputType       : 'selectPicker',
                inputOptions    : selectOptions
            }],
            callback    : function(values)
            {
                baseLayout.fillPlayerStorageBuildingInventory(currentObject, values.fillWith, inventoryProperty);
                baseLayout.updateRadioactivityLayer();
            }
        });
    }

    fillPlayerStorageBuildingInventory(currentObject, fillWith, inventoryProperty = 'mStorageInventory')
    {
        let stack           =  100;
        let storageObjects  = [currentObject];
            // Switch to freight wagons when locomotive was selected
            if(Building_Locomotive.isLocomotive(currentObject))
            {
                storageObjects = Building_Locomotive.getFreightWagons(this, currentObject);
            }
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
            {
                inventoryProperty   = 'mInventory';
            }

        if(fillWith !== null)
        {
            let currentItem = this.getItemDataFromClassName(fillWith);
                if(currentItem !== null && currentItem.stack !== undefined)
                {
                    stack = currentItem.stack;
                }
        }

        for(let i = 0; i < storageObjects.length; i++)
        {
            let buildingData    = this.getBuildingDataFromClassName(storageObjects[i].className);

            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].includes(currentObject.className))
            {
                if(buildingData !== null && buildingData.maxFluid !== undefined)
                {
                    this.setObjectProperty(storageObjects[i], 'mFluidBox', {type: "FluidBox", value: buildingData.maxFluid / 1000}, 'Struct');
                }

                continue;
            }

            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C')
            {
                let storage           = this.getObjectProperty(storageObjects[i], 'mInventory');
                    if(storage !== null)
                    {
                        let storageObject = this.saveGameParser.getTargetObject(storage.pathName);
                            if(storageObject !== null)
                            {
                                let mInventoryStacks = this.getObjectProperty(storageObject, 'mInventoryStacks');
                                    if(mInventoryStacks !== null)
                                    {
                                        let value = mInventoryStacks.values[0][0].value;
                                            if(value.itemName.pathName === '')
                                            {
                                                let currentPipeNetwork = this.pipeNetworkSubSystem.getObjectPipeNetwork(currentObject);
                                                    if(currentPipeNetwork !== null)
                                                    {
                                                        let mFluidDescriptor = this.getObjectProperty(currentPipeNetwork, 'mFluidDescriptor');
                                                            if(mFluidDescriptor !== null)
                                                            {
                                                                value.itemName.pathName = mFluidDescriptor.pathName;
                                                            }
                                                    }
                                            }
                                            if(buildingData !== null && buildingData.maxFluid !== undefined)
                                            {
                                                value.properties = [{name: 'NumItems', type: 'Int', value: buildingData.maxFluid}];
                                            }
                                    }
                            }
                    }

                    continue;
            }

            // Skip fluid Freight Wagon
            if(Building.isFreightWagon(storageObjects[i]))
            {
                let storage           = this.getObjectProperty(storageObjects[i], inventoryProperty);
                    if(storage !== null)
                    {
                        let storageObject = this.saveGameParser.getTargetObject(storage.pathName);
                            if(storageObject !== null)
                            {
                                let mAdjustedSizeDiff = this.getObjectProperty(storageObject, 'mAdjustedSizeDiff');
                                    if(mAdjustedSizeDiff !== null && mAdjustedSizeDiff === -31)
                                    {
                                        let mInventoryStacks = this.getObjectProperty(storageObject, 'mInventoryStacks');
                                            if(mInventoryStacks !== null)
                                            {
                                                let value = mInventoryStacks.values[0][0].value;
                                                    if(buildingData !== null && buildingData.maxFluid !== undefined)
                                                    {
                                                        value.properties = [{name: 'NumItems', type: 'Int', value: buildingData.maxFluid}];
                                                    }
                                            }

                                            continue;
                                    }
                            }

                    }
            }

            if(buildingData === null || buildingData.maxSlot === undefined)
            {
                continue;
            }

            let oldInventory    = this.getObjectInventory(storageObjects[i], inventoryProperty, true);
                for(let j = 0; j < oldInventory.properties.length; j++)
                {
                    if(oldInventory.properties[j].name === 'mInventoryStacks')
                    {
                        oldInventory = oldInventory.properties[j].value.values;

                        for(let k = 0; k < buildingData.maxSlot; k++)
                        {
                            if(oldInventory[k] !== undefined)
                            {
                                oldInventory[k][0].value.itemName.pathName = fillWith;
                                this.setObjectProperty(oldInventory[k][0].value, 'NumItems', stack, 'Int');
                            }

                        }
                        break;
                    }
                }

                delete this.playerLayers.playerRadioactivityLayer.elements[storageObjects[i].pathName];
                this.radioactivityLayerNeedsUpdate = true;
                this.getObjectRadioactivity(storageObjects[i], inventoryProperty);
        }
    }

    clearPlayerStorageBuildingInventory(marker, inventoryProperty = 'mStorageInventory')
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let storageObjects  = [currentObject];
            // Switch to freight wagons when locomotive was selected
            if(Building_Locomotive.isLocomotive(currentObject))
            {
                storageObjects      = Building_Locomotive.getFreightWagons(baseLayout, currentObject);
            }
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
            {
                inventoryProperty   = 'mInventory';
            }
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C')
            {
                inventoryProperty   = 'mInventory';
            }

        for(let i = 0; i < storageObjects.length; i++)
        {
            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C'].includes(currentObject.className))
            {
                baseLayout.setObjectProperty(storageObjects[i], 'mFluidBox', {type: "FluidBox", value: 0}, 'Struct');
                continue;
            }

            let oldInventory    = baseLayout.getObjectInventory(storageObjects[i], inventoryProperty, true);
                if(oldInventory !== null)
                {
                    for(let j = 0; j < oldInventory.properties.length; j++)
                    {
                        if(oldInventory.properties[j].name === 'mInventoryStacks')
                        {
                            let mInventoryStacks = oldInventory.properties[j].value.values;
                                for(let k = 0; k < mInventoryStacks.length; k++)
                                {
                                    mInventoryStacks[k][0].value.itemName.pathName = "";
                                    baseLayout.setObjectProperty(mInventoryStacks[k][0].value, 'NumItems', 0, 'Int');
                                }
                            break;
                        }
                    }
                }

                delete baseLayout.playerLayers.playerRadioactivityLayer.elements[storageObjects[i].pathName];
                baseLayout.radioactivityLayerNeedsUpdate = true;
                baseLayout.getObjectRadioactivity(storageObjects[i], inventoryProperty);
        }
    }

    generateInventoryOptions(currentObject, addNULL = true, inventoryProperty = 'mStorageInventory')
    {
        let selectOptions           = [];
        let isFluidInventory        = true;
        let itemsCategories         = JSON.parse(JSON.stringify(this.itemsCategories));
            itemsCategories.statue  = 'Statues';
            itemsCategories.ficsmas = 'FICS*MAS Holiday Event';
            itemsCategories.mods    = 'Modded items';

        if(currentObject !== null)
        {
            if(Building_Pipeline.isPipeline(currentObject) === false && [
                '/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C',
                '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C',
                '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'
            ].includes(currentObject.className) === false)
            {
                isFluidInventory = false;
                delete itemsCategories.liquid;
                delete itemsCategories.gas;
            }
        }

        if(inventoryProperty === 'mFuelInventory')
        {
            itemsCategories = {fuel: itemsCategories.fuel};
        }

        for(let category in itemsCategories)
        {
            if(isFluidInventory === true && category !== 'liquid' && category !== 'gas')
            {
                continue;
            }

            let categoryOptions = [];
                for(let i in this.itemsData)
                {
                    if(this.itemsData[i].className !== undefined && this.itemsData[i].className !== null && this.itemsData[i].category === category)
                    {
                        categoryOptions.push({
                            group       : itemsCategories[category],
                            dataContent : '<img src="' + this.itemsData[i].image + '" style="width: 24px;" class="mr-1" /> ' + this.itemsData[i].name,
                            value       : this.itemsData[i].className,
                            text        : this.itemsData[i].name
                        });
                    }
                }
                categoryOptions.sort((a, b) => a.text.localeCompare(b.text));
                selectOptions = selectOptions.concat(categoryOptions);
        }

        if(isFluidInventory === false && inventoryProperty !== 'mFuelInventory')
        {
            let toolsOptions = [];
                for(let i in this.toolsData)
                {
                    if(this.toolsData[i].className !== undefined && this.toolsData[i].className !== null)
                    {
                        toolsOptions.push({
                            group       : 'Tools - ' + ((this.toolsData[i].category === 'ficsmas') ? itemsCategories[this.toolsData[i].category] : this.toolsCategories[this.toolsData[i].category]),
                            dataContent : '<img src="' + this.toolsData[i].image + '" style="width: 24px;" class="mr-1" /> ' + this.toolsData[i].name,
                            value       : this.toolsData[i].className,
                            text        : this.toolsData[i].name
                        });
                    }
                }
                toolsOptions.sort((a, b) => a.text.localeCompare(b.text));
                selectOptions = selectOptions.concat(toolsOptions);
        }

        if(addNULL === true)
        {
            selectOptions.unshift({value: 'NULL', text: '-----'});
        }

        return selectOptions;
    }

    addDecoration(currentObject)
    {
        let currentItemData         = {};
        let mDecorationDescriptor   = this.getObjectProperty(currentObject, 'mDecorationDescriptor');
            if(mDecorationDescriptor !== null)
            {
                currentItemData = this.getItemDataFromClassName(mDecorationDescriptor.pathName);
            }

        // Default values?
        currentItemData.width       = 4;
        currentItemData.length      = 4;
        currentItemData.mapLayer    = 'playerStatuesLayer';

        return this.addGenericBuilding(currentObject, currentItemData);
    }

    addPortableMiner(currentObject)
    {
        let currentItemData             = this.getItemDataFromClassName(currentObject.className);
            currentItemData.width       = 1;
            currentItemData.length      = 1;
            currentItemData.category    = 'extractor';
            currentItemData.mapLayer    = 'playerMinersLayer';

        return this.addGenericBuilding(currentObject, currentItemData);
    }

    addGenericBuilding(currentObject, buildingData)
    {
        let layerId         = (buildingData.mapLayer !== undefined) ? buildingData.mapLayer : 'playerUnknownLayer';
            this.setupSubLayer(layerId);

            if(this.playerLayers[layerId].filtersCount !== undefined && Building_Conveyor.isConveyorLift(currentObject) === false)
            {
                if(this.playerLayers[layerId].filtersCount[currentObject.className] === undefined)
                {
                    this.playerLayers[layerId].filtersCount[currentObject.className] = 0;
                }
                this.playerLayers[layerId].filtersCount[currentObject.className]++;
            }

        // Don't show fake Boombox...
        if(currentObject.className === '/Game/FactoryGame/Equipment/BoomBox/BP_BoomBoxPlayer.BP_BoomBoxPlayer_C')
        {
            let mMode = this.getObjectProperty(currentObject, 'mMode');
                if(mMode !== null && mMode.value === 'EBoomBoxMode::Static')
                {

                }
                else
                {
                    return null;
                }
        }

        // Check building options
        let weight          = (buildingData.mapWeight !== undefined) ? buildingData.mapWeight : 1;
        let polygonOptions  = {
            width               : (buildingData.width !== undefined) ? (buildingData.width * 100) : 800,
            length              : (buildingData.length !== undefined) ? (buildingData.length * 100) : 800,
            offset              : (buildingData.mapOffset !== undefined) ? buildingData.mapOffset : 0,
            xShift              : (buildingData.mapShiftX !== undefined) ? buildingData.mapShiftX : 0,
            yShift              : (buildingData.mapShiftY !== undefined) ? buildingData.mapShiftY : 0,
            useOnly2D           : (buildingData.useOnly2D !== undefined) ? buildingData.useOnly2D : false,
            skipDetailedModel   : false
        };

            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorIntegratedBiomass.Build_GeneratorIntegratedBiomass_C')
            {
                polygonOptions.offset = 500;
            }

        if(buildingData.mapHaveHorizontal !== undefined && buildingData.mapHaveHorizontal === true)
        {
            let objectAngle = BaseLayout_Math.getQuaternionToEuler(currentObject.transform.rotation);
                // Handle signs on beams
                if(buildingData.category === 'sign' && (Math.round(BaseLayout_Math.clampEulerAxis(objectAngle.roll)) === 90 || Math.round(BaseLayout_Math.clampEulerAxis(objectAngle.roll)) === 270))
                {
                    polygonOptions.length    = (buildingData.height !== undefined) ? (buildingData.height * 100) : 800;
                    polygonOptions.useOnly2D = true;
                }
                else
                {
                    if(Math.round(BaseLayout_Math.clampEulerAxis(objectAngle.pitch)) === 90 || Math.round(BaseLayout_Math.clampEulerAxis(objectAngle.pitch)) === 270)
                    {
                        polygonOptions.width     = (buildingData.height !== undefined) ? (buildingData.height * 100) : 800;
                        polygonOptions.useOnly2D = true;

                        if(currentObject.className.includes('Build_PowerPoleWall_') || currentObject.className.includes('Build_PowerPoleWall_'))
                        {
                            polygonOptions.width                = polygonOptions.length = 60; // Make it square
                            polygonOptions.skipDetailedModel    = true;
                        }
                    }
                    else
                    {
                        // Beam length?
                        //TODO: Calculate length based on proper pitch angle...
                        if(buildingData.category === 'beam' && Math.round(BaseLayout_Math.clampEulerAxis(objectAngle.pitch)) === 0)
                        {
                            let mLength = this.getObjectProperty(currentObject, 'mLength');
                                if(mLength !== null)
                                {
                                    if(Math.round(BaseLayout_Math.clampEulerAxis(objectAngle.roll)) !== 0)
                                    {
                                        polygonOptions.length       = mLength;
                                        polygonOptions.xShift       = -mLength / 2;
                                        polygonOptions.useOnly2D    = true;
                                    }
                                    else
                                    {
                                        polygonOptions.width        = mLength;
                                        polygonOptions.xShift       = -mLength / 2;
                                    }
                                }
                                else
                                {
                                    // Connectors...
                                    polygonOptions.length           = (buildingData.height !== undefined) ? (buildingData.height * 100) : 800;
                                    polygonOptions.useOnly2D        = true;
                                }
                        }
                    }
                }
        }

        // Make sure polygon are selectable with a minimum size...
        polygonOptions.width = Math.max(50, polygonOptions.width);
        polygonOptions.length = Math.max(50, polygonOptions.length);

        // Update nodes used by extraction building
        if(buildingData.category === 'extraction' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
        {
            let extractResourceNode     = this.getObjectProperty(currentObject, 'mExtractableResource');
                if(extractResourceNode !== null)
                {
                    if(this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName] !== undefined)
                    {
                        let nodeLayerId     = this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.layerId;

                        let dataCollected   = parseInt($('.updateLayerState[data-id="' + nodeLayerId + '"]').attr('data-collected')) + 1;
                        let dataTotal       = parseInt($('.updateLayerState[data-id="' + nodeLayerId + '"]').attr('data-total'));

                        // Two nodes...
                        //TODO: Check coordinates...
                        if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode625' || extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode614')
                        {
                            dataCollected++;
                        }

                        if(this.showNodesOnMiners === false)
                        {
                            this.satisfactoryMap.availableLayers[nodeLayerId].removeLayer(this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName]);

                            // Two nodes...
                            //TODO: Check coordinates...
                            if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode625' && this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode614'] !== undefined)
                            {
                                this.satisfactoryMap.availableLayers[nodeLayerId].removeLayer(this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode614']);
                            }
                            if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode614' && this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode625'] !== undefined)
                            {
                                this.satisfactoryMap.availableLayers[nodeLayerId].removeLayer(this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode625']);
                            }
                        }
                        else
                        {
                            this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].setOpacity(window.SCIM.collectedOpacity);

                            // Two nodes...
                            //TODO: Check coordinates...
                            if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode625' && this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode614'] !== undefined)
                            {
                                this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode614'].setOpacity(window.SCIM.collectedOpacity);
                            }
                            if(extractResourceNode.pathName === 'Persistent_Level:PersistentLevel.BP_ResourceNode614' && this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode625'] !== undefined)
                            {
                                this.satisfactoryMap.collectableMarkers['Persistent_Level:PersistentLevel.BP_ResourceNode625'].setOpacity(window.SCIM.collectedOpacity);
                            }
                        }

                        this.satisfactoryMap.collectableMarkers[extractResourceNode.pathName].options.extractorPathName = currentObject.pathName;

                        $('.updateLayerState[data-id="' + nodeLayerId + '"]').attr('data-collected', dataCollected);
                        $('.updateLayerState[data-id="' + nodeLayerId + '"] > .badge').html(new Intl.NumberFormat(this.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.language).format(dataTotal));
                    }
                }
        }

        // Conveyor Lift
        if(Building_Conveyor.isConveyorLift(currentObject))
        {
            let mTopTransform = this.getObjectProperty(currentObject, 'mTopTransform');
                if(mTopTransform !== null)
                {
                    polygonOptions.customModel      = 'Build_ConveyorLiftMkXXX__0';
                    polygonOptions.customPolygon    = [[-100,-100],[100,-100],[100,-75],[175,-75],[175,75],[100,75],[100,100],[-100,100]];

                    for(let i = 0; i < mTopTransform.values.length; i++)
                    {
                        // Update polygon based on top rotation
                        if(mTopTransform.values[i].name === 'Rotation')
                        {
                            let topAngle    = Math.round(BaseLayout_Math.getQuaternionToEuler([
                                    mTopTransform.values[i].value.values.a,
                                    mTopTransform.values[i].value.values.b,
                                    mTopTransform.values[i].value.values.c,
                                    mTopTransform.values[i].value.values.d
                                ]).yaw);

                                switch(topAngle)
                                {
                                    case -90:
                                    case 270:
                                        polygonOptions.customModel      = 'Build_ConveyorLiftMkXXX__270';
                                        polygonOptions.customPolygon    = [[-100,-100],[-75,-100],[-75,-175],[75,-175],[75,-100],[100,-100],[100,-75],[175,-75],[175,75],[100,75],[100,100],[-100,100]];
                                        break;
                                    case 180:
                                        polygonOptions.customModel      = 'Build_ConveyorLiftMkXXX__180';
                                        polygonOptions.customPolygon    = [[-175,-75],[-100,-75],[-100,-100],[100,-100],[100,-75],[175,-75],[175,75],[100,75],[100,100],[-100,100],[-100,75],[-175,75]];
                                        break;
                                    case 90:
                                        polygonOptions.customModel      = 'Build_ConveyorLiftMkXXX__90';
                                        polygonOptions.customPolygon    = [[-100,-100],[-100,100],[-75,100],[-75,175],[75,175],[75,100],[100,100],[100,75],[175,75],[175,-75],[100,-75],[100,-100]];
                                        break;
                                }
                        }
                        // Add distance...
                        if(mTopTransform.values[i].name === 'Translation')
                        {
                            let height = Math.abs(mTopTransform.values[i].value.values.z) / 100;
                                this.playerLayers[layerId].distance += height;

                                if(this.playerLayers[layerId].filtersCount !== undefined)
                                {
                                    if(this.playerLayers[layerId].filtersCount[currentObject.className] === undefined)
                                    {
                                        this.playerLayers[layerId].filtersCount[currentObject.className] = {distance: 0};
                                    }
                                    this.playerLayers[layerId].filtersCount[currentObject.className].distance += height;
                                }
                        }
                    }
                }
        }

        // Get building radioactivity?
        let inventoriesProperties = ['mInputInventory', 'mOutputInventory', 'mInventory', 'mStorageInventory', 'mFuelInventory'];
            for(let i = 0; i < inventoriesProperties.length; i++)
            {
                this.getObjectRadioactivity(currentObject, inventoriesProperties[i]);
            }

        // Create building instance
        let markerOptions   = {weight: weight};
            if(this.playerLayers[layerId].renderer != undefined)
            {
                markerOptions.renderer = this.playerLayers[layerId].renderer;
            }

        // Add lights halo
        if(buildingData.category === 'light' && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/LightsControlPanel/Build_LightsControlPanel.Build_LightsControlPanel_C' && Building_Light.hasHalo(this, currentObject) === true)
        {
            let coordinates = Building_Light.getHaloCoordinates(this, currentObject);
                markerOptions.haloMarker = L.haloCircle(
                    coordinates,
                    {
                        originPathName  : currentObject.pathName,
                        radius          : Building_Light.getHaloRadius(currentObject),
                        gradient        : Building_Light.getHaloGradient(this, currentObject),
                        interactive     : false
                    }
                );

            this.setupSubLayer('playerLightsHaloLayer');
            this.playerLayers.playerLightsHaloLayer.elements.push(markerOptions.haloMarker);
        }

        // Add vehicle tracks
        if(buildingData.category === 'vehicle')
        {
            let vehicleTrack   = Building_Vehicle.getTrackData(this, currentObject);
                if(vehicleTrack !== null)
                {
                    let vehicleTrackData     = [];
                        for(let k = 0; k < vehicleTrack.length; k++)
                        {
                            vehicleTrackData.push(this.satisfactoryMap.unproject(vehicleTrack[k]));
                        }

                    let vehicleTrackMarker = L.polyline(
                        vehicleTrackData,
                        {
                            pathName        : currentObject.pathName + '_vehicleTrackData',
                            originPathName  : currentObject.pathName,
                            color           : Building_Vehicle.trackDataColor,
                            weight          : 2,
                            dashArray       : '15 5'
                        }
                    );

                    vehicleTrackMarker.on('mouseover', (e) => {
                        let marker = this.getMarkerFromPathName(e.sourceTarget.options.originPathName);
                            this.setBuildingMouseOverStyle(marker, buildingData);
                    });
                    vehicleTrackMarker.on('mouseout', (e) => {
                        let marker = this.getMarkerFromPathName(e.sourceTarget.options.originPathName);
                            this.setBuildingMouseOutStyle(marker, buildingData);
                    });

                    markerOptions.vehicleTrackDataPathName = currentObject.pathName + '_vehicleTrackData';

                    this.playerLayers[layerId].elements.push(vehicleTrackMarker);

                    if(this.playerLayers[layerId].filtersCount !== undefined)
                    {
                        if(this.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData'] === undefined)
                        {
                            this.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData'] = 0;
                        }
                        this.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData']++;
                    }
                }

            if(layerId === 'playerTrainsLayer')
            {
                this.saveGameRailVehicles.push(currentObject);
            }
        }

        // Add pattern
        if(buildingData.category === 'foundation' && this.showPatterns === true && this.detailedModels !== null)
        {
            let currentPattern          = this.buildableSubSystem.getObjectCustomizationData(currentObject, 'PatternDesc');
                if(currentPattern !== null)
                {
                    let currentPatternRotation  = this.buildableSubSystem.getObjectCustomizationData(currentObject, 'PatternRotation');
                        if(currentPatternRotation === null)
                        {
                            currentPatternRotation = {value: {value: 0}};
                        }

                    if(this.detailedModels[currentPattern.value.pathName] !== undefined)
                    {
                        let patternTransform    = JSON.parse(JSON.stringify(currentObject.transform));
                        let patternRotation     = BaseLayout_Math.getQuaternionToEuler(patternTransform.rotation);
                            patternRotation.yaw = BaseLayout_Math.clampEulerAxis(patternRotation.yaw);
                            switch(currentPatternRotation.value.value)
                            {
                                case 1: // 180°
                                    patternRotation.yaw         = BaseLayout_Math.clampEulerAxis(patternRotation.yaw + 180);
                                    patternTransform.rotation   = BaseLayout_Math.getEulerToQuaternion(patternRotation);
                                    break;
                                case 2: // 90°
                                    patternRotation.yaw         = BaseLayout_Math.clampEulerAxis(patternRotation.yaw + 90);
                                    patternTransform.rotation   = BaseLayout_Math.getEulerToQuaternion(patternRotation);
                                    break;
                                case 3: // 0°
                                    break;
                                default: // -90°
                                    patternRotation.yaw         = BaseLayout_Math.clampEulerAxis(patternRotation.yaw - 90);
                                    patternTransform.rotation   = BaseLayout_Math.getEulerToQuaternion(patternRotation);
                                    break;
                            }

                        markerOptions.extraPattern = L.polygon(
                            BaseLayout_Polygon.generateForms(this, patternTransform, currentPattern.value.pathName, {isPattern: true, skipDetailedModel: false}),
                            {
                                weight          : 0,
                                originPathName  : currentObject.pathName,
                                interactive     : false
                            }
                        );
                    }
                    else
                    {
                        console.log('Missing pattern: ' + currentPattern.value.pathName);
                        if(typeof Sentry !== 'undefined')
                        {
                            Sentry.captureMessage('Missing pattern: ' + currentPattern.value.pathName);
                        }
                    }
                }
        }

        // Extra marker?
        if(buildingData.mapIconImage !== undefined)
        {
            if(buildingData.category !== 'vehicle' || (buildingData.category === 'vehicle' && this.showVehicleExtraMarker === true))
            {
                markerOptions.extraMarker = L.mapMarker(
                    this.satisfactoryMap.unproject(currentObject.transform.translation),
                    {originPathName: currentObject.pathName}
                );
            }
        }

        // Activate detailedModel copy from another building?
        if(this.detailedModels !== null && buildingData.mapUseModel !== undefined && this.detailedModels[currentObject.className] === undefined)
        {
            if(this.buildingsData[buildingData.mapUseModel] !== undefined && this.detailedModels[this.buildingsData[buildingData.mapUseModel].className] !== undefined)
            {
                this.detailedModels[currentObject.className] = this.detailedModels[this.buildingsData[buildingData.mapUseModel].className];
            }
        }

        let building = BaseLayout_Polygon.createBuilding(this, currentObject, markerOptions, polygonOptions);
            this.setBuildingMouseOutStyle(building, buildingData, currentObject);

        if(this.playerLayers[layerId].count !== undefined && buildingData.mapUseCount !== undefined && buildingData.mapUseCount === true)
        {
            this.playerLayers[layerId].count++;
        }
        this.playerLayers[layerId].elements.push(building);

        return {layer: layerId, marker: building};
    }

    deleteGenericBuilding(marker, updateRadioactivity = true, fast = false)
    {
        let baseLayout      = marker.baseLayout;
        let pathName        = marker.relatedTarget.options.pathName;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            if(currentObject.className === '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C')
            {
                let mDecorationDescriptor   = baseLayout.getObjectProperty(currentObject, 'mDecorationDescriptor');
                    buildingData            = baseLayout.getItemDataFromClassName(mDecorationDescriptor.pathName);
                    buildingData.mapLayer   = 'playerStatuesLayer';
            }
            if(currentObject.className === '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C')
            {
                buildingData                = baseLayout.toolsData.BP_ItemDescriptorPortableMiner_C;
                buildingData.mapLayer       = 'playerMinersLayer';
            }

        let layerId = (buildingData !== null && buildingData.mapLayer !== undefined) ? buildingData.mapLayer : 'playerHUBTerminalLayer';

            if(baseLayout.playerLayers[layerId].filtersCount !== undefined)
            {
                if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className] !== undefined)
                {
                    if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance === undefined)
                    {
                        baseLayout.playerLayers[layerId].filtersCount[currentObject.className]--;

                        if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className] === 0)
                        {
                            $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((currentObject.className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : currentObject.className) + '"]').hide();
                        }
                    }
                }
            }

        // Check all known power connection in children and delete wires/cable when needed!
        if(currentObject.children !== undefined)
        {
            for(let i = 0; i < currentObject.children.length; i++)
            {
                let childrenPathName    = currentObject.children[i].pathName;
                let childrenType        = '.' + childrenPathName.split('.').pop();

                    if(Building_PowerLine.availableConnections.indexOf(childrenType) !== -1)
                    {
                        let currentObjectChildren = baseLayout.saveGameParser.getTargetObject(pathName + childrenType);
                            if(currentObjectChildren !== null)
                            {
                                Building_PowerLine.deleteWiresFromPowerConnection(baseLayout, currentObjectChildren);
                            }
                    }

                    if(Building_DigitalStorage_NetworkCable.availableConnections.indexOf(childrenType) !== -1)
                    {
                        let currentObjectChildren = baseLayout.saveGameParser.getTargetObject(pathName + childrenType);
                            if(currentObjectChildren !== null)
                            {
                                Building_DigitalStorage_NetworkCable.deleteCablesFromConnection(baseLayout, currentObjectChildren);
                            }
                    }
            }
        }

        // Remove belt/track connection if needed
        baseLayout.unlinkObjectComponentConnection(currentObject);

        let mConveyorChainActor = baseLayout.getObjectProperty(currentObject, 'mConveyorChainActor');
            if(mConveyorChainActor !== null)
            {
                let conveyorChainActorSubsystem = new SubSystem_ConveyorChainActor({baseLayout: baseLayout, pathName: mConveyorChainActor.pathName});
                    conveyorChainActorSubsystem.killMe();
                    baseLayout.deleteObjectProperty(currentObject, 'mConveyorChainActor')
            }

        // Clear blueprintProxy
        baseLayout.blueprintSubSystem.deleteFromProxy(currentObject);

        // Does the layer have a distance field to update?
        if(baseLayout.playerLayers[layerId].distance !== undefined)
        {
            let splineData = BaseLayout_Math.extractSplineData(baseLayout, currentObject);
                if(splineData !== null)
                {
                    baseLayout.playerLayers[layerId].distance -= splineData.distance;

                    if(baseLayout.playerLayers[layerId].filtersCount !== undefined)
                    {
                        if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className] !== undefined)
                        {
                            if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance !== undefined)
                            {
                                baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance -= splineData.distance;
                            }
                        }
                    }
                }

            if(Building_Conveyor.isConveyorLift(currentObject))
            {
                let mTopTransform = baseLayout.getObjectProperty(currentObject, 'mTopTransform');
                    if(mTopTransform !== null)
                    {
                        for(let i = 0; i < mTopTransform.values.length; i++)
                        {
                            // Remove distance...
                            if(mTopTransform.values[i].name === 'Translation')
                            {
                                let height      = Math.abs(mTopTransform.values[i].value.values.z) / 100;
                                    baseLayout.playerLayers[layerId].distance -= height;

                                    if(baseLayout.playerLayers[layerId].filtersCount !== undefined)
                                    {
                                        if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className] !== undefined)
                                        {
                                            if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance !== undefined)
                                            {
                                                baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance -= height;

                                                if(baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance <= 0)
                                                {
                                                    baseLayout.playerLayers[layerId].filtersCount[currentObject.className].distance = 0;
                                                    $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((currentObject.className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : currentObject.className) + '"]').hide();
                                                }
                                            }
                                        }
                                    }
                            }
                        }
                    }
            }
        }

        //MOD: Efficiency Checker
        let innerPipelineAttachment = baseLayout.getObjectProperty(currentObject, 'innerPipelineAttachment');
            if(innerPipelineAttachment !== null)
            {
                baseLayout.saveGameParser.deleteObject(innerPipelineAttachment.pathName);
            }

        // Extraction buildings need to release the connected node!
        if((buildingData !== null && buildingData.category === 'extraction') || currentObject.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
        {
            let resourceNode     = baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
                if(resourceNode !== null)
                {
                    resourceNode    = baseLayout.saveGameParser.getTargetObject(resourceNode.pathName);

                    if(resourceNode !== null) // Prevent water volumes ^^
                    {
                        if(baseLayout.satisfactoryMap.collectableMarkers !== undefined && baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName] !== undefined)
                        {
                            let layerId         = baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.layerId;

                            let dataCollected   = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected')) - 1;
                            let dataTotal       = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-total'));

                            $('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected', dataCollected);

                            if(dataCollected === 0)
                            {
                                $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(baseLayout.language).format(dataTotal));
                            }
                            else
                            {
                                $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(baseLayout.language).format(dataCollected) + '/' + new Intl.NumberFormat(baseLayout.language).format(dataTotal));
                            }

                            if(baseLayout.showNodesOnMiners === false)
                            {
                                baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].addTo(baseLayout.satisfactoryMap.availableLayers[layerId]);
                            }
                            else
                            {
                                baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].setOpacity(1);
                            }

                            delete baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.extractorPathName;
                        }

                        let mIsOccupied = baseLayout.getObjectProperty(currentObject, 'mIsOccupied');
                            if(mIsOccupied !== null)
                            {
                                mIsOccupied = 0;
                            }
                    }
                }
        }

        // Delete vehicles waypoints
        if(buildingData !== null && buildingData.category === 'vehicle')
        {
            let mTargetList = baseLayout.getObjectProperty(currentObject, 'mTargetList');
                if(mTargetList !== null)
                {
                    let targetNode = baseLayout.saveGameParser.getTargetObject(mTargetList.pathName);
                        if(targetNode !== null && targetNode.properties.length > 0)
                        {
                            let firstNode   = null;
                            let lastNode    = null;

                            for(let j = 0; j < targetNode.properties.length; j++)
                            {
                                if(targetNode.properties[j].name === 'mFirst')
                                {
                                    firstNode = baseLayout.saveGameParser.getTargetObject(targetNode.properties[j].value.pathName);
                                }
                                if(targetNode.properties[j].name === 'mLast')
                                {
                                    lastNode = baseLayout.saveGameParser.getTargetObject(targetNode.properties[j].value.pathName);
                                }
                                if(firstNode !== null && lastNode !== null)
                                {
                                    break;
                                }
                            }

                            if(firstNode !== null && lastNode !== null)
                            {
                                let checkCurrentNode = firstNode;

                                while(checkCurrentNode !== null && checkCurrentNode.pathName !== lastNode.pathName)
                                {
                                    let checkCurrentNodeProperties  = checkCurrentNode.properties;
                                        baseLayout.saveGameParser.deleteObject(checkCurrentNode.pathName);
                                        checkCurrentNode            = null;

                                    for(let k = 0; k < checkCurrentNodeProperties.length; k++)
                                    {
                                        if(checkCurrentNodeProperties[k].name === 'mNext')
                                        {
                                            checkCurrentNode = baseLayout.saveGameParser.getTargetObject(checkCurrentNodeProperties[k].value.pathName);
                                            break;
                                        }
                                    }
                                }

                                baseLayout.saveGameParser.deleteObject(lastNode.pathName);
                            }

                            let vehicleTrackData = baseLayout.getMarkerFromPathName(marker.relatedTarget.options.pathName + '_vehicleTrackData', 'playerVehiculesLayer');
                                if(vehicleTrackData !== null)
                                {
                                    baseLayout.deleteMarkerFromElements('playerVehiculesLayer', vehicleTrackData, fast);

                                    baseLayout.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData']--;

                                    if(baseLayout.playerLayers[layerId].filtersCount['/Game/SCIM/Buildable/Vehicle/TrackData'] === 0)
                                    {
                                        $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hide();
                                    }
                                }
                        }
                }

            for(let n = (baseLayout.saveGameRailVehicles.length - 1); n >= 0; n--)
            {
                if(baseLayout.saveGameRailVehicles[n].pathName === currentObject.pathName)
                {
                    baseLayout.saveGameRailVehicles.splice(n, 1);
                }
            }
        }


        if(Building_RailroadTrack.isRailroadTrack(currentObject))
        {
            // Delete trains on tracks!
            for(let n = (baseLayout.saveGameRailVehicles.length - 1); n >= 0; n--)
            {
                let mTrackPosition = baseLayout.getObjectProperty(baseLayout.saveGameRailVehicles[n], 'mTrackPosition');
                    if(mTrackPosition !== null)
                    {
                        if(mTrackPosition.pathName === currentObject.pathName)
                        {
                            baseLayout.saveGameParser.deleteObject(baseLayout.saveGameRailVehicles[n].pathName);
                            baseLayout.deleteMarkerFromElements('playerTrainsLayer', baseLayout.getMarkerFromPathName(baseLayout.saveGameRailVehicles[n].pathName, 'playerTrainsLayer'), fast);
                            baseLayout.saveGameRailVehicles.splice(n, 1);
                        }
                    }
            }
        }

        // Delete underlying railway track + Game sign
        if(
               currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C'
            || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C'
            || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'
            || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainPlatformEmpty.Build_TrainPlatformEmpty_C'
            || layerId === 'playerTrainsLayer'
        )
        {
            let mRailroadTrack = baseLayout.getObjectProperty(currentObject, 'mRailroadTrack');
                if(mRailroadTrack !== null)
                {
                    let railroadTrackMarker = baseLayout.getMarkerFromPathName(mRailroadTrack.pathName, layerId);
                        if(railroadTrackMarker !== null)
                        {
                            baseLayout.deleteGenericBuilding({baseLayout: baseLayout, relatedTarget: railroadTrackMarker});
                        }
                }

            baseLayout.railroadSubSystem.deleteObjectIdentifier(currentObject);
        }

        // Release space elevator!
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/SpaceElevator/Build_SpaceElevator.Build_SpaceElevator_C')
        {
            let gameState = baseLayout.saveGameParser.getTargetObject('/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C');
                if(gameState !== null)
                {
                    baseLayout.setObjectProperty(gameState, 'mIsSpaceElevatorBuilt', 0, 'Bool');
                }
        }

        // Delete extra properties
        let mSignPoles = baseLayout.getObjectProperty(currentObject, 'mSignPoles');
            if(mSignPoles !== null)
            {
                for(let j = 0; j < mSignPoles.values.length; j++)
                {
                    baseLayout.saveGameParser.deleteObject(mSignPoles.values[j].pathName);
                }
            }
        let mFlowIndicator = baseLayout.getObjectProperty(currentObject, 'mFlowIndicator');
            if(mFlowIndicator !== null)
            {
                baseLayout.saveGameParser.deleteObject(mFlowIndicator.pathName);
            }
        let mInfo = baseLayout.getObjectProperty(currentObject, 'mInfo');
            if(mInfo !== null)
            {
                baseLayout.saveGameParser.deleteObject(mInfo.pathName);
            }

        // Delete building from the Blueprint Designer list
        let mBlueprintDesigner = baseLayout.getObjectProperty(currentObject, 'mBlueprintDesigner');
            if(mBlueprintDesigner !== null)
            {
                let blueprintDesigner = baseLayout.saveGameParser.getTargetObject(mBlueprintDesigner.pathName);
                    if(blueprintDesigner !== null)
                    {
                        let mBuildables = baseLayout.getObjectProperty(blueprintDesigner, 'mBuildables');
                            if(mBuildables !== null)
                            {
                                for(let i = 0; i < mBuildables.values.length; i++)
                                {
                                    if(mBuildables.values[i].pathName === currentObject.pathName)
                                    {
                                        mBuildables.values.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                    }
            }


        // Delete buildings affected to the Blueprint Designer
        if([
            '/Game/FactoryGame/Buildable/Factory/BlueprintDesigner/Build_BlueprintDesigner.Build_BlueprintDesigner_C',
            '/Game/FactoryGame/Buildable/Factory/BlueprintDesigner/Build_BlueprintDesigner_Mk2.Build_BlueprintDesigner_Mk2_C',
            '/Game/FactoryGame/Buildable/Factory/BlueprintDesigner/Build_BlueprintDesigner_Mk3.Build_BlueprintDesigner_Mk3_C'
        ].includes(currentObject.className))
        {
            let mBuildables = baseLayout.getObjectProperty(currentObject, 'mBuildables');
                if(mBuildables !== null)
                {
                    for(let i = 0; i < mBuildables.values.length; i++)
                    {
                        let buildingObject = baseLayout.saveGameParser.getTargetObject(mBuildables.values[i].pathName);
                            if(buildingObject !== null)
                            {
                                    baseLayout.deleteObjectProperty(buildingObject, 'mBlueprintDesigner'); // Avoid delete loop!
                                let buildingMarker = baseLayout.getMarkerFromPathName(mBuildables.values[i].pathName); //TODO: Faster layer lookup?
                                    if(buildingMarker !== null)
                                    {
                                        baseLayout.deleteGenericBuilding({baseLayout: baseLayout, relatedTarget: buildingMarker});
                                    }
                            }
                    }
                }

            let mStorage = baseLayout.getObjectProperty(currentObject, 'mStorage');
                if(mStorage !== null)
                {
                    let mStorageMarker = baseLayout.getMarkerFromPathName(mStorage.pathName, 'playerStoragesLayer');
                        if(mStorageMarker !== null)
                        {
                            baseLayout.deleteGenericBuilding({baseLayout: baseLayout, relatedTarget: mStorageMarker});
                        }
                }
        }

        // Delete extra marker!
        if(marker.relatedTarget.options.extraMarker !== undefined)
        {
            baseLayout.playerLayers[layerId].subLayer.removeLayer(marker.relatedTarget.options.extraMarker);
        }
        if(marker.relatedTarget.options.haloMarker !== undefined)
        {
            baseLayout.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(marker.relatedTarget.options.haloMarker);
        }

        // Delete current object
        if(baseLayout.playerLayers[layerId].count !== undefined && buildingData.mapUseCount !== undefined && buildingData.mapUseCount === true)
        {
            baseLayout.playerLayers[layerId].count--;
        }

        baseLayout.saveGameParser.deleteObject(pathName);
        baseLayout.deleteMarkerFromElements(layerId, marker.relatedTarget, fast);

        // Refresh radioactivity
        if(Building_Conveyor.isConveyorBelt(currentObject))
        {
            Building_Conveyor.refreshRadioactivity(baseLayout, currentObject);
        }
        else
        {
            delete baseLayout.playerLayers.playerRadioactivityLayer.elements[pathName];
        }

        baseLayout.radioactivityLayerNeedsUpdate = true;

        if(updateRadioactivity === true)
        {
            baseLayout.updateRadioactivityLayer();
        }
    }

    unlinkObjectComponentConnection(currentObject)
    {
        if(currentObject.children !== undefined)
        {
            for(let i = 0; i < currentObject.children.length; i++)
            {
                let connectedComponent = this.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                    if(connectedComponent !== null)
                    {
                        // Belt/Pipe/Hyperpipe connection
                        if(
                               connectedComponent.className === '/Script/FactoryGame.FGFactoryConnectionComponent' // Belt
                            || connectedComponent.className === '/Script/FactoryGame.FGPipeConnectionFactory' // Pipe to factory
                            || connectedComponent.className === '/Script/FactoryGame.FGPipeConnectionComponent' // Pipe to pipe
                            || connectedComponent.className === '/Game/FactoryGame/Buildable/Factory/PipeHyper/FGPipeConnectionComponentHyper.FGPipeConnectionComponentHyper_C' // Hyper tubes
                        )
                        {
                            let targetConnectedComponent = this.getObjectProperty(connectedComponent, 'mConnectedComponent');
                                if(targetConnectedComponent !== null)
                                {
                                    let currentConnectedComponent = this.saveGameParser.getTargetObject(targetConnectedComponent.pathName);
                                        if(currentConnectedComponent !== null)
                                        {
                                            for(let j = 0; j < currentConnectedComponent.properties.length; j++)
                                            {
                                                if(currentConnectedComponent.properties[j].name === 'mConnectedComponent' && currentConnectedComponent.properties[j].value.pathName === connectedComponent.pathName)
                                                {
                                                    currentConnectedComponent.properties.splice(j, 1);
                                                }
                                            }
                                        }
                                }
                        }

                        // Railway connection
                        if(connectedComponent.className === '/Script/FactoryGame.FGRailroadTrackConnectionComponent')
                        {
                            this.railroadSubSystem.unlinkRailroadTrackConnections(connectedComponent);

                        }

                        // Platform connection
                        if(connectedComponent.className === '/Script/FactoryGame.FGTrainPlatformConnection')
                        {
                            this.railroadSubSystem.unlinkTrainPlatformConnections(connectedComponent);
                        }
                }
            }
        }

        // Trains connection
        if(Building_Locomotive.isLocomotive(currentObject) || Building.isFreightWagon(currentObject))
        {
            let previousTrain   = null;
            let nextTrain       = null;

            if(currentObject.extra !== undefined && currentObject.extra.previous !== undefined && currentObject.extra.previous.pathName !== '')
            {
                let previousObject = this.saveGameParser.getTargetObject(currentObject.extra.previous.pathName);

                if(previousObject !== null)
                {
                    if(previousObject.extra.previous.pathName === currentObject.pathName)
                    {
                        previousObject.extra.previous.levelName = '';
                        previousObject.extra.previous.pathName  = '';
                    }
                    if(previousObject.extra.next.pathName === currentObject.pathName)
                    {
                        previousObject.extra.next.levelName     = '';
                        previousObject.extra.next.pathName      = '';
                    }

                    previousTrain = this.getMarkerFromPathName(currentObject.extra.previous.pathName, 'playerTrainsLayer');
                }

                currentObject.extra.previous.levelName          = '';
                currentObject.extra.previous.pathName           = '';
            }
            if(currentObject.extra !== undefined && currentObject.extra.next !== undefined && currentObject.extra.next.pathName !== '')
            {
                let nextObject = this.saveGameParser.getTargetObject(currentObject.extra.next.pathName);

                if(nextObject !== null)
                {
                    if(nextObject.extra.previous.pathName === currentObject.pathName)
                    {
                        nextObject.extra.previous.levelName     = '';
                        nextObject.extra.previous.pathName      = '';
                    }
                    if(nextObject.extra.next.pathName === currentObject.pathName)
                    {
                        nextObject.extra.next.levelName         = '';
                        nextObject.extra.next.pathName          = '';
                    }

                    nextTrain = this.getMarkerFromPathName(currentObject.extra.next.pathName, 'playerTrainsLayer');
                }

                currentObject.extra.next.levelName              = '';
                currentObject.extra.next.pathName               = '';
            }

            if(previousTrain !== null)
            {
                this.deleteGenericBuilding({baseLayout: this, relatedTarget: previousTrain});
            }
            if(nextTrain !== null)
            {
                this.deleteGenericBuilding({baseLayout: this, relatedTarget: nextTrain});
            }
        }

        //TODO: Pipe/Lift Floor Hole
        let mBottomSnappedConnection = this.getObjectProperty(currentObject, 'mBottomSnappedConnection');
            if(mBottomSnappedConnection !== null)
            {

            }
        let mTopSnappedConnection = this.getObjectProperty(currentObject, 'mTopSnappedConnection');
            if(mTopSnappedConnection !== null)
            {

            }
    }

    addRadioactivityDot(currentObject, radioactivityItems)
    {
        let radioactivityPosition   = currentObject.transform.translation;
        let maxDistance             = 0;
        let maxIntensity            = 0;

        for(let distance = 0.5; distance <= 9999; distance += 0.1)
        {
            let intensity = 0;

            for(let p = 0; p < radioactivityItems.length; p++)
            {
                intensity += (radioactivityItems[p].qty * radioactivityItems[p].radioactiveDecay) / (4 * 3.1415926535897932 * distance * distance) * Math.pow(Math.E, -0.0125 * distance);
            }

            if(intensity > 45)
            {
                intensity = 45;
            }
            else
            {
                if(intensity < 0.2)
                {
                    intensity = 0;
                }
            }

            // Percent!
            if(intensity > 0)
            {
                maxDistance     = distance;
                intensity       = (intensity - 0.2) * 100 / 44.8;
                maxIntensity    = Math.max(maxIntensity, intensity);
            }

            if(intensity === 0)
            {
                break;
            }
        }

        if(maxDistance > 0)
        {
            let coordinates = this.satisfactoryMap.unproject([radioactivityPosition[0], radioactivityPosition[1]]);

            this.playerLayers.playerRadioactivityLayer.elements[currentObject.pathName] = {
                lat: coordinates.lat,
                lng: coordinates.lng,
                count: maxIntensity,
                maxDistance: maxDistance,
                radius: maxDistance / 25,
                altitude: radioactivityPosition[2]
            };

            this.radioactivityLayerNeedsUpdate = true;
        }
    }



    // Layers
    setupSubLayer(layerId, show = true)
    {
        if(this.playerLayers[layerId] === undefined)
        {
            throw new Error('Undefined layerId `' + layerId + '`');
            //this.playerLayers[layerId] = {layerGroup: L.layerGroup().addTo(this.satisfactoryMap.leafletMap), subLayer: null, mainDivId: '#playerModsLayer', elements: []};
        }

        if(this.playerLayers[layerId].layerGroup === null)
        {
            this.playerLayers[layerId].layerGroup = L.layerGroup().addTo(this.satisfactoryMap.leafletMap);

            if(layerId === 'playerFogOfWar')
            {
                this.satisfactoryMap.leafletMap.createPane(layerId);
                this.satisfactoryMap.leafletMap.getPane(layerId).style.zIndex = 450;
                this.satisfactoryMap.leafletMap.getPane(layerId).style.pointerEvents = 'none';
                this.playerLayers[layerId].renderer = L.canvas({ pane: layerId });
            }
            if(layerId === 'playerLightsHaloLayer')
            {
                this.satisfactoryMap.leafletMap.createPane(layerId);
                this.satisfactoryMap.leafletMap.getPane(layerId).style.zIndex = 449;
                this.satisfactoryMap.leafletMap.getPane(layerId).style.pointerEvents = 'none';
                this.playerLayers[layerId].renderer = L.canvas({ pane: layerId });
            }
        }

        if(this.playerLayers[layerId].subLayer === null)
        {
            switch(layerId)
            {
                case 'playerRadioactivityLayer':
                    this.playerLayers[layerId].subLayer = new HeatmapOverlay({
                        maxOpacity      : .8,
                        scaleRadius     : true,
                        useLocalExtrema : false,
                        gradient        : { 0.40: "rgb(0,0,255)", 0.80: "rgb(0,255,0)", 0.90: "yellow", 1.0: "rgb(255,0,0)"}
                    });
                    break;
                default:
                    this.playerLayers[layerId].subLayer = L.layerGroup();
            }

            // Do we need to show it by default?
            if(show === true)
            {
                switch(this.playerLayers[layerId].mainDivId)
                {
                    case '#playerInformationLayer':
                        if(layerId !== 'playerPositionLayer')
                        {
                            show = this.showPlayersOnLoad;
                        }
                        break;
                    case '#playerStructuresLayer':
                        show = this.showStructuresOnLoad;
                        break;
                    case '#playerBuildingLayer':
                        show = this.showBuildingsOnLoad;
                        break;
                    case '#playerGeneratorsLayer':
                        show = this.showGeneratorsOnLoad;
                        break;
                    case '#playerBuildingLayer':
                        show = this.showTransportationOnLoad;
                        break;
                }
            }

            if(show === true)
            {
                this.playerLayers[layerId].subLayer.addTo(this.playerLayers[layerId].layerGroup);
                $('.updatePlayerLayerState[data-id=' + layerId + ']').addClass(window.SCIM.outlineClass);
            }

            let layerIcon = $('.updatePlayerLayerState[data-id=' + layerId + ']');
                layerIcon.children('img[data-src]').each(function(){
                    $(this).attr('src', $(this).attr('data-src')).removeAttr('data-src');
                });
                layerIcon.show();

            if(layerId === 'playerResourceDepositsLayer' || layerId === 'playerItemsPickupLayer')
            {
                $('.updatePlayerLayerState[data-id=' + layerId + ']').parent().parent().show();
            }

            $(this.playerLayers[layerId].mainDivId).show()
                                                   .parent().show();

            if(this.playerLayers[layerId].filters !== undefined)
            {
                this.playerLayers[layerId].filtersCount = {};
            }
        }
    }

    setupModSubLayer(modId, layerId)
    {
        $('#playerModsLayer').show()
                            .find('.col-12')
                            .append('<div class="btn btn-active updatePlayerLayerState m-1 p-1 radialMenu" data-id="'
                                    + layerId
                                    + '" data-hover="tooltip" title="'
                                    + this.modsData[modId].name + '"><span class="badge badge-secondary badge-layer"></span><img src="'
                                    + this.modsData[modId].image + '" style="width: 40px;" /><div class="radial"><div class="btn bg-secondary btn-outline-warning active focus p-0"></div></div></div>');

       this.playerLayers[layerId] = {layerGroup: L.layerGroup().addTo(this.satisfactoryMap.leafletMap), subLayer: null, mainDivId: '#playerModsLayer', elements: [], filters: []};
       this.setupSubLayer(layerId);
    }

    updatePlayerLayerState($this, updateLayerId)
    {
        let isHiding = $this.hasClass(window.SCIM.outlineClass); // Don't need to redraw if we're just removing the layer...

        for(let layerId in this.playerLayers)
        {
            if(this.playerLayers[layerId].subLayer !== null)
            {
                if(layerId === updateLayerId)
                {
                    // HIDE
                    if(this.playerLayers[layerId].layerGroup.hasLayer(this.playerLayers[layerId].subLayer))
                    {
                        this.playerLayers[layerId].layerGroup.removeLayer(this.playerLayers[layerId].subLayer);
                        $this.removeClass(window.SCIM.outlineClass);

                        if(layerId === 'playerLightsLayer')
                        {
                            if(this.playerLayers.playerLightsHaloLayer.layerGroup !== null && this.playerLayers.playerLightsHaloLayer.layerGroup.hasLayer(this.playerLayers.playerLightsHaloLayer.subLayer))
                            {
                                this.playerLayers.playerLightsHaloLayer.layerGroup.removeLayer(this.playerLayers.playerLightsHaloLayer.subLayer);
                                $('.updatePlayerLayerState[data-id="playerLightsHaloLayer"] > i').removeClass('fa-light-switch-on').addClass('fa-light-switch-off');
                            }
                        }

                        if(layerId === 'playerLightsHaloLayer')
                        {
                            $('.updatePlayerLayerState[data-id="playerLightsHaloLayer"] > i').removeClass('fa-light-switch-on').addClass('fa-light-switch-off');
                        }
                    }
                    // SHOW
                    else
                    {
                        this.playerLayers[layerId].layerGroup.addLayer(this.playerLayers[layerId].subLayer);
                        $this.addClass(window.SCIM.outlineClass);

                        if(layerId === 'playerLightsLayer')
                        {
                            if($('.updatePlayerLayerState[data-id="playerLightsHaloLayer"]').hasClass(window.SCIM.outlineClass))
                            {
                                this.playerLayers.playerLightsHaloLayer.layerGroup.addLayer(this.playerLayers.playerLightsHaloLayer.subLayer);
                                $('.updatePlayerLayerState[data-id="playerLightsHaloLayer"] > i').removeClass('fa-light-switch-off').addClass('fa-light-switch-on');
                            }
                        }

                        if(layerId === 'playerLightsHaloLayer')
                        {
                            $('.updatePlayerLayerState[data-id="playerLightsHaloLayer"] > i').removeClass('fa-light-switch-off').addClass('fa-light-switch-on');
                        }
                    }
                }
                else
                {
                    // Redraw to keep layer order...
                    if(isHiding === false && ['playerLightsHaloLayer', 'playerFogOfWar'].includes(updateLayerId) === false)
                    {
                        if(this.playerLayers[layerId].layerGroup.hasLayer(this.playerLayers[layerId].subLayer))
                        {
                            if(this.playerLayers[layerId].subLayer.bringToFront !== undefined)
                            {
                                this.playerLayers[layerId].subLayer.bringToFront();
                            }
                            else
                            {
                                this.playerLayers[layerId].layerGroup.removeLayer(this.playerLayers[layerId].subLayer)
                                                                     .addLayer(this.playerLayers[layerId].subLayer);
                            }
                        }
                    }
                }
            }
        }
    }

    updatePlayerLayerFilter($this, updateLayerId, className)
    {
        let isHiding = $this.hasClass('btn-warning'); // Don't need to redraw if we're just removing the layer...
                       $this.tooltip('hide');

            for(let layerId in this.playerLayers)
            {
                if(this.playerLayers[layerId].subLayer !== null)
                {
                    if(layerId === updateLayerId)
                    {
                        if(this.playerLayers[layerId].filters !== undefined)
                        {
                            if(isHiding === false)
                            {
                                this.playerLayers[layerId].filters = this.playerLayers[layerId].filters.filter(value => value !== className);
                                $this.removeClass('btn-secondary').addClass('btn-warning');
                            }
                            else
                            {
                                this.playerLayers[layerId].filters.push(className);
                                $this.removeClass('btn-warning').addClass('btn-secondary');
                            }

                            let currentSubLayer     = this.playerLayers[layerId].subLayer;
                            let currentLayerLength  = this.playerLayers[layerId].elements.length;

                            for(let i = 0; i < currentLayerLength; i++)
                            {
                                let currentMarker           = this.playerLayers[layerId].elements[i];
                                let currentObject           = this.saveGameParser.getTargetObject(currentMarker.options.pathName);

                                    if(className === '/Game/SCIM/Buildable/Vehicle/TrackData' && currentObject === null && currentMarker.options.pathName.endsWith('_vehicleTrackData'))
                                    {
                                        if(isHiding === false)
                                        {
                                            let parentPathName  = currentMarker.options.pathName.replace('_vehicleTrackData', '');
                                            let parentMarker    = this.getMarkerFromPathName(parentPathName, 'playerVehiculesLayer');

                                                if(parentMarker !== null)
                                                {
                                                    if(currentSubLayer.hasLayer(parentMarker))
                                                    {
                                                        currentSubLayer.addLayer(currentMarker);
                                                    }
                                                }
                                        }
                                        else
                                        {
                                            currentSubLayer.removeLayer(currentMarker);
                                        }
                                    }
                                    else
                                    {
                                        if(currentObject !== null)
                                        {
                                            let currentClassName = currentObject.className;
                                                if(layerId === 'playerResourceDepositsLayer')
                                                {
                                                    currentClassName = Building_ResourceDeposit.getItemId(this, currentObject);
                                                }

                                            if(currentSubLayer.hasLayer(currentMarker) && this.playerLayers[layerId].filters.includes(currentClassName))
                                            {
                                                currentSubLayer.removeLayer(currentMarker);

                                                if(currentMarker.options.extraPattern !== undefined)
                                                {
                                                    currentSubLayer.removeLayer(currentMarker.options.extraPattern);
                                                }
                                                if(currentMarker.options.extraMarker !== undefined)
                                                {
                                                    currentSubLayer.removeLayer(currentMarker.options.extraMarker);
                                                }
                                                if(currentMarker.options.haloMarker !== undefined)
                                                {
                                                    this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(currentMarker.options.haloMarker);
                                                }

                                                if(layerId === 'playerVehiculesLayer')
                                                {
                                                    let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', layerId);
                                                        if(vehicleTrackData !== null)
                                                        {
                                                            currentSubLayer.removeLayer(vehicleTrackData);
                                                        }
                                                }
                                            }
                                            else
                                            {
                                                if(currentSubLayer.hasLayer(currentMarker) === false && this.playerLayers[layerId].filters.includes(currentClassName) === false)
                                                {
                                                    let addToSubLayer = true;
                                                        if(this.playerLayersNotUsingAltitude.includes(layerId) === false)
                                                        {
                                                            if(currentObject.transform.translation[2] < ($('#altitudeSliderInputs input[name=minAltitude]').val() * 100) || currentObject.transform.translation[2] > ($('#altitudeSliderInputs input[name=maxAltitude]').val() * 100))
                                                            {
                                                                addToSubLayer = false;
                                                            }
                                                        }
                                                        if(currentClassName === '/Game/FactoryGame/Character/Creature/Enemy/CrabHatcher/Char_CrabHatcher.Char_CrabHatcher_C')
                                                        {
                                                            let currentObject = this.saveGameParser.getTargetObject(currentMarker.options.pathName);
                                                                if(currentObject !== null)
                                                                {
                                                                    let mCurrentHealth  = this.getObjectProperty(currentObject, 'mCurrentHealth');
                                                                        if(mCurrentHealth !== null && mCurrentHealth === 0)
                                                                        {
                                                                            addToSubLayer = false;
                                                                        }
                                                                }
                                                        }

                                                        if(addToSubLayer === true)
                                                        {
                                                            currentSubLayer.addLayer(currentMarker);

                                                            if(currentMarker.options.extraPattern !== undefined)
                                                            {
                                                                currentSubLayer.addLayer(currentMarker.options.extraPattern);
                                                            }
                                                            if(currentMarker.options.extraMarker !== undefined)
                                                            {
                                                                currentSubLayer.addLayer(currentMarker.options.extraMarker);
                                                            }
                                                            if(currentMarker.options.haloMarker !== undefined)
                                                            {
                                                                this.playerLayers.playerLightsHaloLayer.subLayer.addLayer(currentMarker.options.haloMarker);
                                                            }

                                                            if(layerId === 'playerVehiculesLayer')
                                                            {
                                                                let trackDataFilterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hasClass("btn-warning");
                                                                    if(trackDataFilterStatus)
                                                                    {
                                                                        let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', layerId);
                                                                            if(vehicleTrackData !== null)
                                                                            {
                                                                                currentSubLayer.addLayer(vehicleTrackData);
                                                                            }
                                                                    }
                                                            }
                                                        }
                                                }
                                            }
                                        }
                                    }
                            }
                        }
                    }

                    // Redraw to keep layer order...
                    if(isHiding === false && ['playerLightsHaloLayer', 'playerFogOfWar'].includes(updateLayerId) === false)
                    {
                        if(this.playerLayers[layerId].layerGroup.hasLayer(this.playerLayers[layerId].subLayer))
                        {
                            if(this.playerLayers[layerId].subLayer.bringToFront !== undefined)
                            {
                                this.playerLayers[layerId].subLayer.bringToFront();
                            }
                            else
                            {
                                this.playerLayers[layerId].layerGroup.removeLayer(this.playerLayers[layerId].subLayer)
                                                                     .addLayer(this.playerLayers[layerId].subLayer);
                            }
                        }
                    }
                }
            }
    }

    updateAltitudeLayers(minAltitude, maxAltitude)
    {
        for(let layerId in this.playerLayers)
        {
            if(this.playerLayers[layerId].subLayer !== null && this.playerLayersNotUsingAltitude.includes(layerId) === false)
            {
                let currentSubLayer     = this.playerLayers[layerId].subLayer;
                let currentLayerLength  = this.playerLayers[layerId].elements.length;

                for(let i = 0; i < currentLayerLength; i++)
                {
                    let currentMarker   = this.playerLayers[layerId].elements[i];
                    let currentObject   = this.saveGameParser.getTargetObject(currentMarker.options.pathName);

                    if(currentObject !== null)
                    {
                        if(currentSubLayer.hasLayer(currentMarker) && (currentObject.transform.translation[2] < minAltitude || currentObject.transform.translation[2] > maxAltitude))
                        {
                            currentSubLayer.removeLayer(currentMarker);

                            if(currentMarker.options.extraPattern !== undefined)
                            {
                                currentSubLayer.removeLayer(currentMarker.options.extraPattern);
                            }
                            if(currentMarker.options.extraMarker !== undefined)
                            {
                                currentSubLayer.removeLayer(currentMarker.options.extraMarker);
                            }
                            if(currentMarker.options.haloMarker !== undefined)
                            {
                                this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(currentMarker.options.haloMarker);
                            }

                            if(layerId === 'playerVehiculesLayer')
                            {
                                let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', layerId);
                                    if(vehicleTrackData !== null)
                                    {
                                        currentSubLayer.removeLayer(vehicleTrackData);
                                    }
                            }
                        }
                        else
                        {
                            if(currentSubLayer.hasLayer(currentMarker) === false && currentObject.transform.translation[2] >= minAltitude && currentObject.transform.translation[2] <= maxAltitude)
                            {
                                if(this.playerLayers[layerId].filtersCount !== undefined && currentMarker.options.pathName !== undefined)
                                {
                                    let currentObject = this.saveGameParser.getTargetObject(currentMarker.options.pathName);
                                        if(currentObject !== null)
                                        {
                                            let filterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((currentObject.className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : currentObject.className) + '"]').hasClass("btn-warning");
                                                if(filterStatus)
                                                {
                                                    currentSubLayer.addLayer(currentMarker);

                                                    if(currentMarker.options.extraPattern !== undefined)
                                                    {
                                                        currentSubLayer.addLayer(currentMarker.options.extraPattern);
                                                    }
                                                    if(currentMarker.options.extraMarker !== undefined)
                                                    {
                                                        currentSubLayer.addLayer(currentMarker.options.extraMarker);
                                                    }
                                                    if(currentMarker.options.haloMarker !== undefined)
                                                    {
                                                        this.playerLayers.playerLightsHaloLayer.subLayer.addLayer(currentMarker.options.haloMarker);
                                                    }

                                                    if(layerId === 'playerVehiculesLayer')
                                                    {
                                                        let trackDataFilterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hasClass("btn-warning");
                                                            if(trackDataFilterStatus)
                                                            {
                                                                let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', layerId);
                                                                    if(vehicleTrackData !== null)
                                                                    {
                                                                        currentSubLayer.addLayer(vehicleTrackData);
                                                                    }
                                                            }
                                                    }
                                                }
                                        }
                                }
                                else
                                {
                                    currentSubLayer.addLayer(currentMarker);

                                    if(currentMarker.options.extraPattern !== undefined)
                                    {
                                        currentSubLayer.addLayer(currentMarker.options.extraPattern);
                                    }
                                    if(currentMarker.options.extraMarker !== undefined)
                                    {
                                        currentSubLayer.addLayer(currentMarker.options.extraMarker);

                                        let trackDataFilterStatus = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="/Game/SCIM/Buildable/Vehicle/TrackData"]').hasClass("btn-warning");
                                            if(trackDataFilterStatus)
                                            {
                                                let vehicleTrackData = this.getMarkerFromPathName(currentMarker.options.pathName + '_vehicleTrackData', 'playerVehiculesLayer');
                                                    if(vehicleTrackData !== null)
                                                    {
                                                        currentSubLayer.addLayer(vehicleTrackData);
                                                    }
                                            }
                                    }
                                    if(currentMarker.options.haloMarker !== undefined)
                                    {
                                        this.playerLayers.playerLightsHaloLayer.subLayer.addLayer(currentMarker.options.haloMarker);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if(layerId === 'playerRadioactivityLayer')
            {
                if(this.playerLayers.playerRadioactivityLayer.subLayer !== null)
                {
                    let allElements         = this.playerLayers[layerId].elements;
                    let radioActiveElements = {};

                    for(let pathName in allElements)
                    {
                        let currentElement = allElements[pathName];
                            if(currentElement.altitude >= (minAltitude - (currentElement.maxDistance * 100)) && currentElement.altitude <= (maxAltitude + (currentElement.maxDistance * 100)))
                            {
                                //TODO: Update intensity based on altitude...
                                /*
                                if(currentElement.altitude < minAltitude)
                                {
                                    let ratio = Math.abs(currentElement.altitude - minAltitude) / (Math.abs(currentElement.altitude) + (currentElement.maxDistance * 100));
                                    console.log(ratio);

                                    //currentElement.radius *= ratio;
                                }
                                if(currentElement.altitude > maxAltitude)
                                {
                                    console.log('MAX', minAltitude, currentElement);
                                }
                                */

                                radioActiveElements[pathName] = currentElement;
                            }
                    }

                    this.playerLayers.playerRadioactivityLayer.subLayer.setData({data: radioActiveElements});
                }
            }
        }

        // Refresh MapMarkers layers to push them on top
        for(let index in this.satisfactoryMap.activeLayers)
        {
            let layerId = this.satisfactoryMap.activeLayers[index];
                this.satisfactoryMap.leafletMap.removeLayer(this.satisfactoryMap.availableLayers[layerId]);
                this.satisfactoryMap.leafletMap.addLayer(this.satisfactoryMap.availableLayers[layerId]);
        }
    }

    // Inventory
    getObjectInventory(currentObject, inventoryPropertyName = 'mInventory', raw = false)
    {
        let inventory = this.getObjectProperty(currentObject, inventoryPropertyName);
            if(inventory !== null)
            {
                let inventoryObject = this.saveGameParser.getTargetObject(inventory.pathName);
                    if(inventoryObject !== null)
                    {
                        if(raw === false)
                        {
                            return this.getObjectTargetInventory(inventoryObject);
                        }
                        else
                        {
                            return inventoryObject;
                        }
                    }
            }

        if(raw === false)
        {
            return [];
        }

        return null;
    }

    getObjectRadioactivity(currentObject, inventoryPropertyName = 'mInventory')
    {
        if(this.useRadioactivity === true)
        {
            let inventoryPathName = this.getObjectProperty(currentObject, inventoryPropertyName);
                if(inventoryPathName !== null)
                {
                    let inventoryObject = this.saveGameParser.getTargetObject(inventoryPathName.pathName);
                        if(inventoryObject !== null)
                        {
                            let mInventoryStacks = this.getObjectProperty(inventoryObject, 'mInventoryStacks');
                                if(mInventoryStacks !== null)
                                {
                                    let radioactivityItems  = [];
                                        for(let k = 0; k < mInventoryStacks.values.length; k++)
                                        {
                                            if(mInventoryStacks.values[k][0].value.itemName.pathName !== '')
                                            {
                                                // Rename item
                                                let currentItemData = this.getItemDataFromClassName(mInventoryStacks.values[k][0].value.itemName.pathName, false);
                                                    if(currentItemData !== null)
                                                    {
                                                        if(currentItemData.radioactiveDecay !== undefined)
                                                        {
                                                            radioactivityItems.push({
                                                                qty                 : mInventoryStacks.values[k][0].value.properties[0].value,
                                                                radioactiveDecay    : currentItemData.radioactiveDecay
                                                            });
                                                        }
                                                    }
                                            }
                                        }

                                        if(radioactivityItems.length > 0)
                                        {
                                            this.addRadioactivityDot(currentObject, radioactivityItems);
                                        }

                                        return;
                                }
                        }
                }
        }

        return;
    }

    getObjectTargetInventory(currentObject)
    {
        let inventory               = [];
        let mInventoryStacks        = this.getObjectProperty(currentObject, 'mInventoryStacks');
            if(mInventoryStacks !== null)
            {
                let mActiveEquipmentIndex   = this.getObjectProperty(currentObject, 'mActiveEquipmentIndex');

                for(let k = 0; k < mInventoryStacks.values.length; k++)
                {
                    if(mInventoryStacks.values[k][0].value.itemName.pathName !== '')
                    {
                        // Rename item
                        let currentItemData = this.getItemDataFromClassName(mInventoryStacks.values[k][0].value.itemName.pathName);
                            if(currentItemData !== null)
                            {
                                inventory.push({
                                    rawClassName    : mInventoryStacks.values[k][0].value.itemName.pathName,
                                    className       : currentItemData.className,
                                    category        : currentItemData.category,
                                    name            : currentItemData.name,
                                    image           : currentItemData.image,
                                    qty             : mInventoryStacks.values[k][0].value.properties[0].value,
                                    isActive        : ((mActiveEquipmentIndex !== null && mActiveEquipmentIndex === k) ? true : false)
                                });
                            }
                    }
                    else
                    {
                        inventory.push(null);
                    }
                }
            }

        return inventory;
    }

    setInventoryTableSlot(inventory, maxSlot = null, cellWidth = 48, extraClass = '', nullItemImage = null, maxInLine = 8)
    {
        let html        = '';
            if(maxSlot === null)
            {
                maxSlot = inventory.length;
            }

        for(let i = 0; i < maxSlot; i++)
        {
            if(i === 0)
            {
                html += '<div class="d-flex flex-row ' + extraClass + '">';
            }

            if(inventory[i] !== undefined)
            {
                if(inventory[i] !== null)
                {
                    html += this.getInventoryImage(inventory[i], cellWidth);
                }
                else
                {
                    if(nullItemImage !== null)
                    {
                        html += '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border-radius: 5px;padding: 6px;background-color: #cecdcd;">';
                        html += '<img src="' + nullItemImage + '" class="img-fluid" style="opacity: 0.2;" />';
                        html += '</div>';
                    }
                    else
                    {
                        html += '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border-radius: 5px;padding: 6px;background-color: #cecdcd;"></div>';
                    }
                }
            }
            else
            {
                html += '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border-radius: 5px;padding: 6px;background-color: #cecdcd;"></div>';
            }

            if((i+1) % maxInLine === 0 || (i + 1) === maxSlot)
            {
                html += '</div>';

                if((i + 1) !== maxSlot)
                {
                    html += '<div class="d-flex flex-row ' + extraClass + '">';
                }
            }
        }

        return html;
    }

    getInventoryImage(inventory, cellWidth = 48, badgeClass = 'badge-warning')
    {
        if(inventory === null || inventory === undefined)
        {
            return '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border-radius: 5px;padding: 6px;background-color: #cecdcd;"></div>';
        }

        let itemQty         = (inventory.qty !== undefined) ? inventory.qty : null;
        let itemUnits       = '';
        let itemStyle       = 'border-radius: 5px;';
        let itemBackground  = '#cecdcd';
            if(itemQty !== null && inventory.category !== undefined && (inventory.category === 'liquid' || inventory.category === 'gas'))
            {
                itemQty     = Math.round(Math.round(itemQty) / 1000);
                itemUnits   = 'm³';
                itemStyle   = 'border-radius: 50%;';
            }
            if(inventory.backgroundColor !== undefined)
            {
                itemBackground = inventory.backgroundColor;
            }

        if(inventory.isNulled !== undefined && inventory.isNulled === true)
        {
            let html = '';
                html += '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;border-radius: 5px;padding: 6px;background-color: #cecdcd;">';
                html += '<img src="' + inventory.image + '" class="img-fluid" style="opacity: 0.2;" />';
                if(itemQty !== null)
                {
                    html += '<span class="badge ' + badgeClass + ' align-middle" style="position: absolute;bottom: -2px; right: -2px;background-color: #676768;color: #FFFFFF;">' + new Intl.NumberFormat(this.language).format(itemQty) + itemUnits + '</span>';
                }
                html += '</div>';

            return html;
        }


        let isActiveStyle   = 'padding: 6px;';
            if(inventory.isActive !== undefined && inventory.isActive === true)
            {
                isActiveStyle   = 'border: 3px solid #F39C12;padding: 3px;';
            }

        let html = '';
            html += '<div class="d-flex flex-row" style="position:relative;margin: 1px;width: ' + cellWidth + 'px;height: ' + cellWidth + 'px;' + isActiveStyle + itemStyle + 'background-color: ' + itemBackground + ';"';

            if(inventory.name !== undefined)
            {
                html += ' data-hover="tooltip" title="' + inventory.name + '"';
            }

            html += '>';
            html += '<img src="' + inventory.image + '" class="img-fluid" />';
            if(itemQty !== null)
            {
                html += '<span class="badge ' + badgeClass + ' align-middle" style="position: absolute;bottom: -2px; right: -2px;">' + new Intl.NumberFormat(this.language).format(itemQty) + itemUnits + '</span>';
            }
            html += '</div>';

        return html;
    }

    setBadgeLayerCount(layerId)
    {
        let currentLayerLength  = this.playerLayers[layerId].elements.length;
        let currentLayerSuffix  = '';

        if(this.playerLayers[layerId].count !== undefined)
        {
            currentLayerLength = this.playerLayers[layerId].count;
        }
        if(this.playerLayers[layerId].distance !== undefined)
        {
            if(this.playerLayers[layerId].distance < 1000)
            {
                currentLayerLength  = Math.round(this.playerLayers[layerId].distance);
                currentLayerSuffix  = '<small><em>m</em></small>';
            }
            else
            {
                currentLayerLength  = Math.round((this.playerLayers[layerId].distance / 1000) * 100) / 100;
                currentLayerSuffix  = '<small><em>km</em></small>';
            }
        }

        $('.updatePlayerLayerState[data-id=' + layerId + '] > .badge-layer').html(
            new Intl.NumberFormat(this.language)
                    .format(currentLayerLength) + currentLayerSuffix
        );

        if(this.playerLayers[layerId].filtersCount !== undefined)
        {
            for(let className in this.playerLayers[layerId].filtersCount)
            {
                // Show filter icons
                let filterIcon      = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : className) + '"]');
                let showByDefault   = filterIcon.attr('data-default');
                    if(showByDefault !== undefined && showByDefault === 'false')
                    {
                        this.updatePlayerLayerFilter(filterIcon, layerId, className);
                    }

                    filterIcon.find('img[data-src]').each(function(){
                        $(this).attr('src', $(this).attr('data-src')).removeAttr('data-src');
                    });
                    filterIcon.show();

                if(this.playerLayers[layerId].filtersCount[className].distance !== undefined)
                {
                    if(this.playerLayers[layerId].filtersCount[className].distance < 1000)
                    {
                        currentLayerLength  = Math.round(this.playerLayers[layerId].filtersCount[className].distance);
                        currentLayerSuffix  = '<small><em>m</em></small>';
                    }
                    else
                    {
                        currentLayerLength  = Math.round((this.playerLayers[layerId].filtersCount[className].distance / 1000) * 100) / 100;
                        currentLayerSuffix  = '<small><em>km</em></small>';
                    }

                    $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : className) + '"] > .badge-layer').html(
                        new Intl.NumberFormat(this.language)
                                .format(currentLayerLength) + currentLayerSuffix
                    );
                }
                else
                {
                    $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter[data-filter="' + ((className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C') ? '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C' : className) + '"] > .badge-layer').html(
                        new Intl.NumberFormat(this.language)
                                .format(this.playerLayers[layerId].filtersCount[className])// + currentLayerSuffix
                    );
                }
            }

            let currentLength = $('.updatePlayerLayerState[data-id=' + layerId + '] .updatePlayerLayerFilter:not([style*="display: none"])').length;
                $('.updatePlayerLayerState[data-id=' + layerId + '] .radial').css('width', ((currentLength * 60) + 10) + 'px');
                $('.updatePlayerLayerState[data-id=' + layerId + '] .radial > div').css('width', ((currentLength * 60) + 10) + 'px');
        }
    }

    updateDelayedBadgeCount()
    {
        if(this.delayedBadgeCount !== null)
        {
            for(let i = 0; i < this.delayedBadgeCount.length; i++)
            {
                this.setBadgeLayerCount(this.delayedBadgeCount[i]);
            }

            this.delayedBadgeCount = null;
        }
    }

    updateObjectProductionPausedStatus(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let isProductionPaused  = baseLayout.getObjectProperty(currentObject, 'mIsProductionPaused');

            // GENERATOR
            if(buildingData !== null && buildingData.category === 'generator' && buildingData.powerGenerated !== undefined)
            {
                let currentObjectPowerInfo = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + '.powerInfo');
                    if(currentObjectPowerInfo !== null)
                    {
                        switch(currentObject.className)
                        {
                            case '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C':
                                if(isProductionPaused === null)
                                {
                                    baseLayout.setObjectProperty(currentObjectPowerInfo, 'mBaseProduction', 0, 'Float');
                                }
                                else
                                {
                                    baseLayout.setObjectProperty(currentObjectPowerInfo, 'mBaseProduction', buildingData.powerGenerated.normal[1], 'Float');

                                    let resourceNode     = baseLayout.getObjectProperty(currentObject, 'mExtractableResource');
                                        if(resourceNode !== null)
                                        {
                                            if(baseLayout.satisfactoryMap.collectableMarkers !== undefined && baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName] !== undefined)
                                            {
                                                if(baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity !== undefined)
                                                {
                                                    if(buildingData !== null && buildingData.powerGenerated[baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity] !== undefined)
                                                    {
                                                        baseLayout.setObjectProperty(
                                                            currentObjectPowerInfo,
                                                            'mBaseProduction',
                                                            (buildingData.powerGenerated[baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity][1] + buildingData.powerGenerated[baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity][0]) / 2,
                                                            'Float'
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                }
                                break;
                            default:
                                if(isProductionPaused === null)
                                {
                                    baseLayout.deleteObjectProperty(currentObjectPowerInfo, 'mDynamicProductionCapacity');
                                }
                                else
                                {
                                    baseLayout.setObjectProperty(currentObjectPowerInfo, 'mDynamicProductionCapacity', buildingData.powerGenerated, 'Float');
                                }
                        }
                    }
            }

            // PRODUCTION
            if(buildingData !== null && buildingData.powerUsed !== undefined)
            {
                let currentObjectPowerInfo  = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + '.powerInfo');
                    if(currentObjectPowerInfo !== null)
                    {
                        if(isProductionPaused === null)
                        {
                            baseLayout.setObjectProperty(currentObjectPowerInfo, 'mTargetConsumption', 0, 'Float');
                        }
                        else
                        {
                            baseLayout.setObjectProperty(currentObjectPowerInfo, 'mTargetConsumption', buildingData.powerUsed, 'Float');
                        }
                    }
            }

            // STATE
            if(isProductionPaused === null)
            {
                baseLayout.setObjectProperty(currentObject, 'mIsProductionPaused', 1, 'Bool');
            }
            else
            {
                baseLayout.deleteObjectProperty(currentObject, 'mIsProductionPaused');
            }

            // LIGHT
            if(buildingData !== null && buildingData.category === 'light')
            {
                baseLayout.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});
            }
    }

    getObjectProperty(currentObject, propertyName, defaultPropertyValue = null)
    {
        if(currentObject!== null && currentObject.properties !== undefined)
        {
            let currentObjectPropertiesLength = currentObject.properties.length;
                for(let i = 0; i < currentObjectPropertiesLength; i++)
                {
                    if(currentObject.properties[i].name === propertyName)
                    {
                        if(currentObject.properties[i].value === undefined && currentObject.properties[i].sourceFmt !== undefined)
                        {
                            let value = currentObject.properties[i].sourceFmt.value;
                                for(let j = 0; j < currentObject.properties[i].arguments.length; j++)
                                {
                                    value = value.replace('{' + currentObject.properties[i].arguments[j].name + '}', currentObject.properties[i].arguments[j].argumentValue.value)
                                }

                            return value;
                        }

                        return currentObject.properties[i].value;
                    }
                }
        }

        if(currentObject!== null && currentObject.values !== undefined)
        {
            let currentObjectPropertiesLength = currentObject.values.length;
                for(let i = 0; i < currentObjectPropertiesLength; i++)
                {
                    if(currentObject.values[i].name === propertyName)
                    {
                        return currentObject.values[i].value;
                    }
                }
        }

        return defaultPropertyValue;
    }

    setObjectProperty(currentObject, propertyName, propertyValue, propertyType = null)
    {
        if(currentObject!== null && currentObject.properties !== undefined)
        {
            let currentObjectPropertiesLength = currentObject.properties.length;
                for(let j = 0; j < currentObjectPropertiesLength; j++)
                {
                    if(currentObject.properties[j].name === propertyName)
                    {
                        currentObject.properties[j].value = propertyValue;
                        return;
                    }
                }

            // Property not found, add it!
            if(propertyType !== null)
            {
                currentObject.properties.push({
                    name: propertyName,
                    type: propertyType,
                    value: propertyValue
                });
            }

            return;
        }

        if(currentObject!== null && currentObject.values !== undefined)
        {
            let currentObjectPropertiesLength = currentObject.values.length;
                for(let j = 0; j < currentObjectPropertiesLength; j++)
                {
                    if(currentObject.values[j].name === propertyName)
                    {
                        currentObject.values[j].value = propertyValue;
                        return;
                    }
                }

            // Property not found, add it!
            if(propertyType !== null)
            {
                currentObject.values.push({
                    name: propertyName,
                    type: propertyType,
                    value: propertyValue
                });
            }
        }

        return;
    }

    deleteObjectProperty(currentObject, propertyName)
    {
        if(currentObject!== null && currentObject.properties !== undefined)
        {
            let currentObjectPropertiesLength = currentObject.properties.length;
                for(let j = 0; j < currentObjectPropertiesLength; j++)
                {
                    if(currentObject.properties[j].name === propertyName)
                    {
                        currentObject.properties.splice(j, 1);
                        return;
                    }
                }

            return;
        }

        if(currentObject!== null && currentObject.values !== undefined)
        {
            let currentObjectPropertiesLength = currentObject.values.length;
                for(let j = 0; j < currentObjectPropertiesLength; j++)
                {
                    if(currentObject.values[j].name === propertyName)
                    {
                        currentObject.values.splice(j, 1);
                        return;
                    }
                }
        }

        return;
    }

    getItemDataFromRecipe(currentObject, propertyName = 'mCurrentRecipe')
    {
        let recipe              = this.getObjectProperty(currentObject, propertyName);
            if(recipe !== null)
            {
                // Extract recipe name
                let recipeName = recipe.pathName.split('.')[1];
                    if(this.recipesData[recipeName] !== undefined) //TODO: Bypass mod override?! ('|#|')
                    {
                        return this.recipesData[recipeName];
                    }
                    else
                    {
                        let fromClassName =  this.getRecipeFromClassName(recipe.pathName);
                            if(fromClassName !== null)
                            {
                                return fromClassName;
                            }

                        console.log('Recipe not found?', recipeName, currentObject);
                    }
            }

        return null;
    }

    getRecipeDataFromProducedClassName(className)
    {
        className = className.replace('Build_', 'Desc_').replace('Build_', 'Desc_');

        for(let recipeId in this.recipesData)
        {
            if(this.recipesData[recipeId].produce !== undefined && this.recipesData[recipeId].produce[className] !== undefined)
            {
                return this.recipesData[recipeId];
            }
        }

        return null;
    }

    getRecipeFromClassName(className)
    {
        for(let recipeId in this.recipesData)
        {
            if(this.recipesData[recipeId].className !== undefined && this.recipesData[recipeId].className === className)
            {
                return this.recipesData[recipeId];
            }
        }

        if(typeof Sentry !== 'undefined' && this.useDebug === true)
        {
            Sentry.setContext('className', {className: className});
            Sentry.captureMessage('Missing recipe className: ' + className);
        }

        console.log('Missing recipe className', className);

        return null;
    }

    getItemDataFromClassName(className, debugToConsole = true)
    {
        if(className === '/Game/FactoryGame/World/Benefit/NutBush/BP_NutBush.BP_NutBush_C'){ className = '/Game/FactoryGame/Resource/Environment/Nut/Desc_Nut.Desc_Nut_C'; }
        if(className === '/Game/FactoryGame/World/Benefit/BerryBush/BP_BerryBush.BP_BerryBush_C'){ className = '/Game/FactoryGame/Resource/Environment/Berry/Desc_Berry.Desc_Berry_C'; }
        if(className === '/Game/FactoryGame/World/Benefit/Mushroom/BP_Shroom_01.BP_Shroom_01_C'){ className = '/Game/FactoryGame/Resource/Environment/DesertShroom/Desc_Shroom.Desc_Shroom_C'; }

        if(className === '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal.BP_Crystal_C'){ className = '/Game/FactoryGame/Resource/Environment/Crystal/Desc_Crystal.Desc_Crystal_C'; }
        if(className === '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk2.BP_Crystal_mk2_C'){ className = '/Game/FactoryGame/Resource/Environment/Crystal/Desc_Crystal_mk2.Desc_Crystal_mk2_C'; }
        if(className === '/Game/FactoryGame/Resource/Environment/Crystal/BP_Crystal_mk3.BP_Crystal_mk3_C'){ className = '/Game/FactoryGame/Resource/Environment/Crystal/Desc_Crystal_mk3.Desc_Crystal_mk3_C'; }

        if(className === '/Game/FactoryGame/Prototype/WAT/BP_WAT1.BP_WAT1_C'){ className = '/Game/FactoryGame/Prototype/WAT/Desc_WAT1.Desc_WAT1_C'; }
        if(className === '/Game/FactoryGame/Prototype/WAT/BP_WAT2.BP_WAT2_C'){ className = '/Game/FactoryGame/Prototype/WAT/Desc_WAT2.Desc_WAT2_C'; }

        if(className === '/Game/FactoryGame/Resource/RawResources/CrudeOil/Desc_CrudeOil.Desc_CrudeOil_C'){ className = '/Game/FactoryGame/Resource/RawResources/CrudeOil/Desc_LiquidOil.Desc_LiquidOil_C'; }
        if(className === '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C'){ className = '/Game/FactoryGame/Resource/Equipment/PortableMiner/BP_ItemDescriptorPortableMiner.BP_ItemDescriptorPortableMiner_C'; }
        if(className === '/Game/FactoryGame/Resource/Environment/AnimalParts/BP_AlphaSpitterParts.BP_AlphaSpitterParts_C'){ className = '/Game/FactoryGame/Resource/Parts/AnimalParts/Desc_SpitterParts.Desc_SpitterParts_C'; }

        if(className === '/Game/FactoryGame/Equipment/BoomBox/BP_BoomBoxPlayer.BP_BoomBoxPlayer_C'){ className = '/Game/FactoryGame/Equipment/BoomBox/Desc_BoomBox.Desc_BoomBox_C'; }

        if(this.itemsData[className] !== undefined)
        {
            this.itemsData[className].id = className;
            return this.itemsData[className];
        }
        for(let i in this.itemsData)
        {
            if(this.itemsData[i].className !== undefined && this.itemsData[i].className === className)
            {
                this.itemsData[i].id = i;
                return this.itemsData[i];
            }
        }
        if(this.toolsData[className] !== undefined)
        {
            this.toolsData[className].id = className;
            return this.toolsData[className];
        }
        for(let i in this.toolsData)
        {
            if(this.toolsData[i].className !== undefined && this.toolsData[i].className === className)
            {
                this.toolsData[i].id = i;
                return this.toolsData[i];
            }
        }

        // Add fake mod object...
        let moddedItem = {
                className   : className,
                name        : className.split('/').pop(),
                category    : 'mods',
                image       : 'https://static.satisfactory-calculator.com/img/mapUnknownIcon.png'
        };

        this.itemsData[className.split('.').pop()] = moddedItem;

        if(debugToConsole === true)
        {
            if(typeof Sentry !== 'undefined' && this.useDebug === true)
            {
                Sentry.captureMessage('Missing item className: ' + className);
            }

            console.log('Missing item className', className);
        }

        return moddedItem;
    }
    getItemDataFromId(itemId)
    {
        if(this.itemsData[itemId] !== undefined)
        {
            return this.itemsData[itemId];
        }
        if(this.toolsData[itemId] !== undefined)
        {
            return this.toolsData[itemId];
        }

        console.log('Missing item itemId', itemId);

        return null;
    }

    getBuildingDataFromId(buildingId)
    {
        if(this.buildingsData[buildingId] !== undefined)
        {
            return this.buildingsData[buildingId];
        }

        return null;
    }

    getBuildingDataFromClassName(className)
    {
        if(className === null)
        {
            return null;
        }
        if(this.buildingDataClassNameHashTable[className] !== undefined)
        {
            return this.buildingsData[this.buildingDataClassNameHashTable[className]];
        }

        if(className === '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorBiomass.Build_GeneratorBiomass_C'){ className = '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorBiomass_Automated.Build_GeneratorBiomass_Automated_C'; }
        if(className === '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorIntegratedBiomass.Build_GeneratorIntegratedBiomass_C'){ className = '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorBiomass_Automated.Build_GeneratorBiomass_Automated_C'; }
        if(className === '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StorageIntegrated.Build_StorageIntegrated_C'){ className = '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StoragePlayer.Build_StoragePlayer_C'; }
        if(className === '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StorageBlueprint.Build_StorageBlueprint_C'){ className = '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StoragePlayer.Build_StoragePlayer_C'; }
        if(className === '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTrun.Build_WalkwayTrun_C'){ className = '/Game/FactoryGame/Buildable/Building/Walkway/Build_WalkwayTurn.Build_WalkwayTurn_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Tractor/Desc_Tractor.Desc_Tractor_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Truck/Desc_Truck.Desc_Truck_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Explorer/Desc_Explorer.Desc_Explorer_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Testa_BP_WB.Testa_BP_WB_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Desc_CyberWagon.Desc_CyberWagon_C'; }
        if(className === '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C'){ className = '/Game/FactoryGame/Buildable/Factory/DroneStation/Desc_DroneTransport.Desc_DroneTransport_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/Desc_Locomotive.Desc_Locomotive_C'; }
        if(className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C'){ className = '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/Desc_FreightWagon.Desc_FreightWagon_C'; }
        if(className === '/Game/FactoryGame/Buildable/Factory/JumpPad/Build_JumpPad.Build_JumpPad_C'){ className = '/Game/FactoryGame/Buildable/Factory/JumpPad/Build_JumpPadAdjustable.Build_JumpPadAdjustable_C'; }

        // Create fake angled railings with new width
        if(this.buildingsData.Build_SM_RailingRamp_8x4_01_C === undefined && this.buildingsData.Build_Railing_01_C !== undefined)
        {
            this.buildingsData.Build_SM_RailingRamp_8x4_01_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Railing_01_C));
            this.buildingsData.Build_SM_RailingRamp_8x4_01_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_SM_RailingRamp_8x4_01.Build_SM_RailingRamp_8x4_01_C';
            this.buildingsData.Build_SM_RailingRamp_8x4_01_C.length     = 8;

            this.buildingsData.Build_SM_RailingRamp_8x2_01_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Railing_01_C));
            this.buildingsData.Build_SM_RailingRamp_8x2_01_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_SM_RailingRamp_8x2_01.Build_SM_RailingRamp_8x2_01_C';
            this.buildingsData.Build_SM_RailingRamp_8x2_01_C.length     = 8;

            this.buildingsData.Build_SM_RailingRamp_8x1_01_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Railing_01_C));
            this.buildingsData.Build_SM_RailingRamp_8x1_01_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_SM_RailingRamp_8x1_01.Build_SM_RailingRamp_8x1_01_C';
            this.buildingsData.Build_SM_RailingRamp_8x1_01_C.length     = 8;
        }
        if(this.buildingsData.Build_FenceRamp_8x4_L_C === undefined && this.buildingsData.Build_Fence_01_C !== undefined)
        {
            this.buildingsData.Build_FenceRamp_8x4_L_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Fence_01_C));
            this.buildingsData.Build_FenceRamp_8x4_L_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_FenceRamp_8x4_L.Build_FenceRamp_8x4_L_C';
            this.buildingsData.Build_FenceRamp_8x4_L_C.length     = 8;
        }
        if(this.buildingsData.Build_FenceRamp_8x2_L_C === undefined && this.buildingsData.Build_Fence_01_C !== undefined)
        {
            this.buildingsData.Build_FenceRamp_8x2_L_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Fence_01_C));
            this.buildingsData.Build_FenceRamp_8x2_L_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_FenceRamp_8x2_L.Build_FenceRamp_8x2_L_C';
            this.buildingsData.Build_FenceRamp_8x2_L_C.length     = 8;
        }
        if(this.buildingsData.Build_FenceRamp_8x1_L_C === undefined && this.buildingsData.Build_Fence_01_C !== undefined)
        {
            this.buildingsData.Build_FenceRamp_8x1_L_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Fence_01_C));
            this.buildingsData.Build_FenceRamp_8x1_L_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_FenceRamp_8x1_L.Build_FenceRamp_8x1_L_C';
            this.buildingsData.Build_FenceRamp_8x1_L_C.length     = 8;
        }
        if(this.buildingsData.Build_FenceRamp_8x4_R_C === undefined && this.buildingsData.Build_Fence_01_C !== undefined)
        {
            this.buildingsData.Build_FenceRamp_8x4_R_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Fence_01_C));
            this.buildingsData.Build_FenceRamp_8x4_R_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_FenceRamp_8x4_R.Build_FenceRamp_8x4_R_C';
            this.buildingsData.Build_FenceRamp_8x4_R_C.length     = 8;
        }
        if(this.buildingsData.Build_FenceRamp_8x2_R_C === undefined && this.buildingsData.Build_Fence_01_C !== undefined)
        {
            this.buildingsData.Build_FenceRamp_8x2_R_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Fence_01_C));
            this.buildingsData.Build_FenceRamp_8x2_R_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_FenceRamp_8x2_R.Build_FenceRamp_8x2_R_C';
            this.buildingsData.Build_FenceRamp_8x2_R_C.length     = 8;
        }
        if(this.buildingsData.Build_FenceRamp_8x1_R_C === undefined && this.buildingsData.Build_Fence_01_C !== undefined)
        {
            this.buildingsData.Build_FenceRamp_8x1_R_C            = JSON.parse(JSON.stringify(this.buildingsData.Build_Fence_01_C));
            this.buildingsData.Build_FenceRamp_8x1_R_C.className  = '/Game/FactoryGame/Buildable/Building/Fence/Build_FenceRamp_8x1_R.Build_FenceRamp_8x1_R_C';
            this.buildingsData.Build_FenceRamp_8x1_R_C.length     = 8;
        }

        // Add equipment vehicles
        if(this.buildingsData.Desc_GolfCart_C === undefined && this.toolsData.Desc_GolfCart_C !== undefined)
        {
            this.buildingsData.Desc_GolfCart_C                  = JSON.parse(JSON.stringify(this.toolsData.Desc_GolfCart_C));
            this.buildingsData.Desc_GolfCart_C.className        = '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C';
            this.buildingsData.Desc_GolfCart_C.category         = 'vehicle';
        }
        if(this.buildingsData.Desc_GolfcartGold_C === undefined && this.toolsData.Desc_GolfCartGold_C !== undefined)
        {
            this.buildingsData.Desc_GolfcartGold_C              = JSON.parse(JSON.stringify(this.toolsData.Desc_GolfCartGold_C));
            this.buildingsData.Desc_GolfcartGold_C.className    = '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_GolfcartGold.BP_GolfcartGold_C';
            this.buildingsData.Desc_GolfcartGold_C.category     = 'vehicle';
        }
        if(this.buildingsData.Desc_BoomBox_C === undefined && this.toolsData.Desc_BoomBox_C !== undefined)
        {
            this.buildingsData.Desc_BoomBox_C                   = JSON.parse(JSON.stringify(this.toolsData.Desc_BoomBox_C));
            this.buildingsData.Desc_BoomBox_C.className         = '/Game/FactoryGame/Equipment/BoomBox/BP_BoomBoxPlayer.BP_BoomBoxPlayer_C';
            this.buildingsData.Desc_BoomBox_C.width             = 0.5;
            this.buildingsData.Desc_BoomBox_C.length            = 1;
            this.buildingsData.Desc_BoomBox_C.height            = 0.5;
        }

        // Add projectiles
        if(this.buildingsData.BP_FireWorksProjectile_01_C === undefined)
        {
            if(this.itemsData.Desc_Fireworks_Projectile_01_C !== undefined)
            {
                this.buildingsData.BP_FireWorksProjectile_01_C                  = JSON.parse(JSON.stringify(this.itemsData.Desc_Fireworks_Projectile_01_C));
                this.buildingsData.BP_FireWorksProjectile_01_C.className        = '/Game/FactoryGame/Events/Christmas/Fireworks/BP_FireWorksProjectile_01.BP_FireWorksProjectile_01_C';
                this.buildingsData.BP_FireWorksProjectile_01_C.mapUseSlotColor  = false;
                this.buildingsData.BP_FireWorksProjectile_01_C.mapLayer         = 'playerFicsmasLayer';
                this.buildingsData.BP_FireWorksProjectile_01_C.mapColor         = '#00FF00';
                this.buildingsData.BP_FireWorksProjectile_01_C.width            = 0.25;
                this.buildingsData.BP_FireWorksProjectile_01_C.length           = 0.25;
                this.buildingsData.BP_FireWorksProjectile_01_C.height           = 2;
            }
            if(this.itemsData.Desc_Fireworks_Projectile_02_C !== undefined)
            {
                this.buildingsData.BP_FireWorksProjectile_02_C                  = JSON.parse(JSON.stringify(this.itemsData.Desc_Fireworks_Projectile_02_C));
                this.buildingsData.BP_FireWorksProjectile_02_C.className        = '/Game/FactoryGame/Events/Christmas/Fireworks/BP_FireWorksProjectile_02.BP_FireWorksProjectile_02_C';
                this.buildingsData.BP_FireWorksProjectile_02_C.mapUseSlotColor  = false;
                this.buildingsData.BP_FireWorksProjectile_02_C.mapLayer         = 'playerFicsmasLayer';
                this.buildingsData.BP_FireWorksProjectile_02_C.mapColor         = '#00FF00';
                this.buildingsData.BP_FireWorksProjectile_02_C.width            = 0.25;
                this.buildingsData.BP_FireWorksProjectile_02_C.length           = 0.25;
                this.buildingsData.BP_FireWorksProjectile_02_C.height           = 2;
            }
            if(this.itemsData.Desc_Fireworks_Projectile_03_C !== undefined)
            {
                this.buildingsData.BP_FireWorksProjectile_03_C                  = JSON.parse(JSON.stringify(this.itemsData.Desc_Fireworks_Projectile_03_C));
                this.buildingsData.BP_FireWorksProjectile_03_C.className        = '/Game/FactoryGame/Events/Christmas/Fireworks/BP_FireworksProjectile_03.BP_FireworksProjectile_03_C';
                this.buildingsData.BP_FireWorksProjectile_03_C.mapUseSlotColor  = false;
                this.buildingsData.BP_FireWorksProjectile_03_C.mapLayer         = 'playerFicsmasLayer';
                this.buildingsData.BP_FireWorksProjectile_03_C.mapColor         = '#00FF00';
                this.buildingsData.BP_FireWorksProjectile_03_C.width            = 0.25;
                this.buildingsData.BP_FireWorksProjectile_03_C.length           = 0.25;
                this.buildingsData.BP_FireWorksProjectile_03_C.height           = 2;
            }
        }

        // Mods
        if(className === '/Game/InfiniteLogistics/Buildable/InfinitePipeHyper/Build_InfinitePipeHyper.Build_InfinitePipeHyper_C'){ className = '/Game/FactoryGame/Buildable/Factory/PipeHyper/Build_PipeHyper.Build_PipeHyper_C'; }
        if(className === '/Game/InfiniteLogistics/Buildable/InfinitePipeline/Build_InfinitePipeline.Build_InfinitePipeline_C'){ className = '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C'; }

        for(let i in this.buildingsData)
        {
            if(this.buildingsData[i].className !== undefined && this.buildingsData[i].className === className)
            {
                this.buildingDataClassNameHashTable[className] = i;
                return this.buildingsData[i];
            }
        }

        if(Building_RailroadTrack.isRailroadTrack({className: className}))
        {
            this.buildingDataClassNameHashTable[className] = 'Build_RailroadTrack_C';
            return this.buildingsData.Build_RailroadTrack_C;
        }
        if(Building_Locomotive.isLocomotive({className: className}))
        {
            this.buildingDataClassNameHashTable[className] = 'Desc_Locomotive_C';
            return this.buildingsData.Desc_Locomotive_C;
        }
        if(Building.isFreightWagon({className: className}))
        {
            this.buildingDataClassNameHashTable[className] = 'Desc_FreightWagon_C';
            return this.buildingsData.Desc_FreightWagon_C;
        }

        return null;
    }


    getIconSrcFromId(iconId, defaultIcon = null)
    {
        if(iconId === 191)
        {
            return this.staticUrl + '/img/gameUpdate8/IconDesc_SnowballMittens_256.png';
        }

        for(let i in this.itemsData)
        {
            if(this.itemsData[i].iconId !== undefined && this.itemsData[i].iconId === iconId)
            {
                return this.itemsData[i].image;
            }
        }
        for(let i in this.toolsData)
        {
            if(this.toolsData[i].iconId !== undefined && this.toolsData[i].iconId === iconId)
            {
                return this.toolsData[i].image;
            }
        }
        for(let i in this.buildingsData)
        {
            if(this.buildingsData[i].iconId !== undefined && this.buildingsData[i].iconId === iconId)
            {
                return this.buildingsData[i].image;
            }
        }

        // Removed icons
        if(iconId === 184){ return this.staticUrl + '/img/gameUpdate6/IconDesc_ColorGun_256.png'; }

        if(this.saveGameParser.header.buildVersion >= this.satisfactoryMap.buildVersion)
        {
            console.log('Missing iconID: ' + iconId);
            if(typeof Sentry !== 'undefined')
            {
                Sentry.captureMessage('Missing iconID: ' + iconId);
            }
        }

        if(defaultIcon !== null)
        {
            return defaultIcon;
        }

        return this.itemsData.Desc_IronIngot_C.image;
    }

    getBuildingIsOn(currentObject)
    {
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/FrackingExtractor/Build_FrackingExtractor.Build_FrackingExtractor_C')
        {
            currentObject = Building_FrackingExtractor.getSmasher(this, currentObject);
        }

        if(currentObject !== null)
        {
            if(this.getObjectProperty(currentObject, 'mIsProductionPaused') !== null)
            {
                return false;
            }
        }

        return true;
    }

    getBuildingIsPowered(currentObject)
    {
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/FrackingExtractor/Build_FrackingExtractor.Build_FrackingExtractor_C')
        {
            currentObject = Building_FrackingExtractor.getSmasher(this, currentObject);
        }

        if(currentObject !== null && currentObject.children !== undefined)
        {
            for(let i = 0; i < currentObject.children.length; i++)
            {
                let currentChildren         = currentObject.children[i];
                let availableConnections    = Building_PowerLine.availableConnections;
                    for(let k = 0; k < availableConnections.length; k++)
                    {
                        if(currentChildren.pathName.endsWith(availableConnections[k]))
                        {
                            currentChildren = this.saveGameParser.getTargetObject(currentChildren.pathName);

                            if(currentChildren !== null)
                            {
                                let mWires = this.getObjectProperty(currentChildren, 'mWires');
                                    if(mWires !== null)
                                    {
                                        return true;
                                    }
                            }
                        }
                    }
            }
        }

        return false;
    }

    generateFastPathName(currentObject)
    {
        let pathName    = JSON.parse(JSON.stringify(currentObject.pathName.split('_')));
            pathName.pop();
            pathName.push(Math.floor(Math.random() * Math.floor(2147483647)));

        let newPathName = pathName.join('_');

            if(this.saveGameParser.getTargetObject(newPathName) !== null)
            {
                console.log('Collision detected', newPathName);
                return this.generateFastPathName(currentObject);
            }

        return newPathName;
    }

    updateBuiltWithRecipe(currentObject)
    {
        let mBuiltWithRecipe    = this.getObjectProperty(currentObject, 'mBuiltWithRecipe');
            if(mBuiltWithRecipe !== null)
            {
                let className = currentObject.className.replace('Build_', 'Desc_').replace('Build_', 'Desc_');
                    for(let recipeId in this.recipesData)
                    {
                       if(this.recipesData[recipeId].produce !== undefined && this.recipesData[recipeId].produce[className] !== undefined)
                       {
                           if(mBuiltWithRecipe.pathName !== this.recipesData[recipeId].className)
                           {
                               mBuiltWithRecipe.pathName = this.recipesData[recipeId].className;
                           }

                           return;
                       }
                    }
            }

        return;
    }

    // CONTEXT MENU
    getContextMenu(marker)
    {
        if(marker.options.pathName !== undefined || marker.options.mapMarkerId !== undefined)
        {
            let contextMenu     = new BaseLayout_ContextMenu({
                    baseLayout      : this,
                    marker          : marker
                });

            if(marker.options.pathName !== undefined)
            {
                let currentObject   = this.saveGameParser.getTargetObject(marker.options.pathName);
                    return contextMenu.getContextMenu(currentObject);
            }
            if(marker.options.mapMarkerId !== undefined)
            {
                return contextMenu.getContextMenu(marker.mapMarkerId);
            }
        }

        return false;
    }

    bindMouseEvents(marker, addBuildingEvents = false)
    {
        marker.bindContextMenu(this);

        if(marker.options.pathName !== undefined || marker.options.mapMarkerId !== undefined)
        {
            marker.on('mouseover', (e) => {
                this.showTooltip(e);

                if(addBuildingEvents === true)
                {
                    let currentObject   = this.saveGameParser.getTargetObject(marker.options.pathName);
                    let buildingData    = this.getBuildingDataFromClassName(currentObject.className);

                        this.setBuildingMouseOverStyle(marker, buildingData);
                        Building_Conveyor.bindConnectedComponents(this, currentObject);
                        Building_PowerLine.bindConnectedComponents(this, currentObject);
                }
            });
            marker.on('mouseout', (e) => {
                this.closeTooltip(e);

                if(addBuildingEvents === true)
                {
                    let currentObject   = this.saveGameParser.getTargetObject(marker.options.pathName);
                        if(currentObject !== null)
                        {
                            let buildingData = this.getBuildingDataFromClassName(currentObject.className);
                                this.setBuildingMouseOutStyle(marker, buildingData, currentObject);
                                Building_Conveyor.unbindConnectedComponents(this, currentObject);
                                Building_PowerLine.unbindConnectedComponents(this, currentObject);
                        }
                }
            });

            if(L.Browser.touch)
            {
                marker.on('click', (e) => { this.showTooltip(e) });
            }
        }
    }

    setBuildingMouseOverStyle(marker, buildingData)
    {
        marker.setStyle({
            fillColor   : '#999999',
            fillOpacity : 0.9
        });

        if(marker.options.extraPattern !== undefined)
        {
            marker.options.extraPattern.setStyle({fillOpacity: 0.9});
        }
        if(marker.options.extraMarker !== undefined)
        {
            marker.options.extraMarker.setStyle({
                color       : '#BF0020',
                fillColor   : '#b3b3b3',
                icon        : buildingData.mapIconImage
            }).bringToFront();
        }

        if(marker.options.vehicleTrackDataPathName !== undefined)
        {
            let vehicleTrackDataMarker = this.getMarkerFromPathName(marker.options.vehicleTrackDataPathName, 'playerVehiculesLayer');
                if(vehicleTrackDataMarker !== null)
                {
                    vehicleTrackDataMarker.setStyle({color: '#BF0020'});
                }
        }
    }

    setBuildingMouseOutStyle(marker, buildingData, currentObject = null)
    {
        if(currentObject === null)
        {
            currentObject = this.saveGameParser.getTargetObject(marker.options.pathName);
            if(currentObject === null){ return; }
        }

        let mapOpacity          = (buildingData !== null && buildingData.mapOpacity !== undefined) ? buildingData.mapOpacity : 0.2;

        if(buildingData !== null)
        {
            if(buildingData.mapUseSlotColor !== undefined && buildingData.mapUseSlotColor === false)
            {
                marker.setStyle({
                    color       : buildingData.mapColor,
                    fillColor   : ((buildingData.mapFillColor !== undefined) ? buildingData.mapFillColor : buildingData.mapColor),
                    fillOpacity : mapOpacity
                });
            }
            else
            {
                // Coloring is allowed but mostly for pattern!
                if(currentObject.className.includes('AsphaltSet') || currentObject.className.includes('GripMetal'))
                {
                    marker.setStyle({
                        color       : buildingData.mapColor,
                        fillColor   : buildingData.mapColor,
                        fillOpacity : mapOpacity
                    });
                }
                else
                {
                    let slotColor = this.buildableSubSystem.getObjectPrimaryColor(currentObject);
                        marker.setStyle({
                            color       : buildingData.mapColor,
                            fillColor   : 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')',
                            fillOpacity : mapOpacity
                        });
                }
            }
        }

        if(marker.options.extraPattern !== undefined)
        {
            let patternColor = this.buildableSubSystem.getObjectSecondaryColor(currentObject);
                marker.options.extraPattern.setStyle({
                    color       : 'rgb(' + patternColor.r + ', ' + patternColor.g + ', ' + patternColor.b + ')',
                    fillColor   : 'rgb(' + patternColor.r + ', ' + patternColor.g + ', ' + patternColor.b + ')',
                    fillOpacity : Math.min(1, (mapOpacity + 0.3))
                });
        }

        if(marker.options.extraMarker !== undefined)
        {
            marker.options.extraMarker.setStyle({
                color       : '#FFFFFF',
                fillColor   : '#b3b3b3',
                icon        : buildingData.mapIconImage
            });
        }

        if(marker.options.vehicleTrackDataPathName !== undefined)
        {
            let vehicleTrackDataMarker = this.getMarkerFromPathName(marker.options.vehicleTrackDataPathName, 'playerVehiculesLayer');
                if(vehicleTrackDataMarker !== null)
                {
                    vehicleTrackDataMarker.setStyle({color: Building_Vehicle.trackDataColor});
                }
        }
    }


    /*
     * TOOLTIP FUNCTIONS
     */
    showTooltip(e)
    {
        let content         = null;
        let tooltip         = new BaseLayout_Tooltip({baseLayout: this, target: e.target});
        let tooltipOptions  = {sticky: true, opacity: 0.9};

        if(e.target.options.mapMarkerId !== undefined)
        {
            content = Building_MapMarker.getTooltip(this, e.target.options.mapMarkerId, tooltip.genericTooltipBackgroundStyle);
        }
        else
        {
            let currentObject   = this.saveGameParser.getTargetObject(e.target.options.pathName);
                if(currentObject !== null)
                {
                    content = tooltip.getTooltip(currentObject);

                    if(content !== null && e.type !== 'click')
                    {
                        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/RadarTower/Build_RadarTower.Build_RadarTower_C')
                        {
                            Building_RadarTower.bindTooltip(this, currentObject, tooltipOptions);
                        }
                        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_Portal.Build_Portal_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_PortalSatellite.Build_PortalSatellite_C')
                        {
                            Building_Portal.bindTooltip(this, currentObject, tooltipOptions);
                        }
                        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C')
                        {
                            Building_RailroadSwitchControl.bindTooltip(this, currentObject, tooltipOptions);
                        }
                        if(Building_RailroadTrack.isRailroadTrack(currentObject))
                        {
                            Building_RailroadTrack.bindTooltip(this, currentObject, tooltipOptions);
                        }
                        if(Building_Conveyor.isConveyorBelt(currentObject) || Building_HyperTube.isHyperTube(currentObject))
                        {
                            Building_Conveyor.bindTooltip(this, currentObject, tooltipOptions);
                        }
                    }
                }
        }

        if(content !== null)
        {
            e.target.closeTooltip.bind(this);
            e.target.bindTooltip(content, tooltipOptions);
            e.target.openTooltip();
        }
    }
    closeTooltip(e)
    {
        let currentObject   = this.saveGameParser.getTargetObject(e.target.options.pathName);
            if(currentObject !== null)
            {
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/RadarTower/Build_RadarTower.Build_RadarTower_C')
                {
                    Building_RadarTower.unbindTooltip(this, currentObject);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_Portal.Build_Portal_C' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_PortalSatellite.Build_PortalSatellite_C')
                {
                    Building_Portal.unbindTooltip(this, currentObject);
                }
                if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C')
                {
                    Building_RailroadSwitchControl.unbindTooltip(this, currentObject);
                }
                if(Building_RailroadTrack.isRailroadTrack(currentObject))
                {
                    Building_RailroadTrack.unbindTooltip(this, currentObject);
                }
                if(Building_Conveyor.isConveyorBelt(currentObject) || Building_HyperTube.isHyperTube(currentObject))
                {
                    Building_Conveyor.unbindTooltip(this, currentObject);
                }
            }

        e.target.unbindTooltip();
    }


    // EDIT/DELETE FUNCTIONS
    getMarkerFromPathName(pathName, filterLayerId = null)
    {
        for(let layerId in this.playerLayers)
        {
            if(filterLayerId === null || layerId === filterLayerId)
            {
                let layerLength = this.playerLayers[layerId].elements.length;

                for(let i = 0; i < layerLength; i++)
                {
                    if(this.playerLayers[layerId].elements[i].options.pathName !== undefined && this.playerLayers[layerId].elements[i].options.pathName === pathName)
                    {
                        return this.playerLayers[layerId].elements[i];
                    }
                }
            }
        }

        return null;
    }

    deleteMarkerFromElements(layerId, marker, fastDelete = false)
    {
        if(this.playerLayers[layerId] !== undefined)
        {
            let layerLength = this.playerLayers[layerId].elements.length;
                for(let i = 0; i < layerLength; i++)
                {
                    if(this.playerLayers[layerId].elements[i] === marker)
                    {
                        this.playerLayers[layerId].elements.splice(i, 1);
                        this.playerLayers[layerId].subLayer.removeLayer(marker);

                        if(marker.options.extraPattern !== undefined)
                        {
                            this.playerLayers[layerId].subLayer.removeLayer(marker.options.extraPattern);
                        }
                        if(marker.options.extraMarker !== undefined)
                        {
                            this.playerLayers[layerId].subLayer.removeLayer(marker.options.extraMarker);
                        }
                        if(marker.options.haloMarker !== undefined)
                        {
                            this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(marker.options.haloMarker);
                        }

                        if(fastDelete === false)
                        {
                            this.setBadgeLayerCount(layerId);
                        }
                        else
                        {
                            if(this.delayedBadgeCount === null)
                            {
                                this.delayedBadgeCount = [];
                            }
                            if(this.delayedBadgeCount.includes(layerId) === false)
                            {
                                this.delayedBadgeCount.push(layerId);
                            }
                        }

                        return true;
                    }
                }
        }

        return false;
    }

    removeFromStorage(currentObject)
    {
        let storages    = this.playerLayers.playerStoragesLayer.elements;
        let recipe      = [];

        if(typeof currentObject === 'object')
        {
            let mBuiltWithRecipe = this.getObjectProperty(currentObject, 'mBuiltWithRecipe')
                if(mBuiltWithRecipe !== null)
                {
                    let recipeName = mBuiltWithRecipe.pathName.split('.')[1];
                        if(this.recipesData[recipeName] !== undefined)
                        {
                            for(let ingredient in this.recipesData[recipeName].ingredients)
                            {
                                for(let i = 0; i < this.recipesData[recipeName].ingredients[ingredient]; i++)
                                {
                                    recipe.push(ingredient);
                                }
                            }
                        }
                }
        }
        else
        {
            // Simple string is 1 item :)
            recipe.push(currentObject);
        }

        for(let i = (storages.length - 1); i >= 0; i--)
        {
            if(storages[i].options.pathName !== undefined)
            {
                let currentStorage = this.saveGameParser.getTargetObject(storages[i].options.pathName);
                    if(currentStorage !== null)
                    {
                        let storageInventory    = this.getObjectInventory(currentStorage, 'mStorageInventory', true);
                            if(storageInventory !== null)
                            {
                                for(let j = 0; j < storageInventory.properties.length; j++)
                                {
                                    if(storageInventory.properties[j].name === 'mInventoryStacks')
                                    {
                                        for(let k = 0; k < storageInventory.properties[j].value.values.length; k++)
                                        {
                                            if(storageInventory.properties[j].value.values[k][0].value.itemName.pathName !== '')
                                            {
                                                while(recipe.includes(storageInventory.properties[j].value.values[k][0].value.itemName.pathName))
                                                {
                                                    let currentIndex = recipe.indexOf(storageInventory.properties[j].value.values[k][0].value.itemName.pathName);
                                                        if(currentIndex !== -1)
                                                        {
                                                            recipe.splice(currentIndex, 1);
                                                            storageInventory.properties[j].value.values[k][0].value.properties[0].value--;

                                                            if(storageInventory.properties[j].value.values[k][0].value.properties[0].value === 0)
                                                            {
                                                                storageInventory.properties[j].value.values[k][0].value.itemName.pathName    = '';

                                                                break;
                                                            }
                                                        }
                                                }

                                                if(recipe.length === 0) // We found everything!
                                                {
                                                    return true;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                    }

                if(recipe.length === 0) // We found everything!
                {
                    return true;
                }
            }
        }

        // Apparently we couldn't find all the current recipe...
        return false;
    }
}