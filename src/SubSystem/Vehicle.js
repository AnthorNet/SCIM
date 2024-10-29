import Building_Vehicle                         from '../Building/Vehicle.js';

import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Vehicle extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.VehicleSubsystem';
        super(options);

        //console.log(this.subSystem)
    }

    getVehicleTrackData(currentObject)
    {
        let mSavedPaths = this.baseLayout.getObjectProperty(this.subSystem, 'mSavedPaths');
            if(mSavedPaths !== null)
            {
                for(let i = 0; i < mSavedPaths.values.length; i++)
                {
                    let mSavedPath = this.baseLayout.saveGameParser.getTargetObject(mSavedPaths.values[i].pathName);
                        if(mSavedPath !== null)
                        {
                            //console.log(mSavedPath)
                        }
                }
            }

        return Building_Vehicle.getTrackData(this.baseLayout, currentObject);
    }
}