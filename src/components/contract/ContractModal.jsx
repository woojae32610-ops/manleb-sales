import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, FileText, Check, AlertCircle } from 'lucide-react';
import { CONTRACT_TYPES, CONTRACT_TYPE_LABELS, getRecommendations, assembleContractData, buildDailyScheduleFromEmployee } from './contractUtils.js';
import { generateDOCX } from './generateDOCX.js';
import { generatePDF } from './generatePDF.js';

const MIN_WAGE_2026 = 10320;

const ContractModal = ({ show, onClose, employees, fullStoreInfo, preselectedEmployeeId }) => {
  const [step, setStep] = useState(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(preselectedEmployeeId || '');
  const [selectedContractType, setSelectedContractType] = useState('');
  const [outputFormat, setOutputFormat] = useState('docx');
  const [generating, setGenerating] = useState(false);

  // 계약 상세 입력
  const [contractDetails, setContractDetails] = useState({
    contractStart: new Date().toISOString().split('T')[0],
    contractEnd: '',
    workplace: '',
    jobDescription: '',
    payDay: '매월 10일',
    payMethod: '계좌이체',
    restDay: '일요일',
    // 프리랜서 전용
    projectName: '',
    totalAmount: '',
    paymentSchedule: '',
    deliverables: '',
  });

  useEffect(() => {
    if (show) {
      setStep(1);
      setSelectedEmployeeId(preselectedEmployeeId || '');
      setSelectedContractType('');
      setOutputFormat('docx');
      setGenerating(false);
      setContractDetails({
        contractStart: new Date().toISOString().split('T')[0],
        contractEnd: '',
        workplace: fullStoreInfo?.storeName || '',
        jobDescription: '',
        payDay: '매월 10일',
        payMethod: '계좌이체',
        restDay: '일요일',
        projectName: '',
        totalAmount: '',
        paymentSchedule: '',
        deliverables: '',
      });
    }
  }, [show, preselectedEmployeeId, fullStoreInfo]);

  if (!show) return null;

  const selectedEmployee = employees.find(e => e.id === Number(selectedEmployeeId));
  const recommendations = selectedEmployee ? getRecommendations(selectedEmployee) : Object.entries(CONTRACT_TYPE_LABELS).map(([key, label]) => ({ type: key, label, recommended: false }));

  // 최저시급 경고
  const showMinWageWarning = selectedEmployee?.type === 'hourly' && Number(selectedEmployee.hourlyWage) < MIN_WAGE_2026;

  const handleDetail = (field, value) => {
    setContractDetails(prev => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 = selectedContractType !== '';
  const canDownload = contractDetails.contractStart;

  const handleDownload = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const employee = selectedEmployee || {
        name: '',
        type: 'hourly',
        hourlyWage: 0,
        monthlyWage: 0,
        dailyWage: 0,
        weeklyHours: 0,
        workDays: [],
        defaultStartTime: '09:00',
        defaultEndTime: '18:00',
        defaultBreak: 0,
        contractDailyHours: 0,
        taxType: 'insurance',
        insurance: {},
      };

      const contractData = assembleContractData({
        contractType: selectedContractType,
        employee,
        storeInfo: fullStoreInfo || {},
        contractDetails,
      });

      if (outputFormat === 'docx') {
        await generateDOCX(contractData);
      } else {
        await generatePDF(contractData);
      }
    } catch (err) {
      console.error('계약서 생성 오류:', err);
      alert('계약서 생성 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const schedule = selectedEmployee ? buildDailyScheduleFromEmployee(selectedEmployee) : [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900/95 z-10">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-xl font-bold text-white">
              {step === 1 ? '계약서 선택' : '계약서 상세 입력'}
            </h3>
            <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-lg">
              {step}/2
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* ===== STEP 1 ===== */}
          {step === 1 && (
            <div className="space-y-6">
              {/* 직원 선택 */}
              <div>
                <label className="block text-white/60 text-sm mb-2">직원 선택 (선택사항)</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setSelectedContractType('');
                  }}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="" className="bg-slate-800">빈 양식 (직원 선택 안 함)</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-slate-800">
                      {emp.name} ({emp.type === 'hourly' ? '시급제' : emp.type === 'monthly' ? '월급제' : emp.type === 'daily' ? '일용직' : emp.type === 'freelancer' ? '프리랜서' : '시급제'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 최저시급 경고 */}
              {showMinWageWarning && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-400 text-sm font-medium">최저시급 미만 경고</p>
                    <p className="text-white/60 text-xs mt-1">
                      현재 시급 {Number(selectedEmployee.hourlyWage).toLocaleString()}원은 2026년 최저시급 {MIN_WAGE_2026.toLocaleString()}원 미만입니다.
                    </p>
                  </div>
                </div>
              )}

              {/* 계약서 종류 선택 */}
              <div>
                <label className="block text-white/60 text-sm mb-2">계약서 종류</label>
                <div className="space-y-2">
                  {recommendations.map(item => (
                    <button
                      key={item.type}
                      onClick={() => setSelectedContractType(item.type)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                        selectedContractType === item.type
                          ? 'bg-indigo-500/20 border-indigo-400 ring-1 ring-indigo-400'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={`w-5 h-5 ${selectedContractType === item.type ? 'text-indigo-400' : 'text-white/40'}`} />
                        <span className={`font-medium ${selectedContractType === item.type ? 'text-white' : 'text-white/70'}`}>
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.recommended && (
                          <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-xs rounded-lg font-medium">
                            추천
                          </span>
                        )}
                        {selectedContractType === item.type && (
                          <Check className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 다음 버튼 */}
              <button
                onClick={() => canProceedStep1 && setStep(2)}
                disabled={!canProceedStep1}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  canProceedStep1
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                다음 <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ===== STEP 2 ===== */}
          {step === 2 && (
            <div className="space-y-6">
              {/* 선택 요약 */}
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-400 text-sm font-medium">{CONTRACT_TYPE_LABELS[selectedContractType]}</p>
                    <p className="text-white/50 text-xs mt-1">
                      {selectedEmployee ? `${selectedEmployee.name}` : '빈 양식'}
                    </p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-white/40 hover:text-white transition-all">
                    변경
                  </button>
                </div>
              </div>

              {/* 사업주 정보 (자동) */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-cyan-400 font-medium mb-3">사업주 정보 (자동)</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/40">매장명: </span>
                    <span className="text-white">{fullStoreInfo?.storeName || '미입력'}</span>
                  </div>
                  <div>
                    <span className="text-white/40">대표자: </span>
                    <span className="text-white">{fullStoreInfo?.ownerName || '미입력'}</span>
                  </div>
                  <div>
                    <span className="text-white/40">사업자번호: </span>
                    <span className="text-white">{fullStoreInfo?.businessNumber || '미입력'}</span>
                  </div>
                  <div>
                    <span className="text-white/40">주소: </span>
                    <span className="text-white">{fullStoreInfo?.storeAddress || '미입력'}</span>
                  </div>
                </div>
                {(!fullStoreInfo?.ownerName || !fullStoreInfo?.businessNumber) && (
                  <p className="text-xs text-amber-400 mt-2">* 내 데이터 탭에서 사업자 정보를 입력하면 자동으로 반영됩니다.</p>
                )}
              </div>

              {/* 근로자 정보 (자동) */}
              {selectedEmployee && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-sm text-cyan-400 font-medium mb-3">근로자 정보 (자동)</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-white/40">이름: </span>
                      <span className="text-white">{selectedEmployee.name}</span>
                    </div>
                    <div>
                      <span className="text-white/40">고용형태: </span>
                      <span className="text-white">
                        {selectedEmployee.type === 'hourly' ? '시급제' : selectedEmployee.type === 'monthly' ? '월급제' : selectedEmployee.type === 'daily' ? '일용직' : selectedEmployee.type === 'freelancer' ? '프리랜서' : '시급제'}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40">급여: </span>
                      <span className="text-white">
                        {selectedEmployee.type === 'freelancer' ? `월 ${(selectedEmployee.monthlyFee || 0).toLocaleString()}원` : selectedEmployee.taxType === 'daily' ? `일 ${(selectedEmployee.dailyWage || 0).toLocaleString()}원` : selectedEmployee.type === 'hourly' ? `시 ${(selectedEmployee.hourlyWage || 0).toLocaleString()}원` : `월 ${(selectedEmployee.monthlyWage || 0).toLocaleString()}원`}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40">주간 근무: </span>
                      <span className="text-white">{selectedEmployee.weeklyHours || 0}시간</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 계약 조건 입력 */}
              <div className="space-y-4">
                <p className="text-sm text-cyan-400 font-medium">계약 조건</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 text-xs mb-1">계약 시작일 *</label>
                    <input
                      type="date"
                      value={contractDetails.contractStart}
                      onChange={(e) => handleDetail('contractStart', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">계약 종료일</label>
                    <input
                      type="date"
                      value={contractDetails.contractEnd}
                      onChange={(e) => handleDetail('contractEnd', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-xs mb-1">근무장소</label>
                  <input
                    type="text"
                    value={contractDetails.workplace}
                    onChange={(e) => handleDetail('workplace', e.target.value)}
                    placeholder={fullStoreInfo?.storeName || '매장명'}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-xs mb-1">업무내용</label>
                  <input
                    type="text"
                    value={contractDetails.jobDescription}
                    onChange={(e) => handleDetail('jobDescription', e.target.value)}
                    placeholder="예: 매장 운영 및 고객 서비스"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-white/60 text-xs mb-1">급여 지급일</label>
                    <input
                      type="text"
                      value={contractDetails.payDay}
                      onChange={(e) => handleDetail('payDay', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">지급방법</label>
                    <select
                      value={contractDetails.payMethod}
                      onChange={(e) => handleDetail('payMethod', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 text-sm"
                    >
                      <option value="계좌이체" className="bg-slate-800">계좌이체</option>
                      <option value="현금" className="bg-slate-800">현금</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">주휴일</label>
                    <select
                      value={contractDetails.restDay}
                      onChange={(e) => handleDetail('restDay', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 text-sm"
                    >
                      {['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'].map(d => (
                        <option key={d} value={d} className="bg-slate-800">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 단시간/초단시간: 스케줄 테이블 미리보기 */}
                {(selectedContractType === CONTRACT_TYPES.PART_TIME || selectedContractType === CONTRACT_TYPES.ULTRA_SHORT) && selectedEmployee && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-sm text-cyan-400 font-medium mb-2">근로일별 근로시간 (자동)</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/5">
                            <th className="px-3 py-2 text-left text-white/60">요일</th>
                            <th className="px-3 py-2 text-center text-white/60">출근</th>
                            <th className="px-3 py-2 text-center text-white/60">퇴근</th>
                            <th className="px-3 py-2 text-center text-white/60">휴게</th>
                            <th className="px-3 py-2 text-right text-white/60">근로시간</th>
                          </tr>
                        </thead>
                        <tbody>
                          {schedule.map(s => (
                            <tr key={s.dayIndex} className={`border-b border-white/5 ${s.isWork ? '' : 'opacity-30'}`}>
                              <td className="px-3 py-2 text-white">{s.day}</td>
                              <td className="px-3 py-2 text-center text-white/70">{s.startTime || '-'}</td>
                              <td className="px-3 py-2 text-center text-white/70">{s.endTime || '-'}</td>
                              <td className="px-3 py-2 text-center text-white/70">{s.isWork ? `${s.breakHours}h` : '-'}</td>
                              <td className="px-3 py-2 text-right text-white">{s.isWork ? `${s.hours}h` : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 프리랜서 전용 필드 */}
                {selectedContractType === CONTRACT_TYPES.FREELANCER && (
                  <div className="space-y-3 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
                    <p className="text-sm text-indigo-400 font-medium">프리랜서 계약 정보</p>
                    <div>
                      <label className="block text-white/60 text-xs mb-1">프로젝트명</label>
                      <input
                        type="text"
                        value={contractDetails.projectName}
                        onChange={(e) => handleDetail('projectName', e.target.value)}
                        placeholder="예: 매장 홍보 디자인"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-1">총 계약금액 (원)</label>
                      <input
                        type="number"
                        value={contractDetails.totalAmount}
                        onChange={(e) => handleDetail('totalAmount', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-1">지급일정</label>
                      <input
                        type="text"
                        value={contractDetails.paymentSchedule}
                        onChange={(e) => handleDetail('paymentSchedule', e.target.value)}
                        placeholder="예: 착수금 50%, 완료 후 50%"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-1">결과물</label>
                      <input
                        type="text"
                        value={contractDetails.deliverables}
                        onChange={(e) => handleDetail('deliverables', e.target.value)}
                        placeholder="예: 디자인 시안 3종, 최종 파일"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 출력 형식 선택 */}
              <div>
                <p className="text-sm text-white/60 mb-2">출력 형식</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOutputFormat('docx')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all text-center ${
                      outputFormat === 'docx'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    <p className="font-medium">DOCX</p>
                    <p className="text-xs opacity-70">Word 문서</p>
                  </button>
                  <button
                    onClick={() => setOutputFormat('pdf')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all text-center ${
                      outputFormat === 'pdf'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    <p className="font-medium">PDF</p>
                    <p className="text-xs opacity-70">PDF 문서</p>
                  </button>
                </div>
              </div>

              {/* 다운로드 버튼 */}
              <button
                onClick={handleDownload}
                disabled={!canDownload || generating}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  canDownload && !generating
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" /> 계약서 다운로드
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractModal;
