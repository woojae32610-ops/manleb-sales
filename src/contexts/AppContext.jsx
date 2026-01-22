// src/contexts/AppContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  INITIAL_ADMIN,
  DEFAULT_SITE_SETTINGS
} from '../constants';
import {
  generateFileHash,
  processExcelData,
  analyzeData,
  generateSampleData
} from '../utils';

// ============ Context 생성 ============
const AppContext = createContext(null);

// ============ 샘플 회원 데이터 ============
const SAMPLE_MEMBERS = [
  { id: 'user1', name: '김사장', email: 'kim@naver.com', region: '서울', businessType: '카페·제과·디저트', ip: '192.168.1.101', lastLogin: new Date('2025-01-22'), blocked: false, totalSales: 15420000, avgDailySales: 514000 },
  { id: 'user2', name: '이사장', email: 'lee@naver.com', region: '경기', businessType: '음식·외식·배달', ip: '192.168.1.102', lastLogin: new Date('2025-01-21'), blocked: false, totalSales: 28350000, avgDailySales: 945000 },
  { id: 'user3', name: '박사장', email: 'park@naver.com', region: '부산', businessType: '호프·주점·포차', ip: '192.168.1.103', lastLogin: new Date('2025-01-20'), blocked: true, totalSales: 12800000, avgDailySales: 426667 },
  { id: 'user4', name: '최사장', email: 'choi@naver.com', region: '서울', businessType: '카페·제과·디저트', ip: '192.168.1.104', lastLogin: new Date('2025-01-23'), blocked: false, totalSales: 18900000, avgDailySales: 630000 },
  { id: 'user5', name: '정사장', email: 'jung@naver.com', region: '대구', businessType: '미용·뷰티·네일', ip: '192.168.1.105', lastLogin: new Date('2025-01-19'), blocked: false, totalSales: 9500000, avgDailySales: 316667 },
];

