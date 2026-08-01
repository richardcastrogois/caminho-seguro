"use client";

import { useState } from "react";
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
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

function getPrivateHref(
  item: (typeof privateItems)[number],
  session: CurrentUser | null,
) {
  if (session?.profileId === item.profile) {
    return item.href;
  }

  return `/login?next=${encodeURIComponent(item.href)}&profile=${item.profile}`;
}

function getLoginHref(pathname: string) {
  const nextPath = pathname === "/login" ? "/" : pathname;
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

type AppNavigationProps = {
  session: CurrentUser | null;
};

function MobileNavLink({
  href,
  icon: Icon,
  label,
  description,
  active,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  active?: boolean;
  onNavigate: () => void;
}) {
  return (
    <SheetClose
      render={<Link href={href} transitionTypes={["nav-soft"]} onClick={onNavigate} />}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        active && "bg-muted text-foreground",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
        <Icon />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{label}</span>
        {description && (
          <span className="mt-0.5 block line-clamp-2 text-xs leading-5 text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </SheetClose>
  );
}

export function AppNavigation({ session }: AppNavigationProps) {
  const pathname = usePathname();
  const [privateMenuValue, setPrivateMenuValue] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenus = () => {
    setPrivateMenuValue(null);
    setMobileMenuOpen(false);
  };

  return (
    <header
      data-app-navigation
      className="fixed top-3 left-1/2 z-100 w-[calc(100%-1rem)] max-w-6xl -translate-x-1/2 rounded-[24px] border border-slate-200/80 bg-white/95 px-3 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:w-[calc(100%-2rem)] md:px-4"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
        <Link
          href="/"
          transitionTypes={["nav-soft"]}
          className="min-w-0 shrink"
          onClick={closeMenus}
        >
          <BrandLogo />
        </Link>

        <nav
          aria-label="Navegacao principal"
          className="hidden min-w-0 items-center gap-2 lg:flex"
        >
          <Link
            href="/"
            transitionTypes={["nav-soft"]}
            onClick={closeMenus}
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
            transitionTypes={["nav-soft"]}
            onClick={closeMenus}
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

          <NavigationMenu
            align="end"
            value={privateMenuValue}
            onValueChange={(value) => setPrivateMenuValue(value)}
          >
            <NavigationMenuList>
              <NavigationMenuItem value="private-access">
                <NavigationMenuTrigger className="h-10 gap-2 rounded-full border border-slate-200 bg-white px-4 text-slate-800 hover:bg-sky-50">
                  <Building2 data-icon="inline-start" />
                  Acessos privados
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-140 grid-cols-2 gap-2 p-2">
                    {privateItems.map((item) => {
                      const Icon = item.icon;
                      const href = getPrivateHref(item, session);
                      const active = isActivePath(pathname, item.href);

                      return (
                        <NavigationMenuLink
                          key={item.href}
                          render={
                            <Link
                              href={href}
                              transitionTypes={["nav-soft"]}
                              onClick={closeMenus}
                            />
                          }
                          data-active={active ? "true" : undefined}
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

        <div className="flex shrink-0 items-center gap-2">
          {session ? (
            <>
              <Link
                href={session.homePath}
                transitionTypes={["nav-soft"]}
                onClick={closeMenus}
                className="hidden max-w-38 truncate rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 xl:inline"
                title={`Perfil ativo: ${session.label}`}
              >
                {session.label}
              </Link>
              <form action="/api/auth/logout" method="post" className="hidden sm:block">
                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="rounded-full px-3"
                >
                  <LogOut data-icon="inline-start" />
                  <span className="hidden xl:inline">Sair</span>
                </Button>
              </form>
            </>
          ) : (
            <Link
              href={getLoginHref(pathname)}
              transitionTypes={["nav-soft"]}
              onClick={closeMenus}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full px-3",
              )}
            >
              <LogIn data-icon="inline-start" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="rounded-full lg:hidden"
                  aria-label="Abrir menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="z-200 w-[min(86vw,22rem)] overflow-y-auto p-0 sm:max-w-sm"
            >
              <SheetHeader className="pr-12">
                <SheetTitle>Caminho Seguro</SheetTitle>
                <SheetDescription>
                  Navegacao da demonstracao e troca de perfis privados.
                </SheetDescription>
              </SheetHeader>

              {session && (
                <div className="mx-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-950">
                  <p className="font-semibold">Perfil ativo</p>
                  <p className="mt-1 text-emerald-800">{session.label}</p>
                </div>
              )}

              <nav aria-label="Menu mobile" className="flex flex-col gap-5 px-4">
                <section className="flex flex-col gap-1">
                  <p className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Publico
                  </p>
                  <MobileNavLink
                    href="/"
                    icon={Home}
                    label="Home"
                    active={pathname === "/"}
                    onNavigate={closeMenus}
                  />
                  <MobileNavLink
                    href="/ajuda/demo"
                    icon={QrCode}
                    label="QR publico"
                    active={pathname.startsWith("/ajuda")}
                    onNavigate={closeMenus}
                  />
                </section>

                <section className="flex flex-col gap-1">
                  <p className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Acessos privados
                  </p>
                  {privateItems.map((item) => (
                    <MobileNavLink
                      key={item.href}
                      href={getPrivateHref(item, session)}
                      icon={item.icon}
                      label={item.label}
                      description={item.description}
                      active={isActivePath(pathname, item.href)}
                      onNavigate={closeMenus}
                    />
                  ))}
                </section>
              </nav>

              <SheetFooter>
                {session ? (
                  <SheetClose
                    render={<button type="submit" form="app-navigation-logout" />}
                    className={cn(
                      buttonVariants({ variant: "destructive", size: "lg" }),
                      "w-full rounded-2xl",
                    )}
                  >
                    <LogOut data-icon="inline-start" />
                    Sair da demonstracao
                  </SheetClose>
                ) : (
                  <SheetClose
                    render={
                      <Link
                        href={getLoginHref(pathname)}
                        transitionTypes={["nav-soft"]}
                        onClick={closeMenus}
                      />
                    }
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "w-full rounded-2xl",
                    )}
                  >
                    <LogIn data-icon="inline-start" />
                    Entrar na demonstracao
                  </SheetClose>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {session && (
            <form id="app-navigation-logout" action="/api/auth/logout" method="post" />
          )}
        </div>
      </div>
    </header>
  );
}
