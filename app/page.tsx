"use client";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

import { Phone, MessageSquare, Wallet, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <motion.div
      className="min-h-screen bg-background"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)",
        backgroundSize: "20px 20px",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-16 md:pt-20 pb-20 md:pb-32">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto relative">
              {/* Central Icon */}
              <motion.div
                className="mb-8 md:mb-12 flex justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="w-16 h-16 md:w-24 md:h-24 bg-card rounded-2xl shadow-2xl flex items-center justify-center relative border border-border"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-2 gap-1 md:gap-2">
                    <motion.div
                      className="w-4 h-4 md:w-6 md:h-6 bg-primary rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    ></motion.div>
                    <motion.div
                      className="w-4 h-4 md:w-6 md:h-6 bg-muted-foreground rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    ></motion.div>
                    <motion.div
                      className="w-4 h-4 md:w-6 md:h-6 bg-muted-foreground rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    ></motion.div>
                    <motion.div
                      className="w-4 h-4 md:w-6 md:h-6 bg-primary rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1, duration: 0.5 }}
                    ></motion.div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 leading-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                SMS Verification
                <motion.span
                  className="block text-muted-foreground"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  made simple
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                Efficiently manage your virtual numbers and boost productivity.
              </motion.p>

              <motion.div
                className="flex justify-center mb-8 md:mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    asChild
                  >
                    <Link href="/signup">Get free demo</Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Floating Feature Cards */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none hidden lg:block">
                {/* Top Left - Notes Feature */}
                <motion.div
                  className="absolute top-0 left-0 transform -translate-x-20 -translate-y-10"
                  initial={{ opacity: 0, x: -50, y: -50 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <motion.div
                    className="bg-card p-4 rounded-lg shadow-lg relative max-w-xs border border-border"
                    whileHover={{
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <motion.div
                      className="absolute -top-2 left-4 w-4 h-4 bg-destructive rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>
                    <p className="text-sm text-card-foreground mb-3">
                      Take notes to keep track of crucial details, and
                      accomplish more tasks with ease.
                    </p>
                    <div className="bg-background w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-border">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Top Right - Messages Feature */}
                <motion.div
                  className="absolute top-0 right-0 transform translate-x-20 -translate-y-10"
                  initial={{ opacity: 0, x: 50, y: -50 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.7 }}
                  whileHover={{ scale: 1.05, rotate: -2 }}
                >
                  <motion.div
                    className="bg-card p-4 rounded-lg shadow-lg max-w-xs border border-border"
                    whileHover={{
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-background w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-border">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-card-foreground">
                        Messages
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.2 }}
                      >
                        <span>Today's SMS</span>
                        <span className="text-xs">2 new</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.4 }}
                      >
                        <span>Verification codes</span>
                        <span className="text-xs">5 received</span>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Bottom Left - Numbers Feature */}
                <motion.div
                  className="absolute bottom-0 left-0 transform -translate-x-20 translate-y-10"
                  initial={{ opacity: 0, x: -50, y: 50 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.9 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <motion.div
                    className="bg-card p-4 rounded-lg shadow-lg max-w-xs border border-border"
                    whileHover={{
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <h3 className="text-sm font-medium text-card-foreground mb-3">
                      Available Numbers
                    </h3>
                    <div className="space-y-2">
                      <motion.div
                        className="flex items-center justify-between text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.6 }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-3 h-3 bg-red-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: 1,
                            }}
                          ></motion.div>
                          <span className="text-muted-foreground">
                            US Numbers
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          12 available
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex items-center justify-between text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.8 }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-3 h-3 bg-green-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: 1.5,
                            }}
                          ></motion.div>
                          <span className="text-muted-foreground">
                            UK Numbers
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          8 available
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Bottom Right - Integrations Feature */}
                <motion.div
                  className="absolute bottom-0 right-0 transform translate-x-20 translate-y-10"
                  initial={{ opacity: 0, x: 50, y: 50 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 2.1 }}
                  whileHover={{ scale: 1.05, rotate: -2 }}
                >
                  <motion.div
                    className="bg-card p-4 rounded-lg shadow-lg max-w-xs border border-border"
                    whileHover={{
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <h3 className="text-sm font-medium text-card-foreground mb-3">
                      100+ Integrations
                    </h3>
                    <div className="flex gap-2">
                      <motion.div
                        className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 3.0 }}
                      >
                        G
                      </motion.div>
                      <motion.div
                        className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 3.2 }}
                      >
                        S
                      </motion.div>
                      <motion.div
                        className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 3.4 }}
                      >
                        C
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Mobile Feature Cards */}
              <div className="lg:hidden mt-16 space-y-6">
                <motion.div
                  className="bg-card p-4 rounded-lg shadow-lg border border-border mx-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-background w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-border">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-card-foreground">
                      Smart Notes
                    </span>
                  </div>
                  <p className="text-sm text-card-foreground">
                    Take notes to keep track of crucial details, and accomplish
                    more tasks with ease.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-card p-4 rounded-lg shadow-lg border border-border mx-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.7 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-background w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-border">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-card-foreground">
                      Messages
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Today's SMS</span>
                      <span className="text-xs">2 new</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Verification codes</span>
                      <span className="text-xs">5 received</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-card p-4 rounded-lg shadow-lg border border-border mx-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.9 }}
                >
                  <h3 className="text-sm font-medium text-card-foreground mb-3">
                    Available Numbers
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-muted-foreground">
                          US Numbers
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        12 available
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-muted-foreground">
                          UK Numbers
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        8 available
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-card p-4 rounded-lg shadow-lg border border-border mx-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 2.1 }}
                >
                  <h3 className="text-sm font-medium text-card-foreground mb-3">
                    100+ Integrations
                  </h3>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      G
                    </div>
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      S
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      C
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Features Section */}
        <section className="py-12 md:py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Everything you need
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Simple, powerful tools to manage your SMS verification needs
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Phone className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Virtual Numbers
                </h3>
                <p className="text-muted-foreground">
                  Get instant access to phone numbers from 50+ countries for SMS
                  verification.
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageSquare className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Real-time Messages
                </h3>
                <p className="text-muted-foreground">
                  Receive SMS messages instantly with our reliable messaging
                  system.
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Wallet className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Secure Wallet
                </h3>
                <p className="text-muted-foreground">
                  Manage your funds securely with multiple payment options.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Simple CTA Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Ready to get started?
              </motion.h2>
              <motion.p
                className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 px-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Join thousands of users who trust our SMS verification platform.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    asChild
                  >
                    <Link href="/signup">Get free demo</Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold border-2 border-border text-foreground hover:bg-muted rounded-xl transition-all duration-300"
                    asChild
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground space-y-4 md:space-y-0">
            <p>© 2025 Get Any Number Online. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <Link
                href="/terms-and-privacy"
                className="hover:text-primary transition-colors"
              >
                Terms & Privacy
              </Link>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
