
import ClientAction from '@/components/custom-ui/ClientAction';
import Navbar from '@/components/custom-ui/Navbar';
import { LocaleType } from './getDictionary';
import { ICategory, ICategoryDocument } from '@/lib/db/types/category';
import { connectDB } from '@/lib/db/mongodb';
import Category from '@/lib/db/models/category';
import Word from '@/lib/db/models/word';


type Props = {
  params: Promise<{
    lang: LocaleType
  }>
}

export default async function Home({params}: Props) {
  const { lang } = await params;
  const toPlainObject = (val: any) => val instanceof Map ? Object.fromEntries(val) : val;

  await connectDB();
  const categories = await Category.find();
  const categoriesWithWordCount: ICategory[] = await Promise.all(
    categories.map(async (category: ICategoryDocument) => {
      const wordCount = await Word.countDocuments({ category: category._id });
      const obj = category.toObject();

      return {
        _id: obj._id.toString(),
        name: toPlainObject(obj.name),
        description: toPlainObject(obj.description),
        wordCount,
      } satisfies ICategory;
    })
  );


  return <>
      <main className="p-5">
         <ClientAction categories={categoriesWithWordCount} />
      </main>
      {/* <Navbar categories={categoriesData} /> */}
  </>;
}
