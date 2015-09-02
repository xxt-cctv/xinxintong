formApp = angular.module('formApp', []);
formApp.controller('formCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.goto = function(matter) {
        location.href = matter.url;
    };
    $http.get('http://xxt.ctsi.com.cn/rest/cus/cctv/kzrl/byChannel?mpid=9f4335dc25ab0a83c04e066793cba286&id=15&page=1&size=2').success(function(rsp) {
        $scope.matters = rsp.data;
    });
    $http.get('http://xxt.ctsi.com.cn/rest/cus/cctv/kzrl/score?id=1649&s=1').success(function(rsp) {
        $scope.vcount = rsp.data[0];
        if (window.shaketv) {
            var shareData;
            shareData = {
                title: "我是九三胜利日阅兵的第" + $scope.vcount + "位参与者，铭记历史才能烛照未来！",
                link: location.href,
                desc: "我的胜利日",
                pic: 'http://xxt.ctsi.com.cn/kcfinder/upload/ad483481fb907d53d74130cd88e11d86/%E5%9B%BE%E7%89%87/%E6%88%91%E7%9A%84%E8%83%9C%E5%88%A9%E6%97%A5/62894570824539309.jpg'
            };
            window.shaketv.wxShare(shareData.pic, shareData.title, shareData.desc, shareData.link);
        }
    });
}]);
(function() {
    $('<img/>').attr('src', 'http://xxt.ctsi.com.cn/kcfinder/upload/ad483481fb907d53d74130cd88e11d86/%E5%9B%BE%E7%89%87/%E6%8A%97%E6%88%98%E6%97%A5%E5%8E%86/12/top.jpg').load(function() {
        $(this).remove();
        $('body').css('background-image', 'url(http://xxt.ctsi.com.cn/kcfinder/upload/ad483481fb907d53d74130cd88e11d86/%E5%9B%BE%E7%89%87/%E6%8A%97%E6%88%98%E6%97%A5%E5%8E%86/12/top.jpg)');
    });
    var eSlider, oSlider, lastY;
    eSlider = document.querySelector('#slider');
    oSlider = new Hammer(eSlider);
    oSlider.get('pan').set({
        direction: Hammer.DIRECTION_VERTICAL
    });
    lastY = 1 * eSlider.style.bottom.replace('px', '');
    oSlider.on('panup', function(ev) {
        if (lastY - ev.deltaY <= 64) {
            eSlider.style.bottom = (lastY - ev.deltaY) + 'px';
        } else {
            eSlider.style.bottom = '65px';
        }
    });
    oSlider.on('panend', function(ev) {
        var newY = lastY - ev.deltaY;
        if (newY > 32) {
            if (newY <= 64) {
                transform = "translate(0," + (newY - 64) + "px)";
                eSlider.style.transform = transform;
                eSlider.style.oTransform = transform;
                eSlider.style.msTransform = transform;
                eSlider.style.mozTransform = transform;
                eSlider.style.webkitTransform = transform;
            }
            lastY = 64;
            setTimeout(function() {
                location.href = "http://app.cntv.cn/special/dyb";
            }, 10);
        } else {
            lastY = newY;
        }
    });
})();