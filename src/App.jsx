import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  Compass, Instagram, TrendingUp, ArrowRight, ArrowLeft, 
  ExternalLink, CheckCircle, Clock, Code, Mic, Camera, 
  FileText, Download, Linkedin, Twitter, Search, MousePointer2 
} from 'lucide-react';

export default function CampusTrek() {
  const [activeSection, setActiveSection] = useState('home');
  const [daysLeft, setDaysLeft] = useState(0);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorRingRef = useRef(null);

  // --- MOUSE TRACKING & 3D BACKGROUND ---
  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear & Append
    while (canvasRef.current.firstChild) {
      canvasRef.current.removeChild(canvasRef.current.firstChild);
    }
    canvasRef.current.appendChild(renderer.domElement);

    // 2. Create Particles
    const geometry = new THREE.BufferGeometry();
    const count = 200; // Increased particle count
    const positions = new Float32Array(count * 3);
    for(let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 70; // Wider spread
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ size: 0.25, color: 0x64ffda, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. Create Lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x64ffda, transparent: true, opacity: 0.12 });
    const linesGeometry = new THREE.BufferGeometry();
    const lines = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(lines);

    // 4. Mouse Interaction Variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
        
        // Custom Cursor Logic (Direct DOM manipulation for performance)
        if (cursorRef.current && cursorRingRef.current) {
            cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
            // Add a slight delay to the ring for a "trail" effect
            setTimeout(() => {
                 if (cursorRingRef.current) {
                    cursorRingRef.current.style.transform = `translate3d(${event.clientX - 12}px, ${event.clientY - 12}px, 0)`;
                 }
            }, 50);
        }
    };
    document.addEventListener('mousemove', onDocumentMouseMove);

    // 5. Animation Loop
    let animationId;
    const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        // Smooth Parallax Effect
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        particles.rotation.y += 0.003 + (targetX - particles.rotation.y) * 0.05;
        particles.rotation.x += (targetY - particles.rotation.x) * 0.05;
        
        lines.rotation.y = particles.rotation.y;
        lines.rotation.x = particles.rotation.x;

        // Dynamic Line Connections (recalculate positions based on particle movement)
        const pos = particles.geometry.attributes.position.array;
        const linePos = [];
        
        // Connect particles that are close
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const dist = Math.sqrt(
                    (pos[i*3]-pos[j*3])**2 + 
                    (pos[i*3+1]-pos[j*3+1])**2 + 
                    (pos[i*3+2]-pos[j*3+2])**2
                );
                // Only connect if close enough
                if (dist < 9) {
                    linePos.push(pos[i*3], pos[i*3+1], pos[i*3+2], pos[j*3], pos[j*3+1], pos[j*3+2]);
                }
            }
        }
        lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        
        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousemove', onDocumentMouseMove);
        if (canvasRef.current) canvasRef.current.innerHTML = '';
    };
  }, []);

  // --- COUNTDOWN LOGIC ---
  useEffect(() => {
    const targetDate = new Date('November 24, 2025 00:00:00').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      setDaysLeft(Math.floor(distance / (1000 * 60 * 60 * 24)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const NavButton = ({ id, label }) => (
    <button 
      onClick={() => setActiveSection(id)} 
      className={`hover:text-teal-400 transition-colors ${activeSection === id ? 'text-teal-400 font-bold' : ''}`}
    >
      {label}
    </button>
  );

  return (
    <div className="font-sans bg-[#050505] text-white min-h-screen overflow-x-hidden selection:bg-teal-500 selection:text-white cursor-none">
      
      {/* CUSTOM CURSOR ELEMENTS */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-3 h-3 bg-teal-400 rounded-full pointer-events-none z-[100] mix-blend-difference"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
      <div 
        ref={cursorRingRef} 
        className="fixed top-0 left-0 w-8 h-8 border border-teal-400/50 rounded-full pointer-events-none z-[100] transition-transform duration-100 ease-out"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />

      {/* 3D Background */}
      <div ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 opacity-60 pointer-events-none" />

      {/* Ticker */}
      <div className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md h-10 flex items-center overflow-hidden">
        <div className="whitespace-nowrap animate-[ticker_35s_linear_infinite] pl-[100%] text-sm text-teal-400 font-medium tracking-wider flex gap-12">
            <span>🔥 Google Summer of Code Applications Open</span>
            <span>📢 New GRE Pattern Announced for 2025</span>
            <span>🚀 OpenAI releases GPT-4o Mini API</span>
            <span>💼 Amazon SDE-1 Hiring Alert: Bangalore & Hyderabad</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-10 w-full z-40 p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/5 px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 transition" onClick={() => setActiveSection('home')}>
            <Compass className="text-teal-400 w-6 h-6" />
            <span className="text-xl font-bold tracking-tight">Campus<span className="text-teal-400">Trek</span></span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 bg-white/5 backdrop-blur-md border border-white/5 px-8 py-3 rounded-full text-sm font-medium text-gray-300">
            <NavButton id="jobs" label="Jobs" />
            <NavButton id="masters" label="Masters" />
            <NavButton id="tech" label="AI & Tech" />
            <NavButton id="events" label="Events" />
            <NavButton id="resources" label="Resources" />
          </div>

          <a href="https://www.instagram.com/campustrekindia" target="_blank" rel="noreferrer" className="bg-teal-500 hover:bg-teal-600 text-black px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(20,184,166,0.5)] flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            <span>Join Community</span>
          </a>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* === HOME SECTION === */}
        {activeSection === 'home' && (
          <section className="min-h-[80vh] flex flex-col justify-center items-start animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-bold mb-6 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span> LIVE UPDATES ACTIVE
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold leading-tight mb-6">
                Navigate Your <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">Future Career</span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                Campus Trek India is your immersive guide to high-paying internships, masters abroad, tech trends, and campus life events.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                <div onClick={() => setActiveSection('jobs')} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <TrendingUp className="w-20 h-20 text-teal-400" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Hiring Velocity</p>
                    <h3 className="text-3xl font-bold text-white mb-4">High <span className="text-sm text-teal-400 font-normal">+12%</span></h3>
                    <div className="flex items-end gap-1 h-12">
                        {[40, 60, 35, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-2 bg-teal-400/30 rounded-sm hover:bg-teal-400 transition-colors" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col justify-between border-t-2 border-t-teal-500/30">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Target Exam</p>
                        <h3 className="text-lg font-bold">CAT 2025</h3>
                    </div>
                    <div className="text-center py-4">
                        <span className="text-5xl font-bold text-white">{daysLeft}</span>
                        <span className="text-sm text-gray-400 block mt-1">Days Left</span>
                    </div>
                </div>

                <div onClick={() => setActiveSection('events')} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl cursor-pointer hover:bg-white/10 transition">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Upcoming Event</p>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">HackTheFuture '25</h3>
                    <p className="text-sm text-gray-400 mb-4">India's largest student hackathon.</p>
                    <p className="text-xs text-teal-400 flex items-center gap-1">Join Waitlist <ArrowRight size={12}/></p>
                </div>
            </div>
          </section>
        )}

        {/* === JOBS SECTION === */}
        {activeSection === 'jobs' && (
          <section className="animate-fade-in-up">
            <header className="mb-10">
                <button onClick={() => setActiveSection('home')} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm"><ArrowLeft size={16} /> Back to Home</button>
                <h2 className="text-5xl font-bold mb-4">Job Board <span className="text-teal-400">Live</span></h2>
                <div className="flex gap-4 max-w-lg">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg flex items-center px-4">
                        <Search className="text-gray-500" size={20} />
                        <input type="text" placeholder="Search role, company..." className="bg-transparent border-none outline-none text-white p-3 w-full" />
                    </div>
                    <button className="bg-teal-500 text-black font-bold px-6 rounded-lg hover:bg-teal-400 transition">Search</button>
                </div>
            </header>

            <div className="grid gap-4">
                {[
                    { company: "Google", role: "Software Engineering Intern", loc: "Bangalore", pay: "₹80,000/mo", tags: ["Summer '25", "C++"], color: "bg-white", text: "text-black", letter: "G" },
                    { company: "Amazon", role: "SDE - I (Fresher)", loc: "Hyderabad", pay: "18-24 LPA", tags: ["Full Time", "Java"], color: "bg-orange-500", text: "text-white", letter: "A" },
                    { company: "Meta", role: "Product Design Intern", loc: "Remote", pay: "₹60,000/mo", tags: ["Design", "Figma"], color: "bg-blue-600", text: "text-white", letter: "M" },
                ].map((job, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 hover:border-teal-500/50 transition-all cursor-none hover:bg-white/10">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`w-12 h-12 ${job.color} ${job.text} rounded flex items-center justify-center text-xl font-bold`}>{job.letter}</div>
                            <div>
                                <h3 className="text-xl font-bold">{job.role}</h3>
                                <p className="text-gray-400 text-sm">{job.company} • {job.loc} • {job.pay}</p>
                                <div className="flex gap-2 mt-2">
                                    {job.tags.map(tag => <span key={tag} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">{tag}</span>)}
                                </div>
                            </div>
                        </div>
                        <button className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap w-full md:w-auto justify-center">
                            Apply Now <ExternalLink size={16} />
                        </button>
                    </div>
                ))}
            </div>
          </section>
        )}

        {/* === MASTERS SECTION === */}
        {activeSection === 'masters' && (
          <section className="animate-fade-in-up">
             <header className="mb-10">
                <button onClick={() => setActiveSection('home')} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm"><ArrowLeft size={16} /> Back to Home</button>
                <h2 className="text-5xl font-bold mb-4">Masters Abroad <span className="text-purple-400">Guide</span></h2>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { country: "USA 🇺🇸", badge: "Most Popular", color: "blue", reqs: ["GRE Avg: 315+", "TOEFL: 100+", "Deadline: Dec 15"] },
                    { country: "UK 🇬🇧", badge: "1 Year Masters", color: "red", reqs: ["IELTS: 6.5+", "No GRE Required", "Rolling Admissions"] },
                    { country: "Germany 🇩🇪", badge: "Low Tuition", color: "yellow", reqs: ["APS Certificate", "IELTS: 6.5+", "Deadline: Jan 15"] },
                ].map((item, i) => (
                    <div key={i} className={`bg-white/5 border border-white/10 p-6 rounded-2xl border-t-4 border-t-${item.color}-500 hover:-translate-y-1 transition-transform cursor-none hover:bg-white/10`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold">{item.country}</h3>
                            <span className={`text-xs bg-${item.color}-500/20 text-${item.color}-300 px-2 py-1 rounded`}>{item.badge}</span>
                        </div>
                        <ul className="space-y-3 text-gray-300 text-sm mb-6">
                            {item.reqs.map((req, j) => (
                                <li key={j} className="flex gap-2"><CheckCircle size={16} className="text-green-400" /> {req}</li>
                            ))}
                        </ul>
                        <button className={`w-full bg-${item.color}-600/20 text-${item.color}-300 py-2 rounded-lg`}>View Universities</button>
                    </div>
                ))}
            </div>
          </section>
        )}

        {/* === AI & TECH SECTION === */}
        {activeSection === 'tech' && (
             <section className="animate-fade-in-up">
                <header className="mb-10">
                    <button onClick={() => setActiveSection('home')} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm"><ArrowLeft size={16} /> Back to Home</button>
                    <h2 className="text-5xl font-bold mb-4">AI & Tech <span className="text-teal-400">Hub</span></h2>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                         <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition cursor-none">
                            <span className="text-xs text-teal-400 font-bold mb-2 block">ARTIFICIAL INTELLIGENCE</span>
                            <h4 className="text-2xl font-bold mb-3">OpenAI Releases GPT-4o Mini</h4>
                            <p className="text-gray-400 mb-4">A cost-efficient small model that outperforms GPT-3.5 Turbo.</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock size={14}/> <span>2 hours ago</span>
                            </div>
                         </div>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-300 border-b border-gray-700 pb-2">Tools of the Week</h3>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 cursor-none">
                            <Code className="text-yellow-400" />
                            <div>
                                <h5 className="font-bold">Cursor IDE</h5>
                                <p className="text-xs text-gray-400">AI Code Editor</p>
                            </div>
                        </div>
                    </div>
                </div>
             </section>
        )}

        {/* === EVENTS SECTION === */}
        {activeSection === 'events' && (
            <section className="animate-fade-in-up">
                 <header className="mb-10">
                    <button onClick={() => setActiveSection('home')} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm"><ArrowLeft size={16} /> Back to Home</button>
                    <h2 className="text-5xl font-bold mb-4">Campus <span className="text-pink-400">Events</span></h2>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Global Hackathon", type: "TECH", icon: Code, color: "teal", desc: "48-hour coding marathon." },
                        { title: "Campus Mic Night", type: "COMEDY", icon: Mic, color: "pink", desc: "Featuring Zakir Khan." },
                        { title: "Creator Summit", type: "CREATOR", icon: Camera, color: "purple", desc: "Masterclass on Branding." },
                    ].map((evt, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:shadow-2xl transition hover:-translate-y-1 cursor-none">
                            <div className={`h-40 bg-gradient-to-r from-${evt.color}-900 to-black relative p-6`}>
                                <span className={`bg-${evt.color}-500 text-black text-xs font-bold px-2 py-1 rounded absolute top-4 left-4`}>{evt.type}</span>
                                <evt.icon className={`w-12 h-12 text-${evt.color}-500 opacity-50 absolute bottom-4 right-4`} />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{evt.title}</h3>
                                <p className="text-sm text-gray-400 mb-4">{evt.desc}</p>
                                <button className={`w-full bg-${evt.color}-500/20 text-${evt.color}-300 py-2 rounded-lg font-bold`}>Register</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* === RESOURCES SECTION === */}
        {activeSection === 'resources' && (
             <section className="animate-fade-in-up">
                <header className="mb-10">
                    <button onClick={() => setActiveSection('home')} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm"><ArrowLeft size={16} /> Back to Home</button>
                    <h2 className="text-5xl font-bold mb-4">Student <span className="text-teal-400">Resources</span></h2>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="w-8 h-8 text-teal-400" />
                            <h3 className="text-2xl font-bold">Resume Templates</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-none transition">
                                <span className="font-medium">Harvard Format (SDE)</span>
                                <Download size={16} className="text-gray-400" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-none transition">
                                <span className="font-medium">Product Manager CV</span>
                                <Download size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
             </section>
        )}

        {/* Footer */}
        <footer className="border-t border-white/10 pt-10 mt-20 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-gray-500 text-sm">© 2025 Campus Trek India.</p>
             <div className="flex gap-6 text-gray-400">
                <Instagram className="w-5 h-5 hover:text-pink-500" />
                <Linkedin className="w-5 h-5 hover:text-blue-500" />
                <Twitter className="w-5 h-5 hover:text-blue-400" />
             </div>
        </footer>

      </main>
    </div>
  );
}