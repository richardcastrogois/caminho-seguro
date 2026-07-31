import Image from "next/image";

import { Footprints } from "lucide-react";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="relative flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-sky-900/10 sm:size-12">
        <Image
          src="/CaminhoSeguroLogo.png"
          alt="Caminho Seguro"
          width={48}
          height={48}
          className="h-full w-full object-contain p-1"
          priority
        />

        <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-(--safe-500)">
          <Footprints aria-hidden="true" className="h-3 w-3 text-white" />
        </div>
      </div>

      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
            Caminho Seguro
          </p>

          <p className="text-xs font-medium text-slate-500">Rede de proteção infantil</p>
        </div>
      )}
    </div>
  );
}
