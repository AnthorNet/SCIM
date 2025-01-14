import SubSystem                                from '../SubSystem.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';
import PriorityQueue                            from '../Lib/PriorityQueue.js';

import Building_RailroadTrack                   from '../Building/RailroadTrack.js';

export default class SubSystem_Railroad extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.RailroadSubsystem';
        super(options);

        // Hold some objects to speed linking
        this.railroadSwitchControls = [];
    }

    getTrainStations()
    {
        let trainStations = [];
            if(this.subSystem !== null)
            {
                let mTrainStationIdentifiers = this.baseLayout.getObjectProperty(this.subSystem, 'mTrainStationIdentifiers');
                    if(mTrainStationIdentifiers !== null)
                    {
                        for(let i = 0; i < mTrainStationIdentifiers.values.length; i++)
                        {
                            trainStations.push(mTrainStationIdentifiers.values[i].pathName);
                        }
                    }
            }

        return trainStations;
    }

    getTrains()
    {
        let trains = [];
            if(this.subSystem !== null)
            {
                let mTrains = this.baseLayout.getObjectProperty(this.subSystem, 'mTrains');
                    if(mTrains !== null)
                    {
                        for(let i = 0; i < mTrains.values.length; i++)
                        {
                            trains.push(mTrains.values[i].pathName);
                        }
                    }
            }

        return trains;
    }



    getObjectIdentifier(currentObject)
    {
        let trainStations = this.getTrainStations();
            for(let i = 0; i < trainStations.length; i ++)
            {
                let currentIdentifier = this.baseLayout.saveGameParser.getTargetObject(trainStations[i]);
                    if(currentIdentifier !== null)
                    {
                        let mStation = this.baseLayout.getObjectProperty(currentIdentifier, 'mStation')
                            if(mStation !== null)
                            {
                                if(mStation.pathName === currentObject.pathName)
                                {
                                    return currentIdentifier;
                                }
                            }
                    }
            }

        //TODO: Improve locomotive detection if in middle
        let trains = this.getTrains();
            for(let i = 0; i < trains.length; i ++)
            {
                let currentIdentifier = this.baseLayout.saveGameParser.getTargetObject(trains[i])
                    if(currentIdentifier !== null)
                    {
                        let FirstVehicle    = this.baseLayout.getObjectProperty(currentIdentifier, 'FirstVehicle');
                            if(FirstVehicle !== null)
                            {
                                if(FirstVehicle.pathName === currentObject.pathName)
                                {
                                    return currentIdentifier;
                                }
                            }
                        let LastVehicle     = this.baseLayout.getObjectProperty(currentIdentifier, 'LastVehicle');
                            if(LastVehicle !== null)
                            {
                                if(LastVehicle.pathName === currentObject.pathName)
                                {
                                    return currentIdentifier;
                                }
                            }
                    }
            }


        return null;
    }

    deleteObjectIdentifier(currentObject)
    {
        let currentIdentifier = this.getObjectIdentifier(currentObject);
            if(currentIdentifier !== null)
            {
                let timeTable = this.baseLayout.getObjectProperty(currentObject, 'TimeTable');
                    if(timeTable !== null)
                    {
                        this.baseLayout.saveGameParser.deleteObject(timeTable.pathName);
                    }

                this.baseLayout.saveGameParser.deleteObject(currentObject.pathName);

                if(['/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C', '/Script/FactoryGame.FGTrain'].includes(currentIdentifier.className))
                {
                    let mTrains = this.baseLayout.getObjectProperty(this.subSystem, 'mTrains');
                        if(mTrains !== null)
                        {
                            for(let i = 0; i < mTrains.values.length; i ++)
                            {
                                if(mTrains.values[i].pathName === currentIdentifier.pathName)
                                {
                                    mTrains.values.splice(i, 1);
                                    return;
                                }
                            }
                        }
                }
                if(currentIdentifier.className === '/Script/FactoryGame.FGTrainStationIdentifier')
                {
                    let mTrainStationIdentifiers = this.baseLayout.getObjectProperty(this.subSystem, 'mTrainStationIdentifiers');
                        if(mTrainStationIdentifiers !== null)
                        {
                            for(let i = 0; i < mTrainStationIdentifiers.values.length; i ++)
                            {
                                if(mTrainStationIdentifiers.values[i].pathName === currentIdentifier.pathName)
                                {
                                    mTrainStationIdentifiers.values.splice(i, 1);
                                    return;
                                }
                            }
                        }
                }
            }
    }

    addObjectIdentifier(currentIdentifier)
    {
        if(['/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C', '/Script/FactoryGame.FGTrain'].includes(currentIdentifier.className))
        {
            let mTrains = this.baseLayout.getObjectProperty(this.subSystem, 'mTrains');
                if(mTrains !== null)
                {
                    for(let i = 0; i < mTrains.values.length; i ++) // Avoid duplicate!
                    {
                        if(mTrains.values[i].pathName === currentIdentifier.pathName)
                        {
                            return;
                        }
                    }
                    mTrains.values.push({pathName: currentIdentifier.pathName});
                }
                else
                {
                    this.baseLayout.setObjectProperty(
                        this.subSystem,
                        'mTrains',
                        {
                            type    : 'Object',
                            values  : [{pathName: currentIdentifier.pathName}]
                        },
                        'Array'
                    );
                }
        }
        if(currentIdentifier.className === '/Script/FactoryGame.FGTrainStationIdentifier')
        {
            let mTrainStationIdentifiers = this.baseLayout.getObjectProperty(this.subSystem, 'mTrainStationIdentifiers');
                if(mTrainStationIdentifiers !== null)
                {
                    for(let i = 0; i < mTrainStationIdentifiers.values.length; i ++)
                    {
                        if(mTrainStationIdentifiers.values[i].pathName === currentIdentifier.pathName) // Avoid duplicate!
                        {
                            return;
                        }
                    }
                    mTrainStationIdentifiers.values.push({pathName: currentIdentifier.pathName});
                }
                else
                {
                    this.baseLayout.setObjectProperty(
                        this.subSystem,
                        'mTrainStationIdentifiers',
                        {
                            type    : 'Object',
                            values  : [{pathName: currentIdentifier.pathName}]
                        },
                        'Array'
                    );
                }
        }
    }




    unlinkRailroadTrackConnections(currentObject)
    {
        let mConnectedComponents    = this.baseLayout.getObjectProperty(currentObject, 'mConnectedComponents');
        let connectedSwitchPool     = [currentObject.pathName];
            if(mConnectedComponents !== null)
            {
                for(let j = 0; j < mConnectedComponents.values.length; j++)
                {
                    let currentConnectedComponent = this.baseLayout.saveGameParser.getTargetObject(mConnectedComponents.values[j].pathName);
                        if(currentConnectedComponent !== null)
                        {
                                connectedSwitchPool.push(currentConnectedComponent.pathName);
                            let mConnectedComponents = this.baseLayout.getObjectProperty(currentConnectedComponent, 'mConnectedComponents');
                                if(mConnectedComponents !== null)
                                {
                                    for(let m = (mConnectedComponents.values.length - 1); m >= 0; m--)
                                    {
                                        if(mConnectedComponents.values[m].pathName === currentObject.pathName)
                                        {
                                            mConnectedComponents.values.splice(m, 1);
                                        }
                                    }

                                    if(mConnectedComponents.values.length === 0)
                                    {
                                        this.baseLayout.deleteObjectProperty(currentConnectedComponent, 'mConnectedComponents');
                                    }
                                }
                        }
                }
            }

        // Remove rails connected switches!
        for(let i = (this.railroadSwitchControls.length - 1); i >= 0; i--)
        {
            let currentSwitch = this.baseLayout.saveGameParser.getTargetObject(this.railroadSwitchControls[i]);
                if(currentSwitch !== null)
                {
                    let mControlledConnection = this.baseLayout.getObjectProperty(currentSwitch, 'mControlledConnection');
                        if(mControlledConnection !== null)
                        {
                            if(connectedSwitchPool.includes(mControlledConnection.pathName))
                            {
                                this.baseLayout.saveGameParser.deleteObject(this.railroadSwitchControls[i]);
                                this.baseLayout.deleteMarkerFromElements('playerTracksLayer', this.baseLayout.getMarkerFromPathName(this.railroadSwitchControls[i], 'playerTracksLayer'));
                                this.railroadSwitchControls.splice(i, 1);
                            }
                        }
                }
        }
    }

    unlinkTrainPlatformConnections(currentObject)
    {
        let mConnectedTo = this.baseLayout.getObjectProperty(currentObject, 'mConnectedTo');
            if(mConnectedTo !== null)
            {
                let currentConnectedComponent = this.baseLayout.saveGameParser.getTargetObject(mConnectedTo.pathName);
                    if(currentConnectedComponent !== null)
                    {
                        let mConnectedTo = this.baseLayout.getObjectProperty(currentConnectedComponent, 'mConnectedTo');
                            if(mConnectedTo !== null)
                            {
                                if(mConnectedTo.pathName === currentObject.pathName)
                                {
                                    this.baseLayout.deleteObjectProperty(currentConnectedComponent, 'mConnectedTo');
                                }
                            }
                    }
            }
    }



    findShortestPath(graphNetwork, startObject, finishObject)
    {
        const nodes     = new PriorityQueue();
        const distances = {};
        const previous  = {};

        let smallest;

        // Build up initial state
        for(let vertex in graphNetwork)
        {
            if(vertex === startObject.pathName)
            {
                distances[vertex] = 0;
                nodes.enqueue(vertex, 0);
            }
            else
            {
                distances[vertex] = Infinity;
                nodes.enqueue(vertex, Infinity);
            }

            previous[vertex] = null;
        }

        // As long as there is something to visit
        while(nodes.values.length)
        {
            smallest = nodes.dequeue().val;

            // WE ARE DONE
            // BUILD UP PATH TO RETURN AT END
            if(smallest === finishObject.pathName)
            {
                let path                = [];

                    while(previous[smallest])
                    {
                        path.push(smallest);
                        smallest            = previous[smallest];
                    }

                return {path: path.concat(smallest).reverse()};
            }

            if(smallest || distances[smallest] !== Infinity)
            {
                for(let nextNeighbor in graphNetwork[smallest])
                {

                    //calculate new distance to neighboring node
                    let candidate = distances[smallest] + graphNetwork[smallest][nextNeighbor];
                        if(candidate < distances[nextNeighbor])
                        {
                            //updating new smallest distance to neighbor
                            distances[nextNeighbor] = candidate;
                            //updating previous - How we got to neighbor
                            previous[nextNeighbor]  = smallest;
                            //enqueue in priority queue with new priority
                            nodes.enqueue(nextNeighbor, candidate);
                        }
                }
            }
        }

        return null;
    }
}