/* global L, Intl */
import BaseLayout_Modal                         from './BaseLayout/Modal.js';

import Lib_MapMarker                            from './Lib/L.MapMarker.js';

export default class GameMap
{
    constructor(options)
    {
        this.build                      = options.build;
        this.buildVersion               = options.buildVersion;
        this.version                    = options.version;
        this.remoteUrl                  = (options.remoteUrl !== undefined) ? options.remoteUrl : null;

        this.collectedOpacity           = options.collectedOpacity;

        this.staticUrl                  = options.staticUrl;
        this.dataUrl                    = options.dataUrl;

        this.language                   = options.language;
        this.lastHash                   = null;
        this.movingMap                  = false;

        this.backgroundSize             = 32768;
        this.extraBackgroundSize        = 4096; // #dddddd
        this.tileSize                   = 256;
        this.minTileZoom                = 3;
        this.maxTileZoom                = 8;

        // The generating actor is located at (X=50301.832031,Y=0.000000,Z=47479.000000)
        this.mappingBoundWest           = -324698.832031;
        this.mappingBoundEast           = 425301.832031;
        this.mappingBoundNorth          = -375000;
        this.mappingBoundSouth          = 375000;

        //See: https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/3/31/Biome_Map.jpg/revision/latest?cb=20210806163120
        this.biomes                     = {
           12: {                                                                                                                                                                                                                                                9: 'Spire Coast',           10: 'Spire Coast',      11: 'Dune Desert',      12: 'Dune Desert',  13: 'Dune Desert'   },
           11: {                                                                                                                                5: 'Desert Canyons',        6: 'Spire Coast',           7: 'Spire Coast',           8: 'Spire Coast',           9: 'Spire Coast',           10: 'Spire Coast',      11: 'Dune Desert',      12: 'Dune Desert',  13: 'Dune Desert'   },
           10: {    0: 'Rocky Desert',  1: 'Rocky Desert',      2: 'Rocky Desert',      3: 'Rocky Desert',          4: 'Rocky Desert',          5: 'Desert Canyons',        6: 'Spire Coast',           7: 'Spire Coast',           8: 'Spire Coast',           9: 'Spire Coast',           10: 'Spire Coast',      11: 'Dune Desert',      12: 'Dune Desert',  13: 'Dune Desert'   },
            9: {    0: 'Rocky Desert',  1: 'Rocky Desert',      2: 'Rocky Desert',      3: 'Rocky Desert',          4: 'Rocky Desert',          5: 'Northern Forest',       6: 'Northern Forest',       7: 'Northern Forest',       8: 'Desert Canyons',        9: 'Desert Canyons',        10: 'Dune Desert',      11: 'Dune Desert',      12: 'Dune Desert',  13: 'Dune Desert'   },
            8: {    0: 'Rocky Desert',  1: 'Rocky Desert',      2: 'Rocky Desert',      3: 'Rocky Desert',          4: 'Crater Lake',           5: 'Crater Lake',           6: 'Northern Forest',       7: 'Northern Forest',       8: 'Maze Canyon',           9: 'Desert Canyons',        10: 'Dune Desert',      11: 'Dune Desert',      12: 'Dune Desert',  13: 'Dune Desert'   },
            7: {    0: 'Rocky Desert',  1: 'Rocky Desert',      2: 'Rocky Desert',      3: 'Rocky Desert',          4: 'Crater Lake',           5: 'Crater Lake',           6: 'Lake Forest',           7: 'Lake Forest',           8: 'Maze Canyon',           9: 'Titan Forest',          10: 'Titan Forest',     11: 'Titan Forest',     12: 'Swamp',        13: 'Dune Desert'   },
            6: {                        1: 'Red Jungle',        2: 'Red Jungle',        3: 'Red Jungle',            4: 'Red Jungle',            5: 'Red Bamboo Fields',     6: 'Red Bamboo Fields',     7: 'Titan Forest',          8: 'Titan Forest',          9: 'Titan Forest',          10: 'Swamp',            11: 'Swamp'                                                     },
            5: {                        1: 'Islands',           2: 'Dangle Spires',     3: 'Western Dune Forest',   4: 'Red Jungle',            5: 'Red Bamboo Fields',     6: 'Red Bamboo Fields',     7: 'Eastern Dune Forest',   8: 'Titan Forest',          9: 'Eastern Dune Forest',   10: 'Swamp',            11: 'Swamp'                                                     },
            4: {                        1: 'Islands',           2: 'Dangle Spires',     3: 'Dangle Spires',         4: 'Western Dune Forest',   5: 'Western Dune Forest',   6: 'Eastern Dune Forest',   7: 'Eastern Dune Forest',   8: 'Eastern Dune Forest',   9: 'Eastern Dune Forest',   10: 'Abyss Cliffs'                                                                      },
            3: {                                                2: 'Dangle Spires',     3: 'Dangle Spires',         4: 'Snaketree Forest',      5: 'Snaketree Forest',      6: 'Grass Fields',          7: 'Southern Forest',       8: 'Blue Crater',           9: 'Blue Crater',           10: 'Abyss Cliffs'                                                                      },
            2: {                                                                        3: 'Grass Fields',          4: 'Grass Fields',          5: 'Grass Fields',          6: 'Southern Forest',       7: 'Southern Forest',       8: 'Blue Crater',           9: 'Blue Crater',           10: 'Abyss Cliffs'                                                                      },
            1: {                        1: 'Paradise Island',   2: 'Paradise Island',   3: 'Paradise Island',       4: 'Grass Fields',          5: 'Grass Fields',          6: 'Grass Fields',                                      8: 'Blue Crater',           9: 'Blue Crater'                                                                                                    }
        };

        this.leafletMap                 = L.map('leafletMap', {
            crs                             : L.CRS.Simple,
            minZoom                         : this.minTileZoom,
            maxZoom                         : (this.maxTileZoom + 4),
            zoomDelta                       : 0.25,
            zoomSnap                        : 0.25,
            attributionControl              : false,
            preferCanvas                    : true,
            fullscreenControl               : true
        });

        this.baseLayers                 = {};
        this.availableLayers            = {};

        this.collectableMarkers         = {};
        this.collectedHardDrives        = new HardDrives({ language: this.language });
        this.localStorage               = this.collectedHardDrives.getLocaleStorage();
        this.mapOptions                 = null;
        this.activeLayers               = null;

        this.showInternalCoordinates    = (this.localStorage !== null && this.localStorage.getItem('mapInternalCoordinates') !== null) ? (this.localStorage.getItem('mapInternalCoordinates') === 'true') : true;

        this.start();
    }

