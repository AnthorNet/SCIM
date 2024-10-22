/* global Intl, self, Promise, Sentry */
import pako                                     from '../Lib/pako.esm.js';

import Building                                 from '../Building.js';

export default class SaveParser_Write
{
    constructor(worker, options)
    {
        this.worker                 = worker;
        this.worker.messageIds      = 0;
        this.worker.callbacks       = [];
        this.worker.saveParserWrite = this;

        this.header                 = options.header;
        this.maxChunkSize           = options.maxChunkSize;
        this.PACKAGE_FILE_TAG       = options.PACKAGE_FILE_TAG;

        this.partitions             = options.partitions;
        this.levels                 = options.levels;
        this.availableSubLevels     = options.availableSubLevels;
        this.countObjects           = options.countObjects;

        this.stepsLength            = 5000;
        this.language               = options.language;

        // Used for writing...
        this.currentBufferLength    = 0;
        this.currentEntityLength    = 0;

        // Hold binary replacer values...
        this.saveBinaryReplacer     = [];
        this.saveBinaryValues       = {};

        return this.streamSave();
    }

    handleWorkerMessage(data)
    {
        let callback = this.worker.callbacks[data.messageId];
            if(!callback){ return; }

        delete this.worker.callbacks[data.messageId];
        delete data.messageId;
        return callback(data.data);
    }

    postWorkerMessage(data)
    {
        data.messageId = this.worker.messageIds++;

        return new Promise((resolve) => {
            this.worker.callbacks[data.messageId] = function(data){
                return resolve(data);
            };

            this.worker.postMessage(data);
        });
    }

    streamSave()
    {
        this.generatedChunks    = [];
        this.saveBlobArray      = [];
        this.saveBinary         = '';

        this.writeHeader();
        this.saveBlobArray.push(this.flushToUint8Array());

        // This is a reservation for the inflated length ;)
        if(this.header.saveVersion >= 41)
        {
            this.saveBinary        += this.writeInt(0, false);
        }
        this.saveBinary        += this.writeInt(0, false);

        // Write grids back...
        if(this.header.saveVersion >= 41)
        {
            this.worker.postMessage({command: 'loaderMessage', message: 'Saving world partitions...'});

            this.saveBinary        += this.writeInt(this.partitions.unk2, false);
            this.saveBinary        += this.writeString(this.partitions.unk3, false);

            this.saveBinary        += this.writeInt64(this.partitions.unk4, false);
            this.saveBinary        += this.writeInt(this.partitions.unk5, false);
            this.saveBinary        += this.writeString(this.partitions.unk6, false);

            this.saveBinary        += this.writeInt(this.partitions.unk7, false);

            for(let partitionName in this.partitions.data)
            {
                this.saveBinary        += this.writeString(partitionName, false);
                this.saveBinary        += this.writeInt(this.partitions.data[partitionName].unk1, false);
                this.saveBinary        += this.writeInt(this.partitions.data[partitionName].unk2, false);

                let levelKeys           = Object.keys(this.partitions.data[partitionName].levels);
                    this.saveBinary    += this.writeInt(levelKeys.length, false);
                    for(let levelName in this.partitions.data[partitionName].levels)
                    {
                        this.saveBinary        += this.writeString(levelName, false);
                        this.saveBinary        += this.writeUint(this.partitions.data[partitionName].levels[levelName], false);
                    }
            }

            this.pushSaveToChunk();
        }

        this.saveBinary += this.writeInt((this.levels.length - 1), false);

        return this.generateLevelChunks();
    }


