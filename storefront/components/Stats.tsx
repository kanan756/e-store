const STATS = [
  { num: "25+",    label: "Years in business" },
  { num: "1,200+", label: "Active part numbers" },
  { num: "98.7%",  label: "On-time delivery rate" },
  { num: "3",      label: "IPC/WHMA-A-620 Class capability" },
]

export default function Stats() {
  return (
    <section className="stats-bar">
      <div className="W">
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
