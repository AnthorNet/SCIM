import SubSystem                                from '../SubSystem.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

import Building_Pipeline                        from '../Building/Pipeline.js';

export default class SubSystem_Buildable extends SubSystem
{
    static get totalColorSlots(){ return 18; }
    static get extraColorSlots(){ return 9; }

    static get primaryColors(){ return [
        {r: 0.9529410004615784,     g: 0.3019610047340393,      b: 0.06666699796915054,     a: 1}, // Default (0)

        {r: 0,                      g: 0.1441279947757721,      b: 0.3864299952983856,      a: 1}, // Swatch 1
        {r: 0.015995999798178673,   g: 0.01680699922144413,     b: 0.01850000023841858,     a: 1}, // Swatch 2
        {r: 0.3094690144062042,     g: 0.30498701333999634,     b: 0.2917709946632385,      a: 1}, // Swatch 3
        {r: 0.0262410007417202,     g: 0.4507859945297241,      b: 0.6038280129432678,      a: 1}, // Swatch 4
        {r: 0.07421399652957916,    g: 0.08649999648332596,     b: 0.03310500085353851,     a: 1}, // Swatch 5

        {r: 0.9646869897842407,     g: 0.9215819835662842,      b: 0.7681509852409363,      a: 1}, // Swatch 6
        {r: 0.23455099761486053,    g: 0.13286800682544708,     b: 0.4564110040664673,      a: 1}, // Swatch 7
        {r: 0.9473069906234741,     g: 0.7379109859466553,      b: 0,                       a: 1}, // Swatch 8
        {r: 0.18782100081443787,    g: 0.006994999945163727,    b: 0.006994999945163727,    a: 1}, // Swatch 9
        {r: 1,                      g: 0.46207699179649353,     b: 0.6866850256919861,      a: 1}, // Swatch 10

        {r: 0.8069519996643066,     g: 0.4396570026874542,      b: 0.05126899853348732,     a: 1}, // Swatch 11
        {r: 0.7304610013961792,     g: 0.4341540038585663,      b: 0.16826899349689484,     a: 1}, // Swatch 12
        {r: 0.1980690062046051,     g: 0.07035999745130539,     b: 0.015208999626338482,    a: 1}, // Swatch 13
        {r: 0.7379099726676941,     g: 1,                       b: 0.2158609926700592,      a: 1}, // Swatch 14
        {r: 0.11443500220775604,    g: 0.13286800682544708,     b: 0.26225098967552185,     a: 1}, // Swatch 15

        // Hidden slots
        {r: 0.10980399698019028,    g: 0.10980399698019028,     b: 0.10980399698019028,     a: 1}, // Foundations (16)
        {r: 0.9529410004615784,     g: 0.3019610047340393,      b: 0.06666699796915054,     a: 1}, // Pipes (17)
        {r: 1,                      g: 1,                       b: 1,                       a: 1}, // Concrete (18)

        // Finishes
        {r: 0.3450980392156863,     g: 0.3686274509803922,      b: 0.3686274509803922,      a: 1}, // Carbon Steel (19)
        {r: 1,                      g : 0.8431372549019608,     b: 0,                       a: 1}, // Caterium (20)
        {r: 0.8470588235294118,     g: 0.8588235294117647,      b: 0.8705882352941176,      a: 1}, // Chrome (21)
        {r: 0.7215686274509804,     g: 0.4509803921568627,      b: 0.2,                     a: 1}, // Copper (22)
        {r: 0.9529410004615784,     g: 0.3019610047340393,      b: 0.06666699796915054,     a: 1}, // Unpainted (23)

        // New swatches
        {r: 0.3515329957008362,     g: 0.06124600023031235,     b: 0.023152999579906464,    a: 1}, // Swatch 16 (24)
        {r: 0.13013599812984467,    g: 0.2307399958372116,      b: 0.3864299952983856,      a: 1}, // Swatch 17 (25)
        {r: 0.03189599886536598,    g: 0.44520100951194763,     b: 0.5149180293083191,      a: 1}, // Swatch 18 (26)

        {r: 0.9529410004615784,     g: 0.3019610047340393,      b: 0.06666699796915054,     a: 1}  // Project Assembly (27)
    ]; }

