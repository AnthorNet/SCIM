export default class SubSystem_ConveyorChainActor
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.conveyorChainActor     = this.baseLayout.saveGameParser.getTargetObject(options.pathName);

        //console.log(this.conveyorChainActor)
    }

    getConveyorBase(pathName)
    {
        let mConveyors = this.conveyorChainActor.extra.mConveyors;
            for(let i = 0; i < mConveyors.length; i++)
            {
                if(mConveyors[i].mConveyorBase.pathName === pathName)
                {
                    return mConveyors[i];
                }
            }

        return null;
    }

    getBeltItems(pathName)
    {
        let beltItems       = [];
        let conveyorBase    = this.getConveyorBase(pathName);
            if(conveyorBase !== null)
            {
                for(let i = 0; i < this.conveyorChainActor.extra.mActualItems.length; i++)
                {
                    let currentItem     = this.conveyorChainActor.extra.mActualItems[i];
                        if(currentItem.position >= conveyorBase.StartsAtLength && currentItem.position < conveyorBase.EndsAtLength) // Not using index here as they don't follow array indexes
                        {
                            beltItems.push(currentItem);
                        }
                }
            }

        return beltItems;
    }

    getBeltInventory(pathName)
    {
        let beltInventory   = [];
        let beltItems       = this.getBeltItems(pathName);
            for(let i = 0; i < beltItems.length; i++)
            {
                let currentItemData = this.baseLayout.getItemDataFromClassName(beltItems[i].itemName.pathName);
                     if(currentItemData !== null)
                     {
                         beltInventory.push({
                             className   : currentItemData.className,
                             name        : currentItemData.name,
                             image       : currentItemData.image,
                             qty         : 1
                         });
                     }
            }

        return beltInventory;
    }

    /**
     * Actually destroy the ChainActor, and converting the belts back to version 44
     */
    killMe()
    {
        if(this.conveyorChainActor !== null)
        {
            for(let i = 0; i < this.conveyorChainActor.extra.mConveyors.length; i++)
            {
                let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.conveyorChainActor.extra.mConveyors[i].mConveyorBase.pathName);
                    if(currentObject !== null)
                    {
                        let conveyorBase    = this.getConveyorBase(currentObject.pathName);
                        let beltItems       = this.getBeltItems(currentObject.pathName);
                            for(let j = 0; j < beltItems.length; j++)
                            {
                                let oldItemFormat = JSON.parse(JSON.stringify(beltItems[j]));
                                    oldItemFormat.position -= conveyorBase.StartsAtLength;
                                    currentObject.extra.items.push(oldItemFormat);
                            }

                        this.baseLayout.deleteObjectProperty(currentObject, 'mConveyorChainActor');
                        currentObject.entitySaveVersion = 44;
                    }
            }

            this.baseLayout.saveGameParser.deleteObject(this.conveyorChainActor.pathName);
        }
    }
}