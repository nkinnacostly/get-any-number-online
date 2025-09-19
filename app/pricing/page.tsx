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
  CheckCircle,
  X,
  Star,
  Zap,
  Shield,
  Globe,
  Users,
  Clock,
  ArrowRight,
  Phone,
  MessageSquare,
  Wallet,
  TrendingUp,
  Headphones,
  Database,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PricingPage() {
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
                Simple, Transparent
                <span className="block text-blue-500">Pricing</span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Choose the plan that fits your needs. No hidden fees, no
                surprises.
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
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
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
                Choose Your Plan
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Start free and scale as you grow
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter Plan */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">Starter</CardTitle>
                    <CardDescription>
                      Perfect for small projects
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        $0
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Pay per use • No monthly fees
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-gray-600 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        100 free SMS credits
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Global coverage
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Basic API access
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Email support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Dashboard access
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full">
                      Get Started Free
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Professional Plan */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full border-2 border-blue-500 shadow-xl relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                  <CardHeader className="text-center pb-4 pt-6">
                    <CardTitle className="text-xl">Professional</CardTitle>
                    <CardDescription>For growing businesses</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        $29
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Includes 1,000 SMS credits
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-gray-600 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        1,000 SMS credits/month
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Priority support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Advanced analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Webhook notifications
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Auto-renewal
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        API rate limits: 100/min
                      </li>
                    </ul>
                    <Button className="w-full bg-blue-500 hover:bg-blue-600">
                      Start Professional
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enterprise Plan */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">Enterprise</CardTitle>
                    <CardDescription>For large organizations</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        Custom
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Tailored to your needs
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-gray-600 mb-8">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Unlimited SMS credits
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        24/7 dedicated support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Custom integrations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        SLA guarantees
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        White-label options
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Priority processing
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Details */}
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
                Pricing Details
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Transparent pricing with no hidden costs
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
                          <th className="text-center py-4 px-4 font-semibold text-gray-600">
                            Starter
                          </th>
                          <th className="text-center py-4 px-4 font-semibold text-blue-600">
                            Professional
                          </th>
                          <th className="text-center py-4 px-4 font-semibold text-purple-600">
                            Enterprise
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            Monthly SMS Credits
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">
                            100 free
                          </td>
                          <td className="py-4 px-4 text-center text-blue-600">
                            1,000 included
                          </td>
                          <td className="py-4 px-4 text-center text-purple-600">
                            Unlimited
                          </td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            Additional SMS Cost
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">
                            $0.05 each
                          </td>
                          <td className="py-4 px-4 text-center text-blue-600">
                            $0.03 each
                          </td>
                          <td className="py-4 px-4 text-center text-purple-600">
                            Custom
                          </td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            API Rate Limit
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">
                            10/min
                          </td>
                          <td className="py-4 px-4 text-center text-blue-600">
                            100/min
                          </td>
                          <td className="py-4 px-4 text-center text-purple-600">
                            Unlimited
                          </td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            Support
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">
                            Email
                          </td>
                          <td className="py-4 px-4 text-center text-blue-600">
                            Priority
                          </td>
                          <td className="py-4 px-4 text-center text-purple-600">
                            24/7 Dedicated
                          </td>
                        </tr>
                        <tr>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            Analytics
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="h-5 w-5 bg-gray-300 rounded-full mx-auto"></div>
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
                            Webhooks
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="h-5 w-5 bg-gray-300 rounded-full mx-auto"></div>
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
                            SLA
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="h-5 w-5 bg-gray-300 rounded-full mx-auto"></div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="h-5 w-5 bg-gray-300 rounded-full mx-auto"></div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
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

        {/* Features Comparison */}
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
                What's Included
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                All plans include these core features
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Global Numbers
                </h3>
                <p className="text-gray-600">
                  Access phone numbers from 50+ countries with high success
                  rates.
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Real-time Messages
                </h3>
                <p className="text-gray-600">
                  Receive SMS messages instantly with our reliable messaging
                  system.
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  API Access
                </h3>
                <p className="text-gray-600">
                  RESTful API with comprehensive documentation and SDKs.
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
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Security
                </h3>
                <p className="text-gray-600">
                  Enterprise-grade security with encrypted data transmission.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
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
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Common questions about our pricing and plans
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Can I change my plan anytime?
                    </h3>
                    <p className="text-gray-600">
                      Yes, you can upgrade or downgrade your plan at any time.
                      Changes take effect immediately, and we'll prorate any
                      billing differences.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      What happens if I exceed my SMS limit?
                    </h3>
                    <p className="text-gray-600">
                      If you exceed your monthly SMS limit, you'll be charged
                      for additional messages at the rate specified in your
                      plan. You can also upgrade your plan to get more included
                      credits.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Do you offer refunds?
                    </h3>
                    <p className="text-gray-600">
                      We offer a 30-day money-back guarantee for all paid plans.
                      If you're not satisfied with our service, contact our
                      support team for a full refund.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Is there a free trial?
                    </h3>
                    <p className="text-gray-600">
                      Yes! Our Starter plan includes 100 free SMS credits to get
                      you started. No credit card required for the free trial.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ready to get started?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Choose your plan and start using SMS Pool today. No setup fees,
                no long-term contracts.
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
