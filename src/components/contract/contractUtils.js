/**
 * 계약서 유틸리티 — 추천 로직, 데이터 조립, 스케줄 빌더
 */

// 계약서 타입 상수
export const CONTRACT_TYPES = {
  STANDARD: 'standard',         // 표준 근로계약서
  PART_TIME: 'partTime',        // 단시간 근로계약서
  ULTRA_SHORT: 'ultraShort',    // 초단시간 근로계약서
  DAILY: 'daily',               // 일용직 근로계약서
  FREELANCER: 'freelancer',     // 프리랜서(위임) 계약서
};

export const CONTRACT_TYPE_LABELS = {
  [CONTRACT_TYPES.STANDARD]: '표준 근로계약서',
  [CONTRACT_TYPES.PART_TIME]: '단시간 근로계약서',
  [CONTRACT_TYPES.ULTRA_SHORT]: '초단시간 근로계약서',
  [CONTRACT_TYPES.DAILY]: '일용직 근로계약서',
  [CONTRACT_TYPES.FREELANCER]: '프리랜서 계약서',
};

/**
 * 직원 데이터를 기반으로 적합한 계약서 타입을 추천
 */
export function recommendContractType(employee) {
  if (!employee) return CONTRACT_TYPES.STANDARD;

  // 프리랜서
  if (employee.type === 'freelancer' || employee.taxType === 'withholding') {
    if (employee.type === 'freelancer') return CONTRACT_TYPES.FREELANCER;
  }

  // 일용직
  if (employee.type === 'daily' || employee.taxType === 'daily') {
    return CONTRACT_TYPES.DAILY;
  }

  const weeklyHours = Number(employee.weeklyHours) || 0;

  // 초단시간: 주 15시간 미만
  if (weeklyHours < 15) {
    return CONTRACT_TYPES.ULTRA_SHORT;
  }

  // 단시간: 주 15~35시간 (사업장 통상 근로시간 40h 미만)
  if (weeklyHours < 40 && employee.type === 'hourly') {
    return CONTRACT_TYPES.PART_TIME;
  }

  return CONTRACT_TYPES.STANDARD;
}

/**
 * 전체 추천 목록 (우선순위 배지 포함)
 */
export function getRecommendations(employee) {
  const recommended = recommendContractType(employee);
  const all = Object.entries(CONTRACT_TYPE_LABELS).map(([key, label]) => ({
    type: key,
    label,
    recommended: key === recommended,
  }));
  // 추천 항목을 맨 위로
  all.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
  return all;
}

/**
 * 근로일별 스케줄 테이블 데이터 빌더
 */
export function buildDailyScheduleFromEmployee(employee) {
  const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
  const workDays = employee.workDays || [];
  return WEEKDAY_LABELS.map((label, idx) => ({
    day: label,
    dayIndex: idx,
    isWork: workDays.includes(idx),
    startTime: workDays.includes(idx) ? (employee.defaultStartTime || '09:00') : '',
    endTime: workDays.includes(idx) ? (employee.defaultEndTime || '18:00') : '',
    breakHours: workDays.includes(idx) ? (employee.defaultBreak || 0) : 0,
    hours: workDays.includes(idx) ? (employee.contractDailyHours || 0) : 0,
  }));
}

/**
 * 계약서 데이터를 조립 (계약서 생성에 필요한 모든 필드)
 */
export function assembleContractData({
  contractType,
  employee,
  storeInfo,
  contractDetails,
}) {
  const today = new Date();
  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const schedule = buildDailyScheduleFromEmployee(employee);
  const weeklyHours = Number(employee.weeklyHours) || 0;
  const isEligibleForWeeklyHoliday = weeklyHours >= 15 && employee.type !== 'freelancer' && employee.taxType !== 'daily';

  // 급여 정보
  let wageDescription = '';
  if (employee.type === 'freelancer') {
    wageDescription = `월 보수: ${(employee.monthlyFee || 0).toLocaleString()}원`;
  } else if (employee.taxType === 'daily') {
    wageDescription = `일급: ${(employee.dailyWage || 0).toLocaleString()}원`;
  } else if (employee.type === 'hourly') {
    wageDescription = `시급: ${(employee.hourlyWage || 0).toLocaleString()}원`;
  } else {
    wageDescription = `월급: ${(employee.monthlyWage || 0).toLocaleString()}원`;
  }

  return {
    // 메타
    contractType,
    contractTypeLabel: CONTRACT_TYPE_LABELS[contractType] || '',
    createdAt: formatDate(today),

    // 사업주 정보
    storeName: storeInfo.storeName || '',
    ownerName: storeInfo.ownerName || '',
    businessNumber: storeInfo.businessNumber || '',
    storeAddress: storeInfo.storeAddress || '',
    storePhone: storeInfo.storePhone || '',

    // 근로자 정보
    employeeName: employee.name || '',
    employeeType: employee.type || 'hourly',

    // 계약 조건
    contractStart: formatDate(contractDetails.contractStart),
    contractEnd: formatDate(contractDetails.contractEnd),
    workplace: contractDetails.workplace || storeInfo.storeName || '',
    jobDescription: contractDetails.jobDescription || '',
    payDay: contractDetails.payDay || '매월 10일',
    payMethod: contractDetails.payMethod || '계좌이체',
    restDay: contractDetails.restDay || '일요일',

    // 급여
    wageDescription,
    hourlyWage: employee.hourlyWage || 0,
    monthlyWage: employee.monthlyWage || 0,
    dailyWage: employee.dailyWage || 0,
    monthlyFee: employee.monthlyFee || 0,
    totalFee: employee.totalFee || 0,
    weeklyHours,
    isEligibleForWeeklyHoliday,
    weeklyHolidayPay: employee.weeklyHolidayPay || 0,

    // 스케줄
    schedule,
    workDays: (employee.workDays || []).map(d => ['일', '월', '화', '수', '목', '금', '토'][d]).join(', '),

    // 근로시간
    defaultStartTime: employee.defaultStartTime || '09:00',
    defaultEndTime: employee.defaultEndTime || '18:00',
    defaultBreak: employee.defaultBreak || 0,
    contractDailyHours: employee.contractDailyHours || 0,

    // 세금/보험
    taxType: employee.taxType || 'insurance',
    insurance: employee.insurance || {},

    // 프리랜서 전용
    projectName: contractDetails.projectName || '',
    totalAmount: contractDetails.totalAmount || 0,
    paymentSchedule: contractDetails.paymentSchedule || '',
    deliverables: contractDetails.deliverables || '',
  };
}
