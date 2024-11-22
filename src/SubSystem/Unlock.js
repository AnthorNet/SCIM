import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Unlock extends SubSystem
{
    constructor(options)
    {
        options.pathName        = [
            'Persistent_Level:PersistentLevel.unlockSubsystem',
            'Persistent_Level:PersistentLevel.UnlockSubsystem'
        ];
        
        super(options);
    }

    haveEfficiency()
    {
        let mIsBuildingEfficiencyUnlocked    = this.baseLayout.getObjectProperty(this.subSystem, 'mIsBuildingEfficiencyUnlocked', 0);
            if(mIsBuildingEfficiencyUnlocked === 1)
            {
                return true;
            }

        return false;
    }

    haveOverclocking()
    {
        let mIsBuildingOverclockUnlocked    = this.baseLayout.getObjectProperty(this.subSystem, 'mIsBuildingOverclockUnlocked', 0);
            if(mIsBuildingOverclockUnlocked === 1)
            {
                return true;
            }

        return false;
    }

    haveProductionBoost()
    {
        let mIsBuildingProductionBoostUnlocked    = this.baseLayout.getObjectProperty(this.subSystem, 'mIsBuildingProductionBoostUnlocked', 0);
            if(mIsBuildingProductionBoostUnlocked === 1)
            {
                return true;
            }

        return false;
    }

    haveMap()
    {
        let mIsMapUnlocked    = this.baseLayout.getObjectProperty(this.subSystem, 'mIsMapUnlocked', 0);
            if(mIsMapUnlocked === 1)
            {
                return true;
            }

        return false;
    }
}