"use client";

import { Navbar } from "@/components/layout/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  MessageSquare,
  Wallet,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Lock,
  RefreshCw,
  Smartphone,
  Database,
  Headphones,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FeaturesPage() {
  return (
    <motion.div
      className="min-h-screen bg-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)",
        backgroundSize: "20px 20px",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Powerful Features for
                <span className="block text-blue-500">SMS Verification</span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Everything you need to manage virtual numbers, receive messages,
                and streamline your SMS verification workflow.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Core Features
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Essential tools to manage your SMS verification needs
                efficiently
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Virtual Numbers</CardTitle>
                    <CardDescription>
                      Access phone numbers from 50+ countries instantly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Global coverage
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Instant activation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Multiple carriers
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        High success rates
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">
                      Real-time Messages
                    </CardTitle>
                    <CardDescription>
                      Receive SMS messages instantly with our reliable system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Instant delivery
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Message history
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Search & filter
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Export options
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Secure Wallet</CardTitle>
                    <CardDescription>
                      Manage your funds with multiple payment options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Multiple currencies
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Transaction history
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Auto-refill
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Secure payments
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Advanced Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Advanced Features
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful tools to scale your SMS verification operations
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Analytics Dashboard
                    </h3>
                    <p className="text-gray-600">
                      Track usage patterns, success rates, and performance
                      metrics with detailed analytics and reporting.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Auto-Renewal
                    </h3>
                    <p className="text-gray-600">
                      Automatically renew your numbers before expiration to
                      ensure continuous service without interruption.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      API Integration
                    </h3>
                    <p className="text-gray-600">
                      Seamlessly integrate with your applications using our
                      RESTful API and webhook notifications.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Security & Privacy
                    </h3>
                    <p className="text-gray-600">
                      Enterprise-grade security with encrypted data transmission
                      and strict privacy protection.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      High Performance
                    </h3>
                    <p className="text-gray-600">
                      Lightning-fast number activation and message delivery with
                      99.9% uptime guarantee.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      24/7 Support
                    </h3>
                    <p className="text-gray-600">
                      Get help when you need it with our dedicated support team
                      available around the clock.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Get Any Number Online?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See how we compare to other SMS verification services
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">
                            Feature
                          </th>
                          <th className="text-center py-4 px-4 font-semibold text-blue-600">
                            Get Any Number Online
                          </th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-600">
                            Competitors
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            Global Coverage
                          </td>
                          <td className="py-4 px-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            Real-time Messages
                          </td>
                          <td className="py-4 px-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            API Integration
                          </td>
                          <td className="py-4 px-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            Analytics Dashboard
                          </td>
                          <td className="py-4 px-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="h-5 w-5 bg-gray-300 rounded-full mx-auto"></div>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            Auto-Renewal
                          </td>
                          <td className="py-4 px-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="h-5 w-5 bg-gray-300 rounded-full mx-auto"></div>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            24/7 Support
                          </td>
                          <td className="py-4 px-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="h-5 w-5 bg-gray-300 rounded-full mx-auto"></div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ready to experience these features?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Start your free trial today and see how Get Any Number Online
                can transform your verification workflow.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </motion.div>
  );
}
