import { NextRequest, NextResponse } from 'next/server';
import pdfGeneratorService from '@/services/pdfGeneratorService';

/**
 * API endpoint to generate PDF for backend consumption
 * GET /api/export-pdf?projectId=xxx&reportType=seo
 */
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const reportType = searchParams.get('reportType') || 'seo';

    // Loading protection - validate projectId
    if (!projectId || projectId === 'undefined' || projectId === 'all' || projectId.trim() === '') {
      console.log('[API] Invalid or missing projectId:', projectId);
      return NextResponse.json(
        { success: false, error: 'Invalid or missing projectId' },
        { status: 400 }
      );
    }

    console.log(`[API] Generating PDF for projectId: ${projectId}, reportType: ${reportType}`);

    // Generate PDF buffer using server-side generator
    const pdfBuffer = await pdfGeneratorService.generatePDFBuffer(projectId, reportType);

    // Empty PDF protection
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error('[API] Generated PDF is empty');
      return NextResponse.json(
        { success: false, error: 'Generated PDF is empty' },
        { status: 500 }
      );
    }

    // Minimum PDF size check (should be at least 10KB for a valid 30-page PDF)
    if (pdfBuffer.length < 10240) {
      console.warn(`[API] PDF size suspiciously small: ${pdfBuffer.length} bytes`);
    }

    console.log(`[API] PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    // Return PDF as response
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `report-export-${projectId}-${timestamp}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('[API] PDF generation failed:', error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'PDF generation failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for batch PDF generation
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { projectId, reportType = 'seo' } = body;

    // Loading protection - validate projectId
    if (!projectId || projectId === 'undefined' || projectId === 'all' || projectId.trim() === '') {
      console.log('[API] Invalid or missing projectId:', projectId);
      return NextResponse.json(
        { success: false, error: 'Invalid or missing projectId' },
        { status: 400 }
      );
    }

    console.log(`[API] Generating PDF for projectId: ${projectId}, reportType: ${reportType}`);

    // Generate PDF buffer using server-side generator
    const pdfBuffer = await pdfGeneratorService.generatePDFBuffer(projectId, reportType);

    // Empty PDF protection
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error('[API] Generated PDF is empty');
      return NextResponse.json(
        { success: false, error: 'Generated PDF is empty' },
        { status: 500 }
      );
    }

    // Minimum PDF size check (should be at least 10KB for a valid 30-page PDF)
    if (pdfBuffer.length < 10240) {
      console.warn(`[API] PDF size suspiciously small: ${pdfBuffer.length} bytes`);
    }

    console.log(`[API] PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    // Return PDF as response
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `report-export-${projectId}-${timestamp}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('[API] PDF generation failed:', error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'PDF generation failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
