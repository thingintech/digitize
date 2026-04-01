import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  CheckCircle2,
  Menu,
  MapPin,
  MessageCircle,
  Smartphone,
  ShieldCheck,
  Zap,
  TrendingUp,
  XCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  PlayCircle,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui';
import logoImg from '../../assets/621512a35355742a817b6afc8fd95aa05e5b4349.png';

export function Landing() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-purple-200">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logoImg} alt="Thing in Tech Logo" className="w-10 h-10 rounded-full shadow-sm bg-white" />
              <span className="font-bold text-xl tracking-tight text-slate-900">Thing in Tech</span>
            </div>

            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <a href="#problem" className="text-slate-600 hover:text-slate-900 transition-colors">Why Us</a>
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Log in
              </NavLink>
              <NavLink to="/register">
                <Button variant="primary" className="bg-slate-900 text-white hover:bg-slate-800 border-0 shadow-lg">
                  Start Free Setup
                </Button>
              </NavLink>
            </div>

            <div className="md:hidden flex items-center">
              <Button variant="ghost" size="sm" className="p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="h-6 w-6 text-slate-600" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 w-1/2 h-[800px] bg-gradient-to-bl from-purple-100/50 to-transparent pointer-events-none rounded-bl-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-800 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 text-blue-600" /> Takes 3 Minutes. No Code Required.
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                Stop Losing Customers to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Outdated Menus.</span>
                <br className="hidden lg:block" /> Digitize Your Restaurant.
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Get a professional QR menu, perfectly set up Google Maps, and direct WhatsApp ordering without hiring a developer. Built for busy owners who want more orders and less hassle.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <NavLink to="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 border-0 shadow-xl group text-base px-8 h-14">
                    Start Your Free Setup
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </NavLink>
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-14">
                  <PlayCircle className="mr-2 w-5 h-5 text-slate-500" />
                  See a Live Example
                </Button>
              </div>
              <p className="mt-4 text-sm text-slate-500 flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required to start
              </p>
            </div>

            {/* Split Screen Mockup Container */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl flex border border-slate-200 bg-white">
                {/* Left: Before */}
                <div className="w-1/2 h-full relative border-r border-slate-200 bg-slate-100 flex flex-col group">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">Before</div>
                  <img src="https://images.unsplash.com/photo-1668683910397-5c5c561be0bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcnVzdHJhdGVkJTIwY3VzdG9tZXIlMjBsb29raW5nJTIwYXQlMjBtZW51fGVufDF8fHx8MTc3NTAzNTU4NXww&ixlib=rb-4.1.0&q=80&w=1080" alt="Frustrated with paper menu" className="w-full h-full object-cover opacity-80 mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white text-sm font-medium drop-shadow-md">Torn menus, missed items, frustrated customers.</p>
                  </div>
                </div>
                {/* Right: After */}
                <div className="w-1/2 h-full relative bg-slate-900 flex flex-col items-center justify-center group overflow-hidden">
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">After</div>
                  <div className="w-[85%] h-[80%] bg-white rounded-t-[2rem] rounded-b-lg p-2 shadow-2xl translate-y-8 group-hover:translate-y-6 transition-transform duration-500 border-4 border-slate-800 relative">
                    {/* Mockup UI Inside */}
                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-slate-50 flex flex-col relative border border-slate-100">
                      <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center p-4">
                        <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center -mb-12 border-4 border-slate-50">🍔</div>
                      </div>
                      <div className="pt-8 px-4 text-center">
                        <h4 className="font-bold text-slate-900 text-sm">Joe's Burger Joint</h4>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                            <div className="w-16 h-12 bg-slate-200 rounded object-cover flex-shrink-0"></div>
                            <div className="ml-2 flex-1 text-left"><div className="h-3 bg-slate-200 rounded w-3/4 mb-1"></div><div className="h-2 bg-slate-100 rounded w-1/2"></div></div>
                            <div className="font-bold text-emerald-600 text-xs">$12</div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-emerald-500 text-white text-[10px] font-bold py-2 rounded-full text-center flex justify-center items-center shadow-lg">
                          <MessageCircle className="w-3 h-3 mr-1" /> Order on WhatsApp
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-20 pt-10 border-t border-slate-200">
            <p className="text-center text-sm font-medium text-slate-500 mb-6 uppercase tracking-wider">Trusted by local businesses, powered by secure tech</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
              <div className="flex items-center gap-2 font-bold text-slate-700"><ShieldCheck className="w-6 h-6 text-blue-600" /> Secure Payments</div>
              <div className="flex items-center gap-2 font-bold text-slate-700"><MessageCircle className="w-6 h-6 text-emerald-500" /> Verified WhatsApp</div>
              <div className="flex items-center gap-2 font-bold text-slate-700"><TrendingUp className="w-6 h-6 text-purple-600" /> 99.9% Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Agitation / Solution */}
      <section id="problem" className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-16">Running a restaurant is hard enough.</h2>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-red-50/50 p-8 rounded-2xl border border-red-100 relative"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-red-600 font-bold text-sm border border-red-100 shadow-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" /> The Problem
              </div>
              <p className="text-lg text-slate-700 font-medium">Managing paper menus, missed phone orders, and invisible online profiles drains your time and revenue.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-orange-50/50 p-8 rounded-2xl border border-orange-100 relative"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-orange-600 font-bold text-sm border border-orange-100 shadow-sm flex items-center gap-2">
                <Clock className="w-4 h-4" /> The Cost
              </div>
              <p className="text-lg text-slate-700 font-medium">Every customer who cannot find you on Google Maps or gives up on a confusing PDF menu is money walking out the door.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-emerald-50 p-10 rounded-3xl border border-emerald-200 shadow-lg relative transform scale-105"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-1.5 rounded-full font-bold text-sm shadow-md flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> The Solution
              </div>
              <p className="text-2xl text-slate-900 font-bold leading-relaxed">
                Thing in Tech does the heavy lifting. We give you the digital presence of a massive franchise, managed from one simple dashboard.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Before vs After Table */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">The Thing in Tech Difference</h2>
          </div>

          <div className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="grid grid-cols-2 text-center border-b border-slate-700 bg-slate-900/50">
              <div className="p-6 text-xl font-bold text-slate-400">Before</div>
              <div className="p-6 text-xl font-bold text-emerald-400 bg-slate-800/50">After Thing in Tech</div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {[
                ["Expensive menu reprints when prices change", "Instant updates with zero printing costs"],
                ["Lost orders via busy phone lines", "Seamless WhatsApp ordering directly to you"],
                ["Invisible on local searches", "Optimized Google Business profile bringing traffic"],
                ["Guessing what customers actually like", "Analytics showing popular items & scans"]
              ].map(([before, after], i) => (
                <div key={i} className="grid grid-cols-2">
                  <div className="p-6 text-slate-400 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400/70 flex-shrink-0 mt-0.5" /> <span>{before}</span>
                  </div>
                  <div className="p-6 text-slate-100 flex items-start gap-3 bg-slate-800/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> <span className="font-medium">{after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features (Benefit-driven) */}
      <section id="features" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to grow, simplified.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Save Printing Costs', desc: 'Beautiful, mobile-first menus that update instantly. Never pay a printer for menu changes again.', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
              { title: 'Zero-Commission Delivery', desc: 'Let customers order directly to your WhatsApp. Keep 100% of your revenue. No app downloads required.', icon: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
              { title: 'Get Found Locally', desc: 'We streamline your Google Maps setup so hungry customers searching nearby find you first.', icon: MapPin, color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' },
            ].map((feature, i) => (
              <div key={i} className={`p-8 rounded-3xl bg-white border ${feature.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg}`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Your new digital menu is 3 steps away.</h2>
            <p className="mt-4 text-xl text-slate-600">No developer needed. Built for you.</p>
          </div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-100"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {[
                { step: '1', title: 'Sign up', desc: 'Tell us your business name. No credit card required.', icon: '👋' },
                { step: '2', title: 'Upload Menu', desc: 'Snap a photo of your paper menu or type it in. We format it beautifully.', icon: '📸' },
                { step: '3', title: 'Place QR on tables', desc: 'Download your ready-to-print QR codes. Start taking orders.', icon: '📱' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-24 h-24 mx-auto bg-slate-900 text-white rounded-full flex items-center justify-center text-4xl font-black mb-6 shadow-xl border-8 border-white">
                    {step.step}
                  </div>
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 text-lg">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex text-yellow-400 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-xl text-slate-700 italic mb-8">"I used to spend hundreds on printing menus every time prices changed. Now, I update my QR menu from my phone in 10 seconds. Customers love it."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">MR</div>
                <div>
                  <h4 className="font-bold text-slate-900">Maria Rodriguez</h4>
                  <p className="text-slate-500 text-sm">Owner, The Daily Grind Café</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex text-yellow-400 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-xl text-slate-700 italic mb-8">"Our Google Maps setup brought in 30% more foot traffic in the first month. The platform paid for itself on day one. Zero technical headache."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">DT</div>
                <div>
                  <h4 className="font-bold text-slate-900">David Thompson</h4>
                  <p className="text-slate-500 text-sm">Manager, Bella Italia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Simple pricing, no surprises.</h2>
            <p className="mt-4 text-xl text-slate-600">Start for free. Upgrade as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900">Starter</h3>
              <p className="mt-2 text-slate-500 text-sm h-10">Perfect for tiny cafes getting started.</p>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                $0 <span className="ml-2 text-lg font-medium text-slate-500">forever</span>
              </div>
              <ul className="mt-8 space-y-4 flex-1">
                {['Digital QR Menu (up to 50 items)', 'Basic beautifully designed template', 'Unlimited Scans', 'Thing in Tech Watermark'].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full mt-8 border-slate-300 text-slate-700 hover:bg-slate-50" size="lg" onClick={() => navigate('/register')}>Get Started Free</Button>
            </div>

            {/* Pro */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col relative transform md:-translate-y-4">
              <div className="absolute -top-4 right-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">MOST POPULAR</div>
              <h3 className="text-2xl font-bold text-white">Pro</h3>
              <p className="mt-2 text-slate-400 text-sm h-10">Everything you need for a growing restaurant.</p>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                $19 <span className="ml-2 text-lg font-medium text-slate-400">/mo</span>
              </div>
              <ul className="mt-8 space-y-4 flex-1">
                {['Unlimited menu items & categories', 'WhatsApp ordering integration', 'Google Maps basic setup', 'Removal of watermark'].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Button variant="primary" className="w-full mt-8 bg-white text-slate-900 hover:bg-slate-100 border-0" size="lg" onClick={() => navigate('/register')}>Start Free Trial</Button>
            </div>

            {/* Business */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900">Business</h3>
              <p className="mt-2 text-slate-500 text-sm h-10">Advanced tools for multi-location brands.</p>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                $49 <span className="ml-2 text-lg font-medium text-slate-500">/mo</span>
              </div>
              <ul className="mt-8 space-y-4 flex-1">
                {['Everything in Pro', 'Advanced scan analytics', 'Multi-location support', 'Automated review generation', 'Priority 24/7 Support'].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full mt-8 border-slate-300 text-slate-700 hover:bg-slate-50" size="lg" onClick={() => navigate('/register')}>Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-purple-900 text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to stop losing orders?</h2>
          <p className="text-xl text-purple-200 mb-10">Join thousands of restaurants digitizing their business today. Setup takes 3 minutes.</p>
          <Button variant="primary" size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-10 py-6 h-auto rounded-full shadow-2xl" onClick={() => navigate('/register')}>
            Start Your Free Setup Now
          </Button>
          <p className="mt-6 text-sm text-purple-300">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 text-white mb-4">
              <img src={logoImg} alt="Thing in Tech Logo" className="w-8 h-8 rounded-full bg-white" />
              <span className="font-bold text-lg tracking-tight">Thing in Tech</span>
            </div>
            <p>Empowering local businesses with digital tools.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Smart QR Menu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">WhatsApp Ordering</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 Thing in Tech. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
