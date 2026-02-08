// pages/admin/admin.js
// 一味鲜 - 商家管理后台
Page({
    data: {
        stats: {
            todayOrders: 0,
            todayRevenue: 0,
            pendingOrders: 0
        },
        pendingOrders: [],
        completedOrders: []
    },

    onShow: function () {
        // 权限校验
        const app = getApp();
        if (!app.globalData.isAdmin) {
            wx.showToast({ title: '无权访问', icon: 'error' });
            setTimeout(() => { wx.navigateBack(); }, 500);
            return;
        }
        this.loadData();
    },

    loadData: function () {
        const orders = wx.getStorageSync('localOrders') || [];

        // 兼容旧字段名 totalFee → totalAmount
        orders.forEach(o => {
            if (o.totalAmount === undefined && o.totalFee !== undefined) {
                o.totalAmount = o.totalFee;
            }
        });

        const today = new Date().toLocaleDateString('zh-CN');

        // 今日订单
        const todayOrders = orders.filter(o => {
            const orderDate = new Date(o.createTime).toLocaleDateString('zh-CN');
            return orderDate === today;
        });

        // 待处理（status=0 待支付 或 status=1 待确认）
        const pendingOrders = orders.filter(o => o.status === 0 || o.status === 1).map(o => ({
            ...o,
            statusText: o.status === 0 ? '待支付' : '待确认'
        }));

        // 已完成
        const completedOrders = todayOrders
            .filter(o => o.status === 4 || o.status === 3)
            .map(o => ({
                ...o,
                itemsSummary: (o.items || []).map(i => i.name).join('、')
            }));

        // 今日营收
        const todayRevenue = todayOrders
            .filter(o => o.status >= 1)
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        this.setData({
            stats: {
                todayOrders: todayOrders.length,
                todayRevenue,
                pendingOrders: pendingOrders.length
            },
            pendingOrders,
            completedOrders
        });
    },

    // 接单
    onAcceptOrder: function (e) {
        const orderId = e.currentTarget.dataset.orderId;
        this.updateOrderStatus(orderId, 2, '配送中');
        wx.showToast({ title: '已接单', icon: 'success' });
    },

    // 拒绝订单
    onRejectOrder: function (e) {
        const orderId = e.currentTarget.dataset.orderId;
        wx.showModal({
            title: '确认拒绝',
            content: '确定要拒绝此订单吗？',
            success: (res) => {
                if (res.confirm) {
                    this.updateOrderStatus(orderId, -1, '已取消');
                    wx.showToast({ title: '已拒绝', icon: 'none' });
                }
            }
        });
    },

    // 更新订单状态
    updateOrderStatus: function (orderId, status, statusText) {
        const orders = wx.getStorageSync('localOrders') || [];
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
            order.status = status;
            order.statusText = statusText;
            wx.setStorageSync('localOrders', orders);
            this.loadData();
        }
    },

    goOrderManage: function () {
        wx.navigateTo({ url: '/pages/admin-orders/admin-orders' });
    },

    goGoodsManage: function () {
        wx.navigateTo({ url: '/pages/admin-goods/admin-goods' });
    },

    goSalesStats: function () {
        wx.showToast({ title: '开发中...', icon: 'none' });
    },

    goSettings: function () {
        wx.showToast({ title: '开发中...', icon: 'none' });
    }
});
