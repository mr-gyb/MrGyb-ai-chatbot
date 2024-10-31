"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, User, Settings, LogOut, Video } from "lucide-react";
import { useOnClickOutside } from "@/hooks/useOnclickOutside";
import { useGetUserDetails } from "@/hooks/useGetUserDetails";
import { cn } from "@/lib/utils";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: {
    name?: string;
    email?: string;
  };
}

export function SideMenu({ isOpen, onClose, userData }: SideMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useGetUserDetails();
  const router = useRouter();

  useOnClickOutside(menuRef, () => {
    if (isOpen) onClose();
  });

  const handleLogout = async () => {
    // await logout();
    // router.push("/");
    // onClose();
  };

  const menuItems = [
    { href: "/profile", icon: User, label: "My Profile" },
    { href: "/ai-video-avatar", icon: Video, label: "AI Video Avatar" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white text-navy-blue transform transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Menu</h2>
          <button onClick={onClose} className="text-navy-blue">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav>
          <ul className="space-y-2">
            {menuItems.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center py-2 hover:text-gold"
                  onClick={onClose}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="p-4">
        <button
          className="flex items-center text-red-500 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout {userData?.email ? `(${userData.email})` : ""}
        </button>
      </div>
    </div>
  );
}
