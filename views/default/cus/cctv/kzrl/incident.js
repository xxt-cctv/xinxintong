if (/MicroMessenger/i.test(navigator.userAgent)) {
    signPackage.jsApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage', 'getLocation'];
    signPackage.debug = false;
    wx.config(signPackage);
}
var app = angular.module('kzrl', []);
app.config(['$locationProvider', function($lp) {
    $lp.html5Mode(true);
}]);
app.controller('ctrl', ['$scope', '$http', '$location', '$sce', function($scope, $http, $location, $sce) {
    var id = $location.search().id,
        url = '/rest/cus/cctv/kzrl/get?articleid=' + id,
        debug = $location.search().debug;
    window.xxt.share.options.descAsTitle = true;
    window.xxt.share.options.logger = function(shareto) {
        var url = "/rest/mi/matter/logShare";
        url += "?shareid=" + (new Date()).getTime();
        url += "&mpid=ad483481fb907d53d74130cd88e11d86";
        url += "&id=" + id;
        url += "&type=article";
        url += "&title=" + $scope.data.title;
        url += "&shareto=" + shareto;
        $http.get(url);
    };
    var setContent = function(data) {
        var title;
        $scope.passed = Math.round((new Date().getTime() / 1000 - data.occured_time) / 86400);
        title = $scope.passed + '天前,' + data.title;
        data.distance = parseInt(data.distance);
        data.body = $sce.trustAsHtml(data.body);
        $scope.incident = data;
        window.xxt.share.set(title, location.href, data.summary, data.pic);
        $http.post('/rest/mi/matter/logAccess?mpid=9f4335dc25ab0a83c04e066793cba286&id=' + id + '&title=' + data.title + '&type=article', {
            search: location.search.replace('?', ''),
            referer: document.referrer
        });
    };
    window.kzrlGeo.onLocationReady = function(lat, lng) {
        if (lat !== undefined && lng !== undefined) {
            url += '&lat=' + lat;
            url += '&lng=' + lng;
        }
        $http.get(url).success(function(rsp) {
            if (angular.isString(rsp)) {
                alert(rsp);
                return;
            }
            if (rsp.err_code !== 0) {
                alert(rsp.err_msg);
                return;
            }
            setContent(rsp.data);
        });
    };
    window.kzrlGeo.onLocationFail = function($msg) {
        $http.get(url).success(function(rsp) {
            setContent(rsp.data);
        });
    };
    $scope.openNearby = function() {
        location.href = '/views/default/cus/cctv/kzrl/nearby.html?id=' + id;
    };
    $scope.isAssist = false;
    $scope.clickAssist = function() {
        $http.get('/rest/cus/cctv/kzrl/score?id=1577').success(function(rsp) {
            $scope.isAssist = true;
            $scope.assistCount = rsp.data[0];
        });
    };
}]);