// Generated from the LUMEN prototype (Hardware.dc.html) by a one-off converter,
// then kept as normal source. Edit freely.
import { Link } from 'react-router-dom';
import GateSimulator from './GateSimulator';

export default function HardwareContent() {
  return (
    <>
      <section id="top" style={{padding: "40px 0 8px", display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center"}}>
        <div style={{flex: "1 1 460px", minWidth: "0", display: "flex", flexDirection: "column", gap: "18px"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", letterSpacing: "0.14em", color: "#F4B601"}}>
            {"HOW IT WORKS: HARDWARE"}
          </span>
          <h1 style={{margin: "0", fontSize: "clamp(2.5rem, 5.4vw, 4.5rem)", fontWeight: "900", lineHeight: "1.02", letterSpacing: "-0.015em"}}>
            {"Two beams, one mic, one tiny computer per door."}
          </h1>
          <p style={{margin: "0", fontSize: "1.1875rem", lineHeight: "1.55", color: "#C9D6EE"}}>
            {"Every way onto a floor gets a two-beam laser gate that knows if you walked in or out. Each floor gets decibel sensors and a small hub. ESP32 boards count, measure and report, and the site updates in about two seconds."}
          </p>
          <div style={{display: "flex", flexWrap: "wrap", gap: "10px"}}>
            <span style={{padding: "8px 12px", borderRadius: "10px", background: "#122851", border: "1px solid rgba(117,173,234,0.25)", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px"}}>
              {"2 lasers per doorway"}
            </span>
            <span style={{padding: "8px 12px", borderRadius: "10px", background: "#122851", border: "1px solid rgba(117,173,234,0.25)", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px"}}>
              {"ESP32: Wi-Fi + Bluetooth LE"}
            </span>
            <span style={{padding: "8px 12px", borderRadius: "10px", background: "#122851", border: "1px solid rgba(117,173,234,0.25)", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px"}}>
              {"Decibels only, no audio kept"}
            </span>
            <span style={{padding: "8px 12px", borderRadius: "10px", background: "#122851", border: "1px solid rgba(117,173,234,0.25)", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px"}}>
              {"5 V USB power"}
            </span>
          </div>
        </div>
        <figure style={{flex: "1 1 420px", minWidth: "0", margin: "0", display: "flex", flexDirection: "column", gap: "10px"}}>
          <img src="/assets/slc-building.jpg" alt="Isometric drawing of the Student Learning Centre with the LUMEN sign in the elevator lobby and floor labels such as F7 quiet and F4 full" style={{width: "100%", height: "auto", borderRadius: "16px", border: "1px solid rgba(117,173,234,0.22)", display: "block"}} />
          <figcaption style={{fontSize: "14px", color: "#C9D6EE"}}>
            {"The sign lives in the elevator lobby. The sensors live on every floor."}
          </figcaption>
        </figure>
      </section>
      <nav aria-label="On this page" style={{marginTop: "32px", display: "flex", flexWrap: "wrap", gap: "8px"}}>
        <a href="#gate" style={{display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 14px", borderRadius: "999px", background: "#19356B", color: "#FFFFFF", textDecoration: "none", fontWeight: "700", fontSize: "14px"}}>
          {"01 Laser gate"}
        </a>
        <a href="#wiring" style={{display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 14px", borderRadius: "999px", background: "#19356B", color: "#FFFFFF", textDecoration: "none", fontWeight: "700", fontSize: "14px"}}>
          {"02 Gate wiring"}
        </a>
        <a href="#noise" style={{display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 14px", borderRadius: "999px", background: "#19356B", color: "#FFFFFF", textDecoration: "none", fontWeight: "700", fontSize: "14px"}}>
          {"03 Decibel reader"}
        </a>
        <a href="#network" style={{display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 14px", borderRadius: "999px", background: "#19356B", color: "#FFFFFF", textDecoration: "none", fontWeight: "700", fontSize: "14px"}}>
          {"04 Wi-Fi or Bluetooth"}
        </a>
        <a href="#pipeline" style={{display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 14px", borderRadius: "999px", background: "#19356B", color: "#FFFFFF", textDecoration: "none", fontWeight: "700", fontSize: "14px"}}>
          {"05 Data pipeline"}
        </a>
        <a href="#parts" style={{display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 14px", borderRadius: "999px", background: "#19356B", color: "#FFFFFF", textDecoration: "none", fontWeight: "700", fontSize: "14px"}}>
          {"06 Parts + cost"}
        </a>
        <a href="#install" style={{display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 14px", borderRadius: "999px", background: "#19356B", color: "#FFFFFF", textDecoration: "none", fontWeight: "700", fontSize: "14px"}}>
          {"07 Install + safety"}
        </a>
        <a href="#plan" style={{display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 14px", borderRadius: "999px", background: "#19356B", color: "#FFFFFF", textDecoration: "none", fontWeight: "700", fontSize: "14px"}}>
          {"08 Build + test plan"}
        </a>
      </nav>
      <section aria-labelledby="glance-title" style={{marginTop: "40px", padding: "28px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "22px", display: "flex", flexDirection: "column", gap: "20px"}}>
        <h2 id="glance-title" style={{margin: "0", fontSize: "1.75rem", fontWeight: "900"}}>
          {"The whole system at a glance"}
        </h2>
        <div style={{display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "12px"}}>
          <div style={{flex: "1 1 250px", display: "flex", flexDirection: "column", gap: "10px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#F4B601"}}>
              {"ON EVERY FLOOR (2 TO 8)"}
            </span>
            <span style={{fontSize: "16px", lineHeight: "1.6"}}>
              {"A laser gate at each way in (elevator lobby, stairwells)"}
              <br />
              {"2 decibel sensors (quiet side, social side)"}
              <br />
              {"1 floor hub that relays to Wi-Fi"}
            </span>
          </div>
          <span aria-hidden="true" style={{alignSelf: "center", fontSize: "34px", fontWeight: "900", color: "#75ADEA"}}>
            {"›"}
          </span>
          <div style={{flex: "1 1 250px", display: "flex", flexDirection: "column", gap: "10px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#F4B601"}}>
              {"IN THE CLOUD"}
            </span>
            <span style={{fontSize: "16px", lineHeight: "1.6"}}>
              {"MQTT broker receives every message"}
              <br />
              {"LUMEN backend turns counts into seats free"}
              <br />
              {"Database keeps one snapshot a minute"}
            </span>
          </div>
          <span aria-hidden="true" style={{alignSelf: "center", fontSize: "34px", fontWeight: "900", color: "#75ADEA"}}>
            {"›"}
          </span>
          <div style={{flex: "1 1 250px", display: "flex", flexDirection: "column", gap: "10px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#F4B601"}}>
              {"WHERE STUDENTS SEE IT"}
            </span>
            <span style={{fontSize: "16px", lineHeight: "1.6"}}>
              {"Lobby screen by the elevators"}
              <br />
              {"This website, from the QR code"}
              <br />
              {"A screen on each floor"}
            </span>
          </div>
        </div>
      </section>
      <section id="gate" style={{paddingTop: "80px", display: "flex", flexDirection: "column", gap: "28px"}}>
        <div style={{display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "center"}}>
          <div style={{flex: "1 1 460px", minWidth: "0", display: "flex", flexDirection: "column", gap: "12px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", letterSpacing: "0.14em", color: "#F4B601"}}>
              {"01 · THE LASER GATE"}
            </span>
            <h2 style={{margin: "0", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", lineHeight: "1.05"}}>
              {"Two beams tell us which way you walked."}
            </h2>
            <p style={{margin: "0", fontSize: "1.0625rem", lineHeight: "1.6", color: "#C9D6EE"}}>
              {"One beam can only say \"someone passed.\" Two beams 12 cm apart, across the doorway at hip height, say which way. If the hallway beam (A) breaks first and the floor beam (B) clears last, you walked in. The reverse means you walked out. Each count is a running total, so the floor's occupancy is simply ins minus outs."}
            </p>
          </div>
          <figure style={{flex: "1 1 400px", minWidth: "0", margin: "0", display: "flex", flexDirection: "column", gap: "8px"}}>
            <img src="/assets/counter-concepts.jpg" alt="Three concepts from the team's weighted decision matrix: overhead camera 3.60 out of 5, infrared entry and exit counters 4.35 out of 5 and the winner, and an app 3.30 out of 5" style={{width: "100%", height: "auto", borderRadius: "14px", border: "1px solid rgba(117,173,234,0.22)", display: "block"}} loading="lazy" />
            <figcaption style={{fontSize: "14px", color: "#C9D6EE"}}>
              {"Why a beam gate: entry and exit counters won our decision matrix at 4.35/5. No images, low cost."}
            </figcaption>
          </figure>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "16px"}}>
          <figure style={{flex: "1 1 420px", minWidth: "0", margin: "0", padding: "20px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "10px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"TOP VIEW · ONE DOORWAY"}
            </span>
            <svg viewBox="0 0 560 340" role="img" aria-label="Top view of a doorway. Two laser beams, A on the hallway side and B on the floor side, cross the 90 centimetre opening 12 centimetres apart. Lasers sit on one door jamb, receivers and the ESP32 on the other. A person walks from the hallway toward the floor." style={{width: "100%", height: "auto", display: "block"}}>
              <rect x="250" y="24" width="60" height="48" rx="4" fill="#1D3F7A"></rect>
              <rect x="250" y="252" width="60" height="48" rx="4" fill="#1D3F7A"></rect>
              <rect x="263" y="64" width="10" height="8" fill="#F25E5E"></rect>
              <rect x="287" y="64" width="10" height="8" fill="#F25E5E"></rect>
              <rect x="261" y="252" width="14" height="10" rx="2" fill="#3DDB96"></rect>
              <rect x="285" y="252" width="14" height="10" rx="2" fill="#3DDB96"></rect>
              <line x1="268" y1="72" x2="268" y2="252" stroke="#F25E5E" style={{strokeWidth: "7", opacity: "0.22"}}></line>
              <line x1="292" y1="72" x2="292" y2="252" stroke="#F25E5E" style={{strokeWidth: "7", opacity: "0.22"}}></line>
              <line x1="268" y1="72" x2="268" y2="252" stroke="#FF6B6B" style={{strokeWidth: "2.5"}}></line>
              <line x1="292" y1="72" x2="292" y2="252" stroke="#FF6B6B" style={{strokeWidth: "2.5"}}></line>
              <ellipse cx="180" cy="162" rx="24" ry="44" fill="#75ADEA"></ellipse>
              <circle cx="184" cy="162" r="15" fill="#2B4F8C"></circle>
              <path d="M 150 228 H 214" stroke="#F4B601" style={{strokeWidth: "3", strokeLinecap: "round"}}></path>
              <path d="M 206 221 L 216 228 L 206 235" fill="none" stroke="#F4B601" style={{strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}></path>
              <text x="256" y="92" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", fontWeight: "700", fill: "#FFFFFF", textAnchor: "end"}}>
                {"A"}
              </text>
              <text x="304" y="92" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", fontWeight: "700", fill: "#FFFFFF"}}>
                {"B"}
              </text>
              <text x="280" y="16" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fill: "#C9D6EE", textAnchor: "middle"}}>
                {"2 LASERS (CLASS 2)"}
              </text>
              <text x="280" y="320" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fill: "#C9D6EE", textAnchor: "middle"}}>
                {"2 RECEIVERS + ESP32 NODE"}
              </text>
              <text x="96" y="166" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: "700", fill: "#9FB3DA", textAnchor: "middle"}}>
                {"HALLWAY"}
              </text>
              <text x="452" y="166" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: "700", fill: "#9FB3DA", textAnchor: "middle"}}>
                {"FLOOR 7"}
              </text>
              <path d="M 268 284 V 296 M 292 284 V 296 M 268 290 H 292" stroke="#FFFFFF" style={{strokeWidth: "1.5"}}></path>
              <text x="330" y="294" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fill: "#FFFFFF"}}>
                {"12 cm"}
              </text>
              <text x="182" y="252" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fill: "#F4B601", textAnchor: "middle"}}>
                {"walking in"}
              </text>
              <text x="400" y="110" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fill: "#C9D6EE", textAnchor: "middle"}}>
                {"90 cm opening"}
              </text>
            </svg>
            <figcaption style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"Beam A faces the hallway, beam B faces the floor. A torso is about 25 to 30 cm deep, so for a moment it blocks both beams. That overlap is what makes the direction reliable."}
            </figcaption>
          </figure>
          <figure style={{flex: "1 1 420px", minWidth: "0", margin: "0", padding: "20px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "10px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"MOCKUP · FRONT VIEW, INSTALLED"}
            </span>
            <svg viewBox="0 0 560 360" role="img" aria-label="Front view of the installed gate. A slim laser box sits on the left door jamb and the ESP32 node box on the right jamb, both 1 metre above the floor. The beam crosses at hip height. A thin cable runs over the door header in a stick-on raceway. The node plugs into a 5 volt USB adapter at a wall outlet." style={{width: "100%", height: "auto", display: "block"}}>
              <rect x="0" y="330" width="560" height="4" fill="#3B6AAE"></rect>
              <rect x="116" y="36" width="20" height="294" fill="#1D3F7A"></rect>
              <rect x="404" y="36" width="20" height="294" fill="#1D3F7A"></rect>
              <rect x="116" y="28" width="308" height="20" fill="#1D3F7A"></rect>
              <path d="M 126 32 H 414" stroke="#9FB3DA" style={{strokeWidth: "2", strokeDasharray: "5 5"}}></path>
              <path d="M 414 32 V 176" stroke="#9FB3DA" style={{strokeWidth: "2", strokeDasharray: "5 5"}}></path>
              <path d="M 126 32 V 180" stroke="#9FB3DA" style={{strokeWidth: "2", strokeDasharray: "5 5"}}></path>
              <rect x="136" y="180" width="18" height="28" rx="3" fill="#F4B601"></rect>
              <circle cx="150" cy="194" r="3" fill="#F25E5E"></circle>
              <rect x="378" y="172" width="26" height="44" rx="4" fill="#3DDB96"></rect>
              <rect x="378" y="188" width="8" height="12" fill="#0A2150"></rect>
              <circle cx="396" cy="208" r="3" fill="#0A2150"></circle>
              <line x1="154" y1="194" x2="378" y2="194" stroke="#FF6B6B" style={{strokeWidth: "2.5"}}></line>
              <circle cx="268" cy="98" r="18" fill="#75ADEA"></circle>
              <rect x="246" y="120" width="44" height="104" rx="16" fill="#75ADEA"></rect>
              <path d="M 256 222 L 248 328 M 280 222 L 290 328" stroke="#75ADEA" style={{strokeWidth: "12", strokeLinecap: "round"}}></path>
              <line x1="246" y1="194" x2="290" y2="194" stroke="#0A2150" style={{strokeWidth: "3", strokeDasharray: "4 3"}}></line>
              <path d="M 404 212 V 300 H 452" fill="none" stroke="#9FB3DA" style={{strokeWidth: "2", strokeDasharray: "5 5"}}></path>
              <rect x="452" y="290" width="22" height="24" rx="3" fill="#C9D6EE"></rect>
              <path d="M 512 194 V 330 M 504 194 H 520 M 504 330 H 520" stroke="#FFFFFF" style={{strokeWidth: "1.5"}}></path>
              <text x="526" y="266" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fill: "#FFFFFF"}}>
                {"1.0 m"}
              </text>
              <text x="104" y="190" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fill: "#F4B601", textAnchor: "end"}}>
                {"LASERS"}
              </text>
              <text x="104" y="206" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fill: "#C9D6EE", textAnchor: "end"}}>
                {"A + B"}
              </text>
              <text x="440" y="168" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fill: "#3DDB96"}}>
                {"NODE"}
              </text>
              <text x="270" y="20" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fill: "#C9D6EE", textAnchor: "middle"}}>
                {"3-wire cable in raceway"}
              </text>
              <text x="463" y="286" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fill: "#C9D6EE", textAnchor: "middle"}}>
                {"USB 5 V"}
              </text>
            </svg>
            <figcaption style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"Hip height (1.0 m) catches the torso of almost everyone, stays well below eye level, and ignores most swinging hands. Nothing touches the floor."}
            </figcaption>
          </figure>
        </div>
        <GateSimulator />
        <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
          <h3 style={{margin: "0", fontSize: "1.375rem", fontWeight: "900"}}>
            {"The rule, step by step"}
          </h3>
          <div style={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px"}}>
            <span style={{width: "132px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", fontWeight: "700", color: "#3DDB96"}}>
              {"WALKING IN"}
            </span>
            <span style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", background: "#19356B", borderRadius: "12px"}}>
              <span style={{display: "flex", gap: "6px"}}>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"A"}
                </span>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", border: "2px solid #3B6AAE", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"B"}
                </span>
              </span>
              <span style={{fontSize: "13px", color: "#C9D6EE"}}>
                {"A breaks"}
              </span>
            </span>
            <span aria-hidden="true" style={{fontSize: "24px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <span style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", background: "#19356B", borderRadius: "12px"}}>
              <span style={{display: "flex", gap: "6px"}}>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"A"}
                </span>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"B"}
                </span>
              </span>
              <span style={{fontSize: "13px", color: "#C9D6EE"}}>
                {"Both blocked"}
              </span>
            </span>
            <span aria-hidden="true" style={{fontSize: "24px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <span style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", background: "#19356B", borderRadius: "12px"}}>
              <span style={{display: "flex", gap: "6px"}}>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", border: "2px solid #3B6AAE", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"A"}
                </span>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"B"}
                </span>
              </span>
              <span style={{fontSize: "13px", color: "#C9D6EE"}}>
                {"B clears last"}
              </span>
            </span>
            <span aria-hidden="true" style={{fontSize: "24px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <span style={{padding: "14px 16px", borderRadius: "12px", background: "#3DDB96", color: "#0B1B3A", fontWeight: "900", fontSize: "16px"}}>
              {"+1 IN"}
            </span>
          </div>
          <div style={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px"}}>
            <span style={{width: "132px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", fontWeight: "700", color: "#75ADEA"}}>
              {"WALKING OUT"}
            </span>
            <span style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", background: "#19356B", borderRadius: "12px"}}>
              <span style={{display: "flex", gap: "6px"}}>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", border: "2px solid #3B6AAE", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"A"}
                </span>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"B"}
                </span>
              </span>
              <span style={{fontSize: "13px", color: "#C9D6EE"}}>
                {"B breaks"}
              </span>
            </span>
            <span aria-hidden="true" style={{fontSize: "24px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <span style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", background: "#19356B", borderRadius: "12px"}}>
              <span style={{display: "flex", gap: "6px"}}>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"A"}
                </span>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"B"}
                </span>
              </span>
              <span style={{fontSize: "13px", color: "#C9D6EE"}}>
                {"Both blocked"}
              </span>
            </span>
            <span aria-hidden="true" style={{fontSize: "24px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <span style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", background: "#19356B", borderRadius: "12px"}}>
              <span style={{display: "flex", gap: "6px"}}>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"A"}
                </span>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", border: "2px solid #3B6AAE", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"B"}
                </span>
              </span>
              <span style={{fontSize: "13px", color: "#C9D6EE"}}>
                {"A clears last"}
              </span>
            </span>
            <span aria-hidden="true" style={{fontSize: "24px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <span style={{padding: "14px 16px", borderRadius: "12px", background: "#75ADEA", color: "#0B1B3A", fontWeight: "900", fontSize: "16px"}}>
              {"+1 OUT"}
            </span>
          </div>
          <div style={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px"}}>
            <span style={{width: "132px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", fontWeight: "700", color: "#F4B601"}}>
              {"TURNED BACK"}
            </span>
            <span style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", background: "#19356B", borderRadius: "12px"}}>
              <span style={{display: "flex", gap: "6px"}}>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"A"}
                </span>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", border: "2px solid #3B6AAE", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"B"}
                </span>
              </span>
              <span style={{fontSize: "13px", color: "#C9D6EE"}}>
                {"A breaks"}
              </span>
            </span>
            <span aria-hidden="true" style={{fontSize: "24px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <span style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", background: "#19356B", borderRadius: "12px"}}>
              <span style={{display: "flex", gap: "6px"}}>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"A"}
                </span>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"B"}
                </span>
              </span>
              <span style={{fontSize: "13px", color: "#C9D6EE"}}>
                {"Both blocked"}
              </span>
            </span>
            <span aria-hidden="true" style={{fontSize: "24px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <span style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 14px", background: "#19356B", borderRadius: "12px"}}>
              <span style={{display: "flex", gap: "6px"}}>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", background: "#F25E5E", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"A"}
                </span>
                <span style={{width: "30px", height: "30px", borderRadius: "6px", border: "2px solid #3B6AAE", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
                  {"B"}
                </span>
              </span>
              <span style={{fontSize: "13px", color: "#C9D6EE"}}>
                {"A clears last"}
              </span>
            </span>
            <span aria-hidden="true" style={{fontSize: "24px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <span style={{padding: "14px 16px", borderRadius: "12px", border: "2px solid #F4B601", color: "#F4B601", fontWeight: "900", fontSize: "16px"}}>
              {"No count"}
            </span>
          </div>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "16px"}}>
          <figure style={{flex: "1 1 420px", minWidth: "0", margin: "0", padding: "20px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "10px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"SCHEMA · RECEIVER SIGNALS OVER TIME"}
            </span>
            <svg viewBox="0 0 560 210" role="img" aria-label="Timing chart. When entering, receiver A drops low first and receiver B drops a moment later, A recovers, then B recovers. When exiting, B drops first and A recovers last." style={{width: "100%", height: "auto", display: "block"}}>
              <text x="145" y="18" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "700", fill: "#3DDB96", textAnchor: "middle"}}>
                {"ENTERING"}
              </text>
              <text x="425" y="18" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "700", fill: "#75ADEA", textAnchor: "middle"}}>
                {"EXITING"}
              </text>
              <text x="12" y="72" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "700", fill: "#FFFFFF"}}>
                {"A"}
              </text>
              <text x="12" y="142" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "700", fill: "#FFFFFF"}}>
                {"B"}
              </text>
              <path d="M 30 50 H 90 V 80 H 170 V 50 H 262" fill="none" stroke="#3DDB96" style={{strokeWidth: "3", strokeLinejoin: "round"}}></path>
              <path d="M 30 120 H 122 V 150 H 204 V 120 H 262" fill="none" stroke="#75ADEA" style={{strokeWidth: "3", strokeLinejoin: "round"}}></path>
              <path d="M 310 50 H 404 V 80 H 486 V 50 H 548" fill="none" stroke="#3DDB96" style={{strokeWidth: "3", strokeLinejoin: "round"}}></path>
              <path d="M 310 120 H 372 V 150 H 452 V 120 H 548" fill="none" stroke="#75ADEA" style={{strokeWidth: "3", strokeLinejoin: "round"}}></path>
              <path d="M 90 168 V 176 M 122 168 V 176 M 90 172 H 122" stroke="#C9D6EE" style={{strokeWidth: "1.5"}}></path>
              <text x="106" y="194" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fill: "#C9D6EE", textAnchor: "middle"}}>
                {"~90 ms"}
              </text>
              <text x="200" y="194" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fill: "#C9D6EE", textAnchor: "middle"}}>
                {"A first: IN"}
              </text>
              <text x="460" y="194" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fill: "#C9D6EE", textAnchor: "middle"}}>
                {"B first: OUT"}
              </text>
              <text x="286" y="72" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fill: "#9FB3DA", textAnchor: "middle"}}>
                {"high = beam on"}
              </text>
            </svg>
            <figcaption style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"At normal walking speed (about 1.3 m/s) the second beam breaks roughly 90 ms after the first. The ESP32 timestamps both edges with interrupts, so this is easy to resolve."}
            </figcaption>
          </figure>
          <div style={{flex: "1 1 420px", minWidth: "0", padding: "20px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"FILTERS THAT KEEP THE COUNT HONEST"}
            </span>
            <ul style={{margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "10px"}}>
              <li style={{display: "flex", gap: "12px"}}>
                <span style={{flex: "none", width: "76px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", fontWeight: "700", color: "#F4B601"}}>
                  {"40 ms"}
                </span>
                <span style={{fontSize: "15px", lineHeight: "1.5"}}>
                  {"Ignore breaks shorter than this. A swinging hand or bag strap is not a person."}
                </span>
              </li>
              <li style={{display: "flex", gap: "12px"}}>
                <span style={{flex: "none", width: "76px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", fontWeight: "700", color: "#F4B601"}}>
                  {"2 s"}
                </span>
                <span style={{fontSize: "15px", lineHeight: "1.5"}}>
                  {"A crossing must finish in this time, or it is dropped and the gate waits for both beams to clear."}
                </span>
              </li>
              <li style={{display: "flex", gap: "12px"}}>
                <span style={{flex: "none", width: "76px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", fontWeight: "700", color: "#F4B601"}}>
                  {"10 s"}
                </span>
                <span style={{fontSize: "15px", lineHeight: "1.5"}}>
                  {"Both beams blocked this long means someone is standing in the doorway: flag it, count nothing."}
                </span>
              </li>
              <li style={{display: "flex", gap: "12px"}}>
                <span style={{flex: "none", width: "76px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", fontWeight: "700", color: "#F4B601"}}>
                  {"60 s"}
                </span>
                <span style={{fontSize: "15px", lineHeight: "1.5"}}>
                  {"One beam dark this long means it is knocked out of line: red LED on, fault sent to the dashboard."}
                </span>
              </li>
              <li style={{display: "flex", gap: "12px"}}>
                <span style={{flex: "none", width: "76px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", fontWeight: "700", color: "#F4B601"}}>
                  {"Self-test"}
                </span>
                <span style={{fontSize: "15px", lineHeight: "1.5"}}>
                  {"Every 10 minutes the node switches its lasers off for 50 ms and checks both receivers go dark."}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
            {"FIRMWARE SKETCH · GATE NODE (ARDUINO C++)"}
          </span>
          <pre tabIndex={0} style={{margin: "0", padding: "20px", borderRadius: "14px", background: "#071A40", border: "1px solid rgba(117,173,234,0.18)", color: "#DDE6F7", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", lineHeight: "1.6", overflowX: "auto", whiteSpace: "pre", fontVariantLigatures: "none"}}>{"// Two beams: direction comes from which beam breaks first and which clears last\nconst int BEAM_A = 34;   // hallway side\nconst int BEAM_B = 35;   // floor side\nenum State { IDLE, TRACKING, WAIT_CLEAR };\nState state = IDLE;\nchar first, last;\nuint32_t inTotal = 0, outTotal = 0, started = 0;\n\nvoid loop() {\n  bool a = blocked(BEAM_A);          // debounced: ignores breaks under 40 ms\n  bool b = blocked(BEAM_B);\n  uint32_t now = millis();\n\n  if (state == IDLE && (a || b)) {   // someone stepped into the doorway\n    first = a ? 'A' : 'B';\n    last = first;\n    state = TRACKING;\n    started = now;\n  }\n  if (state == TRACKING) {\n    if (a && !b) last = 'A';\n    if (b && !a) last = 'B';\n    if (!a && !b) {                     // doorway clear again\n      if (first == 'A' && last == 'B') inTotal++;    // walked in\n      if (first == 'B' && last == 'A') outTotal++;   // walked out\n      state = IDLE;                     // same beam first and last: turned back\n    } else if (now - started > 2000) {\n      state = WAIT_CLEAR;               // too slow or lingering: count nothing\n    }\n  }\n  if (state == WAIT_CLEAR && !a && !b) state = IDLE;\n\n  advertiseEverySecond(inTotal, outTotal);   // BLE advert with running totals\n}"}</pre>
        </div>
      </section>
      <section id="wiring" style={{paddingTop: "80px", display: "flex", flexDirection: "column", gap: "24px"}}>
        <div style={{display: "flex", flexDirection: "column", gap: "12px", maxWidth: "48rem"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", letterSpacing: "0.14em", color: "#F4B601"}}>
            {"02 · WIRING THE GATE NODE"}
          </span>
          <h2 style={{margin: "0", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", lineHeight: "1.05"}}>
            {"Everything runs on one 5 V USB plug."}
          </h2>
          <p style={{margin: "0", fontSize: "1.0625rem", lineHeight: "1.6", color: "#C9D6EE"}}>
            {"The receivers are 5 V modules, but ESP32 pins only take 3.3 V, so each signal goes through a two-resistor divider. One transistor lets the ESP32 switch both lasers for the self-test and at night. All grounds are shared."}
          </p>
        </div>
        <div tabIndex={0} style={{overflowX: "auto", borderRadius: "18px", border: "1px solid rgba(117,173,234,0.22)", background: "#0A2150"}}>
          <div style={{position: "relative", width: "1152px", height: "520px"}}>
            <svg role="img" aria-label="From laser receiver A into the 10k and 20k divider" width="48" height="8" viewBox="0 0 48 8" preserveAspectRatio="none" style={{position: "absolute", left: "240px", top: "136px", width: "48px", height: "8px", overflow: "visible", fill: "none", stroke: "#3DDB96", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <path d="M 0 4 L 48 4"></path>
            </svg>
            <svg role="img" aria-label="From the divider into GPIO34, the beam A signal" width="47" height="8" viewBox="0 0 47 8" preserveAspectRatio="none" style={{position: "absolute", left: "392px", top: "136px", width: "47px", height: "8px", overflow: "visible", fill: "none", stroke: "#3DDB96", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-1" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#3DDB96" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 0 4 L 41 4" markerEnd="url(#dc-arrow-head-filled-1)"></path>
            </svg>
            <svg role="img" aria-label="From laser receiver B into its divider" width="48" height="8" viewBox="0 0 48 8" preserveAspectRatio="none" style={{position: "absolute", left: "240px", top: "272px", width: "48px", height: "8px", overflow: "visible", fill: "none", stroke: "#75ADEA", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <path d="M 0 4 L 48 4"></path>
            </svg>
            <svg role="img" aria-label="From the divider into GPIO35, the beam B signal" width="47" height="8" viewBox="0 0 47 8" preserveAspectRatio="none" style={{position: "absolute", left: "392px", top: "272px", width: "47px", height: "8px", overflow: "visible", fill: "none", stroke: "#75ADEA", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-2" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#75ADEA" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 0 4 L 41 4" markerEnd="url(#dc-arrow-head-filled-2)"></path>
            </svg>
            <svg role="img" aria-label="Common ground joined to the ESP32 GND pin" width="200" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" style={{position: "absolute", left: "240px", top: "408px", width: "200px", height: "8px", overflow: "visible", fill: "none", stroke: "#9FB3DA", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", strokeDasharray: "6 6"}}>
              <path d="M 0 4 L 200 4"></path>
            </svg>
            <svg role="img" aria-label="From GPIO25 to the laser driver, the laser enable signal" width="47" height="8" viewBox="0 0 47 8" preserveAspectRatio="none" style={{position: "absolute", left: "696px", top: "136px", width: "47px", height: "8px", overflow: "visible", fill: "none", stroke: "#F4B601", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-3" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#F4B601" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 0 4 L 41 4" markerEnd="url(#dc-arrow-head-filled-3)"></path>
            </svg>
            <svg role="img" aria-label="From the laser driver to both laser emitters" width="47" height="8" viewBox="0 0 47 8" preserveAspectRatio="none" style={{position: "absolute", left: "912px", top: "136px", width: "47px", height: "8px", overflow: "visible", fill: "none", stroke: "#F4B601", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-4" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#F4B601" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 0 4 L 41 4" markerEnd="url(#dc-arrow-head-filled-4)"></path>
            </svg>
            <svg role="img" aria-label="From GPIO26 to the green status LED" width="47" height="8" viewBox="0 0 47 8" preserveAspectRatio="none" style={{position: "absolute", left: "696px", top: "258px", width: "47px", height: "8px", overflow: "visible", fill: "none", stroke: "#C3B1FF", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-5" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#C3B1FF" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 0 4 L 41 4" markerEnd="url(#dc-arrow-head-filled-5)"></path>
            </svg>
            <svg role="img" aria-label="From GPIO27 to the red status LED" width="47" height="8" viewBox="0 0 47 8" preserveAspectRatio="none" style={{position: "absolute", left: "696px", top: "286px", width: "47px", height: "8px", overflow: "visible", fill: "none", stroke: "#C3B1FF", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-6" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#C3B1FF" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 0 4 L 41 4" markerEnd="url(#dc-arrow-head-filled-6)"></path>
            </svg>
            <svg role="img" aria-label="From the USB 5 volt supply into the ESP32 VIN pin" width="47" height="8" viewBox="0 0 47 8" preserveAspectRatio="none" style={{position: "absolute", left: "697px", top: "408px", width: "47px", height: "8px", overflow: "visible", fill: "none", stroke: "#FF7A72", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-7" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#FF7A72" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 47 4 L 6 4" markerEnd="url(#dc-arrow-head-filled-7)"></path>
            </svg>
            <div style={{position: "absolute", left: "24px", top: "96px", width: "216px", height: "88px", boxSizing: "border-box", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#19356B", border: "1px solid rgba(117,173,234,0.35)", borderRadius: "10px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"Laser receiver A"}
                </b>
                <br />
                {"Hallway side · 5 V + GND"}
              </span>
            </div>
            <div style={{position: "absolute", left: "24px", top: "232px", width: "216px", height: "88px", boxSizing: "border-box", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#19356B", border: "1px solid rgba(117,173,234,0.35)", borderRadius: "10px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"Laser receiver B"}
                </b>
                <br />
                {"Floor side · 5 V + GND"}
              </span>
            </div>
            <div style={{position: "absolute", left: "24px", top: "368px", width: "216px", height: "88px", boxSizing: "border-box", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#19356B", border: "1px solid rgba(117,173,234,0.35)", borderRadius: "10px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"Common ground"}
                </b>
                <br />
                {"Every module's GND"}
              </span>
            </div>
            <div style={{position: "absolute", left: "288px", top: "116px", width: "104px", height: "48px", boxSizing: "border-box", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#2F3755", border: "1px solid #F4B601", borderRadius: "8px", fontSize: "13px", lineHeight: "16px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"10k / 20k"}
                </b>
                <br />
                {"5 V to 3.3 V"}
              </span>
            </div>
            <div style={{position: "absolute", left: "288px", top: "252px", width: "104px", height: "48px", boxSizing: "border-box", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#2F3755", border: "1px solid #F4B601", borderRadius: "8px", fontSize: "13px", lineHeight: "16px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"10k / 20k"}
                </b>
                <br />
                {"5 V to 3.3 V"}
              </span>
            </div>
            <div style={{position: "absolute", left: "440px", top: "64px", width: "256px", height: "392px", boxSizing: "border-box", padding: "14px 10px 10px", display: "flex", alignItems: "flex-start", justifyContent: "center", textAlign: "center", background: "#1D4A6E", border: "2px solid #75ADEA", borderRadius: "12px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"ESP32 DevKitC"}
                </b>
                <br />
                {"WROOM-32E · Wi-Fi + BLE"}
              </span>
            </div>
            <div style={{position: "absolute", left: "744px", top: "96px", width: "168px", height: "88px", boxSizing: "border-box", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#19356B", border: "1px solid rgba(117,173,234,0.35)", borderRadius: "10px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"Laser driver"}
                </b>
                <br />
                {"2N2222 + 1 kΩ"}
              </span>
            </div>
            <div style={{position: "absolute", left: "960px", top: "96px", width: "168px", height: "88px", boxSizing: "border-box", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#19356B", border: "1px solid rgba(117,173,234,0.35)", borderRadius: "10px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"Lasers A + B"}
                </b>
                <br />
                {"650 nm, Class 2"}
              </span>
            </div>
            <div style={{position: "absolute", left: "744px", top: "232px", width: "168px", height: "88px", boxSizing: "border-box", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#19356B", border: "1px solid rgba(117,173,234,0.35)", borderRadius: "10px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"Status LEDs"}
                </b>
                <br />
                {"Green + red, 220 Ω each"}
              </span>
            </div>
            <div style={{position: "absolute", left: "744px", top: "368px", width: "168px", height: "88px", boxSizing: "border-box", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#19356B", border: "1px solid rgba(117,173,234,0.35)", borderRadius: "10px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"USB 5 V supply"}
                </b>
                <br />
                {"CSA-certified"}
              </span>
            </div>
            <div style={{position: "absolute", left: "452px", top: "132px", width: "72px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GPIO34"}
            </div>
            <div style={{position: "absolute", left: "452px", top: "268px", width: "72px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GPIO35"}
            </div>
            <div style={{position: "absolute", left: "452px", top: "404px", width: "72px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GND"}
            </div>
            <div style={{position: "absolute", left: "612px", top: "132px", width: "72px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GPIO25"}
            </div>
            <div style={{position: "absolute", left: "612px", top: "254px", width: "72px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GPIO26"}
            </div>
            <div style={{position: "absolute", left: "612px", top: "282px", width: "72px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GPIO27"}
            </div>
            <div style={{position: "absolute", left: "612px", top: "404px", width: "72px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"VIN 5V"}
            </div>
            <div style={{position: "absolute", left: "24px", top: "24px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"SCHEMA · GATE NODE WIRING"}
            </div>
          </div>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "14px", color: "#C9D6EE"}}>
          <span style={{display: "inline-flex", alignItems: "center", gap: "8px"}}>
            <span style={{width: "24px", height: "4px", borderRadius: "2px", background: "#3DDB96"}}></span>
            {"Beam A signal"}
          </span>
          <span style={{display: "inline-flex", alignItems: "center", gap: "8px"}}>
            <span style={{width: "24px", height: "4px", borderRadius: "2px", background: "#75ADEA"}}></span>
            {"Beam B signal"}
          </span>
          <span style={{display: "inline-flex", alignItems: "center", gap: "8px"}}>
            <span style={{width: "24px", height: "4px", borderRadius: "2px", background: "#F4B601"}}></span>
            {"Laser enable"}
          </span>
          <span style={{display: "inline-flex", alignItems: "center", gap: "8px"}}>
            <span style={{width: "24px", height: "4px", borderRadius: "2px", background: "#C3B1FF"}}></span>
            {"Status LEDs"}
          </span>
          <span style={{display: "inline-flex", alignItems: "center", gap: "8px"}}>
            <span style={{width: "24px", height: "4px", borderRadius: "2px", background: "#FF7A72"}}></span>
            {"5 V power"}
          </span>
          <span style={{display: "inline-flex", alignItems: "center", gap: "8px"}}>
            <span style={{width: "24px", height: "0", borderTop: "3px dashed #9FB3DA"}}></span>
            {"Ground"}
          </span>
        </div>
        <div tabIndex={0} style={{overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(117,173,234,0.22)"}}>
          <table style={{width: "100%", minWidth: "760px", borderCollapse: "collapse", fontSize: "15px", background: "#0A2150"}}>
            <caption style={{textAlign: "left", padding: "14px 16px 6px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"CONNECTION LIST · GATE NODE"}
            </caption>
            <thead>
              <tr style={{textAlign: "left", color: "#C9D6EE", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px"}}>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"FROM"}
                </th>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"TO"}
                </th>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"WHY"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Receiver A OUT"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"10 kΩ, then GPIO34 (20 kΩ from GPIO34 to GND)"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Drops 5 V to 3.3 V. GPIO34 is input-only, perfect for a sensor."}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Receiver B OUT"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"10 kΩ, then GPIO35 (20 kΩ to GND)"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Same divider for beam B."}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Receivers VCC"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"5 V rail (ESP32 VIN)"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"These receiver modules expect 5 V."}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"GPIO25"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1 kΩ to 2N2222 base"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Transistor switches both lasers' GND side (about 60 mA, too much for a pin)."}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Lasers A + B"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"5 V and 2N2222 collector, over the door header"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"3-wire cable (5 V, switched GND, spare) in the raceway."}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"GPIO26 / GPIO27"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"220 Ω, then green / red LED to GND"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Green: beams lined up. Red: fault or misaligned."}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"USB 5 V supply"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"ESP32 USB port (feeds VIN)"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Whole node draws well under 0.5 A; a 1 to 2 A adapter has headroom."}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section id="noise" style={{paddingTop: "80px", display: "flex", flexDirection: "column", gap: "24px"}}>
        <div style={{display: "flex", flexDirection: "column", gap: "12px", maxWidth: "48rem"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", letterSpacing: "0.14em", color: "#F4B601"}}>
            {"03 · THE DECIBEL READER"}
          </span>
          <h2 style={{margin: "0", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", lineHeight: "1.05"}}>
            {"It hears a level, never words."}
          </h2>
          <p style={{margin: "0", fontSize: "1.0625rem", lineHeight: "1.6", color: "#C9D6EE"}}>
            {"An INMP441 digital microphone talks to the ESP32 over I²S. The ESP32 turns each eighth of a second of sound into one loudness number, then overwrites the samples. Only the number leaves the board. Two per floor: one on the quiet side, one on the social side, mounted at about 2.2 m away from vents."}
          </p>
        </div>
        <div tabIndex={0} style={{overflowX: "auto", borderRadius: "18px", border: "1px solid rgba(117,173,234,0.22)", background: "#0A2150"}}>
          <div style={{position: "relative", width: "1056px", height: "400px"}}>
            <svg role="img" aria-label="From ESP32 3V3 into the microphone VDD" width="239" height="8" viewBox="0 0 239 8" preserveAspectRatio="none" style={{position: "absolute", left: "289px", top: "92px", width: "239px", height: "8px", overflow: "visible", fill: "none", stroke: "#FF7A72", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-8" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#FF7A72" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 239 4 L 6 4" markerEnd="url(#dc-arrow-head-filled-8)"></path>
            </svg>
            <svg role="img" aria-label="Microphone GND joined to ESP32 GND" width="240" height="8" viewBox="0 0 240 8" preserveAspectRatio="none" style={{position: "absolute", left: "288px", top: "132px", width: "240px", height: "8px", overflow: "visible", fill: "none", stroke: "#9FB3DA", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", strokeDasharray: "6 6"}}>
              <path d="M 0 4 L 240 4"></path>
            </svg>
            <svg role="img" aria-label="Microphone L/R pin tied to GND, which selects the left channel" width="240" height="8" viewBox="0 0 240 8" preserveAspectRatio="none" style={{position: "absolute", left: "288px", top: "172px", width: "240px", height: "8px", overflow: "visible", fill: "none", stroke: "#9FB3DA", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", strokeDasharray: "6 6"}}>
              <path d="M 0 4 L 240 4"></path>
            </svg>
            <svg role="img" aria-label="From ESP32 GPIO25 to the microphone WS pin, the word select clock" width="239" height="8" viewBox="0 0 239 8" preserveAspectRatio="none" style={{position: "absolute", left: "289px", top: "212px", width: "239px", height: "8px", overflow: "visible", fill: "none", stroke: "#F4B601", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-9" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#F4B601" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 239 4 L 6 4" markerEnd="url(#dc-arrow-head-filled-9)"></path>
            </svg>
            <svg role="img" aria-label="From ESP32 GPIO32 to the microphone SCK pin, the bit clock" width="239" height="8" viewBox="0 0 239 8" preserveAspectRatio="none" style={{position: "absolute", left: "289px", top: "252px", width: "239px", height: "8px", overflow: "visible", fill: "none", stroke: "#C3B1FF", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-10" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#C3B1FF" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 239 4 L 6 4" markerEnd="url(#dc-arrow-head-filled-10)"></path>
            </svg>
            <svg role="img" aria-label="From the microphone SD pin into ESP32 GPIO33, the audio samples" width="239" height="8" viewBox="0 0 239 8" preserveAspectRatio="none" style={{position: "absolute", left: "288px", top: "292px", width: "239px", height: "8px", overflow: "visible", fill: "none", stroke: "#3DDB96", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-11" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#3DDB96" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 0 4 L 233 4" markerEnd="url(#dc-arrow-head-filled-11)"></path>
            </svg>
            <svg role="img" aria-label="From the USB 5 volt supply into the noise node's VIN" width="47" height="8" viewBox="0 0 47 8" preserveAspectRatio="none" style={{position: "absolute", left: "793px", top: "192px", width: "47px", height: "8px", overflow: "visible", fill: "none", stroke: "#FF7A72", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round"}}>
              <defs>
                <marker id="dc-arrow-head-filled-12" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">
                  <path d="M0 0 L4 2 L0 4 Z" fill="#FF7A72" stroke="none" style={{stroke: "none", fill: "context-stroke"}}></path>
                </marker>
              </defs>
              <path d="M 47 4 L 6 4" markerEnd="url(#dc-arrow-head-filled-12)"></path>
            </svg>
            <div style={{position: "absolute", left: "24px", top: "64px", width: "264px", height: "264px", boxSizing: "border-box", padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "flex-start", textAlign: "left", background: "#19356B", border: "1px solid rgba(117,173,234,0.35)", borderRadius: "12px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"INMP441"}
                </b>
                <br />
                {"I²S MEMS mic"}
                <br />
                {"3.3 V only"}
              </span>
            </div>
            <div style={{position: "absolute", left: "528px", top: "64px", width: "264px", height: "264px", boxSizing: "border-box", padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", textAlign: "right", background: "#1D4A6E", border: "2px solid #75ADEA", borderRadius: "12px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"ESP32 DevKitC"}
                </b>
                <br />
                {"Noise node"}
              </span>
            </div>
            <div style={{position: "absolute", left: "840px", top: "156px", width: "168px", height: "80px", boxSizing: "border-box", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#19356B", border: "1px solid rgba(117,173,234,0.35)", borderRadius: "10px", fontSize: "14px", lineHeight: "20px", color: "#FFFFFF"}}>
              <span>
                <b>
                  {"USB 5 V supply"}
                </b>
                <br />
                {"into VIN"}
              </span>
            </div>
            <div style={{position: "absolute", left: "208px", top: "88px", width: "72px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"VDD"}
            </div>
            <div style={{position: "absolute", left: "208px", top: "128px", width: "72px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GND"}
            </div>
            <div style={{position: "absolute", left: "208px", top: "168px", width: "72px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"L/R"}
            </div>
            <div style={{position: "absolute", left: "208px", top: "208px", width: "72px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"WS"}
            </div>
            <div style={{position: "absolute", left: "208px", top: "248px", width: "72px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"SCK"}
            </div>
            <div style={{position: "absolute", left: "208px", top: "288px", width: "72px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"SD"}
            </div>
            <div style={{position: "absolute", left: "540px", top: "88px", width: "96px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"3V3"}
            </div>
            <div style={{position: "absolute", left: "540px", top: "128px", width: "96px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GND"}
            </div>
            <div style={{position: "absolute", left: "540px", top: "168px", width: "96px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GND"}
            </div>
            <div style={{position: "absolute", left: "540px", top: "208px", width: "96px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GPIO25"}
            </div>
            <div style={{position: "absolute", left: "540px", top: "248px", width: "96px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GPIO32"}
            </div>
            <div style={{position: "absolute", left: "540px", top: "288px", width: "96px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"GPIO33"}
            </div>
            <div style={{position: "absolute", left: "696px", top: "188px", width: "84px", textAlign: "right", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", color: "#FFFFFF"}}>
              {"VIN"}
            </div>
            <div style={{position: "absolute", left: "328px", top: "268px", width: "160px", textAlign: "center", fontSize: "13px", lineHeight: "16px", color: "#C9D6EE"}}>
              {"samples stay on-chip"}
            </div>
            <div style={{position: "absolute", left: "24px", top: "24px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "16px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"SCHEMA · NOISE NODE WIRING"}
            </div>
          </div>
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
          <h3 style={{margin: "0", fontSize: "1.375rem", fontWeight: "900"}}>
            {"How sound becomes one number"}
          </h3>
          <div style={{display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "10px"}}>
            <div style={{flex: "1 1 170px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
              <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
                {"1 · SAMPLE"}
              </span>
              <span style={{fontSize: "15px", lineHeight: "1.5"}}>
                {"16,000 samples a second over I²S into a small buffer."}
              </span>
            </div>
            <span aria-hidden="true" style={{alignSelf: "center", fontSize: "26px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <div style={{flex: "1 1 170px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
              <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
                {"2 · LOUDNESS"}
              </span>
              <span style={{fontSize: "15px", lineHeight: "1.5"}}>
                {"Every 125 ms: RMS of the block, then 20·log10 to dBFS."}
              </span>
            </div>
            <span aria-hidden="true" style={{alignSelf: "center", fontSize: "26px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <div style={{flex: "1 1 170px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
              <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
                {"3 · CALIBRATE"}
              </span>
              <span style={{fontSize: "15px", lineHeight: "1.5"}}>
                {"dB ≈ dBFS + 120 (the mic reads −26 dBFS at 94 dB), then fine-tuned against a sound meter."}
              </span>
            </div>
            <span aria-hidden="true" style={{alignSelf: "center", fontSize: "26px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <div style={{flex: "1 1 170px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
              <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
                {"4 · AVERAGE"}
              </span>
              <span style={{fontSize: "15px", lineHeight: "1.5"}}>
                {"60 s energy average (Leq) and peak. A door slam doesn't make a floor \"loud\"."}
              </span>
            </div>
            <span aria-hidden="true" style={{alignSelf: "center", fontSize: "26px", color: "#75ADEA"}}>
              {"›"}
            </span>
            <div style={{flex: "1 1 170px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
              <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#3DDB96"}}>
                {"5 · SEND + FORGET"}
              </span>
              <span style={{fontSize: "15px", lineHeight: "1.5"}}>
                {"Two numbers go out every 10 s. The audio buffer is overwritten."}
              </span>
            </div>
          </div>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "12px"}}>
          <div style={{flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "6px", padding: "18px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "14px"}}>
            <span style={{fontSize: "30px", fontWeight: "900", color: "#3DDB96"}}>
              {"under 45 dB"}
            </span>
            <span style={{fontSize: "15px", color: "#C9D6EE"}}>
              {"Library quiet. Labelled QUIET on the screens."}
            </span>
          </div>
          <div style={{flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "6px", padding: "18px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "14px"}}>
            <span style={{fontSize: "30px", fontWeight: "900", color: "#F4B601"}}>
              {"45 to 60 dB"}
            </span>
            <span style={{fontSize: "15px", color: "#C9D6EE"}}>
              {"Low chatter. Fine for group work."}
            </span>
          </div>
          <div style={{flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "6px", padding: "18px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "14px"}}>
            <span style={{fontSize: "30px", fontWeight: "900", color: "#FF7A72"}}>
              {"over 60 dB"}
            </span>
            <span style={{fontSize: "15px", color: "#C9D6EE"}}>
              {"Social. Not where you want to study."}
            </span>
          </div>
        </div>
      </section>
      <section id="network" style={{paddingTop: "80px", display: "flex", flexDirection: "column", gap: "24px"}}>
        <div style={{display: "flex", flexDirection: "column", gap: "12px", maxWidth: "48rem"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", letterSpacing: "0.14em", color: "#F4B601"}}>
            {"04 · CONNECTING IT ALL: WI-FI OR BLUETOOTH?"}
          </span>
          <h2 style={{margin: "0", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", lineHeight: "1.05"}}>
            {"Bluetooth on the floor, Wi-Fi to the cloud."}
          </h2>
          <p style={{margin: "0", fontSize: "1.0625rem", lineHeight: "1.6", color: "#C9D6EE"}}>
            {"The ESP32 has both radios, so we use each where it's best. Sensor nodes shout their numbers over Bluetooth Low Energy once a second. One hub per floor listens and forwards everything over Wi-Fi. That keeps just one LUMEN device per floor on TMU's network."}
          </p>
        </div>
        <div style={{padding: "24px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "14px"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
            {"SCHEMA · ONE FLOOR, REPEATED FOR FLOORS 2 TO 8"}
          </span>
          <div style={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px"}}>
            <div style={{flex: "2 1 300px", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", padding: "14px", border: "1px dashed rgba(117,173,234,0.45)", borderRadius: "14px"}}>
              <span style={{gridColumn: "1 / -1", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", fontWeight: "700", color: "#F4B601"}}>
                {"FLOOR 7"}
              </span>
              <span style={{padding: "10px 12px", borderRadius: "10px", background: "#19356B", fontSize: "14px", lineHeight: "1.4"}}>
                <b>
                  {"Gate"}
                </b>
                <br />
                {"elevator lobby"}
              </span>
              <span style={{padding: "10px 12px", borderRadius: "10px", background: "#19356B", fontSize: "14px", lineHeight: "1.4"}}>
                <b>
                  {"Gate"}
                </b>
                <br />
                {"stairwell door"}
              </span>
              <span style={{padding: "10px 12px", borderRadius: "10px", background: "#19356B", fontSize: "14px", lineHeight: "1.4"}}>
                <b>
                  {"Mic"}
                </b>
                <br />
                {"quiet side"}
              </span>
              <span style={{padding: "10px 12px", borderRadius: "10px", background: "#19356B", fontSize: "14px", lineHeight: "1.4"}}>
                <b>
                  {"Mic"}
                </b>
                <br />
                {"social side"}
              </span>
            </div>
            <div style={{flex: "1 1 120px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textAlign: "center"}}>
              <span aria-hidden="true" style={{fontSize: "30px", fontWeight: "900", color: "#75ADEA"}}>
                {"›››"}
              </span>
              <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#C9D6EE"}}>
                {"Bluetooth LE"}
                <br />
                {"adverts, 1 per s"}
              </span>
            </div>
            <div style={{flex: "1 1 160px", display: "flex", flexDirection: "column", gap: "6px", padding: "14px", borderRadius: "14px", background: "#1D4A6E", border: "2px solid #75ADEA"}}>
              <b style={{fontSize: "16px"}}>
                {"Floor hub"}
              </b>
              <span style={{fontSize: "14px", lineHeight: "1.4", color: "#DDE6F7"}}>
                {"ESP32 scans BLE, checks sequence numbers, batches"}
              </span>
            </div>
            <div style={{flex: "1 1 120px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textAlign: "center"}}>
              <span aria-hidden="true" style={{fontSize: "30px", fontWeight: "900", color: "#F4B601"}}>
                {"›››"}
              </span>
              <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#C9D6EE"}}>
                {"Wi-Fi"}
                <br />
                {"MQTT over TLS"}
              </span>
            </div>
            <div style={{flex: "1 1 160px", display: "flex", flexDirection: "column", gap: "6px", padding: "14px", borderRadius: "14px", background: "#19356B"}}>
              <b style={{fontSize: "16px"}}>
                {"Broker + backend"}
              </b>
              <span style={{fontSize: "14px", lineHeight: "1.4", color: "#DDE6F7"}}>
                {"Seats free, noise, health"}
              </span>
            </div>
          </div>
        </div>
        <div tabIndex={0} style={{overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(117,173,234,0.22)"}}>
          <table style={{width: "100%", minWidth: "820px", borderCollapse: "collapse", fontSize: "15px", background: "#0A2150"}}>
            <caption style={{textAlign: "left", padding: "14px 16px 6px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"THREE WAYS TO CONNECT THE NODES"}
            </caption>
            <thead>
              <tr style={{textAlign: "left", color: "#C9D6EE", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px"}}>
                <th scope="col" style={{padding: "10px 16px"}}><span className="sr-only">{"Compared"}</span></th>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"WI-FI, EVERY NODE"}
                </th>
                <th scope="col" style={{padding: "10px 16px", color: "#3DDB96"}}>
                  {"BLE TO A FLOOR HUB (PICK)"}
                </th>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"ESP-NOW TO A HUB"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <th scope="row" style={{padding: "10px 16px", textAlign: "left", fontWeight: "700"}}>
                  {"Devices on TMU Wi-Fi"}
                </th>
                <td style={{padding: "10px 16px"}}>
                  {"Every node (about 28)"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1 per floor (7)"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1 per floor (7)"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <th scope="row" style={{padding: "10px 16px", textAlign: "left", fontWeight: "700"}}>
                  {"Range"}
                </th>
                <td style={{padding: "10px 16px"}}>
                  {"Wherever campus Wi-Fi reaches"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"About 10 to 30 m indoors, one floor"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"Longer than BLE"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <th scope="row" style={{padding: "10px 16px", textAlign: "left", fontWeight: "700"}}>
                  {"Delay to the screens"}
                </th>
                <td style={{padding: "10px 16px"}}>
                  {"Under 1 s"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"About 1 to 2 s"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"Under 1 s"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <th scope="row" style={{padding: "10px 16px", textAlign: "left", fontWeight: "700"}}>
                  {"Catch"}
                </th>
                <td style={{padding: "10px 16px"}}>
                  {"IT has to approve every board"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"Hub shares one radio between Wi-Fi and BLE (fine at this data rate)"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"Must sit on the hub's Wi-Fi channel; Espressif-only"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <th scope="row" style={{padding: "10px 16px", textAlign: "left", fontWeight: "700"}}>
                  {"Use it for"}
                </th>
                <td style={{padding: "10px 16px"}}>
                  {"The class prototype, on a phone hotspot"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"The real SLC rollout"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"Backup if BLE range is too short"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "stretch"}}>
          <div style={{flex: "1 1 520px", minWidth: "0", display: "flex", flexDirection: "column", gap: "12px", padding: "20px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "18px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"SCHEMA · BLE ADVERT PAYLOAD (15 OF 31 BYTES)"}
            </span>
            <span style={{fontSize: "14px", fontWeight: "700"}}>
              {"Gate node"}
            </span>
            <div tabIndex={0} style={{display: "flex", gap: "4px", overflowX: "auto"}}>
              <span style={{flex: "2 0 64px", padding: "10px 6px", borderRadius: "8px", background: "#2F3755", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Company"}
                </b>
                <br />
                {"2 B"}
              </span>
              <span style={{flex: "2 0 64px", padding: "10px 6px", borderRadius: "8px", background: "#19356B", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Node"}
                </b>
                <br />
                {"2 B"}
              </span>
              <span style={{flex: "2 0 64px", padding: "10px 6px", borderRadius: "8px", background: "#19356B", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Seq"}
                </b>
                <br />
                {"2 B"}
              </span>
              <span style={{flex: "4 0 88px", padding: "10px 6px", borderRadius: "8px", background: "#1F5A47", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"In total"}
                </b>
                <br />
                {"4 B"}
              </span>
              <span style={{flex: "4 0 88px", padding: "10px 6px", borderRadius: "8px", background: "#23497A", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Out total"}
                </b>
                <br />
                {"4 B"}
              </span>
              <span style={{flex: "1 0 52px", padding: "10px 6px", borderRadius: "8px", background: "#4A3A12", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Flags"}
                </b>
                <br />
                {"1 B"}
              </span>
            </div>
            <span style={{fontSize: "14px", fontWeight: "700"}}>
              {"Noise node"}
            </span>
            <div tabIndex={0} style={{display: "flex", gap: "4px", overflowX: "auto"}}>
              <span style={{flex: "2 0 64px", padding: "10px 6px", borderRadius: "8px", background: "#2F3755", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Company"}
                </b>
                <br />
                {"2 B"}
              </span>
              <span style={{flex: "2 0 64px", padding: "10px 6px", borderRadius: "8px", background: "#19356B", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Node"}
                </b>
                <br />
                {"2 B"}
              </span>
              <span style={{flex: "2 0 64px", padding: "10px 6px", borderRadius: "8px", background: "#19356B", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Seq"}
                </b>
                <br />
                {"2 B"}
              </span>
              <span style={{flex: "2 0 64px", padding: "10px 6px", borderRadius: "8px", background: "#1F5A47", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Leq ×10"}
                </b>
                <br />
                {"2 B"}
              </span>
              <span style={{flex: "2 0 64px", padding: "10px 6px", borderRadius: "8px", background: "#23497A", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Peak ×10"}
                </b>
                <br />
                {"2 B"}
              </span>
              <span style={{flex: "1 0 52px", padding: "10px 6px", borderRadius: "8px", background: "#4A3A12", textAlign: "center", fontSize: "12px", lineHeight: "1.4"}}>
                <b>
                  {"Flags"}
                </b>
                <br />
                {"1 B"}
              </span>
            </div>
            <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"Company ID 0xFFFF is set aside for testing, which suits a prototype. Flags carry beam fault, doorway blocked and low-signal bits."}
            </span>
          </div>
          <div style={{flex: "1 1 320px", minWidth: "0", display: "flex", flexDirection: "column", gap: "10px", padding: "20px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "18px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"WHY RUNNING TOTALS"}
            </span>
            <span style={{fontSize: "15px", lineHeight: "1.55"}}>
              {"Adverts can be missed. If a node sent \"+1\" and the hub missed it, that person would be lost forever. Sending the running total means the next advert fixes it: the hub only needs the latest number."}
            </span>
            <span style={{fontSize: "15px", lineHeight: "1.55", color: "#C9D6EE"}}>
              {"The hub never looks for phones or other devices. It only listens for LUMEN's own node IDs."}
            </span>
          </div>
        </div>
      </section>
      <section id="pipeline" style={{paddingTop: "80px", display: "flex", flexDirection: "column", gap: "24px"}}>
        <div style={{display: "flex", flexDirection: "column", gap: "12px", maxWidth: "48rem"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", letterSpacing: "0.14em", color: "#F4B601"}}>
            {"05 · THE DATA PIPELINE"}
          </span>
          <h2 style={{margin: "0", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", lineHeight: "1.05"}}>
            {"From a beam break to the lobby screen in about 2 seconds."}
          </h2>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "8px"}}>
          <div style={{flex: "1 1 108px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
              {"1 · SENSE"}
            </span>
            <b style={{fontSize: "16px"}}>
              {"Beams + mics"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.45", color: "#C9D6EE"}}>
              {"Beam edges and sound samples"}
            </span>
          </div>
          <span aria-hidden="true" style={{alignSelf: "center", fontSize: "24px", color: "#75ADEA"}}>
            {"›"}
          </span>
          <div style={{flex: "1 1 108px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
              {"2 · DECIDE"}
            </span>
            <b style={{fontSize: "16px"}}>
              {"Node firmware"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.45", color: "#C9D6EE"}}>
              {"In/out state machine, dB math"}
            </span>
          </div>
          <span aria-hidden="true" style={{alignSelf: "center", fontSize: "24px", color: "#75ADEA"}}>
            {"›"}
          </span>
          <div style={{flex: "1 1 108px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
              {"3 · BROADCAST"}
            </span>
            <b style={{fontSize: "16px"}}>
              {"BLE adverts"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.45", color: "#C9D6EE"}}>
              {"Running totals, every second"}
            </span>
          </div>
          <span aria-hidden="true" style={{alignSelf: "center", fontSize: "24px", color: "#75ADEA"}}>
            {"›"}
          </span>
          <div style={{flex: "1 1 108px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
              {"4 · RELAY"}
            </span>
            <b style={{fontSize: "16px"}}>
              {"Floor hub"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.45", color: "#C9D6EE"}}>
              {"Publishes to MQTT over Wi-Fi"}
            </span>
          </div>
          <span aria-hidden="true" style={{alignSelf: "center", fontSize: "24px", color: "#75ADEA"}}>
            {"›"}
          </span>
          <div style={{flex: "1 1 108px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
              {"5 · COMPUTE"}
            </span>
            <b style={{fontSize: "16px"}}>
              {"Backend"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.45", color: "#C9D6EE"}}>
              {"Occupancy, seats free, floor noise"}
            </span>
          </div>
          <span aria-hidden="true" style={{alignSelf: "center", fontSize: "24px", color: "#75ADEA"}}>
            {"›"}
          </span>
          <div style={{flex: "1 1 108px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#122851", borderRadius: "14px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
              {"6 · STORE"}
            </span>
            <b style={{fontSize: "16px"}}>
              {"Database"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.45", color: "#C9D6EE"}}>
              {"One snapshot a minute"}
            </span>
          </div>
          <span aria-hidden="true" style={{alignSelf: "center", fontSize: "24px", color: "#75ADEA"}}>
            {"›"}
          </span>
          <div style={{flex: "1 1 108px", display: "flex", flexDirection: "column", gap: "6px", padding: "16px", background: "#1D4A6E", border: "2px solid #3DDB96", borderRadius: "14px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#3DDB96"}}>
              {"7 · SHOW"}
            </span>
            <b style={{fontSize: "16px"}}>
              {"API + live push"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.45", color: "#DDE6F7"}}>
              {"Site, lobby and floor screens"}
            </span>
          </div>
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
            {"DELAY BUDGET, WORST CASE ABOUT 2 S"}
          </span>
          <div style={{display: "flex", height: "40px", borderRadius: "10px", overflow: "hidden", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", fontWeight: "700", color: "#0B1B3A"}}>
            <span style={{flex: "1", display: "flex", alignItems: "center", justifyContent: "center", background: "#3DDB96"}}>
              {"sense"}
            </span>
            <span style={{flex: "10", display: "flex", alignItems: "center", justifyContent: "center", background: "#75ADEA"}}>
              {"wait for next advert, up to 1 s"}
            </span>
            <span style={{flex: "2", display: "flex", alignItems: "center", justifyContent: "center", background: "#C3B1FF"}}>
              {"hub"}
            </span>
            <span style={{flex: "3", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4B601"}}>
              {"broker + backend"}
            </span>
            <span style={{flex: "4", display: "flex", alignItems: "center", justifyContent: "center", background: "#FF9A92"}}>
              {"push to screens"}
            </span>
          </div>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "16px"}}>
          <div style={{flex: "1 1 340px", minWidth: "0", display: "flex", flexDirection: "column", gap: "8px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"MQTT · lumen/slc/f7/gate/elevator"}
            </span>
            <pre tabIndex={0} style={{margin: "0", padding: "16px", borderRadius: "14px", background: "#071A40", border: "1px solid rgba(117,173,234,0.18)", color: "#DDE6F7", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", lineHeight: "1.6", overflowX: "auto", whiteSpace: "pre", fontVariantLigatures: "none"}}>{"{\n  \"node\": \"f7-gate-elevator\",\n  \"seq\": 18342,\n  \"in_total\": 1240,\n  \"out_total\": 1202,\n  \"flags\": [],\n  \"rssi\": -61\n}"}</pre>
          </div>
          <div style={{flex: "1 1 340px", minWidth: "0", display: "flex", flexDirection: "column", gap: "8px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"MQTT · lumen/slc/f7/noise/quiet-side"}
            </span>
            <pre tabIndex={0} style={{margin: "0", padding: "16px", borderRadius: "14px", background: "#071A40", border: "1px solid rgba(117,173,234,0.18)", color: "#DDE6F7", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", lineHeight: "1.6", overflowX: "auto", whiteSpace: "pre", fontVariantLigatures: "none"}}>{"{\n  \"node\": \"f7-mic-quiet\",\n  \"seq\": 5521,\n  \"leq_db\": 42.3,\n  \"peak_db\": 55.1,\n  \"window_s\": 60\n}"}</pre>
          </div>
          <div style={{flex: "1 1 340px", minWidth: "0", display: "flex", flexDirection: "column", gap: "8px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"API · GET /api/floors/7"}
            </span>
            <pre tabIndex={0} style={{margin: "0", padding: "16px", borderRadius: "14px", background: "#071A40", border: "1px solid rgba(117,173,234,0.18)", color: "#DDE6F7", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", lineHeight: "1.6", overflowX: "auto", whiteSpace: "pre", fontVariantLigatures: "none"}}>{"{\n  \"floor\": 7,\n  \"vibe\": \"Quiet\",\n  \"capacity\": 60,\n  \"on_floor\": 38,\n  \"seats_free\": 22,\n  \"noise_db\": 42,\n  \"updated\": \"11:42:07\",\n  \"stale\": false\n}"}</pre>
          </div>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "12px"}}>
          <div style={{flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "6px", padding: "18px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "14px"}}>
            <b style={{fontSize: "16px"}}>
              {"Seats free"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"On floor = (all ins − all outs) across the floor's gates since the nightly reset. Seats free = capacity − on floor, never below 0."}
            </span>
          </div>
          <div style={{flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "6px", padding: "18px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "14px"}}>
            <b style={{fontSize: "16px"}}>
              {"Stale data is shown as stale"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"Hubs send a heartbeat every 30 s. After 2 minutes of silence the screens grey out that floor and say \"last updated 2 min ago\"."}
            </span>
          </div>
          <div style={{flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "6px", padding: "18px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "14px"}}>
            <b style={{fontSize: "16px"}}>
              {"Nightly reset"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"Counts zero out at the SLC's quietest hour, so small misses never pile up day after day."}
            </span>
          </div>
          <div style={{flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "6px", padding: "18px", background: "#0A2150", border: "1px solid rgba(117,173,234,0.22)", borderRadius: "14px"}}>
            <b style={{fontSize: "16px"}}>
              {"Screens are just browsers"}
            </b>
            <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"Lobby and floor screens are TVs with a Raspberry Pi running this site full-screen, so one update reaches every screen."}
            </span>
          </div>
        </div>
      </section>
      <section id="parts" style={{paddingTop: "80px", display: "flex", flexDirection: "column", gap: "24px"}}>
        <div style={{display: "flex", flexDirection: "column", gap: "12px", maxWidth: "48rem"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", letterSpacing: "0.14em", color: "#F4B601"}}>
            {"06 · PARTS + COST"}
          </span>
          <h2 style={{margin: "0", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", lineHeight: "1.05"}}>
            {"A working doorway for under $100."}
          </h2>
          <p style={{margin: "0", fontSize: "1.0625rem", lineHeight: "1.6", color: "#C9D6EE"}}>
            {"Rough prices in Canadian dollars from hobby electronics shops. Check current prices before ordering. Screens are not included."}
          </p>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "12px"}}>
          <div style={{flex: "1 1 240px", display: "flex", flexDirection: "column", gap: "6px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#C9D6EE"}}>
              {"PROTOTYPE · 1 DOORWAY + 1 MIC"}
            </span>
            <span style={{fontSize: "40px", fontWeight: "900", color: "#3DDB96"}}>
              {"≈ $90"}
            </span>
          </div>
          <div style={{flex: "1 1 240px", display: "flex", flexDirection: "column", gap: "6px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#C9D6EE"}}>
              {"ONE FLOOR · 2 GATES, 2 MICS, HUB"}
            </span>
            <span style={{fontSize: "40px", fontWeight: "900", color: "#F4B601"}}>
              {"≈ $200"}
            </span>
          </div>
          <div style={{flex: "1 1 240px", display: "flex", flexDirection: "column", gap: "6px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#C9D6EE"}}>
              {"WHOLE SLC · FLOORS 2 TO 8"}
            </span>
            <span style={{fontSize: "40px", fontWeight: "900", color: "#75ADEA"}}>
              {"≈ $1,400"}
            </span>
          </div>
        </div>
        <div tabIndex={0} style={{overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(117,173,234,0.22)"}}>
          <table style={{width: "100%", minWidth: "720px", borderCollapse: "collapse", fontSize: "15px", background: "#0A2150"}}>
            <caption style={{textAlign: "left", padding: "14px 16px 6px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"BILL OF MATERIALS · APPROX. CAD"}
            </caption>
            <thead>
              <tr style={{textAlign: "left", color: "#C9D6EE", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px"}}>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"PART"}
                </th>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"QTY"}
                </th>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"EACH"}
                </th>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"NOTE"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{background: "#122851"}}>
                <th scope="rowgroup" colSpan={4} style={{padding: "10px 16px", textAlign: "left", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
                  {"GATE NODE · ABOUT $54"}
                </th>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"ESP32 DevKitC (WROOM-32E)"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$14"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Wi-Fi + Bluetooth LE on one board"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"650 nm dot laser, Class 2 (under 1 mW)"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"2"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$3"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Skip the common 5 mW boards"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Digital laser receiver module (5 V)"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"2"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$3"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Inside a short black tube to block room light"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"2N2222, resistors (1k, 10k, 20k, 220), 2 LEDs"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1 set"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$3"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"From any starter kit"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"USB 5 V adapter + cable"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$12"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"CSA-certified"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"3D-printed enclosures + receiver tubes"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"2"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$2.50"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"PLA, from a campus printer"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Stick-on cable raceway + 3-wire cable"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$8"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Over the door header"}
                </td>
              </tr>
              <tr style={{background: "#122851"}}>
                <th scope="rowgroup" colSpan={4} style={{padding: "10px 16px", textAlign: "left", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
                  {"NOISE NODE · ABOUT $33"}
                </th>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"ESP32 DevKitC"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$14"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}></td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"INMP441 I²S microphone"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$4"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"3.3 V digital mic"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"USB 5 V adapter + cable, enclosure"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$15"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Vented case, mic port facing the room"}
                </td>
              </tr>
              <tr style={{background: "#122851"}}>
                <th scope="rowgroup" colSpan={4} style={{padding: "10px 16px", textAlign: "left", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", color: "#F4B601"}}>
                  {"FLOOR HUB · ABOUT $29"}
                </th>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"ESP32 DevKitC + USB adapter + case"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"1"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"$29"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Or let one gate node double as the hub"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section id="install" style={{paddingTop: "80px", display: "flex", flexDirection: "column", gap: "24px"}}>
        <div style={{display: "flex", flexDirection: "column", gap: "12px", maxWidth: "48rem"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", letterSpacing: "0.14em", color: "#F4B601"}}>
            {"07 · INSTALL + SAFETY"}
          </span>
          <h2 style={{margin: "0", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", lineHeight: "1.05"}}>
            {"Safe in a public building, easy to remove."}
          </h2>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "12px"}}>
          <div style={{flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "6px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <b style={{fontSize: "17px"}}>
              {"Eye-safe lasers only"}
            </b>
            <span style={{fontSize: "15px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"Class 2, under 1 mW, aimed level at 1.0 m and never toward eye height. If Facilities prefers, swap in infrared break-beam pairs: same wiring, same firmware."}
            </span>
          </div>
          <div style={{flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "6px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <b style={{fontSize: "17px"}}>
              {"Low voltage, certified plugs"}
            </b>
            <span style={{fontSize: "15px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"Everything runs on 5 V USB from CSA-certified adapters. No mains wiring by students."}
            </span>
          </div>
          <div style={{flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "6px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <b style={{fontSize: "17px"}}>
              {"Nothing on the floor"}
            </b>
            <span style={{fontSize: "15px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"Cables run up the door frame and over the header in stick-on raceway. Never across walkways, exits or emergency routes."}
            </span>
          </div>
          <div style={{flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "6px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <b style={{fontSize: "17px"}}>
              {"Privacy by design"}
            </b>
            <span style={{fontSize: "15px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"No cameras, no audio kept, no phone scanning, no accounts. A beam break can't tell who you are."}
            </span>
          </div>
          <div style={{flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "6px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <b style={{fontSize: "17px"}}>
              {"Approval first"}
            </b>
            <span style={{fontSize: "15px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"TMU Library and Facilities sign off before anything is mounted. We pilot one floor, then expand."}
            </span>
          </div>
          <div style={{flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "6px", padding: "20px", background: "#122851", borderRadius: "16px"}}>
            <b style={{fontSize: "17px"}}>
              {"Removable in minutes"}
            </b>
            <span style={{fontSize: "15px", lineHeight: "1.5", color: "#C9D6EE"}}>
              {"Enclosures mount with removable adhesive strips. No drilling, no marks left behind."}
            </span>
          </div>
        </div>
      </section>
      <section id="plan" style={{paddingTop: "80px", display: "flex", flexDirection: "column", gap: "24px"}}>
        <div style={{display: "flex", flexDirection: "column", gap: "12px", maxWidth: "48rem"}}>
          <span style={{fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "13px", letterSpacing: "0.14em", color: "#F4B601"}}>
            {"08 · BUILD + TEST PLAN"}
          </span>
          <h2 style={{margin: "0", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", lineHeight: "1.05"}}>
            {"Bench to doorway, then prove it."}
          </h2>
          <p style={{margin: "0", fontSize: "1.0625rem", lineHeight: "1.6", color: "#C9D6EE"}}>
            {"Ready to demo at the Nov. 25 and Dec. 2 final presentations."}
          </p>
        </div>
        <ol style={{margin: "0", padding: "0", listStyle: "none", display: "flex", flexWrap: "wrap", gap: "12px"}}>
          <li style={{flex: "1 1 340px", display: "flex", gap: "14px", padding: "18px", background: "#122851", borderRadius: "16px"}}>
            <span style={{flex: "none", width: "40px", height: "40px", borderRadius: "50%", background: "#F4B601", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
              {"1"}
            </span>
            <span style={{display: "flex", flexDirection: "column", gap: "4px"}}>
              <b style={{fontSize: "16px"}}>
                {"Breadboard the gate"}
              </b>
              <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
                {"Two lasers, two receivers, ESP32. Print IN and OUT to the serial monitor."}
              </span>
            </span>
          </li>
          <li style={{flex: "1 1 340px", display: "flex", gap: "14px", padding: "18px", background: "#122851", borderRadius: "16px"}}>
            <span style={{flex: "none", width: "40px", height: "40px", borderRadius: "50%", background: "#F4B601", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
              {"2"}
            </span>
            <span style={{display: "flex", flexDirection: "column", gap: "4px"}}>
              <b style={{fontSize: "16px"}}>
                {"Tune the firmware"}
              </b>
              <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
                {"50 walk-throughs each way, fast and slow, with bags. Adjust the 40 ms and 2 s filters."}
              </span>
            </span>
          </li>
          <li style={{flex: "1 1 340px", display: "flex", gap: "14px", padding: "18px", background: "#122851", borderRadius: "16px"}}>
            <span style={{flex: "none", width: "40px", height: "40px", borderRadius: "50%", background: "#F4B601", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
              {"3"}
            </span>
            <span style={{display: "flex", flexDirection: "column", gap: "4px"}}>
              <b style={{fontSize: "16px"}}>
                {"Build the noise node"}
              </b>
              <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
                {"Read the INMP441, calibrate against a sound meter at a few levels."}
              </span>
            </span>
          </li>
          <li style={{flex: "1 1 340px", display: "flex", gap: "14px", padding: "18px", background: "#122851", borderRadius: "16px"}}>
            <span style={{flex: "none", width: "40px", height: "40px", borderRadius: "50%", background: "#F4B601", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
              {"4"}
            </span>
            <span style={{display: "flex", flexDirection: "column", gap: "4px"}}>
              <b style={{fontSize: "16px"}}>
                {"Connect it"}
              </b>
              <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
                {"Nodes on a phone hotspot, Mosquitto broker on a laptop. No IT request needed for the demo."}
              </span>
            </span>
          </li>
          <li style={{flex: "1 1 340px", display: "flex", gap: "14px", padding: "18px", background: "#122851", borderRadius: "16px"}}>
            <span style={{flex: "none", width: "40px", height: "40px", borderRadius: "50%", background: "#F4B601", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
              {"5"}
            </span>
            <span style={{display: "flex", flexDirection: "column", gap: "4px"}}>
              <b style={{fontSize: "16px"}}>
                {"Go live on the site"}
              </b>
              <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
                {"Backend turns counts into seats free; this site and the lobby screen update on their own."}
              </span>
            </span>
          </li>
          <li style={{flex: "1 1 340px", display: "flex", gap: "14px", padding: "18px", background: "#122851", borderRadius: "16px"}}>
            <span style={{flex: "none", width: "40px", height: "40px", borderRadius: "50%", background: "#3DDB96", color: "#0B1B3A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900"}}>
              {"6"}
            </span>
            <span style={{display: "flex", flexDirection: "column", gap: "4px"}}>
              <b style={{fontSize: "16px"}}>
                {"Validate"}
              </b>
              <span style={{fontSize: "14px", lineHeight: "1.5", color: "#C9D6EE"}}>
                {"One hour at one doorway against a manual headcount (aim: within 5%), plus the 1-hour elevator sign test (target: 20% stop rate)."}
              </span>
            </span>
          </li>
        </ol>
        <div tabIndex={0} style={{overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(117,173,234,0.22)"}}>
          <table style={{width: "100%", minWidth: "720px", borderCollapse: "collapse", fontSize: "15px", background: "#0A2150"}}>
            <caption style={{textAlign: "left", padding: "14px 16px 6px", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#C9D6EE"}}>
              {"KNOWN LIMITS AND HOW WE HANDLE THEM"}
            </caption>
            <thead>
              <tr style={{textAlign: "left", color: "#C9D6EE", fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace", fontSize: "12px"}}>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"LIMIT"}
                </th>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"WHAT HAPPENS"}
                </th>
                <th scope="col" style={{padding: "10px 16px"}}>
                  {"FIX"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Two people side by side"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Counted as one"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"Gate on narrow doorways only; nightly reset; spot-check against headcounts"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Someone stops in the doorway"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Both beams blocked"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"Counts nothing until clear; flags after 10 s"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Bumped receiver or laser"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"One beam stays dark"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"Red LED, fault on the dashboard, that floor shown as stale"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Counts people, not seats or zones"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"Seats free is an estimate from capacity"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"Zone gates or seat sensors as a later phase"}
                </td>
              </tr>
              <tr style={{borderTop: "1px solid rgba(117,173,234,0.15)"}}>
                <td style={{padding: "10px 16px"}}>
                  {"Hub or Wi-Fi drops out"}
                </td>
                <td style={{padding: "10px 16px", color: "#C9D6EE"}}>
                  {"No updates from that floor"}
                </td>
                <td style={{padding: "10px 16px"}}>
                  {"Running totals catch up on reconnect; screens show \"last updated\""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
