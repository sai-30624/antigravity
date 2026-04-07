import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden text-slate-50">
      {/* Dynamic abstract background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '10s', animationDelay: "2s" }} />
      <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[100px] rounded-full mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '12s', animationDelay: "4s" }} />

      {/* Dotted pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 mb-5 transform transition-transform hover:scale-105">
            <span className="text-white font-bold text-2xl tracking-tighter">Lb</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white/90">Libranet</h1>
          <p className="text-zinc-400 text-sm mt-2 font-medium">The Premium Educational Resource Hub</p>
        </div>
        
        {children}
        
      </div>
    </div>
  );
}
