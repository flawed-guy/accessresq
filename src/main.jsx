import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle, Ambulance, ArrowRight, CheckCircle2, ChevronRight,
  CircleAlert, Clock3, Compass, HeartPulse, House, LifeBuoy, MapPin,
  Menu, Navigation, RefreshCw, ShieldCheck, Siren, UserRound,
  Users, Accessibility, X, Zap
} from "lucide-react";
import "./styles.css";

const seedIncidents = [
  {
    id: "INC-1042",
    type: "Medical",
    description: "Student fainted near the Library entrance.",
    priority: "High",
    location: "Library",
    status: "reported",
    accessibility: "Accessibility",
    createdAt: Date.now() - 1000 * 60 * 8,
    responder: null
  }
];

const campus = {
  Library: { x: 100, y: 90, label: "Library" },
  "Block A": { x: 300, y: 80, label: "Block A" },
  "Block B": { x: 510, y: 100, label: "Block B" },
  "Student Center": { x: 120, y: 300, label: "Student Center" },
  "Block C": { x: 330, y: 290, label: "Block C" },
  "Hostel": { x: 540, y: 310, label: "Hostel" }
};

const paths = [
  { id: "p1", from: "Library", to: "Block A", distance: 90, accessible: false, stairs: true, ramp: false, elevator: false, blocked: false },
  { id: "p2", from: "Block A", to: "Block B", distance: 100, accessible: true, stairs: false, ramp: true, elevator: false, blocked: false },
  { id: "p3", from: "Library", to: "Student Center", distance: 120, accessible: true, stairs: false, ramp: true, elevator: false, blocked: false },
  { id: "p4", from: "Student Center", to: "Block C", distance: 100, accessible: true, stairs: false, ramp: true, elevator: false, blocked: false },
  { id: "p5", from: "Block C", to: "Block B", distance: 120, accessible: true, stairs: false, ramp: false, elevator: true, blocked: false },
  { id: "p6", from: "Block B", to: "Hostel", distance: 100, accessible: false, stairs: true, ramp: false, elevator: false, blocked: false },
  { id: "p7", from: "Block C", to: "Hostel", distance: 130, accessible: true, stairs: false, ramp: true, elevator: false, blocked: false },
  { id: "p8", from: "Block A", to: "Block C", distance: 150, accessible: true, stairs: false, ramp: true, elevator: false, blocked: false }
];

