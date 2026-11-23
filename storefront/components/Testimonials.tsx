function StarRating() {
  return (
    <div style={{ display: "flex", gap: 3, color: "#111111" }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

const REVIEWS = [
  {
    quote: "The 360° rotating spice organizer and under-sink sliding rack completely transformed our kitchen. It doubled our usable cabinet space, and the build quality feels super sturdy and smooth.",
    author: "Priya S.",
    location: "Home Organization Enthusiast",
    verified: "Verified Buyer",
    rating: 5,
  },
  {
    quote: "The heavy-duty adhesive wall hooks hold securely in our bathroom without any drilling or tile damage. Finally a home solutions brand that delivers reliable, damage-free mounting accessories!",
    author: "Rahul M.",
    location: "Apartment Resident",
    verified: "Verified Buyer",
    rating: 5,
  },
  {
    quote: "CLASPO's modular drawer dividers and deep-cleaning brush set are thoughtfully designed. Everything in our kitchen and pantry now has an organized place. Truly click, pick, and done.",
    author: "Ananya D.",
    location: "Busy Homemaker",
    verified: "Verified Buyer",
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="sec" style={{ background: "#F5F5F5", padding: "80px 0", borderBottom: "1px solid #DADADA" }}>
      <div className="W">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 48px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#FFFFFF",
              color: "#111111",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: "4px",
              border: "1px solid #DADADA",
              marginBottom: 14,
            }}
          >
            Customer Reviews
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 800,
              color: "#111111",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Loved by Homes Everywhere
          </h2>
          <p style={{ fontSize: 16, color: "#777777", lineHeight: 1.6, margin: 0 }}>
            See how CLASPO products help households discover smarter, simpler, and more organized living.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              style={{
                background: "#FFFFFF",
                borderRadius: 12,
                padding: "32px 28px",
                border: "1px solid #DADADA",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <StarRating />
                  <span
                    style={{
                      background: "#F5F5F5",
                      color: "#111111",
                      border: "1px solid #DADADA",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {rev.verified}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.65,
                    color: "#111111",
                    margin: 0,
                    fontStyle: "normal",
                  }}
                >
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 18,
                  borderTop: "1px solid #DADADA",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9999,
                    background: "#F5F5F5",
                    border: "1px solid #DADADA",
                    color: "#111111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {rev.author.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: "#111111" }}>
                    {rev.author}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#777777", marginTop: 2 }}>
                    {rev.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
