import { Building2, Users, Award, ShieldCheck, ArrowRight, CheckCircle2, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Testimonials from "@/components/ui/testimonials-demo";
import { motion } from "framer-motion";

const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  // fontWeight: 600, // Let individual elements control weight
  fontStyle: "normal",
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AboutUsPage() {
  return (
    <div style={customFontStyle} className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-24">

        {/* Hero Section */}
        <section className="relative">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <ContainerScroll
            titleComponent={
              <div className="space-y-4 mb-2">
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium rounded-full">
                  Welcome to Shree jee Real Estate
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-tight">
                  Building Dreams with <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Shree Jee Real Estate</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Experience the perfect blend of modern living and nature's tranquility. We are redefining real estate with transparency, integrity, and innovation.
                </p>
              </div>
            }
          >
            <img
              src="https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
              alt="Luxury Home in Dehradun"
              className="mx-auto rounded-[2rem] object-cover h-full w-full object-center shadow-2xl"
              draggable={false}
            />
          </ContainerScroll>
        </section>

        {/* Mission & Vision - Glassmorphism */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <motion.div variants={fadeInUp} className="h-full">
            <Card className="h-full border-none shadow-lg bg-white/40 backdrop-blur-xl hover:bg-white/60 transition-all duration-300 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed text-lg">
                  To be the most trusted and pioneering real estate partner in Northern India, creating sustainable value for our investors while preserving the natural beauty of the Himalayas. We envision a community where every individual has the opportunity to build wealth through smart property investments.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} className="h-full">
            <Card className="h-full border-none shadow-lg bg-white/40 backdrop-blur-xl hover:bg-white/60 transition-all duration-300 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    "Democratize real estate investment for everyone.",
                    "Ensure 100% transparency in all transactions.",
                    "Provide cutting-edge digital tools for our partners.",
                    "Foster a community of financial growth and education."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* Why Choose Us - Staggered Grid */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6">Why Choose Shreejee?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">We don't just sell properties; we build legacies. Here is why thousands trust us with their dreams.</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Building2, title: "Prime Locations", desc: "Handpicked properties in high-growth areas of Dehradun.", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Users, title: "Community Focus", desc: "Join a thriving network of investors and homeowners.", color: "text-indigo-500", bg: "bg-indigo-50" },
              { icon: TrendingUp, title: "High ROI", desc: "Proven track record of delivering exceptional returns.", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Wallet, title: "Flexible Plans", desc: "Investment options tailored to every budget size.", color: "text-purple-500", bg: "bg-purple-50" }
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 h-full group">
                  <div className={`h-14 w-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* MLM Plan - Modern Process Flow */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 py-20 px-6 sm:px-12 text-center md:text-left">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32 mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl -ml-32 -mb-32 mix-blend-screen" />

          <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 mb-6 px-4 py-1.5 backdrop-blur-md border-none text-sm">Wealth Simplified</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                How Our <br /> <span className="text-blue-400">MLM Plan</span> Works
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Our unique business model allows you to earn while you learn. Whether you are looking for a side hustle or a full-time career, our plan is designed for your success.
              </p>
              <Button className="bg-white text-slate-900 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl font-semibold shadow-lg shadow-white/10 group">
                Download Brochure
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="space-y-6">
              {[
                { step: "01", title: "Join & Register", desc: "Sign up as a partner with a minimal entry fee." },
                { step: "02", title: "Refer & Earn", desc: "Get direct commissions for every successful referral." },
                { step: "03", title: "Build Your Team", desc: "Earn passive income from your team's sales volume." },
                { step: "04", title: "Rank Up", desc: "Unlock luxury rewards, trips, and higher tiered bonuses." }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-6 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 h-12 w-12 rounded-full border border-white/20 flex items-center justify-center text-white font-mono font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Commitment - Clean List */}
        <section className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-12">Our Commitment To You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {[
              { title: "Legal Integrity", desc: "All our projects are RERA approved and legally vetted." },
              { title: "On-Time Delivery", desc: "We value your time and ensure projects are delivered as promised." },
              { title: "Customer First", desc: "24/7 dedicated support for all your queries and assistance." },
              { title: "Sustainable Living", desc: "Eco-friendly designs that respect the environment." }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="flex gap-4 p-6 rounded-2xl bg-white shadow-sm border border-slate-100"
              >
                <div className="mt-1">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">{item.title}</h4>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <div className="pt-10">
          <Testimonials />
        </div>

      </div>
    </div>
  );
}