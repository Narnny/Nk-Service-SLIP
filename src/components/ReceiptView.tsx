import React from 'react';
import { 
  Laptop, 
  Printer, 
  Smartphone, 
  Video, 
  Wrench, 
  Package, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  UserCheck, 
  FileText, 
  Coins, 
  ListOrdered,
  MapPin, 
  Heart,
  QrCode,
  Truck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ReceiptData } from '../types';
import { NkLogo } from './NkLogo';
import { formatKip, formatLaoDateDisplay } from '../utils/laoUtils';

interface ReceiptViewProps {
  receipt: ReceiptData;
  onOpenCustomerSign?: () => void;
  onOpenReceiverSign?: () => void;
  onVerifyClick?: () => void;
  isInteractive?: boolean;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  receipt,
  onOpenCustomerSign,
  onOpenReceiverSign,
  onVerifyClick,
  isInteractive = false
}) => {
  // Unique verification URL for this receipt
  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(receipt.receiptNo || receipt.id || '')}`
    : `https://nkservice.la/verify/${receipt.receiptNo || '000001'}`;

  // Ensure we display 8 rows like the original template
  const rows = Array.from({ length: 8 }, (_, index) => {
    const item = receipt.items?.[index];
    return {
      no: index + 1,
      name: item?.name || '',
      qty: item?.qty || '',
      details: item?.details || '',
      amount: item?.amount ? formatKip(item.amount) : ''
    };
  });

  return (
    <div 
      id="printable-receipt" 
      className="bg-white text-slate-900 mx-auto max-w-[820px] w-full p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-2 print:m-0 print:max-w-none print:w-full font-lao transition-all"
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
        {/* Left: Logo */}
        <div className="flex-shrink-0 flex justify-center sm:justify-start">
          <NkLogo size="md" />
        </div>

        {/* Center: Company Name & Title */}
        <div className="text-center flex-1 px-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a3a60] tracking-tight">
            ຮ້ານ ເອັມເຄ ບໍລິການ
          </h1>
          <h2 className="text-xl sm:text-2xl font-black text-[#0369a1] tracking-wider mt-0.5">
            NK SERVICE
          </h2>
        </div>

        {/* Right: Slogan Badge */}
        <div className="flex-shrink-0 text-center sm:text-right">
          <div className="inline-block transform rotate-1 text-[#0284c7]">
            <div className="text-base sm:text-lg font-bold">ໄວ້ໃຈໄດ້</div>
            <div className="text-sm sm:text-base font-extrabold tracking-tight">ບໍລິການມືອາຊີບ</div>
            <div className="w-full flex justify-center sm:justify-end gap-1 mt-0.5">
              <span className="w-10 h-0.5 bg-[#0284c7] rounded-full"></span>
              <span className="w-4 h-0.5 bg-[#0ea5e9] rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Service Icons Row */}
      <div className="grid grid-cols-5 gap-2 my-4 text-center">
        {/* Computer */}
        <div className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all ${
          receipt.category === 'computer' 
            ? 'border-[#0369a1] bg-blue-50/70 text-[#0a3a60] shadow-xs' 
            : 'border-slate-300/80 bg-white text-slate-700'
        }`}>
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#0369a1] mb-1">
            <Laptop className="w-5 h-5" />
          </div>
          <span className="leading-tight">ຄອມພິວເຕີ</span>
          <span className="text-[9px] text-slate-500 font-normal">ອຸປະກອນ IT</span>
        </div>

        {/* Printer */}
        <div className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all ${
          receipt.category === 'printer' 
            ? 'border-[#0369a1] bg-blue-50/70 text-[#0a3a60] shadow-xs' 
            : 'border-slate-300/80 bg-white text-slate-700'
        }`}>
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#0369a1] mb-1">
            <Printer className="w-5 h-5" />
          </div>
          <span className="leading-tight">ເຄື່ອງພິມ</span>
          <span className="text-[9px] text-slate-500 font-normal">Printer</span>
        </div>

        {/* Phone */}
        <div className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all ${
          receipt.category === 'phone' 
            ? 'border-[#0369a1] bg-blue-50/70 text-[#0a3a60] shadow-xs' 
            : 'border-slate-300/80 bg-white text-slate-700'
        }`}>
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#0369a1] mb-1">
            <Smartphone className="w-5 h-5" />
          </div>
          <span className="leading-tight">ໂທລະສັບ</span>
          <span className="text-[9px] text-slate-500 font-normal">ທຸກລຸ້ນ</span>
        </div>

        {/* CCTV */}
        <div className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all ${
          receipt.category === 'cctv' 
            ? 'border-[#0369a1] bg-blue-50/70 text-[#0a3a60] shadow-xs' 
            : 'border-slate-300/80 bg-white text-slate-700'
        }`}>
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#0369a1] mb-1">
            <Video className="w-5 h-5" />
          </div>
          <span className="leading-tight">CCTV</span>
          <span className="text-[9px] text-slate-500 font-normal">ຕິດຕັ້ງ/ສ້ອມແປງ</span>
        </div>

        {/* Other */}
        <div className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all ${
          receipt.category === 'other' 
            ? 'border-[#0369a1] bg-blue-50/70 text-[#0a3a60] shadow-xs' 
            : 'border-slate-300/80 bg-white text-slate-700'
        }`}>
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#0369a1] mb-1">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="leading-tight">ບໍລິການອື່ນໆ</span>
          <span className="text-[9px] text-slate-500 font-normal">IT Support</span>
        </div>
      </div>

      {/* 3. Main Receipt Banner */}
      <div className="bg-gradient-to-r from-[#07365d] via-[#09477a] to-[#0a528e] text-white rounded-2xl p-3 sm:p-4 my-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-white/10 p-2 sm:p-2.5 rounded-xl border border-white/20">
            <Package className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              ໃບບິນ ຝາກເຄື່ອງ
            </h2>
            <p className="text-xs sm:text-sm font-bold tracking-widest text-sky-200">
              DEPOSIT RECEIPT
            </p>
          </div>
        </div>

        {/* Receipt No. & QR Code Verification Box */}
        <div 
          onClick={onVerifyClick}
          className={`bg-white text-slate-900 p-2 sm:px-3 sm:py-2 rounded-xl shadow-inner border border-sky-200 flex items-center gap-2.5 ${
            onVerifyClick ? 'cursor-pointer hover:bg-sky-50/80 transition-colors' : ''
          }`}
          title="ສະແກນ QR Code ຫຼື ກົດເພື່ອກວດສອບໃບບິນ"
        >
          {/* QR Code */}
          <div className="p-1 bg-white rounded-lg border border-slate-200 flex-shrink-0 flex flex-col items-center">
            <QRCodeSVG 
              value={verifyUrl}
              size={54}
              level="M"
              includeMargin={false}
            />
            <span className="text-[7px] font-bold text-slate-500 mt-0.5 tracking-tight uppercase leading-none">
              Scan Verify
            </span>
          </div>

          <div className="text-right min-w-[95px]">
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-600">
              ເລກທີໃບບິນ :
            </div>
            <div className="text-sm sm:text-base font-black text-rose-600 tracking-wider font-mono">
              No. {receipt.receiptNo || '000001'}
            </div>
            <div className="text-[8px] sm:text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded-sm inline-block mt-0.5">
              ກວດສອບອອນລາຍ
            </div>
          </div>
        </div>
      </div>

      {/* 4. Customer Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 my-4 text-xs sm:text-sm">
        {/* Left Column */}
        <div className="flex flex-col gap-2.5">
          {/* Customer Name */}
          <div className="flex items-baseline gap-2">
            <div className="flex items-center gap-1.5 text-[#0a3a60] font-bold min-w-[70px]">
              <User className="w-4 h-4 text-[#0369a1]" />
              <span>ຊື່ລູກຄ້າ :</span>
            </div>
            <div className="flex-1 border-b border-dotted border-slate-400 font-semibold px-2 text-slate-800 truncate">
              {receipt.customerName || '_______________________'}
            </div>
          </div>

          {/* Customer Phone */}
          <div className="flex items-baseline gap-2">
            <div className="flex items-center gap-1.5 text-[#0a3a60] font-bold min-w-[70px]">
              <Phone className="w-4 h-4 text-[#0369a1]" />
              <span>ເບີໂທ :</span>
            </div>
            <div className="flex-1 border-b border-dotted border-slate-400 font-semibold px-2 text-slate-800">
              {receipt.customerPhone || '_______________________'}
            </div>
          </div>

          {/* Deposit Date */}
          <div className="flex items-baseline gap-2">
            <div className="flex items-center gap-1.5 text-[#0a3a60] font-bold min-w-[70px]">
              <Calendar className="w-4 h-4 text-[#0369a1]" />
              <span>ວັນທີຝາກ :</span>
            </div>
            <div className="flex-1 border-b border-dotted border-slate-400 font-semibold px-2 text-slate-800">
              {formatLaoDateDisplay(receipt.depositDate) || '_______________________'}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-2.5">
          {/* Deposit Time */}
          <div className="flex items-baseline gap-2">
            <div className="flex items-center gap-1.5 text-[#0a3a60] font-bold min-w-[70px]">
              <Clock className="w-4 h-4 text-[#0369a1]" />
              <span>ເວລາ :</span>
            </div>
            <div className="flex-1 border-b border-dotted border-slate-400 font-semibold px-2 text-slate-800">
              {receipt.depositTime || '_______________________'}
            </div>
          </div>

          {/* Receiver / Staff */}
          <div className="flex items-baseline gap-2">
            <div className="flex items-center gap-1.5 text-[#0a3a60] font-bold min-w-[70px]">
              <UserCheck className="w-4 h-4 text-[#0369a1]" />
              <span>ຜູ້ຮັບຝາກ :</span>
            </div>
            <div className="flex-1 border-b border-dotted border-slate-400 font-semibold px-2 text-slate-800 truncate">
              {receipt.receiverName || 'NK Service (ເຈົ້າໜ້າທີ່)'}
            </div>
          </div>

          {/* Document No */}
          <div className="flex items-baseline gap-2">
            <div className="flex items-center gap-1.5 text-[#0a3a60] font-bold min-w-[70px]">
              <FileText className="w-4 h-4 text-[#0369a1]" />
              <span>ເລກທີເອກະສານ :</span>
            </div>
            <div className="flex-1 border-b border-dotted border-slate-400 font-semibold px-2 text-slate-800">
              {receipt.documentNo || '_______________________'}
            </div>
          </div>
        </div>
      </div>

      {/* 4.1 Logistics & Shipping Details (ຂໍ້ມູນການຂົນສົ່ງລະຫວ່າງແຂວງ ແລະ ທີ່ຢູ່ຈັດສົ່ງ) */}
      <div className="my-3 p-3 bg-gradient-to-r from-sky-50/70 via-blue-50/50 to-indigo-50/40 rounded-xl border-2 border-[#09477a]/30 text-xs text-slate-800 print:bg-white print:border-slate-400">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#09477a]/20">
          <div className="flex items-center gap-1.5 text-[#0a3a60] font-extrabold text-xs">
            <Truck className="w-4 h-4 text-[#0369a1]" />
            <span className="uppercase tracking-wider">ຂໍ້ມູນການຂົນສົ່ງ & ສະຖານທີ່ຈັດສົ່ງ (Logistics & Delivery Route)</span>
          </div>
          {receipt.trackingNo && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500">ເລກບິນຂົນສົ່ງ:</span>
              <span className="font-mono font-black text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-200 shadow-2xs">
                {receipt.trackingNo}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Origin Box (ຕົ້ນທາງ) */}
          <div className="bg-white/80 p-2.5 rounded-lg border border-sky-200/80 print:border-slate-300">
            <div className="flex items-center gap-1 font-bold text-[#0a3a60] text-[11px] mb-1.5 pb-1 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>1. ຕົ້ນທາງ (Origin):</span>
            </div>
            <div className="space-y-1 pl-3 text-[11px] sm:text-xs">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-[85px] font-medium">• ສົ່ງຈາກແຂວງ:</span>
                <span className="font-bold text-slate-900">
                  {receipt.originProvince || 'ນະຄອນຫຼວງວຽງຈັນ'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-[85px] font-medium">• ຂົນສົ່ງໃດ:</span>
                <span className="font-semibold text-blue-800">
                  {receipt.originTransport || 'ອານຸສິດ ຂົນສົ່ງ'}
                </span>
              </div>
            </div>
          </div>

          {/* Destination Box (ປາຍທາງ) */}
          <div className="bg-white/80 p-2.5 rounded-lg border border-sky-200/80 print:border-slate-300">
            <div className="flex items-center gap-1 font-bold text-[#0a3a60] text-[11px] mb-1.5 pb-1 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>2. ປາຍທາງ (Destination):</span>
            </div>
            <div className="space-y-1 pl-3 text-[11px] sm:text-xs">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-[85px] font-medium">• ລົງແຂວງໃດ:</span>
                <span className="font-bold text-emerald-800">
                  {receipt.destProvince ? `ແຂວງ ${receipt.destProvince}` : (receipt.destDistrict || receipt.destVillage ? 'ຕາມທີ່ລະບຸ' : '_______________________')}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-500 min-w-[85px] font-medium">• ຂົນສົ່ງໃດ:</span>
                <span className="font-semibold text-blue-800">
                  {receipt.destTransport || '_______________________'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Address: Village, District, Province */}
        <div className="mt-2 pt-2 border-t border-sky-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs bg-white/60 p-2 rounded-lg">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-[#0a3a60] min-w-[95px] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>ບ້ານ, ເມືອງ, ແຂວງ:</span>
            </span>
            <span className="font-semibold text-slate-900">
              {[
                receipt.destVillage ? `ບ້ານ ${receipt.destVillage}` : '',
                receipt.destDistrict ? `ເມືອງ ${receipt.destDistrict}` : '',
                receipt.destProvince ? `ແຂວງ ${receipt.destProvince}` : ''
              ].filter(Boolean).join(', ') || '________________________________________________________'}
            </span>
          </div>

          {receipt.shippingNotes && (
            <div className="text-[10px] text-slate-600 italic">
              ໝາຍເຫດ: {receipt.shippingNotes}
            </div>
          )}
        </div>
      </div>

      {/* 5. Items Table */}
      <div className="my-3 overflow-hidden rounded-xl border-2 border-[#09477a]">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#09477a] text-white font-bold text-center">
              <th className="py-2.5 px-2 border-r border-[#0e5c9b] w-[7%]">ລ/ດ</th>
              <th className="py-2.5 px-3 border-r border-[#0e5c9b] w-[35%]">ລາຍການສິນຄ້າ / ອຸປະກອນ</th>
              <th className="py-2.5 px-2 border-r border-[#0e5c9b] w-[11%]">ຈຳນວນ</th>
              <th className="py-2.5 px-3 border-r border-[#0e5c9b] w-[27%]">ລາຍລະອຽດ / ສະພາບ</th>
              <th className="py-2.5 px-2 w-[20%]">ຈຳນວນເງິນຝາກ<br /><span className="text-[10px] font-normal">(ກີບ)</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.no} className="border-b border-[#09477a]/30 hover:bg-sky-50/30 transition-colors">
                <td className="py-2 px-2 text-center font-bold text-slate-700 border-r border-[#09477a]/30">
                  {row.no}
                </td>
                <td className="py-2 px-3 font-medium text-slate-800 border-r border-[#09477a]/30 truncate max-w-[200px]">
                  {row.name}
                </td>
                <td className="py-2 px-2 text-center font-medium text-slate-700 border-r border-[#09477a]/30">
                  {row.qty}
                </td>
                <td className="py-2 px-3 text-slate-600 border-r border-[#09477a]/30 truncate max-w-[180px]">
                  {row.details}
                </td>
                <td className="py-2 px-3 text-right font-semibold text-slate-900">
                  {row.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. Total Amount Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-3 p-3 bg-blue-50/60 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base">
          <div className="p-1.5 bg-[#0369a1] text-white rounded-lg">
            <Coins className="w-5 h-5" />
          </div>
          <span>ຈຳນວນເງິນຝາກທັງໝົດ :</span>
          <span className="text-lg sm:text-xl font-extrabold text-[#0a3a60] ml-1">
            {formatKip(receipt.totalAmount)}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-600">ກີບ</span>
        </div>

        {/* Amount in Lao Words */}
        <div className="text-xs sm:text-sm text-slate-700 font-medium italic text-center sm:text-right">
          ( <span className="font-semibold text-slate-900">{receipt.totalAmountWords || '...................................................'}</span> )
        </div>
      </div>

      {/* 7. Terms & Conditions */}
      <div className="my-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-[11px] sm:text-xs text-slate-700 leading-relaxed">
        <div className="flex items-center gap-1.5 text-[#0a3a60] font-bold mb-1.5 text-xs sm:text-sm">
          <ListOrdered className="w-4 h-4 text-[#0369a1]" />
          <span>ເງື່ອນໄຂການຝາກເຄື່ອງ :</span>
        </div>
        <ol className="list-decimal pl-5 space-y-1 text-slate-600">
          <li>ລູກຄ້າຈ່າຍຝາກເຄື່ອງແລ້ວ ແມ່ນຮັກສາເຄື່ອງໄວ້ໃຫ້ດີຄວນຈະຮັບເຄື່ອງ.</li>
          <li>ສິນຄ້າທີ່ຝາກໄວ້ ທຸກກໍລະນີບໍ່ສາມາດຄືນເງິນໄດ້ (ຍົກເວັ້ນກໍລະນີທີ່ຕົກລົງເປັນພິເສດ).</li>
          <li>ຖ້າບໍ່ມາຮັບພາຍໃນເວລາກຳນົດ ຮ້ານຈະຕິດຕໍ່ລູກຄ້າເພື່ອແຈ້ງເຕືອນ.</li>
          <li>ສິນຄ້າທີ່ຝາກໄວ້ ຖ້າເກີດຄວາມເສຍຫາຍ ຫຼື ສູນເສຍ ທາງຮ້ານຈະຮັບຜິດຊອບເທົ່າທີ່ສາມາດຊົດເຊີຍໄດ້.</li>
        </ol>
      </div>

      {/* 8. Signatures Section */}
      <div className="grid grid-cols-2 gap-8 my-6 text-center text-xs sm:text-sm">
        {/* Customer Signature */}
        <div className="flex flex-col items-center">
          <div className="font-bold text-slate-800">ລາຍເຊັນລູກຄ້າ</div>
          <div className="text-[11px] text-slate-500 mb-2">(ຜູ້ຝາກເຄື່ອງ)</div>
          
          <div 
            onClick={isInteractive ? onOpenCustomerSign : undefined}
            className={`w-48 h-20 border-b-2 border-dashed border-slate-400 flex items-center justify-center relative ${
              isInteractive ? 'cursor-pointer hover:bg-slate-50/60 rounded-t-lg transition-colors' : ''
            }`}
          >
            {receipt.customerSignature ? (
              <img 
                src={receipt.customerSignature} 
                alt="Customer Signature" 
                className="max-h-full max-w-full object-contain" 
              />
            ) : (
              <span className="text-[11px] text-slate-400 no-print select-none">
                {isInteractive ? 'ກົດເພື່ອເຊັນຊື່' : ''}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">...................................................</div>
        </div>

        {/* Receiver Signature */}
        <div className="flex flex-col items-center">
          <div className="font-bold text-slate-800">ລາຍເຊັນຜູ້ຮັບເຄື່ອງ</div>
          <div className="text-[11px] text-slate-500 mb-2">(NK Service)</div>
          
          <div 
            onClick={isInteractive ? onOpenReceiverSign : undefined}
            className={`w-48 h-20 border-b-2 border-dashed border-slate-400 flex items-center justify-center relative ${
              isInteractive ? 'cursor-pointer hover:bg-slate-50/60 rounded-t-lg transition-colors' : ''
            }`}
          >
            {receipt.receiverSignature ? (
              <img 
                src={receipt.receiverSignature} 
                alt="Receiver Signature" 
                className="max-h-full max-w-full object-contain" 
              />
            ) : (
              <span className="text-[11px] text-slate-400 no-print select-none">
                {isInteractive ? 'ກົດເພື່ອເຊັນຊື່' : ''}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">...................................................</div>
        </div>
      </div>

      {/* 9. Bottom Footer Banner */}
      <div className="bg-[#09477a] text-white rounded-xl py-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs font-medium shadow-sm">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-sky-300 flex-shrink-0" />
          <span>NK Service ບໍລິການດ້ານ IT ຄົບວົງຈອນ</span>
        </div>

        <div className="hidden sm:block w-px h-4 bg-sky-300/40"></div>

        <div className="flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-sky-300 flex-shrink-0" />
          <span className="font-bold tracking-wide">020 9977 4515</span>
          <span className="text-sky-200 text-[10px]">(ຕິດຕໍ່ / ສອບຖາມ)</span>
        </div>

        <div className="hidden sm:block w-px h-4 bg-sky-300/40"></div>

        <div className="flex items-center gap-1.5 text-sky-100 font-semibold">
          <span>ຂອບໃຈທີ່ໃຊ້ບໍລິການ NK Service</span>
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline" />
        </div>
      </div>
    </div>
  );
};
