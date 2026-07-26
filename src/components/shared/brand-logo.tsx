import { Footprints, ShieldCheck } from "lucide-react";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-(--brand-600) text-white shadow-lg shadow-sky-900/15">
        <ShieldCheck aria-hidden="true" className="h-6 w-6" />

        <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-(--safe-500)">
          <Footprints aria-hidden="true" className="h-3 w-3 text-white" />
        </div>
      </div>

      {!compact && (
        <div>
          <p className="text-lg font-semibold tracking-tight text-slate-950">
            Caminho Seguro
          </p>

          <p className="text-xs font-medium text-slate-500">Rede de proteção infantil</p>
        </div>
      )}
    </div>
  );
}
