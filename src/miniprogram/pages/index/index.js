// pages/index/index.js
// 一味鲜 - 点餐首页（云数据库版）
const db = wx.cloud.database()

Page({
    data: {
        currentCategory: 0,
        scrollIntoView: '',
        cartTotal: 0,
        cartCount: 0,
        showCartDetail: false,
        categories: [],
        loading: true
    },

    onLoad: function (options) {
        this.loadGoodsFromCloud();
    },

    // 页面显示时检查是否有待恢复的购物车（用于 switchTab 跳转）
    onShow: function () {
        // 如果商品已加载完成，检查并恢复购物车
        if (this.data.categories.length > 0 && !this.data.loading) {
            this.restoreCartFromCache();
        }
    },

    // 从云数据库加载商品数据
    loadGoodsFromCloud: function () {
        this.setData({ loading: true });

        Promise.all([
            db.collection('categories').orderBy('sort', 'asc').get(),
            db.collection('goods').where({ onSale: true }).orderBy('sort', 'asc').get()
        ]).then(([catRes, goodsRes]) => {
            const categories = catRes.data.map(cat => ({
                id: cat.catId,
                name: cat.name,
                goods: goodsRes.data
                    .filter(g => g.catId === cat.catId)
                    .map(g => ({
                        id: g.goodsId,
                        _id: g._id,
                        name: g.name,
                        desc: g.desc,
                        price: g.price,
                        image: g.image,
                        hasSpecs: g.hasSpecs || false,
                        specs: (g.specs || []).map(s => ({ ...s, checked: false })),
                        quantity: 0,
                        selectedSpecs: [],
                        specDesc: '',
                        extraFee: 0
                    }))
            }));

            this.setData({ categories, loading: false });
            console.log('[loadGoods] 云端加载成功，分类:', categories.length, '商品:', goodsRes.data.length);

            // 🔄 检查是否有"再来一单"的购物车数据需要恢复
            this.restoreCartFromCache();
        }).catch(err => {
            console.error('[loadGoods] 云端加载失败，使用本地备份', err);
            this.loadLocalFallback();
        });
    },

    // 云端加载失败时的本地降级方案
    loadLocalFallback: function () {
        const categories = [
            {
                id: 'cat_1', name: '砂锅粉',
                goods: [
                    { id: 'g001', name: '酸汤砂锅粉', desc: '酸爽开胃，汤底浓郁', price: 10, image: 'https://picsum.photos/seed/noodle1/300/300', quantity: 0, hasSpecs: true, specs: [{ name: '卤蛋', price: 2, checked: false }, { name: '瘦肉', price: 3, checked: false }, { name: '肥肠', price: 5, checked: false }, { name: '猪脚', price: 6, checked: false }, { name: '豆腐泡', price: 2, checked: false }] },
                    { id: 'g002', name: '麻辣砂锅粉', desc: '麻辣鲜香，过瘾解馋', price: 10, image: 'https://picsum.photos/seed/noodle2/300/300', quantity: 0, hasSpecs: true, specs: [{ name: '卤蛋', price: 2, checked: false }, { name: '瘦肉', price: 3, checked: false }, { name: '肥肠', price: 5, checked: false }, { name: '猪脚', price: 6, checked: false }, { name: '豆腐泡', price: 2, checked: false }] },
                    { id: 'g003', name: '香菇鸡肉砂锅粉', desc: '鸡肉嫩滑，香菇鲜美', price: 10, image: 'https://picsum.photos/seed/noodle3/300/300', quantity: 0, hasSpecs: true, specs: [{ name: '卤蛋', price: 2, checked: false }, { name: '瘦肉', price: 3, checked: false }, { name: '肥肠', price: 5, checked: false }, { name: '猪脚', price: 6, checked: false }, { name: '豆腐泡', price: 2, checked: false }] },
                    { id: 'g004', name: '牛腩砂锅粉', desc: '牛腩软烂，入口即化', price: 10, image: 'https://picsum.photos/seed/noodle4/300/300', quantity: 0, hasSpecs: true, specs: [{ name: '卤蛋', price: 2, checked: false }, { name: '瘦肉', price: 3, checked: false }, { name: '肥肠', price: 5, checked: false }, { name: '猪脚', price: 6, checked: false }, { name: '豆腐泡', price: 2, checked: false }] }
                ]
            },
            {
                id: 'cat_2', name: '砂锅粥',
                goods: [
                    { id: 'g005', name: '砂锅鸡粥', desc: '鸡肉嫩滑，粥底绵密', price: 10, image: 'https://picsum.photos/seed/porridge1/300/300', quantity: 0, hasSpecs: true, specs: [{ name: '加蛋', price: 2, checked: false }, { name: '加青菜', price: 1, checked: false }, { name: '加虾', price: 5, checked: false }] },
                    { id: 'g006', name: '砂锅鱼片粥', desc: '鱼片鲜嫩，营养丰富', price: 10, image: 'https://picsum.photos/seed/porridge2/300/300', quantity: 0, hasSpecs: true, specs: [{ name: '加蛋', price: 2, checked: false }, { name: '加青菜', price: 1, checked: false }, { name: '加虾', price: 5, checked: false }] },
                    { id: 'g007', name: '皮蛋瘦肉粥', desc: '经典口味，老少皆宜', price: 10, image: 'https://picsum.photos/seed/porridge3/300/300', quantity: 0, hasSpecs: true, specs: [{ name: '加蛋', price: 2, checked: false }, { name: '加青菜', price: 1, checked: false }, { name: '加虾', price: 5, checked: false }] }
                ]
            },
            {
                id: 'cat_3', name: '特色小吃',
                goods: [
                    { id: 'g008', name: '特色水晶鸡', desc: '皮脆肉嫩，晶莹剔透', price: 10, image: 'https://picsum.photos/seed/chicken1/300/300', quantity: 0, hasSpecs: false },
                    { id: 'g009', name: '香辣鸭中翅', desc: '香辣可口，下饭神器', price: 10, image: 'https://picsum.photos/seed/wings1/300/300', quantity: 0, hasSpecs: false }
                ]
            },
            {
                id: 'cat_4', name: '饮品',
                goods: [
                    { id: 'g010', name: '凉茶', desc: '清热解暑', price: 10, image: 'https://picsum.photos/seed/tea1/300/300', quantity: 0, hasSpecs: false },
                    { id: 'g011', name: '柠檬水', desc: '酸甜可口', price: 10, image: 'https://picsum.photos/seed/lemon1/300/300', quantity: 0, hasSpecs: false }
                ]
            }
        ];
        this.setData({ categories, loading: false });
    },

    // 🔄 从缓存恢复购物车数据（用于"再来一单"）
    restoreCartFromCache: function () {
        const cachedItems = wx.getStorageSync('cartItems');
        const cachedTotal = wx.getStorageSync('cartTotal');

        // 如果没有缓存数据，直接返回
        if (!cachedItems || cachedItems.length === 0) {
            return;
        }

        console.log('[restoreCart] 发现缓存购物车数据:', cachedItems);

        const categories = this.data.categories;
        let cartTotal = 0;
        let cartCount = 0;
        let restoredCount = 0;

        // 遍历缓存的商品，恢复到当前商品列表中
        cachedItems.forEach(cachedItem => {
            for (let catIndex = 0; catIndex < categories.length; catIndex++) {
                const goods = categories[catIndex].goods;
                for (let goodsIndex = 0; goodsIndex < goods.length; goodsIndex++) {
                    const g = goods[goodsIndex];
                    // 通过商品ID或名称匹配
                    if (g.id === cachedItem.id || g.name === cachedItem.name) {
                        g.quantity = cachedItem.quantity || 1;
                        g.selectedSpecs = cachedItem.selectedSpecs || [];
                        g.specDesc = cachedItem.specDesc || '';
                        g.extraFee = cachedItem.extraFee || 0;
                        restoredCount++;
                        break;
                    }
                }
            }
        });

        // 重新计算购物车总额
        categories.forEach(cat => {
            cat.goods.forEach(g => {
                const extra = (g.extraFee || 0) * g.quantity;
                cartTotal += g.price * g.quantity + extra;
                cartCount += g.quantity;
            });
        });

        this.setData({ categories, cartTotal, cartCount });

        // 清除缓存（已恢复完毕）
        wx.removeStorageSync('cartItems');
        wx.removeStorageSync('cartTotal');

        // 如果有商品，隐藏TabBar
        if (cartCount > 0) {
            wx.hideTabBar({ animation: true });
            wx.showToast({
                title: `已恢复${restoredCount}件商品`,
                icon: 'success',
                duration: 1500
            });
        }

        console.log('[restoreCart] 恢复完成，共', restoredCount, '件商品');
    },

    // 点击商品进入详情页
    onGoodsTap: function (e) {
        const catIndex = e.currentTarget.dataset.catIndex;
        const goodsIndex = e.currentTarget.dataset.goodsIndex;
        wx.navigateTo({
            url: `/pages/detail/detail?catIndex=${catIndex}&goodsIndex=${goodsIndex}`
        });
    },

    onCategoryTap: function (e) {
        const index = e.currentTarget.dataset.index;
        this.setData({
            currentCategory: index,
            scrollIntoView: 'category-' + index
        });
    },

    // 通过商品 ID 查找索引
    findGoodsIndex: function (goodsId) {
        const categories = this.data.categories;
        for (let catIndex = 0; catIndex < categories.length; catIndex++) {
            const goods = categories[catIndex].goods;
            for (let goodsIndex = 0; goodsIndex < goods.length; goodsIndex++) {
                if (goods[goodsIndex].id === goodsId) {
                    return { catIndex, goodsIndex };
                }
            }
        }
        return null;
    },

    // 加入购物车 / 增加数量
    onPlus: function (e) {
        const goods = e.currentTarget.dataset.goods;
        const indices = this.findGoodsIndex(goods.id);
        if (indices) {
            this.updateQuantity(indices.catIndex, indices.goodsIndex, 1);
        }
    },

    // 减少数量
    onMinus: function (e) {
        const goods = e.currentTarget.dataset.goods;
        const indices = this.findGoodsIndex(goods.id);
        if (indices) {
            this.updateQuantity(indices.catIndex, indices.goodsIndex, -1);
        }
    },

    updateQuantity: function (catIndex, goodsIndex, delta) {
        const categories = this.data.categories;
        const goods = categories[catIndex].goods[goodsIndex];
        goods.quantity = Math.max(0, goods.quantity + delta);

        // 数量归零时清除加料信息
        if (goods.quantity === 0) {
            goods.selectedSpecs = [];
            goods.specDesc = '';
            goods.extraFee = 0;
        }

        let cartTotal = 0;
        let cartCount = 0;
        categories.forEach(cat => {
            cat.goods.forEach(g => {
                const extra = (g.extraFee || 0) * g.quantity;
                cartTotal += g.price * g.quantity + extra;
                cartCount += g.quantity;
            });
        });

        this.setData({
            categories,
            cartTotal,
            cartCount
        });

        // 🚀 核心优化：有菜品时隐藏 TabBar，让结算条贴合底部
        if (cartCount > 0) {
            wx.hideTabBar({ animation: true });
        } else {
            wx.showTabBar({ animation: true });
            this.setData({ showCartDetail: false });
        }
    },

    // 购物车弹窗里点击商品名跳详情
    onCartItemTap: function (e) {
        const goods = e.currentTarget.dataset.goods;
        const indices = this.findGoodsIndex(goods.id);
        if (indices) {
            this.setData({ showCartDetail: false });
            wx.navigateTo({
                url: `/pages/detail/detail?catIndex=${indices.catIndex}&goodsIndex=${indices.goodsIndex}`
            });
        }
    },

    showCartDetail: function () {
        if (this.data.cartCount > 0) {
            wx.hideTabBar({ animation: true });
            this.setData({ showCartDetail: true });
        }
    },

    hideCartDetail: function () {
        this.setData({ showCartDetail: false });
        wx.showTabBar({ animation: true });
    },

    // 清空购物车
    onClearCart: function () {
        const categories = this.data.categories;
        categories.forEach(cat => {
            cat.goods.forEach(g => {
                g.quantity = 0;
            });
        });
        this.setData({
            categories,
            cartTotal: 0,
            cartCount: 0,
            showCartDetail: false
        });
        wx.showTabBar({ animation: true });
    },

    clearCart: function () {
        this.onClearCart();
    },

    goToCheckout: function () {
        // 未登录时引导登录
        const app = getApp();
        if (!app.globalData.isLogin) {
            wx.navigateTo({ url: '/pages/login/login' });
            return;
        }

        // 先关闭弹窗
        this.setData({ showCartDetail: false });

        // 收集已选商品（含加料信息）
        const selectedItems = [];
        this.data.categories.forEach(cat => {
            cat.goods.forEach(g => {
                if (g.quantity > 0) {
                    selectedItems.push({
                        id: g.id,
                        name: g.name,
                        price: g.price,
                        quantity: g.quantity,
                        specDesc: g.specDesc || '',
                        selectedSpecs: g.selectedSpecs || [],
                        extraFee: g.extraFee || 0
                    });
                }
            });
        });

        console.log('[goToCheckout] selectedItems:', JSON.stringify(selectedItems));
        console.log('[goToCheckout] cartTotal:', this.data.cartTotal);

        // 存储到本地，跳转到结算页
        wx.setStorageSync('cartItems', selectedItems);
        wx.setStorageSync('cartTotal', this.data.cartTotal);
        wx.navigateTo({
            url: '/pages/checkout/checkout'
        });
    },

    // WXML 中用的方法名
    goCheckout: function () {
        this.goToCheckout();
    }
});
