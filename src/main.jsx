import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight, Award, Box, CalendarDays, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, CircleCheck, Clock3, CreditCard, Factory,
  Facebook, FileUp, Globe2, Headphones, HeartHandshake, Instagram, Leaf,
  Linkedin, LockKeyhole, Mail, MapPin, Menu, MessageCircle, Minus, Package,
  Palette, Phone, Plus, Printer, Quote as QuoteIcon, Recycle, Ruler, Search,
  Send, ShieldCheck, ShoppingBag, SlidersHorizontal, Star, Truck, Upload,
  UserRound, X, Zap
} from 'lucide-react';
import './styles.css';

const BRAND = {
  name: 'Kainat Box Makers',
  phone: '+92 300 123 4567',
  phoneRaw: '923001234567',
  email: 'hello@kainatboxmakers.com',
  address: '22 Industrial Estate, Kot Lakhpat, Lahore, Pakistan',
};

const categories = [
  { name: 'Pizza Boxes', slug: 'pizza-boxes', image: '/images/category-pizza.webp', kicker: 'Food-safe & heat smart', blurb: 'Grease-resistant corrugated boxes engineered for a crisp delivery.' },
  { name: 'Shoe Boxes', slug: 'shoe-boxes', image: '/images/category-shoe.webp', kicker: 'Retail-ready rigidity', blurb: 'Premium rigid and folding formats that turn unboxing into a brand moment.' },
  { name: 'Bakery Boxes', slug: 'bakery-boxes', image: '/images/category-bakery.webp', kicker: 'Freshness, beautifully framed', blurb: 'Food-grade cake, pastry and window boxes with custom-fit inserts.' },
  { name: 'Lollipop Boxes', slug: 'lollipop-boxes', image: '/images/category-lollipop.webp', kicker: 'Display-ready sweetness', blurb: 'Food-safe individual, window and counter-display packs made for confectionery.' },
  { name: 'Cartons', slug: 'cartons', image: '/images/category-carton.webp', kicker: 'Built for the journey', blurb: 'Tough corrugated shipping cartons for storage, logistics and ecommerce.' },
  { name: 'Custom Packaging', slug: 'custom-packaging', image: '/images/category-custom.webp', kicker: 'Made without limits', blurb: 'Purpose-built structures, finishes and inserts shaped around your product.' },
];

const products = [
  { id: 'kraft-pizza-12', name: 'Kraft Pizza Box — 12″', category: 'Pizza Boxes', material: 'Corrugated Kraft', size: '12 × 12 × 1.8 in', price: 165, moq: 100, image: '/images/category-pizza.webp', desc: 'Food-safe, grease-resistant E-flute box with steam vents.', featured: true, specs: ['Food-grade kraft board', 'Heat-retaining E-flute', 'Single-color print included', '100% recyclable'] },
  { id: 'premium-pizza-14', name: 'Premium Pizza Box — 14″', category: 'Pizza Boxes', material: 'White Corrugated', size: '14 × 14 × 1.8 in', price: 195, moq: 100, image: '/images/category-pizza.webp', desc: 'Bright white print surface for vibrant restaurant branding.', specs: ['Food-safe white liner', 'CMYK-ready surface', 'Easy-lock corners', 'Recyclable'] },
  { id: 'slide-shoe-box', name: 'Slide Drawer Shoe Box', category: 'Shoe Boxes', material: 'Rigid Board', size: '13 × 8 × 5 in', price: 420, moq: 50, image: '/images/category-shoe.webp', desc: 'A premium drawer box with ribbon pull for elevated footwear.', featured: true, specs: ['1200gsm rigid board', 'Textured paper wrap', 'Cotton pull tab', 'Foil or emboss available'] },
  { id: 'classic-shoe-box', name: 'Classic Two-Piece Shoe Box', category: 'Shoe Boxes', material: 'Kraft Board', size: '13 × 8 × 5 in', price: 275, moq: 100, image: '/images/category-shoe.webp', desc: 'Durable lid-and-base construction for retail and shipping.', specs: ['600gsm kraft board', 'Scuff resistant', 'Pantone printing', 'Custom insert available'] },
  { id: 'window-pastry-box', name: 'Window Pastry Box', category: 'Bakery Boxes', material: 'Food-grade Kraft', size: '10 × 8 × 3 in', price: 145, moq: 100, image: '/images/category-bakery.webp', desc: 'A clear plant-based window puts your bakes center stage.', featured: true, specs: ['Food contact certified', 'PLA window option', 'Auto-lock base', 'Flat-packed delivery'] },
  { id: 'cake-box-12', name: 'Tall Cake Box — 12″', category: 'Bakery Boxes', material: 'SBS Paperboard', size: '12 × 12 × 10 in', price: 225, moq: 50, image: '/images/category-bakery.webp', desc: 'A sturdy, tall-format box with a removable front panel.', specs: ['350gsm food board', 'Reinforced base', 'Optional carry handle', 'Grease resistant'] },
  { id: 'lollipop-display-box', name: 'Lollipop Counter Display Box', category: 'Lollipop Boxes', material: 'Food-grade Kraft', size: '9 × 7 × 6 in', price: 175, moq: 100, image: '/images/category-lollipop.webp', desc: 'A retail-ready countertop display that keeps wrapped lollipops upright and visible.', featured: true, specs: ['Food-safe kraft board', 'Custom display insert', 'Full-color print option', 'Flat-packed delivery'] },
  { id: 'single-lollipop-window-box', name: 'Single Lollipop Window Box', category: 'Lollipop Boxes', material: 'Food-grade Kraft', size: '3 × 2 × 8 in', price: 95, moq: 100, image: '/images/category-lollipop.webp', desc: 'A slim presentation box with a clear window for artisan and event lollipops.', specs: ['Food-contact safe board', 'Clear PLA window option', 'Custom fit insert', 'Ribbon and foil available'] },
  { id: 'mailer-carton', name: 'Self-Lock Mailer Carton', category: 'Cartons', material: 'E-flute Corrugated', size: '12 × 9 × 4 in', price: 185, moq: 100, image: '/images/category-carton.webp', desc: 'Protective ecommerce mailer with a clean, tape-free presentation.', featured: true, specs: ['3-layer E-flute', 'Crash-lock front', 'Inside/outside print', 'Tear-strip available'] },
  { id: 'shipping-carton', name: 'Heavy-Duty Shipping Carton', category: 'Cartons', material: 'B-flute Corrugated', size: '18 × 14 × 12 in', price: 260, moq: 50, image: '/images/category-carton.webp', desc: 'Stackable transport carton built for demanding supply chains.', specs: ['5-ply option', 'Burst-tested board', 'Flexographic print', 'Custom dimensions'] },
  { id: 'white-corrugated-carton', name: 'Plain White Corrugated Carton', category: 'Cartons', material: 'White Corrugated', size: '12 × 12 × 10 in', price: 230, moq: 50, image: '/images/product-white-carton.webp', desc: 'A clean white shipping carton with a crisp surface for retail, gifting, ecommerce and understated branding.', specs: ['Bright white outer liner', 'Protective corrugated board', 'Plain or minimal one-color print', 'Custom dimensions available'] },
  { id: 'hex-gift-box', name: 'Hexagonal Gift Box', category: 'Custom Packaging', material: 'Rigid Board', size: 'Custom', price: 520, moq: 50, image: '/images/category-custom.webp', desc: 'An architectural rigid box for gifting, beauty and specialty retail.', specs: ['Bespoke structure', 'Magnetic closure option', 'Premium foil finishes', 'Custom foam insert'] },
  { id: 'paper-tube', name: 'Premium Paper Tube', category: 'Custom Packaging', material: 'Recycled Paper', size: 'Custom', price: 310, moq: 100, image: '/images/category-custom.webp', desc: 'Circular packaging for cosmetics, tea, candles and gifting.', specs: ['Recycled paper core', 'Food-safe liner option', 'Embossed wrap', 'Metal-free construction'] },
];

const testimonials = [
  { name: 'Ayesha Malik', company: 'Crumb & Co.', quote: 'Kainat Box Makers translated our rough sketch into packaging that feels genuinely premium. The color consistency and window finish are exceptional.', rating: 5, initials: 'AM' },
  { name: 'Hamza Qureshi', company: 'Slice House', quote: 'Our new pizza boxes hold heat better and arrive perfectly stacked. The turnaround was faster than promised—even on a 20,000 unit run.', rating: 5, initials: 'HQ' },
  { name: 'Sara Ahmed', company: 'Aster Footwear', quote: 'The drawer boxes changed the way customers perceive our brand. Excellent structure, clean foil work, and thoughtful support throughout.', rating: 5, initials: 'SA' },
  { name: 'Usman Tariq', company: 'Northstar Commerce', quote: 'Reliable quality at scale. Their team redesigned our mailer to use less material while improving protection. That is real packaging expertise.', rating: 5, initials: 'UT' },
];

