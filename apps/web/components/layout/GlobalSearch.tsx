'use client';
import { useUI } from "@/context/UIContext";
import { MobileSearchDrawer } from "./MobileSearchDrawer";

export function GlobalSearch() {
    const { isSearchOpen, closeSearch } = useUI();

    return (
        <MobileSearchDrawer
            isOpen={isSearchOpen}
            onClose={closeSearch}
        />
    );
}