    start()
    {
        // Add extra background size!
        // Mainly because the in-game map doesn't cover the whole world map
        let westEastLength              = Math.abs(this.mappingBoundWest) + Math.abs(this.mappingBoundEast);
        let westEastRatio               = westEastLength / this.backgroundSize;
        let northSouthLength            = Math.abs(this.mappingBoundNorth) + Math.abs(this.mappingBoundSouth);
        let northSouthRatio             = northSouthLength / this.backgroundSize;

            this.westOffset             = westEastRatio * this.extraBackgroundSize;
            this.northOffset            = northSouthRatio * this.extraBackgroundSize;

            this.mappingBoundWest      -= this.westOffset;
            this.mappingBoundEast      += this.westOffset;
            this.mappingBoundNorth     -= this.northOffset;
            this.mappingBoundSouth     += this.northOffset;
            this.backgroundSize        += this.extraBackgroundSize * 2;
            this.zoomRatio              = this.zoomRatio();

        // Add the base layers
        let baseLayersOptions = {
            crs                 : L.CRS.Simple,
            noWrap              : true,
            bounds              : this.getBounds(),
            maxZoom             : (this.maxTileZoom + 4),
            maxNativeZoom       : this.maxTileZoom,
            crossOrigin         : true,    // We need this in order to be able to render tiles to a canvas.  Otherwise, we'd need to re-fetch all the tiles.
        };

        this.baseLayer                  = 'gameLayer';
        this.baseLayers.gameLayer       = L.tileLayer(this.staticUrl + '/imgMap/gameLayer/' + this.build + '/{z}/{x}/{y}.png?v=' + this.version, baseLayersOptions);
        this.baseLayers.realisticLayer  = L.tileLayer(this.staticUrl + '/imgMap/realisticLayer/' + this.build + '/{z}/{x}/{y}.png?v=' + this.version, baseLayersOptions);

        // Constrain map
        this.leafletMap.setMaxBounds(this.getBounds());
        this.leafletMap.fitBounds(this.getBounds());

        // Add a button to export the current viewport as an image and then download it.
        this.exportControl = L.control.exportControl({});
        this.leafletMap.addControl(this.exportControl);

        // Trigger initial hash to load previous layers...
        this.formatHash();

        this.loadInitialData();
    }

