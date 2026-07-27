"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, QrCode, School, Users } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/demo", label: "Demo", icon: LayoutDashboard },
  { href: "/escola", label: "Escola", icon: School },
  { href: "/responsavel", label: "Família", icon: Users },
  { href: "/ajuda/demo", label: "QR", icon: QrCode },
];

const routeBadges = [
  { path: "/demo", label: "Roteiro de demonstração" },
  { path: "/escola", label: "Acesso institucional" },
  { path: "/responsavel", label: "Ambiente do responsável" },
  { path: "/ajuda", label: "Identidade protegida" },
];

export function AppNavigation() {
  const pathname = usePathname();
  const badge =
    routeBadges.find((item) => pathname.startsWith(item.path))?.label ??
    "MVP de demonstração";

  return (
    <header
      data-app-navigation
      className="fixed inset-x-3 top-3 z-[100] mx-auto max-w-6xl rounded-[24px] border border-slate-200/80 bg-white/95 px-3 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:inset-x-6 md:px-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo />

          <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 lg:inline-flex">
            {badge}
          </span>
        </div>

        <nav
          aria-label="Navegação principal"
          className="-mx-1 overflow-x-auto pb-0.5 md:mx-0 md:pb-0"
        >
          <div className="flex min-w-max items-center gap-1.5 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  title={item.label}
                  className={`inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full px-0 text-xs font-semibold sm:w-auto sm:px-3 sm:text-sm transition duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 text-white shadow-lg shadow-emerald-900/15"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
