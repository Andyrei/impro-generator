
import ClientAction from '@/components/custom-ui/ClientAction';
import { LocaleType } from './getDictionary';
import { getCategories } from '@/lib/db/seed/queries/getCategories';


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
