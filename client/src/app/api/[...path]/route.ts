// app/api/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL||"https://ecommerce-fashion-1-bboc.onrender.com" ;
console.log("backend url",BACKEND_URL)
export async function POST(request: NextRequest) {
  return proxyRequest('POST', request);
}

async function proxyRequest(method: string, request: NextRequest) {
  try {
    const path = request.nextUrl.pathname.replace('/api/', '');
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`[PROXY] ${method} ${request.nextUrl.pathname} -> ${backendUrl}`);

    // Get the Content-Type from request
    const contentType = request.headers.get('content-type') || '';
    
    let body = null;
    let headers: Record<string, string> = {};

    // Handle multipart/form-data (file uploads)
    if (contentType.includes('multipart/form-data')) {
      console.log('[PROXY] Handling multipart/form-data');
      
      // Get the FormData from the request
      const formData = await request.formData();
      
      // Forward the FormData directly
      body = formData;
      
      // Don't set Content-Type - let fetch set it with boundary
      headers = {
        ...(request.headers.get('cookie') && { 'Cookie': request.headers.get('cookie')! }),
        ...(request.headers.get('authorization') && { 'Authorization': request.headers.get('authorization')! }),
      };
    } else {
      // Handle JSON and other content types
      if (method !== 'GET' && method !== 'DELETE') {
        body = await request.text();
      }
      
      headers = {
        'Content-Type': 'application/json',
        ...(request.headers.get('cookie') && { 'Cookie': request.headers.get('cookie')! }),
        ...(request.headers.get('authorization') && { 'Authorization': request.headers.get('authorization')! }),
      };
    }

    const response = await fetch(backendUrl, {
      method,
      headers,
      body: body || undefined,
      credentials: 'include',
    });

    const data = await response.text();
    const setCookieHeaders = response.headers.getSetCookie();
    
    console.log(`[PROXY] Backend response: ${response.status}`);
    
    const proxyResponse = new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setCookieHeaders.forEach(cookie => {
      proxyResponse.headers.append('Set-Cookie', cookie);
    });

    return proxyResponse;
  } catch (error) {
    console.error('[PROXY] Error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    );
  }
}

// Add other methods...
export async function GET(request: NextRequest) {
  return proxyRequest('GET', request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest('PUT', request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest('DELETE', request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest('PATCH', request);
}
