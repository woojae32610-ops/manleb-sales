// src/constants/index.js

// 차트 색상
export const CHART_COLORS = [
  '#3b82f6', '#06b6d4', '#0ea5e9', '#10b981',
  '#f59e0b', '#8b5cf6', '#ec4899'
];

// 요일
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 업종 목록
export const BUSINESS_TYPES = [
  '음식·외식·배달',
  '카페·제과·디저트',
  '호프·주점·포차',
  '스마트스토어·쇼핑몰',
  '미용·뷰티·네일',
  '스터디·학원·교육',
  '애견샵·반려동물',
  '숙박업·펜션·모텔',
  '레저·오락·스크린',
  '헬스장·레슨샵',
  '제조업·유통업',
  '스타트업·1인기업',
  '노점·푸드트럭',
  '해외장사·사업',
  '전문서비스·기술창업'
];

// 지역 목록
export const REGIONS = [
  '서울', '경기', '인천', '부산', '대구',
  '광주', '대전', '울산', '세종', '강원',
  '충북', '충남', '전북', '전남', '경북',
  '경남', '제주'
];

// 초기 관리자 계정 (실제 운영 시 환경변수로 관리)
export const INITIAL_ADMIN = {
  id: 'admin',
  password: 'admin123',  // 실제 운영 시 변경 필요
  role: 'super',
  name: '최고관리자'
};

// 기본 사이트 설정
export const DEFAULT_SITE_SETTINGS = {
  subtitle: 'POS 데이터로 우리 가게 인사이트 발견하기',
  adContact: '',
  banner1PcImage: '',
  banner1PcLink: '',
  banner1MobileImage: '',
  banner1MobileLink: '',
  banner2PcImage: '',
  banner2PcLink: '',
  banner2MobileImage: '',
  banner2MobileLink: ''
};
