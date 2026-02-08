import React, { useState, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, Clock, TrendingUp, DollarSign, FileSpreadsheet, LogOut, Upload, Play, MapPin, Store, User, BarChart3, Coffee, Target, Award, Sparkles, Plus, Trash2, Database, FileText, Download, AlertCircle, Check, X, ChevronDown, Power, Shield, Users, Image, Link, Edit3, Ban, Eye, Settings, UserPlus, Key, Globe, Package, ChevronLeft, ChevronRight, Search, Briefcase, Calculator, Wallet } from 'lucide-react';
import * as XLSX from 'xlsx';
import StoreSettingsForm from './components/contract/StoreSettingsForm.jsx';
import ContractTab from './components/contract/ContractTab.jsx';
import ContractModal from './components/contract/ContractModal.jsx';
import GuidePage from './components/guide/GuidePage.jsx';

const COLORS = ['#3b82f6', '#06b6d4', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const BUSINESS_TYPES = [
  '음식·외식·배달', '카페·제과·디저트', '호프·주점·포차', 
  '스마트스토어·쇼핑몰', '미용·뷰티·네일', '스터디·학원·교육',
  '애견샵·반려동물', '숙박업·펜션·모텔', '레저·오락·스크린',
  '헬스장·레슨샵', '제조업·유통업', '스타트업·1인기업',
  '노점·푸드트럭', '해외장사·사업', '전문서비스·기술창업'
];

const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

// ============================================
// v2에서 복구: 지역/업종 평균 매출 데이터
// ============================================
/*
const REGION_AVG_SALES = {
  '서울': 21000000, '경기': 19000000, '인천': 17000000, '부산': 16000000,
  '대구': 15000000, '광주': 14000000, '대전': 14500000, '울산': 16000000,
  '세종': 15000000, '강원': 12000000, '충북': 12500000, '충남': 13000000,
  '전북': 11500000, '전남': 11000000, '경북': 12000000, '경남': 14000000,
  '제주': 18000000,
};

const BUSINESS_AVG_SALES = {
  '음식·외식·배달': 17000000, '카페·제과·디저트': 12000000,
  '호프·주점·포차': 25000000, '스마트스토어·쇼핑몰': 14000000,
  '미용·뷰티·네일': 8000000, '스터디·학원·교육': 12000000,
  '애견샵·반려동물': 10000000, '숙박업·펜션·모텔': 23000000,
  '레저·오락·스크린': 15000000, '헬스장·레슨샵': 11000000,
  '제조업·유통업': 22000000, '스타트업·1인기업': 13000000,
  '노점·푸드트럭': 8000000, '해외장사·사업': 24000000,
  '전문서비스·기술창업': 18000000,
};

const MONTHLY_FACTOR = {
  1: 0.85, 2: 0.90, 3: 1.00, 4: 1.05, 5: 1.10, 6: 1.00,
  7: 1.15, 8: 1.20, 9: 1.00, 10: 1.05, 11: 1.10, 12: 1.25,
};
*/

// 근무 상태 종류
const WORK_STATUS = {
  work:    { label: '출근',   emoji: '🟢', color: 'green',  paidHours: 'actual',   weeklyCount: true  },
  dayoff:  { label: '휴무',   emoji: '🔴', color: 'red',    paidHours: 0,          weeklyCount: false },
  annual:  { label: '연차',   emoji: '🟣', color: 'purple', paidHours: 'contract', weeklyCount: true  },
  absent:  { label: '결근',   emoji: '⚫', color: 'gray',   paidHours: 0,          weeklyCount: false },
  holiday: { label: '공휴일', emoji: '🔵', color: 'blue',   paidHours: 0,          weeklyCount: true  },
  sick:    { label: '병가',   emoji: '🟤', color: 'amber',  paidHours: 0,          weeklyCount: false },
  family:  { label: '경조사', emoji: '🩷', color: 'pink',   paidHours: 'contract', weeklyCount: true  },
  late:    { label: '지각',   emoji: '🟡', color: 'yellow', paidHours: 'actual',   weeklyCount: true  },
  halfday: { label: '반차',   emoji: '🟠', color: 'orange', paidHours: 'actual',   weeklyCount: true  },
};

// 초기 관리자 계정
const INITIAL_ADMINS = [
  { id: 'admin', password: 'admin123', role: 'super', name: '최고관리자', createdAt: new Date() }
];

// 샘플 회원 데이터 (매출 정보 포함)
const SAMPLE_MEMBERS = [
  { id: 'user1', name: '김사장', email: 'kim@naver.com', region: '서울', businessType: '카페·제과·디저트', ip: '192.168.1.101', lastLogin: new Date('2025-01-22'), blocked: false, totalSales: 15420000, avgDailySales: 514000 },
  { id: 'user2', name: '이사장', email: 'lee@naver.com', region: '경기', businessType: '음식·외식·배달', ip: '192.168.1.102', lastLogin: new Date('2025-01-21'), blocked: false, totalSales: 28350000, avgDailySales: 945000 },
  { id: 'user3', name: '박사장', email: 'park@naver.com', region: '부산', businessType: '호프·주점·포차', ip: '192.168.1.103', lastLogin: new Date('2025-01-20'), blocked: true, totalSales: 12800000, avgDailySales: 426667 },
  { id: 'user4', name: '최사장', email: 'choi@naver.com', region: '서울', businessType: '카페·제과·디저트', ip: '192.168.1.104', lastLogin: new Date('2025-01-23'), blocked: false, totalSales: 18900000, avgDailySales: 630000 },
  { id: 'user5', name: '정사장', email: 'jung@naver.com', region: '대구', businessType: '미용·뷰티·네일', ip: '192.168.1.105', lastLogin: new Date('2025-01-19'), blocked: false, totalSales: 9500000, avgDailySales: 316667 },
  { id: 'user6', name: '강사장', email: 'kang@naver.com', region: '서울', businessType: '음식·외식·배달', ip: '192.168.1.106', lastLogin: new Date('2025-01-23'), blocked: false, totalSales: 32100000, avgDailySales: 1070000 },
  { id: 'user7', name: '조사장', email: 'jo@naver.com', region: '경기', businessType: '카페·제과·디저트', ip: '192.168.1.107', lastLogin: new Date('2025-01-22'), blocked: false, totalSales: 14200000, avgDailySales: 473333 },
  { id: 'user8', name: '윤사장', email: 'yoon@naver.com', region: '인천', businessType: '호프·주점·포차', ip: '192.168.1.108', lastLogin: new Date('2025-01-21'), blocked: false, totalSales: 21500000, avgDailySales: 716667 },
  { id: 'user9', name: '장사장', email: 'jang@naver.com', region: '대전', businessType: '음식·외식·배달', ip: '192.168.1.109', lastLogin: new Date('2025-01-20'), blocked: false, totalSales: 19800000, avgDailySales: 660000 },
  { id: 'user10', name: '임사장', email: 'lim@naver.com', region: '광주', businessType: '카페·제과·디저트', ip: '192.168.1.110', lastLogin: new Date('2025-01-23'), blocked: false, totalSales: 11200000, avgDailySales: 373333 },
];

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `${d.getUTCFullYear()}-W${String(Math.ceil((((d - yearStart) / 86400000) + 1) / 7)).padStart(2, '0')}`;
};

const generateSampleData = () => {
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

const downloadSampleExcel = () => {
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

// 글래스 카드
const GlassCard = ({ children, className = '', hover = true }) => (
  <div className={`
    relative overflow-hidden
    bg-white/10 backdrop-blur-xl
    border border-white/20
    rounded-2xl
    ${hover ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-xl hover:-translate-y-0.5' : ''}
    transition-all duration-300
    ${className}
  `}>
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    {children}
  </div>
);

// 애니메이션 배경
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] bg-cyan-400/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-indigo-500/15 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute bottom-[30%] right-[10%] w-[400px] h-[400px] bg-sky-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
  </div>
);

