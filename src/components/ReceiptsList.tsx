import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Printer, 
  Copy, 
  Calendar, 
  Phone, 
  User, 
  FileSpreadsheet, 
  Sparkles,
  ArrowUpDown,
  Laptop,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ReceiptData, ReceiptStatus } from '../types';
import { formatKip, formatLaoDateDisplay, STATUS_LABELS } from '../utils/laoUtils';

interface ReceiptsListProps {
  receipts: ReceiptData[];
  onSelectReceipt: (receipt: ReceiptData) => void;
  onEditReceipt: (receipt: ReceiptData) => void;
  onDeleteReceipt: (receiptId: string) => Promise<void>;
  onDuplicateReceipt: (receipt: ReceiptData) => void;
  onUpdateStatus: (receiptId: string, newStatus: ReceiptStatus) => Promise<void>;
  onCreateNew: () => void;
}

export const ReceiptsList: React.FC<ReceiptsListProps> = ({
  receipts,
  onSelectReceipt,
  onEditReceipt,
  onDeleteReceipt,
  onDuplicateReceipt,
  onUpdateStatus,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = receipts.length;
    const pending = receipts.filter(r => r.status === 'pending').length;
    const inProgress = receipts.filter(r => r.status === 'in_progress').length;
    const completed = receipts.filter(r => r.status === 'completed' || r.status === 'picked_up').length;
    const totalRevenue = receipts.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);

    return { total, pending, inProgress, completed, totalRevenue };
  }, [receipts]);

  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      const q = searchTerm.toLowerCase();
      const matchSearch = 
        r.receiptNo.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q) ||
        (r.originProvince && r.originProvince.toLowerCase().includes(q)) ||
        (r.originTransport && r.originTransport.toLowerCase().includes(q)) ||
        (r.destProvince && r.destProvince.toLowerCase().includes(q)) ||
        (r.destDistrict && r.destDistrict.toLowerCase().includes(q)) ||
        (r.destVillage && r.destVillage.toLowerCase().includes(q)) ||
        (r.destTransport && r.destTransport.toLowerCase().includes(q)) ||
        (r.trackingNo && r.trackingNo.toLowerCase().includes(q)) ||
        r.items.some(item => item.name.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || r.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [receipts, searchTerm, statusFilter, categoryFilter]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໃບບິນນີ້? ຂໍ້ມູນຈະບໍ່ສາມາດກູ້ຄືນໄດ້.')) {
      try {
        setDeletingId(id);
        await onDeleteReceipt(id);
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const exportToCSV = () => {
    if (filteredReceipts.length === 0) {
      alert('ບໍ່ມີຂໍ້ມູນໃບບິນສຳລັບ Export');
      return;
    }

    const headers = [
      'ເລກທີໃບບິນ', 
      'ຊື່ລູກຄ້າ', 
      'ເບີໂທ', 
      'ວັນທີ', 
      'ສົ່ງຈາກແຂວງໃດ',
      'ຂົນສົ່ງຕົ້ນທາງ',
      'ລົງແຂວງໃດ',
      'ເມືອງໃດ',
      'ບ້ານໃດ',
      'ຂົນສົ່ງປາຍທາງ',
      'ເລກບິນຂົນສົ່ງ',
      'ໝວດໝູ່', 
      'ສະຖານະ', 
      'ຍອດເງິນຝາກ (ກີບ)', 
      'ຜູ້ຮັບຝາກ'
    ];
    const rows = filteredReceipts.map(r => [
      `"${r.receiptNo}"`,
      `"${r.customerName}"`,
      `"${r.customerPhone}"`,
      `"${r.depositDate}"`,
      `"${r.originProvince || ''}"`,
      `"${r.originTransport || ''}"`,
      `"${r.destProvince || ''}"`,
      `"${r.destDistrict || ''}"`,
      `"${r.destVillage || ''}"`,
      `"${r.destTransport || ''}"`,
      `"${r.trackingNo || ''}"`,
      `"${r.category}"`,
      `"${STATUS_LABELS[r.status]?.label || r.status}"`,
      r.totalAmount,
      `"${r.receiverName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NK_Service_Receipts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="font-lao space-y-6">
      {/* 1. KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Receipts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">ໃບບິນທັງໝົດ</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{stats.total}</div>
            <div className="text-[11px] text-blue-600 mt-0.5">ລາຍການໃນລະບົບ</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Laptop className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Check */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">ລໍຖ້າກວດເຊັກ</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</div>
            <div className="text-[11px] text-amber-600 mt-0.5">ຕ້ອງການກວດອາການ</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">ກຳລັງສ້ອມແປງ</div>
            <div className="text-2xl font-black text-sky-600 mt-1">{stats.inProgress}</div>
            <div className="text-[11px] text-sky-600 mt-0.5">ຢູ່ຂັ້ນຕອນສ້ອມ</div>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Amount / Revenue */}
        <div className="bg-gradient-to-br from-[#09477a] to-[#07365d] text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-sky-200">ຍອດເງິນຝາກລວມ</div>
            <div className="text-xl sm:text-2xl font-black mt-1">{formatKip(stats.totalRevenue)}</div>
            <div className="text-[11px] text-sky-300 mt-0.5">ກີບ (LAK)</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* 2. Search, Filter and Actions Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຕາມເລກບິນ, ຊື່ລູກຄ້າ, ເບີໂທ, ຊື່ເຄື່ອງອຸປະກອນ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#09477a] hover:bg-[#07365d] text-white shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>ສ້າງໃບບິນໃໝ່</span>
            </button>
          </div>
        </div>

        {/* Status Tab Filters */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
          {[
            { id: 'all', label: 'ທັງໝົດ' },
            { id: 'pending', label: 'ລໍຖ້າກວດເຊັກ' },
            { id: 'in_progress', label: 'ກຳລັງສ້ອມແປງ' },
            { id: 'completed', label: 'ສຳເລັດແລ້ວ' },
            { id: 'picked_up', label: 'ລູກຄ້າມາຮັບແລ້ວ' },
            { id: 'cancelled', label: 'ຍົກເລີກ' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#09477a] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Receipts Table / Cards */}
      {filteredReceipts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-[#09477a] rounded-2xl flex items-center justify-center mx-auto">
            <Laptop className="w-8 h-8" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-800">ບໍ່ພົບລາຍການໃບບິນ</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm 
                ? 'ບໍ່ມີໃບບິນທີ່ຕົງກັບຄຳຄົ້ນຫາຂອງທ່ານ ລອງປ່ຽນຄຳຄົ້ນຫາໃໝ່' 
                : 'ຍັງບໍ່ທັນມີໃບບິນຝາກເຄື່ອງໃນລະບົບ ກະລຸນາກົດປຸ່ມສ້າງໃບບິນເພື່ອເລີ່ມຕົ້ນ'}
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#09477a] text-white hover:bg-[#07365d] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ສ້າງໃບບິນຝາກເຄື່ອງດຽວນີ້</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ເລກທີໃບບິນ</th>
                  <th className="py-3 px-4">ຊື່ລູກຄ້າ / ເບີໂທ</th>
                  <th className="py-3 px-4">ວັນທີຝາກ</th>
                  <th className="py-3 px-4">ລາຍການອຸປະກອນ</th>
                  <th className="py-3 px-4 text-right">ຍອດເງິນຝາກ</th>
                  <th className="py-3 px-4 text-center">ສະຖານະ</th>
                  <th className="py-3 px-4 text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.map(receipt => {
                  const statusInfo = STATUS_LABELS[receipt.status] || {
                    label: receipt.status,
                    color: 'text-slate-700',
                    bg: 'bg-slate-100 border-slate-200'
                  };

                  return (
                    <tr
                      key={receipt.id || receipt.receiptNo}
                      onClick={() => onSelectReceipt(receipt)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      {/* Receipt No */}
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                        No. {receipt.receiptNo}
                      </td>

                      {/* Customer & Route Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{receipt.customerName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{receipt.customerPhone}</span>
                        </div>
                        {(receipt.originProvince || receipt.destProvince || receipt.destTransport) && (
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-sky-50 text-[#09477a] border border-sky-200">
                              {receipt.originProvince ? receipt.originProvince.replace('ນະຄອນຫຼວງວຽງຈັນ', 'ນະຄອນຫຼວງ') : 'ວຽງຈັນ'} ➔ {receipt.destProvince ? receipt.destProvince.split(' ')[0] : (receipt.destDistrict || 'ປາຍທາງ')}
                            </span>
                            {receipt.destTransport && (
                              <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-1 py-0.5 rounded-sm truncate max-w-[120px]">
                                {receipt.destTransport}
                              </span>
                            )}
                          </div>
                        )}
                        {(receipt.destVillage || receipt.destDistrict) && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                            {[receipt.destVillage && `ບ.${receipt.destVillage}`, receipt.destDistrict && `ມ.${receipt.destDistrict}`].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {formatLaoDateDisplay(receipt.depositDate)}
                        </div>
                        <div className="text-[11px] text-slate-400">{receipt.depositTime}</div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="truncate font-medium text-slate-800">
                          {receipt.items[0]?.name || 'ບໍ່ລະບຸ'}
                        </div>
                        {receipt.items.length > 1 && (
                          <div className="text-[10px] text-blue-600 font-semibold">
                            + ອີກ {receipt.items.length - 1} ລາຍການ
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-extrabold text-[#09477a] text-sm">
                          {formatKip(receipt.totalAmount)}
                        </div>
                        <div className="text-[10px] text-slate-500">ກີບ</div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <select
                          value={receipt.status}
                          onChange={e => onUpdateStatus(receipt.id!, e.target.value as ReceiptStatus)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs cursor-pointer focus:outline-hidden ${statusInfo.bg} ${statusInfo.color}`}
                        >
                          <option value="pending">ລໍຖ້າກວດເຊັກ</option>
                          <option value="in_progress">ກຳລັງສ້ອມແປງ</option>
                          <option value="completed">ສຳເລັດແລ້ວ</option>
                          <option value="picked_up">ລູກຄ້າມາຮັບແລ້ວ</option>
                          <option value="cancelled">ຍົກເລີກ</option>
                        </select>
                      </td>

                      {/* Actions Buttons */}
                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="ປິ່ນໃບບິນ (Print)"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectReceipt(receipt);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-[#09477a] hover:bg-[#07365d] rounded-lg shadow-2xs transition-all active:scale-95"
                          >
                            <Printer className="w-3.5 h-3.5 text-sky-300" />
                            <span>ປິ່ນ</span>
                          </button>

                          <button
                            title="ເບິ່ງລາຍລະອຽດ"
                            onClick={() => onSelectReceipt(receipt)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            title="ແກ້ໄຂໃບບິນ"
                            onClick={() => onEditReceipt(receipt)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            title="ສຳເນົາໃບບິນ"
                            onClick={() => onDuplicateReceipt(receipt)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            title="ລຶບໃບບິນ"
                            disabled={deletingId === receipt.id}
                            onClick={e => handleDelete(receipt.id!, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
