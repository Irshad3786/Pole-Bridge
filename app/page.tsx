import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
import Link from "next/link";
import * as motion from "framer-motion/client";
import { BarChart3, Share2, Zap, ArrowRight, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-[#060014] text-slate-200 selection:bg-purple-500/30 font-sans overflow-x-hidden">
      <Nav />

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[60%] h-[20%] rounded-[100%] bg-indigo-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center px-4 md:px-6 pt-32 pb-20 md:py-0">
          <div className="text-center max-w-4xl mx-auto relative">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)] backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Poll-Bridge AI 2.0 is Live
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight"
            >
              The Next Gen Polling <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
                Powered by AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Create, share, and analyze compelling polls in seconds. Let artificial intelligence uncover deep insights from your audience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href={"/login"} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300 group">
                Start Polling Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#about" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 backdrop-blur-md transition-all duration-300">
                How it works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-16 flex items-center justify-center gap-6 text-sm text-slate-400"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> No credit card required</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> 14-day free trial</div>
            </motion.div>
          </div>
        </section>


        {/* Features / About Section */}
        <section id="about" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">understand people</span></h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">Our platform combines intuitive design with powerful AI to give you the best polling experience possible.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-[#0a0515]/80 backdrop-blur-xl border border-purple-500/10 p-8 rounded-3xl hover:border-purple-500/30 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] transition-all group"
              >
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all border border-purple-500/20">
                  <Zap className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
                <p className="text-slate-400 leading-relaxed max-w-sm">Create beautiful, fully-functional polls in seconds with our highly intuitive interface powered by AI auto-suggestions.</p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-[#0a0515]/80 backdrop-blur-xl border border-purple-500/10 p-8 rounded-3xl hover:border-fuchsia-500/30 hover:shadow-[0_0_30px_-10px_rgba(217,70,239,0.2)] transition-all group"
              >
                <div className="w-14 h-14 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-fuchsia-500/20 transition-all border border-fuchsia-500/20">
                  <BarChart3 className="w-7 h-7 text-fuchsia-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Analytics</h3>
                <p className="text-slate-400 leading-relaxed max-w-sm">Don't just collect data. Our AI engine processes results in real-time, providing deep insights and sentiment analysis.</p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -10 }}
                className="bg-[#0a0515]/80 backdrop-blur-xl border border-purple-500/10 p-8 rounded-3xl hover:border-indigo-500/30 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)] transition-all group"
              >
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
                  <Share2 className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Share Anywhere</h3>
                <p className="text-slate-400 leading-relaxed max-w-sm">Distribute your polls effortlessly via link, email, social media, or embed them directly into your website or app.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonial / CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#13072e] to-[#0a0518] border border-purple-500/20 rounded-3xl p-10 md:p-16 shadow-[0_0_50px_-15px_rgba(168,85,247,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/10 blur-[80px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full"></div>

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">audience intelligence?</span></h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto relative z-10">Join thousands of creators, researchers, and brands using Poll-Bridge AI.</p>
              <Link href={"/login"} className="inline-flex items-center justify-center gap-2 bg-white text-purple-950 px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 relative z-10">
                Create Your First Poll
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 relative">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center">Get In Touch</h2>
              <p className="text-slate-400 text-center mb-12 text-lg">Have questions? We'd love to hear from you.</p>

              <form className="bg-[#0a0515]/60 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-purple-500/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-purple-600 to-fuchsia-600"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-slate-300 text-sm font-semibold mb-2 ml-1">Name</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500" />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-semibold mb-2 ml-1">Email</label>
                    <input type="email" placeholder="john@example.com" className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500" />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-slate-300 text-sm font-semibold mb-2 ml-1">Message</label>
                  <textarea placeholder="How can we help?" rows={4} className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500 resize-none"></textarea>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] transition-all flex justify-center items-center gap-2"
                >
                  Send Message
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#03000a] text-slate-400 py-12 px-4 md:px-6 border-t border-purple-900/20 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
            <Logo />
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Twitter</a>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Poll-Bridge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