    static get secondaryColors(){ return [
        {r: 0.11372499912977219,    g: 0.1333329975605011,      b: 0.2627449929714203,      a: 1}, // Default (0)

        {r: 0.9046609997749329,     g: 0.4564110040664673,      b: 0.015995999798178673,    a: 1}, // Swatch 1
        {r: 0.4969330132007599,     g: 0,                       b: 0,                       a: 1}, // Swatch 2
        {r: 0.09084200114011765,    g: 0.10702300071716309,     b: 0.07035999745130539,     a: 1}, // Swatch 3
        {r: 0.5906190276145935,     g: 0.040915001183748245,    b: 0.6795430183410645,      a: 1}, // Swatch 4
        {r: 0.1412629932165146,     g: 0.12213899940252304,     b: 0.11443500220775604,     a: 1}, // Swatch 5

        {r: 0.9559739828109741,     g: 0.30054399371147156,     b: 0.06662599742412567,     a: 1}, // Swatch 6
        {r: 0.13563300669193268,    g: 0.38132598996162415,     b: 0.07421399652957916,     a: 1}, // Swatch 7
        {r: 0.03310500085353851,    g: 0.40724000334739685,     b: 0.3324519991874695,      a: 1}, // Swatch 8
        {r: 0.9046609997749329,     g: 0.4564110040664673,      b: 0.015995999798178673,    a: 1}, // Swatch 9
        {r: 0.9215819835662842,     g: 0.04373500123620033,     b: 0.37123799324035645,     a: 1}, // Swatch 10

        {r: 0.057805001735687256,   g: 0.09758699685335159,     b: 0.10224200040102005,     a: 1}, // Swatch 11
        {r: 0.2195259928703308,     g: 0.11443500220775604,     b: 0.04518600180745125,     a: 1}, // Swatch 12
        {r: 0.5647119879722595,     g: 0.2663559913635254,      b: 0.05448000133037567,     a: 1}, // Swatch 13
        {r: 0.36625298857688904,    g: 0.13013599812984467,     b: 0.0466650016605854,      a: 1}, // Swatch 14
        {r: 0.9559730291366577,     g: 0.30054399371147156,     b: 0.06662599742412567,     a: 1}, // Swatch 15

        // Hidden slots
        {r: 0.10980399698019028,    g: 0.10980399698019028,     b: 0.10980399698019028,     a: 1}, // Foundations (16)
        {r: 0.9529410004615784,     g: 0.3019610047340393,      b: 0.06666699796915054,     a: 1}, // Pipes (17)
        {r: 0.9529410004615784,     g: 0.3019610047340393,      b: 0.06666699796915054,     a: 1}, // Concrete (18)

        // Finishes
        {r: 0.3450980392156863,     g: 0.3686274509803922,      b: 0.3686274509803922,      a: 1}, // Carbon Steel (19)
        {r: 1,                      g : 0.8431372549019608,     b: 0,                       a: 1}, // Caterium (20)
        {r: 0.8470588235294118,     g: 0.8588235294117647,      b: 0.8705882352941176,      a: 1}, // Chrome (21)
        {r: 0.7215686274509804,     g: 0.4509803921568627,      b: 0.2,                     a: 1}, // Copper (22)
        {r: 0.11372499912977219,    g: 0.1333329975605011,      b: 0.2627449929714203,      a: 1}, // Unpainted (23)

        // New swatches
        {r: 0.665386974811554,      g: 0.42326799035072327,     b: 0.11443500220775604,     a: 1}, // Swatch 16 (24)
        {r: 0.2917709946632385,     g: 0.5088809728622437,      b: 0.42326799035072327,     a: 1}, // Swatch 17 (25)
        {r: 0.22352942824363708,    g: 0.22352942824363708,     b: 0.22352942824363708,     a: 1}, // Swatch 18 (26)

        {r: 0.11372499912977219,    g: 0.1333329975605011,      b: 0.2627449929714203,      a: 1}  // Project Assembly (27)
    ]; }

    constructor(options)
    {
        options.pathName        = [
            'Persistent_Level:PersistentLevel.BuildableSubsystem',
            'Persistent_Level:PersistentLevel.buildableSubsystem'
        ];

        super(options);
    }

    getObjectCustomizationData(currentObject, property = null)
    {
        if(currentObject.customizationData !== undefined)
        {
            if(property === null)
            {
                console.log('FIX getObjectCustomizationData');
                return null;
            }

            if(currentObject.customizationData[property] !== undefined && currentObject.customizationData[property].pathName !== '')
            {
                return {value: currentObject.customizationData[property]};
            }

            return null;
        }

        let mCustomizationData = this.baseLayout.getObjectProperty(currentObject, 'mCustomizationData');
            if(mCustomizationData !== null)
            {
                if(property === null)
                {
                    return mCustomizationData;
                }

                for(let i = 0; i < mCustomizationData.values.length; i++)
                {
                    if(mCustomizationData.values[i].name === property)
                    {
                        return mCustomizationData.values[i];
                    }
                }
            }

        return null;
    }

    getObjectColorSlot(currentObject)
    {
        let SwatchDesc  = this.getObjectCustomizationData(currentObject, 'SwatchDesc');
            if(SwatchDesc !== null)
            {
                let currentSwatchDesc = SwatchDesc.value.pathName;
                    if(currentSwatchDesc === '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Unpainted.PaintFinishDesc_Unpainted_C')
                    {
                        return 0;
                    }

                    switch(currentSwatchDesc)
                    {
                        // Hidden slots...
                        case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_FoundationOverride.SwatchDesc_FoundationOverride_C':
                            return 16;
                        case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Concrete.SwatchDesc_Concrete_C':
                            return 18;

                        // Finishes
                        case '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_CarbonSteel.PaintFinishDesc_CarbonSteel_C':
                            return 19;
                        case '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Caterium.PaintFinishDesc_Caterium_C':
                            return 20;
                        case '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Chrome.PaintFinishDesc_Chrome_C':
                            return 21;
                        case '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Copper.PaintFinishDesc_Copper_C':
                            return 22;

                        // Redirected swatches
                        case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot18.SwatchDesc_Slot18_C':
                            return 24;
                        case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot19.SwatchDesc_Slot19_C':
                            return 25;
                        case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot20.SwatchDesc_Slot20_C':
                            return 26;

                        // Project Assembly
                        case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_ProjectAssembly.SwatchDesc_ProjectAssembly_C':
                            return 27;

                        case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Custom.SwatchDesc_Custom_C':
                            return 255;

                        default:
                            let slot = currentSwatchDesc.split('.');
                                slot = parseInt(slot[0].replace('/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot', ''));

                                if(isNaN(slot))
                                {
                                    console.log('getObjectColorSlot', currentSwatchDesc);
                                    return 0;
                                }

                                return slot;
                    }
            }

        if(Building_Pipeline.isPipeline(currentObject))
        {
            return 17;
        }

        let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
            if(buildingData !== null && buildingData.category === 'foundation')
            {
                return 16;
            }

        return 0;
    }


