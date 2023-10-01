"use client";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function NavLayout() {
    const [showSidebar, setShowSidebar] = useState(false);
    return (
        <>
            <Navbar onMenuButtonClick={() => setShowSidebar((prev) => !prev)} />
            <Sidebar open={showSidebar} setOpen={setShowSidebar} />
        </>
    );
}
