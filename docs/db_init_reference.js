/**
 * 一味鲜粉店 - 数据库初始化参考
 * 请在微信开发者工具或云开发后台参考以下配置建立集合
 */

const db_config = {
  // 1. 菜品分类
  categories: {
    fields: {
      name: "String",   // 如：砂锅粉, 砂锅粥
      sort: "Number",   // 排序权重
      status: "Boolean" // 是否启用
    }
  },

  // 2. 菜品详情
  goods: {
    fields: {
      name: "String",
      price: "Number",      // 金额以分为单位 (6.50元 -> 650)
      category_id: "String",
      pic_url: "String",    // 云存储图片ID
      desc: "String",       // 菜品介绍
      is_onsale: "Boolean",
      specs: "Array",       // 自选配料/规格：[{"name":"卤蛋","price":150}, {"name":"瘦肉","price":300}]
      sales: "Number"
    }
  },

  // 3. 订单
  orders: {
    fields: {
      openid: "String",
      items: "Array",       // 购买项列表
      total_fee: "Number",  // 总金额
      status: "Number",     // 0:待支付, 1:待确认, 2:待配送, 3:已送达, 4:已评价, -1:已取消
      address: "Object",    // 配送地址详情
      create_time: "Date",
      pay_time: "Date"
    }
  }
};

console.log("建议在云开发后台建立以上三个集合，并为 goods.category_id 建立索引以提升查询速度。");
