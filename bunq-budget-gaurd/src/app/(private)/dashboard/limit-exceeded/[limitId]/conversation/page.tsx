import { ConvAI } from "@/components/ConvAI";

export default function LimitExceededConversationPage() {
  return (
    <div className="min-h-screen relative bg-black overflow-hidden rounded-3xl">
      {/* SVG Filter for noise */}
      <svg className="hidden">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </svg>

      {/* Gradient background with noise */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(76, 29, 149, 1) 0%, rgba(17, 24, 39, 1) 70%, rgba(0, 0, 0, 1) 100%)",
          filter: "contrast(170%) brightness(500%)",
        }}
      >
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            filter: "url(#noise)",
            mixBlendMode: "overlay",
          }}
        />

        {/* Jagged grumpy elements */}
        <div className="absolute top-0 right-0 w-96 h-96 -mt-24 -mr-24 bg-purple-900 rounded-bl-3xl transform rotate-45 opacity-30" />
        <div className="absolute bottom-0 left-0 w-64 h-64 -mb-16 -ml-16 bg-purple-800 rounded-tr-3xl transform -rotate-12 opacity-20" />
      </div>

      <div className="relative z-10 grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-4xl">
          <ConvAI />
        </main>
      </div>
    </div>
  );
}