const posts = [
  { slug: 'right-board-for-your-box', title: 'How to choose the right board for your packaging', category: 'Packaging Tips', date: 'August 02, 2026', read: '6 min read', image: '/images/category-carton.webp', excerpt: 'A practical guide to paperboard, kraft, E-flute and B-flute—without the jargon.', content: ['Choosing the right packaging board starts with your product, journey, and brand position—not with thickness alone.', 'Paperboard works beautifully for lighter retail products. Corrugated board adds a fluted layer that absorbs impact, making it ideal for food delivery, ecommerce and shipping. The flute profile changes both strength and print finish.', 'Begin with four questions: How heavy is the product? How far will it travel? Does it need food or moisture resistance? What should the unboxing feel like? A packaging specialist can then engineer the lightest structure that meets those demands.', 'Sampling is essential. Test a production-grade prototype with the actual product before approving a bulk run. This small step prevents avoidable fit, print and logistics issues.'] },
  { slug: 'less-material-more-impact', title: 'Less material, more impact: the new rules of sustainable packaging', category: 'Sustainability', date: 'July 18, 2026', read: '5 min read', image: '/images/category-custom.webp', excerpt: 'Why smart structural design often matters more than an eco label.', content: ['The most sustainable packaging is often the packaging that simply uses less.', 'Right-sizing a box reduces board consumption, shipping volume and filler material all at once. Mono-material construction also makes disposal clearer for customers and improves recyclability in real-world collection systems.', 'Great sustainable design is not about making packaging look plain. Water-based inks, uncoated textures and clever structural reveals can create a premium experience with fewer mixed materials.', 'Ask your supplier for a material reduction review. Small changes to dimensions, flute and locking style can produce meaningful improvements across a high-volume order.'] },
  { slug: 'bakery-rebrand-case-study', title: 'Case study: a bakery box designed to sell the story inside', category: 'Case Studies', date: 'June 26, 2026', read: '4 min read', image: '/images/category-bakery.webp', excerpt: 'How a smarter window, one ink, and a confident structure lifted shelf presence.', content: ['Crumb & Co. needed one packaging family that could work across pastries, cookies and celebration gifting.', 'We reduced the system to three dielines and one forest-green ink. A plant-based window created product visibility, while a shared grid made every size feel unmistakably related.', 'The simplified system reduced setup costs and made reordering easier. Better nesting also increased the number of flat boxes per shipping carton.', 'The outcome was packaging that looked more considered while using fewer components—proof that brand impact and production efficiency can reinforce each other.'] },
];

const pageMeta = {
  '/': ['Custom Packaging Manufacturer', 'Custom boxes, cartons and printed packaging made with precision, speed and sustainable materials.'],
  '/products': ['Shop Custom Boxes & Cartons', 'Browse pizza boxes, shoe boxes, bakery and lollipop packaging, cartons, and fully custom packaging solutions.'],
  '/quote': ['Request a Custom Packaging Quote', 'Tell us your size, quantity, material and print needs for a personal packaging quote.'],
  '/about': ['About Kainat Box Makers', 'Meet the people, purpose and manufacturing capability behind Kainat Box Makers’ custom packaging.'],
  '/services': ['Packaging Manufacturing Services', 'Custom printing, bulk manufacturing, sustainable materials, delivery and packaging design support.'],
  '/blog': ['Packaging Ideas & Insights', 'Practical packaging tips, sustainability guidance, case studies and industry news.'],
  '/testimonials': ['Client Reviews', 'See why restaurants, retailers, bakeries and ecommerce brands trust Kainat Box Makers.'],
  '/contact': ['Contact Kainat Box Makers', 'Contact our packaging specialists in Lahore for custom boxes, samples, lead times and support.'],
  '/checkout': ['Secure Checkout', 'Complete your Kainat Box Makers stock packaging order.'],
};

function useRoute() {
  const [path, setPath] = useState(window.location.pathname || '/');
  useEffect(() => {
    const handler = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return [path, navigate];
}

function Link({ to, children, className = '', onClick, ...rest }) {
  return <a href={to} className={className} onClick={(e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onClick?.();
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }} {...rest}>{children}</a>;
}

function Logo({ light = false }) {
  return <Link to="/" className={`logo ${light ? 'logo-light' : ''}`} aria-label="Kainat Box Makers home">
    <span className="logo-mark" aria-hidden="true"><img src="/kainat-logo-mark.png" alt="" /></span>
    <span className="logo-copy"><strong>Kainat Box Makers</strong><small>Custom Packaging</small></span>
  </Link>;
}

function SEO({ path }) {
  useEffect(() => {
    let title, desc;
    if (path.startsWith('/products/')) {
      const item = products.find(p => path.endsWith(p.id));
      title = item ? `${item.name} | Kainat Box Makers` : 'Custom Packaging Product | Kainat Box Makers';
      desc = item?.desc || pageMeta['/products'][1];
    } else if (path.startsWith('/blog/')) {
      const post = posts.find(p => path.endsWith(p.slug));
      title = post ? `${post.title} | Kainat Box Makers Journal` : 'Packaging Journal | Kainat Box Makers';
      desc = post?.excerpt || pageMeta['/blog'][1];
    } else {
      const entry = pageMeta[path] || pageMeta['/'];
      title = `${entry[0]} | Kainat Box Makers`;
      desc = entry[1];
    }
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://kainatboxmakers.com${path}`);

    const oldSchema = document.getElementById('page-schema');
    oldSchema?.remove();
    let schema = null;
    if (path.startsWith('/products/')) {
      const item = products.find(p => path.endsWith(p.id));
      if (item) schema = {
        '@context': 'https://schema.org', '@type': 'Product', name: item.name,
        image: `https://kainatboxmakers.com${item.image}`, description: item.desc,
        sku: item.id, brand: { '@type': 'Brand', name: 'Kainat Box Makers' },
        offers: { '@type': 'Offer', priceCurrency: 'PKR', price: item.price, availability: 'https://schema.org/InStock', url: `https://kainatboxmakers.com/products/${item.id}` },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '24' }
      };
    } else if (path.startsWith('/blog/')) {
      const post = posts.find(p => path.endsWith(p.slug));
      if (post) schema = {
        '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title,
        description: post.excerpt, image: `https://kainatboxmakers.com${post.image}`,
        author: { '@type': 'Organization', name: 'Kainat Studio' },
        publisher: { '@type': 'Organization', name: 'Kainat Box Makers' },
        datePublished: '2026-08-02', mainEntityOfPage: `https://kainatboxmakers.com/blog/${post.slug}`
      };
    }
    if (schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json'; script.id = 'page-schema';
      script.textContent = JSON.stringify(schema); document.head.appendChild(script);
    }
  }, [path]);
  return null;
}

function Header({ path, cartCount, openCart }) {
  const [open, setOpen] = useState(false);
  const nav = [['Products', '/products'], ['Services', '/services'], ['About', '/about'], ['Journal', '/blog'], ['Reviews', '/testimonials'], ['Contact', '/contact']];
  useEffect(() => setOpen(false), [path]);
  return <>
    <div className="announcement">
      <div className="container announcement-inner">
        <span><Leaf size={14} /> FSC-conscious materials & responsible inks</span>
        <span className="announcement-right"><Phone size={14} /> {BRAND.phone} <i></i> Free structural consultation</span>
      </div>
    </div>
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className={`main-nav ${open ? 'open' : ''}`} aria-label="Main navigation">
          {nav.map(([label, to]) => <Link key={to} to={to} className={path === to || (to === '/products' && path.startsWith('/products')) || (to === '/blog' && path.startsWith('/blog')) ? 'active' : ''}>{label}</Link>)}
          <Link to="/quote" className="btn btn-dark nav-quote">Get a quote <ArrowRight size={16}/></Link>
        </nav>
        <div className="header-actions">
          <button className="icon-btn cart-trigger" onClick={openCart} aria-label={`Open cart with ${cartCount} items`}><ShoppingBag size={20}/>{cartCount > 0 && <span>{cartCount}</span>}</button>
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X/> : <Menu/>}</button>
        </div>
      </div>
    </header>
  </>
}

function Footer({ showToast }) {
  const [email, setEmail] = useState('');
  const submit = (e) => { e.preventDefault(); if (!email) return; saveSubmission('newsletter', {email}); setEmail(''); showToast('You’re on the list. Welcome to better packaging.'); };
  return <footer className="footer">
    <div className="footer-top container">
      <div className="footer-intro"><Logo light/><p>Purpose-built packaging for brands that care how they arrive.</p><div className="socials"><a href="#" aria-label="Instagram"><Instagram/></a><a href="#" aria-label="LinkedIn"><Linkedin/></a><a href="#" aria-label="Facebook"><Facebook/></a></div></div>
      <div className="footer-column"><h3>Explore</h3><Link to="/products">Products</Link><Link to="/services">Capabilities</Link><Link to="/about">Our story</Link><Link to="/blog">Journal</Link></div>
      <div className="footer-column"><h3>Support</h3><Link to="/quote">Request a quote</Link><Link to="/contact">Contact</Link><Link to="/testimonials">Client reviews</Link><a href="mailto:hello@kainatboxmakers.com">Artwork guide</a></div>
      <div className="footer-news"><span className="eyebrow light">THE GOOD EDIT</span><h3>Useful packaging ideas, occasionally.</h3><form onSubmit={submit}><label className="sr-only" htmlFor="footer-email">Email address</label><input id="footer-email" type="email" required placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/><button aria-label="Subscribe"><ArrowRight/></button></form><small>No noise. Unsubscribe anytime.</small></div>
    </div>
    <div className="footer-bottom container"><span>© 2026 Kainat Box Makers.</span><div><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><span>Made responsibly in Lahore.</span></div></div>
  </footer>
}

