import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Code2,
  Globe2,
  Layers3,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Send,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import './App.css';

type Item = {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  tech?: string;
  status?: string;
  visible?: boolean;
  sort_order?: number;
  question?: string;
  answer?: string;
  value?: number;
  label?: string;
  promise?: string;
};

type SiteData = {
  services: Item[];
  industries: Item[];
  faqs: Item[];
  counters: Item[];
  testimonials: Item[];
  projects: Item[];
  knowledge: Item[];
};

type SiteState = {
  data: SiteData | null;
  demoMode: boolean;
  error: string;
  loading: boolean;
  reload: () => void;
};

type ContactRecord = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  lead_status?: string;
};

type Enquiry = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  industry: string;
  details: string;
  honeypot: string;
};

const icons = [Globe2, Layers3, Code2, ShieldCheck];
const nav = [
  ['Services', '/services'],
  ['Industries', '/industries'],
  ['Projects', '/projects'],
  ['About', '/about'],
  ['Contact', '/contact'],
  ['Admin', '/admin'],
];
const contactDetails = { phone: '', whatsapp: '', email: '', address: '' };
const siteContext = createContext<SiteState | null>(null);

const demoData: SiteData = {
  services: [
    { id: 1, title: 'Websites & e-commerce', promise: 'Clear, responsive experiences for your customers.' },
    { id: 2, title: 'Web & mobile apps', promise: 'Useful digital products built around real workflows.' },
    { id: 3, title: 'Business systems', promise: 'Connected tools that help teams work more smoothly.' },
    { id: 4, title: 'Digital strategy', promise: 'A practical roadmap for your next stage of growth.' },
  ],
  industries: [
    { id: 1, name: 'Retail & commerce', description: 'Digital storefronts and tools for modern commerce.' },
    { id: 2, name: 'Professional services', description: 'Better ways to connect with clients and deliver work.' },
    { id: 3, name: 'Education', description: 'Accessible experiences for learners and teams.' },
    { id: 4, name: 'Community organizations', description: 'Digital tools for programs, members, and partners.' },
  ],
  faqs: [
    { id: 1, question: 'What does ZILENIX Technologies build?', answer: 'We design and build websites, web and mobile applications, business systems, and related digital services.' },
    { id: 2, question: 'How does a project get started?', answer: 'We begin with a conversation about your goals, users, and constraints, then agree on a clear next step.' },
    { id: 3, question: 'Can I get a price online?', answer: 'Every project is different. We discuss your needs first and prepare a tailored proposal.' },
  ],
  counters: [],
  testimonials: [],
  projects: [
    { id: 101, title: 'Sample commerce concept', category: 'E-commerce', description: 'A sample project card for previewing the portfolio layout.', tech: 'Web design · Commerce' },
    { id: 102, title: 'Sample service portal', category: 'Web application', description: 'A sample project card for previewing project details and filters.', tech: 'Web app · Workflow' },
    { id: 103, title: 'Sample organization site', category: 'Website', description: 'A sample project card for previewing responsive case studies.', tech: 'Website · Content' },
  ],
  knowledge: [],
};

function useSite(): SiteState {
  const value = useContext(siteContext);
  if (!value) throw new Error('Site content must be used inside SiteProvider.');
  return value;
}

function isSiteData(value: unknown): value is SiteData {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return ['services', 'industries', 'faqs', 'counters', 'testimonials', 'projects', 'knowledge']
    .every((key) => Array.isArray(record[key]));
}

