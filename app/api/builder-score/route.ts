import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseAbi, zeroAddress } from 'viem';
import { base } from 'viem/chains';
import { normalize, namehash } from 'viem/ens';

// Initialize Viem Client (Server-side only)
const client = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL) // Falls back to default public RPC if env not set
});

// Official Base L2 Resolver Address
const BASENAME_RESOLVER_ADDRESS = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";

// Minimal ABI to call 'addr' on the Resolver
const RESOLVER_ABI = parseAbi([
  'function addr(bytes32 node) view returns (address)'
]);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const basename = searchParams.get('name');

  if (!basename) {
    return NextResponse.json({ error: 'Basename is required' }, { status: 400 });
  }

  try {
    // 1. Prepare and Normalize Basename
    let nameToResolve = basename.trim().toLowerCase();
    if (!nameToResolve.endsWith('.base.eth') && !nameToResolve.includes('.')) {
      nameToResolve += '.base.eth';
    }

    // 2. Resolve Basename to Address (Server-side)
    // We query the L2 Resolver contract directly using 'addr(node)' to avoid Universal Resolver errors
    const node = namehash(normalize(nameToResolve));
    
    const address = await client.readContract({
      address: BASENAME_RESOLVER_ADDRESS,
      abi: RESOLVER_ABI,
      functionName: 'addr',
      args: [node]
    });

    if (!address || address === zeroAddress) {
      return NextResponse.json({ error: 'Could not resolve this Basename.' }, { status: 404 });
    }

    // 3. Fetch Score from Third Party API
    const baseUrl = (process.env.SCORE_API_URL || 'https://www.base.org/api/basenames/talentprotocol').replace(/\/$/, '');

    const scoreResponse = await fetch(`${baseUrl}/${address}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    });
    
    // Handle 404 from the score API (Valid wallet, but no score)
    if (scoreResponse.status === 404) {
       return NextResponse.json({
         score: { points: 0, rank_position: null, last_calculated_at: null, slug: 'builder_score' },
         address: address
       });
    }

    if (!scoreResponse.ok) {
      throw new Error('Failed to fetch data from upstream API');
    }

    const scoreData = await scoreResponse.json();

    // Return combined data
    return NextResponse.json({
      ...scoreData,
      address: address
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}