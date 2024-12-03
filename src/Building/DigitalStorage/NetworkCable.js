/* global Infinity */
import BaseLayout_Math                          from '../../BaseLayout/Math.js';

import Building                                 from '../../Building.js';

export default class Building_DigitalStorage_NetworkCable extends Building
{
    static get availableConnections()
    {
        return [
            '.mDSNetworkComp'
        ];
    }

    static getColor()
    {
        return '#00A5CF';
    }

    /*
     * ADD/DELETE
     */
    static add(baseLayout, currentObject)
    {
        baseLayout.setupSubLayer('playerModsDigitalStorageLayer');

        let Connector1 = baseLayout.getObjectProperty(currentObject, 'Connector1');
        let Connector2 = baseLayout.getObjectProperty(currentObject, 'Connector2');
            if(Connector1 !== null && Connector2 !== null)
            {
                let currentObjectSource = baseLayout.saveGameParser.getTargetObject(Connector1.pathName);
                let currentObjectTarget = baseLayout.saveGameParser.getTargetObject(Connector2.pathName);

                    if(currentObjectSource !== null && currentObjectTarget !== null)
                    {
                        let currentObjectSourceOuterPath    = baseLayout.saveGameParser.getTargetObject(currentObjectSource.outerPathName);
                        let currentObjectTargetOuterPath    = baseLayout.saveGameParser.getTargetObject(currentObjectTarget.outerPathName);

                            if(currentObjectSourceOuterPath !== null && currentObjectSourceOuterPath.transform !== undefined && currentObjectTargetOuterPath !== null && currentObjectTargetOuterPath.transform !== undefined)
                            {
                                let networkCable = L.powerLine([
                                        baseLayout.satisfactoryMap.unproject(currentObjectSourceOuterPath.transform.translation),
                                        baseLayout.satisfactoryMap.unproject(currentObjectTargetOuterPath.transform.translation)
                                    ], {
                                        pathName    : currentObject.pathName,
                                        color       : Building_DigitalStorage_NetworkCable.getColor(),
                                        weight      : 2,
                                        interactive : false
                                    });

                                baseLayout.playerLayers.playerModsDigitalStorageLayer.elements.push(networkCable);

                                let networkCableDistance = BaseLayout_Math.getDistance(currentObjectSourceOuterPath.transform.translation, currentObjectTargetOuterPath.transform.translation) / 100;
                                    baseLayout.playerLayers.playerModsDigitalStorageLayer.distance += networkCableDistance;

                                if(baseLayout.playerLayers.playerModsDigitalStorageLayer.filtersCount !== undefined)
                                {
                                    let networkCableClassName = '/DigitalStorage/Buildables/NetworkCable/Build_DS_NetworkCable.Build_DS_NetworkCable_C';
                                        if(baseLayout.playerLayers.playerModsDigitalStorageLayer.filtersCount[networkCableClassName] === undefined)
                                        {
                                            baseLayout.playerLayers.playerModsDigitalStorageLayer.filtersCount[networkCableClassName] = {distance: 0};
                                        }
                                        baseLayout.playerLayers.playerModsDigitalStorageLayer.filtersCount[networkCableClassName].distance += networkCableDistance;
                                }

                                return {layer: 'playerModsDigitalStorageLayer', marker: networkCable};
                            }
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
                let Connector1 = baseLayout.getObjectProperty(currentObject, 'Connector1');
                let Connector2 = baseLayout.getObjectProperty(currentObject, 'Connector2');
                    if(Connector1 !== null && Connector2 !== null)
                    {
                        let currentObjectSource = baseLayout.saveGameParser.getTargetObject(Connector1.pathName);
                            if(currentObjectSource !== null)
                            {
                                Building_DigitalStorage_NetworkCable.unlinkConnection(baseLayout, currentObjectSource, currentObject);
                            }

                        let currentObjectTarget = baseLayout.saveGameParser.getTargetObject(Connector2.pathName);
                            if(currentObjectTarget !== null)
                            {
                                Building_DigitalStorage_NetworkCable.unlinkConnection(baseLayout, currentObjectTarget, currentObject);
                            }

                        if(currentObjectSource !== null && currentObjectTarget !== null)
                        {
                            let currentObjectSourceOuterPath    = baseLayout.saveGameParser.getTargetObject(currentObjectSource.outerPathName);
                            let currentObjectTargetOuterPath    = baseLayout.saveGameParser.getTargetObject(currentObjectTarget.outerPathName);

                            if(currentObjectSourceOuterPath !== null && currentObjectTargetOuterPath !== null)
                            {
                                baseLayout.playerLayers.playerModsDigitalStorageLayer.distance -= BaseLayout_Math.getDistance(currentObjectSourceOuterPath.transform.translation, currentObjectTargetOuterPath.transform.translation) / 100;
                            }
                        }
                    }

                // Clear blueprintProxy
                baseLayout.blueprintSubSystem.deleteFromProxy(currentObject);
            }

        // Delete
        baseLayout.saveGameParser.deleteObject(marker.options.pathName);
        baseLayout.deleteMarkerFromElements('playerModsDigitalStorageLayer', marker);
    }

    static deleteCablesFromConnection(baseLayout, currentObjectConnection)
    {
        let ConnectedCables = baseLayout.getObjectProperty(currentObjectConnection, 'ConnectedCables');
            if(ConnectedCables !== null)
            {
                let cables = [];
                    for(let i = 0; i < ConnectedCables.values.length; i++)
                    {
                        let cableMarker = baseLayout.getMarkerFromPathName(ConnectedCables.values[i].pathName, 'playerModsDigitalStorageLayer');
                            if(cableMarker !== null)
                            {
                                cableMarker.baseLayout = baseLayout;
                                cables.push(cableMarker);
                            }
                    }

                if(cables.length > 0)
                {
                    for(let i = 0; i < cables.length; i++)
                    {
                        Building_DigitalStorage_NetworkCable.delete(cables[i]);
                    }
                }
            }
    }

    static redrawCablesFromPowerConnection(baseLayout, currentObjectPowerConnection, fastDelete)
    {
        let ConnectedCables = baseLayout.getObjectProperty(currentObjectPowerConnection, 'ConnectedCables');
            if(ConnectedCables !== null)
            {
                for(let i = 0; i < ConnectedCables.values.length; i++)
                {
                    let currentCable = baseLayout.saveGameParser.getTargetObject(ConnectedCables.values[i].pathName);
                        new Promise((resolve) => {
                            baseLayout.parseObject(currentCable, resolve);
                        }).then((result) => {
                            let oldMarker = baseLayout.getMarkerFromPathName(currentCable.pathName, result.layer);
                                baseLayout.deleteMarkerFromElements(result.layer, oldMarker, fastDelete);
                                baseLayout.addElementToLayer(result.layer, result.marker);
                        });
                }
            }
    }

    static unlinkConnection(baseLayout, currentObjectPowerConnection, targetObject)
    {
        let ConnectedCables = baseLayout.getObjectProperty(currentObjectPowerConnection, 'ConnectedCables');
            if(ConnectedCables !== null)
            {
                for(let j = 0; j < ConnectedCables.values.length; j++)
                {
                    if(ConnectedCables.values[j].pathName === targetObject.pathName)
                    {
                        ConnectedCables.values.splice(j, 1);
                        break;
                    }
                }

                // Empty properties...
                if(ConnectedCables.values.length <= 0)
                {
                    currentObjectPowerConnection.properties = currentObjectPowerConnection.properties.filter(property => property.name !== 'ConnectedCables');
                }
            }
    }
}