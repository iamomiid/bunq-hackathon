import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center px-4 py-20 text-center md:pt-32 md:pb-20"
      >
        {/* full-bleed gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: '#238647',
            backgroundImage: `linear-gradient(
              90deg,
              rgba(35, 134, 71, 1) 0%,
              rgba(47, 155, 71, 1) 8%,
              rgba(98, 182, 79, 1) 18%,
              rgba(137, 204, 83, 1) 27%,
              rgba(61, 184, 173, 1) 36%,
              rgba(51, 148, 215, 1) 45%,
              rgba(40, 114, 188, 1) 54%,
              rgba(29, 92, 132, 1) 63%,
              rgba(153, 50, 51, 1) 72%,
              rgba(225, 48, 48, 1) 82%,
              rgba(242, 136, 37, 1) 91%,
              rgba(245, 200, 54, 1) 100%
            )`,
          }}
        />
        <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
          <span className="text-white">Budget Guard for Bunq</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl mb-8 text-white">
          Smart budgeting with AI-powered limits on your Bunq card. Set natural language budget rules and let our Budget Guard keep your spending in check.
        </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/dashboard">Demo Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Feature Section */}
      <section id="features" className="py-16 md:py-24 bg-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:gap-12">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How Budget Guard Works</h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground">
                Our intelligent system helps you stay on budget with a simple, natural interface.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Natural Language Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Simply tell the app what you want: &ldquo;Limit spending on groceries to €200 per month&rdquo; or &ldquo;Don&apos;t spend more than €50 on takeaways this week.&rdquo;
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AI Transaction Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our AI agent analyzes every transaction on your Budget Card and enforces your defined limits automatically.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Flexible Override</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    When a limit is reached, the card is blocked. Justify your need to the AI, and it may temporarily unblock your card for essential purchases.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:gap-16">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple Budget Management</h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground">
                Take control of your finances with three easy steps.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {/* Circle 1 */}
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#2f9b47] text-white">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Designate Your Budget Card</h3>
                <p className="text-muted-foreground">
                  Choose one of your Bunq cards as your dedicated Budget Card.
                </p>
              </div>

              {/* Circle 2 */}
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#3394d7] text-white">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">Set Your Budget Limits</h3>
                <p className="text-muted-foreground">
                  Create budget limits using natural language. Our AI understands what you mean.
                </p>
              </div>

              {/* Circle 3 */}
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#e13030] text-white">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Live Within Your Budget</h3>
                <p className="text-muted-foreground">
                  Budget Guard automatically monitors and enforces your limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* About Section */}
      <section
        id="about"
        className="py-16 md:py-24"
        style={{ backgroundImage: 'url("/slider.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      >
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                Ready to Take Control?
              </h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground text-white">
                Join the Bunq Budget Guard hackathon project and revolutionize how you manage your finances.
              </p>
            </div>
            <div>
              <Button asChild size="lg">
                <Link href="/dashboard">Start Budgeting Smarter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-6 md:py-8 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                © 2025 Bunq Budget Guard. Hackathon Project.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Privacy
              </Link>
              <Link href="https://www.bunq.com/en-nl/hackathon" className="text-sm text-muted-foreground hover:underline">
                Bunq Hackathon
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
