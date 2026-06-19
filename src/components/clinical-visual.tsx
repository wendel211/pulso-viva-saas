import { Activity, CircleDot, Network, ShieldCheck } from "lucide-react";

export function ClinicalVisual() {
  const nodes = [
    "left-[14%] top-[47%] size-5 delay-0",
    "left-[24%] top-[58%] size-3 delay-150",
    "left-[34%] top-[43%] size-4 delay-300",
    "right-[19%] top-[38%] size-3 delay-500",
    "right-[12%] top-[56%] size-4 delay-700",
    "right-[31%] top-[62%] size-2 delay-1000",
  ];

  return (
    <div className="relative mx-auto mt-10 aspect-square w-full max-w-[500px] overflow-hidden rounded-2xl border border-cyan-300/10 bg-[#071a2d]/68 shadow-2xl shadow-cyan-950/30 ring-1 ring-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(34,214,200,0.17),transparent_35%),linear-gradient(145deg,rgba(255,255,255,0.05),transparent_42%)]" />
      <div className="absolute inset-x-10 top-14 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
      <div className="absolute bottom-14 left-14 right-14 h-px bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />

      <div className="absolute left-1/2 top-1/2 h-[220px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-[1.15rem] border border-cyan-200/35 bg-[#08243a]/82 shadow-[0_0_40px_rgba(34,214,200,0.20)] [animation:float-panel_6s_ease-in-out_infinite]">
        <div className="absolute inset-3 rounded-xl border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-cyan-300/5" />
        <div className="absolute inset-x-8 top-1/2 h-[76px] -translate-y-1/2 overflow-hidden">
          <svg
            aria-hidden="true"
            className="h-full w-full drop-shadow-[0_0_10px_rgba(34,214,200,0.95)] [animation:pulse-line_3.2s_ease-in-out_infinite]"
            viewBox="0 0 360 88"
            fill="none"
          >
            <path
              d="M2 47 H72 L91 47 L111 46 L130 47 L151 47 L169 18 L188 72 L209 35 L226 54 L247 47 H358"
              stroke="#55f7e7"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="absolute -bottom-16 left-1/2 h-16 w-20 -translate-x-1/2 rounded-b-2xl border-x border-b border-cyan-200/25 bg-gradient-to-b from-cyan-200/15 to-transparent" />
        <div className="absolute -bottom-20 left-1/2 h-3 w-36 -translate-x-1/2 rounded-full bg-cyan-200/20 blur-sm" />
      </div>

      <div className="absolute left-[12%] top-[33%] flex size-20 items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_30px_rgba(34,214,200,0.28)]">
        <Network className="size-9" />
      </div>
      <div className="absolute right-[18%] top-[31%] flex size-16 items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_30px_rgba(34,214,200,0.25)]">
        <Activity className="size-8" />
      </div>
      <div className="absolute bottom-[20%] right-[28%] flex size-14 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
        <ShieldCheck className="size-7" />
      </div>

      {nodes.map((node) => (
        <span
          className={`absolute rounded-full bg-[#34eadc] shadow-[0_0_18px_rgba(52,234,220,0.85)] [animation:glow-node_2.8s_ease-in-out_infinite] ${node}`}
          key={node}
        />
      ))}

      <div className="absolute left-[21%] top-[48%] h-px w-[58%] rotate-[-11deg] bg-cyan-200/25" />
      <div className="absolute left-[22%] top-[56%] h-px w-[55%] rotate-[17deg] bg-cyan-200/20" />
      <CircleDot className="absolute bottom-9 left-9 size-5 text-cyan-200/35" />
    </div>
  );
}
