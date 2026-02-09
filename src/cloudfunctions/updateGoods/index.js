// 云函数 - updateGoods
// 管理端更新商品信息（价格、上下架等）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { goodsId, updateData } = event

  if (!goodsId || !updateData) {
    return { success: false, message: '参数缺失' }
  }

  // 只允许更新安全字段
  const allowedFields = ['price', 'onSale', 'name', 'desc', 'image', 'sort']
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
    // 通过 goodsId 字段查找商品
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
