import { NextRequest, NextResponse } from 'next/server';
import { getArcGISToken } from '@/lib/arcgisToken';

export async function GET(req: NextRequest) {
  try {
    // Typically stored in environment variables
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
    }

    // Possibly from your older approach:
    const refererUrl = 'https://arcgis.curtin.edu.au';
    // Or if your enterprise portal is at a different domain, adjust accordingly

    const token = await getArcGISToken(clientId, clientSecret, refererUrl);
    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('Error generating token:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
