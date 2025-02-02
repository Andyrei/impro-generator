import { IWord } from "@/lib/db/types/word";
import Category from '../lib/db/models/category';

type Props = {
    level: string;
    showDataAction: any | undefined;
}


export default function Screen({showDataAction}: Props) {

    return <div className="w-full h-72 flex justify-center items-center radial-gradient">
        <div className="screen_noise"></div>
        <div className="screen_overlay"></div>
        <div>
            <p className="mx-5 text-center">
                {showDataAction
                    ? showDataAction.word.it
                    : "Choose what you want and play along"}
            </p>
                
            {showDataAction?.category && <div className="absolute top-5 text-base left-5">
                <span>Categoria: </span>
                <span>{showDataAction?.category.it}</span>
            </div>}
            {showDataAction?.difficulty && <div className="absolute bottom-5 text-base left-5">
                <span>Difficoltà: </span>
                <span>{showDataAction?.difficulty}</span>
            </div>}
        </div>
    </div>
}