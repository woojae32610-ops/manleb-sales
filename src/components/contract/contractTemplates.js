/**
 * 5종 계약서 텍스트 템플릿 데이터
 */

export const CONTRACT_TEMPLATES = {
  // ========== 1. 표준 근로계약서 ==========
  standard: {
    title: '표준 근로계약서',
    sections: [
      {
        heading: '제1조 (근로계약기간)',
        content: (d) => `${d.contractStart} 부터 ${d.contractEnd || '별도 정함이 없을 때'} 까지`,
      },
      {
        heading: '제2조 (근무장소)',
        content: (d) => d.workplace || d.storeName || '사업장 내',
      },
      {
        heading: '제3조 (업무내용)',
        content: (d) => d.jobDescription || '매장 운영 관련 업무 전반',
      },
      {
        heading: '제4조 (근로시간)',
        content: (d) => `시업시각: ${d.defaultStartTime}, 종업시각: ${d.defaultEndTime}\n휴게시간: ${d.defaultBreak}시간\n주간 근로시간: ${d.weeklyHours}시간`,
      },
      {
        heading: '제5조 (근무일 및 휴일)',
        content: (d) => `근무일: ${d.workDays || '별도 협의'}\n주휴일: ${d.restDay}`,
      },
      {
        heading: '제6조 (임금)',
        content: (d) => {
          let text = `${d.wageDescription}\n지급일: ${d.payDay}\n지급방법: ${d.payMethod}`;
          if (d.isEligibleForWeeklyHoliday) {
            text += `\n주휴수당 (월): ${d.weeklyHolidayPay.toLocaleString()}원`;
          }
          return text;
        },
      },
      {
        heading: '제7조 (연차유급휴가)',
        content: () => '근로기준법에서 정하는 바에 따라 연차유급휴가를 부여한다.',
      },
      {
        heading: '제8조 (사회보험 적용여부)',
        content: (d) => {
          if (d.taxType === 'insurance') {
            const items = [];
            if (d.insurance.national) items.push('국민연금');
            if (d.insurance.health) items.push('건강보험');
            if (d.insurance.employment) items.push('고용보험');
            if (d.insurance.industrial) items.push('산재보험');
            return items.length > 0 ? `적용: ${items.join(', ')}` : '해당 없음';
          }
          return d.taxType === 'withholding' ? '3.3% 원천징수 적용 (사업소득)' : '해당 없음';
        },
      },
      {
        heading: '제9조 (근로계약서 교부)',
        content: () => '"사업주"는 근로계약을 체결함과 동시에 본 계약서를 사본하여 "근로자"의 교부요구와 관계없이 "근로자"에게 교부한다. (근로기준법 제17조 이행)',
      },
      {
        heading: '제10조 (기타)',
        content: () => '이 계약에 정함이 없는 사항은 근로기준법령에 정하는 바에 따른다.',
      },
    ],
    signature: true,
  },

  // ========== 2. 단시간 근로계약서 ==========
  partTime: {
    title: '단시간 근로계약서',
    sections: [
      {
        heading: '제1조 (근로계약기간)',
        content: (d) => `${d.contractStart} 부터 ${d.contractEnd || '별도 정함이 없을 때'} 까지`,
      },
      {
        heading: '제2조 (근무장소)',
        content: (d) => d.workplace || d.storeName || '사업장 내',
      },
      {
        heading: '제3조 (업무내용)',
        content: (d) => d.jobDescription || '매장 운영 관련 업무',
      },
      {
        heading: '제4조 (근로일 및 근로시간)',
        content: (d) => {
          let text = `주간 근로시간: ${d.weeklyHours}시간\n\n[근로일별 근로시간]`;
          d.schedule.forEach(s => {
            if (s.isWork) {
              text += `\n${s.day}요일: ${s.startTime} ~ ${s.endTime} (휴게 ${s.breakHours}h) = ${s.hours}시간`;
            }
          });
          return text;
        },
      },
      {
        heading: '제5조 (휴일)',
        content: (d) => `주휴일: ${d.restDay}`,
      },
      {
        heading: '제6조 (임금)',
        content: (d) => {
          let text = `시간급: ${d.hourlyWage.toLocaleString()}원\n지급일: ${d.payDay}\n지급방법: ${d.payMethod}`;
          if (d.isEligibleForWeeklyHoliday) {
            text += `\n주휴수당 (월): ${d.weeklyHolidayPay.toLocaleString()}원 (주 15시간 이상 근무)`;
          }
          return text;
        },
      },
      {
        heading: '제7조 (연차유급휴가)',
        content: () => '통상 근로자의 근로시간에 비례하여 연차유급휴가를 부여한다.',
      },
      {
        heading: '제8조 (사회보험 적용여부)',
        content: (d) => {
          if (d.taxType === 'insurance') {
            const items = [];
            if (d.insurance.national) items.push('국민연금');
            if (d.insurance.health) items.push('건강보험');
            if (d.insurance.employment) items.push('고용보험');
            if (d.insurance.industrial) items.push('산재보험');
            return items.length > 0 ? `적용: ${items.join(', ')}` : '해당 없음';
          }
          return d.taxType === 'withholding' ? '3.3% 원천징수 적용' : '해당 없음';
        },
      },
      {
        heading: '제9조 (근로조건 변경)',
        content: () => '임금, 근로시간 등 근로조건을 변경하고자 할 경우 서면으로 합의하여야 한다.',
      },
      {
        heading: '제10조 (근로계약서 교부)',
        content: () => '"사업주"는 근로계약을 체결함과 동시에 본 계약서를 사본하여 "근로자"에게 교부한다.',
      },
      {
        heading: '제11조 (기타)',
        content: () => '이 계약에 정함이 없는 사항은 근로기준법령에 정하는 바에 따른다.',
      },
    ],
    hasScheduleTable: true,
    signature: true,
  },

  // ========== 3. 초단시간 근로계약서 ==========
  ultraShort: {
    title: '초단시간 근로계약서',
    subtitle: '(주 15시간 미만)',
    sections: [
      {
        heading: '제1조 (근로계약기간)',
        content: (d) => `${d.contractStart} 부터 ${d.contractEnd || '별도 정함이 없을 때'} 까지`,
      },
      {
        heading: '제2조 (근무장소)',
        content: (d) => d.workplace || d.storeName || '사업장 내',
      },
      {
        heading: '제3조 (업무내용)',
        content: (d) => d.jobDescription || '매장 운영 보조 업무',
      },
      {
        heading: '제4조 (근로일 및 근로시간)',
        content: (d) => {
          let text = `주간 근로시간: ${d.weeklyHours}시간 (주 15시간 미만)\n\n[근로일별 근로시간]`;
          d.schedule.forEach(s => {
            if (s.isWork) {
              text += `\n${s.day}요일: ${s.startTime} ~ ${s.endTime} (휴게 ${s.breakHours}h) = ${s.hours}시간`;
            }
          });
          return text;
        },
      },
      {
        heading: '제5조 (임금)',
        content: (d) => `시간급: ${d.hourlyWage.toLocaleString()}원\n지급일: ${d.payDay}\n지급방법: ${d.payMethod}\n\n※ 주 15시간 미만 근무자는 주휴수당, 연차유급휴가, 퇴직금 적용 제외`,
      },
      {
        heading: '제6조 (사회보험)',
        content: () => '주 15시간 미만 근무자는 국민연금·건강보험 적용 제외 (고용보험·산재보험은 적용)',
      },
      {
        heading: '제7조 (근로계약서 교부)',
        content: () => '"사업주"는 근로계약을 체결함과 동시에 본 계약서를 사본하여 "근로자"에게 교부한다.',
      },
      {
        heading: '제8조 (기타)',
        content: () => '이 계약에 정함이 없는 사항은 근로기준법령에 정하는 바에 따른다.',
      },
    ],
    hasScheduleTable: true,
    signature: true,
  },

  // ========== 4. 일용직 근로계약서 ==========
  daily: {
    title: '일용직 근로계약서',
    sections: [
      {
        heading: '제1조 (근로계약기간)',
        content: (d) => `${d.contractStart} 부터 ${d.contractEnd || '작업 완료 시까지'}`,
      },
      {
        heading: '제2조 (근무장소)',
        content: (d) => d.workplace || d.storeName || '사업장 내',
      },
      {
        heading: '제3조 (업무내용)',
        content: (d) => d.jobDescription || '사업장 업무 보조',
      },
      {
        heading: '제4조 (근로시간)',
        content: (d) => `시업시각: ${d.defaultStartTime}, 종업시각: ${d.defaultEndTime}\n휴게시간: ${d.defaultBreak}시간`,
      },
      {
        heading: '제5조 (임금)',
        content: (d) => `일급: ${d.dailyWage.toLocaleString()}원\n지급방법: ${d.payMethod}\n지급시기: 근무일 당일 또는 ${d.payDay}`,
      },
      {
        heading: '제6조 (근무일)',
        content: (d) => `예정 근무일: ${d.workDays || '별도 협의'}\n※ 실제 근무일은 사업주와 협의하여 정한다.`,
      },
      {
        heading: '제7조 (안전 및 보건)',
        content: () => '사업주는 산업안전보건법에 따라 근로자의 안전과 건강을 보호하기 위한 조치를 취한다.',
      },
      {
        heading: '제8조 (사회보험)',
        content: () => '일용직 근로자의 경우 산재보험은 당연 적용되며, 고용보험은 1개월 이상 근무 시 적용한다.\n일 187,000원 이하 비과세 적용.',
      },
      {
        heading: '제9조 (근로계약서 교부)',
        content: () => '"사업주"는 근로계약을 체결함과 동시에 본 계약서를 "근로자"에게 교부한다.',
      },
      {
        heading: '제10조 (기타)',
        content: () => '이 계약에 정함이 없는 사항은 근로기준법령에 정하는 바에 따른다.',
      },
    ],
    signature: true,
  },

  // ========== 5. 프리랜서(위임) 계약서 ==========
  freelancer: {
    title: '업무위탁(프리랜서) 계약서',
    sections: [
      {
        heading: '제1조 (목적)',
        content: () => '본 계약은 "위탁자"(이하 "갑")가 "수탁자"(이하 "을")에게 업무를 위탁하고, "을"이 이를 수행함에 있어 필요한 사항을 정함을 목적으로 한다.',
      },
      {
        heading: '제2조 (계약기간)',
        content: (d) => `${d.contractStart} 부터 ${d.contractEnd || '프로젝트 완료 시'} 까지`,
      },
      {
        heading: '제3조 (위탁 업무)',
        content: (d) => {
          let text = '';
          if (d.projectName) text += `프로젝트명: ${d.projectName}\n`;
          text += `업무내용: ${d.jobDescription || '별도 협의'}`;
          if (d.deliverables) text += `\n결과물: ${d.deliverables}`;
          return text;
        },
      },
      {
        heading: '제4조 (보수)',
        content: (d) => {
          let text = '';
          if (d.totalFee) text += `총 계약금액: ${d.totalFee.toLocaleString()}원\n`;
          if (d.monthlyFee) text += `월 보수: ${d.monthlyFee.toLocaleString()}원\n`;
          text += `지급일: ${d.payDay}\n지급방법: ${d.payMethod}`;
          if (d.paymentSchedule) text += `\n지급일정: ${d.paymentSchedule}`;
          text += '\n\n※ 원천징수 3.3% (소득세 3% + 지방소득세 0.3%) 공제 후 지급';
          return text;
        },
      },
      {
        heading: '제5조 (업무수행)',
        content: () => '"을"은 독립적인 지위에서 업무를 수행하며, "갑"의 지휘·감독을 받지 않는다.\n"을"은 업무 수행에 필요한 장비와 도구를 자체적으로 준비한다.',
      },
      {
        heading: '제6조 (비밀유지)',
        content: () => '"을"은 업무 수행 과정에서 알게 된 "갑"의 영업비밀을 계약기간 중은 물론 계약 종료 후에도 제3자에게 누설하지 않는다.',
      },
      {
        heading: '제7조 (계약 해지)',
        content: () => '양 당사자는 30일 전 서면 통지로 본 계약을 해지할 수 있다.\n다만 상대방이 계약을 위반한 경우 즉시 해지할 수 있다.',
      },
      {
        heading: '제8조 (손해배상)',
        content: () => '일방이 계약 위반으로 상대방에게 손해를 끼친 경우 그 손해를 배상한다.',
      },
      {
        heading: '제9조 (기타)',
        content: () => '본 계약에 정하지 않은 사항은 민법 및 관련 법률에 따른다.\n본 계약은 근로기준법상 근로계약이 아닌 민법상 위임계약임을 확인한다.',
      },
    ],
    signatureLabels: { employer: '위탁자 (갑)', employee: '수탁자 (을)' },
    signature: true,
  },
};
