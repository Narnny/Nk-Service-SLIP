import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  PenTool, 
  User, 
  Phone, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft,
  Printer,
  Share2,
  FileDown,
  Truck,
  MapPin
} from 'lucide-react';
import { 
  ReceiptData, 
  ReceiptItem, 
  ServiceCategory, 
  CustomerData, 
  LAO_PROVINCES, 
  LAO_TRANSPORTS 
} from '../types';
import { 
  getTodayDateString, 
  getCurrentTimeString, 
  numberToLaoWords, 
  formatKip 
} from '../utils/laoUtils';
import { SignatureModal } from './SignatureModal';
import { ReceiptView } from './ReceiptView';
import { ReceiptVerifyModal } from './ReceiptVerifyModal';
import { printReceiptElement, downloadReceiptAsPDF } from '../utils/printHelper';

interface ReceiptFormProps {
  initialData?: ReceiptData | null;
  savedCustomers: CustomerData[];
  onSave: (receipt: ReceiptData) => Promise<void>;
  onCancel: () => void;
  currentUser: { uid: string; email?: string; displayName?: string } | null;
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  initialData,
  savedCustomers,
  onSave,
  onCancel,
  currentUser
}) => {
  const [formData, setFormData] = useState<ReceiptData>(() => {
    if (initialData) return initialData;

    const defaultItems: ReceiptItem[] = [
      { no: 1, name: '', qty: 1, details: '', amount: 0 }
    ];

    return {
      receiptNo: String(Math.floor(100000 + Math.random() * 900000)),
      customerName: '',
      customerPhone: '',
      depositDate: getTodayDateString(),
      depositTime: getCurrentTimeString(),
      receiverName: currentUser?.displayName || 'NK Service (ເຈົ້າໜ້າທີ່)',
      documentNo: '',
      category: 'computer',
      items: defaultItems,
      totalAmount: 0,
      totalAmountWords: 'ສູນກີບຖ້ວນ',
      status: 'pending',
      notes: '',
      originProvince: 'ນະຄອນຫຼວງວຽງຈັນ',
      originTransport: 'ອານຸສິດ ຂົນສົ່ງ (Anousith Express)',
      destProvince: '',
      destDistrict: '',
      destVillage: '',
      destTransport: '',
      trackingNo: '',
      shippingNotes: '',
      customerSignature: '',
      receiverSignature: '',
      userId: currentUser?.uid || 'guest-staff',
      userEmail: currentUser?.email || ''
    };
  });

  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [signModalState, setSignModalState] = useState<{
    isOpen: boolean;
    type: 'customer' | 'receiver';
    title: string;
  }>({
    isOpen: false,
    type: 'customer',
    title: ''
  });

  // Calculate total and lao words whenever items change
  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const words = numberToLaoWords(total);
    setFormData(prev => ({
      ...prev,
      totalAmount: total,
      totalAmountWords: words
    }));
  }, [formData.items]);

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: any) => {
    const updated = [...formData.items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'amount' ? (Number(value) || 0) : value
    };
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const addItemRow = () => {
    if (formData.items.length >= 8) return;
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          no: prev.items.length + 1,
          name: '',
          qty: 1,
          details: '',
          amount: 0
        }
      ]
    }));
  };

  const removeItemRow = (index: number) => {
    if (formData.items.length <= 1) return;
    const updated = formData.items
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, no: idx + 1 }));
    setFormData(prev => ({ ...prev, items: updated }));
  };

  // Quick preset items for IT shop
  const applyPreset = (presetName: string, category: ServiceCategory, details: string, suggestedAmount: number) => {
    const emptyIndex = formData.items.findIndex(it => !it.name.trim());
    if (emptyIndex !== -1) {
      handleItemChange(emptyIndex, 'name', presetName);
      handleItemChange(emptyIndex, 'details', details);
      handleItemChange(emptyIndex, 'amount', suggestedAmount);
    } else if (formData.items.length < 8) {
      setFormData(prev => ({
        ...prev,
        category,
        items: [
          ...prev.items,
          {
            no: prev.items.length + 1,
            name: presetName,
            qty: 1,
            details,
            amount: suggestedAmount
          }
        ]
      }));
    }
  };

  const handleCustomerSelect = (customer: CustomerData) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.name,
      customerPhone: customer.phone,
      destVillage: customer.village || prev.destVillage,
      destDistrict: customer.district || prev.destDistrict,
      destProvince: customer.province || prev.destProvince,
      destTransport: customer.transport || prev.destTransport,
      notes: customer.notes || prev.notes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      alert('ກະລຸນາປ້ອນຊື່ລູກຄ້າ');
      return;
    }
    if (!formData.customerPhone.trim()) {
      alert('ກະລຸນາປ້ອນເບີໂທລູກຄ້າ');
      return;
    }

    try {
      setSaving(true);
      await onSave({
        ...formData,
        userId: currentUser?.uid || formData.userId || 'staff-user',
        userEmail: currentUser?.email || formData.userEmail || '',
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error(err);
      alert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-lao max-w-5xl mx-auto space-y-6">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ກັບຄືນໜ້າຫຼັກ</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isPreview
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isPreview ? 'ແກ້ໄຂແບບຟອມ (Edit)' : 'ເບິ່ງຕົວຢ່າງໃບບິນ (Preview)'}</span>
          </button>

          {isPreview && (
            <>
              <button
                type="button"
                onClick={async () => {
                  try {
                    window.focus();
                    window.print();
                  } catch (e) {
                    console.warn(e);
                  }
                  await downloadReceiptAsPDF('printable-receipt', `NK_Service_No_${formData.receiptNo}`, false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#09477a] text-white hover:bg-[#07365d] shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-sky-300" />
                <span>ປິ່ນໃບບິນ (Print)</span>
              </button>

              <button
                type="button"
                onClick={() => downloadReceiptAsPDF('printable-receipt', `NK_Service_No_${formData.receiptNo}`, false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-xs transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>ດາວໂຫຼດ PDF</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-[#09477a] text-white hover:bg-[#07365d] shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກໃບບິນ (Save)'}</span>
          </button>
        </div>
      </div>

      {isPreview ? (
        <div className="bg-slate-100/80 p-4 sm:p-8 rounded-3xl border border-slate-200">
          <div className="mb-4 text-center text-sm text-slate-500 font-medium">
            ໃບບິນຝາກເຄື່ອງສະບັບຈິງ - ພ້ອມພິມ ຫຼື ບັນທຶກ
          </div>
          <ReceiptView 
            receipt={formData}
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
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#09477a]">
                NK SERVICE
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                {initialData ? 'ແກ້ໄຂໃບບິນຝາກເຄື່ອງ' : 'ສ້າງໃບບິນຝາກເຄື່ອງໃໝ່ (New Receipt)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              ກະລຸນາປ້ອນຂໍ້ມູນລູກຄ້າ ແລະ ລາຍການອຸປະກອນທີ່ນຳມາຝາກສ້ອມແປງ
            </p>
          </div>

          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ເລກທີໃບບິນ (Receipt No.)
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400">No.</span>
                <input
                  type="text"
                  required
                  value={formData.receiptNo}
                  onChange={e => setFormData({ ...formData, receiptNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold text-rose-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ວັນທີຝາກ (Deposit Date)
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.depositDate}
                  onChange={e => setFormData({ ...formData, depositDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ເວລາ (Time)
              </label>
              <input
                type="text"
                value={formData.depositTime}
                onChange={e => setFormData({ ...formData, depositTime: e.target.value })}
                placeholder="14:30"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Customer Selection and Input */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#09477a] uppercase tracking-wider">
                ຂໍ້ມູນລູກຄ້າ (Customer Details)
              </span>

              {savedCustomers.length > 0 && (
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>ເລືອກຈາກລູກຄ້າເກົ່າ:</span>
                  <select
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
                    onChange={e => {
                      const found = savedCustomers.find(c => c.id === e.target.value);
                      if (found) handleCustomerSelect(found);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>-- ເລືອກລູກຄ້າ --</option>
                    {savedCustomers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ຊື່ ແລະ ນາມສະກຸນລູກຄ້າ *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="ຕົວຢ່າງ: ທ່ານ ສົມສັກ ວົງສາ"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ເບີໂທລະສັບຕິດຕໍ່ *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="ຕົວຢ່າງ: 020 9977 4515"
                    value={formData.customerPhone}
                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ຜູ້ຮັບຝາກ (Receiver / Staff)
                </label>
                <input
                  type="text"
                  value={formData.receiverName}
                  onChange={e => setFormData({ ...formData, receiverName: e.target.value })}
                  placeholder="NK Service (ຊື່ພະນັກງານ)"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ເລກທີເອກະສານ / ເລກບັດ (Document No.)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="ໃບຂັບຂີ່ / ບັດປະຈຳຕົວ / ເລກບິນອ້າງອີງ"
                    value={formData.documentNo}
                    onChange={e => setFormData({ ...formData, documentNo: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 1.1: Logistics & Inter-Provincial Shipping (ຂໍ້ມູນການຂົນສົ່ງລະຫວ່າງແຂວງ) */}
          <div className="bg-gradient-to-br from-sky-50/80 via-blue-50/60 to-indigo-50/40 p-5 rounded-2xl border-2 border-sky-300 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#09477a] text-white rounded-xl shadow-xs">
                  <Truck className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#09477a] uppercase tracking-wide flex items-center gap-2">
                    <span>ຂໍ້ມູນການຈັດສົ່ງ ແລະ ຂົນສົ່ງລະຫວ່າງແຂວງ</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      ແນະນຳ
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    ສົ່ງຈາກແຂວງໃດ • ຂົນສົ່ງໃດ • ລົງແຂວງໃດ • ຂົນສົ່ງໃດ • ບ້ານ, ເມືອງ, ແຂວງໃດ
                  </p>
                </div>
              </div>

              {/* Quick Route Preset Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 font-semibold mr-1">ເສັ້ນທາງຍອດນິຍົມ:</span>
                {[
                  { label: 'ວຽງຈັນ ➔ ປາກເຊ', origin: 'ນະຄອນຫຼວງວຽງຈັນ', destP: 'ຈຳປາສັກ (ປາກເຊ)', dist: 'ປາກເຊ', trans: 'ຮຸ່ງອາລຸນ ຂົນສົ່ງ (HAL Logistics)' },
                  { label: 'ວຽງຈັນ ➔ ຫຼວງພະບາງ', origin: 'ນະຄອນຫຼວງວຽງຈັນ', destP: 'ຫຼວງພະບາງ', dist: 'ຫຼວງພະບາງ', trans: 'ອານຸສິດ ຂົນສົ່ງ (Anousith Express)' },
                  { label: 'ວຽງຈັນ ➔ ສະຫວັນນະເຂດ', origin: 'ນະຄອນຫຼວງວຽງຈັນ', destP: 'ສະຫວັນນະເຂດ', dist: 'ໄກສອນ ພົມວິຫານ', trans: 'ມີໄຊ ຂົນສົ່ງ (Meexay Transport)' },
                  { label: 'ວຽງຈັນ ➔ ຊຽງຂວາງ', origin: 'ນະຄອນຫຼວງວຽງຈັນ', destP: 'ຊຽງຂວາງ (ໂພນສະຫວັນ)', dist: 'ແປກ (ໂພນສະຫວັນ)', trans: 'ຮຸ່ງອາລຸນ ຂົນສົ່ງ (HAL Logistics)' },
                  { label: 'ວຽງຈັນ ➔ ທ່າແຂກ', origin: 'ນະຄອນຫຼວງວຽງຈັນ', destP: 'ຄຳມ່ວນ (ທ່າແຂກ)', dist: 'ທ່າແຂກ', trans: 'ອານຸສິດ ຂົນສົ່ງ (Anousith Express)' }
                ].map(route => (
                  <button
                    key={route.label}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        originProvince: route.origin,
                        destProvince: route.destP,
                        destDistrict: route.dist,
                        destTransport: route.trans
                      }));
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-sky-100 text-blue-900 border border-sky-300 rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    {route.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. ຕົ້ນທາງ (Origin) */}
            <div className="bg-white p-4 rounded-xl border border-sky-200/90 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-[#09477a] flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span className="text-sm font-extrabold">1. ຕົ້ນທາງ (Origin):</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">ສະຖານທີ່ຝາກເຄື່ອງເລີ່ມຕົ້ນ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ສົ່ງຈາກແຂວງໃດ (Origin Province) *
                  </label>
                  <select
                    value={formData.originProvince || 'ນະຄອນຫຼວງວຽງຈັນ'}
                    onChange={e => setFormData({ ...formData, originProvince: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {LAO_PROVINCES.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ຂົນສົ່ງໃດ (ຕົ້ນທາງ - Origin Courier) *
                  </label>
                  <input
                    type="text"
                    list="origin-transports-list"
                    placeholder="ຕົວຢ່າງ: ອານຸສິດ ຂົນສົ່ງ, ຮຸ່ງອາລຸນ..."
                    value={formData.originTransport || ''}
                    onChange={e => setFormData({ ...formData, originTransport: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="origin-transports-list">
                    {LAO_TRANSPORTS.map(t => <option key={t} value={t} />)}
                  </datalist>

                  {/* Quick Select Couriers */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['ອານຸສິດ ຂົນສົ່ງ', 'ຮຸ່ງອາລຸນ (HAL)', 'ມີໄຊ ຂົນສົ່ງ', 'ມິກແພັກ'].map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData({ ...formData, originTransport: name })}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-md font-medium transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ປາຍທາງ (Destination) */}
            <div className="bg-white p-4 rounded-xl border border-sky-200/90 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-[#09477a] flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-sm font-extrabold">2. ປາຍທາງ (Destination):</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">ສະຖານທີ່ສົ່ງຮອດຜູ້ຮັບ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ລົງແຂວງໃດ (Destination Province) *
                  </label>
                  <select
                    value={formData.destProvince || ''}
                    onChange={e => setFormData({ ...formData, destProvince: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- ເລືອກແຂວງປາຍທາງ --</option>
                    {LAO_PROVINCES.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ຂົນສົ່ງໃດ (ປາຍທາງ / ສາຂາ) *
                  </label>
                  <input
                    type="text"
                    list="dest-transports-list"
                    placeholder="ຕົວຢ່າງ: ຮຸ່ງອາລຸນ ສາຂາປາກເຊ / ອານຸສິດ..."
                    value={formData.destTransport || ''}
                    onChange={e => setFormData({ ...formData, destTransport: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="dest-transports-list">
                    {LAO_TRANSPORTS.map(t => <option key={t} value={t} />)}
                  </datalist>

                  {/* Quick Select Couriers */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['ຮຸ່ງອາລຸນ ສາຂາແຂວງ', 'ອານຸສິດ ສາຂາແຂວງ', 'ມີໄຊ ສາຂາແຂວງ', 'ຈັດສົ່ງຮອດບ້ານ'].map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData({ ...formData, destTransport: name })}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-md font-medium transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. ບ້ານໃດ, ເມືອງໃດ, ແຂວງໃດ (Detailed Address) */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>ທີ່ຢູ່ຈັດສົ່ງລະອຽດ (ບ້ານໃດ, ເມືອງໃດ, ແຂວງໃດ) :</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ບ້ານໃດ (Village)
                    </label>
                    <input
                      type="text"
                      placeholder="ຕົວຢ່າງ: ບ້ານ ໂພນງາມ"
                      value={formData.destVillage || ''}
                      onChange={e => setFormData({ ...formData, destVillage: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ເມືອງໃດ (District)
                    </label>
                    <input
                      type="text"
                      placeholder="ຕົວຢ່າງ: ເມືອງ ປາກເຊ"
                      value={formData.destDistrict || ''}
                      onChange={e => setFormData({ ...formData, destDistrict: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ແຂວງໃດ (Province)
                    </label>
                    <input
                      type="text"
                      placeholder="ຕົວຢ່າງ: ແຂວງ ຈຳປາສັກ"
                      value={formData.destProvince || ''}
                      onChange={e => setFormData({ ...formData, destProvince: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Tracking Number & Shipping Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ເລກບິນຂົນສົ່ງ / Tracking No. (ຖ້າມີ)
                  </label>
                  <input
                    type="text"
                    placeholder="ຕົວຢ່າງ: AN-984210, HAL-34012"
                    value={formData.trackingNo || ''}
                    onChange={e => setFormData({ ...formData, trackingNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm font-bold text-rose-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ໝາຍເຫດການຈັດສົ່ງ (Shipping Notes)
                  </label>
                  <input
                    type="text"
                    placeholder="ຕົວຢ່າງ: ໂທກ່ອນສົ່ງ, ຝາກໄວ້ໜ້າບ້ານ..."
                    value={formData.shippingNotes || ''}
                    onChange={e => setFormData({ ...formData, shippingNotes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Service Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                ໝວດໝູ່ບໍລິການ (Service Category)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'computer', label: 'ຄອມພິວເຕີ' },
                  { id: 'printer', label: 'ເຄື່ອງພິມ' },
                  { id: 'phone', label: 'ໂທລະສັບ' },
                  { id: 'cctv', label: 'CCTV' },
                  { id: 'other', label: 'ບໍລິການອື່ນໆ' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id as ServiceCategory })}
                    className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all ${
                      formData.category === cat.id
                        ? 'bg-[#09477a] text-white border-[#09477a] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                ສະຖານະການດຳເນີນງານ (Status)
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">ລໍຖ້າກວດເຊັກ (Pending)</option>
                <option value="in_progress">ກຳລັງດຳເນີນການສ້ອມແປງ (In Progress)</option>
                <option value="completed">ສຳເລັດແລ້ວ ລໍຖ້າຮັບເຄື່ອງ (Completed)</option>
                <option value="picked_up">ລູກຄ້າມາຮັບເຄື່ອງແລ້ວ (Picked Up)</option>
                <option value="cancelled">ຍົກເລີກ (Cancelled)</option>
              </select>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ລາຍການດ່ວນຍອດນິຍົມ (Quick Add Presets):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('Laptop ສ້ອມແປງເປີດບໍ່ຕິດ', 'computer', 'ກວດເຊັກລະບົບ Mainboard/Power', 150000)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 font-medium transition-colors"
              >
                + Laptop ເປີດບໍ່ຕິດ (150,000 ກີບ)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('Printer ເຄື່ອງພິມຕິດເຈ້ຍ/ບໍ່ດຶງເຈ້ຍ', 'printer', 'ປ່ຽນຢາງດຶງເຈ້ຍ / ເຮັດຄວາມສະອາດ', 100000)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 font-medium transition-colors"
              >
                + Printer ຕິດເຈ້ຍ (100,000 ກີບ)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ໂທລະສັບ ຈໍແຕກ/ປ່ຽນຈໍໃໝ່', 'phone', 'ປ່ຽນຈໍ Display ແທ້', 350000)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 font-medium transition-colors"
              >
                + ປ່ຽນຈໍໂທລະສັບ (350,000 ກີບ)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ກ້ອງ CCTV ດັບ/ບໍ່ຂຶ້ນພາບ', 'cctv', 'ກວດເຊັກ Adapter ແລະ ສາຍສັນຍານ', 200000)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 font-medium transition-colors"
              >
                + ກ້ອງ CCTV ບໍ່ຂຶ້ນພາບ (200,000 ກີບ)
              </button>
            </div>
          </div>

          {/* Section 3: Items Table Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                ລາຍການສິນຄ້າ / ອຸປະກອນ (Items - ສູງສຸດ 8 ລາຍການ)
              </h3>
              <button
                type="button"
                onClick={addItemRow}
                disabled={formData.items.length >= 8}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ເພີ່ມແຖວ</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs">
                <thead className="bg-[#09477a] text-white">
                  <tr>
                    <th className="py-2.5 px-2 text-center w-10">ລ/ດ</th>
                    <th className="py-2.5 px-3 text-left">ລາຍການສິນຄ້າ / ອຸປະກອນ</th>
                    <th className="py-2.5 px-2 text-center w-20">ຈຳນວນ</th>
                    <th className="py-2.5 px-3 text-left">ລາຍລະອຽດ / ສະພາບ</th>
                    <th className="py-2.5 px-3 text-right w-36">ຈຳນວນເງິນ (ກີບ)</th>
                    <th className="py-2.5 px-2 text-center w-10">ລຶບ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2 px-2 text-center font-bold text-slate-500">
                        {index + 1}
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          required
                          placeholder="ຊື່ເຄື່ອງ ຫຼື ລຸ້ນ..."
                          value={item.name}
                          onChange={e => handleItemChange(index, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          placeholder="1"
                          value={item.qty}
                          onChange={e => handleItemChange(index, 'qty', e.target.value)}
                          className="w-full px-1.5 py-1.5 text-center rounded-lg border border-slate-200 font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          placeholder="ສະພາບ/ອາການເສຍ..."
                          value={item.details}
                          onChange={e => handleItemChange(index, 'details', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="1000"
                          value={item.amount || ''}
                          onChange={e => handleItemChange(index, 'amount', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-right font-bold text-slate-900 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>
                      <td className="py-2 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={formData.items.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-20 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Display */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">ຕົວໜັງສື: </span>
                <span className="italic text-[#09477a] font-bold">{formData.totalAmountWords}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <span className="text-sm font-bold text-slate-700">ລວມທັງໝົດ:</span>
                <span className="text-2xl font-black text-[#09477a]">
                  {formatKip(formData.totalAmount)}
                </span>
                <span className="text-sm font-bold text-slate-600">ກີບ</span>
              </div>
            </div>
          </div>

          {/* Section 4: Signatures & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Customer Signature Box */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    ລາຍເຊັນລູກຄ້າ (Customer Signature)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSignModalState({
                      isOpen: true,
                      type: 'customer',
                      title: 'ລາຍເຊັນລູກຄ້າ (ຜູ້ຝາກເຄື່ອງ)'
                    })}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{formData.customerSignature ? 'ແກ້ໄຂລາຍເຊັນ' : 'ເຊັນຊື່ດິຈິຕອລ'}</span>
                  </button>
                </div>
                <div className="h-24 bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-2">
                  {formData.customerSignature ? (
                    <img 
                      src={formData.customerSignature} 
                      alt="Customer Signature" 
                      className="max-h-full max-w-full object-contain" 
                    />
                  ) : (
                    <span className="text-xs text-slate-400">ຍັງບໍ່ທັນມີລາຍເຊັນ</span>
                  )}
                </div>
              </div>
              {formData.customerSignature && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, customerSignature: '' })}
                  className="text-[11px] text-rose-500 hover:underline mt-2 text-right"
                >
                  ລຶບລາຍເຊັນ
                </button>
              )}
            </div>

            {/* Receiver Signature Box */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    ລາຍເຊັນຜູ້ຮັບເຄື່ອງ (NK Service Signature)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSignModalState({
                      isOpen: true,
                      type: 'receiver',
                      title: 'ລາຍເຊັນຜູ້ຮັບເຄື່ອງ (NK Service)'
                    })}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{formData.receiverSignature ? 'ແກ້ໄຂລາຍເຊັນ' : 'ເຊັນຊື່ດິຈິຕອລ'}</span>
                  </button>
                </div>
                <div className="h-24 bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-2">
                  {formData.receiverSignature ? (
                    <img 
                      src={formData.receiverSignature} 
                      alt="Receiver Signature" 
                      className="max-h-full max-w-full object-contain" 
                    />
                  ) : (
                    <span className="text-xs text-slate-400">ຍັງບໍ່ທັນມີລາຍເຊັນ</span>
                  )}
                </div>
              </div>
              {formData.receiverSignature && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, receiverSignature: '' })}
                  className="text-[11px] text-rose-500 hover:underline mt-2 text-right"
                >
                  ລຶບລາຍເຊັນ
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ໝາຍເຫດເພີ່ມເຕີມ / ຂໍ້ຄວາມສະເພາະ (Optional Notes)
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ຕົວຢ່າງ: ອຸປະກອນມານຳມີ ສາຍສາກ, ກະເປົາ, ເມົ້າສ໌..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bottom Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold bg-[#09477a] text-white hover:bg-[#07365d] shadow-md transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ ແລະ ເບິ່ງໃບບິນ'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={signModalState.isOpen}
        title={signModalState.title}
        existingSignature={
          signModalState.type === 'customer' 
            ? formData.customerSignature 
            : formData.receiverSignature
        }
        onSave={dataUrl => {
          if (signModalState.type === 'customer') {
            setFormData(prev => ({ ...prev, customerSignature: dataUrl }));
          } else {
            setFormData(prev => ({ ...prev, receiverSignature: dataUrl }));
          }
        }}
        onClose={() => setSignModalState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* QR Code Verification Modal */}
      <ReceiptVerifyModal
        receipt={formData}
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        verificationUrl={
          typeof window !== 'undefined'
            ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(formData.receiptNo || formData.id || '')}`
            : `https://nkservice.la/verify/${formData.receiptNo}`
        }
      />
    </div>
  );
};
