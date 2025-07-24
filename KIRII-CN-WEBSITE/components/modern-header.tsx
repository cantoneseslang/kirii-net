"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Calculator, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

export function ModernHeader() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/projects", label: "Portfolio" },
    { href: "/cost-estimator", label: "Cost Estimator" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-professional border-b border-blue-100 py-4"
            : "bg-transparent py-6",
        )}
      >
        <div className="container-professional">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Logo className="transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-display font-bold text-blue-900">CHAVEL</span>
                <span className="text-xl font-display font-light text-blue-600 ml-1">MIRROR</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-blue-50",
                    pathname === item.href ? "text-blue-600" : "text-gray-700 hover:text-blue-600",
                  )}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-50 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <Button className="hidden md:flex btn-outline-blue" size="sm" asChild>
                <Link href="/cost-estimator">
                  <Calculator className="mr-2 h-4 w-4" />
                  Quick Quote
                </Link>
              </Button>

              {/* CTA Button */}
              <Button className="hidden md:flex btn-blue" asChild>
                <Link href="/contact">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Link>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden rounded-lg hover:bg-blue-50"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute right-0 top-0 h-full w-80 bg-white border-l border-blue-100 p-6"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <Logo />
                    <div>
                      <span className="text-lg font-display font-bold text-blue-900">CHAVEL</span>
                      <span className="text-lg font-display font-light text-blue-600 ml-1">MIRROR</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg">
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <nav className="flex flex-col space-y-2 flex-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "px-4 py-3 rounded-lg font-medium transition-all duration-300",
                        pathname === item.href
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="space-y-4 pt-6 border-t border-blue-100">
                  <Button className="w-full btn-outline-blue" asChild>
                    <Link href="/cost-estimator">
                      <Calculator className="mr-2 h-4 w-4" />
                      Quick Quote
                    </Link>
                  </Button>
                  <Button className="w-full btn-blue" asChild>
                    <Link href="/contact">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
