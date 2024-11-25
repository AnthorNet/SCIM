import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

export default class Modal_Object_Pattern
{
    static getHTML(marker)
    {
        let baseLayout              = marker.baseLayout;
        let currentObject           = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData            = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let currentPattern          = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject, 'PatternDesc');

        let availablePatterns       = [];
            availablePatterns.push({
                dataContent : '<img src="' + baseLayout.staticUrl + '/img/patternIcons/IconDesc_PatternRemover_256.png" style="width: 64px;height: 64px;" class="my-2 mr-1" /> No pattern',
                value       : 'NULL',
                text        : 'No pattern'
            });
            if(baseLayout.detailedModels !== null)
            {
                for(let patternPathname in baseLayout.detailedModels)
                {
                    if(baseLayout.detailedModels[patternPathname] !== undefined && baseLayout.detailedModels[patternPathname].patternImage !== undefined)
                    {
                        availablePatterns.push({
                            group       : baseLayout.detailedModels[patternPathname].patternGroup,
                            dataContent : '<img src="' + baseLayout.detailedModels[patternPathname].patternImage + '" style="width: 64px;height: 64px;" class="my-2 mr-1" /> ' + baseLayout.detailedModels[patternPathname].patternGroup + ' - ' + baseLayout.detailedModels[patternPathname].patternName,
                            value       : patternPathname,
                            text        : baseLayout.detailedModels[patternPathname].patternGroup + ' - ' + baseLayout.detailedModels[patternPathname].patternName
                        })
                    }
                }
            }


        BaseLayout_Modal.form({
            title       : 'Update "<strong>' + buildingData.name + '</strong>" pattern',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'PatternDesc',
                inputHeight     : true,
                inputType       : 'selectPicker',
                inputOptions    : availablePatterns,
                value           : ((currentPattern !== null) ? currentPattern.value.pathName : '')
            }],
            callback    : function(values)
            {
                if(currentObject.customizationData !== undefined)
                {
                    if(values.PatternDesc !== 'NULL')
                    {
                        currentObject.customizationData.PatternDesc.pathName = values.PatternDesc;
                    }
                    else
                    {
                        currentObject.customizationData.PatternDesc.pathName = '';
                    }
                }
                else
                {
                    let mCustomizationData      = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject);
                        if(mCustomizationData !== null)
                        {
                            // Delete
                            for(let i = (mCustomizationData.values.length - 1); i >= 0; i--)
                            {
                                if(mCustomizationData.values[i].name === 'PatternDesc')
                                {
                                    mCustomizationData.values.splice(i, 1);
                                }
                            }

                            // Push
                            if(values.PatternDesc !== 'NULL')
                            {
                                mCustomizationData.values.push({name: 'PatternDesc', type: 'Object', value: {levelName: '', pathName: values.PatternDesc}});
                            }
                        }
                }

                // Redraw!
                new Promise(function(resolve){
                    return baseLayout.parseObject(currentObject, resolve);
                }).then(function(result){
                    baseLayout.deleteMarkerFromElements(result.layer, marker.relatedTarget);
                    baseLayout.addElementToLayer(result.layer, result.marker);
                });
            }
        });
    }
}