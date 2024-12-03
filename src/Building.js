/*
 * Also hold basic className from buildings to reduce the SaveParsing module size...
 */
export default class Building
{
    /*
     * CONVEYOR
     */
    static get availableConveyorBelts()
    {
        return [
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk1/Build_ConveyorBeltMk1.Build_ConveyorBeltMk1_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk2/Build_ConveyorBeltMk2.Build_ConveyorBeltMk2_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk3/Build_ConveyorBeltMk3.Build_ConveyorBeltMk3_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk4/Build_ConveyorBeltMk4.Build_ConveyorBeltMk4_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk5/Build_ConveyorBeltMk5.Build_ConveyorBeltMk5_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk6/Build_ConveyorBeltMk6.Build_ConveyorBeltMk6_C'
        ];
    }

    static get availableConveyorLifts()
    {
        return [
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk1/Build_ConveyorLiftMk1.Build_ConveyorLiftMk1_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk2/Build_ConveyorLiftMk2.Build_ConveyorLiftMk2_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk3/Build_ConveyorLiftMk3.Build_ConveyorLiftMk3_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk4/Build_ConveyorLiftMk4.Build_ConveyorLiftMk4_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk5/Build_ConveyorLiftMk5.Build_ConveyorLiftMk5_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk6/Build_ConveyorLiftMk6.Build_ConveyorLiftMk6_C'
        ];
    }

    static get availableConveyorChainActor()
    {
        return [
            '/Script/FactoryGame.FGConveyorChainActor',
            '/Script/FactoryGame.FGConveyorChainActor_RepSizeMedium',
            '/Script/FactoryGame.FGConveyorChainActor_RepSizeLarge',
            '/Script/FactoryGame.FGConveyorChainActor_RepSizeHuge',
            '/Script/FactoryGame.FGConveyorChainActor_RepSizeNoCull'
        ];
    }

    static isConveyor(currentObject)
    {
        return Building.isConveyorBelt(currentObject) || Building.isConveyorLift(currentObject);
    }

    static isConveyorBelt(currentObject)
    {
        if(Building.availableConveyorBelts.includes(currentObject.className))
        {
            return true;
        }

        // Belts Mod
        if(
                currentObject.className.startsWith('/Conveyors_Mod/Build_BeltMk')
             || currentObject.className.startsWith('/Game/Conveyors_Mod/Build_BeltMk')
             || currentObject.className.startsWith('/UltraFastLogistics/Buildable/build_conveyorbeltMK')
             || currentObject.className.startsWith('/FlexSplines/Conveyor/Build_Belt')
             || currentObject.className.startsWith('/conveyorbeltmod/Belt/mk')
             || currentObject.className.startsWith('/minerplus/content/buildable/Factory/belt_')
             || currentObject.className.startsWith('/bamfp/content/buildable/Factory/belt_')
             || currentObject.className.startsWith('/MkPlus/Buildables/ConveyorBelt/Build_ConveyorBelt_')
             || currentObject.className.startsWith('/FastConveyors/Buildable/Belts/Build_FastConveyorBelt')
             || currentObject.className.startsWith('/MkPlusLibs/Buildables/ConveyorBelt/Build_ConveyorBelt_Mk')
             || currentObject.className === '/BeltMk6/Buildable/ConveyorBeltMk6/Build_ConveyorBeltMk6.Build_ConveyorBeltMk6_C'

        )
        {
            return true;
        }

        return false;
    }

    static isConveyorChainActor(currentObject)
    {
        if(Building.availableConveyorChainActor.includes(currentObject.className))
        {
            return true;
        }

        return false
    }

    static isConveyorLift(currentObject)
    {
        if(Building.availableConveyorLifts.includes(currentObject.className))
        {
            return true;
        }

        // Lifts Mod
        if(
                currentObject.className.startsWith('/minerplus/content/buildable/Factory/lift')
             || currentObject.className.startsWith('/bamfp/content/buildable/Factory/lift')
             || currentObject.className.startsWith('/Game/Conveyors_Mod/Build_LiftMk')
             || currentObject.className.startsWith('/Conveyors_Mod/Build_LiftMk')
             || currentObject.className.startsWith('/Game/CoveredConveyor')
             || currentObject.className.startsWith('/CoveredConveyor')
             || currentObject.className.startsWith('/conveyorbeltmod/lift/')
             || currentObject.className.startsWith('/MkPlus/Buildables/ConveyorLift/Build_ConveyorLift_')
             || currentObject.className.startsWith('/FastConveyors/Buildable/Lifts/Build_FastConveyorLift')
             || currentObject.className.startsWith('/MkPlusLibs/Buildables/ConveyorLift/Build_ConveyorLift_Mk')
             || currentObject.className === '/BeltMk6/Buildable/ConveyorLiftMk6/Build_ConveyorLiftMk6.Build_ConveyorLiftMk6_C'

        )
        {
            return true;
        }

        return false;
    }

