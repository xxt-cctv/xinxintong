(function () {
    var geoSuccessCallback = function (position) {
        window.kzrlGeo.onLocationReady && typeof window.kzrlGeo.onLocationReady === 'function' && window.kzrlGeo.onLocationReady(position.coords.latitude, position.coords.longitude);
    };
    var geoErrorCallback = function (error) {
        var e;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                e = "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                e = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                e = "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
                e = "An unknown error occurred.";
                break;
        }
        window.kzrlGeo.onLocationFail && typeof window.kzrlGeo.onLocationFail === 'function' && window.kzrlGeo.onLocationFail(e);
    };
    var requestGeoPosition = function () {
        var nav, geoloc;
        nav = window.navigator;
        if (nav !== null) {
            geoloc = nav.geolocation;
            if (geoloc !== null) {
                geoloc.getCurrentPosition(geoSuccessCallback, geoErrorCallback, { timeout: 1000 });
            } else {
                window.kzrlGeo.onLocationFail && typeof window.kzrlGeo.onLocationFail === 'function' && window.kzrlGeo.onLocactionFail("Geolocation API is not supported in your browser");
            }
        } else {
            window.kzrlGeo.onLocationFail && typeof window.kzrlGeo.onLocationFail === 'function' && window.kzrlGeo.onLocactionFail("Navigator is not found");
        }
    };
    window.kzrlGeo = {};
    if (/Android/i.test(navigator.userAgent) || /iPhone/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent)) {
        if (/CntvNews/.test(navigator.userAgent)) {
            window.setLocationYsxw = function (lng, lat) {
                window.kzrlGeo.onLocationReady && typeof window.kzrlGeo.onLocationReady === 'function' && window.kzrlGeo.onLocactionReady(lat, lng);
            };
            window.addEventListener('load', function () { window.position.setLocationInfo(); }, false);
        } else if (/MicroMessenger/i.test(navigator.userAgent)) {
            window.addEventListener('load', function () { requestGeoPosition(); }, false);
        } else if (/YiXin/i.test(navigator.userAgent)) {
            window.addEventListener('load', function () { requestGeoPosition(); }, false);
        } else {
            window.addEventListener('load', function () { requestGeoPosition(); }, false);
        }
    } else {
        window.addEventListener('load', function load() {
            window.kzrlGeo.onLocationFail && typeof window.kzrlGeo.onLocationFail === 'function' && window.kzrlGeo.onLocationFail('Non mobile browser');
        }, false);
    }
})();