import Image from "next/image"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5535.jpg-zuS1UT8rXQ87kZ3sCgcUD1cGduuw3Q.jpeg"
        alt="CHEVAL MIRROR Logo"
        width={40}
        height={40}
        className="rounded-full"
      />
    </div>
  )
}
