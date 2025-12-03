import { Metadata, ResolvingMetadata } from 'next';
import ScoreUI from '../components/ScoreUI';

// Next 16+ compatible props
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const APP_URL = "https://builderscore.vercel.app";

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await searchParams;

  const name = typeof resolvedParams.name === 'string' ? resolvedParams.name : undefined;
  const score = typeof resolvedParams.score === 'string' ? resolvedParams.score : undefined;
  const rank = typeof resolvedParams.rank === 'string' ? resolvedParams.rank : undefined;
  const address = typeof resolvedParams.address === 'string' ? resolvedParams.address : undefined;
  const avatar = typeof resolvedParams.avatar === 'string' ? resolvedParams.avatar : undefined;

  let title = "Base Builder Score";
  let description = "Check your onchain reputation on Base";
  let imageUrl = `${APP_URL}/hero.png`;

  if (name && score) {
    title = `${name}'s Builder Score: ${score}`;
    description = `Ranked #${rank && rank !== 'NaN' ? rank : 'Unranked'}. Check your score now!`;
    // Pass all params to the generator
    imageUrl = `${APP_URL}/api/og?name=${encodeURIComponent(name)}&score=${score}&rank=${rank}&address=${address || ''}&avatar=${encodeURIComponent(avatar || '')}`;
  }

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
  const resolvedParams = await searchParams;
  const initialBasename = typeof resolvedParams.name === 'string' ? resolvedParams.name : undefined;
  return <ScoreUI initialBasename={initialBasename} />;
}
