import { Metadata, ResolvingMetadata } from 'next';
import ScoreUI from '../components/ScoreUI';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

// Use the production URL for all initial metadata to avoid localhost issues
const APP_URL = "https://builderscore.vercel.app";

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const name = typeof searchParams.name === 'string' ? searchParams.name : undefined;
  const score = typeof searchParams.score === 'string' ? searchParams.score : undefined;
  const rank = typeof searchParams.rank === 'string' ? searchParams.rank : undefined;

  // 1. Default State (Landing Page)
  // Use static hero.png for the initial embed view
  let title = "Base Builder Score";
  let description = "Check your onchain reputation on Base";
  let imageUrl = `${APP_URL}/hero.png`;

  // 2. Dynamic State (Shared Link)
  // Only switch to dynamic generation if we have the necessary data
  if (name && score) {
    title = `${name}'s Builder Score: ${score}`;
    description = `Ranked #${rank || 'N/A'}. Check your score now!`;
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

export default function Page({ searchParams }: Props) {
  const initialBasename = typeof searchParams.name === 'string' ? searchParams.name : undefined;
  return <ScoreUI initialBasename={initialBasename} />;
}