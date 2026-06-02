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

const MENU_SWITCH_AT_HK = "2026-03-03T12:00:00+08:00"

/**
 * このファイルだけが「真実」ではない（更新されないとアプリが止まるわけではない）。
 *
 * 実際の表示の優先度（`lib/menu-source.ts` の getEffectiveMenus）:
 * 1) リモート https://kirii-portfolio-1.vercel.app/api/lunch-menu-setting（時刻・status 条件を満たすとき）
 * 2) data/menu-switch-settings.json の nextMenus（切替後かつ JSON に入っているとき）
 * 3) このファイルの menus（上記が無い／失敗時のフォールバック）
 *
 * 管理画面の菜單は Supabase + ブラウザ localStorage に保存され、この TS は注文 UI のフォールバックに使わない。
 * API フォールバックを合わせたい月はここ（または JSON の nextMenus）を手で更新してデプロイする。
 *
 * 注意: CURRENT_MENU === NEXT_MENU のため、日付だけでは「旧／新」の中身は切り替わらない（同じオブジェクト参照）。
 */
// 2026/03/03 12:00 (HK時間) 以降に切り替える新メニュー
export const NEXT_MENU: MenuSchedule = {
  startDate: MENU_SWITCH_AT_HK,
  endDate: "",
  menus: {
    "星期一": ["鹹魚蒸肉餅飯", "滷水雞髀飯", "蕃茄蛋肉片飯", "咖喱雞球飯", "時菜牛肉炒河", "粟米炒蛋飯", "什菇時菜飯"],
    "星期二": ["腐乳雜菇蒸雞球飯", "涼瓜牛肉飯", "咖喱魚蛋豬扒飯", "豆腐火腩飯", "乾炒黑椒雞絲意粉", "粟米炒蛋飯", "什菇時菜飯"],
    "星期三": ["梅菜蒸肉餅飯", "沙嗲牛肉拼司華力腸飯", "三寶飯", "麥樂雞拼椒鹽斑腩飯", "星洲炒米", "粟米炒蛋飯", "什菇時菜飯"],
    "星期四": ["麻辣榨菜蒸牛肉飯", "椰汁咖喱牛腩飯", "蝦仁炒蛋飯", "餐肉腸仔叉燒飯", "時菜肉片炒河", "粟米炒蛋飯", "什菇時菜飯"],
    "星期五": ["冬菜蒸鯇魚飯", "魚香茄子飯", "鹹魚雞絲豆腐飯", "咕嚕雞球飯", "乾炒牛肉烏冬", "粟米炒蛋飯", "什菇時菜飯"],
    "星期六": ["豉汁蒸排骨飯", "粟米雞絲火腿飯", "叉燒炒蛋飯", "肉絲炒麵", "粟米炒蛋飯", "什菇時菜飯"],
    "星期日": ["豉汁蒸排骨飯", "粟米雞絲火腿飯", "叉燒炒蛋飯", "肉絲炒麵", "粟米炒蛋飯", "什菇時菜飯"]
  }
};

// 現在メニューは NEXT_MENU をそのまま使用（重複定義を廃止）
export const CURRENT_MENU: MenuSchedule = NEXT_MENU;


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

function validateMenu(menu: MenuSchedule): void {
  if (!menu || !menu.menus || Object.keys(menu.menus).length === 0) {
    throw new Error(
      "❌ CRITICAL ERROR: menu data is empty. " +
      "The file data/menu-schedule.ts must contain valid menu data."
    );
  }

  const requiredWeekdays: (keyof typeof menu.menus)[] = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
  const missingWeekdays = requiredWeekdays.filter((day) => !menu.menus[day] || menu.menus[day].length === 0);

  if (missingWeekdays.length > 0) {
    throw new Error(
      `❌ CRITICAL ERROR: Menu data is incomplete. Missing or empty menus for: ${missingWeekdays.join(", ")}. ` +
      "The file data/menu-schedule.ts must contain valid menu data for all weekdays."
    );
  }
}

// 現在の日付に基づいて適切なメニューを取得する関数
// ⚠️ 重要: この関数は data/menu-schedule.ts の CURRENT_MENU のみを参照します
// ファイルが見つからない場合、またはメニューが空の場合はエラーを投げます
export function getCurrentMenu(): { menus: any; schedule: MenuSchedule } {
  if (!CURRENT_MENU) {
    throw new Error("❌ CRITICAL ERROR: CURRENT_MENU is not defined in data/menu-schedule.ts");
  }
  if (!NEXT_MENU) {
    throw new Error("❌ CRITICAL ERROR: NEXT_MENU is not defined in data/menu-schedule.ts");
  }

  validateMenu(CURRENT_MENU);
  validateMenu(NEXT_MENU);

  // HK時間の 2026/03/03 12:00 に固定切替
  const switchMs = new Date(MENU_SWITCH_AT_HK).getTime();
  const nowMs = Date.now();
  const activeMenu = nowMs >= switchMs ? NEXT_MENU : CURRENT_MENU;

  return { menus: activeMenu.menus, schedule: activeMenu };
}

// 次のメニュー開始日までの残り日数を計算
export function getDaysUntilNextMenu(): number {
  const switchMs = new Date(MENU_SWITCH_AT_HK).getTime();
  const nowMs = Date.now();
  const diffMs = switchMs - nowMs;
  return diffMs <= 0 ? 0 : Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// メニュー切り替え予定日を取得
export function getNextMenuDate(): string {
  return MENU_SWITCH_AT_HK;
}