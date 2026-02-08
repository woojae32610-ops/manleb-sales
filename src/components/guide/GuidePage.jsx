import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { GlassCard } from '../ui/index.jsx';

// ============================================
// 가이드 섹션 데이터
// ============================================
const GUIDE_SECTIONS = [
  {
    id: 'getting-started',
    icon: '🚀',
    title: '처음 시작하기',
    description: '만렙사장을 처음 쓰시나요? 여기서부터 시작하세요!',
    defaultOpen: true,
    searchKeywords: ['시작', '처음', '설치', '가입', '매장', '매장이름'],
  },
  {
    id: 'dashboard',
    icon: '📊',
    title: '매출 보는 법 (대시보드)',
    description: '우리 가게 매출을 한눈에!',
    searchKeywords: ['매출', '대시보드', '그래프', '차트', '일별', '월별', '피크타임', '메뉴'],
  },
  {
    id: 'employees',
    icon: '👷',
    title: '직원 등록하고 인건비 계산하기',
    description: '시급, 주휴수당, 4대보험 자동 계산',
    searchKeywords: ['직원', '알바', '시급', '월급', '주휴수당', '4대보험', '인건비', '최저시급'],
  },
  {
    id: 'work-records',
    icon: '📅',
    title: '직원 근무기록 입력하기',
    description: '출근, 퇴근, 조퇴, 연차 기록',
    searchKeywords: ['근무', '출근', '퇴근', '조퇴', '연차', '결근', '휴가', '캘린더', '자동채우기'],
  },
  {
    id: 'payroll',
    icon: '💰',
    title: '급여 정산하기',
    description: '이번 달 직원 급여 확인',
    searchKeywords: ['급여', '정산', '월급', '주급', '기본급', '연장수당', '실수령액'],
  },
  {
    id: 'profit-loss',
    icon: '💵',
    title: '이번 달 순이익 확인하기 (손익관리)',
    description: '내 통장에 실제로 남는 돈은?',
    searchKeywords: ['손익', '순이익', '이익', '적자', '매출', '원가', '월세', '관리비', '비용'],
  },
  {
    id: 'contracts',
    icon: '📝',
    title: '근로계약서 만들기',
    description: '5종 계약서를 PDF/워드로 다운로드',
    searchKeywords: ['계약서', '근로계약', '단시간', '초단시간', '월급제', '일용직', '프리랜서', '3.3', 'PDF', '다운로드'],
  },
  {
    id: 'my-data',
    icon: '📁',
    title: '내 데이터 관리하기',
    description: 'POS 데이터 올리기, 매장 설정',
    searchKeywords: ['데이터', '엑셀', 'POS', '파일', '업로드', '매장설정', '관리자'],
  },
  {
    id: 'faq',
    icon: '💡',
    title: '자주 묻는 질문',
    description: '궁금한 것이 있으면 여기를 확인하세요',
    searchKeywords: ['질문', 'FAQ', '도움', '문의', '에러', '오류', '안되'],
  },
];

