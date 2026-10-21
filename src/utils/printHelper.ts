import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Downloads the receipt element as a high-resolution PNG image
 */
export async function downloadReceiptAsImage(
  elementId: string = 'printable-receipt',
  filename: string = 'NK_Service_Receipt'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return false;
  }

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2.5, // 2.5x for sharp 300DPI text and QR code
      backgroundColor: '#ffffff',
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      }
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Error generating receipt image:', err);
    return false;
  }
}

/**
 * Generates and downloads a clean, printable PDF file (A4 or 80mm Thermal)
 */
export async function downloadReceiptAsPDF(
  elementId: string = 'printable-receipt',
  filename: string = 'NK_Service_Receipt',
  isThermal: boolean = false
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return false;
  }

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      }
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    if (isThermal) {
      // 80mm roll thermal paper
      const pdfWidth = 80; // mm
      const pdfHeight = (img.height * pdfWidth) / img.width + 10;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 5, pdfWidth, (img.height * pdfWidth) / img.width);
      pdf.save(`${filename}.pdf`);
    } else {
      // Standard A4 portrait
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (img.height * contentWidth) / img.width;

      pdf.addImage(dataUrl, 'PNG', margin, margin, contentWidth, Math.min(contentHeight, pageHeight - margin * 2));
      pdf.save(`${filename}.pdf`);
    }

    return true;
  } catch (err) {
    console.error('Error generating receipt PDF:', err);
    return false;
  }
}

/**
 * Main print executor
 * Attempts window.print() and returns whether browser print dialog opened
 */
export function printReceiptElement(
  elementId: string = 'printable-receipt',
  title: string = 'NK_Service_Receipt'
): boolean {
  const originalTitle = document.title;
  document.title = title;

  try {
    window.focus();
    window.print();
    return true;
  } catch (e) {
    console.warn('Direct window.print() was not available:', e);
    return false;
  } finally {
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }
}
