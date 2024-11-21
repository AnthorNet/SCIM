/* global gtag, Promise */
import Modal_Selection                          from '../Modal/Selection.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

import SubSystem_ConveyorChainActor             from '../SubSystem/ConveyorChainActor.js';

export default class Selection_Rotate
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.markers                = options.markers;
        this.keepSelection          = (options.keepSelection !== undefined) ? options.keepSelection : true;

        this.angle                  = parseFloat(Math.max(0, Math.min(360, options.angle)));

        this.selectionBoundaries    = (options.selectionBoundaries !== undefined) ? options.selectionBoundaries : null;
        this.useHistory             = (options.history !== undefined) ? options.history : true;

        if(typeof gtag === 'function')
        {
            gtag('event', 'Rotate', {event_category: 'Selection'});
        }

        return this.rotate();
    }

    rotate()
    {
        if(this.markers && isNaN(this.angle) === false)
        {
            console.time('rotateMultipleMarkers');

            if(this.selectionBoundaries === null)
            {
                this.selectionBoundaries = Modal_Selection.getBoundaries(this.baseLayout, this.markers);
            }

            let rotateResults   = [];
            let historyPathName = [];
            let rotateProxy     = [];

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

                            let refreshProperties = {marker: this.markers[i], transform: JSON.parse(JSON.stringify(currentObject.transform)), object: currentObject};
                                switch(currentObject.className)
                                {
                                    case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                                        let mOwnedPawn = this.baseLayout.getObjectProperty(currentObject, 'mOwnedPawn');
                                            if(mOwnedPawn !== null)
                                            {
                                                let currentObjectTarget = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                                                    if(currentObjectTarget !== null)
                                                    {
                                                        let translationRotation = BaseLayout_Math.getPointRotation(
                                                            currentObjectTarget.transform.translation,
                                                            [this.selectionBoundaries.centerX, this.selectionBoundaries.centerY],
                                                            BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.angle)
                                                        );
                                                        currentObjectTarget.transform.translation[0]  = translationRotation[0];
                                                        currentObjectTarget.transform.translation[1]  = translationRotation[1];
                                                        currentObjectTarget.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(currentObjectTarget.transform.rotation, this.angle);
                                                    }
                                            }
                                        break;
                                    default:
                                        let translationRotation = BaseLayout_Math.getPointRotation(
                                                refreshProperties.transform.translation,
                                                [this.selectionBoundaries.centerX, this.selectionBoundaries.centerY],
                                                BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.angle)
                                            );
                                            refreshProperties.transform.translation[0]  = translationRotation[0];
                                            refreshProperties.transform.translation[1]  = translationRotation[1];

                                        // Rotate all spline data and tangeant!
                                        let mSplineData = this.baseLayout.getObjectProperty(currentObject, 'mSplineData');
                                            if(mSplineData !== null)
                                            {
                                                for(let j = 0; j < mSplineData.values.length; j++)
                                                {
                                                    for(let k = 0; k < mSplineData.values[j].length; k++)
                                                    {
                                                        let currentValue    = mSplineData.values[j][k];
                                                        let splineRotation  = BaseLayout_Math.getPointRotation(
                                                            [currentValue.value.values.x, currentValue.value.values.y],
                                                            [0, 0],
                                                            BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.angle)
                                                        );

                                                        currentValue.value.values.x = splineRotation[0];
                                                        currentValue.value.values.y = splineRotation[1];
                                                    }
                                                }

                                                refreshProperties.splineRotation    = this.angle;
                                            }
                                            else
                                            {
                                                refreshProperties.transform.rotation = BaseLayout_Math.getNewQuaternionRotate(refreshProperties.transform.rotation, this.angle);
                                            }
                                }

                            let mConveyorChainActor = this.baseLayout.getObjectProperty(currentObject, 'mConveyorChainActor');
                                if(mConveyorChainActor !== null)
                                {
                                    let conveyorChainActorSubsystem = new SubSystem_ConveyorChainActor({baseLayout: this.baseLayout, pathName: mConveyorChainActor.pathName});
                                        conveyorChainActorSubsystem.killMe();
                                }

                            let haveProxy = this.baseLayout.blueprintSubSystem.haveProxy(currentObject);
                                if(haveProxy !== null && rotateProxy.includes(haveProxy.pathName) === false)
                                {
                                    rotateProxy.push(haveProxy.pathName);
                                }

                            rotateResults.push(this.baseLayout.refreshMarkerPosition(refreshProperties, true));
                        }
                }
            }

            Promise.all(rotateResults).then(() => {
                if(this.useHistory === true && this.baseLayout.history !== null)
                {
                    this.baseLayout.history.add({
                        name    : 'Undo: Rotate selection by ' + this.angle + '°',
                        values  : [{
                            pathNameArray   : historyPathName,
                            callback        : 'Selection_Rotate',
                            properties      : {
                                angle               : (360 - this.angle),
                                selectionBoundaries : this.selectionBoundaries,
                                keepSelection       : this.keepSelection
                            }
                        }]
                    });
                }

                if(rotateProxy.length > 0)
                {
                    for(let i = 0; i < rotateProxy.length; i++)
                    {
                        let blueprintProxyObject = this.baseLayout.saveGameParser.getTargetObject(rotateProxy[i]);
                            if(blueprintProxyObject !== null)
                            {
                                let translationRotation = BaseLayout_Math.getPointRotation(
                                        blueprintProxyObject.transform.translation,
                                        [this.selectionBoundaries.centerX, this.selectionBoundaries.centerY],
                                        BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.angle)
                                    );
                                    blueprintProxyObject.transform.translation[0]  = translationRotation[0];
                                    blueprintProxyObject.transform.translation[1]  = translationRotation[1];

                                blueprintProxyObject.transform.rotation = BaseLayout_Math.getNewQuaternionRotate(blueprintProxyObject.transform.rotation, this.angle);
                            }
                    }
                }

                console.timeEnd('rotateMultipleMarkers');
                this.baseLayout.updateRadioactivityLayer();
            });
        }

        if(this.keepSelection !== true)
        {
            Modal_Selection.cancel(this.baseLayout);
        }
        else
        {
            this.baseLayout.satisfactoryMap.leafletMap.selection.rotateSelectedArea(this.baseLayout, this.selectionBoundaries.centerX, this.selectionBoundaries.centerY, this.angle);
        }
    }
}