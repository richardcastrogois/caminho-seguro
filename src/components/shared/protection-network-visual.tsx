import { AlertTriangle, Building2, BusFront, HeartHandshake, Home, QrCode, School } from "lucide-react";

const nodes = [
  { label: "Família", icon: Home, className: "left-[6%] top-[42%] border-sky-200 bg-sky-50 text-sky-800" },
  { label: "Escola", icon: School, className: "left-[40%] top-[10%] border-emerald-200 bg-emerald-50 text-emerald-800" },
  { label: "Transporte", icon: BusFront, className: "right-[8%] top-[44%] border-amber-200 bg-amber-50 text-amber-800" },
  { label: "Rede", icon: Building2, className: "left-[34%] bottom-[10%] border-violet-200 bg-violet-50 text-violet-800" },
];

export function ProtectionNetworkVisual() {
  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 sm:p-7">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(226_232_240/.5)_1px,transparent_1px),linear-gradient(0deg,rgb(226_232_240/.5)_1px,transparent_1px)] bg-[size:38px_38px]" />
      <div className="absolute inset-x-8 top-1/2 h-px bg-slate-200" />
      <div className="absolute left-1/2 top-8 h-[calc(100%-4rem)] w-px bg-slate-200" />
      <div className="absolute left-[18%] top-[30%] h-px w-[62%] rotate-[22deg] bg-slate-200" />
      <div className="absolute left-[20%] bottom-[30%] h-px w-[58%] -rotate-[20deg] bg-slate-200" />

      <div className="absolute left-1/2 top-1/2 z-10 w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-slate-900 bg-slate-950 p-4 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">
            <QrCode className="h-6 w-6" />
          </div>
          <span data-gsap="pulse" className="h-3 w-3 rounded-full bg-emerald-300" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Identidade protegida
        </p>
        <h2 className="mt-2 text-xl font-semibold">Maria</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Eventos autorizados, sem rastreamento contínuo.
        </p>
      </div>

      {nodes.map((node) => {
        const Icon = node.icon;
        return (
          <div
            key={node.label}
            data-gsap="card"
            className={`absolute z-10 flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold shadow-sm ${node.className}`}
          >
            <Icon className="h-4 w-4" />
            {node.label}
          </div>
        );
      })}

      <div data-gsap="timeline" className="absolute bottom-5 left-5 right-5 z-10 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Alerta acionável</p>
            <p className="mt-1 text-sm leading-6 text-red-800">
              Quando alguém usa o QR, a rede recebe um evento para responder.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-5 top-5 z-10 rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
        <HeartHandshake className="mr-1 inline h-4 w-4" />
        Comunidade ativa
      </div>
    </div>
  );
}