    setObjectDefaultColorSlot(currentObject)
    {
        let slotIndex = 0;
            if(currentObject.className.includes('Foundation'))
            {
                slotIndex = 16;
            }
            if(currentObject.className.includes('_Concrete_'))
            {
                slotIndex = 18;
            }
            if(currentObject.className.includes('_ConcretePolished_'))
            {
                slotIndex = 18;
            }
            if(currentObject.className.includes('_Asphalt_'))
            {
                slotIndex = 18;
            }

        return this.setObjectColorSlot(currentObject, slotIndex)
    }


    setObjectColorSlot(currentObject, slotIndex)
    {
        if(currentObject.customizationData !== undefined)
        {
            currentObject.customizationData.PrimaryColor    = {r: 0, g: 0, b: 0, a: 1 };
            currentObject.customizationData.SecondaryColor  = {r: 0, g: 0, b: 0, a: 1 };

            switch(parseInt(slotIndex))
            {
                case 255:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Custom.SwatchDesc_Custom_C';
                    break;

                case 18:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Concrete.SwatchDesc_Concrete_C';
                    break;

                // Finishes
                case 19:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_CarbonSteel.PaintFinishDesc_CarbonSteel_C';
                    break;
                case 20:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Caterium.PaintFinishDesc_Caterium_C';
                    break;
                case 21:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Chrome.PaintFinishDesc_Chrome_C';
                    break;
                case 22:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Copper.PaintFinishDesc_Copper_C';
                    break;

                // Redirected swatches
                case 24:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot18.SwatchDesc_Slot18_C';
                    break;
                case 25:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot19.SwatchDesc_Slot19_C';
                    break;
                case 26:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot20.SwatchDesc_Slot20_C';
                    break;

                // Project Assembly
                case 27:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_ProjectAssembly.SwatchDesc_ProjectAssembly_C';
                    break;


                default:
                    currentObject.customizationData.SwatchDesc.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot' + slotIndex + '.SwatchDesc_Slot' + slotIndex + '_C';
            }

            if(slotIndex === 255)
            {
                let customColor = this.getPlayerCustomColor();
                    this.setObjectCustomColor(currentObject, customColor.primaryColor, customColor.secondaryColor);
            }
        }
        else
        {
            let mCustomizationData = this.getObjectCustomizationData(currentObject);
                if(mCustomizationData === null)
                {
                    currentObject.properties.push({
                        name    : 'mCustomizationData',
                        type    : 'Struct',
                        value   : {
                            type    : 'FactoryCustomizationData',
                            values  : [{
                                name    : 'SwatchDesc',
                                type    : 'Object',
                                value   : {levelName : '', pathName: '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot0.SwatchDesc_Slot0_C'}
                            }]
                        }
                    });
                    mCustomizationData = this.getObjectCustomizationData(currentObject);
                }

                if(mCustomizationData !== null)
                {
                    for(let i = (mCustomizationData.values.length - 1); i >= 0; i--)
                    {
                        if(mCustomizationData.values[i].name === 'SwatchDesc')
                        {
                            switch(parseInt(slotIndex))
                            {
                                case 255:
                                    mCustomizationData.values[i].value.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Custom.SwatchDesc_Custom_C';
                                    break;
                                case 18:
                                    mCustomizationData.values[i].value.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Concrete.SwatchDesc_Concrete_C';
                                    break;
                                default:
                                    mCustomizationData.values[i].value.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot' + slotIndex + '.SwatchDesc_Slot' + slotIndex + '_C';
                            }
                        }

                        if(mCustomizationData.values[i].name === 'OverrideColorData')
                        {
                            mCustomizationData.values.splice(i, 1);
                        }
                    }

                    if(slotIndex === 255)
                    {
                        let customColor = this.getPlayerCustomColor();
                            this.setObjectCustomColor(currentObject, customColor.primaryColor, customColor.secondaryColor);
                    }
                }
        }
    }

