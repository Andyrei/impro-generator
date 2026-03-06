

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import { DialogTitle } from "@/components/ui/dialog";
import { CheckIcon, SunMoonIcon, ChevronDownIcon, XIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const themes = [
  { value: "light",  label: "Light" },
  { value: "dark",   label: "Dark" },
  { value: "system", label: "System" },
] as const;

function ThemeSelector() {
  const { themeSettings, setThemeSettings } = useTheme();
  const current = themeSettings.theme;

  const selectTheme = (val: "light" | "dark" | "system") =>
    setThemeSettings({ ...themeSettings, theme: val });

  return (
    <>
      {/* desktop / md+ – dropdown menu */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SunMoonIcon className="h-5 w-5" />
              <span>{current}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {themes.map((t) => (
              <DropdownMenuItem
                key={t.value}
                className="flex items-center justify-between"
                onClick={() => selectTheme(t.value)}
              >
                <span>{t.label}</span>
                {current === t.value && <CheckIcon className="h-5 w-5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* mobile – drawer */}
      <Drawer>
        <DrawerTrigger className="block md:hidden" asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <SunMoonIcon className="h-5 w-5" />
            <span>{current}</span>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="grid gap-4 p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium">
                Select theme
              </DialogTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <XIcon className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
            <div className="grid gap-2">
              {themes.map((t) => (
                <Button
                  key={t.value}
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() => selectTheme(t.value)}
                >
                  {
                    t.value === "light" ? (
                      <SunIcon className="h-5 w-5 scale-100" />
                    ) : t.value === "dark" ? (
                      <MoonIcon className="h-5 w-5 scale-100" />
                    ) : (
                      <SunMoonIcon className="h-5 w-5 scale-100" />
                    )
                  }
                  <span>{t.label}</span>
                  {current === t.value && (
                    <CheckIcon className="h-5 w-5 ml-auto" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export { ThemeSelector };