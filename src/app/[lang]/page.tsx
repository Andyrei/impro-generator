
import ClientAction from '@/components/custom-ui/ClientAction';
import Navbar from '@/components/custom-ui/Navbar';
import { LocaleType } from './getDictionary';


type Props = {
  params: {
    lang: LocaleType
  }
}

export default async function Home({params}: Props) {
  
  return (
       <ClientAction />
  );
}