    setObjectCustomColor(currentObject, primaryColor, secondaryColor)
    {
        primaryColor        = JSON.parse(JSON.stringify(primaryColor));
        secondaryColor      = JSON.parse(JSON.stringify(secondaryColor));

        if(currentObject.customizationData !== undefined)
        {
            currentObject.customizationData.PrimaryColor    = {
                r: BaseLayout_Math.RGBToLinearColor(primaryColor.r),
                g: BaseLayout_Math.RGBToLinearColor(primaryColor.g),
                b: BaseLayout_Math.RGBToLinearColor(primaryColor.b),
                a: 1
            };
            currentObject.customizationData.SecondaryColor  = {
                r: BaseLayout_Math.RGBToLinearColor(secondaryColor.r),
                g: BaseLayout_Math.RGBToLinearColor(secondaryColor.g),
                b: BaseLayout_Math.RGBToLinearColor(secondaryColor.b),
                a: 1
            };
        }
        else
        {
            let mCustomizationData  = this.getObjectCustomizationData(currentObject);
                if(mCustomizationData !== null)
                {
                    for(let i = (mCustomizationData.values.length - 1); i >= 0; i--)
                    {
                        if(mCustomizationData.values[i].name === 'OverrideColorData')
                        {
                            mCustomizationData.values.splice(i, 1);
                        }
                    }

                    mCustomizationData.values.push( {
                        name    : 'OverrideColorData',
                        type    : 'Struct',
                        value   : {
                            type    : 'FactoryCustomizationColorSlot',
                            values  : [
                                {
                                    name    : 'PrimaryColor', type: 'Struct',
                                    value   : {
                                        type    : 'LinearColor',
                                        values  : {
                                            r       : BaseLayout_Math.RGBToLinearColor(primaryColor.r),
                                            g       : BaseLayout_Math.RGBToLinearColor(primaryColor.g),
                                            b       : BaseLayout_Math.RGBToLinearColor(primaryColor.b),
                                            a       : 1
                                        }
                                    }
                                },
                                {
                                    name    : 'SecondaryColor', type: 'Struct',
                                    value   : {
                                        type    : 'LinearColor',
                                        values  : {
                                            r       : BaseLayout_Math.RGBToLinearColor(secondaryColor.r),
                                            g       : BaseLayout_Math.RGBToLinearColor(secondaryColor.g),
                                            b       : BaseLayout_Math.RGBToLinearColor(secondaryColor.b),
                                            a       : 1
                                        }
                                    }
                                }
                            ]
                        }
                    });
                }
        }
    }



    getObjectPrimaryColor(currentObject)
    {
        let colorSlot           = this.getObjectColorSlot(currentObject);
            if(colorSlot === 255)
            {
                let PrimaryColorCustomizationData = this.getObjectCustomizationData(currentObject, 'PrimaryColor');
                    if(PrimaryColorCustomizationData !== null)
                    {
                        let PrimaryColor        = PrimaryColorCustomizationData.value;
                        let PrimaryColorKey     = PrimaryColor.r + '-' + PrimaryColor.g + '-' + PrimaryColor.b + '-' + PrimaryColor.a;
                            if(this.playerCustomColors === undefined)
                            {
                                this.playerCustomColors = {};
                            }
                            if(this.playerCustomColors[PrimaryColorKey] === undefined)
                            {
                                this.playerCustomColors[PrimaryColorKey] = {
                                    r : BaseLayout_Math.linearColorToRGB(PrimaryColor.r),
                                    g : BaseLayout_Math.linearColorToRGB(PrimaryColor.g),
                                    b : BaseLayout_Math.linearColorToRGB(PrimaryColor.b),
                                    a : BaseLayout_Math.linearColorToRGB(PrimaryColor.a)
                                };
                            }

                        return this.playerCustomColors[PrimaryColorKey];
                    }

                let OverrideColorData = this.getObjectCustomizationData(currentObject, 'OverrideColorData');
                    if(OverrideColorData !== null)
                    {
                        for(let j = 0; j < OverrideColorData.value.values.length; j++)
                        {
                            if(OverrideColorData.value.values[j].name === 'PrimaryColor')
                            {
                                let PrimaryColor    = OverrideColorData.value.values[j].value.values;
                                let PrimaryColorKey = PrimaryColor.r + '-' + PrimaryColor.g + '-' + PrimaryColor.b + '-' + PrimaryColor.a;
                                    if(this.playerCustomColors === undefined)
                                    {
                                        this.playerCustomColors = {};
                                    }
                                    if(this.playerCustomColors[PrimaryColorKey] === undefined)
                                    {
                                        this.playerCustomColors[PrimaryColorKey] = {
                                            r : BaseLayout_Math.linearColorToRGB(PrimaryColor.r),
                                            g : BaseLayout_Math.linearColorToRGB(PrimaryColor.g),
                                            b : BaseLayout_Math.linearColorToRGB(PrimaryColor.b),
                                            a : BaseLayout_Math.linearColorToRGB(PrimaryColor.a)
                                        };
                                    }

                                return this.playerCustomColors[PrimaryColorKey];
                            }
                        }
                    }

                let customColor = this.getPlayerCustomColor();
                    return customColor.primaryColor;
            }

            if(colorSlot >= 19 && colorSlot <= 22) // Paint finishes
            {
                return this.getDefaultPrimaryColorSlot(colorSlot);
            }

        let playerColorSlots    = this.getPlayerColorSlots();
            if(playerColorSlots[colorSlot] === undefined)
            {
                console.log('getObjectPrimaryColor', colorSlot, currentObject);
                return playerColorSlots[0].primaryColor;
            }

        return playerColorSlots[colorSlot].primaryColor;
    }

