// pages/admin-goods/admin-goods.js
// 一味鲜 - 菜品管理
Page({
    data: {
        currentCat: 0,
        categories: [],
        displayGoods: []
    },

    onShow: function () {
        this.loadGoods();
    },

    loadGoods: function () {
        // 从首页获取菜品数据（共享同一份数据源）
        const pages = getCurrentPages();
        const indexPage = pages.find(p => p.route === 'pages/index/index');
        
        if (indexPage) {
            const categories = JSON.parse(JSON.stringify(indexPage.data.categories));
            this.setData({
                categories,
                displayGoods: categories[this.data.currentCat].goods
            });
        } else {
            // 如果首页不在栈中，从缓存读
            const cached = wx.getStorageSync('adminGoods');
            if (cached) {
                this.setData({
                    categories: cached,
                    displayGoods: cached[this.data.currentCat].goods
                });
            }
        }
    },

    onCatChange: function (e) {
        const index = e.currentTarget.dataset.index;
        this.setData({
            currentCat: index,
            displayGoods: this.data.categories[index].goods
        });
    },

    // 上架/下架
    onToggleSale: function (e) {
        const id = e.currentTarget.dataset.id;
        const categories = this.data.categories;

        for (let cat of categories) {
            const goods = cat.goods.find(g => g.id === id);
            if (goods) {
                goods.isOnsale = goods.isOnsale === false ? true : false;
                break;
            }
        }

        this.setData({
            categories,
            displayGoods: categories[this.data.currentCat].goods
        });

        // 同步回首页
        this.syncToIndex(categories);

        wx.showToast({
            title: '已更新',
            icon: 'success'
        });
    },

    // 修改价格
    onEditPrice: function (e) {
        const id = e.currentTarget.dataset.id;
        const currentPrice = e.currentTarget.dataset.price;

        wx.showModal({
            title: '修改价格',
            content: '当前价格：¥' + currentPrice,
            editable: true,
            placeholderText: '输入新价格',
            success: (res) => {
                if (res.confirm && res.content) {
                    const newPrice = parseFloat(res.content);
                    if (isNaN(newPrice) || newPrice <= 0) {
                        wx.showToast({ title: '请输入有效价格', icon: 'none' });
                        return;
                    }

                    const categories = this.data.categories;
                    for (let cat of categories) {
                        const goods = cat.goods.find(g => g.id === id);
                        if (goods) {
                            goods.price = newPrice;
                            break;
                        }
                    }

                    this.setData({
                        categories,
                        displayGoods: categories[this.data.currentCat].goods
                    });

                    this.syncToIndex(categories);

                    wx.showToast({ title: '价格已更新', icon: 'success' });
                }
            }
        });
    },

    // 同步数据回首页
    syncToIndex: function (categories) {
        const pages = getCurrentPages();
        const indexPage = pages.find(p => p.route === 'pages/index/index');
        if (indexPage) {
            // 保留首页购物车数据，只更新菜品信息
            const indexCats = indexPage.data.categories;
            for (let i = 0; i < categories.length; i++) {
                for (let j = 0; j < categories[i].goods.length; j++) {
                    const adminGoods = categories[i].goods[j];
                    const indexGoods = indexCats[i].goods[j];
                    if (indexGoods) {
                        indexGoods.price = adminGoods.price;
                        indexGoods.isOnsale = adminGoods.isOnsale;
                    }
                }
            }
            indexPage.setData({ categories: indexCats });
        }
        // 同时缓存一份
        wx.setStorageSync('adminGoods', categories);
    }
});
