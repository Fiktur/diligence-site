// Filename: app/page.tsx
// Phase 4: Final Code Package for Deployment
// Project: "Operation: Inevitable" for Vic Akosile

'use client'; 

import Image from 'next/image';
import { Mail, Phone, Linkedin, Building2, BarChart, Gavel, FileText, ArrowRight, Video, Bot, Send } from 'lucide-react';
import { motion, useAnimation, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// --- TYPE DEFINITIONS ---
type Testimonial = {
  quote: string;
  author: string;
  role: string;
  icon: React.ElementType;
};

type ChatMessage = {
    role: 'user' | 'bot';
    text: string;
};

// --- HELPER COMPONENTS ---

// FIXED Animated Counter
const AnimatedCounter = ({ value, text }: { value: number; text: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();
  const [displayValue, setDisplayValue] = useState("0");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isInView) {
      if (shouldReduceMotion) {
        setDisplayValue(value.toLocaleString());
        return;
      }
      controls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5 }
      });
      
      const animation = motion.animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          if (text.includes('x')) {
            setDisplayValue(latest.toFixed(1));
          } else {
            setDisplayValue(Math.round(latest).toLocaleString());
          }
        },
      });
      return () => animation.stop();
    }
  }, [isInView, value, controls, text, shouldReduceMotion]);

  const formatDisplayValue = () => {
      if (shouldReduceMotion) {
          if (text.includes('$')) return `$${value}M`;
          if (text.includes('+')) return `${value.toLocaleString()}+`;
          if (text.includes('x')) return `${value.toFixed(1)}x`;
          if (text.includes('%')) return `${value}%`;
          return value.toLocaleString();
      }
      if (text.includes('$')) return `$${displayValue}M`;
      if (text.includes('+')) return `${displayValue}+`;
      if (text.includes('x')) return `${displayValue}x`;
      if (text.includes('%')) return `${displayValue}%`;
      return displayValue;
  }

  return (
    <div ref={ref}>
      <motion.p 
        className="text-4xl lg:text-5xl font-bold text-[#BFA181]"
        animate={controls}
      >
        {formatDisplayValue()}
      </motion.p>
      <p className="text-gray-400 mt-2">{text.replace(/\$\d+M|\d+\+|\d+(\.\d+)?x|%/g, '').trim()}</p>
    </div>
  );
};

// AnimatedSection respecting reduced motion
const AnimatedSection = ({ children, className = "", id = "" }: { children: React.ReactNode, className?: string, id?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const shouldReduceMotion = useReducedMotion();

    const variants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.section
            id={id}
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={isInView && !shouldReduceMotion ? "visible" : "hidden"}
            transition={{ duration: 0.8 }}
            className={className}
        >
            {children}
        </motion.section>
    );
};

