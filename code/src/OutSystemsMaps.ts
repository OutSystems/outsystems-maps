let osGoogleMap;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function OsGoogleMap() {
    const callbackCodes = {
        setCenter: 'setCenter'
    };
    const geocoderCodes = {
        ok: {
            status: 'OK'
        },
        zero: {
            status: 'ZERO_RESULTS',
            message:
                '[🗺 GEOCODE 🗺] The geocode was successful but returned no results. This may have occurred if the geocoder was passed a non-existent address.'
        },
        query: {
            status: 'OVER_QUERY_LIMIT',
            message:
                '[🗺 GEOCODE 🗺] The geocode was not successful because you are over your quota'
        },
        denied: {
            status: 'REQUEST_DENIED',
            message:
                '[🗺 GEOCODE 🗺] Your geocode request was denied. The web page is not allowed to use the geocoder'
        },
        invalid: {
            status: 'INVALID_REQUEST',
            message:
                '[🗺 GEOCODE 🗺] The query made to  the geocoder is invalid, the query is missing'
        },
        unknown: {
            status: 'UNKNOWN_ERROR',
            message:
                '[🗺 GEOCODE 🗺] The geocode request could not be processed due to a server error. The request may succedd if you try again.'
        },
        error: {
            status: 'ERROR',
            message:
                '[🗺 GEOCODE 🗺] The request timed out or there was a problem contacting the Google servers. The request may succedd if you try again.'
        }
    };

    const OSMaps = {};
    let geocoder: google.maps.Geocoder;

    function Map(mapContainerId: string): void {
        this.mapId = mapContainerId;
        this.markers = [];
        this.callbacks = []; //event, object
        this.autofit = {};
        this.handler;
        this.markerClick;
        this.markerMouseover;
        this.markerMouseout;
        this.trafficLayer;

        this.initGMap = function initGMap(
            container: Element,
            latitude: number,
            longitude: number,
            opts,
            callback,
            eventHandler
        ): google.maps.Map {
            let newMapStyle;
            let mapStyleObj;

            if (opts.mapStyle !== '') {
                newMapStyle = opts.mapStyle.replace(/'/g, '"');
                mapStyleObj = JSON.parse(newMapStyle);
            }

            const gmap = new google.maps.Map(container, {
                center: {
                    lat: latitude || 0,
                    lng: longitude || 0
                },
                zoom: opts.mapZoom,
                zoomControl: opts.zoomControl,
                mapTypeControl: opts.mapTypeControl,
                scaleControl: opts.scaleControl,
                streetViewControl: opts.streetViewControl,
                rotateControl: opts.rotateControl,
                fullscreenControl: opts.fullscreenControl,
                mapTypeId: opts.mapTypeId,
                styles: mapStyleObj
            });

            this.markerClick = opts.markerClick;
            this.markerMouseover = opts.markerMouseover;
            this.markerMouseout = opts.markerMouseout;

            if (opts.mapAdvancedFormat !== '')
                gmap.setOptions(
                    JSON.parse(
                        JSON.stringify(eval('(' + opts.mapAdvancedFormat + ')'))
                    )
                );

            if (
                opts.hasOwnProperty('offsetX') &&
                opts.hasOwnProperty('offsetY')
            ) {
                this.autofit.offsetX = opts.offsetX || 0;
                this.autofit.offsetY = opts.offsetY || 0;
            }

            if (opts.hasOwnProperty('autofit')) {
                this.autofit.enabled = opts.autofit;
            }

            if (opts.mapShowTraffic) {
                this.trafficLayer = new google.maps.TrafficLayer();
            }

            //Map was initialized
            google.maps.event.addListenerOnce(gmap, 'idle', function () {
                if (typeof callback === 'function') {
                    callback();
                }
            });

            // Handling the events for map added via Advanced Format
            if (opts.mapAdvancedFormat.includes('eventName')) {
                const options = JSON.parse(
                    JSON.stringify(eval('(' + opts.mapAdvancedFormat + ')'))
                );
                if (options.eventName !== '') {
                    google.maps.event.addListener(
                        gmap,
                        options.eventName,
                        function () {
                            if (typeof opts.event === 'function') {
                                opts.event(opts.mapId, options.eventName);
                            }
                        }
                    );
                }
            }

            this.handler = eventHandler;

            return gmap;
        };
    }

    function Marker(
        parentMapId: string,
        markerId: string,
        marker: google.maps.Marker
    ): void {
        this.parentMap = parentMapId;
        this.markerId = markerId;
        this.marker = marker;
    }

    // This returns the Google Map object associated with a Map
    this.getMap = function (mapId: string): google.maps.Map {
        if (typeof OSMaps[mapId] === 'undefined') {
            return;
        } else {
            return OSMaps[mapId].gmap;
        }
    };

    //This returns the Map object
    this.getMapObject = function (mapId: string) /*: Map */ {
        return OSMaps[mapId];
    };

    this.getMarker = function (mapId: string, markerId): void {
        this.getMapObject(mapId);
        if (typeof OSMaps[mapId] === 'undefined') {
            console.error('Map does not exist.');
        } else {
            for (const item in OSMaps[mapId].markers) {
                if (OSMaps[mapId].markers[item].markerId === markerId) {
                    return OSMaps[mapId].markers[item].marker;
                } else {
                    console.error('Not defined');
                }
            }
        }
    };

    function initMap(
        mapId: string,
        apiKey: string,
        latitude: number,
        longitude: number,
        options,
        callback,
        eventHandler
    ): void {
        // Check if google object exists or not
        if (typeof google === 'object' && typeof google.maps === 'object') {
            const container: HTMLElement = document.getElementById(mapId);
            const map = osGoogleMap.getMapObject(mapId) || new Map(mapId);
            map.gmap = map.initGMap(
                container,
                latitude,
                longitude,
                options,
                callback,
                eventHandler
            );
            OSMaps[mapId] = map;
            applyCallback(mapId);
        } else {
            setTimeout(function () {
                initMap(
                    mapId,
                    apiKey,
                    latitude,
                    longitude,
                    options,
                    callback,
                    eventHandler
                );
            }, 50);
        }
    }

    function convertAddressToCoordinates(mapId: string, marker) {
        geocoder = new google.maps.Geocoder();
        geocoder.geocode(
            { address: marker.options.address },
            function (results, status) {
                switch (status) {
                    case geocoderCodes.ok.status:
                        marker.options.lat = results[0].geometry.location.lat();
                        marker.options.lng = results[0].geometry.location.lng();
                        addGMarker(mapId, marker);
                        osGoogleMap.setMapBounds(mapId);
                        break;
                    case geocoderCodes.zero.status:
                        console.warn(
                            '[GEOCODE ] The geocode was successful but returned no results. This may have occurred if the geocoder was passed a non-existent address.'
                        );
                        break;
                    case geocoderCodes.query.status:
                        console.warn(
                            '[GEOCODE] The geocode was not successful because you are over your quota'
                        );
                        break;
                    case geocoderCodes.denied.status:
                        console.warn(
                            '[GEOCODE] Your geocode request was denied. The web page is not allowed to use the geocoder'
                        );
                        break;
                    case geocoderCodes.invalid.status:
                        console.warn(
                            '[GEOCODE] The query made to  the geocoder is invalid, the query is missing'
                        );
                        break;
                    case geocoderCodes.unknown.status:
                        console.warn(
                            '[GEOCODE] The geocode request could not be processed due to a server error. The request may succedd if you try again.'
                        );
                        break;
                    case geocoderCodes.error.status:
                        console.warn(
                            '[GEOCODE] The request timed out or there was a problem contacting the Google servers. The request may succedd if you try again.'
                        );
                        break;
                    default:
                        break;
                }
            }
        );
    }

    //Private function
    function addGMarker(mapId: string, marker): google.maps.Marker {
        const map = osGoogleMap.getMap(mapId);
        const Map = osGoogleMap.getMapObject(mapId);
        let coordinates;
        const markerOptions: google.maps.MarkerOptions = {};
        let advancedFormatToString;
        let advancedFormatObj;

        if (!map) {
            return;
        }

        if (
            marker.options.lat !== undefined &&
            marker.options.lng !== undefined
        ) {
            coordinates = { lat: marker.options.lat, lng: marker.options.lng };
        } else if (marker.options.hasOwnProperty('address')) {
            convertAddressToCoordinates(mapId, marker);
            return;
        }

        if (
            typeof marker.options.iconImage !== 'undefined' &&
            marker.options.iconImage !== ''
        ) {
            markerOptions.icon = marker.options.iconImage;
            delete marker.options.iconImage;
        }
        if (typeof marker.options.position !== 'undefined') {
            markerOptions.position = marker.options.position;
            delete marker.options.position;
        } else {
            markerOptions.position = coordinates;
        }

        markerOptions.map = map;

        const gMarker = new google.maps.Marker(markerOptions);

        const currentIndex = marker.options.currentIndex;

        gMarker.addListener('click', function () {
            Map.markerClick(mapId, marker.markerId, currentIndex);
        });

        gMarker.addListener('mouseover', function () {
            Map.markerMouseover(mapId, marker.markerId, currentIndex);
        });

        gMarker.addListener('mouseout', function () {
            Map.markerMouseout(mapId, marker.markerId, currentIndex);
        });

        if (marker.options.options !== '') {
            try {
                advancedFormatToString = JSON.stringify(
                    eval('(' + marker.options.options + ')')
                );
            } catch (e) {
                // Expose the errors to console
                console.warn(
                    'Your Marker options have some errors. Please review it and try again.'
                );
                return;
            }

            advancedFormatObj = JSON.parse(advancedFormatToString);

            if (
                typeof advancedFormatObj === 'object' &&
                advancedFormatObj !== null
            ) {
                gMarker.setOptions(advancedFormatObj);

                if (
                    Map.handler !== '' &&
                    advancedFormatObj.hasOwnProperty('markerEvents')
                ) {
                    for (
                        let i = 0;
                        i < advancedFormatObj.markerEvents.length;
                        i++
                    ) {
                        const event = advancedFormatObj.markerEvents[i];

                        gMarker.addListener(
                            advancedFormatObj.markerEvents[i],
                            function () {
                                Map.handler(
                                    mapId,
                                    marker.markerId,
                                    currentIndex,
                                    event
                                );
                            }
                        );
                    }
                }
            }
        }

        const newMarker = new Marker(mapId, marker.markerId, gMarker);

        // Assign the news Marker to the respective Map position
        OSMaps[mapId].markers.push(newMarker);

        return gMarker;
    }

    // This function is exposed to add markers via client action
    this.addMapMarker = function (
        mapId: string,
        markerId: string,
        markerOptions
    ): string {
        const Map = osGoogleMap.getMapObject(mapId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const marker: any = {};
        marker.map = mapId;
        marker.markerId = markerId;
        marker.options = markerOptions;

        const gMarker = addGMarker(mapId, marker);

        //For address locations only
        if (!gMarker) {
            return;
        }

        if (Map.handler !== '' && marker.options.eventName !== '') {
            gMarker.addListener(marker.options.eventName, function () {
                Map.handler(mapId, marker.markerId, marker.options.eventName);
            });
        }

        osGoogleMap.setMapBounds(mapId);

        return markerId;
    };

    this.updateMarker = function (
        mapId: string,
        markerId: string,
        markerOptions
    ) {
        const marker = this.getMarker(mapId, markerId);
        let advancedFormatToString;
        // eslint-disable-next-line prefer-const
        let advancedFormatObj;

        if (!advancedFormatObj) {
            return;
        }

        try {
            advancedFormatToString = JSON.stringify(
                eval('(' + markerOptions + ')')
            );
        } catch (e) {
            // Expose the errors to console
            console.warn(
                'Your Marker options have some errors. Please review it and try again.'
            );
            return;
        }

        advancedFormatObj = JSON.parse(advancedFormatToString);

        if (
            typeof advancedFormatObj === 'object' &&
            advancedFormatObj !== null
        ) {
            marker.setOptions(advancedFormatObj);
        }
    };

    this.removeMarker = function (mapId: string, markerId: string): void {
        const OSMap = this.getMapObject(mapId);
        const markersCopy = [];

        for (const key in OSMap.markers) {
            const marker = OSMap.markers[key];
            if (marker.markerId === markerId) {
                const gMarker = marker.marker;
                if (gMarker !== null) {
                    gMarker.setMap(null);
                }
                osGoogleMap.setMapBounds(mapId);
            } else {
                markersCopy.push(OSMap.markers[key]);
            }
        }

        OSMap.markers = markersCopy;
    };

    this.removeMarkers = function (mapId: string) {
        const OSMap = this.getMapObject(mapId);
        for (const key in OSMap.markers) {
            const marker = OSMap.markers[key];
            const gMarker = marker.marker;
            if (gMarker !== null) {
                gMarker.setMap(null);
            }
        }
        OSMap.markers = [];
    };

    this.addEventsToMarker = function (
        mapId: string,
        eventName: string,
        handler
    ) {
        const OSMap = this.getMapObject(mapId);

        // Gets an existing OSMarker or a stub (to add callbacks)
        const markers = OSMap.markers;
        for (let i = 0; i < OSMap.markers.length; i++) {
            markers[i].marker.addListener(eventName, function () {
                handler(mapId, eventName);
            });
        }
    };

    this.panMapToMarker = function (
        mapId: string,
        markerId: string,
        zoomLevel
    ) {
        const map = osGoogleMap.getMap(mapId);
        const marker = osGoogleMap.getMarker(mapId, markerId);

        if (!map || !marker) {
            return;
        }

        const location = new google.maps.LatLng(
            marker.position.lat(),
            marker.position.lng()
        );
        const bound = new google.maps.LatLngBounds();

        bound.extend(location);

        map.fitBounds(bound);
        map.panToBounds(bound);
        map.setZoom(zoomLevel);
    };

    this.setIcon = function (mapId: string, markerId: string, iconURL: string) {
        const map = osGoogleMap.getMap(mapId);
        const marker = osGoogleMap.getMarker(mapId, markerId);

        if (!map || !marker) {
            return;
        }

        if (marker.icon === iconURL) {
            return;
        }

        marker.setIcon(iconURL);
    };

    this.setMapPan = function (
        mapId: string,
        offsetX: number,
        offsetY: number
    ) {
        const mapObject = osGoogleMap.getMapObject(mapId);

        mapObject.autofit.offsetX = offsetX || 0;
        mapObject.autofit.offsetY = offsetY || 0;
    };

    this.setOffset = function (
        mapId: string,
        offsetX: number,
        offsetY: number
    ): void {
        const map = osGoogleMap.getMap(mapId);

        if (!map) {
            return;
        }

        map.panBy(offsetX, offsetY);
    };

    // Calculates the map's bounds
    // If no marker is set, the map's initial position is set
    // If just one marker is present on the map, the map will center on that location
    // If there are two or maore markers are present
    this.setMapBounds = function (mapId: string): void {
        if (typeof google !== 'object') {
            return;
        }

        const mapObject = osGoogleMap.getMapObject(mapId);
        const bounds = new google.maps.LatLngBounds();

        //If the autofit feature has been turned off
        if (mapObject.markers.length === 0) {
            return;
        }

        //If the autofit feature has been turned on
        if (mapObject.autofit.enabled) {
            let loc: google.maps.LatLng;
            if (mapObject.markers.length === 1) {
                loc = new google.maps.LatLng(
                    mapObject.markers[0].marker.position.lat(),
                    mapObject.markers[0].marker.position.lng()
                );
                bounds.extend(loc);
                mapObject.gmap.fitBounds(bounds);
                mapObject.gmap.setCenter(loc);
                mapObject.gmap.setZoom(8);
            } else if (mapObject.markers.length >= 2) {
                mapObject.markers.forEach(function (item) {
                    loc = new google.maps.LatLng(
                        item.marker.position.lat(),
                        item.marker.position.lng()
                    );
                    bounds.extend(loc);
                });
                mapObject.gmap.fitBounds(bounds);
                mapObject.gmap.panToBounds(bounds);
            } else {
                return;
            }
        }

        // do offset here
        osGoogleMap.setOffset(
            mapId,
            mapObject.autofit.offsetX,
            mapObject.autofit.offsetY
        );
    };

    //This is where the callbacks will be removed from the queue
    function applyCallback(mapId: string): void {
        const map = osGoogleMap.getMapObject(mapId);
        if (!map) {
            return;
        }
        const callbacks = map.callbacks;
        const gmap = map.gmap;

        for (let i = 0; i < callbacks.length; i++) {
            switch (callbacks[i].eventName) {
                case callbackCodes.setCenter:
                    gmap.setCenter(callbacks[i].object);
                    break;
                default:
                    break;
            }
        }

        osGoogleMap.setMapBounds(mapId);
        map.callbacks = [];
    }

    this.getMarkersForStatic = function (): [] {
        const mapObject = this.getMapObject('static-map');
        if (!mapObject) {
            return;
        }

        return mapObject.callbacks;
    };

    this.setMapCenter = function (
        mapId: string,
        lat: number,
        lng: number
    ): void {
        const map = this.getMapObject(mapId) || new Map(mapId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const callback: any = {};

        callback.eventName = callbackCodes.setCenter;
        callback.object = { lat: lat, lng: lng };
        map.callbacks.unshift(callback); //Always place this at the top of the array
        OSMaps[mapId] = map;
    };

    this.init = function init(
        mapContainer: string,
        apiKey: string,
        latitude: number,
        longitude: number,
        options,
        callback,
        eventHandler
    ) {
        //Check if script exists
        if (!document.getElementById('google-maps-script')) {
            // Create the script tag, set the appropriate attributes
            const script = document.createElement('script');

            script.src =
                'https://maps.googleapis.com/maps/api/js?key=' + apiKey;
            script.async = true;
            script.defer = true;
            script.id = 'google-maps-script';

            document.head.appendChild(script);
        }

        initMap(
            mapContainer,
            apiKey,
            latitude,
            longitude,
            options,
            callback,
            eventHandler
        );
    };
}
