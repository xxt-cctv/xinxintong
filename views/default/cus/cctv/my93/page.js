formApp = angular.module('formApp', []);
formApp.controller('formCtrl', ['$scope', '$http', '$timeout', '$q', function($scope, $http, $timeout, $q) {
    $scope.mpid = '9f4335dc25ab0a83c04e066793cba286';
    $scope.aid = '55df28cc3b2da';
    $scope.rid = '';
    $scope.data = { };
    $scope.errmsg = '';
    $scope.progressOfUploadFile = 0;
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
            $timeout(function(){
                $scope.submit();
            },0)
        }, false);
        ele.click();
    };
    $scope.submit = function() {
        var submitWhole = function() {
            var url, d, d2, posted = angular.copy($scope.data);
            url = 'http://xxt.ctsi.com.cn/rest/app/enroll/record/submit?mpid=' + $scope.mpid + '&aid=' + $scope.aid + '&submitkey=' + $scope.submitkey;
            for (var i in posted) {
                d = posted[i];
                if (angular.isArray(d) && d.length && d[0].imgSrc !== undefined && d[0].serverId !== undefined) {
                    for (var j in d) {
                        d2 = d[j];
                        delete d2.imgSrc;
                    }
                }
            }
            $http.post(url, posted).success(function(rsp) {
                if (typeof rsp === 'string') {
                    $scope.errmsg = rsp;
                } else if (rsp.err_code != 0) {
                    $scope.errmsg = rsp.err_msg;
                } else {
                    location.href = "http://xxt.ctsi.com.cn/views/default/cus/cctv/kzrl/today.html";
                }
            }).error(function(content, httpCode) {
                $scope.errmsg = content;
            });
        }
        if (r.files && r.files.length) {
            r.on('complete', function() {
                console.log('complete');
                var phase = $scope.$root.$$phase;
                if (phase === '$digest' || phase === '$apply') {
                    $scope.progressOfUploadFile = '完成';
                } else {
                    $scope.$apply(function() {
                        $scope.progressOfUploadFile = '完成';
                    });
                }
                r.cancel();
                $scope.submit();
            });
            r.upload();
            return;
        }
        submitWhole();
    };
    var r;
    $http.get('http://xxt.ctsi.com.cn/rest/app/enroll/record/submitkeyGet').success(function(rsp){
        $scope.submitkey = rsp.data;
        r = new Resumable({
            target: 'http://xxt.ctsi.com.cn/rest/app/enroll/record/uploadFile?mpid=' + $scope.mpid + '&aid=' + $scope.aid + '&submitkey=' + $scope.submitkey,
            testChunks: false,
            chunkSize: 512 * 1024,
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
        r.on('error', function(message, file) {
            console.log('error:' + message, file);
            alert('error:' + message);
        });
    });
    var date1 = new Date("2015/08/28 00:00:00");
    var date2 = new Date(); 
    var date3 = date2.getTime()-date1.getTime();
    var leave1 = date3%(24*3600*1000) //计算天数后剩余的毫秒数 
    var leave2 = leave1%(3600*1000) //计算小时数后剩余的毫秒数 
    var minutes = Math.floor(leave2/(60*1000));
    var hours = Math.floor(leave1/(3600*1000));
    $scope.date = hours*60+minutes;
    if (window.shaketv) {
        var sharelink, shareData;
        sharelink = "http://xxt.ctsi.com.cn/rest/app/enroll";
        sharelink += "?mpid=" + $scope.mpid;
        sharelink += "&aid=" + $scope.aid;
        sharelink += "&shareby=";
        shareData = {
            title: "我和"+$scope.date+"人在拍摄#我的胜利日#",
            link: sharelink,
            desc: '一起参加央视新闻#我的胜利日#视频拍摄，铭记历史，缅怀先烈。',
            pic: 'http://xxt.ctsi.com.cn/kcfinder/upload/ad483481fb907d53d74130cd88e11d86/%E5%9B%BE%E7%89%87/%E6%88%91%E7%9A%84%E8%83%9C%E5%88%A9%E6%97%A5/62894570824539309.jpg' 
        };
        window.shaketv.wxShare(shareData.pic, shareData.title, shareData.desc, shareData.link);
    }

}]);
$('<img/>').attr('src', 'http://xxt.ctsi.com.cn/kcfinder/upload/ad483481fb907d53d74130cd88e11d86/%E5%9B%BE%E7%89%87/%E6%8A%97%E6%88%98%E6%97%A5%E5%8E%86/12/top.jpg').load(function() {
    $(this).remove();
    $('body').css('background-image', 'url(http://xxt.ctsi.com.cn/kcfinder/upload/ad483481fb907d53d74130cd88e11d86/%E5%9B%BE%E7%89%87/%E6%8A%97%E6%88%98%E6%97%A5%E5%8E%86/12/top.jpg)');
});
