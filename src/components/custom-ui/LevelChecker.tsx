'use client'
import React, { Dispatch, SetStateAction, useState } from 'react'

export default function LevelChecker({className, level, setLevel}: {className?: string,level: string, setLevel: Dispatch<SetStateAction<string>>}) {

    const handleLevelSet = (e: any, level: string) => {
        // if the level is on 1 add active if 2 remove active from 1 and add active to 2 and so on
        document.querySelectorAll('.level').forEach((el: any) => {
            el.classList.remove('active')
        })
        
        e.classList.add('active')
        console.log(e);

        setLevel(level)
    }

    return (
        <div className={`h-10 relative ${className}`}>

            {/* level checker */}
            <span
                className="diamond absolute"
                style={{ left: `${((parseInt(level) - 1) * (100/3)) + 16.66666}%` }}
            ></span>

            {/* levels */}
            <div className="flex h-full">
                <div onClick={(e)=>handleLevelSet(e.currentTarget, '1')} className="level bg-green-500 active"><p>Facile</p></div>
                <div onClick={(e)=>handleLevelSet(e.currentTarget, '2')} className="level bg-yellow-500"><p>Medio</p></div>
                <div onClick={(e)=>handleLevelSet(e.currentTarget, '3')} className="level bg-red-500"><p>Difficile</p></div>
            </div>
        </div>
    )
}