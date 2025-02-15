'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react';

interface FabAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

interface FabButtonProps {
  fabActions?: FabAction[];
  onFabClick?: () => void;
}

export default function FabButton({ 
  fabActions,
  onFabClick
}: FabButtonProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fabRef = useRef<HTMLButtonElement>(null);  

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) &&
          !fabRef?.current?.contains(event.target as Node)
          ) {
          setIsDropdownOpen(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);

      const handleFabClick = () => {
        if (onFabClick) {
          onFabClick();
        } else {
          setIsDropdownOpen(!isDropdownOpen);
        }
      };
  
    return <>

        <div
            ref={dropdownRef}
            className={`absolute bottom-24 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out
          ${isDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
        >
            <div className="flex flex-col-reverse gap-3 items-center">

                {/* Action buttons */}
                {fabActions && fabActions.map((action, index) => (
                    <div key={index} className="flex items-center gap-3 relative">
                        <span className="invisible absolute" aria-label={action.label}>{action.label}</span>
                        <button
                            onClick={() => {
                                action.onClick();
                                setIsDropdownOpen(false);
                            }}
                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-lg transition-transform hover:scale-105"
                        >
                            {React.createElement(action.icon, { size: 24 })}
                        </button>
                    </div>
                ))}
            </div>
        </div>
        <button
            ref={fabRef}
            onClick={handleFabClick}
            className={`absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300
       ${isDropdownOpen ? 'bg-blue-600 rotate-45' : 'bg-blue-500 hover:bg-blue-600'}
     `}
        >
            <Plus size={24} />
        </button>
    </>
}