import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const score = searchParams.get('score');
  const rankParam = searchParams.get('rank');
  const address = searchParams.get('address');
  const avatarParam = searchParams.get('avatar');

  if (!name || !score) {
    // Basic fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0052fc',
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 'bold' }}>Base Builder Score</div>
        </div>
      ),
      { width: 1200, height: 800 }
    );
  }

  const isUnranked = !rankParam || rankParam === 'null' || rankParam === 'NaN' || isNaN(Number(rankParam));
  const rankText = isUnranked ? 'Unranked' : `Rank #${Number(rankParam).toLocaleString()}`;

  let pfpSrc: string | null = null;
  let pfpUrl = avatarParam;

  if (!pfpUrl) {
     if (address && address !== 'undefined') {
        pfpUrl = `https://effigy.im/a/${address}.png`;
     } else {
        pfpUrl = `https://avatar.vercel.sh/${name}`;
     }
  }

  if (pfpUrl) {
     try {
        const res = await fetch(pfpUrl);
        if (res.ok) {
            const buffer = await res.arrayBuffer();
            // @ts-ignore
            const base64 = Buffer.from(buffer).toString('base64');
            const contentType = res.headers.get('content-type') || 'image/png';
            pfpSrc = `data:${contentType};base64,${base64}`;
        }
     } catch (e) {
        console.warn("PFP fetch error:", e);
     }
  }

  return new ImageResponse(
    (
      // ROOT CONTAINER: Must be flex because it has children (backgrounds + content)
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0052fc', // Fallback color
          background: 'linear-gradient(to bottom right, #0052fc, #003bb5)',
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative', // Required for absolute children
        }}
      >
        {/* Background Circle 1 */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            display: 'flex', // Satori requirement
          }}
        />

        {/* Background Circle 2 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '300px',
            height: '300px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            display: 'flex', // Satori requirement
          }}
        />

        {/* Content Wrapper: Flex Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Title */}
          <div style={{ display: 'flex', fontSize: 32, textTransform: 'uppercase', letterSpacing: '4px', color: '#bfdbfe', marginBottom: 20 }}>
            Base Builder Score
          </div>
          
          {/* Card Container */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            background: 'rgba(255, 255, 255, 0.1)', 
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '40px',
            padding: '40px 80px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            {/* Score Number */}
            <div style={{ display: 'flex', fontSize: 140, fontWeight: 900, lineHeight: 1, color: 'white' }}>
              {score}
            </div>
            
            {/* Rank Badge */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 20, background: 'rgba(0,0,0,0.2)', padding: '10px 30px', borderRadius: '50px' }}>
              <div style={{ display: 'flex', fontSize: 30, color: '#fbbf24', marginRight: 10 }}>🏆</div>
              <div style={{ display: 'flex', fontSize: 28, fontWeight: 'bold', color: 'white' }}>{rankText}</div>
            </div>
          </div>

          {/* Footer / Profile */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 40 }}>
            {pfpSrc && (
              <img 
                src={pfpSrc}
                width="80" 
                height="80" 
                style={{ borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)', marginRight: 20, objectFit: 'cover' }} 
              />
            )}
            <div style={{ display: 'flex', fontSize: 50, fontWeight: 'bold', color: 'white' }}>@{name}</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}