function WhatsApp() {
  const text = encodeURIComponent("Hi, I'm interested in custom packaging. Please share more details.");
  return <a className="whatsapp" href={`https://wa.me/${BRAND.phoneRaw}?text=${text}`} target="_blank" rel="noreferrer" aria-label="Chat with Kainat Box Makers on WhatsApp"><MessageCircle/><span>Let’s talk packaging</span></a>
}

function TrustBar() {
  const items = [[ShieldCheck, 'Secure checkout'], [Truck, 'Nationwide delivery'], [Leaf, 'Eco-conscious stock'], [Award, '15+ years’ craft']];
  return <div className="trust-bar"><div className="container trust-grid">{items.map(([Icon, t])=><div key={t}><Icon/><span>{t}</span></div>)}</div></div>
}

function MotionStory() {
  const root = useRef(null);
  const stage = useRef(null);
  useEffect(() => {
    const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
    const range = (p, a, b) => clamp((p - a) / (b - a));
    const ease = n => n * n * n * (n * (n * 6 - 15) + 10);
    const lerp = (a, b, n) => a + (b - a) * n;
    const getProgress = () => {
      if (!root.current) return 0;
      const rect = root.current.getBoundingClientRect();
      const travel = Math.max(1, root.current.offsetHeight - window.innerHeight);
      return clamp(-rect.top / travel);
    };
    let target = getProgress();
    let current = target;
    let frame = 0;
    let lastTime = performance.now();

    const paint = (p) => {
      if (!stage.current) return;
      const rise = ease(range(p, .02, .18));
      const returnShoe = ease(range(p, .22, .38));
      const shoeExit = ease(range(p, .4, .54));
      const pizzaEnter = ease(range(p, .43, .6));
      const pizzaDrop = ease(range(p, .61, .77));
      const pizzaExit = ease(range(p, .8, .93));
      const finale = ease(range(p, .84, .98));
      const introCopy = 1 - ease(range(p, .08, .17));
      const shoeCopy = Math.min(ease(range(p, .12, .2)), 1 - ease(range(p, .34, .43)));
      const pizzaCopy = Math.min(ease(range(p, .47, .56)), 1 - ease(range(p, .75, .84)));
      const s = stage.current.style;
      s.setProperty('--motion-progress', p.toFixed(5));
      s.setProperty('--shoe-y', `${(lerp(155, -150, rise) + lerp(0, 305, returnShoe)).toFixed(2)}px`);
      s.setProperty('--shoe-x', `${lerp(0, -1100, shoeExit).toFixed(2)}px`);
      s.setProperty('--shoe-r', `${(lerp(-12, 7, rise) + lerp(0, -19, returnShoe)).toFixed(3)}deg`);
      s.setProperty('--shoe-scale', (lerp(.72, 1.05, rise) - lerp(0, .33, returnShoe)).toFixed(4));
      s.setProperty('--shoe-alpha', (1 - ease(range(p, .43, .52))).toFixed(4));
      s.setProperty('--shoebox-x', `${lerp(0, -1150, shoeExit).toFixed(2)}px`);
      s.setProperty('--shoebox-r', `${lerp(0, -15, shoeExit).toFixed(3)}deg`);
      s.setProperty('--shoe-scene-alpha', (1 - ease(range(p, .45, .54))).toFixed(4));
      s.setProperty('--pizza-x', `${(lerp(1150, 0, pizzaEnter) + lerp(0, -650, pizzaExit)).toFixed(2)}px`);
      s.setProperty('--pizza-y', `${(lerp(-310, -180, pizzaEnter) + lerp(0, 255, pizzaDrop)).toFixed(2)}px`);
      s.setProperty('--pizza-r', `${(lerp(22, -6, pizzaEnter) + lerp(0, 6, pizzaDrop)).toFixed(3)}deg`);
      s.setProperty('--pizza-scale', (lerp(.7, 1.02, pizzaEnter) - lerp(0, .28, pizzaDrop)).toFixed(4));
      s.setProperty('--pizza-alpha', Math.min(pizzaEnter, 1 - ease(range(p, .85, .94))).toFixed(4));
      s.setProperty('--pizzabox-x', `${(lerp(1150, 0, pizzaEnter) + lerp(0, -650, pizzaExit)).toFixed(2)}px`);
      s.setProperty('--pizzabox-r', `${(lerp(13, 0, pizzaEnter) + lerp(0, -12, pizzaExit)).toFixed(3)}deg`);
      s.setProperty('--intro-copy', introCopy.toFixed(4));
      s.setProperty('--shoe-copy', shoeCopy.toFixed(4));
      s.setProperty('--pizza-copy', pizzaCopy.toFixed(4));
      s.setProperty('--finale', finale.toFixed(4));
      const scene = p < .16 ? 'intro' : p < .45 ? 'shoe' : p < .82 ? 'pizza' : 'finale';
      if (stage.current.dataset.scene !== scene) stage.current.dataset.scene = scene;
    };

    const tick = (time) => {
      const dt = Math.min(64, Math.max(8, time - lastTime));
      lastTime = time;
      const smoothing = 1 - Math.exp(-dt / 72);
      current += (target - current) * smoothing;
      if (Math.abs(target - current) < .00008) current = target;
      paint(current);
      if (current !== target) frame = requestAnimationFrame(tick);
      else frame = 0;
    };
    const update = () => {
      target = getProgress();
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    paint(current);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return <section className="motion-story" ref={root} aria-label="Scroll-controlled packaging showcase">
    <div className="motion-stage" ref={stage} data-scene="intro">
      <div className="motion-grid"></div><div className="motion-glow"></div>
      <div className="motion-topline"><span>KA / PACKAGING IN MOTION</span><span>SCROLL TO DIRECT THE STORY</span></div>
      <div className="motion-copy motion-copy-intro"><span className="eyebrow">NOT A STATIC BOX</span><h2>Your product<br/>sets the <em>motion.</em></h2><p>Keep scrolling. Every movement has been designed around the product inside.</p></div>
      <div className="motion-copy motion-copy-shoe"><span className="motion-number">01 / 03</span><span className="eyebrow">PRECISION FIT</span><h2>Lift the<br/><em>experience.</em></h2><p>The product rises. The structure stays steady. Protection and presentation, moving as one.</p></div>
      <div className="motion-copy motion-copy-pizza"><span className="motion-number">02 / 03</span><span className="eyebrow">FRESH BY DESIGN</span><h2>Made to arrive<br/><em>just right.</em></h2><p>Heat, airflow and board strength engineered into one smooth delivery experience.</p></div>
      <div className="motion-scene motion-shoe-scene">
        <div className="motion-shadow shoe-shadow"></div>
        <img className="motion-shoebox" src="/images/motion-shoebox.webp" alt="Open Kainat Box Makers shoe box" />
        <img className="motion-shoe" src="/images/motion-shoe.webp" alt="Premium shoe moving into its custom box" />
      </div>
      <div className="motion-scene motion-pizza-scene">
        <div className="motion-shadow pizza-shadow"></div>
        <img className="motion-pizzabox" src="/images/motion-pizzabox.webp" alt="Open KA branded pizza box" />
        <img className="motion-pizza" src="/images/motion-pizza.webp" alt="Pizza moving into its custom delivery box" />
      </div>
      <div className="motion-finale">
        <div className="motion-finale-copy"><span className="motion-number">03 / 03</span><span className="eyebrow light">ONE MAKER. EVERY FORMAT.</span><h2>Now imagine<br/><em>your product.</em></h2><p>From food to footwear and everything in between—built around what you make.</p><Link to="/quote" className="btn btn-accent">Create your packaging <ArrowRight/></Link></div>
        <div className="finale-stack"><img src="/images/category-bakery.webp" alt="KA bakery box"/><img src="/images/category-carton.webp" alt="KA shipping cartons"/><img src="/images/category-custom.webp" alt="KA custom packaging"/></div>
      </div>
      <div className="motion-rail"><span>01</span><i><b></b></i><span>03</span></div>
      <div className="motion-hint"><ChevronDown/> KEEP SCROLLING</div>
    </div>
  </section>
}

function Toast({ message, close }) {
  useEffect(() => { const t = setTimeout(close, 3600); return () => clearTimeout(t); }, [message]);
  return <div className="toast"><CheckCircle2/><span>{message}</span><button onClick={close}><X size={16}/></button></div>
}

function Reveal({ children, className = '' }) {
  const ref = useRef();
  useEffect(() => {
    const node = ref.current;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { node.classList.add('revealed'); obs.disconnect(); } }, { threshold: .12 });
    if (node) obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}

function SectionHeading({ eyebrow, title, text, center = false, action }) {
  return <div className={`section-heading ${center ? 'center' : ''}`}>
    <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>{action}
  </div>
}

function Hero() {
  return <section className="hero">
    <div className="hero-paper"></div>
    <div className="container hero-grid">
      <div className="hero-copy">
        <span className="eyebrow"><i></i> MANUFACTURED AROUND YOUR BRAND</span>
        <h1>Packaging that<br/>makes an <em>entrance.</em></h1>
        <p>Thoughtfully engineered boxes, cartons and retail packaging—built to protect, designed to be remembered.</p>
        <div className="hero-actions"><Link to="/quote" className="btn btn-accent">Build your box <ArrowRight/></Link><Link to="/products" className="text-link">Explore products <span>↗</span></Link></div>
        <div className="hero-proof"><div className="proof-avatars"><span>AM</span><span>HQ</span><span>SA</span></div><div><div className="stars">★★★★★</div><p><strong>4.9/5</strong> from 180+ growing brands</p></div></div>
      </div>
      <div className="hero-visual">
        <div className="image-stage"><img src="/images/packforge-hero.webp" alt="Collection of Kainat Box Makers custom pizza, shoe, bakery and shipping boxes" /></div>
        <div className="float-card float-material"><Leaf/><div><small>MATERIAL</small><strong>FSC-conscious kraft</strong></div></div>
        <div className="float-card float-moq"><small>MOQ FROM</small><strong>50 <span>units</span></strong></div>
      </div>
    </div>
    <div className="container hero-foot"><div><strong>15+</strong><span>years of making</span></div><div><strong>4.8M</strong><span>boxes delivered</span></div><div><strong>98%</strong><span>on-time dispatch</span></div><a href="#categories">Scroll to discover <ChevronDown/></a></div>
  </section>
}

function CategoryCard({ cat, index }) {
  return <Reveal className={`category-card card-${index}`}>
    <Link to={`/products?category=${encodeURIComponent(cat.name)}`}>
      <div className="category-image"><img src={cat.image} alt={`${cat.name} custom packaging`} loading="lazy"/><span className="category-index">0{index + 1}</span></div>
      <div className="category-copy"><span>{cat.kicker}</span><h3>{cat.name}</h3><p>{cat.blurb}</p><b>View range <ArrowRight size={16}/></b></div>
    </Link>
  </Reveal>
}

function Process() {
  const steps = [
    ['01', Ruler, 'Scope it', 'Share dimensions, use, quantity and the feeling your box should create.'],
    ['02', Palette, 'Shape it', 'We develop the dieline, structure, material and artwork with you.'],
    ['03', Factory, 'Make it', 'Your approved design moves through controlled print and production.'],
    ['04', Truck, 'Deliver it', 'Flat-packed or assembled, quality checked and dispatched on schedule.'],
  ];
  return <section className="section process-section"><div className="container"><SectionHeading eyebrow="A CLEARER WAY TO CUSTOM" title={<>From first sketch to<br/><em>finished box.</em></>} text="One specialist keeps the process simple from brief to delivery."/><div className="process-line">{steps.map(([n, Icon, title, text])=><Reveal className="process-step" key={n}><span>{n}</span><div className="process-icon"><Icon/></div><h3>{title}</h3><p>{text}</p></Reveal>)}</div></div></section>
}

function WhyUs() {
  const items = [
    [ShieldCheck, 'Quality without shortcuts', 'Production checks at print, cut, fold and final pack-out.'],
    [Printer, 'Print that stays true', 'Pantone, CMYK, foil, emboss and water-based ink options.'],
    [Zap, 'Fast, honest lead times', 'Clear milestones and dependable production planning.'],
    [Package, 'Built for volume', 'Stable quality from 50 prototypes to high-volume repeat runs.'],
    [Leaf, 'Lighter on resources', 'Recycled content, right-sizing and recyclable structures.'],
    [Headphones, 'A person, not a portal', 'A named packaging specialist from enquiry to delivery.'],
  ];
  return <section className="section why-section"><div className="container"><SectionHeading eyebrow="WHY KAINAT" title={<>Details matter.<br/><em>So we mind every one.</em></>} text="We blend practical engineering with thoughtful design to create packaging that performs at every touchpoint."/><div className="why-layout"><div className="why-image"><img src="/images/category-custom.webp" alt="Premium range of custom Kainat Box Makers packaging" loading="lazy"/><div className="why-stamp"><Award/><strong>15 YEARS</strong><span>PACKAGING CRAFT</span></div></div><div className="why-grid">{items.map(([Icon,t,p])=><Reveal className="why-card" key={t}><Icon/><div><h3>{t}</h3><p>{p}</p></div></Reveal>)}</div></div></div></section>
}

function ProductCard({ product, addToCart }) {
  return <article className="product-card">
    <Link to={`/products/${product.id}`} className="product-image"><img src={product.image} alt={product.name} loading="lazy"/>{product.featured && <span className="pill">Bestseller</span>}<span className="quick-view">View details <ArrowRight size={15}/></span></Link>
    <div className="product-info"><span>{product.category}</span><Link to={`/products/${product.id}`}><h3>{product.name}</h3></Link><p>{product.desc}</p><div className="product-bottom"><div><small>FROM</small><strong>PKR {product.price.toLocaleString()} <i>/ unit</i></strong></div><button onClick={()=>addToCart(product)} aria-label={`Add ${product.name} to cart`}><Plus/></button></div></div>
  </article>
}

function FeaturedProducts({ addToCart }) {
  return <section className="section featured-products"><div className="container"><SectionHeading eyebrow="READY WHEN YOU ARE" title={<>Popular boxes,<br/><em>production ready.</em></>} action={<Link to="/products" className="text-link">Shop all products <ArrowRight/></Link>}/><div className="product-grid">{products.filter(p=>p.featured).slice(0,4).map(p=><ProductCard key={p.id} product={p} addToCart={addToCart}/>)}</div></div></section>
}

function TestimonialSlider() {
  const [index, setIndex] = useState(0);
  useEffect(()=>{ const timer=setInterval(()=>setIndex(i=>(i+1)%testimonials.length),6500); return()=>clearInterval(timer)},[]);
  const next = d => setIndex(i=>(i+d+testimonials.length)%testimonials.length);
  const t = testimonials[index];
  return <section className="testimonial-section"><div className="container testimonial-wrap"><div className="testimonial-side"><span className="eyebrow light">TRUSTED IN THE REAL WORLD</span><h2>Made for business.<br/><em>Loved by people.</em></h2><div className="testimonial-controls"><button onClick={()=>next(-1)} aria-label="Previous testimonial"><ChevronLeft/></button><span>{String(index+1).padStart(2,'0')} / {String(testimonials.length).padStart(2,'0')}</span><button onClick={()=>next(1)} aria-label="Next testimonial"><ChevronRight/></button></div></div><div className="testimonial-card" key={index}><QuoteIcon/><div className="stars">★★★★★</div><blockquote>“{t.quote}”</blockquote><div className="reviewer"><span>{t.initials}</span><div><strong>{t.name}</strong><small>{t.company}</small></div></div></div></div></section>
}

function JournalTeaser() {
  return <section className="section journal-teaser"><div className="container"><SectionHeading eyebrow="FIELD NOTES" title={<>Ideas for better<br/><em>packaging decisions.</em></>} action={<Link to="/blog" className="text-link">Visit the journal <ArrowRight/></Link>}/><div className="post-grid">{posts.map((post,i)=><article className={`post-card post-${i}`} key={post.slug}><Link to={`/blog/${post.slug}`}><div className="post-image"><img src={post.image} alt={post.title} loading="lazy"/><span>{post.category}</span></div><div className="post-copy"><small>{post.date} · {post.read}</small><h3>{post.title}</h3><p>{post.excerpt}</p><b>Read article <ArrowRight size={16}/></b></div></Link></article>)}</div></div></section>
}

function QuoteBanner() {
  return <section className="quote-banner"><div className="quote-pattern"></div><div className="container quote-banner-inner"><div><span className="eyebrow light">YOUR PRODUCT. YOUR BOX.</span><h2>Ready to make something<br/><em>worth opening?</em></h2></div><div><p>Tell us what you’re packing. A specialist will reply with practical options and clear pricing within one business day.</p><Link to="/quote" className="btn btn-accent">Start your custom quote <ArrowRight/></Link></div></div></section>
}

function Home({ addToCart }) {
  return <><Hero/><TrustBar/><MotionStory/><section className="section categories" id="categories"><div className="container"><SectionHeading eyebrow="WHAT WE MAKE" title={<>One partner.<br/><em>Every kind of box.</em></>} text="Stock formats for speed. Fully custom structures for everything else."/><div className="category-grid">{categories.map((c,i)=><CategoryCard key={c.slug} cat={c} index={i}/>)}</div></div></section><Process/><WhyUs/><FeaturedProducts addToCart={addToCart}/><TestimonialSlider/><JournalTeaser/><QuoteBanner/></>
}

function PageHero({ eyebrow, title, text, dark=false, children }) {
  return <section className={`page-hero ${dark?'dark':''}`}><div className="page-hero-noise"></div><div className="container page-hero-inner"><div><span className={`eyebrow ${dark?'light':''}`}>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{children}</div></section>
}

function ProductsPage({ addToCart }) {
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(params.get('category') || 'All products');
  const [material, setMaterial] = useState('All materials');
  const [sort, setSort] = useState('Featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = useMemo(()=>{
    let list=products.filter(p=>(category==='All products'||p.category===category)&&(material==='All materials'||p.material===material)&&(p.name+' '+p.desc).toLowerCase().includes(search.toLowerCase()));
    if(sort==='Price: low to high') list=[...list].sort((a,b)=>a.price-b.price);
    if(sort==='Price: high to low') list=[...list].sort((a,b)=>b.price-a.price);
    if(sort==='MOQ: low to high') list=[...list].sort((a,b)=>a.moq-b.moq);
    return list;
  },[search,category,material,sort]);
  const materials=['All materials',...new Set(products.map(p=>p.material))];
  return <><PageHero eyebrow="THE PRODUCT FLOOR" title={<>Find your<br/><em>perfect format.</em></>} text="Production-ready staples and beautifully engineered custom options—all made to carry your brand well."><div className="hero-mini-stat"><strong>13+</strong><span>core formats<br/>∞ custom possibilities</span></div></PageHero>
  <section className="shop-section"><div className="container"><div className="shop-toolbar"><div className="product-search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search boxes, uses, materials…" aria-label="Search products"/></div><button className="filter-toggle" onClick={()=>setFiltersOpen(!filtersOpen)}><SlidersHorizontal/> Filters</button><label className="sort"><span>Sort by</span><select value={sort} onChange={e=>setSort(e.target.value)}><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option><option>MOQ: low to high</option></select><ChevronDown/></label></div><div className="shop-layout"><aside className={filtersOpen?'open':''}><div className="filter-head"><strong>Filter products</strong><button onClick={()=>setFiltersOpen(false)}><X/></button></div><div className="filter-group"><h3>Category</h3>{['All products',...categories.map(c=>c.name)].map(c=><label key={c}><input type="radio" name="cat" checked={category===c} onChange={()=>setCategory(c)}/><span>{c}</span><small>{c==='All products'?products.length:products.filter(p=>p.category===c).length}</small></label>)}</div><div className="filter-group"><h3>Material</h3>{materials.map(m=><label key={m}><input type="radio" name="material" checked={material===m} onChange={()=>setMaterial(m)}/><span>{m}</span></label>)}</div><div className="filter-help"><MessageCircle/><strong>Not seeing your box?</strong><p>We can build it from scratch.</p><Link to="/quote">Talk to a specialist</Link></div></aside><main className="shop-results"><div className="result-head"><p><strong>{filtered.length}</strong> products</p>{(category!=='All products'||material!=='All materials'||search)&&<button onClick={()=>{setCategory('All products');setMaterial('All materials');setSearch('')}}>Clear filters <X/></button>}</div>{filtered.length?<div className="product-grid shop-grid">{filtered.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart}/>)}</div>:<div className="empty-results"><Box/><h2>No boxes found</h2><p>Try a broader search, or let us create exactly what you need.</p><Link to="/quote" className="btn btn-dark">Request a custom quote</Link></div>}</main></div></div></section><QuoteBanner/></>
}

