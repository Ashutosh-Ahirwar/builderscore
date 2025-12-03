import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const score = searchParams.get('score');
  const rank = searchParams.get('rank');

  // Basic validation
  if (!name || !score) {
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
            backgroundColor: '#1e293b', // slate-800
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 'bold', color: '#60a5fa' }}>Base Builder Score</div>
          <div style={{ fontSize: 30, marginTop: 20, color: '#94a3b8' }}>Check your onchain reputation</div>
        </div>
      ),
      { width: 1200, height: 800 }
    );
  }

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
          background: 'linear-gradient(to bottom right, #1e40af, #1e293b)', // blue-800 to slate-800
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Accents */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '300px', height: '300px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{ fontSize: 32, textTransform: 'uppercase', letterSpacing: '4px', color: '#93c5fd', marginBottom: 20 }}>Base Builder Score</div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            background: 'rgba(15, 23, 42, 0.6)', 
            border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: '40px',
            padding: '40px 80px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: 140, fontWeight: 900, lineHeight: 1, background: 'linear-gradient(to bottom right, #ffffff, #bfdbfe)', backgroundClip: 'text', color: 'transparent' }}>
              {score}
            </div>
            {rank && rank !== 'null' && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 20, background: 'rgba(255,255,255,0.15)', padding: '10px 30px', borderRadius: '50px' }}>
                <span style={{ fontSize: 30, color: '#fbbf24', marginRight: 10 }}>🏆</span>
                <span style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>Top {parseInt(rank).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div style={{ fontSize: 40, marginTop: 40, fontWeight: 'bold', color: '#e2e8f0' }}>{name}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}