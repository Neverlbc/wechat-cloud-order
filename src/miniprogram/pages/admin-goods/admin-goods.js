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
        },
        tempImagePath: '',
        // 新增时的加料列表
        newSpecs: [],
        // 编辑加料弹窗
        showSpecEditor: false,
        editingGoodsId: '',
        editingGoodsName: '',
        editSpecs: []
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
            tempImagePath: '',
            newSpecs: [],
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

    // ========== 新增表单 - 加料管理 ==========
    onAddNewSpec: function () {
        const specs = this.data.newSpecs;
        specs.push({ name: '', price: '' });
        this.setData({ newSpecs: specs });
    },

    onNewSpecNameInput: function (e) {
        const idx = e.currentTarget.dataset.idx;
        this.setData({ ['newSpecs[' + idx + '].name']: e.detail.value });
    },

    onNewSpecPriceInput: function (e) {
        const idx = e.currentTarget.dataset.idx;
        this.setData({ ['newSpecs[' + idx + '].price']: e.detail.value });
    },

    onRemoveNewSpec: function (e) {
        const idx = e.currentTarget.dataset.idx;
        const specs = this.data.newSpecs;
        specs.splice(idx, 1);
        this.setData({ newSpecs: specs });
    },

    // ========== 已有菜品 - 编辑加料 ==========
    onEditSpecs: function (e) {
        const id = e.currentTarget.dataset.id;
        const goods = this.data.allGoods.find(g => g.id === id);
        if (!goods) return;

        const editSpecs = (goods.specs || []).map(s => ({ name: s.name, price: String(s.price) }));
        this.setData({
            showSpecEditor: true,
            editingGoodsId: id,
            editingGoodsName: goods.name,
            editSpecs: editSpecs
        });
    },

    onHideSpecEditor: function () {
        this.setData({ showSpecEditor: false });
    },

    onAddEditSpec: function () {
        const specs = this.data.editSpecs;
        specs.push({ name: '', price: '' });
        this.setData({ editSpecs: specs });
    },

    onEditSpecNameInput: function (e) {
        const idx = e.currentTarget.dataset.idx;
        this.setData({ ['editSpecs[' + idx + '].name']: e.detail.value });
    },

    onEditSpecPriceInput: function (e) {
        const idx = e.currentTarget.dataset.idx;
        this.setData({ ['editSpecs[' + idx + '].price']: e.detail.value });
    },

    onRemoveEditSpec: function (e) {
        const idx = e.currentTarget.dataset.idx;
        const specs = this.data.editSpecs;
        specs.splice(idx, 1);
        this.setData({ editSpecs: specs });
    },

    onSaveSpecs: function () {
        const specs = this.data.editSpecs
            .filter(s => s.name && s.name.trim())
            .map(s => ({ name: s.name.trim(), price: parseFloat(s.price) || 0 }));

        wx.showLoading({ title: '保存中...' });
        this._callUpdateGoods({
            goodsId: this.data.editingGoodsId,
            updateData: {
                specs: specs,
                hasSpecs: specs.length > 0
            }
        }).then(res => {
            wx.hideLoading();
            if (res.result && res.result.success) {
                wx.showToast({ title: '加料已更新', icon: 'success' });
                this.setData({ showSpecEditor: false });
                this.loadGoods();
            } else {
                wx.showToast({ title: '保存失败', icon: 'none' });
            }
        }).catch(err => {
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
        });
    },

    // 选择图片
    onChooseImage: function () {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                this.setData({ tempImagePath: res.tempFiles[0].tempFilePath });
            }
        });
    },

    // 删除已选图片
    onRemoveImage: function () {
        this.setData({ tempImagePath: '' });
    },

    // 上传图片到云存储
    _uploadImage: function (filePath) {
        const ext = filePath.split('.').pop();
        const cloudPath = 'goods/' + Date.now() + '-' + Math.random().toString(36).substr(2, 8) + '.' + ext;
        return wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath
        });
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

        // 处理加料
        const specs = this.data.newSpecs
            .filter(s => s.name && s.name.trim())
            .map(s => ({ name: s.name.trim(), price: parseFloat(s.price) || 0 }));

        const doAdd = (imageUrl) => {
            this._callUpdateGoods({
                action: 'add',
                goodsData: {
                    name: name.trim(),
                    desc: desc.trim(),
                    price: parseFloat(price),
                    catId: catId,
                    image: imageUrl,
                    hasSpecs: specs.length > 0,
                    specs: specs
                }
            }).then(res => {
                wx.hideLoading();
                if (res.result && res.result.success) {
                    wx.showToast({ title: '新增成功', icon: 'success' });
                    this.setData({ showAddForm: false, tempImagePath: '' });
                    this.loadGoods();
                } else {
                    wx.showToast({ title: res.result?.message || '新增失败', icon: 'none' });
                }
            }).catch(err => {
                wx.hideLoading();
                console.error('新增失败:', err);
                wx.showToast({ title: '操作失败', icon: 'none' });
            });
        };

        // 有图片则先上传，无图片用默认
        if (this.data.tempImagePath) {
            this._uploadImage(this.data.tempImagePath).then(uploadRes => {
                doAdd(uploadRes.fileID);
            }).catch(err => {
                wx.hideLoading();
                console.error('图片上传失败:', err);
                wx.showToast({ title: '图片上传失败', icon: 'none' });
            });
        } else {
            doAdd('');
        }
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

    // ========== 更换图片 ==========
    onChangeImage: function (e) {
        const goodsId = e.currentTarget.dataset.id;
        const goodsName = e.currentTarget.dataset.name || '菜品';

        if (!goodsId) {
            wx.showToast({ title: '商品ID无效', icon: 'none' });
            return;
        }

        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempFilePath = res.tempFiles[0].tempFilePath;
                wx.showLoading({ title: '上传中...' });

                // 上传新图片到云存储
                this._uploadImage(tempFilePath).then(uploadRes => {
                    const newImageUrl = uploadRes.fileID;

                    // 使用云函数更新指定商品的图片
                    return this._callUpdateGoods({
                        goodsId: goodsId,
                        updateData: { image: newImageUrl }
                    });
                }).then(updateRes => {
                    wx.hideLoading();
                    if (updateRes.result && updateRes.result.success) {
                        wx.showToast({ title: '图片已更新', icon: 'success' });
                        this.loadGoods(); // 重新加载商品列表
                    } else {
                        wx.showToast({ title: updateRes.result?.message || '更新失败', icon: 'none' });
                    }
                }).catch(err => {
                    wx.hideLoading();
                    console.error('更换图片失败:', err);
                    wx.showToast({ title: '操作失败，请重试', icon: 'none' });
                });
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
