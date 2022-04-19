// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.Auxiliary {
    /**
     * Receives a string and generates the hashcode from it.
     * @param str - string, typically the data to be showed in the Map.
     * @returns hashcode to the str
     */
    export function GetHashCode(str: string): number {
        return OSFramework.Helper.GenerateHashCode(str);
    }
}

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.Auxiliary {
    export function GetHashCode(str: string): number {
        OSFramework.Helper.LogWarningMessage(
            `${OSFramework.Helper.warningMessage} 'OutSystems.Maps.MapAPI.Auxiliary.GetHashCode()'`
        );
        return OutSystems.Maps.MapAPI.Auxiliary.GetHashCode(str);
    }
}
