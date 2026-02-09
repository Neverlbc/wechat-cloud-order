// 云函数：updateOrder
// 功能：更新订单状态（商家接单、送达、完成等）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const STATUS_MAP = {
  '-1': '已取消',
  '0': '待支付',
  '1': '待确认',
  '2': '配送中',
  '3': '已送达',
  '4': '已完成'
}

exports.main = async (event, context) => {
  const { orderId, status } = event

  if (!orderId || status === undefined) {
    return { success: false, message: '参数不完整' }
  }

  const statusText = STATUS_MAP[String(status)] || '未知'
  const updateData = {
    status,
    statusText,
    updateTime: db.serverDate()
  }

  // 记录关键时间节点
  if (status === 2) updateData.acceptTime = db.serverDate()
  if (status === 3) updateData.deliveredTime = db.serverDate()
  if (status === 4) updateData.completeTime = db.serverDate()
  if (status === -1) updateData.cancelTime = db.serverDate()

  try {
    // 用 orderId 字段查找并更新
    const res = await db.collection('orders')
      .where({ orderId })
      .update({ data: updateData })

    if (res.stats.updated === 0) {
      return { success: false, message: '订单不存在' }
    }

    return { success: true, message: `订单已更新为：${statusText}` }
  } catch (err) {
    console.error('更新订单失败:', err)
    return { success: false, message: '更新失败，请重试' }
  }
}
