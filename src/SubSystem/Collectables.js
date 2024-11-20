export default class SubSystem_Collectables
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;

        this.collectables           = this.baseLayout.playerStatistics.collectables;
    }

    get()
    {
        for(let className in this.collectables)
        {
            let dataTotal                           = parseInt($('.updateLayerState[data-id="' + this.collectables[className].layerId + '"]').attr('data-total'));
                this.collectables[className].used  = 0;
                $('.updateLayerState[data-id="' + this.collectables[className].layerId + '"]').attr('data-collected', 0);
                $('.updateLayerState[data-id="' + this.collectables[className].layerId + '"] > .badge').html(new Intl.NumberFormat(this.baseLayout.language).format(dataTotal));

            if(typeof this.baseLayout.satisfactoryMap.mapOptions !== 'undefined' && this.baseLayout.satisfactoryMap.mapOptions !== undefined && this.baseLayout.satisfactoryMap.mapOptions !== null)
            {
                for(let i = 0; i < this.baseLayout.satisfactoryMap.mapOptions.length; i++)
                {
                    for(let j = 0; j < this.baseLayout.satisfactoryMap.mapOptions[i].options.length; j++)
                    {
                        for(let k = 0; k < this.baseLayout.satisfactoryMap.mapOptions[i].options[j].options.length; k++)
                        {
                            if(this.baseLayout.satisfactoryMap.mapOptions[i].options[j].options[k].layerId === this.collectables[className].layerId)
                            {
                                this.collectables[className].name      = this.baseLayout.satisfactoryMap.mapOptions[i].options[j].options[k].name;
                                this.collectables[className].image     = this.baseLayout.satisfactoryMap.mapOptions[i].options[j].options[k].icon;
                                this.collectables[className].markers   = this.baseLayout.satisfactoryMap.mapOptions[i].options[j].options[k].markers;

                                for(let m = 0; m < this.collectables[className].markers.length; m++)
                                {
                                    let collectedStatus = this.getStatusFromPathName(this.collectables[className].markers[m].pathName);
                                        if(collectedStatus === true)
                                        {
                                            this.collectables[className].used++;
                                        }
                                        if(this.baseLayout.satisfactoryMap.collectableMarkers[this.collectables[className].markers[m].pathName] !== undefined)
                                        {
                                            if(className === '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
                                            {
                                                let dataCollected   = parseInt($('.updateLayerState[data-id="' + this.collectables[className].layerId + '"]').attr('data-collected'));
                                                let updatedOpacity  = 1;
                                                    if(collectedStatus === true)
                                                    {
                                                        updatedOpacity = window.SCIM.collectedOpacity;
                                                        dataCollected++;
                                                    }

                                                    this.baseLayout.satisfactoryMap.collectableMarkers[this.collectables[className].markers[m].pathName].setOpacity(updatedOpacity);

                                                    $('.updateLayerState[data-id="' + this.collectables[className].layerId + '"]').attr('data-collected', dataCollected);

                                                    if(dataCollected > 0)
                                                    {
                                                        $('.updateLayerState[data-id="' + this.collectables[className].layerId + '"] > .badge').html(new Intl.NumberFormat(this.baseLayout.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.baseLayout.language).format(dataTotal));
                                                    }
                                            }
                                            else
                                            {
                                                if(collectedStatus === true)
                                                {
                                                    if(this.baseLayout.satisfactoryMap.availableLayers[this.collectables[className].layerId].hasLayer(this.baseLayout.satisfactoryMap.collectableMarkers[this.collectables[className].markers[m].pathName]))
                                                    {
                                                        if(this.baseLayout.showCollected === true)
                                                        {
                                                            if(this.baseLayout.satisfactoryMap.collectableMarkers[this.collectables[className].markers[m].pathName].options.opacity !== window.SCIM.collectedOpacity)
                                                            {
                                                                this.baseLayout.satisfactoryMap.collectableMarkers[this.collectables[className].markers[m].pathName].setOpacity(window.SCIM.collectedOpacity);
                                                            }
                                                        }
                                                        else
                                                        {
                                                            this.baseLayout.satisfactoryMap.availableLayers[this.collectables[className].layerId].removeLayer(this.baseLayout.satisfactoryMap.collectableMarkers[this.collectables[className].markers[m].pathName]);
                                                        }


                                                        let dataCollected   = parseInt($('.updateLayerState[data-id="' + this.collectables[className].layerId + '"]').attr('data-collected')) + 1;
                                                            $('.updateLayerState[data-id="' + this.collectables[className].layerId + '"]').attr('data-collected', dataCollected);
                                                            $('.updateLayerState[data-id="' + this.collectables[className].layerId + '"] > .badge').html(new Intl.NumberFormat(this.baseLayout.language).format(dataCollected) + '/' + new Intl.NumberFormat(this.baseLayout.language).format(dataTotal));
                                                    }
                                                }
                                                else
                                                {
                                                    if(this.baseLayout.satisfactoryMap.availableLayers[this.collectables[className].layerId].hasLayer(this.baseLayout.satisfactoryMap.collectableMarkers[this.collectables[className].markers[m].pathName]) === false)
                                                    {
                                                        this.baseLayout.satisfactoryMap.availableLayers[this.collectables[className].layerId].addLayer(this.baseLayout.satisfactoryMap.collectableMarkers[this.collectables[className].markers[m].pathName]);
                                                    }
                                                    else
                                                    {
                                                        if(this.baseLayout.showCollected === true)
                                                        {
                                                            if(this.baseLayout.satisfactoryMap.collectableMarkers[this.collectables[className].markers[m].pathName].options.opacity !== 1)
                                                            {
                                                                this.baseLayout.satisfactoryMap.collectableMarkers[this.collectables[className].markers[m].pathName].setOpacity(1);
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
            }

            if(className === '/Game/FactoryGame/Character/Creature/Enemy/CrabHatcher/Char_CrabHatcher.Char_CrabHatcher_C')
            {
                let isFilterShown                           = $('.updatePlayerLayerState[data-id="' + this.collectables[className].layerId + '"] .updatePlayerLayerFilter[data-filter="' + className + '"]').hasClass('btn-warning');
                let faunaData                               = this.baseLayout.faunaSubsystem.getDataFromClassName(className);
                    this.collectables[className].name      = faunaData.name;
                    this.collectables[className].image     = faunaData.image;
                    this.collectables[className].markers   = [];

                for(let i = 0; i < this.collectables[className].items.length; i++)
                {
                    let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.collectables[className].items[i]);
                        if(currentObject !== null)
                        {
                            let marker          = this.baseLayout.getMarkerFromPathName(currentObject.pathName, this.collectables[className].layerId);
                            let mCurrentHealth  = this.baseLayout.getObjectProperty(currentObject, 'mCurrentHealth');
                                if(mCurrentHealth !== null && mCurrentHealth === 0)
                                {
                                    this.collectables[className].used++;

                                    if(marker !== null && this.baseLayout.playerLayers[this.collectables[className].layerId].subLayer !== null && this.baseLayout.playerLayers[this.collectables[className].layerId].subLayer.hasLayer(marker))
                                    {
                                        this.baseLayout.playerLayers[this.collectables[className].layerId].subLayer.removeLayer(marker);
                                    }
                                }
                                else
                                {
                                    if(marker !== null && isFilterShown === true && this.baseLayout.playerLayers[this.collectables[className].layerId].subLayer !== null && this.baseLayout.playerLayers[this.collectables[className].layerId].subLayer.hasLayer(marker) === false)
                                    {
                                        this.baseLayout.playerLayers[this.collectables[className].layerId].subLayer.addLayer(marker);
                                    }
                                }

                                if(marker !== null)
                                {
                                    this.collectables[className].markers.push(marker);
                                }
                        }
                }

                let dataCollected = this.collectables[className].markers.length - this.collectables[className].used;
                    $('.updatePlayerLayerState[data-id="' + this.collectables[className].layerId + '"] .updatePlayerLayerFilter[data-filter="' + className + '"] > .badge').html(dataCollected);

                let totalCollected = 0;
                    $('.updatePlayerLayerState[data-id="' + this.collectables[className].layerId + '"] .updatePlayerLayerFilter[data-filter] > .badge').each(function(){
                        totalCollected += parseInt($(this).html()) || 0;
                    })
                    $('.updatePlayerLayerState[data-id="' + this.collectables[className].layerId + '"] > .badge').html(totalCollected);
            }
        }

        return this.collectables;
    }

    resetAll(className)
    {
        switch(className)
        {
            case '/Game/FactoryGame/Character/Creature/Enemy/CrabHatcher/Char_CrabHatcher.Char_CrabHatcher_C':
                for(let m = 0; m < this.collectables[className].markers.length; m++)
                {
                    this.reset(this.collectables[className].markers[m].options.pathName);
                }

                break;

            case '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C':
                this.baseLayout.collectedHardDrives.resetCollected();
                //CONTINUE...

            default:
                for(let m = 0; m < this.collectables[className].markers.length; m++)
                {
                    this.reset(this.collectables[className].markers[m].pathName, className);
                }
        }
    }

    resetMarker(marker)
    {
        let baseLayout = marker.baseLayout;
            baseLayout.collectablesSubSystem.reset(marker.relatedTarget.options.pathName);
            baseLayout.collectablesSubSystem.get();
    }

    reset(pathName, className = null)
    {
        let currentObject = this.baseLayout.saveGameParser.getTargetObject(pathName);
            if(currentObject !== null)
            {
                switch(currentObject.className)
                {
                    case '/Game/FactoryGame/Character/Creature/Enemy/CrabHatcher/Char_CrabHatcher.Char_CrabHatcher_C':
                        this.baseLayout.deleteObjectProperty(currentObject, 'mTriggered');
                        this.baseLayout.deleteObjectProperty(currentObject, 'mDayOfDeath');
                        this.baseLayout.deleteObjectProperty(currentObject, 'mCurrentHealth');

                        return;

                    case '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C':
                        this.baseLayout.deleteObjectProperty(currentObject, 'mHasBeenOpened');
                        this.baseLayout.deleteObjectProperty(currentObject, 'mHasBeenLooted');

                        return;

                    case '/Game/FactoryGame/World/Benefit/NutBush/BP_NutBush.BP_NutBush_C':
                    case '/Game/FactoryGame/World/Benefit/BerryBush/BP_BerryBush.BP_BerryBush_C':
                        this.baseLayout.deleteObjectProperty(currentObject, 'mPickupItems');

                        return;
                }
            }

        if(className !== null)
        {
            let collectables        = this.baseLayout.saveGameParser.getCollectables();
            let collectedStatus     = this.getStatusFromPathName(pathName);
                if(collectedStatus === true)
                {
                    for(let i = (collectables.length - 1); i >= 0; i--)
                    {
                        if(pathName === collectables[i].pathName)
                        {
                            // Removes from collectables...
                            collectables.splice(i, 1);

                            //TODO: Recreate the object...?

                            // Mercer shrine
                            //console.log(collectables[i], className, pathName)
                            if(className === '/Game/FactoryGame/Prototype/WAT/BP_WAT2.BP_WAT2_C')
                            {
                                let haveShrine = null;
                                    for(let i = 0; i < this.collectables[className].markers.length; i++)
                                    {
                                        if(this.collectables[className].markers[i].pathName === pathName && this.collectables[className].markers[i].shrinePathName !== undefined)
                                        {
                                            haveShrine = this.collectables[className].markers[i].shrinePathName;
                                            break;
                                        }
                                    }


                                if(haveShrine !== null)
                                {
                                    for(let j = (collectables.length - 1); j >= 0; j--)
                                    {
                                        if(haveShrine === collectables[j].pathName)
                                        {
                                            collectables.splice(j, 1);
                                            return;
                                        }
                                    }
                                }
                            }

                            return;
                        }
                    }
                }
        }
    }

    clearAll(className)
    {
        switch(className)
        {
            case '/Game/FactoryGame/Character/Creature/Enemy/CrabHatcher/Char_CrabHatcher.Char_CrabHatcher_C':
                for(let m = 0; m < this.collectables[className].markers.length; m++)
                {
                    this.clear(this.collectables[className].markers[m].options.pathName);
                }

                break;

            default:
                for(let m = 0; m < this.collectables[className].markers.length; m++)
                {
                    this.clear(this.collectables[className].markers[m].pathName);
                }
        }
    }

    clearMarker(marker)
    {
        let baseLayout = marker.baseLayout;
            baseLayout.collectablesSubSystem.clear(marker.relatedTarget.options.pathName);
            baseLayout.collectablesSubSystem.get();
    }

    clear(pathName)
    {
        let currentObject = this.baseLayout.saveGameParser.getTargetObject(pathName);
            if(currentObject !== null)
            {
                switch(currentObject.className)
                {
                    case '/Game/FactoryGame/Character/Creature/Enemy/CrabHatcher/Char_CrabHatcher.Char_CrabHatcher_C':
                        this.baseLayout.setObjectProperty(currentObject, 'mTriggered', 1, 'Bool');
                        this.baseLayout.setObjectProperty(currentObject, 'mDayOfDeath', 1, 'Int');
                        this.baseLayout.setObjectProperty(currentObject, 'mCurrentHealth', 0, 'Float');

                        return;

                    case '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C':
                        this.baseLayout.setObjectProperty(currentObject, 'mHasBeenOpened', 1, 'Bool');
                        this.baseLayout.setObjectProperty(currentObject, 'mHasBeenLooted', 1, 'Bool');

                        return;

                    case '/Game/FactoryGame/World/Benefit/NutBush/BP_NutBush.BP_NutBush_C':
                    case '/Game/FactoryGame/World/Benefit/BerryBush/BP_BerryBush.BP_BerryBush_C':
                        this.baseLayout.setObjectProperty(currentObject, 'mPickupItems', {
                            type    : 'InventoryStack',
                            values  : [
                                {
                                    name    : 'NumItems',
                                    type    : 'Int',
                                    value   : 0
                                }
                            ]
                        }, 'Struct');

                        return;
                }

                let collectables            = this.baseLayout.saveGameParser.getCollectables();
                    for(let i = (collectables.length - 1); i >= 0; i--)
                    {
                        if(pathName === collectables[i].pathName)
                        {
                            return;
                        }
                    }

                    let levelName = (currentObject.levelName !== undefined) ? [currentObject.levelName] : pathName.split(':');
                        collectables.push({
                            levelName   : levelName.shift(),
                            pathName    : pathName
                        });

                    // Delete actor from the save
                    this.baseLayout.saveGameParser.deleteObject(pathName);

                    // Mercer shrine
                    if(currentObject.className === '/Game/FactoryGame/Prototype/WAT/BP_WAT2.BP_WAT2_C')
                    {
                        let haveShrine = null;
                            for(let i = 0; i < this.collectables[currentObject.className].markers.length; i++)
                            {
                                if(this.collectables[currentObject.className].markers[i].pathName === pathName && this.collectables[currentObject.className].markers[i].shrinePathName !== undefined)
                                {
                                    haveShrine = this.collectables[currentObject.className].markers[i].shrinePathName;
                                    break;
                                }
                            }


                        if(haveShrine !== null)
                        {
                            let currentShrine = this.baseLayout.saveGameParser.getTargetObject(haveShrine);
                                if(currentShrine !== null)
                                {
                                    let levelName = (currentShrine.levelName !== undefined) ? [currentShrine.levelName] : haveShrine.split(':');
                                        collectables.push({
                                            levelName   : levelName.shift(),
                                            pathName    : haveShrine
                                        });
                                    this.baseLayout.saveGameParser.deleteObject(haveShrine);
                                }
                        }
                    }
            }
    }

    getStatusFromPathName(pathName)
    {
        let currentObject       = this.baseLayout.saveGameParser.getTargetObject(pathName);
            if(currentObject !== null)
            {
                if(currentObject.className === '/Game/FactoryGame/World/Benefit/DropPod/BP_DropPod.BP_DropPod_C')
                {
                    let hasBeenLooted = this.baseLayout.getObjectProperty(currentObject, 'mHasBeenLooted', 0);
                        if(hasBeenLooted === 1)
                        {
                            this.baseLayout.collectedHardDrives.setCollected(currentObject.pathName);
                            return true;
                        }

                    return false;
                }
                if(currentObject.className === '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C')
                {
                    let mIsEmptied = this.baseLayout.getObjectProperty(currentObject, 'mIsEmptied', 1);
                        if(mIsEmptied === 1)
                        {
                            return true;
                        }

                    return false;
                }

                if(currentObject.properties.length > 0)
                {
                    for(let n = 0; n < currentObject.properties.length; n++)
                    {
                        if(currentObject.properties[n].name === 'mPickupItems')
                        {
                            let intValue = null;
                                switch(currentObject.properties[n].value.values[0].type)
                                {
                                    case 'Int':
                                        //console.log('Int', currentObject);
                                        intValue = currentObject.properties[n].value.values[0].value;
                                        break;
                                    case 'Struct':
                                        //console.log('Struct', currentObject);
                                        if(currentObject.properties[n].value.values[0].value.properties[0] === null)
                                        {
                                            intValue = 0;
                                        }
                                        else
                                        {
                                            intValue = currentObject.properties[n].value.values[0].value.properties[0].value;
                                        }
                                        break;
                                    default:
                                        console.log('Modal_Map_Collectables::getStatusFromPathName', currentObject.properties[n].value.values[0]);
                                        break;
                                }

                            if(intValue === 0)
                            {
                                return true;
                            }

                            return false;
                        }
                    }
                }
            }

        let collectables = this.baseLayout.saveGameParser.getCollectables();
            for(let n = 0; n < collectables.length; n++)
            {
                if(pathName === collectables[n].pathName)
                {
                    return true;
                }
            }

        return false;
    }
}