    loadInitialData()
    {
        $.getJSON(this.dataUrl, (data) => {
            if(data !== undefined)
            {
                this.mapOptions     = data.options;
                this.lastBuild      = data.lastBuild;
                window.SCIM.checkVersion(data.version);

                for(let i = 0; i < this.mapOptions.length; i++)
                {
                    let mainCategory = this.mapOptions[i];

                    for(let j = 0; j < mainCategory.options.length; j++)
                    {
                        let options = mainCategory.options[j];

                        for(let k = 0; k < options.options.length; k++)
                        {
                            let option = options.options[k];
                                if(this.availableLayers[option.layerId] === undefined)
                                {
                                    this.availableLayers[option.layerId] = L.layerGroup();
                                }

                            if(option.layerId === 'worldBorder')
                            {
                                let borderPosition = [];
                                    for(let m = 0; m < option.polygon.length; m++)
                                    {
                                        borderPosition.push(this.unproject(option.polygon[m]));
                                    }
                                    L.polyline(borderPosition, {color: 'red', weight: 3, interactive: false})
                                             .addTo(this.availableLayers[option.layerId]);

                                continue;
                            }

                            if(option.layerId === 'caves')
                            {
                                for(let caveId in option.markers)
                                {
                                    L.polygon(
                                        option.markers[caveId].points.map((value) => { return this.unproject(value); }),
                                        {color: 'yellow', weight: 1, interactive: false}
                                    ).addTo(this.availableLayers[option.layerId]);

                                    if(option.markers[caveId].entrances !== undefined)
                                    {
                                        for(let l = 0; l < option.markers[caveId].entrances.length; l++)
                                        {
                                            let currentEntrance     = L.polyline(
                                                                          option.markers[caveId].entrances[l].map((value) => { return this.unproject(value); }),
                                                                          {color: 'yellow', weight: 3, dashArray: '10 10'}
                                                                      );
                                            let entranceHeight      = 0;
                                            let haveEntranceHeight  = false;

                                            for(let m = 0; m < option.markers[caveId].entrances[l].length; m++)
                                            {
                                                if(option.markers[caveId].entrances[l][m].length > 2)
                                                {
                                                    haveEntranceHeight = true;
                                                    entranceHeight += option.markers[caveId].entrances[l][m][2];
                                                }
                                            }

                                            if(haveEntranceHeight !== false)
                                            {
                                                entranceHeight = entranceHeight / option.markers[caveId].entrances[l].length;
                                                currentEntrance.bindTooltip('<div class="d-flex" style="border: 25px solid #7f7f7f;border-image: url(https://static.satisfactory-calculator.com/js/InteractiveMap/img/genericTooltipBackground.png) 25 repeat;background: #7f7f7f;margin: -7px;color: #FFFFFF;text-shadow: 1px 1px 1px #000000;line-height: 16px;font-size: 12px;">\
                                                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                                                        Entrance height: ' + new Intl.NumberFormat(this.language).format(Math.round(entranceHeight / 100)) + 'm\
                                                    </div>\
                                                </div>');
                                            }

                                            currentEntrance.addTo(this.availableLayers[option.layerId]);
                                        }
                                    }
                                }

                                continue;
                            }

                            if(option.layerId === 'roads')
                            {
                                for(let roadId in option.markers)
                                {
                                    let road = L.conveyor(
                                                   option.markers[roadId].points.map((value) => { return this.unproject(value); }),
                                                   {
                                                       weight   : ((option.markers[roadId].corridor !== undefined) ? option.markers[roadId].corridor : 2500),
                                                       color    : 'purple'
                                                   }
                                               );

                                        if(option.markers[roadId].name !== undefined)
                                        {
                                            road.bindTooltip(option.markers[roadId].name)
                                        }

                                        road.addTo(this.availableLayers[option.layerId]);
                                }

                                continue;
                            }

                            if(option.layerId === 'hardDrives')
                            {
                                this.collectedHardDrives.setCollectedHardDrives(option.markers);
                            }

                            for(let l = 0; l < option.markers.length; l++)
                            {
                                let marker  = option.markers[l];
                                    if(option.layerId === 'spawn')
                                    {
                                        L.circle(this.unproject([marker.x, marker.y]), {radius: marker.radius / 6000})
                                         .addTo(this.availableLayers[option.layerId]);
                                        continue;
                                    }

                                let currentMarkerOptions    = {
                                        pathName    : marker.pathName,
                                        color       : option.outsideColor,
                                        fillColor   : option.insideColor,
                                        icon        : option.icon,
                                        x           : marker.x,
                                        y           : marker.y,
                                        z           : marker.z,
                                    };
                                    if(option.name !== undefined){ currentMarkerOptions.name = option.name; }

                                if(option.layerId === 'hardDrives')
                                {
                                    if(marker.powerNeeded !== undefined && marker.powerNeeded !== false)
                                    {
                                        currentMarkerOptions.powerNeeded    = marker.powerNeeded;
                                        currentMarkerOptions.extraIcon      = 'https://static.satisfactory-calculator.com/img/bolt.png';
                                    }

                                    if(marker.itemName !== undefined && marker.itemName !== null)
                                    {
                                        currentMarkerOptions.itemName       = marker.itemName;
                                        currentMarkerOptions.itemQuantity   = marker.itemQuantity;

                                        if(marker.itemId === undefined && marker.toolId === undefined)
                                        {
                                            currentMarkerOptions.fillColor  = '#d9534f';

                                            if(marker.powerNeeded !== undefined && marker.powerNeeded !== false)
                                            {
                                                currentMarkerOptions.extraIcon  = 'https://static.satisfactory-calculator.com/img/bolt.png';
                                            }
                                        }
                                    }
                                }

                                if(marker.lastCheck !== undefined)
                                {
                                    currentMarkerOptions.lastCheck = marker.lastCheck;
                                    /*
                                    // TO DEBUG LAST CHECK DATA
                                    if(parseInt(data.lastBuild) <= parseInt(marker.lastCheck))
                                    {
                                        continue;
                                    }
                                    /**/
                                }

                                if(option.type !== undefined){ currentMarkerOptions.type = option.type; }
                                else{ if(options.type !== undefined){ currentMarkerOptions.type = options.type; } }

                                if(option.purity !== undefined){ currentMarkerOptions.purity = option.purity; }
                                if(marker.core !== undefined){ currentMarkerOptions.core = marker.core; }

                                let currentMarker = null;
                                    if(option.layerId === 'sporeFlowers' || option.layerId === 'pillars' || option.layerId === 'smallRocks' || option.layerId === 'largeRocks')
                                    {
                                        currentMarkerOptions.radius = 0.6;
                                        currentMarkerOptions.color  = '#9cbc7d';

                                        if(option.layerId === 'smallRocks')
                                        {
                                            currentMarkerOptions.radius = 0.1;
                                            currentMarkerOptions.color  = '#555555';
                                        }
                                        if(option.layerId === 'largeRocks')
                                        {
                                            currentMarkerOptions.radius = 0.3;
                                            currentMarkerOptions.color  = '#555555';
                                        }

                                        if(option.type === 'pillars')
                                        {
                                            currentMarkerOptions.color = '#bee597';
                                        }

                                        currentMarker = L.circle(this.unproject([marker.x, marker.y]), currentMarkerOptions);
                                    }
                                    else
                                    {
                                        currentMarker = L.mapMarker(this.unproject([marker.x, marker.y]), currentMarkerOptions);
                                    }

                                    currentMarker.on('mouseover', (e) => { this.showTooltip(e); })
                                                 .on('mouseout', (e) => { this.closeTooltip(e); })
                                                 .addTo(this.availableLayers[option.layerId]);

                                    if(L.Browser.touch)
                                    {
                                        currentMarker.on('click', (e) => { this.showTooltip(e) });
                                    }

                                if(marker.pathName !== undefined)
                                {
                                    this.collectableMarkers[marker.pathName]                    = currentMarker;
                                    this.collectableMarkers[marker.pathName].options.layerId    = option.layerId;

                                    if(option.layerId === 'hardDrives')
                                    {
                                        let isCollected = this.collectedHardDrives.isCollected(marker.pathName);
                                            if(isCollected === true)
                                            {
                                                $('#resetPreviousCollected').show();

                                                let showCollected = (this.localStorage !== null && this.localStorage.getItem('mapShowCollected') !== null) ? (this.localStorage.getItem('mapShowCollected') === 'true') : false;
                                                    if(showCollected === false)
                                                    {
                                                        this.availableLayers[option.layerId].removeLayer(this.collectableMarkers[marker.pathName]);
                                                    }
                                                    else
                                                    {
                                                        this.collectableMarkers[marker.pathName].setOpacity(this.collectedOpacity);
                                                    }

                                                // Update badge!
                                                let dataCollected   = parseInt($('.updateLayerState[data-id="' + option.layerId + '"]').attr('data-collected')) + 1;
                                                let dataTotal       = parseInt($('.updateLayerState[data-id="' + option.layerId + '"]').attr('data-total'));
                                                    $('.updateLayerState[data-id="' + option.layerId + '"]').attr('data-collected', dataCollected);
                                                    $('.updateLayerState[data-id="' + option.layerId + '"] > .badge').html(new Intl.NumberFormat(this.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.language).format(dataTotal));
                                            }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }).done(() => {
            // Hash Default
            this.leafletMap.addLayer(this.baseLayers[this.baseLayer]);
            $('.setBaseLayer[data-id=' + this.baseLayer + ']').addClass(window.SCIM.outlineClass);

            for(let index in this.activeLayers)
            {
                let layerId = this.activeLayers[index];
                    if(this.availableLayers[layerId] === undefined)
                    {
                        this.availableLayers[layerId] = L.layerGroup();
                    }

                    this.leafletMap.addLayer(this.availableLayers[layerId]);
                    $('.updateLayerState[data-id="' + layerId + '"]').addClass(window.SCIM.outlineClass);
            }

            if(this.remoteUrl !== null && this.remoteUrl !== '')
            {
                $('.loader h6').html('Downloading remote save game...');
                $.ajax({
                    url     : this.remoteUrl,
                    method  : 'GET',
                    headers : {
                        "accept": "application/satisfactory",
                        "Access-Control-Allow-Origin":"*"
                    },
                    xhrFields:{responseType: 'blob'},
                    error: function(request, status, error){
                        $('.loader').hide();
                        console.log('ERROR REMOTE LOAD', request);

                        switch(request.status)
                        {
                            case 404:
                                BaseLayout_Modal.alert('We could not load your remote save, are you sure the file exists on the server?');
                                break;
                            default:
                                BaseLayout_Modal.alert('We could not load your remote save, have you enabled "Access-Control-Allow-Origin" on your server?');
                        }
                    }
                }).then(function(response)
                {
                    response.name = 'RemoteSave.sav';
                    window.SCIM.processSaveGameFile(response);
                });
            }
            else
            {
                window.SCIM.hideLoader();
            }

           this.setupEvents();
        });
    }

    setupEvents()
    {
        // Hash
        this.leafletMap.on("moveend", this.updateHash, this);
        this.leafletMap.on('layeradd', this.updateHash, this);
        this.leafletMap.on('layerremove', this.updateHash, this);

        L.DomEvent.addListener(window, "hashchange", this._throttle(() => { return this.onHashChange(); }, 100, {leading: true, trailing: true}));

        // Dynamic coordinates
        this.leafletMap.on('mousemove', this._throttle(function(e){
            let coordinates = this.project([e.latlng.lat, e.latlng.lng], this.zoomRatio);
                coordinates = this.convertToGameCoordinates([coordinates.x, coordinates.y]);

            if(this.showInternalCoordinates === true)
            {
                $('.mouseMoveCoordinates').html(new Intl.NumberFormat(this.language).format(Math.round(coordinates[0])) + ' / ' + new Intl.NumberFormat(this.language).format(Math.round(coordinates[1])));
            }
            else
            {
                $('.mouseMoveCoordinates').html(new Intl.NumberFormat(this.language).format(Math.round(coordinates[0] / 100)) + ' / ' + new Intl.NumberFormat(this.language).format(Math.round(coordinates[1] / 100)));
            }

            let biomeX      = Math.round(((coordinates[0] - this.mappingBoundWest - (67800 * 2)) / 100) / 512);
            let biomeY      = Math.round(((-coordinates[1] - this.mappingBoundNorth - (67800 * 2)) / 100) / 512);
            let biome       = '-';
                if(this.biomes[biomeY] !== undefined && this.biomes[biomeY][biomeX] !== undefined)
                {
                    biome = this.biomes[biomeY][biomeX];
                }

            $('.mouseMoveBiome').html(biome);
        }, 100, {leading: true, trailing: true}), this);

        $('.setBaseLayer').click((e) => {
            let layerId     = $(e.currentTarget).attr('data-id');
                if(this.baseLayer !== 'greyLayer')
                {
                    this.leafletMap.removeLayer(this.baseLayers[this.baseLayer]);
                }

            $('.setBaseLayer').removeClass(window.SCIM.outlineClass);
            this.baseLayer = layerId;

            if(layerId !== 'greyLayer')
            {
                this.leafletMap.addLayer(this.baseLayers[layerId]);
            }

            $(e.currentTarget).addClass(window.SCIM.outlineClass);

            if(layerId === 'greyLayer')
            {
                this.updateHash();
            }
        });

        $('.updateLayerState').click((e) => {
            let layerId     = $(e.currentTarget).attr('data-id');
                if(this.availableLayers[layerId] !== undefined)
                {
                    if(this.leafletMap.hasLayer(this.availableLayers[layerId]))
                    {
                        this.removeActiveLayer(layerId);
                        this.leafletMap.removeLayer(this.availableLayers[layerId]);
                        $(e.currentTarget).removeClass(window.SCIM.outlineClass);
                    }
                    else
                    {
                        this.addActiveLayer(layerId);
                        this.leafletMap.addLayer(this.availableLayers[layerId]);
                        $(e.currentTarget).addClass(window.SCIM.outlineClass);
                    }
                }
        });

        $('#unselectAll').click(() => {
            for(let layerId in this.availableLayers)
            {
                if(this.availableLayers.hasOwnProperty(layerId))
                {
                    if(this.leafletMap.hasLayer(this.availableLayers[layerId]))
                    {
                        this.removeActiveLayer(layerId);
                        this.leafletMap.removeLayer(this.availableLayers[layerId]);
                        $('.updateLayerState[data-id="' + layerId + '"]').removeClass(window.SCIM.outlineClass);
                    }
                }
            }
        });

        $('.selectPurity').click((e) => {
            let neededPurity    = $(e.currentTarget).attr('data-purity');

            $('.updateLayerState').each((i, el) => {
                let havePurity  = $(el).attr('data-purity');
                let layerId     = $(el).attr('data-id');
                let hide        = true;
                    if(havePurity !== undefined && neededPurity === havePurity)
                    {
                        hide = false;
                    }

                if(this.availableLayers[layerId] !== undefined)
                {
                    if(this.leafletMap.hasLayer(this.availableLayers[layerId]))
                    {
                        if(hide === true)
                        {
                            this.removeActiveLayer(layerId);
                            this.leafletMap.removeLayer(this.availableLayers[layerId]);
                            $(el).removeClass(window.SCIM.outlineClass);
                        }
                    }
                    else
                    {
                        if(hide === false)
                        {
                            this.addActiveLayer(layerId);
                            this.leafletMap.addLayer(this.availableLayers[layerId]);
                            $(el).addClass(window.SCIM.outlineClass);
                        }
                    }
                }
            });
        });

        $('.togglePurity').click((e) => {
            let neededPurity    = $(e.currentTarget).attr('data-purity');

            $('.updateLayerState').each((i, el) => {
                let havePurity  = $(el).attr('data-purity');
                let layerId     = $(el).attr('data-id');

                if(havePurity !== undefined && neededPurity === havePurity && this.availableLayers[layerId] !== undefined)
                {
                    if(this.leafletMap.hasLayer(this.availableLayers[layerId]))
                    {
                        this.removeActiveLayer(layerId);
                        this.leafletMap.removeLayer(this.availableLayers[layerId]);
                        $(el).removeClass(window.SCIM.outlineClass);
                    }
                    else
                    {
                        this.addActiveLayer(layerId);
                        this.leafletMap.addLayer(this.availableLayers[layerId]);
                        $(el).addClass(window.SCIM.outlineClass);
                    }
                }
            });
        });

        $('.toggleType').click((e) => {
            let neededType    = $(e.currentTarget).attr('data-type');

            $('.updateLayerState').each((i, el) => {
                let haveType    = $(el).attr('data-type');
                let layerId     = $(el).attr('data-id');

                if(haveType !== undefined && neededType === haveType)
                {
                    if(this.leafletMap.hasLayer(this.availableLayers[layerId]))
                    {
                        this.removeActiveLayer(layerId);
                        this.leafletMap.removeLayer(this.availableLayers[layerId]);
                        $(el).removeClass(window.SCIM.outlineClass);
                    }
                    else
                    {
                        this.addActiveLayer(layerId);
                        this.leafletMap.addLayer(this.availableLayers[layerId]);
                        $(el).addClass(window.SCIM.outlineClass);
                    }
                }
            });
        });

        $('#resetPreviousCollected button').click((e) => {
            let showCollected   = (this.localStorage !== null && this.localStorage.getItem('mapShowCollected') !== null) ? (this.localStorage.getItem('mapShowCollected') === 'true') : false;
            let collected       = this.collectedHardDrives.getCollectedHardDrives();

                for(let i = 0; i < collected.length; i++)
                {
                    if(this.collectableMarkers[collected[i]] !== undefined)
                    {
                        let layerId = this.collectableMarkers[collected[i]].options.layerId;
                            if(showCollected === false)
                            {
                                this.collectableMarkers[collected[i]].addTo(this.availableLayers[layerId]);
                            }
                            else
                            {
                                this.collectableMarkers[collected[i]].setOpacity(1);
                            }

                            let dataCollected   = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected')) - 1;
                            let dataTotal       = parseInt($('.updateLayerState[data-id="' + layerId + '"]').attr('data-total'));
                                $('.updateLayerState[data-id="' + layerId + '"]').attr('data-collected', dataCollected);

                                if(dataCollected === 0)
                                {
                                    $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(this.language).format(dataTotal));
                                }
                                else
                                {
                                    $('.updateLayerState[data-id="' + layerId + '"] > .badge').html(new Intl.NumberFormat(this.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.language).format(dataTotal));
                                }
                    }
                }
                this.collectedHardDrives.resetCollected();
                $('#resetPreviousCollected').hide();

        });
    }

    addActiveLayer(layerId)
    {
        if(this.activeLayers.includes(layerId) === false)
        {
            this.activeLayers.push(layerId);
        }
    }

    removeActiveLayer(layerId)
    {
        if(this.activeLayers !== null)
        {
            let index = this.activeLayers.indexOf(layerId);
                if(index > -1)
                {
                   this.activeLayers.splice(index, 1);
                }
        }
    }

    pauseMap()
    {
        this.leafletMap.dragging.disable();
        this.leafletMap.keyboard.disable();
        this.leafletMap.touchZoom.disable();
        this.leafletMap.doubleClickZoom.disable();
        this.leafletMap.scrollWheelZoom.disable();
        this.leafletMap.boxZoom.disable();
    }

    unpauseMap()
    {
        this.leafletMap.dragging.enable();
        this.leafletMap.keyboard.enable();
        this.leafletMap.touchZoom.enable();
        this.leafletMap.doubleClickZoom.enable();
        this.leafletMap.scrollWheelZoom.enable();
        this.leafletMap.boxZoom.enable();
    }

    /*
     * HASH
     */
    onHashChange()
    {
        let hash = location.hash;
            if(hash === this.lastHash)
            {
                return;
            }

        let parsed = this.parseHash(hash);
            if(parsed)
            {
                this.movingMap = true;
                this.leafletMap.setView(parsed.center, parsed.zoom);
                this.movingMap = false;
            }
            else
            {
                if(this.movingMap || !this.leafletMap._loaded){ return false; }
                this.updateHash();
            }
    }

    updateHash()
    {
        let hash = this.formatHash(this.SatisfactoryMap);
            if (this.lastHash !== hash)
            {
                location.replace(hash);
                this.lastHash = hash;
            }
    }

    parseHash(hash)
    {
        if(hash.indexOf('#') === 0)
        {
            hash = hash.substr(1);
        }

            hash            = decodeURI(hash);
        let args            = hash.split("|");
        let coordinates     = args[0].split(";");

        // Handle activelayers...
        let activeLayers    = null;
        let baseLayer       = 'gameLayer';
            if(args[1] !== undefined)
            {
                if(args[2] !== undefined)
                {
                    baseLayer       = args[1];
                    activeLayers    = args[2].split(";");
                }
                else
                {
                    activeLayers    = args[1].split(";");
                }
            }

        if(coordinates.length === 3)
        {
            let zoom    = parseFloat(coordinates[0]) || 3,
                x       = parseFloat(coordinates[1]) || 0,
                y       = parseFloat(coordinates[2]) || 0;

            if(isNaN(zoom) || isNaN(x) || isNaN(y))
            {
                return false;
            }
            else
            {
                let currentHash = {
                        center          : this.unproject([x, y]),
                        zoom            : zoom,
                        baseLayer       : baseLayer,
                        activeLayers    : activeLayers
                    };

                return currentHash;
            }
        }
        else
        {
            // Grab locale hash if needed?
            if(this.collectedHardDrives === null)
            {
                this.collectedHardDrives = new HardDrives({});
            }

            let localeStorage = this.collectedHardDrives.getLocaleStorage();
                if(localeStorage !== null)
                {
                    let localHash = localeStorage.getItem('mapHashUrl');
                        if(localHash !== null)
                        {
                            return this.parseHash(localHash);
                        }
                }

            return false;
        }
    }

    formatHash()
    {
        let center          = this.leafletMap.getCenter(),
            zoom            = this.leafletMap.getZoom();

        if(this.activeLayers === null)
        {
            let initialHash         = this.parseHash(location.hash);
            let defaultLayers       = ['limestonePure', 'ironPure', 'copperPure', 'cateriumPure', 'coalPure', 'oilPure', 'hardDrives'];

                if(initialHash)
                {
                    center          = initialHash.center;
                    zoom            = initialHash.zoom;

                    if(initialHash.baseLayer !== null)
                    {
                        this.baseLayer = initialHash.baseLayer;

                        if(this.baseLayers[this.baseLayer] === undefined)
                        {
                            this.baseLayer = 'gameLayer';
                        }

                        setTimeout(function(){
                            $('.setBaseLayer[data-id="' + this.baseLayer + '"]').trigger('click');
                        }, 150);
                    }

                    if(initialHash.activeLayers === null)
                    {
                        this.activeLayers = defaultLayers;
                    }
                    else
                    {
                        this.activeLayers = initialHash.activeLayers;
                    }

                    this.leafletMap.setView(center, zoom);
                }
                else
                {
                    this.activeLayers = defaultLayers;
                }
        }

        let coordinates     = this.project([center.lat, center.lng], zoom);
            coordinates     = this.convertToGameCoordinates([coordinates.x, coordinates.y]);

        let currentHash     = "#" + [zoom, Math.round(coordinates[0]), Math.round(coordinates[1])].join(";") + '|' + this.baseLayer + '|' + this.activeLayers.join(';');

            if(this.collectedHardDrives === null)
            {
                this.collectedHardDrives = new HardDrives({});
            }

        let localeStorage = this.collectedHardDrives.getLocaleStorage()
            if(localeStorage !== null)
            {
                localeStorage.setItem('mapHashUrl', currentHash);
            }

        return currentHash;
    }


    /*
     * TOOLTIP FUNCTIONS
     */
    showTooltip(e)
    {
        let tooltip = [];
        let options = e.target.options;

            if(options.layerId === 'hardDrives')
            {
                let explodedPathName = options.pathName.split('.');
                    tooltip.push('<strong>' + options.name + ' (' + explodedPathName.pop() + ')</strong><br />');

                if(options.powerNeeded !== undefined)
                {
                    tooltip.push('Power needed: ' + new Intl.NumberFormat(this.language).format(options.powerNeeded) + ' MW<br />');
                }

                if(options.itemName !== undefined && options.itemName !== null)
                {
                    tooltip.push(new Intl.NumberFormat(this.language).format(options.itemQuantity) + 'x ' + options.itemName + '<br />');
                }
                else
                {
                    if(options.powerNeeded === undefined)
                    {
                        tooltip.push('No requirements<br />');
                    }
                }
            }
            else
            {
                if(options.name !== undefined)
                {
                    tooltip.push('<strong>' + options.name + '</strong><br />');
                }
                else
                {
                    if(options.pathName !== undefined)
                    {
                        tooltip.push('<strong>' + options.pathName + '</strong><br />');
                    }
                }
            }

            tooltip.push('<br />');
            if(this.showInternalCoordinates === true)
            {
                tooltip.push('Coordinates: ' + new Intl.NumberFormat(this.language).format(Math.round(options.x)) + ' / ' + new Intl.NumberFormat(this.language).format(Math.round(options.y)));
            }
            else
            {
                tooltip.push('Coordinates: ' + new Intl.NumberFormat(this.language).format(Math.round(options.x / 100)) + ' / ' + new Intl.NumberFormat(this.language).format(Math.round(options.y / 100)));
            }

            tooltip.push('<br />');
            tooltip.push('Altitude: ' + new Intl.NumberFormat(this.language).format(Math.round(options.z / 100)) + 'm');

            if(options.lastCheck !== undefined)
            {
                tooltip.push('<br /><br />');
                tooltip.push('Data was check on build: <strong class="' + ((parseInt(this.lastBuild) > parseInt(options.lastCheck)) ? 'text-warning' : 'text-success') + '">#' + options.lastCheck + '</strong>');
            }
            else
            {
                if(options.purity !== undefined || options.layerId === 'hardDrives')
                {
                    tooltip.push('<br /><br />');
                    tooltip.push('Data was check on build: <strong class="text-danger">Unknown</strong>');
                }
            }

            if(options.purity !== undefined)
            {
                if(options.type !== 'Desc_Geyser_C') // Avoid geysers
                {
                    let purityModifier = 1;
                        if(options.purity === 'impure')
                        {
                            purityModifier = 0.5;
                        }
                        if(options.purity === 'pure')
                        {
                            purityModifier = 2;
                        }

                    tooltip.push('<table class="table table-bordered table-sm mt-3 mb-0 border-0"><thead><tr><th class="border-top-0 border-left-0"></th><th>50%</th><th>100%</th><th>150%</th><th>200%</th><th>250%</th></tr></thead><tbody>');
                    if(['Desc_LiquidOil_C', 'Desc_LiquidOilWell_C', 'Desc_Water_C', 'Desc_NitrogenGas_C'].includes(options.type))
                    {
                        let defaultSpeed    = 120;
                        let buildingName    = 'Oil Extractor';

                            if(['Desc_Water_C', 'Desc_NitrogenGas_C', 'Desc_LiquidOilWell_C'].includes(options.type))
                            {
                                defaultSpeed    = 60;
                                buildingName    = 'Resource Well Extractor';
                            }

                        tooltip.push('<tr>');
                        tooltip.push('<td>' + buildingName + '</td>');

                        for(let clockSpeed = 50; clockSpeed <= 250; clockSpeed += 50)
                        {
                            tooltip.push('<td>' + new Intl.NumberFormat(this.language).format(Math.round(purityModifier * defaultSpeed * (clockSpeed / 100))) + 'm³ / min</td>');
                        }

                        tooltip.push('</tr>');
                    }
                    else
                    {
                        for(let mk = 1; mk <= 3; mk++)
                        {
                            let defaultSpeed = mk * 60;
                                if(mk === 3)
                                {
                                    defaultSpeed = 240;
                                }

                            tooltip.push('<tr>');
                            tooltip.push('<td>Miner Mk' + mk + '</td>');

                            for(let clockSpeed = 50; clockSpeed <= 250; clockSpeed += 50)
                            {
                                tooltip.push('<td>' + new Intl.NumberFormat(this.language).format(Math.round(purityModifier * defaultSpeed * (clockSpeed / 100))) + ' / min</td>');
                            }

                            tooltip.push('</tr>');
                        }
                    }
                    tooltip.push('</tbody></table>');
                }
            }

        if(tooltip.length > 0)
        {
            tooltip = '<div class="d-flex" style="border: 25px solid #7f7f7f;border-image: url(https://static.satisfactory-calculator.com/js/InteractiveMap/img/genericTooltipBackground.png) 25 repeat;background: #7f7f7f;margin: -7px;color: #FFFFFF;text-shadow: 1px 1px 1px #000000;line-height: 16px;font-size: 12px;">\
                <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                    ' + tooltip.join('') + '\
                </div>\
            </div>';

            e.target.closeTooltip.bind(this);
            e.target.bindTooltip(tooltip);
            e.target.openTooltip();
        }
    }
    closeTooltip(e)
    {
        e.target.unbindTooltip();
    }

    /*
     * MAP PROJECTIONS
     */
    zoomRatio()
    {
        return Math.ceil(Math.log(Math.max(this.backgroundSize, this.backgroundSize) / this.tileSize) / Math.log(2));
    }

    unproject(coordinates)
    {
        return this.leafletMap.unproject(this.convertToRasterCoordinates(coordinates), this.zoomRatio);
    }

    project(coordinates)
    {
        return this.leafletMap.project(coordinates, this.zoomRatio);
    }

    getBounds()
    {
        let southWest = this.leafletMap.unproject([0, this.backgroundSize], this.zoomRatio);
        let northEast = this.leafletMap.unproject([this.backgroundSize, 0], this.zoomRatio);

        return new L.LatLngBounds(southWest, northEast);
    }

    getCenter()
    {
        return this.leafletMap.unproject([this.backgroundSize / 2, this.backgroundSize / 2], this.zoomRatio);
    }

    /*
     * LEFLET/GAME COORDINATES CONVERSIONS
     */
    convertToRasterCoordinates(coordinates)
    {
        let x               = parseFloat(coordinates[0]) || 0;
        let y               = parseFloat(coordinates[1]) || 0;

        let xMax            = Math.abs(this.mappingBoundWest) + Math.abs(this.mappingBoundEast);
        let yMax            = Math.abs(this.mappingBoundNorth) + Math.abs(this.mappingBoundSouth);

        let xRatio          = Math.abs(this.backgroundSize) / xMax;
        let yRatio          = Math.abs(this.backgroundSize) / yMax;

            x = ((xMax - this.mappingBoundEast) + x) * xRatio;
            y = (((yMax - this.mappingBoundNorth) + y) * yRatio) - this.backgroundSize;

        return [x, y];
    }

    convertToGameCoordinates(coordinates)
    {
        let x               = parseFloat(coordinates[0]) || 0;
        let y               = parseFloat(coordinates[1]) || 0;

        let xMax            = Math.abs(this.mappingBoundWest) + Math.abs(this.mappingBoundEast);
        let yMax            = Math.abs(this.mappingBoundNorth) + Math.abs(this.mappingBoundSouth);

        let xRatio          = xMax / Math.abs(this.backgroundSize);
        let yRatio          = yMax / Math.abs(this.backgroundSize);

            x = (x * xRatio) - (xMax - this.mappingBoundEast);
            y = (y * yRatio) - (yMax - this.mappingBoundNorth) + yMax;

        return [x, y];
    }

    /**
     * Pinched from underscore
     * @param func
     * @param wait
     * @param options
     * @returns {Function}
     * @private
    **/
   _throttle(func, wait, options)
   {
       var context, args, result;
       var timeout = null;
       var previous = 0;
       if (!options) options = {};
       var later = function() {
               previous = options.leading === false ? 0 : Date.now();
               timeout = null;
               result = func.apply(context, args);
               if (!timeout) context = args = null;
       };
       return function() {
               var now = Date.now();
               if (!previous && options.leading === false) previous = now;
               var remaining = wait - (now - previous);
               context = this;
               args = arguments;
               if (remaining <= 0 || remaining > wait) {
                       if (timeout) {
                               clearTimeout(timeout);
                               timeout = null;
                       }
                       previous = now;
                       result = func.apply(context, args);
                       if (!timeout) context = args = null;
               } else if (!timeout && options.trailing !== false) {
                       timeout = setTimeout(later, remaining);
               }
               return result;
       };
    }
}

/*
 * Workaround for 1px lines appearing in some browsers due to fractional transforms
 * and resulting anti-aliasing.
 * https://github.com/Leaflet/Leaflet/issues/3575
 */
(function(){
    let originalInitTile = L.GridLayer.prototype._initTile;
        L.GridLayer.include({
            _initTile: function(tile)
            {
                originalInitTile.call(this, tile);

                let tileSize                    = this.getTileSize();
                    tile.style.width            = tileSize.x + 0.5 + 'px';
                    tile.style.height           = tileSize.y + 0.5 + 'px';
                    tile.style['will-change']   ='transform';
                    tile.style.outline          = '1px solid transparent';
            }
        });
})();