    generateLevelChunks(currentLevel = 0)
    {
        if(currentLevel === (this.levels.length - 1))
        {
            delete this.subLevelObjectKeys;
            delete this.subLevelCollectables;

            return this.generateMainLevelChunks();
        }

        if(currentLevel % 25 === 0)
        {
            let progress = currentLevel / this.levels.length * 100;
                this.worker.postMessage({command: 'loaderMessage', message: 'Compiling %1$s sub-levels (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format((this.levels.length - 1)), Math.round(progress)]});
                this.worker.postMessage({command: 'loaderProgress', percentage: (progress * 0.08)});
        }

        let currentLevelName = this.levels[currentLevel].replace('Level ', '');
            //console.log('levelName', this.levels[currentLevel])
            this.saveBinary += this.writeString(this.levels[currentLevel], false);

            if(this.header.saveVersion < 41)
            {
                currentLevelName = currentLevelName.split(':');
                currentLevelName.pop();
                currentLevelName = currentLevelName[0].split('.').pop();
            }

        if(currentLevel % 100 === 0)
        {
            let currentSubLevels = this.availableSubLevels.slice(currentLevel, Math.min((currentLevel + 100), this.availableSubLevels.length));

                this.postWorkerMessage({command: 'requestObjectKeys', levelNames: currentSubLevels}).then((objectKeys) => {
                    this.postWorkerMessage({command: 'requestCollectables', levelNames: currentSubLevels}).then((collectables) => {
                        this.subLevelObjectKeys     = objectKeys;
                        this.subLevelCollectables   = collectables;

                        return this.generateObjectsChunks(currentLevel, this.subLevelObjectKeys[currentLevelName], this.subLevelCollectables[currentLevelName]);
                    });
                });
        }
        else
        {
            return this.generateObjectsChunks(currentLevel, this.subLevelObjectKeys[currentLevelName], this.subLevelCollectables[currentLevelName]);
        }
    }

    generateMainLevelChunks()
    {
        let currentLevelName = this.levels[this.levels.length - 1].replace('Level ', '');
            this.postWorkerMessage({command: 'requestObjectKeys', levelName: currentLevelName}).then((objectKeys) => {
                this.postWorkerMessage({command: 'requestCollectables', levelName: currentLevelName}).then((collectables) => {
                    return this.generateObjectsChunks((this.levels.length - 1), objectKeys[currentLevelName], collectables[currentLevelName]);
                });
            });
    }

    generateObjectsChunks(currentLevel, objectKeys, collectables, step = null, tempSaveBinaryLength = 0)
    {
        if(step === null)
        {
            // objectsSaveBinaryLength replacer positions
            for(let i = 0; i < ((this.header.saveVersion >= 41) ? 8 : 4); i++)
            {
                this.saveBinaryReplacer.push({
                    key         : currentLevel + '-' + i + '-objectsSaveBinaryLength',
                    location    : (this.saveBinary.length + i),
                });
            }

            // objectsSaveBinaryLength placeholder
            this.saveBinary                    += this.writeInt(0, false);
                if(this.header.saveVersion >= 41)
                {
                    this.saveBinary            += this.writeInt(0, false);
                }

            // Start by grabbing the FGLightweightBuildableSubsystem
            if(this.header.saveVersion >= 44 && currentLevel === (this.levels.length - 1))
            {
                this.saveBinary            += this.writeInt(objectKeys.length + 1, false);
                tempSaveBinaryLength       += 4; // countObjects

                return this.postWorkerMessage({command: 'requestObjects', objectKeys: ['Persistent_Level:PersistentLevel.LightweightBuildableSubsystem']}).then((objects) => {
                    this.saveBinary        += this.writeActor(objects[0]);
                    tempSaveBinaryLength   += this.currentEntityLength;

                    return this.generateObjectsChunks(currentLevel, objectKeys, collectables, 0, tempSaveBinaryLength);
                });
            }
            else
            {
                this.saveBinary            += this.writeInt(objectKeys.length, false);
                tempSaveBinaryLength       += 4; // countObjects

                return this.generateObjectsChunks(currentLevel, objectKeys, collectables, 0, tempSaveBinaryLength);
            }
        }

        let objectKeySpliced = objectKeys.slice(step, (step + this.stepsLength));
            if(objectKeySpliced.length > 0)
            {
                return this.postWorkerMessage({command: 'requestObjects', objectKeys: objectKeySpliced}).then((objects) => {
                    let countObjects = objects.length;
                        for(let i = 0; i < countObjects; i++)
                        {
                            if(objects[i].outerPathName !== undefined)
                            {
                                this.saveBinary        += this.writeObject(objects[i]);
                                tempSaveBinaryLength   += this.currentEntityLength;
                            }
                            else
                            {
                                this.saveBinary        += this.writeActor(objects[i]);
                                tempSaveBinaryLength   += this.currentEntityLength;
                            }

                            // Only show progress for the main level
                            if(i % 1000 === 0 && currentLevel === (this.levels.length - 1))
                            {
                                let progress = step / objectKeys.length * 100;
                                    this.worker.postMessage({command: 'loaderMessage', message: 'Compiling %1$s objects (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(objectKeys.length), Math.round(progress)]});
                                    this.worker.postMessage({command: 'loaderProgress', percentage: 8 + (progress * 0.30)});

                                this.pushSaveToChunk();
                            }
                        }

                    return this.generateObjectsChunks(currentLevel, objectKeys, collectables, (step + this.stepsLength), tempSaveBinaryLength);
                });
            }


        this.currentEntityLength    = 0;

        if(this.header.saveVersion >= 41)
        {
            if(collectables.length > 0)
            {
                this.saveBinary        += this.generateCollectablesChunks(collectables);
            }
            else
            {
                this.saveBinary        += this.writeInt(0);
            }
        }
        else
        {
            this.saveBinary            += this.generateCollectablesChunks(collectables);
        }


        tempSaveBinaryLength       += this.currentEntityLength;

        // Add the binary length to the replacer...
        if(this.header.saveVersion >= 41)
        {
            let lo                                      = Number(BigInt(tempSaveBinaryLength) & BigInt(0xffffffff));
                this.saveBinaryValues[currentLevel + '-0-objectsSaveBinaryLength'] = lo;
                lo                                      = lo >> 8;
                this.saveBinaryValues[currentLevel + '-1-objectsSaveBinaryLength'] = lo;
                lo                                      = lo >> 8;
                this.saveBinaryValues[currentLevel + '-2-objectsSaveBinaryLength'] = lo;
                lo                                      = lo >> 8;
                this.saveBinaryValues[currentLevel + '-3-objectsSaveBinaryLength'] = lo;
            let hi                                      = Number(BigInt(tempSaveBinaryLength) >> BigInt(32) & BigInt(0xffffffff));
                this.saveBinaryValues[currentLevel + '-7-objectsSaveBinaryLength'] = hi;
                hi                                      = hi >> 8;
                this.saveBinaryValues[currentLevel + '-6-objectsSaveBinaryLength'] = hi;
                hi                                      = hi >> 8;
                this.saveBinaryValues[currentLevel + '-5-objectsSaveBinaryLength'] = hi;
                hi                                      = hi >> 8;
                this.saveBinaryValues[currentLevel + '-4-objectsSaveBinaryLength'] = hi;
        }
        else
        {
            this.saveBinaryValues[currentLevel + '-3-objectsSaveBinaryLength'] = (tempSaveBinaryLength >>> 24);
            this.saveBinaryValues[currentLevel + '-2-objectsSaveBinaryLength'] = (tempSaveBinaryLength >>> 16);
            this.saveBinaryValues[currentLevel + '-1-objectsSaveBinaryLength'] = (tempSaveBinaryLength >>> 8);
            this.saveBinaryValues[currentLevel + '-0-objectsSaveBinaryLength'] = (tempSaveBinaryLength & 0xff);
        }

        this.pushSaveToChunk();

        if(currentLevel === (this.levels.length - 1))
        {
            console.log('Saved ' + objectKeys.length + ' objects...');
        }

        return this.generateEntitiesChunks({
            currentLevel            : currentLevel,
            objectKeys              : objectKeys,
            collectables            : collectables,
            step                    : null,
            tempSaveBinaryLength    : 0
        });
    }

    generateEntitiesChunks(entitiesOptions)
    {
        if(entitiesOptions.step === null)
        {
            entitiesOptions.step = 0;

            // entitiesSaveBinaryLength replacer positions
            for(let i = 0; i < ((this.header.saveVersion >= 41) ? 8 : 4); i++)
            {
                this.saveBinaryReplacer.push({
                    key         : entitiesOptions.currentLevel + '-' + i + '-entitiesSaveBinaryLength',
                    location    : (this.saveBinary.length + i),
                });
            }

            // entitiesSaveBinaryLength placeholder
            this.saveBinary                        += this.writeInt(0, false);
            if(this.header.saveVersion >= 41)
            {
                this.saveBinary                    += this.writeInt(0, false);
            }

            // Start by grabbing the FGLightweightBuildableSubsystem
            if(this.header.saveVersion >= 44 && entitiesOptions.currentLevel === (this.levels.length - 1))
            {
                this.saveBinary                        += this.writeInt(entitiesOptions.objectKeys.length + 1, false);
                entitiesOptions.tempSaveBinaryLength   += 4; // countEntities
                entitiesOptions.tempSaveBinaryLength   += (entitiesOptions.objectKeys.length + 1) * 8;

                return this.postWorkerMessage({command: 'requestObjects', objectKeys: ['Persistent_Level:PersistentLevel.LightweightBuildableSubsystem']}).then((objects) => {
                    let entityReturn = this.writeEntity(objects[0]);
                        return this.writeLightweightBuildableSubsystem(entityReturn.preEntity, entityReturn.entity, entitiesOptions);
                });
            }
            else
            {
                this.saveBinary                        += this.writeInt(entitiesOptions.objectKeys.length, false);
                entitiesOptions.tempSaveBinaryLength   += 4; // countEntities

                if(this.header.saveVersion >= 41)
                {
                    entitiesOptions.tempSaveBinaryLength += entitiesOptions.objectKeys.length * 8;
                }

                return this.generateEntitiesChunks(entitiesOptions);
            }
        }

        let objectKeySpliced = entitiesOptions.objectKeys.slice(entitiesOptions.step, (entitiesOptions.step + this.stepsLength));
            if(objectKeySpliced.length > 0)
            {
                return this.postWorkerMessage({command: 'requestObjects', objectKeys: objectKeySpliced}).then((objects) => {
                    let countObjects = objects.length;
                        for(let i = 0; i < countObjects; i++)
                        {
                            this.saveBinary                      += this.writeEntity(objects[i]);
                            entitiesOptions.tempSaveBinaryLength += this.currentEntityLength;

                            // Force big entities to deflate to avoid memory error (Mainly foliage removal...)
                            if(this.currentEntityLength >= this.maxChunkSize)
                            {
                                this.pushSaveToChunk();
                            }

                            // Only show progress for the main level
                            if(i % 1000 === 0 && entitiesOptions.currentLevel === (this.levels.length - 1))
                            {
                                let progress = entitiesOptions.step / entitiesOptions.objectKeys.length * 100;
                                    this.worker.postMessage({command: 'loaderMessage', message: 'Compiling %1$s entities (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(entitiesOptions.objectKeys.length), Math.round(progress)]});
                                    this.worker.postMessage({command: 'loaderProgress', percentage: (58 + (progress * 0.38))});

                                this.pushSaveToChunk();
                            }
                        }

                    entitiesOptions.step = entitiesOptions.step + this.stepsLength;

                    return this.generateEntitiesChunks(entitiesOptions);
                });
            }

        // Save current level entities
        this.saveBinary        += this.generateCollectablesChunks(entitiesOptions.collectables);

        // Add the binary length to the replacer...
        if(this.header.saveVersion >= 41)
        {
            let lo                                      = Number(BigInt(entitiesOptions.tempSaveBinaryLength) & BigInt(0xffffffff));
                this.saveBinaryValues[entitiesOptions.currentLevel + '-0-entitiesSaveBinaryLength'] = lo;
                lo                                      = lo >> 8;
                this.saveBinaryValues[entitiesOptions.currentLevel + '-1-entitiesSaveBinaryLength'] = lo;
                lo                                      = lo >> 8;
                this.saveBinaryValues[entitiesOptions.currentLevel + '-2-entitiesSaveBinaryLength'] = lo;
                lo                                      = lo >> 8;
                this.saveBinaryValues[entitiesOptions.currentLevel + '-3-entitiesSaveBinaryLength'] = lo;
            let hi                                      = Number(BigInt(entitiesOptions.tempSaveBinaryLength) >> BigInt(32) & BigInt(0xffffffff));
                this.saveBinaryValues[entitiesOptions.currentLevel + '-7-entitiesSaveBinaryLength'] = hi;
                hi                                      = hi >> 8;
                this.saveBinaryValues[entitiesOptions.currentLevel + '-6-entitiesSaveBinaryLength'] = hi;
                hi                                      = hi >> 8;
                this.saveBinaryValues[entitiesOptions.currentLevel + '-5-entitiesSaveBinaryLength'] = hi;
                hi                                      = hi >> 8;
                this.saveBinaryValues[entitiesOptions.currentLevel + '-4-entitiesSaveBinaryLength'] = hi;
        }
        else
        {
            this.saveBinaryValues[entitiesOptions.currentLevel + '-3-entitiesSaveBinaryLength'] = (entitiesOptions.tempSaveBinaryLength >>> 24);
            this.saveBinaryValues[entitiesOptions.currentLevel + '-2-entitiesSaveBinaryLength'] = (entitiesOptions.tempSaveBinaryLength >>> 16);
            this.saveBinaryValues[entitiesOptions.currentLevel + '-1-entitiesSaveBinaryLength'] = (entitiesOptions.tempSaveBinaryLength >>> 8);
            this.saveBinaryValues[entitiesOptions.currentLevel + '-0-entitiesSaveBinaryLength'] = (entitiesOptions.tempSaveBinaryLength & 0xff);
        }

        this.pushSaveToChunk();

        if(entitiesOptions.currentLevel < (this.levels.length - 1))
        {
            return this.generateLevelChunks(entitiesOptions.currentLevel + 1);
        }

        if(entitiesOptions.currentLevel === (this.levels.length - 1))
        {
            console.log('Saved ' + entitiesOptions.objectKeys.length + ' entities...');
        }

        this.pushSaveToChunk();
        return this.finalizeChunks();
    }

    generateCollectablesChunks(collectables, count = false)
    {
        let tempSaveBinary  = '';
            tempSaveBinary += this.writeInt(collectables.length, count);
            for(let i = 0; i < collectables.length; i++)
            {
                tempSaveBinary += this.writeObjectProperty(collectables[i], count);
            }

        return tempSaveBinary;
    }

    /*
     * CHUNKS HANDLING
     */
    pushSaveToChunk()
    {
        while(this.saveBinary.length >= this.maxChunkSize)
        {
            // Extract extra to be processed later...
            let tempSaveBinary  = this.saveBinary.slice(this.maxChunkSize);
                this.saveBinary = this.saveBinary.slice(0, this.maxChunkSize);
                this.createChunk();
                this.saveBinary = tempSaveBinary;
        }
    }

    finalizeChunks()
    {
        if(this.saveBinary.length > 0)
        {
            this.createChunk();
        }

        console.log('Generated ' + this.generatedChunks.length + ' chunks...');
        this.streamChunks();
    }

    createChunk()
    {
        // Check if we need to replace values afterward...
        let havePlaceholders = [];
            if(this.saveBinaryReplacer.length > 0)
            {
                for(let i = (this.saveBinaryReplacer.length - 1); i >= 0; i--)
                {
                    if(this.saveBinaryReplacer[i].location < this.saveBinary.length)
                    {
                        havePlaceholders.push(this.saveBinaryReplacer[i]);
                        this.saveBinaryReplacer.splice(i, 1);
                    }
                    else
                    {
                        this.saveBinaryReplacer[i].location -= this.saveBinary.length;
                    }
                }
            }

        let input                       = this.flushToUint8Array();
        let chunk                       = {};
            chunk.uncompressedLength    = input.byteLength;

            if(havePlaceholders.length > 0)
            {
                chunk.toReplace = havePlaceholders;
            }

            // First chunk is not deflated yet as we need to add the total deflated length
            if(this.generatedChunks.length === 0 || chunk.toReplace !== undefined)
            {
                chunk.output = input;

                if(this.generatedChunks.length === 0)
                {
                    chunk.isFirstChunk = true;
                }
            }
            else
            {
                let output = pako.deflate(input);
                    chunk.output            = output;
                    chunk.compressedLength  = output.byteLength;
            }

        this.generatedChunks.push(chunk);
    }

    flushToUint8Array()
    {
        let slice       = this.saveBinary.length;
        let buffer      = new Uint8Array(slice);
            for(let j = 0; j < slice; j++)
            {
                buffer[j] = this.saveBinary.charCodeAt(j) & 0xFF;
            }

        this.saveBinary = '';

        return buffer;
    }

    streamChunks()
    {
        this.worker.postMessage({command: 'loaderMessage', message: 'Generating save file...'});

        while(this.generatedChunks.length > 0)
        {
            let currentChunk = this.generatedChunks.shift();
                if(currentChunk.compressedLength === undefined)
                {
                    if(currentChunk.isFirstChunk !== undefined)
                    {
                        // Update first chunk inflated size
                        let totalInflated = currentChunk.uncompressedLength - 4;
                            for(let i = 0; i < this.generatedChunks.length; i++)
                            {
                                totalInflated += this.generatedChunks[i].uncompressedLength;
                            }

                        if(this.header.saveVersion >= 41)
                        {
                            totalInflated -= 4;

                            let lo                      = Number(BigInt(totalInflated) & BigInt(0xffffffff));
                                currentChunk.output[0]  = lo;
                                lo                      = lo >> 8;
                                currentChunk.output[1]  = lo;
                                lo                      = lo >> 8;
                                currentChunk.output[2]  = lo;
                                lo                      = lo >> 8;
                                currentChunk.output[3]  = lo;
                            let hi                      = Number(BigInt(totalInflated) >> BigInt(32) & BigInt(0xffffffff));
                                currentChunk.output[7]  = hi;
                                hi                      = hi >> 8;
                                currentChunk.output[6]  = hi;
                                hi                      = hi >> 8;
                                currentChunk.output[5]  = hi;
                                hi                      = hi >> 8;
                                currentChunk.output[4]  = hi;
                        }
                        else
                        {
                            currentChunk.output[3]          = (totalInflated >>> 24);
                            currentChunk.output[2]          = (totalInflated >>> 16);
                            currentChunk.output[1]          = (totalInflated >>> 8);
                            currentChunk.output[0]          = (totalInflated & 0xff);
                        }
                    }

                    if(currentChunk.toReplace !== undefined)
                    {
                        for(let i = 0; i < currentChunk.toReplace.length; i++)
                        {
                            currentChunk.output[currentChunk.toReplace[i].location] = this.saveBinaryValues[currentChunk.toReplace[i].key];
                        }
                    }

                    currentChunk.output             = pako.deflate(currentChunk.output);
                    currentChunk.compressedLength   = currentChunk.output.byteLength;
                }

            // Write chunk header
            this.saveBinary = '';
            if(this.header.saveVersion >= 41)
            {
                this.saveBinary += this.writeUint64(this.PACKAGE_FILE_TAG);
            }
            else
            {
                this.saveBinary += this.writeInt(this.PACKAGE_FILE_TAG);
                this.saveBinary += this.writeInt(0);
            }

            this.saveBinary += this.writeInt(this.maxChunkSize);
            this.saveBinary += this.writeInt(0);

            if(this.header.saveVersion >= 41)
            {
                this.saveBinary += this.writeByte(3);
            }

            this.saveBinary += this.writeInt(currentChunk.compressedLength);
            this.saveBinary += this.writeInt(0);
            this.saveBinary += this.writeInt(currentChunk.uncompressedLength);
            this.saveBinary += this.writeInt(0);
            this.saveBinary += this.writeInt(currentChunk.compressedLength);
            this.saveBinary += this.writeInt(0);
            this.saveBinary += this.writeInt(currentChunk.uncompressedLength);
            this.saveBinary += this.writeInt(0);

            this.saveBlobArray.push(this.flushToUint8Array());
            this.saveBlobArray.push(currentChunk.output);
        }

        this.worker.postMessage({command: 'endSaveWriting', blobArray: this.saveBlobArray});
    }



    writeHeader()
    {
        let header  = '';
            header += this.writeInt(this.header.saveHeaderType, false);
            header += this.writeInt(this.header.saveVersion, false);
            header += this.writeInt(this.header.buildVersion, false);
            header += this.writeString(this.header.mapName, false);
            header += this.writeString(this.header.mapOptions, false);
            header += this.writeString(this.header.sessionName, false);
            header += this.writeInt(this.header.playDurationSeconds, false);
            header += this.writeInt64(this.header.saveDateTime, false);
            header += this.writeByte(this.header.sessionVisibility, false);

            if(this.header.saveHeaderType >= 7)
            {
                header += this.writeInt(this.header.fEditorObjectVersion, false);
            }
            if(this.header.saveHeaderType >= 8)
            {
                header += this.writeString(this.header.modMetadata, false);
                header += this.writeInt(this.header.isModdedSave, false);
            }
            if(this.header.saveHeaderType >= 10)
            {
                header += this.writeString(this.header.saveIdentifier, false);
            }
            if(this.header.saveHeaderType >= 13)
            {
                header += this.writeInt(this.header.isPartitionedWorld, false);
                header += this.writeHex(this.header.saveDataHash, false);
                header += this.writeInt(this.header.isCreativeModeEnabled, false);
            }

        this.saveBinary += header;
    }

    writeObject(currentObject)
    {
        this.currentEntityLength    = 0;
        let object                  = this.writeInt(0, false);
            object                 += this.writeString(currentObject.className, false);
            object                 += this.writeObjectProperty(currentObject, false);
            object                 += this.writeString(currentObject.outerPathName, false);

        return object;
    }

    writeActor(currentActor)
    {
        this.currentEntityLength    = 0;
        let actor                   = this.writeInt(1, false);
            actor                  += this.writeString(currentActor.className, false);
            actor                  += this.writeObjectProperty(currentActor, false);

            if(currentActor.needTransform !== undefined)
            {
                actor += this.writeInt(currentActor.needTransform, false);
            }
            else
            {
                actor += this.writeInt(0, false);
            }

            actor += this.writeFloat(currentActor.transform.rotation[0], false);
            actor += this.writeFloat(currentActor.transform.rotation[1], false);
            actor += this.writeFloat(currentActor.transform.rotation[2], false);
            actor += this.writeFloat(currentActor.transform.rotation[3], false);

            // Enforce bounding on the map to avoid the game from skipping physics!
            if(currentActor.className !== '/Game/FactoryGame/Buildable/Factory/ProjectAssembly/BP_ProjectAssembly.BP_ProjectAssembly_C')
            {
                if(
                        currentActor.transform.translation[0] < -500000 || currentActor.transform.translation[0] > 500000
                     || currentActor.transform.translation[1] < -500000 || currentActor.transform.translation[1] > 500000
                     || currentActor.transform.translation[2] < -500000 || currentActor.transform.translation[2] > 500000
                )
                {
                    currentActor.transform.translation = [0, 0, 2000];
                }
            }

            actor += this.writeFloat(currentActor.transform.translation[0], false);
            actor += this.writeFloat(currentActor.transform.translation[1], false);
            actor += this.writeFloat(currentActor.transform.translation[2], false);

            if(currentActor.transform !== undefined && currentActor.transform.scale3d !== undefined)
            {
                actor += this.writeFloat(currentActor.transform.scale3d[0], false);
                actor += this.writeFloat(currentActor.transform.scale3d[1], false);
                actor += this.writeFloat(currentActor.transform.scale3d[2], false);
            }
            else
            {
                actor += this.writeFloat(1, false);
                actor += this.writeFloat(1, false);
                actor += this.writeFloat(1, false);
            }

            if(currentActor.wasPlacedInLevel !== undefined)
            {
                actor += this.writeInt(currentActor.wasPlacedInLevel, false);
            }
            else
            {
                actor += this.writeInt(0, false);
            }


        return actor;
    }

    writeEntity(currentObject)
    {
        let preEntity                   = '';
        let entity                      = '';

        this.currentEntitySaveVersion   = this.header.saveVersion;
        if(this.header.saveVersion >= 41)
        {
            if(currentObject.entitySaveVersion !== undefined)
            {
                this.currentEntitySaveVersion = currentObject.entitySaveVersion;
                preEntity += this.writeInt(currentObject.entitySaveVersion);
                preEntity += this.writeInt(1); //TODO: Check what it is?!
            }
            else
            {
                preEntity += this.writeInt(this.header.saveVersion);
                preEntity += this.writeInt(0); //TODO: Check what it is?!
            }
        }

        this.currentEntityLength    = 0;

        if(currentObject.outerPathName === undefined)
        {
            entity += this.writeObjectProperty(currentObject.entity);

            if(currentObject.children !== undefined)
            {
                let countChild  = currentObject.children.length;
                    entity += this.writeInt(countChild);
                    for(let i = 0; i < countChild; i++)
                    {
                        entity += this.writeObjectProperty(currentObject.children[i]);
                    }
            }
            else
            {
                entity += this.writeInt(0);
            }
        }

        if(currentObject.shouldBeNulled !== undefined && currentObject.shouldBeNulled === true)
        {
            return preEntity + this.writeInt(this.currentEntityLength) + entity;
        }

        entity += this.writeProperties(currentObject, currentObject.className);
        entity += this.writeString('None');

        // Extra properties!
        if(Building.isConveyor(currentObject))
        {
            let itemsLength  = currentObject.extra.items.length;
                     entity += this.writeInt(currentObject.extra.count);
                     entity += this.writeInt(itemsLength);

                for(let i = 0; i < itemsLength; i++)
                {
                    entity += this.writeInventoryItem(currentObject.extra.items[i]);
                    entity += this.writeFloat(currentObject.extra.items[i].position);
                }

            return preEntity + this.writeInt(this.currentEntityLength) + entity;
        }

        if(Building.isConveyorChainActor(currentObject))
        {
            entity += this.writeInt(currentObject.extra.count);
            entity += this.writeObjectProperty(currentObject.extra.mConveyors[0].mConveyorBase); // mFirstConveyor
            entity += this.writeObjectProperty(currentObject.extra.mConveyors[currentObject.extra.mConveyors.length - 1].mConveyorBase); // mLastConveyor

            entity += this.writeInt(currentObject.extra.mConveyors.length);
            for(let i = 0; i < currentObject.extra.mConveyors.length; i++)
            {
                entity += this.writeObjectProperty({pathName: currentObject.pathName}); // mChainActor
                entity += this.writeObjectProperty(currentObject.extra.mConveyors[i].mConveyorBase);
                entity += this.writeInt(currentObject.extra.mConveyors[i].splineData.length);

                for(let j = 0; j < currentObject.extra.mConveyors[i].splineData.length; j++)
                {
                    entity += this.writeDouble(currentObject.extra.mConveyors[i].splineData[j].location.x);
                    entity += this.writeDouble(currentObject.extra.mConveyors[i].splineData[j].location.y);
                    entity += this.writeDouble(currentObject.extra.mConveyors[i].splineData[j].location.z);

                    entity += this.writeDouble(currentObject.extra.mConveyors[i].splineData[j].arriveTangent.x);
                    entity += this.writeDouble(currentObject.extra.mConveyors[i].splineData[j].arriveTangent.y);
                    entity += this.writeDouble(currentObject.extra.mConveyors[i].splineData[j].arriveTangent.z);

                    entity += this.writeDouble(currentObject.extra.mConveyors[i].splineData[j].leaveTangent.x);
                    entity += this.writeDouble(currentObject.extra.mConveyors[i].splineData[j].leaveTangent.y);
                    entity += this.writeDouble(currentObject.extra.mConveyors[i].splineData[j].leaveTangent.z);
                }

                entity += this.writeFloat(currentObject.extra.mConveyors[i].OffsetAtStart);
                entity += this.writeFloat(currentObject.extra.mConveyors[i].StartsAtLength);
                entity += this.writeFloat(currentObject.extra.mConveyors[i].EndsAtLength);

                entity += this.writeInt(currentObject.extra.mConveyors[i].FirstItemIndex);
                entity += this.writeInt(currentObject.extra.mConveyors[i].LastItemIndex);
                entity += this.writeInt(currentObject.extra.mConveyors[i].IndexInChainArray);
            }

            entity += this.writeFloat(currentObject.extra.mTotalLength);
            entity += this.writeInt(currentObject.extra.mNumItems);
            entity += this.writeInt(currentObject.extra.mLeadItemIndex);
            entity += this.writeInt(currentObject.extra.mTailItemIndex);
            entity += this.writeInt(currentObject.extra.mActualItems.length);

            for(let i = 0; i < currentObject.extra.mActualItems.length; i++)
            {
                entity += this.writeInventoryItem(currentObject.extra.mActualItems[i]);
                entity += this.writeFloat(currentObject.extra.mActualItems[i].position);
            }

            return preEntity + this.writeInt(this.currentEntityLength) + entity;
        }

        if(Building.isPowerline(currentObject))
        {
            entity += this.writeInt(currentObject.extra.count);
            entity += this.writeObjectProperty(currentObject.extra.source);
            entity += this.writeObjectProperty(currentObject.extra.target);

            // 2022-10-18: Added Cached locations for wire locations for use in visualization in blueprint hologram (can't depend on connection components)
            if(this.header.saveVersion >= 33 && this.header.saveVersion < 41)
            {
                if(currentObject.extra.sourceTranslation !== undefined)
                {
                    entity += this.writeFloat(currentObject.extra.sourceTranslation[0]);
                    entity += this.writeFloat(currentObject.extra.sourceTranslation[1]);
                    entity += this.writeFloat(currentObject.extra.sourceTranslation[2]);
                }
                else // Avoid old megaprints from failing...
                {
                    entity += this.writeFloat(0);
                    entity += this.writeFloat(0);
                    entity += this.writeFloat(0);
                }

                if(currentObject.extra.targetTranslation !== undefined)
                {
                    entity += this.writeFloat(currentObject.extra.targetTranslation[0]);
                    entity += this.writeFloat(currentObject.extra.targetTranslation[1]);
                    entity += this.writeFloat(currentObject.extra.targetTranslation[2]);
                }
                else // Avoid old megaprints from failing...
                {
                    entity += this.writeFloat(0);
                    entity += this.writeFloat(0);
                    entity += this.writeFloat(0);
                }
            }

            return preEntity + this.writeInt(this.currentEntityLength) + entity;
        }

        if(Building.isVehicle(currentObject))
        {
            entity += this.writeInt(currentObject.extra.count);
            entity += this.writeInt(currentObject.extra.objects.length);

            for(let i = 0; i < currentObject.extra.objects.length; i++)
            {
                entity += this.writeString(currentObject.extra.objects[i].name);
                entity += this.writeHex(currentObject.extra.objects[i].unk);
            }

            return preEntity + this.writeInt(this.currentEntityLength) + entity;
        }

        if(Building.isLocomotive(currentObject) || Building.isFreightWagon(currentObject))
        {
            entity += this.writeInt(currentObject.extra.count);

            if(currentObject.extra.objects !== undefined)
            {
                entity += this.writeInt(currentObject.extra.objects.length);

                for(let i = 0; i < currentObject.extra.objects.length; i++)
                {
                    entity += this.writeString(currentObject.extra.objects[i].name);
                    entity += this.writeHex(currentObject.extra.objects[i].unk);
                }
            }
            else
            {
                entity += this.writeInt(0);
            }

            entity += this.writeObjectProperty(currentObject.extra.previous);
            entity += this.writeObjectProperty(currentObject.extra.next);

            return preEntity + this.writeInt(this.currentEntityLength) + entity;
        }

        switch(currentObject.className)
        {
            case '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C':
            case '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C':
                entity += this.writeInt(currentObject.extra.count);
                entity += this.writeInt(currentObject.extra.game.length);

                for(let i = 0; i < currentObject.extra.game.length; i++)
                {
                    entity += this.writeObjectProperty(currentObject.extra.game[i]);
                }

                break;

            case '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C':
                if(this.header.saveVersion >= 41) // 2023-01-09: Tobias: Refactored drone actions to no longer be uobjects in order to fix a crash.
                {
                    entity += this.writeInt(currentObject.extra.unk1);
                    entity += this.writeInt(currentObject.extra.unk2);

                    entity += this.writeInt(currentObject.extra.mActiveAction.length);
                    for(let i = 0; i < currentObject.extra.mActiveAction.length; i++)
                    {
                        let mActiveAction = currentObject.extra.mActiveAction[i]
                            entity += this.writeString(mActiveAction.name);

                            for(let i = 0; i < mActiveAction.properties.length; i++)
                            {
                                entity += this.writeProperty(mActiveAction.properties[i]);
                            }
                            entity += this.writeString('None');
                    }

                    entity += this.writeInt(currentObject.extra.mActionQueue.length);
                    for(let i = 0; i < currentObject.extra.mActionQueue.length; i++)
                    {
                        let mActionQueue = currentObject.extra.mActionQueue[i]
                            entity += this.writeString(mActionQueue.name);

                            for(let i = 0; i < mActionQueue.properties.length; i++)
                            {
                                entity += this.writeProperty(mActionQueue.properties[i]);
                            }
                            entity += this.writeString('None');
                    }
                }
                else
                {
                    if(currentObject.missing !== undefined)
                    {
                        entity += this.writeHex(currentObject.missing);
                    }
                }

                break;

            case '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
                entity += this.writeInt(currentObject.extra.count);
                entity += this.writeInt(currentObject.extra.circuits.length);

                for(let i = 0; i < currentObject.extra.circuits.length; i++)
                {
                    entity += this.writeInt(currentObject.extra.circuits[i].circuitId);
                    entity += this.writeObjectProperty(currentObject.extra.circuits[i]);
                }

                break;

            case '/Script/FactoryGame.FGLightweightBuildableSubsystem':
                return { preEntity: preEntity, entity: entity };

            default:
                if(currentObject.missing !== undefined)
                {
                    entity += this.writeHex(currentObject.missing);
                }
                else
                {
                    if(
                            this.header.saveVersion >= 41
                         && (currentObject.className.startsWith('/Script/FactoryGame.FG') || currentObject.className.startsWith('/Script/FicsitFarming.') || currentObject.className.startsWith('/Script/RefinedRDLib.'))
                    )
                    {
                        entity += this.writeByte(0);
                        entity += this.writeByte(0);
                        entity += this.writeByte(0);
                        entity += this.writeByte(0);
                    }

                    entity += this.writeByte(0);
                    entity += this.writeByte(0);
                    entity += this.writeByte(0);
                    entity += this.writeByte(0);
                }
        }

        return preEntity + this.writeInt(this.currentEntityLength) + entity;
    }

    writeLightweightBuildableSubsystem(preEntity, entity, entitiesOptions, lightweightBuildableSubsystemObjectKeys = null, currentStep = 0, countLightweightObjects = 0)
    {
        // First grab all needed lightweight objects keys
        if(lightweightBuildableSubsystemObjectKeys === null)
        {
            entity += this.writeInt(0);

            return this.postWorkerMessage({command: 'requestLightweightObjectKeys'}).then((dataObjectKeys) => {
                entity += this.writeInt(Object.keys(dataObjectKeys).length);

                for(let className in dataObjectKeys)
                {
                    countLightweightObjects += dataObjectKeys[className].length;
                }

                this.worker.postMessage({command: 'loaderMessage', message: 'Compiling %1$s lightweight objects (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(countLightweightObjects), 0]});
                this.worker.postMessage({command: 'loaderProgress', percentage: 38});

                return this.writeLightweightBuildableSubsystem(preEntity, entity, entitiesOptions, dataObjectKeys, currentStep, countLightweightObjects);
            });
        }

        // Loop all classes to write objects
        if(lightweightBuildableSubsystemObjectKeys !== null && Object.keys(lightweightBuildableSubsystemObjectKeys).length > 0)
        {
            let currentClassName        = Object.keys(lightweightBuildableSubsystemObjectKeys)[0];
            let requestedObjectKeys     = lightweightBuildableSubsystemObjectKeys[currentClassName];
                entity                 += this.writeInt(0);
                entity                 += this.writeString(currentClassName);
                //entity                 += this.writeInt(requestedObjectKeys.length);
                delete lightweightBuildableSubsystemObjectKeys[currentClassName];

            return this.postWorkerMessage({command: 'requestObjects', objectKeys: requestedObjectKeys}).then((data) => {
                entity             += this.writeInt(data.length);

                for(let i = 0; i < data.length; i++)
                {
                    entity                 += this.writeDouble(data[i].transform.rotation[0]);
                    entity                 += this.writeDouble(data[i].transform.rotation[1]);
                    entity                 += this.writeDouble(data[i].transform.rotation[2]);
                    entity                 += this.writeDouble(data[i].transform.rotation[3]);

                    entity                 += this.writeDouble(data[i].transform.translation[0]);
                    entity                 += this.writeDouble(data[i].transform.translation[1]);
                    entity                 += this.writeDouble(data[i].transform.translation[2]);

                    entity                 += this.writeDouble(data[i].transform.scale3d[0]);
                    entity                 += this.writeDouble(data[i].transform.scale3d[1]);
                    entity                 += this.writeDouble(data[i].transform.scale3d[2]);

                    //console.log(data[i].customizationData.SwatchDesc, this.writeObjectProperty(data[i].customizationData.SwatchDesc))
                    entity                 += this.writeObjectProperty(data[i].customizationData.SwatchDesc);
                    entity                 += this.writeObjectProperty(data[i].customizationData.MaterialDesc);
                    entity                 += this.writeObjectProperty(data[i].customizationData.PatternDesc);
                    entity                 += this.writeObjectProperty(data[i].customizationData.SkinDesc);

                    entity                 += this.writeFloat(data[i].customizationData.PrimaryColor.r);
                    entity                 += this.writeFloat(data[i].customizationData.PrimaryColor.g);
                    entity                 += this.writeFloat(data[i].customizationData.PrimaryColor.b);
                    entity                 += this.writeFloat(data[i].customizationData.PrimaryColor.a);

                    entity                 += this.writeFloat(data[i].customizationData.SecondaryColor.r);
                    entity                 += this.writeFloat(data[i].customizationData.SecondaryColor.g);
                    entity                 += this.writeFloat(data[i].customizationData.SecondaryColor.b);
                    entity                 += this.writeFloat(data[i].customizationData.SecondaryColor.a);

                    entity                 += this.writeObjectProperty(data[i].customizationData.PaintFinish);
                    entity                 += this.writeInt8(data[i].customizationData.PatternRotation.value);

                    entity                 += this.writeObjectProperty(data[i].properties[0].value);
                    entity                 += this.writeObjectProperty(data[i].properties[1].value);
                }

                let progress        = currentStep / countLightweightObjects * 100;
                    currentStep    += data.length;
                    this.worker.postMessage({command: 'loaderMessage', message: 'Compiling %1$s lightweight objects (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(countLightweightObjects), Math.round(progress)]});
                    this.worker.postMessage({command: 'loaderProgress', percentage: (38 + (progress * 0.20))});

                return this.writeLightweightBuildableSubsystem(preEntity, entity, entitiesOptions, lightweightBuildableSubsystemObjectKeys, currentStep, countLightweightObjects);
            });
        }

        console.log('Saved ' + countLightweightObjects + ' lightweight objects...');

        // End of lightweightBuildableSubsystem reconstruction, get back to entities...
        //TODO: May be add a placeholder for lenght in case of a lot of lightweight objects?
        this.saveBinary                      += preEntity + this.writeInt(this.currentEntityLength) + entity;
        entitiesOptions.tempSaveBinaryLength += this.currentEntityLength;
        this.pushSaveToChunk();

        return this.generateEntitiesChunks(entitiesOptions);
    }

    writeProperties(currentObject, parentType = null)
    {
        let propertiesLength    = currentObject.properties.length;
        let properties          = '';

        for(let i = 0; i < propertiesLength; i++)
        {
            properties += this.writeProperty(currentObject.properties[i], parentType);
        }

        return properties;
    }

    writeProperty(currentProperty, parentType = null)
    {
        let propertyStart   = '';
            propertyStart  += this.writeString(currentProperty.name);
            propertyStart  += this.writeString(currentProperty.type + 'Property');
        let property        = '';


        // Reset to get property length...
        let startCurrentPropertyBufferLength    = this.currentBufferLength;
            this.currentBufferLength            = 0;
            property                            = this.writeInt( ((currentProperty.index !== undefined) ? currentProperty.index : 0), false);

        switch(currentProperty.type)
        {
            case 'Bool':
                property += this.writeByte(currentProperty.value, false);
                property += this.writePropertyGUID(currentProperty);

                break;

            case 'Int8':
                property += this.writePropertyGUID(currentProperty);
                property += this.writeInt8(currentProperty.value);

                break;

            case 'Int':
                property += this.writePropertyGUID(currentProperty);
                property += this.writeInt(currentProperty.value);

                break;

            case 'UInt32':
                property += this.writePropertyGUID(currentProperty);
                property += this.writeUint(currentProperty.value);

                break;

            case 'Int64': //TODO: Use 64bit integer
            case 'UInt64':
                property += this.writePropertyGUID(currentProperty);
                property += this.writeInt64(currentProperty.value);

                break;

            case 'Float':
                property += this.writePropertyGUID(currentProperty);
                property += this.writeFloat(currentProperty.value);

                break;

            case 'Double':
                property += this.writePropertyGUID(currentProperty);
                property += this.writeDouble(currentProperty.value);

                break;

            case 'Str':
            case 'Name':
                property += this.writePropertyGUID(currentProperty);
                property += this.writeString(currentProperty.value);

                break;

            case 'Object':
            case 'Interface':
                property += this.writePropertyGUID(currentProperty);
                property += this.writeObjectProperty(currentProperty.value);

                break;

            case 'Enum':
                property += this.writeString(currentProperty.value.name, false);
                property += this.writePropertyGUID(currentProperty);
                property += this.writeString(currentProperty.value.value);

                break;

            case 'Byte':
                property += this.writeString(currentProperty.value.enumName, false);
                property += this.writePropertyGUID(currentProperty);

                if(currentProperty.value.enumName === 'None')
                {
                    property += this.writeByte(currentProperty.value.value);
                }
                else
                {
                    property += this.writeString(currentProperty.value.valueName);
                }

                break;

            case 'Text':
                property += this.writePropertyGUID(currentProperty);
                property += this.writeTextProperty(currentProperty);
                break;

            case 'Array':
                property += this.writeArrayProperty(currentProperty, parentType);

                break;

            case 'Map':
                property += this.writeMapProperty(currentProperty, parentType);

                break;

            case 'Set':
                property += this.writeSetProperty(currentProperty, parentType);

                break;

            case 'SoftObject':
                property += this.writePropertyGUID(currentProperty);
                property += this.writeString(currentProperty.value.pathName);
                property += this.writeString(currentProperty.value.subPathString);
                property += this.writeInt(0);

                break;

            case 'Struct':
                property += this.writeStructProperty(currentProperty, parentType);

                break;
        }

        let propertyLength              = parseInt(this.currentBufferLength) || 0; // Prevent NaN
            this.currentBufferLength    = startCurrentPropertyBufferLength + propertyLength;

        return propertyStart + this.writeInt(propertyLength) + property;
    }

    writeArrayProperty(currentProperty, parentType)
    {
        let property                    = '';
        let currentArrayPropertyCount   = currentProperty.value.values.length;
            if(currentProperty.name === 'mFogOfWarRawData')
            {
                currentArrayPropertyCount *= 4;
            }

        property += this.writeString(currentProperty.value.type + 'Property', false);
        property += this.writeByte(0, false);
        property += this.writeInt(currentArrayPropertyCount);

        switch(currentProperty.value.type)
        {
            case 'Byte':
                switch(currentProperty.name)
                {
                    case 'mFogOfWarRawData':
                        for(let i = 0; i < (currentArrayPropertyCount / 4); i++)
                        {
                            property += this.writeByte(0);
                            property += this.writeByte(0);
                            property += this.writeByte(currentProperty.value.values[i]);
                            property += this.writeByte(255);
                        }

                        break;

                    default:
                        property += this.writeBytesArray(currentProperty.value.values);
                }

                break;

            case 'Bool':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    property += this.writeByte(currentProperty.value.values[i]);
                }

                break;

            case 'Int':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    property += this.writeInt(currentProperty.value.values[i]);
                }

                break;

            case 'Int64':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    property += this.writeInt64(currentProperty.value.values[i]);
                }

                break;

            case 'Float':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    property += this.writeFloat(currentProperty.value.values[i]);
                }

                break;

            case 'Double':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    property += this.writeDouble(currentProperty.value.values[i]);
                }

                break;

            case 'Enum':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    property += this.writeString(currentProperty.value.values[i].name);
                }

                break;

            case 'Str':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    property += this.writeString(currentProperty.value.values[i]);
                }

                break;

            case 'Text':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    property += this.writeTextProperty(currentProperty.value.values[i]);
                }

                break;

            case 'Object':
            case 'Interface':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    property += this.writeObjectProperty(currentProperty.value.values[i]);
                }

                break;

            case 'SoftObject':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    property += this.writeString(currentProperty.value.values[i].pathName);
                    property += this.writeString(currentProperty.value.values[i].subPathString);
                    property += this.writeInt(0);
                }

                break;

            case 'Struct':
                let currentBufferStartingLength     = this.currentBufferLength;
                let structPropertyBufferLength      = this.currentEntityLength;

                property += this.writeString(currentProperty.name);
                property += this.writeString('StructProperty');

                let structure   = this.writeInt(0);
                    structure  += this.writeString(currentProperty.structureSubType);

                    structure  += this.writeInt( ((currentProperty.propertyGuid1 !== undefined) ? currentProperty.propertyGuid1 : 0) );
                    structure  += this.writeInt( ((currentProperty.propertyGuid2 !== undefined) ? currentProperty.propertyGuid2 : 0) );
                    structure  += this.writeInt( ((currentProperty.propertyGuid3 !== undefined) ? currentProperty.propertyGuid3 : 0) );
                    structure  += this.writeInt( ((currentProperty.propertyGuid4 !== undefined) ? currentProperty.propertyGuid4 : 0) );

                    structure  += this.writeByte(0);

                let structureSizeLength      = this.currentEntityLength;

                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    switch(currentProperty.structureSubType)
                    {
                        case 'InventoryItem': // MOD: FicsItNetworks
                            structure += this.writeInventoryItem(currentProperty.value.values[i]);

                            break;

                        case 'Guid':
                            structure += this.writeHex(currentProperty.value.values[i]);

                            break;

                        case 'Vector':
                            if(this.header.saveVersion >= 41)
                            {
                                structure += this.writeDouble(currentProperty.value.values[i].x);
                                structure += this.writeDouble(currentProperty.value.values[i].y);
                                structure += this.writeDouble(currentProperty.value.values[i].z);
                            }
                            else
                            {
                                structure += this.writeFloat(currentProperty.value.values[i].x);
                                structure += this.writeFloat(currentProperty.value.values[i].y);
                                structure += this.writeFloat(currentProperty.value.values[i].z);
                            }

                            break;

                        case 'LinearColor':
                            structure += this.writeFloat(currentProperty.value.values[i].r);
                            structure += this.writeFloat(currentProperty.value.values[i].g);
                            structure += this.writeFloat(currentProperty.value.values[i].b);
                            structure += this.writeFloat(currentProperty.value.values[i].a);

                            break;

                        // MOD: FicsIt-Networks
                        case 'FINNetworkTrace':
                        case 'FIRTrace':
                            structure += this.writeFINNetworkTrace(currentProperty.value.values[i]);

                            break;

                        // MOD: FicsIt-Networks
                        case 'FINGPUT1BufferPixel':
                            structure += this.writeFINGPUT1BufferPixel(currentProperty.value.values[i]);

                            break;

                        // MOD: FicsIt-Networks
                        case 'FINDynamicStructHolder':
                        case 'FIRInstancedStruct':
                            structure += this.writeFINDynamicStructHolder(currentProperty.value.values[i]);

                            break;

                        default:
                            for(let j = 0; j < currentProperty.value.values[i].length; j++)
                            {
                                structure += this.writeProperty(currentProperty.value.values[i][j], currentProperty.structureSubType);
                            }
                            structure += this.writeString('None');
                    }
                }

                property += this.writeInt(this.currentEntityLength - structureSizeLength);
                property += structure;

                this.currentBufferLength = currentBufferStartingLength + (this.currentEntityLength - structPropertyBufferLength);

                break;

            default:
                console.log('Missing ' + currentProperty.value.type + ' in ArrayProperty ' + currentProperty.name);
        }

