'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { stringify } from 'csv-stringify/sync';
import Link from 'next/link';
import { DRINKS } from '@/components/menu-selection';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OrderSummary {
  period: string;
  totalOrders: number;
  dishCounts: { [key: string]: number };
  drinkCounts: { [key: string]: number };
  totalAmount: number;
  setMealCount: number;
  drinksOnlyCount: number;
  uniqueDrinkTypes: number;
}

export default function MonthlySummary() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [periods, setPeriods] = useState<string[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [dishPrice, setDishPrice] = useState<number>(0);
  const [hotDrinkPrice, setHotDrinkPrice] = useState<number>(16);
  const [coldDrinkPrice, setColdDrinkPrice] = useState<number>(18);
  const [softDrinkPrice, setSoftDrinkPrice] = useState<number>(10);
  const [herbTeaPrice, setHerbTeaPrice] = useState<number>(15);
  const [isEditingPrices, setIsEditingPrices] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    fetchPeriods();
    fetchPrices();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchSummary(selectedPeriod);
    }
  }, [selectedPeriod]);

  const fetchPeriods = async () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const periodList = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      const periodStart = new Date(date.getFullYear(), date.getMonth(), 22);
      periodList.push(format(periodStart, 'yyyy-MM-dd'));
    }

    setPeriods(periodList);
    setSelectedPeriod(periodList[periodList.length - 1]);
  };

  const fetchSummary = async (periodStart: string) => {
    const periodStartDate = new Date(periodStart);
    const periodEndDate = new Date(periodStartDate);
    periodEndDate.setMonth(periodEndDate.getMonth() + 1);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('timestamp', periodStart)
      .lt('timestamp', format(periodEndDate, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error fetching summary:', error);
      return;
    }

    const dishCounts: { [key: string]: number } = {};
    const drinkCounts: { [key: string]: number } = {};
    let setMealCount = 0;
    let drinksOnlyCount = 0;
    
    // 各注文を個別に分析
    data.forEach(order => {
      // セット注文の場合
      if (order.dish !== '未選擇' && order.drink !== '未選擇') {
        setMealCount++;
        dishCounts[order.dish] = (dishCounts[order.dish] || 0) + 1;
        drinkCounts[order.drink] = (drinkCounts[order.drink] || 0) + 1;
      } 
      // 飲み物のみの注文の場合
      else if (order.dish === '未選擇' && order.drink !== '未選擇') {
        drinksOnlyCount++;
        drinkCounts[order.drink] = (drinkCounts[order.drink] || 0) + 1;
      }
    });

    // 飲み物の種類を正確にカウント
    const uniqueDrinks = new Set();
    
    // 熱飲
    DRINKS.hot.forEach(drink => {
      if (drinkCounts[drink.name]) {
        uniqueDrinks.add('hot:' + drink.name);
      }
    });
    
    // 凍飲
    DRINKS.cold.forEach(drink => {
      if (drinkCounts[drink.name]) {
        uniqueDrinks.add('cold:' + drink.name);
      }
    });
    
    // 汽水
    const softDrinks = ["可樂", "橙汁", "雪碧", "忌廉"];
    softDrinks.forEach(drink => {
      if (drinkCounts[drink]) {
        uniqueDrinks.add('soft:' + drink);
      }
    });
    
    // 涼茶
    if (drinkCounts["涼茶"]) {
      uniqueDrinks.add('herb:涼茶');
    }

    setSummary({
      period: periodStart,
      totalOrders: setMealCount + drinksOnlyCount,
      dishCounts,
      drinkCounts,
      totalAmount: calculateTotalAmount(setMealCount, data),
      setMealCount,
      drinksOnlyCount,
      uniqueDrinkTypes: uniqueDrinks.size // 実際に注文された飲み物の種類数
    });
  };

  const calculateTotalAmount = (setMealCount: number, orders: any[]) => {
    let total = setMealCount * dishPrice; // セット注文の合計（飲み物込み）

    // 飲み物単品の注文を計算
    orders.forEach(order => {
      if (order.dish === '未選擇' && order.drink !== '未選擇') {
        const drinkPrice = getDrinkPrice(order.drink);
        total += drinkPrice;
      }
    });

    return total;
  };

  // 飲み物の価格を取得する関数
  const getDrinkPrice = (drinkName: string): number => {
    // 温かい飲み物をチェック
    const hotDrink = DRINKS.hot.find(drink => drink.name === drinkName);
    if (hotDrink) return hotDrinkPrice;

    // 冷たい飲み物をチェック
    const coldDrink = DRINKS.cold.find(drink => drink.name === drinkName);
    if (coldDrink) return coldDrinkPrice;

    // 汽水をチェック
    const softDrinks = ["可樂", "橙汁", "雪碧", "忌廉"];
    if (softDrinks.includes(drinkName)) return softDrinkPrice;

    // 涼茶をチェック
    if (drinkName === "涼茶") return herbTeaPrice;

    return 0;
  };

  const fetchPrices = async () => {
    const { data: prices, error } = await supabase
      .from('menu_prices')
      .select('*')
      .is('valid_until', null)
      .order('valid_from', { ascending: false });

    if (error) {
      console.error('Error fetching prices:', error);
      return;
    }

    if (prices && prices.length > 0) {
      const dishPriceData = prices.find(p => p.type === 'dish');
      const hotDrinkPriceData = prices.find(p => p.type === 'hot_drink');
      const coldDrinkPriceData = prices.find(p => p.type === 'cold_drink');
      const softDrinkPriceData = prices.find(p => p.type === 'soft_drink');
      const herbTeaPriceData = prices.find(p => p.type === 'herb_tea');

      if (dishPriceData) {
        setDishPrice(Number(dishPriceData.price));
      }
      if (hotDrinkPriceData) {
        setHotDrinkPrice(Number(hotDrinkPriceData.price));
      }
      if (coldDrinkPriceData) {
        setColdDrinkPrice(Number(coldDrinkPriceData.price));
      }
      if (softDrinkPriceData) {
        setSoftDrinkPrice(Number(softDrinkPriceData.price));
      }
      if (herbTeaPriceData) {
        setHerbTeaPrice(Number(herbTeaPriceData.price));
      }
    }
  };

  const handlePriceUpdate = async () => {
    try {
      setIsSaving(true);
      
      const { error: updateError } = await supabase
        .from('menu_prices')
        .update({ valid_until: new Date().toISOString() })
        .is('valid_until', null);

      if (updateError) {
        console.error('Error updating old prices:', error);
        throw updateError;
      }

      const { error: insertError } = await supabase
        .from('menu_prices')
        .insert([
          {
            item_name: '套餐',
            price: dishPrice,
            type: 'dish',
            valid_from: new Date().toISOString(),
            valid_until: null
          },
          {
            item_name: '熱飲',
            price: hotDrinkPrice,
            type: 'hot_drink',
            valid_from: new Date().toISOString(),
            valid_until: null
          },
          {
            item_name: '凍飲',
            price: coldDrinkPrice,
            type: 'cold_drink',
            valid_from: new Date().toISOString(),
            valid_until: null
          },
          {
            item_name: '汽水',
            price: softDrinkPrice,
            type: 'soft_drink',
            valid_from: new Date().toISOString(),
            valid_until: null
          },
          {
            item_name: '涼茶',
            price: herbTeaPrice,
            type: 'herb_tea',
            valid_from: new Date().toISOString(),
            valid_until: null
          }
        ]);

      if (insertError) {
        console.error('Error inserting new prices:', insertError);
        throw insertError;
      }

      // 保存成功後の処理
      toast.success('價錢設定已更新');
      setIsEditingPrices(false);

      // 現在の期間で統計を再取得
      if (selectedPeriod) {
        await fetchSummary(selectedPeriod);
      }

    } catch (error) {
      console.error('Error saving prices:', error);
      toast.error('價錢設定更新失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const exportToPDF = async () => {
    if (!summary) return;

    const element = document.getElementById('summary-content');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`訂單統計_${format(new Date(summary.period), 'yyyyMMdd')}.pdf`);
  };

  const exportToCSV = () => {
    if (!summary) return;

    const rows = [
      ['訂單統計', format(new Date(summary.period), 'yyyy年MM月dd日')],
      [],
      ['訂單概要'],
      ['訂單總數', `${summary.totalOrders}單`],
      ['套餐訂單', `${summary.setMealCount}單`],
      ['飲品單點', `${summary.drinksOnlyCount}單`],
      ['餐品種類', `${Object.keys(summary.dishCounts).length}種`],
      ['飲品種類', `${Object.keys(summary.drinkCounts).length}種`],
      ['總金額', `$${summary.totalAmount.toLocaleString()}`],
      [],
      ['餐品訂購統計'],
      ...Object.entries(summary.dishCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([dish, count]) => [dish, `${count}單`]),
      [],
      ['飲品訂購統計'],
      ...Object.entries(summary.drinkCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([drink, count]) => [drink, `${count}單`])
    ];

    const csvContent = stringify(rows, { delimiter: ',' });
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `訂單統計_${format(new Date(summary.period), 'yyyyMMdd')}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">每月訂單統計</h1>
        {summary && (
          <div className="space-x-4">
            <Button onClick={exportToPDF} variant="outline">
              輸出PDF
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              輸出CSV
            </Button>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            ← 返回管理頁面
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="選擇日期" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => {
              const startDate = new Date(period);
              const endDate = new Date(startDate);
              endDate.setMonth(endDate.getMonth() + 1);
              return (
                <SelectItem key={period} value={period}>
                  {format(startDate, 'yyyy年MM月dd日')}至{format(endDate, 'MM月dd日')}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {summary && (
        <div id="summary-content" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>訂單概要</CardTitle>
            </CardHeader>
            <CardContent>
              <p>訂單總數: {summary.totalOrders}單</p>
              <p>套餐訂單: {summary.setMealCount}單</p>
              <p>飲品單點: {summary.drinksOnlyCount}單</p>
              <p>餐品種類: {Object.keys(summary.dishCounts).length}種</p>
              <p>飲品種類: {summary.uniqueDrinkTypes}種</p>
              <p className="mt-4 font-bold">總金額: ${summary.totalAmount.toLocaleString()}</p>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">價格設定</h4>
                  {!isEditingPrices ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingPrices(true)}>
                      修改價格
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePriceUpdate}
                        disabled={isSaving}
                      >
                        {isSaving ? '保存中...' : '保存'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={async () => {
                          await fetchPrices();
                          setIsEditingPrices(false);
                        }}
                        disabled={isSaving}
                      >
                        取消
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-32">餐品價錢(包飲品):</span>
                    {isEditingPrices ? (
                      <Input
                        type="number"
                        value={dishPrice || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Number(e.target.value);
                          setDishPrice(value);
                        }}
                        className="w-24"
                        min={0}
                        step={1}
                      />
                    ) : (
                      <span>${dishPrice}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <span className="font-medium">飲品價錢:</span>
                    <div className="ml-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-28">熱飲:</span>
                        {isEditingPrices ? (
                          <Input
                            type="number"
                            value={hotDrinkPrice || ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : Number(e.target.value);
                              setHotDrinkPrice(value);
                            }}
                            className="w-24"
                            min={0}
                            step={1}
                          />
                        ) : (
                          <span>${hotDrinkPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-28">凍飲:</span>
                        {isEditingPrices ? (
                          <Input
                            type="number"
                            value={coldDrinkPrice || ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : Number(e.target.value);
                              setColdDrinkPrice(value);
                            }}
                            className="w-24"
                            min={0}
                            step={1}
                          />
                        ) : (
                          <span>${coldDrinkPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-28">汽水:</span>
                        {isEditingPrices ? (
                          <Input
                            type="number"
                            value={softDrinkPrice || ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : Number(e.target.value);
                              setSoftDrinkPrice(value);
                            }}
                            className="w-24"
                            min={0}
                            step={1}
                          />
                        ) : (
                          <span>${softDrinkPrice}</span>
                        )}
                        <span className="text-sm text-gray-500">(可樂、橙汁、雪碧、忌廉)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-28">涼茶:</span>
                        {isEditingPrices ? (
                          <Input
                            type="number"
                            value={herbTeaPrice || ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : Number(e.target.value);
                              setHerbTeaPrice(value);
                            }}
                            className="w-24"
                            min={0}
                            step={1}
                          />
                        ) : (
                          <span>${herbTeaPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p>※ 餐品價錢已包一份飲品</p>
                  <p>※ 飲品價錢按種類計算</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>餐品訂購統計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(summary.dishCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([dish, count]) => (
                    <div key={dish} className="flex justify-between">
                      <span>{dish}</span>
                      <span>{count}單</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>飲品訂購統計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(summary.drinkCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([drink, count]) => (
                    <div key={drink} className="flex justify-between">
                      <span>{drink}</span>
                      <span>{count}單</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
