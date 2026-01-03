import api from '../utils/api';

export const barcodeService = {
  async lookupBarcode(barcode) {
    const response = await api.post('/meals/barcode', { barcode });
    return response.data;
  }
};