        return property;
    }

    writeMapProperty(currentProperty, parentType)
    {
        let property                = '';
        let currentMapPropertyCount = currentProperty.value.values.length;

        property += this.writeString(currentProperty.value.keyType + 'Property', false);
        property += this.writeString(currentProperty.value.valueType + 'Property', false);
        property += this.writeByte(0, false);
        property += this.writeInt(currentProperty.value.modeType);

        if(currentProperty.value.modeType === 2)
        {
            property += this.writeString(currentProperty.value.modeUnk2);
            property += this.writeString(currentProperty.value.modeUnk3);
        }
        if(currentProperty.value.modeType === 3)
        {
            property += this.writeHex(currentProperty.value.modeUnk1);
            property += this.writeString(currentProperty.value.modeUnk2);
            property += this.writeString(currentProperty.value.modeUnk3);
        }

        if(parentType === '/KeysForAll/KSUb.KSUb_C' && currentProperty.value.unk1 !== undefined)
        {
            property += this.writeString(currentProperty.value.unk1);
        }

        property += this.writeInt(currentMapPropertyCount);

        for(let iMapProperty = 0; iMapProperty < currentMapPropertyCount; iMapProperty++)
        {
            switch(currentProperty.value.keyType)
            {
                case 'Int':
                    property += this.writeInt(currentProperty.value.values[iMapProperty].keyMap);

                    break;

                case 'Int64':
                    property += this.writeInt64(currentProperty.value.values[iMapProperty].keyMap);

                    break;

                case 'Name':
                case 'Str':
                    property += this.writeString(currentProperty.value.values[iMapProperty].keyMap);

                    break;

                case 'Object':
                    property += this.writeObjectProperty(currentProperty.value.values[iMapProperty].keyMap);

                    break;

                case 'Enum':
                     property += this.writeString(currentProperty.value.values[iMapProperty].keyMap.name);

                    break;

                case 'Struct':
                    if(currentProperty.name === 'Destroyed_Foliage_Transform')
                    {
                        if(this.header.saveVersion >= 41)
                        {
                            property += this.writeDouble(currentProperty.value.values[iMapProperty].keyMap.x);
                            property += this.writeDouble(currentProperty.value.values[iMapProperty].keyMap.y);
                            property += this.writeDouble(currentProperty.value.values[iMapProperty].keyMap.z);
                        }
                        else
                        {
                            property += this.writeFloat(currentProperty.value.values[iMapProperty].keyMap.x);
                            property += this.writeFloat(currentProperty.value.values[iMapProperty].keyMap.y);
                            property += this.writeFloat(currentProperty.value.values[iMapProperty].keyMap.z);
                        }

                        break;
                    }
                    if(parentType === '/BuildGunUtilities/BGU_Subsystem.BGU_Subsystem_C')       // Mod: Universal Destroyer/Factory Statistics
                    {
                        property += this.writeFloat(currentProperty.value.values[iMapProperty].keyMap.x);
                        property += this.writeFloat(currentProperty.value.values[iMapProperty].keyMap.y);
                        property += this.writeFloat(currentProperty.value.values[iMapProperty].keyMap.z);

                        break;
                    }

                    if(
                            currentProperty.name === 'mSaveData'                                // Update 8
                         || currentProperty.name === 'mUnresolvedSaveData'                      // Update 8
                    )
                    {
                        property += this.writeInt(currentProperty.value.values[iMapProperty].keyMap.x);
                        property += this.writeInt(currentProperty.value.values[iMapProperty].keyMap.y);
                        property += this.writeInt(currentProperty.value.values[iMapProperty].keyMap.z);

                        break;
                    }

                    for(let i = 0; i < currentProperty.value.values[iMapProperty].keyMap.length; i++)
                    {
                        property += this.writeProperty(currentProperty.value.values[iMapProperty].keyMap[i]);
                    }
                    property += this.writeString('None');

                    break;

                default:
                    console.log('Missing keyType ' + currentProperty.value.keyType + ' in ' + currentProperty.name);
            }

            switch(currentProperty.value.valueType)
            {
                case 'Byte':
                    if(currentProperty.value.keyType === 'Str')
                    {
                        property += this.writeString(currentProperty.value.values[iMapProperty].valueMap);
                    }
                    else
                    {
                        property += this.writeByte(currentProperty.value.values[iMapProperty].valueMap);
                    }

                    break;

                case 'Bool':
                    property += this.writeByte(currentProperty.value.values[iMapProperty].valueMap);

                    break;

                case 'Int':
                    property += this.writeInt(currentProperty.value.values[iMapProperty].valueMap);

                    break;

                case 'Int64':
                    property += this.writeInt64(currentProperty.value.values[iMapProperty].valueMap);

                    break;

                case 'Double':
                    property += this.writeDouble(currentProperty.value.values[iMapProperty].valueMap);

                    break;

                case 'Float':
                    property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap);

                    break;

                case 'Str':
                    if(parentType === '/BuildGunUtilities/BGU_Subsystem.BGU_Subsystem_C')
                    {
                        property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap.unk1);
                        property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap.unk2);
                        property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap.unk3);
                    }

                    property += this.writeString(currentProperty.value.values[iMapProperty].valueMap);

                    break;

                case 'Object':
                    if(parentType === '/BuildGunUtilities/BGU_Subsystem.BGU_Subsystem_C')
                    {
                        property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap.unk1);
                        property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap.unk2);
                        property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap.unk3);
                        property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap.unk4);

                        property += this.writeString(currentProperty.value.values[iMapProperty].valueMap.unk5);
                        //property += this.writeProperty(currentProperty.value.values[iMapProperty].valueMap.unk6);

                        break;
                    }

                    property += this.writeObjectProperty(currentProperty.value.values[iMapProperty].valueMap);

                    break;

                case 'Text':
                    property += this.writeTextProperty(currentProperty.value.values[iMapProperty].valueMap);
                    break;

                case 'Struct':
                    if(parentType === 'LBBalancerData')
                    {
                        property += this.writeInt(currentProperty.value.values[iMapProperty].valueMap.mNormalIndex);
                        property += this.writeInt(currentProperty.value.values[iMapProperty].valueMap.mOverflowIndex);
                        property += this.writeInt(currentProperty.value.values[iMapProperty].valueMap.mFilterIndex);
                        break;
                    }
                    if(parentType === '/StorageStatsRoom/Sub_SR.Sub_SR_C' || parentType === '/CentralStorage/Subsystem_SC.Subsystem_SC_C')
                    {
                        if(this.header.saveVersion >= 41)
                        {
                            property += this.writeDouble(currentProperty.value.values[iMapProperty].valueMap.unk1);
                            property += this.writeDouble(currentProperty.value.values[iMapProperty].valueMap.unk2);
                            property += this.writeDouble(currentProperty.value.values[iMapProperty].valueMap.unk3);
                        }
                        else
                        {
                            property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap.unk1);
                            property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap.unk2);
                            property += this.writeFloat(currentProperty.value.values[iMapProperty].valueMap.unk3);
                        }

                        break;
                    }

                    let currentBufferStartingLength     = this.currentBufferLength;
                    let structPropertyBufferLength      = this.currentEntityLength;

                    for(let i = 0; i < currentProperty.value.values[iMapProperty].valueMap.length; i++)
                    {
                        property += this.writeProperty(currentProperty.value.values[iMapProperty].valueMap[i]);
                    }
                    property += this.writeString('None');

                    this.currentBufferLength = currentBufferStartingLength + (this.currentEntityLength - structPropertyBufferLength);

                    break;

                default:
                    console.log('Missing valueType ' + currentProperty.value.valueType + ' in MapProperty ' + currentProperty.name);
            }
        }

        return property;
    }

    writeSetProperty(currentProperty, parentType)
    {
        let property            = '';
        let setPropertyLength   = currentProperty.value.values.length;

        property += this.writeString(currentProperty.value.type + 'Property', false);
        property += this.writeByte(0, false);
        property += this.writeInt(0);
        property += this.writeInt(setPropertyLength);

        for(let iSetProperty = 0; iSetProperty < setPropertyLength; iSetProperty++)
        {
            switch(currentProperty.value.type)
            {
                case 'Object':
                    property += this.writeObjectProperty(currentProperty.value.values[iSetProperty]);

                    break;

                case 'Struct':
                    if(this.header.saveVersion >= 29 && parentType === '/Script/FactoryGame.FGFoliageRemoval')
                    {
                        property += this.writeFloat(currentProperty.value.values[iSetProperty].x);
                        property += this.writeFloat(currentProperty.value.values[iSetProperty].y);
                        property += this.writeFloat(currentProperty.value.values[iSetProperty].z);

                        break;
                    }
                    if(this.header.saveVersion >= 45 && parentType === '/Script/FactoryGame.FGScannableSubsystem')
                    {
                        property += this.writeHex(currentProperty.value.values[iSetProperty].guid);

                        break;
                    }
                    // MOD: FicsIt-Networks
                    property += this.writeFINNetworkTrace(currentProperty.value.values[iSetProperty]);

                    break;

                case 'Name':    // MOD: Sweet Transportal
                case 'Str':     // MOD: ???
                    property += this.writeString(currentProperty.value.values[iSetProperty].name);

                    break;

                case 'Int':
                    property += this.writeInt(currentProperty.value.values[iSetProperty].int);

                    break;

                case 'UInt32':
                    property += this.writeUint(currentProperty.value.values[iSetProperty].int);

                    break;

                default:
                    console.log('Missing ' + currentProperty.value.type + ' in SetProperty ' + currentProperty.name);
            }
        }

        return property;
    }

    writeStructProperty(currentProperty, parentType)
    {
        let property    = '';
            property   += this.writeString(currentProperty.value.type, false);
            property   += this.writeInt(0, false);
            property   += this.writeInt(0, false);
            property   += this.writeInt(0, false);
            property   += this.writeInt(0, false);
            property   += this.writeByte(0, false);

        switch(currentProperty.value.type)
        {
            case 'Color':
                property += this.writeByte(currentProperty.value.values.b);
                property += this.writeByte(currentProperty.value.values.g);
                property += this.writeByte(currentProperty.value.values.r);
                property += this.writeByte(currentProperty.value.values.a);

                break;

            case 'LinearColor':
                property += this.writeFloat(currentProperty.value.values.r);
                property += this.writeFloat(currentProperty.value.values.g);
                property += this.writeFloat(currentProperty.value.values.b);
                property += this.writeFloat(currentProperty.value.values.a);

                break;

            case 'Vector':
            case 'Rotator':
                if(this.header.saveVersion >= 41 && parentType !== 'SpawnData')
                {
                    property += this.writeDouble(currentProperty.value.values.x);
                    property += this.writeDouble(currentProperty.value.values.y);
                    property += this.writeDouble(currentProperty.value.values.z);
                }
                else
                {
                    property += this.writeFloat(currentProperty.value.values.x);
                    property += this.writeFloat(currentProperty.value.values.y);
                    property += this.writeFloat(currentProperty.value.values.z);
                }

                break;

            case 'Vector2D': // Mod?
                if(this.header.saveVersion >= 41)
                {
                    property += this.writeDouble(currentProperty.value.values.x);
                    property += this.writeDouble(currentProperty.value.values.y);
                }
                else
                {
                    property += this.writeFloat(currentProperty.value.values.x);
                    property += this.writeFloat(currentProperty.value.values.y);
                }

                break;

            case 'IntVector4':
                property += this.writeInt(currentProperty.value.values.a);
                property += this.writeInt(currentProperty.value.values.b);
                property += this.writeInt(currentProperty.value.values.c);
                property += this.writeInt(currentProperty.value.values.d);

                break;

            case 'Quat':
            case 'Vector4':
                if(this.header.saveVersion >= 41)
                {
                    property += this.writeDouble(currentProperty.value.values.a);
                    property += this.writeDouble(currentProperty.value.values.b);
                    property += this.writeDouble(currentProperty.value.values.c);
                    property += this.writeDouble(currentProperty.value.values.d);
                }
                else
                {
                    property += this.writeFloat(currentProperty.value.values.a);
                    property += this.writeFloat(currentProperty.value.values.b);
                    property += this.writeFloat(currentProperty.value.values.c);
                    property += this.writeFloat(currentProperty.value.values.d);
                }

                break;

            case 'Box':
                if(this.header.saveVersion >= 41)
                {
                    property += this.writeDouble(currentProperty.value.min.x);
                    property += this.writeDouble(currentProperty.value.min.y);
                    property += this.writeDouble(currentProperty.value.min.z);
                    property += this.writeDouble(currentProperty.value.max.x);
                    property += this.writeDouble(currentProperty.value.max.y);
                    property += this.writeDouble(currentProperty.value.max.z);
                }
                else
                {
                    property += this.writeFloat(currentProperty.value.min.x);
                    property += this.writeFloat(currentProperty.value.min.y);
                    property += this.writeFloat(currentProperty.value.min.z);
                    property += this.writeFloat(currentProperty.value.max.x);
                    property += this.writeFloat(currentProperty.value.max.y);
                    property += this.writeFloat(currentProperty.value.max.z);
                }

                property += this.writeByte(currentProperty.value.isValid);

                break;

            case 'RailroadTrackPosition':
                property += this.writeObjectProperty(currentProperty.value);
                property += this.writeFloat(currentProperty.value.offset);
                property += this.writeFloat(currentProperty.value.forward);

                break;

            case 'TimerHandle':
                property += this.writeString(currentProperty.value.handle);

                break;

            case 'Guid': // MOD?
                property += this.writeHex(currentProperty.value.guid);

                break;

            case 'InventoryItem':
                property += this.writeInventoryItem(currentProperty.value);

                let oldLength   = this.currentBufferLength;
                    if(currentProperty.value.properties[0] !== null)
                    {
                        property += this.writeProperty(currentProperty.value.properties[0]);
                        this.currentBufferLength = oldLength;
                    }

                break;

            case 'ClientIdentityInfo':
                property += this.writeHex(currentProperty.value.hex);

                break;

            case 'FluidBox':
                property += this.writeFloat(currentProperty.value.value);

                break;

            case 'SlateBrush': // MOD?
                property += this.writeString(currentProperty.value.unk1);

                break;

            case 'DateTime': // MOD: Power Suit
                property += this.writeInt64(currentProperty.value.dateTime);

                break;

            case 'FINNetworkTrace': // MOD: FicsIt-Networks
            case 'FIRTrace':
                property += this.writeFINNetworkTrace(currentProperty.value.values);

                break;

            case 'FINLuaProcessorStateStorage': // MOD: FicsIt-Networks
                property += this.writeFINLuaProcessorStateStorage(currentProperty.value.values);

                break;

            case 'FICFrameRange': // https://github.com/Panakotta00/FicsIt-Cam/blob/c55e254a84722c56e1badabcfaef1159cd7d2ef1/Source/FicsItCam/Public/Data/FICTypes.h#L34
                property += this.writeInt64(currentProperty.value.begin);
                property += this.writeInt64(currentProperty.value.end);

                break;

            case 'IntPoint':  // MOD: FicsIt-Cam
                property += this.writeInt(currentProperty.value.x);
                property += this.writeInt(currentProperty.value.y);

                break;

            default:
                let currentBufferStartingLength     = this.currentBufferLength;
                let structPropertyBufferLength      = this.currentEntityLength;

                for(let i = 0; i < currentProperty.value.values.length; i++)
                {
                    property += this.writeProperty(currentProperty.value.values[i], currentProperty.value.type);
                }
                property += this.writeString('None');

                this.currentBufferLength = currentBufferStartingLength + (this.currentEntityLength - structPropertyBufferLength);
        }

        return property;
    }

    writeTextProperty(currentProperty)
    {
        let property  = this.writeInt(currentProperty.flags);
            property += this.writeByte(currentProperty.historyType);

        switch(currentProperty.historyType)
        {
            // HISTORYTYPE_BASE
            case 0:
                property += this.writeString(currentProperty.namespace);
                property += this.writeString(currentProperty.key);
                property += this.writeString(currentProperty.value);

                break;

            // HISTORYTYPE_NAMEDFORMAT
            case 1:
            // HISTORYTYPE_ARGUMENTFORMAT
            case 3:
                property += this.writeTextProperty(currentProperty.sourceFmt);
                property += this.writeInt(currentProperty.argumentsCount);

                for(let i = 0; i < currentProperty.argumentsCount; i++)
                {
                    property += this.writeString(currentProperty.arguments[i].name);
                    property += this.writeByte(currentProperty.arguments[i].valueType);

                    switch(currentProperty.arguments[i].valueType)
                    {
                        case 0: // FORMATARGUMENTTYPE_INT
                            property += this.writeInt(currentProperty.arguments[i].argumentValue);
                            property += this.writeInt(currentProperty.arguments[i].argumentValueUnk);
                            break;
                        case 4: // FORMATARGUMENTTYPE_TEXT
                            property += this.writeTextProperty(currentProperty.arguments[i].argumentValue);
                            break;
                    }
                }

                break;

            // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/TextHistory.cpp#L2268
            // HISTORYTYPE_TRANSFORM
            case 10:
                property += this.writeTextProperty(currentProperty.sourceText);
                property += this.writeByte(currentProperty.transformType);

                break;

            // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/TextHistory.cpp#L2463
            //HISTORYTYPE_STRINGTABLEENTRY
            case 11:
                property += this.writeString(currentProperty.tableId);
                property += this.writeString(currentProperty.textKey);

                break;

            case 255:
                // Broke during engine upgrade?
                // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/Text.cpp#L894
                if(this.header.buildVersion >= 140822)
                {
                    property += this.writeInt(currentProperty.hasCultureInvariantString);

                    if(currentProperty.hasCultureInvariantString === 1)
                    {
                        property += this.writeString(currentProperty.value);
                    }
                }

                break;
        }

        return property;
    }

    writeObjectProperty(value, count = true)
    {
        let property = '';
            if(value.levelName !== undefined && value.levelName !== this.header.mapName)
            {
                property += this.writeString(value.levelName, count);
                property += this.writeString(value.pathName, count);
            }
            else
            {
                property += this.writeString(this.header.mapName, count);
                property += this.writeString(value.pathName, count);
            }

        return property;
    }

    writePropertyGUID(value)
    {
        let property = '';
            if(value.propertyGuid !== undefined)
            {
                property += this.writeByte(1, false);
                property += this.writeHex(value.propertyGuid, false);
            }
            else
            {
                property += this.writeByte(0, false);
            }

        return property;
    }

    writeInventoryItem(value)
    {
        let property = '';
            property += this.writeObjectProperty(value.itemName);

            if(this.header.saveVersion >= 44 && this.currentEntitySaveVersion >= 44)
            {
                if(value.itemState !== undefined)
                {
                    property += this.writeInt(1);
                    property += this.writeObjectProperty(value.itemState);

                    let currentBufferStartingLength     = this.currentBufferLength;
                    let structPropertyBufferLength      = this.currentEntityLength;
                    let itemStateProperties             = '';
                        for(let i = 0; i < value.itemStateProperties.length; i++)
                        {
                            itemStateProperties += this.writeProperty(value.itemStateProperties[i]);
                        }
                        itemStateProperties += this.writeString('None');

                        this.currentBufferLength = currentBufferStartingLength + (this.currentEntityLength - structPropertyBufferLength);

                        property += this.writeInt((this.currentEntityLength - structPropertyBufferLength));
                        property += itemStateProperties;
                }
                else
                {
                    property += this.writeInt(0);
                }
            }
            else
            {
                if(value.itemState !== undefined)
                {
                    property += this.writeObjectProperty(value.itemState);
                }
                else
                {
                    property += this.writeObjectProperty({levelName: '', pathName: ''});
                }
            }

        return property;
    }



    writeByte(value, count = true)
    {
        if(this.precacheByte === undefined)
        {
            this.precacheByte = [];
        }
        if(this.precacheByte[value] === undefined)
        {
            this.precacheByte[value] = String.fromCharCode(value & 0xff);
        }

        if(count === true)
        {
            this.currentBufferLength += 1;
        }
        this.currentEntityLength += 1;

        return this.precacheByte[value];
        //return String.fromCharCode(value & 0xff);
    }
    writeBytesArray(values, count = true)
    {
        let arrayLength = values.length;
        let saveBinary  = '';
        //let arrayBuffer = new Uint8Array(arrayLength);

        for(let i = 0; i < arrayLength; i++)
        {
            saveBinary += String.fromCharCode(values[i] & 0xff);
            //arrayBuffer[i] = (values[i] & 0xff);
        }

        if(count === true)
        {
            this.currentBufferLength += arrayLength;
        }
        this.currentEntityLength += arrayLength;

        return saveBinary;
        //this.saveBinary += String.fromCharCode.apply(null, arrayBuffer);
    }

    writeHex(value, count = true)
    {
        if(count === true)
        {
            this.currentBufferLength += value.length;
        }
        this.currentEntityLength += value.length;

        return value;
    }

    // https://github.com/feross/buffer/blob/v6.0.3/index.js#L1440
    writeInt8(value, count = true)
    {
        let arrayBuffer     = new Uint8Array(1);
            arrayBuffer[0]  = (value & 0xff);

        if(count === true)
        {
            this.currentBufferLength++;
        }
        this.currentEntityLength++;

        return String.fromCharCode.apply(null, arrayBuffer);
    }

    // https://github.com/feross/buffer/blob/v6.0.3/index.js#L1469
    writeInt(value, count = true)
    {
        let arrayBuffer     = new Uint8Array(4);
            arrayBuffer[3]  = (value >>> 24);
            arrayBuffer[2]  = (value >>> 16);
            arrayBuffer[1]  = (value >>> 8);
            arrayBuffer[0]  = (value & 0xff);

        if(count === true)
        {
            this.currentBufferLength += 4;
        }
        this.currentEntityLength += 4;

        return String.fromCharCode.apply(null, arrayBuffer);
    }

    writeUint(value, count = true)
    {
        let arrayBuffer     = new ArrayBuffer(4);
        let dataView        = new DataView(arrayBuffer);
            dataView.setUint32(0, value, true);

        if(count === true)
        {
            this.currentBufferLength += 4;
        }
        this.currentEntityLength += 4;

        return String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    }

    writeInt64(value, count = true)
    {
        let arrayBuffer     = new ArrayBuffer(8);
        let dataView        = new DataView(arrayBuffer);
            dataView.setBigInt64(0, BigInt(value), true);

        if(count === true)
        {
            this.currentBufferLength += 8;
        }
        this.currentEntityLength += 8;

        return String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    }

    writeUint64(value, count = true)
    {
        let arrayBuffer     = new ArrayBuffer(8);
        let dataView        = new DataView(arrayBuffer);
            dataView.setBigUint64(0, value, true);

        if(count === true)
        {
            this.currentBufferLength += 8;
        }
        this.currentEntityLength += 8;

        return String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    }

    writeFloat(value, count = true)
    {
        let arrayBuffer     = new ArrayBuffer(4);
        let dataView        = new DataView(arrayBuffer);
            dataView.setFloat32(0, value, true);

        if(count === true)
        {
            this.currentBufferLength += 4;
        }
        this.currentEntityLength += 4;

        return String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    }
    writeDouble(value, count = true)
    {
        let arrayBuffer     = new ArrayBuffer(8);
        let dataView        = new DataView(arrayBuffer);
            dataView.setFloat64(0, value, true);

        if(count === true)
        {
            this.currentBufferLength += 8;
        }
        this.currentEntityLength += 8;

        return String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    }

    writeString(value, count = true)
    {
        let stringLength = value.length;
            if(stringLength === 0)
            {
                return this.writeInt(0, count);
            }

        // UTF8
        if(/^[\x00-\x7F]*$/.test(value) === true)
        {
            let saveBinary  = this.writeInt(stringLength + 1, count);
                saveBinary += value;
                saveBinary += this.writeByte(0, count);

            if(count === true)
            {
                this.currentBufferLength += stringLength;
            }
            this.currentEntityLength += stringLength;

            return saveBinary;
        }
        // UTF16
        else
        {
            let saveBinary      = this.writeInt(-stringLength - 1, count);
            let arrayBuffer     = new Uint8Array(stringLength * 2);
                for(let i = 0; i < stringLength; i++)
                {
                    arrayBuffer[i * 2]      = value.charCodeAt(i) & 0xff;
                    arrayBuffer[i * 2 + 1]  = (value.charCodeAt(i) >> 8) & 0xff;
                }

            if(count === true)
            {
                this.currentBufferLength += stringLength * 2;
            }
            this.currentEntityLength += stringLength * 2;

            saveBinary += String.fromCharCode.apply(null, arrayBuffer);
            saveBinary += this.writeByte(0, count);
            saveBinary += this.writeByte(0, count);

            return saveBinary;
        }
    }

    writeFINGPUT1BufferPixel(value)
    {
        let saveBinary  = '';
            saveBinary += this.writeHex(value.character);
            saveBinary += this.writeFloat(value.foregroundColor.r);
            saveBinary += this.writeFloat(value.foregroundColor.g);
            saveBinary += this.writeFloat(value.foregroundColor.b);
            saveBinary += this.writeFloat(value.foregroundColor.a);
            saveBinary += this.writeFloat(value.backgroundColor.r);
            saveBinary += this.writeFloat(value.backgroundColor.g);
            saveBinary += this.writeFloat(value.backgroundColor.b);
            saveBinary += this.writeFloat(value.backgroundColor.a);

        return saveBinary;
    }

    writeFINNetworkTrace(value)
    {
        let saveBinary  = '';
            saveBinary += this.writeObjectProperty(value);

            if(value.prev !== undefined)
            {
                saveBinary += this.writeInt(1);
                saveBinary += this.writeFINNetworkTrace(value.prev);
            }
            else
            {
                saveBinary += this.writeInt(0);
            }

            if(value.step !== undefined)
            {
                saveBinary += this.writeInt(1);
                saveBinary += this.writeString(value.step);
            }
            else
            {
                saveBinary += this.writeInt(0);
            }

        return saveBinary;
    };

    writeFINLuaProcessorStateStorage(value)
    {
        let saveBinary  = '';

            saveBinary += this.writeInt(value.trace.length);
            for(let i = 0; i < value.trace.length; i++)
            {
                saveBinary += this.writeFINNetworkTrace(value.trace[i]);
            }

            saveBinary += this.writeInt(value.reference.length);
            for(let i = 0; i < value.reference.length; i++)
            {
                saveBinary += this.writeString(value.reference[i].levelName);
                saveBinary += this.writeString(value.reference[i].pathName);
            }

            saveBinary += this.writeString(value.thread);
            saveBinary += this.writeString(value.globals);

            saveBinary += this.writeInt(value.structs.length);
            for(let i = 0; i < value.structs.length; i++)
            {
                saveBinary += this.writeInt(value.structs[i].unk1);
                saveBinary += this.writeString(value.structs[i].unk2);

                switch(value.structs[i].unk2)
                {
                    case '/Script/CoreUObject.Vector':
                        saveBinary += this.writeFloat(value.structs[i].x);
                        saveBinary += this.writeFloat(value.structs[i].y);
                        saveBinary += this.writeFloat(value.structs[i].z);

                        break;

                    case '/Script/CoreUObject.Vector2D':
                        saveBinary += this.writeDouble(value.structs[i].x);
                        saveBinary += this.writeDouble(value.structs[i].y);

                        break;

                    case '/Script/CoreUObject.LinearColor':
                        saveBinary += this.writeFloat(value.structs[i].r);
                        saveBinary += this.writeFloat(value.structs[i].g);
                        saveBinary += this.writeFloat(value.structs[i].b);
                        saveBinary += this.writeFloat(value.structs[i].a);

                        break;

                    case '/Script/FactoryGame.InventoryStack':
                        if(this.header.saveVersion >= 41)
                        {
                            saveBinary += this.writeString(value.structs[i].unk3);
                            saveBinary += this.writeString(value.structs[i].unk4);
                            saveBinary += this.writeInt(value.structs[i].unk5);
                            saveBinary += this.writeInt(value.structs[i].unk6);
                            saveBinary += this.writeStructProperty(value.structs[i].unk7, value.structs[i].unk2);
                            saveBinary += this.writeString(value.structs[i].unk8);
                        }
                        else
                        {
                            saveBinary += this.writeInt(value.structs[i].unk3);
                            saveBinary += this.writeString(value.structs[i].unk4);
                            saveBinary += this.writeInt(value.structs[i].unk5);
                            saveBinary += this.writeInt(value.structs[i].unk6);
                            saveBinary += this.writeInt(value.structs[i].unk7);
                        }

                        break;

                    case '/Script/FactoryGame.ItemAmount':
                        saveBinary += this.writeInt(value.structs[i].unk3);
                        saveBinary += this.writeString(value.structs[i].unk4);
                        saveBinary += this.writeInt(value.structs[i].unk5);

                        break;

                    case '/Script/FicsItNetworks.FINTrackGraph':
                        saveBinary += this.writeFINNetworkTrace(value.structs[i].trace);
                        saveBinary += this.writeInt(value.structs[i].trackId);

                        break;

                    case '/Script/FicsItNetworks.FINGPUT1Buffer':
                        saveBinary += this.writeInt(value.structs[i].x);
                        saveBinary += this.writeInt(value.structs[i].y);
                        saveBinary += this.writeInt(value.structs[i].size);
                        saveBinary += this.writeString(value.structs[i].name);
                        saveBinary += this.writeString(value.structs[i].type);
                        saveBinary += this.writeInt(value.structs[i].length);

                        for(let size = 0; size < value.structs[i].size; size++)
                        {
                            saveBinary += this.writeFINGPUT1BufferPixel(value.structs[i].buffer[size]);
                        }

                        saveBinary += this.writeHex(value.structs[i].unk3);

                        break;
                }
            }

        return saveBinary;
    }

    writeFINDynamicStructHolder(value)
    {
        let saveBinary  = '';
            saveBinary += this.writeInt(value.unk0);
            saveBinary += this.writeString(value.type);

            if(['/Script/FicsItNetworks.FINGPUT2DC_Lines', '/Script/FicsItNetworksComputer.FINGPUT2DC_Lines'].includes(value.type))
            {
                saveBinary += this.writeString(value.unk1);
                saveBinary += this.writeString(value.unk2);
                saveBinary += this.writeInt(value.unk3);
                saveBinary += this.writeInt(value.unk4);
                saveBinary += this.writeString(value.unk5);
                saveBinary += this.writeByte(value.unk6);
                saveBinary += this.writeInt(value.unk7);
                saveBinary += this.writeProperty(value.unk8);

                for(let i = 0; i < value.unk9.length; i++)
                {
                    saveBinary += this.writeDouble(value.unk9[i].x);
                    saveBinary += this.writeDouble(value.unk9[i].y);
                }
            }

            for(let i = 0; i < value.properties; i++)
            {
                saveBinary += this.writeProperty(value.properties[i]);
            }
            saveBinary += this.writeString('None');

        return saveBinary;
    }
};

self.onmessage = function(e){
    if(e.data.command !== undefined)
    {
        self.saveParserWrite.handleWorkerMessage(e.data);
    }
    else
    {
        return new SaveParser_Write(self, e.data);
    }
};