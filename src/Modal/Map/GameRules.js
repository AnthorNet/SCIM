export default class Modal_Map_GameRules
{
    constructor(options)
    {
        this.baseLayout     = options.baseLayout;
        this.lastPathName   = null;
    }

    parse()
    {
        $('#statisticsModalRules').empty();

        let html                            = [];
        let gameState                       = this.baseLayout.gameStateSubSystem.get();
        let gameRules                       = this.baseLayout.gameRulesSubSystem.get();

        let mCheatNoCost                    = this.baseLayout.getObjectProperty(gameState, 'mCheatNoCost', 0);
        let mCheatNoPower                   = this.baseLayout.getObjectProperty(gameState, 'mCheatNoPower', 0);
        let mCheatNoFuel                    = this.baseLayout.getObjectProperty(gameState, 'mCheatNoFuel', 0);

        if(gameRules !== null || this.baseLayout.saveGameParser.header.saveHeaderType >= 8)
        {
            html.push('<div class="row"><div class="col-6">');

            if(gameRules !== null)
            {
                let mIsCreativeModeEnabled = this.baseLayout.getObjectProperty(gameState, 'mIsCreativeModeEnabled');

                        html.push('<div class="custom-control custom-switch">');
                        html.push('<input type="checkbox" class="custom-control-input" name="inputIsCreativeModeEnabled" id="inputIsCreativeModeEnabled" ' + ((mIsCreativeModeEnabled !== null) ? 'checked' : '') + ' />');
                        html.push('<label class="custom-control-label" for="inputIsCreativeModeEnabled">' + this.baseLayout.translate._('Activate Advanced Game Settings') + '</label>');
                        html.push('</div>');
            }

            html.push('</div><div class="col-6">');
                html.push('<div class="form-group">');
                    html.push('<div class="custom-control custom-switch">');
                    html.push('<input type="checkbox" class="custom-control-input" name="inputIsModdedSave" id="inputIsModdedSave" ' + ((this.baseLayout.saveGameParser.header.isModdedSave !== undefined && this.baseLayout.saveGameParser.header.isModdedSave === 1) ? 'checked' : '') + ' />');
                    html.push('<label class="custom-control-label" for="inputIsModdedSave">' + this.baseLayout.translate._('Is modded save? (Avoid main menu warning)') + '</label>');
                    html.push('</div>');
                html.push('</div>');
            html.push('</div></div>');
            html.push('<hr class="border-secondary" />');
        }

        html.push('<h4>' + this.baseLayout.translate._('Gameplay (For all players):') + '</h4>');
        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputCheatNoCost" id="inputCheatNoCost" ' + ((mCheatNoCost === 1) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputCheatNoCost">' + this.baseLayout.translate._('No Build Cost') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputCheatNoPower" id="inputCheatNoPower" ' + ((mCheatNoPower === 1) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputCheatNoPower">' + this.baseLayout.translate._('No Power Cost') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div></div>');

        html.push('<div class="row"><div class="col-6">');
        html.push('<div class="form-group">');
            html.push('<div class="custom-control custom-switch">');
            html.push('<input type="checkbox" class="custom-control-input" name="inputCheatNoFuel" id="inputCheatNoFuel" ' + ((mCheatNoFuel === 1) ? 'checked' : '') + ' />');
            html.push('<label class="custom-control-label" for="inputCheatNoFuel">' + this.baseLayout.translate._('No Fuel Cost') + '</label>');
            html.push('</div>');
        html.push('</div>');
        html.push('</div></div>');

        if(gameRules !== null)
        {
            html.push('<hr class="border-secondary" />');

            let mNoUnlockCost               = this.baseLayout.getObjectProperty(gameRules, 'mNoUnlockCost');
            let mUnlockInstantAltRecipes    = this.baseLayout.getObjectProperty(gameRules, 'mUnlockInstantAltRecipes');
                html.push('<div class="row"><div class="col-6">');
                html.push('<div class="form-group">');
                    html.push('<div class="custom-control custom-switch">');
                    html.push('<input type="checkbox" class="custom-control-input" name="inputNoUnlockCost" id="inputNoUnlockCost" ' + ((mNoUnlockCost === 1) ? 'checked' : '') + ' />');
                    html.push('<label class="custom-control-label" for="inputNoUnlockCost">' + this.baseLayout.translate._('No Unlock Cost') + '</label>');
                    html.push('</div>');
                html.push('</div>');
                html.push('</div><div class="col-6">');
                html.push('<div class="form-group">');
                    html.push('<div class="custom-control custom-switch">');
                    html.push('<input type="checkbox" class="custom-control-input" name="inputUnlockInstantAltRecipes" id="inputUnlockInstantAltRecipes" ' + ((mUnlockInstantAltRecipes === 1) ? 'checked' : '') + ' />');
                    html.push('<label class="custom-control-label" for="inputUnlockInstantAltRecipes">' + this.baseLayout.translate._('Unlock Alternate Recipes Instantly') + '</label>');
                    html.push('</div>');
                html.push('</div>');
                html.push('</div></div>');

            html.push('<hr class="border-secondary" />');
            html.push('<h4>' + this.baseLayout.translate._('Creatures:') + '</h4>');

            let disableArachnidCreatures = this.baseLayout.getObjectProperty(gameRules, 'mDisableArachnidCreatures');
                html.push('<div class="row"><div class="col-12">');
                    html.push('<div class="custom-control custom-switch">');
                    html.push('<input type="checkbox" class="custom-control-input" name="inputDisableArachnidCreatures" id="inputDisableArachnidCreatures" ' + ((disableArachnidCreatures !== null) ? 'checked' : '') + ' />');
                    html.push('<label class="custom-control-label" for="inputDisableArachnidCreatures">' + this.baseLayout.translate._('Disable Arachnid Creatures') + '</label>');
                    html.push('</div>');
                html.push('</div></div>');

            html.push('<hr class="border-secondary" />');
            html.push('<h4>' + this.baseLayout.translate._('Players:') + '</h4>');
            html.push('<ul class="nav nav-tabs nav-fill">');

            for(let pathName in this.baseLayout.players)
            {
                if(this.lastPathName === null){ this.lastPathName = pathName; } // Use first tab

                html.push('<li class="nav-item"><span class="nav-link ' + ((pathName === this.lastPathName) ? 'active' : '') + '" data-toggle="tab" href="#playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '" style="cursor:pointer;" data-pathName="' + pathName +'">');
                html.push(this.baseLayout.players[pathName].getDisplayName());
                html.push('</span></li>');
            }

            html.push('</ul>');
            html.push('<div class="tab-content p-3 border border-top-0">');

            for(let pathName in this.baseLayout.players)
            {
                html.push('<div class="tab-pane fade ' + ((pathName === this.lastPathName) ? 'show active' : '') + '" id="playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '">');

                let mPlayerRules    = this.baseLayout.getObjectProperty(this.baseLayout.players[pathName].player, 'mPlayerRules');

                let NoBuildCost = this.baseLayout.getObjectProperty(mPlayerRules, 'NoBuildCost');
                let FlightMode  = this.baseLayout.getObjectProperty(mPlayerRules, 'FlightMode');
                let GodMode     = this.baseLayout.getObjectProperty(mPlayerRules, 'GodMode');

                    html.push('<div class="row"><div class="col-4">');
                    html.push('<div class="form-group">');
                        html.push('<div class="custom-control custom-switch">');
                        html.push('<input type="checkbox" class="custom-control-input" name="playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatNoCost" id="playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatNoCost" ' + ((NoBuildCost === 1) ? 'checked' : '') + ' />');
                        html.push('<label class="custom-control-label" for="playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatNoCost">' + this.baseLayout.translate._('No Build Cost') + '</label>');
                        html.push('</div>');
                    html.push('</div>');
                    html.push('</div><div class="col-4">');
                    html.push('<div class="form-group">');
                        html.push('<div class="custom-control custom-switch">');
                        html.push('<input type="checkbox" class="custom-control-input" name="playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatFlightMode" id="playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatFlightMode" ' + ((FlightMode === 1) ? 'checked' : '') + ' />');
                        html.push('<label class="custom-control-label" for="playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatFlightMode">' + this.baseLayout.translate._('Flight Mode') + '</label>');
                        html.push('</div>');
                    html.push('</div>');
                    html.push('</div><div class="col-4">');
                    html.push('<div class="form-group">');
                        html.push('<div class="custom-control custom-switch">');
                        html.push('<input type="checkbox" class="custom-control-input" name="playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatGodMode" id="playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatGodMode" ' + ((GodMode === 1) ? 'checked' : '') + ' />');
                        html.push('<label class="custom-control-label" for="playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatGodMode">' + this.baseLayout.translate._('God Mode') + '</label>');
                        html.push('</div>');
                    html.push('</div>');
                    html.push('</div></div>');

                //EPlayerKeepInventoryMode KeepInventoryMode = EPlayerKeepInventoryMode::Keep_Equipment;
                html.push('</div>');
            }

            html.push('</div>');

            $('#statisticsModalRules span[data-toggle="tab"]').on('show.bs.tab', (e) => {
                this.lastPathName = $(e.target).attr('data-pathName');
            });
        }

        $('#statisticsModalRules').html(html.join(''));

        $('#statisticsModalRules input, #statisticsModalRules select').on('keyup click', () => {
            if($('#inputCheatNoCost').is(':checked') === true)
            {
                this.baseLayout.setObjectProperty(gameState, 'mCheatNoCost', 1, 'Bool');
            }
            else
            {
                this.baseLayout.deleteObjectProperty(gameState, 'mCheatNoCost');
            }

            if($('#inputCheatNoPower').is(':checked') === true)
            {
                this.baseLayout.setObjectProperty(gameState, 'mCheatNoPower', (($('#inputCheatNoPower').is(':checked') === true) ? 1 : 0), 'Bool');
            }
            else
            {
                this.baseLayout.deleteObjectProperty(gameState, 'mCheatNoPower');
            }

            if($('#inputCheatNoFuel').is(':checked') === true)
            {
                this.baseLayout.setObjectProperty(gameState, 'mCheatNoFuel', (($('#inputCheatNoFuel').is(':checked') === true) ? 1 : 0), 'Bool');
            }
            else
            {
                this.baseLayout.deleteObjectProperty(gameState, 'mCheatNoFuel');
            }

            if(this.baseLayout.saveGameParser.header.saveHeaderType >= 8)
            {
                if($('#inputIsModdedSave').is(':checked') === true)
                {
                    this.baseLayout.saveGameParser.header.isModdedSave = 1;
                }
                else
                {
                    this.baseLayout.saveGameParser.header.isModdedSave = 0;
                }
            }

            if(gameRules !== null)
            {
                this.baseLayout.saveGameParser.header.mapOptions = this.baseLayout.saveGameParser.header.mapOptions.replaceAll('?enableAdvancedGameSettings', '');

                if($('#inputIsCreativeModeEnabled').is(':checked') === true)
                {
                    this.baseLayout.saveGameParser.header.isCreativeModeEnabled = 1;
                    this.baseLayout.saveGameParser.header.mapOptions = this.baseLayout.saveGameParser.header.mapOptions + '?enableAdvancedGameSettings';

                    this.baseLayout.setObjectProperty(gameState, 'mIsCreativeModeEnabled', (($('#inputHasInitialized').is(':checked') === true) ? 1 : 0), 'Bool');
                    this.baseLayout.setObjectProperty(gameRules, 'mHasInitialized', (($('#inputHasInitialized').is(':checked') === true) ? 1 : 0), 'Bool');
                }
                else
                {
                    this.baseLayout.saveGameParser.header.isCreativeModeEnabled = 0;

                    this.baseLayout.deleteObjectProperty(gameState, 'mIsCreativeModeEnabled');
                    this.baseLayout.deleteObjectProperty(gameRules, 'mHasInitialized');

                    $( "#inputNoUnlockCost" ).prop( "checked", false );
                    $( "#inputUnlockInstantAltRecipes" ).prop( "checked", false );
                    $( "#inputDisableArachnidCreatures" ).prop( "checked", false );

                    for(let pathName in this.baseLayout.players)
                    {
                        let mPlayerRules    = this.baseLayout.getObjectProperty(this.baseLayout.players[pathName].player, 'mPlayerRules');
                            this.baseLayout.deleteObjectProperty(mPlayerRules, 'NoBuildCost');
                            this.baseLayout.deleteObjectProperty(mPlayerRules, 'FlightMode');
                            this.baseLayout.deleteObjectProperty(mPlayerRules, 'GodMode');
                    }

                }

                if($('#inputNoUnlockCost').is(':checked') === true)
                {
                    this.baseLayout.setObjectProperty(gameRules, 'mNoUnlockCost', (($('#inputNoUnlockCost').is(':checked') === true) ? 1 : 0), 'Bool');
                }
                else
                {
                    this.baseLayout.deleteObjectProperty(gameRules, 'mNoUnlockCost');
                }

                if($('#inputUnlockInstantAltRecipes').is(':checked') === true)
                {
                    this.baseLayout.setObjectProperty(gameRules, 'mUnlockInstantAltRecipes', (($('#inputUnlockInstantAltRecipes').is(':checked') === true) ? 1 : 0), 'Bool');
                }
                else
                {
                    this.baseLayout.deleteObjectProperty(gameRules, 'mUnlockInstantAltRecipes');
                }

                if($('#inputDisableArachnidCreatures').is(':checked') === true)
                {
                    this.baseLayout.setObjectProperty(gameRules, 'mDisableArachnidCreatures', (($('#inputDisableArachnidCreatures').is(':checked') === true) ? 1 : 0), 'Bool');
                }
                else
                {
                    this.baseLayout.deleteObjectProperty(gameRules, 'mDisableArachnidCreatures');
                }

                for(let pathName in this.baseLayout.players)
                {
                    let mPlayerRules    = this.baseLayout.getObjectProperty(this.baseLayout.players[pathName].player, 'mPlayerRules');

                        if($('#playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatNoCost').is(':checked') === true)
                        {
                            this.baseLayout.setObjectProperty(mPlayerRules, 'NoBuildCost', (($('#playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatNoCost').is(':checked') === true) ? 1 : 0), 'Bool');
                        }
                        else
                        {
                            this.baseLayout.deleteObjectProperty(mPlayerRules, 'NoBuildCost');
                        }

                        if($('#playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatFlightMode').is(':checked') === true)
                        {
                            this.baseLayout.setObjectProperty(mPlayerRules, 'FlightMode', (($('#playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatFlightMode').is(':checked') === true) ? 1 : 0), 'Bool');
                        }
                        else
                        {
                            this.baseLayout.deleteObjectProperty(mPlayerRules, 'FlightMode');
                        }

                        if($('#playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatGodMode').is(':checked') === true)
                        {
                            this.baseLayout.setObjectProperty(mPlayerRules, 'GodMode', (($('#playerGameRules-' + pathName.replace('Persistent_Level:PersistentLevel.', '') + '-inputCheatGodMode').is(':checked') === true) ? 1 : 0), 'Bool');
                        }
                        else
                        {
                            this.baseLayout.deleteObjectProperty(mPlayerRules, 'GodMode');
                        }
                }
            }
        });
    }
}