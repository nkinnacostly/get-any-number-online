"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { FileText, Shield, RefreshCcw, ChevronRight } from "lucide-react";

export default function TermsAndPrivacyPage() {
  const [activeTab, setActiveTab] = useState("terms");

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
        <section className="relative pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Legal
                <span className="block text-primary">Information</span>
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Our terms, privacy policy, and refund policy explained in detail
              </motion.p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger
                    value="terms"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Terms & Conditions</span>
                    <span className="sm:hidden">Terms</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="privacy"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Privacy Policy</span>
                    <span className="sm:hidden">Privacy</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="refund"
                    className="flex items-center gap-2"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">Refund Policy</span>
                    <span className="sm:hidden">Refund</span>
                  </TabsTrigger>
                </TabsList>

                {/* Terms and Conditions */}
                <TabsContent value="terms">
                  <Card className="border border-border shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        Terms and Conditions
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        Last Updated: October 20, 2025
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-8 text-foreground">
                      {/* Section 1 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          1. Acceptance of Terms
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          By accessing and using Get Any Number Online ("the
                          Service"), you accept and agree to be bound by the
                          terms and provision of this agreement. If you do not
                          agree to these Terms and Conditions, please do not use
                          our Service. We reserve the right to modify these
                          terms at any time, and such modifications shall be
                          effective immediately upon posting.
                        </p>
                      </div>

                      {/* Section 2 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          2. Service Description
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          Get Any Number Online provides virtual phone numbers
                          for SMS verification purposes. Our service allows
                          users to receive SMS messages from various services
                          and platforms. We offer numbers from 50+ countries
                          worldwide for legitimate verification needs.
                        </p>
                        <div className="pl-7 space-y-2">
                          <p className="text-muted-foreground font-medium">
                            Our services include:
                          </p>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>Virtual phone number rental</li>
                            <li>SMS message reception and storage</li>
                            <li>Real-time message notifications</li>
                            <li>Multi-country number availability</li>
                            <li>Secure wallet and payment processing</li>
                          </ul>
                        </div>
                      </div>

                      {/* Section 3 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          3. User Obligations
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          As a user of our Service, you agree to:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>
                            Provide accurate and complete registration
                            information
                          </li>
                          <li>
                            Maintain the security of your account credentials
                          </li>
                          <li>Use the Service only for lawful purposes</li>
                          <li>
                            Not use the Service to receive messages for illegal
                            activities
                          </li>
                          <li>
                            Not attempt to circumvent any security features
                          </li>
                          <li>
                            Not resell or redistribute our services without
                            permission
                          </li>
                          <li>
                            Comply with all applicable local, state, national,
                            and international laws
                          </li>
                        </ul>
                      </div>

                      {/* Section 4 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          4. Prohibited Uses
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          You may not use our Service for:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>Fraudulent activities or identity theft</li>
                          <li>Spamming or sending unsolicited messages</li>
                          <li>Harassment or threatening behavior</li>
                          <li>Violations of intellectual property rights</li>
                          <li>
                            Creating multiple accounts to abuse promotional
                            offers
                          </li>
                          <li>
                            Automated or systematic access to our systems
                            (scraping, bots)
                          </li>
                          <li>
                            Any activity that violates applicable laws or
                            regulations
                          </li>
                        </ul>
                      </div>

                      {/* Section 5 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          5. Account Management
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          You are responsible for maintaining the
                          confidentiality of your account information, including
                          your password. You agree to notify us immediately of
                          any unauthorized use of your account. We reserve the
                          right to suspend or terminate accounts that violate
                          these terms or engage in suspicious activity.
                        </p>
                      </div>

                      {/* Section 6 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          6. Payment and Fees
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          All fees are clearly displayed before purchase. Prices
                          are subject to change without notice. Payments are
                          processed securely through our payment partners
                          (Paystack and Cryptomus). You agree to pay all fees
                          and charges incurred under your account. All sales are
                          final unless otherwise specified in our Refund Policy.
                        </p>
                      </div>

                      {/* Section 7 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          7. Service Availability
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          While we strive to provide uninterrupted service, we
                          do not guarantee that the Service will be available at
                          all times. We may experience downtime due to
                          maintenance, updates, or technical issues. We are not
                          liable for any damages resulting from service
                          interruptions.
                        </p>
                      </div>

                      {/* Section 8 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          8. Limitation of Liability
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          Get Any Number Online shall not be liable for any
                          indirect, incidental, special, consequential, or
                          punitive damages resulting from your use of or
                          inability to use the Service. Our total liability
                          shall not exceed the amount paid by you for the
                          Service in the past 30 days.
                        </p>
                      </div>

                      {/* Section 9 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          9. Intellectual Property
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          All content on the Service, including text, graphics,
                          logos, and software, is the property of Get Any Number
                          Online or its licensors and is protected by copyright,
                          trademark, and other intellectual property laws. You
                          may not reproduce, distribute, or create derivative
                          works without our express written permission.
                        </p>
                      </div>

                      {/* Section 10 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          10. Termination
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          We reserve the right to terminate or suspend your
                          account immediately, without prior notice or
                          liability, for any reason, including breach of these
                          Terms. Upon termination, your right to use the Service
                          will immediately cease. All provisions that should
                          survive termination shall survive, including ownership
                          provisions, warranty disclaimers, and limitations of
                          liability.
                        </p>
                      </div>

                      {/* Section 11 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          11. Governing Law
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          These Terms shall be governed by and construed in
                          accordance with the laws of Nigeria, without regard to
                          its conflict of law provisions. Any disputes arising
                          from these Terms or your use of the Service shall be
                          resolved in the courts of Cross River State, Nigeria.
                        </p>
                      </div>

                      {/* Section 12 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          12. Contact Information
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          If you have any questions about these Terms, please
                          contact us at:
                        </p>
                        <div className="pl-7 space-y-1 text-muted-foreground">
                          <p>Email: ayangcostly@gmail.com</p>
                          <p>Phone: +234 8071177214</p>
                          <p>
                            Address: Behind Redeemed Christian Church of God,
                            Ekorinum Calabar, Cross River State, Nigeria
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Privacy Policy */}
                <TabsContent value="privacy">
                  <Card className="border border-border shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        Privacy Policy
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        Last Updated: October 20, 2025
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-8 text-foreground">
                      {/* Introduction */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          Introduction
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          At Get Any Number Online, we take your privacy
                          seriously. This Privacy Policy explains how we
                          collect, use, disclose, and safeguard your information
                          when you use our Service. Please read this policy
                          carefully to understand our practices regarding your
                          personal data.
                        </p>
                      </div>

                      {/* Section 1 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          1. Information We Collect
                        </h3>
                        <div className="pl-7 space-y-4">
                          <div>
                            <p className="text-muted-foreground font-medium mb-2">
                              Personal Information:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>Name and email address</li>
                              <li>Phone number (optional)</li>
                              <li>Account credentials (encrypted passwords)</li>
                              <li>
                                Payment information (processed securely through
                                third-party payment processors)
                              </li>
                              <li>Profile information you choose to provide</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium mb-2">
                              Usage Information:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>Virtual numbers purchased and their usage</li>
                              <li>
                                SMS messages received (content, date, time)
                              </li>
                              <li>Transaction history and wallet balance</li>
                              <li>
                                Device information (IP address, browser type,
                                device type)
                              </li>
                              <li>
                                Log data (access times, pages viewed, errors)
                              </li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium mb-2">
                              Cookies and Tracking:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>Session cookies for authentication</li>
                              <li>Analytics cookies to improve our Service</li>
                              <li>
                                Preference cookies to remember your settings
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Section 2 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          2. How We Use Your Information
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          We use the collected information for the following
                          purposes:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>To provide and maintain our Service</li>
                          <li>
                            To process transactions and send notifications
                          </li>
                          <li>
                            To provide customer support and respond to inquiries
                          </li>
                          <li>To improve and optimize our Service</li>
                          <li>To detect and prevent fraud or abuse</li>
                          <li>
                            To send administrative information and updates
                          </li>
                          <li>To comply with legal obligations</li>
                          <li>
                            To send marketing communications (with your consent)
                          </li>
                        </ul>
                      </div>

                      {/* Section 3 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          3. Information Sharing and Disclosure
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          We do not sell, trade, or rent your personal
                          information to third parties. We may share your
                          information only in the following circumstances:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>
                            <strong>Service Providers:</strong> We share
                            information with trusted third-party service
                            providers who help us operate our Service (payment
                            processors, hosting providers, analytics services)
                          </li>
                          <li>
                            <strong>Legal Requirements:</strong> We may disclose
                            information if required by law, court order, or
                            governmental request
                          </li>
                          <li>
                            <strong>Business Transfers:</strong> In the event of
                            a merger, acquisition, or sale of assets, your
                            information may be transferred
                          </li>
                          <li>
                            <strong>Protection of Rights:</strong> To protect
                            our rights, privacy, safety, or property, and that
                            of our users
                          </li>
                          <li>
                            <strong>With Your Consent:</strong> We may share
                            information with your explicit permission
                          </li>
                        </ul>
                      </div>

                      {/* Section 4 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          4. Data Security
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          We implement appropriate technical and organizational
                          security measures to protect your personal information
                          against unauthorized access, alteration, disclosure,
                          or destruction. These measures include:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>Encryption of data in transit and at rest</li>
                          <li>Secure authentication and password hashing</li>
                          <li>
                            Regular security audits and vulnerability
                            assessments
                          </li>
                          <li>Access controls and authentication mechanisms</li>
                          <li>
                            Regular backups and disaster recovery procedures
                          </li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed pl-7 mt-4">
                          However, no method of transmission over the Internet
                          or electronic storage is 100% secure. While we strive
                          to protect your personal information, we cannot
                          guarantee its absolute security.
                        </p>
                      </div>

                      {/* Section 5 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          5. Data Retention
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          We retain your personal information for as long as
                          necessary to provide our Service and fulfill the
                          purposes outlined in this Privacy Policy. We will
                          retain and use your information to comply with legal
                          obligations, resolve disputes, and enforce our
                          agreements. When you delete your account, we will
                          delete or anonymize your personal information, except
                          where we are required to retain it by law.
                        </p>
                      </div>

                      {/* Section 6 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          6. Your Privacy Rights
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          You have the following rights regarding your personal
                          information:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>
                            <strong>Access:</strong> Request access to your
                            personal information
                          </li>
                          <li>
                            <strong>Correction:</strong> Request correction of
                            inaccurate or incomplete information
                          </li>
                          <li>
                            <strong>Deletion:</strong> Request deletion of your
                            personal information
                          </li>
                          <li>
                            <strong>Portability:</strong> Request a copy of your
                            data in a portable format
                          </li>
                          <li>
                            <strong>Opt-out:</strong> Opt-out of marketing
                            communications
                          </li>
                          <li>
                            <strong>Withdraw Consent:</strong> Withdraw consent
                            for data processing where applicable
                          </li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed pl-7 mt-4">
                          To exercise these rights, please contact us at
                          ayangcostly@gmail.com.
                        </p>
                      </div>

                      {/* Section 7 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          7. Third-Party Services
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          Our Service may contain links to third-party websites
                          or integrate with third-party services (such as
                          payment processors). We are not responsible for the
                          privacy practices of these third parties. We encourage
                          you to review their privacy policies before providing
                          any personal information.
                        </p>
                      </div>

                      {/* Section 8 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          8. Children's Privacy
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          Our Service is not intended for children under 18
                          years of age. We do not knowingly collect personal
                          information from children under 18. If you are a
                          parent or guardian and believe your child has provided
                          us with personal information, please contact us, and
                          we will delete such information.
                        </p>
                      </div>

                      {/* Section 9 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          9. International Data Transfers
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          Your information may be transferred to and maintained
                          on servers located outside of your country of
                          residence. By using our Service, you consent to the
                          transfer of information to countries that may have
                          different data protection laws than your country.
                        </p>
                      </div>

                      {/* Section 10 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          10. Changes to This Privacy Policy
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          We may update this Privacy Policy from time to time.
                          We will notify you of any changes by posting the new
                          Privacy Policy on this page and updating the "Last
                          Updated" date. We encourage you to review this Privacy
                          Policy periodically for any changes.
                        </p>
                      </div>

                      {/* Contact */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          11. Contact Us
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          If you have any questions about this Privacy Policy,
                          please contact us:
                        </p>
                        <div className="pl-7 space-y-1 text-muted-foreground">
                          <p>Email: ayangcostly@gmail.com</p>
                          <p>Phone: +234 8071177214</p>
                          <p>
                            Address: Behind Redeemed Christian Church of God,
                            Ekorinum Calabar, Cross River State, Nigeria
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Refund Policy */}
                <TabsContent value="refund">
                  <Card className="border border-border shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                          <RefreshCcw className="h-6 w-6 text-white" />
                        </div>
                        Refund Policy
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        Last Updated: October 20, 2025
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-8 text-foreground">
                      {/* Introduction */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          Introduction
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          At Get Any Number Online, we strive to provide
                          excellent service and customer satisfaction. This
                          Refund Policy outlines the circumstances under which
                          refunds may be issued for our virtual phone number
                          services.
                        </p>
                      </div>

                      {/* Section 1 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          1. General Refund Policy
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          Due to the nature of our digital service, all sales
                          are generally final. However, we understand that
                          issues may arise, and we are committed to resolving
                          them fairly. Refunds are considered on a case-by-case
                          basis under specific circumstances outlined in this
                          policy.
                        </p>
                      </div>

                      {/* Section 2 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          2. Eligible Refund Scenarios
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          We may issue full or partial refunds in the following
                          circumstances:
                        </p>
                        <div className="pl-7 space-y-4 mt-4">
                          <div>
                            <p className="text-muted-foreground font-medium mb-2">
                              Technical Issues:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>
                                The virtual number was not delivered after
                                purchase
                              </li>
                              <li>
                                The number was unable to receive SMS messages
                                due to our system error
                              </li>
                              <li>
                                Server downtime that prevented access to your
                                purchased numbers for extended periods
                              </li>
                              <li>Duplicate charges for the same service</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium mb-2">
                              Service Failure:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>
                                The number was advertised as available but was
                                actually inactive
                              </li>
                              <li>
                                The number was blocked by the target service
                                immediately upon purchase (through no fault of
                                yours)
                              </li>
                              <li>
                                Messages were not received due to issues on our
                                end
                              </li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium mb-2">
                              Billing Errors:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                              <li>
                                You were charged incorrectly or more than the
                                displayed price
                              </li>
                              <li>
                                You were charged for a service you did not order
                              </li>
                              <li>
                                Payment processing errors resulted in failed
                                transactions but funds were deducted
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Section 3 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          3. Non-Refundable Scenarios
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          Refunds will NOT be issued in the following
                          situations:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>
                            The number received SMS successfully, but you no
                            longer need it
                          </li>
                          <li>
                            You purchased the wrong number or service by mistake
                          </li>
                          <li>
                            The target service (e.g., WhatsApp, Telegram)
                            rejected the number due to their own policies
                          </li>
                          <li>
                            You violated our Terms of Service or used the
                            service for prohibited purposes
                          </li>
                          <li>
                            The SMS was received but you missed it or it expired
                          </li>
                          <li>Change of mind or buyer's remorse</li>
                          <li>
                            You successfully used the number for verification
                          </li>
                          <li>Third-party service issues beyond our control</li>
                          <li>
                            Wallet deposits (once deposited, funds remain in
                            your wallet for future use)
                          </li>
                        </ul>
                      </div>

                      {/* Section 4 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          4. Refund Request Process
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          To request a refund, please follow these steps:
                        </p>
                        <ol className="list-decimal pl-13 space-y-3 text-muted-foreground">
                          <li>
                            <strong>Contact Support:</strong> Email us at
                            ayangcostly@gmail.com within 24 hours of the issue
                            occurring
                          </li>
                          <li>
                            <strong>Provide Details:</strong> Include your
                            account email, transaction ID, order number, date of
                            purchase, and a detailed description of the issue
                          </li>
                          <li>
                            <strong>Evidence:</strong> Provide screenshots or
                            other evidence supporting your refund request (if
                            applicable)
                          </li>
                          <li>
                            <strong>Review:</strong> Our support team will
                            review your request within 2-3 business days
                          </li>
                          <li>
                            <strong>Resolution:</strong> If approved, refunds
                            will be processed within 5-10 business days
                          </li>
                        </ol>
                      </div>

                      {/* Section 5 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          5. Refund Methods
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          Refunds will be issued using the following methods:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>
                            <strong>Wallet Credit:</strong> Funds will be
                            credited back to your Get Any Number Online wallet
                            (fastest method, usually within 24 hours)
                          </li>
                          <li>
                            <strong>Original Payment Method:</strong> Refund to
                            your original payment method (credit card, Paystack,
                            Cryptomus) may take 5-10 business days depending on
                            your bank or payment provider
                          </li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed pl-7 mt-4">
                          By default, we issue refunds as wallet credits unless
                          you specifically request a refund to your original
                          payment method.
                        </p>
                      </div>

                      {/* Section 6 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          6. Partial Refunds
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          In some cases, partial refunds may be issued:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>
                            If you used part of the service before experiencing
                            an issue
                          </li>
                          <li>If the issue was partially resolved</li>
                          <li>
                            For subscription services where partial service was
                            provided
                          </li>
                          <li>
                            At the discretion of our support team based on the
                            specific circumstances
                          </li>
                        </ul>
                      </div>

                      {/* Section 7 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          7. Chargebacks and Disputes
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          We strongly encourage you to contact us directly
                          before initiating a chargeback with your bank or
                          credit card company. Chargebacks should only be used
                          as a last resort. Please note:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>
                            Fraudulent chargebacks may result in immediate
                            account suspension
                          </li>
                          <li>
                            If you file a chargeback, we will provide evidence
                            of service delivery to your financial institution
                          </li>
                          <li>
                            Accounts with chargebacks may be permanently banned
                            from our Service
                          </li>
                          <li>
                            We reserve the right to pursue legal action for
                            fraudulent chargebacks
                          </li>
                        </ul>
                      </div>

                      {/* Section 8 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          8. Promotional Credits and Bonuses
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          Promotional credits, bonuses, and free trial services
                          are not eligible for refunds. These are provided as
                          complimentary benefits and have no cash value. They
                          cannot be transferred, exchanged, or refunded.
                        </p>
                      </div>

                      {/* Section 9 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          9. Service Guarantees
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          While we make every effort to provide reliable
                          service, we cannot guarantee:
                        </p>
                        <ul className="list-disc pl-13 space-y-2 text-muted-foreground">
                          <li>
                            That every number will work with every service
                          </li>
                          <li>
                            The delivery time of SMS messages (this depends on
                            the sending service)
                          </li>
                          <li>That numbers will remain active indefinitely</li>
                          <li>Uninterrupted or error-free service</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed pl-7 mt-4">
                          However, if we fail to provide the core service you
                          paid for due to our fault, you are entitled to a
                          refund as per this policy.
                        </p>
                      </div>

                      {/* Section 10 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          10. Cancellations
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          Due to the instant nature of our service,
                          cancellations after purchase are generally not
                          possible. Once a number is delivered to your account,
                          the transaction is complete. Please ensure you select
                          the correct service and country before completing your
                          purchase.
                        </p>
                      </div>

                      {/* Section 11 */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          11. Changes to Refund Policy
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          We reserve the right to modify this Refund Policy at
                          any time. Changes will be effective immediately upon
                          posting on our website. Your continued use of the
                          Service after changes constitutes acceptance of the
                          updated policy.
                        </p>
                      </div>

                      {/* Contact */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-1" />
                          12. Contact for Refund Requests
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-7">
                          For refund requests or questions about this policy,
                          please contact us:
                        </p>
                        <div className="pl-7 space-y-1 text-muted-foreground">
                          <p>
                            <strong>Email:</strong> ayangcostly@gmail.com
                          </p>
                          <p>
                            <strong>Phone:</strong> +234 8071177214
                          </p>
                          <p>
                            <strong>Address:</strong> Behind Redeemed Christian
                            Church of God, Ekorinum Calabar, Cross River State,
                            Nigeria
                          </p>
                          <p className="mt-4">
                            <strong>Business Hours:</strong>
                          </p>
                          <p>Monday - Friday: 9:00 AM - 6:00 PM (WAT)</p>
                          <p>Saturday - Sunday: 10:00 AM - 4:00 PM (WAT)</p>
                        </div>
                        <p className="text-muted-foreground leading-relaxed pl-7 mt-4">
                          We typically respond to refund requests within 24-48
                          hours during business days. Thank you for your
                          understanding and for choosing Get Any Number Online!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer Note */}
      <footer className="bg-muted/50 border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              By using Get Any Number Online, you agree to these terms and
              policies.
            </p>
            <p className="mt-2">
              For questions or concerns, please contact us at{" "}
              <a
                href="mailto:ayangcostly@gmail.com"
                className="text-primary hover:underline"
              >
                ayangcostly@gmail.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
