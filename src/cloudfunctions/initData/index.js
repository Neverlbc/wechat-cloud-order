// 云函数：initData
// 功能：初始化商品数据到云数据库
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const goodsCollection = db.collection('goods')
  const categoriesCollection = db.collection('categories')

  // 分类数据
  const categories = [
    { catId: 'cat_1', name: '砂锅粉', sort: 1 },
    { catId: 'cat_2', name: '砂锅粥', sort: 2 },
    { catId: 'cat_3', name: '特色小吃', sort: 3 },
    { catId: 'cat_4', name: '饮品', sort: 4 }
  ]

  // 商品数据
  const goods = [
    // ===== 砂锅粉 =====
    {
      goodsId: 'g001',
      catId: 'cat_1',
      name: '酸汤砂锅粉',
      desc: '酸爽开胃，汤底浓郁',
      price: 10,
      image: 'https://picsum.photos/seed/noodle1/300/300',
      hasSpecs: true,
      specs: [
        { name: '卤蛋', price: 2 },
        { name: '瘦肉', price: 3 },
        { name: '肥肠', price: 5 },
        { name: '猪脚', price: 6 },
        { name: '豆腐泡', price: 2 }
      ],
      onSale: true,
      sort: 1
    },
    {
      goodsId: 'g002',
      catId: 'cat_1',
      name: '麻辣砂锅粉',
      desc: '麻辣鲜香，过瘾解馋',
      price: 10,
      image: 'https://picsum.photos/seed/noodle2/300/300',
      hasSpecs: true,
      specs: [
        { name: '卤蛋', price: 2 },
        { name: '瘦肉', price: 3 },
        { name: '肥肠', price: 5 },
        { name: '猪脚', price: 6 },
        { name: '豆腐泡', price: 2 }
      ],
      onSale: true,
      sort: 2
    },
    {
      goodsId: 'g003',
      catId: 'cat_1',
      name: '香菇鸡肉砂锅粉',
      desc: '鸡肉嫩滑，香菇鲜美',
      price: 10,
      image: 'https://picsum.photos/seed/noodle3/300/300',
      hasSpecs: true,
      specs: [
        { name: '卤蛋', price: 2 },
        { name: '瘦肉', price: 3 },
        { name: '肥肠', price: 5 },
        { name: '猪脚', price: 6 },
        { name: '豆腐泡', price: 2 }
      ],
      onSale: true,
      sort: 3
    },
    {
      goodsId: 'g004',
      catId: 'cat_1',
      name: '牛腩砂锅粉',
      desc: '牛腩软烂，入口即化',
      price: 10,
      image: 'https://picsum.photos/seed/noodle4/300/300',
      hasSpecs: true,
      specs: [
        { name: '卤蛋', price: 2 },
        { name: '瘦肉', price: 3 },
        { name: '肥肠', price: 5 },
        { name: '猪脚', price: 6 },
        { name: '豆腐泡', price: 2 }
      ],
      onSale: true,
      sort: 4
    },
    // ===== 砂锅粥 =====
    {
      goodsId: 'g005',
      catId: 'cat_2',
      name: '砂锅鸡粥',
      desc: '鸡肉嫩滑，粥底绵密',
      price: 10,
      image: 'https://picsum.photos/seed/porridge1/300/300',
      hasSpecs: true,
      specs: [
        { name: '加蛋', price: 2 },
        { name: '加青菜', price: 1 },
        { name: '加虾', price: 5 }
      ],
      onSale: true,
      sort: 5
    },
    {
      goodsId: 'g006',
      catId: 'cat_2',
      name: '砂锅鱼片粥',
      desc: '鱼片鲜嫩，营养丰富',
      price: 10,
      image: 'https://picsum.photos/seed/porridge2/300/300',
      hasSpecs: true,
      specs: [
        { name: '加蛋', price: 2 },
        { name: '加青菜', price: 1 },
        { name: '加虾', price: 5 }
      ],
      onSale: true,
      sort: 6
    },
    {
      goodsId: 'g007',
      catId: 'cat_2',
      name: '皮蛋瘦肉粥',
      desc: '经典口味，老少皆宜',
      price: 10,
      image: 'https://picsum.photos/seed/porridge3/300/300',
      hasSpecs: true,
      specs: [
        { name: '加蛋', price: 2 },
        { name: '加青菜', price: 1 },
        { name: '加虾', price: 5 }
      ],
      onSale: true,
      sort: 7
    },
    // ===== 特色小吃 =====
    {
      goodsId: 'g008',
      catId: 'cat_3',
      name: '特色水晶鸡',
      desc: '皮脆肉嫩，晶莹剔透',
      price: 10,
      image: 'https://picsum.photos/seed/chicken1/300/300',
      hasSpecs: false,
      specs: [],
      onSale: true,
      sort: 8
    },
    {
      goodsId: 'g009',
      catId: 'cat_3',
      name: '香辣鸭中翅',
      desc: '香辣可口，下饭神器',
      price: 10,
      image: 'https://picsum.photos/seed/wings1/300/300',
      hasSpecs: false,
      specs: [],
      onSale: true,
      sort: 9
    },
    // ===== 饮品 =====
    {
      goodsId: 'g010',
      catId: 'cat_4',
      name: '凉茶',
      desc: '清热解暑',
      price: 10,
      image: 'https://picsum.photos/seed/tea1/300/300',
      hasSpecs: false,
      specs: [],
      onSale: true,
      sort: 10
    },
    {
      goodsId: 'g011',
      catId: 'cat_4',
      name: '柠檬水',
      desc: '酸甜可口',
      price: 10,
      image: 'https://picsum.photos/seed/lemon1/300/300',
      hasSpecs: false,
      specs: [],
      onSale: true,
      sort: 11
    }
  ]

  const result = { categories: 0, goods: 0, errors: [] }

  // 写入分类
  for (const cat of categories) {
    try {
      // 查重：如果已存在则跳过
      const existing = await categoriesCollection.where({ catId: cat.catId }).get()
      if (existing.data.length === 0) {
        await categoriesCollection.add({ data: cat })
        result.categories++
      }
    } catch (err) {
      result.errors.push(`分类 ${cat.name}: ${err.message}`)
    }
  }

  // 写入商品
  for (const item of goods) {
    try {
      const existing = await goodsCollection.where({ goodsId: item.goodsId }).get()
      if (existing.data.length === 0) {
        await goodsCollection.add({ data: item })
        result.goods++
      }
    } catch (err) {
      result.errors.push(`商品 ${item.name}: ${err.message}`)
    }
  }

  return {
    success: true,
    message: `初始化完成：新增 ${result.categories} 个分类，${result.goods} 个商品`,
    errors: result.errors
  }
}
