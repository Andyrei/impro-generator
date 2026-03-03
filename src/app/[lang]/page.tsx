
import ClientAction from '@/components/custom-ui/ClientAction';
import Navbar from '@/components/custom-ui/Navbar';
import { LocaleType } from './getDictionary';
import { ICategory } from '@/lib/db/types/category';


type Props = {
  params: Promise<{
    lang: LocaleType
  }>
}

export default async function Home({params}: Props) {
  const { lang } = await params;
  
  // fetch and display category actions
  const base = process.env.NEXT_PUBLIC_BASE_URL 
             || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const categoriesResponse = await fetch(`${base}/api/v1/categories`);
  const categoriesData: ICategory[] = await categoriesResponse.json();

  return <>
      <main className="p-5">
         <ClientAction categories={categoriesData} />
      </main>
      {/* <Navbar categories={categoriesData} /> */}
  </>;
}
