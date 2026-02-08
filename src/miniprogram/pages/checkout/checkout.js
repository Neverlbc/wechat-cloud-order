// pages/checkout/checkout.js
Page({
    data: {
        cartItems: [],
        cartTotal: 0,
        totalCount: 0,
        deliveryType: 'delivery', // delivery | pickup
        deliveryFee: 0,
        packingFee: 1,
        totalAmount: 0,
        remark: '',
        canSubmit: false,
        showAddressModal: false,
        address: {},
        addressForm: {
            name: '',
            phone: '',
            detail: ''
        }
    },

    onLoad: function () {
        // 未登录时引导登录
        const app = getApp();
        if (!app.globalData.isLogin) {
            wx.navigateTo({ url: '/pages/login/login' });
            return;
        }
        this.loadCartData();
    },

    onShow: function () {
        this.loadCartData();
    },

    loadCartData: function () {
        const cartItems = wx.getStorageSync('cartItems') || [];
        const cartTotal = wx.getStorageSync('cartTotal') || 0;

        // 计算每项小计（含加料费）
        let totalCount = 0;
        cartItems.forEach(item => {
            const extra = (item.extraFee || 0) * item.quantity;
            item.subtotal = item.price * item.quantity + extra;
            totalCount += item.quantity;
        });

        // 读取缓存地址
        const savedAddress = wx.getStorageSync('lastAddress') || {};

        this.setData({
            cartItems,
            cartTotal,
            totalCount,
            address: savedAddress,
            canSubmit: !!savedAddress.name
        });

        this.calcTotal();
    },

    // 计算总价
    calcTotal: function () {
        const { cartTotal, deliveryType, deliveryFee, packingFee } = this.data;
        const fee = deliveryType === 'pickup' ? 0 : deliveryFee;
        const total = cartTotal + fee + packingFee;
        this.setData({
            totalAmount: total,
            deliveryFee: fee
        });
    },

    // 切换配送方式
    onDeliveryChange: function (e) {
        const type = e.currentTarget.dataset.type;
        this.setData({ deliveryType: type });
        // 自取时配送费为零
        if (type === 'pickup') {
            this.setData({ deliveryFee: 0 });
        } else {
            this.setData({ deliveryFee: 0 });
        }
        this.calcTotal();
    },

    // 备注输入
    onRemarkInput: function (e) {
        this.setData({ remark: e.detail.value });
    },

    // 打开地址编辑
    onEditAddress: function () {
        this.setData({
            showAddressModal: true,
            addressForm: {
                name: this.data.address.name || '',
                phone: this.data.address.phone || '',
                detail: this.data.address.detail || ''
            }
        });
    },

    // 关闭地址弹窗
    onCloseAddressModal: function () {
        this.setData({ showAddressModal: false });
    },

    // 地址表单输入
    onAddressInput: function (e) {
        const field = e.currentTarget.dataset.field;
        this.setData({
            [`addressForm.${field}`]: e.detail.value
        });
    },

    // 保存地址
    onSaveAddress: function () {
        const { name, phone, detail } = this.data.addressForm;

        if (!name.trim()) {
            wx.showToast({ title: '请输入联系人', icon: 'none' });
            return;
        }
        if (!/^1\d{10}$/.test(phone)) {
            wx.showToast({ title: '请输入正确手机号', icon: 'none' });
            return;
        }
        if (!detail.trim()) {
            wx.showToast({ title: '请输入详细地址', icon: 'none' });
            return;
        }

        const address = { name: name.trim(), phone, detail: detail.trim() };
        this.setData({
            address,
            canSubmit: true,
            showAddressModal: false
        });

        // 缓存地址方便下次使用
        wx.setStorageSync('lastAddress', address);
    },

    // 提交订单
    onSubmitOrder: function () {
        if (!this.data.canSubmit) {
            wx.showToast({ title: '请先填写地址', icon: 'none' });
            return;
        }

        if (this.data.cartItems.length === 0) {
            wx.showToast({ title: '购物车为空', icon: 'none' });
            return;
        }

        wx.showLoading({ title: '提交中...' });

        // 构建订单数据（后续对接云函数）
        const orderData = {
            items: this.data.cartItems,
            totalAmount: this.data.totalAmount,
            deliveryType: this.data.deliveryType,
            deliveryFee: this.data.deliveryFee,
            packingFee: this.data.packingFee,
            address: this.data.address,
            remark: this.data.remark,
            status: 0, // 待支付
            createTime: new Date()
        };

        // TODO: 对接云函数创建订单 + 微信支付
        // wx.cloud.callFunction({
        //     name: 'createOrder',
        //     data: orderData,
        //     success: res => { ... }
        // });

        // 模拟下单成功
        setTimeout(() => {
            wx.hideLoading();

            // 存储订单到本地（临时方案，后续换成云数据库）
            const orders = wx.getStorageSync('localOrders') || [];
            orderData.orderId = 'ORD' + Date.now();
            orderData.statusText = '待支付';
            orders.unshift(orderData);
            wx.setStorageSync('localOrders', orders);

            // 清空购物车缓存
            wx.removeStorageSync('cartItems');
            wx.removeStorageSync('cartTotal');

            wx.showTabBar({ animation: false });
            wx.showModal({
                title: '下单成功 🎉',
                content: '订单号：' + orderData.orderId,
                showCancel: false,
                confirmText: '查看订单',
                success: () => {
                    wx.switchTab({ url: '/pages/order/order' });
                }
            });
        }, 800);
    }
});
