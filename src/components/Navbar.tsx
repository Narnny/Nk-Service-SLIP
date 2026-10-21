import React from 'react';
import { 
  FileText, 
  Plus, 
  Users, 
  Phone, 
  LogIn, 
  LogOut, 
  Shield, 
  Sparkles,
  Printer,
  FileCheck
} from 'lucide-react';
import { NkLogo } from './NkLogo';

interface NavbarProps {
  currentTab: 'receipts' | 'create' | 'customers' | 'template';
  onSelectTab: (tab: 'receipts' | 'create' | 'customers' | 'template') => void;
  currentUser: { uid: string; displayName?: string; email?: string; photoURL?: string } | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onSignOut
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 font-lao shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo and Brand Title */}
          <div 
            onClick={() => onSelectTab('receipts')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <NkLogo size="sm" showSlogan={false} className="w-12 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-[#0a3a60] group-hover:text-blue-700 transition-colors">
                  NK SERVICE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0369a1] border border-blue-200 hidden sm:inline-block">
                  ໃບບິນຝາກເຄື່ອງ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                ຮ້ານ ເອັມເຄ ບໍລິການ • ໂທ 020 9977 4515
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('receipts')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'receipts'
                  ? 'bg-blue-50 text-[#09477a] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ໃບບິນທັງໝົດ</span>
            </button>

            <button
              onClick={() => onSelectTab('create')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'create'
                  ? 'bg-[#09477a] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>ສ້າງໃບບິນໃໝ່</span>
            </button>

            <button
              onClick={() => onSelectTab('customers')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'customers'
                  ? 'bg-blue-50 text-[#09477a] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>ລູກຄ້າ / ສະມາຊິກ</span>
            </button>

            <button
              onClick={() => onSelectTab('template')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'template'
                  ? 'bg-blue-50 text-[#09477a] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>ແບບຟອມຕົ້ນສະບັບ</span>
            </button>
          </nav>

          {/* User Auth and Status */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Avatar" 
                      className="w-6 h-6 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#09477a] text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.displayName ? currentUser.displayName[0] : 'S'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.displayName || 'ພະນັກງານ'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono leading-none truncate max-w-[120px]">
                      {currentUser.email || 'NK Service Staff'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  title="ອອກຈາກລະບົບ"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#09477a] text-white hover:bg-[#07365d] shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>ເຂົ້າສູ່ລະບົບພະນັກງານ</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => onSelectTab('receipts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              currentTab === 'receipts' ? 'bg-blue-50 text-[#09477a]' : 'text-slate-600'
            }`}
          >
            ໃບບິນທັງໝົດ
          </button>
          <button
            onClick={() => onSelectTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              currentTab === 'create' ? 'bg-[#09477a] text-white' : 'text-slate-600'
            }`}
          >
            + ສ້າງໃບບິນ
          </button>
          <button
            onClick={() => onSelectTab('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              currentTab === 'customers' ? 'bg-blue-50 text-[#09477a]' : 'text-slate-600'
            }`}
          >
            ລູກຄ້າ
          </button>
          <button
            onClick={() => onSelectTab('template')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              currentTab === 'template' ? 'bg-blue-50 text-[#09477a]' : 'text-slate-600'
            }`}
          >
            ຕົ້ນສະບັບ
          </button>
        </div>
      </div>
    </header>
  );
};
