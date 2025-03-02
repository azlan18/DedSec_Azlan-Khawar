import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Menu,
  X,
  Home,
  Phone,
  Info,
  Globe,
  ChevronDown,
  Loader2,
} from "lucide-react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Language selector configuration
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', localName: 'Hindi', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', localName: 'Marathi', flag: '🇮🇳' },
];

const NavLink: React.FC<NavLinkProps> = ({ to, label, icon: Icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <motion.div
        className="relative px-3 py-2 rounded-lg flex items-center gap-3 transition-colors"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}>
        <Icon
          className={`w-5 h-5 ${
            isActive ? "text-[#151616]" : "text-[#151616]/60"
          }`}
        />
        <span
          className={`text-sm font-medium ${
            isActive ? "text-[#151616]" : "text-[#151616]/60"
          }`}
          data-translate="true"
          data-original-text={label}>
          {label}
        </span>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-[#D6F32F]/30 rounded-lg -z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const originalTextsRef = useRef<Map<Element, string>>(new Map());
  const location = useLocation();

  // Initialize translations if available in localStorage
  useEffect(() => {
    const savedTranslations = localStorage.getItem('translations');
    if (savedTranslations) {
      try {
        setTranslations(JSON.parse(savedTranslations));
      } catch (e) {
        console.error("Failed to parse saved translations");
      }
    }
    
    // Apply saved language if available
    const savedLang = localStorage.getItem('currentLang');
    if (savedLang) {
      setCurrentLang(savedLang);
      if (savedLang !== 'en') {
        setTimeout(() => applyTranslations(savedLang), 500);
      }
    }
  }, []);

  // Store original texts on first load
  useEffect(() => {
    saveOriginalTexts();
  }, []);

  // Re-apply translations when page content changes
  useEffect(() => {
    saveOriginalTexts();
    if (currentLang !== 'en') {
      setTimeout(() => applyTranslations(currentLang), 300);
    }
  }, [location.pathname]);

  // Save original texts from DOM elements
  const saveOriginalTexts = () => {
    // Clear previous original texts when navigating to new pages
    originalTextsRef.current = new Map();
    
    // Save original text for all translatable elements
    document.querySelectorAll('[data-translate="true"]').forEach(el => {
      if (el.textContent?.trim() && !originalTextsRef.current.has(el)) {
        originalTextsRef.current.set(el, el.textContent.trim());
        // Also set a data attribute for easier access
        el.setAttribute('data-original-text', el.textContent.trim());
      }
    });

    // Save original text for content elements
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, button, a, span, li, label').forEach(el => {
      if (el.closest('nav') || el.hasAttribute('data-translate') || !el.textContent?.trim() || !/[a-zA-Z]/.test(el.textContent)) {
        return;
      }
      
      if (!originalTextsRef.current.has(el)) {
        originalTextsRef.current.set(el, el.textContent.trim());
        el.setAttribute('data-original-text', el.textContent.trim());
      }
    });
  };

  // Collect all translatable texts from the DOM
  const collectTranslatableTexts = (): string[] => {
    const staticTexts: string[] = [];
    
    // Use our stored original texts
    originalTextsRef.current.forEach((text) => {
      if (text && !/^\d+$/.test(text)) { // Skip purely numeric strings
        staticTexts.push(text);
      }
    });
    
    // Add navigation items
    navItems.forEach(item => {
      staticTexts.push(item.label);
    });
    
    // Add fixed UI elements
    staticTexts.push("Login", "Sign Up", "Select Language");
    languages.forEach(lang => {
      if (lang.localName) staticTexts.push(lang.localName);
    });
    
    return [...new Set(staticTexts)]; // Remove duplicates
  };

  // Reset to English
  const resetToEnglish = () => {
    // Restore original texts using our stored map
    originalTextsRef.current.forEach((text, element) => {
      element.textContent = text;
    });
  };

  // Apply translations to the DOM
  const applyTranslations = (langCode: string) => {
    if (langCode === 'en') {
      resetToEnglish();
      return;
    }
    
    if (!translations[langCode]) {
      return;
    }

    // Apply to all elements using our stored original texts
    originalTextsRef.current.forEach((originalText, element) => {
      if (translations[langCode][originalText]) {
        element.textContent = translations[langCode][originalText];
      }
    });
  };

  const handleLanguageChange = async (code: string) => {
    try {
      setIsTranslating(true);
      setCurrentLang(code);
      setIsLangDropdownOpen(false);
      
      // Save selected language
      localStorage.setItem('currentLang', code);

      if (code === 'en') {
        resetToEnglish();
        setIsTranslating(false);
        return;
      }

      // If we already have translations for this language, use them
      if (translations[code]) {
        applyTranslations(code);
        setIsTranslating(false);
        return;
      }

      // Ensure we have all original texts saved
      saveOriginalTexts();
      
      // Collect texts to translate
      const textsToTranslate = collectTranslatableTexts();
      
      // Fetch translations from API
      const response = await fetch("http://localhost:5003/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          texts: textsToTranslate, 
          targetLanguage: code 
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const { translations: translatedTexts } = await response.json();
      
      // Create a mapping of original text to translation
      const translationMap: Record<string, string> = {};
      textsToTranslate.forEach((text, index) => {
        if (index < translatedTexts.length) {
          translationMap[text] = translatedTexts[index];
        }
      });
      
      // Save translations for future use
      const updatedTranslations = {
        ...translations,
        [code]: translationMap
      };
      setTranslations(updatedTranslations);
      localStorage.setItem('translations', JSON.stringify(updatedTranslations));
      
      // Apply translations
      applyTranslations(code);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please try again later.');
    } finally {
      setIsTranslating(false);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/about", label: "About", icon: Info },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#151616]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D6F32F] rounded-lg flex items-center justify-center border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616]">
                  <Bot className="w-6 h-6 text-[#151616]" />
                </div>
                <span className="font-bold text-lg" data-translate="true" data-original-text="GreenGauge">GreenGauge</span>
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-3 py-2 rounded-lg border-2 border-[#151616] hover:bg-[#D6F32F]/10 text-sm font-medium transition-colors flex items-center gap-2"
                disabled={isTranslating}
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                <span>{currentLanguage?.flag}</span>
                <span data-translate="true" data-original-text={currentLanguage?.name}>{currentLanguage?.name}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </motion.button>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg border-2 border-[#151616] bg-white shadow-lg overflow-hidden z-50"
                  >
                    {languages.map((lang) => (
                      <motion.button
                        key={lang.code}
                        whileHover={{ backgroundColor: "#D6F32F20" }}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm hover:bg-[#D6F32F]/10"
                        disabled={isTranslating}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="font-medium" data-translate="true" data-original-text={lang.name}>{lang.name}</span>
                          {lang.localName && (
                            <span className="text-xs text-gray-500" data-translate="true" data-original-text={lang.localName}>
                              {lang.localName}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg border-2 border-[#151616] hover:bg-[#D6F32F]/10 text-sm font-medium transition-colors"
                data-translate="true"
                data-original-text="Login">
                Login
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg bg-[#D6F32F] border-2 border-[#151616] shadow-[3px_3px_0px_0px_#151616] hover:shadow-[1px_1px_0px_0px_#151616] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm font-medium"
                data-translate="true"
                data-original-text="Sign Up">
                Sign Up
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#D6F32F]/20 transition-colors">
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[#151616]" />
              ) : (
                <Menu className="w-6 h-6 text-[#151616]" />
              )}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                  />
                ))}
                {/* Language Selector for Mobile */}
                <div className="px-3 py-2">
                  <div className="text-sm text-[#151616]/60 mb-2" data-translate="true" data-original-text="Select Language">Select Language</div>
                  <div className="flex flex-col gap-1">
                    {languages.map((lang) => (
                      <motion.button
                        key={lang.code}
                        whileHover={{ backgroundColor: "#D6F32F20" }}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 text-sm"
                      >
                        <span className="text-base">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="font-medium" data-translate="true" data-original-text={lang.name}>{lang.name}</span>
                          {lang.localName && (
                            <span className="text-xs text-gray-500" data-translate="true" data-original-text={lang.localName}>
                              {lang.localName}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;