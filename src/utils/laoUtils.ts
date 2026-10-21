/**
 * Utility functions for Lao language formatting, numbers, and currency conversion
 */

const LAO_DIGITS = ['ສູນ', 'ໜຶ່ງ', 'ສອງ', 'ສາມ', 'ສີ່', 'ຫ້າ', 'ຫົກ', 'ເຈັດ', 'ແປດ', 'ເກົ້າ'];
const LAO_UNITS = ['', 'ສິບ', 'ຮ້ອຍ', 'ພັນ', 'ໝື່ນ', 'ແສນ'];

/**
 * Converts a number (up to billions) into Lao text for currency (ກີບຖ້ວນ)
 * e.g. 150000 -> "ໜຶ່ງແສນຫ້າໝື່ນກີບຖ້ວນ"
 */
export function numberToLaoWords(num: number): string {
  if (isNaN(num) || num === 0) return 'ສູນກີບຖ້ວນ';

  const absNum = Math.floor(Math.abs(num));
  if (absNum === 0) return 'ສູນກີບຖ້ວນ';

  function convertGroup(n: number): string {
    let result = '';
    const digits = String(n).split('').map(Number);
    const len = digits.length;

    for (let i = 0; i < len; i++) {
      const d = digits[i];
      const pos = len - 1 - i;

      if (d === 0) continue;

      if (pos === 1) {
        // Tens position
        if (d === 1) {
          result += 'ສິບ';
        } else if (d === 2) {
          result += 'ຊາວ';
        } else {
          result += LAO_DIGITS[d] + 'ສິບ';
        }
      } else if (pos === 0) {
        // Unit position
        if (d === 1 && len > 1 && digits[len - 2] !== 0) {
          result += 'ເອັດ';
        } else {
          result += LAO_DIGITS[d];
        }
      } else {
        result += LAO_DIGITS[d] + LAO_UNITS[pos];
      }
    }
    return result;
  }

  // Handle millions
  let result = '';
  if (absNum >= 1000000) {
    const millions = Math.floor(absNum / 1000000);
    const remainder = absNum % 1000000;
    result += convertGroup(millions) + 'ລ້ານ';
    if (remainder > 0) {
      result += convertGroup(remainder);
    }
  } else {
    result = convertGroup(absNum);
  }

  return (num < 0 ? 'ລົບ ' : '') + result + 'ກີບຖ້ວນ';
}

/**
 * Formats a number with comma separators (e.g. 150,000)
 */
export function formatKip(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '0';
  const val = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(val)) return '0';
  return new Intl.NumberFormat('lo-LA').format(val);
}

/**
 * Returns current date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current time formatted as HH:mm
 */
export function getCurrentTimeString(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
}

/**
 * Formats Lao date for display (e.g. "21/10/2026")
 */
export function formatLaoDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: {
    label: 'ລໍຖ້າກວດເຊັກ',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-300'
  },
  in_progress: {
    label: 'ກຳລັງດຳເນີນການສ້ອມແປງ',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-300'
  },
  completed: {
    label: 'ສຳເລັດແລ້ວ (ລໍຖ້າຮັບ)',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-300'
  },
  picked_up: {
    label: 'ລູກຄ້າມາຮັບເຄື່ອງແລ້ວ',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-300'
  },
  cancelled: {
    label: 'ຍົກເລີກ',
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-300'
  }
};
