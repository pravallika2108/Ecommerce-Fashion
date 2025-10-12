// app/api/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ecommerce-fashion-03io.onrender.com';

export async function GET(request: NextRequest) {
  return proxyRequest('GET', request);
}

export async function POST(request: NextRequest) {
  return proxyRequest('POST', request);
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

async function proxyRequest(method: string, request: NextRequest) {
  try {
    // Extract the FULL path after /api/ (e.g., /api/auth/register -> auth/register)
    const path = request.nextUrl.pathname.replace('/api/', '');
    const searchParams = request.nextUrl.searchParams.toString();
    
    // Forward to backend with the SAME path structure
    // Frontend: /api/auth/register -> Backend: /api/auth/register
    const backendUrl = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`[PROXY] ${method} ${request.nextUrl.pathname} -> ${backendUrl}`);

    // Get request body if it exists
    let body = null;
    if (method !== 'GET' && method !== 'DELETE') {
      body = await request.text();
    }

    // Get cookies from the incoming request
    const cookies = request.headers.get('cookie');
    
    console.log(`[PROXY] Forwarding cookies:`, cookies ? 'yes' : 'no');

    // Forward the request to backend with cookies
    const response = await fetch(backendUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies to backend
        ...(cookies && { 'Cookie': cookies }),
        // Forward any authorization headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
      },
      body: body || undefined,
      credentials: 'include',
    });

    // Get response data
    const data = await response.text();

    // Extract cookies from backend response
    const setCookieHeaders = response.headers.getSetCookie();
    
    console.log(`[PROXY] Backend response: ${response.status}`);
    console.log(`[PROXY] Response body:`, data.substring(0, 200)); // First 200 chars
    
    if (setCookieHeaders.length > 0) {
      console.log(`[PROXY] Setting ${setCookieHeaders.length} cookies`);
    }

    // Create response with same status and data
    const proxyResponse = new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Forward all Set-Cookie headers to frontend domain
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