    getObjectSecondaryColor(currentObject)
    {
        let colorSlot           = this.getObjectColorSlot(currentObject);
            if(colorSlot === 255)
            {
                let SecondaryColorCustomizationData = this.getObjectCustomizationData(currentObject, 'SecondaryColor');
                    if(SecondaryColorCustomizationData !== null)
                    {
                        let SecondaryColor      = SecondaryColorCustomizationData.value;
                        let SecondaryColorKey   = SecondaryColor.r + '-' + SecondaryColor.g + '-' + SecondaryColor.b + '-' + SecondaryColor.a;
                            if(this.playerCustomColors === undefined)
                            {
                                this.playerCustomColors = {};
                            }
                            if(this.playerCustomColors[SecondaryColorKey] === undefined)
                            {
                                this.playerCustomColors[SecondaryColorKey] = {
                                    r : BaseLayout_Math.linearColorToRGB(SecondaryColor.r),
                                    g : BaseLayout_Math.linearColorToRGB(SecondaryColor.g),
                                    b : BaseLayout_Math.linearColorToRGB(SecondaryColor.b),
                                    a : BaseLayout_Math.linearColorToRGB(SecondaryColor.a)
                                };
                            }

                        return this.playerCustomColors[SecondaryColorKey];
                    }

                let OverrideColorData = this.getObjectCustomizationData(currentObject, 'OverrideColorData');
                    if(OverrideColorData !== null)
                    {
                        for(let j = 0; j < OverrideColorData.value.values.length; j++)
                        {
                            if(OverrideColorData.value.values[j].name === 'SecondaryColor')
                            {
                                let SecondaryColor      = OverrideColorData.value.values[j].value.values;
                                let SecondaryColorKey   = SecondaryColor.r + '-' + SecondaryColor.g + '-' + SecondaryColor.b + '-' + SecondaryColor.a;
                                    if(this.playerCustomColors === undefined)
                                    {
                                        this.playerCustomColors = {};
                                    }
                                    if(this.playerCustomColors[SecondaryColorKey] === undefined)
                                    {
                                        this.playerCustomColors[SecondaryColorKey] = {
                                            r : BaseLayout_Math.linearColorToRGB(SecondaryColor.r),
                                            g : BaseLayout_Math.linearColorToRGB(SecondaryColor.g),
                                            b : BaseLayout_Math.linearColorToRGB(SecondaryColor.b),
                                            a : BaseLayout_Math.linearColorToRGB(SecondaryColor.a)
                                        };
                                    }

                                return this.playerCustomColors[SecondaryColorKey];
                            }
                        }
                    }

                let customColor = this.getPlayerCustomColor();
                    return customColor.secondaryColor;
            }
            if(colorSlot >= 19 && colorSlot <= 22) // Paint finishes
            {
                return this.getDefaultPrimaryColorSlot(colorSlot);
            }

        let playerColorSlots    = this.getPlayerColorSlots();
            if(playerColorSlots[colorSlot] === undefined)
            {
                console.log('getObjectSecondaryColor', colorSlot, currentObject);
                return playerColorSlots[0].secondaryColor;
            }

        return playerColorSlots[colorSlot].secondaryColor;
    }

    getPlayerColorSlots()
    {
        if(this.playerColorSlots === undefined || this.playerColorSlots === null)
        {
            let totalColorSlot      = SubSystem_Buildable.totalColorSlots;
            let playerColors        = [];
            let primaryColorSlots   = this.getPrimaryColorSlots();
            let secondaryColorSlots = this.getSecondaryColorSlots();

            for(let slotIndex = 0; slotIndex <= (totalColorSlot + SubSystem_Buildable.extraColorSlots); slotIndex++)
            {
                if(primaryColorSlots[slotIndex] === undefined)
                {
                    primaryColorSlots[slotIndex] = JSON.parse(JSON.stringify(this.getDefaultPrimaryColorSlot(slotIndex, true)));
                }
                if(secondaryColorSlots[slotIndex] === undefined)
                {
                    secondaryColorSlots[slotIndex] = JSON.parse(JSON.stringify(this.getDefaultSecondaryColorSlot(slotIndex, true)));
                }

                playerColors.push({
                    primaryColor    : {
                        r : BaseLayout_Math.linearColorToRGB(primaryColorSlots[slotIndex].r),
                        g : BaseLayout_Math.linearColorToRGB(primaryColorSlots[slotIndex].g),
                        b : BaseLayout_Math.linearColorToRGB(primaryColorSlots[slotIndex].b),
                        a : BaseLayout_Math.linearColorToRGB(primaryColorSlots[slotIndex].a)
                    },
                    secondaryColor  : {
                        r: BaseLayout_Math.linearColorToRGB(secondaryColorSlots[slotIndex].r),
                        g: BaseLayout_Math.linearColorToRGB(secondaryColorSlots[slotIndex].g),
                        b: BaseLayout_Math.linearColorToRGB(secondaryColorSlots[slotIndex].b),
                        a: BaseLayout_Math.linearColorToRGB(secondaryColorSlots[slotIndex].a)
                    }
                });
            }

            this.playerColorSlots = playerColors;
        }

        return this.playerColorSlots;
    }

