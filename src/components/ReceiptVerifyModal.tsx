import React from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  Phone, 
  Calendar, 
  User, 
  Laptop, 
  ExternalLink,
  Copy,
  Check,
  Truck,
  MapPin
} from 'lucide-react';
import { ReceiptData } from '../types';
import { formatKip, formatLaoDateDisplay, STATUS_LABELS } from '../utils/laoUtils';
import { QRCodeSVG } from 'qrcode.react';

interface ReceiptVerifyModalProps {
  receipt: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
  verificationUrl: string;
}

export const ReceiptVerifyModal: React.FC<ReceiptVerifyModalProps> = ({
  receipt,
  isOpen,
  onClose,
  verificationUrl
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !receipt) return null;

  const statusInfo = STATUS_LABELS[receipt.status] || {
    label: receipt.status,
    color: 'text-slate-700',
    bg: 'bg-slate-100 border-slate-200'
  };

  const copyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs font-lao">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#09477a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">ຜົນການກວດສອບໃບບິນແທ້ (Official Verification)</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Official Verification Badge */}
          <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                ກວດສອບຖືກຕ້ອງ • NK SERVICE
              </div>
              <div className="text-sm font-black text-emerald-950">
                ໃບບິນຝາກເຄື່ອງສະບັບຈິງໃນລະບົບ
              </div>
            </div>
          </div>

          {/* QR Code and Quick Details */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 flex-shrink-0">
              <QRCodeSVG 
                value={verificationUrl}
                size={80}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-xs text-slate-500">ເລກທີໃບບິນ:</div>
              <div className="text-base font-black text-rose-600 font-mono">
                No. {receipt.receiptNo}
              </div>
              <div className="inline-block mt-1">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Key Receipt Info */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                ຊື່ລູກຄ້າ:
              </span>
              <span className="font-bold text-slate-800">{receipt.customerName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                ວັນທີ ແລະ ເວລາ:
              </span>
              <span className="font-semibold text-slate-700">
                {formatLaoDateDisplay(receipt.depositDate)} {receipt.depositTime}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                ອຸປະກອນ:
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                {receipt.items[0]?.name || 'ອຸປະກອນ IT'} {receipt.items.length > 1 ? `(+${receipt.items.length - 1})` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">ຍອດເງິນຝາກ:</span>
              <span className="font-extrabold text-[#09477a] text-sm">
                {formatKip(receipt.totalAmount)} ກີບ
              </span>
            </div>

            {/* Inter-provincial logistics */}
            {(receipt.originProvince || receipt.destProvince || receipt.destTransport || receipt.destVillage || receipt.destDistrict) && (
              <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200/80 space-y-1.5 text-[11px]">
                <div className="font-bold text-[#09477a] flex items-center gap-1 text-xs">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>ເສັ້ນທາງການຂົນສົ່ງ (Delivery Route) :</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ຕົ້ນທາງ (ສົ່ງຈາກ):</span>
                  <span className="font-semibold text-slate-800">
                    {receipt.originProvince || 'ນະຄອນຫຼວງວຽງຈັນ'} {receipt.originTransport ? `(${receipt.originTransport})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ປາຍທາງ (ລົງແຂວງ):</span>
                  <span className="font-bold text-emerald-800">
                    {receipt.destProvince ? `ແຂວງ ${receipt.destProvince}` : (receipt.destDistrict || 'ບໍ່ລະບຸ')} {receipt.destTransport ? `(${receipt.destTransport})` : ''}
                  </span>
                </div>
                {(receipt.destVillage || receipt.destDistrict) && (
                  <div className="flex items-start justify-between pt-1 border-t border-sky-100">
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>ທີ່ຢູ່:</span>
                    </span>
                    <span className="font-medium text-slate-700 text-right max-w-[240px]">
                      {[receipt.destVillage && `ບ.${receipt.destVillage}`, receipt.destDistrict && `ມ.${receipt.destDistrict}`, receipt.destProvince && `ແຂວງ ${receipt.destProvince}`].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {receipt.trackingNo && (
                  <div className="flex items-center justify-between pt-1 border-t border-sky-100">
                    <span className="text-slate-500">ເລກບິນຂົນສົ່ງ:</span>
                    <span className="font-mono font-bold text-rose-600 bg-white px-2 py-0.5 rounded-sm border border-rose-200">
                      {receipt.trackingNo}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification Link Copy */}
          <div className="pt-1">
            <div className="text-[11px] text-slate-500 mb-1">ລິ້ງກວດສອບສະເພາະໃບບິນນີ້:</div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={verificationUrl}
                className="w-full text-[11px] font-mono bg-slate-100 px-3 py-2 rounded-xl text-slate-600 border border-slate-200 select-all truncate" 
              />
              <button
                type="button"
                onClick={copyLink}
                className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 text-xs font-bold bg-[#09477a] hover:bg-[#07365d] text-white rounded-xl transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'ຄັດລອກແລ້ວ' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200 flex items-center justify-between text-xs text-sky-900">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-600" />
              <span>ສອບຖາມເພີ່ມເຕີມ: <strong>020 9977 4515</strong></span>
            </div>
            <span className="text-[10px] text-sky-700">ຮ້ານ ເອັມເຄ ບໍລິການ</span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            ປິດໜ້າຕ່າງ
          </button>
        </div>
      </div>
    </div>
  );
};
