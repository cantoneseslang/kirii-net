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
    "星期一": ["鹹蛋蒸肉餅飯", "蕃茄蛋牛肉飯", "三寶飯", "咖喱雞球拼燒賣飯", "肉絲炒麵", "豆腐粟米飯", "什菇時菜飯"],
    "星期二": ["麻辣蒸雞球飯", "沙嗲牛肉拼司華力腸飯", "蝦仁炒蛋飯", "北菇豆卜炆雞球飯", "乾炒牛肉烏冬", "豆腐粟米飯", "什菇時菜飯"],
    "星期三": ["冬菜蒸鯇魚飯", "時菜牛腩飯", "咖喱魚蛋豬扒飯", "豆腐火腩飯", "雪菜肉絲炆米", "豆腐粟米飯", "什菇時菜飯"],
    "星期四": ["鹹魚蒸肉餅飯", "魚香茄子飯", "餐肉腸仔炒蛋飯", "時菜牛肉飯", "乾炒肉片意粉", "豆腐粟米飯", "什菇時菜飯"],
    "星期五": ["梅菜蒸腩肉飯", "滷水雞髀飯", "粟米斑腩腸仔飯", "涼瓜肉片飯", "豉椒牛肉炒河", "豆腐粟米飯", "什菇時菜飯"],
    "星期六": ["豉汁蒸排骨飯", "麻婆豆腐飯", "蕃茄豬扒拼斑腩飯", "星洲炒米", "豆腐粟米飯", "什菇時菜飯"],
    "星期日": ["豉汁蒸排骨飯", "麻婆豆腐飯", "蕃茄豬扒拼斑腩飯", "星洲炒米", "豆腐粟米飯", "什菇時菜飯"]
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
// ⚠️ 重要: この関数は data/menu-schedule.ts の CURRENT_MENU のみを参照します
// ファイルが見つからない場合、またはメニューが空の場合はエラーを投げます
export function getCurrentMenu(): { menus: any; schedule: MenuSchedule } {
  // CURRENT_MENU が存在しない場合のチェック（TypeScriptのビルド時には検出されるが、念のため）
  if (!CURRENT_MENU) {
    throw new Error(
      "❌ CRITICAL ERROR: CURRENT_MENU is not defined. " +
      "The file data/menu-schedule.ts must exist and export CURRENT_MENU. " +
      "Do not use any fallback or default menu data."
    );
  }

  // メニューが空の場合のチェック
  if (!CURRENT_MENU.menus || Object.keys(CURRENT_MENU.menus).length === 0) {
    throw new Error(
      "❌ CRITICAL ERROR: CURRENT_MENU.menus is empty. " +
      "The file data/menu-schedule.ts must contain valid menu data. " +
      "Do not use any fallback or default menu data."
    );
  }

  // すべての曜日のメニューが存在することを確認
  const requiredWeekdays: (keyof typeof CURRENT_MENU.menus)[] = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
  const missingWeekdays = requiredWeekdays.filter(day => !CURRENT_MENU.menus[day] || CURRENT_MENU.menus[day].length === 0);
  
  if (missingWeekdays.length > 0) {
    throw new Error(
      `❌ CRITICAL ERROR: Menu data is incomplete. Missing or empty menus for: ${missingWeekdays.join(", ")}. ` +
      "The file data/menu-schedule.ts must contain valid menu data for all weekdays. " +
      "Do not use any fallback or default menu data."
    );
  }

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