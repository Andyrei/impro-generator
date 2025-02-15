"use client";
import React, { useCallback, useEffect, useState } from "react";
import LevelChecker from "./LevelChecker";
import ActionButton from "./ActionButton";
import { randomIntFromInterval } from "@/lib/general";
import Screen from "./Screen";
import { ICategory } from "@/lib/db/types/category";
import { IWord } from "@/lib/db/types/word";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ClientAction component handles the display and selection of random actions based on user interaction.
 *
 * This component maintains the state for the currently displayed action, the set of previously shown actions,
 * and the difficulty level. It provides functionality to fetch actions from an API and select a random action
 * that hasn't been shown recently.
 *
 * @component
 * @returns [JSX.Element] The rendered component.
 *
 * @example
 ** Usage example:
 * <ClientAction />
 *
 */

export default function ClientAction() {

    const [categories, setCategories] = useState<ICategory[]>();
    const [showDataAction, setShowDataAction] = useState<any>();
    const [lastActions, setLastActions] = useState<any>(new Set());
    const [level, setLevel] = useState("1");


    useEffect(() => {
        // fetch and display category actions
        const categories = fetch(`./api/v1/categories`).then((response) => {
            return response.json();
        }).then((data) => {
            setCategories(data);
        });
    }, []);
    /**
     * Selects a random action from the data array while avoiding recently used actions
     * @param data Array of possible actions to choose from
     * @returns A random ActionType object or undefined if data is empty
     */
    const selectRandomObject = useCallback(
        (data: IWord[], action: string) => {
            // Return early if no data is available
            if (!data?.length) return undefined;
            const currentLastActions = new Set(lastActions);

            // Update the set of recently used actions
            setLastActions(() => {
                // Reset history if all items have been shown
                if (currentLastActions.size >= data.length) return new Set();

                let randomIndex;
                let selectedObject;
                let attempts = 0;

                // Keep trying until we find an action that hasn't been used recently
                do {
                    randomIndex = randomIntFromInterval(0, data.length - 1); // Corrected range
                    selectedObject = data[randomIndex];
                    attempts++;
                    // Prevent infinite loops if we can't find a unique action
                    if (attempts > data.length * 2) {
                        console.error(
                            "Too many attempts to find a unique random object. Check your data."
                        );
                        return currentLastActions;
                    }
                } while (
                    selectedObject._id !== undefined &&
                    currentLastActions.has(selectedObject._id)
                );

                // Add the selected action to recently used set
                if (selectedObject._id !== undefined) {
                    currentLastActions.add(selectedObject._id);
                }
                return currentLastActions;
            });

            // Select a new random action that hasn't been used recently
            let randomIndex;
            let selectedObject;
            do {
                randomIndex = randomIntFromInterval(0, data.length - 1); // Corrected range
                selectedObject = data[randomIndex];
            } while (currentLastActions.has(selectedObject._id));
            return selectedObject;
        },
        []
    );

    /**
     * Fetches and displays a random action based on the selected level and action type
     * @param action - The type of action to fetch (e.g., 'characters', 'location')
     * @throws Will throw an error if the API request fails
     * @returns Promise<void>
     */
    const handleShowChoosenAction = async (action: string) => {
        try {
            // Make API request to fetch actions based on level and action type
            const response = await fetch(
                `./api/v1/words?level=${level}&action=${action}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); // Handle HTTP errors
            }
            // Parse response and select a random action
            const data = await response.json();
            const selected: IWord | undefined = selectRandomObject(
                data.data,
                action
            );
            if (!selected) {
                console.error("No data available for the selected action.");
                return;
            }

            // Fetch category name
            const categoryResponse = await fetch(`./api/v1/categories`);
            const categoriesData = await categoryResponse.json();
            const category = categoriesData.find((cat: any) => cat._id === selected?.category);
            const foundCategoryName = category ? category.name : '';

            // Update state with the selected action
            setShowDataAction(
                selected && {
                    word: selected.word,
                    category: foundCategoryName,
                    difficulty: selected.difficulty,
                }
            );
        } catch (e) {
            console.error(e);
        }
    };

    if (!categories){
       return(<>
        <div className="w-full h-72 relative flex justify-center items-center border border-green-800 rounded-md">
            <div className="screen_noise"></div>
            <div className="screen_overlay"></div>
            <Skeleton className="w-full" />
            <div role="status" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg aria-hidden="true" className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-green-700" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
        </div>
        <div>
            <div className='h-10 relative mb-5'>
                <div className="flex h-full gap-2">
                    {Array.from({ length: 3 }, (_, index) => (
                        <Skeleton className="level" key={index}/>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-4 row-auto gap-4 m-2">
                {
                    Array.from({ length: 4 }, (_, index) => (
                        <Skeleton className="col-span-2 row-span-2 py-20" key={index}/>
                    ))
                }
            </div>
        </div>
        </>)
    }


    return (
        <>
            {/* screen */}
            <div className="w-full bg-green-950 flex items-center justify-center relative">
                <Screen level={level} showDataAction={showDataAction}/>
            </div>

            {/* lower part */}
            <div>
                {/* difficulty levels */}
                <LevelChecker
                    className="mb-4"
                    level={level}
                    setLevel={setLevel}
                />

                {/* buttons */}
                <div className="grid grid-cols-4 row-auto gap-4 m-2">
                    {categories?.map((category) => (
                        <ActionButton
                            key={category._id}
                            action={category._id as string}
                            actionTitle={category.name.it}
                            handleShowChoosenAction={handleShowChoosenAction}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
