import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you soon.");
  };

  return (
    <main>
      <section className="gradient-mesh py-10 border-b border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Get in Touch
            </h1>
            <p className="text-muted-foreground">
              Have questions, suggestions, or just want to say hello? We'd love
              to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container max-w-5xl mx-auto px-4 py-14 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              We're here for you
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">
                    hello@worldfriends.app
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Community</p>
                  <p className="text-sm text-muted-foreground">
                    Join our Discord community
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-chart-3/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Available</p>
                  <p className="text-sm text-muted-foreground">
                    Worldwide, 24/7
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
              <p className="text-sm text-muted-foreground leading-relaxed">
                🌍 World Mosaic is a global community platform. We respond to
                messages within 24–48 hours. For urgent matters, please include
                "URGENT" in your subject line.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {submitted ? (
              <div
                data-ocid="contact.form.success_state"
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  Message Sent!
                </h3>
                <p className="text-muted-foreground">
                  Thanks for reaching out. We'll be in touch soon.
                </p>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  variant="outline"
                  className="mt-6 rounded-xl"
                >
                  Send Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Name *</Label>
                    <Input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Your name"
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Subject</Label>
                  <Input
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder="What's this about?"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message *</Label>
                  <Textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Tell us what's on your mind..."
                    className="rounded-xl min-h-32"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  data-ocid="contact.form.submit_button"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-base gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
