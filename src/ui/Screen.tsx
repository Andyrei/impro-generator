import { ActionType } from "@/types/general";

type Props = {
    level: string;
    showDataAction: ActionType | undefined;
}


export default function Screen({showDataAction}: Props) {
  return <div className="w-full h-72 flex justify-center items-center radial-gradient">
        <div className="screen_noise"></div>
        <div className="screen_overlay"></div>
        <div className="">
            <p className="mx-5 text-center">
                {showDataAction
                    ? showDataAction.ita
                    : "Choose what you want and play along"}
            </p>
            
            {showDataAction?.theme && <div className="absolute top-5 text-base left-5">
                <span>Tema: </span>
                <span>{showDataAction?.theme}</span>
            </div>}
            {showDataAction?.difficulty && <div className="absolute bottom-5 text-base left-5">
                <span>Difficoltà: </span>
                <span>{showDataAction?.difficulty}</span>
            </div>}
        </div>
    </div>
}