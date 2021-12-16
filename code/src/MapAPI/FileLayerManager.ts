// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.FileLayerManager {
    const fileLayerMap = new Map<string, string>(); //fileLayer.uniqueId -> map.uniqueId
    const fileLayerArr = new Array<OSFramework.FileLayer.IFileLayer>();

    /**
     * Gets the Map to which the FileLayer belongs to
     *
     * @param {string} fileLayerId Id of the FileLayer that exists on the Map
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function GetMapByFileLayerId(fileLayerId: string): OSFramework.OSMap.IMap {
        let map: OSFramework.OSMap.IMap;

        //fileLayerId is the UniqueId
        if (fileLayerMap.has(fileLayerId)) {
            map = MapManager.GetMapById(fileLayerMap.get(fileLayerId), false);
        }
        //UniqueID not found
        else {
            // Try to find its reference on DOM
            const elem = OSFramework.Helper.GetElementByUniqueId(
                fileLayerId,
                false
            );

            // If element is found, means that the DOM was rendered
            if (elem !== undefined) {
                //Find the closest Map
                const mapId = OSFramework.Helper.GetClosestMapId(elem);
                map = MapManager.GetMapById(mapId);
            }
        }

        return map;
    }

    /**
     * Changes the property value of a given FileLayer.
     *
     * @export
     * @param {string} fileLayerId Id of the FileLayer to be changed
     * @param {string} propertyName name of the property to be changed - some properties of the provider might not work out of be box
     * @param {*} propertyValue value to which the property should be changed to.
     */
    export function ChangeProperty(
        fileLayerId: string,
        propertyName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        propertyValue: any
    ): void {
        const fileLayer = GetFileLayerById(fileLayerId);
        const map = fileLayer.map;

        if (map !== undefined) {
            map.changeFileLayerProperty(
                fileLayerId,
                propertyName,
                propertyValue
            );
        }
    }

    /**
     * Function that will create an instance of FileLayer object with the configurations passed
     *
     * @export
     * @param {string} configs configurations for the FileLayer in JSON format
     * @returns {*}  {FileLayer.IFileLayer} instance of the FileLayer
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export function CreateFileLayer(
        fileLayerId: string,
        configs: string
    ): OSFramework.FileLayer.IFileLayer {
        const map = GetMapByFileLayerId(fileLayerId);
        OSFramework.Helper.ValidateFeatureProvider(
            map,
            OSFramework.Enum.Feature.FileLayer
        );
        if (!map.hasFileLayer(fileLayerId)) {
            const _fileLayer =
                GoogleProvider.FileLayer.FileLayerFactory.MakeFileLayer(
                    map,
                    fileLayerId,
                    JSON.parse(configs)
                );
            fileLayerArr.push(_fileLayer);
            fileLayerMap.set(fileLayerId, map.uniqueId);
            map.addFileLayer(_fileLayer);

            return _fileLayer;
        } else {
            console.error(
                `There is already a FileLayer registered on the specified Map under id:${fileLayerId}`
            );
        }
    }

    /**
     * Returns a FileLayer element based on Id
     *
     * @export
     * @param fileLayerId Id of the FileLayer
     */
    export function GetFileLayerById(
        fileLayerId: string,
        raiseError = true
    ): OSFramework.FileLayer.IFileLayer {
        const fileLayer: OSFramework.FileLayer.IFileLayer = fileLayerArr.find(
            (p) => p && p.equalsToID(fileLayerId)
        );

        if (fileLayer === undefined && raiseError) {
            throw new Error(`FileLayer id:${fileLayerId} not found`);
        }

        return fileLayer;
    }

    /**
     * Function that will destroy the FileLayer from the map it belongs to
     * @export
     * @param {string} fileLayerId id of the FileLayer that is about to be removed
     */
    export function RemoveFileLayer(fileLayerId: string): void {
        const fileLayer = GetFileLayerById(fileLayerId);
        const map = fileLayer.map;

        map && map.removeFileLayer(fileLayerId);
        fileLayerMap.delete(fileLayerId);
        fileLayerArr.splice(
            fileLayerArr.findIndex((p) => {
                return p && p.equalsToID(fileLayerId);
            }),
            1
        );
    }
}
