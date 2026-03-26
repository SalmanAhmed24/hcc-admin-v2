"use client";
import React from "react";  // Add this import
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import "./style.scss";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/store/store";
import Link from "next/link";
import { useState, useEffect } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TaskIcon from "@mui/icons-material/Task";
import TuneIcon from "@mui/icons-material/Tune";
import { Email, EventBusy, StickyNote2 } from "@mui/icons-material";
import FolderIcon from "@mui/icons-material/Folder";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { LogOutIcon, ChevronDown, Users, BarChart2, Briefcase, Database } from "lucide-react";

const NAV = [
  {
    label: "Dashboard",
    href: "/",
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    label: "Clients",
    icon: <Users size={18} />,
    children: [
      { label: "Contacts", href: "/contacts", icon: <PeopleOutlineIcon fontSize="small" /> },
      { label: "Companies", href: "/clients", icon: <Diversity3Icon fontSize="small" /> },
    ],
  },
  {
    label: "Sales Center",
    icon: <BarChart2 size={18} />,
    children: [
      { label: "Sales", href: "/sales", icon: <MonetizationOnIcon fontSize="small" /> },
      { label: "Product & Services", href: "/PurchaseSales", icon: <EventBusy fontSize="small" /> },
    ],
  },
  {
    label: "Workspace",
    icon: <Briefcase size={18} />,
    children: [
      { label: "Tasks", href: "/tasks", icon: <TaskIcon fontSize="small" /> },
      { label: "Files", href: "/files", icon: <FolderIcon fontSize="small" /> },
      { label: "Mailing", href: "/Mailing", icon: <Email fontSize="small" /> },
      { label: "Notes", href: "/notes", icon: <StickyNote2 fontSize="small" /> },
    ],
  },
  {
    label: "Data Center",
    icon: <Database size={18} />,
    children: [
      { label: "Business Listings", href: "/businesslistings", icon: <StorefrontIcon fontSize="small" /> },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <BarChart2 size={18} />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <TuneIcon fontSize="small" />,
  },
];

function NavLink({ item, pathname }) {
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      className={`nav-link ${active ? "active-link" : "inactive-link"}`}
    >
      <span className="nav-icon">{item.icon}</span>
      {item.label}
    </Link>
  );
}

function NavGroupItem({ group, pathname }) {
  const isAnyChildActive = group.children.some((c) => c.href === pathname);
  const [open, setOpen] = useState(isAnyChildActive);

  useEffect(() => {
    if (isAnyChildActive) setOpen(true);
  }, [pathname, isAnyChildActive]);

  return (
    <div className="nav-group">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`nav-group-trigger ${isAnyChildActive ? "group-active" : "group-inactive"}`}
        aria-expanded={open}
      >
        <span className="nav-icon">{group.icon}</span>
        <span className="group-label">{group.label}</span>
        <span className={`chevron ${open ? "chevron-open" : ""}`}>
          <ChevronDown size={14} />
        </span>
      </button>

      <div className={`nav-children-wrapper ${open ? "children-open" : "children-closed"}`}>
        <div className="nav-children">
          {group.children.map((child) => {
            const active = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`nav-child-link ${active ? "child-active" : "child-inactive"}`}
              >
                <span className="child-dot-line" aria-hidden="true" />
                <span className="nav-icon child-nav-icon">{child.icon}</span>
                {child.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AppSideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const storeUser = useAuthStore((state) => state.logout);

  return (
    <>
      <style>{`
        .cus-style-sidebar {
          background: #2D245B !important;
          border-radius: 0 30px 30px 0;
          width: 260px !important;
          border: 1px solid rgba(225,201,255,0.12);
          box-shadow: 4px 0 24px rgba(0,0,0,0.35);
        }

        .nav-link,
        .nav-group-trigger,
        .nav-child-link {
          display: flex;
          align-items: center;
          gap: 30px;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 1.1rem;
          font-family: 'Satoshi', sans-serif;
          font-weight: 500;
          transition: background 0.18s ease, color 0.18s ease;
          text-decoration: none;
          cursor: pointer;
          width: 100%;
          border: none;
          background: transparent;
          text-align: left;
        }

        .active-link {
          background: rgba(255,255,255,0.14);
          color: #fff;
          font-weight: 700;
        }
        .inactive-link {
          color: #C9ADFF;
        }
        .inactive-link:hover {
          background: rgba(255,255,255,0.07);
          color: #fff;
        }

        .group-active { color: #fff; }
        .group-inactive { color: #C9ADFF; }
        .group-inactive:hover {
          background: rgba(255,255,255,0.07);
          color: #fff;
        }
        .group-active:hover { background: rgba(255,255,255,0.08); }

        .group-label { flex: 1; }

        .chevron {
          margin-left: auto;
          opacity: 0.6;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
          display: flex;
          align-items: center;
        }
        .chevron-open { transform: rotate(180deg); }

        .nav-children-wrapper {
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
        }
        .children-open { max-height: 300px; opacity: 1; }
        .children-closed { max-height: 0; opacity: 0; }

        .nav-children {
          padding: 3px 0 4px 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-child-link {
          padding: 7px 12px 7px 28px;
          font-size: 1rem;
          border-radius: 8px;
          position: relative;
        }
        .child-active {
          background: rgba(255,255,255,0.13);
          color: #fff;
          font-weight: 600;
        }
        .child-inactive { color: #B89FE0; }
        .child-inactive:hover {
          background: rgba(255,255,255,0.07);
          color: #e5d8ff;
        }

        .child-dot-line {
          position: absolute;
          left: 16px;
          width: 1.5px;
          height: 100%;
          top: 0;
          background: rgba(255,255,255,0.15);
          border-radius: 2px;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          opacity: 0.85;
        }
        .child-nav-icon { opacity: 0.7; }

        .nav-divider {
          height: 1px;
          background: rgba(225,201,255,0.1);
          margin: 6px 0;
          border: none;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          border-radius: 10px;
          color: #C9ADFF;
          font-size: 1rem;
          font-family: 'Satoshi', sans-serif;
          font-weight: 500;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.18s ease, color 0.18s ease;
          text-decoration: none;
        }
        .logout-btn:hover {
          background: rgba(255,90,90,0.12);
          color: #ff9999;
        }
      `}</style>

      <Sidebar className="cus-style-sidebar z-30">
        <SidebarHeader className="p-6 flex flex-col items-center border-b border-[rgba(225,201,255,0.12)]">
          <Image src="/logo.png" width={52} height={52} alt="HCC" />
        </SidebarHeader>

        <SidebarContent className="px-4 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV.map((entry, i) => {
            // If entry has children, render NavGroupItem
            if (entry.children) {
              return <NavGroupItem key={entry.label} group={entry} pathname={pathname} />;
            }
            
            // For regular entries, check if it's Settings to add divider
            if (entry.label === "Settings") {
              return (
                <React.Fragment key={entry.href}>
                  <hr className="nav-divider" />
                  <NavLink item={entry} pathname={pathname} />
                </React.Fragment>
              );
            }
            
            // Regular entry without divider
            return <NavLink key={entry.href} item={entry} pathname={pathname} />;
          })}
        </SidebarContent>

        <SidebarFooter className="px-4 pb-6 pt-2 border-t border-[rgba(225,201,255,0.10)]">
          <Link
            href="/login"
            className="logout-btn"
            onClick={() => {
              router.push("/login");
              storeUser();
            }}
          >
            <LogOutIcon size={16} />
            Log Out
          </Link>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

export default AppSideBar;