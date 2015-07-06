if (/MicroMessenger/i.test(navigator.userAgent)) {
    signPackage.jsApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage', 'getLocation'];
    signPackage.debug = false;
    wx.config(signPackage);
}
var app = angular.module('kzrl', []);
app.config(['$locationProvider', function ($lp) {
    $lp.html5Mode(true);
}]);
app.controller('ctrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    var id = $location.search().id, url = '/rest/cus/cctv/kzrl/get?articleid=' + id;
    var setContent = function (data) {
        //console.log(data);
        var title;
        $scope.passed = Math.round((new Date().getTime() / 1000 - data.occured_time) / 86400);
        title = $scope.passed + '天前的今天 ' + data.title;
        data.distance = parseInt(data.distance);
        $scope.incident = data;
        window.xxt.share.set(title, location.href, data.summary, data.pic);
    };
    window.kzrlGeo.onLocationReady = function (lat, lng) {
        if (lat !== undefined && lng !== undefined) {
            url += '&lat=' + lat;
            url += '&lng=' + lng;
        }
        $http.get(url).success(function (rsp) {
            setContent(rsp.data);
        });
    };
    window.kzrlGeo.onLocationFail = function ($msg) {
        $http.get(url).success(function (rsp) {
            setContent(rsp.data);
        });
    };
    $scope.openNearby = function () {
        location.href = '/views/default/cus/cctv/kzrl/nearby.html?id=' + id;
    };
}]);