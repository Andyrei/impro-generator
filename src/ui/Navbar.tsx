"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import fs from 'fs';
import path from 'path';
import {
    Home,
    Search,
    Bell,
    User,
    Image,
    Pencil,
    Camera,
    Settings,
} from "lucide-react";
import Link from "next/link";
import FabButton from "./components/FabButton";
import { Slider } from "@/components/ui/slider";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState("location");
    const [titleIT, setTitleIT] = useState("");
    const [titleEN, setTitleEN] = useState("");
    const [difficulty, setDifficulty] = useState(0);

    const fabActions = [
        {
            icon: Image,
            label: "Relay",
            onClick: () => console.log("Relay clicked"),
        },
        {
            icon: Camera,
            label: "Camera",
            onClick: () => console.log("Camera clicked"),
        },
        {
            icon: Pencil,
            label: "Write",
            onClick: () => console.log("Write clicked"),
        },
    ];

    const fabFunc = () => setOpen(true);

    const navigation = [
        { icon: Home, label: "Home", href: "/", position: "left", order: 0 },
        // { icon: Search, label: 'Search', href: '/search', position: 'left', order: 1 },
        // { icon: User, label: 'Profile', href: '/profile', position: 'right', order: 0 },
        {
            icon: Settings,
            label: "Settings",
            href: "/settings",
            position: "right",
            order: 1,
        },
    ];

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        console.log("Form submitted");
        
        console.log("Form submitted");
        console.log("Theme: ", theme);
        console.log("Title IT: ", titleIT);
        console.log("Title EN: ", titleEN);
        console.log("Difficulty: ", difficulty);

        const data = {
          theme,
          titleIT,
          titleEN,
          difficulty,
        };

        // Make API request to fetch actions based on level and action type
        const response = await fetch(
          `./api/action?&action=${theme}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }
        );

        if (response.ok) {
          const json = await response.json();
          console.log(json);
        } else {
          console.error('Failed to fetch data');
        }
    };

    return (
        <>
            <div className="">
                {/* Main navigation bar */}
                <nav className="bg-slate-800 border-t h-16 flex items-center justify-around px-4 relative">
                    <div className="flex w-1/2 justify-around">
                        {navigation
                            .filter((item) => item.position === "left")
                            .sort((a, b) => a.order - b.order)
                            .map((item, index) => (
                                <Link
                                    key={index}
                                    className="p-2 text-white hover:text-green-600 transition-colors"
                                    href={item.href}>
                                    <item.icon size={24} />
                                </Link>
                            ))}
                    </div>

                    <div className="w-16" />

                    <div className="flex w-1/2 justify-around">
                        {navigation
                            .filter((item) => item.position === "right")
                            .sort((a, b) => a.order - b.order)
                            .map((item, index) => (
                                <Link
                                    key={index}
                                    className="p-2 text-white hover:text-blue-500 transition-colors"
                                    href={item.href}>
                                    <item.icon size={24} />
                                </Link>
                            ))}
                    </div>

                    <FabButton fabActions={fabActions} onFabClick={fabFunc} />
                </nav>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Aggiungi nuovo suggerimento</DialogTitle>
                        <DialogDescription>
                            Inserisci un nuovo suggerimento per il gioco
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                              Tema
                          </Label>
                          <Select required value={theme} onValueChange={(val) => setTheme(val)}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Theme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="location">Luogo</SelectItem>
                              <SelectItem value="characters">Personaggi</SelectItem>
                              <SelectItem value="relation">Relazione</SelectItem>
                              <SelectItem value="topic">Situazione</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="titleIT" className="text-right">
                                Titolo [IT]
                            </Label>
                            <Input
                                id="titleIT"
                                required
                                placeholder="Inserisci il titolo"
                                className="col-span-3"
                                onChange={(e) => setTitleIT(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="titleEN" className="text-right">
                              Titolo [EN]
                            </Label>
                            <Input
                                id="titleEN"
                                placeholder="Insert title"
                                onChange={(e) => setTitleEN(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="difficulty" className="text-right">
                              Difficoltà {difficulty}
                            </Label>
                            <Slider 
                              id="difficulty"
                              className="col-span-3"
                              onValueChange={(val)=>setDifficulty(val[0])}
                              value={[difficulty]}
                              defaultValue={[33]}
                              min={1}
                              max={100}
                              step={1} 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleSubmit}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Navbar;
