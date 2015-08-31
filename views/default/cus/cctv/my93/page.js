formApp = angular.module('formApp', []);
formApp.controller('formCtrl', ['$scope', '$http', '$timeout', '$q', function($scope, $http, $timeout, $q) {
    $scope.mpid = '9f4335dc25ab0a83c04e066793cba286';
    $scope.aid = '55df28cc3b2da';
    $scope.rid = '';
    $scope.data = {};
    $scope.progressOfUploadFile = 0;
    var r, submitWhole;
    submitWhole = function() {
        var url, d, d2, posted = angular.copy($scope.data);
        url = 'http://180.153.55.67/rest/app/enroll/record/submit?mpid=' + $scope.mpid + '&aid=' + $scope.aid + '&submitkey=' + $scope.submitkey;
        $http.post(url, posted).success(function(rsp) {
            if (typeof rsp === 'string') {
                alert(rsp);
            } else if (rsp.err_code != 0) {
                alert(rsp.err_msg);
            } else {
                location.href = "http://180.153.55.67/views/default/cus/cctv/kzrl/today.html";
            }
        }).error(function(content, httpCode) {
            alert(content);
        });
    }
    $scope.chooseFile = function(fileFieldName, count, accept) {
        var ele = document.createElement('input');
        ele.setAttribute('type', 'file');
        accept !== undefined && ele.setAttribute('accept', accept);
        console.log('choose file begin...');
        ele.addEventListener('change', function(evt) {
            console.log('choose file done');
            var i, cnt, f;
            cnt = evt.target.files.length;
            for (i = 0; i < cnt; i++) {
                f = evt.target.files[i];
                r.addFile(f);
                $scope.data[fileFieldName] === undefined && ($scope.data[fileFieldName] = []);
                $scope.data[fileFieldName].push({
                    uniqueIdentifier: r.files[0].uniqueIdentifier,
                    name: f.name,
                    size: f.size,
                    type: f.type,
                    url: ''
                });
            }
            $scope.$apply('data.' + fileFieldName);
            console.log('choose file end');
            $timeout(function() {
                r.upload();
            }, 0)
        }, false);
        ele.click();
    };
    $http.get('http://180.153.55.67/rest/app/enroll/record/submitkeyGet').success(function(rsp) {
        $scope.submitkey = rsp.data;
        r = new Resumable({
            target: 'http://180.153.55.67/rest/app/enroll/record/uploadFile?mpid=' + $scope.mpid + '&aid=' + $scope.aid + '&submitkey=' + $scope.submitkey,
            testChunks: false,
            chunkSize: 256 * 1024,
            //simultaneousUploads: 1
        });
        r.on('progress', function() {
            var phase, p;
            p = r.progress();
            console.log('progress', p);
            phase = $scope.$root.$$phase;
            if (phase === '$digest' || phase === '$apply') {
                $scope.progressOfUploadFile = Math.ceil(p * 100);
            } else {
                $scope.$apply(function() {
                    $scope.progressOfUploadFile = Math.ceil(p * 100);
                });
            }
        });
        r.on('complete', function() {
            $timeout(function() {
                r.cancel();
                submitWhole();
            }, 0);
        });
    });
    $http.get('http://180.153.55.67/rest/cus/cctv/kzrl/score?id=1649&s=5').success(function(rsp) {
        $scope.vcount = rsp.data[0];
        if (window.shaketv) {
            var sharelink, shareData;
            sharelink = "http://180.153.55.67/rest/app/enroll";
            sharelink += "?mpid=" + $scope.mpid;
            sharelink += "&aid=" + $scope.aid;
            sharelink += "&shareby=";
            shareData = {
                title: "我和" + $scope.vcount + "人在拍摄#我的胜利日#",
                link: sharelink,
                desc: '一起参加央视新闻#我的胜利日#视频拍摄，铭记历史，缅怀先烈。',
                pic: 'http://180.153.55.67/kcfinder/upload/ad483481fb907d53d74130cd88e11d86/%E5%9B%BE%E7%89%87/%E6%88%91%E7%9A%84%E8%83%9C%E5%88%A9%E6%97%A5/62894570824539309.jpg'
            };
            window.shaketv.wxShare(shareData.pic, shareData.title, shareData.desc, shareData.link);
        }
    });
}]);
$('<img/>').attr('src', 'http://180.153.55.67/kcfinder/upload/ad483481fb907d53d74130cd88e11d86/%E5%9B%BE%E7%89%87/%E6%8A%97%E6%88%98%E6%97%A5%E5%8E%86/12/top.jpg').load(function() {
    $(this).remove();
    $('body').css('background-image', 'url(http://180.153.55.67/kcfinder/upload/ad483481fb907d53d74130cd88e11d86/%E5%9B%BE%E7%89%87/%E6%8A%97%E6%88%98%E6%97%A5%E5%8E%86/12/top.jpg)');
});