// src/utils/index.js
import * as XLSX from 'xlsx';
import { WEEKDAYS } from '../constants';

// ============ 포맷 함수 ============

// 통화 포맷 (원)
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR').format(value) + '원';
};

// 짧은 숫자 포맷 (만 단위)
export const formatShort = (value) => {
  return value >= 10000
    ? `${(value / 10000).toFixed(1)}만`
    : value.toLocaleString();
};

// 주차 계산
export const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `${d.getUTCFullYear()}-W${String(Math.ceil((((d - yearStart) / 86400000) + 1) / 7)).padStart(2, '0')}`;
};

// ============ 샘플 데이터 생성 ============

export const generateSampleData = () => {
  const products = [
    { name: '아메리카노', price: 4500, weight: 30 },
    { name: '카페라떼', price: 5000, weight: 25 },
    { name: '콜드브루', price: 5500, weight: 15 },
    { name: '바닐라라떼', price: 5500, weight: 10 },
    { name: '카푸치노', price: 5000, weight: 8 },
  ];

  const data = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-23');

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const numTransactions = (isWeekend ? 80 : 50) + Math.floor(Math.random() * 30);

    for (let i = 0; i < numTransactions; i++) {
      const hourWeights = [0,0,0,0,0,0,0,1,3,5,7,8,6,4,5,6,7,5,4,3,2,1,0,0];
      let hour = 8;
      const rand = Math.random() * hourWeights.reduce((a,b) => a+b, 0);
      let cumulative = 0;
      for (let h = 0; h < 24; h++) {
        cumulative += hourWeights[h];
        if (rand <= cumulative) { hour = h; break; }
      }

      const totalWeight = products.reduce((sum, p) => sum + p.weight, 0);
      let productRand = Math.random() * totalWeight;
      let product = products[0];
      let cumWeight = 0;
      for (const p of products) {
        cumWeight += p.weight;
        if (productRand <= cumWeight) { product = p; break; }
      }

      data.push({
        date: new Date(d),
        dateStr: d.toISOString().split('T')[0],
        hour,
        dayOfWeek,
        dayName: WEEKDAYS[dayOfWeek],
        amount: product.price,
        product: product.name,
        week: getWeekNumber(d),
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      });
    }
  }
  return data;
};

// ============ 엑셀 처리 ============

// 파일 해시 생성 (중복 체크용)
export const generateFileHash = (data) => {
  return JSON.stringify(data.slice(0, 10)) + data.length;
};

// 엑셀 데이터 파싱
export const processExcelData = (rawData) => {
  if (rawData.length < 2) return [];

  const headers = rawData[0].map(h => String(h || '').toLowerCase());
  const rows = rawData.slice(1);

  const dateCol = headers.findIndex(h =>
    h.includes('결제일') || h.includes('주문기준일자') || h.includes('날짜')
  );
  const timeCol = headers.findIndex(h =>
    h.includes('결제시간') || h.includes('주문시작시간') || h.includes('시간')
  );
  const amountCol = headers.findIndex(h =>
    h.includes('총결제금액') || h.includes('실판매금액') ||
    h.includes('총액') || h.includes('금액') || h.includes('상품별 총액')
  );
  const productCol = headers.findIndex(h =>
    h.includes('상품명') || h.includes('결제내역') || h.includes('메뉴')
  );

  const processed = [];

  rows.forEach(row => {
    if (!row || row.length === 0) return;

    let dateStr = row[dateCol];
    let timeStr = row[timeCol];
    let amount = row[amountCol];

    let date;
    if (dateStr) {
      date = typeof dateStr === 'number'
        ? new Date((dateStr - 25569) * 86400 * 1000)
        : new Date(dateStr);
    }

    let hour = 0;
    if (timeStr) {
      hour = typeof timeStr === 'number'
        ? Math.floor(timeStr * 24)
        : (parseInt(String(timeStr).split(':')[0]) || 0);
    }

    if (typeof amount === 'string') {
      amount = parseInt(amount.replace(/[^0-9-]/g, '')) || 0;
    }
    amount = Number(amount) || 0;

    if (date && !isNaN(date.getTime()) && amount > 0) {
      processed.push({
        date,
        dateStr: date.toISOString().split('T')[0],
        hour,
        dayOfWeek: date.getDay(),
        dayName: WEEKDAYS[date.getDay()],
        amount,
        product: row[productCol] || '기타',
        week: getWeekNumber(date),
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      });
    }
  });

  return processed.sort((a, b) => a.date - b.date);
};

