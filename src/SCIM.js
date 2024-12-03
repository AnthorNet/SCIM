import BaseLayout                               from './BaseLayout.js';
import GameMap                                  from './GameMap.js';
import SaveParser                               from './SaveParser.js';
import Translate                                from './Translate.js';

import BaseLayout_Modal                         from './BaseLayout/Modal.js';
import Lib_LeafletPlugins                       from './Lib/LeafletPlugins.js';
import saveAs                                   from './Lib/FileSaver.js';

export default class SCIM
{
    constructor()
    {
        this.build                      = 'Stable';
        this.buildVersion               = null;
        this.debug                      = false;
        this.language                   = 'en';

        this.outlineClass               = 'btn-outline-warning focus';

        this.staticAssetsUrl            = "https://static.satisfactory-calculator.com";
        this.mapDataUrl                 = "https://satisfactory-calculator.com/" + this.language + "/interactive-map/index/json";
        this.gameDataUrl                = "https://satisfactory-calculator.com/" + this.language + "/api/game";
        this.modsDataUrl                = "https://satisfactory-calculator.com/" + this.language + "/mods/index/json";
        this.translationDataUrl         = "https://satisfactory-calculator.com/" + this.language + "/api/map/translation";
        this.statisticsUrl              = "https://satisfactory-calculator.com/" + this.language + "/api/statistics";
        this.tetrominoUrl               = "https://satisfactory-calculator.com/" + this.language + "/api/tetromino";
        this.usersUrl                   = "https://satisfactory-calculator.com/" + this.language + "/api/users";

        this.saveParserReadWorker       = '/js/InteractiveMap/build/Worker/SaveParser/Read.js';
        this.saveParserWriteWorker      = '/js/InteractiveMap/build/Worker/SaveParser/Write.js';

        this.collectedOpacity           = 0.3;

        // Updater notice
        this.scriptsVERSION             = Math.floor(Math.random() * Math.floor(999));
        this.urlScriptsVERSION          = null;
        this.intervalScriptsVERSION     = null;

        // Hold...
        this.map                        = null;
        this.baseLayout                 = null;
        this.translate                  = null;
    }

    start(remoteUrl = null)
    {
        if(this.urlScriptsVERSION !== null)
        {
            this.intervalScriptsVERSION = setInterval(() => { this.checkVersion() }, 300 * 1000);
        }

        // Handle pt_BR locales
        this.language = this.language.split('_')[0];

        this.translate = new Translate({
            build               : this.build,
            version             : this.scriptsVERSION,

            dataUrl             : this.translationDataUrl,

            language            : this.language,
            startCallback       : () => {
                this.map = new GameMap({
                    build               : this.build,
                    buildVersion        : parseInt(this.buildVersion),
                    version             : this.scriptsVERSION,

                    collectedOpacity    : this.collectedOpacity,

                    staticUrl           : this.staticAssetsUrl,
                    dataUrl             : this.mapDataUrl,

                    language            : this.language,
                    remoteUrl           : remoteUrl
                });

                if(window.File && window.FileReader && window.FileList && window.Blob)
                {
                    $('#dropSaveGame').on('drag dragstart dragend dragover dragenter dragleave drop', function(e){e.preventDefault();e.stopPropagation();})
                                      .on('dragover dragenter', function(){$('#dropSaveGame').addClass('is-dragover');})
                                      .on('dragleave dragend drop', function(){$('#dropSaveGame').removeClass('is-dragover');})
                                      .on('drop', (e) => { this.processSaveGameFile(e.originalEvent.dataTransfer.files[0]); });
                    $('#saveGameFileInput').on('change', (e) => {
                        let currentFile = $(e.currentTarget).prop('files')[0];
                            $(e.currentTarget).val('');

                        this.processSaveGameFile(currentFile);
                    });
                }
                else
                {
                    $('#dropSaveGame').remove();
                }
            }
        });
    }

    processSaveGameFile(droppedFile)
    {
        if(droppedFile !== undefined)
        {
            if(droppedFile.name.toLowerCase().endsWith('.sav'))
            {
                this.showLoader();

                let reader = new FileReader();
                    reader.readAsArrayBuffer(droppedFile);
                    reader.onload = () => {
                        this.drawNewBaseLayout({
                            droppedFileResult       : reader.result,
                            droppedFileName         : droppedFile.name
                        });
                        delete reader.result;
                    };
            }
            else
            {
                alert('File should be name XXX.sav');
            }
        }
        else
        {
            alert('Something went wrong reading your save file!');
        }
    }

