// pages/admin-goods/admin-goods.js
// 一味鲜 - 菜品管理（云数据库版 - 支持增删改）
const db = wx.cloud.database()

Page({
    data: {
        currentCat: 0,
        categories: [],
        allGoods: [],
        displayGoods: [],
        // 新增菜品表单
        showAddForm: false,
        newGoods: {
            name: '',
            desc: '',
            price: '',
            catId: ''
        }
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

            const currentCat = this.data.currentCat;
            const displayGoods = categories.length > 0
                ? allGoods.filter(g => g.catId === categories[currentCat].id)
                : [];

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

    // ========== 调用云函数 ==========
    _callUpdateGoods: function (data) {
        return wx.cloud.callFunction({
            name: 'updateGoods',
            data: data
        });
    },

    // ========== 新增菜品 ==========
    onShowAddForm: function () {
        const catId = this.data.categories[this.data.currentCat]?.id || '';
        this.setData({
            showAddForm: true,
            newGoods: { name: '', desc: '', price: '', catId: catId }
        });
    },

    onHideAddForm: function () {
        this.setData({ showAddForm: false });
    },

    onNewNameInput: function (e) {
        this.setData({ 'newGoods.name': e.detail.value });
    },

    onNewDescInput: function (e) {
        this.setData({ 'newGoods.desc': e.detail.value });
    },

    onNewPriceInput: function (e) {
        this.setData({ 'newGoods.price': e.detail.value });
    },

    onNewCatChange: function (e) {
        const idx = e.detail.value;
        this.setData({ 'newGoods.catId': this.data.categories[idx].id });
    },

    onSubmitAdd: function () {
        const { name, desc, price, catId } = this.data.newGoods;
        if (!name.trim()) {
            wx.showToast({ title: '请输入菜品名称', icon: 'none' });
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            wx.showToast({ title: '请输入有效价格', icon: 'none' });
            return;
        }

        wx.showLoading({ title: '新增中...' });
        this._callUpdateGoods({
            action: 'add',
            goodsData: {
                name: name.trim(),
                desc: desc.trim(),
                price: parseFloat(price),
                catId: catId
            }
        }).then(res => {
            wx.hideLoading();
            if (res.result && res.result.success) {
                wx.showToast({ title: '新增成功', icon: 'success' });
                this.setData({ showAddForm: false });
                this.loadGoods();
            } else {
                wx.showToast({ title: res.result?.message || '新增失败', icon: 'none' });
            }
        }).catch(err => {
            wx.hideLoading();
            console.error('新增失败:', err);
            wx.showToast({ title: '操作失败', icon: 'none' });
        });
    },

    // ========== 删除菜品 ==========
    onDeleteGoods: function (e) {
        const id = e.currentTarget.dataset.id;
        const name = e.currentTarget.dataset.name;

        wx.showModal({
            title: '确认删除',
            content: '确定删除「' + name + '」吗？此操作不可恢复。',
            confirmColor: '#EE4444',
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '删除中...' });
                    this._callUpdateGoods({
                        action: 'delete',
                        goodsId: id
                    }).then(res => {
                        wx.hideLoading();
                        if (res.result && res.result.success) {
                            wx.showToast({ title: '已删除', icon: 'success' });
                            this.loadGoods();
                        } else {
                            wx.showToast({ title: res.result?.message || '删除失败', icon: 'none' });
                        }
                    }).catch(err => {
                        wx.hideLoading();
                        console.error('删除失败:', err);
                        wx.showToast({ title: '操作失败', icon: 'none' });
                    });
                }
            }
        });
    },

    // ========== 上架/下架 ==========
    onToggleSale: function (e) {
        const id = e.currentTarget.dataset.id;
        const goods = this.data.allGoods.find(g => g.id === id);
        if (!goods) return;

        const newOnSale = !goods.onSale;
        wx.showLoading({ title: '更新中...' });
        this._callUpdateGoods({
            goodsId: id,
            updateData: { onSale: newOnSale }
        }).then(res => {
            wx.hideLoading();
            if (res.result && res.result.success) {
                wx.showToast({ title: newOnSale ? '已上架' : '已下架', icon: 'success' });
                this.loadGoods();
            } else {
                wx.showToast({ title: res.result?.message || '操作失败', icon: 'none' });
            }
        }).catch(err => {
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
        });
    },

    // ========== 修改价格 ==========
    onEditPrice: function (e) {
        const id = e.currentTarget.dataset.id;
        const currentPrice = e.currentTarget.dataset.price;

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
                    this._callUpdateGoods({
                        goodsId: id,
                        updateData: { price: newPrice }
                    }).then(res => {
                        wx.hideLoading();
                        if (res.result && res.result.success) {
                            wx.showToast({ title: '价格已更新', icon: 'success' });
                            this.loadGoods();
                        } else {
                            wx.showToast({ title: '操作失败', icon: 'none' });
                        }
                    }).catch(err => {
                        wx.hideLoading();
                        wx.showToast({ title: '操作失败', icon: 'none' });
                    });
                }
            }
        });
    },

    // ========== 修改名称 ==========
    onEditName: function (e) {
        const id = e.currentTarget.dataset.id;
        const currentName = e.currentTarget.dataset.name;

        wx.showModal({
            title: '修改菜名',
            editable: true,
            placeholderText: '当前：' + currentName,
            success: (res) => {
                if (res.confirm && res.content && res.content.trim()) {
                    wx.showLoading({ title: '更新中...' });
                    this._callUpdateGoods({
                        goodsId: id,
                        updateData: { name: res.content.trim() }
                    }).then(res => {
                        wx.hideLoading();
                        if (res.result && res.result.success) {
                            wx.showToast({ title: '名称已更新', icon: 'success' });
                            this.loadGoods();
                        } else {
                            wx.showToast({ title: '操作失败', icon: 'none' });
                        }
                    }).catch(err => {
                        wx.hideLoading();
                        wx.showToast({ title: '操作失败', icon: 'none' });
                    });
                }
            }
        });
    }
});
