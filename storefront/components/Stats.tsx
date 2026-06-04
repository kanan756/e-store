const STATS = [
  { num: "25+",    label: "Years in business" },
  { num: "1,200+", label: "Active part numbers" },
  { num: "98.7%",  label: "On-time delivery rate" },
  { num: "3",      label: "IPC/WHMA-A-620 Class capability" },
]

export default function Stats() {
  return (
    <section className="stats-bar" style={{ 
      padding: "80px 0",
      background: "var(--bg2)",
      backgroundImage: "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
      backgroundSize: "48px 48px"
    }}>
      <div className="W">
        <div className="sHdr sHdr--c rv" style={{ marginBottom: 48 }}>
          <div className="lbl">BY THE NUMBERS</div>
          <h2 className="D2" style={{ marginTop: 16 }}>Proven Reliability</h2>
        </div>
        <div className="stats-bar__grid rv">
          {STATS.map(({ num, label }, i) => (
            <div className="stats-bar__item" key={label} style={{ transitionDelay: `${i * 0.07}s` }}>
              <div className="stats-bar__num">{num}</div>
              <div className="stats-bar__label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