function ProductDetail({ id, addToCart }) {
  const p=products.find(item=>item.id===id);
  const [qty,setQty]=useState(p?.moq||1);
  const [finish,setFinish]=useState('Natural kraft');
  if(!p) return <NotFound/>;
  return <><div className="breadcrumb container"><Link to="/">Home</Link><span>/</span><Link to="/products">Products</Link><span>/</span><b>{p.name}</b></div><section className="product-detail container"><div className="detail-gallery"><div className="detail-main"><img src={p.image} alt={p.name}/><span className="detail-tag">Made to order</span></div><div className="detail-thumbs"><button className="selected"><img src={p.image} alt={`${p.name} front view`}/></button><button><img src={p.image} alt={`${p.name} angle view`}/></button><button className="swatch-thumb"><span>KRAFT</span></button></div></div><div className="detail-copy"><span className="eyebrow">{p.category}</span><h1>{p.name}</h1><div className="detail-rating"><span>★★★★★</span><b>4.9</b><a href="#reviews">24 verified reviews</a></div><p className="detail-desc">{p.desc} Built to your brand standards with dependable board, precise cutting and rich print.</p><div className="price-line"><strong>PKR {p.price.toLocaleString()}</strong><span>/ unit from {p.moq} units</span></div><div className="option-block"><div><label>Finish</label><small>Selected: {finish}</small></div><div className="finish-options">{['Natural kraft','Forest green','Brilliant white'].map((f,i)=><button key={f} onClick={()=>setFinish(f)} className={finish===f?'selected':''}><i className={`finish-${i}`}></i>{f}</button>)}</div></div><div className="option-block"><div><label>Size</label><a href="mailto:hello@kainatboxmakers.com">Need a custom size?</a></div><select defaultValue={p.size}><option>{p.size}</option><option>Custom dimensions</option></select></div><div className="detail-buy"><div className="qty"><button onClick={()=>setQty(Math.max(p.moq,qty-p.moq))}><Minus/></button><span>{qty}</span><button onClick={()=>setQty(qty+p.moq)}><Plus/></button></div><button className="btn btn-dark" onClick={()=>addToCart(p,qty)}>Add {qty} to cart <ShoppingBag/></button></div><Link to="/quote" className="custom-quote-link"><FileUp/> Custom print, size or structure? <b>Request a tailored quote</b><ArrowRight/></Link><div className="detail-trust"><span><CircleCheck/> Production proof included</span><span><Clock3/> Typical lead time 10–15 days</span><span><Truck/> Nationwide delivery</span></div></div></section><section className="detail-spec-section"><div className="container"><div><span className="eyebrow">PRODUCT SPECIFICATION</span><h2>Built to perform.<br/><em>Finished to impress.</em></h2></div><div className="spec-table"><div><span>Material</span><strong>{p.material}</strong></div><div><span>Standard size</span><strong>{p.size}</strong></div><div><span>Minimum order</span><strong>{p.moq} units</strong></div><div><span>Print options</span><strong>Flexo, CMYK, Pantone</strong></div>{p.specs.map((s,i)=><div key={s}><span>Feature {String(i+1).padStart(2,'0')}</span><strong>{s}</strong></div>)}</div></div></section><section className="section related"><div className="container"><SectionHeading eyebrow="YOU MAY ALSO LIKE" title="More ways to pack it."/><div className="product-grid">{products.filter(x=>x.id!==p.id).slice(0,4).map(x=><ProductCard key={x.id} product={x} addToCart={addToCart}/>)}</div></div></section></>
}

