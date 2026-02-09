// 云函数 - updateGoods
// 管理端商品管理（增删改）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { action, goodsId, updateData, goodsData } = event

  // ========== 新增商品 ==========
  if (action === 'add') {
    if (!goodsData || !goodsData.name || !goodsData.catId) {
      return { success: false, message: '商品名称和分类不能为空' }
    }

    try {
      // 生成唯一 goodsId（使用时间戳 + 随机字符串，确保绝对唯一）
      const timestamp = Date.now().toString(36)
      const randomStr = Math.random().toString(36).substr(2, 6)
      const newGoodsId = 'g' + timestamp + randomStr

      const newGoods = {
        goodsId: newGoodsId,
        catId: goodsData.catId,
        name: goodsData.name,
        desc: goodsData.desc || '',
        price: parseFloat(goodsData.price) || 10,
        image: goodsData.image || 'https://picsum.photos/seed/' + newGoodsId + '/300/300',
        hasSpecs: goodsData.hasSpecs || false,
        specs: goodsData.specs || [],
        onSale: true,
        sort: Date.now()
      }

      const addRes = await db.collection('goods').add({ data: newGoods })

      return {
        success: true,
        message: '新增成功',
        _id: addRes._id,
        goodsId: newGoodsId
      }
    } catch (err) {
      console.error('新增商品失败:', err)
      return { success: false, message: err.message }
    }
  }

  // ========== 删除商品 ==========
  if (action === 'delete') {
    if (!goodsId) {
      return { success: false, message: '商品ID不能为空' }
    }

    try {
      const res = await db.collection('goods').where({ goodsId: goodsId }).remove()

      return {
        success: true,
        message: '删除成功',
        removed: res.stats.removed
      }
    } catch (err) {
      console.error('删除商品失败:', err)
      return { success: false, message: err.message }
    }
  }

  // ========== 更新商品 ==========
  if (!goodsId || !updateData) {
    return { success: false, message: '参数缺失' }
  }

  // 只允许更新安全字段
  const allowedFields = ['price', 'onSale', 'name', 'desc', 'image', 'sort', 'hasSpecs', 'specs']
  const safeData = {}
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      safeData[key] = updateData[key]
    }
  }

  if (Object.keys(safeData).length === 0) {
    return { success: false, message: '没有可更新的字段' }
  }

  try {
    const res = await db.collection('goods').where({ goodsId: goodsId }).update({
      data: safeData
    })

    return {
      success: true,
      message: '更新成功',
      updated: res.stats.updated
    }
  } catch (err) {
    console.error('更新商品失败:', err)
    return { success: false, message: err.message }
  }
}
