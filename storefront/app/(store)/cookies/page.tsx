import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy for Superior Harness & Assembly LLC.",
}

export default function CookiesPage() {
  return (
    <main style={{ paddingTop: 120, paddingBottom: 100, background: "var(--bg)" }}>
      <div className="W" style={{ maxWidth: 800 }}>
        <h1 className="D2" style={{ marginBottom: 24 }}>Cookie Policy</h1>
        <p style={{ color: "var(--text2)", marginBottom: 40 }}>Last Updated: May 2026</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.7, color: "var(--text)" }}>
          <section>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>1. What Are Cookies</h2>
            <p style={{ color: "var(--text2)" }}>
              As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>2. How We Use Cookies</h2>
            <p style={{ color: "var(--text2)" }}>
              We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>3. The Cookies We Set</h2>
            <p style={{ color: "var(--text2)" }}>
              <strong>Site Preferences Cookies:</strong> In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it. For example, your dark mode / light mode theme preference is stored locally so that your preference is remembered on subsequent visits.<br /><br />
              <strong>Account Related Cookies:</strong> If you create an account with us or log in as an administrator, we will use cookies for the management of the signup process and general administration.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>4. Third-Party Cookies</h2>
            <p style={{ color: "var(--text2)" }}>
              In some special cases, we also use cookies provided by trusted third parties. This site may use analytics solutions which are one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
