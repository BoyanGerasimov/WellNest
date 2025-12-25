import api from '../utils/api';

export const forumService = {
  // Get all forum posts
  getPosts: async (params = {}) => {
    const response = await api.get('/forum/posts', { params });
    return response.data;
  },

  // Get single forum post
  getPost: async (id) => {
    const response = await api.get(`/forum/posts/${id}`);
    return response.data;
  },

  // Create forum post
  createPost: async (postData) => {
    const response = await api.post('/forum/posts', postData);
    return response.data;
  },

  // Update forum post
  updatePost: async (id, postData) => {
    const response = await api.put(`/forum/posts/${id}`, postData);
    return response.data;
  },

  // Delete forum post
  deletePost: async (id) => {
    const response = await api.delete(`/forum/posts/${id}`);
    return response.data;
  },

  // Like/Unlike post
  toggleLike: async (id) => {
    const response = await api.post(`/forum/posts/${id}/like`);
    return response.data;
  },

  // Add comment to post
  addComment: async (postId, content) => {
    const response = await api.post(`/forum/posts/${postId}/comments`, { content });
    return response.data;
  },

  // Delete comment
  deleteComment: async (id) => {
    const response = await api.delete(`/forum/comments/${id}`);
    return response.data;
  }
};

