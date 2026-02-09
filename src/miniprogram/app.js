// app.js
App({
    onLaunch: function () {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力');
        } else {
            wx.cloud.init({
                env: 'cloudbase-3glf88ov18f18409',
                traceUser: true,
            });
        }

        this.globalData = {
            // 商家管理密码（后续可改为云数据库配置）
            adminPin: '203128',
            isAdmin: false
        };

        // 登录检查
        this.checkLogin();
    },

    // 检查用户是否已登录
    checkLogin: function () {
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo && userInfo.nickName && userInfo.avatarUrl) {
            this.globalData.userInfo = userInfo;
            this.globalData.isLogin = true;
        } else {
            this.globalData.isLogin = false;
        }
    },

    // 全局登录引导（其他页面调用）
    requireLogin: function (callback) {
        if (this.globalData.isLogin) {
            callback && callback();
            return true;
        }
        wx.navigateTo({ url: '/pages/login/login' });
        return false;
    }
});
