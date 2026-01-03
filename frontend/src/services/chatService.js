import api from '../utils/api';

export const chatService = {
  async chatWithCoach(message) {
    const response = await api.post('/chat', { message });
    return response.data;
  },

  async getChatHistory(limit = 50) {
    const response = await api.get(`/chat/history?limit=${limit}`);
    return response.data;
  },

  async clearChatHistory() {
    const response = await api.delete('/chat/history');
    return response.data;
  }
};

