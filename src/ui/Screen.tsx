import { IWord } from "@/lib/db/types/word";
import Category from '../lib/db/models/category';
import { useLocale } from "@/context/LocaleContext";

type Props = {
    level: string;
    showDataAction: any | undefined;
}


export default function Screen({showDataAction}: Props) {
    const { dictionary: intl, locale } = useLocale();


    return <div className="w-full h-72 flex justify-center items-center radial-gradient">
        <div className="screen_noise"></div>
        <div className="screen_overlay"></div>
        <div>
            <p className="mx-5 text-center">
                {showDataAction
                    ? showDataAction.word[locale] || showDataAction.word['en']
                    : intl.home.screen.default_message
                }
            </p>
                
            {showDataAction?.category && <div className="absolute top-5 text-base left-5">
                <span>{intl.home.screen.category}: </span>
                <span>{showDataAction?.category[locale] || showDataAction.category['en']}</span>
            </div>}
            {showDataAction?.difficulty && <div className="absolute bottom-5 text-base left-5">
                <span>{intl.home.screen.difficulty}: </span>
                <span>{showDataAction?.difficulty}</span>
            </div>}
        </div>
    </div>
}