// pages/admin-orders/admin-orders.js
// 一味鲜 - 商家订单管理
Page({
    data: {
        currentTab: 0,
        tabs: [
            { label: '全部', status: -99, count: 0 },
            { label: '待支付', status: 0, count: 0 },
            { label: '待确认', status: 1, count: 0 },
            { label: '配送中', status: 2, count: 0 },
            { label: '已送达', status: 3, count: 0 },
            { label: '已完成', status: 4, count: 0 }
        ],
        allOrders: [],
        filteredOrders: []
    },

    onShow: function () {
        const app = getApp();
        if (!app.globalData.isAdmin) {
            wx.showToast({ title: '无权访问', icon: 'error' });
            setTimeout(() => { wx.navigateBack(); }, 500);
            return;
        }
        this.loadOrders();
    },

    loadOrders: function () {
        const orders = wx.getStorageSync('localOrders') || [];

        // 兼容旧字段名 totalFee → totalAmount
        orders.forEach(o => {
            if (o.totalAmount === undefined && o.totalFee !== undefined) {
                o.totalAmount = o.totalFee;
            }
        });

        const tabs = this.data.tabs.map(tab => {
            if (tab.status === -99) {
                tab.count = orders.length;
            } else {
                tab.count = orders.filter(o => o.status === tab.status).length;
            }
            return tab;
        });

        this.setData({ allOrders: orders, tabs });
        this.filterOrders();
    },

    filterOrders: function () {
        const tab = this.data.tabs[this.data.currentTab];
        let filtered;
        if (tab.status === -99) {
            filtered = this.data.allOrders;
        } else {
            filtered = this.data.allOrders.filter(o => o.status === tab.status);
        }
        this.setData({ filteredOrders: filtered });
    },

    onTabChange: function (e) {
        const index = e.currentTarget.dataset.index;
        this.setData({ currentTab: index });
        this.filterOrders();
    },

    // 接单 (待确认 → 配送中)
    onAcceptOrder: function (e) {
        this.updateStatus(e.currentTarget.dataset.id, 2, '配送中');
        wx.showToast({ title: '已接单', icon: 'success' });
    },

    // 拒绝
    onRejectOrder: function (e) {
        const id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认拒绝',
            content: '拒绝后订单将被取消，确定吗？',
            success: (res) => {
                if (res.confirm) {
                    this.updateStatus(id, -1, '已取消');
                    wx.showToast({ title: '已拒绝', icon: 'none' });
                }
            }
        });
    },

    // 取消待支付
    onCancelOrder: function (e) {
        this.updateStatus(e.currentTarget.dataset.id, -1, '已取消');
        wx.showToast({ title: '已取消', icon: 'none' });
    },

    // 确认送达
    onDelivered: function (e) {
        this.updateStatus(e.currentTarget.dataset.id, 3, '已送达');
        wx.showToast({ title: '已送达', icon: 'success' });
    },

    // 完成订单
    onComplete: function (e) {
        this.updateStatus(e.currentTarget.dataset.id, 4, '已完成');
        wx.showToast({ title: '订单完成', icon: 'success' });
    },

    updateStatus: function (orderId, status, statusText) {
        const orders = wx.getStorageSync('localOrders') || [];
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
            order.status = status;
            order.statusText = statusText;
            if (status === 2) order.acceptTime = new Date().toLocaleString('zh-CN');
            if (status === 3) order.deliveredTime = new Date().toLocaleString('zh-CN');
            if (status === 4) order.completeTime = new Date().toLocaleString('zh-CN');
            wx.setStorageSync('localOrders', orders);
            this.loadOrders();
        }
    }
});
