import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  ShieldCheck, 
  User, 
  Mail, 
  Key, 
  AlertCircle 
} from 'lucide-react';
import { 
  auth, 
  googleProvider 
} from '../firebase';
import { signInWithPopup } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickStaffLogin: (name: string, email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onQuickStaffLogin
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [staffName, setStaffName] = useState('ພະນັກງານ NK Service');
  const [staffEmail, setStaffEmail] = useState('narnny1994nk@gmail.com');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message?.includes('popup-closed-by-user')
          ? 'ທ່ານໄດ້ປິດໜ້າຕ່າງເຂົ້າສູ່ລະບົບກ່ອນສຳເລັດ'
          : 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບດ້ວຍ Google: ' + (err.message || '')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) {
      setErrorMsg('ກະລຸນາປ້ອນຊື່ພະນັກງານ');
      return;
    }
    onQuickStaffLogin(staffName.trim(), staffEmail.trim() || 'staff@nkservice.la');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs font-lao">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-[#09477a] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-300" />
            <h3 className="font-bold text-sm">ລະບົບສະມາຊິກ / ພະນັກງານ NK Service</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-50 text-[#09477a] rounded-2xl flex items-center justify-center mx-auto mb-2 font-black text-xl">
              NK
            </div>
            <h4 className="font-bold text-slate-800 text-base">ເຂົ້າສູ່ລະບົບເພື່ອຈັດການໃບບິນ</h4>
            <p className="text-xs text-slate-500 mt-1">
              ຈັດການຂໍ້ມູນລູກຄ້າ, ໃບບິນຝາກເຄື່ອງ, ແລະ ຕິດຕາມສະຖານະຢ່າງປອດໄພ
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real Google Login */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm shadow-xs transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'ກຳລັງເຊື່ອມຕໍ່...' : 'ເຂົ້າສູ່ລະບົບດ້ວຍ Google Account'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-slate-200"></span>
            <span className="px-3 bg-white text-[11px] text-slate-400 uppercase font-bold absolute">
              ຫຼື ເຂົ້າສູ່ລະບົບພະນັກງານດ່ວນ
            </span>
          </div>

          {/* Quick Staff Login Form */}
          <form onSubmit={handleCustomLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ຊື່ພະນັກງານ (Staff Name)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  placeholder="ຊື່ພະນັກງານປະຈຳຮ້ານ"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ອີເມວພະນັກງານ (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={staffEmail}
                  onChange={e => setStaffEmail(e.target.value)}
                  placeholder="narnny1994nk@gmail.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors"
            >
              ເຂົ້າສູ່ລະບົບພະນັກງານ (Staff Login)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
