/**
 * Chuyển đổi số điện thoại Việt Nam sang định dạng quốc tế (+84)
 * @param phoneNumber - Số điện thoại đầu vào (098..., 09..., 84..., +84...)
 * @returns Số điện thoại ở định dạng +84...
 *
 * @example
 * formatPhoneToInternational('0987654321') // '+84987654321'
 * formatPhoneToInternational('84987654321') // '+84987654321'
 * formatPhoneToInternational('+84987654321') // '+84987654321'
 */
export const formatPhoneToInternational = (phoneNumber: string): string => {
  if (!phoneNumber) {
    return phoneNumber;
  }

  // Loại bỏ khoảng trắng và các ký tự đặc biệt
  let cleanedPhone = phoneNumber.replace(/[\s\-().]/g, '');

  // Nếu số bắt đầu bằng 0, thay thế bằng +84
  if (cleanedPhone.startsWith('0')) {
    return '+84' + cleanedPhone.substring(1);
  }

  // Nếu số bắt đầu bằng 84 (không có +), thêm + vào đầu
  if (cleanedPhone.startsWith('84') && !cleanedPhone.startsWith('+84')) {
    return '+' + cleanedPhone;
  }

  // Nếu đã có +84, trả về nguyên bản
  if (cleanedPhone.startsWith('+84')) {
    return cleanedPhone;
  }

  // Trường hợp khác, giả định là số Việt Nam và thêm +84
  return '+84' + cleanedPhone;
};

/**
 * Kiểm tra số điện thoại Việt Nam có hợp lệ không
 * @param phoneNumber - Số điện thoại cần kiểm tra
 * @returns true nếu số điện thoại hợp lệ
 */
export const isValidVietnamesePhone = (phoneNumber: string): boolean => {
  if (!phoneNumber) {
    return false;
  }

  const cleanedPhone = phoneNumber.replace(/[\s\-().]/g, '');

  // Các mẫu số điện thoại Việt Nam hợp lệ:
  // - 0 + 9/8/7/5/3 + 8 số (tổng 10 số)
  // - +84 + 9/8/7/5/3 + 8 số
  // - 84 + 9/8/7/5/3 + 8 số
  const patterns = [
    /^0[3|5|7|8|9]\d{8}$/,        // 0987654321
    /^\+84[3|5|7|8|9]\d{8}$/,     // +84987654321
    /^84[3|5|7|8|9]\d{8}$/,       // 84987654321
  ];

  return patterns.some(pattern => pattern.test(cleanedPhone));
};
