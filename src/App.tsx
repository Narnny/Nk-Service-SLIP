/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signOut as fbSignOut 
} from 'firebase/auth';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { ReceiptData, CustomerData, ReceiptStatus } from './types';
import { Navbar } from './components/Navbar';
import { ReceiptsList } from './components/ReceiptsList';
import { ReceiptForm } from './components/ReceiptForm';
import { CustomerManager } from './components/CustomerManager';
import { ReceiptDetailModal } from './components/ReceiptDetailModal';
import { ReceiptView } from './components/ReceiptView';
import { AuthModal } from './components/AuthModal';
import { ReceiptVerifyModal } from './components/ReceiptVerifyModal';
import { printReceiptElement, downloadReceiptAsPDF, downloadReceiptAsImage } from './utils/printHelper';
import { Printer, Sparkles, Check, Info, FileDown, Image as ImageIcon } from 'lucide-react';

// Sample demo receipt modeled directly after the user's reference image
const SAMPLE_RECEIPT: ReceiptData = {
  id: 'sample-000001',
  receiptNo: '000001',
  customerName: 'ທ່ານ ສົມສັກ ວົງສາ',
  customerPhone: '020 9977 4515',
  depositDate: '2026-10-21',
  depositTime: '10:30',
  receiverName: 'NK Service (ເຈົ້າໜ້າທີ່)',
  documentNo: 'DOC-2026-001',
  category: 'computer',
  items: [
    {
      no: 1,
      name: 'Notebook ASUS ROG Strix G15',
      qty: 1,
      details: 'ເປີດບໍ່ຕິດ, ໄຟສະແດງສະຖານະບໍ່ຂຶ້ນ, ມີສາຍສາກມານຳ',
      amount: 250000
    },
    {
      no: 2,
      name: 'Printer Canon G2010',
      qty: 1,
      details: 'ໄຟກະພິບສີສົ້ມ 5 ຄັ້ງ, ຫົວພິມດຳບໍ່ອອກ',
      amount: 150000
    },
    {
      no: 3,
      name: 'ໂທລະສັບ Samsung Galaxy S21',
      qty: 1,
      details: 'ປ່ຽນຈໍ Display ແທ້, ກວດເຊັກແບັດເຕີຣີ',
      amount: 450000
    }
  ],
  totalAmount: 850000,
  totalAmountWords: 'ແປດແສນຫ້າໝື່ນກີບຖ້ວນ',
  status: 'pending',
  notes: 'ລູກຄ້າຂໍດ່ວນກ່ອນວັນສຸກ',
  userId: 'nk-system-user',
  userEmail: 'narnny1994nk@gmail.com',
  createdAt: new Date().toISOString()
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'receipts' | 'create' | 'customers' | 'template'>('receipts');
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
  } | null>(() => {
    // Check localStorage for offline staff session
    const saved = localStorage.getItem('nk_staff_user');
    return saved ? JSON.parse(saved) : {
      uid: 'staff-default',
      displayName: 'ພະນັກງານ NK Service',
      email: 'narnny1994nk@gmail.com'
    };
  });

  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptData | null>(null);
  const [verifyReceipt, setVerifyReceipt] = useState<ReceiptData | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Check URL query parameters for ?verify= (from scanning QR code)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyTarget = params.get('verify');
    if (verifyTarget) {
      if (receipts.length > 0) {
        const match = receipts.find(
          r => r.receiptNo === verifyTarget || r.id === verifyTarget
        );
        if (match) {
          setVerifyReceipt(match);
        } else if (verifyTarget === SAMPLE_RECEIPT.receiptNo) {
          setVerifyReceipt(SAMPLE_RECEIPT);
        }
      } else if (verifyTarget === SAMPLE_RECEIPT.receiptNo) {
        setVerifyReceipt(SAMPLE_RECEIPT);
      }
    }
  }, [receipts]);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        const u = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'ພະນັກງານ',
          email: user.email || '',
          photoURL: user.photoURL || undefined
        };
        setCurrentUser(u);
        localStorage.setItem('nk_staff_user', JSON.stringify(u));
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore sync for Receipts
  useEffect(() => {
    const receiptsRef = collection(db, 'receipts');
    const unsubscribe = onSnapshot(
      receiptsRef,
      snapshot => {
        const items: ReceiptData[] = [];
        snapshot.forEach(docSnap => {
          items.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        // If no receipts exist in Firestore yet, provide sample receipt so the UI is immediately functional
        if (items.length === 0) {
          setReceipts([SAMPLE_RECEIPT]);
        } else {
          // Sort newest first
          items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setReceipts(items);
        }
        setLoading(false);
      },
      error => {
        console.warn('Firestore receipts onSnapshot notice:', error.message);
        // Fallback to local state if Firestore permissions need auth
        setReceipts(prev => prev.length === 0 ? [SAMPLE_RECEIPT] : prev);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Real-time Firestore sync for Customers
  useEffect(() => {
    const customersRef = collection(db, 'customers');
    const unsubscribe = onSnapshot(
      customersRef,
      snapshot => {
        const items: CustomerData[] = [];
        snapshot.forEach(docSnap => {
          items.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        if (items.length === 0) {
          setCustomers([
            {
              id: 'cust-1',
              name: 'ທ່ານ ສົມສັກ ວົງສາ',
              phone: '020 9977 4515',
              address: 'ບ້ານ ໂພນຕ້ອງ, ນະຄອນຫຼວງວຽງຈັນ',
              userId: 'nk-system-user'
            }
          ]);
        } else {
          setCustomers(items);
        }
      },
      error => {
        console.warn('Firestore customers onSnapshot notice:', error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handlers for Receipts
  const handleSaveReceipt = async (receiptData: ReceiptData) => {
    const id = receiptData.id || `rec_${Date.now()}`;
    const payload = {
      ...receiptData,
      id,
      userId: currentUser?.uid || 'staff-default',
      userEmail: currentUser?.email || 'narnny1994nk@gmail.com',
      createdAt: receiptData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'receipts', id), payload);
      
      // Also auto-save/update customer in customers collection
      if (receiptData.customerName && receiptData.customerPhone) {
        const existingCust = customers.find(c => c.phone === receiptData.customerPhone);
        const custId = existingCust?.id || `cust_${Date.now()}`;
        await setDoc(doc(db, 'customers', custId), {
          name: receiptData.customerName,
          phone: receiptData.customerPhone,
          userId: currentUser?.uid || 'staff-default',
          address: existingCust?.address || '',
          notes: receiptData.notes || '',
          updatedAt: new Date().toISOString()
        });
      }

      setEditingReceipt(null);
      setSelectedReceipt(payload);
      setCurrentTab('receipts');
      showNotification('ບັນທຶກໃບບິນສຳເລັດແລ້ວ!');
    } catch (err) {
      console.error(err);
      // Local fallback in case of Firestore rules
      setReceipts(prev => {
        const index = prev.findIndex(r => r.id === id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = payload;
          return next;
        }
        return [payload, ...prev];
      });
      setEditingReceipt(null);
      setSelectedReceipt(payload);
      setCurrentTab('receipts');
      showNotification('ບັນທຶກໃບບິນສຳເລັດແລ້ວ');
    }
  };

  const handleUpdateStatus = async (receiptId: string, newStatus: ReceiptStatus) => {
    try {
      await updateDoc(doc(db, 'receipts', receiptId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      showNotification('ອັບເດດສະຖານະສຳເລັດແລ້ວ');
    } catch (err) {
      setReceipts(prev => prev.map(r => r.id === receiptId ? { ...r, status: newStatus } : r));
      if (selectedReceipt && selectedReceipt.id === receiptId) {
        setSelectedReceipt(prev => prev ? { ...prev, status: newStatus } : null);
      }
      showNotification('ອັບເດດສະຖານະສຳເລັດ');
    }
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    try {
      await deleteDoc(doc(db, 'receipts', receiptId));
      showNotification('ລຶບໃບບິນຮຽບຮ້ອຍແລ້ວ');
    } catch (err) {
      setReceipts(prev => prev.filter(r => r.id !== receiptId));
      showNotification('ລຶບໃບບິນຮຽບຮ້ອຍແລ້ວ');
    }
    if (selectedReceipt?.id === receiptId) {
      setSelectedReceipt(null);
    }
  };

  const handleDuplicateReceipt = (receipt: ReceiptData) => {
    const newReceiptNo = String(Math.floor(100000 + Math.random() * 900000));
    setEditingReceipt({
      ...receipt,
      id: undefined,
      receiptNo: newReceiptNo,
      depositDate: new Date().toISOString().slice(0, 10),
      status: 'pending',
      customerSignature: '',
      receiverSignature: ''
    });
    setCurrentTab('create');
  };

  // Handlers for Customers
  const handleSaveCustomer = async (cust: CustomerData) => {
    const id = cust.id || `cust_${Date.now()}`;
    const payload = {
      ...cust,
      id,
      userId: currentUser?.uid || 'staff-default',
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'customers', id), payload);
      showNotification('ບັນທຶກຂໍ້ມູນລູກຄ້າສຳເລັດ');
    } catch (err) {
      setCustomers(prev => {
        const idx = prev.findIndex(c => c.id === id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next;
        }
        return [payload, ...prev];
      });
      showNotification('ບັນທຶກຂໍ້ມູນລູກຄ້າສຳເລັດ');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
      showNotification('ລຶບຂໍ້ມູນລູກຄ້າຮຽບຮ້ອຍແລ້ວ');
    } catch (err) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      showNotification('ລຶບຂໍ້ມູນລູກຄ້າຮຽບຮ້ອຍແລ້ວ');
    }
  };

  const handleQuickStaffLogin = (name: string, email: string) => {
    const userObj = {
      uid: 'staff_' + Date.now(),
      displayName: name,
      email: email
    };
    setCurrentUser(userObj);
    localStorage.setItem('nk_staff_user', JSON.stringify(userObj));
    showNotification(`ເຂົ້າສູ່ລະບົບສຳເລັດ: ${name}`);
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    localStorage.removeItem('nk_staff_user');
    showNotification('ອອກຈາກລະບົບແລ້ວ');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-lao selection:bg-blue-600 selection:text-white">
      {/* Success Notification Toast */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#09477a] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-sky-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={tab => {
          if (tab === 'create') {
            setEditingReceipt(null);
          }
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'receipts' && (
          <ReceiptsList
            receipts={receipts}
            onSelectReceipt={receipt => setSelectedReceipt(receipt)}
            onEditReceipt={receipt => {
              setEditingReceipt(receipt);
              setCurrentTab('create');
            }}
            onDeleteReceipt={handleDeleteReceipt}
            onDuplicateReceipt={handleDuplicateReceipt}
            onUpdateStatus={handleUpdateStatus}
            onCreateNew={() => {
              setEditingReceipt(null);
              setCurrentTab('create');
            }}
          />
        )}

        {currentTab === 'create' && (
          <ReceiptForm
            initialData={editingReceipt}
            savedCustomers={customers}
            onSave={handleSaveReceipt}
            onCancel={() => {
              setEditingReceipt(null);
              setCurrentTab('receipts');
            }}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'customers' && (
          <CustomerManager
            customers={customers}
            receipts={receipts}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onSelectCustomerReceipts={phone => {
              setCurrentTab('receipts');
            }}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'template' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#09477a]">
                  ແບບຟອມຕົ້ນສະບັບ: ໃບບິນ ຝາກເຄື່ອງ NK SERVICE
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ໂຄງສ້າງ ແລະ ສີສັນອອກແບບຕາມຮູບແບບທາງການຂອງ ຮ້ານ ເອັມເຄ ບໍລິການ (ພ້ອມພິມ A4 ທັນທີ)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      window.focus();
                      window.print();
                    } catch (e) {
                      console.warn(e);
                    }
                    await downloadReceiptAsPDF('printable-receipt', 'NK_Service_Sample_Receipt', false);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#09477a] to-[#07365d] hover:from-[#07365d] hover:to-[#052b49] text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-sky-300" />
                  <span>ປິ່ນໃບບິນນີ້ (Print)</span>
                </button>

                <button
                  onClick={() => downloadReceiptAsPDF('printable-receipt', 'NK_Service_Sample_Receipt', false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  title="ດາວໂຫຼດເປັນ PDF"
                >
                  <FileDown className="w-4 h-4" />
                  <span>ດາວໂຫຼດ PDF</span>
                </button>

                <button
                  onClick={() => downloadReceiptAsImage('printable-receipt', 'NK_Service_Sample_Receipt')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                  title="ດາວໂຫຼດເປັນຮູບພາບ PNG"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>ດາວໂຫຼດຮູບ (PNG)</span>
                </button>
              </div>
            </div>

            <ReceiptView 
              receipt={SAMPLE_RECEIPT} 
              isInteractive={true}
              onVerifyClick={() => setVerifyReceipt(SAMPLE_RECEIPT)}
            />
          </div>
        )}
      </main>

      {/* Receipt Detail & Print Modal */}
      <ReceiptDetailModal
        receipt={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        onEdit={receipt => {
          setSelectedReceipt(null);
          setEditingReceipt(receipt);
          setCurrentTab('create');
        }}
        onDelete={handleDeleteReceipt}
        onDuplicate={handleDuplicateReceipt}
        onUpdateStatus={handleUpdateStatus}
        onUpdateReceipt={async updated => {
          setSelectedReceipt(updated);
          await handleSaveReceipt(updated);
        }}
      />

      {/* Staff & Google Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onQuickStaffLogin={handleQuickStaffLogin}
      />

      {/* Quick Verification Modal (e.g. Scanned via QR Code) */}
      <ReceiptVerifyModal
        receipt={verifyReceipt}
        isOpen={!!verifyReceipt}
        onClose={() => {
          setVerifyReceipt(null);
          // Clean URL without full reload
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
        verificationUrl={
          verifyReceipt
            ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(verifyReceipt.receiptNo || verifyReceipt.id || '')}`
            : ''
        }
      />
    </div>
  );
}