// ============================================
// FAQ 데이터
// ============================================
const FAQ_ITEMS = [
  {
    q: '데이터가 사라지지 않나요?',
    a: '입력한 데이터는 사장님의 기기(브라우저)에 저장돼요. 같은 기기, 같은 브라우저로 접속하면 데이터가 유지됩니다.\n\n⚠️ 브라우저 데이터를 삭제하면 없어질 수 있으니 중요한 데이터는 정기적으로 백업해주세요.',
  },
  {
    q: '핸드폰에서도 쓸 수 있나요?',
    a: '네! 핸드폰 브라우저에서 접속하면 됩니다. 다만 화면이 작아서 컴퓨터나 태블릿에서 쓰는 걸 추천합니다.',
  },
  {
    q: 'POS 데이터 형식이 안 맞는다고 나와요',
    a: 'POS 업체마다 엑셀 형식이 달라요. 안 되는 경우 POS 업체에 "매출 데이터 엑셀로 주세요" 하시면 됩니다.',
  },
  {
    q: '주휴수당을 꼭 줘야 하나요?',
    a: '네. 주 15시간 이상 근무하고 개근한 직원에게는 법적으로 주휴수당을 지급해야 합니다. 안 주면 임금체불로 신고될 수 있어요.\n\n💡 주 15시간 미만으로 고용하면 주휴수당이 없습니다.',
  },
  {
    q: '3.3% 프리랜서와 알바의 차이가 뭔가요?',
    a: '알바 = 근로자. 근로계약서 작성, 4대보험, 주휴수당 의무\n프리랜서 = 사업소득자. 세금 3.3%만 떼고 지급\n\n⚠️ 주의: 실제로 알바처럼 일하는데 3.3%로 계약하면 "가짜 프리랜서"로 단속 대상이 됩니다!',
  },
  {
    q: '근로계약서를 안 쓰면 어떻게 되나요?',
    a: '500만원 이하 벌금 또는 과태료가 부과됩니다. 꼭 서면으로 작성하고, 직원에게도 한 부 주셔야 해요!\n\n만렙사장에서 쉽게 만들 수 있으니 꼭 작성하세요! 📝',
  },
  {
    q: '2026년 최저시급이 얼마인가요?',
    a: '시간급 10,320원입니다.\n\n일급 환산: 82,560원 (8시간 기준)\n월급 환산: 2,156,880원 (주 40시간, 주휴수당 포함)\n\n⚠️ 최저시급 미만 지급 시 3년 이하 징역 또는 2천만원 이하 벌금에 처해질 수 있습니다.',
  },
  {
    q: '손익관리에서 순이익이 마이너스예요 😢',
    a: '적자라는 뜻이에요. 다음을 확인해보세요:\n\n• 원재료비가 매출의 35%를 넘지 않나요?\n• 인건비가 매출의 30%를 넘지 않나요?\n• 고정비(월세 등)를 줄일 수 있는지 확인해보세요\n• 메뉴 가격 인상이 필요할 수도 있어요',
  },
  {
    q: '문의하고 싶어요',
    a: '이메일: (추후 추가)\n카카오톡: (추후 추가)\n운영시간: 평일 10:00~18:00',
  },
];

// ============================================
// 스텝 카드 컴포넌트
// ============================================
const StepCard = ({ step, title, children }) => (
  <div className="bg-white/5 rounded-xl p-5 border-l-4 border-cyan-400 space-y-3">
    <div className="flex items-center gap-3">
      <div className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
        {step}
      </div>
      <h4 className="text-white font-bold text-lg">{title}</h4>
    </div>
    <div className="text-white/80 text-base leading-relaxed pl-11 space-y-3">
      {children}
    </div>
  </div>
);

// 팁 박스
const TipBox = ({ children }) => (
  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-300 text-base">
    💡 {children}
  </div>
);

// 경고 박스
const WarnBox = ({ children }) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-base">
    ⚠️ {children}
  </div>
);

// 계산 예시 박스
const CalcBox = ({ children }) => (
  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 font-mono text-cyan-300 text-sm leading-relaxed whitespace-pre-line">
    {children}
  </div>
);

// ============================================
// 각 섹션 내용 컴포넌트
// ============================================
const SectionContent = ({ sectionId }) => {
  switch (sectionId) {
    case 'getting-started':
      return <GettingStartedContent />;
    case 'dashboard':
      return <DashboardContent />;
    case 'employees':
      return <EmployeesContent />;
    case 'work-records':
      return <WorkRecordsContent />;
    case 'payroll':
      return <PayrollContent />;
    case 'profit-loss':
      return <ProfitLossContent />;
    case 'contracts':
      return <ContractsContent />;
    case 'my-data':
      return <MyDataContent />;
    case 'faq':
      return <FAQContent />;
    default:
      return null;
  }
};

