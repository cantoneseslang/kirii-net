export interface FoodpandaMenuItem {
  name: string;
  price: number;
  description?: string;
}

export interface FoodpandaMenuCategory {
  category: string;
  items: FoodpandaMenuItem[];
}

export interface FoodpandaRestaurant {
  name: string;
  nameEn: string;
  rating: number;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
  menu: FoodpandaMenuCategory[];
  drinks: FoodpandaMenuCategory[];
}

export const FOODPANDA_RESTAURANT: FoodpandaRestaurant = {
  name: "味千拉麺 (大埔超級城)",
  nameEn: "Ajisen Ramen",
  rating: 4.8,
  deliveryTime: "20-45分鐘",
  minOrder: 80,
  deliveryFee: 35,
  menu: [
    {
      category: "拉麵",
      items: [
        { name: "熊本味千拉麵", price: 68 },
        { name: "職人叉燒拉麵", price: 58 },
        { name: "豚軟骨拉麵﹝微辛﹞", price: 82 },
        { name: "麻辣牛舌拉麵", price: 82 },
        { name: "牛肉番茄湯拉麵", price: 83 },
        { name: "野菌醬油湯拉麵", price: 67 },
      ],
    },
    {
      category: "套餐",
      items: [
        { name: "職人叉燒拉麵可口可樂套餐", price: 62 },
        { name: "熊本味千拉麵可口可樂套餐", price: 72 },
        { name: "麻辣牛舌拉麵可口可樂套餐", price: 86 },
        { name: "低溫叉燒木耳拉麵套餐", price: 78 },
      ],
    },
  ],
  drinks: [
    {
      category: "茶類",
      items: [
        { name: "鮮檸檬紅茶 (熱)", price: 24 },
        { name: "鮮檸檬紅茶 (凍)", price: 24 },
        { name: "奶茶 (熱)", price: 24 },
        { name: "奶茶 (凍)", price: 24 },
        { name: "鮮檸檬水 (熱)", price: 24 },
        { name: "鮮檸檬水 (凍)", price: 24 },
      ],
    },
    {
      category: "咖啡",
      items: [
        { name: "即磨咖啡 (熱)", price: 30 },
        { name: "即磨咖啡 (凍)", price: 30 },
      ],
    },
    {
      category: "汽水・果汁",
      items: [
        { name: "可樂", price: 18 },
        { name: "零系可樂", price: 18 },
        { name: "雪碧", price: 18 },
        { name: "橙汁", price: 18 },
        { name: "日本蘋果汁", price: 18 },
        { name: "日本提子汁", price: 18 },
      ],
    },
    {
      category: "特飲",
      items: [
        { name: "沖繩黑蜜生薑茶 (熱)", price: 38 },
        { name: "巨峰乳酸蘇打", price: 42 },
        { name: "香水檸檬茉莉綠茶", price: 42 },
        { name: "蜂蜜百香果茉莉綠茶", price: 42 },
      ],
    },
  ],
};
