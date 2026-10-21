export type ServiceCategory = 'computer' | 'printer' | 'phone' | 'cctv' | 'other';

export interface ReceiptItem {
  no: number;
  name: string;
  qty: number | string;
  details: string;
  amount: number;
}

export type ReceiptStatus = 'pending' | 'in_progress' | 'completed' | 'picked_up' | 'cancelled';

export interface ReceiptData {
  id?: string;
  receiptNo: string;
  customerName: string;
  customerPhone: string;
  depositDate: string; // YYYY-MM-DD
  depositTime: string; // HH:mm
  receiverName: string;
  documentNo: string;
  category: ServiceCategory;
  items: ReceiptItem[];
  totalAmount: number;
  totalAmountWords: string;
  status: ReceiptStatus;
  notes?: string;

  // Logistics & Inter-provincial Shipping Fields
  originProvince?: string;    // ສົ່ງຈາກແຂວງໃດ (e.g. ນະຄອນຫຼວງວຽງຈັນ)
  originTransport?: string;   // ຂົນສົ່ງໃດ (e.g. ອານຸສິດ ຂົນສົ່ງ)
  destProvince?: string;      // ລົງແຂວງໃດ (e.g. ຈຳປາສັກ)
  destDistrict?: string;      // ເມືອງໃດ (e.g. ເມືອງ ປາກເຊ)
  destVillage?: string;       // ບ້ານໃດ (e.g. ບ້ານ ໂພນງາມ)
  destTransport?: string;     // ຂົນສົ່ງປາຍທາງ/ສາຂາໃດ (e.g. ຮຸ່ງອາລຸນ ສາຂາປາກເຊ)
  trackingNo?: string;        // ເລກບິນຂົນສົ່ງ / Tracking No.
  shippingNotes?: string;     // ໝາຍເຫດການຈັດສົ່ງ

  customerSignature?: string;
  receiverSignature?: string;
  userId: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerData {
  id?: string;
  name: string;
  phone: string;
  address?: string;
  village?: string;
  district?: string;
  province?: string;
  transport?: string;
  notes?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'staff';
  photoURL?: string;
}

// 18 Provinces of Laos
export const LAO_PROVINCES = [
  'ນະຄອນຫຼວງວຽງຈັນ',
  'ແຂວງ ວຽງຈັນ',
  'ຫຼວງພະບາງ',
  'ຈຳປາສັກ (ປາກເຊ)',
  'ສະຫວັນນະເຂດ',
  'ຄຳມ່ວນ (ທ່າແຂກ)',
  'ບໍລິຄຳໄຊ (ປາກຊັນ)',
  'ໄຊຍະບູລີ',
  'ຊຽງຂວາງ (ໂພນສະຫວັນ)',
  'ຫົວພັນ (ຊຳເໜືອ)',
  'ອຸດົມໄຊ',
  'ຫຼວງນ້ຳທາ',
  'ບໍ່ແກ້ວ (ຫ້ວຍຊາຍ)',
  'ຜົ້ງສາລີ',
  'ສາລະວັນ',
  'ເຊກອງ',
  'ອັດຕະປື',
  'ໄຊສົມບູນ'
];

// Popular Transport & Courier Companies in Laos
export const LAO_TRANSPORTS = [
  'ອານຸສິດ ຂົນສົ່ງ (Anousith Express)',
  'ຮຸ່ງອາລຸນ ຂົນສົ່ງ (HAL Logistics)',
  'ມິກແພັກ ຂົນສົ່ງ (Mixpack Express)',
  'ມີໄຊ ຂົນສົ່ງ (Meexay Transport)',
  'ເກົ້າຈະເລີນ ຂົນສົ່ງ (Kaochaleun Express)',
  'ກຽດຄຳພູ ຂົນສົ່ງ (Kietkhampou)',
  'ພະເມືອງລາວ ຂົນສົ່ງ (Phameuanglao)',
  'ລົດເມສາຍເໜືອ (Northern Bus Terminal)',
  'ລົດເມສາຍໃຕ້ (Southern Bus Terminal)',
  'ຮັບເອງຢູ່ຮ້ານ (In-Store Pickup)',
  'ຈັດສົ່ງຮອດບ້ານ (Home Delivery)'
];
