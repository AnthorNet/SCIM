/* global Sentry, Intl, self */
import pako                                     from '../Lib/pako.esm.js';

import Building                                 from '../Building.js';

export default class SaveParser_Read
{
    constructor(worker, options)
    {
        this.worker             = worker;
        this.objects            = {};

        this.language           = options.language;

        this.arrayBuffer        = options.arrayBuffer;
        // Still used for header try not to shrink it too much as modMetadata can be longer than anticipated...
        this.bufferView         = new DataView(this.arrayBuffer, 0, Math.min(102400, this.arrayBuffer.byteLength));
        this.currentByte        = 0;

        // Was the save degraded by a faulty dropped item?
        this.isDegraded             = false;
        this.degradedMaxRangeLength = 2145386496;

        this.parseSave();
    }

    parseSave()
    {
        this.header                      = {};
        this.header.saveHeaderType       = this.readInt();

        if(this.header.saveHeaderType <= 99)
        {
            this.header.saveVersion          = this.readInt();
            this.header.buildVersion         = this.readInt();
            this.header.mapName              = this.readString();
            this.header.mapOptions           = this.readString();
            this.header.sessionName          = this.readString();
            this.header.playDurationSeconds  = this.readInt();
            this.header.saveDateTime         = this.readInt64();
            this.header.sessionVisibility    = this.readByte();

            if(this.header.saveHeaderType >= 7)
            {
                this.header.fEditorObjectVersion = this.readInt();
            }
            if(this.header.saveHeaderType >= 8)
            {
                this.header.modMetadata      = this.readString();
                this.header.isModdedSave     = this.readInt();
            }
            if(this.header.saveHeaderType >= 10)
            {
                this.header.saveIdentifier  = this.readString();
            }

            if(this.header.saveHeaderType >= 13)
            {
                this.header.isPartitionedWorld      = this.readInt();
                this.header.saveDataHash            = this.readHex(20);
                this.header.isCreativeModeEnabled   = this.readInt();
            }

            this.worker.postMessage({command: 'transferData', data: {header: this.header}});

            // We should now unzip the body!
            if(this.header.saveVersion >= 29)
            {
                // Remove the header...
                this.arrayBuffer        = this.arrayBuffer.slice(this.currentByte);

                this.handledByte        = 0;
                this.currentByte        = 0;
                this.maxByte            = this.arrayBuffer.byteLength;

                this.PACKAGE_FILE_TAG   = null;
                this.maxChunkSize       = null;
                this.currentChunks      = [];

                return this.inflateChunks();
            }
            else
            {
                this.worker.postMessage({command: 'alert', message: 'That save version isn\'t supported anymore... Please save it again in the game.'});
            }
        }
        else
        {
            this.worker.postMessage({command: 'alert', message: 'That save version isn\'t supported! Are you sure this is a proper save file???'});
        }
    }

    /*
     * Progress bar from 0 to 30%
     */
    inflateChunks()
    {
        while(this.handledByte < this.maxByte)
        {
            // Read chunk info size...
            let preHeader           = 0;
            let headerLength        = (this.header.saveVersion >= 41) ? 49 : 48;
            let chunkHeader         = new DataView(this.arrayBuffer.slice(preHeader, (preHeader + headerLength)));
                this.currentByte    = (preHeader + headerLength);
                this.handledByte   += (preHeader + headerLength);

            if(this.PACKAGE_FILE_TAG === null)
            {
                if(this.header.saveVersion >= 41)
                {
                    this.PACKAGE_FILE_TAG = chunkHeader.getBigUint64(0, true);
                }
                else
                {
                    this.PACKAGE_FILE_TAG = chunkHeader.getUint32(0, true);
                }

                this.worker.postMessage({command: 'transferData', data: {PACKAGE_FILE_TAG: this.PACKAGE_FILE_TAG}});
            }
            if(this.maxChunkSize === null)
            {
                this.maxChunkSize = chunkHeader.getUint32(8, true);
                this.worker.postMessage({command: 'transferData', data: {maxChunkSize: this.maxChunkSize}});
            }

            let currentChunkSize    = chunkHeader.getUint32(((this.header.saveVersion >= 41) ? 17 : 16), true); // 16 before update 8, compression format was added, should always be 3
            let currentChunk        = this.arrayBuffer.slice(this.currentByte, this.currentByte + currentChunkSize);
                this.handledByte   += currentChunkSize;
                this.currentByte   += currentChunkSize;

            // Free memory from previous chunk...
            this.arrayBuffer            = this.arrayBuffer.slice(this.currentByte);
            this.currentByte            = 0;

            // Inflate!
            try {
                // Inflate current chunk
                let currentInflatedChunk    = null;
                    currentInflatedChunk    = pako.inflate(currentChunk);
                    this.currentChunks.push(currentInflatedChunk);
            }
            catch(error)
            {
                this.worker.postMessage({command: 'alert', message: 'Something went wrong while trying to inflate your savegame. It seems to be related to adblock and we are looking into it.'});
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('pako', pako);
                }

                console.log(error);
                throw new Error(error);

                this.worker.postMessage({command: 'loaderHide'});
                return;
            }

            let currentPercentage = Math.round(this.handledByte / this.maxByte * 100);
                this.worker.postMessage({command: 'loaderMessage', message: 'Inflating save game (%1$s%)...', replace: currentPercentage});
                this.worker.postMessage({command: 'loaderProgress', percentage: (currentPercentage * 0.3)});
        }

        delete this.arrayBuffer;
        console.log('Inflated: ' + this.currentChunks.length + ' chunks...');
        this.worker.postMessage({command: 'loaderMessage', message: 'Merging inflated chunks...'});

        // Create the complete Uint8Array
        let newChunkLength = 0;
            for(let i = 0; i < this.currentChunks.length; i++)
            {
                // Don't go further than the max available range...
                if(newChunkLength + this.currentChunks[i].length > this.degradedMaxRangeLength)
                {
                    break;
                }

                newChunkLength += this.currentChunks[i].length;
            }

        let tempChunk       = new Uint8Array(newChunkLength);
        let currentLength   = 0;
            while(this.currentChunks.length > 0)
            {
                let currentChunk = this.currentChunks.shift();
                    if(currentLength + currentChunk.length > this.degradedMaxRangeLength)
                    {
                        this.currentChunks.unshift(currentChunk);
                        this.worker.postMessage({command: 'alertParsing', source: 'Save game was borked by deleting a bugged dropped item in the save.<br />The current fix is experimental but should most likely fix your save again, if you can please use a backup save.'});
                        break;
                    }

                tempChunk.set(currentChunk, currentLength);
                currentLength += currentChunk.length;
            }

        if(this.currentChunks.length === 0)
        {
            delete this.currentChunks;
        }
        else
        {
            this.isDegraded = true;
        }

        this.maxByte            = tempChunk.buffer.byteLength;
        this.bufferView         = new DataView(tempChunk.buffer);

        this.currentByte = (this.header.saveVersion >= 41) ? 8 : 4; // totalInflatedLength

        if(this.header.saveVersion >= 41)
        {
            let partitions      = {};
                partitions.unk2 = this.readInt();
                partitions.unk3 = this.readString();

                partitions.unk4 = this.readInt64();
                partitions.unk5 = this.readInt();
                partitions.unk6 = this.readString();

                partitions.unk7 = this.readInt();

                partitions.data = {};

            for(let i = 1; i < partitions.unk2; i++)
            {
                let partitionName                           = this.readString();
                    partitions.data[partitionName]          = {};
                    partitions.data[partitionName].unk1     = this.readInt();
                    partitions.data[partitionName].unk2     = this.readInt();
                    partitions.data[partitionName].levels   = {};

                let nbLevels = this.readInt();
                    for(let j = 0; j < nbLevels; j++)
                    {
                        partitions.data[partitionName].levels[this.readString()] = this.readUint();
                    }
            }

            this.worker.postMessage({command: 'transferData', data: {partitions: partitions}});
        }

        let collectables    = [];
        let nbLevels        = this.readInt();
        let levels          = [];