// 원재료 추가/수정 폼 컴포넌트
const IngredientForm = ({ initialData, categories, baseUnits, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initialData || {
    category: categories[0],
    name: '',
    spec: '',
    unitPrice: '',
    baseUnit: 'g',
    baseAmount: '',
    currentStock: '',
    safetyStock: '',
    supplier: '',
    taxType: '과세'
  });

  const unitCost = form.baseAmount && form.unitPrice
    ? Math.round(Number(form.unitPrice) / Number(form.baseAmount))
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.spec || !form.unitPrice || !form.baseAmount || !form.supplier) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    onSubmit({
      ...form,
      unitPrice: Number(form.unitPrice),
      baseAmount: Number(form.baseAmount),
      currentStock: Number(form.currentStock) || 0,
      safetyStock: Number(form.safetyStock) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/60 text-sm mb-1">카테고리 *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-1">원재료명 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="예: 원두"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/60 text-sm mb-1">규격 (매입 단위) *</label>
          <input
            type="text"
            value={form.spec}
            onChange={(e) => setForm({ ...form, spec: e.target.value })}
            placeholder="예: 1kg, 1L, 1박스"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-1">입고가 (VAT 포함) *</label>
          <input
            type="number"
            value={form.unitPrice}
            onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
            placeholder="25000"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/60 text-sm mb-1">기본 단위 *</label>
          <select
            value={form.baseUnit}
            onChange={(e) => setForm({ ...form, baseUnit: e.target.value })}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
          >
            {baseUnits.map(unit => (
              <option key={unit.value} value={unit.value} className="bg-slate-800">{unit.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-1">규격 → 기본단위 환산 *</label>
          <input
            type="number"
            value={form.baseAmount}
            onChange={(e) => setForm({ ...form, baseAmount: e.target.value })}
            placeholder="예: 1000 (1kg=1000g)"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {unitCost > 0 && (
        <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-3">
          <p className="text-cyan-400 text-sm">
            → 단위당 원가: <strong>{unitCost}원/{form.baseUnit}</strong> (자동계산)
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/60 text-sm mb-1">현재고 ({form.baseUnit})</label>
          <input
            type="number"
            value={form.currentStock}
            onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-1">안전재고 ({form.baseUnit})</label>
          <input
            type="number"
            value={form.safetyStock}
            onChange={(e) => setForm({ ...form, safetyStock: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/60 text-sm mb-1">거래처 *</label>
          <input
            type="text"
            value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            placeholder="거래처명 입력"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-1">과세구분 *</label>
          <select
            value={form.taxType}
            onChange={(e) => setForm({ ...form, taxType: e.target.value })}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="과세" className="bg-slate-800">과세</option>
            <option value="면세" className="bg-slate-800">면세</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-white/10 text-white/70 rounded-xl font-medium hover:bg-white/20 transition-all"
        >
          취소
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          {initialData ? '변경 저장' : '추가'}
        </button>
      </div>
    </form>
  );
};

// 레시피 추가/수정 폼 컴포넌트
const RecipeForm = ({ initialData, categories, ingredients, onSubmit, onCancel, onDelete }) => {
  const [form, setForm] = useState(initialData || {
    name: '',
    category: categories[0],
    price: '',
    ingredients: []
  });

  // 새 재료 추가용 state
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientAmount, setIngredientAmount] = useState('');

  // 선택된 원재료 정보
  const selectedIngredient = ingredients.find(ing => ing.id === Number(selectedIngredientId));

  // 총 원가 계산
  const totalCost = form.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
  const costRate = form.price > 0 ? ((totalCost / Number(form.price)) * 100).toFixed(1) : 0;
  const marginRate = (100 - costRate).toFixed(1);
  const marginAmount = form.price > 0 ? Number(form.price) - totalCost : 0;

  // 재료 추가
  const addIngredientToRecipe = () => {
    if (!selectedIngredientId || !ingredientAmount || Number(ingredientAmount) <= 0) {
      return;
    }

    const ing = ingredients.find(i => i.id === Number(selectedIngredientId));
    if (!ing) return;

    // 이미 추가된 재료인지 확인
    if (form.ingredients.some(i => i.ingredientId === ing.id)) {
      alert('이미 추가된 재료입니다.');
      return;
    }

    const amount = Number(ingredientAmount);
    const newIngredient = {
      ingredientId: ing.id,
      ingredientName: ing.name,
      amount: amount,
      baseUnit: ing.baseUnit,
      unitCost: ing.unitCost,
      totalCost: Math.round(amount * ing.unitCost)
    };

    setForm({
      ...form,
      ingredients: [...form.ingredients, newIngredient]
    });

    setSelectedIngredientId('');
    setIngredientAmount('');
  };

  // 재료 삭제
  const removeIngredientFromRecipe = (ingredientId) => {
    setForm({
      ...form,
      ingredients: form.ingredients.filter(ing => ing.ingredientId !== ingredientId)
    });
  };

  // 재료 수량 변경
  const updateIngredientAmount = (ingredientId, newAmount) => {
    const amount = Number(newAmount);
    if (amount < 0) return;

    setForm({
      ...form,
      ingredients: form.ingredients.map(ing => {
        if (ing.ingredientId === ingredientId) {
          return {
            ...ing,
            amount: amount,
            totalCost: Math.round(amount * ing.unitCost)
          };
        }
        return ing;
      })
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      alert('상품명과 판매가를 입력해주세요.');
      return;
    }
    onSubmit({
      ...form,
      id: initialData?.id,
      price: Number(form.price),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-white/60 text-sm mb-1">상품명 (메뉴명) *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="예: 아메리카노"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-white/60 text-sm mb-1">카테고리</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-white/60 text-sm mb-1">판매가 (원) *</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="5000"
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* 투입 재료 목록 */}
      <div>
        <label className="block text-white/60 text-sm mb-2">─── 투입 재료 목록 ───</label>
        {form.ingredients.length === 0 ? (
          <div className="text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/20">
            <p className="text-white/40 text-sm">투입된 재료가 없습니다</p>
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-4 py-2 text-left text-white/60">재료명</th>
                  <th className="px-4 py-2 text-right text-white/60">투입량</th>
                  <th className="px-4 py-2 text-right text-white/60">투입원가</th>
                  <th className="px-4 py-2 text-center text-white/60 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {form.ingredients.map(ing => (
                  <tr key={ing.ingredientId} className="border-t border-white/10">
                    <td className="px-4 py-2 text-white">{ing.ingredientName}</td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        value={ing.amount}
                        onChange={(e) => updateIngredientAmount(ing.ingredientId, e.target.value)}
                        className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-right focus:outline-none focus:border-cyan-400"
                      />
                      <span className="text-white/50 ml-1">{ing.baseUnit}</span>
                    </td>
                    <td className="px-4 py-2 text-right text-cyan-400">{ing.totalCost.toLocaleString()}원</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeIngredientFromRecipe(ing.ingredientId)}
                        className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 새 재료 추가 */}
      <div>
        <label className="block text-white/60 text-sm mb-2">─── 새 재료 추가 ───</label>
        {ingredients.length === 0 ? (
          <div className="text-center py-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
            <p className="text-amber-400 text-sm">원재료 관리에서 먼저 원재료를 등록해주세요</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <select
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="" className="bg-slate-800">원재료 선택...</option>
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id} className="bg-slate-800">
                    {ing.name} ({ing.spec})
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={ingredientAmount}
                onChange={(e) => setIngredientAmount(e.target.value)}
                placeholder="수량"
                className="w-24 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={addIngredientToRecipe}
                disabled={!selectedIngredientId || !ingredientAmount}
                className="px-4 py-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl font-medium hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                재료 추가
              </button>
            </div>

            {/* 선택시 정보 표시 */}
            {selectedIngredient && (
              <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">매입 규격:</span>
                    <span className="text-white">{selectedIngredient.spec}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">매입가 (규격당):</span>
                    <span className="text-white">{selectedIngredient.unitPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">기본 단위:</span>
                    <span className="text-white">{selectedIngredient.baseUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">단위당 원가:</span>
                    <span className="text-cyan-400 font-medium">{selectedIngredient.unitCost}원/{selectedIngredient.baseUnit}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 원가/마진 요약 */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/50 text-sm">총 원가</p>
            <p className="text-2xl font-bold text-white">{totalCost.toLocaleString()}원</p>
            <p className={`text-sm ${costRate > 40 ? 'text-red-400' : costRate > 30 ? 'text-amber-400' : 'text-green-400'}`}>
              원가율 {costRate}%
            </p>
          </div>
          <div>
            <p className="text-white/50 text-sm">총 마진</p>
            <p className="text-2xl font-bold text-green-400">{marginAmount.toLocaleString()}원</p>
            <p className="text-sm text-green-400">마진율 {marginRate}%</p>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-all"
          >
            상품 삭제
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-white/10 text-white/70 rounded-xl font-medium hover:bg-white/20 transition-all"
        >
          취소
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          {initialData ? '변경 저장' : '추가'}
        </button>
      </div>
    </form>
  );
};

// 비과세 한도 상수 (월급제 전용)
const TAX_EXEMPT_LIMITS = { meal: 200000, transport: 200000, childcarePerChild: 200000 };

// 직원 추가/수정 폼 컴포넌트
const EmployeeForm = ({ initialData, onSubmit, onCancel, onDelete }) => {
  const MIN_WAGE_2026 = 10320; // 2026년 최저시급

  const [form, setForm] = useState(initialData || {
    name: '',
    type: 'hourly', // 'hourly' (시급제) | 'monthly' (월급제) | 'daily' (일용직) | 'freelancer' (프리랜서)
    hourlyWage: MIN_WAGE_2026,
    monthlyWage: 2500000,
    weeklyHours: 20,
    workDaysPerWeek: 5,
    // 근무 요일 (0=일 ~ 6=토)
    workDays: [1, 2, 3, 4, 5], // 기본: 월~금
    // 기본 출퇴근 시간
    defaultStartTime: '09:00',
    defaultEndTime: '14:00',
    defaultBreak: 0, // 휴게시간 (시간)
    // 일용직 기본 일당 (참고용)
    dailyWage: 100000,
    // 프리랜서 전용
    monthlyFee: 0,
    totalFee: 0,
    // 세금/보험 처리 방식: 'insurance' (4대보험) | 'withholding' (3.3% 원천징수) | 'daily' (일용직)
    taxType: 'insurance',
    insurance: {
      national: false,     // 국민연금
      health: false,       // 건강보험
      employment: false,   // 고용보험
      industrial: false,   // 산재보험
    },
    // 비과세 항목 (월급제 전용)
    taxExempt: { meal: 0, transport: 0, childcare: 0, numberOfChildren: 0 },
  });

  // 1일 소정근로시간 계산
  const contractDailyHours = (() => {
    const start = form.defaultStartTime.split(':').map(Number);
    const end = form.defaultEndTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return Math.max(0, (endMinutes - startMinutes) / 60 - (form.defaultBreak || 0));
  })();

  // 4대보험 요율 (사업주 부담분)
  const insuranceRates = {
    national: 0.045,      // 국민연금 4.5%
    health: 0.03545,      // 건강보험 3.545%
    healthLong: 0.004591, // 장기요양보험 (건강보험의 12.95%)
    employment: 0.009,    // 고용보험 0.9%
    industrial: 0.007,    // 산재보험 ~0.7%
  };

  // 주휴수당 해당 여부 (주 15시간 이상)
  const isEligibleForWeeklyHoliday = form.weeklyHours >= 15;

  // 주휴수당 계산 (시급제만 해당, 일용직/프리랜서는 0)
  const calculateWeeklyHolidayPay = () => {
    if (form.type === 'monthly' || form.type === 'freelancer' || form.type === 'daily' || !isEligibleForWeeklyHoliday || form.taxType === 'daily') return 0;
    // 공식: (주간근무시간 / 40) × 8 × 시급
    return Math.round((form.weeklyHours / 40) * 8 * form.hourlyWage);
  };

  const weeklyHolidayPayDaily = calculateWeeklyHolidayPay();
  const weeklyHolidayPayMonthly = Math.round(weeklyHolidayPayDaily * 4.345);

  // 월급여 계산
  const calculateMonthlyPay = () => {
    if (form.type === 'freelancer') {
      return Number(form.monthlyFee) || 0;
    }
    if (form.taxType === 'daily' || form.type === 'daily') {
      // 일용직: 기본 일당 × 주간 근무일 × 4.345주 (참고용 예상 월급)
      return Math.round(form.dailyWage * form.workDays.length * 4.345);
    }
    if (form.type === 'monthly') {
      return form.monthlyWage;
    }
    // 시급제: (주급 + 주휴수당) × 4.345주
    const weeklyBasePay = form.hourlyWage * form.weeklyHours;
    const weeklyTotalPay = weeklyBasePay + weeklyHolidayPayDaily;
    return Math.round(weeklyTotalPay * 4.345);
  };

  const monthlyPay = calculateMonthlyPay();

  // 비과세 합계 계산 (월급제 전용, 각 항목 한도 적용, 월급 초과 불가)
  const taxExempt = form.taxExempt || { meal: 0, transport: 0, childcare: 0, numberOfChildren: 0 };
  const childcareLimit = (Number(taxExempt.numberOfChildren) || 0) * TAX_EXEMPT_LIMITS.childcarePerChild;
  const getTotalTaxExempt = () => {
    if (form.type !== 'monthly') return 0;
    const meal = Math.min(Number(taxExempt.meal) || 0, TAX_EXEMPT_LIMITS.meal);
    const transport = Math.min(Number(taxExempt.transport) || 0, TAX_EXEMPT_LIMITS.transport);
    const childcare = Math.min(Number(taxExempt.childcare) || 0, childcareLimit);
    return Math.min(meal + transport + childcare, monthlyPay);
  };
  const totalTaxExempt = getTotalTaxExempt();
  const taxableAmount = form.type === 'monthly' ? monthlyPay - totalTaxExempt : monthlyPay;

  // 4대보험 사업주 부담 계산 (월급제: 과세 대상 기준)
  const calculateInsuranceCost = () => {
    if (form.taxType !== 'insurance') return 0;
    const base = form.type === 'monthly' ? taxableAmount : monthlyPay;
    let total = 0;
    if (form.insurance.national) total += base * insuranceRates.national;
    if (form.insurance.health) {
      total += base * insuranceRates.health;
      total += base * insuranceRates.healthLong;
    }
    if (form.insurance.employment) total += base * insuranceRates.employment;
    if (form.insurance.industrial) total += base * insuranceRates.industrial;
    return Math.round(total);
  };

  // 3.3% 원천징수 공제액 (직원 부담)
  const withholdingDeduction = form.taxType === 'withholding' ? Math.round(monthlyPay * 0.033) : 0;

  const insuranceCost = calculateInsuranceCost();
  const totalLaborCost = monthlyPay + insuranceCost;

  // 직원 부담 4대보험 (국민연금4.5% + 건강보험3.545% + 장기요양0.46% + 고용보험0.9% = 9.405%)
  const employeeInsuranceRate = 0.045 + 0.03545 + 0.0046 + 0.009; // 0.09405
  const insuranceBase = form.type === 'monthly' ? taxableAmount : monthlyPay;
  const employeeInsuranceDeduction = form.taxType === 'insurance' ? Math.round(insuranceBase * employeeInsuranceRate) : 0;
  // 직원 실수령액
  const employeeNetPay = form.taxType === 'daily'
    ? monthlyPay
    : form.taxType === 'withholding'
      ? monthlyPay - withholdingDeduction
      : monthlyPay - employeeInsuranceDeduction;

  const handleInsuranceChange = (key) => {
    setForm({
      ...form,
      insurance: {
        ...form.insurance,
        [key]: !form.insurance[key]
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) {
      alert('직원명을 입력해주세요.');
      return;
    }
    onSubmit({
      ...form,
      hourlyWage: Number(form.hourlyWage),
      monthlyWage: Number(form.monthlyWage),
      dailyWage: Number(form.dailyWage),
      weeklyHours: Number(form.weeklyHours),
      workDaysPerWeek: Number(form.workDaysPerWeek),
      defaultBreak: Number(form.defaultBreak) || 0,
      contractDailyHours: contractDailyHours,
      taxType: form.taxType,
      // 프리랜서 전용
      monthlyFee: Number(form.monthlyFee) || 0,
      totalFee: Number(form.totalFee) || 0,
      // 비과세 항목 (월급제 전용)
      taxExempt: form.type === 'monthly' ? {
        meal: Number(taxExempt.meal) || 0,
        transport: Number(taxExempt.transport) || 0,
        childcare: Number(taxExempt.childcare) || 0,
        numberOfChildren: Number(taxExempt.numberOfChildren) || 0,
      } : { meal: 0, transport: 0, childcare: 0, numberOfChildren: 0 },
      totalTaxExempt: form.type === 'monthly' ? totalTaxExempt : 0,
      taxableAmount: form.type === 'monthly' ? taxableAmount : monthlyPay,
      // 계산된 값들도 저장
      weeklyHolidayPay: weeklyHolidayPayMonthly,
      calculatedMonthlyPay: monthlyPay,
      insuranceCost: insuranceCost,
      withholdingDeduction: withholdingDeduction,
      totalLaborCost: totalLaborCost,
    });
  };

  // 근무 요일 토글
  const toggleWorkDay = (day) => {
    const newWorkDays = form.workDays.includes(day)
      ? form.workDays.filter(d => d !== day)
      : [...form.workDays, day].sort();
    setForm({ ...form, workDays: newWorkDays, workDaysPerWeek: newWorkDays.length });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 직원명 */}
      <div>
        <label className="block text-white/60 text-sm mb-1">직원명 *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="예: 김알바"
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* 고용 형태 */}
      <div>
        <label className="block text-white/60 text-sm mb-2">고용 형태</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: 'hourly', label: '시급제', syncTax: null },
            { key: 'monthly', label: '월급제', syncTax: null },
            { key: 'daily', label: '일용직', syncTax: 'daily' },
            { key: 'freelancer', label: '프리랜서', syncTax: 'withholding' },
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                const update = { ...form, type: item.key };
                if (item.syncTax) update.taxType = item.syncTax;
                else if (form.taxType === 'daily' && item.key !== 'daily') update.taxType = 'insurance';
                setForm(update);
              }}
              className={`px-3 py-3 rounded-xl font-medium transition-all text-sm ${
                form.type === item.key
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 시급제 입력 필드 (일용직/프리랜서가 아닐 때만) */}
      {form.type === 'hourly' && form.taxType !== 'daily' && (
        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-sm text-cyan-400 font-medium">시급제 설정</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">시급 (원)</label>
              <input
                type="number"
                value={form.hourlyWage}
                onChange={(e) => setForm({ ...form, hourlyWage: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-xs text-white/40 mt-1">2026년 최저시급: {MIN_WAGE_2026.toLocaleString()}원</p>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">주간 근무시간 (자동계산)</label>
              <input
                type="number"
                value={form.weeklyHours}
                onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-xs text-white/40 mt-1">1일 {contractDailyHours}h × {form.workDays.length}일 = {contractDailyHours * form.workDays.length}h</p>
            </div>
          </div>

          {/* 근무 요일 선택 */}
          <div>
            <label className="block text-white/60 text-sm mb-2">근무 요일</label>
            <div className="flex gap-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleWorkDay(idx)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    form.workDays.includes(idx)
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* 기본 출퇴근 시간 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-white/60 text-sm mb-1">기본 출근</label>
              <input
                type="time"
                value={form.defaultStartTime}
                onChange={(e) => setForm({ ...form, defaultStartTime: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">기본 퇴근</label>
              <input
                type="time"
                value={form.defaultEndTime}
                onChange={(e) => setForm({ ...form, defaultEndTime: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">휴게 (시간)</label>
              <input
                type="number"
                value={form.defaultBreak}
                onChange={(e) => setForm({ ...form, defaultBreak: e.target.value })}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
          <p className="text-xs text-cyan-400">→ 1일 소정근로시간: <strong>{contractDailyHours}시간</strong></p>
        </div>
      )}

      {/* 일용직 설정 블록 */}
      {(form.taxType === 'daily' || form.type === 'daily') && (
        <div className="space-y-4 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20">
          <p className="text-sm text-orange-400 font-medium">일용직 설정</p>
          <div>
            <label className="block text-white/60 text-sm mb-1">기본 일당 (원)</label>
            <input
              type="number"
              value={form.dailyWage}
              onChange={(e) => setForm({ ...form, dailyWage: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-400"
            />
            {Number(form.dailyWage) > 150000 && (
              <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> 일 18.7만원 초과 시 원천징수 대상
              </p>
            )}
          </div>

          {/* 근무 요일 선택 (출근 예정일 파악용) */}
          <div>
            <label className="block text-white/60 text-sm mb-2">출근 예정 요일</label>
            <div className="flex gap-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleWorkDay(idx)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    form.workDays.includes(idx)
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 월급제 입력 필드 */}
      {form.type === 'monthly' && (
        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-sm text-cyan-400 font-medium">월급제 설정</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">월급여 (원)</label>
              <input
                type="number"
                value={form.monthlyWage}
                onChange={(e) => setForm({ ...form, monthlyWage: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">주간 근무시간</label>
              <input
                type="number"
                value={form.weeklyHours}
                onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
          <p className="text-xs text-white/40">월급제는 주휴수당이 이미 포함되어 있습니다.</p>

          {/* 비과세 항목 (월급제 전용) */}
          <div className="mt-4 p-3 bg-green-500/5 rounded-xl border border-green-500/20 space-y-3">
            <p className="text-sm text-green-400 font-medium">비과세 항목 (선택)</p>
            <p className="text-xs text-white/40">비과세 항목을 설정하면 과세 대상 금액이 줄어 소득세·4대보험이 절감됩니다.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 text-xs mb-1">식대 (월 20만원 한도)</label>
                <input
                  type="number"
                  value={taxExempt.meal || ''}
                  onChange={(e) => {
                    const v = Math.min(Math.max(0, Number(e.target.value) || 0), TAX_EXEMPT_LIMITS.meal);
                    setForm({ ...form, taxExempt: { ...taxExempt, meal: v } });
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1">자가운전보조금 (월 20만원 한도)</label>
                <input
                  type="number"
                  value={taxExempt.transport || ''}
                  onChange={(e) => {
                    const v = Math.min(Math.max(0, Number(e.target.value) || 0), TAX_EXEMPT_LIMITS.transport);
                    setForm({ ...form, taxExempt: { ...taxExempt, transport: v } });
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1">출산보육수당 (자녀 1명당 월 20만원 한도)</label>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-white/50 text-xs">6세 이하 자녀 수</span>
                  <input
                    type="number"
                    value={taxExempt.numberOfChildren || ''}
                    onChange={(e) => {
                      const numChildren = Math.max(0, Math.min(Number(e.target.value) || 0, 10));
                      const newLimit = numChildren * TAX_EXEMPT_LIMITS.childcarePerChild;
                      const adjustedChildcare = Math.min(Number(taxExempt.childcare) || 0, newLimit);
                      setForm({ ...form, taxExempt: { ...taxExempt, numberOfChildren: numChildren, childcare: numChildren === 0 ? 0 : adjustedChildcare } });
                    }}
                    min={0}
                    max={10}
                    placeholder="0"
                    className="w-16 px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center placeholder-white/40 focus:outline-none focus:border-green-400"
                  />
                  <span className="text-white/50 text-xs">명</span>
                  {(Number(taxExempt.numberOfChildren) || 0) > 0 && (
                    <span className="text-green-400/70 text-xs">→ 한도: {childcareLimit.toLocaleString()}원</span>
                  )}
                </div>
                <input
                  type="number"
                  value={taxExempt.childcare || ''}
                  onChange={(e) => {
                    const v = Math.min(Math.max(0, Number(e.target.value) || 0), childcareLimit);
                    setForm({ ...form, taxExempt: { ...taxExempt, childcare: v } });
                  }}
                  placeholder="0"
                  disabled={!(Number(taxExempt.numberOfChildren) || 0)}
                  className={`w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-green-400 ${!(Number(taxExempt.numberOfChildren) || 0) ? 'opacity-40 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
            {totalTaxExempt > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-green-500/20">
                <div className="text-xs space-y-0.5">
                  <p className="text-green-400">비과세 합계: {totalTaxExempt.toLocaleString()}원</p>
                  <p className="text-white/60">과세 대상: {taxableAmount.toLocaleString()}원</p>
                </div>
                <div className="text-right text-xs text-white/40">
                  월급 {monthlyPay.toLocaleString()}원 중
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 프리랜서 설정 블록 */}
      {form.type === 'freelancer' && (
        <div className="space-y-4 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
          <p className="text-sm text-indigo-400 font-medium">프리랜서 설정</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">월 보수 (원)</label>
              <input
                type="number"
                value={form.monthlyFee || ''}
                onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">총 계약금액 (원)</label>
              <input
                type="number"
                value={form.totalFee || ''}
                onChange={(e) => setForm({ ...form, totalFee: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <p className="text-xs text-indigo-300/60">프리랜서는 3.3% 원천징수 자동 적용, 4대보험·주휴수당 없음</p>
        </div>
      )}

      {/* 주휴수당 정보 (시급제만, 일용직 제외) */}
      {form.type === 'hourly' && form.taxType !== 'daily' && (
        <div className={`p-4 rounded-xl border ${
          isEligibleForWeeklyHoliday
            ? 'bg-purple-500/10 border-purple-500/30'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">주휴수당</span>
          </div>
          {isEligibleForWeeklyHoliday ? (
            <div className="space-y-1">
              <p className="text-white text-sm">
                주 {form.weeklyHours}시간 근무 → <span className="text-green-400">주휴수당 해당</span>
              </p>
              <p className="text-white/60 text-xs">
                주휴수당 (주): {weeklyHolidayPayDaily.toLocaleString()}원
              </p>
              <p className="text-purple-400 font-medium">
                주휴수당 (월): {weeklyHolidayPayMonthly.toLocaleString()}원
              </p>
            </div>
          ) : (
            <p className="text-white/50 text-sm">
              주 15시간 미만 → <span className="text-red-400">주휴수당 미해당</span>
            </p>
          )}
          <p className="text-xs text-white/40 mt-2">
            공식: (주간근무시간/40) × 8 × 시급
          </p>
        </div>
      )}

      {/* 세금/보험 처리 방식 */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
        <p className="text-sm text-cyan-400 font-medium mb-3">세금/보험 처리 방식</p>
        <div className="flex gap-2 mb-4">
          {[
            { key: 'insurance', label: '4대보험', desc: '사업주+직원 분담' },
            { key: 'withholding', label: '3.3%', desc: '사업소득 원천징수' },
            { key: 'daily', label: '일용직', desc: '일당 지급' },
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setForm({ ...form, taxType: item.key })}
              className={`flex-1 px-3 py-2.5 rounded-xl text-center transition-all ${
                form.taxType === item.key
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs opacity-70">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* 4대보험 선택 시 */}
        {form.taxType === 'insurance' && (
          <>
            <p className="text-xs text-white/50 mb-3">사업주 부담분 선택</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'national', label: '국민연금', rate: '4.5%' },
                { key: 'health', label: '건강보험', rate: '3.5%+' },
                { key: 'employment', label: '고용보험', rate: '0.9%' },
                { key: 'industrial', label: '산재보험', rate: '0.7%' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.insurance[item.key]}
                    onChange={() => handleInsuranceChange(item.key)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-white/80 text-sm">{item.label}</span>
                  <span className="text-white/40 text-xs">({item.rate})</span>
                </label>
              ))}
            </div>
            {insuranceCost > 0 && (
              <p className="text-amber-400 text-sm mt-3">
                사업주 부담 보험료 (월): {insuranceCost.toLocaleString()}원
              </p>
            )}
          </>
        )}

        {/* 3.3% 원천징수 선택 시 */}
        {form.taxType === 'withholding' && (
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <p className="text-amber-400 text-sm font-medium mb-1">3.3% 원천징수 (사업소득)</p>
            <p className="text-white/60 text-xs mb-2">프리랜서/사업소득으로 신고 - 직원이 3.3% 부담, 사업주 부담 0원</p>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">급여 {monthlyPay.toLocaleString()}원 × 3.3%</span>
              <span className="text-amber-400 font-medium">공제: {withholdingDeduction.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-white/60">직원 실수령액</span>
              <span className="text-white font-medium">{(monthlyPay - withholdingDeduction).toLocaleString()}원</span>
            </div>
          </div>
        )}

        {/* 일용직 선택 시 */}
        {form.taxType === 'daily' && (
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <p className="text-orange-400 text-sm font-medium mb-1">일용직</p>
            <p className="text-white/60 text-xs">근무기록 탭에서 날짜별 일당을 직접 입력합니다.</p>
            <p className="text-white/50 text-xs mt-1">일 18.7만원 이하 비과세. 4대보험/원천징수 없음.</p>
            {Number(form.dailyWage) > 150000 && (
              <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> 설정된 일당이 15만원을 초과합니다 - 원천징수 대상일 수 있습니다
              </p>
            )}
            <p className="text-white/40 text-xs mt-1">사업주 추가 부담: 0원</p>
          </div>
        )}
      </div>

      {/* 계산 결과 */}
      <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
        <p className="text-sm text-green-400 font-medium mb-3">월 예상 인건비 계산{form.taxType === 'daily' ? ' (참고용 예상)' : ''}</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">
              {form.taxType === 'daily'
                ? `기본 일당 ${Number(form.dailyWage).toLocaleString()}원 × ${form.workDays.length}일/주 × 4.345주`
                : '기본 급여'}
            </span>
            <span className="text-white">
              {form.taxType === 'daily'
                ? monthlyPay.toLocaleString()
                : (form.type === 'hourly' ? Math.round(form.hourlyWage * form.weeklyHours * 4.345) : form.monthlyWage).toLocaleString()
              }원
            </span>
          </div>
          {form.type === 'hourly' && form.taxType !== 'daily' && isEligibleForWeeklyHoliday && (
            <div className="flex justify-between">
              <span className="text-white/60">+ 주휴수당</span>
              <span className="text-purple-400">{weeklyHolidayPayMonthly.toLocaleString()}원</span>
            </div>
          )}
          {form.taxType === 'insurance' && insuranceCost > 0 && (
            <div className="flex justify-between">
              <span className="text-white/60">+ 4대보험 (사업주 부담)</span>
              <span className="text-amber-400">{insuranceCost.toLocaleString()}원</span>
            </div>
          )}
          {form.taxType === 'insurance' && (
            <div className="flex justify-between">
              <span className="text-white/60">- 4대보험 (직원 부담 9.4%)</span>
              <span className="text-amber-400">-{employeeInsuranceDeduction.toLocaleString()}원</span>
            </div>
          )}
          {form.taxType === 'withholding' && (
            <div className="flex justify-between">
              <span className="text-white/60">- 3.3% 공제 (직원 부담)</span>
              <span className="text-amber-400">-{withholdingDeduction.toLocaleString()}원</span>
            </div>
          )}
          {form.taxType !== 'insurance' && form.taxType !== 'daily' && (
            <div className="flex justify-between">
              <span className="text-white/60">사업주 추가 부담</span>
              <span className="text-green-400">0원</span>
            </div>
          )}
          {form.taxType === 'daily' && (
            <div className="flex justify-between">
              <span className="text-white/60">공제 없음 (일용직)</span>
              <span className="text-green-400">0원</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-white font-medium">사업주 지출</span>
              <span className="text-green-400 font-bold text-lg">{totalLaborCost.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 font-medium">직원 실수령</span>
              <span className="text-cyan-400 font-bold text-lg">{employeeNetPay.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-all border border-red-500/30"
          >
            삭제
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-white/10 text-white/70 rounded-xl font-medium hover:bg-white/20 transition-all"
        >
          취소
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          {initialData ? '변경 저장' : '추가'}
        </button>
      </div>
    </form>
  );
};

// 근무 기록 입력 폼 컴포넌트
const WorkRecordForm = ({ employee, date, existingRecord, onSubmit, onCancel, onDelete }) => {
  const isDaily = employee?.taxType === 'daily';
  const [form, setForm] = useState(existingRecord || {
    employeeId: employee?.id,
    date: date,
    dayOfWeek: new Date(date).getDay(),
    status: 'work',
    startTime: employee?.defaultStartTime || '09:00',
    endTime: employee?.defaultEndTime || '14:00',
    breakHours: employee?.defaultBreak || 0,
    actualHours: employee?.contractDailyHours || 5,
    contractHours: employee?.contractDailyHours || 5,
    overtimeHours: 0,
    dailyWage: employee?.dailyWage || 100000,
    memo: '',
  });

  // 실근무시간 계산
  const calcActualHours = () => {
    if (form.status !== 'work' && form.status !== 'late' && form.status !== 'halfday') {
      return 0;
    }
    const start = form.startTime.split(':').map(Number);
    const end = form.endTime.split(':').map(Number);
    const startMin = start[0] * 60 + start[1];
    const endMin = end[0] * 60 + end[1];
    return Math.max(0, (endMin - startMin) / 60 - (form.breakHours || 0));
  };

  const actualHours = calcActualHours();
  const overtimeHours = Math.max(0, actualHours - (employee?.contractDailyHours || 5));

  const getStatusStyle = (status, isSelected) => {
    const styles = {
      work: isSelected ? 'bg-green-500/30 border-2 border-green-400' : 'bg-white/5 border border-white/10',
      dayoff: isSelected ? 'bg-red-500/30 border-2 border-red-400' : 'bg-white/5 border border-white/10',
      annual: isSelected ? 'bg-purple-500/30 border-2 border-purple-400' : 'bg-white/5 border border-white/10',
      absent: isSelected ? 'bg-gray-500/30 border-2 border-gray-400' : 'bg-white/5 border border-white/10',
      holiday: isSelected ? 'bg-blue-500/30 border-2 border-blue-400' : 'bg-white/5 border border-white/10',
      sick: isSelected ? 'bg-amber-500/30 border-2 border-amber-400' : 'bg-white/5 border border-white/10',
      family: isSelected ? 'bg-pink-500/30 border-2 border-pink-400' : 'bg-white/5 border border-white/10',
      late: isSelected ? 'bg-yellow-500/30 border-2 border-yellow-400' : 'bg-white/5 border border-white/10',
      halfday: isSelected ? 'bg-orange-500/30 border-2 border-orange-400' : 'bg-white/5 border border-white/10',
    };
    return styles[status] || styles.work;
  };

  const handleSubmit = () => {
    onSubmit({
      ...form,
      actualHours: isDaily ? 0 : actualHours,
      overtimeHours: isDaily ? 0 : overtimeHours,
      contractHours: employee?.contractDailyHours || 5,
      dailyWage: isDaily ? Number(form.dailyWage) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* 근무 상태 선택 */}
      <div>
        <label className="block text-white/60 text-sm mb-2">근무 상태</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(WORK_STATUS).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() => setForm({ ...form, status: key })}
              className={`p-2 rounded-lg text-center transition-all hover:bg-white/10 ${getStatusStyle(key, form.status === key)}`}
            >
              <div className="text-xl">{val.emoji}</div>
              <div className="text-xs text-white/70">{val.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 출근 시 시간 입력 (일용직이 아닐 때) */}
      {!isDaily && (form.status === 'work' || form.status === 'late' || form.status === 'halfday') && (
        <div className="space-y-3 p-4 bg-white/5 rounded-xl">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-white/60 text-sm mb-1">출근</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">퇴근</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">휴게(h)</label>
              <input
                type="number"
                value={form.breakHours}
                onChange={(e) => setForm({ ...form, breakHours: Number(e.target.value) })}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
          <div className="text-sm space-y-1">
            <p className="text-white">실 근무시간: <span className="text-cyan-400 font-medium">{actualHours.toFixed(1)}시간</span></p>
            <p className="text-white/60">계약 근무시간: {employee?.contractDailyHours || 5}시간</p>
            {(() => {
              const diff = actualHours - (employee?.contractDailyHours || 5);
              if (diff > 0) {
                return (
                  <>
                    <p className="text-amber-400">차이: +{diff.toFixed(1)}시간 (연장근무)</p>
                    <p className="text-amber-300 font-medium">연장수당: {diff.toFixed(1)}h × {(employee?.hourlyWage || 10320).toLocaleString()}원 = {Math.round(diff * (employee?.hourlyWage || 10320)).toLocaleString()}원</p>
                  </>
                );
              } else if (diff < 0) {
                return <p className="text-red-400">차이: {diff.toFixed(1)}시간 (조퇴/반차)</p>;
              } else {
                return <p className="text-green-400">차이: 0시간 (정상)</p>;
              }
            })()}
          </div>
        </div>
      )}

      {/* 일용직: 출근 시 일당 입력 */}
      {isDaily && (form.status === 'work' || form.status === 'late' || form.status === 'halfday') && (
        <div className="space-y-3 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20">
          <div>
            <label className="block text-white/60 text-sm mb-1">일당 (원)</label>
            <input
              type="number"
              value={form.dailyWage}
              onChange={(e) => setForm({ ...form, dailyWage: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          {Number(form.dailyWage) > 150000 && (
            <p className="text-amber-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> 일당 15만원 초과 - 원천징수 대상일 수 있습니다
            </p>
          )}
          <p className="text-sm text-orange-400 font-medium">
            금일 일당: {Number(form.dailyWage).toLocaleString()}원
          </p>
        </div>
      )}

      {/* 메모 */}
      <div>
        <label className="block text-white/60 text-sm mb-1">메모</label>
        <input
          type="text"
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
          placeholder="메모 (선택)"
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        {existingRecord && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-all"
          >
            삭제
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-white/10 text-white/70 rounded-lg font-medium hover:bg-white/20 transition-all"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default function ManlebSalesAnalyzer() {
  // 사이트 설정 (관리자가 변경 가능)
  const [siteSettings, setSiteSettings] = useState({
    subtitle: 'POS 데이터로 우리 가게 인사이트 발견하기',
    adContact: '',
    // 배너 1: 로그인 화면 (PC/모바일)
    banner1PcImage: '',
    banner1PcLink: '',
    banner1MobileImage: '',
    banner1MobileLink: '',
    // 배너 2: 대시보드 (PC/모바일)
    banner2PcImage: '',
    banner2PcLink: '',
    banner2MobileImage: '',
    banner2MobileLink: ''
  });

  // 배너 이미지 파일 업로드 핸들러
  const handleBannerUpload = (e, bannerKey) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showConfirm('업로드 실패', '파일 크기는 2MB 이하로 업로드해주세요.', () => {});
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSiteSettings({ ...siteSettings, [bannerKey]: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // 배너 삭제
  const removeBanner = (bannerKey) => {
    setSiteSettings({ ...siteSettings, [bannerKey]: '' });
  };

  // 관리자 관련
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [members, setMembers] = useState(SAMPLE_MEMBERS);
  const [adminUser, setAdminUser] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoginForm, setAdminLoginForm] = useState({ id: '', password: '' });
  const [adminView, setAdminView] = useState('dashboard'); // dashboard, members, admins, settings, banner

  // 일반 사용자 관련
  const [user, setUser] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profile, setProfile] = useState({ region: '', businessType: '' });
  
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [editingStoreName, setEditingStoreName] = useState('');
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('overview');

  // ========== 원재료 관리 관련 state ==========
  const [ingredients, setIngredients] = useState([]);
  const [ingredientModal, setIngredientModal] = useState({ show: false, mode: 'add', data: null });
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientMonth, setIngredientMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // ========== 레시피 관리 관련 state ==========
  const [recipes, setRecipes] = useState([]);
  const [recipeModal, setRecipeModal] = useState({ show: false, mode: 'add', data: null });
  const [recipeSearch, setRecipeSearch] = useState('');

  // ========== 인건비 관리 관련 state ==========
  const [employees, setEmployees] = useState([]);
  const [employeeModal, setEmployeeModal] = useState({ show: false, mode: 'add', data: null });
  const [employeeMonth, setEmployeeMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [employeeTab, setEmployeeTab] = useState('staff'); // 'staff' | 'records' | 'payroll'
  const [workRecords, setWorkRecords] = useState({}); // key: 'employeeId-YYYY-MM-DD'
  const [workRecordModal, setWorkRecordModal] = useState({ show: false, employeeId: null, date: null });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [batchInputModal, setBatchInputModal] = useState({ show: false });
  const [payrollFilter, setPayrollFilter] = useState('all'); // 'all' | employeeId

  // ========== 매장/사업자 정보 state ==========
  const [storeInfo, setStoreInfo] = useState({
    ownerName: '', businessNumber: '', storeAddress: '', storePhone: '',
  });

  // 계약서 모달 state
  const [contractModal, setContractModal] = useState({ show: false, preselectedEmployeeId: null });

  // ========== 손익관리 관련 state ==========
  const [monthlyExpenses, setMonthlyExpenses] = useState({});
  const [profitLossMonth, setProfitLossMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // ========== 대시보드 월 선택 state ==========
  const [dashboardMonth, setDashboardMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // 확인 모달 상태
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  const hideConfirm = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  };

  const handleConfirm = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    hideConfirm();
  };

  // ========== 원재료 관리 함수 ==========
  const INGREDIENT_CATEGORIES = ['음료', '원두/차', '유제품', '시럽/소스', '베이커리', '포장재', '기타'];
  const BASE_UNITS = [
    { value: 'g', label: 'g (그램)' },
    { value: 'kg', label: 'kg (킬로그램)' },
    { value: 'ml', label: 'ml (밀리리터)' },
    { value: 'L', label: 'L (리터)' },
    { value: 'ea', label: 'ea (개)' },
  ];

  // 원재료 추가
  const addIngredient = (ingredientData) => {
    const unitCost = ingredientData.baseAmount > 0
      ? Math.round(ingredientData.unitPrice / ingredientData.baseAmount)
      : 0;

    const newIngredient = {
      id: Date.now(),
      ...ingredientData,
      unitCost,
      createdAt: new Date(),
      purchaseHistory: [{
        id: Date.now(),
        date: new Date(),
        quantity: ingredientData.currentStock,
        unitPrice: ingredientData.unitPrice,
        type: 'initial'
      }]
    };

    setIngredients([...ingredients, newIngredient]);
    setIngredientModal({ show: false, mode: 'add', data: null });
  };

  // 원재료 수정
  const updateIngredient = (ingredientData) => {
    const unitCost = ingredientData.baseAmount > 0
      ? Math.round(ingredientData.unitPrice / ingredientData.baseAmount)
      : 0;

    setIngredients(ingredients.map(ing =>
      ing.id === ingredientData.id
        ? { ...ing, ...ingredientData, unitCost }
        : ing
    ));
    setIngredientModal({ show: false, mode: 'add', data: null });
  };

  // 원재료 삭제
  const deleteIngredient = (ingredientId) => {
    showConfirm('원재료 삭제', '이 원재료를 삭제하시겠습니까?', () => {
      setIngredients(ingredients.filter(ing => ing.id !== ingredientId));
    });
  };

  // 월별 매입 현황 계산
  const getMonthlyPurchaseStats = () => {
    const { year, month } = ingredientMonth;

    let totalAmount = 0;
    let taxableAmount = 0;
    let taxFreeAmount = 0;
    const supplierTotals = {};

    ingredients.forEach(ing => {
      ing.purchaseHistory?.forEach(purchase => {
        const purchaseDate = new Date(purchase.date);
        if (purchaseDate.getFullYear() === year && purchaseDate.getMonth() + 1 === month) {
          const amount = purchase.quantity * purchase.unitPrice;
          totalAmount += amount;

          if (ing.taxType === '과세') {
            taxableAmount += amount;
          } else {
            taxFreeAmount += amount;
          }

          if (!supplierTotals[ing.supplier]) {
            supplierTotals[ing.supplier] = 0;
          }
          supplierTotals[ing.supplier] += amount;
        }
      });
    });

    return {
      totalAmount,
      taxableAmount,
      taxFreeAmount,
      supplierData: Object.entries(supplierTotals)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
    };
  };

  // 월 이동
  const changeMonth = (delta) => {
    setIngredientMonth(prev => {
      let newMonth = prev.month + delta;
      let newYear = prev.year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
  };

  // 원재료 검색 필터
  const filteredIngredients = ingredients.filter(ing => {
    const searchLower = ingredientSearch.toLowerCase();
    return (
      ing.name.toLowerCase().includes(searchLower) ||
      ing.category.toLowerCase().includes(searchLower) ||
      ing.supplier.toLowerCase().includes(searchLower)
    );
  });

  // 재고 상태 계산 (%)
  const getStockStatus = (current, safety) => {
    if (safety <= 0) return { percent: 100, color: 'bg-green-500' };
    const percent = (current / safety) * 100;
    if (percent >= 100) return { percent: Math.min(percent, 100), color: 'bg-green-500' };
    if (percent >= 50) return { percent, color: 'bg-amber-500' };
    return { percent, color: 'bg-red-500' };
  };

  // 통화 포맷 (원재료용)
  const formatWon = (num) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만원`;
    }
    return `${num.toLocaleString()}원`;
  };

  // ========== 레시피 관리 함수 ==========
  const RECIPE_CATEGORIES = ['음료', '디저트', '베이커리', '식사', '기타'];

  // 레시피 추가
  const addRecipe = (recipeData) => {
    const totalCost = recipeData.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
    const costRate = recipeData.price > 0 ? ((totalCost / recipeData.price) * 100).toFixed(1) : 0;
    const marginRate = (100 - costRate).toFixed(1);

    const newRecipe = {
      id: Date.now(),
      ...recipeData,
      totalCost,
      costRate: parseFloat(costRate),
      marginRate: parseFloat(marginRate),
      createdAt: new Date(),
    };

    setRecipes([...recipes, newRecipe]);
    setRecipeModal({ show: false, mode: 'add', data: null });
  };

  // 레시피 수정
  const updateRecipe = (recipeData) => {
    const totalCost = recipeData.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
    const costRate = recipeData.price > 0 ? ((totalCost / recipeData.price) * 100).toFixed(1) : 0;
    const marginRate = (100 - costRate).toFixed(1);

    setRecipes(recipes.map(recipe =>
      recipe.id === recipeData.id
        ? {
            ...recipe,
            ...recipeData,
            totalCost,
            costRate: parseFloat(costRate),
            marginRate: parseFloat(marginRate),
          }
        : recipe
    ));
    setRecipeModal({ show: false, mode: 'add', data: null });
  };

  // 레시피 삭제
  const deleteRecipe = (recipeId) => {
    showConfirm('레시피 삭제', '이 레시피를 삭제하시겠습니까?', () => {
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    });
  };

  // 레시피 검색 필터
  const filteredRecipes = recipes.filter(recipe => {
    const searchLower = recipeSearch.toLowerCase();
    return (
      recipe.name.toLowerCase().includes(searchLower) ||
      recipe.category.toLowerCase().includes(searchLower)
    );
  });

  // 원재료 ID로 현재 원가 정보 조회 (원재료가 수정되면 최신 정보 반영)
  const getIngredientInfo = (ingredientId) => {
    return ingredients.find(ing => ing.id === ingredientId);
  };

  // ========== 인건비 관리 함수 ==========
  // 직원 추가
  const addEmployee = (employeeData) => {
    const newEmployee = {
      id: Date.now(),
      ...employeeData,
      createdAt: new Date(),
    };
    setEmployees([...employees, newEmployee]);
    setEmployeeModal({ show: false, mode: 'add', data: null });
  };

  // 직원 수정
  const updateEmployee = (employeeData) => {
    setEmployees(employees.map(emp =>
      emp.id === employeeData.id ? { ...emp, ...employeeData } : emp
    ));
    setEmployeeModal({ show: false, mode: 'add', data: null });
  };

  // 직원 삭제
  const deleteEmployee = (employeeId) => {
    showConfirm('직원 삭제', '이 직원을 삭제하시겠습니까?', () => {
      setEmployees(employees.filter(emp => emp.id !== employeeId));
    });
  };

  // 인건비 월 이동
  const changeEmployeeMonth = (delta) => {
    setEmployeeMonth(prev => {
      let newMonth = prev.month + delta;
      let newYear = prev.year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
  };

  // 이번 달 총 인건비 계산
  const getMonthlyLaborCost = () => {
    let totalBasePay = 0;
    let totalWeeklyHolidayPay = 0;
    let totalInsurance = 0;
    let hourlyCount = 0;
    let monthlyCount = 0;
    let totalHourlyWage = 0;

    employees.forEach(emp => {
      if (emp.type === 'freelancer') {
        // 프리랜서: monthlyFee가 기본 급여, 보험 없음
        totalBasePay += Number(emp.monthlyFee) || 0;
      } else if (emp.taxType === 'daily' || emp.type === 'daily') {
        // 일용직: dailyWage × workDays.length × 4.345
        totalBasePay += Math.round((emp.dailyWage || 0) * (emp.workDays?.length || 0) * 4.345);
      } else {
        totalBasePay += emp.type === 'hourly'
          ? Math.round(emp.hourlyWage * emp.weeklyHours * 4.345)
          : emp.monthlyWage;
      }

      if (emp.type === 'hourly' && emp.weeklyHours >= 15 && emp.taxType !== 'daily') {
        totalWeeklyHolidayPay += emp.weeklyHolidayPay || 0;
      }

      if (emp.taxType !== 'daily' && emp.type !== 'freelancer') {
        totalInsurance += emp.insuranceCost || 0;
      }

      if (emp.type === 'hourly') {
        hourlyCount++;
        totalHourlyWage += emp.hourlyWage;
      } else {
        monthlyCount++;
      }
    });

    return {
      totalBasePay,
      totalWeeklyHolidayPay,
      totalInsurance,
      totalLaborCost: totalBasePay + totalWeeklyHolidayPay + totalInsurance,
      employeeCount: employees.length,
      hourlyCount,
      monthlyCount,
      avgHourlyWage: hourlyCount > 0 ? Math.round(totalHourlyWage / hourlyCount) : 0,
    };
  };

  // ========== 근무 기록 관련 함수 ==========
  // 근무 기록 저장
  const saveWorkRecord = (record) => {
    const key = `${record.employeeId}-${record.date}`;
    setWorkRecords(prev => ({ ...prev, [key]: record }));
    setWorkRecordModal({ show: false, employeeId: null, date: null });
  };

  // 근무 기록 삭제
  const deleteWorkRecord = (employeeId, date) => {
    const key = `${employeeId}-${date}`;
    setWorkRecords(prev => {
      const newRecords = { ...prev };
      delete newRecords[key];
      return newRecords;
    });
  };

  // 해당 월의 모든 날짜 가져오기
  const getDaysInMonth = (year, month) => {
    const days = [];
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
      days.push(date.toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  // 해당 월의 주 단위 시작일 목록 (월요일 기준)
  const getWeeksInMonth = (year, month) => {
    const weeks = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // 첫 번째 월요일 찾기 (또는 해당 월 1일이 속한 주의 월요일)
    let current = new Date(firstDay);
    const dayOfWeek = current.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일로 이동
    current.setDate(current.getDate() + diff);

    while (current <= lastDay || current.getMonth() === month - 1) {
      weeks.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 7);
      if (current > lastDay && current.getMonth() !== month - 1) break;
    }

    return weeks;
  };

  // 특정 주의 날짜들 가져오기 (월~일)
  const getWeekDays = (weekStartDate) => {
    const days = [];
    const start = new Date(weekStartDate);
    for (let i = 0; i < 7; i++) {
      days.push(start.toISOString().split('T')[0]);
      start.setDate(start.getDate() + 1);
    }
    return days;
  };

  // 소정근로일 판단
  const isScheduledWorkDay = (employee, dateStr) => {
    if (!employee?.workDays) return false;
    const dayOfWeek = new Date(dateStr).getDay();
    return employee.workDays.includes(dayOfWeek);
  };

  // 주간 주휴수당 계산 (실제 근무 기록 기반)
  const calculateWeeklyHolidayPayFromRecords = (employeeId, weekStartDate) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee || employee.type === 'monthly') {
      return { eligible: false, reason: '월급제', weeklyHours: 0, holidayPay: 0 };
    }

    const weekDays = getWeekDays(weekStartDate);
    let weeklyActualHours = 0;
    let hasFullAttendance = true;

    weekDays.forEach(day => {
      const key = `${employeeId}-${day}`;
      const record = workRecords[key];

      if (!record || record.status === 'dayoff') {
        // 원래 쉬는 날 → 무관
        return;
      }

      // 소정근로일 체크
      if (isScheduledWorkDay(employee, day)) {
        if (record.status === 'absent' || record.status === 'sick') {
          hasFullAttendance = false;
        }
      }

      // 실제 근무시간 합산
      const status = WORK_STATUS[record.status];
      if (status) {
        if (record.status === 'work' || record.status === 'late' || record.status === 'halfday') {
          weeklyActualHours += record.actualHours || 0;
        } else if (record.status === 'annual' || record.status === 'family') {
          weeklyActualHours += employee.contractDailyHours || 0;
        } else if (record.status === 'holiday' && isScheduledWorkDay(employee, day)) {
          weeklyActualHours += employee.contractDailyHours || 0;
        }
      }
    });

    const isEligible = weeklyActualHours >= 15 && hasFullAttendance;

    if (!isEligible) {
      return {
        eligible: false,
        reason: !hasFullAttendance ? '개근 미충족' : '주 15시간 미만',
        weeklyHours: weeklyActualHours,
        holidayPay: 0,
      };
    }

    // 주휴수당 = (주간 근무시간 / 40) × 8 × 시급
    const holidayPay = Math.round((weeklyActualHours / 40) * 8 * employee.hourlyWage);

    return {
      eligible: true,
      reason: '주휴수당 해당',
      weeklyHours: weeklyActualHours,
      holidayPay,
    };
  };

  // 계약대로 자동 채우기
  const autoFillFromContract = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const days = getDaysInMonth(employeeMonth.year, employeeMonth.month);
    const newRecords = { ...workRecords };

    days.forEach(day => {
      const dayOfWeek = new Date(day).getDay();
      const isWorkDay = employee.workDays?.includes(dayOfWeek);
      const key = `${employeeId}-${day}`;

      if (isWorkDay) {
        if (employee.taxType === 'daily') {
          newRecords[key] = {
            employeeId,
            date: day,
            dayOfWeek,
            status: 'work',
            startTime: '00:00',
            endTime: '00:00',
            breakHours: 0,
            actualHours: 0,
            contractHours: 0,
            overtimeHours: 0,
            dailyWage: employee.dailyWage || 100000,
            memo: '',
          };
        } else {
          newRecords[key] = {
            employeeId,
            date: day,
            dayOfWeek,
            status: 'work',
            startTime: employee.defaultStartTime || '09:00',
            endTime: employee.defaultEndTime || '14:00',
            breakHours: employee.defaultBreak || 0,
            actualHours: employee.contractDailyHours || 5,
            contractHours: employee.contractDailyHours || 5,
            overtimeHours: 0,
            memo: '',
          };
        }
      } else {
        newRecords[key] = {
          employeeId,
          date: day,
          dayOfWeek,
          status: 'dayoff',
          actualHours: 0,
          memo: '',
        };
      }
    });

    setWorkRecords(newRecords);
  };

  // 일괄 입력 (선택한 날짜 범위에 동일 상태 적용)
  const batchInputRecords = (employeeId, startDate, endDate, status, startTime, endTime, breakHours, dailyWageParam) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const newRecords = { ...workRecords };
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const key = `${employeeId}-${dateStr}`;

      if (status === 'work' || status === 'late' || status === 'halfday') {
        if (employee.taxType === 'daily') {
          newRecords[key] = {
            employeeId, date: dateStr, dayOfWeek: current.getDay(),
            status, startTime: '00:00', endTime: '00:00', breakHours: 0,
            actualHours: 0, contractHours: 0, overtimeHours: 0,
            dailyWage: dailyWageParam || employee.dailyWage || 100000, memo: '',
          };
        } else {
          const startMin = startTime.split(':').map(Number);
          const endMin = endTime.split(':').map(Number);
          const actualH = Math.max(0, (endMin[0] * 60 + endMin[1] - startMin[0] * 60 - startMin[1]) / 60 - (breakHours || 0));
          const contractH = employee.contractDailyHours || 5;
          newRecords[key] = {
            employeeId, date: dateStr, dayOfWeek: current.getDay(),
            status, startTime, endTime, breakHours: breakHours || 0,
            actualHours: actualH, contractHours: contractH,
            overtimeHours: Math.max(0, actualH - contractH), memo: '',
          };
        }
      } else {
        newRecords[key] = {
          employeeId, date: dateStr, dayOfWeek: current.getDay(),
          status, startTime: '', endTime: '', breakHours: 0,
          actualHours: 0, contractHours: employee.contractDailyHours || 5,
          overtimeHours: 0, memo: '',
        };
      }
      current.setDate(current.getDate() + 1);
    }
    setWorkRecords(newRecords);
    setBatchInputModal({ show: false });
  };

  // 급여 정산 엑셀 다운로드
  const downloadPayrollExcel = () => {
    const data = [['직원명', '유형', '총근무시간', '기본급', '연장수당', '차감', '유급휴가', '주휴수당', '총급여', '4대보험(사업주)', '총인건비']];
    let grandTotalPay = 0, grandInsurance = 0, grandLabor = 0;

    const targetEmployees = payrollFilter === 'all' ? employees : employees.filter(e => e.id === Number(payrollFilter));
    targetEmployees.forEach(emp => {
      const p = calculateMonthlyPayFromRecords(emp.id);
      if (!p) return;
      grandTotalPay += p.totalPay;
      grandInsurance += p.insurancePay;
      grandLabor += p.totalLaborCost;
      data.push([
        emp.name, emp.type === 'freelancer' ? '프리랜서' : emp.taxType === 'daily' || emp.type === 'daily' ? '일용직' : emp.type === 'hourly' ? '시급제' : '월급제',
        p.totalActualHours, p.basePay, p.overtimePay, p.deductPay,
        p.paidLeavePay, p.weeklyHolidayPay, p.totalPay, p.insurancePay, p.totalLaborCost,
      ]);
    });
    data.push([]);
    data.push(['합계', '', '', '', '', '', '', '', grandTotalPay, grandInsurance, grandLabor]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '급여정산');
    XLSX.writeFile(wb, `급여정산_${employeeMonth.year}-${String(employeeMonth.month).padStart(2, '0')}.xlsx`);
  };

  // 월간 급여 계산 (근무 기록 기반)
  const calculateMonthlyPayFromRecords = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return null;

    // 프리랜서: 월 보수 고정, 3.3% 원천징수
    if (employee.type === 'freelancer') {
      const basePay = Number(employee.monthlyFee) || 0;
      const withholdingDed = Math.round(basePay * 0.033);
      return {
        employee,
        totalActualHours: 0,
        totalOvertimeHours: 0,
        totalDeductHours: 0,
        totalPaidLeaveHours: 0,
        basePay,
        overtimePay: 0,
        deductPay: 0,
        paidLeavePay: 0,
        weeklyHolidayPay: 0,
        totalPay: basePay,
        insurancePay: 0,
        withholdingDeduction: withholdingDed,
        employeeInsuranceDeduction: 0,
        employeeNetPay: basePay - withholdingDed,
        totalLaborCost: basePay,
        weeklyDetails: [],
        details: { overtimes: [], deductions: [], paidLeaves: [] },
      };
    }

    // 일용직: 날짜별 dailyWage 합산
    if (employee.taxType === 'daily') {
      const days = getDaysInMonth(employeeMonth.year, employeeMonth.month);
      let basePay = 0;
      let workDayCount = 0;
      const dailyDetails = [];

      days.forEach(day => {
        const key = `${employeeId}-${day}`;
        const record = workRecords[key];
        if (!record) return;
        if (record.status === 'work' || record.status === 'late' || record.status === 'halfday') {
          const wage = record.dailyWage || employee.dailyWage || 0;
          basePay += wage;
          workDayCount++;
          dailyDetails.push({ date: day, dailyWage: wage });
        }
      });

      return {
        employee,
        totalActualHours: 0,
        totalOvertimeHours: 0,
        totalDeductHours: 0,
        totalPaidLeaveHours: 0,
        basePay,
        overtimePay: 0,
        deductPay: 0,
        paidLeavePay: 0,
        weeklyHolidayPay: 0,
        totalPay: basePay,
        insurancePay: 0,
        withholdingDeduction: 0,
        employeeInsuranceDeduction: 0,
        employeeNetPay: basePay,
        totalLaborCost: basePay,
        weeklyDetails: [],
        details: { overtimes: [], deductions: [], paidLeaves: [] },
        workDayCount,
        dailyDetails,
      };
    }

    // 월급제는 고정 급여
    if (employee.type === 'monthly') {
      // 비과세 항목 반영
      const te = employee.taxExempt || { meal: 0, transport: 0, childcare: 0, numberOfChildren: 0 };
      const mChildcareLimit = (Number(te.numberOfChildren) || 0) * TAX_EXEMPT_LIMITS.childcarePerChild;
      const mTotalTaxExempt = Math.min(
        Math.min(Number(te.meal) || 0, TAX_EXEMPT_LIMITS.meal) +
        Math.min(Number(te.transport) || 0, TAX_EXEMPT_LIMITS.transport) +
        Math.min(Number(te.childcare) || 0, mChildcareLimit),
        employee.monthlyWage
      );
      const mTaxableAmount = employee.monthlyWage - mTotalTaxExempt;
      const mInsurance = employee.insuranceCost || 0;
      const mEmployeeInsRate = 0.045 + 0.03545 + 0.0046 + 0.009;
      const mEmployeeInsDed = (employee.taxType === 'insurance' || !employee.taxType) ? Math.round(mTaxableAmount * mEmployeeInsRate) : 0;
      const mWithholding = employee.taxType === 'withholding' ? Math.round(employee.monthlyWage * 0.033) : 0;
      const mNetPay = employee.taxType === 'withholding'
        ? employee.monthlyWage - mWithholding
        : employee.monthlyWage - mEmployeeInsDed;
      return {
        employee,
        totalActualHours: 0,
        totalOvertimeHours: 0,
        totalDeductHours: 0,
        totalPaidLeaveHours: 0,
        basePay: employee.monthlyWage,
        overtimePay: 0,
        deductPay: 0,
        paidLeavePay: 0,
        weeklyHolidayPay: 0,
        totalPay: employee.monthlyWage,
        totalTaxExempt: mTotalTaxExempt,
        taxableAmount: mTaxableAmount,
        insurancePay: mInsurance,
        withholdingDeduction: mWithholding,
        employeeInsuranceDeduction: mEmployeeInsDed,
        employeeNetPay: mNetPay,
        totalLaborCost: employee.monthlyWage + mInsurance,
        weeklyDetails: [],
      };
    }

    const days = getDaysInMonth(employeeMonth.year, employeeMonth.month);
    let totalActualHours = 0;
    let totalOvertimeHours = 0;
    let totalDeductHours = 0;
    let totalPaidLeaveHours = 0;
    const details = { overtimes: [], deductions: [], paidLeaves: [] };

    // 날짜별 집계
    days.forEach(day => {
      const key = `${employeeId}-${day}`;
      const record = workRecords[key];
      if (!record) return;

      switch (record.status) {
        case 'work':
          totalActualHours += record.actualHours || 0;
          if (record.overtimeHours > 0) {
            totalOvertimeHours += record.overtimeHours;
            details.overtimes.push({ date: day, hours: record.overtimeHours });
          }
          break;
        case 'late':
        case 'halfday': {
          totalActualHours += record.actualHours || 0;
          const deductH = (record.contractHours || 0) - (record.actualHours || 0);
          if (deductH > 0) {
            totalDeductHours += deductH;
            details.deductions.push({ date: day, hours: deductH, reason: record.status === 'late' ? '지각' : '반차' });
          }
          break;
        }
        case 'annual':
        case 'family':
          totalPaidLeaveHours += employee.contractDailyHours || 0;
          details.paidLeaves.push({ date: day, hours: employee.contractDailyHours || 0, type: record.status === 'annual' ? '연차' : '경조사' });
          break;
        case 'holiday':
          if (isScheduledWorkDay(employee, day)) {
            totalPaidLeaveHours += employee.contractDailyHours || 0;
            details.paidLeaves.push({ date: day, hours: employee.contractDailyHours || 0, type: '공휴일(유급)' });
          }
          break;
      }
    });

    // 주별 주휴수당
    const weeks = getWeeksInMonth(employeeMonth.year, employeeMonth.month);
    let totalWeeklyHolidayPay = 0;
    const weeklyDetails = weeks.map(weekStart => {
      const result = calculateWeeklyHolidayPayFromRecords(employeeId, weekStart);
      totalWeeklyHolidayPay += result.holidayPay;
      return { weekStart, ...result };
    });

    // 급여 계산
    const basePay = totalActualHours * employee.hourlyWage;
    const overtimePay = totalOvertimeHours * employee.hourlyWage; // 5인 미만 1.0배
    const deductPay = totalDeductHours * employee.hourlyWage;
    const paidLeavePay = totalPaidLeaveHours * employee.hourlyWage;

    const totalPay = basePay + overtimePay - deductPay + paidLeavePay + totalWeeklyHolidayPay;

    // 4대보험 (비율 기반 재계산) - taxType이 insurance일 때만
    const insuranceRates = {
      national: 0.045,
      health: 0.03545 + 0.004591,
      employment: 0.009,
      industrial: 0.007,
    };
    let insurancePay = 0;
    if (employee.taxType === 'insurance' || !employee.taxType) {
      if (employee.insurance?.national) insurancePay += totalPay * insuranceRates.national;
      if (employee.insurance?.health) insurancePay += totalPay * insuranceRates.health;
      if (employee.insurance?.employment) insurancePay += totalPay * insuranceRates.employment;
      if (employee.insurance?.industrial) insurancePay += totalPay * insuranceRates.industrial;
    }
    insurancePay = Math.round(insurancePay);
    // 3.3% 원천징수 공제액 (직원 부담, 사업주 부담 아님)
    const withholdingDeduction = employee.taxType === 'withholding' ? Math.round(totalPay * 0.033) : 0;

    // 직원 부담 4대보험 (국민연금4.5% + 건강보험3.545% + 장기요양0.46% + 고용보험0.9%)
    const employeeInsuranceRate = 0.045 + 0.03545 + 0.0046 + 0.009;
    const employeeInsuranceDeduction = (employee.taxType === 'insurance' || !employee.taxType) ? Math.round(totalPay * employeeInsuranceRate) : 0;
    // 직원 실수령액
    const employeeNetPay = employee.taxType === 'withholding'
      ? totalPay - withholdingDeduction
      : totalPay - employeeInsuranceDeduction;

    return {
      employee,
      totalActualHours,
      totalOvertimeHours,
      totalDeductHours,
      totalPaidLeaveHours,
      basePay,
      overtimePay,
      deductPay,
      paidLeavePay,
      weeklyHolidayPay: totalWeeklyHolidayPay,
      totalPay,
      insurancePay,
      withholdingDeduction,
      employeeInsuranceDeduction,
      employeeNetPay,
      totalLaborCost: totalPay + insurancePay,
      weeklyDetails,
      details,
    };
  };

  // 전체 직원 월간 총 인건비 (근무 기록 기반)
  const getTotalMonthlyLaborFromRecords = () => {
    let total = 0;
    employees.forEach(emp => {
      const result = calculateMonthlyPayFromRecords(emp.id);
      if (result) total += result.totalLaborCost;
    });
    return total;
  };

  // ========== 손익관리 관련 함수 ==========
  // 손익관리 월 이동
  const changeProfitLossMonth = (delta) => {
    setProfitLossMonth(prev => {
      let newMonth = prev.month + delta;
      let newYear = prev.year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
  };

  // 월 키 생성 (예: '2026-02')
  const getMonthKey = (year, month) => {
    return `${year}-${String(month).padStart(2, '0')}`;
  };

  // 현재 월의 비용 데이터 가져오기 또는 초기화
  const getCurrentMonthExpenses = () => {
    const monthKey = getMonthKey(profitLossMonth.year, profitLossMonth.month);
    return monthlyExpenses[monthKey] || {
      costOfGoods: 0,
      rent: 0,
      maintenance: 0,
      utilities: 0,
      cardFee: 0,
      otherOperating: 0,
      loanInterest: 0,
      tax: 0,
      memo: '',
    };
  };

  // 월별 비용 저장
  const saveMonthlyExpenses = (expenses) => {
    const monthKey = getMonthKey(profitLossMonth.year, profitLossMonth.month);
    setMonthlyExpenses(prev => ({
      ...prev,
      [monthKey]: expenses
    }));
  };

  // 이전 달 고정비 복사
  const copyPreviousMonthExpenses = () => {
    let prevMonth = profitLossMonth.month - 1;
    let prevYear = profitLossMonth.year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear--;
    }
    const prevMonthKey = getMonthKey(prevYear, prevMonth);
    const prevExpenses = monthlyExpenses[prevMonthKey];

    if (prevExpenses) {
      const currentMonthKey = getMonthKey(profitLossMonth.year, profitLossMonth.month);
      setMonthlyExpenses(prev => ({
        ...prev,
        [currentMonthKey]: { ...prevExpenses }
      }));
      return true;
    }
    return false;
  };

  // 선택한 월의 매출 계산 (POS 데이터 기반)
  const getMonthlyRevenue = () => {
    if (!selectedStore?.salesData) return 0;
    const filtered = selectedStore.salesData.filter(item => {
      const date = new Date(item.date);
      return date.getFullYear() === profitLossMonth.year &&
             date.getMonth() + 1 === profitLossMonth.month;
    });
    return filtered.reduce((sum, item) => sum + item.amount, 0);
  };

  // 선택한 월의 매출원가 계산 (레시피 기반 자동계산)
  const getMonthlyCostOfGoods = () => {
    if (!selectedStore?.salesData || recipes.length === 0) return 0;

    const filtered = selectedStore.salesData.filter(item => {
      const date = new Date(item.date);
      return date.getFullYear() === profitLossMonth.year &&
             date.getMonth() + 1 === profitLossMonth.month;
    });

    let totalCost = 0;
    const productCounts = {};

    // 상품별 판매 수량 집계
    filtered.forEach(item => {
      productCounts[item.product] = (productCounts[item.product] || 0) + 1;
    });

    // 레시피 기반 원가 계산
    Object.entries(productCounts).forEach(([productName, count]) => {
      const recipe = recipes.find(r => r.name === productName);
      if (recipe) {
        totalCost += recipe.totalCost * count;
      }
    });

    return totalCost;
  };

  // 손익 계산
  const calculateProfitLoss = () => {
    const revenue = getMonthlyRevenue();
    const laborStats = getMonthlyLaborCost();
    const expenses = getCurrentMonthExpenses();
    const costOfGoods = expenses.costOfGoods || 0; // v1: 직접입력 (v2에서 getMonthlyCostOfGoods()로 복구)

    const grossProfit = revenue - costOfGoods;

    const operatingExpense =
      laborStats.totalLaborCost +
      (expenses.rent || 0) +
      (expenses.maintenance || 0) +
      (expenses.utilities || 0) +
      (expenses.cardFee || 0) +
      (expenses.otherOperating || 0);

    const operatingProfit = grossProfit - operatingExpense;

    const otherExpense = (expenses.loanInterest || 0) + (expenses.tax || 0);
    const netProfit = operatingProfit - otherExpense;

    const costRate = revenue > 0 ? ((costOfGoods / revenue) * 100).toFixed(1) : 0;
    const grossProfitRate = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : 0;
    const operatingProfitRate = revenue > 0 ? ((operatingProfit / revenue) * 100).toFixed(1) : 0;
    const netProfitRate = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;

    return {
      revenue,
      costOfGoods,
      costRate,
      grossProfit,
      grossProfitRate,
      laborCost: laborStats.totalLaborCost,
      insuranceCost: laborStats.totalInsurance,
      rent: expenses.rent || 0,
      maintenance: expenses.maintenance || 0,
      utilities: expenses.utilities || 0,
      cardFee: expenses.cardFee || 0,
      otherOperating: expenses.otherOperating || 0,
      operatingExpense,
      operatingProfit,
      operatingProfitRate,
      loanInterest: expenses.loanInterest || 0,
      tax: expenses.tax || 0,
      otherExpense,
      netProfit,
      netProfitRate,
      memo: expenses.memo || '',
    };
  };

  // 손익률에 따른 색상
  const getProfitRateColor = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 20) return 'text-green-400';
    if (numRate >= 10) return 'text-emerald-400';
    if (numRate >= 5) return 'text-amber-400';
    if (numRate >= 0) return 'text-orange-400';
    return 'text-red-400';
  };

  // 최근 N개월 손익 추이
  const getProfitLossTrend = (months = 6) => {
    const trend = [];
    let year = profitLossMonth.year;
    let month = profitLossMonth.month;

    for (let i = 0; i < months; i++) {
      // 해당 월의 매출
      const filtered = (selectedStore?.salesData || []).filter(item => {
        const date = new Date(item.date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });
      const revenue = filtered.reduce((sum, item) => sum + item.amount, 0);

      // 해당 월의 비용
      const monthKey = getMonthKey(year, month);
      const expenses = monthlyExpenses[monthKey] || {};
      const totalExpense =
        (expenses.rent || 0) +
        (expenses.maintenance || 0) +
        (expenses.utilities || 0) +
        (expenses.cardFee || 0) +
        (expenses.otherOperating || 0) +
        (expenses.loanInterest || 0) +
        (expenses.tax || 0);

      // 대략적인 순이익 (인건비는 현재 직원 기준으로 계산)
      const laborCost = getMonthlyLaborCost().totalLaborCost;
      const netProfit = revenue - totalExpense - laborCost;

      trend.unshift({
        month: `${month}월`,
        monthKey,
        revenue,
        expense: totalExpense + laborCost,
        netProfit,
        rate: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0
      });

      // 이전 달로 이동
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
    }

    return trend;
  };

  // ========== 대시보드 관련 함수 ==========
  // 대시보드 월 이동
  const changeDashboardMonth = (delta) => {
    setDashboardMonth(prev => {
      let newMonth = prev.month + delta;
      let newYear = prev.year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
  };

  // 선택한 월의 매출 데이터 필터링
  const getMonthlyFilteredData = (salesData, year, month) => {
    if (!salesData) return [];
    return salesData.filter(item => {
      const date = new Date(item.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  };

  // 상품명으로 레시피 찾기
  const findRecipeByProductName = (productName) => {
    if (!productName) return null;
    const normalizedName = productName.trim().toLowerCase();
    return recipes.find(recipe =>
      recipe.name.trim().toLowerCase() === normalizedName
    );
  };

  // 선택월 대시보드 통계 계산
  const getDashboardStats = () => {
    const { year, month } = dashboardMonth;
    const currentMonthData = getMonthlyFilteredData(selectedStore?.salesData, year, month);

    // 전월 데이터
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear--;
    }
    const prevMonthData = getMonthlyFilteredData(selectedStore?.salesData, prevYear, prevMonth);

    // 전년 동월 데이터
    const prevYearData = getMonthlyFilteredData(selectedStore?.salesData, year - 1, month);

    // 1. 선택월 매출
    const currentSales = currentMonthData.reduce((sum, item) => sum + (item.amount || 0), 0);
    const prevMonthSales = prevMonthData.reduce((sum, item) => sum + (item.amount || 0), 0);
    const prevYearSales = prevYearData.reduce((sum, item) => sum + (item.amount || 0), 0);

    // 전월 대비 변화율
    const monthChange = prevMonthSales > 0
      ? ((currentSales - prevMonthSales) / prevMonthSales * 100).toFixed(1)
      : null;

    // 전년 대비 변화율
    const yearChange = prevYearSales > 0
      ? ((currentSales - prevYearSales) / prevYearSales * 100).toFixed(1)
      : null;

    // v2에서 복구: 선택월 총이익 (원재료/레시피 기능 추가 후)
    /*
    let totalCost = 0;
    let matchedCount = 0;
    let unmatchedCount = 0;

    currentMonthData.forEach(item => {
      const recipe = findRecipeByProductName(item.product);
      if (recipe) {
        totalCost += recipe.totalCost;
        matchedCount++;
      } else {
        unmatchedCount++;
      }
    });

    const totalProfit = currentSales - totalCost;
    const profitRate = currentSales > 0 ? ((totalProfit / currentSales) * 100).toFixed(1) : 0;
    const costRate = currentSales > 0 ? ((totalCost / currentSales) * 100).toFixed(1) : 0;
    */

    // v2에서 복구: 선택월 발주금액 (원재료/레시피 기능 추가 후)
    /*
    const purchaseStats = getMonthlyPurchaseStats();
    const currentPurchase = purchaseStats.totalAmount;

    const prevMonthPurchase = (() => {
      let total = 0;
      ingredients.forEach(ing => {
        ing.purchaseHistory?.forEach(purchase => {
          const purchaseDate = new Date(purchase.date);
          if (purchaseDate.getFullYear() === prevYear && purchaseDate.getMonth() + 1 === prevMonth) {
            total += purchase.quantity * purchase.unitPrice;
          }
        });
      });
      return total;
    })();

    const purchaseChange = prevMonthPurchase > 0
      ? ((currentPurchase - prevMonthPurchase) / prevMonthPurchase * 100).toFixed(1)
      : null;
    */

    // 4. 일 평균 매출
    const uniqueDays = new Set(currentMonthData.map(item => item.dateStr)).size;
    const avgDaily = uniqueDays > 0 ? Math.round(currentSales / uniqueDays) : 0;

    // 5. 평균 객단가
    const transactionCount = currentMonthData.length;
    const avgTransaction = transactionCount > 0 ? Math.round(currentSales / transactionCount) : 0;

    return {
      // 선택월 매출
      currentSales,
      monthChange,
      yearChange,
      // v2에서 복구: 선택월 총이익
      // totalProfit, totalCost, profitRate, costRate, matchedCount, unmatchedCount,
      // v2에서 복구: 선택월 발주금액
      // currentPurchase, purchaseChange,
      // 일 평균 매출
      avgDaily,
      uniqueDays,
      // 평균 객단가
      avgTransaction,
      transactionCount,
    };
  };

  // 선택월 기준 분석 데이터 (서브탭용 - 월별 필터링)
  const getMonthlyAnalysis = () => {
    if (!selectedStore?.salesData?.length) return null;
    const { year, month } = dashboardMonth;
    const monthData = getMonthlyFilteredData(selectedStore.salesData, year, month);
    if (monthData.length === 0) return null;
    return analyzeData(monthData);
  };

  // ============================================
  // v2에서 복구: 지역/업종 평균 매출 함수
  // ============================================
  /*
  const getRegionalAvgSales = (region, month) => {
    const baseAvg = REGION_AVG_SALES[region] || 450000;
    const factor = MONTHLY_FACTOR[month] || 1.0;
    return Math.round(baseAvg * factor);
  };

  const getBusinessAvgSales = (businessType, month) => {
    const baseAvg = BUSINESS_AVG_SALES[businessType] || 450000;
    const factor = MONTHLY_FACTOR[month] || 1.0;
    return Math.round(baseAvg * factor);
  };
  */

  // ============================================
  // v2에서 복구: AI 조언 state
  // ============================================
  // const [aiAdvice, setAiAdvice] = useState(null);
  // const [aiLoading, setAiLoading] = useState(false);

  // ============================================
  // v2에서 복구: AI 조언 캐시 키 생성 & AI 조언 생성 (OpenAI API)
  // ============================================
  /*
  const getAiCacheKey = () => {
    const { year, month } = dashboardMonth;
    return `ai_advice_${selectedStoreId}_${year}_${month}`;
  };

  const generateAiAdvice = async () => {
    const stats = getDashboardStats();
    const regionAvg = getRegionalAvgSales(profile.region, dashboardMonth.month);
    const businessAvg = getBusinessAvgSales(profile.businessType, dashboardMonth.month);
    const cacheKey = getAiCacheKey();
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
          setAiAdvice(parsed.advice);
          return;
        }
      } catch (e) { console.error('Cache parse error:', e); }
    }
    setAiLoading(true);
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) { setAiAdvice('API 키가 설정되지 않았습니다.'); setAiLoading(false); return; }
      const prompt = `소상공인 매출 분석...`; // (원본 프롬프트 생략)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 200, temperature: 0.7 })
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      const advice = data.choices[0]?.message?.content || '조언을 생성할 수 없습니다.';
      localStorage.setItem(cacheKey, JSON.stringify({ advice, timestamp: Date.now() }));
      setAiAdvice(advice);
    } catch (error) {
      console.error('AI Advice Error:', error);
      setAiAdvice('AI 조언을 불러오는 중 오류가 발생했습니다.');
    } finally { setAiLoading(false); }
  };
  */

  const changeDashboardMonthWithReset = (delta) => {
    // setAiAdvice(null); // v2에서 복구
    changeDashboardMonth(delta);
  };

  const selectedStore = stores.find(s => s.id === selectedStoreId);
  const fullStoreInfo = { storeName: selectedStore?.name || '', ...storeInfo };

  // 데이터가 있는 월로 자동 이동 (dashboardMonth 초기값이 현재 날짜이므로 데이터와 불일치 방지)
  useEffect(() => {
    if (!selectedStore?.salesData?.length) return;
    const months = new Set();
    selectedStore.salesData.forEach(item => {
      const d = new Date(item.date);
      if (!isNaN(d.getTime())) {
        months.add(d.getFullYear() * 100 + (d.getMonth() + 1));
      }
    });
    if (months.size === 0) return;
    setDashboardMonth(prev => {
      const currentKey = prev.year * 100 + prev.month;
      if (months.has(currentKey)) return prev;
      const latestKey = Math.max(...months);
      return { year: Math.floor(latestKey / 100), month: latestKey % 100 };
    });
  }, [selectedStoreId, selectedStore?.salesData?.length]);

  // 관리자 로그인
  const handleAdminLogin = () => {
    const admin = admins.find(a => a.id === adminLoginForm.id && a.password === adminLoginForm.password);
    if (admin) {
      setAdminUser(admin);
      setShowAdminLogin(false);
      setAdminLoginForm({ id: '', password: '' });
    } else {
      showConfirm('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.', () => {});
    }
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setAdminView('dashboard');
  };

  // 부관리자 추가
  const [newAdmin, setNewAdmin] = useState({ id: '', password: '', name: '' });
  const addSubAdmin = () => {
    if (!newAdmin.id || !newAdmin.password || !newAdmin.name) {
      showConfirm('입력 오류', '모든 필드를 입력해주세요.', () => {});
      return;
    }
    if (admins.find(a => a.id === newAdmin.id)) {
      showConfirm('중복 오류', '이미 존재하는 아이디입니다.', () => {});
      return;
    }
    setAdmins([...admins, { ...newAdmin, role: 'sub', createdAt: new Date() }]);
    setNewAdmin({ id: '', password: '', name: '' });
    showConfirm('추가 완료', '부관리자가 추가되었습니다.', () => {});
  };

  const deleteAdmin = (adminId) => {
    if (adminId === 'admin') {
      showConfirm('삭제 불가', '최고관리자는 삭제할 수 없습니다.', () => {});
      return;
    }
    showConfirm('관리자 삭제', '이 관리자를 삭제하시겠습니까?', () => {
      setAdmins(admins.filter(a => a.id !== adminId));
    });
  };

  // 비밀번호 변경
  const [passwordForm, setPasswordForm] = useState({ adminId: '', newPassword: '' });
  const changeAdminPassword = () => {
    if (!passwordForm.adminId || !passwordForm.newPassword) {
      showConfirm('입력 오류', '관리자와 새 비밀번호를 입력해주세요.', () => {});
      return;
    }
    setAdmins(admins.map(a => 
      a.id === passwordForm.adminId ? { ...a, password: passwordForm.newPassword } : a
    ));
    setPasswordForm({ adminId: '', newPassword: '' });
    showConfirm('변경 완료', '비밀번호가 변경되었습니다.', () => {});
  };

  // 회원 차단/해제
  const toggleMemberBlock = (memberId) => {
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, blocked: !m.blocked } : m
    ));
  };

  // 일반 사용자 로그인
  const handleNaverLogin = () => {
    setUser({ id: 'naver_12345', name: '사장님', email: 'example@naver.com' });
    setShowProfileSetup(true);
  };

  const handleProfileComplete = () => {
    if (profile.region && profile.businessType) {
      setShowProfileSetup(false);
      const defaultStore = {
        id: Date.now(),
        name: '기본 매장',
        files: [],
        salesData: null,
        analysis: null,
        createdAt: new Date()
      };
      setStores([defaultStore]);
      setSelectedStoreId(defaultStore.id);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setProfile({ region: '', businessType: '' });
    setStores([]);
    setSelectedStoreId(null);
  };

  // 매장 추가
  const addStore = () => {
    if (!newStoreName.trim()) return;
    const newStore = {
      id: Date.now(),
      name: newStoreName.trim(),
      files: [],
      salesData: null,
      analysis: null,
      createdAt: new Date()
    };
    setStores([...stores, newStore]);
    setSelectedStoreId(newStore.id);
    setNewStoreName('');
    setShowAddStore(false);
  };

  // 매장 삭제
  const deleteStore = (storeId) => {
    if (stores.length <= 1) {
      showConfirm('삭제 불가', '최소 1개의 매장이 필요합니다.', () => {});
      return;
    }
    showConfirm(
      '매장 삭제',
      '매장을 삭제하시겠습니까?\n해당 매장의 모든 데이터가 삭제됩니다.',
      () => {
        const newStores = stores.filter(s => s.id !== storeId);
        setStores(newStores);
        if (selectedStoreId === storeId) {
          setSelectedStoreId(newStores[0]?.id);
        }
      }
    );
  };

  // 매장명 수정
  const startEditStore = (store) => {
    setEditingStoreId(store.id);
    setEditingStoreName(store.name);
  };

  const saveStoreName = () => {
    if (!editingStoreName.trim()) return;
    setStores(stores.map(s => 
      s.id === editingStoreId ? { ...s, name: editingStoreName.trim() } : s
    ));
    setEditingStoreId(null);
    setEditingStoreName('');
  };

  const cancelEditStore = () => {
    setEditingStoreId(null);
    setEditingStoreName('');
  };

  const generateFileHash = (data) => JSON.stringify(data.slice(0, 10)) + data.length;

  const parseExcelFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const fileHash = generateFileHash(jsonData);
      const currentStore = stores.find(s => s.id === selectedStoreId);
      if (currentStore?.files.some(f => f.hash === fileHash)) {
        setConfirmModal({ show: true, title: '업로드 실패', message: '이미 업로드된 파일입니다!', onConfirm: null });
        return;
      }
      
      const processed = processData(jsonData);
      if (processed.length === 0) {
        setConfirmModal({ show: true, title: '업로드 실패', message: '유효한 데이터가 없습니다. 엑셀 형식을 확인해주세요.', onConfirm: null });
        return;
      }
      
      const newFile = {
        id: Date.now(),
        name: file.name,
        hash: fileHash,
        rowCount: processed.length,
        uploadedAt: new Date()
      };
      
      setStores(stores.map(s => {
        if (s.id !== selectedStoreId) return s;
        const newSalesData = s.salesData ? [...s.salesData, ...processed] : processed;
        const uniqueData = newSalesData.filter((item, index, self) =>
          index === self.findIndex(t => 
            t.dateStr === item.dateStr && 
            t.hour === item.hour && 
            t.amount === item.amount && 
            t.product === item.product
          )
        );
        return {
          ...s,
          files: [...s.files, newFile],
          salesData: uniqueData,
          analysis: analyzeData(uniqueData)
        };
      }));
    };
    reader.readAsArrayBuffer(file);
  }, [stores, selectedStoreId]);

  const processData = (rawData) => {
    if (rawData.length < 2) return [];
    const headers = rawData[0].map(h => String(h || '').toLowerCase());
    const rows = rawData.slice(1);
    
    const dateCol = headers.findIndex(h => h.includes('결제일') || h.includes('주문기준일자') || h.includes('날짜'));
    const timeCol = headers.findIndex(h => h.includes('결제시간') || h.includes('주문시작시간') || h.includes('시간'));
    const amountCol = headers.findIndex(h => h.includes('총결제금액') || h.includes('실판매금액') || h.includes('총액') || h.includes('금액') || h.includes('상품별 총액'));
    const productCol = headers.findIndex(h => h.includes('상품명') || h.includes('결제내역') || h.includes('메뉴'));

    const processed = [];
    rows.forEach(row => {
      if (!row || row.length === 0) return;
      let dateStr = row[dateCol], timeStr = row[timeCol], amount = row[amountCol];
      
      let date;
      if (dateStr) {
        date = typeof dateStr === 'number' ? new Date((dateStr - 25569) * 86400 * 1000) : new Date(dateStr);
      }
      
      let hour = 0;
      if (timeStr) {
        hour = typeof timeStr === 'number' ? Math.floor(timeStr * 24) : (parseInt(String(timeStr).split(':')[0]) || 0);
      }
      
      if (typeof amount === 'string') amount = parseInt(amount.replace(/[^0-9-]/g, '')) || 0;
      amount = Number(amount) || 0;
      
      if (date && !isNaN(date.getTime()) && amount > 0) {
        processed.push({
          date, dateStr: date.toISOString().split('T')[0], hour,
          dayOfWeek: date.getDay(), dayName: WEEKDAYS[date.getDay()],
          amount, product: row[productCol] || '기타',
          week: getWeekNumber(date),
          month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        });
      }
    });
    return processed.sort((a, b) => a.date - b.date);
  };

  const analyzeData = (data) => {
    if (!data || data.length === 0) return null;
    const totalSales = data.reduce((sum, d) => sum + d.amount, 0);
    const totalTransactions = data.length;

    const byDate = {};
    data.forEach(d => {
      if (!byDate[d.dateStr]) byDate[d.dateStr] = { date: d.dateStr, total: 0, count: 0 };
      byDate[d.dateStr].total += d.amount;
      byDate[d.dateStr].count += 1;
    });
    const dailyData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

    const byDayOfWeek = Array(7).fill(null).map((_, i) => ({ day: WEEKDAYS[i], total: 0, count: 0, days: 0 }));
    const daysCount = {};
    data.forEach(d => {
      byDayOfWeek[d.dayOfWeek].total += d.amount;
      byDayOfWeek[d.dayOfWeek].count += 1;
      const key = `${d.dayOfWeek}-${d.dateStr}`;
      if (!daysCount[key]) { daysCount[key] = true; byDayOfWeek[d.dayOfWeek].days += 1; }
    });
    byDayOfWeek.forEach(d => { d.average = d.days > 0 ? Math.round(d.total / d.days) : 0; });

    const byHour = Array(24).fill(null).map((_, i) => ({ hour: i, label: `${i}시`, total: 0, count: 0 }));
    data.forEach(d => { byHour[d.hour].total += d.amount; byHour[d.hour].count += 1; });

    const byWeek = {};
    data.forEach(d => {
      if (!byWeek[d.week]) byWeek[d.week] = { week: d.week, total: 0, count: 0 };
      byWeek[d.week].total += d.amount;
      byWeek[d.week].count += 1;
    });

    const byProduct = {};
    data.forEach(d => {
      if (!byProduct[d.product]) byProduct[d.product] = { product: d.product, total: 0, count: 0 };
      byProduct[d.product].total += d.amount;
      byProduct[d.product].count += 1;
    });

    const peakHour = byHour.reduce((max, h) => h.total > max.total ? h : max, byHour[0]);
    const bestDay = byDayOfWeek.reduce((max, d) => d.average > max.average ? d : max, byDayOfWeek[0]);
    const bestDate = dailyData.length > 0 ? dailyData.reduce((max, d) => d.total > max.total ? d : max, dailyData[0]) : { date: '-', total: 0 };

    return {
      totalSales, totalTransactions,
      avgTransaction: Math.round(totalSales / totalTransactions),
      avgDaily: Math.round(totalSales / (dailyData.length || 1)),
      dailyData, byDayOfWeek,
      byHour: byHour.filter(h => h.total > 0),
      weeklyData: Object.values(byWeek).sort((a, b) => a.week.localeCompare(b.week)),
      productData: Object.values(byProduct).sort((a, b) => b.total - a.total).slice(0, 10),
      peakHour, bestDay, bestDate
    };
  };

  const deleteFile = (fileId) => {
    showConfirm(
      '파일 삭제',
      '파일을 삭제하시겠습니까?\n해당 파일의 매출 데이터도 함께 삭제됩니다.',
      () => {
        setStores(stores.map(s => {
          if (s.id !== selectedStoreId) return s;
          
          const newFiles = s.files.filter(f => f.id !== fileId);
          
          // 파일이 모두 삭제되면 데이터도 초기화
          if (newFiles.length === 0) {
            return { ...s, files: [], salesData: null, analysis: null };
          }
          
          return { ...s, files: newFiles };
        }));
      }
    );
  };

  // 업로드된 파일 다운로드 (원본 데이터 재생성)
  const downloadUploadedFile = (file) => {
    const currentStore = stores.find(s => s.id === selectedStoreId);
    if (!currentStore?.salesData) return;
    
    // 해당 파일의 데이터로 엑셀 생성
    const data = [
      ['결제일', '결제시간', '상품명', '총결제금액'],
      ...currentStore.salesData.map(d => [
        d.dateStr,
        `${d.hour}:00`,
        d.product,
        d.amount
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '매출데이터');
    XLSX.writeFile(wb, file.name || '매출데이터.xlsx');
  };

  const loadDemoData = () => {
    const demoData = generateSampleData();
    setStores(stores.map(s => {
      if (s.id !== selectedStoreId) return s;
      return {
        ...s,
        files: [...s.files, { id: Date.now(), name: '샘플데이터.xlsx', hash: 'demo', rowCount: demoData.length, uploadedAt: new Date() }],
        salesData: demoData,
        analysis: analyzeData(demoData)
      };
    }));
  };

  const clearStoreData = () => {
    showConfirm(
      '전체 초기화',
      '전체 데이터를 초기화하시겠습니까?\n모든 파일과 매출 데이터가 삭제됩니다.',
      () => {
        setStores(stores.map(s => {
          if (s.id !== selectedStoreId) return s;
          return { ...s, files: [], salesData: null, analysis: null };
        }));
      }
    );
  };

  const handleDrop = useCallback((e) => { 
    e.preventDefault(); 
    const file = e.dataTransfer.files[0]; 
    if (file) parseExcelFile(file); 
  }, [parseExcelFile]);
  
  const handleFileChange = (e) => { 
    const file = e.target.files[0]; 
    if (file) parseExcelFile(file); 
  };
  
  const formatCurrency = (v) => new Intl.NumberFormat('ko-KR').format(v) + '원';
  const formatShort = (v) => v >= 10000 ? `${(v/10000).toFixed(1)}만` : v.toLocaleString();

  // 지역별/업종별 통계 (회원수 + 평균 매출)
  const getRegionStats = () => {
    const stats = {};
    members.forEach(m => {
      if (!stats[m.region]) stats[m.region] = { count: 0, totalSales: 0, avgDailySales: 0 };
      stats[m.region].count++;
      stats[m.region].totalSales += m.totalSales || 0;
      stats[m.region].avgDailySales += m.avgDailySales || 0;
    });
    return Object.entries(stats).map(([region, data]) => ({ 
      region, 
      count: data.count,
      avgTotalSales: data.count > 0 ? Math.round(data.totalSales / data.count) : 0,
      avgDailySales: data.count > 0 ? Math.round(data.avgDailySales / data.count) : 0
    })).sort((a, b) => b.count - a.count);
  };

  const getBusinessStats = () => {
    const stats = {};
    members.forEach(m => {
      if (!stats[m.businessType]) stats[m.businessType] = { count: 0, totalSales: 0, avgDailySales: 0 };
      stats[m.businessType].count++;
      stats[m.businessType].totalSales += m.totalSales || 0;
      stats[m.businessType].avgDailySales += m.avgDailySales || 0;
    });
    return Object.entries(stats).map(([type, data]) => ({ 
      type, 
      count: data.count,
      avgTotalSales: data.count > 0 ? Math.round(data.totalSales / data.count) : 0,
      avgDailySales: data.count > 0 ? Math.round(data.avgDailySales / data.count) : 0
    })).sort((a, b) => b.count - a.count);
  };

  // 새로고침 기능
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // 실제로는 API 호출이 들어갈 자리
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 500);
  };

  // 총 매출 계산
  const getTotalSalesStats = () => {
    const total = members.reduce((sum, m) => sum + (m.totalSales || 0), 0);
    const avgDaily = members.reduce((sum, m) => sum + (m.avgDailySales || 0), 0);
    return {
      totalSales: total,
      avgTotalSales: members.length > 0 ? Math.round(total / members.length) : 0,
      avgDailySales: members.length > 0 ? Math.round(avgDaily / members.length) : 0
    };
  };

  // 지역별 통계 엑셀 다운로드
  const downloadRegionStats = () => {
    const stats = getRegionStats();
    const data = [
      ['지역', '회원수', '평균 총매출', '평균 일매출'],
      ...stats.map(s => [s.region, s.count, s.avgTotalSales, s.avgDailySales])
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '지역별통계');
    XLSX.writeFile(wb, `지역별_회원매출현황_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 업종별 통계 엑셀 다운로드
  const downloadBusinessStats = () => {
    const stats = getBusinessStats();
    const data = [
      ['업종', '회원수', '평균 총매출', '평균 일매출'],
      ...stats.map(s => [s.type, s.count, s.avgTotalSales, s.avgDailySales])
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '업종별통계');
    XLSX.writeFile(wb, `업종별_회원매출현황_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 전체 회원 엑셀 다운로드
  const downloadAllMembers = () => {
    const data = [
      ['이름', '이메일', '지역', '업종', '총매출', '일평균매출', 'IP', '최근접속', '상태'],
      ...members.map(m => [
        m.name, m.email, m.region, m.businessType, 
        m.totalSales, m.avgDailySales, m.ip, 
        m.lastLogin.toLocaleDateString(),
        m.blocked ? '차단' : '정상'
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '회원목록');
    XLSX.writeFile(wb, `전체회원목록_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ========== 확인 모달 컴포넌트 ==========
  const ConfirmModal = () => {
    if (!confirmModal.show) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <GlassCard className="w-full max-w-md p-6" hover={false}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{confirmModal.title}</h2>
            <p className="text-white/70 whitespace-pre-line">{confirmModal.message}</p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={hideConfirm}
              className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all">
              {confirmModal.onConfirm ? '취소' : '확인'}
            </button>
            {confirmModal.onConfirm && (
              <button onClick={handleConfirm}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all">
                확인
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    );
  };

  // ========== 관리자 페이지 ==========
  if (adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
        <AnimatedBackground />
        <ConfirmModal />
        
        {/* 관리자 헤더 */}
        <header className="relative z-20 bg-red-900/30 backdrop-blur-xl border-b border-red-500/30 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white">관리자 페이지</span>
              <span className="px-2 py-1 bg-red-500/30 text-red-300 text-xs rounded-lg">
                {adminUser.role === 'super' ? '최고관리자' : '부관리자'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-sm">{adminUser.name}</span>
              <button onClick={handleAdminLogout} className="p-2 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300 transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 관리자 메뉴 */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'dashboard', label: '대시보드', icon: BarChart3 },
              { id: 'members', label: '회원 관리', icon: Users },
              { id: 'admins', label: '관리자 관리', icon: Shield },
              { id: 'banner', label: '배너 관리', icon: Image },
              { id: 'settings', label: '사이트 설정', icon: Settings },
            ].map(tab => (
              <button key={tab.id} onClick={() => setAdminView(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  adminView === tab.id
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* 대시보드 */}
          {adminView === 'dashboard' && (
            <div className="space-y-6">
              {/* 새로고침 바 */}
              <div className="flex items-center justify-between">
                <div className="text-white/50 text-sm">
                  마지막 업데이트: {lastRefresh.toLocaleTimeString()}
                </div>
                <button onClick={handleRefresh} disabled={isRefreshing}
                  className={`flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl font-medium hover:bg-cyan-500/30 transition-all border border-cyan-500/30 ${isRefreshing ? 'opacity-50' : ''}`}>
                  <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRefreshing ? '새로고침 중...' : '새로고침'}
                </button>
              </div>

              {/* 요약 카드 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-5">
                  <p className="text-white/50 text-sm mb-1">총 회원수</p>
                  <p className="text-3xl font-bold text-white">{members.length}명</p>
                </GlassCard>
                <GlassCard className="p-5">
                  <p className="text-white/50 text-sm mb-1">차단 회원</p>
                  <p className="text-3xl font-bold text-red-400">{members.filter(m => m.blocked).length}명</p>
                </GlassCard>
                <GlassCard className="p-5">
                  <p className="text-white/50 text-sm mb-1">전체 총매출</p>
                  <p className="text-2xl font-bold text-cyan-400">{(getTotalSalesStats().totalSales / 100000000).toFixed(1)}억</p>
                </GlassCard>
                <GlassCard className="p-5">
                  <p className="text-white/50 text-sm mb-1">회원 평균 일매출</p>
                  <p className="text-2xl font-bold text-green-400">{(getTotalSalesStats().avgDailySales / 10000).toFixed(0)}만원</p>
                </GlassCard>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* 지역별 통계 */}
                <GlassCard className="p-5" hover={false}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-lg">지역별 회원 & 매출 현황</h3>
                    <button onClick={downloadRegionStats}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-all">
                      <Download className="w-3 h-3" /> 엑셀
                    </button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {getRegionStats().map((stat, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{stat.region}</span>
                          <span className="text-cyan-400 font-bold">{stat.count}명</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50">평균 총매출</span>
                          <span className="text-white/70">{(stat.avgTotalSales / 10000).toLocaleString()}만원</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50">평균 일매출</span>
                          <span className="text-green-400 font-medium">{(stat.avgDailySales / 10000).toFixed(0)}만원</span>
                        </div>
                        {/* 매출 바 그래프 */}
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                            style={{ width: `${Math.min((stat.avgDailySales / 1200000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* 업종별 통계 */}
                <GlassCard className="p-5" hover={false}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-lg">업종별 회원 & 매출 현황</h3>
                    <button onClick={downloadBusinessStats}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-all">
                      <Download className="w-3 h-3" /> 엑셀
                    </button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {getBusinessStats().map((stat, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium text-sm">{stat.type}</span>
                          <span className="text-cyan-400 font-bold">{stat.count}명</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50">평균 총매출</span>
                          <span className="text-white/70">{(stat.avgTotalSales / 10000).toLocaleString()}만원</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50">평균 일매출</span>
                          <span className="text-green-400 font-medium">{(stat.avgDailySales / 10000).toFixed(0)}만원</span>
                        </div>
                        {/* 매출 바 그래프 */}
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-cyan-500 rounded-full"
                            style={{ width: `${Math.min((stat.avgDailySales / 1200000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* 매출 순위 TOP 5 */}
              <GlassCard className="p-5" hover={false}>
                <h3 className="font-bold text-white text-lg mb-4">🏆 매출 TOP 5 회원</h3>
                <div className="grid sm:grid-cols-5 gap-3">
                  {[...members].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0)).slice(0, 5).map((m, i) => (
                    <div key={m.id} className={`p-4 rounded-xl text-center ${i === 0 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/5 border border-white/10'}`}>
                      <div className={`text-2xl mb-1 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/50'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}위`}
                      </div>
                      <p className="text-white font-medium text-sm">{m.name}</p>
                      <p className="text-white/50 text-xs">{m.region} · {m.businessType.split('·')[0]}</p>
                      <p className="text-cyan-400 font-bold mt-1">{(m.totalSales / 10000).toLocaleString()}만</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* 회원 관리 */}
          {adminView === 'members' && (
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" /> 회원 목록
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={downloadAllMembers}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-all">
                    <Download className="w-4 h-4" /> 전체 다운로드
                  </button>
                  <button onClick={handleRefresh} disabled={isRefreshing}
                    className={`flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-all ${isRefreshing ? 'opacity-50' : ''}`}>
                    <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    새로고침
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="px-4 py-3 text-left text-white/70">이름</th>
                      <th className="px-4 py-3 text-left text-white/70">이메일</th>
                      <th className="px-4 py-3 text-left text-white/70">지역</th>
                      <th className="px-4 py-3 text-left text-white/70">업종</th>
                      <th className="px-4 py-3 text-right text-white/70">총매출</th>
                      <th className="px-4 py-3 text-right text-white/70">일평균</th>
                      <th className="px-4 py-3 text-left text-white/70">IP</th>
                      <th className="px-4 py-3 text-left text-white/70">최근접속</th>
                      <th className="px-4 py-3 text-left text-white/70">상태</th>
                      <th className="px-4 py-3 text-center text-white/70">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(member => (
                      <tr key={member.id} className={`border-b border-white/10 ${member.blocked ? 'bg-red-500/10' : ''}`}>
                        <td className="px-4 py-3 text-white">{member.name}</td>
                        <td className="px-4 py-3 text-white/70">{member.email}</td>
                        <td className="px-4 py-3 text-white/70">{member.region}</td>
                        <td className="px-4 py-3 text-white/70 text-xs">{member.businessType}</td>
                        <td className="px-4 py-3 text-right text-cyan-400 font-medium">{((member.totalSales || 0) / 10000).toLocaleString()}만</td>
                        <td className="px-4 py-3 text-right text-green-400 font-medium">{((member.avgDailySales || 0) / 10000).toFixed(0)}만</td>
                        <td className="px-4 py-3 text-cyan-400 font-mono text-xs">{member.ip}</td>
                        <td className="px-4 py-3 text-white/70">{member.lastLogin.toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {member.blocked ? (
                            <span className="px-2 py-1 bg-red-500/30 text-red-400 rounded text-xs">차단됨</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-500/30 text-green-400 rounded text-xs">정상</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleMemberBlock(member.id)}
                            className={`p-2 rounded-lg transition-all ${
                              member.blocked 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}>
                            <Ban className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* 관리자 관리 */}
          {adminView === 'admins' && (
            <div className="space-y-6">
              {/* 부관리자 추가 */}
              {adminUser.role === 'super' && (
                <GlassCard className="p-6" hover={false}>
                  <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-cyan-400" /> 부관리자 추가
                  </h3>
                  <div className="grid sm:grid-cols-4 gap-4">
                    <input type="text" placeholder="아이디" value={newAdmin.id}
                      onChange={(e) => setNewAdmin({ ...newAdmin, id: e.target.value })}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400" />
                    <input type="password" placeholder="비밀번호" value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400" />
                    <input type="text" placeholder="이름" value={newAdmin.name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400" />
                    <button onClick={addSubAdmin}
                      className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-all">
                      추가
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* 비밀번호 변경 */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" /> 비밀번호 변경
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <select value={passwordForm.adminId} onChange={(e) => setPasswordForm({ ...passwordForm, adminId: e.target.value })}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-400">
                    <option value="" className="bg-slate-800">관리자 선택</option>
                    {admins.filter(a => adminUser.role === 'super' || a.id === adminUser.id).map(a => (
                      <option key={a.id} value={a.id} className="bg-slate-800">{a.name} ({a.id})</option>
                    ))}
                  </select>
                  <input type="password" placeholder="새 비밀번호" value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400" />
                  <button onClick={changeAdminPassword}
                    className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all">
                    변경
                  </button>
                </div>
              </GlassCard>

              {/* 관리자 목록 */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="font-bold text-white text-lg mb-4">관리자 목록</h3>
                <div className="space-y-2">
                  {admins.map(admin => (
                    <div key={admin.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          admin.role === 'super' ? 'bg-red-500' : 'bg-blue-500'
                        }`}>
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{admin.name}</p>
                          <p className="text-white/50 text-sm">{admin.id} · {admin.role === 'super' ? '최고관리자' : '부관리자'}</p>
                        </div>
                      </div>
                      {adminUser.role === 'super' && admin.id !== 'admin' && (
                        <button onClick={() => deleteAdmin(admin.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* 배너 관리 */}
          {adminView === 'banner' && (
            <div className="space-y-6">
              {/* 배너 1: 로그인 화면 */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                  <Image className="w-5 h-5 text-cyan-400" /> 배너 1 - 로그인 화면
                </h3>
                <p className="text-white/50 text-sm mb-4">로그인 카드 하단에 표시됩니다</p>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* PC 버전 */}
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <p className="text-blue-400 font-medium mb-1">🖥️ PC 버전</p>
                      <p className="text-white/50 text-sm">권장: 728 x 90 px (리더보드)</p>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">이미지 업로드</label>
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/70 cursor-pointer hover:bg-white/20 transition-all">
                          <Upload className="w-4 h-4" />
                          <span>{siteSettings.banner1PcImage ? '이미지 변경' : '이미지 선택'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerUpload(e, 'banner1PcImage')} />
                        </label>
                        {siteSettings.banner1PcImage && (
                          <button onClick={() => removeBanner('banner1PcImage')} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">클릭 링크</label>
                      <input type="text" placeholder="https://example.com" 
                        value={siteSettings.banner1PcLink}
                        onChange={(e) => setSiteSettings({ ...siteSettings, banner1PcLink: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400" />
                    </div>
                    
                    <div className="h-20 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                      {siteSettings.banner1PcImage ? (
                        <img src={siteSettings.banner1PcImage} alt="PC배너" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-white/30 text-sm">PC 배너 미리보기</span>
                      )}
                    </div>
                  </div>

                  {/* 모바일 버전 */}
                  <div className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                      <p className="text-purple-400 font-medium mb-1">📱 모바일 버전</p>
                      <p className="text-white/50 text-sm">권장: 320 x 100 px (대형 모바일)</p>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">이미지 업로드</label>
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/70 cursor-pointer hover:bg-white/20 transition-all">
                          <Upload className="w-4 h-4" />
                          <span>{siteSettings.banner1MobileImage ? '이미지 변경' : '이미지 선택'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerUpload(e, 'banner1MobileImage')} />
                        </label>
                        {siteSettings.banner1MobileImage && (
                          <button onClick={() => removeBanner('banner1MobileImage')} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">클릭 링크</label>
                      <input type="text" placeholder="https://example.com" 
                        value={siteSettings.banner1MobileLink}
                        onChange={(e) => setSiteSettings({ ...siteSettings, banner1MobileLink: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400" />
                    </div>
                    
                    <div className="h-20 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                      {siteSettings.banner1MobileImage ? (
                        <img src={siteSettings.banner1MobileImage} alt="모바일배너" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-white/30 text-sm">모바일 배너 미리보기</span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* 배너 2: 대시보드 */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                  <Image className="w-5 h-5 text-green-400" /> 배너 2 - 대시보드 화면
                </h3>
                <p className="text-white/50 text-sm mb-4">베스트 메뉴 분석 하단에 표시됩니다</p>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* PC 버전 */}
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <p className="text-blue-400 font-medium mb-1">🖥️ PC 버전</p>
                      <p className="text-white/50 text-sm">권장: 970 x 90 px (대형 리더보드)</p>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">이미지 업로드</label>
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/70 cursor-pointer hover:bg-white/20 transition-all">
                          <Upload className="w-4 h-4" />
                          <span>{siteSettings.banner2PcImage ? '이미지 변경' : '이미지 선택'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerUpload(e, 'banner2PcImage')} />
                        </label>
                        {siteSettings.banner2PcImage && (
                          <button onClick={() => removeBanner('banner2PcImage')} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">클릭 링크</label>
                      <input type="text" placeholder="https://example.com" 
                        value={siteSettings.banner2PcLink}
                        onChange={(e) => setSiteSettings({ ...siteSettings, banner2PcLink: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400" />
                    </div>
                    
                    <div className="h-20 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                      {siteSettings.banner2PcImage ? (
                        <img src={siteSettings.banner2PcImage} alt="PC배너" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-white/30 text-sm">PC 배너 미리보기</span>
                      )}
                    </div>
                  </div>

                  {/* 모바일 버전 */}
                  <div className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                      <p className="text-purple-400 font-medium mb-1">📱 모바일 버전</p>
                      <p className="text-white/50 text-sm">권장: 320 x 100 px (대형 모바일)</p>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">이미지 업로드</label>
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/70 cursor-pointer hover:bg-white/20 transition-all">
                          <Upload className="w-4 h-4" />
                          <span>{siteSettings.banner2MobileImage ? '이미지 변경' : '이미지 선택'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerUpload(e, 'banner2MobileImage')} />
                        </label>
                        {siteSettings.banner2MobileImage && (
                          <button onClick={() => removeBanner('banner2MobileImage')} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">클릭 링크</label>
                      <input type="text" placeholder="https://example.com" 
                        value={siteSettings.banner2MobileLink}
                        onChange={(e) => setSiteSettings({ ...siteSettings, banner2MobileLink: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400" />
                    </div>
                    
                    <div className="h-20 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                      {siteSettings.banner2MobileImage ? (
                        <img src={siteSettings.banner2MobileImage} alt="모바일배너" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-white/30 text-sm">모바일 배너 미리보기</span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* 배너 가이드 */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" /> 배너 가이드
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl text-center">
                    <p className="text-2xl mb-1">📁</p>
                    <p className="text-white font-medium text-sm">지원 형식</p>
                    <p className="text-white/50 text-xs">JPG, PNG, GIF, WebP</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl text-center">
                    <p className="text-2xl mb-1">📦</p>
                    <p className="text-white font-medium text-sm">최대 용량</p>
                    <p className="text-white/50 text-xs">2MB 이하</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl text-center">
                    <p className="text-2xl mb-1">🖥️</p>
                    <p className="text-white font-medium text-sm">PC 표시</p>
                    <p className="text-white/50 text-xs">768px 이상 화면</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl text-center">
                    <p className="text-2xl mb-1">📱</p>
                    <p className="text-white font-medium text-sm">모바일 표시</p>
                    <p className="text-white/50 text-xs">768px 미만 화면</p>
                  </div>
                </div>
                <p className="text-amber-400 text-sm mt-4">⚠️ 이미지가 없으면 해당 배너 영역이 표시되지 않습니다</p>
              </GlassCard>
            </div>
          )}

          {/* 사이트 설정 */}
          {adminView === 'settings' && (
            <GlassCard className="p-6" hover={false}>
              <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" /> 사이트 설정
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">서브타이틀 (메인 설명)</label>
                  <input type="text" value={siteSettings.subtitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, subtitle: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400" />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">광고 문의 텍스트</label>
                  <input type="text" value={siteSettings.adContact}
                    onChange={(e) => setSiteSettings({ ...siteSettings, adContact: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400" />
                </div>
                <button className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  설정 저장
                </button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    );
  }

  // ========== 로그인 전 화면 ==========
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col relative">
        <AnimatedBackground />
        <ConfirmModal />
        
        {/* 헤더 */}
        <header className="relative z-10 p-6 lg:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <span className="text-white font-bold text-2xl lg:text-3xl">만렙사장</span>
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          
          {/* 관리자 로그인 버튼 */}
          <button onClick={() => setShowAdminLogin(true)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/50 hover:text-white transition-all"
            title="관리자 로그인">
            <Power className="w-5 h-5" />
          </button>
        </header>

        {/* 관리자 로그인 모달 */}
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <GlassCard className="w-full max-w-md p-8" hover={false}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">관리자 로그인</h2>
              </div>
              
              <div className="space-y-4">
                <input type="text" placeholder="아이디" value={adminLoginForm.id}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-400" />
                <input type="password" placeholder="비밀번호" value={adminLoginForm.password}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-red-400" />
                <div className="flex gap-3">
                  <button onClick={() => setShowAdminLogin(false)}
                    className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all">
                    취소
                  </button>
                  <button onClick={handleAdminLogin}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all">
                    로그인
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* 메인 */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-lg lg:max-w-xl">
            {/* 타이틀 */}
            <div className="text-center mb-10 lg:mb-14">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight text-white">
                매출 분석의
                <br />
                새로운 기준
              </h1>
              <p className="text-white/70 text-xl lg:text-2xl">
                {siteSettings.subtitle}
              </p>
            </div>

            {/* 로그인 카드 */}
            <GlassCard className="p-8 lg:p-10" hover={false}>
              <div className="space-y-5 mb-10">
                {[
                  { icon: TrendingUp, text: '날짜별·요일별·시간대별 분석' },
                  { icon: Target, text: '피크 타임 & 베스트 요일 발견' },
                  { icon: Store, text: '샵인샵 다중 매장 관리' },
                ].map((item, i) => (
                  <div key={i} className="group flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-all">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-500/30 group-hover:scale-110 transition-transform">
                      <item.icon className="w-7 h-7 text-cyan-400" />
                    </div>
                    <span className="text-white text-lg lg:text-xl font-bold">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* 네이버 버튼 */}
              <button onClick={handleNaverLogin}
                className="w-full py-5 px-8 rounded-2xl bg-white hover:bg-gray-50 font-bold text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                style={{ color: '#03C75A' }}>
                <span className="text-2xl font-black">N</span>
                <span>네이버로 시작하기</span>
              </button>
              
              <p className="text-center text-white/50 text-base mt-5">
                만렙사장 카페 회원 전용
              </p>

              {/* 배너 1 - PC/모바일 분리 + 조건부 렌더링 */}
              {(siteSettings.adContact || siteSettings.banner1PcImage || siteSettings.banner1MobileImage) && (
                <div className="mt-8 pt-6 border-t border-white/20">
                  {siteSettings.adContact && (
                    <div className="text-center text-white/40 text-sm mb-3">
                      {siteSettings.adContact}
                    </div>
                  )}
                  {/* PC 배너 (768px 이상) */}
                  {siteSettings.banner1PcImage && (
                    <a href={siteSettings.banner1PcLink || '#'} target="_blank" rel="noopener noreferrer" className="hidden md:block">
                      <img src={siteSettings.banner1PcImage} alt="광고" className="w-full object-contain rounded-xl hover:opacity-90 transition-opacity" style={{ maxHeight: '90px' }} />
                    </a>
                  )}
                  {/* 모바일 배너 (768px 미만) */}
                  {siteSettings.banner1MobileImage && (
                    <a href={siteSettings.banner1MobileLink || '#'} target="_blank" rel="noopener noreferrer" className="block md:hidden">
                      <img src={siteSettings.banner1MobileImage} alt="광고" className="w-full object-contain rounded-xl hover:opacity-90 transition-opacity" style={{ maxHeight: '100px' }} />
                    </a>
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        </main>
      </div>
    );
  }

  // ========== 프로필 설정 화면 ==========
  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col relative">
        <AnimatedBackground />
        <ConfirmModal />
        
        <header className="relative z-10 p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <span className="text-white font-bold text-2xl">만렙사장</span>
          </div>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center p-6">
          <GlassCard className="w-full max-w-lg p-8 lg:p-12" hover={false}>
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-blue-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">환영합니다!</h2>
              <p className="text-white/60 text-lg">사업장 정보를 알려주세요</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-base font-semibold text-white mb-3">
                  <MapPin className="w-5 h-5 text-cyan-400" /> 지역
                </label>
                <div className="relative">
                  <select value={profile.region} onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                    className="w-full p-4 text-lg bg-white rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 appearance-none cursor-pointer">
                    <option value="">선택하세요</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-base font-semibold text-white mb-3">
                  <Store className="w-5 h-5 text-cyan-400" /> 업종
                </label>
                <div className="relative">
                  <select value={profile.businessType} onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                    className="w-full p-4 text-lg bg-white rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 appearance-none cursor-pointer">
                    <option value="">선택하세요</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button onClick={handleProfileComplete}
                disabled={!profile.region || !profile.businessType}
                className={`w-full py-5 rounded-2xl font-bold text-xl transition-all ${
                  profile.region && profile.businessType
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                    : 'bg-white/20 text-white/40 cursor-not-allowed'
                }`}>
                시작하기
              </button>
            </div>
          </GlassCard>
        </main>
      </div>
    );
  }

  // ========== 메인 대시보드 ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      <AnimatedBackground />
      <ConfirmModal />
      
      {/* 헤더 */}
      <header className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white hidden sm:block">만렙사장</span>
          </div>

          {/* 메뉴 탭 */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-xl backdrop-blur overflow-x-auto">
            <button onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentView === 'dashboard' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow' : 'text-white/70 hover:text-white'}`}>
              📊 대시보드
            </button>
            {/* v2 복구용 - 원재료/레시피 탭 주석처리
            <button onClick={() => setCurrentView('ingredients')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentView === 'ingredients' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow' : 'text-white/70 hover:text-white'}`}>
              📦 원재료
            </button>
            <button onClick={() => setCurrentView('recipes')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentView === 'recipes' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow' : 'text-white/70 hover:text-white'}`}>
              🍳 레시피
            </button>
            */}
            <button onClick={() => setCurrentView('employees')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentView === 'employees' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow' : 'text-white/70 hover:text-white'}`}>
              👷 인건비
            </button>
            <button onClick={() => setCurrentView('profitloss')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentView === 'profitloss' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow' : 'text-white/70 hover:text-white'}`}>
              💵 손익관리
            </button>
            <button onClick={() => setCurrentView('mydata')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentView === 'mydata' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow' : 'text-white/70 hover:text-white'}`}>
              📁 내 데이터
            </button>
            <button onClick={() => setCurrentView('guide')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentView === 'guide' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow' : 'text-white/70 hover:text-white'}`}>
              ❓ 사용방법
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-white text-sm">{user.name}</div>
              <div className="text-xs text-white/60">{profile.region} · {profile.businessType}</div>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 매장 선택 바 */}
        <GlassCard className="p-4 mb-6" hover={false}>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <span className="text-white/60 text-sm font-medium whitespace-nowrap">🏪 매장:</span>
            
            {stores.map(store => (
              editingStoreId === store.id ? (
                <div key={store.id} className="flex items-center gap-2">
                  <input type="text" value={editingStoreName} onChange={(e) => setEditingStoreName(e.target.value)}
                    autoFocus
                    className="px-3 py-2 bg-white/10 border border-cyan-400 rounded-lg text-sm text-white w-32 focus:outline-none" />
                  <button onClick={saveStoreName} className="p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={cancelEditStore} className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button key={store.id} onClick={() => setSelectedStoreId(store.id)}
                  onDoubleClick={() => startEditStore(store)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedStoreId === store.id 
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                  title="더블클릭하여 이름 수정">
                  {store.name}
                  {selectedStoreId === store.id && (
                    <div className="flex items-center gap-1 ml-1">
                      <Edit3 className="w-3 h-3 opacity-50" onClick={(e) => { e.stopPropagation(); startEditStore(store); }} />
                      {stores.length > 1 && (
                        <X className="w-4 h-4 hover:text-red-300" onClick={(e) => { e.stopPropagation(); deleteStore(store.id); }} />
                      )}
                    </div>
                  )}
                </button>
              )
            ))}
            
            {showAddStore ? (
              <div className="flex items-center gap-2">
                <input type="text" value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="매장명 입력" autoFocus
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white w-32 focus:outline-none focus:border-cyan-400 placeholder-white/40" />
                <button onClick={addStore} className="p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setShowAddStore(false); setNewStoreName(''); }} className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAddStore(true)}
                className="flex items-center gap-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-medium hover:bg-cyan-500/30 transition-all border border-cyan-500/30">
                <Plus className="w-4 h-4" /> 매장 추가
              </button>
            )}
          </div>
        </GlassCard>

        {/* 원재료 관리 뷰 */}
        {currentView === 'ingredients' && (
          <div className="space-y-6">
            {/* 월별 매입 현황 */}
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-center gap-4 mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white">
                  {ingredientMonth.year}년 {ingredientMonth.month}월 매입 현황
                </h2>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 총 매입액 카드 */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <p className="text-white/60 text-sm mb-1">{ingredientMonth.year}년 {ingredientMonth.month}월</p>
                  <p className="text-white/60 text-sm mb-2">총 매입액 (VAT 포함)</p>
                  <p className="text-3xl font-bold text-white mb-4">
                    {getMonthlyPurchaseStats().totalAmount.toLocaleString()}원
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      <span className="text-white/70 text-sm">과세</span>
                      <span className="text-white ml-auto">{getMonthlyPurchaseStats().taxableAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-white/70 text-sm">면세</span>
                      <span className="text-white ml-auto">{getMonthlyPurchaseStats().taxFreeAmount.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>

                {/* 업체별 매입 현황 */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <p className="text-white/60 text-sm mb-4">업체별 매입 현황</p>
                  {getMonthlyPurchaseStats().supplierData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/40">해당 월의 매입 내역이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getMonthlyPurchaseStats().supplierData.slice(0, 5).map((supplier, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">{supplier.name}</span>
                            <span className="text-white/70">{formatWon(supplier.amount)}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                              style={{ width: `${(supplier.amount / getMonthlyPurchaseStats().totalAmount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* 원재료 테이블 */}
            <GlassCard className="p-6" hover={false}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-6 h-6 text-cyan-400" />
                  현재 재고 현황
                </h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="검색..."
                      value={ingredientSearch}
                      onChange={(e) => setIngredientSearch(e.target.value)}
                      className="w-full sm:w-48 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button
                    onClick={() => setIngredientModal({ show: true, mode: 'add', data: null })}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> 신규 원재료 추가
                  </button>
                </div>
              </div>

              {filteredIngredients.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 mb-2">등록된 원재료가 없습니다</p>
                  <p className="text-white/30 text-sm">신규 원재료를 추가해주세요</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/10">
                        <th className="px-4 py-3 text-left text-white/70 rounded-l-lg">카테고리</th>
                        <th className="px-4 py-3 text-left text-white/70">원재료명</th>
                        <th className="px-4 py-3 text-left text-white/70">규격</th>
                        <th className="px-4 py-3 text-right text-white/70">입고가(VAT포함)</th>
                        <th className="px-4 py-3 text-right text-white/70">단위당 원가</th>
                        <th className="px-4 py-3 text-right text-white/70">현재고</th>
                        <th className="px-4 py-3 text-right text-white/70">안전재고</th>
                        <th className="px-4 py-3 text-left text-white/70">거래처</th>
                        <th className="px-4 py-3 text-center text-white/70">과세</th>
                        <th className="px-4 py-3 text-center text-white/70">재고현황</th>
                        <th className="px-4 py-3 text-center text-white/70 rounded-r-lg">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIngredients.map(ing => {
                        const stockStatus = getStockStatus(ing.currentStock, ing.safetyStock);
                        return (
                          <tr key={ing.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="px-4 py-3 text-white/70">{ing.category}</td>
                            <td className="px-4 py-3 text-white font-medium">{ing.name}</td>
                            <td className="px-4 py-3 text-white/70">{ing.spec}</td>
                            <td className="px-4 py-3 text-right text-white">{ing.unitPrice.toLocaleString()}원</td>
                            <td className="px-4 py-3 text-right text-cyan-400">{ing.unitCost}원/{ing.baseUnit}</td>
                            <td className="px-4 py-3 text-right text-white">
                              {ing.currentStock.toLocaleString()}{ing.baseUnit}
                            </td>
                            <td className="px-4 py-3 text-right text-white/50">
                              {ing.safetyStock.toLocaleString()}{ing.baseUnit}
                            </td>
                            <td className="px-4 py-3 text-white/70">{ing.supplier}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-lg text-xs ${ing.taxType === '과세' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                {ing.taxType}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${stockStatus.color} rounded-full transition-all`}
                                  style={{ width: `${stockStatus.percent}%` }}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setIngredientModal({ show: true, mode: 'edit', data: ing })}
                                  className="p-1.5 text-white/40 hover:text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all"
                                  title="수정"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteIngredient(ing.id)}
                                  className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* 원재료 추가/수정 모달 */}
        {ingredientModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIngredientModal({ show: false, mode: 'add', data: null })} />
            <div className="relative w-full max-w-lg bg-slate-900 border border-white/20 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {ingredientModal.mode === 'add' ? '신규 원재료 추가' : '원재료 수정'}
                  </h3>
                  <button
                    onClick={() => setIngredientModal({ show: false, mode: 'add', data: null })}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <IngredientForm
                  initialData={ingredientModal.data}
                  categories={INGREDIENT_CATEGORIES}
                  baseUnits={BASE_UNITS}
                  onSubmit={ingredientModal.mode === 'add' ? addIngredient : updateIngredient}
                  onCancel={() => setIngredientModal({ show: false, mode: 'add', data: null })}
                />
              </div>
            </div>
          </div>
        )}

        {/* 레시피 관리 뷰 */}
        {currentView === 'recipes' && (
          <div className="space-y-6">
            <GlassCard className="p-6" hover={false}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  🍳 레시피 관리
                </h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="검색..."
                      value={recipeSearch}
                      onChange={(e) => setRecipeSearch(e.target.value)}
                      className="w-full sm:w-48 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button
                    onClick={() => setRecipeModal({ show: true, mode: 'add', data: null })}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> 신규 상품 추가
                  </button>
                </div>
              </div>

              {/* 원재료 미등록 경고 */}
              {ingredients.length === 0 && (
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-6">
                  <p className="text-amber-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    먼저 '원재료 관리'에서 원재료를 등록해주세요.
                  </p>
                </div>
              )}

              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <Coffee className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 mb-2">등록된 레시피가 없습니다</p>
                  <p className="text-white/30 text-sm">신규 상품을 추가해주세요</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredRecipes.map(recipe => (
                    <div
                      key={recipe.id}
                      onClick={() => setRecipeModal({ show: true, mode: 'edit', data: recipe })}
                      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-lg">{recipe.category}</span>
                          <h3 className="text-lg font-bold text-white mt-1">{recipe.name}</h3>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
                          className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/60 text-sm">판매가</span>
                          <span className="text-white font-medium">{recipe.price.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60 text-sm">원가</span>
                          <span className="text-cyan-400 font-medium">{recipe.totalCost.toLocaleString()}원</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex justify-between text-sm">
                          <div>
                            <span className="text-white/40">원가율 </span>
                            <span className={`font-medium ${recipe.costRate > 40 ? 'text-red-400' : recipe.costRate > 30 ? 'text-amber-400' : 'text-green-400'}`}>
                              {recipe.costRate}%
                            </span>
                          </div>
                          <div>
                            <span className="text-white/40">마진율 </span>
                            <span className="text-green-400 font-medium">{recipe.marginRate}%</span>
                          </div>
                        </div>
                        {/* 원가율 바 */}
                        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${recipe.costRate > 40 ? 'bg-red-500' : recipe.costRate > 30 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(recipe.costRate, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-white/30">
                        재료 {recipe.ingredients.length}개
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* 레시피 추가/수정 모달 */}
        {recipeModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRecipeModal({ show: false, mode: 'add', data: null })} />
            <div className="relative w-full max-w-2xl bg-slate-900 border border-white/20 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {recipeModal.mode === 'add' ? '신규 상품 추가' : `${recipeModal.data?.name} 레시피 편집`}
                  </h3>
                  <button
                    onClick={() => setRecipeModal({ show: false, mode: 'add', data: null })}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <RecipeForm
                  initialData={recipeModal.data}
                  categories={RECIPE_CATEGORIES}
                  ingredients={ingredients}
                  onSubmit={recipeModal.mode === 'add' ? addRecipe : updateRecipe}
                  onCancel={() => setRecipeModal({ show: false, mode: 'add', data: null })}
                  onDelete={recipeModal.mode === 'edit' ? () => { deleteRecipe(recipeModal.data.id); setRecipeModal({ show: false, mode: 'add', data: null }); } : null}
                />
              </div>
            </div>
          </div>
        )}

        {/* 인건비 관리 뷰 */}
        {currentView === 'employees' && (
          <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => changeEmployeeMonth(-1)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                  {employeeMonth.year}년 {employeeMonth.month}월 인건비
                </h2>
                <button
                  onClick={() => changeEmployeeMonth(1)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              {employeeTab === 'staff' && (
                <button
                  onClick={() => setEmployeeModal({ show: true, mode: 'add', data: null })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" /> 직원 추가
                </button>
              )}
            </div>

            {/* 탭 메뉴 */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl overflow-x-auto">
              <button
                onClick={() => setEmployeeTab('staff')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  employeeTab === 'staff'
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                📋 직원 관리
              </button>
              <button
                onClick={() => setEmployeeTab('records')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  employeeTab === 'records'
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                📅 근무 기록
              </button>
              <button
                onClick={() => setEmployeeTab('payroll')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  employeeTab === 'payroll'
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                💰 급여 정산
              </button>
              <button
                onClick={() => setEmployeeTab('contracts')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  employeeTab === 'contracts'
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                📝 계약서
              </button>
            </div>

            {/* 탭 1: 직원 관리 */}
            {employeeTab === 'staff' && (
              <>
                {/* 이번 달 인건비 요약 */}
                {(() => {
                  const laborStats = getMonthlyLaborCost();
                  return (
                    <GlassCard className="p-6" hover={false}>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-purple-400" />
                        계약 기본 설정 기준 (예상 급여)
                      </h3>
                      <p className="text-white/50 text-sm mb-4">실제 급여는 [근무 기록] → [급여 정산] 탭에서 확인하세요.</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/50 text-sm mb-1">예상 총 인건비</p>
                          <p className="text-2xl font-bold text-white">{laborStats.totalLaborCost.toLocaleString()}<span className="text-sm font-normal text-white/50">원</span></p>
                        </div>
                        <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                          <p className="text-white/50 text-sm mb-1">예상 주휴수당</p>
                          <p className="text-2xl font-bold text-purple-400">{laborStats.totalWeeklyHolidayPay.toLocaleString()}<span className="text-sm font-normal text-purple-400/50">원</span></p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/50 text-sm mb-1">직원 수</p>
                          <p className="text-2xl font-bold text-white">{laborStats.employeeCount}<span className="text-sm font-normal text-white/50">명</span></p>
                          <p className="text-xs text-white/40">시급 {laborStats.hourlyCount}명 / 월급 {laborStats.monthlyCount}명</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/50 text-sm mb-1">평균 시급</p>
                          <p className="text-2xl font-bold text-cyan-400">{laborStats.avgHourlyWage.toLocaleString()}<span className="text-sm font-normal text-cyan-400/50">원</span></p>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })()}

                {/* 직원 목록 */}
                <GlassCard className="p-6" hover={false}>
                  <h3 className="text-lg font-semibold text-white mb-4">직원 목록</h3>
                  {employees.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/50 mb-4">등록된 직원이 없습니다</p>
                      <button
                        onClick={() => setEmployeeModal({ show: true, mode: 'add', data: null })}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 text-purple-400 rounded-xl font-medium hover:bg-purple-500/30 transition-all border border-purple-500/30"
                      >
                        <Plus className="w-5 h-5" /> 첫 직원 등록하기
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-sm text-white/60 font-medium">직원명</th>
                            <th className="px-4 py-3 text-center text-sm text-white/60 font-medium">고용형태</th>
                            <th className="px-4 py-3 text-center text-sm text-white/60 font-medium">세금유형</th>
                            <th className="px-4 py-3 text-right text-sm text-white/60 font-medium">시급/월급</th>
                            <th className="px-4 py-3 text-center text-sm text-white/60 font-medium">근무요일</th>
                            <th className="px-4 py-3 text-center text-sm text-white/60 font-medium">1일근무</th>
                            <th className="px-4 py-3 text-right text-sm text-white/60 font-medium">예상월급</th>
                            <th className="px-4 py-3 text-center text-sm text-white/60 font-medium w-20"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map(emp => (
                            <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-4">
                                <span className="font-medium text-white">{emp.name}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  emp.type === 'hourly' ? 'bg-cyan-500/20 text-cyan-400'
                                  : emp.type === 'monthly' ? 'bg-green-500/20 text-green-400'
                                  : emp.type === 'daily' ? 'bg-orange-500/20 text-orange-400'
                                  : emp.type === 'freelancer' ? 'bg-indigo-500/20 text-indigo-400'
                                  : 'bg-cyan-500/20 text-cyan-400'
                                }`}>
                                  {emp.type === 'hourly' ? '시급제' : emp.type === 'monthly' ? '월급제' : emp.type === 'daily' ? '일용직' : emp.type === 'freelancer' ? '프리랜서' : '시급제'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  emp.taxType === 'withholding' ? 'bg-amber-500/20 text-amber-400'
                                  : emp.taxType === 'daily' ? 'bg-orange-500/20 text-orange-400'
                                  : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {emp.taxType === 'withholding' ? '3.3%' : emp.taxType === 'daily' ? '일용직' : '4대보험'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right text-white">
                                {emp.type === 'freelancer'
                                  ? `${(emp.monthlyFee || 0).toLocaleString()}원/월`
                                  : emp.taxType === 'daily' || emp.type === 'daily'
                                  ? `${emp.dailyWage?.toLocaleString() || 0}원/일`
                                  : emp.type === 'hourly'
                                    ? `${emp.hourlyWage?.toLocaleString() || 0}원`
                                    : `${emp.monthlyWage?.toLocaleString() || 0}원`
                                }
                              </td>
                              <td className="px-4 py-4 text-center text-white/70 text-sm">
                                {emp.workDays?.map(d => ['일','월','화','수','목','금','토'][d]).join('') || '-'}
                              </td>
                              <td className="px-4 py-4 text-center text-white/70">
                                {emp.taxType === 'daily' ? '-' : `${emp.contractDailyHours || '-'}h`}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className="font-semibold text-green-400">
                                  {(emp.totalLaborCost || emp.calculatedMonthlyPay || 0).toLocaleString()}원
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setContractModal({ show: true, preselectedEmployeeId: emp.id })}
                                    className="p-2 text-white/40 hover:text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-all"
                                    title="계약서"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEmployeeModal({ show: true, mode: 'edit', data: emp })}
                                    className="p-2 text-white/40 hover:text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all"
                                    title="수정"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteEmployee(emp.id)}
                                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                    title="삭제"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </GlassCard>
              </>
            )}

            {/* 탭 2: 근무 기록 */}
            {employeeTab === 'records' && (
              <>
                {employees.length === 0 ? (
                  <GlassCard className="p-6" hover={false}>
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/50 mb-4">먼저 직원을 등록해주세요</p>
                      <button
                        onClick={() => setEmployeeTab('staff')}
                        className="px-6 py-3 bg-purple-500/20 text-purple-400 rounded-xl font-medium hover:bg-purple-500/30 transition-all border border-purple-500/30"
                      >
                        직원 관리로 이동
                      </button>
                    </div>
                  </GlassCard>
                ) : (
                  <>
                    {/* 직원 선택 + 버튼 */}
                    <GlassCard className="p-4" hover={false}>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-white/60 text-sm">직원 선택:</span>
                          <select
                            value={selectedEmployeeId || ''}
                            onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                          >
                            <option value="" className="bg-slate-800">선택하세요</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id} className="bg-slate-800">
                                {emp.name} ({emp.type === 'hourly' ? '시급제' : emp.type === 'monthly' ? '월급제' : emp.type === 'daily' ? '일용직' : emp.type === 'freelancer' ? '프리랜서' : '시급제'})
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedEmployeeId && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setBatchInputModal({ show: true })}
                              className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-all border border-purple-500/30"
                            >
                              + 일괄 입력
                            </button>
                            <button
                              onClick={() => autoFillFromContract(selectedEmployeeId)}
                              className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-all border border-cyan-500/30"
                            >
                              계약대로 자동채우기
                            </button>
                          </div>
                        )}
                      </div>
                    </GlassCard>

                    {selectedEmployeeId ? (
                      <>
                        {/* 캘린더 뷰 */}
                        <GlassCard className="p-6" hover={false}>
                          <h3 className="text-lg font-semibold text-white mb-4">
                            {employees.find(e => e.id === selectedEmployeeId)?.name} - 월간 근무 기록
                          </h3>

                          {/* 캘린더 그리드 */}
                          <div className="overflow-x-auto">
                            <div className="grid grid-cols-7 gap-1 min-w-[600px]">
                              {/* 요일 헤더 */}
                              {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                                <div key={day} className={`p-2 text-center text-sm font-medium ${idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-white/60'}`}>
                                  {day}
                                </div>
                              ))}

                              {/* 날짜 셀 */}
                              {(() => {
                                const days = getDaysInMonth(employeeMonth.year, employeeMonth.month);
                                const firstDay = new Date(employeeMonth.year, employeeMonth.month - 1, 1).getDay();
                                const cells = [];

                                // 빈 셀 추가
                                for (let i = 0; i < firstDay; i++) {
                                  cells.push(<div key={`empty-${i}`} className="p-2" />);
                                }

                                // 날짜 셀 추가
                                days.forEach(dateStr => {
                                  const date = new Date(dateStr);
                                  const dayNum = date.getDate();
                                  const dayOfWeek = date.getDay();
                                  const key = `${selectedEmployeeId}-${dateStr}`;
                                  const record = workRecords[key];
                                  const status = record ? WORK_STATUS[record.status] : null;
                                  const emp = employees.find(e => e.id === selectedEmployeeId);
                                  const isWorkDay = emp?.workDays?.includes(dayOfWeek);

                                  cells.push(
                                    <button
                                      key={dateStr}
                                      onClick={() => setWorkRecordModal({ show: true, employeeId: selectedEmployeeId, date: dateStr })}
                                      className={`p-2 rounded-lg text-left transition-all hover:ring-2 hover:ring-purple-400/50 min-h-[70px] ${
                                        status
                                          ? `bg-${status.color}-500/20 border border-${status.color}-500/30`
                                          : isWorkDay
                                            ? 'bg-white/5 border border-white/10 border-dashed'
                                            : 'bg-white/5'
                                      }`}
                                    >
                                      <div className={`text-sm font-medium ${dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-white'}`}>
                                        {dayNum}
                                      </div>
                                      {status && (
                                        <>
                                          <div className="text-lg">{status.emoji}</div>
                                          {emp?.taxType === 'daily' ? (
                                            record.dailyWage > 0 && (
                                              <div className="text-xs text-orange-400">{record.dailyWage?.toLocaleString()}원</div>
                                            )
                                          ) : (
                                            <>
                                              {record.actualHours > 0 && (
                                                <div className="text-xs text-white/60">{record.actualHours}h</div>
                                              )}
                                              {record.overtimeHours > 0 && (
                                                <div className="text-xs text-amber-400 font-medium">+{record.overtimeHours}h</div>
                                              )}
                                            </>
                                          )}
                                        </>
                                      )}
                                      {!status && isWorkDay && (
                                        <div className="text-xs text-white/30 mt-1">미입력</div>
                                      )}
                                    </button>
                                  );
                                });

                                return cells;
                              })()}
                            </div>
                          </div>

                          {/* 범례 */}
                          <div className="mt-4 flex flex-wrap gap-3 text-xs">
                            {Object.entries(WORK_STATUS).map(([key, val]) => (
                              <span key={key} className="flex items-center gap-1 text-white/60">
                                {val.emoji} {val.label}
                              </span>
                            ))}
                          </div>
                        </GlassCard>

                        {/* 주간 주휴수당 판정 */}
                        <GlassCard className="p-6" hover={false}>
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-purple-400" />
                            주간 주휴수당 판정
                          </h3>
                          <div className="space-y-3">
                            {getWeeksInMonth(employeeMonth.year, employeeMonth.month).map((weekStart, idx) => {
                              const result = calculateWeeklyHolidayPayFromRecords(selectedEmployeeId, weekStart);
                              const weekEnd = new Date(weekStart);
                              weekEnd.setDate(weekEnd.getDate() + 6);
                              const startDate = new Date(weekStart);

                              return (
                                <div key={weekStart} className={`p-4 rounded-xl border ${
                                  result.eligible
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-white/5 border-white/10'
                                }`}>
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                      <span className="text-white font-medium">{idx + 1}주차</span>
                                      <span className="text-white/50 text-sm ml-2">
                                        ({startDate.getMonth() + 1}/{startDate.getDate()} ~ {weekEnd.getMonth() + 1}/{weekEnd.getDate()})
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                      <span className="text-white/60">근무: {result.weeklyHours}h</span>
                                      {result.eligible ? (
                                        <span className="text-emerald-400 font-medium">
                                          ✅ {result.holidayPay.toLocaleString()}원
                                        </span>
                                      ) : (
                                        <span className="text-red-400">❌ {result.reason}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* 월 주휴수당 합계 */}
                          {(() => {
                            const weeks = getWeeksInMonth(employeeMonth.year, employeeMonth.month);
                            const results = weeks.map(ws => calculateWeeklyHolidayPayFromRecords(selectedEmployeeId, ws));
                            const totalHolidayPay = results.reduce((sum, r) => sum + r.holidayPay, 0);
                            const eligibleCount = results.filter(r => r.eligible).length;
                            return (
                              <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-xl border border-purple-500/30">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className="text-white font-medium">
                                    {employeeMonth.month}월 주휴수당 합계
                                    <span className="text-white/50 text-sm ml-2">
                                      (미해당 {weeks.length - eligibleCount}주 포함, {weeks.length}주 중 {eligibleCount}주 지급)
                                    </span>
                                  </span>
                                  <span className="text-xl font-bold text-purple-400">
                                    {totalHolidayPay.toLocaleString()}원
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </GlassCard>
                      </>
                    ) : (
                      <GlassCard className="p-6" hover={false}>
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p className="text-white/50">직원을 선택하면 근무 기록을 관리할 수 있습니다</p>
                        </div>
                      </GlassCard>
                    )}
                  </>
                )}
              </>
            )}

            {/* 탭 3: 급여 정산 */}
            {employeeTab === 'payroll' && (
              <>
                {employees.length === 0 ? (
                  <GlassCard className="p-6" hover={false}>
                    <div className="text-center py-12">
                      <DollarSign className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/50">먼저 직원을 등록해주세요</p>
                    </div>
                  </GlassCard>
                ) : (
                  <>
                    {/* 헤더: 필터 + 엑셀 다운로드 */}
                    <GlassCard className="p-4" hover={false}>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-white/60 text-sm">직원 선택:</span>
                          <select
                            value={payrollFilter}
                            onChange={(e) => setPayrollFilter(e.target.value)}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                          >
                            <option value="all" className="bg-slate-800">전체</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id} className="bg-slate-800">
                                {emp.name} ({emp.type === 'hourly' ? '시급제' : emp.type === 'monthly' ? '월급제' : emp.type === 'daily' ? '일용직' : emp.type === 'freelancer' ? '프리랜서' : '시급제'})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={downloadPayrollExcel}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-all border border-green-500/30 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" /> 엑셀 다운로드
                        </button>
                      </div>
                    </GlassCard>

                    {/* 전체 요약 */}
                    <GlassCard className="p-6" hover={false}>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-green-400" />
                        {employeeMonth.year}년 {employeeMonth.month}월 급여 정산
                      </h3>
                      <div className="text-white/50 text-sm mb-4">
                        근무 기록 기반 실제 급여 계산 (기록이 없으면 계약 기본값 사용)
                      </div>

                      {/* 직원별 급여 카드 */}
                      <div className="space-y-4">
                        {(payrollFilter === 'all' ? employees : employees.filter(e => e.id === Number(payrollFilter))).map(emp => {
                          const payroll = calculateMonthlyPayFromRecords(emp.id);
                          if (!payroll) return null;

                          return (
                            <div key={emp.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-white">{emp.name}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                    emp.type === 'freelancer' ? 'bg-indigo-500/20 text-indigo-400'
                                    : emp.taxType === 'daily' || emp.type === 'daily' ? 'bg-orange-500/20 text-orange-400'
                                    : emp.type === 'hourly' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-green-500/20 text-green-400'
                                  }`}>
                                    {emp.type === 'freelancer' ? '프리랜서' : emp.taxType === 'daily' || emp.type === 'daily' ? '일용직' : emp.type === 'hourly' ? '시급제' : '월급제'}
                                  </span>
                                </div>
                                <span className="text-xl font-bold text-green-400">
                                  {payroll.totalLaborCost.toLocaleString()}원
                                </span>
                              </div>

                              {/* 일용직 급여 정산 */}
                              {emp.taxType === 'daily' && (
                                <div className="space-y-3 text-sm">
                                  <div className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                                    <p className="text-orange-400 font-medium mb-2">일용직 급여</p>
                                    <div className="space-y-1 pl-3">
                                      <div className="flex justify-between">
                                        <span className="text-white/60">근무일수: {payroll.workDayCount || 0}일</span>
                                      </div>
                                      {payroll.dailyDetails?.map((dd, i) => (
                                        <div key={i} className="flex justify-between text-xs text-white/40">
                                          <span>{dd.date.slice(5)}</span>
                                          <span>{dd.dailyWage.toLocaleString()}원</span>
                                        </div>
                                      ))}
                                      <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                                        <span className="text-white/70">총 급여</span>
                                        <span className="text-orange-400 font-medium">{payroll.basePay.toLocaleString()}원</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-lg">
                                    <div className="space-y-1 pl-3 text-white/50">
                                      <p>주휴수당: 없음 (일용직)</p>
                                      <p>4대보험/원천징수: 없음</p>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                                    <div className="flex justify-between font-bold">
                                      <span className="text-white">총 인건비 (사업주)</span>
                                      <span className="text-emerald-400 text-lg">{payroll.totalLaborCost.toLocaleString()}원</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {emp.type === 'hourly' && emp.taxType !== 'daily' && (
                                <div className="space-y-3 text-sm">
                                  {/* 기본급여 섹션 */}
                                  <div className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-white/70 font-medium mb-2">기본급여</p>
                                    <div className="space-y-1 pl-3">
                                      <div className="flex justify-between">
                                        <span className="text-white/60">총 근무시간: {payroll.totalActualHours}시간</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-white/60">기본 급여: {payroll.totalActualHours}h × {emp.hourlyWage.toLocaleString()}원</span>
                                        <span className="text-white">{payroll.basePay.toLocaleString()}원</span>
                                      </div>
                                      {payroll.overtimePay > 0 && (
                                        <>
                                          <div className="flex justify-between">
                                            <span className="text-white/60">연장근무: {payroll.totalOvertimeHours}h × {emp.hourlyWage.toLocaleString()}원 × 1.0</span>
                                            <span className="text-cyan-400">+{payroll.overtimePay.toLocaleString()}원</span>
                                          </div>
                                          {payroll.details?.overtimes?.map((ot, i) => (
                                            <div key={i} className="flex justify-between text-xs text-white/40 pl-2">
                                              <span>{ot.date.slice(5)} +{ot.hours}h</span>
                                            </div>
                                          ))}
                                        </>
                                      )}
                                      <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                                        <span className="text-white/70">소계</span>
                                        <span className="text-white font-medium">{(payroll.basePay + payroll.overtimePay).toLocaleString()}원</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 주휴수당 섹션 */}
                                  <div className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-white/70 font-medium mb-2">주휴수당</p>
                                    <div className="space-y-1 pl-3">
                                      {payroll.weeklyDetails?.map((wd, i) => (
                                        <div key={i} className="flex justify-between">
                                          <span className="text-white/60">{i + 1}주차</span>
                                          {wd.eligible ? (
                                            <span className="text-emerald-400">{wd.holidayPay.toLocaleString()}원</span>
                                          ) : (
                                            <span className="text-red-400/70">0원 ({wd.reason})</span>
                                          )}
                                        </div>
                                      ))}
                                      <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                                        <span className="text-white/70">소계</span>
                                        <span className="text-purple-400 font-medium">{payroll.weeklyHolidayPay.toLocaleString()}원</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 차감 항목 섹션 */}
                                  {payroll.deductPay > 0 && (
                                    <div className="p-3 bg-white/5 rounded-lg">
                                      <p className="text-white/70 font-medium mb-2">차감 항목</p>
                                      <div className="space-y-1 pl-3">
                                        {payroll.details?.deductions?.map((dd, i) => (
                                          <div key={i} className="flex justify-between">
                                            <span className="text-white/60">{dd.reason} ({dd.date.slice(5)}): -{dd.hours}h × {emp.hourlyWage.toLocaleString()}원</span>
                                            <span className="text-red-400">-{Math.round(dd.hours * emp.hourlyWage).toLocaleString()}원</span>
                                          </div>
                                        ))}
                                        <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                                          <span className="text-white/70">소계</span>
                                          <span className="text-red-400 font-medium">-{payroll.deductPay.toLocaleString()}원</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 유급 휴가 섹션 */}
                                  {payroll.paidLeavePay > 0 && (
                                    <div className="p-3 bg-white/5 rounded-lg">
                                      <p className="text-white/70 font-medium mb-2">유급 휴가</p>
                                      <div className="space-y-1 pl-3">
                                        {payroll.details?.paidLeaves?.map((pl, i) => (
                                          <div key={i} className="flex justify-between">
                                            <span className="text-white/60">{pl.type} ({pl.date.slice(5)}): {pl.hours}h × {emp.hourlyWage.toLocaleString()}원</span>
                                            <span className="text-blue-400">{Math.round(pl.hours * emp.hourlyWage).toLocaleString()}원</span>
                                          </div>
                                        ))}
                                        <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                                          <span className="text-white/70">소계</span>
                                          <span className="text-blue-400 font-medium">{payroll.paidLeavePay.toLocaleString()}원</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 급여 총계 */}
                                  <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                                    <div className="flex justify-between font-medium">
                                      <span className="text-white">총 급여</span>
                                      <span className="text-green-400">{payroll.totalPay.toLocaleString()}원</span>
                                    </div>
                                  </div>

                                  {/* 사업주 부담 */}
                                  <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/30 space-y-1">
                                    {payroll.insurancePay > 0 && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/60">+ 4대보험 (사업주 부담)</span>
                                        <span className="text-amber-400">{payroll.insurancePay.toLocaleString()}원</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold">
                                      <span className="text-white">사업주 부담</span>
                                      <span className="text-emerald-400 text-lg">{payroll.totalLaborCost.toLocaleString()}원</span>
                                    </div>
                                  </div>

                                  {/* 직원 수령 */}
                                  <div className="p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30 space-y-1">
                                    {(emp.taxType === 'insurance' || !emp.taxType) && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/60">- 4대보험 (직원 부담 9.4%)</span>
                                        <span className="text-amber-400">-{(payroll.employeeInsuranceDeduction || 0).toLocaleString()}원</span>
                                      </div>
                                    )}
                                    {emp.taxType === 'withholding' && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/60">- 3.3% 공제</span>
                                        <span className="text-amber-400">-{(payroll.withholdingDeduction || 0).toLocaleString()}원</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold">
                                      <span className="text-white">직원 실수령</span>
                                      <span className="text-cyan-400 text-lg">{(payroll.employeeNetPay || payroll.totalPay).toLocaleString()}원</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {emp.type === 'monthly' && (
                                <div className="text-sm space-y-1">
                                  <div className="text-white/60">
                                    월급 {emp.monthlyWage.toLocaleString()}원
                                    {emp.taxType === 'insurance' || !emp.taxType ? ` + 4대보험(사업주) ${payroll.insurancePay.toLocaleString()}원` : ''}
                                    {emp.taxType === 'withholding' ? ` (3.3% 공제: ${(payroll.withholdingDeduction || 0).toLocaleString()}원)` : ''}
                                    {emp.taxType === 'daily' ? ' (일용직)' : ''}
                                  </div>
                                  {(payroll.totalTaxExempt || 0) > 0 && (
                                    <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 space-y-0.5">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-green-400">비과세 합계</span>
                                        <span className="text-green-400">{payroll.totalTaxExempt.toLocaleString()}원</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-white/50">과세 대상</span>
                                        <span className="text-white/70">{payroll.taxableAmount.toLocaleString()}원</span>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-white/60">직원 실수령</span>
                                    <span className="text-cyan-400 font-medium">{(payroll.employeeNetPay || payroll.totalPay).toLocaleString()}원</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* 전체 합계 (3줄 분리) */}
                      {(() => {
                        const targetEmps = payrollFilter === 'all' ? employees : employees.filter(e => e.id === Number(payrollFilter));
                        let sumPay = 0, sumIns = 0, sumLabor = 0;
                        targetEmps.forEach(emp => {
                          const p = calculateMonthlyPayFromRecords(emp.id);
                          if (p) { sumPay += p.totalPay; sumIns += p.insurancePay; sumLabor += p.totalLaborCost; }
                        });
                        return (
                          <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/70">총 급여 합계</span>
                              <span className="text-white font-medium">{sumPay.toLocaleString()}원</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/70">총 4대보험</span>
                              <span className="text-amber-400 font-medium">{sumIns.toLocaleString()}원</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-green-500/30 pt-2">
                              <span className="text-white font-bold">총 인건비</span>
                              <span className="text-2xl font-bold text-green-400">{sumLabor.toLocaleString()}원</span>
                            </div>
                          </div>
                        );
                      })()}
                    </GlassCard>
                  </>
                )}
              </>
            )}

            {/* 탭 4: 계약서 */}
            {employeeTab === 'contracts' && (
              <ContractTab
                employees={employees}
                onOpenContractModal={(empId) => setContractModal({ show: true, preselectedEmployeeId: empId })}
                onOpenBlankContract={() => setContractModal({ show: true, preselectedEmployeeId: null })}
              />
            )}

            {/* 계약서 모달 */}
            <ContractModal
              show={contractModal.show}
              onClose={() => setContractModal({ show: false, preselectedEmployeeId: null })}
              employees={employees}
              fullStoreInfo={fullStoreInfo}
              preselectedEmployeeId={contractModal.preselectedEmployeeId}
            />

            {/* 직원 추가/수정 모달 */}
            {employeeModal.show && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      {employeeModal.mode === 'add' ? '직원 추가' : '직원 수정'}
                    </h3>
                    <button
                      onClick={() => setEmployeeModal({ show: false, mode: 'add', data: null })}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <EmployeeForm
                      initialData={employeeModal.data}
                      onSubmit={employeeModal.mode === 'add' ? addEmployee : updateEmployee}
                      onCancel={() => setEmployeeModal({ show: false, mode: 'add', data: null })}
                      onDelete={employeeModal.mode === 'edit' ? () => { deleteEmployee(employeeModal.data.id); setEmployeeModal({ show: false, mode: 'add', data: null }); } : null}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 근무 기록 입력 모달 */}
            {workRecordModal.show && workRecordModal.employeeId && workRecordModal.date && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-md">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">
                      {(() => {
                        const d = new Date(workRecordModal.date);
                        const emp = employees.find(e => e.id === workRecordModal.employeeId);
                        return `${d.getMonth() + 1}/${d.getDate()} (${['일','월','화','수','목','금','토'][d.getDay()]}) - ${emp?.name}`;
                      })()}
                    </h3>
                    <button
                      onClick={() => setWorkRecordModal({ show: false, employeeId: null, date: null })}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <WorkRecordForm
                      employee={employees.find(e => e.id === workRecordModal.employeeId)}
                      date={workRecordModal.date}
                      existingRecord={workRecords[`${workRecordModal.employeeId}-${workRecordModal.date}`]}
                      onSubmit={saveWorkRecord}
                      onCancel={() => setWorkRecordModal({ show: false, employeeId: null, date: null })}
                      onDelete={() => {
                        deleteWorkRecord(workRecordModal.employeeId, workRecordModal.date);
                        setWorkRecordModal({ show: false, employeeId: null, date: null });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 일괄 입력 모달 */}
            {batchInputModal.show && selectedEmployeeId && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-md">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">일괄 입력</h3>
                    <button onClick={() => setBatchInputModal({ show: false })} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    {(() => {
                      const [batchForm, setBatchForm] = [batchInputModal, (v) => setBatchInputModal(prev => ({ ...prev, ...v }))];
                      const bStartDate = batchInputModal.startDate || `${employeeMonth.year}-${String(employeeMonth.month).padStart(2, '0')}-01`;
                      const bEndDate = batchInputModal.endDate || `${employeeMonth.year}-${String(employeeMonth.month).padStart(2, '0')}-${new Date(employeeMonth.year, employeeMonth.month, 0).getDate()}`;
                      const bStatus = batchInputModal.status || 'work';
                      const emp = employees.find(e => e.id === selectedEmployeeId);
                      const bStartTime = batchInputModal.startTime || emp?.defaultStartTime || '09:00';
                      const bEndTime = batchInputModal.endTime || emp?.defaultEndTime || '14:00';
                      const bBreak = batchInputModal.breakH ?? emp?.defaultBreak ?? 0;
                      return (
                        <div className="space-y-4">
                          <p className="text-white/60 text-sm">{emp?.name} - 선택 기간에 동일 상태를 일괄 적용합니다.</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-white/60 text-sm mb-1">시작일</label>
                              <input type="date" value={bStartDate} onChange={(e) => setBatchForm({ startDate: e.target.value })}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400" />
                            </div>
                            <div>
                              <label className="block text-white/60 text-sm mb-1">종료일</label>
                              <input type="date" value={bEndDate} onChange={(e) => setBatchForm({ endDate: e.target.value })}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-white/60 text-sm mb-2">근무 상태</label>
                            <div className="grid grid-cols-3 gap-2">
                              {Object.entries(WORK_STATUS).map(([key, val]) => (
                                <button key={key} type="button" onClick={() => setBatchForm({ status: key })}
                                  className={`p-2 rounded-lg text-center transition-all hover:bg-white/10 ${bStatus === key ? `bg-${val.color}-500/30 border-2 border-${val.color}-400` : 'bg-white/5 border border-white/10'}`}>
                                  <div className="text-lg">{val.emoji}</div>
                                  <div className="text-xs text-white/70">{val.label}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                          {(bStatus === 'work' || bStatus === 'late' || bStatus === 'halfday') && (
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-white/60 text-sm mb-1">출근</label>
                                <input type="time" value={bStartTime} onChange={(e) => setBatchForm({ startTime: e.target.value })}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400" />
                              </div>
                              <div>
                                <label className="block text-white/60 text-sm mb-1">퇴근</label>
                                <input type="time" value={bEndTime} onChange={(e) => setBatchForm({ endTime: e.target.value })}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400" />
                              </div>
                              <div>
                                <label className="block text-white/60 text-sm mb-1">휴게(h)</label>
                                <input type="number" value={bBreak} onChange={(e) => setBatchForm({ breakH: Number(e.target.value) })} min="0" step="0.5"
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400" />
                              </div>
                            </div>
                          )}
                          <div className="flex gap-3 pt-2">
                            <button onClick={() => setBatchInputModal({ show: false })}
                              className="flex-1 px-4 py-2 bg-white/10 text-white/70 rounded-lg font-medium hover:bg-white/20 transition-all">취소</button>
                            <button onClick={() => batchInputRecords(selectedEmployeeId, bStartDate, bEndDate, bStatus, bStartTime, bEndTime, bBreak)}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">일괄 적용</button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 손익관리 뷰 */}
        {currentView === 'profitloss' && (
          <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => changeProfitLossMonth(-1)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-green-400" />
                  {profitLossMonth.year}년 {profitLossMonth.month}월 손익
                </h2>
                <button
                  onClick={() => changeProfitLossMonth(1)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 요약 카드 5개 */}
            {(() => {
              const pl = calculateProfitLoss();
              return (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* 총 매출 */}
                    <GlassCard className="p-4">
                      <p className="text-white/50 text-sm mb-1">총 매출</p>
                      <p className="text-xl font-bold text-white">{pl.revenue.toLocaleString()}</p>
                      <p className="text-xs text-white/40">POS 자동</p>
                    </GlassCard>

                    {/* 매출원가 */}
                    <GlassCard className="p-4 bg-orange-500/5">
                      <p className="text-white/50 text-sm mb-1">매출원가</p>
                      <p className="text-xl font-bold text-orange-400">{pl.costOfGoods.toLocaleString()}</p>
                      <p className="text-xs text-orange-400/60">원가율 {pl.costRate}% · 직접 입력</p>
                    </GlassCard>

                    {/* 영업비용 */}
                    <GlassCard className="p-4 bg-red-500/5">
                      <p className="text-white/50 text-sm mb-1">영업비용</p>
                      <p className="text-xl font-bold text-red-400">{pl.operatingExpense.toLocaleString()}</p>
                      <p className="text-xs text-red-400/60">인건비+고정비</p>
                    </GlassCard>

                    {/* 영업이익 */}
                    <GlassCard className="p-4 bg-emerald-500/5">
                      <p className="text-white/50 text-sm mb-1">영업이익</p>
                      <p className={`text-xl font-bold ${pl.operatingProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pl.operatingProfit.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-400/60">이익률 {pl.operatingProfitRate}%</p>
                    </GlassCard>

                    {/* 순이익 */}
                    <GlassCard className="p-4 bg-green-500/10 border-green-500/20">
                      <p className="text-white/50 text-sm mb-1">순이익</p>
                      <p className={`text-xl font-bold ${getProfitRateColor(pl.netProfitRate)}`}>
                        {pl.netProfit.toLocaleString()}
                      </p>
                      <p className={`text-xs ${getProfitRateColor(pl.netProfitRate)}`}>순이익률 {pl.netProfitRate}%</p>
                    </GlassCard>
                  </div>

                  {/* 손익계산서 */}
                  <GlassCard className="p-6" hover={false}>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      손익계산서
                    </h3>

                    <div className="space-y-3 text-sm">
                      {/* 매출 */}
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <span className="text-white font-medium">매출</span>
                          <span className="text-white/40 text-xs ml-2">(POS 매출 합계 - 자동)</span>
                        </div>
                        <span className="text-white font-semibold">{pl.revenue.toLocaleString()}원</span>
                      </div>

                      {/* 매출원가 */}
                      <div className="flex justify-between items-center py-2 pl-4 border-l-2 border-orange-500/30">
                        <div>
                          <span className="text-orange-400">(-) 매출원가</span>
                          <span className="text-white/40 text-xs ml-2">(직접 입력)</span>
                        </div>
                        <span className="text-orange-400">{pl.costOfGoods.toLocaleString()}원</span>
                      </div>

                      {/* 매출총이익 */}
                      <div className="flex justify-between items-center py-2 bg-white/5 px-3 rounded-lg">
                        <span className="text-white font-medium">매출총이익</span>
                        <span className={pl.grossProfit >= 0 ? 'text-cyan-400 font-semibold' : 'text-red-400 font-semibold'}>
                          {pl.grossProfit.toLocaleString()}원
                        </span>
                      </div>

                      {/* 영업비용 */}
                      <div className="flex justify-between items-center py-2 pl-4 border-l-2 border-red-500/30">
                        <span className="text-red-400">(-) 영업비용</span>
                        <span className="text-red-400">{pl.operatingExpense.toLocaleString()}원</span>
                      </div>

                      {/* 영업비용 세부 항목 */}
                      <div className="pl-8 space-y-1 text-xs text-white/60">
                        <div className="flex justify-between">
                          <span>├ 인건비 (자동)</span>
                          <span>{pl.laborCost.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>├ 4대보험 (자동)</span>
                          <span>{pl.insuranceCost.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>├ 임대료</span>
                          <span>{pl.rent.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>├ 관리비</span>
                          <span>{pl.maintenance.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>├ 공과금</span>
                          <span>{pl.utilities.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>├ 카드수수료</span>
                          <span>{pl.cardFee.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>└ 기타비용</span>
                          <span>{pl.otherOperating.toLocaleString()}원</span>
                        </div>
                      </div>

                      {/* 영업이익 */}
                      <div className="flex justify-between items-center py-2 bg-white/5 px-3 rounded-lg">
                        <span className="text-white font-medium">영업이익</span>
                        <span className={pl.operatingProfit >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                          {pl.operatingProfit.toLocaleString()}원
                        </span>
                      </div>

                      {/* 기타지출 */}
                      <div className="flex justify-between items-center py-2 pl-4 border-l-2 border-amber-500/30">
                        <span className="text-amber-400">(-) 기타 지출</span>
                        <span className="text-amber-400">{pl.otherExpense.toLocaleString()}원</span>
                      </div>

                      {/* 기타지출 세부 */}
                      <div className="pl-8 space-y-1 text-xs text-white/60">
                        <div className="flex justify-between">
                          <span>├ 대출이자</span>
                          <span>{pl.loanInterest.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>└ 세금/기타</span>
                          <span>{pl.tax.toLocaleString()}원</span>
                        </div>
                      </div>

                      {/* 순이익 */}
                      <div className="flex justify-between items-center py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-4 rounded-xl border border-green-500/30 mt-2">
                        <div>
                          <span className="text-white font-bold text-base">★ 순이익</span>
                          <span className="text-white/50 text-xs ml-2">(내 통장에 남는 돈)</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold text-lg ${getProfitRateColor(pl.netProfitRate)}`}>
                            {pl.netProfit.toLocaleString()}원
                          </span>
                          <p className={`text-xs ${getProfitRateColor(pl.netProfitRate)}`}>
                            순이익률: {pl.netProfitRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* 비용 입력 폼 */}
                  <GlassCard className="p-6" hover={false}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-amber-400" />
                        {profitLossMonth.year}년 {profitLossMonth.month}월 비용 입력
                      </h3>
                      <button
                        onClick={() => {
                          if (copyPreviousMonthExpenses()) {
                            showConfirm('복사 완료', '이전 달 고정비가 복사되었습니다.', () => {});
                          } else {
                            showConfirm('복사 실패', '이전 달 데이터가 없습니다.', () => {});
                          }
                        }}
                        className="px-3 py-1.5 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/20 transition-all"
                      >
                        이전 달 복사
                      </button>
                    </div>

                    {/* 자동 계산 항목 */}
                    <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm text-white/50 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> 자동 계산 항목 (수정 불가)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-white/50">매출 (POS)</p>
                          <p className="text-white font-medium">{pl.revenue.toLocaleString()}원</p>
                        </div>
                        <div>
                          <p className="text-white/50">인건비 (직원)</p>
                          <p className="text-purple-400 font-medium">{pl.laborCost.toLocaleString()}원</p>
                        </div>
                        <div>
                          <p className="text-white/50">4대보험</p>
                          <p className="text-amber-400 font-medium">{pl.insuranceCost.toLocaleString()}원</p>
                        </div>
                      </div>
                    </div>

                    {/* 직접 입력 항목 */}
                    {(() => {
                      const expenses = getCurrentMonthExpenses();
                      return (
                        <div className="space-y-4">
                          <p className="text-sm text-cyan-400 font-medium">직접 입력 항목</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-white/60 text-sm mb-1">원재료비/매입비</label>
                              <input
                                type="number"
                                value={expenses.costOfGoods || ''}
                                onChange={(e) => saveMonthlyExpenses({ ...expenses, costOfGoods: Number(e.target.value) || 0 })}
                                placeholder="0"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-400"
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 text-sm mb-1">임대료</label>
                              <input
                                type="number"
                                value={expenses.rent || ''}
                                onChange={(e) => saveMonthlyExpenses({ ...expenses, rent: Number(e.target.value) || 0 })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 text-sm mb-1">관리비</label>
                              <input
                                type="number"
                                value={expenses.maintenance || ''}
                                onChange={(e) => saveMonthlyExpenses({ ...expenses, maintenance: Number(e.target.value) || 0 })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 text-sm mb-1">공과금 (전기/수도/가스)</label>
                              <input
                                type="number"
                                value={expenses.utilities || ''}
                                onChange={(e) => saveMonthlyExpenses({ ...expenses, utilities: Number(e.target.value) || 0 })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 text-sm mb-1">카드수수료</label>
                              <input
                                type="number"
                                value={expenses.cardFee || ''}
                                onChange={(e) => saveMonthlyExpenses({ ...expenses, cardFee: Number(e.target.value) || 0 })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 text-sm mb-1">기타 영업비용</label>
                              <input
                                type="number"
                                value={expenses.otherOperating || ''}
                                onChange={(e) => saveMonthlyExpenses({ ...expenses, otherOperating: Number(e.target.value) || 0 })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 text-sm mb-1">대출이자</label>
                              <input
                                type="number"
                                value={expenses.loanInterest || ''}
                                onChange={(e) => saveMonthlyExpenses({ ...expenses, loanInterest: Number(e.target.value) || 0 })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 text-sm mb-1">세금/기타</label>
                              <input
                                type="number"
                                value={expenses.tax || ''}
                                onChange={(e) => saveMonthlyExpenses({ ...expenses, tax: Number(e.target.value) || 0 })}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-white/60 text-sm mb-1">메모</label>
                              <input
                                type="text"
                                value={expenses.memo || ''}
                                onChange={(e) => saveMonthlyExpenses({ ...expenses, memo: e.target.value })}
                                placeholder="메모 입력..."
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </GlassCard>

                  {/* 월별 추이 차트 */}
                  <GlassCard className="p-6" hover={false}>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      월별 손익 추이
                    </h3>
                    {(() => {
                      const trendData = getProfitLossTrend(6);
                      const hasData = trendData.some(d => d.revenue > 0);

                      if (!hasData) {
                        return (
                          <div className="text-center py-8">
                            <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-3" />
                            <p className="text-white/50">매출 데이터가 없습니다</p>
                            <p className="text-white/30 text-sm">POS 데이터를 업로드하면 추이 차트가 표시됩니다</p>
                          </div>
                        );
                      }

                      return (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                              <XAxis dataKey="month" stroke="#ffffff60" fontSize={12} />
                              <YAxis stroke="#ffffff60" fontSize={12} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                                formatter={(value, name) => [
                                  `${value.toLocaleString()}원`,
                                  name === 'revenue' ? '매출' : name === 'expense' ? '비용' : '순이익'
                                ]}
                              />
                              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" name="revenue" />
                              <Area type="monotone" dataKey="netProfit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" name="netProfit" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })()}

                    {/* 월별 데이터 테이블 */}
                    {(() => {
                      const trendData = getProfitLossTrend(6);
                      return (
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="px-3 py-2 text-left text-white/60"></th>
                                {trendData.map(d => (
                                  <th key={d.monthKey} className="px-3 py-2 text-center text-white/80">{d.month}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-white/5">
                                <td className="px-3 py-2 text-white/60">매출</td>
                                {trendData.map(d => (
                                  <td key={d.monthKey} className="px-3 py-2 text-center text-white">
                                    {d.revenue > 0 ? `${(d.revenue / 10000).toFixed(0)}만` : '-'}
                                  </td>
                                ))}
                              </tr>
                              <tr className="border-b border-white/5">
                                <td className="px-3 py-2 text-white/60">순이익</td>
                                {trendData.map(d => (
                                  <td key={d.monthKey} className={`px-3 py-2 text-center ${d.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {d.revenue > 0 ? `${(d.netProfit / 10000).toFixed(0)}만` : '-'}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-white/60">이익률</td>
                                {trendData.map(d => (
                                  <td key={d.monthKey} className={`px-3 py-2 text-center ${getProfitRateColor(d.rate)}`}>
                                    {d.revenue > 0 ? `${d.rate}%` : '-'}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </GlassCard>
                </>
              );
            })()}
          </div>
        )}

        {/* 내 데이터 뷰 */}
        {currentView === 'mydata' && (
          <div className="space-y-6">
            <GlassCard className="p-6" hover={false}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-cyan-400" />
                {selectedStore?.name} - 업로드된 파일
              </h2>
              
              {selectedStore?.files.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 mb-4">업로드된 파일이 없습니다</p>
                  <button onClick={downloadSampleExcel}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 text-cyan-400 rounded-xl font-medium hover:bg-cyan-500/30 transition-all border border-cyan-500/30">
                    <Download className="w-5 h-5" /> 예시 엑셀 다운로드
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedStore.files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-10 h-10 text-green-400" />
                        <div>
                          <p className="font-medium text-white">{file.name}</p>
                          <p className="text-sm text-white/50">{file.rowCount.toLocaleString()}건 · {new Date(file.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => downloadUploadedFile(file)} 
                          className="p-2 text-white/40 hover:text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all"
                          title="다운로드">
                          <Download className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteFile(file.id)} 
                          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          title="삭제">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <p className="text-sm text-white/50">총 데이터</p>
                      <p className="text-2xl font-bold text-white">{selectedStore.salesData?.length.toLocaleString() || 0}건</p>
                    </div>
                    <button onClick={clearStoreData} className="px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-xl font-medium transition-all">
                      전체 초기화
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* 엑셀 작성 방법 */}
            <GlassCard className="p-6" hover={false}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-amber-400" />
                엑셀 파일 작성 방법
              </h2>
              
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                <p className="text-amber-400 font-medium mb-2">필수 컬럼</p>
                <ul className="text-amber-200/80 text-sm space-y-1">
                  <li>• <strong>날짜</strong>: 결제일, 주문기준일자, 날짜</li>
                  <li>• <strong>시간</strong>: 결제시간, 주문시작시간, 시간</li>
                  <li>• <strong>금액</strong>: 총결제금액, 실판매금액, 총액, 금액</li>
                  <li>• <strong>상품</strong>: 상품명, 결제내역, 메뉴 (선택)</li>
                </ul>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="px-4 py-2 text-left text-white/70 rounded-l-lg">결제일</th>
                      <th className="px-4 py-2 text-left text-white/70">결제시간</th>
                      <th className="px-4 py-2 text-left text-white/70">상품명</th>
                      <th className="px-4 py-2 text-right text-white/70 rounded-r-lg">총결제금액</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    <tr className="border-b border-white/10">
                      <td className="px-4 py-2">2025-01-01</td>
                      <td className="px-4 py-2">09:30</td>
                      <td className="px-4 py-2">아메리카노</td>
                      <td className="px-4 py-2 text-right">4,500</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-4 py-2">2025-01-01</td>
                      <td className="px-4 py-2">10:15</td>
                      <td className="px-4 py-2">카페라떼</td>
                      <td className="px-4 py-2 text-right">5,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <button onClick={downloadSampleExcel}
                className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> 예시 파일 다운로드
              </button>
            </GlassCard>

            {/* 매장/사업자 정보 설정 */}
            <StoreSettingsForm
              storeInfo={storeInfo}
              setStoreInfo={setStoreInfo}
              storeName={selectedStore?.name}
            />
          </div>
        )}

        {/* 사용방법 뷰 */}
        {currentView === 'guide' && (
          <GuidePage />
        )}

        {/* 대시보드 뷰 */}
        {currentView === 'dashboard' && (
          <>
            {!selectedStore?.analysis ? (
              <div className="space-y-6">
                {/* 업로드 영역 */}
                <GlassCard hover={false}>
                  <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                    className="p-12 lg:p-16 text-center cursor-pointer">
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="w-20 h-20 bg-blue-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10 text-cyan-400" />
                      </div>
                      <p className="text-2xl lg:text-3xl font-bold text-white mb-2">POS 매출 파일 업로드</p>
                      <p className="text-white/60 text-lg">파일을 드래그하거나 클릭하여 선택하세요</p>
                      <p className="text-white/40 mt-2 text-sm">.xlsx, .xls, .csv 지원</p>
                    </label>
                  </div>
                </GlassCard>

                {/* 버튼들 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={loadDemoData}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    <Play className="w-5 h-5" /> 샘플 데이터로 체험
                  </button>
                  <button onClick={downloadSampleExcel}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                    <Download className="w-5 h-5" /> 예시 엑셀 다운로드
                  </button>
                </div>

                {/* 기능 소개 */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Calendar, title: '요일별 분석', desc: '가장 잘 팔리는 요일' },
                    { icon: Clock, title: '시간대 분석', desc: '피크 타임 파악' },
                    { icon: Award, title: '베스트 메뉴', desc: '인기 상품 TOP 10' },
                  ].map((item, i) => (
                    <GlassCard key={i} className="p-6 group">
                      <div className="w-14 h-14 bg-blue-500/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <item.icon className="w-7 h-7 text-cyan-400" />
                      </div>
                      <h3 className="font-bold text-white text-xl mb-1">{item.title}</h3>
                      <p className="text-white/60">{item.desc}</p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* 월 선택 */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <button
                    onClick={() => changeDashboardMonthWithReset(-1)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-xl font-bold text-white">
                    {dashboardMonth.year}년 {dashboardMonth.month}월
                  </h2>
                  <button
                    onClick={() => changeDashboardMonthWithReset(1)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* 탭 */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {[
                    { id: 'overview', label: '요약', icon: TrendingUp },
                    { id: 'daily', label: '날짜별', icon: Calendar },
                    { id: 'weekday', label: '요일별', icon: Calendar },
                    { id: 'hourly', label: '시간대', icon: Clock },
                    { id: 'products', label: '상품별', icon: Coffee },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}>
                      <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* 전체 요약 */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* 3개 메인 카드 (v2에서 5개로 복구: 총이익/발주금액 카드 추가) */}
                    {(() => {
                      const stats = getDashboardStats();
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* 카드 1: 선택월 매출 */}
                          <GlassCard className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm text-white/50">선택월 매출</p>
                              <div className="w-9 h-9 bg-blue-500/30 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-cyan-400" />
                              </div>
                            </div>
                            <p className="text-xl lg:text-2xl font-bold text-white mb-2">
                              {formatCurrency(stats.currentSales)}
                            </p>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-white/40">전월</span>
                                {stats.monthChange !== null ? (
                                  <span className={stats.monthChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {stats.monthChange >= 0 ? '▲' : '▼'} {Math.abs(stats.monthChange)}%
                                  </span>
                                ) : (
                                  <span className="text-white/30">-</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-white/40">전년</span>
                                {stats.yearChange !== null ? (
                                  <span className={stats.yearChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {stats.yearChange >= 0 ? '▲' : '▼'} {Math.abs(stats.yearChange)}%
                                  </span>
                                ) : (
                                  <span className="text-white/30">-</span>
                                )}
                              </div>
                            </div>
                          </GlassCard>

                          {/* v2에서 복구: 선택월 총이익 카드 (원재료/레시피 기능 추가 후) */}
                          {/*
                          <GlassCard className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm text-white/50">선택월 총이익</p>
                              <div className="w-9 h-9 bg-green-500/30 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                              </div>
                            </div>
                            <p className="text-xl lg:text-2xl font-bold text-green-400 mb-2">
                              {formatCurrency(stats.totalProfit)}
                            </p>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-white/40">이익률</span>
                                <span className="text-green-400">{stats.profitRate}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-white/40">원가율</span>
                                <span className={Number(stats.costRate) > 40 ? 'text-red-400' : Number(stats.costRate) > 30 ? 'text-amber-400' : 'text-cyan-400'}>
                                  {stats.costRate}%
                                </span>
                              </div>
                            </div>
                            {stats.unmatchedCount > 0 && (
                              <p className="text-xs text-amber-400/70 mt-1">
                                ※ 미매칭 {stats.unmatchedCount}건
                              </p>
                            )}
                          </GlassCard>
                          */}

                          {/* v2에서 복구: 선택월 발주금액 카드 (원재료/레시피 기능 추가 후) */}
                          {/*
                          <GlassCard className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm text-white/50">선택월 발주금액</p>
                              <div className="w-9 h-9 bg-purple-500/30 rounded-xl flex items-center justify-center">
                                <Package className="w-4 h-4 text-purple-400" />
                              </div>
                            </div>
                            <p className="text-xl lg:text-2xl font-bold text-white mb-2">
                              {formatCurrency(stats.currentPurchase)}
                            </p>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-white/40">전월</span>
                                {stats.purchaseChange !== null ? (
                                  <span className={stats.purchaseChange >= 0 ? 'text-red-400' : 'text-green-400'}>
                                    {stats.purchaseChange >= 0 ? '▲' : '▼'} {Math.abs(stats.purchaseChange)}%
                                  </span>
                                ) : (
                                  <span className="text-white/30">-</span>
                                )}
                              </div>
                            </div>
                          </GlassCard>
                          */}

                          {/* 카드 4: 일 평균 매출 */}
                          <GlassCard className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm text-white/50">일 평균 매출</p>
                              <div className="w-9 h-9 bg-blue-500/30 rounded-xl flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-cyan-400" />
                              </div>
                            </div>
                            <p className="text-xl lg:text-2xl font-bold text-white mb-2">
                              {formatCurrency(stats.avgDaily)}
                            </p>
                            <div className="text-xs text-white/40">
                              {stats.uniqueDays}일 기준
                            </div>
                          </GlassCard>

                          {/* 카드 5: 평균 객단가 */}
                          <GlassCard className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm text-white/50">평균 객단가</p>
                              <div className="w-9 h-9 bg-amber-500/30 rounded-xl flex items-center justify-center">
                                <Target className="w-4 h-4 text-amber-400" />
                              </div>
                            </div>
                            <p className="text-xl lg:text-2xl font-bold text-white mb-2">
                              {formatCurrency(stats.avgTransaction)}
                            </p>
                            <div className="text-xs text-white/40">
                              {stats.transactionCount.toLocaleString()}건 기준
                            </div>
                          </GlassCard>
                        </div>
                      );
                    })()}

                    {/* 하이라이트 카드 (선택월 기준) */}
                    {(() => {
                      const ma = getMonthlyAnalysis();
                      if (!ma) return null;
                      return (
                        <div className="grid sm:grid-cols-3 gap-4">
                          {[
                            { emoji: '🏆', title: '최고 매출일', main: ma.bestDate.date, sub: formatCurrency(ma.bestDate.total), gradient: 'from-amber-500 to-orange-600' },
                            { emoji: '📅', title: '최고 요일', main: `${ma.bestDay.day}요일`, sub: `평균 ${formatCurrency(ma.bestDay.average)}`, gradient: 'from-blue-500 to-indigo-600' },
                            { emoji: '⏰', title: '피크 타임', main: `${ma.peakHour.hour}시`, sub: `총 ${formatCurrency(ma.peakHour.total)}`, gradient: 'from-cyan-500 to-blue-600' },
                          ].map((item, i) => (
                            <div key={i} className={`bg-gradient-to-br ${item.gradient} rounded-2xl p-5 text-white shadow-lg`}>
                              <p className="text-white/70 text-sm mb-1">{item.emoji} {item.title}</p>
                              <p className="text-3xl font-bold">{item.main}</p>
                              <p className="text-white/70">{item.sub}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    <GlassCard className="p-5" hover={false}>
                      <h3 className="font-bold text-white text-lg mb-4">일별 매출 추이</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={getMonthlyAnalysis()?.dailyData || []}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} stroke="rgba(255,255,255,0.2)" />
                          <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} stroke="rgba(255,255,255,0.2)" />
                          <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white' }} labelStyle={{ color: 'white' }} />
                          <Area type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2} fill="url(#colorTotal)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </GlassCard>

                    {/* ============================================ */}
                    {/* v2에서 복구: 내 매출 vs 평균 비교 + AI 매출 분석 조언 */}
                    {/* ============================================ */}
                  </div>
                )}

                {/* 날짜별 */}
                {activeTab === 'daily' && (() => {
                  const monthAnalysis = getMonthlyAnalysis();
                  if (!monthAnalysis) return (
                    <GlassCard className="p-5 text-center" hover={false}>
                      <p className="text-white/50 py-10">선택한 월에 매출 데이터가 없습니다.</p>
                    </GlassCard>
                  );
                  return (
                    <GlassCard className="p-5" hover={false}>
                      <h3 className="font-bold text-white text-lg mb-4">날짜별 매출</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={monthAnalysis.dailyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} angle={-45} textAnchor="end" height={80} stroke="rgba(255,255,255,0.2)" />
                          <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} stroke="rgba(255,255,255,0.2)" />
                          <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                          <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </GlassCard>
                  );
                })()}

                {/* 요일별 */}
                {activeTab === 'weekday' && (() => {
                  const monthAnalysis = getMonthlyAnalysis();
                  if (!monthAnalysis) return (
                    <GlassCard className="p-5 text-center" hover={false}>
                      <p className="text-white/50 py-10">선택한 월에 매출 데이터가 없습니다.</p>
                    </GlassCard>
                  );
                  return (
                    <div className="space-y-6">
                      <GlassCard className="p-5" hover={false}>
                        <h3 className="font-bold text-white text-lg mb-4">요일별 평균 매출</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={monthAnalysis.byDayOfWeek}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="day" tick={{ fontSize: 14, fill: 'rgba(255,255,255,0.7)' }} stroke="rgba(255,255,255,0.2)" />
                            <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} stroke="rgba(255,255,255,0.2)" />
                            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 12 }} />
                            <Bar dataKey="average" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                              {monthAnalysis.byDayOfWeek.map((entry, i) => (
                                <Cell key={i} fill={entry.day === monthAnalysis.bestDay.day ? '#f59e0b' : '#06b6d4'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </GlassCard>

                      <div className="grid grid-cols-7 gap-2">
                        {monthAnalysis.byDayOfWeek.map((d, i) => (
                          <GlassCard key={i} className={`p-3 text-center ${d.day === monthAnalysis.bestDay.day ? 'ring-2 ring-amber-400 bg-amber-500/20' : ''}`}>
                            <div className="font-bold text-white">{d.day}</div>
                            <div className="text-lg font-bold text-cyan-400">{formatShort(d.average)}</div>
                            <div className="text-xs text-white/50">{d.count}건</div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 시간대별 */}
                {activeTab === 'hourly' && (() => {
                  const monthAnalysis = getMonthlyAnalysis();
                  if (!monthAnalysis) return (
                    <GlassCard className="p-5 text-center" hover={false}>
                      <p className="text-white/50 py-10">선택한 월에 매출 데이터가 없습니다.</p>
                    </GlassCard>
                  );
                  return (
                    <div className="space-y-6">
                      <GlassCard className="p-5" hover={false}>
                        <h3 className="font-bold text-white text-lg mb-4">시간대별 매출</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={monthAnalysis.byHour}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} stroke="rgba(255,255,255,0.2)" />
                            <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} stroke="rgba(255,255,255,0.2)" />
                            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 12 }} />
                            <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                              {monthAnalysis.byHour.map((entry, i) => (
                                <Cell key={i} fill={entry.hour === monthAnalysis.peakHour.hour ? '#f59e0b' : '#0ea5e9'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </GlassCard>

                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white text-center shadow-lg">
                        <p className="text-amber-100 mb-1">🔥 피크 타임</p>
                        <p className="text-5xl font-black">{monthAnalysis.peakHour.hour}시</p>
                        <p className="text-amber-100 mt-1">총 {formatCurrency(monthAnalysis.peakHour.total)} · {monthAnalysis.peakHour.count}건</p>
                      </div>
                    </div>
                  );
                })()}

                {/* 상품별 */}
                {activeTab === 'products' && (() => {
                  const monthAnalysis = getMonthlyAnalysis();
                  if (!monthAnalysis) return (
                    <GlassCard className="p-5 text-center" hover={false}>
                      <p className="text-white/50 py-10">선택한 월에 매출 데이터가 없습니다.</p>
                    </GlassCard>
                  );
                  return (
                    <div className="space-y-6">
                      <GlassCard className="p-5" hover={false}>
                        <h3 className="font-bold text-white text-lg mb-4">베스트 상품 TOP 10</h3>
                        <div className="grid lg:grid-cols-2 gap-6">
                          <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                              <Pie data={monthAnalysis.productData} dataKey="total" nameKey="product" cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {monthAnalysis.productData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                              </Pie>
                              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 12 }} />
                            </PieChart>
                          </ResponsiveContainer>

                          <div className="space-y-2">
                            {monthAnalysis.productData.map((p, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                                  {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white truncate">{p.product}</p>
                                  <p className="text-xs text-white/50">{p.count}건</p>
                                </div>
                                <p className="font-bold text-white">{formatCurrency(p.total)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </GlassCard>

                      {/* 배너 2 - 대시보드 (PC/모바일 분리) */}
                      {(siteSettings.banner2PcImage || siteSettings.banner2MobileImage) && (
                        <div className="mt-2">
                          {/* PC 배너 */}
                          {siteSettings.banner2PcImage && (
                            <a href={siteSettings.banner2PcLink || '#'} target="_blank" rel="noopener noreferrer" className="hidden md:block">
                              <img src={siteSettings.banner2PcImage} alt="광고" className="w-full object-contain rounded-2xl hover:opacity-90 transition-opacity" style={{ maxHeight: '90px' }} />
                            </a>
                          )}
                          {/* 모바일 배너 */}
                          {siteSettings.banner2MobileImage && (
                            <a href={siteSettings.banner2MobileLink || '#'} target="_blank" rel="noopener noreferrer" className="block md:hidden">
                              <img src={siteSettings.banner2MobileImage} alt="광고" className="w-full object-contain rounded-2xl hover:opacity-90 transition-opacity" style={{ maxHeight: '100px' }} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
