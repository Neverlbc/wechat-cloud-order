// pages/index/index.js
// 一味鲜 - 点餐首页（纯中文版）
Page({
    data: {
        currentCategory: 0,
        scrollIntoView: '',
        cartTotal: 0,
        cartCount: 0,
        showCartDetail: false,
        categories: [
            {
                id: 'cat_1',
                name: '砂锅粉',
                goods: [
                    {
                        id: 'g001',
                        name: '酸汤砂锅粉',
                        desc: '酸爽开胃，汤底浓郁',
                        price: 15,
                        image: 'https://picsum.photos/seed/noodle1/300/300',
                        quantity: 0
                    },
                    {
                        id: 'g002',
                        name: '麻辣砂锅粉',
                        desc: '麻辣鲜香，过瘾解馋',
                        price: 16,
                        image: 'https://picsum.photos/seed/noodle2/300/300',
                        quantity: 0
                    },
                    {
                        id: 'g003',
                        name: '香菇鸡肉砂锅粉',
                        desc: '鸡肉嫩滑，香菇鲜美',
                        price: 18,
                        image: 'https://picsum.photos/seed/noodle3/300/300',
                        quantity: 0
                    },
                    {
                        id: 'g004',
                        name: '牛腩砂锅粉',
                        desc: '牛腩软烂，入口即化',
                        price: 22,
                        image: 'https://picsum.photos/seed/noodle4/300/300',
                        quantity: 0
                    }
                ]
            },
            {
                id: 'cat_2',
                name: '砂锅粥',
                goods: [
                    {
                        id: 'g005',
                        name: '砂锅鸡粥',
                        desc: '鸡肉嫩滑，粥底绵密',
                        price: 18,
                        image: 'https://picsum.photos/seed/porridge1/300/300',
                        quantity: 0
                    },
                    {
                        id: 'g006',
                        name: '砂锅鱼片粥',
                        desc: '鱼片鲜嫩，营养丰富',
                        price: 25,
                        image: 'https://picsum.photos/seed/porridge2/300/300',
                        quantity: 0
                    },
                    {
                        id: 'g007',
                        name: '皮蛋瘦肉粥',
                        desc: '经典口味，老少皆宜',
                        price: 15,
                        image: 'https://picsum.photos/seed/porridge3/300/300',
                        quantity: 0
                    }
                ]
            },
            {
                id: 'cat_3',
                name: '特色小吃',
                goods: [
                    {
                        id: 'g008',
                        name: '特色水晶鸡',
                        desc: '皮脆肉嫩，晶莹剔透',
                        price: 38,
                        image: 'https://picsum.photos/seed/chicken1/300/300',
                        quantity: 0
                    },
                    {
                        id: 'g009',
                        name: '香辣鸭中翅',
                        desc: '香辣可口，下饭神器',
                        price: 28,
                        image: 'https://picsum.photos/seed/wings1/300/300',
                        quantity: 0
                    }
                ]
            },
            {
                id: 'cat_4',
                name: '饮品',
                goods: [
                    {
                        id: 'g010',
                        name: '凉茶',
                        desc: '清热解暑',
                        price: 5,
                        image: 'https://picsum.photos/seed/tea1/300/300',
                        quantity: 0
                    },
                    {
                        id: 'g011',
                        name: '柠檬水',
                        desc: '酸甜可口',
                        price: 6,
                        image: 'https://picsum.photos/seed/lemon1/300/300',
                        quantity: 0
                    }
                ]
            }
        ]
    },

    onLoad: function (options) { },

    onCategoryTap: function (e) {
        const index = e.currentTarget.dataset.index;
        this.setData({
            currentCategory: index,
            scrollIntoView: 'cat_' + (index + 1)
        });
    },

    addToCart: function (e) {
        const { catIndex, goodsIndex } = e.currentTarget.dataset;
        this.updateQuantity(catIndex, goodsIndex, 1);
    },

    increaseQty: function (e) {
        const { catIndex, goodsIndex } = e.currentTarget.dataset;
        this.updateQuantity(catIndex, goodsIndex, 1);
    },

    decreaseQty: function (e) {
        const { catIndex, goodsIndex } = e.currentTarget.dataset;
        this.updateQuantity(catIndex, goodsIndex, -1);
    },

    updateQuantity: function (catIndex, goodsIndex, delta) {
        const categories = this.data.categories;
        const goods = categories[catIndex].goods[goodsIndex];
        goods.quantity = Math.max(0, goods.quantity + delta);

        let cartTotal = 0;
        let cartCount = 0;
        categories.forEach(cat => {
            cat.goods.forEach(g => {
                cartTotal += g.price * g.quantity;
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

    showCartDetail: function () {
        if (this.data.cartCount > 0) {
            this.setData({ showCartDetail: true });
        }
    },

    hideCartDetail: function () {
        this.setData({ showCartDetail: false });
    },

    clearCart: function () {
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

    goToCheckout: function () {
        // 收集已选商品
        const selectedItems = [];
        this.data.categories.forEach(cat => {
            cat.goods.forEach(g => {
                if (g.quantity > 0) {
                    selectedItems.push({
                        id: g.id,
                        name: g.name,
                        price: g.price,
                        quantity: g.quantity
                    });
                }
            });
        });

        // 存储到本地，跳转到结算页
        wx.setStorageSync('cartItems', selectedItems);
        wx.setStorageSync('cartTotal', this.data.cartTotal);
        wx.navigateTo({
            url: '/pages/checkout/checkout'
        });
    }
});
