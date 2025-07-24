"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all required fields." }
  }

  try {
    // Send email to company
    await resend.emails.send({
      from: "Contact Form <noreply@kirii.cn>",
      to: ["info@kirii.cn"],
      subject: `New Contact Form Submission: ${subject || "General Inquiry"}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    })

    // Send confirmation email to user
    await resend.emails.send({
      from: "Kirii Sanshui Building Materials <noreply@kirii.cn>",
      to: [email],
      subject: "Thank you for contacting Kirii Sanshui Building Materials",
      html: `
        <h2>Thank you for your inquiry</h2>
        <p>Dear ${name},</p>
        <p>Thank you for contacting Kirii Sanshui Building Materials Fty. Ltd. We have received your message and will respond within 24 hours.</p>
        <p><strong>Your message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <br>
        <p>Best regards,<br>
        Kirii Sanshui Building Materials Team</p>
        <hr>
        <p><small>
        Kirii Sanshui Building Materials Fty. Ltd.<br>
        〒528100 13 YongYe Road Yundonghai Street<br>
        Sanshui Foshan GuangDong China<br>
        TEL: (86)757-8782-6438<br>
        FAX: (86)757-8782-6330<br>
        Email: info@kirii.cn
        </small></p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: "Failed to send email. Please try again later." }
  }
}
