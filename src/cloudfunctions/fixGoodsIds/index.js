// 云函数 - fixGoodsIds
// 修复数据库中重复的 goodsId 问题
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
    try {
        // 1. 获取所有商品
        const allGoods = await db.collection('goods').limit(100).get()
        const goods = allGoods.data

        // 2. 找出重复的 goodsId
        const idMap = {}
        const duplicates = []

        goods.forEach(item => {
            const gid = item.goodsId
            if (idMap[gid]) {
                // 发现重复
                duplicates.push({
                    _id: item._id,
                    oldGoodsId: gid,
                    name: item.name
                })
            } else {
                idMap[gid] = item
            }
        })

        if (duplicates.length === 0) {
            return {
                success: true,
                message: '没有发现重复的 goodsId',
                totalGoods: goods.length
            }
        }

        // 3. 为重复的商品生成新的唯一 ID
        const updates = []
        for (const dup of duplicates) {
            const timestamp = Date.now().toString(36)
            const randomStr = Math.random().toString(36).substr(2, 6)
            const newGoodsId = 'g' + timestamp + randomStr

            // 更新数据库
            await db.collection('goods').doc(dup._id).update({
                data: { goodsId: newGoodsId }
            })

            updates.push({
                name: dup.name,
                oldId: dup.oldGoodsId,
                newId: newGoodsId
            })

            // 稍作延迟确保时间戳不同
            await new Promise(resolve => setTimeout(resolve, 10))
        }

        return {
            success: true,
            message: `已修复 ${updates.length} 个重复的 goodsId`,
            fixed: updates
        }
    } catch (err) {
        console.error('修复失败:', err)
        return {
            success: false,
            message: err.message
        }
    }
}
