import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  FileText, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Receipt as ReceiptIcon 
} from 'lucide-react';
import { CustomerData, ReceiptData, LAO_PROVINCES, LAO_TRANSPORTS } from '../types';

interface CustomerManagerProps {
  customers: CustomerData[];
  receipts: ReceiptData[];
  onSaveCustomer: (customer: CustomerData) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
  onSelectCustomerReceipts: (customerPhone: string) => void;
  currentUser: { uid: string } | null;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  customers,
  receipts,
  onSaveCustomer,
  onDeleteCustomer,
  onSelectCustomerReceipts,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [transport, setTransport] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.province && c.province.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.district && c.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.village && c.village.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.transport && c.transport.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setVillage('');
    setDistrict('');
    setProvince('ນະຄອນຫຼວງວຽງຈັນ');
    setTransport('');
    setAddress('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: CustomerData) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setVillage(c.village || '');
    setDistrict(c.district || '');
    setProvince(c.province || 'ນະຄອນຫຼວງວຽງຈັນ');
    setTransport(c.transport || '');
    setAddress(c.address || '');
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທລະສັບ');
      return;
    }

    try {
      setSaving(true);
      await onSaveCustomer({
        id: editingCustomer?.id,
        name: name.trim(),
        phone: phone.trim(),
        village: village.trim(),
        district: district.trim(),
        province: province.trim(),
        transport: transport.trim(),
        address: address.trim() || [village && `ບ.${village}`, district && `ມ.${district}`, province && `ແຂວງ ${province}`].filter(Boolean).join(', '),
        notes: notes.trim(),
        userId: currentUser?.uid || 'staff-user',
        updatedAt: new Date().toISOString()
      });
      setIsModalOpen(false);
    } catch (err: any) {
      alert('ບັນທຶກບໍ່ສຳເລັດ: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-lao space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#09477a]" />
            <span>ຈັດການຂໍ້ມູນລູກຄ້າ ແລະ ສະມາຊິກ (Customer Directory)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ບັນທຶກປະຫວັດລູກຄ້າເພື່ອຄວາມສະດວກໃນການອອກໃບບິນ ແລະ ຕິດຕາມງານ
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#09477a] text-white hover:bg-[#07365d] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ເພີ່ມລູກຄ້າໃໝ່</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="ຄົ້ນຫາຊື່ລູກຄ້າ, ເບີໂທ, ທີ່ຢູ່..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
      </div>

      {/* Customers Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">ຍັງບໍ່ມີຂໍ້ມູນລູກຄ້າ</h4>
          <p className="text-xs text-slate-400 mt-1">ເມື່ອມີການອອກໃບບິນ ຂໍ້ມູນລູກຄ້າຈະຖືກບັນທຶກໄວ້ໂດຍອັດຕະໂນມັດ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(customer => {
            const customerReceiptCount = receipts.filter(r => r.customerPhone === customer.phone).length;

            return (
              <div
                key={customer.id || customer.phone}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{customer.name}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="p-1 text-slate-400 hover:text-amber-600 rounded-md"
                        title="ແກ້ໄຂ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('ຕ້ອງການລຶບຂໍ້ມູນລູກຄ້ານີ້ແທ້ບໍ່?')) {
                            onDeleteCustomer(customer.id!);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        title="ລຶບ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#0369a1]" />
                      <a href={`tel:${customer.phone}`} className="font-semibold text-slate-800 hover:underline">
                        {customer.phone}
                      </a>
                    </div>

                    {/* Address details */}
                    {(customer.village || customer.district || customer.province || customer.address) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 line-clamp-2">
                          {[
                            customer.village && `ບ.${customer.village}`,
                            customer.district && `ມ.${customer.district}`,
                            customer.province && `ແຂວງ ${customer.province}`,
                            (!customer.village && !customer.district && !customer.province) ? customer.address : ''
                          ].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Preferred Transport Badge */}
                    {customer.transport && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                          ຂົນສົ່ງ: {customer.transport}
                        </span>
                      </div>
                    )}

                    {customer.notes && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-500 italic line-clamp-2">{customer.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">
                    ໃບບິນທີ່ເຄີຍຝາກ: <strong className="text-[#09477a]">{customerReceiptCount}</strong> ສະບັບ
                  </span>

                  {customerReceiptCount > 0 && (
                    <button
                      onClick={() => onSelectCustomerReceipts(customer.phone)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                    >
                      <ReceiptIcon className="w-3 h-3" />
                      <span>ເບິ່ງໃບບິນ</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingCustomer ? 'ແກ້ໄຂຂໍ້ມູນລູກຄ້າ / ຜູ້ຮັບ' : 'ເພີ່ມຂໍ້ມູນລູກຄ້າໃໝ່ (Customer / Receiver)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ຊື່ ແລະ ນາມສະກຸນລູກຄ້າ *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="ຕົວຢ່າງ: ທ່ານ ສົມສັກ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ເບີໂທລະສັບຕິດຕໍ່ *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="020 9977 4515"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Inter-provincial logistics address */}
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-sky-200 space-y-3">
                <div className="text-xs font-bold text-[#09477a] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>ທີ່ຢູ່ຈັດສົ່ງ ແລະ ຂົນສົ່ງ (ບ້ານ, ເມືອງ, ແຂວງ)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ແຂວງ (Province)
                  </label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- ເລືອກແຂວງ --</option>
                    {LAO_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ເມືອງ (District)
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="ຕົວຢ່າງ: ເມືອງ ປາກເຊ"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ບ້ານ (Village)
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={e => setVillage(e.target.value)}
                      placeholder="ຕົວຢ່າງ: ບ້ານ ໂພນງາມ"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ຂົນສົ່ງປະຈຳ / ສາຂາຂົນສົ່ງ (Preferred Logistics)
                  </label>
                  <input
                    type="text"
                    list="customer-transports-list"
                    value={transport}
                    onChange={e => setTransport(e.target.value)}
                    placeholder="ຕົວຢ່າງ: ຮຸ່ງອາລຸນ ສາຂາປາກເຊ / ອານຸສິດ..."
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="customer-transports-list">
                    {LAO_TRANSPORTS.map(t => <option key={t} value={t} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ໝາຍເຫດເພີ່ມເຕີມ
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="ລາຍລະອຽດ ຫຼື ຄວາມຕ້ອງການພິເສດ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#09477a] text-white hover:bg-[#07365d] rounded-xl shadow-sm disabled:opacity-50"
                >
                  {saving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
