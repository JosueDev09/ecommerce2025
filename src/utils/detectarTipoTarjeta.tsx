export const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    
    // Visa: empieza con 4
    if (/^4/.test(cleaned)) {
      return "visa";
    }
    // Mastercard: empieza con 51-55 o 2221-2720
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
      return "mastercard";
    }
    // American Express: empieza con 34 o 37
    if (/^3[47]/.test(cleaned)) {
      return "amex";
    }
    
    return "unknown";
  };
