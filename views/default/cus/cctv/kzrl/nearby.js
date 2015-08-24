window.setLocationYsxw = function (lng, lat) { };
var app = angular.module('kzrl', []);
app.config(['$locationProvider', function ($lp) {
	$lp.html5Mode(true);
}]);
app.controller('ctrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
	var id = $location.search().id, url = '/rest/cus/cctv/kzrl/nearby?articleid=' + id;
	$scope.openOne = function (incident) {
		location.href = '/views/default/cus/cctv/kzrl/incident.html?id=' + incident.id;
	};
	$http.post('/rest/mi/matter/logAccess?mpid=9f4335dc25ab0a83c04e066793cba286&id=' + id + '&type=kzrl-nearby', {
        search: location.search.replace('?', ''),
        referer: document.referrer
    });
	$http.get('/rest/cus/cctv/kzrl/get?articleid=' + id).success(function (rsp) {
		$scope.center = rsp.data;
	});
	$http.get(url).success(function (rsp) {
		$scope.incidents = rsp.data;
	});
	$scope.isAssist = false;
    $scope.clickAssist = function () {
		$http.get('/rest/cus/cctv/kzrl/score?id=1577').success(function (rsp) {
			$scope.isAssist = true;
			$scope.assistCount = rsp.data[0];
		});
    }
}]);