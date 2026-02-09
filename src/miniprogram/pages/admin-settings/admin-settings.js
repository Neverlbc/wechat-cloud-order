// pages/admin-settings/admin-settings.js
// 一味鲜 - 店铺设置
const db = wx.cloud.database()

Page({
    data: {
        shopInfo: {
            name: '一味鲜粉店',
            phone: '',
            address: '',
            notice: '',
            openTime: '08:00',
            closeTime: '22:00',
            deliveryFee: 0,
            packingFee: 1,
            minOrderAmount: 0,
            isOpen: true
        },
        hasConfig: false
    },

    onShow: function () {
        const app = getApp();
        if (!app.globalData.isAdmin) {
            wx.showToast({ title: '无权访问', icon: 'error' });
            setTimeout(() => { wx.navigateBack(); }, 500);
            return;
        }
        this.loadSettings();
    },

    loadSettings: function () {
        db.collection('settings').doc('shop_config').get().then(res => {
            this.setData({
                shopInfo: { ...this.data.shopInfo, ...res.data },
                hasConfig: true
            });
        }).catch(() => {
            // 首次使用，无配置
            this.setData({ hasConfig: false });
        });
    },

    // 表单输入
    onInput: function (e) {
        const field = e.currentTarget.dataset.field;
        let value = e.detail.value;

        // 数字字段转换
        if (['deliveryFee', 'packingFee', 'minOrderAmount'].includes(field)) {
            value = parseFloat(value) || 0;
        }

        this.setData({
            [`shopInfo.${field}`]: value
        });
    },

    // 切换营业状态
    onToggleOpen: function () {
        this.setData({
            'shopInfo.isOpen': !this.data.shopInfo.isOpen
        });
    },

    // 保存设置
    onSave: function () {
        const { shopInfo } = this.data;

        if (!shopInfo.phone) {
            wx.showToast({ title: '请填写联系电话', icon: 'none' });
            return;
        }

        wx.showLoading({ title: '保存中...' });

        const saveData = {
            ...shopInfo,
            _id: undefined,
            updateTime: db.serverDate()
        };
        delete saveData._id;

        if (this.data.hasConfig) {
            db.collection('settings').doc('shop_config').update({
                data: saveData
            }).then(() => {
                wx.hideLoading();
                wx.showToast({ title: '保存成功', icon: 'success' });
            }).catch(err => {
                wx.hideLoading();
                console.error('保存失败:', err);
                wx.showToast({ title: '保存失败', icon: 'none' });
            });
        } else {
            db.collection('settings').add({
                data: { _id: 'shop_config', ...saveData }
            }).then(() => {
                wx.hideLoading();
                this.setData({ hasConfig: true });
                wx.showToast({ title: '保存成功', icon: 'success' });
            }).catch(err => {
                wx.hideLoading();
                console.error('保存失败:', err);
                wx.showToast({ title: '保存失败', icon: 'none' });
            });
        }
    },

    // 修改管理密码
    onChangePin: function () {
        wx.showModal({
            title: '修改管理密码',
            editable: true,
            placeholderText: '输入新密码（至少4位）',
            success: (res) => {
                if (res.confirm && res.content) {
                    const newPin = res.content.trim();
                    if (newPin.length < 4) {
                        wx.showToast({ title: '密码至少4位', icon: 'none' });
                        return;
                    }
                    const app = getApp();
                    app.globalData.adminPin = newPin;
                    wx.showToast({ title: '密码已修改', icon: 'success' });
                }
            }
        });
    },

    // 清除所有订单数据（危险操作）
    onClearOrders: function () {
        wx.showModal({
            title: '⚠️ 危险操作',
            content: '确定要清除所有本地缓存订单数据吗？云端数据不受影响。',
            confirmColor: '#EE4444',
            success: (res) => {
                if (res.confirm) {
                    wx.removeStorageSync('localOrders');
                    wx.showToast({ title: '已清除', icon: 'success' });
                }
            }
        });
    }
});