function loadIncidents() {
  try {
    const raw = localStorage.getItem("accessresq_incidents");
    return raw ? JSON.parse(raw) : seedIncidents;
  } catch { return seedIncidents; }
}
function saveIncidents(data) {
  localStorage.setItem("accessresq_incidents", JSON.stringify(data));
}
function classify(text, type) {
  const t = text.toLowerCase();
  let category = type || "Other";
  if (t.includes("bleed") || t.includes("faint") || t.includes("collapsed") || t.includes("injur") || t.includes("unconscious")) category = "Medical";
  if (t.includes("fire") || t.includes("smoke") || t.includes("burn")) category = "Fire";
  if (t.includes("crash") || t.includes("accident") || t.includes("vehicle")) category = "Accident";
  let priority = "Medium";
  if (category === "Fire" || /unconscious|heavy bleeding|can't breathe|cannot breathe/.test(t)) priority = "Critical";
  else if (category === "Medical" || category === "Accident") priority = "High";
  return { category, priority };
}

function findRoute(start, goal, accessibleOnly) {
  const nodes = Object.keys(campus);
  const dist = Object.fromEntries(nodes.map(n => [n, Infinity]));
  const prev = {};
  const unvisited = new Set(nodes);
  dist[start] = 0;

  while (unvisited.size) {
    let current = null;
    for (const n of unvisited) if (current === null || dist[n] < dist[current]) current = n;
    if (current === null || dist[current] === Infinity) break;
    unvisited.delete(current);
    if (current === goal) break;

    for (const p of paths.filter(p => !p.blocked && (p.from === current || p.to === current))) {
      if (accessibleOnly && !p.accessible) continue;
      const next = p.from === current ? p.to : p.from;
      const alt = dist[current] + p.distance;
      if (alt < dist[next]) {
        dist[next] = alt;
        prev[next] = current;
      }
    }
  }
  if (dist[goal] === Infinity) return null;
  const route = [];
  let cur = goal;
  while (cur) { route.unshift(cur); cur = prev[cur]; }
  return { nodes: route, distance: dist[goal] };
}

function timeAgo(ts) {
  const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} min ago`;
}

function App() {
  const [role, setRole] = useState("student");
  const [page, setPage] = useState("home");
  const [incidents, setIncidents] = useState(loadIncidents);
  const [selected, setSelected] = useState(null);
  const [route, setRoute] = useState(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => saveIncidents(incidents), [incidents]);

  const active = incidents.filter(i => !["resolved"].includes(i.status));
  const selectedIncident = incidents.find(i => i.id === selected) || active[0];

  const stats = useMemo(() => ({
    active: active.length,
    responders: 12,
    accessible: paths.filter(p => p.accessible).length,
    blocked: paths.filter(p => p.blocked).length
  }), [incidents]);

  function updateIncident(id, patch) {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }

  function createIncident(form) {
    const ai = classify(form.description, form.type);
    const incident = {
      id: `INC-${Math.floor(1000 + Math.random() * 8999)}`,
      type: ai.category,
      description: form.description,
      priority: ai.priority,
      location: form.location,
      accessibility: form.accessibility,
      status: "reported",
      createdAt: Date.now(),
      responder: null
    };
    setIncidents(prev => [incident, ...prev]);
    setSelected(incident.id);
    setPage("status");
  }

  function resetDemo() {
    localStorage.removeItem("accessresq_incidents");
    setIncidents(seedIncidents);
    setSelected(null);
    setRoute(null);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" onClick={() => setPage("home")}>
          <div className="brandIcon"><ShieldCheck size={22}/></div>
          <div><strong>AccessResQ</strong><span>Safe routes. Faster response.</span></div>
        </div>
        <nav className={menu ? "nav open" : "nav"}>
          <button className={page==="home" ? "navActive" : ""} onClick={() => {setPage("home");setMenu(false)}}>Home</button>
          <button className={page==="map" ? "navActive" : ""} onClick={() => {setPage("map");setMenu(false)}}>Campus Map</button>
          <button className={page==="status" ? "navActive" : ""} onClick={() => {setPage("status");setMenu(false)}}>My Emergency</button>
          <button className={page==="dashboard" ? "navActive" : ""} onClick={() => {setRole("responder");setPage("dashboard");setMenu(false)}}>Responder</button>
        </nav>
        <div className="roleSwitch">
          <button className={role==="student" ? "selectedRole":""} onClick={()=>setRole("student")}>Student</button>
          <button className={role==="responder" ? "selectedRole":""} onClick={()=>setRole("responder")}>Responder</button>
        </div>
        <button className="menuBtn" onClick={()=>setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
      </header>

      <main>
        {page === "home" && <Home onReport={()=>setPage("report")} onMap={()=>setPage("map")} stats={stats} active={active}/>}
        {page === "report" && <Report onBack={()=>setPage("home")} onSubmit={createIncident}/>}
        {page === "status" && <Status incident={selectedIncident} onBack={()=>setPage("home")} onMap={()=>setPage("map")} />}
        {page === "map" && <CampusMap incidents={active} route={route} onRoute={setRoute} />}
        {page === "dashboard" && <ResponderDashboard incidents={active} onSelect={(id)=>{setSelected(id);setPage("incident")}} onReset={resetDemo}/>}
        {page === "incident" && selectedIncident && <IncidentDetail incident={selectedIncident} route={route} setRoute={setRoute} updateIncident={updateIncident} onBack={()=>setPage("dashboard")}/>}
      </main>

      <footer>
        <span><ShieldCheck size={15}/> AccessResQ MVP • Demo mode</span>
        <span>For hackathon demonstration — not a substitute for emergency services.</span>
      </footer>
    </div>
  );
}

function Home({onReport,onMap,stats,active}) {
  return <div className="container">
    <section className="hero">
      <div className="heroCopy">
        <div className="eyebrow"><Zap size={15}/> OPEN INNOVATION • EMERGENCY + ACCESSIBILITY</div>
        <h1>The safest route<br/><span>isn't always the shortest.</span></h1>
        <p>AccessResQ connects emergency reporting with accessibility-aware campus navigation, helping responders reach people through routes that are actually usable.</p>
        <div className="heroBtns">
          <button className="primary big" onClick={onReport}><Siren/> Report Emergency <ArrowRight/></button>
          <button className="secondary big" onClick={onMap}><Compass/> Explore Campus</button>
        </div>
        <div className="trust"><CheckCircle2/> AI-assisted triage <CheckCircle2/> Accessible routing <CheckCircle2/> Live status</div>
      </div>
      <div className="heroCard">
        <div className="radar"><div className="radarPulse"></div><Siren size={38}/></div>
        <h3>Response snapshot</h3>
        <div className="miniRow"><span>Active emergencies</span><b>{stats.active}</b></div>
        <div className="miniRow"><span>Responders online</span><b>{stats.responders}</b></div>
        <div className="miniRow"><span>Accessible paths</span><b>{stats.accessible}</b></div>
        <div className="routePreview"><span>♿</span><div><small>SMART ROUTING</small><b>Fast + accessible</b></div><ChevronRight/></div>
      </div>
    </section>

    <section className="section">
      <div className="sectionHead"><div><span className="eyebrow">HOW IT WORKS</span><h2>One workflow. Two perspectives.</h2></div></div>
      <div className="steps">
        <Step n="01" icon={<Siren/>} title="Report" text="Describe what happened and select accessibility needs."/>
        <Step n="02" icon={<HeartPulse/>} title="Triage" text="AI classifies the incident and suggests a priority."/>
        <Step n="03" icon={<Navigation/>} title="Route" text="The routing engine avoids stairs and blocked paths."/>
        <Step n="04" icon={<CheckCircle2/>} title="Resolve" text="Responders update the incident until help arrives."/>
      </div>
    </section>

    <section className="dashboardPreview">
      <div><span className="eyebrow">LIVE DEMO</span><h2>Campus command center</h2><p>Try the responder dashboard with the seeded emergency, or create your own incident.</p></div>
      <div className="statGrid">
        <Stat icon={<CircleAlert/>} value={stats.active} label="Active"/>
        <Stat icon={<Users/>} value={stats.responders} label="Responders"/>
        <Stat icon={<Accessibility/>} value={stats.accessible} label="Accessible paths"/>
        <Stat icon={<AlertTriangle/>} value={stats.blocked} label="Blocked"/>
      </div>
      {active.length > 0 && <div className="incidentStrip"><span className="pulseDot"></span><div><b>{active[0].type} emergency at {active[0].location}</b><small>{active[0].description}</small></div><span className={`priority ${active[0].priority.toLowerCase()}`}>{active[0].priority}</span></div>}
    </section>
  </div>
}

function Step({n,icon,title,text}) {
  return <div className="step"><span className="stepNo">{n}</span><div className="stepIcon">{icon}</div><h3>{title}</h3><p>{text}</p></div>
}
function Stat({icon,value,label}) { return <div className="stat"><div className="statIcon">{icon}</div><b>{value}</b><span>{label}</span></div> }

function Report({onBack,onSubmit}) {
  const [type,setType] = useState("Medical");
  const [location,setLocation] = useState("Library");
  const [description,setDescription] = useState("");
  const [accessibility,setAccessibility] = useState("none");
  const [analyzing,setAnalyzing] = useState(false);
  function submit(e) {
    e.preventDefault();
    if (!description.trim()) return;
    setAnalyzing(true);
    setTimeout(()=>onSubmit({type,location,description,accessibility}), 650);
  }
  return <div className="container narrow">
    <button className="back" onClick={onBack}>← Back</button>
    <div className="formHeader"><span className="eyebrow">EMERGENCY REPORT</span><h1>Tell us what happened.</h1><p>The system will triage the report and choose an appropriate response priority.</p></div>
    <form className="formCard" onSubmit={submit}>
      <label>Emergency type</label>
      <div className="choiceGrid">{["Medical","Accident","Fire","Other"].map(x=><button type="button" key={x} className={type===x?"choice active": "choice"} onClick={()=>setType(x)}>{x==="Medical"?<HeartPulse/>:x==="Fire"?<AlertTriangle/>:<Siren/>}{x}</button>)}</div>
      <label>Where is it happening?</label>
      <select value={location} onChange={e=>setLocation(e.target.value)}>{Object.keys(campus).map(x=><option key={x}>{x}</option>)}</select>
      <label>What happened?</label>
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Example: A student slipped near the library and cannot stand."></textarea>
      <label>Accessibility requirement</label>
      <div className="accessBox">
        <button type="button" className={accessibility==="Accessibility"?"accessOption active": "accessOption"} onClick={()=>setAccessibility(accessibility==="Accessibility"?"none":"Accessibility")}><Accessibility/> Accessibility-friendly route</button>
        <span>Responders will avoid inaccessible paths when this is selected.</span>
      </div>
      <div className="aiNote"><Zap size={18}/><div><b>AI-assisted triage</b><span>We use the description to classify the emergency and estimate priority.</span></div></div>
      <button className="primary full" disabled={analyzing || !description.trim()}>{analyzing ? <><RefreshCw className="spin"/> Analyzing...</> : <><Siren/> Send Emergency Alert</>}</button>
    </form>
  </div>
}

function Status({incident,onBack,onMap}) {
  if (!incident) return <div className="container empty"><CircleAlert/><h2>No emergency selected</h2><button className="primary" onClick={onBack}>Back home</button></div>;
  const stages = ["reported","accepted","en_route","arrived","resolved"];
  const idx = stages.indexOf(incident.status);
  return <div className="container narrow">
    <button className="back" onClick={onBack}>← Home</button>
    <div className="statusTop"><div><span className="eyebrow">INCIDENT {incident.id}</span><h1>{incident.type} emergency</h1><p>{incident.description}</p></div><span className={`priority ${incident.priority.toLowerCase()}`}>{incident.priority}</span></div>
    <div className="statusCard">
      <div className="statusHeader"><span className="pulseDot"></span><b>{incident.status==="resolved"?"Incident resolved":"Response in progress"}</b><small>{timeAgo(incident.createdAt)}</small></div>
      <div className="timeline">{stages.map((s,i)=><div className={i<=idx?"timelineItem done":"timelineItem"} key={s}><div className="timelineDot">{i<=idx?<CheckCircle2 size={16}/>:<span>{i+1}</span>}</div><div><b>{s==="en_route"?"Responder en route":s[0].toUpperCase()+s.slice(1)}</b><small>{i===0?"Alert received":i===1?"Responder assigned":i===2?"Heading to location":i===3?"Responder arrived":"Help completed"}</small></div></div>)}</div>
      <div className="statusActions"><button className="secondary" onClick={onMap}><MapPin/> View campus map</button></div>
    </div>
    <div className="safetyNote"><ShieldCheck/><div><b>Demo safety note</b><p>For a real incident, contact your campus security/emergency service. AccessResQ is a hackathon prototype.</p></div></div>
  </div>
}

function CampusMap({incidents,route,onRoute}) {
  const [start,setStart] = useState("Library");
  const [goal,setGoal] = useState("Block C");
  const [accessible,setAccessible] = useState(true);
  const [blockedP2,setBlockedP2] = useState(false);
  const dynamicPaths = paths.map(p=>p.id==="p2"?{...p,blocked:blockedP2}:p);

  function calculate() {
    const original = paths.slice();
    paths.splice(0, paths.length, ...dynamicPaths);
    const r = findRoute(start,goal,accessible);
    paths.splice(0, paths.length, ...original);
    onRoute(r);
  }

  const routeSet = new Set(route?.nodes || []);
  return <div className="container">
    <div className="pageTitle"><div><span className="eyebrow">CAMPUS NAVIGATION</span><h1>Accessibility-aware routing</h1><p>Choose a start and destination. The engine avoids stairs and blocked paths when accessibility mode is on.</p></div><div className="liveBadge"><span className="pulseDot"></span> Demo map</div></div>
    <div className="mapLayout">
      <div className="mapPanel">
        <svg className="campusSvg" viewBox="0 0 640 390" role="img" aria-label="Simplified campus map">
          <rect x="0" y="0" width="640" height="390" rx="22" className="mapBg"/>
          {dynamicPaths.map(p=>{
            const a=campus[p.from],b=campus[p.to], isRoute=routeSet.has(p.from)&&routeSet.has(p.to);
            return <g key={p.id}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={isRoute?"pathLine route":p.blocked?"pathLine blocked":p.accessible?"pathLine accessible":"pathLine"}/><text x={(a.x+b.x)/2} y={(a.y+b.y)/2-8} className="pathLabel">{p.blocked?"BLOCKED":p.accessible?"♿": "STAIRS"}</text></g>
          })}
          {Object.entries(campus).map(([name,c])=><g key={name}><rect x={c.x-46} y={c.y-26} width="92" height="52" rx="12" className={routeSet.has(name)?"building selected":"building"}/><text x={c.x} y={c.y+4} textAnchor="middle" className="buildingText">{name}</text></g>)}
          {incidents.map(i=>{const c=campus[i.location]||campus.Library; return <g key={i.id}><circle cx={c.x} cy={c.y-43} r="12" className="emergencyMarker"/><text x={c.x} y={c.y-39} textAnchor="middle" className="markerText">!</text></g>})}
        </svg>
        <div className="legend"><span><i className="dot accessible"></i> Accessible</span><span><i className="dot route"></i> Selected route</span><span><i className="dot blocked"></i> Blocked</span><span>⚠ Emergency</span></div>
      </div>
      <div className="routeCard">
        <span className="eyebrow">ROUTE ENGINE</span>
        <h2>Find a safer path</h2>
        <label>From</label><select value={start} onChange={e=>setStart(e.target.value)}>{Object.keys(campus).map(x=><option key={x}>{x}</option>)}</select>
        <label>To</label><select value={goal} onChange={e=>setGoal(e.target.value)}>{Object.keys(campus).map(x=><option key={x}>{x}</option>)}</select>
        <button className={accessible?"toggle on":"toggle"} onClick={()=>setAccessible(!accessible)}><span className="toggleKnob"></span><Accessibility size={17}/> Accessibility mode</button>
        <button className={blockedP2?"toggle on danger":"toggle"} onClick={()=>setBlockedP2(!blockedP2)}><span className="toggleKnob"></span><AlertTriangle size={17}/> Simulate blocked ramp</button>
        <button className="primary full" onClick={calculate}><Navigation/> Calculate route</button>
        {route && <div className="routeResult"><div className="routeResultTop"><b>{route.distance} m</b><span>{accessible?"♿ Accessible":"Shortest available"}</span></div><div className="routeNodes">{route.nodes.map((n,i)=><React.Fragment key={n}><span>{n}</span>{i<route.nodes.length-1&&<ArrowRight size={14}/>}</React.Fragment>)}</div></div>}
      </div>
    </div>
  </div>
}

function ResponderDashboard({incidents,onSelect,onReset}) {
  return <div className="container">
    <div className="pageTitle"><div><span className="eyebrow">RESPONDER MODE</span><h1>Command center</h1><p>Monitor active incidents and send responders using the safest usable route.</p></div><button className="secondary" onClick={onReset}><RefreshCw/> Reset demo</button></div>
    <div className="dashboardGrid">
      <div className="mainDash">
        <div className="dashHead"><b>Active emergencies</b><span>{incidents.length} active</span></div>
        {incidents.length===0?<div className="emptySmall"><CheckCircle2/><h3>All clear</h3><p>No active emergencies.</p></div>:incidents.map(i=><IncidentCard key={i.id} incident={i} onClick={()=>onSelect(i.id)}/>)}
      </div>
      <div className="sideDash">
        <div className="sideCard"><span className="eyebrow">SYSTEM STATUS</span><div className="health"><span></span> All systems operational</div><div className="sideStat"><b>12</b><span>Responders online</span></div><div className="sideStat"><b>8</b><span>First-aid kits tracked</span></div><div className="sideStat"><b>4</b><span>Accessible route zones</span></div></div>
        <div className="sideCard idea"><Zap/><b>Demo tip</b><p>Open an incident, accept it, then move it through the response stages.</p></div>
      </div>
    </div>
  </div>
}

function IncidentCard({incident,onClick}) {
  return <button className="incidentCard" onClick={onClick}><div className="incidentIcon">{incident.type==="Medical"?<HeartPulse/>:incident.type==="Fire"?<AlertTriangle/>:<Siren/>}</div><div className="incidentMain"><div className="incidentTitle"><b>{incident.type} emergency</b><span className={`priority ${incident.priority.toLowerCase()}`}>{incident.priority}</span></div><p>{incident.description}</p><div className="incidentMeta"><span><MapPin size={14}/> {incident.location}</span>{incident.accessibility==="Accessibility"&&<span><Accessibility size={14}/> Accessible route</span>}<span><Clock3 size={14}/> {timeAgo(incident.createdAt)}</span></div></div><ChevronRight/></button>
}

function IncidentDetail({incident,route,setRoute,updateIncident,onBack}) {
  const [accessible,setAccessible]=useState(incident.accessibility==="Accessibility");
  const [blocked,setBlocked]=useState(false);
  const next = {reported:"accepted",accepted:"en_route",en_route:"arrived",arrived:"resolved"}[incident.status];
  const label = {reported:"Accept emergency",accepted:"Start travel",en_route:"Mark arrived",arrived:"Resolve incident"}[incident.status];

  function calc() {
    const original=paths.slice();
    paths.splice(0,paths.length,...paths.map(p=>p.id==="p2"?{...p,blocked}:p));
    const r=findRoute("Student Center",incident.location,accessible);
    paths.splice(0,paths.length,...original);
    setRoute(r);
  }

  return <div className="container">
    <button className="back" onClick={onBack}>← Back to dashboard</button>
    <div className="detailGrid">
      <div className="detailMain">
        <div className="detailHeader"><div><span className="eyebrow">{incident.id}</span><h1>{incident.type} emergency</h1><p>{incident.description}</p></div><span className={`priority ${incident.priority.toLowerCase()}`}>{incident.priority}</span></div>
        <div className="infoGrid"><div><small>LOCATION</small><b><MapPin/> {incident.location}</b></div><div><small>ACCESS NEED</small><b>{incident.accessibility==="Accessibility"?<><Accessibility/> Accessibility route</>:"Standard route"}</b></div><div><small>STATUS</small><b>{incident.status.replace("_"," ")}</b></div></div>
        <div className="routeWork">
          <div className="sectionHead"><div><span className="eyebrow">SMART ROUTING</span><h2>Choose the safest route</h2></div></div>
          <div className="routeControls"><button className={accessible?"toggle on":"toggle"} onClick={()=>setAccessible(!accessible)}><span className="toggleKnob"></span><Accessibility/> Accessible only</button><button className={blocked?"toggle on danger":"toggle"} onClick={()=>setBlocked(!blocked)}><span className="toggleKnob"></span><AlertTriangle/> Ramp blocked</button><button className="secondary" onClick={calc}><Navigation/> Calculate</button></div>
          {route?<div className="routeResult large"><div className="routeResultTop"><div><small>RECOMMENDED</small><b>{route.distance} m</b></div><span>♿ {accessible?"Accessible route":"Best available route"}</span></div><div className="routeNodes">{route.nodes.map((n,i)=><React.Fragment key={n}><span>{n}</span>{i<route.nodes.length-1&&<ArrowRight size={14}/>}</React.Fragment>)}</div></div>:<div className="routeEmpty"><Navigation/><p>Calculate a route from the responder staging area to the emergency location.</p></div>}
        </div>
        <div className="actionBar"><button className="primary full" disabled={incident.status==="resolved"} onClick={()=>next&&updateIncident(incident.id,{status:next,responder:"Responder 01"})}>{incident.status==="resolved"?<><CheckCircle2/> Resolved</>:<><CheckCircle2/> {label}</>}</button></div>
      </div>
      <div className="detailSide"><div className="safetyNote"><ShieldCheck/><div><b>Responder guidance</b><p>Follow campus emergency procedures and contact professional emergency services when appropriate.</p></div></div><div className="sideCard"><span className="eyebrow">RESPONSE FLOW</span>{["reported","accepted","en_route","arrived","resolved"].map(s=><div className={incident.status===s?"flow current":"flow"} key={s}><span>{["reported","accepted","en_route","arrived","resolved"].indexOf(s)+1}</span>{s.replace("_"," ")}</div>)}</div></div>
    </div>
  </div>
}

createRoot(document.getElementById("root")).render(<App />);