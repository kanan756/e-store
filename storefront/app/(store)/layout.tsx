import Header from "@/components/Header"
import Footer from "@/components/Footer"
import RevealObserver from "@/components/RevealObserver"

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <RevealObserver />
    </>
  )
}
