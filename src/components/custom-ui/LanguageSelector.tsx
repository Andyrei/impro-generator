"use client"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { DialogTitle } from "../ui/dialog"
import { CheckIcon, ChevronDownIcon, GlobeIcon, XIcon } from "lucide-react"
import { useLocale } from "@/context/LocaleContext"
import { languages } from "@/app/[lang]/getDictionary"


export default function LanguageSelector() {

const { locale, setLocale } = useLocale()
  return (
    <React.Fragment>
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <GlobeIcon className="h-5 w-5" />
              <span>{ locale }</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              className="flex items-center justify-between"
              onClick={() => setLocale(language.code)}
            >
              <span>{language.title}</span>
              {locale === language.code && <CheckIcon className="h-5 w-5" />}
            </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      
      <Drawer>
        <DrawerTrigger className="block md:hidden" asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <GlobeIcon className="h-5 w-5" />
            <span>{ locale }</span>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="grid gap-4 p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium">Select Language</DialogTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <XIcon className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
            <div className="grid gap-2">
                {languages.map((language) => (
                <Button
                  key={language.code}
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() => setLocale(language.code)}
                >
                  <GlobeIcon className="h-5 w-5" />
                  <span>{language.title}</span>
                  {locale === language.code && <CheckIcon className="h-5 w-5 ml-auto" />}
                </Button>
                ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  )
}