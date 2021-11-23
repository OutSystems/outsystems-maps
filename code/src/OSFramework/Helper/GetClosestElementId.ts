// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Helper {
    /**
     * Returns the closest IMap based on an element
     * @param elem Element used as reference or its uniqueId
     */
    export function GetClosestMapId(elem: Element | string): string {
        let child: Element;

        if (typeof elem === 'string' || elem instanceof String)
            child = Helper.GetElementByUniqueId(elem as string);
        else child = elem;

        const domMap = child.closest(Helper.Constants.mapTag);

        if (domMap) {
            const uniqueId = domMap
                .querySelector(Helper.Constants.mapUniqueIdCss)
                .getAttribute(Helper.Constants.uniqueIdAttribute);

            return uniqueId;
        }

        return null;
    }

    /**
     * Returns the closest uniqueId of a Maker based on an element
     * @param elem Element used as reference or its uniqueId
     */
    export function GetClosestMarkerId(elem: Element | string): string {
        let child: Element;

        if (typeof elem === 'string' || elem instanceof String)
            child = Helper.GetElementByUniqueId(elem as string);
        else child = elem;

        const domMarker = child.closest(Helper.Constants.markerGeneric);

        if (domMarker) {
            const uniqueId = domMarker
                .querySelector(Helper.Constants.markerUniqueIdCss)
                .getAttribute(Helper.Constants.uniqueIdAttribute);

            return uniqueId;
        }

        throw new Error("The marker doesn't exist on the DOM");
    }

    /**
     * Returns the closest uniqueId of a Shape based on an element
     * @param elem Element used as reference or its uniqueId
     */
    export function GetClosestShapeId(elem: Element | string): string {
        let child: Element;

        if (typeof elem === 'string' || elem instanceof String)
            child = Helper.GetElementByUniqueId(elem as string);
        else child = elem;

        const domShape = child.closest(Helper.Constants.shapeGeneric);

        if (domShape) {
            const uniqueId = domShape
                .querySelector(Helper.Constants.shapeUniqueIdCss)
                .getAttribute(Helper.Constants.uniqueIdAttribute);

            return uniqueId;
        }

        throw new Error("The shape doesn't exist on the DOM");
    }

    /**
     * Returns the closest uniqueId of a DrawingTools based on an element
     * @param elem Element used as reference or its uniqueId
     */
    export function GetClosestDrawingToolsId(elem: Element | string): string {
        let child: Element;

        if (typeof elem === 'string' || elem instanceof String)
            child = Helper.GetElementByUniqueId(elem as string);
        else child = elem;

        const domShape = child.closest(Helper.Constants.drawingToolsTag);

        if (domShape) {
            const uniqueId = domShape
                .querySelector(Helper.Constants.drawingToolsUniqueIdCss)
                .getAttribute(Helper.Constants.uniqueIdAttribute);

            return uniqueId;
        }

        throw new Error("The DrawingTools element doesn't exist on the DOM");
    }

    /**
     * Returns the closest ISearchPlaces based on an element
     * @param elem Element used as reference or its uniqueId
     */
    export function GetClosestSearchPlacesId(elem: Element | string): string {
        let child: Element;

        if (typeof elem === 'string' || elem instanceof String)
            child = Helper.GetElementByUniqueId(elem as string);
        else child = elem;

        const domMap = child.closest(Helper.Constants.searchPlacesTag);

        if (domMap) {
            const uniqueId = domMap
                .querySelector(Helper.Constants.runtimeSearchPlacesUniqueIdCss)
                .getAttribute(Helper.Constants.uniqueIdAttribute);

            return uniqueId;
        }

        throw new Error("The SearchPlaces element doesn't exist on the DOM");
    }
}
