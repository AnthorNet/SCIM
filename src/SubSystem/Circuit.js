import SubSystem                                from '../SubSystem.js';

import Building_PowerStorage                    from '../Building/PowerStorage.js';
import Building_PowerSwitch                     from '../Building/PowerSwitch.js';

export default class SubSystem_Circuit extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.CircuitSubsystem';
        super(options);

        this.circuitsColor      = {};
    }



    add(currentObject)
    {
        let mCircuitID = this.baseLayout.getObjectProperty(currentObject, 'mCircuitID');
            if(mCircuitID !== null)
            {
                this.subSystem.extra.circuits.push({
                    circuitId   : mCircuitID,
                    levelName   : ((currentObject.levelName !== undefined) ? currentObject.levelName : 'Persistent_Level'),
                    pathName    : currentObject.pathName
                });
            }
    }



    getNextId()
    {
        let maxId = 0;
            for(let i = 0; i < this.subSystem.extra.circuits.length; i++)
            {
                maxId = Math.max(maxId, this.subSystem.extra.circuits[i].circuitId);
            }

        return maxId + 1;
    }



    getObjectCircuit(currentObject, powerConnection = '.PowerConnection')
    {
        if(this.subSystem !== null && this.subSystem.extra.circuits !== undefined)
        {
            for(let i = 0; i < this.subSystem.extra.circuits.length; i++)
            {
                let currentSubCircuit = this.baseLayout.saveGameParser.getTargetObject(this.subSystem.extra.circuits[i].pathName);
                    if(currentSubCircuit !== null)
                    {
                        let mComponents = this.baseLayout.getObjectProperty(currentSubCircuit, 'mComponents');
                            if(mComponents !== null)
                            {
                                let componentsArray = [];
                                    for(let j = 0; j < mComponents.values.length; j++)
                                    {
                                        if(mComponents.values[j].pathName === currentObject.pathName)
                                        {
                                            return this.subSystem.extra.circuits[i];
                                        }
                                        if(mComponents.values[j].pathName === currentObject.pathName + powerConnection)
                                        {
                                            return this.subSystem.extra.circuits[i];
                                        }

                                        componentsArray.push(mComponents.values[j].pathName);
                                    }

                                    if(currentObject.children !== undefined && powerConnection === '.PowerConnection')
                                    {
                                        for(let j = 0; j < currentObject.children.length; j++)
                                        {
                                            if(componentsArray.includes(currentObject.children[j].pathName))
                                            {
                                                return this.subSystem.extra.circuits[i];
                                            }
                                        }
                                    }
                            }
                    }
            }
        }

        return null;
    }

    getCircuitByID(circuitID)
    {
        if(this.subSystem !== null && this.subSystem.extra.circuits !== undefined)
        {
            for(let i = 0; i < this.subSystem.extra.circuits.length; i++)
            {
                if(this.subSystem.extra.circuits[i].circuitId === circuitID)
                {
                    return this.baseLayout.saveGameParser.getTargetObject(this.subSystem.extra.circuits[i].pathName);
                }
            }
        }

        return null;
    }

    getCircuitColor(circuitID)
    {
        if(this.circuitsColor[circuitID] === undefined)
        {
            let rgb                 = [0, 0, 0];
            let seed                = 69;
            let str                 = circuitID + 'x';

            let h1                  = 0xdeadbeef ^ seed;
            let h2                  = 0x41c6ce57 ^ seed;
                for(let i = 0, ch; i < str.length; i++)
                {
                    ch = str.charCodeAt(i);
                    h1 = Math.imul(h1 ^ ch, 2654435761);
                    h2 = Math.imul(h2 ^ ch, 1597334677);
                }
            h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
            h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);

            let hash = 4294967296 * (2097151 & h2) + (h1>>>0);
                for(let i = 0; i < 3; i++)
                {
                    rgb[i] = hash >> (i * 8) & 255;
                    rgb[i] = Math.max(69, rgb[i]);
                }

            this.circuitsColor[circuitID] = rgb;
        }

        return this.circuitsColor[circuitID];
    }

    getCircuitComponents(circuitID, excludeCircuits = [])
    {
        let currentCircuit  = this.getCircuitByID(circuitID);
        let components      = [];
            excludeCircuits.push(circuitID);

            if(currentCircuit !== null)
            {
                let mComponents = this.baseLayout.getObjectProperty(currentCircuit, 'mComponents');
                    if(mComponents !== null)
                    {
                        for(let i = 0; i < mComponents.values.length; i++)
                        {
                                let currentComponentPowerConnection = this.baseLayout.saveGameParser.getTargetObject(mComponents.values[i].pathName);
                                    if(currentComponentPowerConnection !== null && currentComponentPowerConnection.outerPathName !== undefined)
                                    {
                                        components.push(currentComponentPowerConnection.outerPathName);

                                        // Do we need to link another circuit?
                                        //TODO: Do we need to link double wall pole?
                                        if(mComponents.values[i].pathName.startsWith('Persistent_Level:PersistentLevel.Build_PowerSwitch_C_'))
                                        {
                                            let currentSwitch    = this.baseLayout.saveGameParser.getTargetObject(currentComponentPowerConnection.outerPathName);
                                                if(currentSwitch !== null)
                                                {
                                                    let mIsSwitchOn      = Building_PowerSwitch.isOn(this.baseLayout, currentSwitch);
                                                        if(mIsSwitchOn === true)
                                                        {
                                                            let usedPowerConnection         = '.' + currentComponentPowerConnection.pathName.split('.').pop();
                                                            let currentSwitchOtherCircuit   = this.getObjectCircuit(currentSwitch, ((usedPowerConnection === '.PowerConnection1') ? '.PowerConnection2' : '.PowerConnection1'));

                                                                if(currentSwitchOtherCircuit !== null)
                                                                {
                                                                    if(excludeCircuits.includes(currentSwitchOtherCircuit.circuitId) === false)
                                                                    {
                                                                        let mergeComponents = this.getCircuitComponents(currentSwitchOtherCircuit.circuitId, excludeCircuits);
                                                                            for(let j = 0; j < mergeComponents.length; j++)
                                                                            {
                                                                                components.push(mergeComponents[j]);
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

        return components;
    }

    getStatistics(circuitID)
    {
        let statistics      = {
                capacity                    : 0,
                production                  : 0,
                consumption                 : 0,
                maxConsumption              : 0,

                powerStored                 : 0,
                powerStoredCapacity         : 0,

                powerStorageChargeRate      : 0,
                powerStoredTimeUntilCharged : null,

                powerStorageDrainRate       : 0,
                powerStoredTimeUntilDrained : null,
            };
            if(circuitID === null)
            {
                return statistics;
            }

        let components                      = this.getCircuitComponents(circuitID);
        let availablePowerStorageForCharge  = [];
        let availablePowerStorageForDrain   = [];

            for(let i = 0; i < components.length; i++)
            {
                let buildingPowerInfo   = this.baseLayout.saveGameParser.getTargetObject(components[i] + '.powerInfo');
                    if(buildingPowerInfo !== null)
                    {
                        let currentComponent            = this.baseLayout.saveGameParser.getTargetObject(components[i]);
                        let buildingData                = this.baseLayout.getBuildingDataFromClassName(currentComponent.className);

                        // PRODUCTION
                        let fuelClass = this.baseLayout.getObjectProperty(currentComponent, 'mCurrentFuelClass');
                            if(fuelClass !== null && this.baseLayout.getObjectProperty(currentComponent, 'mIsProductionPaused') === null)
                            {
                                let mDynamicProductionCapacity  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mDynamicProductionCapacity');
                                    if(mDynamicProductionCapacity !== null)
                                    {
                                        statistics.production += mDynamicProductionCapacity;
                                    }
                                    else
                                    {
                                        let mIsFullBlast = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mIsFullBlast');
                                            if(mIsFullBlast !== null && mIsFullBlast === 1)
                                            {
                                                statistics.production += buildingData.powerGenerated;
                                            }
                                    }
                            }

                        if(buildingData !== null && buildingData.powerGenerated !== undefined)
                        {
                            statistics.capacity   += buildingData.powerGenerated;
                        }

                        if(currentComponent !== null && currentComponent.className === '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
                        {
                            let mBaseProduction  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mBaseProduction');
                                if(mBaseProduction !== null)
                                {
                                    statistics.production += mBaseProduction;

                                    // Check max production based on purity
                                    let resourceNode     = this.baseLayout.getObjectProperty(currentComponent, 'mExtractableResource');
                                        if(resourceNode !== null)
                                        {
                                            if(this.baseLayout.satisfactoryMap.collectableMarkers !== undefined && this.baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName] !== undefined)
                                            {
                                                if(this.baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity !== undefined)
                                                {
                                                    if(buildingData !== null && buildingData.powerGenerated[this.baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity] !== undefined)
                                                    {
                                                        statistics.capacity += buildingData.powerGenerated[this.baseLayout.satisfactoryMap.collectableMarkers[resourceNode.pathName].options.purity][1];
                                                    }
                                                }
                                            }
                                        }
                                }
                        }

                        // CONSUMPTION
                        let mTargetConsumption  = this.baseLayout.getObjectProperty(buildingPowerInfo, 'mTargetConsumption');
                            if(mTargetConsumption !== null)
                            {
                                statistics.consumption += mTargetConsumption;
                            }

                        // MAX CONSUMPTION
                        if(buildingData !== null && buildingData.powerUsed !== undefined)
                        {
                            let clockSpeed                  = this.baseLayout.getClockSpeed(currentComponent);
                                if(this.baseLayout.saveGameParser.header.saveVersion >= 33)
                                {
                                    statistics.maxConsumption  += buildingData.powerUsed * Math.pow(clockSpeed, 1.321929);
                                }
                                else
                                {
                                    statistics.maxConsumption  += buildingData.powerUsed * Math.pow(clockSpeed, 1.6);
                                }
                        }

                        // POWER STORAGE
                        if(currentComponent !== null && currentComponent.className === '/Game/FactoryGame/Buildable/Factory/PowerStorage/Build_PowerStorageMk1.Build_PowerStorageMk1_C')
                        {
                            let powerStored                         = Building_PowerStorage.storedCharge(this.baseLayout, currentComponent);
                            let powerStoredCapacity                 = Building_PowerStorage.capacityCharge(this.baseLayout, currentComponent);

                                statistics.powerStored             += powerStored;
                                statistics.powerStoredCapacity     += powerStoredCapacity;

                            if(powerStored < powerStoredCapacity)
                            {
                                availablePowerStorageForCharge.push({powerStored: powerStored, powerStoredCapacity, powerStoredCapacity});
                            }
                            if(powerStored > 0)
                            {
                                availablePowerStorageForDrain.push({powerStored: powerStored, powerStoredCapacity, powerStoredCapacity});
                            }
                        }
                    }
            }

            if(availablePowerStorageForCharge.length > 0)
            {
                if(statistics.production > statistics.consumption)
                {
                    statistics.powerStorageChargeRate       = (statistics.production - statistics.consumption) / availablePowerStorageForCharge.length;
                    statistics.powerStoredTimeUntilCharged  = 0;

                    for(let i = 0; i < availablePowerStorageForCharge.length; i++)
                    {
                        statistics.powerStoredTimeUntilCharged = Math.max(
                            statistics.powerStoredTimeUntilCharged,
                            (3600 * (availablePowerStorageForCharge[i].powerStoredCapacity / statistics.powerStorageChargeRate)) - (3600 * (availablePowerStorageForCharge[i].powerStoredCapacity / statistics.powerStorageChargeRate) * (availablePowerStorageForCharge[i].powerStored / availablePowerStorageForCharge[i].powerStoredCapacity))
                        );
                    }
                }
            }

            if(availablePowerStorageForDrain.length > 0)
            {
                if(statistics.production < statistics.consumption)
                {
                    statistics.powerStorageDrainRate        = (statistics.consumption - statistics.production) / availablePowerStorageForDrain.length;
                    statistics.powerStoredTimeUntilDrained  = 0;

                    for(let i = 0; i < availablePowerStorageForDrain.length; i++)
                    {
                        statistics.powerStoredTimeUntilDrained = Math.max(
                            statistics.powerStoredTimeUntilDrained,
                            (3600 * (availablePowerStorageForDrain[i].powerStoredCapacity / statistics.powerStorageDrainRate) * (availablePowerStorageForDrain[i].powerStored / availablePowerStorageForDrain[i].powerStoredCapacity))
                        );
                    }
                }
            }

            // Can't have more consumption if we don't have stored power!
            if(statistics.powerStored === 0)
            {
                statistics.consumption = Math.min(statistics.consumption, statistics.production);
            }

            return statistics;
    }

    /*
     * DELETE NULLED OBJECTS
     */
    cleanCircuits()
    {
        for(let i = 0; i < this.subSystem.extra.circuits.length; i++)
        {
            let currentCiruitSubSystem = this.baseLayout.saveGameParser.getTargetObject(this.subSystem.extra.circuits[i].pathName);

            for(let j = 0; j < currentCiruitSubSystem.properties.length; j++)
            {
                if(currentCiruitSubSystem.properties[j].name === 'mComponents')
                {
                    for(let k = (currentCiruitSubSystem.properties[j].value.values.length - 1); k >= 0; k--)
                    {
                        let currentObject = this.baseLayout.saveGameParser.getTargetObject(currentCiruitSubSystem.properties[j].value.values[k].pathName);
                            if(currentObject === null)
                            {
                                currentCiruitSubSystem.properties[j].value.values.splice(k, 1);
                            }
                    }
                }
            }
        }
    }
}