import React from 'react';
import { Store, User, Phone, MapPin, FileText } from 'lucide-react';
import { GlassCard } from '../ui/index.jsx';

const StoreSettingsForm = ({ storeInfo, setStoreInfo, storeName }) => {
  const handleChange = (field, value) => {
    setStoreInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <GlassCard className="p-6 mt-6" hover={false}>
      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <Store className="w-5 h-5 text-cyan-400" />
        매장/사업자 정보
      </h3>
      <p className="text-white/50 text-sm mb-4">
        계약서 자동 작성에 사용됩니다. 인건비 탭에서 계약서를 다운로드할 수 있습니다.
      </p>

      <div className="space-y-4">
        {/* 매장명 (읽기전용) */}
        <div>
          <label className="flex items-center gap-1.5 text-white/60 text-sm mb-1">
            <Store className="w-3.5 h-3.5" /> 매장명
          </label>
          <input
            type="text"
            value={storeName || ''}
            readOnly
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
          />
          <p className="text-xs text-white/30 mt-1">매장명은 상단에서 변경하세요</p>
        </div>

        {/* 대표자명 */}
        <div>
          <label className="flex items-center gap-1.5 text-white/60 text-sm mb-1">
            <User className="w-3.5 h-3.5" /> 대표자명 (사업주)
          </label>
          <input
            type="text"
            value={storeInfo.ownerName || ''}
            onChange={(e) => handleChange('ownerName', e.target.value)}
            placeholder="예: 홍길동"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* 사업자등록번호 */}
        <div>
          <label className="flex items-center gap-1.5 text-white/60 text-sm mb-1">
            <FileText className="w-3.5 h-3.5" /> 사업자등록번호
          </label>
          <input
            type="text"
            value={storeInfo.businessNumber || ''}
            onChange={(e) => handleChange('businessNumber', e.target.value)}
            placeholder="예: 123-45-67890"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* 사업장 주소 */}
        <div>
          <label className="flex items-center gap-1.5 text-white/60 text-sm mb-1">
            <MapPin className="w-3.5 h-3.5" /> 사업장 주소
          </label>
          <input
            type="text"
            value={storeInfo.storeAddress || ''}
            onChange={(e) => handleChange('storeAddress', e.target.value)}
            placeholder="예: 서울시 강남구 테헤란로 123"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* 전화번호 */}
        <div>
          <label className="flex items-center gap-1.5 text-white/60 text-sm mb-1">
            <Phone className="w-3.5 h-3.5" /> 전화번호
          </label>
          <input
            type="text"
            value={storeInfo.storePhone || ''}
            onChange={(e) => handleChange('storePhone', e.target.value)}
            placeholder="예: 02-1234-5678"
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>
    </GlassCard>
  );
};

export default StoreSettingsForm;
