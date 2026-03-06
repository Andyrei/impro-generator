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
import {
  CheckIcon,
  ClockIcon,
  ChevronDownIcon,
  XIcon,
} from "lucide-react"; // or whichever icon set you use

import { useTheme } from "@/context/ThemeContext";

const formats = [
  { value: "mm:ss:ms", label: "mm:ss:ms" },
  { value: "mm:ss",   label: "mm:ss" },
  { value: "ss:ms",   label: "ss:ms" },
];

function StopwatchTimeFormatSelector() {
  const { themeSettings, setThemeSettings } = useTheme();
  const current = themeSettings.stopwatchTimeFormat;

  const selectFormat = (val: string) =>
    setThemeSettings({ ...themeSettings, stopwatchTimeFormat: val });

  return (
    <>
      {/* desktop / md+ – dropdown menu */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              <span>{current}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {formats.map((f) => (
              <DropdownMenuItem
                key={f.value}
                className="flex items-center justify-between"
                onClick={() => selectFormat(f.value)}
              >
                <span>{f.label}</span>
                {current === f.value && <CheckIcon className="h-5 w-5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* mobile – drawer */}
      <Drawer>
        <DrawerTrigger className="block md:hidden" asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            <span>{current}</span>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="grid gap-4 p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium">
                Select stopwatch format
              </DialogTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <XIcon className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
            <div className="grid gap-2">
              {formats.map((f) => (
                <Button
                  key={f.value}
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() => selectFormat(f.value)}
                >
                  <ClockIcon className="h-5 w-5" />
                  <span>{f.label}</span>
                  {current === f.value && (
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

export { StopwatchTimeFormatSelector };