// ============ Provider 컴포넌트 ============
export const AppProvider = ({ children }) => {
  // 사이트 설정
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  // 관리자 관련
  const [admins, setAdmins] = useState([{ ...INITIAL_ADMIN, createdAt: new Date() }]);
  const [members, setMembers] = useState(SAMPLE_MEMBERS);
  const [adminUser, setAdminUser] = useState(null);

  // 일반 사용자 관련
  const [user, setUser] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profile, setProfile] = useState({ region: '', businessType: '' });

  // 매장 관련
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  // 모달 상태
  const [confirmModal, setConfirmModal] = useState({
    show: false, title: '', message: '', onConfirm: null
  });

  // ========== 모달 함수 ==========
  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  const hideConfirm = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  };

  // ========== 관리자 함수 ==========
  const adminLogin = (id, password) => {
    const admin = admins.find(a => a.id === id && a.password === password);
    if (admin) {
      setAdminUser(admin);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setAdminUser(null);
  };

  const addSubAdmin = (newAdmin) => {
    if (admins.find(a => a.id === newAdmin.id)) {
      return { success: false, message: '이미 존재하는 아이디입니다.' };
    }
    setAdmins([...admins, { ...newAdmin, role: 'sub', createdAt: new Date() }]);
    return { success: true };
  };

  const deleteAdmin = (adminId) => {
    if (adminId === 'admin') {
      return { success: false, message: '최고관리자는 삭제할 수 없습니다.' };
    }
    setAdmins(admins.filter(a => a.id !== adminId));
    return { success: true };
  };

  const changeAdminPassword = (adminId, newPassword) => {
    setAdmins(admins.map(a =>
      a.id === adminId ? { ...a, password: newPassword } : a
    ));
  };

  const toggleMemberBlock = (memberId) => {
    setMembers(members.map(m =>
      m.id === memberId ? { ...m, blocked: !m.blocked } : m
    ));
  };

  // ========== 사용자 함수 ==========
  const naverLogin = () => {
    // 실제 구현 시 네이버 OAuth로 대체
    setUser({ id: 'naver_12345', name: '사장님', email: 'example@naver.com' });
    setShowProfileSetup(true);
  };

  const completeProfile = () => {
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

  const logout = () => {
    setUser(null);
    setProfile({ region: '', businessType: '' });
    setStores([]);
    setSelectedStoreId(null);
  };

  // ========== 매장 함수 ==========
  const addStore = (name) => {
    const newStore = {
      id: Date.now(),
      name: name.trim(),
      files: [],
      salesData: null,
      analysis: null,
      createdAt: new Date()
    };
    setStores([...stores, newStore]);
    setSelectedStoreId(newStore.id);
  };

  const deleteStore = (storeId) => {
    if (stores.length <= 1) {
      return { success: false, message: '최소 1개의 매장이 필요합니다.' };
    }
    const newStores = stores.filter(s => s.id !== storeId);
    setStores(newStores);
    if (selectedStoreId === storeId) {
      setSelectedStoreId(newStores[0]?.id);
    }
    return { success: true };
  };

  const updateStoreName = (storeId, newName) => {
    setStores(stores.map(s =>
      s.id === storeId ? { ...s, name: newName.trim() } : s
    ));
  };

  // ========== 파일/데이터 함수 ==========
  const parseExcelFile = useCallback((file) => {
    return new Promise((resolve) => {
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
          resolve({ success: false, message: '이미 업로드된 파일입니다!' });
          return;
        }

        const processed = processExcelData(jsonData);
        if (processed.length === 0) {
          resolve({ success: false, message: '유효한 데이터가 없습니다. 엑셀 형식을 확인해주세요.' });
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

        resolve({ success: true });
      };
      reader.readAsArrayBuffer(file);
    });
  }, [stores, selectedStoreId]);

  const deleteFile = (fileId) => {
    setStores(stores.map(s => {
      if (s.id !== selectedStoreId) return s;
      const newFiles = s.files.filter(f => f.id !== fileId);
      if (newFiles.length === 0) {
        return { ...s, files: [], salesData: null, analysis: null };
      }
      return { ...s, files: newFiles };
    }));
  };

  const loadDemoData = () => {
    const demoData = generateSampleData();
    setStores(stores.map(s => {
      if (s.id !== selectedStoreId) return s;
      return {
        ...s,
        files: [...s.files, {
          id: Date.now(),
          name: '샘플데이터.xlsx',
          hash: 'demo',
          rowCount: demoData.length,
          uploadedAt: new Date()
        }],
        salesData: demoData,
        analysis: analyzeData(demoData)
      };
    }));
  };

  const clearStoreData = () => {
    setStores(stores.map(s => {
      if (s.id !== selectedStoreId) return s;
      return { ...s, files: [], salesData: null, analysis: null };
    }));
  };

  // ========== 통계 함수 ==========
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

  const getTotalSalesStats = () => {
    const total = members.reduce((sum, m) => sum + (m.totalSales || 0), 0);
    const avgDaily = members.reduce((sum, m) => sum + (m.avgDailySales || 0), 0);
    return {
      totalSales: total,
      avgTotalSales: members.length > 0 ? Math.round(total / members.length) : 0,
      avgDailySales: members.length > 0 ? Math.round(avgDaily / members.length) : 0
    };
  };

  // ========== Context Value ==========
  const value = {
    // 사이트 설정
    siteSettings,
    setSiteSettings,

    // 관리자
    admins,
    adminUser,
    adminLogin,
    adminLogout,
    addSubAdmin,
    deleteAdmin,
    changeAdminPassword,

    // 회원
    members,
    toggleMemberBlock,
    getRegionStats,
    getBusinessStats,
    getTotalSalesStats,

    // 사용자
    user,
    profile,
    setProfile,
    showProfileSetup,
    naverLogin,
    completeProfile,
    logout,

    // 매장
    stores,
    selectedStoreId,
    setSelectedStoreId,
    selectedStore: stores.find(s => s.id === selectedStoreId),
    addStore,
    deleteStore,
    updateStoreName,

    // 파일/데이터
    parseExcelFile,
    deleteFile,
    loadDemoData,
    clearStoreData,

    // 모달
    confirmModal,
    showConfirm,
    hideConfirm,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// ============ Hook ============
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
