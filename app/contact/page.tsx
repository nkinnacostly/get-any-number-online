"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/layout/navbar";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
                Contact
                <span className="block text-primary">Us</span>
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Have questions about our SMS number service? We're here to help!
                Send us a message and we'll get back to you as soon as possible.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="h-full border border-border shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-xl">Get in Touch</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">
                                Email
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ayangcostly@gmail.com
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">
                                Phone
                              </p>
                              <p className="text-sm text-muted-foreground">
                                +234 8071177214
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">
                                Address
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Nigeria
                                <br />
                                Lagos, Nigeria
                              </p>
                            </div>
                          </div>
                        </div>
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
                    <Card className="h-full border border-border shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                          <Phone className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-xl">
                          Business Hours
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-foreground">
                              Monday - Friday
                            </span>
                            <span className="text-muted-foreground">
                              9:00 AM - 6:00 PM
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Saturday</span>
                            <span className="text-muted-foreground">
                              10:00 AM - 4:00 PM
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground">Sunday</span>
                            <span className="text-muted-foreground">
                              10:00 AM - 4:00 PM
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="h-full border border-border shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                        <Send className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">
                        Send us a Message
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {success && (
                          <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              Thank you for your message! We'll get back to you
                              soon.
                            </AlertDescription>
                          </Alert>
                        )}

                        {error && (
                          <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Tell us how we can help you..."
                            value={formData.message}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            rows={6}
                            className="resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* FAQ Section */}
              <motion.div
                className="mt-16"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-foreground">
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">
                          How quickly can I get a phone number?
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Most numbers are available instantly after purchase.
                          Some premium numbers may take up to 24 hours.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">
                          What countries do you support?
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          We support over 50 countries worldwide. Check our
                          numbers page to see available countries.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">
                          Can I use these numbers for business?
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Yes! Our numbers are perfect for business
                          verification, SMS marketing, and customer support.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
}
