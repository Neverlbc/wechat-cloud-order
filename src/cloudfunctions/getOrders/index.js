// 云函数：getOrders
// 功能：获取订单列表（用户端获取自己的，商家端获取全部）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { role, status, page = 1, pageSize = 20 } = event

  let query = {}

  if (role === 'admin') {
    // 商家端：查询全部订单
    if (status !== undefined && status !== -99) {
      query.status = status
    }
  } else {
    // 用户端：只查自己的订单
    query.openid = openid
    if (status !== undefined && status !== -99) {
      query.status = status
    }
  }

  try {
    const countRes = await db.collection('orders').where(query).count()
    const total = countRes.total

    const ordersRes = await db.collection('orders')
      .where(query)
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: ordersRes.data,
      total,
      page,
      pageSize
    }
  } catch (err) {
    console.error('获取订单失败:', err)
    return { success: false, message: '获取订单失败', data: [] }
  }
}
