import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

export default class Modal_Map_Hotbars
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.copiedHotbar       = null;

        navigator.clipboard.readText().then(function(clipboard){
            let clipboardJson = null;
                try
                {
                    clipboardJson = JSON.parse('' + clipboard);
                }
                catch(error){ clipboardJson = null; }

                if(clipboardJson !== null && typeof clipboardJson === 'object' && clipboardJson.type !== undefined && clipboardJson.type === 'hotbarCopySCIM')
                {
                    this.copiedHotbar = clipboardJson;
                    $('#statisticsPlayerHotBars .btn-paste').show();
                }
        }.bind(this));
    }

    parse(options = {})
    {
        $('#statisticsPlayerHotBars').empty();

        let hotbarHeaderHtml    = [];
        let hotbarHtml          = [];

        for(let pathName in this.baseLayout.players)
        {
            hotbarHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ((this.baseLayout.players[pathName].isHost() === true) ? 'active' : '') + '" data-toggle="tab" href="#playerHotBars-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;">');
            hotbarHeaderHtml.push(this.baseLayout.players[pathName].getDisplayName());
            hotbarHeaderHtml.push('</span></li>');

            hotbarHtml.push('<div class="tab-pane fade ' + ((this.baseLayout.players[pathName].isHost() === true) ? 'show active' : '') + '" id="playerHotBars-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '">');
            hotbarHtml.push(this.parsePlayer(this.baseLayout.players[pathName].player, options));
            hotbarHtml.push('</div>');
        }

        $('#statisticsPlayerHotBars').html('<ul class="nav nav-tabs nav-fill">' + hotbarHeaderHtml.join('') + '</ul><div class="tab-content p-3 border border-top-0">' + hotbarHtml.join('') + '</div>');

        $('#statisticsPlayerHotBars input[name="presetName"]').on('keyup click', function(e){
            let playerStatePathName = $(e.currentTarget).parent().attr('data-pathName');
            let newValue            = $(e.currentTarget).val();
            let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);

                if(playerState !== null)
                {
                    let mPresetHotbars      = this.baseLayout.getObjectProperty(playerState, 'mPresetHotbars');
                    let currentPreset       = $(e.currentTarget).parent().attr('data-index');

                        if(mPresetHotbars !== null)
                        {
                            for(let j = 0; j < mPresetHotbars.values[currentPreset].length; j++)
                            {
                                if(mPresetHotbars.values[currentPreset][j].name === 'PresetName')
                                {
                                    if(mPresetHotbars.values[currentPreset][j].value !== newValue)
                                    {
                                        mPresetHotbars.values[currentPreset][j].value = newValue;
                                    }
                                    break;
                                }
                            }
                        }
                }
        }.bind(this));
        $('#statisticsPlayerHotBars input[name="presetName"] + .input-group-append .btn-danger').on('click', function(e){
            let playerStatePathName = $(e.currentTarget).parent().parent().attr('data-pathName');
            let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);

                if(playerState !== null)
                {
                    let mPresetHotbars      = this.baseLayout.getObjectProperty(playerState, 'mPresetHotbars');
                    let currentPreset       = $(e.currentTarget).parent().parent().attr('data-index');

                        if(mPresetHotbars !== null)
                        {
                            mPresetHotbars.values.splice(currentPreset, 1);
                            this.parse({playerState: playerStatePathName, showPresets :true});
                        }
                }
        }.bind(this));

        $('#statisticsPlayerHotBars .btn-copy').click(function(e){
            let playerStatePathName = $(e.target).closest('[data-hotbar]').attr('data-pathName');
            let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                if(playerState !== null)
                {
                    let hotbarSlot          = $(e.target).closest('[data-hotbar]').attr('data-hotbar');
                    let mHotbars            = this.baseLayout.getObjectProperty(playerState, 'mHotbars');
                        if(mHotbars !== null)
                        {
                            let hotbarJson = {
                                    type    : 'hotbarCopySCIM',
                                    values  : []
                                };

                                for(let j = 0; j < mHotbars.values[parseInt(hotbarSlot)][0].value.values.length; j++)
                                {
                                    let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mHotbars.values[parseInt(hotbarSlot)][0].value.values[j].pathName);
                                        hotbarJson.values.push(currentShortcut.properties);
                                }

                                navigator.clipboard.writeText(JSON.stringify(hotbarJson)).then(
                                    function(){
                                        this.copiedHotbar = hotbarJson;
                                        $('#statisticsPlayerHotBars .btn-paste').show();
                                    }.bind(this),
                                    function(){ BaseLayout_Modal.alert('We coult not write the hotbar to your clipboard!'); }
                                );
                        }
                }
        }.bind(this));
        $('#statisticsPlayerHotBars .btn-paste').click(function(e){
            if(this.copiedHotbar !== null)
            {
                let playerStatePathName = $(e.target).closest('[data-hotbar]').attr('data-pathName');
                let playerState         = this.baseLayout.saveGameParser.getTargetObject(playerStatePathName);
                    if(playerState !== null)
                    {
                        let hotbarSlot          = $(e.target).closest('[data-hotbar]').attr('data-hotbar');
                        let mHotbars            = this.baseLayout.getObjectProperty(playerState, 'mHotbars');
                            if(mHotbars !== null)
                            {
                                for(let j = 0; j < mHotbars.values[parseInt(hotbarSlot)][0].value.values.length; j++)
                                {
                                    let currentShortcut = this.baseLayout.saveGameParser.getTargetObject(mHotbars.values[parseInt(hotbarSlot)][0].value.values[j].pathName);
                                        currentShortcut.properties = JSON.parse(JSON.stringify(this.copiedHotbar.values[j]));
                                }

                                this.parse(options);
                            }
                    }
            }
        }.bind(this));

        if(this.copiedHotbar !== null)
        {
            $('#statisticsPlayerHotBars .btn-paste').show();
        }
    }

    parsePlayer(player, options = {})
    {
        let cellWidth           = 86;
        let html                = [];

        let mHotbarsHtml        = this.parseHotbars(player, cellWidth);
        let mPresetHotbarsHtml  = this.parseHotbarsPresets(player, options);

        if(mPresetHotbarsHtml.length === 0)
        {
            html.push(mHotbarsHtml.join(''));
        }
        else
        {
            let hotbarHeaderHtml    = [];
            let hotbarHtml          = [];
            let showPresets         = (options.showPresets !== undefined) ? options.showPresets : false;

            hotbarHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ( (showPresets === true) ? '' : 'active' ) + '" data-toggle="tab" href="#playerHotBarsPresets-' + player.pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;">HotBars</span></li>');
            hotbarHtml.push('<div class="tab-pane fade ' + ( (showPresets === true) ? '' : 'show active' ) + '" id="playerHotBarsPresets-' + player.pathName.replace('Persistent_Level:PersistentLevel.', '') + '">' + mHotbarsHtml.join('') + '</div>');

            hotbarHeaderHtml.push('<li class="nav-item"><span class="nav-link ' + ( (showPresets === true) ? 'active' : '' ) + '" data-toggle="tab" href="#playerHotBarsPresetsShow-' + player.pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;">HotBar Presets</span></li>');
            hotbarHtml.push('<div class="tab-pane fade ' + ( (showPresets === true) ? 'show active' : '' ) + '" id="playerHotBarsPresetsShow-' + player.pathName.replace('Persistent_Level:PersistentLevel.', '') + '">' + mPresetHotbarsHtml.join('') + '</div>');

            html.push('<ul class="nav nav-tabs nav-fill">' + hotbarHeaderHtml.join('') + '</ul><div class="tab-content p-3 border border-top-0">' + hotbarHtml.join('') + '</div>');
        }

        return html.join('');
    }

    parseHotbars(player, cellWidth)
    {
        let mHotbars            = this.baseLayout.getObjectProperty(player, 'mHotbars');
        let mHotbarsHtml        = [];

            if(mHotbars !== null)
            {
                mHotbarsHtml.push('<div class="row">');
                for(let i = 0; i < mHotbars.values.length; i++)
                {
                    mHotbarsHtml.push('<div class="col-12" data-hotbar="' + i + '" data-pathName="' + player.pathName + '">');
                    mHotbarsHtml.push('<div class="d-flex flex-row">');
                    mHotbarsHtml.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 64px;height: ' + cellWidth + 'px;padding: 6px;line-height: ' + cellWidth + 'px;font-size: 20px;"><strong>#' + (i + 1) + '</strong></div>');

                    for(let j = 0; j < mHotbars.values[i][0].value.values.length; j++)
                    {
                        let currentShortcut     = this.baseLayout.saveGameParser.getTargetObject(mHotbars.values[i][0].value.values[j].pathName);
                        let currentInventory    = null;
                            if(currentShortcut !== null)
                            {
                                let mRecipeToActivate     = this.baseLayout.getItemDataFromRecipe(currentShortcut, 'mRecipeToActivate');
                                    if(mRecipeToActivate !== null && mRecipeToActivate.produce !== undefined)
                                    {
                                        let buildingData = this.baseLayout.getBuildingDataFromClassName(Object.keys(mRecipeToActivate.produce)[0].replace(new RegExp(/Desc_/, 'g'), 'Build_'));

                                            if(buildingData !== null)
                                            {
                                                currentInventory    = {image: buildingData.image, name: buildingData.name};
                                            }
                                    }
                            }

                        mHotbarsHtml.push(this.baseLayout.getInventoryImage(currentInventory, cellWidth));
                    }

                    mHotbarsHtml.push('<div class="d-flex flex-row" style="position:relative;margin: 1px;width: 120px;height: ' + cellWidth + 'px;padding: 6px;align-items: center;justify-content: center;">');
                        mHotbarsHtml.push('<span class="btn btn-secondary mr-1 btn-copy" data-hover="tooltip" title="Copy hotbar"><i class="fas fa-copy"></i></span>');
                        mHotbarsHtml.push('<span class="btn btn-secondary ml-1 btn-paste" data-hover="tooltip" title="Paste hotbar" style="display: none;"><i class="fas fa-paste"></i></span>');
                    mHotbarsHtml.push('</div>');

                    mHotbarsHtml.push('</div>');
                    mHotbarsHtml.push('</div>');
                }
                mHotbarsHtml.push('</div>');
            }
            else
            {

            }

        return mHotbarsHtml;
    }

    parseHotbarsPresets(player)
    {
        let mPresetHotbars      = this.baseLayout.getObjectProperty(player, 'mPresetHotbars');
        let mPresetHotbarsHtml  = [];

            if(mPresetHotbars !== null)
            {
                cellWidth           = 50;
                mPresetHotbarsHtml.push('<div class="row">');

                for(let i = 0; i < mPresetHotbars.values.length; i++)
                {
                    if(i > 1)
                    {
                        mPresetHotbarsHtml.push('<hr />');
                    }

                    let currentPresetName  = '';
                    let currentIconIndex   = 0;
                    let currentShortCuts   = [];

                        for(let j = 0; j < mPresetHotbars.values[i].length; j++)
                        {
                            if(mPresetHotbars.values[i][j].name === 'PresetName')
                            {
                                currentPresetName = mPresetHotbars.values[i][j].value;
                                continue;
                            }

                            if(mPresetHotbars.values[i][j].name === 'IconIndex')
                            {
                                currentIconIndex = mPresetHotbars.values[i][j].value.value;
                                continue;
                            }

                            if(mPresetHotbars.values[i][j].name === 'Hotbar')
                            {
                                currentShortCuts = mPresetHotbars.values[i][j].value;
                                continue;
                            }
                        }


                        mPresetHotbarsHtml.push('<div class="col-sm-6">');

                            mPresetHotbarsHtml.push('<div class="input-group input-group-sm mb-1" data-index="' + i + '" data-pathName="' + player.pathName + '">');
                                mPresetHotbarsHtml.push('<input type="text" name="presetName" class="form-control form-control-sm" value="' + currentPresetName + '">');
                                mPresetHotbarsHtml.push('<div class="input-group-append"><button class="btn btn-danger"><i class="fas fa-trash-alt"></i></button></div>');
                            mPresetHotbarsHtml.push('</div>');

                        mPresetHotbarsHtml.push('<div class="d-flex flex-row">');

                        for(let j = 0; j < currentShortCuts.values[0].value.values.length; j++)
                        {
                            let currentShortcut     = this.baseLayout.saveGameParser.getTargetObject(currentShortCuts.values[0].value.values[j].pathName);
                            let currentInventory    = null;

                            if(currentShortcut !== null)
                            {
                                let mRecipeToActivate     = this.baseLayout.getItemDataFromRecipe(currentShortcut, 'mRecipeToActivate');
                                    if(mRecipeToActivate !== null && mRecipeToActivate.produce !== undefined)
                                    {
                                        let buildingData = this.baseLayout.getBuildingDataFromClassName(Object.keys(mRecipeToActivate.produce)[0].replace(new RegExp(/Desc_/, 'g'), 'Build_'));

                                            if(buildingData !== null)
                                            {
                                                currentInventory = {image: buildingData.image, name: buildingData.name};
                                            }
                                    }
                            }

                            if(j === currentIconIndex)
                            {
                                let currentIconHtml = this.baseLayout.getInventoryImage(currentInventory, cellWidth);
                                    currentIconHtml = currentIconHtml.replace('border: 1px solid #000000;', 'border: 2px solid #F47C3C;');
                                    currentIconHtml = currentIconHtml.replace('padding: 5px;', 'padding: 4px;');

                                    mPresetHotbarsHtml.push(currentIconHtml);
                            }
                            else
                            {
                                mPresetHotbarsHtml.push(this.baseLayout.getInventoryImage(currentInventory, cellWidth));
                            }
                        }

                        mPresetHotbarsHtml.push('</div>');

                        mPresetHotbarsHtml.push('</div>');

                }

                mPresetHotbarsHtml.push('</div>');
            }

        return mPresetHotbarsHtml;
    }
}