        for(let j = 0; j <= nbLevels; j++)
        {
            let levelName = (j === nbLevels) ? 'Level ' + this.header.mapName : this.readString();
                levels.push(levelName);

            let objectsBinaryLength         = (this.header.saveVersion >= 41) ? this.readInt64() : this.readInt();
            let objectsBinaryLengthStart    = this.currentByte;
                //console.log('objectsBinaryLength', levelName, objectsBinaryLength, objectsBinaryLengthStart)
            let entitiesToObjects   = [];
            let countObjects        = this.readInt();
                if(levelName === 'Level ' + this.header.mapName)
                {
                    console.time('Loaded ' + countObjects + ' objects...');
                    console.log('Loading ' + countObjects + ' objects...');
                }

            for(let i = 0; i < countObjects; i++)
            {
                let objectType = this.readInt();
                    switch(objectType)
                    {
                        case 0:
                            let object                          = this.readObject();
                                this.objects[object.pathName]   = object;
                                entitiesToObjects[i]            = object.pathName;
                            break;
                        case 1:
                            let actor                           = this.readActor();
                                this.objects[actor.pathName]    = actor;
                                entitiesToObjects[i]            = actor.pathName;

                                if(actor.className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
                                {
                                    this.worker.postMessage({command: 'transferData', data: {gameStatePathName: actor.pathName}});
                                }
                            break;
                        default:
                            console.log('Unknown object type', objectType);
                            break;
                    }

                // Only show progress for the main level
                if(i % 2500 === 0 && levelName === 'Level ' + this.header.mapName)
                {
                    this.worker.postMessage({command: 'loaderMessage', message: 'Parsing %1$s objects (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(countObjects), Math.round(i / countObjects * 100)]});
                    this.worker.postMessage({command: 'loaderProgress', percentage: (30 + (i / countObjects * 10))});
                }
            }

            if(levelName === 'Level ' + this.header.mapName)
            {
                console.timeEnd('Loaded ' + countObjects + ' objects...');
            }

            //TODO: Was it the same early?
            if(this.header.saveVersion >= 41)
            {
                // We skip collectables from the degraded mode...
                if(levelName === 'Level ' + this.header.mapName && this.isDegraded === true)
                {
                    this.currentByte = (objectsBinaryLengthStart + Number(objectsBinaryLength));
                }
                else
                {
                    if(this.currentByte < (objectsBinaryLengthStart + Number(objectsBinaryLength) - 4))
                    {
                        let countCollectedInBetween = this.readInt();
                            if(countCollectedInBetween > 0)
                            {
                                for(let i = 0; i < countCollectedInBetween; i++)
                                {
                                    let collectable = this.readObjectProperty();
                                        collectables.push(collectable);
                                }
                            }
                    }
                    else
                    {
                        if(this.currentByte === (objectsBinaryLengthStart + Number(objectsBinaryLength) - 4))
                        {
                            this.readInt();
                        }
                    }
                }
            }
            else
            {
                let countCollectedInBetween = this.readInt();
                    if(countCollectedInBetween > 0)
                    {
                        for(let i = 0; i < countCollectedInBetween; i++)
                        {
                            let collectable = this.readObjectProperty();
                                collectables.push(collectable);
                        }
                    }
            }

            let entitiesBinaryLength    = (this.header.saveVersion >= 41) ? this.readInt64() : this.readInt();
            let countEntities           = this.readInt();
                if(levelName === 'Level ' + this.header.mapName)
                {
                    console.time('Loaded ' + countEntities + ' entities...');
                    console.log('Loading ' + countEntities + ' entities...');
                }
            let objectsToFlush      = {};

            for(let i = 0; i < countEntities; i++)
            {
                //console.log(i, entitiesToObjects[i]);
                this.readEntity(entitiesToObjects[i]);

                // Avoid memory error on very large save!
                objectsToFlush[entitiesToObjects[i]] = this.objects[entitiesToObjects[i]];
                if(i > 0 && i % 5000 === 0)
                {
                    for(let pathName in objectsToFlush)
                    {
                        delete this.objects[pathName];
                    }
                    this.worker.postMessage({command: 'transferData', key: 'objects', data: objectsToFlush});
                    objectsToFlush = {};
                }

                // Only show progress for the main level
                if(i % 2500 === 0 && levelName === 'Level ' + this.header.mapName)
                {
                    this.worker.postMessage({command: 'loaderMessage', message: 'Parsing %1$s entities (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(countEntities), Math.round(i / countEntities * 100)]});
                    this.worker.postMessage({command: 'loaderProgress', percentage: (50 + (i / countEntities * 10))});

                    // Try to fill up the data view with the remaining chunks...
                    if(this.isDegraded === true && this.currentChunks !== undefined && (this.maxByte - this.currentByte) > this.maxChunkSize)
                    {
                        let tempBuffer          = this.bufferView.buffer.slice(this.currentByte);
                        let newChunkLength      = tempBuffer.byteLength;
                            for(let i = 0; i < this.currentChunks.length; i++)
                            {
                                // Don't go further than the max available range...
                                if(newChunkLength + this.currentChunks[i].length > this.degradedMaxRangeLength)
                                {
                                    break;
                                }

                                newChunkLength += this.currentChunks[i].length;
                            }

                            let tempChunk       = new Uint8Array(newChunkLength);
                                tempChunk.set(new Uint8Array(tempBuffer), 0);
                            let currentLength   = tempBuffer.byteLength;
                                while(this.currentChunks.length > 0)
                                {
                                    let currentChunk = this.currentChunks.shift();
                                        if(currentLength + currentChunk.length > this.degradedMaxRangeLength)
                                        {
                                            this.currentChunks.unshift(currentChunk);
                                            break;
                                        }

                                    tempChunk.set(currentChunk, currentLength);
                                    currentLength += currentChunk.length;
                                }

                        this.currentByte    = 0;
                        this.maxByte            = tempChunk.byteLength;
                        this.bufferView         = new DataView(tempChunk.buffer);

                        if(this.currentChunks.length === 0)
                        {
                            delete this.currentChunks;
                        }
                    }
                }
            }

            if(levelName === 'Level ' + this.header.mapName)
            {
                console.timeEnd('Loaded ' + countEntities + ' entities...');
            }

            let countCollected = this.readInt();
                if(countCollected > 0)
                {
                    for(let i = 0; i < countCollected; i++)
                    {
                        let collectable = this.readObjectProperty();
                            collectables.push(collectable);
                    }
                }

            this.worker.postMessage({command: 'transferData', key: 'objects', data: objectsToFlush});
        }

        // SKIP LAST COLLECTED - They represent old actor not exisiting in game anymore
        //TODO: Still correct after update 8?
        /*
        let collectablesEnd    = [];
        let countCollected  = this.readInt();
            for(let i = 0; i < countCollected; i++)
            {
                collectablesEnd.push(this.readObjectProperty({}));
            }
            console.log(collectablesEnd)
        /**/

        this.worker.postMessage({command: 'transferData', data: {collectables: [...new Map(collectables.map(item => [item.pathName, item])).values()]}});
        this.worker.postMessage({command: 'transferData', data: {levels: levels}});
        this.worker.postMessage({command: 'endSaveLoading'});
        return;
    }

    /*
     * Main objects
     */
    readObject()
    {
        let object                  = {};
            object.className        = this.readString();
            object                  = this.readObjectProperty(object);
            object.outerPathName    = this.readString();

        return object;
    }

    readActor()
    {
        let actor               = {};
            actor.className     = this.readString();
            actor               = this.readObjectProperty(actor);

        let needTransform       = this.readInt();
            if(needTransform !== 0)
            {
                actor.needTransform = needTransform;
            }

            // {rotation: [0, 0, 0, 1], translation: [0, 0, 0], scale3d: [1, 1, 1]}
            actor.transform     = {
                rotation            : [this.readFloat(), this.readFloat(), this.readFloat(), this.readFloat()],
                translation         : [this.readFloat(), this.readFloat(), this.readFloat()]
            };

            // Enforce bounding on the map to avoid the game from skipping physics!
            if(actor.className !== '/Game/FactoryGame/Buildable/Factory/ProjectAssembly/BP_ProjectAssembly.BP_ProjectAssembly_C')
            {
                if(actor.transform.translation[0] < -500000 || actor.transform.translation[0] > 500000 || actor.transform.translation[1] < -500000 || actor.transform.translation[1] > 500000 || actor.transform.translation[2] < -500000 || actor.transform.translation[2] > 500000)
                {
                    actor.transform.translation = [0, 0, 2000];
                    console.log('Out of bounds translation', actor.pathName);
                }
            }

            // Avoid lost vehicles in the game!
            if(isNaN(actor.transform.translation[0]) || isNaN(actor.transform.translation[1]) || isNaN(actor.transform.translation[2]))
            {
                actor.transform.translation = [0, 0, 2000];
                console.log('NaN translation', actor.pathName);
            }

            let scale3d = [this.readFloat(), this.readFloat(), this.readFloat()];
                if(scale3d[0] !== 1 || scale3d[1] !== 1 || scale3d[2] !== 1)
                {
                    actor.transform.scale3d = scale3d;
                }

        let wasPlacedInLevel       = this.readInt();
            if(wasPlacedInLevel !== 0) //TODO: Switch to 1?
            {
                actor.wasPlacedInLevel = wasPlacedInLevel;
            }

        return actor;
    }

    readEntity(objectKey)
    {
        this.currentEntitySaveVersion = this.header.saveVersion;
        if(this.header.saveVersion >= 41)
        {
            let entitySaveVersion = this.readInt();
                if(entitySaveVersion !== this.header.saveVersion)
                {
                    this.currentEntitySaveVersion               = entitySaveVersion;
                    this.objects[objectKey].entitySaveVersion   = entitySaveVersion;
                }
            this.readInt();//console.log('ENTITY INT2?', this.readInt(), entitySaveVersion)
        }

        let entityLength                            = this.readInt();
        let startByte                               = this.currentByte;
            //console.log(this.objects[objectKey].className, this.objects[objectKey].pathName, entityLength);

        if(this.objects[objectKey] !== undefined && this.objects[objectKey].outerPathName === undefined)
        {
            this.objects[objectKey].entity = this.readObjectProperty();

            let countChild  = this.readInt();
                if(countChild > 0)
                {
                    this.objects[objectKey].children = [];

                    for(let i = 0; i < countChild; i++)
                    {
                        this.objects[objectKey].children.push(this.readObjectProperty());
                    }
                }
        }

        if((this.currentByte - startByte) === entityLength)
        {
            this.objects[objectKey].shouldBeNulled = true;
            return;
        }

        // Read properties
        this.currentEntityClassName             = this.objects[objectKey].className;
        this.currentEntityPathName              = this.objects[objectKey].pathName;
        this.objects[objectKey].properties      = [];

        while(true)
        {
            let property = this.readProperty(this.objects[objectKey].className, objectKey);
                if(property === null)
                {
                    break;
                }

                this.objects[objectKey].properties.push(property);
        }

        // Read Conveyor missing bytes
        if(Building.isConveyor(this.objects[objectKey]))
        {
            this.objects[objectKey].extra   = {count: this.readInt(), items: []};
            let itemsLength                 = this.readInt();
                for(let i = 0; i < itemsLength; i++)
                {
                    let currentItem             = this.readInventoryItem();
                        currentItem.position    = this.readFloat();

                    this.objects[objectKey].extra.items.push(currentItem);
                }

            return;
        }

        // Read ConveyorChainActor missing bytes
        if(Building.isConveyorChainActor(this.objects[objectKey]))
        {
            this.objects[objectKey].extra   = {count: this.readInt(), mConveyors: []};

            // This will be generated from the Array of conveyors...
            this.readObjectProperty(); // this.objects[objectKey].extra.mFirstConveyor = this.readObjectProperty();
            this.readObjectProperty(); // this.objects[objectKey].extra.mLastConveyor  = this.readObjectProperty();

            let mConveyorLength = this.readInt();
                for(let i = 0; i < mConveyorLength; i++)
                {
                    let currentConveyor                 = {};
                        this.readObjectProperty(); // currentConveyor.mChainActor     = this.readObjectProperty();
                        currentConveyor.mConveyorBase   = this.readObjectProperty();
                        currentConveyor.splineData      = [];

                    let splineLength    = this.readInt();
                        for(let j = 0; j < splineLength; j++)
                        {
                            currentConveyor.splineData.push({
                                location        : {x: this.readDouble(), y: this.readDouble(), z: this.readDouble()},
                                arriveTangent   : {x: this.readDouble(), y: this.readDouble(), z: this.readDouble()},
                                leaveTangent    : {x: this.readDouble(), y: this.readDouble(), z: this.readDouble()}
                            });
                        }

                    currentConveyor.OffsetAtStart       = this.readFloat();
                    currentConveyor.StartsAtLength      = this.readFloat();
                    currentConveyor.EndsAtLength        = this.readFloat();
                    currentConveyor.FirstItemIndex      = this.readInt();
                    currentConveyor.LastItemIndex       = this.readInt();
                    currentConveyor.IndexInChainArray   = this.readInt();

                    this.objects[objectKey].extra.mConveyors.push(currentConveyor);
                }

            this.objects[objectKey].extra.mTotalLength      = this.readFloat();
            this.objects[objectKey].extra.mNumItems         = this.readInt();
            this.objects[objectKey].extra.mLeadItemIndex    = this.readInt();
            this.objects[objectKey].extra.mTailItemIndex    = this.readInt();
            this.objects[objectKey].extra.mActualItems      = [];

            let mActualItems = this.readInt();
                for(let i = 0; i < mActualItems; i++)
                {
                    let currentItem             = this.readInventoryItem();
                        currentItem.position    = this.readFloat();

                    this.objects[objectKey].extra.mActualItems.push(currentItem);
                }

            return;
        }


        // Read Powerline missing bytes
        if(Building.isPowerline(this.objects[objectKey]))
        {
            this.objects[objectKey].extra       = {
                count   : this.readInt(),
                source  : this.readObjectProperty(),
                target  : this.readObjectProperty()
            };

            // 2022-10-18: Added Cached locations for wire locations for use in visualization in blueprint hologram (can't depend on connection components)
            if(this.header.saveVersion >= 33 && this.header.saveVersion < 41)
            {
                this.objects[objectKey].extra.sourceTranslation = [this.readFloat(), this.readFloat(), this.readFloat()];
                this.objects[objectKey].extra.targetTranslation = [this.readFloat(), this.readFloat(), this.readFloat()];
            }

            return;
        }

        // Read Vehicle missing bytes
        if(Building.isVehicle(this.objects[objectKey]))
        {
            this.objects[objectKey].extra   = {count: this.readInt(), objects: []};
            let vehicleLength                   = this.readInt();
                for(let i = 0; i < vehicleLength; i++)
                {
                    this.objects[objectKey].extra.objects.push({
                        name   : this.readString(),
                        unk    : ((this.header.saveVersion >= 41) ? this.readHex(105) : this.readHex(53))
                    });
                }

            return;
        }

        // Read locomotive/freight wagon missing bytes
        if(Building.isLocomotive(this.objects[objectKey]) || Building.isFreightWagon(this.objects[objectKey]))
        {
            if(this.header.saveVersion >= 41)
            {
                    this.objects[objectKey].extra   = {count: this.readInt(), objects: []};
                let trainLength                     = this.readInt();
                    for(let i = 0; i < trainLength; i++)
                    {
                        this.objects[objectKey].extra.objects.push({
                            name   : this.readString(),
                            unk    : this.readHex(105)
                        });
                    }

                this.objects[objectKey].extra.previous  = this.readObjectProperty();
                this.objects[objectKey].extra.next      = this.readObjectProperty();
            }
            else
            {
                    this.objects[objectKey].extra   = {count: this.readInt(), objects: []};
                let trainLength                     = this.readInt();
                    for(let i = 0; i < trainLength; i++)
                    {
                        this.objects[objectKey].extra.objects.push({
                            name   : this.readString(),
                            unk    : this.readHex(53)
                        });
                    }

                this.objects[objectKey].extra.previous  = this.readObjectProperty();
                this.objects[objectKey].extra.next      = this.readObjectProperty();
            }

            return;
        }

        // Extra processing
        switch(this.objects[objectKey].className)
        {
            case '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C':
            case '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C':
                this.objects[objectKey].extra   = {count: this.readInt(), game: []};
                let gameLength                  = this.readInt();

                for(let i = 0; i < gameLength; i++)
                {
                    this.objects[objectKey].extra.game.push(this.readObjectProperty());

                    if(i === 0 && this.objects[objectKey].className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
                    {
                        this.worker.postMessage({command: 'transferData', data: {playerHostPathName: this.objects[objectKey].extra.game[0].pathName}});
                    }
                }

                /*
                if(this.objects[objectKey].className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
                {
                    console.log(this.objects[objectKey])
                    console.log('EXTRA', this.objects[objectKey].extra)
                }
                /**/

                break;

            case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                let missingPlayerState                      = (startByte + entityLength) - this.currentByte;
                    this.objects[objectKey].missing         = this.readHex(missingPlayerState);
                break;

            case '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C':
                if(this.header.saveVersion >= 41) // 2023-01-09: Tobias: Refactored drone actions to no longer be uobjects in order to fix a crash.
                {
                    this.objects[objectKey].extra   = {
                        unk1                : this.readInt(),
                        unk2                : this.readInt(),

                        mActiveAction       : [],
                        mActionQueue        : []
                    };

                   let mActiveActionLength = this.readInt();
                        for(let i = 0; i < mActiveActionLength; i++)
                        {

                            let mActiveAction   = {
                                    name        : this.readString(),
                                    properties  : []
                                };

                                    while(true)
                                {
                                    let mActiveActionProperty = this.readProperty();
                                        if(mActiveActionProperty === null)
                                        {
                                            break;
                                        }
                                        mActiveAction.properties.push(mActiveActionProperty);
                                }

                            this.objects[objectKey].extra.mActiveAction.push(mActiveAction);
                        }

                    let mActionQueueLength = this.readInt();
                        for(let i = 0; i < mActionQueueLength; i++)
                        {
                            let mActionQueue   = {
                                    name        : this.readString(),
                                    properties  : []
                                };

                                while(true)
                                {
                                    let mActionQueueProperty = this.readProperty();
                                        if(mActionQueueProperty === null)
                                        {
                                            break;
                                        }
                                        mActionQueue.properties.push(mActionQueueProperty);
                                }

                            this.objects[objectKey].extra.mActionQueue.push(mActionQueue);
                        }
                }
                else
                {
                    let missingDrone                    = (startByte + entityLength) - this.currentByte;
                        this.objects[objectKey].missing = this.readHex(missingDrone);
                }

                break;

            case '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
                    this.objects[objectKey].extra   = {count: this.readInt(), circuits: []};
                let circuitsLength                  = this.readInt();

                    for(let i = 0; i < circuitsLength; i++)
                    {
                        this.objects[objectKey].extra.circuits.push({
                            circuitId   : this.readInt(),
                            levelName   : this.readString(),
                            pathName    : this.readString()
                        });
                    }

                break;

            case '/Script/FactoryGame.FGLightweightBuildableSubsystem':
                this.readLightweightBuildableSubsystem((startByte + entityLength) - this.currentByte);

                break;

            default:
                let missingBytes = (startByte + entityLength) - this.currentByte;
                    if(missingBytes > 4)
                    {
                        if(
                                this.header.saveVersion >= 41
                            && (this.objects[objectKey].className.startsWith('/Script/FactoryGame.FG') || this.objects[objectKey].className.startsWith('/Script/FicsitFarming.') || this.objects[objectKey].className.startsWith('/Script/RefinedRDLib.'))
                        )
                        {
                            this.skipBytes(8);
                        }
                        else
                        {
                            this.objects[objectKey].missing = this.readHex(missingBytes); // TODO
                            console.log('MISSING ' + missingBytes + '  BYTES', this.objects[objectKey]);
                        }
                    }
                    else
                    {
                        this.skipBytes(4);
                    }
        }
    }

    readLightweightBuildableSubsystem(subsystemLength)
    {
        let startLength     = this.currentByte;
        let pathNamePool    = {};
        let objectsToFlush  = {};
        let objectCount     = 0;
            this.readInt(); // 0

        let buildableLength = this.readInt();
            for(let i = 0; i < buildableLength; i++)
            {
                    this.readInt(); // 0
                let currentClassName        = this.readString();
                let currentBuildableLength  = this.readInt();
                    objectCount            += currentBuildableLength;
                    for(let j = 0; j < currentBuildableLength; j++)
                    {
                        let lightweightObjectPathName = this.generateFastPathName('LightweightBuildable_' + currentClassName.split('/').pop() + '_', pathNamePool);
                            pathNamePool[lightweightObjectPathName] = true;

                        let lightweightObject = {
                                className           : currentClassName,
                                pathName            : lightweightObjectPathName,
                                transform           : {
                                    rotation            : [this.readDouble(), this.readDouble(), this.readDouble(), this.readDouble()],
                                    translation         : [this.readDouble(), this.readDouble(), this.readDouble()],
                                    scale3d             : [this.readDouble(), this.readDouble(), this.readDouble()]
                                },
                                customizationData   : {
                                    SwatchDesc          : this.readObjectProperty(),
                                    MaterialDesc        : this.readObjectProperty(),
                                    PatternDesc         : this.readObjectProperty(),
                                    SkinDesc            : this.readObjectProperty(),
                                    PrimaryColor        : {r: this.readFloat(), g:this.readFloat(), b:this.readFloat(), a: this.readFloat()},
                                    SecondaryColor      : {r: this.readFloat(), g:this.readFloat(), b:this.readFloat(), a: this.readFloat()},
                                    PaintFinish         : this.readObjectProperty(),
                                    PatternRotation     : {value: this.readInt8()}
                                },
                                properties          : [
                                    {
                                        name            : 'mBuiltWithRecipe',
                                        value           : this.readObjectProperty()
                                    },
                                    {
                                        name            : 'mBlueprintProxy',
                                        value           : this.readObjectProperty()
                                    }
                                ]
                            };

                        // Skip already deleted actors...
                        if(lightweightObject.customizationData.SwatchDesc.pathName === '' || lightweightObject.properties[0].value.pathName === '')
                        {
                            continue;
                        }

                        objectsToFlush[lightweightObjectPathName] = lightweightObject;

                        if(j > 0 && j % 5000 === 0)
                        {
                            this.worker.postMessage({command: 'transferData', key: 'objects', data: objectsToFlush});
                            objectsToFlush = {};

                            this.worker.postMessage({command: 'loaderMessage', message: 'Parsing lightweight objects (%1$s%)...', replace: Math.round((this.currentByte - startLength) / subsystemLength * 100)});
                            this.worker.postMessage({command: 'loaderProgress', percentage: (40 + ((this.currentByte - startLength) / subsystemLength * 10))});

                        }
                    }

                this.worker.postMessage({command: 'loaderMessage', message: 'Parsing lightweight objects (%1$s%)...', replace: Math.round((this.currentByte - startLength) / subsystemLength * 100)});
                this.worker.postMessage({command: 'loaderProgress', percentage: (40 + ((this.currentByte - startLength) / subsystemLength * 10))});

                this.worker.postMessage({command: 'transferData', key: 'objects', data: objectsToFlush});
                objectsToFlush = {};
            }

            console.log('Loaded ' + objectCount + ' lightweight objects...');
    }

    /*
     * Properties types
     */
    readProperty(parentType = null, objectKey = null)
    {
        let currentProperty         = {};
            currentProperty.name    = this.readString();
            if(currentProperty.name === 'None')
            {
                return null;
            }

        //TODO: What is this extra byte that is appearing sometime?
        let extraByteTest       = this.readByte();
            if(extraByteTest !== 0)
            {
                this.currentByte -= 1;
            }
            else
            {
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                    if(objectKey !== null)
                    {
                        Sentry.setContext('object', this.objects[objectKey]);
                    }
                    Sentry.captureMessage('Property extra byte');
                }
            }

        currentProperty.type        = this.readString().replace('Property', '');
        this.currentPropertyLength  = this.readInt(); // Length of the property, this is calculated when writing back ;)

        let index = this.readInt();
            if(index !== 0)
            {
                currentProperty.index = index;
            }

        switch(currentProperty.type)
        {
            case 'Bool':
                currentProperty.value   = this.readByte();
                currentProperty         = this.readPropertyGUID(currentProperty);

                break;

            case 'Int8':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readInt8();

                break;

            case 'Int':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readInt();

                break;

            case 'UInt32':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readUint();

                break;

            case 'Int64':
            case 'UInt64':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readInt64();

                break;

            case 'Float':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readFloat();

                break;

            case 'Double':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readDouble();

                break;

            case 'Str':
            case 'Name':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readString();

                break;

            case 'Object':
            case 'Interface':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readObjectProperty();

                break;

            case 'Enum':
                let enumPropertyName        = this.readString();
                    currentProperty         = this.readPropertyGUID(currentProperty);
                    currentProperty.value   = {
                        name    : enumPropertyName,
                        value   : this.readString()
                    };

                break;

            case 'Byte':
                let enumName            = this.readString(); //TODO
                    currentProperty     = this.readPropertyGUID(currentProperty);

                if(enumName === 'None')
                {
                    currentProperty.value = {
                        enumName    : enumName,
                        value       : this.readByte()
                    };
                }
                else
                {
                    currentProperty.value = {
                        enumName    : enumName,
                        valueName   : this.readString()
                    };
                }

                break;

            case 'Text':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty         = this.readTextProperty(currentProperty);

                break;

            case 'Array':
                currentProperty         = this.readArrayProperty(currentProperty, parentType);

                break;

            case 'Map':
                currentProperty         = this.readMapProperty(currentProperty, parentType);

                break;

            case 'Set':
                currentProperty         = this.readSetProperty(currentProperty, parentType);

                break;

            case 'SoftObject':
                currentProperty                 = this.readPropertyGUID(currentProperty);
                currentProperty.value   = {
                    pathName        : this.readString(),
                    subPathString   : this.readString()
                }
                this.readInt(); // 0

                break;

            case 'Struct':
                currentProperty         = this.readStructProperty(currentProperty, parentType);

                break;

            default:
                let rewind = this.lastStrRead + 128;
                    this.currentByte -= rewind;

                if(objectKey !== null)
                {
                    console.log(this.objects[objectKey]);
                }

                console.log(this.lastStrRead, this.readHex(rewind), this.readInt(), this.readInt(), this.readInt(), this.readInt());
                this.worker.postMessage({command: 'alertParsing', source: 'readProperty'});
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                }

                console.log(this.currentEntityClassName, this.currentEntityPathName);
                console.log('Unimplemented type `' + currentProperty.type + '` in Property `' + currentProperty.name + '` (' + this.currentByte + ')');
                throw new Error('Unimplemented type `' + currentProperty.type + '` in Property `' + currentProperty.name + '` (' + this.currentByte + ')');
        }

        return currentProperty;
    }

    readArrayProperty(currentProperty, parentType)
    {
            currentProperty.value       = {type: this.readString().replace('Property', ''), values: []};
            this.skipBytes();
        let currentArrayPropertyCount   = this.readInt();

        switch(currentProperty.value.type)
        {
            case 'Byte':
                switch(currentProperty.name)
                {
                    case 'mFogOfWarRawData':
                        for(let i = 0; i < (currentArrayPropertyCount / 4); i++)
                        {
                            this.readByte(); // 0
                            this.readByte(); // 0
                            currentProperty.value.values.push(this.readByte());
                            this.readByte(); // 255
                        }

                        break;

                    default:
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            currentProperty.value.values.push(this.readByte());
                        }
                }

                break;

            case 'Bool':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readByte());
                }

                break;

            case 'Int':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readInt());
                }