function SiteProvider({ children }: { children: ReactNode }) {
  const localPreview = import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_URL;
  const [data, setData] = useState<SiteData | null>(localPreview ? demoData : null);
  const [demoMode, setDemoMode] = useState(localPreview);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!localPreview);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (localPreview) return undefined;
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/site-content');
        if (!response.ok) throw new Error(`Content request failed (${response.status}).`);
        const result: unknown = await response.json();
        if (!isSiteData(result)) throw new Error('The content service returned an unexpected response.');
        if (!active) return;
        setData(result);
        setDemoMode(false);
      } catch (cause) {
        if (!active) return;
        if (import.meta.env.DEV) {
          console.warn('Using local preview content because the site content API is unavailable.', cause);
          setData(demoData);
          setDemoMode(true);
        } else {
          console.error('Unable to load site content.', cause);
          setData(null);
          setError('We could not load site content right now. Please try again later.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [localPreview, refreshKey]);

  return (
    <siteContext.Provider value={{ data, demoMode, error, loading, reload }}>
      {children}
    </siteContext.Provider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('zilenix-theme') !== 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('zilenix-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header>
        <Link className="brand" to="/" aria-label="ZILENIX Technologies home">
          <img className="brand-mark" src="/zilenix-mark.webp" alt="ZILENIX Technologies — Real Systems for Real Growth" />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(([label, path]) => (
            <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => setDark(!dark)}
            aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
          >
            {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <Link className="btn primary compact" to="/contact">Start Your Project <ArrowRight /></Link>
          <button
            className="menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
            {nav.map(([label, path]) => (
              <NavLink onClick={() => setMenuOpen(false)} key={path} to={path} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>
            ))}
            <Link onClick={() => setMenuOpen(false)} to="/contact">Start Your Project</Link>
          </nav>
        )}
      </header>
      {children}
      <Footer />
      <Zilenix />
    </>
  );
}

function Hero() {
  return (
    <section className="hero" id="main-content">
      <div className="hero-copy">
        <p className="hero-badge tagline">YOUR DIGITAL PRODUCT TEAM IN KAMPALA</p>
        <h1>Good ideas deserve <i>great software.</i></h1>
        <p className="lead">
          We design and build websites, apps and business systems that help ambitious teams
          serve customers better and move their business forward.
        </p>
        <div className="actions">
          <Link className="btn primary" to="/contact">Tell us what you’re building <ArrowRight /></Link>
          <Link className="btn glass" to="/projects">Explore our work</Link>
        </div>
        <div className="hero-proof">
          <span className="proof-line" />
          <p>One thoughtful team, from first conversation to launch and beyond.</p>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="visual-orbit orbit-one" aria-hidden="true" />
        <div className="visual-orbit orbit-two" aria-hidden="true" />
        <div className="build-window">
          <div className="window-topbar">
            <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
            <span>zilenix / project-studio</span>
            <span className="window-status"><i /> In progress</span>
          </div>
          <div className="window-body">
            <div className="window-sidebar" aria-hidden="true"><b>Z</b><i /><i /><i /><i /></div>
            <div className="project-board">
              <div className="board-heading"><span>MONDAY, 24 NOVEMBER</span><b>Good morning, team <span>✳</span></b><small>A clear plan makes good work possible.</small></div>
              <div className="board-card board-main"><div className="board-main-copy"><small>YOUR NEXT BIG THING</small><b>Made for the way<br />you work.</b><span>Thoughtful tools. Real momentum.</span><i>Explore the platform <ArrowRight aria-hidden="true" /></i></div><div className="board-art" aria-hidden="true"><span /><span /><span /></div></div>
              <div className="board-row"><div className="board-card board-step"><small>01 / DISCOVER</small><b>Start with people</b><span>Understand the need.</span></div><div className="board-card board-step"><small>02 / BUILD</small><b>Make it real</b><span>Craft with intention.</span></div></div>
              <div className="board-footer"><span><i /> A small team, working closely</span><b>01 — 02</b></div>
            </div>
          </div>
        </div>
        <div className="visual-note"><span className="note-icon"><Code2 aria-hidden="true" /></span><span><b>Design meets engineering</b><small>From the first sketch to the final detail.</small></span></div>
      </div>
    </section>
  );
}

function Section({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PageState({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) {
  return (
    <main className="state" id="main-content" role={error ? 'alert' : 'status'}>
      <div>
        <p>{error || (loading ? 'Loading ZILENIX Technologies…' : 'Content is unavailable.')}</p>
        {error && <button className="btn glass" onClick={retry}>Try again</button>}
      </div>
    </main>
  );
}

function Home() {
  const { data, error, loading, reload } = useSite();
  if (!data) return <PageState loading={loading} error={error} retry={reload} />;

  return (
    <>
      <Hero />
      {data.counters.some((counter) => counter.value) && (
        <Section kicker="OUR IMPACT" title="Momentum you can measure.">
          <div className="counters">
            {data.counters.filter((counter) => counter.value).map((counter) => (
              <div key={counter.id}><strong>{counter.value}+</strong><span>{counter.label}</span></div>
            ))}
          </div>
        </Section>
      )}
      <Section kicker="WHAT WE BUILD" title="Everything your business needs to win online. Under one roof.">
        {data.services.length ? (
          <div className="grid cards">
            {data.services.map((service, index) => {
              const Icon = icons[index % icons.length];
              return (
                <Link to="/services" className="service glass-card" key={service.id}>
                  <Icon aria-hidden="true" />
                  <h3>{service.title}</h3>
                  <p>{service.promise || service.description}</p>
                  <span>Learn more <ArrowRight aria-hidden="true" /></span>
                </Link>
              );
            })}
          </div>
        ) : <p className="empty-state">Services will appear here when they are published.</p>}
      </Section>
      <Section kicker="INDUSTRIES" title="Built for the way your industry really works.">
        {data.industries.length ? (
          <div className="industry-grid">
            {data.industries.map((industry) => (
              <article key={industry.id} className="industry">
                <h3>{industry.name}</h3><p>{industry.description}</p>
              </article>
            ))}
          </div>
        ) : <p className="empty-state">Industry information will appear here when it is published.</p>}
      </Section>
      <ProjectsPreview projects={data.projects} />
      <Section kicker="HOW WE WORK" title="From first idea to live launch, without the guesswork.">
        <div className="timeline">
          {['Discover', 'Design', 'Build', 'Launch', 'Grow'].map((step, index) => (
            <div key={step}>
              <b>0{index + 1}</b><h3>{step}</h3>
              <p>{[
                'We understand your business and goals.',
                'We shape a clear digital direction.',
                'We build with care and keep you involved.',
                'We test, train and go live confidently.',
                'We support what comes next.',
              ][index]}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section kicker="WHY ZILENIX" title="Built in East Africa. Ready for the world.">
        <div className="grid five">
          {['Built for East Africa', 'Ready for the world', 'You stay in control', 'Secure by design', 'Support after launch']
            .map((value) => (
              <article className="glass-card value" key={value}>
                <ShieldCheck aria-hidden="true" /><h3>{value}</h3>
                <p>Clear thinking, capable delivery, and a partnership built around your growth.</p>
              </article>
            ))}
        </div>
      </Section>
      <section className="zilenix-banner glass-card">
        <div>
          <p className="eyebrow">MEET YOUR PROJECT GUIDE</p>
          <h2>Your guide to what’s possible.</h2>
          <p>Ask our project guide about services and how a build could take shape, then get in touch with the team to discuss your goals.</p>
        </div>
        <button className="btn primary" onClick={() => window.dispatchEvent(new Event('open-zilenix'))}>
          Open Chat <MessageCircle />
        </button>
      </section>
      <FAQ faqs={data.faqs} />
      <CTA />
    </>
  );
}

function ProjectsPreview({ projects }: { projects: Item[] }) {
  return (
    <Section kicker="SELECTED WORK" title="Real businesses. Real systems. Built here.">
      {projects.length ? (
        <div className="project-list">{projects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} />)}</div>
      ) : <p className="empty-state">Projects will appear here when they are published.</p>}
      <Link className="text-link" to="/projects">Explore all projects <ArrowRight /></Link>
    </Section>
  );
}

function ProjectCard({ project }: { project: Item }) {
  return (
    <Link className="project-card" to={`/projects/${project.id}`}>
      <div className="project-visual"><span>{project.category}</span><Code2 aria-hidden="true" /></div>
      <div>
        <h3>{project.title}</h3><p>{project.description}</p>
        {project.tech && <small>{project.tech}</small>}
      </div>
    </Link>
  );
}

function FAQ({ faqs }: { faqs: Item[] }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <Section kicker="FAQ" title="Clear answers. A better first step.">
      {faqs.length ? (
        <div className="faq">
          {faqs.map((faq) => (
            <div key={faq.id} className={active === faq.id ? 'open' : ''}>
              <button
                onClick={() => setActive(active === faq.id ? null : faq.id)}
                aria-expanded={active === faq.id}
                aria-controls={`faq-answer-${faq.id}`}
              >
                {faq.question}<ChevronDown aria-hidden="true" />
              </button>
              {active === faq.id && <p id={`faq-answer-${faq.id}`}>{faq.answer}</p>}
            </div>
          ))}
        </div>
      ) : <p className="empty-state">Answers will appear here when they are published.</p>}
    </Section>
  );
}

function CTA() {
  return (
    <section className="cta">
      <p className="eyebrow">YOUR NEXT MOVE</p>
      <h2>Ready to put your business on the map? Let’s build it.</h2>
      <div className="actions">
        <Link className="btn primary" to="/contact">Request a Free Consultation <ArrowRight /></Link>
        {contactDetails.whatsapp && (
          <a className="btn teal" href={`https://wa.me/${contactDetails.whatsapp}`}>
            Chat on WhatsApp <MessageCircle />
          </a>
        )}
      </div>
    </section>
  );
}

function Collection({ type }: { type: 'services' | 'industries' }) {
  const { data, error, loading, reload } = useSite();
  if (!data) return <PageState loading={loading} error={error} retry={reload} />;
  const rows = data[type];

  return (
    <main className="page" id="main-content">
      <p className="eyebrow">ZILENIX {type.toUpperCase()}</p>
      <h1>{type === 'services' ? 'Technology that clears the path to growth.' : 'Digital solutions shaped around your world.'}</h1>
      {rows.length ? (
        <div className="grid cards">
          {rows.map((row, index) => {
            const Icon = icons[index % icons.length];
            return (
              <article className="glass-card service" key={row.id}>
                <Icon aria-hidden="true" /><h3>{row.title || row.name}</h3>
                <p>{row.description || row.promise}</p>
                <Link className="text-link" to="/contact">Start a conversation <ArrowRight /></Link>
              </article>
            );
          })}
        </div>
      ) : <p className="empty-state">There is nothing published in this section yet.</p>}
    </main>
  );
}

function Projects() {
  const { data, error, loading, reload } = useSite();
  const [filter, setFilter] = useState('All');
  if (!data) return <PageState loading={loading} error={error} retry={reload} />;
  const categories = ['All', ...new Set(data.projects.map((project) => project.category).filter((value): value is string => Boolean(value)))];
  const projects = data.projects.filter((project) => filter === 'All' || project.category === filter);

  return (
    <main className="page" id="main-content">
      <p className="eyebrow">SELECTED WORK</p>
      <h1>Real businesses. Real systems. Built here.</h1>
      {data.projects.length > 0 && (
        <div className="filters" role="group" aria-label="Filter projects by category">
          {categories.map((category) => (
            <button
              className={filter === category ? 'selected' : ''}
              onClick={() => setFilter(category)}
              aria-pressed={filter === category}
              key={category}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      {projects.length ? (
        <div className="project-list">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
      ) : <p className="empty-state">No projects are published yet.</p>}
    </main>
  );
}

function ProjectDetail() {
  const { id } = useParams();
  const { data, error, loading, reload } = useSite();
  if (!data) return <PageState loading={loading} error={error} retry={reload} />;
  const project = data.projects.find((item) => String(item.id) === id);
  if (!project) return <NotFound title="Project not found" />;

  return (
    <main className="page detail" id="main-content">
      <p className="eyebrow">{project.category}</p>
      <h1>{project.title}</h1>
      <p className="lead">{project.description}</p>
      <div className="showcase" aria-label={`Illustration for ${project.title}`}><Code2 aria-hidden="true" /></div>
      <div className="detail-grid">
        <div><h2>The brief</h2><p>This digital experience is shaped around the organisation’s audience, practical goals, and long-term growth.</p></div>
        <div><h2>Built with</h2><p>{project.tech || 'Details coming soon.'}</p></div>
      </div>
      <Link className="btn primary" to="/contact">Start a project like this <ArrowRight /></Link>
    </main>
  );
}

function About() {
  return (
    <main className="page about" id="main-content">
      <p className="eyebrow">ABOUT ZILENIX TECHNOLOGIES</p>
      <h1>Technology with a clear purpose: your growth.</h1>
      <p className="lead">ZILENIX Technologies is a Ugandan technology company building durable digital tools for ambitious organisations in East Africa and around the world.</p>
      <div className="glass-card manifesto">
        <h2 className="tagline">Real systems for real growth.</h2>
        <p>We listen first. We build thoughtfully. We keep the experience clear for your team and useful for your customers.</p>
      </div>
      <CTA />
    </main>
  );
}

const emptyEnquiry: Enquiry = {
  name: '',
  email: '',
  phone: '',
  company: '',
  service: '',
  industry: '',
  details: '',
  honeypot: '',
};

function Contact() {
  const { demoMode } = useSite();
  const [form, setForm] = useState<Enquiry>(emptyEnquiry);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('');
    if (demoMode) {
      setStatus('This is a local preview. Your enquiry was not sent or saved.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('The enquiry could not be submitted.');
      setStatus('Thank you — your enquiry is received. We will be in touch soon.');
      setForm(emptyEnquiry);
    } catch (cause) {
      console.error('Unable to submit contact form.', cause);
      setStatus('Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page contact" id="main-content">
      <p className="eyebrow">START YOUR PROJECT</p>
      <h1>Tell us where you want your business to go.</h1>
      <p className="lead">Request a free consultation and a custom proposal. No prices or packages — just a conversation about the right next step.</p>
      <div className="contact-layout">
        <aside className="contact-aside">
          <p className="contact-aside-kicker">A GOOD PLACE TO START</p>
          <h2>Every great build starts with a conversation.</h2>
          <p>Tell us what you want to make easier, better, or possible. We’ll help you find a clear next step.</p>
          <ol>
            <li><span>01</span><div><b>Share the idea</b><small>Give us the useful context.</small></div></li>
            <li><span>02</span><div><b>Meet the team</b><small>We’ll learn about your goals.</small></div></li>
            <li><span>03</span><div><b>Map what comes next</b><small>Leave with a practical direction.</small></div></li>
          </ol>
          <div className="contact-aside-note"><span>✳</span><p>Good work begins by understanding the people it’s for.</p></div>
        </aside>
      <form className="contact-form glass-card" onSubmit={submit}>
        {([
          ['name', 'Your name *', 'text'],
          ['email', 'Email address *', 'email'],
          ['phone', 'Phone number', 'tel'],
          ['company', 'Company', 'text'],
          ['service', 'Service you need', 'text'],
          ['industry', 'Your industry', 'text'],
        ] as const).map(([field, label, type]) => (
          <label key={field}>
            {label}
            <input
              type={type}
              name={field}
              autoComplete={field === 'name' ? 'name' : field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'off'}
              required={field === 'name' || field === 'email'}
              value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
            />
          </label>
        ))}
        <label className="full">
          Project details *
          <textarea name="details" required value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} />
        </label>
        <input
          className="trap"
          name="honeypot"
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(event) => setForm({ ...form, honeypot: event.target.value })}
        />
        <button className="btn primary" disabled={submitting}>
          {submitting ? 'Sending…' : 'Request a Free Consultation'} <Send aria-hidden="true" />
        </button>
        {status && <p className="form-status" role="status">{status}</p>}
      </form>
      </div>
    </main>
  );
}

function demoReply(message: string) {
  const text = message.toLowerCase();
  if (/price|cost|quote|how much/.test(text)) return 'Every project is shaped around your goals. The team can discuss a tailored proposal after a free consultation.';
  if (/human|person|whatsapp|call/.test(text)) return 'You can use the project enquiry form to start a conversation with the ZILENIX Technologies team.';
  if (/project|work|portfolio/.test(text)) return 'This local preview includes sample project cards. Select Projects to explore the layout.';
  if (/service|website|app|system/.test(text)) return 'The preview covers websites, web and mobile apps, business systems, and digital strategy.';
  if (/process|how do you work/.test(text)) return 'Projects typically begin with discovery, followed by design, build, launch, and ongoing support.';
  return 'I can help with ZILENIX Technologies services, projects, or how to start a conversation.';
}

function Zilenix() {
  const { demoMode } = useSite();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi, I’m the ZILENIX project guide. How can I help with your next build?' },
  ]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener('open-zilenix', openChat);
    return () => window.removeEventListener('open-zilenix', openChat);
  }, []);

  const send = async (message = text) => {
    if (!message.trim() || sending) return;
    setMessages((current) => [...current, { from: 'you', text: message }]);
    setText('');
    setSending(true);

    try {
      let reply: string;
      if (demoMode) {
        reply = demoReply(message);
      } else {
        const response = await fetch('/api/zilenix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });
        if (!response.ok) throw new Error('ZILENIX could not respond.');
        const result: unknown = await response.json();
        if (!result || typeof result !== 'object' || !('reply' in result) || typeof result.reply !== 'string') {
          throw new Error('ZILENIX returned an unexpected response.');
        }
        reply = result.reply;
      }
      setMessages((current) => [...current, { from: 'bot', text: reply }]);
    } catch (cause) {
      console.error('Unable to send a ZILENIX message.', cause);
      setMessages((current) => [...current, { from: 'bot', text: 'I could not send that just now. Please try again later.' }]);
    } finally {
      setSending(false);
    }
  };

  const suggestions = ['Our Services', 'See Projects', 'Start a Project', 'Talk to a Human'];
  return (
    <div className="chat">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="chat-panel"
            aria-label="ZILENIX chat"
          >
            <div className="chat-head">
              <b>ZILENIX</b>
              <button onClick={() => setOpen(false)} aria-label="Close ZILENIX chat"><X /></button>
            </div>
            <div className="messages" role="log" aria-live="polite">
              {messages.map((message, index) => <p key={index} className={message.from}>{message.text}</p>)}
              {sending && <p className="bot">Thinking…</p>}
            </div>
            <div className="chips">
              {suggestions.map((suggestion) => (
                <button key={suggestion} disabled={sending} onClick={() => void send(suggestion)}>{suggestion}</button>
              ))}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); void send(); }}>
              <input aria-label="Ask ZILENIX" value={text} onChange={(event) => setText(event.target.value)} placeholder="Ask ZILENIX…" />
              <button aria-label="Send message" disabled={sending || !text.trim()}><Send /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label={open ? 'Close ZILENIX chat' : 'Open ZILENIX chat'}>
        {open ? <X /> : <MessageCircle />}
      </button>
    </div>
  );
}

function Admin() {
  const { demoMode } = useSite();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [notice, setNotice] = useState('');
  const [authReady, setAuthReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    void supabase.auth.getSession().then(({ data, error: authError }) => {
      if (!active) return;
      if (authError) setNotice('Unable to check your sign-in status.');
      setSession(data.session);
      setAuthReady(true);
    }).catch((cause: unknown) => {
      if (!active) return;
      console.error('Unable to read the admin session.', cause);
      setNotice('Unable to check your sign-in status.');
      setAuthReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!session) return undefined;
    let active = true;
    const loadContacts = async () => {
      try {
        const response = await fetch('/api/contacts', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) throw new Error('Enquiries could not be loaded.');
        const result: unknown = await response.json();
        if (!Array.isArray(result)) throw new Error('The enquiries service returned an unexpected response.');
        if (active) setContacts(result as ContactRecord[]);
      } catch (cause) {
        console.error('Unable to load enquiries.', cause);
        if (active) setNotice('Unable to load enquiries. Please try again later.');
      }
    };
    void loadContacts();
    return () => { active = false; };
  }, [session]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setNotice('The admin dashboard requires Supabase configuration.');
      return;
    }
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setNotice(authError.message);
    else {
      setNotice('');
      setSession(data.session);
    }
  };

  if (!supabase || demoMode) {
    return (
      <main className="admin-login">
        <div className="glass-card">
          <p className="eyebrow">ZILENIX TECHNOLOGIES ADMIN</p>
          <h1>Admin sign-in unavailable</h1>
          <p>The admin dashboard needs Supabase credentials and an API-capable server. The local preview does not authenticate or store data.</p>
          <Link className="btn glass" to="/">Return to the site <ArrowRight /></Link>
        </div>
      </main>
    );
  }
  if (!authReady) return <PageState loading error="" retry={() => undefined} />;

  if (!session) {
    return (
      <main className="admin-login">
        <div className="glass-card">
          <p className="eyebrow">ZILENIX TECHNOLOGIES ADMIN</p>
          <h1>Welcome back.</h1>
          <form onSubmit={login}>
            <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="username" required /></label>
            <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required /></label>
            <button className="btn primary">Sign in</button>
            {notice && <p role="alert">{notice}</p>}
          </form>
        </div>
      </main>
    );
  }

  const signOut = async () => {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setNotice('Unable to sign out. Please try again.');
    else setSession(null);
  };
  const updateLeadStatus = async (contact: ContactRecord, lead_status: string) => {
    if (!session) return;
    try {
      const response = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id: contact.id, lead_status }),
      });
      if (!response.ok) throw new Error('The enquiry status could not be updated.');
      setContacts((current) => current.map((item) => item.id === contact.id ? { ...item, lead_status } : item));
      setNotice('Enquiry status updated.');
    } catch (cause) {
      console.error('Unable to update enquiry status.', cause);
      setNotice('Unable to update this enquiry. Please try again.');
    }
  };
  const newEnquiries = contacts.filter((contact) => contact.lead_status === 'New').length;

  return (
    <main className="admin">
      <div className="admin-top">
        <div><p className="eyebrow">ADMIN DASHBOARD</p><h1>Enquiries</h1><Link className="text-link" to="/">← Back to website</Link></div>
        <button className="btn glass" onClick={() => void signOut()}><LogOut /> Sign out</button>
      </div>
      {notice && <p role="alert">{notice}</p>}
      <div className="admin-stats">
        <div><b>{contacts.length}</b><span>Total enquiries</span></div>
        <div><b>{newEnquiries}</b><span>New</span></div>
      </div>
      <div className="table-wrap glass-card">
        <table>
          <thead><tr><th>Name</th><th>Service</th><th>Contact</th><th>Status</th></tr></thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.name}<small>{contact.company}</small></td>
                <td>{contact.service}</td>
                <td>{contact.email}<small>{contact.phone}</small></td>
                <td><select aria-label={`Update status for ${contact.name}`} value={contact.lead_status || 'New'} onChange={(event) => void updateLeadStatus(contact, event.target.value)}><option>New</option><option>In progress</option><option>Contacted</option><option>Closed</option></select></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!contacts.length && <p>No enquiries yet.</p>}
      </div>
    </main>
  );
}

