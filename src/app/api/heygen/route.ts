import { NextRequest, NextResponse } from "next/server";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }

    const response = await fetch(
      "https://api.heygen.com/v1/streaming.create_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": HEYGEN_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Heygen API error response:', data);
      throw new Error(`Failed to fetch from Heygen: ${data.message || response.statusText}`);
    }

    if (!data.data?.token) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from Heygen API');
    }

    return NextResponse.json({ token: data.data.token }, { status: 200 });
  } catch (error) {
    console.error("Error in Heygen route:", error);

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to retrieve access token",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}