// ── 🚀 처음 시작하기 ──
function GettingStartedContent() {
  return (
    <div className="space-y-4">
      <p className="text-white/70 text-lg mb-2">만렙사장을 처음 쓰시나요?<br />아래 순서대로 따라하시면 됩니다! 😊</p>

      <StepCard step={1} title="매장 이름 입력하기">
        <p>화면 맨 위에 있는 <strong className="text-cyan-400">"매장 이름을 입력하세요"</strong> 칸을 눌러서 우리 가게 이름을 적어주세요.</p>
        <TipBox>이 이름이 근로계약서에도 자동으로 들어갑니다.</TipBox>
      </StepCard>

      <StepCard step={2} title="POS 매출 데이터 올리기">
        <p>카드단말기나 POS에서 매출 데이터를 엑셀 파일로 다운받으셨나요? 그 파일을 만렙사장에 올려주세요.</p>
        <div className="space-y-2 text-white/70">
          <p>① <strong className="text-white">"📁 내 데이터"</strong>를 누르세요</p>
          <p>② <strong className="text-white">"파일 선택"</strong> 버튼을 누르세요</p>
          <p>③ 다운받은 엑셀 파일을 선택하세요</p>
          <p>④ 자동으로 매출 분석이 시작됩니다! 🎉</p>
        </div>
        <WarnBox>엑셀 파일(.xlsx)만 올릴 수 있어요. 혹시 엑셀 파일을 어떻게 다운받는지 모르겠으면 POS 업체에 "매출 데이터 엑셀로 주세요" 하시면 됩니다.</WarnBox>
      </StepCard>

      <StepCard step={3} title="대시보드에서 매출 확인하기">
        <p>파일을 올리면 <strong className="text-cyan-400">"📊 대시보드"</strong>에서 우리 가게 매출을 한눈에 볼 수 있어요!</p>
        <div className="space-y-1 text-white/70">
          <p>✅ 이달 총 매출</p>
          <p>✅ 일별 매출 그래프</p>
          <p>✅ 시간대별 매출 (언제 손님이 많은지)</p>
          <p>✅ 요일별 매출 (무슨 요일이 잘 되는지)</p>
          <p>✅ 잘 팔리는 메뉴 순위</p>
        </div>
      </StepCard>

      <StepCard step={4} title="직원 등록하기 (선택)">
        <p>알바생이나 직원이 있다면 <strong className="text-cyan-400">"👷 인건비"</strong>에서 직원을 등록해보세요. 급여가 자동으로 계산됩니다!</p>
      </StepCard>

      <StepCard step={5} title="이번 달 손익 확인하기 (선택)">
        <p><strong className="text-cyan-400">"💵 손익관리"</strong>에서 임대료, 관리비 등을 입력하면 이번 달에 실제로 남는 돈을 계산해줍니다!</p>
      </StepCard>

      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-5 text-center">
        <p className="text-xl text-white font-bold">👏 축하합니다!</p>
        <p className="text-white/70 text-base mt-1">이제 만렙사장을 사용할 준비가 됐어요!</p>
      </div>
    </div>
  );
}

// ── 📊 매출 보는 법 ──
function DashboardContent() {
  return (
    <div className="space-y-4">
      <p className="text-white/70 text-lg">대시보드는 우리 가게 매출을 한눈에 보여주는 화면이에요.</p>

      <StepCard step="📌" title="월 바꾸기">
        <p>화면 위쪽의 <strong className="text-cyan-400">◀ ▶ 버튼</strong>으로 보고 싶은 달을 바꿀 수 있어요.</p>
        <div className="bg-white/10 rounded-xl p-3 text-center text-white font-bold">
          ◀ &nbsp; 2026년 2월 &nbsp; ▶ &nbsp; ← 여기를 누르세요! 👆
        </div>
      </StepCard>

      <StepCard step="📌" title="상단 카드 읽는 법">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xs text-white/50">💰 총 매출</p>
            <p className="text-sm font-bold text-white">8,583,500원</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xs text-white/50">📈 일평균</p>
            <p className="text-sm font-bold text-white">373,196원</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xs text-white/50">⏰ 피크타임</p>
            <p className="text-sm font-bold text-white">오후 1시</p>
          </div>
        </div>
        <div className="space-y-1 text-white/70">
          <p>• <strong className="text-white">총 매출:</strong> 이번 달에 우리 가게에서 번 총 금액</p>
          <p>• <strong className="text-white">일평균:</strong> 하루에 평균 얼마를 벌었는지</p>
          <p>• <strong className="text-white">피크타임:</strong> 손님이 가장 많은 시간대</p>
        </div>
      </StepCard>

      <StepCard step="📌" title="그래프 보는 법">
        <div className="space-y-3 text-white/70">
          <div>
            <p className="text-white font-medium">📊 일별 매출 그래프</p>
            <p>막대가 높을수록 그 날 매출이 많았다는 뜻이에요. 막대를 누르면 정확한 금액을 볼 수 있어요.</p>
          </div>
          <div>
            <p className="text-white font-medium">⏰ 시간대별 매출</p>
            <p>몇 시에 매출이 집중되는지 보여줘요.</p>
            <TipBox>피크타임에 알바를 더 배치하면 좋겠죠!</TipBox>
          </div>
          <div>
            <p className="text-white font-medium">📅 요일별 매출</p>
            <p>무슨 요일에 매출이 좋은지 비교할 수 있어요.</p>
            <TipBox>매출이 적은 요일에 이벤트를 하는 건 어떨까요?</TipBox>
          </div>
          <div>
            <p className="text-white font-medium">🏆 메뉴별 매출 순위</p>
            <p>어떤 메뉴가 잘 팔리는지, 얼마나 팔렸는지 보여줘요.</p>
          </div>
        </div>
      </StepCard>
    </div>
  );
}

