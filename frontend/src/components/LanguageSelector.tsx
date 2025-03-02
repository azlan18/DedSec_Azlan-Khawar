import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google: any;
  }
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', localName: 'Hindi', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', localName: 'Marathi', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', localName: 'Gujarati', flag: '🇮🇳' }
];

const LanguageSelector: React.FC = () => {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Add Google Translate script
    const addScript = () => {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,mr,gu',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      }, 'google_translate_element');
    };

    addScript();

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  const handleLanguageChange = (code: string) => {
    setCurrentLang(code);
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = code;
      selectElement.dispatchEvent(new Event('change'));
    }
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-full px-3 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{currentLanguage?.flag}</span>
            <span className="font-medium">{currentLanguage?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer"
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.name}</span>
                {lang.localName && (
                  <span className="text-xs text-muted-foreground">
                    {lang.localName}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div id="google_translate_element" className="hidden" />
    </div>
  );
};

export default LanguageSelector; 