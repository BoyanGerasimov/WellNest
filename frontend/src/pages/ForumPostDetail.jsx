import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { forumService } from '../services/forumService';
import { useAuth } from '../context/AuthContext';

const ForumPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await forumService.getPost(id);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await forumService.toggleLike(id);
      loadPost(); // Reload to update like status
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      setSubmittingComment(true);
      await forumService.addComment(id, commentContent);
      setCommentContent('');
      loadPost(); // Reload to show new comment
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await forumService.deleteComment(commentId);
      loadPost();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await forumService.deletePost(id);
      navigate('/forum');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Post not found</p>
          <Link to="/forum" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = post.userId === user?.id;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <Link to="/forum" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
        ← Back to Forum
      </Link>

      {/* Post */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
              {post.isPinned && <span className="text-yellow-500 text-xl">📌</span>}
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                {post.category}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                {post.user?.avatar && (
                  <img src={post.user.avatar} alt={post.user.name} className="w-6 h-6 rounded-full" />
                )}
                <span>By {post.user?.name || 'Anonymous'}</span>
              </div>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{post.views || 0} views</span>
            </div>
          </div>
          <button
            onClick={handleLike}
            className={`p-2 rounded transition-colors ${
              post.isLiked
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">{post.isLiked ? '❤️' : '🤍'}</span>
            <span className="block text-xs text-center mt-1">{post._count?.likes || 0}</span>
          </button>
        </div>

        <div className="prose max-w-none mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
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

        {isOwner && (
          <div className="flex gap-2 pt-4 border-t">
            <Link
              to={`/forum/${id}/edit`}
              className="text-indigo-600 hover:text-indigo-700 text-sm"
            >
              Edit
            </Link>
            <button
              onClick={handleDeletePost}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Comments ({post.comments?.length || 0})
        </h2>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            required
          />
          <button
            type="submit"
            disabled={submittingComment || !commentContent.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-indigo-200 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {comment.user?.avatar && (
                        <img
                          src={comment.user.avatar}
                          alt={comment.user.name}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className="font-medium text-gray-900 text-sm">
                        {comment.user?.name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                  {comment.userId === user?.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-700 text-xs ml-2"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPostDetail;

