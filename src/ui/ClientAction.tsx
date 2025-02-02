"use client";
import React, { useCallback, useState } from "react";
import LevelChecker from "./LevelChecker";
import ActionButton from "./ActionButton";
import { randomIntFromInterval } from "@/lib/general";
import Screen from "./Screen";
import { ActionType } from "@/types/general";

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
    const [showDataAction, setShowDataAction] = useState<ActionType>();
    const [lastActions, setLastActions] = useState<any>(new Set());
    const [level, setLevel] = useState("1");

    /**
     * Selects a random action from the data array while avoiding recently used actions
     * @param data Array of possible actions to choose from
     * @returns A random ActionType object or undefined if data is empty
     */
    const selectRandomObject = useCallback(
        (data: ActionType[], action: string) => {
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
                    selectedObject.id !== undefined &&
                    currentLastActions.has(selectedObject.id)
                );

                // Add the selected action to recently used set
                if (selectedObject.id !== undefined) {
                    currentLastActions.add(selectedObject.id);
                }
                return currentLastActions;
            });

            // Select a new random action that hasn't been used recently
            let randomIndex;
            let selectedObject;
            do {
                randomIndex = randomIntFromInterval(0, data.length - 1); // Corrected range
                selectedObject = data[randomIndex];
            } while (currentLastActions.has(selectedObject.id));
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
                `./api/v0/action?level=${level}&action=${action}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); // Handle HTTP errors
            }
            // Parse response and select a random action
            const data = await response.json();
            const selected: ActionType | undefined = selectRandomObject(
                data,
                action
            );
            if (!selected) {
                console.error("No data available for the selected action.");
                return;
            }

            // Update state with the selected action
            setShowDataAction(selected);
        } catch (e) {
            console.error(e);
        }
    };

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
                    <ActionButton
                        action="location"
                        actionTitle="Luogo"
                        handleShowChoosenAction={handleShowChoosenAction}
                    />
                    <ActionButton
                        action="relation"
                        actionTitle="Relazione"
                        handleShowChoosenAction={handleShowChoosenAction}
                    />
                    <ActionButton
                        action="topic"
                        actionTitle="Situazione"
                        handleShowChoosenAction={handleShowChoosenAction}
                    />
                    <ActionButton
                        action="characters"
                        actionTitle="Personaggi"
                        handleShowChoosenAction={handleShowChoosenAction}
                    />
                </div>
            </div>
        </>
    );
}
