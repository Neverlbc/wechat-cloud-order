// pages/admin-goods/admin-goods.js
// 一味鲜 - 菜品管理（云数据库版）
const db = wx.cloud.database()

Page({
    data: {
        currentCat: 0,
        categories: [],
        allGoods: [],
        displayGoods: []
    },

    onShow: function () {
        this.loadGoods();
    },

    loadGoods: function () {
        wx.showLoading({ title: '加载中...' });
        Promise.all([
            db.collection('categories').orderBy('sort', 'asc').get(),
            db.collection('goods').orderBy('sort', 'asc').get()
        ]).then(([catRes, goodsRes]) => {
            wx.hideLoading();
            const categories = catRes.data.map(c => ({
                id: c.catId,
                name: c.name
            }));
            const allGoods = goodsRes.data.map(g => ({
                _id: g._id,
                id: g.goodsId,
                catId: g.catId,
                name: g.name,
                desc: g.desc,
                price: g.price,
                image: g.image,
                hasSpecs: g.hasSpecs || false,
                specs: g.specs || [],
                onSale: g.onSale !== false
            }));

            const displayGoods = allGoods.filter(g => g.catId === categories[this.data.currentCat].id);

            this.setData({ categories, allGoods, displayGoods });
        }).catch(err => {
            wx.hideLoading();
            console.error('加载菜品失败:', err);
            wx.showToast({ title: '加载失败', icon: 'none' });
        });
    },

    onCatChange: function (e) {
        const index = e.currentTarget.dataset.index;
        const catId = this.data.categories[index].id;
        this.setData({
            currentCat: index,
            displayGoods: this.data.allGoods.filter(g => g.catId === catId)
        });
    },

    // 上架/下架
    onToggleSale: function (e) {
        const id = e.currentTarget.dataset.id;
        const goods = this.data.allGoods.find(g => g.id === id);
        if (!goods) return;

        const newOnSale = !goods.onSale;
        wx.showLoading({ title: '更新中...' });
        db.collection('goods').doc(goods._id).update({
            data: { onSale: newOnSale }
        }).then(() => {
            wx.hideLoading();
            wx.showToast({ title: newOnSale ? '已上架' : '已下架', icon: 'success' });
            this.loadGoods();
        }).catch(err => {
            wx.hideLoading();
            console.error('更新失败:', err);
            wx.showToast({ title: '操作失败', icon: 'none' });
        });
    },

    // 修改价格
    onEditPrice: function (e) {
        const id = e.currentTarget.dataset.id;
        const currentPrice = e.currentTarget.dataset.price;
        const goods = this.data.allGoods.find(g => g.id === id);
        if (!goods) return;

        wx.showModal({
            title: '修改价格',
            editable: true,
            placeholderText: '当前 ¥' + currentPrice + '，输入新价格',
            success: (res) => {
                if (res.confirm && res.content) {
                    const newPrice = parseFloat(res.content);
                    if (isNaN(newPrice) || newPrice <= 0) {
                        wx.showToast({ title: '请输入有效价格', icon: 'none' });
                        return;
                    }

                    wx.showLoading({ title: '更新中...' });
                    db.collection('goods').doc(goods._id).update({
                        data: { price: newPrice }
                    }).then(() => {
                        wx.hideLoading();
                        wx.showToast({ title: '价格已更新', icon: 'success' });
                        this.loadGoods();
                    }).catch(err => {
                        wx.hideLoading();
                        console.error('改价失败:', err);
                        wx.showToast({ title: '操作失败', icon: 'none' });
                    });
                }
            }
        });
    }
});
