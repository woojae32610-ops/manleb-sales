// src/App.jsx
import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { GlassCard, AnimatedBackground, ConfirmModal, Banner } from './components/ui';
import { REGIONS, BUSINESS_TYPES, CHART_COLORS } from './constants';
import { formatCurrency, formatShort, downloadSampleExcel, downloadStatsExcel } from './utils';

// Recharts
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Lucide Icons
import {
  Calendar, Clock, TrendingUp, DollarSign, FileSpreadsheet, LogOut,
  Upload, Play, MapPin, Store, User, BarChart3, Coffee, Target, Award,
  Sparkles, Plus, Trash2, Database, FileText, Download, AlertCircle,
  Check, X, ChevronDown, Power, Shield, Users, Image, Edit3, Ban,
  Settings, UserPlus, Key
} from 'lucide-react';

// ============ 메인 앱 컴포넌트 ============
function AppContent() {
  const {
    // 사이트 설정
    siteSettings, setSiteSettings,
    // 관리자
    admins, adminUser, adminLogin, adminLogout,
    addSubAdmin, deleteAdmin, changeAdminPassword,
    // 회원
    members, toggleMemberBlock,
    getRegionStats, getBusinessStats, getTotalSalesStats,
    // 사용자
    user, profile, setProfile, showProfileSetup,
    naverLogin, completeProfile, logout,
    // 매장
    stores, selectedStoreId, setSelectedStoreId, selectedStore,
    addStore, deleteStore, updateStoreName,
    // 파일/데이터
    parseExcelFile, deleteFile, loadDemoData, clearStoreData,
    // 모달
    confirmModal, showConfirm, hideConfirm,
  } = useApp();

  // 로컬 상태
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const [adminView, setAdminView] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoginForm, setAdminLoginForm] = useState({ id: '', password: '' });
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [editingStoreName, setEditingStoreName] = useState('');
  const [newAdmin, setNewAdmin] = useState({ id: '', password: '', name: '' });
  const [passwordForm, setPasswordForm] = useState({ adminId: '', newPassword: '' });
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ========== 핸들러 함수들 ==========
  const handleAdminLogin = () => {
    if (adminLogin(adminLoginForm.id, adminLoginForm.password)) {
      setShowAdminLogin(false);
      setAdminLoginForm({ id: '', password: '' });
    } else {
      showConfirm('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.', null);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 500);
  };

  const handleAddSubAdmin = () => {
    if (!newAdmin.id || !newAdmin.password || !newAdmin.name) {
      showConfirm('입력 오류', '모든 필드를 입력해주세요.', null);
      return;
    }
    const result = addSubAdmin(newAdmin);
    if (result.success) {
      setNewAdmin({ id: '', password: '', name: '' });
      showConfirm('추가 완료', '부관리자가 추가되었습니다.', null);
    } else {
      showConfirm('추가 실패', result.message, null);
    }
  };

  const handleChangePassword = () => {
    if (!passwordForm.adminId || !passwordForm.newPassword) {
      showConfirm('입력 오류', '관리자와 새 비밀번호를 입력해주세요.', null);
      return;
    }
    changeAdminPassword(passwordForm.adminId, passwordForm.newPassword);
    setPasswordForm({ adminId: '', newPassword: '' });
    showConfirm('변경 완료', '비밀번호가 변경되었습니다.', null);
  };

  const handleDeleteAdmin = (adminId) => {
    const result = deleteAdmin(adminId);
    if (!result.success) {
      showConfirm('삭제 불가', result.message, null);
    }
  };

  const handleAddStore = () => {
    if (!newStoreName.trim()) return;
    addStore(newStoreName);
    setNewStoreName('');
    setShowAddStore(false);
  };

  const handleDeleteStore = (storeId) => {
    showConfirm('매장 삭제', '매장을 삭제하시겠습니까?\n해당 매장의 모든 데이터가 삭제됩니다.', () => {
      const result = deleteStore(storeId);
      if (!result.success) {
        showConfirm('삭제 불가', result.message, null);
      }
    });
  };

  const startEditStore = (store) => {
    setEditingStoreId(store.id);
    setEditingStoreName(store.name);
  };

  const saveStoreName = () => {
    if (!editingStoreName.trim()) return;
    updateStoreName(editingStoreId, editingStoreName);
    setEditingStoreId(null);
    setEditingStoreName('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const result = await parseExcelFile(file);
      if (!result.success) {
        showConfirm('업로드 실패', result.message, null);
      }
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const result = await parseExcelFile(file);
      if (!result.success) {
        showConfirm('업로드 실패', result.message, null);
      }
    }
  };

  const handleDeleteFile = (fileId) => {
    showConfirm('파일 삭제', '파일을 삭제하시겠습니까?\n해당 파일의 매출 데이터도 함께 삭제됩니다.', () => {
      deleteFile(fileId);
    });
  };

  const handleClearData = () => {
    showConfirm('전체 초기화', '전체 데이터를 초기화하시겠습니까?\n모든 파일과 매출 데이터가 삭제됩니다.', () => {
      clearStoreData();
    });
  };

  const downloadUploadedFile = (file) => {
    if (!selectedStore?.salesData) return;
    const data = [
      ['결제일', '결제시간', '상품명', '총결제금액'],
      ...selectedStore.salesData.map(d => [d.dateStr, `${d.hour}:00`, d.product, d.amount])
    ];
    downloadStatsExcel(data, file.name.replace('.xlsx', ''), '매출데이터');
  };

  const downloadRegionStats = () => {
    const stats = getRegionStats();
    const data = [
      ['지역', '회원수', '평균 총매출', '평균 일매출'],
      ...stats.map(s => [s.region, s.count, s.avgTotalSales, s.avgDailySales])
    ];
    downloadStatsExcel(data, '지역별_회원매출현황', '지역별통계');
  };

  const downloadBusinessStats = () => {
    const stats = getBusinessStats();
    const data = [
      ['업종', '회원수', '평균 총매출', '평균 일매출'],
      ...stats.map(s => [s.type, s.count, s.avgTotalSales, s.avgDailySales])
    ];
    downloadStatsExcel(data, '업종별_회원매출현황', '업종별통계');
  };

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
    downloadStatsExcel(data, '전체회원목록', '회원목록');
  };

  const handleBannerUpload = (e, bannerKey) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showConfirm('업로드 실패', '파일 크기는 2MB 이하로 업로드해주세요.', null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSiteSettings({ ...siteSettings, [bannerKey]: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // ========== 확인 모달 렌더링 ==========
  const renderConfirmModal = () => (
    <ConfirmModal
      show={confirmModal.show}
      title={confirmModal.title}
      message={confirmModal.message}
      onConfirm={confirmModal.onConfirm ? () => { confirmModal.onConfirm(); hideConfirm(); } : null}
      onCancel={hideConfirm}
    />
  );

  // ========== 관리자 페이지 ==========
  if (adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
        <AnimatedBackground />
        {renderConfirmModal()}

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
              <button onClick={adminLogout} className="p-2 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300 transition-all">
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

          {/* 관리자 대시보드 */}
          {adminView === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-white/50 text-sm">마지막 업데이트: {lastRefresh.toLocaleTimeString()}</div>
                <button onClick={handleRefresh} disabled={isRefreshing}
                  className={`flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl font-medium hover:bg-cyan-500/30 transition-all border border-cyan-500/30 ${isRefreshing ? 'opacity-50' : ''}`}>
                  {isRefreshing ? '새로고침 중...' : '새로고침'}
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-5"><p className="text-white/50 text-sm mb-1">총 회원수</p><p className="text-3xl font-bold text-white">{members.length}명</p></GlassCard>
                <GlassCard className="p-5"><p className="text-white/50 text-sm mb-1">차단 회원</p><p className="text-3xl font-bold text-red-400">{members.filter(m => m.blocked).length}명</p></GlassCard>
                <GlassCard className="p-5"><p className="text-white/50 text-sm mb-1">전체 총매출</p><p className="text-2xl font-bold text-cyan-400">{(getTotalSalesStats().totalSales / 100000000).toFixed(1)}억</p></GlassCard>
                <GlassCard className="p-5"><p className="text-white/50 text-sm mb-1">회원 평균 일매출</p><p className="text-2xl font-bold text-green-400">{(getTotalSalesStats().avgDailySales / 10000).toFixed(0)}만원</p></GlassCard>
              </div>

              {/* 지역별/업종별 통계 */}
              <div className="grid lg:grid-cols-2 gap-6">
                <GlassCard className="p-6" hover={false}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">지역별 회원 현황</h3>
                    <button onClick={downloadRegionStats} className="text-cyan-400 text-sm hover:underline">엑셀 다운로드</button>
                  </div>
                  <div className="space-y-2">
                    {getRegionStats().slice(0, 5).map((s, i) => (
                      <div key={s.region} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">{i + 1}. {s.region}</span>
                        <span className="text-cyan-400 font-bold">{s.count}명</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-6" hover={false}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">업종별 회원 현황</h3>
                    <button onClick={downloadBusinessStats} className="text-cyan-400 text-sm hover:underline">엑셀 다운로드</button>
                  </div>
                  <div className="space-y-2">
                    {getBusinessStats().slice(0, 5).map((s, i) => (
                      <div key={s.type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white text-sm">{i + 1}. {s.type}</span>
                        <span className="text-cyan-400 font-bold">{s.count}명</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* 회원 관리 */}
          {adminView === 'members' && (
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">회원 목록</h3>
                <button onClick={downloadAllMembers} className="text-cyan-400 text-sm hover:underline">전체 다운로드</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/50 border-b border-white/10">
                      <th className="text-left p-3">이름</th>
                      <th className="text-left p-3">지역</th>
                      <th className="text-left p-3">업종</th>
                      <th className="text-right p-3">총매출</th>
                      <th className="text-center p-3">상태</th>
                      <th className="text-center p-3">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 text-white">{m.name}</td>
                        <td className="p-3 text-white/70">{m.region}</td>
                        <td className="p-3 text-white/70 text-xs">{m.businessType}</td>
                        <td className="p-3 text-cyan-400 text-right">{formatShort(m.totalSales)}원</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${m.blocked ? 'bg-red-500/30 text-red-400' : 'bg-green-500/30 text-green-400'}`}>
                            {m.blocked ? '차단' : '정상'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => toggleMemberBlock(m.id)}
                            className={`px-3 py-1 rounded text-xs ${m.blocked ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {m.blocked ? '해제' : '차단'}
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
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-lg font-bold text-white mb-4">부관리자 추가</h3>
                <div className="flex flex-wrap gap-3">
                  <input type="text" placeholder="아이디" value={newAdmin.id}
                    onChange={(e) => setNewAdmin({ ...newAdmin, id: e.target.value })}
                    className="flex-1 min-w-[150px] px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" />
                  <input type="password" placeholder="비밀번호" value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="flex-1 min-w-[150px] px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" />
                  <input type="text" placeholder="이름" value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="flex-1 min-w-[150px] px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40" />
                  <button onClick={handleAddSubAdmin}
                    className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600">
                    추가
                  </button>
                </div>
              </GlassCard>

              <GlassCard className="p-6" hover={false}>
                <h3 className="text-lg font-bold text-white mb-4">관리자 목록</h3>
                <div className="space-y-2">
                  {admins.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <span className="text-white font-medium">{a.name}</span>
                        <span className="text-white/50 text-sm ml-2">({a.id})</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded ${a.role === 'super' ? 'bg-red-500/30 text-red-300' : 'bg-blue-500/30 text-blue-300'}`}>
                          {a.role === 'super' ? '최고관리자' : '부관리자'}
                        </span>
                      </div>
                      {a.role !== 'super' && (
                        <button onClick={() => handleDeleteAdmin(a.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
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
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-bold text-white mb-6">배너 관리</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {['1', '2'].map(num => (
                  <div key={num} className="space-y-4 p-4 bg-white/5 rounded-xl">
                    <h4 className="font-bold text-white">배너 {num}</h4>

                    <div>
                      <label className="text-white/70 text-sm block mb-2">PC 이미지</label>
                      <input type="file" accept="image/*" onChange={(e) => handleBannerUpload(e, `banner${num}PcImage`)}
                        className="w-full text-white/70 text-sm" />
                      {siteSettings[`banner${num}PcImage`] && (
                        <img src={siteSettings[`banner${num}PcImage`]} alt="" className="mt-2 max-h-20 rounded" />
                      )}
                    </div>

                    <div>
                      <label className="text-white/70 text-sm block mb-2">PC 링크</label>
                      <input type="text" placeholder="https://"
                        value={siteSettings[`banner${num}PcLink`] || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, [`banner${num}PcLink`]: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" />
                    </div>

                    <div>
                      <label className="text-white/70 text-sm block mb-2">모바일 이미지</label>
                      <input type="file" accept="image/*" onChange={(e) => handleBannerUpload(e, `banner${num}MobileImage`)}
                        className="w-full text-white/70 text-sm" />
                      {siteSettings[`banner${num}MobileImage`] && (
                        <img src={siteSettings[`banner${num}MobileImage`]} alt="" className="mt-2 max-h-20 rounded" />
                      )}
                    </div>

                    <div>
                      <label className="text-white/70 text-sm block mb-2">모바일 링크</label>
                      <input type="text" placeholder="https://"
                        value={siteSettings[`banner${num}MobileLink`] || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, [`banner${num}MobileLink`]: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* 사이트 설정 */}
          {adminView === 'settings' && (
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-bold text-white mb-6">사이트 설정</h3>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="text-white/70 text-sm block mb-2">서브타이틀</label>
                  <input type="text" value={siteSettings.subtitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, subtitle: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
                </div>
                <div>
                  <label className="text-white/70 text-sm block mb-2">광고 문의 텍스트</label>
                  <input type="text" value={siteSettings.adContact}
                    onChange={(e) => setSiteSettings({ ...siteSettings, adContact: e.target.value })}
                    placeholder="예: 광고 문의: ad@manleb.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30" />
                </div>
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
        {renderConfirmModal()}

        <header className="relative z-10 p-6 lg:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <span className="text-white font-bold text-2xl lg:text-3xl">만렙사장</span>
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>

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
                    className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all">취소</button>
                  <button onClick={handleAdminLogin}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all">로그인</button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-lg lg:max-w-xl">
            <div className="text-center mb-10 lg:mb-14">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight text-white">
                매출 분석의<br />새로운 기준
              </h1>
              <p className="text-white/70 text-xl lg:text-2xl">{siteSettings.subtitle}</p>
            </div>

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

              <button onClick={naverLogin}
                className="w-full py-5 px-8 rounded-2xl bg-white hover:bg-gray-50 font-bold text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                style={{ color: '#03C75A' }}>
                <span className="text-2xl font-black">N</span>
                <span>네이버로 시작하기</span>
              </button>

              <p className="text-center text-white/50 text-base mt-5">만렙사장 카페 회원 전용</p>

              {/* 배너 1 */}
              {(siteSettings.adContact || siteSettings.banner1PcImage || siteSettings.banner1MobileImage) && (
                <div className="mt-8 pt-6 border-t border-white/20">
                  {siteSettings.adContact && (
                    <div className="text-center text-white/40 text-sm mb-3">{siteSettings.adContact}</div>
                  )}
                  <Banner
                    pcImage={siteSettings.banner1PcImage}
                    pcLink={siteSettings.banner1PcLink}
                    mobileImage={siteSettings.banner1MobileImage}
                    mobileLink={siteSettings.banner1MobileLink}
                  />
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
        {renderConfirmModal()}

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

              <button onClick={completeProfile}
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
      {renderConfirmModal()}

      <header className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white hidden sm:block">만렙사장</span>
          </div>

          <div className="flex gap-1 bg-white/10 p-1 rounded-xl backdrop-blur">
            <button onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'dashboard' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow' : 'text-white/70 hover:text-white'}`}>
              대시보드
            </button>
            <button onClick={() => setCurrentView('mydata')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'mydata' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow' : 'text-white/70 hover:text-white'}`}>
              내 데이터
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-white text-sm">{user.name}</div>
              <div className="text-xs text-white/60">{profile.region} · {profile.businessType}</div>
            </div>
            <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 매장 선택바 */}
        <GlassCard className="p-4 mb-6" hover={false}>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <span className="text-white/60 text-sm font-medium whitespace-nowrap">매장:</span>

            {stores.map(store => (
              editingStoreId === store.id ? (
                <div key={store.id} className="flex items-center gap-2">
                  <input type="text" value={editingStoreName} onChange={(e) => setEditingStoreName(e.target.value)}
                    autoFocus className="px-3 py-2 bg-white/10 border border-cyan-400 rounded-lg text-sm text-white w-32 focus:outline-none" />
                  <button onClick={saveStoreName} className="p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingStoreId(null)} className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30"><X className="w-4 h-4" /></button>
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
                        <X className="w-4 h-4 hover:text-red-300" onClick={(e) => { e.stopPropagation(); handleDeleteStore(store.id); }} />
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
                <button onClick={handleAddStore} className="p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"><Check className="w-4 h-4" /></button>
                <button onClick={() => { setShowAddStore(false); setNewStoreName(''); }} className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setShowAddStore(true)}
                className="flex items-center gap-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-medium hover:bg-cyan-500/30 transition-all border border-cyan-500/30">
                <Plus className="w-4 h-4" /> 매장 추가
              </button>
            )}
          </div>
        </GlassCard>

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
                        <button onClick={() => downloadUploadedFile(file)} className="p-2 text-white/40 hover:text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all" title="다운로드">
                          <Download className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteFile(file.id)} className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all" title="삭제">
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
                    <button onClick={handleClearData} className="px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-xl font-medium transition-all">
                      전체 초기화
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* 대시보드 뷰 */}
        {currentView === 'dashboard' && (
          <>
            {!selectedStore?.analysis ? (
              <div className="space-y-6">
                <GlassCard hover={false}>
                  <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="p-12 lg:p-16 text-center cursor-pointer">
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" id="file-upload" />
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
              /* 분석 결과 표시 */
              <div className="space-y-6">
                {/* 요약 카드 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <GlassCard className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-cyan-400" />
                      <span className="text-white/60 text-sm">총 매출</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(selectedStore.analysis.totalSales)}</p>
                  </GlassCard>
                  <GlassCard className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-white/60 text-sm">일 평균 매출</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(selectedStore.analysis.avgDaily)}</p>
                  </GlassCard>
                  <GlassCard className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-amber-400" />
                      <span className="text-white/60 text-sm">피크 타임</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedStore.analysis.peakHour.label}</p>
                  </GlassCard>
                  <GlassCard className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <span className="text-white/60 text-sm">베스트 요일</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{selectedStore.analysis.bestDay.day}요일</p>
                  </GlassCard>
                </div>

                {/* 탭 메뉴 */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { id: 'overview', label: '개요' },
                    { id: 'daily', label: '날짜별' },
                    { id: 'weekday', label: '요일별' },
                    { id: 'hourly', label: '시간대별' },
                    { id: 'product', label: '상품별' },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 차트 영역 */}
                <GlassCard className="p-6" hover={false}>
                  {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">요일별 매출</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={selectedStore.analysis.byDayOfWeek}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis dataKey="day" stroke="#ffffff60" />
                            <YAxis stroke="#ffffff60" tickFormatter={(v) => formatShort(v)} />
                            <Tooltip
                              contentStyle={{ background: '#1e293b', border: '1px solid #ffffff30', borderRadius: '12px' }}
                              labelStyle={{ color: '#fff' }}
                              formatter={(value) => [formatCurrency(value), '매출']}
                            />
                            <Bar dataKey="average" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">상품별 매출 TOP 5</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={selectedStore.analysis.productData.slice(0, 5)}
                              dataKey="total"
                              nameKey="product"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ product, percent }) => `${product} ${(percent * 100).toFixed(0)}%`}
                            >
                              {selectedStore.analysis.productData.slice(0, 5).map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: '#1e293b', border: '1px solid #ffffff30', borderRadius: '12px' }}
                              formatter={(value) => [formatCurrency(value), '매출']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {activeTab === 'daily' && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">날짜별 매출 추이</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={selectedStore.analysis.dailyData}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="date" stroke="#ffffff60" />
                          <YAxis stroke="#ffffff60" tickFormatter={(v) => formatShort(v)} />
                          <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid #ffffff30', borderRadius: '12px' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value) => [formatCurrency(value), '매출']}
                          />
                          <Area type="monotone" dataKey="total" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {activeTab === 'weekday' && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">요일별 평균 매출</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={selectedStore.analysis.byDayOfWeek}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="day" stroke="#ffffff60" />
                          <YAxis stroke="#ffffff60" tickFormatter={(v) => formatShort(v)} />
                          <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid #ffffff30', borderRadius: '12px' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value) => [formatCurrency(value), '평균 매출']}
                          />
                          <Bar dataKey="average" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {activeTab === 'hourly' && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">시간대별 매출</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={selectedStore.analysis.byHour}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="label" stroke="#ffffff60" />
                          <YAxis stroke="#ffffff60" tickFormatter={(v) => formatShort(v)} />
                          <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid #ffffff30', borderRadius: '12px' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value) => [formatCurrency(value), '매출']}
                          />
                          <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {activeTab === 'product' && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">상품별 매출 TOP 10</h3>
                      <div className="space-y-3">
                        {selectedStore.analysis.productData.map((p, i) => (
                          <div key={p.product} className="flex items-center gap-4">
                            <span className="text-white/50 w-6">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-white font-medium">{p.product}</span>
                                <span className="text-cyan-400">{formatCurrency(p.total)}</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${(p.total / selectedStore.analysis.productData[0].total) * 100}%`,
                                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length]
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-white/50 text-sm w-16 text-right">{p.count}건</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============ 앱 래퍼 ============
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