// ── 👷 직원 등록 ──
function EmployeesContent() {
  return (
    <div className="space-y-4">
      <p className="text-white/70 text-lg">알바생이나 직원의 시급, 근무시간을 입력하면 주휴수당, 4대보험까지 자동으로 계산해줍니다! 🧮</p>

      <StepCard step={1} title="인건비 메뉴로 이동">
        <p>화면 위쪽 메뉴에서 <strong className="text-cyan-400">"👷 인건비"</strong>를 눌러주세요.</p>
      </StepCard>

      <StepCard step={2} title="직원 추가하기">
        <p>오른쪽 위의 <strong className="text-cyan-400">"직원 추가"</strong> 버튼을 누르세요.</p>
        <p>아래 내용을 입력해주세요:</p>
        <div className="bg-white/10 rounded-xl p-4 space-y-3 text-white/80">
          <p><strong className="text-white">직원 이름</strong>을 적어주세요</p>
          <div className="border-t border-white/10 pt-3">
            <p className="text-white font-medium mb-2">고용 형태를 선택하세요:</p>
            <div className="space-y-2 text-sm">
              <p>○ <strong className="text-cyan-400">시급제</strong> → 시간당 얼마를 주는 알바 (예: 시급 10,320원)</p>
              <p>○ <strong className="text-green-400">월급제</strong> → 매달 정해진 월급을 주는 직원 (예: 월 250만원)</p>
              <p>○ <strong className="text-orange-400">일용직</strong> → 하루만 일하는 단기 대타</p>
              <p>○ <strong className="text-indigo-400">3.3% 프리랜서</strong> → 세금 3.3%만 떼는 외주 (예: 배달대행)</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3">
            <p className="text-white/60 text-sm">시급제를 선택하면:</p>
            <p>시급, 1주일 근무시간, 근무일수를 입력해주세요</p>
          </div>
        </div>
      </StepCard>

      <div className="bg-white/5 rounded-xl p-5 space-y-3">
        <h4 className="text-white font-bold text-lg">📌 주휴수당이 뭔가요? 🤔</h4>
        <p className="text-white/70 text-base">1주일에 15시간 이상 일하고, 개근하면 법적으로 하루치 급여를 더 줘야 해요. 이걸 주휴수당이라고 합니다.</p>
        <CalcBox>{`🧮 계산 예시

김알바: 시급 10,320원, 주 25시간

주휴수당 = (25시간 ÷ 40) × 8 × 10,320원
        = 51,600원 (1주일에)

💰 이 계산을 만렙사장이 자동으로 해줘요!`}</CalcBox>
        <WarnBox>주 15시간 미만이면 주휴수당을 안 줘도 됩니다. 월급제 직원은 이미 월급에 포함되어 있어요.</WarnBox>
      </div>

      <div className="bg-white/5 rounded-xl p-5 space-y-3">
        <h4 className="text-white font-bold text-lg">📌 4대보험은 뭔가요? 🏥</h4>
        <p className="text-white/70 text-base">직원을 고용하면 사장님도 보험료를 일부 내야 해요.</p>
        <div className="space-y-1 text-white/70 text-base">
          <p>• 국민연금: 직원 급여의 약 4.5%</p>
          <p>• 건강보험: 직원 급여의 약 3.5%</p>
          <p>• 고용보험: 직원 급여의 약 0.9%</p>
          <p>• 산재보험: 직원 급여의 약 0.7%</p>
          <p className="border-t border-white/10 pt-2 text-white font-medium">합계: 약 10% 정도 사장님이 추가로 부담</p>
        </div>
        <TipBox>주 15시간 미만 알바는 산재보험만 가입하면 돼요. 만렙사장에서 자동으로 계산해줍니다!</TipBox>
      </div>
    </div>
  );
}

