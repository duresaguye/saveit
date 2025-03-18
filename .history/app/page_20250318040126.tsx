import dynamic from 'next/dynamic';

const DynamicHome = dynamic(() => import('./home'), {
  ssr: false,
  loading: () => <p>Loading...</p>, // Optional: Add a loading indicator
});

export default function Home() {
  return <DynamicHome />;
}