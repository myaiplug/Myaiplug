import { NextRequest, NextResponse } from 'next/server';
import { resourceService } from '@/lib/services/resourceService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const proOnly = searchParams.get('proOnly') === 'true';

    if (id) {
      // Get specific resource
      const resource = await resourceService.getResourceById(id);
      
      if (!resource) {
        return NextResponse.json(
          { success: false, error: 'Resource not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        resource,
      });
    }

    if (search) {
      // Search resources
      const resources = await resourceService.searchResources(search);
      return NextResponse.json({
        success: true,
        resources,
      });
    }

    if (category) {
      // Get resources by category
      const resources = await resourceService.getResourcesByCategory(category);
      return NextResponse.json({
        success: true,
        resources,
      });
    }

    if (type) {
      // Get resources by type
      const resources = await resourceService.getResourcesByType(type as any);
      return NextResponse.json({
        success: true,
        resources,
      });
    }

    // Get all resources
    const resources = await resourceService.getAllResources(proOnly);

    return NextResponse.json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error('Resources fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, resourceId } = body;

    if (action === 'download' && resourceId) {
      // Record download
      await resourceService.recordDownload(resourceId);

      return NextResponse.json({
        success: true,
        message: 'Download recorded',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Resource action error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
