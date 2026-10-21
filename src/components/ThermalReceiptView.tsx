import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ReceiptData } from '../types';
import { formatKip, formatLaoDateDisplay, STATUS_LABELS } from '../utils/laoUtils';
import { Phone, MapPin } from 'lucide-react';

interface ThermalReceiptViewProps {
  receipt: ReceiptData;
}

export const ThermalReceiptView: React.FC<ThermalReceiptViewProps> = ({ receipt }) => {
  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(receipt.receiptNo || receipt.id || '')}`
    : `https://nkservice.la/verify/${receipt.receiptNo || '000001'}`;

  return (
    <div 
      id="printable-thermal-receipt"
      className="bg-white text-slate-900 mx-auto w-[320px] p-4 border border-dashed border-slate-300 font-mono text-xs font-lao leading-tight"
    >
      {/* Shop Header */}
      <div className="text-center pb-2 border-b-2 border-dashed border-slate-300">
        <h2 className="text-base font-black text-slate-900">ຮ້ານ ເອັມເຄ ບໍລິການ</h2>
        <h3 className="text-sm font-bold text-slate-700 tracking-wider">NK SERVICE</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">“ເບິ່ງແຍງທຸກອຸປະກອນ ດ້ວຍໃຈບໍລິການ”</p>
        <div className="text-[10px] text-slate-600 mt-1 flex items-center justify-center gap-1">
          <Phone className="w-3 h-3" />
          <span>020 9977 4515</span>
        </div>
      </div>

      {/* Slip Title & Receipt No */}
      <div className="my-2.5 text-center">
        <div className="font-extrabold text-sm uppercase">ໃບບິນ ຝາກເຄື່ອງ (SLIP)</div>
        <div className="text-xs font-bold text-rose-600">No. {receipt.receiptNo}</div>
      </div>

      {/* Info Rows */}
      <div className="space-y-1 py-2 border-b border-dashed border-slate-300 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">ວັນທີ-ເວລາ:</span>
          <span>{formatLaoDateDisplay(receipt.depositDate)} {receipt.depositTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">ລູກຄ້າ:</span>
          <span className="font-bold">{receipt.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">ເບີໂທ:</span>
          <span>{receipt.customerPhone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">ຜູ້ຮັບຝາກ:</span>
          <span>{receipt.receiverName || 'NK Service'}</span>
        </div>
      </div>

      {/* Shipping Details */}
      {/* Shipping Details */}
      {(receipt.originProvince || receipt.destProvince || receipt.destTransport || receipt.destVillage || receipt.destDistrict || receipt.trackingNo) && (
        <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-1">
          <div className="font-bold text-slate-900 uppercase">ຂໍ້ມູນການຂົນສົ່ງ (Delivery Route):</div>
          <div className="flex justify-between">
            <span className="text-slate-500">ສົ່ງຈາກແຂວງ:</span>
            <span className="font-semibold text-slate-800">{receipt.originProvince || 'ນະຄອນຫຼວງວຽງຈັນ'} {receipt.originTransport ? `(${receipt.originTransport})` : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ລົງແຂວງໃດ:</span>
            <span className="font-bold text-slate-900">{receipt.destProvince ? `ແຂວງ ${receipt.destProvince}` : (receipt.destDistrict || 'ຕາມທີ່ລະບຸ')}</span>
          </div>
          {receipt.destTransport && (
            <div className="flex justify-between">
              <span className="text-slate-500">ຂົນສົ່ງປາຍທາງ:</span>
              <span className="font-bold text-blue-900">{receipt.destTransport}</span>
            </div>
          )}
          {(receipt.destVillage || receipt.destDistrict) && (
            <div className="flex justify-between">
              <span className="text-slate-500">ທີ່ຢູ່:</span>
              <span className="text-right max-w-[210px] truncate">
                {[receipt.destVillage && `ບ.${receipt.destVillage}`, receipt.destDistrict && `ມ.${receipt.destDistrict}`, receipt.destProvince && `ແຂວງ ${receipt.destProvince}`].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          {receipt.trackingNo && (
            <div className="flex justify-between text-rose-600 font-bold pt-0.5">
              <span>ເລກບິນຂົນສົ່ງ:</span>
              <span className="font-mono">{receipt.trackingNo}</span>
            </div>
          )}
        </div>
      )}

      {/* Items list */}
      <div className="py-2 border-b-2 border-dashed border-slate-300">
        <div className="flex justify-between font-bold text-[11px] mb-1">
          <span>ລາຍການ</span>
          <span>ຈຳນວນ / ລາຄາ</span>
        </div>
        {receipt.items.map((item, idx) => (
          <div key={idx} className="py-1 text-[11px]">
            <div className="font-semibold text-slate-800">{idx + 1}. {item.name}</div>
            {item.details && (
              <div className="text-[10px] text-slate-500 pl-3">ອາການ: {item.details}</div>
            )}
            <div className="flex justify-between text-[10px] pl-3 text-slate-600">
              <span>ຈຳນວນ: {item.qty}</span>
              <span className="font-bold">{formatKip(item.amount)} ກີບ</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="py-2.5 border-b-2 border-dashed border-slate-300">
        <div className="flex justify-between items-center text-sm font-black">
          <span>ລວມຍອດເງິນຝາກ:</span>
          <span className="text-base text-[#09477a]">{formatKip(receipt.totalAmount)} ກີບ</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 italic text-center">
          ({receipt.totalAmountWords})
        </div>
      </div>

      {/* QR Code Scan Verification */}
      <div className="py-3 text-center flex flex-col items-center">
        <QRCodeSVG value={verifyUrl} size={70} level="M" />
        <span className="text-[9px] text-slate-500 mt-1">ສະແກນ QR Code ເພື່ອກວດສອບສະຖານະ</span>
      </div>

      {/* Footer Notes */}
      <div className="pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-500 text-center leading-relaxed">
        <p>* ກະລຸນານຳໃບບິນນີ້ມານຳ ເວລາມາຮັບເຄື່ອງ *</p>
        <p className="mt-1 font-bold text-slate-700">ຂອບໃຈທີ່ໃຊ້ບໍລິການ NK Service</p>
      </div>
    </div>
  );
};
