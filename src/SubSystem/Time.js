import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Time extends SubSystem
{
    constructor(options)
    {
        options.pathName        = [
            'Persistent_Level:PersistentLevel.TimeSubsystem',
            'Persistent_Level:PersistentLevel.TimeSubSystem'
        ];

        super(options);
    }

    getDaySeconds()
    {
        return this.baseLayout.getObjectProperty(this.subSystem, 'mDaySeconds', 43200);
    }

    getNumberOfPassedDays()
    {
        return this.baseLayout.getObjectProperty(this.subSystem, 'mNumberOfPassedDays', 0);
    }

    isNight()
    {
        if(this.nightStatus === undefined)
        {
            this.nightStatus = true;

            let mDaySeconds = this.getDaySeconds() / 3600;
                if(mDaySeconds > 6 && mDaySeconds <= 18)
                {
                    this.nightStatus = false;
                }
        }

        return this.nightStatus;
    }
}