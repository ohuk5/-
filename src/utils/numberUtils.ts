/**
 * Utility functions for normalizing and formatting numbers
 * Ensures standard English numerals (0-9) throughout the app
 */

export const toEnglishDigits = (val: string | number): string => {
  if (typeof val === 'number') return val.toString();
  if (!val) return '';
  return val
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
};

export const sanitizeNumericInput = (val: string, allowNegative: boolean = false, allowDecimal: boolean = true): string => {
  let cleaned = toEnglishDigits(val);
  // remove characters except digits, minus, and dot
  if (allowNegative && allowDecimal) {
    cleaned = cleaned.replace(/[^0-9.-]/g, '');
  } else if (allowDecimal) {
    cleaned = cleaned.replace(/[^0-9.]/g, '');
  } else if (allowNegative) {
    cleaned = cleaned.replace(/[^0-9-]/g, '');
  } else {
    cleaned = cleaned.replace(/[^0-9]/g, '');
  }
  return cleaned;
};
