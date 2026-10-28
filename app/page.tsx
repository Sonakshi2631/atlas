"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownUp, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, Copy, Download, ExternalLink, FileCode2, Fingerprint, Github, Globe2, Layers3, LockKeyhole, Menu, Moon, Plus, Search, ShieldAlert, ShieldCheck, Sparkles, Sun, WandSparkles, X } from "lucide-react";
import { generateGuide, guides } from "./data";
import type { Difficulty, OAuthGuide } from "./types";

const colors: Record<string, string> = { Slack: "#641f78", Notion: "#272727", "Google Workspace": "#e9efff", Salesforce: "#e8f5fb", GitHub: "#252933", HubSpot: "#fff0e8" };
const logos: Record<string, string> = { Slack: "S", Notion: "N", "Google Workspace": "G", Salesforce: "☁", GitHub: "⌘", HubSpot: "H" };
const investigationStages = ["Searching developer docs & OAuth provider specs", "Analyzing scopes, redirect URIs & grant types", "Evaluating review friction & enterprise gates", "Synthesizing agent vs. human workload"];
const workspaceChecklist = ["Register your production OAuth client", "Configure exact HTTPS redirect URIs", "Publish privacy policy and support contact", "Confirm each scope has a user-facing purpose", "Test consent, denial, refresh, and disconnect flows"];

function prettyTime(minutes: number) { return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}m` : ""}`; }
function difficultyClass(value: Difficulty) { return value === "Instant" || value === "Low" ? "good" : value === "Medium" ? "medium" : "high"; }
function initials(name: string) { return logos[name] ?? name.slice(0, 1).toUpperCase(); }

