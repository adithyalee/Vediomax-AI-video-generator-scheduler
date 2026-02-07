import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Upload, Zap, CheckCircle, ArrowRight, Play } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white selection:bg-primary/20">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
      </div>
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1">
              <Video className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Vediomax</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-200">
            <Link href="#features" className="hover:text-white hover:underline underline-offset-4 transition-all">Features</Link>
            <Link href="#pricing" className="hover:text-white hover:underline underline-offset-4 transition-all">Pricing</Link>
            <Link href="#about" className="hover:text-white hover:underline underline-offset-4 transition-all">About</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
              Log in
            </Link>
            <Button>Get Started</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent -z-10" />
          <div className="container px-4 md:px-8 mx-auto flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              New: AI Voice Cloning Available
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl max-w-4xl text-white">
              Create & Schedule Viral Short Videos with <span className="bg-gradient-to-r from-fuchsia-500 to-blue-500 bg-clip-text text-transparent">AI Power</span>
            </h1>

            <p className="max-w-[700px] text-slate-300 text-lg md:text-xl leading-relaxed">
              Vediomax automates your content creation. Generate engaging shorts for TikTok, Instagram Reels, and YouTube Shorts in seconds, then let our scheduler handle the posting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
              <Button size="lg" className="h-12 px-8 text-lg gap-2 bg-white text-slate-900 hover:bg-white/90">
                Start Creating Free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg gap-2 border-white/20 hover:bg-white/10 hover:text-white">
                <Play className="h-4 w-4" /> Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8 text-muted-foreground grayscale opacity-70">
              {/* Simple logos placeholder */}
              <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-current"></div><span className="font-semibold">YouTube</span></div>
              <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-current"></div><span className="font-semibold">TikTok</span></div>
              <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-current"></div><span className="font-semibold">Instagram</span></div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-20">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-white">
                Everything you need to dominate social media
              </h2>
              <p className="text-slate-400 max-w-[600px] mx-auto text-lg">
                Stop spending hours editing. Let AI handle the heavy lifting while you focus on strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group flex flex-col p-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="p-3 w-fit rounded-xl bg-pink-500/20 text-pink-400">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Video Generation</h3>
                <p className="text-slate-400">
                  Turn text prompts into viral videos. Our AI selects stock footage, adds captions, and generates voiceovers automatically.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group flex flex-col p-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="p-3 w-fit rounded-xl bg-blue-500/20 text-blue-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Smart Scheduling</h3>
                <p className="text-slate-400">
                  Plan your content calendar for the entire month. Auto-post to TikTok, YouTube Shorts, and Instagram Reels at peak times.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group flex flex-col p-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="p-3 w-fit rounded-xl bg-green-500/20 text-green-400">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Multi-Platform Upload</h3>
                <p className="text-slate-400">
                  Upload once, publish everywhere. We automatically resize and format your videos for each platform's requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-600 to-blue-600 px-6 py-20 text-center shadow-2xl sm:px-12 md:px-24">
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to grow your audience?
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-white/80">
                  Join 10,000+ creators using Vediomax to scale their content production. Start your free trial today.
                </p>
                <Button size="lg" variant="secondary" className="h-12 px-8 text-lg font-semibold bg-white text-blue-600 hover:bg-white/90">
                  Get Started for Free
                </Button>
                <p className="text-sm text-white/60">No credit card required • Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container px-4 md:px-8 mx-auto py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-1">
                  <Video className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-white">Vediomax</span>
              </div>
              <p className="text-sm text-slate-400 max-w-[250px]">
                The all-in-one AI platform for short-form video content creation and scheduling.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Vediomax Inc. All rights reserved.
            </p>
            <div className="flex gap-4">
              {/* Social icons would go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