// VicBot Component with Gemini API Integration
const VicBot = ({ closeBot }: { closeBot: () => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'bot', text: "Hi there. I'm a custom-trained assistant for Vic. Ask me about his experience with executive engagement, AI outreach, or event design." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const vicResumeContext = `You are Vic Akosile's AI assistant. Answer questions based on this context: Vic is a Board & C-Suite Engagement Leader. Key achievements: scaled TechWorkersClub to 30k senior tech leaders; launched a Global Commercial Leadership Academy at Cloudflare with 97% satisfaction; directed a leadership program at Accenture with 94 NPS; drove a 3.8x lift in C-suite engagement for Artaic using AI outreach; influenced $42M in pipeline from a single VIP dinner. Core skills: Executive Community Building, Event Design, Influencer Recruitment, Gen-AI Content & Outreach, NPS & Engagement Analytics, GRC Fluency. He has an M.A. from Harvard and is the 2025 ESG Board Director of the Year. Be helpful and concise.`;
        
        const prompt = `${vicResumeContext}\n\nQuestion: ${input}\n\nAnswer:`;
        
        try {
            const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            // IMPORTANT: In a real deployment, use an environment variable for the API key.
            // e.g., const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            const apiKey = ""; // API key will be injected by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) { throw new Error(`API call failed with status: ${response.status}`); }

            const result = await response.json();
            const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that. Please ask about Vic's professional experience.";
            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages(prev => [...prev, { role: 'bot', text: "Apologies, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-24 right-8 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl w-80 h-96 z-50 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0"><h4 className="font-bold text-white flex items-center gap-2"><Bot size={20}/> Vic-Bot</h4><button onClick={closeBot} className="text-2xl">&times;</button></div>
            <div className="p-4 flex-grow overflow-y-auto"><div className="space-y-4">{messages.map((msg, index) => (<div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-[#BFA181] text-black' : 'bg-gray-700 text-white'}`}>{msg.text}</div></div>))}{isLoading && (<div className="flex justify-start"><div className="bg-gray-700 text-white p-3 rounded-lg">...</div></div>)}<div ref={messagesEndRef} /></div></div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 flex-shrink-0 flex gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about my experience..." className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BFA181]" disabled={isLoading} /><button type="submit" className="bg-[#BFA181] text-black rounded-md p-2" disabled={isLoading}><Send size={20} /></button></form>
        </motion.div>
    );
};

// Personalized Video Section
const PersonalizedVideo = ({ name }: { name: string }) => (
    <AnimatedSection id="personalized-video" className="py-20 text-center bg-[#1a1a1a] rounded-lg my-10">
        <h2 className="text-3xl font-bold text-[#BFA181] mb-4">A Personal Message for {name}</h2>
        <div className="max-w-2xl mx-auto aspect-video bg-black border border-gray-700 rounded-lg flex items-center justify-center"><div className="text-center text-gray-500"><Video size={64} className="mx-auto mb-4" /><p>[PLACEHOLDER: A 30-second personalized video for {name} will be embedded here.]</p><p>This demonstrates the capability for hyper-personalized outreach at scale.</p></div></div>
    </AnimatedSection>
);

// --- Main Presentation Component ---
// This component contains the main UI and is rendered by the default export
const LivingCaseStudy = () => {
  const searchParams = useSearchParams();
  const [hiringManagerName, setHiringManagerName] = useState('');
  const [isBotOpen, setIsBotOpen] = useState(false);

  useEffect(() => {
    const execName = searchParams.get('exec');
    if (execName) {
      setHiringManagerName(execName);
    }
  }, [searchParams]);

  // --- PLACEHOLDER DATA ---
  const testimonials: Testimonial[] = [ { quote: "[PLACEHOLDER: Testimonial from a CEO...]", author: "CEO, spa.com", role: "CEO Perspective", icon: Building2 }, { quote: "[PLACEHOLDER: Testimonial from a Board Chair...]", author: "Board Chair, Tech Corp", role: "Board Chair Perspective", icon: Gavel }, { quote: "[PLACEHOLDER: Testimonial from a Managing Director...]", author: "SMD, Accenture", role: "Managing Director Perspective", icon: BarChart }, ];
  const techStackLogos = ['Instantly.ai', 'Apollo.io', 'ChatGPT 4o', 'Power BI', 'Salesforce', 'Looker', 'Hopin'];
  const trustedByLogos = ['Cloudflare', 'Accenture', 'Artaic Mosaic Robotics', 'LMI', 'SAIC'];
  const impactNumbers = [ { value: 30000, text: 'Exec Community+' }, { value: 94, text: 'Average Summit NPS' }, { value: 42, text: '$42M Pipeline Influenced' }, { value: 3.8, text: 'C-Suite Engagementx' }, { value: 97, text: 'Learner Satisfaction%' } ];

  return (
    <div className="bg-[#111111] text-gray-200 font-sans leading-relaxed">
      {hiringManagerName && (
        <div className="fixed top-0 left-0 right-0 bg-[#BFA181] text-black p-3 text-center z-50">
          <a href="#personalized-video" className="font-bold underline" onClick={(e) => { e.preventDefault(); document.getElementById('personalized-video')?.scrollIntoView({ behavior: 'smooth' }); }}>A personal message for {hiringManagerName} from Vic.</a>
          <button onClick={() => setHiringManagerName('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">&times;</button>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="hero" className="min-h-screen flex flex-col justify-center items-center text-center py-20">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="w-full max-w-4xl">
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
              {/* IMPORTANT FOR DEPLOYMENT: 
                  1. Place your headshot image inside the `public` folder in your Next.js project.
                  2. Rename the image file to `vic-akosile-headshot.jpg`.
                  3. The `src` path below will then work correctly. 
              */}
              <Image src="/vic-akosile-headshot.jpg" alt="Victor 'Vic' Akosile" layout="fill" objectFit="cover" className="rounded-full" priority />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"><span className="text-white">30,000 Execs. 94 NPS.</span><br /><span className="text-gray-400">The Architect for Diligent’s Next Era of Board & C-Suite Engagement.</span></h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">I build the exact communities Diligent needs to dominate the GRC landscape: engaged networks of directors and C-suite leaders. By blending high-touch event strategy with AI-powered outreach, I create brand ambassadors who drive influence and revenue.</p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"><a href="#placeholder-pdf" className="w-full sm:w-auto bg-[#BFA181] text-black font-bold py-3 px-8 rounded-md hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2"><FileText size={20} />View My 90-Day Vision</a><a href="#blueprint" className="text-[#BFA181] hover:text-white transition-colors duration-300 flex items-center gap-2">Skim the playbook in 60 sec <ArrowRight size={16} /></a></div>
          </motion.div>
        </section>

        {hiringManagerName && <PersonalizedVideo name={hiringManagerName} />}

        <AnimatedSection id="origin" className="py-20 text-center"><p className="text-xl md:text-2xl text-gray-300 italic">"[PLACEHOLDER: Origin story bullets to be expanded here. e.g., 'My 'architect' mindset was born at SAIC...']"</p></AnimatedSection>
        
        <AnimatedSection id="blueprint" className="py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">A Blueprint for Leadership Engagement</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700" whileHover={{ scale: 1.03, borderColor: '#BFA181' }}><h3 className="text-xl font-bold text-[#BFA181] mb-3">Influencer Program Architecture</h3><p className="text-gray-400">I build advocacy from the ground up. At TechWorkersClub, I scaled a global network to <strong>30,000 senior tech leaders</strong>. This wasn't a list; it was a community with <strong>40% monthly active users</strong> and a 6-month sponsorship waitlist.</p><a href="#case-study-1" className="text-[#BFA181] hover:text-white mt-4 inline-block">See how a 30k-member community was built <ArrowRight size={16} className="inline"/></a></motion.div>
            <motion.div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700" whileHover={{ scale: 1.03, borderColor: '#BFA181' }}><h3 className="text-xl font-bold text-[#BFA181] mb-3">Premier Event & Summit Design</h3><p className="text-gray-400">I create experiences executives refuse to miss. From orchestrating <strong>120+ workshops/quarter</strong> at Accenture to executing VIP dinners that generated <strong>$42M in pipeline</strong>, my events achieve an average <strong>94 NPS</strong>.</p><a href="#case-study-2" className="text-[#BFA181] hover:text-white mt-4 inline-block">Unpack the 94 NPS event strategy <ArrowRight size={16} className="inline"/></a></motion.div>
            <motion.div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700" whileHover={{ scale: 1.03, borderColor: '#BFA181' }}><h3 className="text-xl font-bold text-[#BFA181] mb-3">AI-Driven Content & Outreach</h3><p className="text-gray-400">I use AI to scale authenticity, not replace it. By deploying tools like Instantly.ai and ChatGPT 4o, I achieved a <strong>3.8x lift in C-suite reply rates</strong> for Artaic and can bring the same data-driven approach to Diligent.</p><a href="#case-study-3" className="text-[#BFA181] hover:text-white mt-4 inline-block">Discover how AI drove a 3.8x lift <ArrowRight size={16} className="inline"/></a></motion.div>
          </div>
        </AnimatedSection>
        
        <AnimatedSection id="proof" className="py-20"><div className="text-center mb-12"><p className="text-gray-500 uppercase tracking-widest mb-4">Trusted By</p><div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2">{trustedByLogos.map(logo => <span key={logo} className="text-lg font-medium text-gray-400">{logo}</span>)}</div></div><h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Impact, Quantified.</h2><div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center mb-20">{impactNumbers.map(item => <AnimatedCounter key={item.text} value={item.value} text={item.text} />)}</div><div className="space-y-8">{testimonials.map((t, i) => <motion.div key={i} className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700 max-w-3xl mx-auto" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5, delay: i * 0.1 }}><div className="flex items-start gap-4"><t.icon className="w-8 h-8 text-[#BFA181] mt-1 shrink-0" /><div><p className="text-lg italic">"{t.quote}"</p><p className="mt-4 font-bold">{t.author}</p><p className="text-sm text-gray-500">{t.role}</p></div></div></motion.div>)}</div></AnimatedSection>
        <AnimatedSection id="authority" className="py-20"><h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Recognized Leader in Governance & Strategy</h2><div className="grid md:grid-cols-2 gap-8"><div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700"><h3 className="text-xl font-bold text-[#BFA181] mb-3">Board Governance & ESG</h3><p><strong>ESG Board Director of the Year – 2025</strong></p><p>Strategic Advisor: Artaic, Grow PR</p><p>Board Member: eMentoring Africa</p></div><div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700"><h3 className="text-xl font-bold text-[#BFA181] mb-3">AI & Analytics Stack</h3><div className="flex flex-wrap gap-2">{techStackLogos.map(tech => <span key={tech} className="bg-gray-700 text-sm px-3 py-1 rounded-full">{tech}</span>)}</div></div><div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700"><h3 className="text-xl font-bold text-[#BFA181] mb-3">Thought Leadership</h3><p>Published in: HBR, PRWeek</p><p>Guest Lecturer: Columbia University</p></div><div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700"><h3 className="text-xl font-bold text-[#BFA181] mb-3">Education & Credentials</h3><p>M.A., IO-Psych – Harvard University</p><p>Exec Ed, People Analytics – Wharton</p><p>PMP, ESG & Climate Risk Certified</p></div></div></AnimatedSection>
        <AnimatedSection id="fit" className="py-20"><h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Ready to Build the Future at Diligent</h2><div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8"><div className="text-gray-300"><h3 className="text-xl font-bold text-white mb-3">On Culture & Collaboration</h3><p>I thrive in fast-paced, high-growth environments that value innovation. My experience at Cloudflare and in bootstrapping a global community has prepared me for the 'move fast' ethos at Diligent. I'm not just looking for a job; I'm looking for a mission.</p></div><div className="text-gray-300"><h3 className="text-xl font-bold text-white mb-3">On Location & Compensation</h3><p>Based in Washington DC, I am perfectly positioned to engage with leaders in the capital and am enthusiastic about the hybrid model and regular travel to the NYC hub. My priority is a partnership where significant upside is tied directly to the ambassador-sourced ARR we will generate together.</p></div></div></AnimatedSection>

        <footer id="contact" className="py-20 text-center"><h2 className="text-3xl md:text-4xl font-bold mb-4">Let's Start the Conversation.</h2><p className="max-w-2xl mx-auto text-lg text-gray-300 mb-8">I have the blueprint, the experience, and the vision to build a world-class board and C-suite engagement program for Diligent. I am eager to discuss how I can deliver immediate impact.</p><a href="mailto:victor.akosile@gmail.com?subject=Introductory Call - Vic Akosile | Head of Engagement Role" className="w-full sm:w-auto bg-[#BFA181] text-black font-bold py-3 px-8 rounded-md hover:bg-white transition-colors duration-300 inline-block mb-8">Secure Our 15-Minute Strategy Call</a><p className="italic text-gray-500 mb-10">P.S. When we connect, I'll bring a bespoke 3-point engagement audit of Diligent's 2024 virtual events.</p><div className="flex justify-center items-center gap-6"><a href="mailto:victor.akosile@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-[#BFA181]"><Mail size={20}/> Email</a><a href="tel:+1-202-469-1324" className="flex items-center gap-2 text-gray-400 hover:text-[#BFA181]"><Phone size={20}/> Phone</a><a href="https://linkedin.com/in/victorakosilehr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-[#BFA181]"><Linkedin size={20}/> LinkedIn</a></div><div className="mt-12 text-center text-gray-600 text-sm"><p>&copy; {new Date().getFullYear()} Victor "Vic" Akosile. All Rights Reserved.</p><p>This is a personalized microsite created for the Head of Board & C-Suite Engagement role at Diligent.</p></div></footer>
      </main>

      <div className="fixed bottom-8 right-8 z-40"><motion.button onClick={() => setIsBotOpen(!isBotOpen)} className="bg-[#BFA181] text-black rounded-full p-4 shadow-lg" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Bot size={28} /></motion.button></div>
      {isBotOpen && <VicBot closeBot={() => setIsBotOpen(false)} />}
    </div>
  );
}

// --- Default Export with Suspense Wrapper ---
// This ensures the page can be statically rendered while the part that uses searchParams is client-rendered.
export default function HomePageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LivingCaseStudy />
        </Suspense>
    );
}
