
import ClientAction from '@/app/[lang]/(index)/ClientAction';
import { LocaleType } from '../getDictionary';
import { getCategories } from '@/lib/db/queries/getCategories';

export const revalidate = 3600;

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'it' }, { lang: 'ro' }];
}

type Props = {
  params: Promise<{
    lang: LocaleType
  }>
}

export default async function Home({params}: Props) {
  const { lang } = await params;
  const categories = await getCategories();

  return <>
         <ClientAction categories={categories} />
  </>;
}
