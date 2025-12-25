import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forumService } from '../services/forumService';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadPosts();
  }, [category]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await forumService.getPosts({ category: category || undefined, limit: 20 });
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await forumService.toggleLike(postId);
      loadPosts(); // Reload to update like status
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const categories = [
    { value: '', label: 'All' },
    { value: 'workout', label: 'Workout' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'motivation', label: 'Motivation' },
    { value: 'questions', label: 'Questions' },
    { value: 'general', label: 'General' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
        <Link
          to="/forum/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          + New Post
        </Link>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-md transition-colors ${
              category === cat.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                    {post.isPinned && <span className="text-yellow-500">📌</span>}
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By {post.user?.name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{post._count?.comments || 0} comments</span>
                    <span>•</span>
                    <span>{post.views || 0} views</span>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleLike(post.id)}
                  className={`ml-4 p-2 rounded transition-colors ${
                    post.isLiked
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{post.isLiked ? '❤️' : '🤍'}</span>
                  <span className="block text-xs text-center mt-1">{post._count?.likes || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Forum;

