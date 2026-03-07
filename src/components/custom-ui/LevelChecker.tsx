'use client'
import React, { Dispatch, SetStateAction } from 'react'
import { Difficulty } from '@/lib/db/types/word'

export default function LevelChecker({className, level, setLevel}: {className?: string, level: Difficulty, setLevel: Dispatch<SetStateAction<Difficulty>>}) {

    const handleLevelSet = (e: any, level: Difficulty) => {
        document.querySelectorAll('.level').forEach((el: any) => {
            el.classList.remove('active')
        })
        e.classList.add('active')
        setLevel(level)
    }

    const indexMap: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

    return (
        <div className={`h-10 relative ${className}`}>

            {/* level checker */}
            <span
                className="diamond absolute"
                style={{ left: `${(indexMap[level] * (100/3)) + 16.66666}%` }}
            ></span>

            {/* levels */}
            <div className="flex h-full">
                <div onClick={(e)=>handleLevelSet(e.currentTarget, 'easy')} className={`level bg-green-500${level === 'easy' ? ' active' : ''}`}><p>Facile</p></div>
                <div onClick={(e)=>handleLevelSet(e.currentTarget, 'medium')} className={`level bg-yellow-500${level === 'medium' ? ' active' : ''}`}><p>Medio</p></div>
                <div onClick={(e)=>handleLevelSet(e.currentTarget, 'hard')} className={`level bg-red-500${level === 'hard' ? ' active' : ''}`}><p>Difficile</p></div>
            </div>
        </div>
    )
}