function Field({ label, required, children, hint, full=false }) { return <label className={`field ${full?'full':''}`}><span>{label}{required&&<b>*</b>}</span>{children}{hint&&<small>{hint}</small>}</label> }

function QuotePage({ showToast }) {
  const [step,setStep]=useState(1); const [file,setFile]=useState(null); const [submitted,setSubmitted]=useState(false);
  const [form,setForm]=useState({boxType:'Pizza Boxes',quantity:'500 – 1,000',material:'Recommend for me'});
  const update=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=e=>{e.preventDefault();saveSubmission('quotes',{...form,artworkName:file?.name,_file:file});setSubmitted(true);showToast('Quote brief received. We’ll be in touch within one business day.');};
  if(submitted) return <section className="success-page"><div><span className="success-icon"><Check/></span><span className="eyebrow">BRIEF RECEIVED</span><h1>We’re already<br/><em>thinking in boxes.</em></h1><p>Thank you, {form.name}. A Kainat Box Makers packaging specialist will review your brief and contact you within one business day.</p><div className="success-ref">REFERENCE <strong>KAQ-{new Date().getFullYear()}-{String(Date.now()).slice(-5)}</strong></div><Link to="/" className="btn btn-dark">Back to home <ArrowRight/></Link></div></section>;
  return <><PageHero dark eyebrow="LET’S BUILD YOUR BOX" title={<>A better quote starts<br/>with a <em>better brief.</em></>} text="Share what you know. Skip what you don’t. A real packaging specialist will take it from there."><div className="quote-promise"><Headphones/><div><strong>Handled personally</strong><span>No bots. No auto-pricing. Thoughtful options from a packaging specialist.</span></div></div></PageHero><section className="quote-form-section"><div className="container quote-layout"><aside><div className={`quote-step ${step===1?'active':''}`}><span>01</span><div><strong>Your packaging</strong><small>Format, size & quantity</small></div></div><div className={`quote-step ${step===2?'active':''}`}><span>02</span><div><strong>Print & finish</strong><small>Materials & artwork</small></div></div><div className={`quote-step ${step===3?'active':''}`}><span>03</span><div><strong>Your details</strong><small>Where to send the quote</small></div></div><div className="aside-help"><MessageCircle/><h3>Prefer a conversation?</h3><p>Message our team and we’ll help shape the brief with you.</p><a href={`https://wa.me/${BRAND.phoneRaw}`} target="_blank" rel="noreferrer">Chat on WhatsApp <ArrowRight/></a></div></aside><form className="quote-form" onSubmit={submit}>
  {step===1&&<div className="form-step"><div className="form-title"><span>STEP 01 OF 03</span><h2>What are we making?</h2><p>Estimates are welcome. We can refine every detail together.</p></div><div className="choice-grid">{categories.map(c=><button type="button" key={c.name} className={form.boxType===c.name?'selected':''} onClick={()=>setForm({...form,boxType:c.name})}><img src={c.image} alt=""/><span>{c.name}</span>{form.boxType===c.name&&<Check/>}</button>)}</div><div className="form-grid"><Field label="Dimensions" hint="Length × Width × Height"><input name="size" value={form.size||''} onChange={update} placeholder="e.g. 12 × 10 × 4 inches"/></Field><Field label="Approx. quantity" required><select name="quantity" value={form.quantity} onChange={update}><option>50 – 100</option><option>100 – 500</option><option>500 – 1,000</option><option>1,000 – 5,000</option><option>5,000+</option></select></Field></div><button type="button" className="btn btn-dark form-next" onClick={()=>setStep(2)}>Continue to print & finish <ArrowRight/></button></div>}
  {step===2&&<div className="form-step"><div className="form-title"><span>STEP 02 OF 03</span><h2>How should it look & feel?</h2><p>Upload finished artwork or simply tell us the direction.</p></div><div className="form-grid"><Field label="Preferred material" required><select name="material" value={form.material} onChange={update}><option>Recommend for me</option><option>Natural Kraft</option><option>White Paperboard</option><option>Corrugated Board</option><option>Rigid Board</option><option>Recycled Paper</option></select></Field><Field label="Printing"><select name="printing" value={form.printing||''} onChange={update}><option value="">Select print style</option><option>1–2 color flexo</option><option>Full color CMYK</option><option>Pantone spot color</option><option>No print / plain</option></select></Field><Field label="Special finishes" full><div className="checkbox-row">{['Foil stamping','Embossing','Spot UV','Window','Custom insert'].map(x=><label key={x}><input type="checkbox" onChange={e=>{const arr=form.finishes||[];setForm({...form,finishes:e.target.checked?[...arr,x]:arr.filter(y=>y!==x)})}}/><span>{x}</span></label>)}</div></Field><Field label="Artwork / reference file" hint="PDF, AI, EPS, JPG or PNG — up to 10MB" full><label className="upload-zone"><input type="file" accept=".pdf,.ai,.eps,.jpg,.jpeg,.png" onChange={e=>setFile(e.target.files[0])}/><Upload/><strong>{file?file.name:'Drop artwork here or browse'}</strong><span>{file?'Click to replace file':'You can also send artwork after the quote'}</span></label></Field><Field label="Design or printing notes" full><textarea name="design" value={form.design||''} onChange={update} rows="4" placeholder="Colors, finishes, artwork status, inspiration…"></textarea></Field></div><div className="form-nav"><button type="button" onClick={()=>setStep(1)}>Back</button><button type="button" className="btn btn-dark" onClick={()=>setStep(3)}>Continue to your details <ArrowRight/></button></div></div>}
  {step===3&&<div className="form-step"><div className="form-title"><span>STEP 03 OF 03</span><h2>Where should we send it?</h2><p>Your specialist may call to confirm details before pricing.</p></div><div className="form-grid"><Field label="Full name" required><input required name="name" value={form.name||''} onChange={update} placeholder="Your name"/></Field><Field label="Company / brand"><input name="company" value={form.company||''} onChange={update} placeholder="Company name"/></Field><Field label="Work email" required><input required type="email" name="email" value={form.email||''} onChange={update} placeholder="you@company.com"/></Field><Field label="Phone / WhatsApp" required><input required type="tel" name="phone" value={form.phone||''} onChange={update} placeholder="+92 300 0000000"/></Field><Field label="Delivery city / country"><input name="location" value={form.location||''} onChange={update} placeholder="e.g. Lahore, Pakistan"/></Field><Field label="Ideal delivery date"><input name="date" type="date" value={form.date||''} onChange={update}/></Field><Field label="Anything else?" full><textarea name="notes" value={form.notes||''} onChange={update} rows="4" placeholder="Additional context, recurring order schedule, target budget…"></textarea></Field></div><div className="privacy-note"><LockKeyhole/><span>Your information and artwork stay private and are only used to prepare your quote.</span></div><div className="form-nav"><button type="button" onClick={()=>setStep(2)}>Back</button><button className="btn btn-accent" type="submit">Send my packaging brief <Send/></button></div></div>}
  </form></div></section></>
}

