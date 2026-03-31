"use server";

import { resend } from "@/lib/resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  turnstileToken: z.string().min(1, "CAPTCHA token required"),
});

export async function sendContactEmail(formData: z.infer<typeof contactSchema>) {
  try {
    const validatedData = contactSchema.parse(formData);
    const { name, email, subject, message, turnstileToken } = validatedData;

    // Verify Turnstile token server-side before doing anything
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) throw new Error("TURNSTILE_SECRET_KEY not configured");

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: turnstileToken }),
    });
    const verifyData = await verifyRes.json() as { success: boolean };
    if (!verifyData.success) {
      return { success: false, error: "CAPTCHA verification failed. Please try again." };
    }

    await resend.emails.send({
      from: "ShortPurify Contact <contact@shortpurify.com>",
      to: "support@shortpurify.com",
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #0f172a; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">New Contact Message</h2>
          <p style="color: #475569; line-height: 1.5;"><strong>From:</strong> ${name} (${email})</p>
          <p style="color: #475569; line-height: 1.5;"><strong>Subject:</strong> ${subject}</p>
          <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0f172a;">
            <p style="color: #1e293b; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 24px; color: #94a3b8; font-size: 12px;">Received from ShortPurify Contact Page</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed. Please check your inputs." };
    }
    return { success: false, error: "Failed to send message. Please try again later." };
  }
}