// ── 📅 근무기록 입력 ──
function WorkRecordsContent() {
  return (
    <div className="space-y-4">
      <p className="text-white/70 text-lg">직원이 실제로 몇 시간 일했는지 기록하면 정확한 급여를 계산할 수 있어요.</p>

      <StepCard step={1} title="근무 기록으로 이동">
        <p><strong className="text-cyan-400">"👷 인건비"</strong> → <strong className="text-cyan-400">"근무 기록"</strong> 을 눌러주세요.</p>
      </StepCard>

      <StepCard step={2} title='자동으로 한 달치 채우기 (추천! ⭐)'>
        <p>매일 하나하나 입력하면 번거롭죠?</p>
        <p><strong className="text-cyan-400">"계약대로 자동 채우기"</strong> 버튼을 누르면 등록한 근무시간대로 한 달치가 자동으로 채워져요!</p>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <span className="bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg font-medium">📋 계약대로 자동 채우기 ← 이 버튼! 👆</span>
        </div>
      </StepCard>

      <StepCard step={3} title="달라진 날만 수정하기">
        <p>자동 채우기 한 다음에, 다른 날만 바꿔주세요.</p>
        <div className="space-y-1 text-white/70">
          <p>• 2월 5일에 조퇴했다면 → 5일을 눌러서 🟡조퇴로 변경</p>
          <p>• 2월 12일이 공휴일이면 → 12일을 눌러서 🔵공휴일로 변경</p>
          <p>• 2월 14일에 연차 썼으면 → 14일을 눌러서 🟣연차로 변경</p>
        </div>
      </StepCard>

      <div className="bg-white/5 rounded-xl p-5 space-y-3">
        <h4 className="text-white font-bold text-lg">📌 캘린더 아이콘 뜻</h4>
        <div className="grid grid-cols-2 gap-2 text-base">
          <p className="text-white/80">🟢 출근 → 정상 근무한 날</p>
          <p className="text-white/80">🔴 휴무 → 원래 쉬는 날</p>
          <p className="text-white/80">🟡 조퇴/지각 → 일찍 간 날</p>
          <p className="text-white/80">🟣 연차/휴가 → 유급 휴가</p>
          <p className="text-white/80">🔵 공휴일 → 법정 공휴일</p>
          <p className="text-white/80">⚫ 결근 → 안 나온 날</p>
        </div>
        <TipBox>결근이나 병가가 있으면 그 주의 주휴수당이 빠질 수 있어요. 만렙사장이 자동으로 계산해줍니다!</TipBox>
      </div>
    </div>
  );
}

// ── 💰 급여 정산 ──
function PayrollContent() {
  return (
    <div className="space-y-4">
      <p className="text-white/70 text-lg">근무기록을 입력하면 이번 달 급여가 자동으로 계산돼요!</p>

      <StepCard step="📌" title="급여 정산 보는 법">
        <p><strong className="text-cyan-400">"👷 인건비"</strong> → <strong className="text-cyan-400">"급여 정산"</strong> 을 눌러주세요.</p>
        <div className="bg-white/10 rounded-xl p-4 space-y-2 text-sm">
          <p className="text-white/50 text-xs">김알바 - 2026년 2월 급여 정산</p>
          <div className="space-y-1 text-white/80">
            <p>기본급 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1,253,750원 ← 일한 시간 × 시급</p>
            <p>+ 주휴수당 &nbsp;&nbsp;&nbsp;&nbsp; 217,650원 ← 자동 계산</p>
            <p>+ 연장수당 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 20,060원 ← 야근한 거</p>
            <p>- 차감(조퇴) &nbsp;&nbsp; -10,320원 ← 조퇴한 거(1시간)</p>
            <div className="border-t border-white/20 pt-2">
              <p className="text-cyan-400 font-bold">💰 총 급여 &nbsp;&nbsp;&nbsp;&nbsp; 1,481,430원</p>
            </div>
            <div className="border-t border-white/10 pt-2">
              <p className="text-white/60">사장님 추가 부담:</p>
              <p>4대보험 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 149,624원</p>
            </div>
            <div className="border-t border-white/20 pt-2">
              <p className="text-amber-400 font-bold">📊 총 인건비 &nbsp;&nbsp; 1,631,054원</p>
            </div>
          </div>
        </div>
      </StepCard>

      <StepCard step="📌" title="각 항목 설명">
        <div className="space-y-2 text-white/70">
          <p>• <strong className="text-white">기본급:</strong> 실제 일한 시간 × 시급</p>
          <p>• <strong className="text-white">주휴수당:</strong> 주 15시간 이상 + 개근하면 받는 추가 수당</p>
          <p>• <strong className="text-white">연장수당:</strong> 원래 시간보다 더 일한 시간에 대한 수당</p>
          <p>• <strong className="text-white">차감:</strong> 조퇴하거나 지각해서 줄어든 금액</p>
          <p>• <strong className="text-white">4대보험:</strong> 사장님이 직원 급여 외에 추가로 내는 보험료</p>
          <p>• <strong className="text-white">총 인건비:</strong> 직원 급여 + 사장님이 내는 보험료</p>
        </div>
        <TipBox>이 금액이 손익관리의 "인건비"에 자동으로 들어가요!</TipBox>
      </StepCard>
    </div>
  );
}

