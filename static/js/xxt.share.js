(function () {
    var setWxShare = function (title, link, desc, img) {
        window.wx.onMenuShareTimeline({
            title: title,
            link: link,
            imgUrl: img,
            success: function () { window.xxt.share.options.logger && window.xxt.share.options.logger('T'); },
            cancel: function () { }
        });
        window.wx.onMenuShareAppMessage({
            title: title,
            desc: desc,
            link: link,
            imgUrl: img,
            success: function () { window.xxt.share.options.logger && window.xxt.share.options.logger('F'); },
            cancel: function () { }
        });
    };
    var setYxShare = function (title, link, desc, img) {
        var shareData = {
            'img_url': img,
            'link': link,
            'title': title,
            'desc': desc
        };
        window.YixinJSBridge.on('menu:share:appmessage', function (argv) {
            window.YixinJSBridge.invoke('sendAppMessage', shareData, function (res) { window.xxt.share.options.logger && window.xxt.share.options.logger('F'); });
        });
        window.YixinJSBridge.on('menu:share:timeline', function (argv) {
            window.YixinJSBridge.invoke('shareTimeline', shareData, function (res) { window.xxt.share.options.logger && window.xxt.share.options.logger('T'); });
        });
    };
    window.xxt === undefined && (window.xxt = {});
    window.xxt.share = {
        options: {},
        set: function (title, link, desc, img, fnOther) {
            if (/Android/i.test(navigator.userAgent) || /iPhone/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent)) {
                img.indexOf('http') === -1 && (img = 'http://' + location.hostname + img);
                if (/MicroMessenger/i.test(navigator.userAgent)) {
                    window.wx.ready(function () {
                        setWxShare(title, link, desc, img);
                    });
                } else if (/YiXin/i.test(navigator.userAgent)) {
                    if (window.YixinJSBridge === undefined) {
                        document.addEventListener('YixinJSBridgeReady', function () {
                            setYxShare(title, link, desc, img);
                        }, false);
                    } else {
                        setYxShare(title, link, desc, img);
                    }
                } else if (fnOther && typeof fnOther === 'function') {
                    fnOther(title, link, desc, img);
                }
            }
        }
    };
})();