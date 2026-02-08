// pages/login/login.js
Page({
    data: {
        avatarUrl: '',
        defaultAvatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI9npoQ76V5YTIsrgHJRs0ia0NAtc5aeFDcjKIo9IFy0sVAU9w3EFy1GzONyIl6sO9gcDDIA/0',
        nickName: '',
        canLogin: false,
        agreed: true
    },

    onLoad: function () {
        // 如果已登录，直接跳回首页
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo && userInfo.nickName && userInfo.avatarUrl) {
            wx.switchTab({ url: '/pages/index/index' });
        }
    },

    // 选择头像
    onChooseAvatar: function (e) {
        const avatarUrl = e.detail.avatarUrl;
        this.setData({ avatarUrl });
        this.checkCanLogin();
    },

    // 昵称输入
    onNicknameInput: function (e) {
        this.setData({ nickName: e.detail.value });
        this.checkCanLogin();
    },

    // 昵称失焦
    onNicknameBlur: function (e) {
        this.setData({ nickName: e.detail.value });
        this.checkCanLogin();
    },

    // 检查是否可登录
    checkCanLogin: function () {
        const { avatarUrl, nickName, agreed } = this.data;
        const canLogin = !!(avatarUrl && nickName && nickName.trim() && agreed);
        this.setData({ canLogin });
    },

    // 切换协议同意
    onToggleAgreement: function () {
        this.setData({ agreed: !this.data.agreed });
        this.checkCanLogin();
    },

    // 查看隐私政策
    onShowPrivacy: function () {
        wx.showModal({
            title: '用户协议与隐私政策',
            content: '一味鲜粉店小程序尊重并保护您的隐私。我们仅收集您的微信昵称和头像用于展示，收货地址用于配送服务。您的信息将严格保密，不会用于其他用途。',
            showCancel: false,
            confirmText: '我知道了'
        });
    },

    // 登录
    onLogin: function () {
        if (!this.data.canLogin) {
            if (!this.data.agreed) {
                wx.showToast({ title: '请先同意用户协议', icon: 'none' });
            } else if (!this.data.avatarUrl) {
                wx.showToast({ title: '请选择头像', icon: 'none' });
            } else {
                wx.showToast({ title: '请输入昵称', icon: 'none' });
            }
            return;
        }

        wx.showLoading({ title: '登录中...' });

        // 调用 wx.login 获取 code（用于后续获取 openid）
        wx.login({
            success: (loginRes) => {
                const userInfo = {
                    avatarUrl: this.data.avatarUrl,
                    nickName: this.data.nickName.trim(),
                    loginTime: new Date().toISOString(),
                    code: loginRes.code // 后续可用云函数换取 openid
                };

                // 存储用户信息
                wx.setStorageSync('userInfo', userInfo);

                // TODO: 云函数获取 openid 并存入云数据库
                // wx.cloud.callFunction({
                //     name: 'login',
                //     data: { code: loginRes.code },
                //     success: res => {
                //         userInfo.openid = res.result.openid;
                //         wx.setStorageSync('userInfo', userInfo);
                //     }
                // });

                setTimeout(() => {
                    wx.hideLoading();
                    wx.showToast({
                        title: '欢迎您，' + userInfo.nickName,
                        icon: 'none',
                        duration: 1500
                    });

                    // 更新全局数据
                    const app = getApp();
                    app.globalData.userInfo = userInfo;

                    // 跳转到首页
                    setTimeout(() => {
                        wx.switchTab({ url: '/pages/index/index' });
                    }, 500);
                }, 600);
            },
            fail: () => {
                wx.hideLoading();
                wx.showToast({ title: '登录失败，请重试', icon: 'none' });
            }
        });
    }
});
