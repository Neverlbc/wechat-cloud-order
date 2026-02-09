// pages/admin-stats/admin-stats.js
// 一味鲜 - 销售统计
const db = wx.cloud.database()
const _ = db.command

Page({
    data: {
        currentTab: 0,
        tabs: ['今日', '近7天', '近30天'],
        summary: {
            totalOrders: 0,
            totalRevenue: 0,
            avgOrderAmount: 0,
            completedOrders: 0
        },
        hotGoods: [],
        dailyStats: [],
        statusDistribution: []
    },

    onShow: function () {
        const app = getApp();
        if (!app.globalData.isAdmin) {
            wx.showToast({ title: '无权访问', icon: 'error' });
            setTimeout(() => { wx.navigateBack(); }, 500);
            return;
        }
        this.loadStats();
    },

    onTabChange: function (e) {
        const index = e.currentTarget.dataset.index;
        this.setData({ currentTab: index });
        this.loadStats();
    },

    loadStats: function () {
        wx.showLoading({ title: '统计中...' });
        wx.cloud.callFunction({
            name: 'getOrders',
            data: { role: 'admin', pageSize: 1000 },
            success: (res) => {
                wx.hideLoading();
                const result = res.result;
                if (!result || !result.success) return;

                const orders = result.data;
                const now = new Date();
                const dayMs = 24 * 60 * 60 * 1000;

                // 根据选中的时间范围过滤
                let days = 1;
                if (this.data.currentTab === 1) days = 7;
                if (this.data.currentTab === 2) days = 30;

                const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);
                const filtered = orders.filter(o => {
                    const t = o.createTimeStr || o.createTime;
                    if (!t) return false;
                    return new Date(t) >= startDate;
                });

                // 有效订单（不含已取消）
                const validOrders = filtered.filter(o => o.status >= 0);
                // 已完成订单（status >= 1，已支付及之后的）
                const paidOrders = filtered.filter(o => o.status >= 1);

                // 汇总数据
                const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || o.totalFee || 0), 0);
                const summary = {
                    totalOrders: validOrders.length,
                    totalRevenue: totalRevenue.toFixed(0),
                    avgOrderAmount: paidOrders.length > 0 ? (totalRevenue / paidOrders.length).toFixed(1) : '0',
                    completedOrders: filtered.filter(o => o.status === 4).length
                };

                // 热销商品统计
                const goodsMap = {};
                paidOrders.forEach(o => {
                    (o.items || []).forEach(item => {
                        const key = item.name;
                        if (!goodsMap[key]) {
                            goodsMap[key] = { name: key, count: 0, revenue: 0 };
                        }
                        goodsMap[key].count += item.quantity || 1;
                        goodsMap[key].revenue += (item.price + (item.extraFee || 0)) * (item.quantity || 1);
                    });
                });
                const hotGoods = Object.values(goodsMap)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((g, i) => ({ ...g, rank: i + 1, revenue: g.revenue.toFixed(0) }));

                // 每日统计（近7天或近30天才显示）
                const dailyStats = [];
                if (days > 1) {
                    for (let i = days - 1; i >= 0; i--) {
                        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                        const dateStr = (d.getMonth() + 1) + '/' + d.getDate();
                        const dayOrders = paidOrders.filter(o => {
                            const t = new Date(o.createTimeStr || o.createTime);
                            return t.getFullYear() === d.getFullYear() &&
                                   t.getMonth() === d.getMonth() &&
                                   t.getDate() === d.getDate();
                        });
                        const dayRevenue = dayOrders.reduce((s, o) => s + (o.totalAmount || o.totalFee || 0), 0);
                        dailyStats.push({
                            date: dateStr,
                            orders: dayOrders.length,
                            revenue: dayRevenue.toFixed(0)
                        });
                    }
                }

                // 订单状态分布
                const statusNames = { 0: '待支付', 1: '待确认', 2: '配送中', 3: '已送达', 4: '已完成', '-1': '已取消' };
                const statusCount = {};
                filtered.forEach(o => {
                    const key = String(o.status);
                    statusCount[key] = (statusCount[key] || 0) + 1;
                });
                const statusDistribution = Object.keys(statusCount).map(k => ({
                    name: statusNames[k] || '未知',
                    count: statusCount[k],
                    percent: ((statusCount[k] / filtered.length) * 100).toFixed(0)
                }));

                // 计算热销商品的最大销量（用于进度条宽度）
                const maxCount = hotGoods.length > 0 ? hotGoods[0].count : 1;
                hotGoods.forEach(g => {
                    g.barWidth = Math.max(10, (g.count / maxCount) * 100);
                });

                // 计算每日收入的最大值
                const maxRevenue = dailyStats.length > 0 ? Math.max(...dailyStats.map(d => parseFloat(d.revenue)), 1) : 1;
                dailyStats.forEach(d => {
                    d.barHeight = Math.max(5, (parseFloat(d.revenue) / maxRevenue) * 100);
                });

                this.setData({ summary, hotGoods, dailyStats, statusDistribution });
            },
            fail: (err) => {
                wx.hideLoading();
                console.error('统计加载失败:', err);
                wx.showToast({ title: '加载失败', icon: 'none' });
            }
        });
    }
});