export default function Home() {
  const [active, setActive] = useState<OAuthGuide | null>(null);
  const [query, setQuery] = useState("");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [effort, setEffort] = useState("Any effort");
  const [sort, setSort] = useState("Recommended");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState("");
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [guideMode, setGuideMode] = useState(false);
  const [view, setView] = useState("overview");
  const [section, setSection] = useState("library");
  const [savedIds, setSavedIds] = useState<string[]>(["slack", "notion", "google-workspace"]);
  const [recentActivity, setRecentActivity] = useState<{ appName: string; openedAt: string }[]>([]);
  const [workspaceChecks, setWorkspaceChecks] = useState<Record<string, boolean>>({});
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [customGuides, setCustomGuides] = useState<OAuthGuide[]>([]);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Acme Agents");
  const [profileName, setProfileName] = useState("Sonakshi K.");

  const workspaces = ["Acme Agents", "Atlas Labs", "Northstar AI", "Personal Sandbox"];
  const profiles = [
    { name: "Sonakshi K.", role: "Workspace owner", initials: "SK" },
    { name: "Alex Morgan", role: "Integration admin", initials: "AM" },
    { name: "Maya Chen", role: "Developer", initials: "MC" },
    { name: "Jordan Lee", role: "Read-only reviewer", initials: "JL" },
  ];
  const currentProfile = profiles.find(profile => profile.name === profileName) ?? profiles[0];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selected = params.get("guide");
    if (selected) { const storedGuides = JSON.parse(localStorage.getItem("oauth-atlas-custom-guides") ?? "[]") as OAuthGuide[]; const guide = [...guides, ...storedGuides].find(g => g.id === selected); if (guide) { setActive(guide); setSection(guide.id.startsWith("live-") || guide.id.endsWith("-live") ? "investigator" : "library"); } }
    const saved = localStorage.getItem("oauth-atlas-checks");
    if (saved) setChecked(JSON.parse(saved));
    const savedGuides = localStorage.getItem("oauth-atlas-saved-guides");
    if (savedGuides) setSavedIds(JSON.parse(savedGuides));
    const activity = localStorage.getItem("oauth-atlas-activity");
    if (activity) setRecentActivity(JSON.parse(activity));
    const globalChecks = localStorage.getItem("oauth-atlas-workspace-checks");
    if (globalChecks) setWorkspaceChecks(JSON.parse(globalChecks));
    const custom = localStorage.getItem("oauth-atlas-custom-guides");
    if (custom) setCustomGuides(JSON.parse(custom));
    const savedTheme = localStorage.getItem("oauth-atlas-theme");
    if (savedTheme) setDark(savedTheme === "dark");
    const savedWorkspace = localStorage.getItem("oauth-atlas-workspace");
    if (savedWorkspace && workspaces.includes(savedWorkspace)) setWorkspaceName(savedWorkspace);
    const savedProfile = localStorage.getItem("oauth-atlas-profile");
    if (savedProfile && profiles.some(profile => profile.name === savedProfile)) setProfileName(savedProfile);
  }, []);
  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
  }, [dark]);
  useEffect(() => {
    const closeMenus = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest(".menu-anchor")) {
        setWorkspaceMenuOpen(false);
        setProfileMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setWorkspaceMenuOpen(false); setProfileMenuOpen(false); }
    };
    document.addEventListener("pointerdown", closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeMenus); document.removeEventListener("keydown", closeOnEscape); };
  }, []);
  useEffect(() => { localStorage.setItem("oauth-atlas-checks", JSON.stringify(checked)); }, [checked]);
  useEffect(() => { localStorage.setItem("oauth-atlas-saved-guides", JSON.stringify(savedIds)); }, [savedIds]);
  useEffect(() => { localStorage.setItem("oauth-atlas-activity", JSON.stringify(recentActivity.slice(0, 12))); }, [recentActivity]);
  useEffect(() => { localStorage.setItem("oauth-atlas-workspace-checks", JSON.stringify(workspaceChecks)); }, [workspaceChecks]);
  useEffect(() => { localStorage.setItem("oauth-atlas-custom-guides", JSON.stringify(customGuides)); }, [customGuides]);
  const allGuides = useMemo(() => [...guides, ...customGuides.filter(custom => !guides.some(guide => guide.id === custom.id))], [customGuides]);

  const filtered = useMemo(() => {
    const list = guides.filter(g => (category === "All categories" || g.category === category) && (effort === "Any effort" || g.difficulty === effort) && g.appName.toLowerCase().includes(libraryQuery.toLowerCase()));
    return sort === "Fastest setup" ? [...list].sort((a,b) => a.estimatedDevTimeMinutes - b.estimatedDevTimeMinutes) : sort === "Lowest friction" ? [...list].sort((a,b) => a.frictionScore - b.frictionScore) : list;
  }, [category, effort, libraryQuery, sort]);

  const copy = async (value: string, label: string) => { try { await navigator.clipboard.writeText(value); setCopied(label); setTimeout(() => setCopied(""), 2000); } catch { setCopied("Clipboard unavailable"); setTimeout(() => setCopied(""), 2000); } };
  const runInvestigation = async (event: React.FormEvent) => {
    event.preventDefault(); if (!query.trim() || loading) return;
    setLoading(true); setStage(0); setActive(null);
    for (let i=0;i<investigationStages.length;i++) { setStage(i); await new Promise(resolve => setTimeout(resolve, 820)); }
    const generated = generateGuide(query); setCustomGuides(items => [generated, ...items.filter(item => item.id !== generated.id)].slice(0, 20)); setActive(generated); setLoading(false); setStep(0); setGuideMode(true); setView("overview"); setSection("investigator");
    setRecentActivity(items => [{ appName: generated.appName, openedAt: new Date().toISOString() }, ...items].slice(0, 12));
    const url = new URL(window.location.href); url.searchParams.set("guide", generated.id); window.history.replaceState({}, "", url.toString());
  };
  const openGuide = (guide: OAuthGuide) => { setActive(guide); setSection("library"); setGuideMode(false); setStep(0); setView("overview"); setRecentActivity(items => [{ appName: guide.appName, openedAt: new Date().toISOString() }, ...items].slice(0, 12)); const url = new URL(window.location.href); url.searchParams.set("guide", guide.id); window.history.replaceState({}, "", url.toString()); };
  const closeGuide = () => { setActive(null); setGuideMode(false); const url = new URL(window.location.href); url.searchParams.delete("guide"); window.history.replaceState({}, "", url.toString()); };
  const navigate = (destination: string) => { setSection(destination); setMobileNavOpen(false); closeGuide(); if (destination === "investigator") window.setTimeout(() => { document.getElementById("app-query")?.focus(); document.getElementById("investigator")?.scrollIntoView({ behavior: "smooth" }); }, 0); else window.scrollTo({ top: 0, behavior: "smooth" }); };
  const toggleSaved = (id: string) => setSavedIds(ids => ids.includes(id) ? ids.filter(savedId => savedId !== id) : [...ids, id]);
  const exportGuide = (format: "md" | "json") => {
    if (!active) return;
    const body = format === "json" ? JSON.stringify(active, null, 2) : `# ${active.appName} OAuth readiness guide\n\n${active.summary}\n\n- **Friction:** ${active.frictionScore}/100\n- **Difficulty:** ${active.difficulty}\n- **Developer setup:** ${prettyTime(active.estimatedDevTimeMinutes)}\n- **Approval estimate:** ${active.estimatedApprovalDays} days\n\n## Scopes\n${active.scopes.map(s => `- \`${s}\``).join("\n")}\n\n## Steps\n${active.steps.map(s => `### ${s.stepNumber}. ${s.title}\n\n${s.description}\n\n${s.actionableTips.map(t => `- ${t}`).join("\n")}`).join("\n\n")}\n\n## Blockers\n${active.blockersAndNuances.map(b => `- ${b}`).join("\n")}\n\n## Human responsibilities\n${active.agentVsHumanMatrix.humanRequiredTasks.map(t => `- ${t}`).join("\n")}\n\n## Sources\n${active.verificationStatus.verifiedSources.map(s => `- ${s}`).join("\n")}`;
    const blob = new Blob([body], { type: format === "json" ? "application/json" : "text/markdown" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${active.id}-oauth-guide.${format}`; link.click(); URL.revokeObjectURL(link.href);
  };

  const toggleTheme = () => setDark(value => { const next = !value; localStorage.setItem("oauth-atlas-theme", next ? "dark" : "light"); return next; });
  const selectWorkspace = (name: string) => { setWorkspaceName(name); localStorage.setItem("oauth-atlas-workspace", name); setWorkspaceMenuOpen(false); };
  const selectProfile = (name: string) => { setProfileName(name); localStorage.setItem("oauth-atlas-profile", name); setProfileMenuOpen(false); };

  return <main className={dark ? "app dark" : "app"}>
    <aside className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Layers3 size={17}/></div><div><strong>atlas<span>.</span></strong></div><button className="icon-button mobile-menu" aria-label="Toggle menu" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(open => !open)}><Menu size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="menu-anchor"><button className="workspace-card" aria-haspopup="menu" aria-expanded={workspaceMenuOpen} onClick={() => { setWorkspaceMenuOpen(open => !open); setProfileMenuOpen(false); }}><div className="workspace-avatar">{workspaceName.slice(0, 1)}</div><span><b>{workspaceName}</b><small>Developer workspace</small></span><ChevronDown size={14}/></button>{workspaceMenuOpen && <div className="switcher-menu" role="menu" aria-label="Choose workspace">{workspaces.map(name => <button role="menuitem" className={name === workspaceName ? "selected" : ""} key={name} onClick={() => selectWorkspace(name)}><span className="switcher-avatar">{name.slice(0, 1)}</span><span><b>{name}</b><small>{name === "Personal Sandbox" ? "Personal workspace" : "Developer workspace"}</small></span>{name === workspaceName && <Check size={14}/>}</button>)}</div>}</div>
      <div className="nav-group"><div className="nav-label">BUILD</div>
        <button className={`nav-item ${section === "library" ? "active" : ""}`} aria-current={section === "library" ? "page" : undefined} onClick={() => navigate("library")}><Layers3 size={17}/> Integration library <span className="nav-count">{guides.length}</span></button>
        <button className={`nav-item ${section === "investigator" ? "active" : ""}`} aria-current={section === "investigator" ? "page" : undefined} onClick={() => navigate("investigator")}><Sparkles size={17}/> Live investigator <span className="live-dot"/></button>
        <button className={`nav-item ${section === "checklist" ? "active" : ""}`} aria-current={section === "checklist" ? "page" : undefined} onClick={() => navigate("checklist")}><CheckCircle2 size={17}/> Readiness checklist</button>
      </div>
      <div className="nav-group"><div className="nav-label">YOUR WORKSPACE</div>
        <button className={`nav-item ${section === "saved" ? "active" : ""}`} aria-current={section === "saved" ? "page" : undefined} onClick={() => navigate("saved")}><BookOpen size={17}/> Saved guides <span className="nav-count">{String(savedIds.length).padStart(2, "0")}</span></button>
        <button className={`nav-item ${section === "activity" ? "active" : ""}`} aria-current={section === "activity" ? "page" : undefined} onClick={() => navigate("activity")}><Activity size={17}/> Activity</button>
      </div>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><b>New to OAuth?</b><p>Get a clear path from first credential to production.</p><button onClick={() => navigate("library")}>Explore the library <ArrowRight size={14}/></button></div>
        <div className="profile menu-anchor"><button className="profile-select" aria-haspopup="menu" aria-expanded={profileMenuOpen} onClick={() => { setProfileMenuOpen(open => !open); setWorkspaceMenuOpen(false); }}><div className="profile-avatar">{currentProfile.initials}</div><span><b>{profileName}</b><small>{currentProfile.role}</small></span><ChevronDown size={14}/></button><button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${dark ? "light" : "dark"} mode`}>{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>{profileMenuOpen && <div className="switcher-menu profile-menu" role="menu" aria-label="Choose profile">{profiles.map(profile => <button role="menuitem" className={profile.name === profileName ? "selected" : ""} key={profile.name} onClick={() => selectProfile(profile.name)}><span className="switcher-avatar">{profile.initials}</span><span><b>{profile.name}</b><small>{profile.role}</small></span>{profile.name === profileName && <Check size={14}/>}</button>)}</div>}</div>
      </div>
    </aside>

    <section className="main-area">
      <header className="topbar"><div className="breadcrumbs"><button onClick={() => navigate("library")}>Workspace</button><ChevronRight size={14}/><b>{section === "library" ? "Integration library" : section === "investigator" ? "Live investigator" : section === "checklist" ? "Readiness checklist" : section === "saved" ? "Saved guides" : "Activity"}</b></div><div className="top-actions"><div className="status-indicator"><span/> All systems operational</div><button className="icon-button" aria-label="Help"><CircleHelp size={17}/></button><div className="profile-avatar top-avatar" aria-label={`${profileName} profile`}>{currentProfile.initials}</div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> DEVELOPER READINESS</div><h1>OAuth, without the guesswork.</h1><p className="subhead">Know what it takes to connect, get approved, and ship with confidence.</p></div><div className="heading-meta"><span className="avatar-stack"><i>G</i><i>S</i><i>N</i><i>+</i></span><span>Trusted by <b>2,400+</b> builders</span></div></div>

        {(section === "library" || section === "investigator") && <section className="investigator" id="investigator"><div className="investigator-bg"/><div className="investigator-copy"><div className="agent-kicker"><span className="sparkle-icon"><WandSparkles size={14}/></span> ATLAS AI INVESTIGATOR <span className="beta-pill">BETA</span></div><h2>Have an integration in mind?</h2><p>We’ll investigate the OAuth setup, surface approval blockers, and map out your next steps.</p><div className="agent-trust"><span><ShieldCheck size={14}/> Source-aware research</span><span><Clock3 size={14}/> Takes ~20 seconds</span></div></div>
          <form className="investigator-form" onSubmit={runInvestigation}><label htmlFor="app-query">APP NAME OR WEBSITE</label><div className="query-wrap"><Globe2 size={17}/><input id="app-query" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. Linear, figma.com, Zendesk"/><button aria-label="Investigate app" disabled={loading || !query.trim()}>{loading ? <span className="small-spinner"/> : <ArrowRight size={18}/>}</button></div><div className="query-foot"><span><LockKeyhole size={12}/> No credentials needed</span><span>Try: <button type="button" onClick={() => setQuery("Linear")}>Linear</button>, <button type="button" onClick={() => setQuery("Figma")}>Figma</button></span></div></form>
          {loading && <div className="investigation-progress"><div className="progress-heading"><span className="spinner"/> Investigating {query} <span>{stage+1} / 4</span></div>{investigationStages.map((s,i)=><div className={`progress-step ${i<stage?"done":i===stage?"current":""}`} key={s}>{i<stage?<Check size={13}/>:<span className="progress-bullet"/>}{s}{i===stage&&<span className="scan-bars"><i/><i/><i/></span>}</div>)}</div>}
        </section>}

        {section === "saved" ? <section className="workspace-page"><div className="eyebrow">YOUR WORKSPACE</div><h2>Saved guides <span className="count-pill">{savedIds.length}</span></h2><p className="workspace-page-intro">Keep the OAuth paths your team is actively working through close at hand.</p>{allGuides.filter(guide => savedIds.includes(guide.id)).length ? <div className="guide-grid">{allGuides.filter(guide => savedIds.includes(guide.id)).map(guide => <button className="guide-card" key={guide.id} onClick={() => openGuide(guide)}><div className="card-top"><div className="app-icon" style={{background:colors[guide.appName]??"#e9eaff",color:["Google Workspace","Salesforce"].includes(guide.appName)?"#4285f4":"white"}}>{initials(guide.appName)}</div><div className="card-app"><strong>{guide.appName}</strong><span>{guide.category}</span></div><ArrowUpRight className="card-arrow" size={17}/></div><p className="card-summary">{guide.summary}</p><div className="card-badges"><span className={`difficulty ${difficultyClass(guide.difficulty)}`}><i/>{guide.difficulty}</span><span className="friction-label">{guide.frictionScore} friction</span></div><div className="card-divider"/><div className="card-meta"><span><Clock3 size={13}/>{prettyTime(guide.estimatedDevTimeMinutes)} setup</span><span><ShieldCheck size={13}/>{guide.estimatedApprovalDays ? `${guide.estimatedApprovalDays}d review` : "No review"}</span></div></button>)}</div> : <div className="empty-state"><BookOpen size={22}/><h3>No saved guides yet</h3><p>Open a guide and choose “Save guide” to add it here.</p><button className="button-primary" onClick={() => navigate("library")}>Browse integrations <ArrowRight size={14}/></button></div>}</section>
        : section === "checklist" ? <section className="workspace-page"><div className="eyebrow">BUILD WITH FEWER SURPRISES</div><h2>Readiness checklist <span className="count-pill">{workspaceChecklist.filter((_, index) => workspaceChecks[`workspace-${index}`]).length}/{workspaceChecklist.length} complete</span></h2><p className="workspace-page-intro">A practical baseline for taking any OAuth integration from local testing to production.</p><div className="workspace-checklist">{workspaceChecklist.map((item,index) => <button className={`checklist-item ${workspaceChecks[`workspace-${index}`]?"checked":""}`} key={item} onClick={() => setWorkspaceChecks(current => ({...current,[`workspace-${index}`]:!current[`workspace-${index}`]}))}><span className="check-box">{workspaceChecks[`workspace-${index}`] && <Check size={14}/>}</span><span><b>{item}</b><small>{index === 3 ? "Use the narrowest scope set possible; document why each permission is needed." : "Track this requirement before submitting your integration for provider review."}</small></span><span className={`requirement-tag ${workspaceChecks[`workspace-${index}`]?"optional":"required"}`}>{workspaceChecks[`workspace-${index}`]?"DONE":"TO DO"}</span></button>)}</div><div className="checklist-risk"><ShieldCheck size={16}/><span><b>Review provider-specific gates too</b><small>Use each guide’s requirements checklist for domain verification, paid account, demo, and assessment requirements.</small></span></div></section>
        : section === "activity" ? <section className="workspace-page"><div className="eyebrow">YOUR WORKSPACE</div><h2>Recent activity</h2><p className="workspace-page-intro">Guides you’ve opened or generated in this browser.</p>{recentActivity.length ? <div className="activity-list">{recentActivity.map((item,index) => { const guide = [...allGuides].reverse().find(entry => entry.appName === item.appName); return <button className="activity-row" key={`${item.appName}-${item.openedAt}-${index}`} onClick={() => guide ? openGuide(guide) : (setQuery(item.appName), navigate("investigator"))}><span className="activity-symbol"><Activity size={15}/></span><span><b>{item.appName} OAuth guide</b><small>{new Date(item.openedAt).toLocaleString()}</small></span><ArrowRight size={14}/></button>; })}</div> : <div className="empty-state"><Activity size={22}/><h3>No activity yet</h3><p>Open a library guide or investigate an app to see it here.</p><button className="button-primary" onClick={() => navigate("library")}>Explore guides <ArrowRight size={14}/></button></div>}</section>
        : active ? <GuideDetail guide={active} mode={guideMode} isSaved={savedIds.includes(active.id)} toggleSaved={() => toggleSaved(active.id)} view={view} setView={setView} step={step} setStep={setStep} checked={checked} toggleCheck={id=>setChecked(v=>({...v,[id]:!v[id]}))} close={() => { closeGuide(); setSection("library"); }} copy={copy} copied={copied} exportGuide={exportGuide}/>
        : section === "investigator" ? <section className="workspace-page investigator-empty"><div className="empty-state"><div className="cta-orb"><Sparkles size={20}/></div><h3>Ready to investigate an integration?</h3><p>Enter an app name or website above. Atlas will map likely OAuth setup and review steps.</p><button className="button-primary" onClick={() => document.getElementById("app-query")?.focus()}>Enter an app <ArrowRight size={14}/></button></div></section>
        : <>
          <div className="section-heading" id="library"><div><div className="eyebrow">CURATED BY INTEGRATION EXPERTS</div><h2>Integration library <span className="count-pill">{filtered.length} guides</span></h2><p>Real-world OAuth paths, mapped from first setup through approval.</p></div><button className="button-secondary" onClick={() => document.getElementById("app-query")?.focus()}><Plus size={15}/> Generate a guide</button></div>
          <div className="filter-row"><div className="search-box"><Search size={16}/><input aria-label="Search integrations" value={libraryQuery} onChange={e=>setLibraryQuery(e.target.value)} placeholder="Search integrations..."/></div><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter by category"><option>All categories</option>{["Communication","Productivity","CRM","DevTools","Storage"].map(c=><option key={c}>{c}</option>)}</select><select value={effort} onChange={e=>setEffort(e.target.value)} aria-label="Filter by effort"><option>Any effort</option>{["Instant","Low","Medium","High","Enterprise Gated"].map(c=><option key={c}>{c}</option>)}</select><div className="sort-control"><ArrowDownUp size={14}/><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort guides"><option>Recommended</option><option>Fastest setup</option><option>Lowest friction</option></select></div></div>
          <div className="guide-grid">{filtered.map((guide,index)=><button className="guide-card" key={guide.id} onClick={()=>openGuide(guide)} style={{animationDelay:`${index*45}ms`}}><div className="card-top"><div className="app-icon" style={{background:colors[guide.appName]??"#e9eaff",color:["Google Workspace","Salesforce"].includes(guide.appName)?"#4285f4":"white"}}>{initials(guide.appName)}</div><div className="card-app"><strong>{guide.appName}</strong><span>{guide.category}</span></div><ArrowUpRight className="card-arrow" size={17}/></div><p className="card-summary">{guide.summary}</p><div className="card-badges"><span className={`difficulty ${difficultyClass(guide.difficulty)}`}><i/>{guide.difficulty}</span><span className="friction-label"><span className="friction-track"><i style={{width:`${guide.frictionScore}%`}}/></span>{guide.frictionScore} friction</span></div><div className="card-divider"/><div className="card-meta"><span><Clock3 size={13}/>{prettyTime(guide.estimatedDevTimeMinutes)} setup</span><span><ShieldCheck size={13}/>{guide.estimatedApprovalDays ? `${guide.estimatedApprovalDays}d review` : "No review"}</span></div></button>)}</div>
          <div className="library-footer"><span>Showing {filtered.length} of 24 integration guides</span><button onClick={() => setCategory("All categories")}>View all integrations <ArrowRight size={14}/></button></div>
          <section className="bottom-cta"><div className="cta-orb"><Fingerprint size={21}/></div><div><b>Every provider has its own fine print.</b><p>Atlas keeps the moving pieces in one place, so your team can focus on shipping.</p></div><button className="button-secondary" onClick={() => document.getElementById("app-query")?.focus()}>Investigate an app <ArrowRight size={15}/></button></section>
        </>}
        <footer className="footer"><span>© 2025 Atlas APM <span className="footer-dot">·</span> Built for teams who build with AI</span><div><button>Documentation</button><button>Feedback</button><button>Changelog <span className="new-dot"/></button></div></footer>
      </div>
    </section>
    {copied && <div className="toast"><CheckCircle2 size={17}/>{copied}</div>}
  </main>;
}

function GuideDetail({ guide, mode, isSaved, toggleSaved, view, setView, step, setStep, checked, toggleCheck, close, copy, copied, exportGuide }: { guide: OAuthGuide; mode: boolean; isSaved: boolean; toggleSaved:()=>void; view:string; setView:(v:string)=>void; step:number; setStep:(s:number)=>void; checked:Record<string,boolean>; toggleCheck:(id:string)=>void; close:()=>void; copy:(v:string,l:string)=>void; copied:string; exportGuide:(f:"md"|"json")=>void }) {
  const currentStep=guide.steps[step];
  return <div className="detail-view"><div className="detail-back"><button onClick={close}><ArrowLeft size={15}/> Back to integrations</button><div className="detail-actions"><button className="button-secondary small-button" onClick={toggleSaved}><BookOpen size={14}/>{isSaved?"Saved":"Save guide"}</button><button className="button-secondary small-button" onClick={()=>copy(window.location.href,"Share link copied")}><Copy size={14}/> Share guide</button><button className="button-secondary small-button export-button" onClick={()=>exportGuide("md")}><Download size={14}/> Export <ChevronDown size={13}/></button><div className="export-alt"><button onClick={()=>exportGuide("json")}><FileCode2 size={14}/> Export JSON</button></div></div></div>
    {mode&&<div className="generated-banner"><div><Sparkles size={16}/><b>Investigation complete</b><span>Generated guide for your app</span></div><span className="simulated-tag">SIMULATED RESEARCH</span></div>}
    <div className="detail-title-row"><div className="app-icon detail-logo" style={{background:colors[guide.appName]??"#e9eaff",color:["Google Workspace","Salesforce"].includes(guide.appName)?"#4285f4":"white"}}>{initials(guide.appName)}</div><div><div className="detail-eyebrow">OAUTH READINESS GUIDE <span className="detail-id">#{guide.id.toUpperCase()}</span></div><h2>{guide.appName} <a href={guide.websiteUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/></a></h2><p>{guide.summary}</p></div><span className={`difficulty detail-difficulty ${difficultyClass(guide.difficulty)}`}><i/>{guide.difficulty}</span></div>
    {mode&&<div className="verification-callout"><div className="callout-icon"><CircleHelp size={17}/></div><div><b>Unverified provider details</b><p>{guide.verificationStatus.unverifiedNotes}</p></div><span>REVIEW BEFORE SHIPPING</span></div>}
    <div className="metric-row"><div className="metric-card"><span>FRICTION SCORE <CircleHelp size={12}/></span><div className="score-number">{guide.frictionScore}<small>/100</small><div className="score-meter"><i style={{width:`${guide.frictionScore}%`}}/></div></div><small>{guide.frictionScore<30?"Low friction · self-serve":guide.frictionScore<60?"Moderate · some review": "High · plan ahead"}</small></div><div className="metric-card"><span>YOUR SETUP TIME</span><strong><Clock3 size={17}/>{prettyTime(guide.estimatedDevTimeMinutes)}</strong><small>Developer effort, end-to-end</small></div><div className="metric-card"><span>PROVIDER REVIEW</span><strong><ShieldCheck size={17}/>{guide.estimatedApprovalDays===0?"None expected":`~${guide.estimatedApprovalDays} days`}</strong><small>Can vary by scope &amp; region</small></div><div className="metric-card scope-metric"><span>STARTING SCOPES <CircleHelp size={12}/></span><div className="scope-chips">{guide.scopes.map(s=><code key={s}>{s}</code>)}</div><small>Request the minimum required</small></div></div>
    <div className="detail-tabs"><button className={view==="overview"?"selected":""} onClick={()=>setView("overview")}>Setup guide <span>04</span></button><button className={view==="checklist"?"selected":""} onClick={()=>setView("checklist")}>Readiness checklist</button><button className={view==="sources"?"selected":""} onClick={()=>setView("sources")}>Sources &amp; confidence</button></div>
    {view==="overview"&&<div className="detail-columns"><section className="setup-panel"><div className="panel-header"><div><div className="eyebrow">YOUR PATH TO PRODUCTION</div><h3>OAuth setup steps</h3></div><span className="step-counter">{String(step+1).padStart(2,"0")} <i>/</i> {String(guide.steps.length).padStart(2,"0")}</span></div><div className="stepper">{guide.steps.map((s,i)=><button key={s.stepNumber} className={`stepper-item ${i===step?"current":""} ${i<step?"complete":""}`} onClick={()=>setStep(i)}><span className="stepper-number">{i<step?<Check size={14}/>:String(s.stepNumber).padStart(2,"0")}</span><span>{s.title}</span>{s.isAgentHelpable&&<i className="ai-help" title="AI can help with this step"><Sparkles size={11}/></i>}</button>)}</div><div className="active-step"><div className="active-step-title"><div className="active-step-number">STEP {String(currentStep.stepNumber).padStart(2,"0")}</div><span className="step-assist"><Sparkles size={12}/> {currentStep.isAgentHelpable?"Agent can help":"Human required"}</span></div><h4>{currentStep.title}</h4><p>{currentStep.description}</p><div className="tips-label">ACTIONABLE TIPS</div>{currentStep.actionableTips.map((tip,i)=><div className="tip-row" key={tip}><span>{i+1}</span>{tip}</div>)}<div className="step-navigation"><button disabled={step===0} onClick={()=>setStep(step-1)}><ArrowLeft size={14}/> Previous</button><button className="button-primary" onClick={()=>step<guide.steps.length-1?setStep(step+1):setView("checklist")}>{step===guide.steps.length-1?"View checklist":"Next step"}<ArrowRight size={14}/></button></div></div></section>
      <aside className="guide-aside"><div className="responsibility-card"><div className="aside-title"><span className="responsibility-icon"><WandSparkles size={14}/></span><h3>Who does what</h3><span className="matrix-tag">AGENT + YOU</span></div><div className="work-column agent-work"><div className="work-heading"><span><Sparkles size={13}/> Agent can help</span><i>{guide.agentVsHumanMatrix.agentAutomatedTasks.length}</i></div>{guide.agentVsHumanMatrix.agentAutomatedTasks.map(t=><div className="work-item" key={t}><Check size={13}/>{t}</div>)}</div><div className="work-divider"/><div className="work-column human-work"><div className="work-heading"><span><Fingerprint size={13}/> You’ll need to</span><i>{guide.agentVsHumanMatrix.humanRequiredTasks.length}</i></div>{guide.agentVsHumanMatrix.humanRequiredTasks.map(t=><div className="work-item" key={t}><span className="human-bullet"/>{t}</div>)}</div></div>
      <div className="blocker-card"><div className="aside-title"><span className="blocker-icon"><ShieldAlert size={15}/></span><h3>Watch out for</h3></div>{guide.blockersAndNuances.slice(0,3).map((b,i)=><div className="blocker-item" key={b}><span>0{i+1}</span>{b}</div>)}<button className="text-button" onClick={()=>setView("checklist")}>View all risks <ArrowRight size={13}/></button></div>
      <div className="provider-link-card"><Globe2 size={15}/><div><span>PROVIDER DOCUMENTATION</span><a href={guide.websiteUrl} target="_blank" rel="noreferrer">Official developer docs <ArrowUpRight size={12}/></a></div></div></aside></div>}
    {view==="checklist"&&<div className="checklist-view"><div><div className="eyebrow">BEFORE YOU SUBMIT</div><h3>Readiness checklist</h3><p>Track the details that prevent avoidable review delays.</p></div>{Object.entries({domainVerificationRequired:"Verify your production domain",privacyPolicyRequired:"Publish a privacy policy and support contact",paidAccountRequired:"Confirm a paid developer account",videoDemoRequired:"Prepare an end-to-end product video",thirdPartyAuditRequired:"Budget for a third-party security assessment"}).map(([key,label])=>{const required=guide.requirementsChecklist[key as keyof OAuthGuide["requirementsChecklist"]];return <button className={`checklist-item ${checked[`${guide.id}-${key}`]?"checked":""}`} key={key} onClick={()=>toggleCheck(`${guide.id}-${key}`)}><span className="check-box">{checked[`${guide.id}-${key}`]&&<Check size={14}/>}</span><span><b>{label}</b><small>{required?"Required for this integration":"Not currently flagged as required"}</small></span><span className={`requirement-tag ${required?"required":"optional"}`}>{required?"REQUIRED":"OPTIONAL"}</span></button>})}<div className="checklist-risk"><ShieldAlert size={16}/><span><b>Potential blockers</b>{guide.blockersAndNuances.map(b=><small key={b}>• {b}</small>)}</span></div></div>}
    {view==="sources"&&<div className="sources-view"><div className="source-status"><div className={`source-status-icon ${guide.verificationStatus.testedByAgent?"verified":"unverified"}`}>{guide.verificationStatus.testedByAgent?<ShieldCheck size={20}/>:<CircleHelp size={20}/>}</div><div><div className="eyebrow">CONFIDENCE &amp; PROVENANCE</div><h3>{guide.verificationStatus.testedByAgent?"Sources included":"Provider-specific details need review"}</h3><p>{guide.verificationStatus.unverifiedNotes??"Source links are provided to help you validate current requirements before implementation."}</p></div></div><div className="verified-sources"><h4>Reference documentation</h4>{guide.verificationStatus.verifiedSources.length?guide.verificationStatus.verifiedSources.map((s,i)=><a key={s} href={s} target="_blank" rel="noreferrer"><span className="source-number">0{i+1}</span><span>{new URL(s).hostname}<small>{s}</small></span><ExternalLink size={14}/></a>):<div className="no-source">No provider sources were verified for this generated guide. Confirm the correct developer portal before using these steps.</div>}</div><div className="source-note"><CircleHelp size={15}/> Provider rules, pricing and review timelines can change. Confirm requirements directly before launch.</div></div>}
  </div>;
}