function AboutPage() {
  const values=[[Ruler,'Engineered with intent','Every fold, flute and finish has a job to do.'],[HeartHandshake,'Business made human','Clear advice, honest timelines and one accountable team.'],[Leaf,'Progress over promises','Practical material reduction and more recyclable structures.']];
  return <><PageHero eyebrow="OUR STORY" title={<>We don’t just make boxes.<br/><em>We make arrivals.</em></>} text="Kainat Box Makers is an independent packaging manufacturer helping ambitious brands look considered, travel safely and scale confidently."><div className="hero-mini-stat"><strong>2011</strong><span>Founded in<br/>Lahore, Pakistan</span></div></PageHero><section className="section story-section"><div className="container story-grid"><div><span className="eyebrow">FROM A SINGLE DIE-CUTTER</span><h2>Built on craft.<br/><em>Growing on trust.</em></h2></div><div className="story-copy"><p className="lead">Kainat Box Makers began with a simple belief: good packaging should be practical to produce, honest to price, and impossible to overlook.</p><p>What started as a small converting workshop has grown into a multi-category packaging partner for food, retail, footwear and ecommerce brands. We still work the same way—listen closely, engineer carefully and take responsibility for the finished result.</p><p>Our team brings structural designers, print specialists and production craft under one roof, so fewer details get lost between idea and delivery.</p><div className="signature">Aamir Raza <span>Founder & Managing Director</span></div></div></div></section><section className="factory-section"><div className="container factory-grid"><div className="factory-main"><img src="/images/kainat-factory.webp" alt="Kainat Box Makers corrugated carton manufacturing floor in Lahore"/><span>Our Lahore production floor</span></div><div className="capability-card"><span className="eyebrow light">CAPABILITY AT A GLANCE</span><div><strong>45k</strong><small>units / day capacity</small></div><div><strong>6</strong><small>production lines</small></div><div><strong>3</strong><small>quality gates</small></div><div><strong>24/7</strong><small>shift capability</small></div></div></div></section><section className="section values-section"><div className="container"><SectionHeading center eyebrow="WHAT GUIDES US" title={<>Made by people who<br/><em>care how it turns out.</em></>}/><div className="value-grid">{values.map(([Icon,t,p],i)=><Reveal className="value-card" key={t}><span>0{i+1}</span><Icon/><h3>{t}</h3><p>{p}</p></Reveal>)}</div></div></section><section className="cert-section"><div className="container cert-grid"><div><span className="eyebrow">QUALITY & RESPONSIBILITY</span><h2>Standards you can<br/><em>build a brand on.</em></h2><p>Our quality systems follow documented checks from incoming board to final dispatch. Material certificates and food-contact documentation are available by specification.</p><Link to="/contact" className="text-link">Request compliance documents <ArrowRight/></Link></div><div className="cert-list"><div><ShieldCheck/><strong>ISO-aligned quality processes</strong><span>Documented production and inspection workflow</span></div><div><Leaf/><strong>FSC-conscious sourcing</strong><span>Certified material available on request</span></div><div><CircleCheck/><strong>Food-contact board options</strong><span>Supplier declarations available by grade</span></div></div></div></section><QuoteBanner/></>
}

function ServicesPage() {
  const services=[
    [Printer,'Custom printing','From economical single-color flexo to rich CMYK, Pantone matching, foil, emboss and spot treatments.','Color-managed workflows · Physical proofs · Inside/outside print'],
    [Factory,'Bulk manufacturing','Repeatable production at scale, with documented specifications and quality checks that keep every run consistent.','Short & long runs · Repeat-order control · Warehousing options'],
    [Leaf,'Eco-conscious materials','Right-sized structures, recycled content and practical mono-material alternatives selected for real-world performance.','Recycled board · FSC-certified options · Water-based inks'],
    [Zap,'Responsive delivery','Clear production milestones and dispatch planning for launches, seasonal volume and recurring supply.','Rush assessment · Nationwide freight · Export coordination'],
    [Palette,'Design assistance','Structural and graphic guidance that turns a product brief into packaging ready for confident production.','Dielines · Prototyping · Artwork preflight'],
    [Package,'Kitting & finishing','Inserts, windows, sleeves, labels and specialist hand-finishing for more complex unboxing experiences.','Custom inserts · Assembly · Quality pack-out']
  ];
  return <><PageHero dark eyebrow="CAPABILITIES" title={<>Everything your box needs.<br/><em>All under one roof.</em></>} text="Design, print, manufacture and delivery—coordinated by one experienced packaging team."><div className="quote-promise"><CircleCheck/><div><strong>One accountable partner</strong><span>Fewer handoffs. Better consistency. Clearer timelines.</span></div></div></PageHero><section className="section services-list"><div className="container">{services.map(([Icon,t,p,b],i)=><Reveal className="service-row" key={t}><span>0{i+1}</span><div className="service-icon"><Icon/></div><div><h2>{t}</h2><p>{p}</p><small>{b}</small></div><Link to="/quote" aria-label={`Get a quote for ${t}`}><ArrowRight/></Link></Reveal>)}</div></section><Process/><section className="materials-section"><div className="container materials-grid"><div><span className="eyebrow light">MATERIAL KNOW-HOW</span><h2>The right board<br/>does more with <em>less.</em></h2><p>We match structure and substrate to the real demands of your product—so you’re not paying for weight you don’t need or risking strength you do.</p><Link to="/quote" className="btn btn-accent">Ask for a material review <ArrowRight/></Link></div><div className="material-stack"><div><span>KRAFT</span><strong>Natural Kraft Board</strong><small>Warm, tactile, widely recyclable</small></div><div><span>E</span><strong>E-Flute Corrugated</strong><small>Fine print surface, protective structure</small></div><div><span>SBS</span><strong>White Paperboard</strong><small>Bright, smooth, color accurate</small></div><div><span>RB</span><strong>Rigid Board</strong><small>Premium weight and lasting form</small></div></div></div></section><QuoteBanner/></>
}

