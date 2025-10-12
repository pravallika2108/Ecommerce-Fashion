// app/api/auth/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ecommerce-fashion-03io.onrender.com';

async function proxyRequest(
  request: NextRequest,
  method: string,
  params: { path: string[] }
) {
  try {
    const pathString = params.path.join('/');
    const url = `${BACKEND_URL}/api/auth/${pathString}`;
    
    console.log(`[API Proxy] ${method} ${url}`);

    // Get request body for POST/PUT methods
    let body = null;
    if (method === 'POST' || method === 'PUT') {
      body = await request.json();
    }

    // Get cookies from frontend request
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Build headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward cookies to backend
    if (accessToken || refreshToken) {
      const cookieHeader = [
        accessToken ? `accessToken=${accessToken}` : '',
        refreshToken ? `refreshToken=${refreshToken}` : '',
      ]
        .filter(Boolean)
        .join('; ');
      
      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
      }
    }

    // Make request to backend
    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    console.log(`[API Proxy] Response status: ${response.status}`);

    // Create Next.js response
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Extract and forward Set-Cookie headers from backend
    const setCookieHeaders = response.headers.get('set-cookie');
    
    if (setCookieHeaders) {
      console.log('[API Proxy] Forwarding cookies to frontend');
      
      // Parse Set-Cookie header (can contain multiple cookies)
      const cookieStrings = setCookieHeaders.split(/,(?=\s*\w+=)/);
      
      cookieStrings.forEach((cookieString) => {
        const cookieParts = cookieString.split(';').map(part => part.trim());
        const [nameValue] = cookieParts;
        const [name, value] = nameValue.split('=');
        
        if (name && value) {
          // Determine maxAge based on cookie name
          const maxAge = name.includes('access') 
            ? 60 * 60 // 1 hour
            : 7 * 24 * 60 * 60; // 7 days

          // Set cookie on frontend domain
          nextResponse.cookies.set(name, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge,
          });
          
          console.log(`[API Proxy] Set cookie: ${name}`);
        }
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, 'POST', params);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, 'GET', params);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, 'PUT', params);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, 'DELETE', params);
}
