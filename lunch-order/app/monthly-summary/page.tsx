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
}

export default function MonthlySummary() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [periods, setPeriods] = useState<string[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [dishPrice, setDishPrice] = useState<number>(0);
  const [drinkPrice, setDrinkPrice] = useState<number>(0);
  const [isEditingPrices, setIsEditingPrices] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

    setSummary({
      period: periodStart,
      totalOrders: setMealCount + drinksOnlyCount,
      dishCounts,
      drinkCounts,
      totalAmount: calculateTotalAmount(setMealCount, data),
      setMealCount,
      drinksOnlyCount
    });
  };

  const calculateTotalAmount = (setMealCount: number, orders: any[]) => {
    let total = setMealCount * dishPrice; // セット注文の合計（飲み物込み）

    // 飲み物単品の注文を計算
    orders.forEach(order => {
      if (order.dish === '未選擇' && order.drink !== '未選擇') {
        // 飲み物の価格を検索
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
    if (hotDrink) return hotDrink.price;

    // 冷たい飲み物をチェック
    const coldDrink = DRINKS.cold.find(drink => drink.name === drinkName);
    if (coldDrink) return coldDrink.price;

    // その他の飲み物をチェック
    const otherDrink = DRINKS.other.find(drink => drink.name === drinkName);
    if (otherDrink) return otherDrink.price;

    return 0; // 該当する飲み物が見つからない場合
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
      const drinkPriceData = prices.find(p => p.type === 'drink');

      if (dishPriceData) {
        setDishPrice(Number(dishPriceData.price));
      }
      if (drinkPriceData) {
        setDrinkPrice(Number(drinkPriceData.price));
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
        console.error('Error updating old prices:', updateError);
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
            item_name: '單點飲品',
            price: drinkPrice,
            type: 'drink',
            valid_from: new Date().toISOString(),
            valid_until: null
          }
        ]);

      if (insertError) {
        console.error('Error inserting new prices:', insertError);
        throw insertError;
      }

      if (summary) {
        setSummary({
          ...summary,
          totalAmount: calculateTotalAmount(summary.setMealCount, summary.drinksOnlyCount)
        });
      }
      
      setIsEditingPrices(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error saving prices:', error);
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
              <p>飲品種類: {Object.keys(summary.drinkCounts).length}種</p>
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
                    <span className="w-32">餐品價格(含飲品):</span>
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
                  <div className="flex items-center gap-2">
                    <span className="w-32">單點飲品價格:</span>
                    {isEditingPrices ? (
                      <Input
                        type="number"
                        value={drinkPrice || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Number(e.target.value);
                          setDrinkPrice(value);
                        }}
                        className="w-24"
                        min={0}
                        step={1}
                      />
                    ) : (
                      <span>${drinkPrice}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p>※ 餐品價格包含一份飲品</p>
                  <p>※ 單點飲品價格僅適用於未點餐者</p>
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