// ── 💵 손익관리 ──
function ProfitLossContent() {
  return (
    <div className="space-y-4">
      <p className="text-white/70 text-lg">"이번 달에 실제로 내 통장에 얼마나 남았을까?" 🤔<br />매출에서 원재료비, 인건비, 월세 등을 빼면 알 수 있어요!</p>

      <div className="bg-white/5 rounded-xl p-5">
        <h4 className="text-white font-bold text-lg mb-3">📌 손익관리가 뭔가요?</h4>
        <p className="text-white/70 text-base mb-3">쉽게 말하면 이거예요:</p>
        <CalcBox>{`매출 (번 돈)
- 재료비 (식자재, 원두 등)
- 인건비 (알바비, 직원 월급)
- 월세
- 관리비, 전기세, 수도세
- 카드수수료
- 기타 비용
- 대출이자, 세금
──────────────────
= ★ 순이익 (내 통장에 남는 돈!)`}</CalcBox>
      </div>

      <StepCard step={1} title="손익관리로 이동">
        <p><strong className="text-cyan-400">"💵 손익관리"</strong>를 눌러주세요.</p>
      </StepCard>

      <StepCard step={2} title="자동으로 채워지는 항목 확인">
        <p>아래 항목은 자동으로 계산돼요. 건드릴 필요 없어요! 🔒</p>
        <div className="space-y-1 text-white/70">
          <p>• <strong className="text-white">매출:</strong> POS 데이터에서 자동</p>
          <p>• <strong className="text-white">인건비:</strong> 직원 관리에서 자동</p>
          <p>• <strong className="text-white">4대보험:</strong> 직원 관리에서 자동</p>
        </div>
      </StepCard>

      <StepCard step={3} title="직접 입력하는 항목 채우기">
        <p>아래 항목은 사장님이 직접 입력해주세요. ✏️</p>
        <div className="bg-white/10 rounded-xl p-4 space-y-2 text-white/80 text-sm">
          <p><strong className="text-white">원재료비/매입비</strong> ← 이번 달 식자재, 원재료 산 금액</p>
          <p><strong className="text-white">임대료</strong> ← 월세</p>
          <p><strong className="text-white">관리비</strong> ← 건물 관리비</p>
          <p><strong className="text-white">공과금</strong> ← 전기세 + 수도세 + 가스비</p>
          <p><strong className="text-white">카드수수료</strong> ← 카드사에서 떼가는 수수료</p>
          <p><strong className="text-white">기타 영업비용</strong> ← 소모품, 수리비, 광고비 등</p>
          <p><strong className="text-white">대출이자</strong> ← 은행 대출 이자</p>
          <p><strong className="text-white">세금/기타</strong> ← 부가세, 종합소득세 등</p>
        </div>
        <TipBox>매달 금액이 비슷한 항목(월세, 관리비 등)은 "이전 달 복사" 버튼을 누르면 지난달 금액이 그대로 채워져요! 바뀐 것만 수정하면 됩니다.</TipBox>
      </StepCard>

      <StepCard step="📌" title="손익계산서 읽는 법">
        <CalcBox>{`매출                    8,583,500원
(-) 원재료비           -3,350,000원
─────────────────────────
매출총이익              5,233,500원  ← 재료비 빼고 남은 돈

(-) 영업비용           -4,845,928원
─────────────────────────
영업이익                  387,572원  ← 장사해서 남은 돈

(-) 대출이자/세금        -200,000원
─────────────────────────
★ 순이익                  187,572원  ← 진짜 내 돈!
  순이익률: 2.2%`}</CalcBox>
        <div className="space-y-1 text-base mt-3">
          <p className="text-green-400">• 20% 이상 🟢 → 아주 잘 되고 있어요!</p>
          <p className="text-yellow-400">• 10~20% 🟡 → 양호해요</p>
          <p className="text-orange-400">• 5~10% 🟠 → 보통이에요. 비용을 줄여보세요</p>
          <p className="text-red-400">• 0~5% 🔴 → 위험해요! 비용 점검이 필요해요</p>
          <p className="text-white/50">• 마이너스 ⚫ → 적자예요. 긴급 점검이 필요합니다</p>
        </div>
      </StepCard>
    </div>
  );
}

