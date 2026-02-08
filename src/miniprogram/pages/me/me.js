// pages/me/me.js
// 一味鲜 - 个人中心
Page({
    data: {
        userInfo: null,
        isLogin: false,
        isAdmin: false,
        tapCount: 0,
        tapTimer: null,
        orderStats: { pending: 0, delivering: 0, completed: 0 },
        menuItems: [
            { icon: '📍', title: '收货地址', action: 'address' },
            { icon: '💬', title: '联系客服', action: 'contact' },
            { icon: '⭐', title: '给个好评', action: 'rate' },
            { icon: 'ℹ️', title: '关于我们', action: 'about' }
        ]
    },

    onShow: function () {
        // 加载登录状态
        const app = getApp();
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo && userInfo.nickName) {
            this.setData({ userInfo, isLogin: true, isAdmin: app.globalData.isAdmin });
            app.globalData.isLogin = true;
            app.globalData.userInfo = userInfo;
        } else {
            this.setData({ isLogin: false, userInfo: null, isAdmin: false });
        }
        this.loadOrderStats();
    },

    loadOrderStats: function () {
        const orders = wx.getStorageSync('localOrders') || [];
        const stats = {
            pending: orders.filter(o => o.status === 0).length,
            delivering: orders.filter(o => o.status === 2 || o.status === 3).length,
            completed: orders.filter(o => o.status === 4).length
        };
        this.setData({ orderStats: stats });
    },

    // 跳转登录页
    goLogin: function () {
        wx.navigateTo({ url: '/pages/login/login' });
    },

    // 获取用户头像
    onChooseAvatar: function (e) {
        const avatarUrl = e.detail.avatarUrl;
        const userInfo = this.data.userInfo || {};
        userInfo.avatarUrl = avatarUrl;
        this.setData({ userInfo, isLogin: true });
        wx.setStorageSync('userInfo', userInfo);
    },

    // 获取用户昵称
    onNicknameInput: function (e) {
        const nickName = e.detail.value;
        const userInfo = this.data.userInfo || {};
        userInfo.nickName = nickName;
        this.setData({ userInfo });
        wx.setStorageSync('userInfo', userInfo);
    },

    // 快捷入口 - 跳转到对应的订单 tab
    goToOrders: function (e) {
        const type = e.currentTarget.dataset.type;
        wx.switchTab({ url: '/pages/order/order' });
    },

    // 查看全部订单
    goAllOrders: function () {
        wx.switchTab({ url: '/pages/order/order' });
    },

    // 菜单项点击
    onMenuTap: function (e) {
        const action = e.currentTarget.dataset.action;
        switch (action) {
            case 'admin':
                this.enterAdmin();
                break;
            case 'address':
                this.manageAddress();
                break;
            case 'contact':
                wx.showModal({
                    title: '联系我们',
                    content: '电话：138-XXXX-XXXX\n地址：一味鲜粉店（XXX路XX号）\n营业时间：07:00 - 22:00',
                    showCancel: false,
                    confirmText: '知道了'
                });
                break;
            case 'rate':
                wx.showToast({ title: '感谢支持 ❤️', icon: 'none' });
                break;
            case 'about':
                wx.showModal({
                    title: '关于一味鲜',
                    content: '一味鲜粉店，专注砂锅美食。\n传承传统做法，甄选优质食材，\n只为每一碗的鲜香滋味。',
                    showCancel: false,
                    confirmText: '好的'
                });
                break;
        }
    },

    // 地址管理
    manageAddress: function () {
        const address = wx.getStorageSync('lastAddress');
        if (address && address.name) {
            wx.showModal({
                title: '当前配送地址',
                content: `${address.name}  ${address.phone}\n${address.detail}`,
                confirmText: '好的',
                showCancel: false
            });
        } else {
            wx.showToast({ title: '暂无保存地址', icon: 'none' });
        }
    },

    // 商家管理入口（需要密码验证）
    enterAdmin: function () {
        const app = getApp();
        if (app.globalData.isAdmin) {
            wx.navigateTo({ url: '/pages/admin/admin' });
            return;
        }
        wx.showModal({
            title: '商家验证',
            editable: true,
            placeholderText: '请输入管理密码',
            success: (res) => {
                if (res.confirm) {
                    if (res.content === app.globalData.adminPin) {
                        app.globalData.isAdmin = true;
                        this.setData({ isAdmin: true });
                        wx.showToast({ title: '验证成功', icon: 'success' });
                        setTimeout(() => {
                            wx.navigateTo({ url: '/pages/admin/admin' });
                        }, 500);
                    } else {
                        wx.showToast({ title: '密码错误', icon: 'error' });
                    }
                }
            }
        });
    },

    // 连点版本号5次触发商家管理
    onVersionTap: function () {
        const app = getApp();
        if (app.globalData.isAdmin) {
            wx.navigateTo({ url: '/pages/admin/admin' });
            return;
        }

        clearTimeout(this.data.tapTimer);
        const count = this.data.tapCount + 1;

        if (count >= 5) {
            this.setData({ tapCount: 0 });
            this.enterAdmin();
        } else {
            this.setData({ tapCount: count });
            if (count >= 3) {
                wx.showToast({ title: '再点' + (5 - count) + '次', icon: 'none', duration: 800 });
            }
            const timer = setTimeout(() => {
                this.setData({ tapCount: 0 });
            }, 2000);
            this.setData({ tapTimer: timer });
        }
    }
});
