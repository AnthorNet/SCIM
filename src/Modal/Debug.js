import Building                                 from '../Building.js';
import Building_PowerLine                       from '../Building/PowerLine.js';

export default class Modal_Debug
{
    static getHTML(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let html                = [];
        let htmlChildren        = [];
        let childrenPathName    = [];
        let extraPathName       = [];

        if(currentObject === null)
        {
            return;
        }

        if(currentObject.children !== undefined)
        {
            for(let i = 0; i < currentObject.children.length; i++)
            {
                childrenPathName.push(currentObject.children[i].pathName);

                let currentChildren = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                    if(currentChildren !== null)
                    {
                        let mWires = baseLayout.getObjectProperty(currentChildren, 'mWires');
                            if(mWires !== null)
                            {
                                for(let j = 0; j < mWires.values.length; j++)
                                {
                                    if(extraPathName.includes(mWires.values[j].pathName) === false)
                                    {
                                        extraPathName.push(mWires.values[j].pathName);
                                    }
                                }
                            }
                    }
            }
        }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/SpaceElevator/Build_SpaceElevator.Build_SpaceElevator_C')
        {
            extraPathName.push('Persistent_Level:PersistentLevel.GamePhaseManager');
        }
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/ResourceSink/Build_ResourceSink.Build_ResourceSink_C')
        {
            extraPathName.push('Persistent_Level:PersistentLevel.ResourceSinkSubsystem');
        }
        if(Building.isLocomotive(currentObject) || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C')
        {
            let identifier  = baseLayout.railroadSubSystem.getObjectIdentifier(currentObject);
                if(identifier !== null)
                {
                    extraPathName.push(identifier.pathName);
                }
        }

        let extraProperties = [
                'mOwningSpawner', 'mInfo', 'mStationDrone', 'mCurrentAction', 'mActionsToExecute', 'mOwnedPawn',
                'mTargetNodeLinkedList', 'mTargetList', 'mSignPoles', 'mFlowIndicator', 'mBottomSnappedConnection', 'mTopSnappedConnection',
                'mHubTerminal', 'mWorkBench', 'mLocker', 'mGenerators', 'mBlueprintProxy', 'mExtractableResource',
                'mLinkedPortal', 'mConveyorChainActor'
            ];
            for(let i = 0; i < extraProperties.length; i++)
            {
                let extraProperty = baseLayout.getObjectProperty(currentObject, extraProperties[i]);
                    if(extraProperty !== null)
                    {
                        if(['mSignPoles', 'mActionsToExecute', 'mGenerators'].includes(extraProperties[i]))
                        {
                            for(let j = 0; j < extraProperty.values.length; j++)
                            {
                                extraPathName.push(extraProperty.values[j].pathName);
                            }
                        }
                        else
                        {
                            extraPathName.push(extraProperty.pathName);

                            if(extraProperties[i] === 'mOwnedPawn')
                            {
                                let mOwnedPawn = baseLayout.saveGameParser.getTargetObject(extraProperty.pathName);
                                    if(mOwnedPawn !== null)
                                    {
                                        if(mOwnedPawn.children !== undefined)
                                        {
                                            for(let j = 0; j < mOwnedPawn.children.length; j++)
                                            {
                                                extraPathName.push(mOwnedPawn.children[j].pathName);
                                            }
                                        }
                                    }
                            }
                        }
                    }
            }

        if(currentObject.children !== undefined)
        {
            for(let i = 0; i < currentObject.children.length; i++)
            {
                let endWith = '.' + currentObject.children[i].pathName.split('.').pop();
                    if(Building_PowerLine.availableConnections.includes(endWith))
                    {
                        let objectCircuit = baseLayout.circuitSubSystem.getObjectCircuit(currentObject, endWith);
                            if(objectCircuit !== null && extraPathName.includes(objectCircuit.pathName) === false)
                            {
                                extraPathName.push(objectCircuit.pathName);
                            }
                    }
            }
        }

        html.push('<ul class="nav nav-tabs nav-fill">');
        html.push('<li class="nav-item"><span class="nav-link active" data-toggle="tab" href="#advancedDebugObject-MAIN" style="cursor:pointer;">Main object</span></li>');

        if(currentObject.children !== undefined)
        {
            for(let i = 0; i < currentObject.children.length; i++)
            {
                html.push('<li class="nav-item"><span class="nav-link" style="text-transform: none;cursor:pointer;" data-toggle="tab" href="#advancedDebugObject-' + currentObject.children[i].pathName.split('.').pop() + '">.' + currentObject.children[i].pathName.split('.').pop() + '</span></li>');

                let currentChildren = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                    if(currentChildren !== null)
                    {
                        htmlChildren.push('<div class="tab-pane fade" id="advancedDebugObject-' + currentObject.children[i].pathName.split('.').pop() + '">');
                        htmlChildren.push(Modal_Debug.getJsonViewer(currentChildren));
                        htmlChildren.push('</div>');

                        let mHiddenConnections = baseLayout.getObjectProperty(currentChildren, 'mHiddenConnections');
                            if(mHiddenConnections !== null)
                            {
                                for(let j = 0; j < mHiddenConnections.values.length; j++)
                                {
                                    if(childrenPathName.includes(mHiddenConnections.values[j].pathName) === false && extraPathName.includes(mHiddenConnections.values[j].pathName) === false)
                                    {
                                        extraPathName.push(mHiddenConnections.values[j].pathName);
                                    }
                                }
                            }
                    }
                    else
                    {
                        console.log('Missing children: ' + currentObject.children[i].pathName);
                    }
            }
        }

        let currentObjectPipeNetwork = baseLayout.pipeNetworkSubSystem.getObjectPipeNetwork(currentObject);
            if(currentObjectPipeNetwork !== null)
            {
                extraPathName.push(currentObjectPipeNetwork.pathName);
            }

        for(let j = 0; j < extraPathName.length; j++)
        {
            html.push('<li class="nav-item"><span class="nav-link" style="text-transform: none;cursor:pointer;" data-toggle="tab" href="#advancedDebugObject-' + extraPathName[j].replace(':', '-').replace('.', '-').replace('.', '-') + '">' + extraPathName[j].replace('Persistent_Level:', '') + '</span></li>');
        }

        html.push('</ul>');

        html.push('<div class="tab-content">');
        html.push('<div class="tab-pane fade show active" id="advancedDebugObject-MAIN">');
        html.push(Modal_Debug.getJsonViewer(currentObject));
        html.push('</div>');
        html.push(htmlChildren.join(''));

        for(let j = 0; j < extraPathName.length; j++)
        {
            let currentExtraObject = baseLayout.saveGameParser.getTargetObject(extraPathName[j]);
                html.push('<div class="tab-pane fade" id="advancedDebugObject-' + extraPathName[j].replace(':', '-').replace('.', '-').replace('.', '-') + '">');
                html.push(Modal_Debug.getJsonViewer(currentExtraObject));
                html.push('</div>');
        }

        html.push('</div>');

        $('#genericModal .modal-title').empty().html('Advanced Debug - ' + marker.relatedTarget.options.pathName);
        $('#genericModal .modal-body').empty().html(html.join(''));

        $('#genericModal .modal-body .copyJsonObject').on('click', function(){
            let json = $(this).next('textarea').val();
                navigator.clipboard.writeText(json);
        });

        $('#genericModal .modal-body .json-document').find('.json-toggle').click(function(){
            let target = $(this).toggleClass('collapsed').siblings('ul.json-dict, ol.json-array');
                target.toggle();

            if(target.is(':visible'))
            {
                target.siblings('.json-placeholder').remove();
            }
            else
            {
                let count       = target.children('li').length;
                let placeholder = count + (count > 1 ? ' items' : ' item');
                let name        = $(this).attr('data-name');
                    if(name !== undefined)
                    {
                        placeholder = name + ' (' + placeholder + ')';
                    }

                    target.after('<span class="json-placeholder">' + placeholder + '</span>');
            }
            return false;
        });
        $('#genericModal .modal-body .json-document').on('click', '.json-placeholder', function(){
            $(this).siblings('.json-toggle').click();
            return false;
        });
        $('#genericModal .modal-body').find('.json-toggle').click();

        setTimeout(function(){
            $('#genericModal').modal('show').modal('handleUpdate');
        }, 250);
    }

    static getJsonViewer(json)
    {
        let html = [];
            html.push('<div class="json-document" style="height: 74vh;overflow-y: scroll;">');
            html.push(Modal_Debug.jsonToHTML(json));
            html.push('</div>');

            html.push('<div><button class="btn btn-info w-100 copyJsonObject">Copy JSON object</button><textarea style="display:none;">' + JSON.stringify(json) + '</textarea></div>');

            return html.join('');
    }

    static jsonToHTML(json)
    {
        if(json === null)
        {
            return '<span class="json-literal" style="user-select: text;">Null</span>';
        }

        switch(typeof json)
        {
            case 'string':
                // Escape tags and quotes
                json = json
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/'/g, '&apos;')
                        .replace(/"/g, '&quot;');
                json = json.replace(/&quot;/g, '\\&quot;');
                return '<span class="json-string" style="user-select: text;">"' + json + '"</span>';
            case 'number':
            case 'boolean':
            case null:
                return '<span class="json-literal" style="user-select: text;">' + json + '</span>';
        }

        if(json instanceof Array)
        {
            if(json.length > 0)
            {
                let html = [];
                    for(let i = 0; i < json.length; ++i)
                    {
                        html.push('<li>');
                        if(json[i] instanceof Object && Object.keys(json[i]).length > 0)
                        {
                            if(json[i].name !== undefined)
                            {
                                html.push('<span class="json-toggle" data-name="' + json[i].name + '"></span>');
                            }
                            else
                            {
                                html.push('<span class="json-toggle"></span>');
                            }
                        }
                        html.push(Modal_Debug.jsonToHTML(json[i]));

                        if(i < (json.length - 1))
                        {
                            html.push(',');
                        }
                        html.push('</li>');
                    }

                return '[<ol class="json-array">' + html.join('') + '</ol>]';
            }

            return '[]';
        }

        if(typeof json === 'object')
        {
            let keyCount = Object.keys(json).length;
                if(keyCount > 0)
                {
                    let html = [];
                        for(let key in json)
                        {
                            if(Object.prototype.hasOwnProperty.call(json, key))
                            {
                                html.push('<li>');
                                let keyRepr = '<span class="json-string">"' + key + '"</span>';
                                    if(json[key] instanceof Object && Object.keys(json[key]).length > 0)
                                    {
                                        if(json[key].name !== undefined)
                                        {
                                            html.push('<span class="json-toggle" data-name="' + json[key].name + '">' + keyRepr + '</span>');
                                        }
                                        else
                                        {
                                            html.push('<span class="json-toggle">' + keyRepr + '</span>');
                                        }
                                    }
                                    else
                                    {
                                        html.push(keyRepr);
                                    }
                                html.push(': ' + Modal_Debug.jsonToHTML(json[key]));

                                if(--keyCount > 0)
                                {
                                    html.push(',');
                                }
                                html.push('</li>');
                            }
                        }

                    return '{<ul class="json-dict">' + html.join('') + '</ul>}';
                }

            return '{}';
        }

        return '';
    }
}