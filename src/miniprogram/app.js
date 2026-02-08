// app.js
App({
    onLaunch: function () {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力');
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入您的环境 ID, 环境 ID 可打开云开发控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                // env: 'my-env-id',
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
