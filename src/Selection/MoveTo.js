/* global gtag, Promise */
import Modal_Selection                          from '../Modal/Selection.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

import SubSystem_ConveyorChainActor             from '../SubSystem/ConveyorChainActor.js';

export default class Selection_MoveTo
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.markers                = options.markers;
        this.boundaries             = options.boundaries;
        this.keepSelection          = (options.keepSelection !== undefined) ? options.keepSelection : true;

        this.moveToX                = parseFloat(options.moveToX);
        this.moveToY                = parseFloat(options.moveToY);
        this.moveToZ                = parseFloat(options.moveToZ);


        this.useHistory             = (options.history !== undefined) ? options.history : true;

        if(typeof gtag === 'function')
        {
            gtag('event', 'MoveTo', {event_category: 'Selection'});
        }

        return this.moveTo();
    }

    moveTo()
    {
        if(this.markers)
        {
            console.time('moveToMultipleMarkers');
            let moveToResults   = [];
            let historyPathName = [];
            let moveToProxy     = [];

            for(let i = 0; i < this.markers.length; i++)
            {
                if(this.markers[i].options.pathName !== undefined)
                {
                    let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.markers[i].options.pathName);
                        if(currentObject !== null)
                        {
                            if(this.useHistory === true && this.baseLayout.history !== null)
                            {
                                let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
                                    if(currentObjectData !== null && currentObjectData.mapLayer !== undefined)
                                    {
                                        historyPathName.push([this.markers[i].options.pathName, currentObjectData.mapLayer]);
                                    }
                                    else
                                    {
                                        historyPathName.push(this.markers[i].options.pathName);
                                    }
                            }

                            let newTransform = JSON.parse(JSON.stringify(currentObject.transform));
                                switch(currentObject.className)
                                {
                                    case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                                        // Find target
                                        let mOwnedPawn = this.baseLayout.getObjectProperty(currentObject, 'mOwnedPawn');
                                            if(mOwnedPawn !== null)
                                            {
                                                let currentObjectTarget = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                                                    if(currentObjectTarget !== null)
                                                    {
                                                        if(isNaN(this.moveToX) === false)
                                                        {
                                                            currentObjectTarget.transform.translation[0] = currentObjectTarget.transform.translation[0] + (this.moveToX - this.boundaries.centerX);
                                                        }
                                                        if(isNaN(this.moveToY) === false)
                                                        {
                                                            currentObjectTarget.transform.translation[1] = currentObjectTarget.transform.translation[1] + (this.moveToY - this.boundaries.centerY);
                                                        }
                                                        if(isNaN(this.moveToZ) === false)
                                                        {
                                                            currentObjectTarget.transform.translation[2] = currentObjectTarget.transform.translation[2] + (this.moveToZ - this.boundaries.centerZ);
                                                        }
                                                    }
                                            }
                                        break;
                                    default:
                                        if(isNaN(this.moveToX) === false)
                                        {
                                            newTransform.translation[0] = currentObject.transform.translation[0] + (this.moveToX - this.boundaries.centerX);
                                        }
                                        if(isNaN(this.moveToY) === false)
                                        {
                                            newTransform.translation[1] = currentObject.transform.translation[1] + (this.moveToY - this.boundaries.centerY);
                                        }
                                        if(isNaN(this.moveToZ) === false)
                                        {
                                            newTransform.translation[2] = currentObject.transform.translation[2] + (this.moveToZ - this.boundaries.centerZ);
                                        }
                                        break;
                                }

                            let mConveyorChainActor = this.baseLayout.getObjectProperty(currentObject, 'mConveyorChainActor');
                                if(mConveyorChainActor !== null)
                                {
                                    let conveyorChainActorSubsystem = new SubSystem_ConveyorChainActor({baseLayout: this.baseLayout, pathName: mConveyorChainActor.pathName});
                                        conveyorChainActorSubsystem.killMe();
                                }

                            let haveProxy = this.baseLayout.blueprintSubSystem.haveProxy(currentObject);
                                if(haveProxy !== null && moveToProxy.includes(haveProxy.pathName) === false)
                                {
                                    moveToProxy.push(haveProxy.pathName);
                                }

                            moveToResults.push(this.baseLayout.refreshMarkerPosition({marker: this.markers[i], transform: newTransform, object: currentObject}, true));
                        }
                }
            }

            Promise.all(moveToResults).then(() => {
                if(this.useHistory === true && this.baseLayout.history !== null)
                {
                    this.baseLayout.history.add({
                        name: 'Undo: Move To selection',
                        values: [{
                            pathNameArray   : historyPathName,
                            callback        : 'Selection_MoveTo',
                            properties      : {
                                moveToX         : this.boundaries.centerX,
                                moveToY         : this.boundaries.centerY,
                                moveToZ         : this.boundaries.centerZ,
                                boundaries      : {centerX : this.moveToX, centerY : this.moveToY, centerZ : this.moveToZ},
                                keepSelection   : this.keepSelection
                            }
                        }]
                    });
                }

                if(moveToProxy.length > 0)
                {
                    for(let i = 0; i < moveToProxy.length; i++)
                    {
                        let blueprintProxyObject = this.baseLayout.saveGameParser.getTargetObject(moveToProxy[i]);
                            if(blueprintProxyObject !== null)
                            {
                                if(isNaN(this.moveToX) === false)
                                {
                                    blueprintProxyObject.transform.translation[0] += (this.moveToX - this.boundaries.centerX);
                                }
                                if(isNaN(this.moveToY) === false)
                                {
                                    blueprintProxyObject.transform.translation[1] += (this.moveToY - this.boundaries.centerY);
                                }
                                if(isNaN(this.moveToZ) === false)
                                {
                                    blueprintProxyObject.transform.translation[2] += (this.moveToZ - this.boundaries.centerZ);
                                }
                            }
                    }
                }

                console.timeEnd('moveToMultipleMarkers');
                this.baseLayout.updateRadioactivityLayer();
            });
        }

        if(this.keepSelection !== true)
        {
            Modal_Selection.cancel(this.baseLayout);
        }
        else
        {
            this.baseLayout.satisfactoryMap.leafletMap.selection.offsetSelectedArea(
                this.baseLayout,
                (this.moveToX - this.boundaries.centerX),
                (this.moveToY - this.boundaries.centerY)
            );
        }
    }
}