    drawNewBaseLayout(options)
    {
        $('#resetPreviousCollected').hide();

        if(this.baseLayout !== null)
        {
            this.baseLayout.reset();
        }

        window.requestAnimationFrame(() => {
            options.build               = this.build;
            options.debug               = this.debug;
            options.version             = this.scriptsVERSION;

            options.staticUrl           = this.staticAssetsUrl;
            options.dataUrl             = this.gameDataUrl;
            options.modsUrl             = this.modsDataUrl;
            options.statisticsUrl       = this.statisticsUrl;
            options.tetrominoUrl        = this.tetrominoUrl;
            options.usersUrl            = this.usersUrl;

            options.language            = this.language;
            options.translate           = this.translate;

            options.satisfactoryMap     = this.map;
            options.saveGameParser      = new SaveParser({
                arrayBuffer                 : options.droppedFileResult,
                fileName                    : options.droppedFileName,
                language                    : this.language,
                translate                   : this.translate,

                saveParserReadWorker        : this.saveParserReadWorker,
                saveParserWriteWorker       : this.saveParserWriteWorker
            });

            this.baseLayout = new BaseLayout(options);
            this.baseLayout.draw();
        });
    }



    showLoader()
    {
        let tips = [
                'You can right click on any foundations and spawn a geometric form around it!',
                'You can right click on any buildings and delete them!',
                'You can right click on any storage container and edit their inventory!',
                'You can right click on a building to update its color!',
                'You can change the color gun slots in the map options...',
            ];

        $('.loader .tips').show();
        $('.loader .tips .speech-bubble em').html(tips[Math.floor(Math.random() * tips.length)]);
        $('.loader h6').html('Loading...');
        $('#dropSaveGame').hide();
        $('#downloadSaveGameModalButton').hide();
        $('#saveGameLoader').show();
        $('.loader').show();
    }

    hideLoader()
    {
        $('.loader').hide();
        $('#saveGameLoader').hide();
        $('#loaderProgressBar').hide();

        if(this.baseLayout !== null)
        {
            $('#downloadSaveGameModalButton').show();
            $('#dropSaveGame small').remove();
        }

        $('#dropSaveGame').show();
    }


    checkVersion(currentVersion)
    {
        let alertMessage = "Good news, a new version of the interactive map was released! Please refresh your page / browser cache to make sure you'll get the latest fixes and features.";
            if(currentVersion !== undefined && currentVersion !== null)
            {
                if(currentVersion > this.scriptsVERSION)
                {
                    BaseLayout_Modal.alert(alertMessage);
                    return false;
                }
            }
            else
            {
                if(this.urlScriptsVERSION !== null)
                {
                    $.get(this.urlScriptsVERSION, (data) => {
                        if(data > this.scriptsVERSION)
                        {
                            BaseLayout_Modal.alert(alertMessage);
                            clearInterval(this.intervalScriptsVERSION);
                            return false;
                        }
                    });
                }
            }

        return true;
    };

    /**
     * Export the current viewport as a png.  If there is a save game loaded, this png will have the same name as the save game file.
     * If not, it will be named `export.png`
     * @async
     * @returns {void}
     */
    exportImage() {
        // no map?
        if (!this.map) {
            return null;
        }
        let imageName = 'export.png';
        if (this.baseLayout && this.baseLayout.saveGameParser) {
            imageName = this.baseLayout.saveGameParser.fileName.replace(/\.sav$/g, '.png');
        }

        this.map.leafletMap.renderToCanvas((err, canvas) => {
            if (err) {
                return console.error(err);
            }

            if (canvas.toBlob) {
                return canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('Failed to render to canvas for some reason...');
                    } else {
                        saveAs(blob, imageName);
                    }
                });
            } else {
                const dataURL = canvas.toDataURL();
                if (!dataURL) {
                    console.error('Could not get data url from canvas!');
                }

                const BASE64_MARKER = ';base64,';
                let blob;
                if (dataURL.indexOf(BASE64_MARKER) == -1) {
                    const parts = dataURL.split(',');
                    const contentType = parts[0].split(':')[1];
                    const raw = decodeURIComponent(parts[1]);

                    blob = new Blob([raw], {type: contentType});
                } else {
                    const parts = dataURL.split(BASE64_MARKER);
                    const contentType = parts[0].split(':')[1];
                    const raw = window.atob(parts[1]);
                    const rawLength = raw.length;

                    const uInt8Array = new Uint8Array(rawLength);

                    for (let i = 0; i < rawLength; ++i) {
                        uInt8Array[i] = raw.charCodeAt(i);
                    }

                    blob = new Blob([uInt8Array], {type: contentType});
                }

                saveAs(blob, imageName);
            }
        });
    }
}
window.SCIM = new SCIM();