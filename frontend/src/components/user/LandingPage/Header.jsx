import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../../assets/assets";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/home", text: "Home", type: "route" },
  { href: "/artists", text: "Artists", type: "route" },
  { href: "/albums", text: "Albums", type: "route" },
  { href: "/about-us", text: "About", type: "route" },
];

// ─── Spotlight Nav ─────────────────────────────────────────────────
function SpotlightNav({ links, onLinkClick }) {
  const navRef = useRef(null);
  const [hoverX, setHoverX] = useState(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onMove = (e) => {
      const rect = nav.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setHoverX(x);
      nav.style.setProperty("--spotlight-x", `${x}px`);
    };

    const onLeave = () => setHoverX(null);

    nav.addEventListener("mousemove", onMove);
    nav.addEventListener("mouseleave", onLeave);
    return () => {
      nav.removeEventListener("mousemove", onMove);
      nav.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="hidden md:flex items-center gap-1 relative rounded-full overflow-hidden"
      style={{
        border: "0.5px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        padding: "4px",
      }}
    >
      {/* Spotlight glow */}
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          opacity: hoverX !== null ? 1 : 0,
          transition: "opacity 0.25s ease",
          background: `radial-gradient(
            110px circle at var(--spotlight-x, 50%) 100%,
            rgba(255,255,255,0.14) 0%,
            transparent 60%
          )`,
        }}
      />

      {links.map((link) => (
        <motion.a
          key={link.text}
          href={link.href}
          onClick={(e) => onLinkClick(e, link.href, link.type)}
          className="text-slate-400 hover:text-white font-medium px-4 py-2 transition-colors duration-200 text-sm"
          style={{ position: "relative", zIndex: 10 }}
          whileTap={{ scale: 0.97 }}
        >
          {link.text}
        </motion.a>
      ))}
    </nav>
  );
}

// ─── Header ────────────────────────────────────────────────────────
const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (currentY < 80) {
        setIsVisible(true);
      } else if (diff > 8) {
        setIsVisible(false);
      } else if (diff < -5) {
        setIsVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const handleNavClick = (e, href, type) => {
    e.preventDefault();
    if (type === "route") navigate(href);
    else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const mobileLinkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1 + 0.3, ease: "easeOut" },
    }),
  };

  return (
    <>
      <motion.header
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 w-full z-50 bg-transparent"
      >
        <div className="w-full h-20 flex justify-between items-center page-content">

          {/* Logo */}
          <motion.div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <span className="text-xl font-bold text-white ml-2 tracking-wider">
              Reset Music
            </span>
          </motion.div>

          {/* Desktop Spotlight Nav — same jagah, same size */}
          <SpotlightNav links={navLinks} onLinkClick={handleNavClick} />

          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <motion.button
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-sm font-semibold text-slate-300 rounded-lg border border-white/20 hover:text-white hover:border-white/40 transition-all duration-200"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{ background: 'transparent', backdropFilter: 'blur(8px)' }}
            >
              Login
            </motion.button>
            <motion.button
              onClick={() => navigate("/register")}
              className="px-6 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200"
              style={{
                background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                boxShadow: '0 12px 32px rgba(51,128,255,0.35)',
              }}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
            >
              Register
            </motion.button>
          </div>

          {/* Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 bg-transparent border-none cursor-pointer rounded-md hover:bg-slate-800/60 transition-colors"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6.5 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-6 h-0.5 bg-white rounded-full origin-center"
              />
              <motion.div
                animate={{ opacity: isMenuOpen ? 0 : 1, scaleX: isMenuOpen ? 0 : 1 }}
                transition={{ duration: 0.15 }}
                className="w-6 h-0.5 bg-white rounded-full origin-center"
              />
              <motion.div
                animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6.5 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-6 h-0.5 bg-white rounded-full origin-center"
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            id="mobile-menu"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "tween", ease: "circOut", duration: 0.5 }}
            className="md:hidden fixed top-0 right-0 w-full h-screen z-40"
            style={{ background: 'rgba(2,2,22,0.97)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.text}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.type)}
                  className="text-2xl text-slate-300 hover:text-white font-medium transition-colors duration-200"
                  custom={i}
                  variants={mobileLinkVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {link.text}
                </motion.a>
              ))}

              <div className="flex flex-col gap-4 mt-10 w-3/4 max-w-xs">
                <motion.button
                  onClick={() => { navigate("/login"); setIsMenuOpen(false); }}
                  className="w-full py-3 text-base font-semibold text-slate-300 rounded-lg border border-white/20 hover:text-white hover:border-white/40 transition-all duration-200"
                  style={{ background: 'transparent' }}
                  variants={mobileLinkVariants}
                  custom={navLinks.length}
                  initial="hidden"
                  animate="visible"
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => { navigate("/register"); setIsMenuOpen(false); }}
                  className="w-full py-3 text-base font-semibold text-white rounded-lg transition-all duration-200"
                  style={{
                    background: 'linear-gradient(45deg, #0F3272 0%, #1A5DB4 60%, #3380FF 100%)',
                    boxShadow: '0 12px 32px rgba(51,128,255,0.35)',
                  }}
                  variants={mobileLinkVariants}
                  custom={navLinks.length + 1}
                  initial="hidden"
                  animate="visible"
                >
                  Register
                </motion.button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;