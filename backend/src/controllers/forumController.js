const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in forumController:', error.message);
  throw error;
}

// @desc    Get all forum posts
// @route   GET /api/forum/posts
// @access  Public (authenticated users)
exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        }
      }),
      prisma.forumPost.count({ where })
    ]);

    // Check which posts the current user has liked
    const postIds = posts.map(p => p.id);
    const userLikes = req.user ? await prisma.forumLike.findMany({
      where: {
        userId: req.user.id,
        postId: { in: postIds }
      },
      select: { postId: true }
    }) : [];

    const likedPostIds = new Set(userLikes.map(l => l.postId));

    const postsWithLikes = posts.map(post => ({
      ...post,
      isLiked: likedPostIds.has(post.id)
    }));

    res.status(200).json({
      success: true,
      data: postsWithLikes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single forum post
// @route   GET /api/forum/posts/:id
// @access  Public (authenticated users)
exports.getPost = async (req, res, next) => {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await prisma.forumPost.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } }
    });

    // Check if user liked this post
    const isLiked = req.user ? await prisma.forumLike.findFirst({
      where: {
        userId: req.user.id,
        postId: req.params.id
      }
    }) : null;

    res.status(200).json({
      success: true,
      data: {
        ...post,
        isLiked: !!isLiked
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create forum post
// @route   POST /api/forum/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, category, tags } = req.body;

    const post = await prisma.forumPost.create({
      data: {
        userId: req.user.id,
        title,
        content,
        category: category || 'general',
        tags: tags || []
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update forum post
// @route   PUT /api/forum/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await prisma.forumPost.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you do not have permission to edit it'
      });
    }

    const { title, content, category, tags } = req.body;

    const updatedPost = await prisma.forumPost.update({
      where: { id: req.params.id },
      data: {
        title: title !== undefined ? title : post.title,
        content: content !== undefined ? content : post.content,
        category: category !== undefined ? category : post.category,
        tags: tags !== undefined ? tags : post.tags
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete forum post
// @route   DELETE /api/forum/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await prisma.forumPost.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you do not have permission to delete it'
      });
    }

    await prisma.forumPost.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike post
// @route   POST /api/forum/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = await prisma.forumLike.findFirst({
      where: {
        userId,
        postId
      }
    });

    if (existingLike) {
      await prisma.forumLike.delete({
        where: { id: existingLike.id }
      });
      return res.status(200).json({
        success: true,
        liked: false,
        message: 'Post unliked'
      });
    } else {
      await prisma.forumLike.create({
        data: {
          userId,
          postId
        }
      });
      return res.status(200).json({
        success: true,
        liked: true,
        message: 'Post liked'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to post
// @route   POST /api/forum/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content } = req.body;
    const postId = req.params.id;

    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = await prisma.forumComment.create({
      data: {
        userId: req.user.id,
        postId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/forum/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await prisma.forumComment.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or you do not have permission to delete it'
      });
    }

    await prisma.forumComment.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

