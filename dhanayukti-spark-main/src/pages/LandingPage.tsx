import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Wallet, Receipt, BarChart3, Shield, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Navbar = () => (
  <motion.nav 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border"
  >
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">Dhanyukti</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        <Link to="/" className="nav-link active">Home</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/investments" className="nav-link">Investments</Link>
        <Link to="/tax" className="nav-link">Tax</Link>
      </div>
      
      <div className="flex items-center gap-3">
        <Link to="/login">
          <Button variant="ghost" size="sm">Login</Button>
        </Link>
        <Link to="/signup">
          <Button variant="hero" size="sm">Sign Up Free</Button>
        </Link>
      </div>
    </div>
  </motion.nav>
);

const FloatingShape = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.8 }}
    className={`absolute rounded-full bg-gradient-to-br from-primary/20 to-success/20 blur-3xl ${className}`}
    style={{ animation: `float ${6 + delay}s ease-in-out infinite` }}
  />
);

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card-hover p-8 group"
  >
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

const StatItem = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="text-center"
  >
    <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{value}</div>
    <div className="text-muted-foreground">{label}</div>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        
        {/* Floating shapes */}
        <FloatingShape className="w-96 h-96 -top-20 -left-20" delay={0} />
        <FloatingShape className="w-72 h-72 top-1/3 right-10" delay={0.3} />
        <FloatingShape className="w-64 h-64 bottom-20 left-1/4" delay={0.6} />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
            >
              <Zap className="w-4 h-4" />
              Your Personal Finance Companion
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold leading-tight mb-6"
            >
              Master Your
              <span className="block gradient-text">Financial Future</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
            >
              Track expenses, manage investments, and optimize taxes—all in one intelligent platform. 
              Make smarter financial decisions with real-time analytics.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="heroOutline" size="xl">
                Explore Features
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>
      
      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-16"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <StatItem value="50K+" label="Active Users" delay={0} />
              <StatItem value="₹2Cr+" label="Tracked Daily" delay={0.1} />
              <StatItem value="99.9%" label="Uptime" delay={0.2} />
              <StatItem value="4.9★" label="User Rating" delay={0.3} />
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="gradient-text"> Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to give you complete control over your financial life.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Receipt}
              title="Smart Expense Tracking"
              description="Automatically categorize and visualize your spending patterns with beautiful analytics."
              delay={0}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Investment Portfolio"
              description="Track SIPs, stocks, crypto, and gold with real-time market data and insights."
              delay={0.1}
            />
            <FeatureCard
              icon={BarChart3}
              title="Tax Calculator"
              description="Instantly calculate your tax liability with live updates as you enter your income."
              delay={0.2}
            />
            <FeatureCard
              icon={Shield}
              title="Bank-Grade Security"
              description="Your financial data is encrypted and protected with enterprise-level security."
              delay={0.3}
            />
            <FeatureCard
              icon={Zap}
              title="Real-Time Analytics"
              description="Get instant insights and alerts to stay on top of your financial health."
              delay={0.4}
            />
            <FeatureCard
              icon={Wallet}
              title="Budget Planning"
              description="Set goals, create budgets, and track your progress towards financial freedom."
              delay={0.5}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative">
        <FloatingShape className="w-96 h-96 -bottom-40 -right-40" delay={0.5} />
        
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-success/5" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Take Control?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Join thousands of users who are already managing their finances smarter with Dhanyukti.
              </p>
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Dhanyukti</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 Dhanyukti. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
