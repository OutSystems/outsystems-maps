var osGoogleMap;

function OsGoogleMap() {
    var callbackCodes = {
        setCenter: 'setCenter'
    };
    var OSMaps = {};
    var geocoder;

    function Map(container){
        this.mapId = container;
        this.markers = [];
        this.callbacks = []; //event, object
        this.autofit={};
        this.handler;
        
        this.initGMap = function initGMap(container, latitude, longitude, opts, callback, eventHandler){
            var newMapStyle, mapStyleObj;
            var numbers = /^\d+$/;
            
            if(opts.mapStyle !== "") {
                newMapStyle = opts.mapStyle.replace(/'/g, '"');
                mapStyleObj = JSON.parse(newMapStyle);    
            }
            

            // Review this as this won' accpet what we have on the description: 100% and 100vh;
            if(numbers.test(opts.mapHeight)) {
                opts.mapHeight = opts.mapHeight + "px";
            } 

            // Set maps height based on ratio of width
            container.style.height = opts.mapHeight;

            var gmap = new google.maps.Map(container, {
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
           
            if(opts.mapAdvancedFormat !== "")
                gmap.setOptions(JSON.parse(JSON.stringify(eval('(' + opts.mapAdvancedFormat + ')'))));
            
            if(opts.hasOwnProperty('offsetX') && opts.hasOwnProperty('offsetY')){
                this.autofit.offsetX = opts.offsetX || 0;
                this.autofit.offsetY = opts.offsetY || 0;
            }

            if(opts.hasOwnProperty('autofit')){
                this.autofit.enabled = opts.autofit;
            }

            //Map was initialized
            google.maps.event.addListenerOnce(gmap, 'idle', function(){
                if(typeof callback === 'function'){
                    callback();
                }
            });


            google.maps.event.addListener(gmap, 'resize', function() {
                if(typeof opts.resize === 'function'){
                    opts.resize(opts.mapId);
                }
            });

            if(opts.eventName !== ""){
                google.maps.event.addListener(gmap, opts.eventName, function() {
                    if(typeof opts.event === 'function'){
                        opts.event(opts.mapId, opts.eventName);
                    }
                });
            }

            this.handler = eventHandler;

            return gmap;
        };
    };
    
    function Marker(container, markerId, marker){
        this.parentMap = container;
        this.markerId = markerId;
        this.marker = marker;
    };

    // This returns the Google Map object associated with a Map
    this.getMap = function (mapId){
        if (typeof OSMaps[mapId] === 'undefined') {
            return;
        } else{
            return OSMaps[mapId].gmap;
        }
    };

    //This returns the Map object
    this.getMapObject = function (mapId) {
            return OSMaps[mapId];
    };

    this.getMarker = function(mapId, markerId) {
        this.getMapObject(mapId);
        if (typeof OSMaps[mapId] === 'undefined') {
            console.error("Map does not exist.");
        } else{
            for(var item in OSMaps[mapId].markers) {
                if (OSMaps[mapId].markers[item].markerId === markerId) {
                    return OSMaps[mapId].markers[item].marker;
                } else {
                    console.error("Not defined");
                }
            }
        }
    };


    function initMap (mapContainer, apiKey, latitude, longitude, options, callback, eventHandler) {
        // Check if google object exists or not 
        if(typeof google === 'object' && typeof google.maps === 'object') {
            var container = document.getElementById(mapContainer); 
            var map = osGoogleMap.getMapObject(mapContainer) || new Map(mapContainer);
            map.gmap = map.initGMap(container,latitude, longitude, options, callback, eventHandler);
            OSMaps[mapContainer] = map;
            applyCallback(mapContainer);
        } else {
            setTimeout(function(){
                initMap(mapContainer, apiKey, latitude, longitude, options, callback, eventHandler);
            }, 50);
        }
    };
    
    function convertAddressToCoordinates(mapId, marker){
        geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': marker.options.address}, function(results, status) {
            if (status == 'OK') {
                marker.options.lat = results[0].geometry.location.lat();
                marker.options.lng = results[0].geometry.location.lng();
                addGMarker(mapId, marker);
                osGoogleMap.setMapBounds(mapId);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });

    };

    //Private function
    function addGMarker(mapId, marker){
        var map = osGoogleMap.getMap(mapId);
        var coordinates;
        var markerOptions = {};
        var advancedFormatToString;
        var advancedFormatObj;

        if(!map){
            return;
        }

        if(marker.options.lat !== undefined && marker.options.lng !== undefined){
            coordinates = {lat: marker.options.lat, lng: marker.options.lng};
        } else if(marker.options.hasOwnProperty('address')){
            convertAddressToCoordinates(mapId, marker);
            return;
        }
        
        if(typeof marker.options.iconImage !== 'undefined' && marker.options.iconImage !== '') {
            markerOptions.icon = marker.options.iconImage;
            delete marker.options.iconImage;
        }
        if(typeof marker.options.position !== 'undefined') {
            markerOptions.position = marker.options.position;
            delete marker.options.position;
        } else {
            markerOptions.position = coordinates;
        }
        
        markerOptions.map = map;
        
        var gMarker = new google.maps.Marker(markerOptions);
        

        //check if these options exist hasOwnProperty
        if(marker.options.useDefault) {
            gMarker.addListener('click', function() {
                
              });
        } else if(marker.options.eventName !== '' && marker.options.hasOwnProperty('eventHandler')){
            gMarker.addListener(marker.options.eventName, function(){
                marker.options.eventHandler(mapId, marker.markerId, marker.options.eventName);
            });
        } 

        if(marker.options.options !== "") {
            
            try {
                advancedFormatToString = JSON.stringify(eval('(' + marker.options.options + ')'));
            }
            
            catch (e) {
                // Expose the errors to console
                console.warn('Your Marker options have some errors. Please review it and try again.');
                return;
            }
            
            advancedFormatObj = JSON.parse(advancedFormatToString);
            
            if(typeof advancedFormatObj === 'object' && advancedFormatObj !== null) {
                gMarker.setOptions(advancedFormatObj);
            }
        }

        var newMarker = new Marker(mapId, marker.markerId, gMarker);

        // Assign the news Marker to the respective Map position
        OSMaps[mapId].markers.push(newMarker);

        return gMarker;
    };

    // This function is exposed to add markers via client action
    this.addMapMarker = function (mapId, markerId, markerOptions){
        var Map = osGoogleMap.getMapObject(mapId);
        var marker = {};
        marker.map = mapId;
        marker.markerId = markerId;
        marker.options = markerOptions;
        
        var gMarker = addGMarker(mapId, marker);

        //For address locations only
        if(!gMarker){
            return;
        }

        if(Map.handler !== '' && marker.options.eventName !== '') {
            gMarker.addListener(marker.options.eventName, function(){
                Map.handler(mapId, marker.markerId, marker.options.eventName);
            });
        }

        osGoogleMap.setMapBounds(mapId);

        return markerId;
    };

    this.updateMarker = function(mapId, markerId, markerOptions){
        var marker = this.getMarker(mapId, markerId);
        var advancedFormatToString;
        var advancedFormatObj;

        if(!advancedFormatObj){
            return;
        }
            
        try {
            advancedFormatToString = JSON.stringify(eval('(' + markerOptions + ')'));
        }
        
        catch (e) {
            // Expose the errors to console
            console.warn('Your Marker options have some errors. Please review it and try again.');
            return;
        }
        
        advancedFormatObj = JSON.parse(advancedFormatToString);
        
        if(typeof advancedFormatObj === 'object' && advancedFormatObj !== null) {
            marker.setOptions(advancedFormatObj);
        }
    };
    
    this.removeMarker = function(mapId, markerId) {
        var OSMap = this.getMapObject(mapId);
        var markersCopy = [];
    
        for(var key in OSMap.markers) {
            var marker = OSMap.markers[key];
            if(marker.markerId == markerId){
                var gMarker = marker.marker;
                if (gMarker !== null) {
                    gMarker.setMap(null);
                }
                osGoogleMap.setMapBounds(mapId);
            } else{
                markersCopy.push(OSMap.markers[key]);
            }
        }

        OSMap.markers = markersCopy;
    };

    this.removeMarkers = function(mapId) {
        var OSMap = this.getMapObject(mapId);
        for (var key in OSMap.markers) {
            var marker = OSMap.markers[key];
            var gMarker = marker.marker;
            if (gMarker !== null) {
                gMarker.setMap(null);
            }
        }
        OSMap.markers = []; 
    };

    this.addMarkerEvent = function(mapId, markerId, eventName, handler) {
        var OSMap = this.getMapObject(mapId);
        
        // Gets an existing OSMarker or a stub (to add callbacks)
        var marker = OSMap.markers[markerId];
        googleMaps.event.addListener(marker.marker, eventName, function(){
            handler(mapId, markerId, eventName);
        });
    };

    this.panMapToMarker = function (mapId, markerId, zoomLevel){
        var map = osGoogleMap.getMap(mapId);
        var marker = osGoogleMap.getMarker(mapId, markerId);

        if(!map || !marker){
            return;
        }

        var location = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
        var bound  = new google.maps.LatLngBounds();
    
        bound.extend(location);
    
        map.fitBounds(bound);
        map.panToBounds(bound);
        map.setZoom(zoomLevel);
    };

    this.setIcon = function(mapId, markerId, iconURL){
        var map = osGoogleMap.getMap(mapId);
        var marker = osGoogleMap.getMarker(mapId, markerId);

        if(!map || !marker){
            return;
        }

        if(marker.icon === iconURL){
            return;
        }

        marker.setIcon(iconURL);
    }

    this.setMapPan = function (mapId, offsetX, offsetY){

        var mapObject = osGoogleMap.getMapObject(mapId);

        mapObject.autofit.offsetX = offsetX || 0;
        mapObject.autofit.offsetY = offsetY || 0;
        
    };

    this.setOffset = function (mapId, offsetX, offsetY){
        var map = osGoogleMap.getMap(mapId);

        if(!map){
            return;
        }

        map.panBy(offsetX, offsetY);
        
        
    };

    // Calculates the map's bounds
    // If no marker is set, the map's initial position is set
    // If just one marker is present on the map, the map will center on that location
    // If there are two or maore markers are present 
    this.setMapBounds = function (mapId){

        if(typeof google !== 'object'){
            return;
        }

        var mapObject = osGoogleMap.getMapObject(mapId);
        var bounds  = new google.maps.LatLngBounds();
        var loc;

        //If the autofit feature has been turned off
        if(!mapObject.autofit.enabled){
            return;
        }

        if(mapObject.markers.length == 1) {
            loc = new google.maps.LatLng(mapObject.markers[0].marker.position.lat(), mapObject.markers[0].marker.position.lng());
            mapObject.gmap.setCenter(loc);
        } else if(mapObject.markers.length >= 2) {
            mapObject.markers.forEach(function(item){
                loc = new google.maps.LatLng(item.marker.position.lat(), item.marker.position.lng());
                bounds.extend(loc);
            });
            mapObject.gmap.fitBounds(bounds);
            mapObject.gmap.panToBounds(bounds);
        } else{
            return;
        }

        // do autofit here
        osGoogleMap.setOffset(mapId, mapObject.autofit.offsetX, mapObject.autofit.offsetY);
        
    };

    //This is where the callbacks will be removed from the queue
    function applyCallback(mapId){
        var map = osGoogleMap.getMapObject(mapId);
        if(!map){
            return;
        }
        var callbacks = map.callbacks;
        var gmap = map.gmap;

        for(var i = 0; i < callbacks.length; i++){
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
    };


    this.getMarkersForStatic = function(){
        var mapObject = this.getMapObject('static-map');
        if(!mapObject){
            return;
        }

        return mapObject.callbacks;        
    };

    this.setMapCenter = function(mapId, lat, lng){
        var map = this.getMapObject(mapId) || new Map(mapId);
        var callback = {};

        callback.eventName = callbackCodes.setCenter;
        callback.object = {lat: lat, lng: lng};
        map.callbacks.unshift(callback); //Always place this at the top of the array
        OSMaps[mapId] = map;
    };


    this.init = function init(mapContainer, apiKey, latitude, longitude, options, callback, eventHandler){
        
        //Check if script exists
        if(!document.getElementById('google-maps-script')){
            // Create the script tag, set the appropriate attributes
            var script = document.createElement('script');
    
            script.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey;
            script.async = true;
            script.defer = true;
            script.id='google-maps-script';
            
            document.head.appendChild(script);
        }
        
        initMap(mapContainer, apiKey, latitude, longitude, options, callback, eventHandler);
    };
    
}