function BlogPage() {
  const [cat,setCat]=useState('All stories'); const cats=['All stories','Packaging Tips','Industry News','Sustainability','Case Studies'];
  const list=cat==='All stories'?posts:posts.filter(p=>p.category===cat);
  return <><PageHero eyebrow="THE KAINAT JOURNAL" title={<>Better packaging<br/><em>starts with better questions.</em></>} text="Practical guides, material thinking and stories from the production floor."></PageHero><section className="blog-list section"><div className="container"><div className="blog-cats">{cats.map(c=><button className={cat===c?'active':''} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div>{list.length?<div className="blog-feature-grid">{list.map((post,i)=><article className={i===0?'feature-post':''} key={post.slug}><Link to={`/blog/${post.slug}`}><div className="post-image"><img src={post.image} alt={post.title}/><span>{post.category}</span></div><div className="post-copy"><small>{post.date} · {post.read}</small><h2>{post.title}</h2><p>{post.excerpt}</p><b>Read article <ArrowRight/></b></div></Link></article>)}</div>:<div className="empty-results"><CalendarDays/><h2>Fresh stories are in production</h2><p>Try another category while we finish the next one.</p></div>}</div></section><Newsletter/><QuoteBanner/></>
}

function BlogPost({ slug }) {
  const post=posts.find(p=>p.slug===slug); if(!post)return <NotFound/>;
  const related=posts.filter(p=>p.slug!==post.slug).slice(0,2);
  return <><article className="article"><header className="article-head container"><div className="breadcrumb"><Link to="/blog">Journal</Link><span>/</span><b>{post.category}</b></div><span className="eyebrow">{post.category}</span><h1>{post.title}</h1><p>{post.excerpt}</p><div className="article-by"><div className="author-avatar">KA</div><div><strong>Kainat Studio</strong><span>{post.date} · {post.read}</span></div></div></header><div className="article-image container"><img src={post.image} alt={post.title}/></div><div className="article-body container"><aside><span>SHARE</span><a href="#"><Linkedin/></a><a href="#"><Facebook/></a><a href={`mailto:?subject=${encodeURIComponent(post.title)}`}><Mail/></a></aside><div>{post.content.map((para,i)=><React.Fragment key={i}>{i===1&&<h2>{post.category==='Sustainability'?'Design the waste out first.':'Start with the job, not the jargon.'}</h2>}<p className={i===0?'lead':''}>{para}</p>{i===2&&<blockquote>“The best packaging decision balances protection, production, presentation and what happens after use.”</blockquote>}</React.Fragment>)}<div className="article-cta"><Box/><div><h3>Need help applying this to your product?</h3><p>Bring us the brief. We’ll bring material and structural options.</p></div><Link to="/quote">Talk to a specialist <ArrowRight/></Link></div></div></div></article><section className="section related-posts"><div className="container"><SectionHeading eyebrow="KEEP READING" title="Related field notes."/><div className="post-grid">{related.map(p=><article className="post-card" key={p.slug}><Link to={`/blog/${p.slug}`}><div className="post-image"><img src={p.image} alt={p.title}/><span>{p.category}</span></div><div className="post-copy"><small>{p.date} · {p.read}</small><h3>{p.title}</h3><b>Read article <ArrowRight/></b></div></Link></article>)}</div></div></section></>
}

function Newsletter(){const [email,setEmail]=useState('');const [done,setDone]=useState(false);return <section className="newsletter"><div className="container newsletter-inner"><div><span className="eyebrow">THE GOOD EDIT</span><h2>Packaging ideas.<br/><em>Nicely packed.</em></h2></div><div>{done?<div className="newsletter-done"><CheckCircle2/><strong>Thank you. Your first note is on its way.</strong></div>:<><p>Occasional practical notes for product, brand and operations teams.</p><form onSubmit={e=>{e.preventDefault();saveSubmission('newsletter',{email});setDone(true)}}><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Work email address"/><button className="btn btn-dark">Subscribe <ArrowRight/></button></form><small>Useful, brief, easy to leave.</small></>}</div></div></section>}

function TestimonialsPage() {
 return <><PageHero dark eyebrow="CLIENT STORIES" title={<>The proof is<br/><em>in the unboxing.</em></>} text="Honest words from teams who trust Kainat Box Makers with how their products arrive."><div className="rating-summary"><strong>4.9</strong><div><span>★★★★★</span><small>Based on 180+ client reviews</small></div></div></PageHero><section className="section reviews-section"><div className="container"><div className="logo-cloud"><span>SLICE HOUSE</span><span>ASTER</span><span>CRUMB & CO.</span><span>NORTHSTAR</span><span>GOOD GRAIN</span></div><div className="review-grid">{[...testimonials,...testimonials.slice(0,2)].map((t,i)=><article className={`review-card review-${i}`} key={i}><div className="stars">★★★★★</div><blockquote>“{t.quote}”</blockquote><div className="reviewer"><span>{t.initials}</span><div><strong>{t.name}</strong><small>{t.company}</small></div></div><div className="verified"><CircleCheck/> Verified production client</div></article>)}</div></div></section><section className="case-quote"><div className="container"><QuoteIcon/><blockquote>“They didn’t just quote what we asked for. They found a smarter structure that saved board, packed faster, and looked more premium.”</blockquote><div><strong>Usman Tariq</strong><span>Operations Director, Northstar Commerce</span></div></div></section><QuoteBanner/></>
}

function ContactPage({ showToast }) {
 const [done,setDone]=useState(false);const submit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));saveSubmission('contacts',data);setDone(true);showToast('Message sent. We’ll reply within one business day.')};
 return <><PageHero eyebrow="CONTACT" title={<>Questions welcome.<br/><em>Boxes encouraged.</em></>} text="Ask about materials, lead times, samples or an idea you’re not quite sure how to make yet."></PageHero><section className="section contact-section"><div className="container contact-grid"><div className="contact-info"><span className="eyebrow">TALK TO A HUMAN</span><h2>We’re here to<br/><em>help shape it.</em></h2><p>Our team replies Monday–Saturday, 9:00–18:00 PKT. Quote requests are usually answered within one business day.</p><div className="contact-method"><Phone/><div><small>CALL / WHATSAPP</small><a href={`tel:${BRAND.phone}`}>{BRAND.phone}</a></div></div><div className="contact-method"><Mail/><div><small>EMAIL</small><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></div></div><div className="contact-method"><MapPin/><div><small>VISIT</small><address>{BRAND.address}</address></div></div><a className="whatsapp-inline" href={`https://wa.me/${BRAND.phoneRaw}?text=${encodeURIComponent("Hi, I'm interested in custom packaging")}`} target="_blank" rel="noreferrer"><MessageCircle/> Start a WhatsApp chat <ArrowRight/></a></div><div className="contact-form-card">{done?<div className="form-success"><CheckCircle2/><h2>Message received.</h2><p>One of our packaging specialists will be in touch shortly.</p><button onClick={()=>setDone(false)}>Send another message</button></div>:<form onSubmit={submit}><div className="form-title"><span>SEND AN ENQUIRY</span><h2>How can we help?</h2></div><div className="form-grid"><Field label="Name" required><input name="name" required placeholder="Your name"/></Field><Field label="Work email" required><input name="email" type="email" required placeholder="you@company.com"/></Field><Field label="Phone"><input name="phone" placeholder="+92 300 0000000"/></Field><Field label="I’m interested in"><select name="interest"><option>Custom packaging quote</option><option>Stock product order</option><option>Samples & materials</option><option>Existing order support</option><option>Something else</option></select></Field><Field label="Message" full><textarea name="message" required rows="5" placeholder="Tell us about your product or question…"></textarea></Field></div><button className="btn btn-dark" type="submit">Send message <Send/></button></form>}</div></div></section><section className="map-section"><iframe title="Kainat Box Makers location in Lahore" loading="lazy" src="https://www.google.com/maps?q=Kot%20Lakhpat%20Industrial%20Estate%20Lahore&output=embed"></iframe><div className="map-card"><span className="eyebrow">KAINAT BOX MAKERS</span><strong>{BRAND.address}</strong><a href="https://maps.google.com/?q=Kot+Lakhpat+Industrial+Estate+Lahore" target="_blank" rel="noreferrer">Open in Google Maps <ArrowRight/></a></div></section></>
}

function CartDrawer({ items, open, close, updateQty, remove, navigate }) {
 const subtotal=items.reduce((s,i)=>s+i.price*i.qty,0);
 return <><div className={`drawer-overlay ${open?'open':''}`} onClick={close}></div><aside className={`cart-drawer ${open?'open':''}`} aria-hidden={!open}><div className="drawer-head"><div><span>YOUR CART</span><strong>{items.length} {items.length===1?'item':'items'}</strong></div><button onClick={close}><X/></button></div><div className="drawer-body">{items.length===0?<div className="empty-cart"><ShoppingBag/><h2>Your cart is light.</h2><p>Browse our production-ready packaging or start a fully custom brief.</p><Link to="/products" className="btn btn-dark" onClick={close}>Explore products</Link></div>:items.map(item=><div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div><strong>{item.name}</strong><span>MOQ multiples of {item.moq}</span><div className="cart-item-bottom"><div className="qty small"><button onClick={()=>updateQty(item.id,Math.max(item.moq,item.qty-item.moq))}><Minus/></button><span>{item.qty}</span><button onClick={()=>updateQty(item.id,item.qty+item.moq)}><Plus/></button></div><b>PKR {(item.price*item.qty).toLocaleString()}</b></div><button className="remove" onClick={()=>remove(item.id)}>Remove</button></div></div>)}</div>{items.length>0&&<div className="drawer-foot"><div><span>Subtotal</span><strong>PKR {subtotal.toLocaleString()}</strong></div><p>Shipping and taxes are calculated at checkout.</p><button className="btn btn-accent" onClick={()=>{close();navigate('/checkout')}}>Secure checkout <ArrowRight/></button><Link to="/quote" onClick={close}>Need custom print or sizing? Request a quote</Link></div>}</aside></>
}

function CheckoutPage({ items, clearCart, showToast, navigate }) {
 const [done,setDone]=useState(false); const subtotal=items.reduce((s,i)=>s+i.price*i.qty,0); const shipping=subtotal>100000?0:2500;
 const submit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));saveSubmission('orders',{...data,items,total:subtotal+shipping});clearCart();setDone(true);showToast('Order placed successfully.');};
 if(done)return <section className="success-page"><div><span className="success-icon"><Check/></span><span className="eyebrow">ORDER CONFIRMED</span><h1>It’s in the<br/><em>production queue.</em></h1><p>We’ve emailed your order summary. Our team will confirm stock and dispatch details shortly.</p><div className="success-ref">ORDER <strong>KA-{String(Date.now()).slice(-6)}</strong></div><Link to="/products" className="btn btn-dark">Continue shopping <ArrowRight/></Link></div></section>;
 if(!items.length)return <section className="success-page"><div><ShoppingBag className="large-empty"/><h1>Your cart is empty.</h1><p>Add a production-ready item before heading to checkout.</p><Link to="/products" className="btn btn-dark">Browse products <ArrowRight/></Link></div></section>;
 return <section className="checkout"><div className="container"><div className="checkout-head"><Logo/><span><LockKeyhole/> Secure checkout</span></div><div className="checkout-grid"><form onSubmit={submit}><span className="eyebrow">DELIVERY DETAILS</span><h1>Where should we send it?</h1><div className="form-grid"><Field label="Full name" required full><input name="name" required/></Field><Field label="Email" required><input name="email" type="email" required/></Field><Field label="Phone" required><input name="phone" required/></Field><Field label="Company"><input name="company"/></Field><Field label="City" required><input name="city" required/></Field><Field label="Delivery address" required full><textarea name="address" required rows="3"></textarea></Field></div><div className="payment-choice"><span className="eyebrow">PAYMENT</span><label><input type="radio" name="payment" value="Cash / bank transfer" defaultChecked/><CreditCard/><div><strong>Bank transfer / cash on delivery</strong><small>Our team will confirm payment and delivery terms after order review.</small></div></label></div><button className="btn btn-accent checkout-submit">Place order · PKR {(subtotal+shipping).toLocaleString()} <ArrowRight/></button><p className="checkout-legal"><LockKeyhole/> Your details are encrypted in transit. By ordering you agree to our terms.</p></form><aside className="order-summary"><h2>Order summary</h2>{items.map(i=><div className="summary-item" key={i.id}><div><img src={i.image} alt=""/><span>{i.qty}</span></div><p><strong>{i.name}</strong><small>{i.qty} × PKR {i.price.toLocaleString()}</small></p><b>PKR {(i.qty*i.price).toLocaleString()}</b></div>)}<div className="summary-totals"><div><span>Subtotal</span><b>PKR {subtotal.toLocaleString()}</b></div><div><span>Shipping</span><b>{shipping?'PKR '+shipping.toLocaleString():'FREE'}</b></div><div><strong>Total</strong><strong>PKR {(subtotal+shipping).toLocaleString()}</strong></div></div><div className="summary-trust"><ShieldCheck/><p><strong>Order review included</strong><span>A specialist verifies stock, quantities and delivery before processing.</span></p></div></aside></div></div></section>
}