function Footer() {
  const hasContactDetails = Object.values(contactDetails).some(Boolean);
  return (
    <footer>
      <div>
        <div className="brand brand-static" aria-label="ZILENIX Technologies">
          <img className="brand-mark" src="/zilenix-mark.webp" alt="ZILENIX Technologies — Real Systems for Real Growth" />
        </div>
        <p className="tagline">Real Systems for Real Growth.</p>
      </div>
      <div>
        <b>Connect</b>
        {contactDetails.email && <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>}
        {contactDetails.phone && <a href={`tel:${contactDetails.phone}`}>{contactDetails.phone}</a>}
        {contactDetails.whatsapp && <a href={`https://wa.me/${contactDetails.whatsapp}`}>WhatsApp</a>}
        {contactDetails.address && <span>{contactDetails.address}</span>}
        {!hasContactDetails && <Link to="/contact">Use the project enquiry form</Link>}
      </div>
      <div><b>Explore</b>{nav.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}</div>
    </footer>
  );
}

function NotFound({ title = 'Page not found' }: { title?: string }) {
  return (
    <main className="page not-found" id="main-content">
      <p className="eyebrow">404</p><h1>{title}</h1>
      <p className="lead">The page may have moved or is not available.</p>
      <Link className="btn primary" to="/">Back to home <ArrowRight /></Link>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Shell><Home /></Shell>} />
          <Route path="/services" element={<Shell><Collection type="services" /></Shell>} />
          <Route path="/industries" element={<Shell><Collection type="industries" /></Shell>} />
          <Route path="/projects" element={<Shell><Projects /></Shell>} />
          <Route path="/projects/:id" element={<Shell><ProjectDetail /></Shell>} />
          <Route path="/about" element={<Shell><About /></Shell>} />
          <Route path="/contact" element={<Shell><Contact /></Shell>} />
          <Route path="*" element={<Shell><NotFound /></Shell>} />
        </Routes>
      </SiteProvider>
    </BrowserRouter>
  );
}

export default App;
