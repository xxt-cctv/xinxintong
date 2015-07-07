if (/MicroMessenger/i.test(navigator.userAgent)) {
    signPackage.jsApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage'];
    signPackage.debug = false;
    wx.config(signPackage);
}
window.setLocationYsxw = function (lng, lat) { };
var app = angular.module('kzrl', []);
app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(true);
}]);
app.directive('imgload', function () {
    return {
        restrict: 'E',
        link: function (scope, elem, attrs) {
            var eleImg = document.createElement('img');
            eleImg.addEventListener('load', function (evt) {
                elem.css('background-image', 'url(' + attrs.pic + ')');
                if (this.width <= this.height)
                    elem.css('background-size', '100%');
                else
                    elem.css('background-size', 'auto 100%');
            });
            eleImg.src = attrs.pic;
        }
    };
});
app.controller('ctrl', function ($scope, $timeout, $http, $q, $location) {
    var jsToday = new Date(),
        swiperToday,
        timelineSwiper,
        current,
        todayUrl,
        timelineUrl;

    todayUrl = '/rest/cus/cctv/kzrl/today';
    timelineUrl = '/rest/cus/cctv/kzrl/timeline';

    if (undefined !== $location.search().current) {
        current = $location.search().current;
        jsToday.setTime(current * 1000);
        todayUrl += '?current=' + current;
        timelineUrl += '?current=' + current;
    }

    $scope.date = {
        'year': jsToday.getFullYear(),
        'mon': jsToday.getMonth(),
        'date': jsToday.getDate(),
        'day': ['天', '一', '二', '三', '四', '五', '六'][jsToday.getDay()],
        'offsetDays': Math.ceil((Date.parse('2015/9/3') - jsToday.getTime()) / 86400000)
    };
    $scope.gotoArticle = function (article) {
        location.href = '/rest/mi/matter?type=article&id=' + article.id + '&mpid=ad483481fb907d53d74130cd88e11d86';
    };
    $scope.gotoIncident = function (incident) {
        location.href = '/views/default/cus/cctv/kzrl/incident.html?id=' + incident.id;
    };
    $scope.todayNext = function () {
        swiperToday !== undefined && swiperToday.slideNext(true);
    };
    $scope.todayPrev = function () {
        swiperToday !== undefined && swiperToday.slidePrev(true);
    };
    window.xxt.share.options.logger = function (shareto) {
        var url = "/rest/mi/matter/logShare";
        url += "?shareid=" + (new Date()).getTime();
        url += "&mpid=ad483481fb907d53d74130cd88e11d86";
        url += "&id=kzrl-home";
        url += "&type=cus";
        url += "&shareto=" + shareto;
        $http.get(url);
    };
    $http.get(todayUrl).success(function (rsp) {
        window.xxt.share.set("【抗战日历】", location.href, "【抗战日历】距离抗战胜利纪念日阅兵还有" + $scope.date.offsetDays + "天", "http://" + location.host + "/views/default/cus/cctv/kzrl/static/img/sp.jpg");
        for (var i = 0; i < rsp.data.length; i++) {
            var summary = rsp.data[i].summary;
            rsp.data[i].summary = summary.substr(0, 20) + "...";
        }
        if (rsp.data.length > 1) {
            var first, last;
            first = angular.copy(rsp.data[0]);
            last = angular.copy(rsp.data[rsp.data.length - 1]);
            rsp.data.splice(0, 0, last);
            rsp.data.push(first);
            $scope.todays = rsp.data;
            $timeout(function () {
                swiperToday = new Swiper('#todays .swiper-container', {
                    loop: false,
                    initialSlide: 1,
                    slidesPerView: 1,
                    touchMoveStopPropagation: false,
                    onTransitionEnd: function (swiper) {
                        if (swiper.activeIndex === $scope.todays.length - 1)
                            swiper.slideTo(1, 0, false);
                        else if (swiper.activeIndex === 0)
                            swiper.slideTo($scope.todays.length - 2, 0, false);
                    }
                });
            });
        } else {
            $scope.todays = rsp.data;
        }

    });
    $http.get('/rest/mi/matter/byNews?id=1').success(function (rsp) {
        $scope.letters = rsp.data;
    });
    var fetchTimeline = function (direction) {
        var deferred = $q.defer(), promise = deferred.promise;
        var incident;
        if (direction) {
            if (direction === 'F') {
                incident = $scope.incidents[0];
            } else if (direction === 'B') {
                incident = $scope.incidents[$scope.incidents.length - 1];
            }
            timelineUrl += timelineUrl.indexOf('?') === -1 ? '?' : '&';
            timelineUrl += 'articleid=' + incident.id;
            timelineUrl += '&direction=' + direction;
        }
        $http.get(timelineUrl).success(function (rsp) {
            deferred.resolve(rsp.data);
        });
        return promise;
    };
    var loadSlides = function (direction) {
        if (direction === 'F') {
            fetchTimeline('F').then(function (data) {
                var result = data.result;
                if (result.length) {
                    $scope.incidents = result.concat($scope.incidents);
                    $timeout(function () {
                        var activeIndex;
                        activeIndex = timelineSwiper.activeIndex + result.length;
                        timelineSwiper.updateSlidesSize && timelineSwiper.updateSlidesSize();
                        timelineSwiper.slideTo && timelineSwiper.slideTo(activeIndex, 0, false);
                    });
                }
            });
        } else if (direction === 'B') {
            fetchTimeline('B').then(function (data) {
                var result = data.result;
                if (result.length) {
                    $scope.incidents = $scope.incidents.concat(result);
                    $timeout(function () {
                        timelineSwiper.updateSlidesSize();
                    });
                }
            });
        }
    };
    fetchTimeline().then(function (data) {
        $scope.incidents = data.result;
        $timeout(function () {
            timelineSwiper = new Swiper('#timeline .swiper-container', {
                slidesPerView: 3,
                spaceBetween: 20,
                initialSlide: data.todayIndex,
                centeredSlides: true,
                direction: 'vertical',
                effect: 'slide',
                onTransitionEnd: function (swiper) {
                    $scope.$apply(function () {
                        $scope.activeIncident = $scope.incidents[swiper.activeIndex];
                        if (swiper.activeIndex <= 3) {
                            loadSlides('F');
                        } else if (swiper.activeIndex >= $scope.incidents.length - 3) {
                            loadSlides('B');
                        }
                    });
                }
            });
        });
    });
});