// 샘플 엑셀 다운로드
export const downloadSampleExcel = () => {
  const sampleData = [
    ['결제일', '결제시간', '상품명', '총결제금액', '결제수단'],
    ['2025-01-01', '09:30', '아메리카노', 4500, '카드'],
    ['2025-01-01', '10:15', '카페라떼', 5000, '카드'],
    ['2025-01-01', '11:00', '콜드브루', 5500, '현금'],
    ['2025-01-01', '14:30', '바닐라라떼', 5500, '카드'],
    ['2025-01-02', '08:45', '아메리카노', 4500, '카드'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '매출데이터');
  XLSX.writeFile(wb, '매출데이터_예시.xlsx');
};

// ============ 데이터 분석 ============

export const analyzeData = (data) => {
  if (!data || data.length === 0) return null;

  const totalSales = data.reduce((sum, d) => sum + d.amount, 0);
  const totalTransactions = data.length;

  // 날짜별 집계
  const byDate = {};
  data.forEach(d => {
    if (!byDate[d.dateStr]) byDate[d.dateStr] = { date: d.dateStr, total: 0, count: 0 };
    byDate[d.dateStr].total += d.amount;
    byDate[d.dateStr].count += 1;
  });
  const dailyData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

  // 요일별 집계
  const byDayOfWeek = Array(7).fill(null).map((_, i) => ({
    day: WEEKDAYS[i], total: 0, count: 0, days: 0
  }));
  const daysCount = {};
  data.forEach(d => {
    byDayOfWeek[d.dayOfWeek].total += d.amount;
    byDayOfWeek[d.dayOfWeek].count += 1;
    const key = `${d.dayOfWeek}-${d.dateStr}`;
    if (!daysCount[key]) {
      daysCount[key] = true;
      byDayOfWeek[d.dayOfWeek].days += 1;
    }
  });
  byDayOfWeek.forEach(d => {
    d.average = d.days > 0 ? Math.round(d.total / d.days) : 0;
  });

  // 시간대별 집계
  const byHour = Array(24).fill(null).map((_, i) => ({
    hour: i, label: `${i}시`, total: 0, count: 0
  }));
  data.forEach(d => {
    byHour[d.hour].total += d.amount;
    byHour[d.hour].count += 1;
  });

  // 주간별 집계
  const byWeek = {};
  data.forEach(d => {
    if (!byWeek[d.week]) byWeek[d.week] = { week: d.week, total: 0, count: 0 };
    byWeek[d.week].total += d.amount;
    byWeek[d.week].count += 1;
  });

  // 상품별 집계
  const byProduct = {};
  data.forEach(d => {
    if (!byProduct[d.product]) byProduct[d.product] = { product: d.product, total: 0, count: 0 };
    byProduct[d.product].total += d.amount;
    byProduct[d.product].count += 1;
  });

  // 베스트 계산
  const peakHour = byHour.reduce((max, h) => h.total > max.total ? h : max, byHour[0]);
  const bestDay = byDayOfWeek.reduce((max, d) => d.average > max.average ? d : max, byDayOfWeek[0]);
  const bestDate = dailyData.length > 0
    ? dailyData.reduce((max, d) => d.total > max.total ? d : max, dailyData[0])
    : { date: '-', total: 0 };

  return {
    totalSales,
    totalTransactions,
    avgTransaction: Math.round(totalSales / totalTransactions),
    avgDaily: Math.round(totalSales / (dailyData.length || 1)),
    dailyData,
    byDayOfWeek,
    byHour: byHour.filter(h => h.total > 0),
    weeklyData: Object.values(byWeek).sort((a, b) => a.week.localeCompare(b.week)),
    productData: Object.values(byProduct).sort((a, b) => b.total - a.total).slice(0, 10),
    peakHour,
    bestDay,
    bestDate
  };
};

// ============ 통계 엑셀 다운로드 ============

export const downloadStatsExcel = (data, filename, sheetName) => {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
