import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Edit3, 
  Trash2, 
  Copy, 
  Share2, 
  Check, 
  PenTool, 
  Clock,
  QrCode 
} from 'lucide-react';
import { ReceiptData, ReceiptStatus } from '../types';
import { ReceiptView } from './ReceiptView';
import { ThermalReceiptView } from './ThermalReceiptView';
import { SignatureModal } from './SignatureModal';
import { ReceiptVerifyModal } from './ReceiptVerifyModal';
import { STATUS_LABELS } from '../utils/laoUtils';
import { 
  printReceiptElement, 
  downloadReceiptAsPDF, 
  downloadReceiptAsImage 
} from '../utils/printHelper';
import { 
  FileDown, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface ReceiptDetailModalProps {
  receipt: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (receipt: ReceiptData) => void;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (receipt: ReceiptData) => void;
  onUpdateStatus: (id: string, status: ReceiptStatus) => Promise<void>;
  onUpdateReceipt: (receipt: ReceiptData) => Promise<void>;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onUpdateStatus,
  onUpdateReceipt
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  const [isExporting, setIsExporting] = useState<'print' | 'pdf' | 'image' | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [signModalState, setSignModalState] = useState<{
    isOpen: boolean;
    type: 'customer' | 'receiver';
    title: string;
  }>({
    isOpen: false,
    type: 'customer',
    title: ''
  });

  if (!isOpen || !receipt) return null;

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 4500);
  };

  const handlePrint = async () => {
    const targetId = printFormat === 'a4' ? 'printable-receipt' : 'printable-thermal-receipt';
    const isThermal = printFormat === 'thermal';
    const fileName = `NK_Service_${isThermal ? 'Slip_' : ''}No_${receipt.receiptNo}`;

    setIsExporting('print');
    showNotice('ກຳລັງເປີດໜ້າຕ່າງສັ່ງພິມ ແລະ ດາວໂຫຼດໄຟລ໌ PDF...');

    // 1. Attempt window.print()
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.warn('Browser window.print() notice:', e);
    }

    // 2. Also automatically download PDF so if iframe blocked print, user has the file ready to print!
    try {
      await downloadReceiptAsPDF(targetId, fileName, isThermal);
      showNotice('ດາວໂຫຼດ PDF ສຳເລັດ! ສາມາດເປີດປິ່ນ ຫຼື ສົ່ງໃຫ້ລູກຄ້າໄດ້ທັນທີ.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadPDF = async () => {
    const targetId = printFormat === 'a4' ? 'printable-receipt' : 'printable-thermal-receipt';
    const isThermal = printFormat === 'thermal';
    const fileName = `NK_Service_${isThermal ? 'Slip_' : ''}No_${receipt.receiptNo}`;

    setIsExporting('pdf');
    showNotice('ກຳລັງສ້າງໄຟລ໌ PDF ໃບບິນ...');
    try {
      await downloadReceiptAsPDF(targetId, fileName, isThermal);
      showNotice('ດາວໂຫຼດໄຟລ໌ PDF ສຳເລັດຮຽບຮ້ອຍແລ້ວ!');
    } catch (err) {
      console.error(err);
      showNotice('ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF');
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadImage = async () => {
    const targetId = printFormat === 'a4' ? 'printable-receipt' : 'printable-thermal-receipt';
    const fileName = `NK_Service_No_${receipt.receiptNo}`;

    setIsExporting('image');
    showNotice('ກຳລັງສ້າງຮູບພາບໃບບິນ PNG (High Quality)...');
    try {
      await downloadReceiptAsImage(targetId, fileName);
      showNotice('ດາວໂຫຼດຮູບພາບໃບບິນສຳເລັດແລ້ວ!');
    } catch (err) {
      console.error(err);
      showNotice('ເກີດຂໍ້ຜິດພາດໃນການສ້າງຮູບພາບ');
    } finally {
      setIsExporting(null);
    }
  };

  const handleShare = () => {
    const text = `ໃບບິນຝາກເຄື່ອງ NK Service No. ${receipt.receiptNo}\nລູກຄ້າ: ${receipt.customerName}\nຍອດເງິນ: ${receipt.totalAmount} ກີບ`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveSignature = async (dataUrl: string) => {
    if (!receipt.id) return;
    const updated = {
      ...receipt,
      [signModalState.type === 'customer' ? 'customerSignature' : 'receiverSignature']: dataUrl,
      updatedAt: new Date().toISOString()
    };
    await onUpdateReceipt(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0 font-lao">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              No. {receipt.receiptNo}
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs text-slate-500">ສະຖານະ:</span>
              <select
                value={receipt.status}
                onChange={e => onUpdateStatus(receipt.id!, e.target.value as ReceiptStatus)}
                className={`text-xs font-bold px-3 py-1 rounded-full border focus:outline-hidden ${STATUS_LABELS[receipt.status]?.bg} ${STATUS_LABELS[receipt.status]?.color}`}
              >
                <option value="pending">ລໍຖ້າກວດເຊັກ</option>
                <option value="in_progress">ກຳລັງສ້ອມແປງ</option>
                <option value="completed">ສຳເລັດແລ້ວ</option>
                <option value="picked_up">ລູກຄ້າມາຮັບແລ້ວ</option>
                <option value="cancelled">ຍົກເລີກ</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Paper format switcher */}
            <div className="flex bg-slate-200/80 p-0.5 rounded-xl border border-slate-300">
              <button
                type="button"
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  printFormat === 'a4'
                    ? 'bg-white text-[#09477a] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ໃບບິນ A4
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  printFormat === 'thermal'
                    ? 'bg-white text-[#09477a] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ສະລິບ 80mm
              </button>
            </div>

            <button
              onClick={() => setIsVerifyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
              title="ກວດສອບ QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Verify</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isExporting !== null}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-[#09477a] to-[#07365d] hover:from-[#07365d] hover:to-[#052b49] text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isExporting === 'print' ? (
                <Loader2 className="w-4 h-4 text-sky-300 animate-spin" />
              ) : (
                <Printer className="w-4 h-4 text-sky-300" />
              )}
              <span>{isExporting === 'print' ? 'ກຳລັງສັ່ງພິມ...' : 'ປິ່ນໃບບິນ (Print)'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              title="ດາວໂຫຼດເປັນໄຟລ໌ PDF ສຳລັບສັ່ງພິມ ຫຼື ສົ່ງໃຫ້ລູກຄ້າ"
            >
              {isExporting === 'pdf' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>ດາວໂຫຼດ PDF</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isExporting !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              title="ດາວໂຫຼດເປັນຮູບພາບ PNG"
            >
              {isExporting === 'image' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>ດາວໂຫຼດຮູບ (PNG)</span>
            </button>

            <button
              onClick={() => onEdit(receipt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>ແກ້ໄຂ</span>
            </button>

            <button
              onClick={() => onDuplicate(receipt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>ສຳເນົາ</span>
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
              title="ຄັດລອກຂໍ້ມູນ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Export / Print Notification Banner */}
        {statusNotice && (
          <div className="no-print bg-blue-50 border-b border-blue-200 px-6 py-2.5 flex items-center justify-between text-xs text-blue-900 font-medium animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{statusNotice}</span>
            </div>
            <button 
              onClick={() => setStatusNotice(null)}
              className="text-blue-500 hover:text-blue-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100/70 print:p-0 print:bg-white flex-1">
          {printFormat === 'a4' ? (
            <ReceiptView
              receipt={receipt}
              isInteractive={true}
              onVerifyClick={() => setIsVerifyOpen(true)}
              onOpenCustomerSign={() => setSignModalState({
                isOpen: true,
                type: 'customer',
                title: 'ລາຍເຊັນລູກຄ້າ (ຜູ້ຝາກເຄື່ອງ)'
              })}
              onOpenReceiverSign={() => setSignModalState({
                isOpen: true,
                type: 'receiver',
                title: 'ລາຍເຊັນຜູ້ຮັບເຄື່ອງ (NK Service)'
              })}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-xs text-slate-500 mb-2 font-medium no-print">
                ຕົວຢ່າງໃບຮັບເຄື່ອງຍ່ອຍຂະໜາດ 80mm ສຳລັບເຄື່ອງພິມ Thermal POS Slip
              </div>
              <ThermalReceiptView receipt={receipt} />
            </div>
          )}
        </div>
      </div>

      {/* QR Code Verification Modal */}
      <ReceiptVerifyModal
        receipt={receipt}
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        verificationUrl={
          typeof window !== 'undefined'
            ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(receipt.receiptNo || receipt.id || '')}`
            : `https://nkservice.la/verify/${receipt.receiptNo}`
        }
      />

      {/* Signature Modal */}
      <SignatureModal
        isOpen={signModalState.isOpen}
        title={signModalState.title}
        existingSignature={
          signModalState.type === 'customer' 
            ? receipt.customerSignature 
            : receipt.receiverSignature
        }
        onSave={handleSaveSignature}
        onClose={() => setSignModalState({ ...signModalState, isOpen: false })}
      />
    </div>
  );
};
