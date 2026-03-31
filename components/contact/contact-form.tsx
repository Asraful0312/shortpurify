"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Send } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendContactEmail } from "@/app/actions/contact-action";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactValues) => {
    if (!turnstileToken) {
      setStatus({ type: "error", message: "Please complete the CAPTCHA verification." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const result = await sendContactEmail({ ...data, turnstileToken });
      if (result.success) {
        setStatus({ type: "success", message: "Message sent successfully! We'll get back to you soon." });
        reset();
        setTurnstileToken(null);
      } else {
        setStatus({ type: "error", message: result.error || "Failed to send message." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 md:p-12 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2 text-left">
            <label className="text-sm font-bold text-foreground ml-1">Full Name</label>
            <Input
              {...register("name")}
              placeholder="Alex Johnson"
              className={cn("rounded-2xl border-border/50", errors.name && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.name && <p className="text-[11px] font-bold text-red-500 ml-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-bold text-foreground ml-1">Email Address</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="alex@example.com"
              className={cn("rounded-2xl border-border/50", errors.email && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.email && <p className="text-[11px] font-bold text-red-500 ml-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-sm font-bold text-foreground ml-1">Subject</label>
          <Input
            {...register("subject")}
            placeholder="How can we help?"
            className={cn("rounded-2xl border-border/50", errors.subject && "border-red-500 focus-visible:ring-red-500")}
          />
          {errors.subject && <p className="text-[11px] font-bold text-red-500 ml-1">{errors.subject.message}</p>}
        </div>

        <div className="space-y-2 text-left">
          <label className="text-sm font-bold text-foreground ml-1">Message</label>
          <Textarea
            {...register("message")}
            placeholder="Tell us more about your inquiry..."
            className={cn("rounded-2xl border-border/50 min-h-[150px]", errors.message && "border-red-500 focus-visible:ring-red-500")}
          />
          {errors.message && <p className="text-[11px] font-bold text-red-500 ml-1">{errors.message.message}</p>}
        </div>

        <div className="flex justify-center">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        </div>

        {status && (
          <div className={cn(
            "p-4 rounded-2xl text-sm font-extrabold shadow-sm animate-in fade-in zoom-in-95 duration-300",
            status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          )}>
            {status.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !turnstileToken}
          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-7 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
