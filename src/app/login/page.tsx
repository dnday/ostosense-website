import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Gradient Branding & Showcase */}
      <div 
        className="hidden lg:flex lg:w-[57%] flex-col justify-between p-12 relative overflow-hidden" 
        style={{
          background: "linear-gradient(135deg, #A2AFC2 0%, #495B7D 25%, #304265 50%, #1D2F4A 100%)"
        }}
      >
        {/* Background Decorative Pattern */}
        <div className="absolute right-0 top-1/4 opacity-[0.03] translate-x-1/4">
          <Image src="/Logo.svg" alt="Pattern" width={800} height={800} className="brightness-0 invert" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Image src="/Logo.svg" alt="OstoSense" width={40} height={40} className="brightness-0 invert" />
            <span className="text-2xl font-bold tracking-tight text-white">OstoSense</span>
          </div>
        </div>
        
        {/* Main Content (Text + Showcase Card) */}
        <div className="relative z-10 flex flex-col gap-12 w-full max-w-2xl mt-12">
          
          <div className="flex flex-col gap-6">
            <h2 className="text-[44px] font-bold leading-[1.15] tracking-tight text-white">
              OSTOSENSE
            </h2>
            <p className="text-lg text-white/80 leading-relaxed font-light max-w-xl">
              Sistem peringatan dini cerdas yang menggabungkan sensor Laser-Induced Graphene (LIG) dan analisis degradasi hidrokoloid untuk memantau risiko kebocoran, kesehatan kulit, dan volume kantong secara real-time.
            </p>
          </div>

          {/* Product Showcase Glassmorphism Card */}
          <div className="w-[380px] rounded-3xl bg-white/10 p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-sm border border-white/20">
            <div className="rounded-2xl bg-white/20 border border-white/20 shadow-inner h-[200px] w-full overflow-hidden flex flex-col gap-4 p-4">
               {/* Dashboard Mock UI Lines */}
               <div className="h-4 w-1/3 bg-white/30 rounded-full" />
               <div className="flex gap-4">
                 <div className="h-16 w-1/2 bg-white/20 rounded-xl" />
                 <div className="h-16 w-1/2 bg-white/20 rounded-xl" />
               </div>
               <div className="h-20 w-full bg-white/10 rounded-xl" />
            </div>
          </div>
          
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-white/50">© 2026 OstoSense Dashboard. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-[43%] flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-16">
        
        {/* Logo mobile */}
        <div className="mb-12 flex lg:hidden flex-col items-center gap-4">
          <Image src="/Logo.svg" alt="OstoSense Logo" width={64} height={64} />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">OstoSense</h1>
        </div>

        <div className="flex w-full max-w-[380px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-[30px] font-semibold tracking-tight text-[#0F172B]">Welcome back</h2>
            <p className="text-base text-[#45556C]">Sign in to access your dashboard</p>
          </div>

          <form className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-base text-[#62748E]">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="h-[56px] w-full rounded-[10px] border border-[#E2E8F0] bg-transparent px-4 py-2 text-slate-900 outline-none transition-all focus:border-[#283953] focus:ring-1 focus:ring-[#283953]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-base text-[#62748E]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="h-[56px] w-full rounded-[10px] border border-[#E2E8F0] bg-transparent px-4 py-2 text-slate-900 outline-none transition-all focus:border-[#283953] focus:ring-1 focus:ring-[#283953]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-[#D9D9D9] text-[#283953] focus:ring-[#283953]"
                />
                <label htmlFor="remember" className="cursor-pointer text-sm text-[#45556C]">
                  Remember this device
                </label>
              </div>
              <Link href="#" className="text-sm text-[#1D2F4A] font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="button"
              className="flex h-[56px] w-full items-center justify-center rounded-lg bg-[#283953] text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#1D2F4A]"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-[#62748E]">Or access via</span>
            </div>
          </div>

          <button
            type="button"
            className="flex h-[56px] w-full items-center justify-center gap-3 rounded-lg border border-[#E2E8F0] bg-white text-base font-medium text-[#0F172B] shadow-sm transition-colors hover:bg-slate-50"
          >
            <Lock className="h-5 w-5 text-[#62748E]" />
            Microsoft Healthcare ID
          </button>
        </div>
      </div>
    </div>
  );
}
