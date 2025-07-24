"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "What types of glass do you offer?",
      answer:
        "We offer a wide range of premium glass options including tempered safety glass, laminated glass, low-iron glass, frosted glass, tinted glass, and smart glass. Each type has specific properties suited for different applications, and our experts can help you choose the right option for your project.",
    },
    {
      question: "How long does installation typically take?",
      answer:
        "Installation time varies depending on the complexity and scope of the project. Simple mirror installations may take just a few hours, while complete bathroom renovations with custom shower enclosures might take 1-2 days. Commercial projects are scheduled according to their specific requirements. We always provide a detailed timeline during the consultation phase.",
    },
    {
      question: "Do you provide warranties on your products and installations?",
      answer:
        "Yes, all our products come with a manufacturer's warranty, typically ranging from 5-10 years depending on the product. Additionally, we provide a 2-year warranty on all our installation work. This covers any issues that might arise from the installation process itself.",
    },
    {
      question: "Can you customize glass to specific shapes and sizes?",
      answer:
        "Custom shapes and sizes are our specialty. We can create virtually any shape, from simple rectangles and circles to complex organic forms. Our advanced cutting technology allows for precise customization to fit your exact specifications and design vision.",
    },
    {
      question: "What is the difference between framed and frameless shower enclosures?",
      answer:
        "Framed shower enclosures use metal frames to support the glass panels, offering a more traditional look and typically being more cost-effective. Frameless enclosures eliminate most metal framing for a sleek, modern appearance that showcases the glass itself. Frameless options create a more open feel and are easier to clean but generally come at a higher price point due to the thicker glass required for structural integrity.",
    },
    {
      question: "Do you offer maintenance services for your installations?",
      answer:
        "Yes, we provide maintenance services for all our installations. This includes cleaning recommendations, minor repairs, hardware adjustments, and seal replacements. Regular maintenance helps extend the life of your glass installations and keeps them looking their best. We recommend a professional check-up every 1-2 years for shower enclosures and other frequently used glass installations.",
    },
  ]

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border-b border-white/10">
          <AccordionTrigger className="text-left text-slate-900 dark:text-white hover:text-gold-500 dark:hover:text-gold-500">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 dark:text-slate-300">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
