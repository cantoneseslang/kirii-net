export interface MenuSchedule {
  startDate: string; // YYYY-MM-DD形式
  endDate: string;   // YYYY-MM-DD形式
  menus: {
    星期一: string[];
    星期二: string[];
    星期三: string[];
    星期四: string[];
    星期五: string[];
    星期六: string[];
    星期日: string[];
  };
}

// 現在のメニュー
export const CURRENT_MENU: MenuSchedule = {
  startDate: "",
  endDate: "",
  menus: {
    "星期一": ["鹹魚蒸肉餅飯", "黑椒斑腩牛扒飯", "餐肉腸仔叉燒飯", "四川牛肉飯", "星洲炒米", "豆腐粟米飯", "什菇時菜飯"],
    "星期二": ["蝦膏蒸腩肉飯", "魚香茄子飯", "涼瓜牛肉飯", "豆腐火腩飯", "乾炒叉燒河", "豆腐粟米飯", "什菇時菜飯"],
    "星期三": ["鹹蛋蒸肉餅飯", "栗米豬扒腸仔飯", "滷水雞翼紅腸飯", "麥樂雞拼火腿炒蛋飯", "乾炒三絲烏冬", "豆腐粟米飯", "什菇時菜飯"],
    "星期四": ["冬菜蒸鯇魚飯", "咖喱牛腩飯", "蕃茄雞球炒蛋飯", "楊州炒飯", "乾炒肉片意粉", "豆腐粟米飯", "什菇時菜飯"],
    "星期五": ["豉汁蒸排骨飯", "叉燒炒蛋飯", "三寶飯", "味菜火腩飯", "時菜牛肉炒河", "豆腐粟米飯", "什菇時菜飯"],
    "星期六": ["雜菇蒸雞球飯", "咖喱雞球飯", "蝦仁炒蛋飯", "肉絲炒麵", "豆腐粟米飯", "什菇時菜飯"],
    "星期日": ["雜菇蒸雞球飯", "咖喱雞球飯", "蝦仁炒蛋飯", "肉絲炒麵", "豆腐粟米飯", "什菇時菜飯"]
  }
};


// 飲み物メニュー
export const DRINKS = {
  hot: [
    { name: "熱奶茶", price: 16 },
    { name: "熱咖啡", price: 16 },
    { name: "熱鴛鴦", price: 16 },
    { name: "熱檸茶", price: 16 },
    { name: "熱菜蜜", price: 16 },
    { name: "熱可力", price: 16 },
    { name: "熱華田", price: 16 },
    { name: "熱檸水", price: 16 },
    { name: "熱杏仁霜", price: 16 }
  ],
  cold: [
    { name: "凍奶茶", price: 18 },
    { name: "凍咖啡", price: 18 },
    { name: "凍鴛鴦", price: 18 },
    { name: "凍檸茶", price: 18 },
    { name: "凍菜蜜", price: 18 },
    { name: "凍可力", price: 18 },
    { name: "凍華田", price: 18 },
    { name: "凍檸水", price: 18 },
    { name: "凍杏仁霜", price: 18 }
  ],
  other: [
    { name: "可樂", price: 12 },
    { name: "橙汁", price: 12 },
    { name: "雪碧", price: 12 },
    { name: "忌廉", price: 12 },
    { name: "涼茶", price: 15 }
  ]
};

// 現在の日付に基づいて適切なメニューを取得する関数
export function getCurrentMenu(): { menus: any; schedule: MenuSchedule } {
  return { menus: CURRENT_MENU.menus, schedule: CURRENT_MENU };
}

// 次のメニュー開始日までの残り日数を計算
export function getDaysUntilNextMenu(): number {
  return 0;
}

// メニュー切り替え予定日を取得
export function getNextMenuDate(): string {
  return "";
}