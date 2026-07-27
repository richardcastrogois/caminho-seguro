"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, QrCode, School, Users } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/demo", label: "Demo", icon: LayoutDashboard },
  { href: "/escola", label: "Escola", icon: School },
  { href: "/responsavel", label: "Responsável", icon: Users },
  { href: "/ajuda/demo", label: "QR", icon: QrCode },
];

type AppNavigationProps = {
  badge?: string;
};

export function AppNavigation({ badge = "MVP de demonstração" }: AppNavigationProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo />

          <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
            {badge}
          </span>
        </div>

        <nav aria-label="Navegação principal" className="-mx-1 overflow-x-auto pb-1 lg:mx-0 lg:pb-0">
          <div className="flex min-w-max items-center gap-2 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
