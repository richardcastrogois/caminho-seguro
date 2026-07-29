"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  BusFront,
  HeartHandshake,
  Home,
  LogIn,
  LogOut,
  Menu,
  QrCode,
  School,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { CurrentUser } from "@/lib/session";
import type { DemoProfileId } from "@/lib/demo-auth";
import { cn } from "@/lib/utils";

const privateItems: Array<{
  href: string;
  profile: DemoProfileId;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    href: "/escola",
    profile: "school",
    label: "Escola",
    description: "Chegadas, BLE e criancas esperadas pela instituicao.",
    icon: School,
  },
  {
    href: "/responsavel",
    profile: "guardian",
    label: "Familia",
    description: "Eventos, alertas e historico da crianca vinculada.",
    icon: Users,
  },
  {
    href: "/transporte",
    profile: "transport",
    label: "Transporte",
    description: "Embarque e desembarque por rota, sem rastrear trajeto.",
    icon: BusFront,
  },
  {
    href: "/rede",
    profile: "network",
    label: "Rede",
    description: "Instituicoes, alertas ativos e coordenacao comunitaria.",
    icon: HeartHandshake,
  },
  {
    href: "/admin",
    profile: "admin",
    label: "Admin",
    description: "Cadastros, vinculos e identificadores protegidos.",
    icon: Settings,
  },
];

function getPrivateLoginHref(item: (typeof privateItems)[number]) {
  return `/login?next=${encodeURIComponent(item.href)}&profile=${item.profile}`;
}

type AppNavigationProps = {
  session: CurrentUser | null;
};

export function AppNavigation({ session }: AppNavigationProps) {
  const pathname = usePathname();

  return (
    <header
      data-app-navigation
      className="fixed inset-x-3 top-3 z-100 mx-auto max-w-6xl rounded-[24px] border border-slate-200/80 bg-white/95 px-3 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:inset-x-6 md:px-4"
    >
      <div className="flex items-center justify-between gap-3">
        <BrandLogo />

        <nav
          aria-label="Navegacao principal"
          className="hidden items-center gap-2 md:flex"
        >
          <Link
            href="/"
            className={cn(
              buttonVariants({
                variant: pathname === "/" ? "default" : "outline",
                size: "lg",
              }),
              "rounded-full",
            )}
          >
            <Home data-icon="inline-start" />
            Home
          </Link>

          <Link
            href="/ajuda/demo"
            className={cn(
              buttonVariants({
                variant: pathname.startsWith("/ajuda") ? "default" : "outline",
                size: "lg",
              }),
              "rounded-full",
            )}
          >
            <QrCode data-icon="inline-start" />
            QR publico
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9 gap-2 rounded-full border border-slate-200 bg-white px-4 text-slate-800 hover:bg-sky-50">
                  <Building2 data-icon="inline-start" />
                  Acessos privados
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-140 grid-cols-2 gap-2 p-2">
                    {privateItems.map((item) => {
                      const Icon = item.icon;
                      const href = getPrivateLoginHref(item);

                      return (
                        <NavigationMenuLink
                          key={item.href}
                          render={<Link href={href} />}
                          className="items-start gap-3 p-3"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                            <Icon />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold text-slate-950">
                              {item.label}
                            </span>
                            <span className="mt-1 block text-sm leading-5 text-slate-600">
                              {item.description}
                            </span>
                          </span>
                        </NavigationMenuLink>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <span className="hidden max-w-36 truncate rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 lg:inline">
                {session.label}
              </span>
              <form action="/api/auth/logout" method="post">
                <Button
                  type="submit"
                  variant="outline"
                  size="icon-lg"
                  className="rounded-full"
                  aria-label="Sair"
                  title="Sair"
                >
                  <LogOut />
                </Button>
              </form>
            </>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-lg" }),
                "rounded-full",
              )}
              aria-label="Entrar"
              title="Entrar"
            >
              <LogIn />
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="rounded-full md:hidden"
                  aria-label="Abrir menu"
                />
              }
            >
              <Menu />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Navegacao publica</DropdownMenuLabel>
                <DropdownMenuItem render={<Link href="/" />}>
                  <Home />
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/ajuda/demo" />}>
                  <QrCode />
                  QR publico
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Acessos privados</DropdownMenuLabel>
                {privateItems.map((item) => {
                  const Icon = item.icon;
                  const href = getPrivateLoginHref(item);

                  return (
                    <DropdownMenuItem key={item.href} render={<Link href={href} />}>
                      <Icon />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
