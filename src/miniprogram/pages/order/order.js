// pages/order/order.js
// 一味鲜 - 订单列表
Page({
    data: {
        tabs: ['全部', '待支付', '待配送', '配送中', '已完成'],
        currentTab: 0,
        orders: [],
        filteredOrders: [],
        statusMap: {
            0: { text: '待支付', color: '#E74C3C', icon: '💰' },
            1: { text: '待确认', color: '#F39C12', icon: '⏳' },
            2: { text: '待配送', color: '#3498DB', icon: '📦' },
            3: { text: '配送中', color: '#2ECC71', icon: '🛵' },
            4: { text: '已完成', color: '#95A5A6', icon: '✅' },
            '-1': { text: '已取消', color: '#BDC3C7', icon: '❌' }
        }
    },

    onShow: function () {
        wx.showTabBar({ animation: false });
        this.loadOrders();
    },

    loadOrders: function () {
        wx.showLoading({ title: '加载中...' });
        wx.cloud.callFunction({
            name: 'getOrders',
            data: { role: 'user' },
            success: (res) => {
                wx.hideLoading();
                const result = res.result;
                if (result && result.success) {
                    // 处理时间显示
                    const orders = result.data.map(o => ({
                        ...o,
                        totalAmount: o.totalAmount || o.totalFee || 0,
                        createTime: o.createTimeStr || o.createTime
                    }));
                    this.setData({ orders });
                    this.filterOrders();
                }
            },
            fail: (err) => {
                wx.hideLoading();
                console.error('获取订单失败:', err);
                // 降级读本地缓存
                const orders = wx.getStorageSync('localOrders') || [];
                orders.forEach(o => {
                    if (o.totalAmount === undefined && o.totalFee !== undefined) {
                        o.totalAmount = o.totalFee;
                    }
                });
                this.setData({ orders });
                this.filterOrders();
            }
        });
    },

    onTabChange: function (e) {
        const index = e.currentTarget.dataset.index;
        this.setData({ currentTab: index });
        this.filterOrders();
    },

    filterOrders: function () {
        const { orders, currentTab } = this.data;
        let filtered;

        if (currentTab === 0) {
            // 全部
            filtered = orders;
        } else {
            // 映射 tab 索引到状态码
            const statusMapping = { 1: 0, 2: 2, 3: 3, 4: 4 };
            const targetStatus = statusMapping[currentTab];
            filtered = orders.filter(o => o.status === targetStatus);
        }

        this.setData({ filteredOrders: filtered });
    },

    // 订单详情（暂时用弹窗展示）
    onOrderTap: function (e) {
        const orderId = e.currentTarget.dataset.id;
        const order = this.data.orders.find(o => o.orderId === orderId);
        if (!order) return;

        const itemsText = order.items.map(i => `${i.name} x${i.quantity}`).join('\n');
        wx.showModal({
            title: '订单详情',
            content: `订单号：${order.orderId}\n\n${itemsText}\n\n合计：¥${order.totalAmount}\n配送：${order.deliveryType === 'pickup' ? '到店自取' : '外卖配送'}`,
            showCancel: false,
            confirmText: '知道了'
        });
    },

    // 模拟取消订单
    onCancelOrder: function (e) {
        const orderId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '取消订单',
            content: '确认取消该订单吗？',
            success: (res) => {
                if (res.confirm) {
                    const orders = this.data.orders.map(o => {
                        if (o.orderId === orderId && o.status === 0) {
                            o.status = -1;
                            o.statusText = '已取消';
                        }
                        return o;
                    });
                    wx.setStorageSync('localOrders', orders);
                    this.setData({ orders });
                    this.filterOrders();
                    wx.showToast({ title: '已取消', icon: 'success' });
                }
            }
        });
    },

    // 再来一单
    onReorder: function (e) {
        const orderId = e.currentTarget.dataset.id;
        const order = this.data.orders.find(o => o.orderId === orderId);
        if (!order) return;

        wx.setStorageSync('cartItems', order.items);
        wx.setStorageSync('cartTotal', order.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
        wx.switchTab({ url: '/pages/index/index' });
        wx.showToast({ title: '已加入购物车', icon: 'success' });
    },

    // 去点餐
    goToMenu: function () {
        wx.switchTab({ url: '/pages/index/index' });
    },

    // 格式化时间
    formatTime: function (date) {
        if (!date) return '';
        const d = new Date(date);
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const hour = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        return `${month}-${day} ${hour}:${min}`;
    }
});
