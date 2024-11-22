export default class SubSystem
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;

        if(Array.isArray(options.pathName) === false)
        {
            options.pathName = [options.pathName];
        }

        for(let i = 0; i < options.pathName.length; i++)
        {
            this.subSystem = this.baseLayout.saveGameParser.getTargetObject(options.pathName[i]);

            if(this.subSystem !== null)
            {
                break;
            }
        }

        if(this.subSystem === null)
        {
            console.warn('Missing SubSystem', options.pathName);
        }
    }

    get()
    {
        return this.subSystem;
    }
}