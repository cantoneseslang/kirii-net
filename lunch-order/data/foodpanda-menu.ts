export interface FoodpandaMenuItem {
  name: string;
  price: number;
  description?: string;
}

export interface FoodpandaOption {
  name: string;
  extraPrice: number;
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
  noodleOptions: FoodpandaOption[];
  addOns: FoodpandaOption[];
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
      category: "拉麵早餐",
      items: [
        { name: "沙嗲豚肉野菜拉麵 (配煎蛋)", price: 46 },
        { name: "豚骨叉燒拉麵", price: 43 },
        { name: "番茄火腿扒雞肉腸野菜烏冬 (配煎蛋)", price: 48 },
      ],
    },
    {
      category: "日式早餐",
      items: [
        { name: "醬汁炒豚肉", price: 42, description: "配 前菜、豚骨湯、溫泉蛋及白飯" },
        { name: "醬汁煮牛肉", price: 52, description: "配前菜、豚骨湯、溫泉蛋及白飯 | 奉送飲品" },
        { name: "燒鯖魚", price: 48, description: "配前菜、豚骨湯、溫泉蛋及白飯 | 奉送飲品" },
        { name: "關東煮", price: 40, description: "配 前菜、豚骨湯、泡菜及白飯" },
      ],
    },
  ],
  noodleOptions: [
    { name: "嗌嗌粉", extraPrice: 0 },
    { name: "拉麵", extraPrice: 0 },
    { name: "烏冬", extraPrice: 7.5 },
  ],
  addOns: [
    { name: "不用加配", extraPrice: 0 },
    { name: "加配 新鮮丹麥多士", extraPrice: 4.5 },
    { name: "加配 新鮮丹麥多士及火腿扒", extraPrice: 7.5 },
    { name: "加配 新鮮丹麥多士及雞肉腸", extraPrice: 7.5 },
    { name: "追加-新鮮丹麥多士及煎蛋", extraPrice: 7.5 },
    { name: "迷你 叉燒嗌嗌粉", extraPrice: 10.5 },
    { name: "迷你 叉燒拉麵", extraPrice: 10.5 },
  ],
  drinks: [
    {
      category: "茶・奶茶",
      items: [
        { name: "鮮檸檬水 (凍)", price: 24 },
        { name: "奶茶 (凍)", price: 24 },
      ],
    },
    {
      category: "汽水・果汁",
      items: [
        { name: "可樂", price: 18 },
        { name: "零系可樂", price: 18 },
        { name: "雪碧", price: 18 },
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
