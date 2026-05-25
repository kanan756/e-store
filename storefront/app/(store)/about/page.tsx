/**
 * @file app/(store)/about/page.tsx
 * @description Dedicated About Us page for Superior Harnessing and Assembly.
 *   Covers company overview, capabilities, process, industries, and certifications.
 *
 * @owner Heet-P
 * @lastModified May 25, 2026
 */

import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { InteractiveBackground } from "@/components/InteractiveBackground"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Superior Harnessing and Assembly — custom wire harness manufacturer with 30+ years of combined experience delivering precision wiring solutions for OEMs, robotics, medical, EV, and industrial industries.",
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

const CAPABILITIES = [
  {
    title: "Automatic Cut and Strip",
    desc: "We utilize automated wire cutting and stripping machines to ensure precise lengths and clean stripping of insulation. This process improves consistency, reduces errors, and increases production efficiency.",
    img: "/images/wires.webp",
    bullets: ["Half stripping", "Full stripping", "Custom cuts"],
  },
  {
    title: "Terminal Application",
    desc: "Our crimping process uses high-precision presses and applicators to ensure strong, reliable electrical connections. This guarantees consistent quality and long-term durability in every wire harness.",
    img: "/images/cable-loom.webp",
    bullets: [],
  },
  {
    title: "Ultrasonic Splicing",
    desc: "We use ultrasonic welding technology to create strong, reliable wire splices without the need for soldering. This method ensures excellent conductivity, reduced resistance, and long-lasting performance.",
    img: "/images/fuse-box.webp",
    bullets: [],
  },
  {
    title: "Over Molding",
    desc: "Custom mold design for your connector and cable geometry, adding a protective layer of material around connectors and cable assemblies, providing relief from harsh environmental conditions and enhanced durability.",
    img: "/images/automotive-cable.webp",
    bullets: [],
  },
  {
    title: "Connector Loading and Verification",
    desc: "We ensure accurate connector assembly through strict verification processes. Every wire is properly inserted, locked, and checked to eliminate errors and ensure reliable connectivity in final applications.",
    img: "/images/custom-wire-harness.webp",
    bullets: [],
  },
]

const SPECS = [
  { label: "Connector Brands", value: "Molex, TE Connectivity, Deutsch, JST, Amphenol, Custom" },
  { label: "Termination Types", value: "Crimp, solder, IDC, ultrasonic weld" },
  { label: "Testing", value: "EOL Continuity/Short Testing w/ Integrated Vision Systems, Crimp Force Monitoring, Cross-Section Analysis" },
  { label: "Volumes", value: "Prototype through high-volume production" },
  { label: "Additional Services", value: "Harness retrofit/repair, kitting, kanban, drop shipping" },
]

const PROCESS_STEPS = [
  {
    n: "1",
    title: "Design Review & DFM",
    desc: "Engineering review of your drawings with design-for-manufacturability feedback.",
  },
  {
    n: "2",
    title: "Prototyping",
    desc: "Sample builds for fit, form, and function validation.",
  },
  {
    n: "3",
    title: "Testing & Validation",
    desc: "Pull testing, continuity testing, and vision camera inspection. APQP and PPAP documentation provided.",
  },
  {
    n: "4",
    title: "Production Setup",
    desc: "Tooling, jigs, and process documentation for consistent builds.",
  },
  {
    n: "5",
    title: "QC & Shipping",
    desc: "Final inspection, packaging, and on-time delivery.",
  },
]

