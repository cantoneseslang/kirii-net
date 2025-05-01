'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { stringify } from 'csv-stringify/sync';
import Link from 'next/link';

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
}

export default function MonthlySummary() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [periods, setPeriods] = useState<string[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchSummary(selectedPeriod);
    }
  }, [selectedPeriod]);

  const fetchPeriods = async () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // 過去6ヶ月分を表示

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
    
    data.forEach(order => {
      if (order.dish !== '未選擇') {
        dishCounts[order.dish] = (dishCounts[order.dish] || 0) + 1;
      }
      if (order.drink !== '未選擇') {
        drinkCounts[order.drink] = (drinkCounts[order.drink] || 0) + 1;
      }
    });

    setSummary({
      period: periodStart,
      totalOrders: data.length,
      dishCounts,
      drinkCounts,
      totalAmount: calculateTotalAmount(dishCounts, drinkCounts)
    });
  };

  const calculateTotalAmount = (
    dishCounts: { [key: string]: number },
    drinkCounts: { [key: string]: number }
  ) => {
    const DISH_PRICE = 50;
    const DRINK_PRICE = 15;

    const dishTotal = Object.values(dishCounts).reduce((sum, count) => sum + count * DISH_PRICE, 0);
    const drinkTotal = Object.values(drinkCounts).reduce((sum, count) => sum + count * DRINK_PRICE, 0);

    return dishTotal + drinkTotal;
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
              <p>餐品種類: {Object.keys(summary.dishCounts).length}種</p>
              <p>飲品種類: {Object.keys(summary.drinkCounts).length}種</p>
              <p className="mt-4 font-bold">總金額: ${summary.totalAmount.toLocaleString()}</p>
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