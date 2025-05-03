import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <img src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="font-bold text-xl text-primary">BudgetGuard</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Solid‐block rainbow panel */}
      <div
        className="hidden lg:block"
        style={{
          backgroundImage: `linear-gradient(90deg,
            rgba(35,134,71,1)   0%    8.333%,
            rgba(47,155,71,1)  8.333% 16.667%,
            rgba(98,182,79,1)  16.667% 25%,
            rgba(137,204,83,1) 25%    33.333%,
            rgba(61,184,173,1) 33.333% 41.667%,
            rgba(51,148,215,1) 41.667% 50%,
            rgba(40,114,188,1) 50%    58.333%,
            rgba(29,92,132,1)  58.333% 66.667%,
            rgba(153,50,51,1)  66.667% 75%,
            rgba(225,48,48,1)  75%    83.333%,
            rgba(242,136,37,1) 83.333% 91.667%,
            rgba(245,200,54,1) 91.667% 100%
          )`,
        }}
      />
    </div>
  );
}
