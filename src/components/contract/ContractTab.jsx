import React from 'react';
import { FileText, Download, Plus, Briefcase } from 'lucide-react';
import { GlassCard } from '../ui/index.jsx';
import { CONTRACT_TYPE_LABELS, recommendContractType } from './contractUtils.js';

const ContractTab = ({ employees, onOpenContractModal, onOpenBlankContract }) => {
  return (
    <div className="space-y-6">
      {/* 계약서 작성 안내 */}
      <GlassCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          근로계약서 작성
        </h3>
        <p className="text-white/50 text-sm mb-4">
          등록된 직원 정보와 매장 정보를 기반으로 5종 근로계약서를 자동으로 작성합니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => onOpenContractModal(null)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" /> 계약서 작성하기
          </button>
          <button
            onClick={onOpenBlankContract}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white/70 rounded-xl font-medium hover:bg-white/20 transition-all border border-white/20"
          >
            <Download className="w-5 h-5" /> 빈 양식 다운로드
          </button>
        </div>
      </GlassCard>

      {/* 직원별 계약서 현황 */}
      <GlassCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-4">직원별 계약서</h3>
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 mb-2">등록된 직원이 없습니다</p>
            <p className="text-white/40 text-sm">직원 관리 탭에서 먼저 직원을 등록하세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map(emp => {
              const recommended = recommendContractType(emp);
              const label = CONTRACT_TYPE_LABELS[recommended] || '표준 근로계약서';
              return (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{emp.name}</p>
                      <p className="text-xs text-white/40">
                        추천: <span className="text-indigo-400">{label}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenContractModal(emp.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-all flex-shrink-0"
                  >
                    <FileText className="w-4 h-4" />
                    작성
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* 5종 계약서 안내 */}
      <GlassCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-4">계약서 종류 안내</h3>
        <div className="space-y-3">
          {[
            { type: '표준 근로계약서', desc: '정규직·상용직 (주 40시간 이내)', color: 'cyan' },
            { type: '단시간 근로계약서', desc: '주 15~35시간 시급제 근로자', color: 'blue' },
            { type: '초단시간 근로계약서', desc: '주 15시간 미만 (주휴수당 미적용)', color: 'purple' },
            { type: '일용직 근로계약서', desc: '일당 기반 근로자', color: 'orange' },
            { type: '프리랜서 계약서', desc: '업무위탁·3.3% 원천징수', color: 'indigo' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-${item.color}-400`} />
              <div>
                <p className="text-white text-sm font-medium">{item.type}</p>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default ContractTab;
