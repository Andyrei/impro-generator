'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react';

interface FabAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

type FabPosition = 
    | 'bottom-center' 
    | 'bottom-right' 
    | 'bottom-left'
    | 'top-center'
    | 'top-right'
    | 'top-left';

interface FabButtonProps {
  className?: string;
  position?: FabPosition;
  fabActions?: FabAction[];
  onFabClick?: () => void;
}

const positionClasses: Record<FabPosition, string> = {
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'bottom-right':  'bottom-6 right-6',
    'bottom-left':   'bottom-6 left-6',
    'top-center':    'top-6 left-1/2 -translate-x-1/2',
    'top-right':     'top-6 right-6',
    'top-left':      'top-6 left-6',
};

const dropdownPositionClasses: Record<FabPosition, string> = {
    'bottom-center': 'bottom-24 left-1/2 -translate-x-1/2',
    'bottom-right':  'bottom-24 right-6',
    'bottom-left':   'bottom-24 left-6',
    'top-center':    'top-24 left-1/2 -translate-x-1/2',
    'top-right':     'top-24 right-6',
    'top-left':      'top-24 left-6',
};

export default function FabButton({ 
  className,
  position = 'bottom-center',
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
            className={`fixed ${dropdownPositionClasses[position]} transition-all duration-300 ease-in-out z-50
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
            className={`fixed ${positionClasses[position]} z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-green-900/60 transition-all duration-300
                ${isDropdownOpen 
                    ? 'bg-green-600 rotate-45 text-black' 
                    : 'bg-green-600 hover:bg-green-400 text-black'
                }
            `}
        >
            <Plus size={24} />
        </button>
    </>
}