const STATS = [
  { num: "30+",    label: "Years in business" },
  { num: "1,200+", label: "Active part numbers" },
  { num: "99.9%",  label: "On-time delivery rate" },
  { num: "3",      label: "IPC/WHMA-A-620 Class capability" },
]

export default function Stats() {
  return (
    <section className="stats-bar" style={{ padding: "80px 0", background: "var(--bg2)" }}>
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