    getPlayerCustomColor(pathName = null)
    {
        let customColor = {};
            customColor.primaryColor    = {
                r : BaseLayout_Math.linearColorToRGB(0),
                g : BaseLayout_Math.linearColorToRGB(0),
                b : BaseLayout_Math.linearColorToRGB(0),
                a : BaseLayout_Math.linearColorToRGB(1)
            };
           customColor.secondaryColor  = {
                r : BaseLayout_Math.linearColorToRGB(0),
                g : BaseLayout_Math.linearColorToRGB(0),
                b : BaseLayout_Math.linearColorToRGB(0),
                a : BaseLayout_Math.linearColorToRGB(1)
            };

        for(let currentPathName in this.baseLayout.players)
        {
            let mCustomColorData  = this.baseLayout.getObjectProperty(this.baseLayout.players[currentPathName].player, 'mCustomColorData');
                if(mCustomColorData !== null)
                {
                    if(pathName === null || pathName === currentPathName)
                    {
                        for(let j = 0; j < mCustomColorData.values.length; j++)
                        {
                            if(mCustomColorData.values[j].name === 'PrimaryColor')
                            {
                               customColor.primaryColor    = {
                                    r : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.r),
                                    g : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.g),
                                    b : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.b),
                                    a : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.a)
                                };
                            }
                            if(mCustomColorData.values[j].name === 'SecondaryColor')
                            {
                               customColor.secondaryColor    = {
                                    r : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.r),
                                    g : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.g),
                                    b : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.b),
                                    a : BaseLayout_Math.linearColorToRGB(mCustomColorData.values[j].value.values.a)
                                };
                            }
                        }
                    }

                    if(pathName === null) // Return first player custom color
                    {
                        return customColor;
                    }
                }

        }

        return customColor;
    }

    setPlayerColorSlot(slotIndex, primaryColor, secondaryColor)
    {
        let mColorSlots_Data = this.baseLayout.getObjectProperty(this.subSystem, 'mColorSlots_Data');
            if(mColorSlots_Data !== null)
            {
                if(mColorSlots_Data.values[slotIndex] === undefined)
                {
                    mColorSlots_Data.values[slotIndex] = [
                        {
                            name    : 'PrimaryColor',
                            type    : 'Struct',
                            value   : {type: 'LinearColor', values: JSON.parse(JSON.stringify(this.getDefaultPrimaryColorSlot(slotIndex, true)))}
                        },
                        {
                            name    : 'SecondaryColor',
                            type    : 'Struct',
                            value   : {type: 'LinearColor', values : JSON.parse(JSON.stringify(this.getDefaultSecondaryColorSlot(slotIndex, true)))}
                        },
                        {name: 'Metallic', type: 'Float', value: 0},
                        {name: 'Roughness', type: 'Float', value: 0}
                    ];
                }

                for(let j = 0; j < mColorSlots_Data.values[slotIndex].length; j++)
                {
                    if(mColorSlots_Data.values[slotIndex][j].name === 'PrimaryColor')
                    {
                        mColorSlots_Data.values[slotIndex][j].value.values.r = primaryColor.r;
                        mColorSlots_Data.values[slotIndex][j].value.values.g = primaryColor.g;
                        mColorSlots_Data.values[slotIndex][j].value.values.b = primaryColor.b;
                    }
                    if(mColorSlots_Data.values[slotIndex][j].name === 'SecondaryColor')
                    {
                        mColorSlots_Data.values[slotIndex][j].value.values.r = secondaryColor.r;
                        mColorSlots_Data.values[slotIndex][j].value.values.g = secondaryColor.g;
                        mColorSlots_Data.values[slotIndex][j].value.values.b = secondaryColor.b;
                    }
                }
            }

        this.playerColorSlots = null;
    }



    getPrimaryColorSlots()
    {
        let mColorSlots_Data = this.baseLayout.getObjectProperty(this.subSystem, 'mColorSlots_Data');
            if(this.baseLayout.saveGameParser.header.buildVersion > 168000)
            {
                if(mColorSlots_Data === null && this.subSystem !== null)
                {
                    console.log('Creating missing mColorSlots_Data');

                    mColorSlots_Data = {
                        name                : 'mColorSlots_Data',
                        structureSubType    : 'FactoryCustomizationColorSlot',
                        type                : 'Array',
                        value               : {type: 'Struct', values: []}
                    };

                    for(let slotIndex = 0; slotIndex <= (SubSystem_Buildable.totalColorSlots + SubSystem_Buildable.extraColorSlots); slotIndex++)
                    {
                        let slotData = [
                            {
                                name    : 'PrimaryColor',
                                type    : 'Struct',
                                value   : {type: 'LinearColor', values: JSON.parse(JSON.stringify(this.getDefaultPrimaryColorSlot(slotIndex, true)))}
                            },
                            {
                                name    : 'SecondaryColor',
                                type    : 'Struct',
                                value   : {type: 'LinearColor', values : JSON.parse(JSON.stringify(this.getDefaultSecondaryColorSlot(slotIndex, true)))}
                            }
                        ];

                        if(this.baseLayout.saveGameParser.header.saveVersion >= 44)
                        {
                            let paintFinishPathName = '';
                                switch(slotIndex)
                                {
                                    case 19:
                                        paintFinishPathName = '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_CarbonSteel.PaintFinishDesc_CarbonSteel_C';
                                        slotData[0].value.values = {r: 0, g: 0, b: 0, a: 1};
                                        slotData[1].value.values = {r: 0, g: 0, b: 0, a: 1};
                                        break;
                                    case 20:
                                        paintFinishPathName = '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Caterium.PaintFinishDesc_Caterium_C';
                                        slotData[0].value.values = {r: 0, g: 0, b: 0, a: 1};
                                        slotData[1].value.values = {r: 0, g: 0, b: 0, a: 1};
                                        break;
                                    case 21:
                                        paintFinishPathName = '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Chrome.PaintFinishDesc_Chrome_C';
                                        slotData[0].value.values = {r: 0, g: 0, b: 0, a: 1};
                                        slotData[1].value.values = {r: 0, g: 0, b: 0, a: 1};
                                        break;
                                    case 22:
                                        paintFinishPathName = '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Copper.PaintFinishDesc_Copper_C';
                                        slotData[0].value.values = {r: 0, g: 0, b: 0, a: 1};
                                        slotData[1].value.values = {r: 0, g: 0, b: 0, a: 1};
                                        break;
                                    case 23:
                                        paintFinishPathName = '/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/Metals/PaintFinishDesc_Unpainted.PaintFinishDesc_Unpainted_C';
                                        slotData[0].value.values = {r: 0, g: 0, b: 0, a: 1};
                                        slotData[1].value.values = {r: 0, g: 0, b: 0, a: 1};
                                        break;
                                }

                                slotData.push({
                                    name    : 'PaintFinish',
                                    type    : 'Object',
                                    value   : { levelName: '', pathName: paintFinishPathName}
                                });
                        }
                        else
                        {
                            slotData.push({name: 'Metallic', type: 'Float', value: 0});
                            slotData.push({name: 'Roughness', type: 'Float', value: 0});
                        }

                        mColorSlots_Data.value.values.push(slotData);
                    }

                    this.subSystem.properties.push(mColorSlots_Data);
                    return this.getPrimaryColorSlots();
                }
            }

        if(mColorSlots_Data !== null)
        {
            let data = [];
                for(let i = 0; i < mColorSlots_Data.values.length; i++)
                {
                    for(let j = 0; j < mColorSlots_Data.values[i].length; j++)
                    {
                        if(mColorSlots_Data.values[i][j].name === 'PrimaryColor')
                        {
                            data.push(mColorSlots_Data.values[i][j].value.values);
                        }
                    }
                }
            return data;
        }

        return SubSystem_Buildable.primaryColors;
    }

    getDefaultPrimaryColorSlot(index, raw = false)
    {
        let defaultColors   = SubSystem_Buildable.primaryColors;
        let returnColor     = (defaultColors[index] !== undefined) ? defaultColors[index] : defaultColors[0];

            if(raw === true)
            {
                return returnColor;
            }

            return {
                r: BaseLayout_Math.linearColorToRGB(returnColor.r),
                g: BaseLayout_Math.linearColorToRGB(returnColor.g),
                b: BaseLayout_Math.linearColorToRGB(returnColor.b)
            };
    }

    getSecondaryColorSlots()
    {
        let mColorSlots_Data = this.baseLayout.getObjectProperty(this.subSystem, 'mColorSlots_Data');
            if(mColorSlots_Data !== null)
            {
                let data = [];
                    for(let i = 0; i < mColorSlots_Data.values.length; i++)
                    {
                        for(let j = 0; j < mColorSlots_Data.values[i].length; j++)
                        {
                            if(mColorSlots_Data.values[i][j].name === 'SecondaryColor')
                            {
                                data.push(mColorSlots_Data.values[i][j].value.values);
                            }
                        }
                    }
                return data;
            }

        return SubSystem_Buildable.secondaryColors;
    }

    getDefaultSecondaryColorSlot(index, raw = false)
    {
        let defaultColors   = SubSystem_Buildable.secondaryColors;
        let returnColor     = (defaultColors[index] !== undefined) ? defaultColors[index] : defaultColors[0];

            if(raw === true)
            {
                return returnColor;
            }

            return {
                r: BaseLayout_Math.linearColorToRGB(returnColor.r),
                g: BaseLayout_Math.linearColorToRGB(returnColor.g),
                b: BaseLayout_Math.linearColorToRGB(returnColor.b)
            };
    }



    switchObjectMaterial(marker, data)
    {
        let category    = data[0];
        let material    = data[1];

        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

        if(buildingData !== null && (buildingData.category === category || (category === 'foundation' && buildingData.category === 'frame') || (category === 'wall' && buildingData.category === 'frame') ) && buildingData.switchMaterial !== undefined && buildingData.switchMaterial[material] !== undefined)
        {
            let newBuildingData = baseLayout.getBuildingDataFromId(buildingData.switchMaterial[material]);
                if(newBuildingData !== null)
                {
                    // Switch object
                    currentObject.className = newBuildingData.className;
                    baseLayout.updateBuiltWithRecipe(currentObject);

                    // Do we need to update the color slot?
                    let SwatchDesc  = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject, 'SwatchDesc');
                        if(SwatchDesc !== null)
                        {
                            let currentSwatchDesc = SwatchDesc.value.pathName;
                                switch(currentSwatchDesc)
                                {
                                    case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Concrete.SwatchDesc_Concrete_C':
                                        if(['Ficsit', 'GripMetal'].includes(material))
                                        {
                                            SwatchDesc.value.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot16.SwatchDesc_Slot16_C';
                                        }
                                        break
                                    case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_FoundationOverride.SwatchDesc_FoundationOverride_C':
                                    case '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot16.SwatchDesc_Slot16_C':
                                        if(['Concrete', 'ConcretePolished'].includes(material))
                                        {
                                            SwatchDesc.value.pathName = '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Concrete.SwatchDesc_Concrete_C';
                                        }
                                }
                        }

                    // Flow indicator?
                    /* LET THE GAME GENERATE IT SO IT'S BEST PLACED
                    if(Building_Pipeline.availablePipelines.includes(currentObject.className))
                    {
                        let mFlowIndicator = {
                                className       : '/Game/FactoryGame/Buildable/Factory/Pipeline/FlowIndicator/Build_PipelineFlowIndicator.Build_PipelineFlowIndicator_C',
                                pathName        : baseLayout.generateFastPathName({pathName: 'Persistent_Level:PersistentLevel.Build_PipelineFlowIndicator_C_XXX'}),
                                needTransform   : 1,
                                transform       : {rotation:[0,0,0,1], translation: BaseLayout_Math.getSplineCenter(baseLayout, currentObject)},
                                entity          : {pathName: currentObject.pathName},
                                properties      : [
                                    {name: 'mCustomizationData', type: 'Struct', value: {type: "FactoryCustomizationData", values: [{name: 'SwatchDesc', type: 'Object', value: {levelName: '', pathName: '/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Slot0.SwatchDesc_Slot0_C'}}]}},
                                    {name: 'mBuildTimeStamp', type: 'Float', value: 0}
                                ]
                            };

                        baseLayout.saveGameParser.addObject(mFlowIndicator);
                        baseLayout.setObjectProperty(currentObject, 'mFlowIndicator', {pathName: mFlowIndicator.pathName}, 'Object');
                    }
                    */
                    if(Building_Pipeline.availableNoIndicatorPipelines.includes(currentObject.className))
                    {
                        let mFlowIndicator = baseLayout.getObjectProperty(currentObject, 'mFlowIndicator');
                            if(mFlowIndicator !== null)
                            {
                                baseLayout.saveGameParser.deleteObject(mFlowIndicator.pathName);
                                baseLayout.deleteObjectProperty(currentObject, 'mFlowIndicator');
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
        }
    }

    switchObjectSkin(marker, skin)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

        if(buildingData !== null && buildingData.switchSkin !== undefined)
        {
            let mCustomizationData  = baseLayout.getObjectProperty(currentObject, 'mCustomizationData');
                if(mCustomizationData !== null)
                {
                    let SkinDesc            = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject, 'SkinDesc');
                        if(SkinDesc !== null)
                        {
                            for(let i = (mCustomizationData.values.length - 1); i >= 0; i--)
                            {
                                if(mCustomizationData.values[i].name === 'SkinDesc')
                                {
                                    mCustomizationData.values.splice(i, 1);
                                }
                            }
                        }

                    if(buildingData.switchSkin[skin] !== undefined)
                    {
                        mCustomizationData.values.push({
                            name    : 'SkinDesc',
                            type    : 'Object',
                            value   : {
                                levelName   : '',
                                pathName    : buildingData.switchSkin[skin]
                            }
                        });
                    }
                }

            // Redraw! (In case at some point we add different models ^^
            new Promise(function(resolve){
                return baseLayout.parseObject(currentObject, resolve);
            }).then(function(result){
                baseLayout.deleteMarkerFromElements(result.layer, marker.relatedTarget);
                baseLayout.addElementToLayer(result.layer, result.marker);
            });
        }
    }

    rotateObjectPattern(marker)
    {
        let baseLayout              = marker.baseLayout;
        let currentObject           = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let currentPatternRotation  = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject, 'PatternRotation');
            if(currentPatternRotation === null)
            {
                currentPatternRotation = {value: {value: 0}};
            }

            // Delete
            if(currentObject.customizationData === undefined)
            {
                let mCustomizationData      = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject);
                    for(let i = (mCustomizationData.values.length - 1); i >= 0; i--)
                    {
                        if(mCustomizationData.values[i].name === 'PatternRotation')
                        {
                            mCustomizationData.values.splice(i, 1);
                        }
                    }
            }

            // Push
            switch(currentPatternRotation.value.value)
            {
                case 1: // 180° => -90°
                    if(currentObject.customizationData !== undefined)
                    {
                        currentObject.customizationData.PatternRotation.value = 0;
                    }
                    else
                    {
                        let mCustomizationData = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject);
                            mCustomizationData.values.push({name: 'PatternRotation', type: 'Byte', value: {enumName: 'None', value: 0}});
                    }
                    break;

                case 2: // 90° => 180°
                    if(currentObject.customizationData !== undefined)
                    {
                        currentObject.customizationData.PatternRotation.value = 1;
                    }
                    else
                    {
                        let mCustomizationData = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject);
                            mCustomizationData.values.push({name: 'PatternRotation', type: 'Byte', value: {enumName: 'None', value: 1}});
                    }
                    break;

                case 3: // 0° => 90°
                    if(currentObject.customizationData !== undefined)
                    {
                        currentObject.customizationData.PatternRotation.value = 2;
                    }
                    else
                    {
                        let mCustomizationData = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject);
                            mCustomizationData.values.push({name: 'PatternRotation', type: 'Byte', value: {enumName: 'None', value: 2}});
                    }
                    break;

                default: // -90° => 0°
                    if(currentObject.customizationData !== undefined)
                    {
                        currentObject.customizationData.PatternRotation.value = 3 ;
                    }
                    else
                    {
                        let mCustomizationData = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject);
                            mCustomizationData.values.push({name: 'PatternRotation', type: 'Byte', value: {enumName: 'None', value: 3}});
                    }
                    break;
            }

        // Redraw!
        new Promise(function(resolve){
            return baseLayout.parseObject(currentObject, resolve);
        }).then(function(result){
            baseLayout.deleteMarkerFromElements(result.layer, marker.relatedTarget);
            baseLayout.addElementToLayer(result.layer, result.marker);
        });
    }
}