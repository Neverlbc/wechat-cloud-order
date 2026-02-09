// 云函数：createOrder
// 功能：创建订单到云数据库
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const { items, totalAmount, deliveryType, deliveryFee, packingFee, address, remark } = event

  // 验证参数
  if (!items || items.length === 0) {
    return { success: false, message: '购物车为空' }
  }

  // 生成订单号：ORD + 时间戳
  const orderId = 'ORD' + Date.now()

  const orderData = {
    orderId,
    openid,
    items,
    totalAmount: totalAmount || 0,
    deliveryType: deliveryType || 'delivery',
    deliveryFee: deliveryFee || 0,
    packingFee: packingFee || 0,
    address: address || {},
    remark: remark || '',
    status: 1,              // 直接设为待确认（模拟已支付）
    statusText: '待确认',
    createTime: db.serverDate(),
    createTimeStr: new Date().toISOString(),
    updateTime: db.serverDate()
  }

  try {
    const res = await db.collection('orders').add({ data: orderData })
    return {
      success: true,
      orderId,
      _id: res._id,
      message: '下单成功'
    }
  } catch (err) {
    console.error('创建订单失败:', err)
    return { success: false, message: '下单失败，请重试' }
  }
}
