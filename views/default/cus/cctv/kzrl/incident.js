var app = angular.module('kzrl', []);
app.config(['$locationProvider', function ($lp) {
    $lp.html5Mode(true);
}]);
app.controller('ctrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    var id = $location.search().id, url = '/rest/cus/cctv/kzrl/get?articleid=' + id;
    window.kzrlGeo.onLocationReady = function (lat, lng) {
        if (lat !== undefined && lng !== undefined) {
            url += '&lat=' + lat;
            url += '&lng=' + lng;
        }
        $http.get(url).success(function (rsp) {
            $scope.incident = rsp.data;
        });
    };
    window.kzrlGeo.onLocationFail = function ($msg) {
        $http.get(url).success(function (rsp) {
            $scope.incident = rsp.data;
        });
    };
    $scope.openNearby = function () {
        location.href = '/views/default/cus/cctv/kzrl/nearby.html?id=' + id;
    };
}]);