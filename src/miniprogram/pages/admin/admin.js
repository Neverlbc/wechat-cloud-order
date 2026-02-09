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
        wx.showLoading({ title: '加载中...' });
        wx.cloud.callFunction({
            name: 'getOrders',
            data: { role: 'admin' },
            success: (res) => {
                wx.hideLoading();
                const result = res.result;
                if (!result || !result.success) return;

                const orders = result.data.map(o => ({
                    ...o,
                    totalAmount: o.totalAmount || o.totalFee || 0,
                    createTime: o.createTimeStr || o.createTime
                }));

                const today = new Date().toLocaleDateString('zh-CN');
                const todayOrders = orders.filter(o => {
                    const d = o.createTime ? new Date(o.createTime).toLocaleDateString('zh-CN') : '';
                    return d === today;
                });

                const pendingOrders = orders.filter(o => o.status === 0 || o.status === 1).map(o => ({
                    ...o,
                    statusText: o.status === 0 ? '待支付' : '待确认'
                }));

                const completedOrders = todayOrders
                    .filter(o => o.status === 4 || o.status === 3)
                    .map(o => ({
                        ...o,
                        itemsSummary: (o.items || []).map(i => i.name).join('、')
                    }));

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
            fail: (err) => {
                wx.hideLoading();
                console.error('加载数据失败:', err);
            }
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
        wx.cloud.callFunction({
            name: 'updateOrder',
            data: { orderId, status },
            success: (res) => {
                const result = res.result;
                if (result && result.success) {
                    this.loadData();
                }
            },
            fail: (err) => {
                console.error('更新订单失败:', err);
            }
        });
    },

    goOrderManage: function () {
        wx.navigateTo({ url: '/pages/admin-orders/admin-orders' });
    },

    goGoodsManage: function () {
        wx.navigateTo({ url: '/pages/admin-goods/admin-goods' });
    },

    goSalesStats: function () {
        wx.navigateTo({ url: '/pages/admin-stats/admin-stats' });
    },

    goSettings: function () {
        wx.navigateTo({ url: '/pages/admin-settings/admin-settings' });
    }
});
