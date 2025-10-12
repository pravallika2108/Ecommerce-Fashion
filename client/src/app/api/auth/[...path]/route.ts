// app/api/auth/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ecommerce-fashion-03io.onrender.com';

async function proxyRequest(
  method: string,
  pathArray: string[],
  request: NextRequest
) {
  try {
    const pathStr = pathArray.join('/');
    const url = `${BACKEND_URL}/api/auth/${pathStr}`;
    
    console.log(`\n=== PROXY REQUEST ===`);
    console.log(`Method: ${method}`);
    console.log(`Backend URL: ${url}`);

    let body = null;
    const contentType = request.headers.get('content-type');

    if (method !== 'GET' && method !== 'HEAD' && contentType?.includes('application/json')) {
      try {
        body = await request.json();
        console.log(`Request Body:`, body);
      } catch (e) {
        console.log(`No JSON body or parse error`);
      }
    }

    console.log(`Sending request to backend...`);

    const backendResponse = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Forward auth header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!,
        }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`Backend Response Status: ${backendResponse.status}`);
    
    let responseData;
    try {
      responseData = await backendResponse.json();
      console.log(`Backend Response Body:`, responseData);
    } catch (e) {
      const text = await backendResponse.text();
      console.log(`Backend Response (text):`, text);
      responseData = text;
    }

    // Create the response
    const response = NextResponse.json(responseData, {
      status: backendResponse.status,
    });

    // ✅ CRITICAL: Forward Set-Cookie headers from backend
    const setCookieHeaders = backendResponse.headers.getSetCookie();
    console.log(`Set-Cookie Headers from backend:`, setCookieHeaders);

    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        console.log(`Forwarding cookie: ${cookie.substring(0, 50)}...`);
        response.headers.append('Set-Cookie', cookie);
      });
      console.log(`✅ Forwarded ${setCookieHeaders.length} cookies`);
    } else {
      console.log(`⚠️ No Set-Cookie headers found in backend response`);
    }

    console.log(`=== PROXY RESPONSE ===\n`);
    return response;
  } catch (error) {
    console.error('\n❌ PROXY ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Proxy request failed',
        details: errorMessage 
      },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest('GET', path, request);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest('POST', path, request);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest('PUT', path, request);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest('DELETE', path, request);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest('PATCH', path, request);
}
