import SubSystem                                from '../SubSystem.js';

import Modal_Selection                          from '../Modal/Selection.js';

export default class SubSystem_Blueprint extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.BlueprintSubsystem';
        super(options);

        this.blueprintsProxies  = {};
    }

    add(currentObject)
    {
        if(this.blueprintsProxies[currentObject.pathName] === undefined)
        {
            this.blueprintsProxies[currentObject.pathName] = [];
        }
    }

    haveProxy(currentObject)
    {
        let mBlueprintProxy = this.baseLayout.getObjectProperty(currentObject, 'mBlueprintProxy');
            if(mBlueprintProxy !== null)
            {
                return mBlueprintProxy;
            }

        return null;
    }

    addToProxy(currentObject)
    {
        let mBlueprintProxy = this.haveProxy(currentObject);
            if(mBlueprintProxy !== null)
            {
                if(this.blueprintsProxies[mBlueprintProxy.pathName] === undefined)
                {
                    this.blueprintsProxies[mBlueprintProxy.pathName] = [];
                }

                this.blueprintsProxies[mBlueprintProxy.pathName].push(currentObject.pathName);
            }
    }

    deleteFromProxy(currentObject)
    {
        let mBlueprintProxy = this.haveProxy(currentObject);
            if(mBlueprintProxy !== null)
            {
                if(this.blueprintsProxies[mBlueprintProxy.pathName] !== undefined)
                {
                    if(this.blueprintsProxies[mBlueprintProxy.pathName].includes(currentObject.pathName))
                    {
                        for(let i = (this.blueprintsProxies[mBlueprintProxy.pathName].length - 1); i >= 0; i--)
                        {
                            if(this.blueprintsProxies[mBlueprintProxy.pathName][i] === currentObject.pathName)
                            {
                                this.blueprintsProxies[mBlueprintProxy.pathName].splice(i, 1);

                                break;
                            }
                        }
                    }

                    this.clearEmptyProxies();
                }
            }
    }

    clearEmptyProxies()
    {
        for(let pathName in this.blueprintsProxies)
        {
            if(this.blueprintsProxies[pathName].length === 0)
            {
                delete this.blueprintsProxies[pathName];
                this.baseLayout.saveGameParser.deleteObject(pathName);
                console.log('Removing ghost "/Script/FactoryGame.FGBlueprintProxy"', pathName);
            }
        }
    }

    getProxyByName(blueprintName)
    {
        for(let pathName in this.blueprintsProxies)
        {
            let currentProxy = this.baseLayout.saveGameParser.getTargetObject(pathName);
                if(currentProxy !== null)
                {
                    let mBlueprintName = this.baseLayout.getObjectProperty(currentProxy, 'mBlueprintName');
                        if(mBlueprintName !== null && mBlueprintName === blueprintName)
                        {
                            return currentProxy;
                        }
                }
        }

        return null;
    }
}