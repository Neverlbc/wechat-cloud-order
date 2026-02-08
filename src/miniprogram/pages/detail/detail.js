// pages/detail/detail.js
// 一味鲜 - 商品详情 + 自选加料
Page({
    data: {
        goods: {},
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        selectedSpicy: 1, // 默认中辣
        spicyOptions: [],
        selectedSpecsText: '',
        // 从首页传来的索引
        catIndex: -1,
        goodsIndex: -1
    },

    onLoad: function (options) {
        const catIndex = parseInt(options.catIndex);
        const goodsIndex = parseInt(options.goodsIndex);

        // 从首页获取商品数据
        const pages = getCurrentPages();
        const indexPage = pages.find(p => p.route === 'pages/index/index');

        if (indexPage) {
            const categories = indexPage.data.categories;
            const goods = JSON.parse(JSON.stringify(categories[catIndex].goods[goodsIndex]));

            // 砂锅粉和砂锅粥需要选辣度
            const category = categories[catIndex];
            let spicyOptions = [];
            if (category.id === 'cat_1' || category.id === 'cat_2') {
                spicyOptions = ['不辣', '微辣', '中辣', '特辣'];
            }

            // 重置加料选择
            if (goods.specs) {
                goods.specs.forEach(s => s.checked = false);
            }

            this.setData({
                goods,
                catIndex,
                goodsIndex,
                spicyOptions,
                unitPrice: goods.price,
                totalPrice: goods.price
            });
        }
    },

    // 辣度选择
    onSpicyChange: function (e) {
        this.setData({ selectedSpicy: e.currentTarget.dataset.index });
    },

    // 加料切换
    onSpecToggle: function (e) {
        const index = e.currentTarget.dataset.index;
        const key = `goods.specs[${index}].checked`;
        const checked = !this.data.goods.specs[index].checked;
        this.setData({ [key]: checked });
        this.calcPrice();
    },

    // 数量 +
    onQuantityPlus: function () {
        this.setData({ quantity: this.data.quantity + 1 });
        this.calcPrice();
    },

    // 数量 -
    onQuantityMinus: function () {
        if (this.data.quantity > 1) {
            this.setData({ quantity: this.data.quantity - 1 });
            this.calcPrice();
        }
    },

    // 计算价格
    calcPrice: function () {
        const { goods, quantity } = this.data;
        let specsPrice = 0;
        let specsNames = [];

        if (goods.specs) {
            goods.specs.forEach(s => {
                if (s.checked) {
                    specsPrice += s.price;
                    specsNames.push(s.name);
                }
            });
        }

        const unitPrice = goods.price + specsPrice;
        const totalPrice = unitPrice * quantity;
        const selectedSpecsText = specsNames.length > 0 ? '加料：' + specsNames.join('、') : '';

        this.setData({ unitPrice, totalPrice, selectedSpecsText });
    },

    // 加入购物车
    onAddToCart: function () {
        const { goods, quantity, unitPrice, totalPrice, selectedSpicy, spicyOptions } = this.data;

        // 收集已选加料
        const selectedSpecs = [];
        if (goods.specs) {
            goods.specs.forEach(s => {
                if (s.checked) {
                    selectedSpecs.push({ name: s.name, price: s.price });
                }
            });
        }

        // 组装规格描述
        let specDesc = '';
        if (spicyOptions.length > 0) {
            specDesc += spicyOptions[selectedSpicy];
        }
        if (selectedSpecs.length > 0) {
            specDesc += (specDesc ? '，' : '') + '加' + selectedSpecs.map(s => s.name).join('/');
        }

        // 回到首页更新购物车
        const pages = getCurrentPages();
        const indexPage = pages.find(p => p.route === 'pages/index/index');

        if (indexPage) {
            // 更新首页该商品的数量和加料信息
            const { catIndex, goodsIndex } = this.data;
            const categories = indexPage.data.categories;
            const targetGoods = categories[catIndex].goods[goodsIndex];
            targetGoods.quantity += quantity;
            // 保存加料和辣度信息到商品数据
            targetGoods.selectedSpecs = selectedSpecs;
            targetGoods.specDesc = specDesc;
            targetGoods.extraFee = selectedSpecs.reduce((sum, s) => sum + s.price, 0);

            // 重新计算购物车总价和总数
            let cartTotal = 0;
            let cartCount = 0;
            categories.forEach(cat => {
                cat.goods.forEach(g => {
                    const extra = (g.extraFee || 0) * g.quantity;
                    cartTotal += g.price * g.quantity + extra;
                    cartCount += g.quantity;
                });
            });

            indexPage.setData({
                categories,
                cartTotal,
                cartCount
            });

            // 有商品时隐藏 TabBar
            if (cartCount > 0) {
                wx.hideTabBar({ animation: true });
            }
        }

        wx.showToast({
            title: '已加入购物车',
            icon: 'success',
            duration: 1200
        });

        setTimeout(() => {
            wx.navigateBack();
        }, 800);
    },

    goBack: function () {
        wx.navigateBack();
    }
});
