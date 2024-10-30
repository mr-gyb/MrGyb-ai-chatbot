"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
// import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
// import SideMenu from "./SideMenu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/new-chat":
        return "New Chat";
      case "/chat-history":
        return "Chat History";
      case "/dream-team":
        return "Dream Team";
      case "/gyb-live-network":
        return "GYB Live Network";
      case "/settings":
        return "Settings";
      default:
        return "";
    }
  };

  const handleLogoClick = () => {
    router.push("/new-chat");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white text-navy-blue shadow-md z-50">
        <div className="container mx-auto flex items-center justify-between p-2 sm:p-4">
          <button className="text-navy-blue" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2"
            >
              <Image
                src="/gyb-logo.svg"
                alt="GYB Logo"
                width={32}
                height={32}
                className="h-8 sm:h-10 w-auto"
              />
            </button>
            <h1 className="text-lg sm:text-xl font-bold">{getPageTitle()}</h1>
          </div>
          <div className="w-6"></div>
        </div>
      </header>
      {/* <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userData={userData}
      /> */}
    </>
  );
}