function LegalPage({type}) {return <section className="legal container"><span className="eyebrow">KAINAT LEGAL</span><h1>{type==='privacy'?'Privacy policy':'Terms of service'}</h1><p className="updated">Last updated: August 11, 2026</p><h2>{type==='privacy'?'Information we collect':'Orders and quotations'}</h2><p>{type==='privacy'?'We collect information you provide through enquiry, quote, checkout and newsletter forms. This may include your name, company, contact information, project requirements and uploaded artwork.':'Stock orders are subject to availability and confirmation. Custom quotations remain valid for the period shown and production begins after artwork, specifications and payment terms are approved.'}</p><h2>{type==='privacy'?'How we use information':'Custom production'}</h2><p>{type==='privacy'?'We use this information to respond to requests, prepare quotes, process orders and improve our service. We do not sell personal information.':'Color, board and finished dimensions may carry standard manufacturing tolerances stated in your approved specification. Production lead times begin after final approval.'}</p><h2>Contact</h2><p>Questions can be sent to <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.</p></section>}

function NotFound(){return <section className="success-page"><div><span className="eyebrow">404 · OUT OF THE BOX</span><h1>That page has<br/><em>moved on.</em></h1><p>Let’s get you back to the packaging floor.</p><Link to="/" className="btn btn-dark">Return home <ArrowRight/></Link></div></section>}

function saveSubmission(type,data){
  const {_file,...serializable}=data;
  const payload={...serializable,formType:type,createdAt:new Date().toISOString()};
  try{const key=`kainat_${type}`;const existing=JSON.parse(localStorage.getItem(key)||'[]');localStorage.setItem(key,JSON.stringify([...existing,payload]));}catch(e){console.info('Local submission storage unavailable.',e)}
  const endpoint=import.meta.env.VITE_FORMS_ENDPOINT;
  if(endpoint){
    let request;
    if(_file){const body=new FormData();Object.entries(payload).forEach(([k,v])=>body.append(k,Array.isArray(v)?v.join(', '):v));body.append('artwork',_file);request={method:'POST',body};}
    else request={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)};
    fetch(endpoint,request).catch(e=>console.error('Form delivery failed:',e));
  }
}

function App(){
 const [path,navigate]=useRoute(); const [cartOpen,setCartOpen]=useState(false); const [toast,setToast]=useState('');
 const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('kainat_cart')||'[]')}catch{return[]}});
 useEffect(()=>localStorage.setItem('kainat_cart',JSON.stringify(cart)),[cart]);
 const addToCart=(p,qty=p.moq)=>{setCart(c=>{const exists=c.find(i=>i.id===p.id);return exists?c.map(i=>i.id===p.id?{...i,qty:i.qty+qty}:i):[...c,{...p,qty}]});setCartOpen(true);setToast(`${p.name} added to your cart.`)};
 const cartCount=cart.reduce((s,i)=>s+i.qty,0);
 const updateQty=(id,qty)=>setCart(c=>c.map(i=>i.id===id?{...i,qty}:i)); const remove=id=>setCart(c=>c.filter(i=>i.id!==id));
 const routePath=path.split('?')[0];
 let page;
 if(routePath==='/')page=<Home addToCart={addToCart}/>;
 else if(routePath==='/products')page=<ProductsPage addToCart={addToCart}/>;
 else if(routePath.startsWith('/products/'))page=<ProductDetail id={routePath.split('/')[2]} addToCart={addToCart}/>;
 else if(routePath==='/quote')page=<QuotePage showToast={setToast}/>;
 else if(routePath==='/about')page=<AboutPage/>;
 else if(routePath==='/services')page=<ServicesPage/>;
 else if(routePath==='/blog')page=<BlogPage/>;
 else if(routePath.startsWith('/blog/'))page=<BlogPost slug={routePath.split('/')[2]}/>;
 else if(routePath==='/testimonials')page=<TestimonialsPage/>;
 else if(routePath==='/contact')page=<ContactPage showToast={setToast}/>;
 else if(routePath==='/checkout')page=<CheckoutPage items={cart} clearCart={()=>setCart([])} showToast={setToast} navigate={navigate}/>;
 else if(routePath==='/privacy')page=<LegalPage type="privacy"/>;
 else if(routePath==='/terms')page=<LegalPage type="terms"/>;
 else page=<NotFound/>;
 const isCheckout=routePath==='/checkout';
 return <><SEO path={routePath}/>{!isCheckout&&<Header path={routePath} cartCount={cartCount} openCart={()=>setCartOpen(true)}/>}<main>{page}</main>{!isCheckout&&<><Footer showToast={setToast}/><WhatsApp/></>}<CartDrawer items={cart} open={cartOpen} close={()=>setCartOpen(false)} updateQty={updateQty} remove={remove} navigate={navigate}/>{toast&&<Toast message={toast} close={()=>setToast('')}/>}</>
}

createRoot(document.getElementById('root')).render(<App/>);