const INDUSTRIES = [
  {
    name: "Automotive",
    img: "/images/automotive.webp",
    desc: "We manufacture high-performance wire harnesses for automotive applications, including engine systems, infotainment, lighting, sensors, and electric vehicle components. Our products are built to withstand vibration, heat, and harsh operating conditions.",
  },
  {
    name: "Broadcast",
    img: "/images/broadcast.webp",
    desc: "Our cable assemblies are designed for broadcasting systems where signal integrity and reliability are critical. We support studio equipment, field broadcasting units, and communication systems.",
  },
  {
    name: "Computer Wiring",
    img: "/images/computer_wiring.webp",
    desc: "We provide precision wiring solutions for computer systems, including internal wiring, data cables, and connectivity solutions. Our assemblies ensure efficient signal transmission and long-term reliability.",
  },
  {
    name: "Electronics",
    img: "/images/electronics.webp",
    desc: "We manufacture wire harnesses for a wide range of electronic devices, focusing on compact design, high accuracy, and durability. Ideal for consumer electronics, industrial electronics, and embedded systems.",
  },
  {
    name: "OEM Appliances",
    img: "/images/oem.webp",
    desc: "We support OEM manufacturers with customized wiring solutions for appliances such as HVAC systems, kitchen equipment, and industrial machines. Our harnesses are designed for consistent performance and easy integration.",
  },
  {
    name: "Robotics",
    img: "/images/robotics.webp",
    desc: "Our wire harnesses for robotics applications are designed for flexibility, durability, and high-performance movement. We support automation systems, robotic arms, and advanced machinery.",
  },
  {
    name: "Environmental",
    img: "/images/environmental.webp",
    desc: "We provide wiring solutions for environmental monitoring and control systems. Our products are built to operate in harsh outdoor conditions, ensuring reliability in extreme temperatures and environments.",
  },
  {
    name: "Solar",
    img: "/images/solar.webp",
    desc: "We manufacture cable assemblies for solar energy systems, including panel connections, inverters, and power distribution units. Our products are designed for long-term outdoor use and efficient energy transmission.",
  },
  {
    name: "Electric Vehicles (EV)",
    img: "/images/ev.webp",
    desc: "We support the EV industry with advanced wiring solutions for battery systems, charging infrastructure, and power distribution. Our harnesses are engineered for safety, efficiency, and high performance.",
  },
  {
    name: "Telecommunication",
    img: "/images/telecom.webp",
    desc: "We provide high-quality cable assemblies for telecommunication systems, ensuring stable signal transmission and durability. Our solutions support networking equipment, communication towers, and data systems.",
  },
  {
    name: "Medical",
    img: "/images/medical.webp",
    desc: "We manufacture precision cable assemblies for medical devices where safety and reliability are critical. Our products meet strict quality standards and are designed for sensitive applications.",
  },
  {
    name: "Aerospace",
    img: "/images/Aerospsace.webp",
    desc: "Our aerospace wiring solutions are designed to meet high-performance and reliability standards required in aviation and defense applications. We focus on lightweight, durable, and precision-built assemblies.",
  },
  {
    name: "Construction",
    img: "/images/construction.webp",
    desc: "We supply rugged wire harnesses for construction equipment and heavy machinery. Our products are built to withstand dust, vibration, and extreme working conditions.",
  },
  {
    name: "Agricultural",
    img: "/images/agricultural.webp",
    desc: "We provide durable wiring solutions for agricultural machinery and equipment. Our harnesses are designed for outdoor use, exposure to moisture, and rough environments.",
  },
  {
    name: "Lighting Cables",
    img: "/images/lighting-cables.webp",
    desc: "We manufacture cable assemblies for lighting systems including commercial, industrial, and architectural applications. Our solutions ensure safe and efficient power distribution.",
  },
]

