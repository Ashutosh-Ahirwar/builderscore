import { Metadata, ResolvingMetadata } from 'next';
import ScoreUI from '../components/ScoreUI';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const name = typeof searchParams.name === 'string' ? searchParams.name : undefined;
  const score = typeof searchParams.score === 'string' ? searchParams.score : undefined;
  const rank = typeof searchParams.rank === 'string' ? searchParams.rank : undefined;

  // Default metadata
  let title = "Base Builder Score";
  let description = "Check your onchain reputation on Base";
  let images = ["/api/og"]; // Default generic image

  // Dynamic metadata if sharing a specific score
  if (name && score) {
    title = `${name}'s Builder Score: ${score}`;
    description = `Ranked #${rank || 'N/A'}. Check your score now!`;
    images = [`/api/og?name=${name}&score=${score}&rank=${rank}`];
  }

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: images,
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: images[0],
        button: {
          title: "Check Your Score",
          action: {
            type: "launch_frame",
            name: "Base Builder Score",
            url: process.env.NEXT_PUBLIC_APP_URL || "https://base-builder-score.vercel.app", // Fallback URL
            splashImageUrl: "https://talentprotocol.com/icon.png", // Optional splash
            splashBackgroundColor: "#1e293b"
          }
        }
      })
    }
  };
}

export default function Page({ searchParams }: Props) {
  const initialBasename = typeof searchParams.name === 'string' ? searchParams.name : undefined;
  return <ScoreUI initialBasename={initialBasename} />;
}