    /*
     * POWERLINE
     */
    static get availablePowerlines()
    {
        return [
            '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C',
            '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C'
        ];
    }

    static isPowerline(currentObject)
    {
        if(Building.availablePowerlines.includes(currentObject.className))
        {
            return true;
        }

        // Powerline Mod
        if(
               currentObject.className === '/FlexSplines/PowerLine/Build_FlexPowerline.Build_FlexPowerline_C'
            || currentObject.className === '/AB_CableMod/Visuals1/Build_AB-PLCopper.Build_AB-PLCopper_C'
            || currentObject.className === '/AB_CableMod/Visuals1/Build_AB-PLCaterium.Build_AB-PLCaterium_C'
            || currentObject.className === '/AB_CableMod/Visuals3/Build_AB-PLHeavy.Build_AB-PLHeavy_C'
            || currentObject.className === '/AB_CableMod/Visuals4/Build_AB-SPLight.Build_AB-SPLight_C'
            || currentObject.className === '/AB_CableMod/Visuals3/Build_AB-PLPaintable.Build_AB-PLPaintable_C'
            || currentObject.className === '/AB_CableMod/Cables_Heavy/Build_AB-PLHeavy-Cu.Build_AB-PLHeavy-Cu_C'
            || currentObject.className === '/AB_CableMod/Cables_Standard/Build_AB-PLStandard-Cu.Build_AB-PLStandard-Cu_C'
            || currentObject.className === '/AB_CableMod/Cables_Wire/Build_AB-PLWire-Si.Build_AB-PLWire-Si_C'
            || currentObject.className === '/AB_CableMod/Cables_Wire/Build_AB-PLWire-Au.Build_AB-PLWire-Au_C'
            || currentObject.className === '/AB_CableMod/Cables_Wire/Build_AB-PLWire-Cu.Build_AB-PLWire-Cu_C'
        )
        {
            return true;
        }

        return false;
    }

    /*
     * VEHICLE
     */
    static get availableVehicles()
    {
        return [
            '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C',
            '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C',
            '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C',
            '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Testa_BP_WB.Testa_BP_WB_C',
            '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C',
            '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_GolfcartGold.BP_GolfcartGold_C'
        ];
    }

    static isVehicle(currentObject)
    {
        if(Building.availableVehicles.includes(currentObject.className))
        {
            return true;
        }

        // Vehicles Mod
        if(currentObject.className === '/x3_mavegrag/Vehicles/Trucks/TruckMk1/BP_X3Truck_Mk1.BP_X3Truck_Mk1_C')
        {
            return true;
        }

        return false;
    }

    /**
     * LOCOMOTIVE
     */
    static get availableLocomotives()
    {
        return [
            '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C'
        ];
    }

    static isLocomotive(currentObject)
    {
        if(Building.availableLocomotives.includes(currentObject.className))
        {
            return true;
        }

        // Locomotives Mod
        if(
                currentObject.className === '/x3_mavegrag/Vehicles/Trains/Locomotive_Mk1/BP_X3Locomotive_Mk1.BP_X3Locomotive_Mk1_C'
             || currentObject.className === '/DI_Transportation_Darkplate/Trains/Locomotive/DI_Locomotive_400/Build_DI_Locomotive_400.Build_DI_Locomotive_400_C'
             || currentObject.className === '/MkPlus/Buildables/Train/BP_Locomotive_Mk2.BP_Locomotive_Mk2_C'
        )
        {
            return true;
        }

        return false;
    }

    /**
     * FREIGHT WAGON
     */
    static get availableFreightWagons()
    {
        return [
            '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C'
        ];
    }

    static isFreightWagon(currentObject)
    {
        if(Building.availableFreightWagons.includes(currentObject.className))
        {
            return true;
        }

        // Freight Wagons Mod
        if(
                currentObject.className === '/x3_mavegrag/Vehicles/Trains/CargoWagon_Mk1/BP_X3CargoWagon_Mk1.BP_X3CargoWagon_Mk1_C'
             || currentObject.className === '/DI_Transportation_Darkplate/Trains/Wagon/DI_Wagon_512/Build_DI_FrieghtWagon512.Build_DI_FrieghtWagon512_C'
             || currentObject.className === '/MkPlus/Buildables/Train/BP_FreightWagon_Mk2.BP_FreightWagon_Mk2_C'
        )
        {
            return true;
        }

        return false;
    }
}