export default function AboutPage() {
  return (
    <main style={{ paddingTop: 80 }}>

      <style dangerouslySetInnerHTML={{ __html: `
        .about-hero-grid {
          grid-template-columns: 1fr !important;
        }
        .about-hero-img {
          display: none;
        }
        .about-process-grid {
          grid-template-columns: 1fr 1fr !important;
          gap: 32px !important;
        }
        .about-process-line {
          display: none !important;
        }
        .about-specs-row {
          grid-template-columns: 1fr !important;
        }
        .about-specs-label {
          border-right: none !important;
          border-bottom: 1px solid var(--bd);
        }
        @media (min-width: 768px) {
          .about-hero-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .about-hero-img {
            display: flex !important;
          }
          .about-specs-row {
            grid-template-columns: 220px 1fr !important;
          }
          .about-specs-label {
            border-right: 1px solid var(--bd) !important;
            border-bottom: none !important;
          }
        }
        @media (min-width: 900px) {
          .about-process-grid {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 0 !important;
          }
          .about-process-line {
            display: block !important;
          }
        }
      `}} />

      {/* ── HERO SPLIT ─────────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        padding: "100px 0",
        overflow: "hidden",
        borderBottom: "1px solid var(--bd)",
      }}>
        <InteractiveBackground />
        <div className="W about-hero-grid" style={{ position: "relative", zIndex: 1, display: "grid", gap: 64, alignItems: "start" }}>
          <div>
            <div className="lbl" style={{ color: "var(--text2)", marginBottom: 24 }}>
              ABOUT SUPERIOR HARNESSING
            </div>
            <h1 className="D2" style={{ color: "var(--text)", marginBottom: 24 }}>
              BUILT FOR<br />PRECISION.<br />TRUSTED BY<br />INDUSTRY.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.78, color: "var(--text2)", marginBottom: 24, maxWidth: 480 }}>
              We are a custom wire harness manufacturer committed to delivering high-quality, reliable, and fully customized wiring solutions. With a team that brings over 30 years of combined experience in the wire harness industry, we understand the importance of precision, durability, and performance in every project we undertake.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.78, color: "var(--text2)", marginBottom: 24, maxWidth: 480 }}>
              We specialize in low to medium volume production with flexible minimum order quantities, allowing us to support startups, OEMs, and large-scale manufacturers alike. Our approach is centered around understanding your exact requirements and delivering products that meet your technical specifications, timelines, and budget.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.78, color: "var(--text2)", marginBottom: 40, maxWidth: 480 }}>
              From concept to completion, we work closely with our clients to ensure every wire harness and cable assembly is built to perform in its intended environment. Our commitment to quality and customer satisfaction makes us a trusted partner for businesses looking for dependable wiring solutions.
            </p>
            <Link href="/get-a-quote" className="btn bp">
              Get a Quote <ArrowIcon />
            </Link>
          </div>
          <div className="about-hero-img" style={{
            height: 520,
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 24px 60px rgba(0,0,0,0.1)",
            background: "transparent",
          }}>
            <Image
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070"
              alt="Factory Setup"
              fill
              priority
              sizes="(max-width: 768px) 0px, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* ── OUR CAPABILITIES ────────────────────────────────────────── */}
      <section className="S" style={{ background: "var(--bg)" }}>
        <div className="W">
          <div className="sHdr sHdr--c">
            <div className="lbl lbl-c rv" style={{ marginBottom: 16 }}>MANUFACTURING</div>
            <h2 className="D3 rv d1" style={{ marginBottom: 16 }}>Our Capabilities</h2>
            <p className="Bd rv d2" style={{ maxWidth: 520, margin: "0 auto" }}>
              Advanced manufacturing capabilities from automated cutting to precision connector verification.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {CAPABILITIES.map((cap, i) => (
              <div key={cap.title} className="rv" style={{
                background: "var(--cBg)",
                border: "1px solid var(--bd)",
                borderRadius: "var(--rL)",
                overflow: "hidden",
                transitionDelay: `${i * 0.08}s`,
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{ height: 200, width: "100%", background: "var(--bg2)", position: "relative" }}>
                  <Image src={cap.img} alt={cap.title} fill sizes="280px" style={{ objectFit: "contain" }} />
                </div>
                <div style={{ padding: 28, flex: 1 }}>
                  <h3 style={{
                    fontFamily: "var(--font-sora)",
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    marginBottom: 12,
                    color: "var(--text)",
                  }}>
                    {cap.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.72, color: "var(--text2)", marginBottom: cap.bullets.length ? 16 : 0 }}>
                    {cap.desc}
                  </p>
                  {cap.bullets.length > 0 && (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {cap.bullets.map(b => (
                        <li key={b} style={{
                          fontSize: 13,
                          color: "var(--text2)",
                          paddingLeft: 16,
                          position: "relative",
                          marginBottom: 6,
                        }}>
                          <span style={{ position: "absolute", left: 0, color: "var(--acc)", fontWeight: 700 }}>·</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES & SPECIFICATIONS ───────────────────────────── */}
      <section className="S" style={{ background: "var(--bg2)", borderTop: "1px solid var(--bd)", borderBottom: "1px solid var(--bd)" }}>
        <div className="W">
          <div className="sHdr sHdr--c">
            <div className="lbl lbl-c rv" style={{ marginBottom: 16 }}>TECHNICAL</div>
            <h2 className="D3 rv d1" style={{ marginBottom: 40 }}>Capabilities &amp; Specifications</h2>
          </div>
          <div className="rv d2" style={{
            border: "1px solid var(--bd)",
            borderRadius: "var(--rL)",
            overflow: "hidden",
            maxWidth: 900,
            margin: "0 auto",
          }}>
            {SPECS.map((row, i) => (
              <div key={row.label} className="about-specs-row" style={{
                display: "grid",
                borderBottom: i < SPECS.length - 1 ? "1px solid var(--bd)" : "none",
              }}>
                <div className="about-specs-label" style={{
                  padding: "20px 28px",
                  fontFamily: "var(--font-sora)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--text)",
                  background: "var(--cBg)",
                }}>
                  {row.label}
                </div>
                <div style={{
                  padding: "20px 28px",
                  fontSize: 14,
                  color: "var(--text2)",
                  lineHeight: 1.6,
                }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR PROCESS ─────────────────────────────────────────────── */}
      <section className="S" style={{ background: "var(--bg)" }}>
        <div className="W">
          <div className="sHdr sHdr--c">
            <div className="lbl lbl-c rv" style={{ marginBottom: 16 }}>HOW WE WORK</div>
            <h2 className="D3 rv d1" style={{ marginBottom: 60 }}>Our Process</h2>
          </div>
          <div className="about-process-grid" style={{ display: "grid", position: "relative" }}>
            <div className="about-process-line" style={{
              position: "absolute",
              top: 27,
              left: "10%",
              right: "10%",
              height: 2,
              background: "var(--bd)",
              zIndex: 0,
            }} />
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.n} className="rv" style={{
                textAlign: "center",
                padding: "0 16px",
                position: "relative",
                zIndex: 1,
                transitionDelay: `${i * 0.1}s`,
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--acc)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontFamily: "var(--font-sora)",
                  fontWeight: 800,
                  fontSize: 18,
                  boxShadow: "0 4px 20px rgba(0,109,55,0.3)",
                }}>
                  {step.n}
                </div>
                <div style={{
                  fontFamily: "var(--font-sora)",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--text)",
                  marginBottom: 10,
                }}>
                  {step.title}
                </div>
                <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.65 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES WE SERVE ─────────────────────────────────────── */}
      <section className="S" style={{ background: "var(--bg2)", borderTop: "1px solid var(--bd)", borderBottom: "1px solid var(--bd)" }}>
        <div className="W">
          <div className="sHdr sHdr--c">
            <div className="lbl lbl-c rv" style={{ marginBottom: 16 }}>WHO WE SERVE</div>
            <h2 className="D3 rv d1" style={{ marginBottom: 40 }}>Industries We Serve</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {INDUSTRIES.map((ind, i) => (
              <div key={ind.name} className="rv" style={{
                background: "var(--cBg)",
                border: "1px solid var(--bd)",
                borderRadius: "var(--rL)",
                overflow: "hidden",
                transitionDelay: `${i * 0.04}s`,
              }}>
                <div style={{ height: 160, width: "100%", background: "var(--bg2)", position: "relative" }}>
                  <Image src={ind.img} alt={ind.name} fill sizes="260px" style={{ objectFit: "contain" }} />
                </div>
                <div style={{ padding: "20px 24px 24px" }}>
                  <div style={{
                    fontFamily: "var(--font-sora)",
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 10,
                    color: "var(--text)",
                  }}>
                    {ind.name}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65 }}>{ind.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ──────────────────────────────────────────── */}
      <section className="S" style={{ background: "var(--bg)" }}>
        <div className="W">
          <div className="sHdr sHdr--c">
            <div className="lbl lbl-c rv" style={{ marginBottom: 16 }}>QUALITY ASSURANCE</div>
            <h2 className="D3 rv d1" style={{ marginBottom: 16 }}>Certifications</h2>
            <p className="Bd rv d2" style={{ maxWidth: 520, margin: "0 auto 48px" }}>
              Our manufacturing processes meet rigorous industry standards, ensuring every assembly leaves our facility with verified quality and compliance.
            </p>
          </div>
          <div className="rv d3" style={{
            background: "var(--cBg)",
            border: "1px solid var(--bd)",
            borderRadius: "var(--rL)",
            minHeight: 260,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
            padding: 40,
            textAlign: "center",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--acc)", opacity: 0.5 }}>
              <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
            <span style={{ color: "var(--text2)", fontFamily: "var(--font-sora)", fontWeight: 600, fontSize: 15 }}>
              Certification details coming soon
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="cta">
        <div className="W">
          <h2 className="D3 cta__h rv">Partner With Us Today</h2>
          <p className="cta__s rv d1">
            Tell us your requirements — we&apos;ll handle the rest from design to delivery.
          </p>
          <Link href="/contact" className="btn bp rv d2">
            Contact Us <ArrowIcon />
          </Link>
        </div>
      </section>

    </main>
  )
}
