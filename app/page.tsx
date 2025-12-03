import { Metadata, ResolvingMetadata } from 'next';
import ScoreUI from '../components/ScoreUI';

// In Next.js 15+, searchParams is a Promise
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Use the production URL for all initial metadata to avoid localhost issues
const APP_URL = "https://builderscore.vercel.app";

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // FIX: Await the params first!
  const resolvedParams = await searchParams;
  
  const name = typeof resolvedParams.name === 'string' ? resolvedParams.name : undefined;
  const score = typeof resolvedParams.score === 'string' ? resolvedParams.score : undefined;
  const rank = typeof resolvedParams.rank === 'string' ? resolvedParams.rank : undefined;

  // 1. Default State (Landing Page)
  let title = "Base Builder Score";
  let description = "Check your onchain reputation on Base";
  let imageUrl = `${APP_URL}/hero.png`;

  // 2. Dynamic State (Shared Link)
  if (name && score) {
    title = `${name}'s Builder Score: ${score}`;
    description = `Ranked #${rank || 'N/A'}. Check your score now!`;
    // Add timestamp to bust cache if needed, or rely on unique name/score combos
    imageUrl = `${APP_URL}/api/og?name=${encodeURIComponent(name)}&score=${score}&rank=${rank}`;
  }

  // Construct the Frame Metadata
  const frameMetadata = JSON.stringify({
    version: "next",
    imageUrl: imageUrl,
    button: {
      title: "Check Your Score",
      action: {
        type: "launch_frame",
        name: "Base Builder Score",
        url: APP_URL,
        splashImageUrl: `${APP_URL}/splash.png`,
        splashBackgroundColor: "#1e293b"
      }
    }
  });

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [imageUrl],
    },
    other: {
      "fc:frame": frameMetadata
    }
  };
}

export default async function Page({ searchParams }: Props) {
  // FIX: Await params here too
  const resolvedParams = await searchParams;
  const initialBasename = typeof resolvedParams.name === 'string' ? resolvedParams.name : undefined;
  
  return <ScoreUI initialBasename={initialBasename} />;
}
