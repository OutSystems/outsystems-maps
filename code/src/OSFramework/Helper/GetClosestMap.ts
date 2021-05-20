// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Helper {
    /**
     * Returns the closest IMap based on an element
     * @param elem Element used as reference or its uniqueId
     */
    export function GetClosestMap(
        elem: Element | string
    ): OSFramework.OSMap.IMap {
        let child: Element;

        if (typeof elem === 'string' || elem instanceof String)
            child = OSFramework.Helper.GetElementByUniqueId(elem as string);
        else child = elem;

        const domMap = child.closest(
            OSFramework.Helper.Constants.outsystemsWidgetTag
        );

        if (domMap) {
            const uniqueId = domMap
                .querySelector(OSFramework.Helper.Constants.mapUniqueIdCss)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .getAttribute(OSFramework.Helper.Constants.uniqueIdAttribute);

            return MapAPI.MapManager.GetMapById(uniqueId);
        }

        return null;
    }
}