// ── 📝 근로계약서 ──
function ContractsContent() {
  return (
    <div className="space-y-4">
      <p className="text-white/70 text-lg">직원을 고용할 때 근로계약서를 꼭 써야 해요! 안 쓰면 500만원 이하 벌금이 부과될 수 있습니다. ⚠️</p>
      <p className="text-white/70 text-base">만렙사장에서는 직원 정보를 자동으로 채워서 계약서를 바로 출력할 수 있어요! 📄</p>

      <div className="bg-white/5 rounded-xl p-5 space-y-3">
        <h4 className="text-white font-bold text-lg">📌 어떤 계약서를 써야 하나요?</h4>
        <div className="space-y-2 text-white/70 text-base">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white font-medium">주 15시간 미만</p>
            <p>→ 📋 <strong className="text-cyan-400">초단시간근로자</strong> 계약서 (주휴수당 없음, 보험 일부 제외)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white font-medium">주 15시간~40시간</p>
            <p>→ 📋 <strong className="text-cyan-400">단시간근로자</strong> 계약서 (대부분의 알바는 이거!)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white font-medium">주 40시간 이상</p>
            <p>→ 📋 <strong className="text-cyan-400">월급제 근로</strong>계약서 (정직원, 매니저)</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p>🔸 하루만 일한다면 → <strong className="text-orange-400">일용직</strong> 계약서</p>
            <p>🔸 프리랜서라면 → <strong className="text-indigo-400">3.3% 용역</strong>계약서</p>
          </div>
        </div>
        <TipBox>걱정 마세요! 직원 정보를 입력하면 만렙사장이 알맞은 계약서를 자동 추천해줘요!</TipBox>
      </div>

      <StepCard step={1} title="매장 정보 먼저 입력하기 (처음 1번만)">
        <p><strong className="text-cyan-400">"📁 내 데이터"</strong> → <strong className="text-cyan-400">"매장 설정"</strong>에서 대표자 이름, 가게 주소, 전화번호를 입력해주세요.</p>
        <TipBox>한 번만 입력하면 모든 계약서에 자동으로 들어가요!</TipBox>
      </StepCard>

      <StepCard step={2} title="계약서 만들기">
        <div className="space-y-1 text-white/70">
          <p><strong className="text-white">방법 1:</strong> "👷 인건비" → "계약서" → 직원 선택</p>
          <p><strong className="text-white">방법 2:</strong> 직원 목록에서 직원 옆의 "📝 계약서" 버튼</p>
        </div>
      </StepCard>

      <StepCard step={3} title="추가 정보 입력">
        <p>직원 정보는 자동으로 채워져요! 아래 항목만 추가로 입력해주세요:</p>
        <div className="space-y-1 text-white/70">
          <p>• 계약 시작일 (언제부터 일하나요?)</p>
          <p>• 업무 내용 (예: "음료 제조 및 매장 관리")</p>
          <p>• 임금 지급일 (매월 며칠에 월급 주나요?)</p>
        </div>
      </StepCard>

      <StepCard step={4} title="다운로드">
        <p><strong className="text-cyan-400">"📥 다운로드"</strong> 버튼을 누르세요!</p>
        <div className="space-y-1 text-white/70">
          <p>• <strong className="text-white">PDF:</strong> 바로 인쇄할 수 있는 파일</p>
          <p>• <strong className="text-white">워드(DOCX):</strong> 내용을 수정할 수 있는 파일</p>
        </div>
        <TipBox>다운받은 계약서를 인쇄해서 직원과 함께 서명하고, 한 부씩 나눠 가지세요!</TipBox>
        <WarnBox>직원 주소, 연락처, 서명란은 인쇄 후에 직접 손으로 적어주세요. (비워져 있어요)</WarnBox>
      </StepCard>
    </div>
  );
}

// ── 📁 내 데이터 ──
function MyDataContent() {
  return (
    <div className="space-y-4">
      <p className="text-white/70 text-lg">POS 매출 데이터를 올리고, 매장 정보를 설정하는 곳이에요.</p>

      <StepCard step="📌" title="POS 매출 데이터 올리기">
        <div className="space-y-2 text-white/70">
          <p>① POS 기기나 카드단말기에서 매출 데이터를 엑셀 파일(.xlsx)로 다운받으세요.</p>
          <p className="text-white/50 text-sm">(방법을 모르면 POS 업체에 전화해서 물어보세요!)</p>
          <p>② <strong className="text-white">"📁 내 데이터"</strong> → <strong className="text-white">"파일 선택"</strong> 버튼을 눌러 다운받은 엑셀 파일을 선택하세요.</p>
          <p>③ 자동으로 분석됩니다! <strong className="text-white">"📊 대시보드"</strong>에서 확인해보세요.</p>
        </div>
        <TipBox>여러 달의 데이터를 올리면 월별 비교도 가능해요!</TipBox>
      </StepCard>

      <StepCard step="📌" title="매장 설정하기">
        <p>근로계약서에 들어갈 매장 정보를 입력하세요.</p>
        <div className="space-y-1 text-white/70">
          <p>• 매장명 (= 가게 이름)</p>
          <p>• 대표자명 (= 사장님 이름)</p>
          <p>• 사업장 주소</p>
          <p>• 전화번호</p>
        </div>
        <TipBox>한 번만 입력하면 계속 사용됩니다!</TipBox>
      </StepCard>

      <StepCard step="📌" title="관리자 로그인">
        <p>매장 설정이나 데이터 초기화 같은 관리 기능은 관리자로 로그인해야 사용할 수 있어요.</p>
        <div className="bg-white/10 rounded-xl p-3 space-y-1 text-white/80 text-sm">
          <p>처음 로그인 정보:</p>
          <p>• 아이디: <strong className="text-cyan-400">admin</strong></p>
          <p>• 비밀번호: <strong className="text-cyan-400">admin123</strong></p>
        </div>
        <WarnBox>처음 로그인 후 반드시 비밀번호를 바꿔주세요!</WarnBox>
      </StepCard>
    </div>
  );
}