                break;

            case 'Int64':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readInt64());
                }

                break;

            case 'Float':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readFloat());
                }

                break;

            case 'Double':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readDouble());
                }

                break;

            case 'Enum':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push({name: this.readString()});
                }

                break;

            case 'Str':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readString());
                }

                break;

            case 'Text':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readTextProperty({}));
                }

                break;

            case 'Object':
            case 'Interface':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readObjectProperty());
                }

                break;

            case 'SoftObject':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push({
                        pathName        : this.readString(),
                        subPathString   : this.readString()
                    });
                    this.readInt(); // 0
                }

                break;

            case 'Struct':
                this.readString(); // Same as currentProperty.name
                this.readString(); // StructProperty

                this.readInt(); // structureSize
                this.readInt(); // 0

                currentProperty.structureSubType    = this.readString();

                let propertyGuid1 = this.readInt();
                let propertyGuid2 = this.readInt();
                let propertyGuid3 = this.readInt();
                let propertyGuid4 = this.readInt();
                    if(propertyGuid1 !== 0)
                    {
                        currentProperty.propertyGuid1 = propertyGuid1;
                    }
                    if(propertyGuid2 !== 0)
                    {
                        currentProperty.propertyGuid2 = propertyGuid2;
                    }
                    if(propertyGuid3 !== 0)
                    {
                        currentProperty.propertyGuid3 = propertyGuid3;
                    }
                    if(propertyGuid4 !== 0)
                    {
                        currentProperty.propertyGuid4 = propertyGuid4;
                    }

                this.skipBytes(1);

                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    switch(currentProperty.structureSubType)
                    {
                        case 'InventoryItem': // MOD: FicsItNetworks
                            currentProperty.value.values.push(this.readInventoryItem());

                            break;

                        case 'Guid':
                            currentProperty.value.values.push(this.readHex(16));

                            break;

                        case 'Vector':
                            if(this.header.saveVersion >= 41)
                            {
                                currentProperty.value.values.push({
                                    x           : this.readDouble(),
                                    y           : this.readDouble(),
                                    z           : this.readDouble()
                                });
                            }
                            else
                            {
                                currentProperty.value.values.push({
                                    x           : this.readFloat(),
                                    y           : this.readFloat(),
                                    z           : this.readFloat()
                                });
                            }

                            break;

                        case 'LinearColor':
                            currentProperty.value.values.push({
                                r : this.readFloat(),
                                g : this.readFloat(),
                                b : this.readFloat(),
                                a : this.readFloat()
                            });

                            break;

                         // MOD: FicsIt-Networks
                        case 'FINNetworkTrace':
                        case 'FIRTrace':
                            currentProperty.value.values.push(this.readFINNetworkTrace());

                            break;

                        // MOD: FicsIt-Networks
                        // See: https://github.com/CoderDE/FicsIt-Networks/blob/3472a437bcd684deb7096ede8f03a7e338b4a43d/Source/FicsItNetworks/Computer/FINComputerGPUT1.h#L42
                        case 'FINGPUT1BufferPixel':
                            currentProperty.value.values.push(this.readFINGPUT1BufferPixel());

                            break;

                        // MOD: FicsIt-Networks
                        case 'FINDynamicStructHolder':
                        case 'FIRInstancedStruct':
                            currentProperty.value.values.push(this.readFINDynamicStructHolder());

                            break;

                        default: // Try normalised structure, then throw Error if not working...
                            try
                            {
                                let subStructProperties = [];
                                    while(true)
                                    {
                                        let subStructProperty = this.readProperty(currentProperty.structureSubType);
                                            if(subStructProperty === null)
                                            {
                                                break;
                                            }

                                        subStructProperties.push(subStructProperty);
                                    }
                                currentProperty.value.values.push(subStructProperties);
                            }
                            catch(error)
                            {
                                this.worker.postMessage({command: 'alertParsing', source: 'readArrayProperty/structureSubType'});
                                if(typeof Sentry !== 'undefined')
                                {
                                    Sentry.setContext('currentProperty', currentProperty);
                                }

                                console.log(error);
                                console.log('Unimplemented structureSubType `' + currentProperty.structureSubType + '` in ArrayProperty `' + currentProperty.name + '`');
                                throw new Error('Unimplemented structureSubType `' + currentProperty.structureSubType + '` in ArrayProperty `' + currentProperty.name + '`');
                            }
                    }
                }

                break;

            default:
                this.worker.postMessage({command: 'alertParsing', source: 'readArrayProperty'});
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                }

                console.log('Unimplemented type `' + currentProperty.value.type + '` in ArrayProperty `' + currentProperty.name + '`');
                throw new Error('Unimplemented type `' + currentProperty.value.type + '` in ArrayProperty `' + currentProperty.name + '`');
        }

        return currentProperty;
    }

    readMapProperty(currentProperty, parentType)
    {
        currentProperty.value = {
            keyType         : this.readString().replace('Property', ''),
            valueType       : this.readString().replace('Property', ''),
            values          : []
        };

        this.skipBytes(1);
        currentProperty.value.modeType = this.readInt();

        if(currentProperty.value.modeType === 2)
        {
            currentProperty.value.modeUnk2 = this.readString();
            currentProperty.value.modeUnk3 = this.readString();
        }
        if(currentProperty.value.modeType === 3)
        {
            currentProperty.value.modeUnk1 = this.readHex(9);
            currentProperty.value.modeUnk2 = this.readString();
            currentProperty.value.modeUnk3 = this.readString();
        }

        let currentMapPropertyCount = this.readInt();
            for(let iMapProperty = 0; iMapProperty < currentMapPropertyCount; iMapProperty++)
            {
                let mapPropertyKey;
                let mapPropertySubProperties    = [];

                    switch(currentProperty.value.keyType)
                    {
                        case 'Int':
                            mapPropertyKey = this.readInt();

                            break;

                        case 'Int64':
                            mapPropertyKey = this.readInt64();

                            break;

                        case 'Name':
                        case 'Str':
                            mapPropertyKey = this.readString();

                            break;

                        case 'Object':
                            mapPropertyKey = this.readObjectProperty();

                            break;

                        case 'Enum':
                            mapPropertyKey = {
                                name        : this.readString()
                            };

                            break;

                        case 'Struct':
                            if(currentProperty.name === 'Destroyed_Foliage_Transform')
                            {
                                if(this.header.saveVersion >= 41)
                                {
                                    mapPropertyKey = {
                                        x: this.readDouble(),
                                        y: this.readDouble(),
                                        z: this.readDouble()
                                    };
                                }
                                else
                                {
                                    mapPropertyKey = {
                                        x: this.readFloat(),
                                        y: this.readFloat(),
                                        z: this.readFloat()
                                    };
                                }

                                break;
                            }
                            if(parentType === '/BuildGunUtilities/BGU_Subsystem.BGU_Subsystem_C')       // Mod: Universal Destroyer/Factory Statistics
                            {
                                mapPropertyKey = {
                                    x: this.readFloat(),
                                    y: this.readFloat(),
                                    z: this.readFloat()
                                };

                                break;
                            }

                            if(
                                    currentProperty.name === 'mSaveData'                                // Update 8
                                 || currentProperty.name === 'mUnresolvedSaveData'                      // Update 8
                            )
                            {
                                mapPropertyKey = {
                                    x: this.readInt(),
                                    y: this.readInt(),
                                    z: this.readInt()
                                };

                                break;
                            }

                            mapPropertyKey = [];
                            while(true)
                            {
                                let subMapPropertyValue = this.readProperty();
                                    if(subMapPropertyValue === null)
                                    {
                                        break;
                                    }

                                mapPropertyKey.push(subMapPropertyValue);
                            }

                            break;

                        default:
                            this.worker.postMessage({command: 'alertParsing', source: 'readMapProperty/keyType'});
                            if(typeof Sentry !== 'undefined')
                            {
                                Sentry.setContext('currentProperty', currentProperty);
                            }

                            console.log('Unimplemented keyType `' + currentProperty.value.keyType + '` in MapProperty `' + currentProperty.name + '`');
                            throw new Error('Unimplemented keyType `' + currentProperty.value.keyType + '` in MapProperty `' + currentProperty.name + '`');
                    }

                    switch(currentProperty.value.valueType)
                    {
                        case 'Byte':
                            if(currentProperty.value.keyType === 'Str')
                            {
                                mapPropertySubProperties    = this.readString();
                            }
                            else
                            {
                                mapPropertySubProperties    = this.readByte();
                            }

                            break;

                        case 'Bool':
                            mapPropertySubProperties    = this.readByte();

                            break;

                        case 'Int':
                            mapPropertySubProperties    = this.readInt();

                            break;

                        case 'Int64':
                            mapPropertySubProperties    = this.readInt64();

                            break;

                        case 'Float':
                            mapPropertySubProperties    = this.readFloat();

                            break;

                        case 'Double':
                            mapPropertySubProperties    = this.readDouble();

                            break;

                        case 'Str':
                            if(parentType === '/BuildGunUtilities/BGU_Subsystem.BGU_Subsystem_C')
                            {
                                mapPropertySubProperties.unk1           = this.readFloat();
                                mapPropertySubProperties.unk2           = this.readFloat();
                                mapPropertySubProperties.unk3           = this.readFloat();
                            }

                            mapPropertySubProperties    = this.readString();

                            break;

                        case 'Object':
                            if(parentType === '/BuildGunUtilities/BGU_Subsystem.BGU_Subsystem_C')
                            {
                                mapPropertySubProperties.unk1           = this.readFloat();
                                mapPropertySubProperties.unk2           = this.readFloat();
                                mapPropertySubProperties.unk3           = this.readFloat();
                                mapPropertySubProperties.unk4           = this.readFloat();

                                mapPropertySubProperties.unk5           = this.readString();
                                //mapPropertySubProperties.unk6           = this.readProperty();

                                break;
                            }

                            mapPropertySubProperties    = this.readObjectProperty();

                            break;

                        case 'Text':
                            mapPropertySubProperties    = this.readTextProperty({});

                            break;

                        case 'Struct':
                            if(parentType === 'LBBalancerData')
                            {
                                mapPropertySubProperties.mNormalIndex   = this.readInt();
                                mapPropertySubProperties.mOverflowIndex = this.readInt();
                                mapPropertySubProperties.mFilterIndex   = this.readInt();

                                break;
                            }
                            if(parentType === '/StorageStatsRoom/Sub_SR.Sub_SR_C' || parentType === '/CentralStorage/Subsystem_SC.Subsystem_SC_C')
                            {
                                if(this.header.saveVersion >= 41)
                                {
                                    mapPropertySubProperties.unk1           = this.readDouble();
                                    mapPropertySubProperties.unk2           = this.readDouble();
                                    mapPropertySubProperties.unk3           = this.readDouble();
                                }
                                else
                                {
                                    mapPropertySubProperties.unk1           = this.readFloat();
                                    mapPropertySubProperties.unk2           = this.readFloat();
                                    mapPropertySubProperties.unk3           = this.readFloat();
                                }

                                break;
                            }

                            while(true)
                            {
                                let subMapProperty = this.readProperty();
                                    if(subMapProperty === null)
                                    {
                                        break;
                                    }

                                mapPropertySubProperties.push(subMapProperty);
                            }
                            break;

                        default:
                            this.worker.postMessage({command: 'alertParsing', source: 'readMapProperty/valueType'});
                            if(typeof Sentry !== 'undefined')
                            {
                                Sentry.setContext('currentProperty', currentProperty);
                            }

                            console.log('Unimplemented valueType `' + currentProperty.value.valueType + '` in MapProperty `' + currentProperty.name + '`');
                            throw new Error('Unimplemented valueType `' + currentProperty.value.valueType + '` in MapProperty `' + currentProperty.name + '`');
                    }

                currentProperty.value.values[iMapProperty]    = {
                    keyMap      : mapPropertyKey,
                    valueMap    : mapPropertySubProperties
                };
            }

        return currentProperty;
    }

    readSetProperty(currentProperty, parentType)
    {
        currentProperty.value = {type: this.readString().replace('Property', ''), values: []};
        this.skipBytes(5); // skipByte(1) + 0

        let setPropertyLength = this.readInt();
            for(let iSetProperty = 0; iSetProperty < setPropertyLength; iSetProperty++)
            {
                switch(currentProperty.value.type)
                {
                    case 'Object':
                        currentProperty.value.values.push(this.readObjectProperty());

                        break;

                    case 'Struct':
                        if(parentType === '/Script/FactoryGame.FGFoliageRemoval')
                        {
                            currentProperty.value.values.push({
                                x: this.readFloat(),
                                y: this.readFloat(),
                                z: this.readFloat()
                            });

                            break;
                        }
                        if(parentType === '/Script/FactoryGame.FGScannableSubsystem')
                        {
                            currentProperty.value.values.push({guid: this.readHex(16)});

                            break;
                        }

                        // MOD: FicsIt-Networks
                        currentProperty.value.values.push(this.readFINNetworkTrace());
                        break;

                    case 'Name':    // MOD: Sweet Transportal
                    case 'Str':     // Mod: ???
                        currentProperty.value.values.push({name: this.readString()});

                        break;

                    case 'Int':
                        currentProperty.value.values.push({int: this.readInt()});

                        break;

                    case 'UInt32':
                        currentProperty.value.values.push({int: this.readUint()});

                        break;

                    default:
                        let rewind = this.lastStrRead + 128;
                            this.currentByte -= rewind;
                        console.log(this.lastStrRead, this.readHex(rewind), this.readInt(), this.readInt(), this.readInt(), this.readInt());
                        this.worker.postMessage({command: 'alertParsing', source: 'readSetProperty'});
                        if(typeof Sentry !== 'undefined')
                        {
                            Sentry.setContext('currentProperty', currentProperty);
                        }

                        console.log('Unimplemented type `' + currentProperty.value.type + '` in SetProperty `' + currentProperty.name + '` (' + this.currentByte + ')');
                        throw new Error('Unimplemented type `' + currentProperty.value.type + '` in SetProperty `' + currentProperty.name + '` (' + this.currentByte + ')');
                }
            }

        return currentProperty;
    }

    readStructProperty(currentProperty, parentType)
    {
        currentProperty.value = {type: this.readString()};
        this.skipBytes(17); // 0 0 0 0 + skipByte(1)

        switch(currentProperty.value.type)
        {
            case 'Color':
                currentProperty.value.values = {
                    b           : this.readByte(),
                    g           : this.readByte(),
                    r           : this.readByte(),
                    a           : this.readByte()
                };

                break;

            case 'LinearColor':
                currentProperty.value.values = {
                    r           : this.readFloat(),
                    g           : this.readFloat(),
                    b           : this.readFloat(),
                    a           : this.readFloat()
                };

                break;

            case 'Vector':
            case 'Rotator':
                if(this.header.saveVersion >= 41 && parentType !== 'SpawnData')
                {
                    currentProperty.value.values = {
                        x           : this.readDouble(),
                        y           : this.readDouble(),
                        z           : this.readDouble()
                    };
                }
                else
                {
                    currentProperty.value.values = {
                        x           : this.readFloat(),
                        y           : this.readFloat(),
                        z           : this.readFloat()
                    };
                }

                break;

            case 'Vector2D':
                if(this.header.saveVersion >= 41)
                {
                    currentProperty.value.values = {
                        x           : this.readDouble(),
                        y           : this.readDouble()
                    };
                }
                else
                {
                    currentProperty.value.values = {
                        x           : this.readFloat(),
                        y           : this.readFloat()
                    };
                }

                break;

            case 'IntVector4':
                currentProperty.value.values = {
                        a           : this.readInt(),
                        b           : this.readInt(),
                        c           : this.readInt(),
                        d           : this.readInt()
                    };

                break;

            case 'Quat':
            case 'Vector4':
                if(this.header.saveVersion >= 41)
                {
                    currentProperty.value.values = {
                        a           : this.readDouble(),
                        b           : this.readDouble(),
                        c           : this.readDouble(),
                        d           : this.readDouble()
                    };
                }
                else
                {
                    currentProperty.value.values = {
                        a           : this.readFloat(),
                        b           : this.readFloat(),
                        c           : this.readFloat(),
                        d           : this.readFloat()
                    };
                }

                break;

            case 'Box':
                if(this.header.saveVersion >= 41)
                {
                    currentProperty.value.min = {
                        x           : this.readDouble(),
                        y           : this.readDouble(),
                        z           : this.readDouble()
                    };
                    currentProperty.value.max = {
                        x           : this.readDouble(),
                        y           : this.readDouble(),
                        z           : this.readDouble()
                    };
                }
                else
                {
                    currentProperty.value.min = {
                        x           : this.readFloat(),
                        y           : this.readFloat(),
                        z           : this.readFloat()
                    };
                    currentProperty.value.max = {
                        x           : this.readFloat(),
                        y           : this.readFloat(),
                        z           : this.readFloat()
                    };
                }

                currentProperty.value.isValid = this.readByte();

                break;

            case 'RailroadTrackPosition':
                currentProperty.value               = this.readObjectProperty(currentProperty.value);
                currentProperty.value.offset        = this.readFloat();
                currentProperty.value.forward       = this.readFloat();

                break;

            case 'TimerHandle':
                currentProperty.value.handle        = this.readString();

                break;

            case 'Guid': // MOD?
                currentProperty.value.guid          = this.readHex(16);

                break;

            case 'InventoryItem':
                currentProperty.value = this.readInventoryItem(currentProperty.value);

                if(this.header.saveVersion >= 46)
                {
                    let buggyInt = this.readInt();
                        if(buggyInt !== 0)
                        {
                            this.currentByte -=4;
                        }
                        else
                        {
                            console.log('HAS BUGGYINT, REMOVING...', this.currentEntityPathName);
                        }
                }

                currentProperty.value.properties    = [this.readProperty()];

                break;

            case 'ClientIdentityInfo':
                currentProperty.value.hex = this.readHex(this.currentPropertyLength);

                /*

                console.log(this.readInt());
                let platformType = this.readByte();
                    console.log('platformType', platformType);

                    switch(platformType)
                    {
                        case 6: // Steam?
                            console.log(this.readHex(12));
                            break;
                        default:

                    }
                */

                break;

            case 'FluidBox':
                currentProperty.value.value         = this.readFloat();

                break;

            case 'SlateBrush': // MOD?
                currentProperty.value.unk1          = this.readString();

                break;

            case 'DateTime': // MOD: Power Suit
                currentProperty.value.dateTime      = this.readInt64();

                break;

            case 'FINNetworkTrace': // MOD: FicsIt-Networks
            case 'FIRTrace':
                currentProperty.value.values        = this.readFINNetworkTrace();

                break;

            case 'FINLuaProcessorStateStorage': // MOD: FicsIt-Networks
                currentProperty.value.values        = this.readFINLuaProcessorStateStorage();

                break;

            case 'FICFrameRange': // https://github.com/Panakotta00/FicsIt-Cam/blob/c55e254a84722c56e1badabcfaef1159cd7d2ef1/Source/FicsItCam/Public/Data/FICTypes.h#L34
                currentProperty.value.begin         = this.readInt64();
                currentProperty.value.end           = this.readInt64();

                break;

            case 'IntPoint': // MOD: FicsIt-Cam
                currentProperty.value.x             = this.readInt();
                currentProperty.value.y             = this.readInt();

                break;

            default: // Try normalised structure, then throw Error if not working...
                try
                {
                    currentProperty.value.values = [];
                    while(true)
                    {
                        let subStructProperty = this.readProperty(currentProperty.value.type);
                            if(subStructProperty === null)
                            {
                                break;
                            }

                        currentProperty.value.values.push(subStructProperty);

                        if(subStructProperty.value !== undefined && subStructProperty.value.properties !== undefined && subStructProperty.value.properties.length === 1 && subStructProperty.value.properties[0] === null)
                        {
                            break;
                        }
                    }
                }
                catch(error)
                {
                    this.worker.postMessage({command: 'alertParsing', source: 'readStructProperty'});
                    if(typeof Sentry !== 'undefined')
                    {
                        Sentry.setContext('currentProperty', currentProperty);
                    }

                    console.log(error);
                    console.log('Unimplemented type `' + currentProperty.value.type + '` in StructProperty `' + currentProperty.name + '`');
                    throw new Error('Unimplemented type `' + currentProperty.value.type + '` in StructProperty `' + currentProperty.name + '`');
                }
        }

        return currentProperty;
    }


    /*
    // ETextHistoryType
    const HISTORYTYPE_ORDEREDFORMAT = 2;
    const HISTORYTYPE_ASNUMBER = 4;
    const HISTORYTYPE_ASPERCENT = 5;
    const HISTORYTYPE_ASCURRENCY = 6;
    const HISTORYTYPE_ASDATE = 7;
    const HISTORYTYPE_ASTIME = 8;
    const HISTORYTYPE_ASDATETIME = 9;
    */
    readTextProperty(currentProperty)
    {
        currentProperty.flags       = this.readInt();
        currentProperty.historyType = this.readByte();

        switch(currentProperty.historyType)
        {
            case 0:                             // HISTORYTYPE_BASE
                currentProperty.namespace       = this.readString();
                currentProperty.key             = this.readString();
                currentProperty.value           = this.readString();

                break;

            // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/TextHistory.cpp#L1354
            case 1:                             // HISTORYTYPE_NAMEDFORMAT
            case 3:                             // HISTORYTYPE_ARGUMENTFORMAT
                currentProperty.sourceFmt       = this.readTextProperty({});

                currentProperty.argumentsCount  = this.readInt();
                currentProperty.arguments       = [];

                for(let i = 0; i < currentProperty.argumentsCount; i++)
                {
                    let currentArgumentsData                = {};
                        currentArgumentsData.name           = this.readString();
                        currentArgumentsData.valueType      = this.readByte();

                        switch(currentArgumentsData.valueType)
                        {
                            case 0: // FORMATARGUMENTTYPE_INT
                                currentArgumentsData.argumentValue    = this.readInt();
                                currentArgumentsData.argumentValueUnk = this.readInt();
                                break;
                            case 4: // FORMATARGUMENTTYPE_TEXT
                                currentArgumentsData.argumentValue    = this.readTextProperty({});
                                break;
                            case 1: // FORMATARGUMENTTYPE_UINT
                            case 5: // FORMATARGUMENTTYPE_GENDER
                            case 2: // FORMATARGUMENTTYPE_FLOAT
                            case 3: // FORMATARGUMENTTYPE_DOUBLE
                            default:
                                this.worker.postMessage({command: 'alertParsing'});
                                if(typeof Sentry !== 'undefined')
                                {
                                    Sentry.setContext('currentProperty', currentProperty);
                                    Sentry.setContext('currentArgumentsData', currentArgumentsData);
                                }
                                throw new Error('Unimplemented FormatArgumentType `' + currentArgumentsData.valueType + '` in TextProperty `' + currentProperty.name + '`');
                        }

                    currentProperty.arguments.push(currentArgumentsData);
                }

                break;

            // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/TextHistory.cpp#L2268
            case 10:                                // HISTORYTYPE_TRANSFORM
                currentProperty.sourceText          = this.readTextProperty({});
                currentProperty.transformType       = this.readByte();

                break;

            // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/TextHistory.cpp#L2463
            case 11:                                //HISTORYTYPE_STRINGTABLEENTRY
                currentProperty.tableId             = this.readString();
                currentProperty.textKey             = this.readString();

                break;

            // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/Text.cpp#L894
            case 255:                               // HISTORYTYPE_NONE
                if(this.header.buildVersion >= 140822)
                {
                    currentProperty.hasCultureInvariantString   = this.readInt();

                    if(currentProperty.hasCultureInvariantString === 1)
                    {
                        currentProperty.value = this.readString();
                    }
                }

                break;

            default:
                this.worker.postMessage({command: 'alertParsing'});
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                }
                throw new Error('Unimplemented historyType `' + currentProperty.historyType + '` in TextProperty `' + currentProperty.name + '`');
        }

        return currentProperty;
    }

    readObjectProperty(currentProperty = {})
    {
        let levelName   = this.readString();
            if(levelName !== this.header.mapName)
            {
                currentProperty.levelName   = levelName;
                currentProperty.pathName    = this.readString();
            }
            else
            {
                currentProperty.pathName    = this.readString();
            }

        return currentProperty;
    }

    readPropertyGUID(currentProperty)
    {
        let hasPropertyGuid         = this.readByte();
            if(hasPropertyGuid === 1)
            {
                currentProperty.propertyGuid = this.readHex(16);
            }

        return currentProperty;
    }

    readInventoryItem(currentProperty = {})
    {
        currentProperty.itemName = this.readObjectProperty();

        if(this.header.saveVersion >= 44 && this.currentEntitySaveVersion >= 44)
        {
            let itemState = this.readInt();
                if(itemState !== 0)
                {
                    currentProperty.itemState             = this.readObjectProperty();
                    currentProperty.itemStateProperties   = [];

                    if(currentProperty.itemState.pathName === '/Script/FicsItNetworksComputer.FINItemStateFileSystem')
                    {
                        currentProperty.FINItemStateFileSystem = this.readHex(this.readInt());
                    }
                    else
                    {
                        this.readInt(); // itemStateLength
                        while(true)
                        {
                            let property = this.readProperty();
                                if(property === null)
                                {
                                    break;
                                }

                                currentProperty.itemStateProperties.push(property);
                        }
                    }
                }
        }
        else
        {
            currentProperty.itemState = this.readObjectProperty();
        }

        return currentProperty;
    }



    /*
     * BYTES MANIPULATIONS
     */
    skipBytes(byteLength = 1)
    {
        this.currentByte += byteLength;
    }
    readByte()
    {
        return parseInt(this.bufferView.getUint8(this.currentByte++, true));
    }
    readHex(hexLength)
    {
        let hexPart = [];
            for(let i = 0; i < hexLength; i++)
            {
                let currentHex = String.fromCharCode(
                        this.bufferView.getUint8(this.currentByte++, true)
                    );
                    hexPart.push(currentHex);
            }

        return hexPart.join('');
    }

    readInt8()
    {
        let data = this.bufferView.getInt8(this.currentByte++, true);

        return data;
    }
    readInt()
    {
        let data = this.bufferView.getInt32(this.currentByte, true);
            this.currentByte += 4;

        return data;
    }
    readUint()
    {
        let data = this.bufferView.getUint32(this.currentByte, true);
            this.currentByte += 4;
            return data;
    }
    readInt64()
    {
        let data = this.bufferView.getBigInt64(this.currentByte, true);
            this.currentByte += 8;

        return Number(data);
    }

    readFloat()
    {
        let data = this.bufferView.getFloat32(this.currentByte, true);
            this.currentByte += 4;

        return data;
    }
    readDouble()
    {
        let data = this.bufferView.getFloat64(this.currentByte, true);
            this.currentByte += 8;

        return data;
    }

    readString()
    {
        let strLength       = this.readInt();
        this.lastStrRead    = strLength;
        let startBytes      = this.currentByte;

        if(strLength === 0)
        {
            return '';
        }

        // Range error!
        if(strLength > (this.maxByte - this.currentByte))
        {
            let debugSize       = 512;
            this.currentByte    = Math.max(0, startBytes - (debugSize * 2));
            let errorMessage    = 'Cannot readString (' + strLength + '): `' + this.readHex(debugSize * 2) + '`=========`' + this.readHex(debugSize) + '`';
                console.log(errorMessage);
                this.worker.postMessage({command: 'alertParsing'});
                throw new Error(errorMessage);
        }

        // UTF16
        if(strLength < 0)
        {
                strLength   = -strLength - 1;
            let string      = [];

            for(let i = 0; i < strLength; ++i)
            {
                let caracter = String.fromCharCode(
                        this.bufferView.getUint16(this.currentByte++, true)
                    );
                    string.push(caracter);
                    this.currentByte++;
            }
            this.currentByte++;
            this.currentByte++;

            return string.join('');
        }

        try
        {
                strLength   = strLength -1;
            let string      = [];

            for(let i = 0; i < strLength; i++)
            {
                string.push(String.fromCharCode(
                    this.bufferView.getUint8(this.currentByte++, true)
                ));
            }
            this.currentByte++;

            return string.join('');
        }
        catch(error)
        {
            let debugSize       = 512;
            this.currentByte    = Math.max(0, startBytes - (debugSize * 2));
            let errorMessage    = 'Cannot readString (' + strLength + '): `' + this.readHex(debugSize * 2) + '`=========`' + this.readHex(debugSize) + '`';
                console.log(error);
                console.log(errorMessage);
                this.worker.postMessage({command: 'alertParsing'});
                throw new Error(errorMessage);
        }
    }

    /*
     * FicsIt-Networks properties
     */
    readFINGPUT1BufferPixel()
    {
        return {
            character           : this.readHex(2),
            foregroundColor     : {
                r : this.readFloat(),
                g : this.readFloat(),
                b : this.readFloat(),
                a : this.readFloat()
            },
            backgroundColor     : {
                r : this.readFloat(),
                g : this.readFloat(),
                b : this.readFloat(),
                a : this.readFloat()
            }
        };
    }

    // https://github.com/CoderDE/FicsIt-Networks/blob/ab918a81a8a7527aec0cf6cd35270edfc5a1ddfe/Source/FicsItNetworks/Network/FINNetworkTrace.cpp#L154
    readFINNetworkTrace()
    {
        let data            = {};
            data.levelName  = this.readString();
            data.pathName   = this.readString();

            let hasPrev = this.readInt();
                if(hasPrev === 1)
                {
                    data.prev  = this.readFINNetworkTrace();
                }
            let hasStep = this.readInt();
                if(hasStep === 1)
                {
                    data.step  = this.readString();
                }

        return data;
    }

    // https://github.com/CoderDE/FicsIt-Networks/blob/master/Source/FicsItNetworks/FicsItKernel/Processor/Lua/LuaProcessorStateStorage.cpp#L6
    readFINLuaProcessorStateStorage()
    {
        let data            = {trace: [], reference: [], structs: []};
        let countTrace      = this.readInt();
            for(let i = 0; i < countTrace; i++)
            {
                data.trace.push(this.readFINNetworkTrace());
            }

        let countReference  = this.readInt();
            for(let i = 0; i < countReference; i++)
            {
                data.reference.push({
                    levelName: this.readString(),
                    pathName: this.readString()
                });
            }

        data.thread         = this.readString();
        data.globals        = this.readString();

        let countStructs    = this.readInt();
            data.structs    = [];

            for(let i = 0; i < countStructs; i++)
            {
                let structure = {};
                    structure.unk1  = this.readInt();
                    structure.unk2  = this.readString();

                    switch(structure.unk2)
                    {
                        case '/Script/CoreUObject.Vector':
                            structure.x         = this.readFloat();
                            structure.y         = this.readFloat();
                            structure.z         = this.readFloat();

                            break;

                        case '/Script/CoreUObject.Vector2D':
                            structure.x         = this.readDouble();
                            structure.y         = this.readDouble();

                            break;

                        case '/Script/CoreUObject.LinearColor':
                            structure.r         = this.readFloat();
                            structure.g         = this.readFloat();
                            structure.b         = this.readFloat();
                            structure.a         = this.readFloat();

                            break;

                        case '/Script/FactoryGame.InventoryStack':
                            if(this.header.saveVersion >= 42)
                            {
                                structure.unk3      = this.readString();
                                structure.unk4      = this.readString();
                                structure.unk5      = this.readInt();
                                structure.unk6      = this.readInt();
                                structure.unk7      = this.readStructProperty(structure, structure.unk2);
                                structure.unk8      = this.readString();
                            }
                            else
                            {
                                structure.unk3      = this.readInt();
                                structure.unk4      = this.readString();

                                structure.unk5      = this.readInt();
                                structure.unk6      = this.readInt();
                                structure.unk7      = this.readInt();
                            }

                            break;

                        case '/Script/FactoryGame.ItemAmount':
                            structure.unk3      = this.readInt();
                            structure.unk4      = this.readString();
                            structure.unk5      = this.readInt();

                            break;

                        case '/Script/FicsItNetworks.FINTrackGraph':
                            structure.trace     = this.readFINNetworkTrace();
                            structure.trackId   = this.readInt();

                            break;

                         // Skip!
                        case '/Script/FactoryGame.PrefabSignData':
                        case '/Script/FicsItNetworks.FINInternetCardHttpRequestFuture':
                        case '/Script/FicsItNetworksComputer.FINInternetCardHttpRequestFuture':
                        case '/Script/FactoryGame.InventoryItem':
                        case '/Script/FicsItNetworks.FINRailroadSignalBlock':
                        case '/Script/FicsItNetworksLua.FINLuaEventRegistry':

                            break;

                        case '/Script/FicsItNetworks.FINGPUT1Buffer':
                            structure.x         = this.readInt();
                            structure.y         = this.readInt();
                            structure.size      = this.readInt();
                            structure.name      = this.readString();
                            structure.type      = this.readString();
                            structure.length    = this.readInt();
                            structure.buffer    = [];
                                for(let size = 0; size < structure.size; size++)
                                {
                                    structure.buffer.push(this.readFINGPUT1BufferPixel());
                                }
                            structure.unk3      = this.readHex(45); //TODO: Not sure at all!

                            break;
                        default:
                            this.worker.postMessage({command: 'alertParsing'});
                            if(typeof Sentry !== 'undefined')
                            {
                                Sentry.setContext('currentData', data);
                            }

                            console.log('Unimplemented `' + structure.unk2 + '` in readFINLuaProcessorStateStorage');
                            // Instead of throwing an error, we'll skip this structure
                            break;
                    }

                    data.structs.push(structure);
            }

        return data;
    }
    {
        let data            = {trace: [], reference: [], structs: []};
        let countTrace      = this.readInt();
            for(let i = 0; i < countTrace; i++)
            {
                data.trace.push(this.readFINNetworkTrace());
            }

        let countReference  = this.readInt();
            for(let i = 0; i < countReference; i++)
            {
                data.reference.push({
                    levelName: this.readString(),
                    pathName: this.readString()
                });
            }

        data.thread         = this.readString();
        data.globals        = this.readString();

        let countStructs    = this.readInt();
            data.structs    = [];

            for(let i = 0; i < countStructs; i++)
            {
                let structure = {};
                    structure.unk1  = this.readInt();
                    structure.unk2  = this.readString();

                    switch(structure.unk2)
                    {
                        case '/Script/CoreUObject.Vector':
                            structure.x         = this.readFloat();
                            structure.y         = this.readFloat();
                            structure.z         = this.readFloat();

                            break;

                        case '/Script/CoreUObject.Vector2D':
                            structure.x         = this.readDouble();
                            structure.y         = this.readDouble();

                            break;

                        case '/Script/CoreUObject.LinearColor':
                            structure.r         = this.readFloat();
                            structure.g         = this.readFloat();
                            structure.b         = this.readFloat();
                            structure.a         = this.readFloat();

                            break;

                        case '/Script/FactoryGame.InventoryStack':
                            if(this.header.saveVersion >= 42)
                            {
                                structure.unk3      = this.readString();
                                structure.unk4      = this.readString();
                                structure.unk5      = this.readInt();
                                structure.unk6      = this.readInt();
                                structure.unk7      = this.readStructProperty(structure, structure.unk2);
                                structure.unk8      = this.readString();
                            }
                            else
                            {
                                structure.unk3      = this.readInt();
                                structure.unk4      = this.readString();

                                structure.unk5      = this.readInt();
                                structure.unk6      = this.readInt();
                                structure.unk7      = this.readInt();
                            }

                            break;

                        case '/Script/FactoryGame.ItemAmount':
                            structure.unk3      = this.readInt();
                            structure.unk4      = this.readString();
                            structure.unk5      = this.readInt();

                            break;

                        case '/Script/FicsItNetworks.FINTrackGraph':
                            structure.trace     = this.readFINNetworkTrace();
                            structure.trackId   = this.readInt();

                            break;

                         // Skip!
                        case '/Script/FactoryGame.PrefabSignData':
                        case '/Script/FicsItNetworks.FINInternetCardHttpRequestFuture':
                        case '/Script/FicsItNetworksComputer.FINInternetCardHttpRequestFuture':
                        case '/Script/FactoryGame.InventoryItem':
                        case '/Script/FicsItNetworks.FINRailroadSignalBlock':

                            break;

                        case '/Script/FicsItNetworks.FINGPUT1Buffer':
                            structure.x         = this.readInt();
                            structure.y         = this.readInt();
                            structure.size      = this.readInt();
                            structure.name      = this.readString();
                            structure.type      = this.readString();
                            structure.length    = this.readInt();
                            structure.buffer    = [];
                                for(let size = 0; size < structure.size; size++)
                                {
                                    structure.buffer.push(this.readFINGPUT1BufferPixel());
                                }
                            structure.unk3      = this.readHex(45); //TODO: Not sure at all!

                            break;
                        default:
                            this.worker.postMessage({command: 'alertParsing'});
                            if(typeof Sentry !== 'undefined')
                            {
                                Sentry.setContext('currentData', data);
                            }

                            throw new Error('Unimplemented `' + structure.unk2 + '` in readFINLuaProcessorStateStorage');
                    }

                    data.structs.push(structure);
            }

        return data;
    }

    readFINDynamicStructHolder()
    {
        let data                 = {};
            data.unk0            = this.readInt();
            data.type            = this.readString();

            switch(data.type)
            {
                // See: https://github.com/Panakotta00/FicsIt-Networks/blob/e2fda3bb7c3701504e419db43dd221b64e36312e/Source/FicsItNetworks/Public/Computer/FINComputerGPUT2.h#L265
                case '/Script/FicsItNetworks.FINGPUT2DC_Box':
                case '/Script/FicsItNetworksComputer.FINGPUT2DC_Box':
                    break;

                case '/Script/FicsItNetworksComputer.FINGPUT2DC_Text':
                    break;

                // See: https://github.com/Panakotta00/FicsIt-Networks/blob/e2fda3bb7c3701504e419db43dd221b64e36312e/Source/FicsItNetworks/Public/Computer/FINComputerGPUT2.h#L165
                case '/Script/FicsItNetworks.FINGPUT2DC_Lines':
                case '/Script/FicsItNetworksComputer.FINGPUT2DC_Lines':
                    data.unk1   = this.readString();
                    data.unk2   = this.readString(); // Array
                    data.unk3   = this.readInt();
                    data.unk4   = this.readInt();
                    data.unk5   = this.readString(); // Struct
                    data.unk6   = this.readByte();
                    data.unk7   = this.readInt();
                    data.unk8   = this.readProperty();
                    data.unk9   = [];
                    for(let i = 0; i < (data.unk7 - 1); i++)
                    {
                        data.unk9.push({x: this.readDouble(), y: this.readDouble()});
                    }

                    break;

                default:
                    this.worker.postMessage({command: 'alertParsing'});
                    if(typeof Sentry !== 'undefined')
                    {
                        Sentry.setContext('currentData', data);
                    }

                    throw new Error('Unimplemented `' + data.type + '` in FINDynamicStructHolder');
            }

            data.properties      = [];
            while(true)
            {
                let subStructProperty = this.readProperty();
                    if(subStructProperty === null)
                    {
                        break;
                    }

                data.properties.push(subStructProperty);
            }

        return data;
    }

    /*
     * UTILITIES
     */
    generateFastPathName(pathNamePattern, pathNamePool = {})
    {
        let pathName    = JSON.parse(JSON.stringify(pathNamePattern.split('_')));
            pathName.pop();
            pathName.push(Math.floor(Math.random() * Math.floor(2147483647)));

        let newPathName = pathName.join('_');
            if(pathNamePool[newPathName] !== undefined)
            {
                console.log('Collision detected', newPathName);
                return this.generateFastPathName(pathNamePattern, pathNamePool);
            }

        return newPathName;
    }
};

self.onmessage = function(e){
    return new SaveParser_Read(self, e.data);
};