import { NextRequest, NextResponse } from 'next/server';
import { blogService } from '@/lib/services/blogService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    let posts;

    if (category) {
      posts = await blogService.getPostsByCategory(category);
    } else if (tag) {
      posts = await blogService.getPostsByTag(tag);
    } else {
      posts = await blogService.getAllPosts(includeUnpublished);
    }

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error('Blog posts fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      excerpt, 
      content, 
      author, 
      authorRole, 
      category, 
      tags, 
      readTimeMin, 
      status,
      gradient,
      aiGenerate,
      topic,
    } = body;

    // If AI generation is requested
    if (aiGenerate && topic) {
      const generatedPost = await blogService.generatePostWithAI(
        topic,
        category || 'General',
        author || 'AI Writer'
      );

      return NextResponse.json({
        success: true,
        post: generatedPost,
        message: 'Blog post generated with AI (template). In production, this would use real AI.',
      });
    }

    // Manual post creation
    if (!title || !excerpt || !content || !author || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newPost = await blogService.createPost({
      title,
      excerpt,
      content,
      author,
      authorRole: authorRole || 'Contributor',
      category,
      tags: tags || [],
      readTimeMin: readTimeMin || 5,
      status: status || 'draft',
      gradient: gradient || 'from-purple-500/20 to-blue-500/20',
    });

    return NextResponse.json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    console.error('Blog post creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const updatedPost = await blogService.updatePost(id, updates);

    if (!updatedPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error('Blog post update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const deleted = await blogService.deletePost(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Blog post deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