// ── 💡 FAQ ──
function FAQContent() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full text-left bg-white/8 hover:bg-white/12 rounded-xl p-4 flex items-center justify-between transition-all"
          >
            <span className="text-white text-base font-medium">Q. {item.q}</span>
            <ChevronDown className={`w-5 h-5 text-white/50 transition-transform flex-shrink-0 ml-2 ${openFaq === i ? 'rotate-180' : ''}`} />
          </button>
          {openFaq === i && (
            <div className="pl-5 pr-4 py-3 border-l-2 border-white/20 ml-4 mt-1">
              <p className="text-white/70 text-base leading-relaxed whitespace-pre-line">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// 메인 GuidePage 컴포넌트
// ============================================
export default function GuidePage() {
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    GUIDE_SECTIONS.forEach(s => { initial[s.id] = !!s.defaultOpen; });
    return initial;
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 검색 필터링
  const filteredSections = searchQuery.trim()
    ? GUIDE_SECTIONS.filter(section => {
        const q = searchQuery.toLowerCase();
        if (section.title.toLowerCase().includes(q)) return true;
        if (section.description.toLowerCase().includes(q)) return true;
        if (section.searchKeywords.some(kw => kw.includes(q))) return true;
        return false;
      })
    : GUIDE_SECTIONS;

  // 검색 시 자동 펼치기
  const isSearching = searchQuery.trim().length > 0;
  const isSectionOpen = (id) => {
    if (isSearching) return true;
    return !!openSections[id];
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-white">
          만렙사장, 이렇게 쓰세요! 🎉
        </h1>
        <p className="text-white/60 text-lg">
          아래에서 궁금한 기능을 눌러보세요.
        </p>
      </div>

      {/* 검색창 */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="어떤 기능이 궁금하세요?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-lg p-4 pl-12 outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-lg"
          >
            ✕
          </button>
        )}
      </div>

      {/* 검색 결과 없음 */}
      {isSearching && filteredSections.length === 0 && (
        <div className="text-center py-10">
          <p className="text-white/50 text-lg">검색 결과가 없습니다.</p>
          <p className="text-white/30 text-base mt-1">다른 단어로 검색해보세요.</p>
        </div>
      )}

      {/* 아코디언 섹션들 */}
      <div className="space-y-2">
        {filteredSections.map(section => (
          <div key={section.id}>
            {/* 아코디언 헤더 */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/15 transition-all cursor-pointer p-4 sm:p-5 flex items-center gap-4"
            >
              <span className="text-2xl flex-shrink-0">{section.icon}</span>
              <div className="flex-1 text-left min-w-0">
                <h2 className="text-white font-bold text-lg truncate">{section.title}</h2>
                <p className="text-white/50 text-sm truncate">{section.description}</p>
              </div>
              <ChevronDown className={`w-6 h-6 text-white/50 transition-transform flex-shrink-0 ${isSectionOpen(section.id) ? 'rotate-180' : ''}`} />
            </button>

            {/* 아코디언 내용 */}
            {isSectionOpen(section.id) && (
              <div className="bg-white/5 border border-white/10 rounded-xl mt-1 p-5 sm:p-6">
                <SectionContent sectionId={section.id} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 하단 */}
      <div className="text-center py-6 space-y-2">
        <p className="text-white/40 text-base">더 궁금한 게 있으면 문의해주세요!</p>
        <p className="text-white/30 text-sm">만렙사장 고객센터 (추후 추가)</p>
      </div>
    </div>
  );
}
