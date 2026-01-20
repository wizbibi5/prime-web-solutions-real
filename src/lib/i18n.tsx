'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'de' | 'bs';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['en', 'es', 'de', 'bs'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Translations
type TranslationKey = string;
type Translations = Record<Language, Record<TranslationKey, string>>;

const translations: Translations = {
  en: {
    // Navigation
    'nav.services': 'Services',
    'nav.process': 'Process',
    'nav.portfolio': 'Portfolio',
    'nav.results': 'Results',
    'nav.contact': 'Contact',

    // Hero Section
    'hero.headline': 'Your Restaurant Deserves More Customers',
    'hero.subheadline': 'Professional websites that turn visitors into reservations. We help local restaurants, cafés, and businesses grow online with stunning, mobile-friendly websites.',
    'hero.cta': 'Get Free Consultation',
    'hero.secondary': 'View Our Work',

    // Services Section
    'services.title': 'Premium Web Solutions',
    'services.subtitle': 'We build more than websites—we create digital experiences that drive real business results.',
    'services.web.title': 'Custom Website Design',
    'services.web.description': 'Stunning, professional websites tailored to your brand. Mobile-responsive, fast-loading, and optimized to convert visitors into customers.',
    'services.seo.title': 'SEO & Local Presence',
    'services.seo.description': 'Get found by local customers searching online. We optimize your site for Google, Bing, and local search directories.',
    'services.ecommerce.title': 'Online Ordering & Reservations',
    'services.ecommerce.description': 'Accept orders, bookings, and reservations 24/7. Make it easy for customers to do business with you anytime.',
    'services.support.title': 'Ongoing Support & Updates',
    'services.support.description': 'Your website stays fresh and secure. We handle updates, backups, and technical support so you can focus on your business.',

    // Process Section
    'process.title': 'Simple, Transparent Process',
    'process.subtitle': 'From first call to launch, we make getting your professional website effortless.',
    'process.step1.title': 'Consultation',
    'process.step1.description': 'We discuss your business goals, target customers, and vision. Quick call, no pressure.',
    'process.step2.title': 'Free Preview',
    'process.step2.description': 'See your website design before you commit. We create a preview based on your brand and feedback.',
    'process.step3.title': 'Review & Refine',
    'process.step3.description': 'Make changes, adjust content, and perfect every detail until you\'re thrilled with the result.',
    'process.step4.title': 'Launch & Grow',
    'process.step4.description': 'Your site goes live with training and support. Watch your online presence attract more customers.',

    // Portfolio Section
    'portfolio.title': 'Our Work',
    'portfolio.subtitle': 'See how we help businesses like yours succeed online.',
    'portfolio.bella.title': 'Bella Italia Ristorante',
    'portfolio.bella.description': 'Elegant Italian restaurant website with online reservations and menu showcase.',
    'portfolio.cafe.title': 'Morning Brew Café',
    'portfolio.cafe.description': 'Modern café website with online ordering and Instagram-worthy gallery.',
    'portfolio.barber.title': 'The Classic Barber',
    'portfolio.barber.description': 'Sophisticated barbershop website with appointment booking system.',

    // Results Section
    'results.title': 'Real Results for Real Businesses',
    'results.subtitle': 'Our clients don\'t just get websites—they get more customers, bookings, and revenue.',
    'results.testimonial.name': 'Marco Fernandez',
    'results.testimonial.business': 'Owner, Tapas & Wine Bar',
    'results.testimonial.quote': 'Since launching our new website, online reservations increased 300%. The site looks amazing and customers constantly compliment it. Best investment we made for our restaurant.',
    'results.metric1.value': '3x',
    'results.metric1.label': 'More Bookings',
    'results.metric2.value': '85%',
    'results.metric2.label': 'Mobile Traffic',
    'results.metric3.value': '2 Weeks',
    'results.metric3.label': 'Average Launch Time',

    // Contact Section
    'contact.title': 'Ready to Grow Your Business?',
    'contact.subtitle': 'Get a free consultation and see how a professional website can transform your business.',
    'contact.form.name': 'Your Name',
    'contact.form.email': 'Email Address',
    'contact.form.phone': 'Phone Number',
    'contact.form.message': 'Tell us about your business',
    'contact.form.submit': 'Request Free Consultation',
    'contact.form.success': 'Thank you! We\'ll contact you within 24 hours.',
    'contact.form.error': 'Something went wrong. Please try again or call us directly.',
    'contact.info.title': 'Or Reach Out Directly',
    'contact.info.email': 'primewwwebsolutions@gmail.com',
    'contact.info.phone': '+387 65 730 100',

    // Footer
    'footer.tagline': 'Helping local businesses thrive online.',
    'footer.rights': '© 2024 Prime Web Solutions. All rights reserved.',
  },

  es: {
    // Navigation
    'nav.services': 'Servicios',
    'nav.process': 'Proceso',
    'nav.portfolio': 'Portafolio',
    'nav.results': 'Resultados',
    'nav.contact': 'Contacto',

    // Hero Section
    'hero.headline': 'Su Restaurante Merece Más Clientes',
    'hero.subheadline': 'Sitios web profesionales que convierten visitantes en reservas. Ayudamos a restaurantes locales, cafés y negocios a crecer en línea con sitios web impresionantes y compatibles con móviles.',
    'hero.cta': 'Consulta Gratuita',
    'hero.secondary': 'Ver Nuestro Trabajo',

    // Services Section
    'services.title': 'Soluciones Web Premium',
    'services.subtitle': 'Construimos más que sitios web: creamos experiencias digitales que generan resultados comerciales reales.',
    'services.web.title': 'Diseño Web Personalizado',
    'services.web.description': 'Sitios web impresionantes y profesionales adaptados a su marca. Responsivos, de carga rápida y optimizados para convertir visitantes en clientes.',
    'services.seo.title': 'SEO y Presencia Local',
    'services.seo.description': 'Sea encontrado por clientes locales que buscan en línea. Optimizamos su sitio para Google, Bing y directorios locales.',
    'services.ecommerce.title': 'Pedidos en Línea y Reservas',
    'services.ecommerce.description': 'Acepte pedidos, reservas y citas 24/7. Facilite que los clientes hagan negocios con usted en cualquier momento.',
    'services.support.title': 'Soporte y Actualizaciones Continuas',
    'services.support.description': 'Su sitio web se mantiene fresco y seguro. Manejamos actualizaciones, copias de seguridad y soporte técnico para que se enfoque en su negocio.',

    // Process Section
    'process.title': 'Proceso Simple y Transparente',
    'process.subtitle': 'Desde la primera llamada hasta el lanzamiento, hacemos que obtener su sitio web profesional sea sin esfuerzo.',
    'process.step1.title': 'Consulta',
    'process.step1.description': 'Discutimos sus objetivos comerciales, clientes objetivo y visión. Llamada rápida, sin presión.',
    'process.step2.title': 'Vista Previa Gratis',
    'process.step2.description': 'Vea el diseño de su sitio web antes de comprometerse. Creamos una vista previa basada en su marca y comentarios.',
    'process.step3.title': 'Revisar y Refinar',
    'process.step3.description': 'Haga cambios, ajuste el contenido y perfeccione cada detalle hasta que esté encantado con el resultado.',
    'process.step4.title': 'Lanzar y Crecer',
    'process.step4.description': 'Su sitio se activa con capacitación y soporte. Vea cómo su presencia en línea atrae más clientes.',

    // Portfolio Section
    'portfolio.title': 'Nuestro Trabajo',
    'portfolio.subtitle': 'Vea cómo ayudamos a negocios como el suyo a tener éxito en línea.',
    'portfolio.bella.title': 'Bella Italia Ristorante',
    'portfolio.bella.description': 'Sitio web elegante de restaurante italiano con reservas en línea y muestra de menú.',
    'portfolio.cafe.title': 'Morning Brew Café',
    'portfolio.cafe.description': 'Sitio web moderno de café con pedidos en línea y galería digna de Instagram.',
    'portfolio.barber.title': 'The Classic Barber',
    'portfolio.barber.description': 'Sitio web sofisticado de barbería con sistema de reserva de citas.',

    // Results Section
    'results.title': 'Resultados Reales para Negocios Reales',
    'results.subtitle': 'Nuestros clientes no solo obtienen sitios web: obtienen más clientes, reservas e ingresos.',
    'results.testimonial.name': 'Marco Fernández',
    'results.testimonial.business': 'Propietario, Bar de Tapas y Vinos',
    'results.testimonial.quote': 'Desde el lanzamiento de nuestro nuevo sitio web, las reservas en línea aumentaron 300%. El sitio se ve increíble y los clientes lo elogian constantemente. La mejor inversión que hicimos para nuestro restaurante.',
    'results.metric1.value': '3x',
    'results.metric1.label': 'Más Reservas',
    'results.metric2.value': '85%',
    'results.metric2.label': 'Tráfico Móvil',
    'results.metric3.value': '2 Semanas',
    'results.metric3.label': 'Tiempo Promedio de Lanzamiento',

    // Contact Section
    'contact.title': '¿Listo para Hacer Crecer Su Negocio?',
    'contact.subtitle': 'Obtenga una consulta gratuita y vea cómo un sitio web profesional puede transformar su negocio.',
    'contact.form.name': 'Su Nombre',
    'contact.form.email': 'Correo Electrónico',
    'contact.form.phone': 'Número de Teléfono',
    'contact.form.message': 'Cuéntenos sobre su negocio',
    'contact.form.submit': 'Solicitar Consulta Gratuita',
    'contact.form.success': '¡Gracias! Nos pondremos en contacto en 24 horas.',
    'contact.form.error': 'Algo salió mal. Por favor intente de nuevo o llámenos directamente.',
    'contact.info.title': 'O Comuníquese Directamente',
    'contact.info.email': 'primewwwebsolutions@gmail.com',
    'contact.info.phone': '+387 65 730 100',

    // Footer
    'footer.tagline': 'Ayudando a negocios locales a prosperar en línea.',
    'footer.rights': '© 2024 Prime Web Solutions. Todos los derechos reservados.',
  },

  de: {
    // Navigation
    'nav.services': 'Dienstleistungen',
    'nav.process': 'Prozess',
    'nav.portfolio': 'Portfolio',
    'nav.results': 'Ergebnisse',
    'nav.contact': 'Kontakt',

    // Hero Section
    'hero.headline': 'Ihr Restaurant Verdient Mehr Kunden',
    'hero.subheadline': 'Professionelle Websites, die Besucher in Reservierungen verwandeln. Wir helfen lokalen Restaurants, Cafés und Unternehmen mit beeindruckenden, mobilfreundlichen Websites online zu wachsen.',
    'hero.cta': 'Kostenlose Beratung',
    'hero.secondary': 'Unsere Arbeit Ansehen',

    // Services Section
    'services.title': 'Premium Web-Lösungen',
    'services.subtitle': 'Wir bauen mehr als Websites – wir schaffen digitale Erlebnisse, die echte Geschäftsergebnisse erzielen.',
    'services.web.title': 'Individuelles Webdesign',
    'services.web.description': 'Beeindruckende, professionelle Websites, die auf Ihre Marke zugeschnitten sind. Mobilfreundlich, schnell ladend und optimiert, um Besucher in Kunden zu verwandeln.',
    'services.seo.title': 'SEO & Lokale Präsenz',
    'services.seo.description': 'Werden Sie von lokalen Kunden gefunden, die online suchen. Wir optimieren Ihre Website für Google, Bing und lokale Suchverzeichnisse.',
    'services.ecommerce.title': 'Online-Bestellungen & Reservierungen',
    'services.ecommerce.description': 'Akzeptieren Sie Bestellungen, Buchungen und Reservierungen rund um die Uhr. Machen Sie es Kunden einfach, jederzeit mit Ihnen Geschäfte zu machen.',
    'services.support.title': 'Laufender Support & Updates',
    'services.support.description': 'Ihre Website bleibt frisch und sicher. Wir kümmern uns um Updates, Backups und technischen Support, damit Sie sich auf Ihr Geschäft konzentrieren können.',

    // Process Section
    'process.title': 'Einfacher, Transparenter Prozess',
    'process.subtitle': 'Vom ersten Anruf bis zum Start machen wir es mühelos, Ihre professionelle Website zu erhalten.',
    'process.step1.title': 'Beratung',
    'process.step1.description': 'Wir besprechen Ihre Geschäftsziele, Zielkunden und Vision. Kurzes Gespräch, kein Druck.',
    'process.step2.title': 'Kostenlose Vorschau',
    'process.step2.description': 'Sehen Sie Ihr Website-Design, bevor Sie sich verpflichten. Wir erstellen eine Vorschau basierend auf Ihrer Marke und Ihrem Feedback.',
    'process.step3.title': 'Überprüfen & Verfeinern',
    'process.step3.description': 'Nehmen Sie Änderungen vor, passen Sie Inhalte an und perfektionieren Sie jedes Detail, bis Sie mit dem Ergebnis begeistert sind.',
    'process.step4.title': 'Start & Wachstum',
    'process.step4.description': 'Ihre Website geht live mit Schulung und Support. Beobachten Sie, wie Ihre Online-Präsenz mehr Kunden anzieht.',

    // Portfolio Section
    'portfolio.title': 'Unsere Arbeit',
    'portfolio.subtitle': 'Sehen Sie, wie wir Unternehmen wie Ihres online zum Erfolg verhelfen.',
    'portfolio.bella.title': 'Bella Italia Ristorante',
    'portfolio.bella.description': 'Elegante italienische Restaurant-Website mit Online-Reservierungen und Menüpräsentation.',
    'portfolio.cafe.title': 'Morning Brew Café',
    'portfolio.cafe.description': 'Moderne Café-Website mit Online-Bestellung und Instagram-würdiger Galerie.',
    'portfolio.barber.title': 'The Classic Barber',
    'portfolio.barber.description': 'Hochwertige Barbershop-Website mit Terminbuchungssystem.',

    // Results Section
    'results.title': 'Echte Ergebnisse für Echte Unternehmen',
    'results.subtitle': 'Unsere Kunden bekommen nicht nur Websites – sie bekommen mehr Kunden, Buchungen und Umsatz.',
    'results.testimonial.name': 'Marco Fernandez',
    'results.testimonial.business': 'Inhaber, Tapas & Weinbar',
    'results.testimonial.quote': 'Seit dem Start unserer neuen Website sind Online-Reservierungen um 300% gestiegen. Die Website sieht fantastisch aus und Kunden loben sie ständig. Beste Investition für unser Restaurant.',
    'results.metric1.value': '3x',
    'results.metric1.label': 'Mehr Buchungen',
    'results.metric2.value': '85%',
    'results.metric2.label': 'Mobiler Traffic',
    'results.metric3.value': '2 Wochen',
    'results.metric3.label': 'Durchschnittliche Startzeit',

    // Contact Section
    'contact.title': 'Bereit, Ihr Geschäft Auszubauen?',
    'contact.subtitle': 'Erhalten Sie eine kostenlose Beratung und sehen Sie, wie eine professionelle Website Ihr Geschäft transformieren kann.',
    'contact.form.name': 'Ihr Name',
    'contact.form.email': 'E-Mail-Adresse',
    'contact.form.phone': 'Telefonnummer',
    'contact.form.message': 'Erzählen Sie uns von Ihrem Geschäft',
    'contact.form.submit': 'Kostenlose Beratung Anfordern',
    'contact.form.success': 'Danke! Wir kontaktieren Sie innerhalb von 24 Stunden.',
    'contact.form.error': 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut oder rufen Sie uns direkt an.',
    'contact.info.title': 'Oder Direkt Kontaktieren',
    'contact.info.email': 'primewwwebsolutions@gmail.com',
    'contact.info.phone': '+387 65 730 100',

    // Footer
    'footer.tagline': 'Lokalen Unternehmen helfen, online erfolgreich zu sein.',
    'footer.rights': '© 2024 Prime Web Solutions. Alle Rechte vorbehalten.',
  },

  bs: {
    // Navigation
    'nav.services': 'Usluge',
    'nav.process': 'Proces',
    'nav.portfolio': 'Portfolio',
    'nav.results': 'Rezultati',
    'nav.contact': 'Kontakt',

    // Hero Section
    'hero.headline': 'Vaš Restoran Zaslužuje Više Klijenata',
    'hero.subheadline': 'Profesionalne web stranice koje pretvaraju posjetitelje u rezervacije. Pomažemo lokalnim restoranima, kafićima i preduzećima da rastu online sa zadivljujućim, mobilnim web stranicama.',
    'hero.cta': 'Besplatna Konsultacija',
    'hero.secondary': 'Pogledajte Naš Rad',

    // Services Section
    'services.title': 'Premium Web Rješenja',
    'services.subtitle': 'Gradimo više od web stranica – kreiramo digitalna iskustva koja donose prave poslovne rezultate.',
    'services.web.title': 'Prilagođeni Web Dizajn',
    'services.web.description': 'Zadivljujuće, profesionalne web stranice prilagođene vašem brendu. Responzivne, brzo učitavaju i optimizirane za pretvaranje posjetilaca u klijente.',
    'services.seo.title': 'SEO i Lokalna Prisutnost',
    'services.seo.description': 'Pronađite vas lokalni klijenti koji pretražuju online. Optimiziramo vašu stranicu za Google, Bing i lokalne direktorije.',
    'services.ecommerce.title': 'Online Naručivanje i Rezervacije',
    'services.ecommerce.description': 'Prihvatajte narudžbe, rezervacije i termine 24/7. Olakšajte klijentima da posluju s vama bilo kada.',
    'services.support.title': 'Stalna Podrška i Ažuriranja',
    'services.support.description': 'Vaša web stranica ostaje svježa i sigurna. Mi vodimo ažuriranja, sigurnosne kopije i tehničku podršku da se možete fokusirati na svoj posao.',

    // Process Section
    'process.title': 'Jednostavan, Transparentan Proces',
    'process.subtitle': 'Od prvog poziva do pokretanja, činimo dobijanje vaše profesionalne web stranice lakim.',
    'process.step1.title': 'Konsultacija',
    'process.step1.description': 'Razgovaramo o vašim poslovnim ciljevima, ciljnim klijentima i viziji. Brzi poziv, bez pritiska.',
    'process.step2.title': 'Besplatan Pregled',
    'process.step2.description': 'Pogledajte dizajn vaše web stranice prije nego se obavežete. Kreiramo pregled na osnovu vašeg brenda i povratnih informacija.',
    'process.step3.title': 'Pregled i Usavršavanje',
    'process.step3.description': 'Napravite promjene, prilagodite sadržaj i usavršite svaki detalj dok ne budete oduševljeni rezultatom.',
    'process.step4.title': 'Pokretanje i Rast',
    'process.step4.description': 'Vaša stranica je uživo sa obukom i podrškom. Gledajte kako vaša online prisutnost privlači više klijenata.',

    // Portfolio Section
    'portfolio.title': 'Naš Rad',
    'portfolio.subtitle': 'Pogledajte kako pomažemo preduzećima poput vašeg da uspiju online.',
    'portfolio.bella.title': 'Bella Italia Ristorante',
    'portfolio.bella.description': 'Elegantna web stranica italijanskog restorana sa online rezervacijama i prikazom menija.',
    'portfolio.cafe.title': 'Morning Brew Café',
    'portfolio.cafe.description': 'Moderna web stranica kafića sa online naručivanjem i Instagram galerijom.',
    'portfolio.barber.title': 'The Classic Barber',
    'portfolio.barber.description': 'Sofisticirana web stranica frizerskog salona sa sistemom rezervacije termina.',

    // Results Section
    'results.title': 'Pravi Rezultati za Prava Preduzeća',
    'results.subtitle': 'Naši klijenti ne dobijaju samo web stranice – dobijaju više klijenata, rezervacija i prihoda.',
    'results.testimonial.name': 'Marco Fernandez',
    'results.testimonial.business': 'Vlasnik, Tapas & Wine Bar',
    'results.testimonial.quote': 'Od pokretanja naše nove web stranice, online rezervacije su porasle 300%. Stranica izgleda nevjerovatno i klijenti je konstantno hvalе. Najbolja investicija koju smo napravili za naš restoran.',
    'results.metric1.value': '3x',
    'results.metric1.label': 'Više Rezervacija',
    'results.metric2.value': '85%',
    'results.metric2.label': 'Mobilni Promet',
    'results.metric3.value': '2 Sedmice',
    'results.metric3.label': 'Prosječno Vrijeme Pokretanja',

    // Contact Section
    'contact.title': 'Spremni da Povećate Svoj Posao?',
    'contact.subtitle': 'Dobijte besplatnu konsultaciju i pogledajte kako profesionalna web stranica može transformisati vaš posao.',
    'contact.form.name': 'Vaše Ime',
    'contact.form.email': 'Email Adresa',
    'contact.form.phone': 'Broj Telefona',
    'contact.form.message': 'Recite nam o svom poslu',
    'contact.form.submit': 'Zatraži Besplatnu Konsultaciju',
    'contact.form.success': 'Hvala! Kontaktiraćemo vas u roku od 24 sata.',
    'contact.form.error': 'Nešto nije u redu. Pokušajte ponovo ili nas nazovite direktno.',
    'contact.info.title': 'Ili Nas Kontaktirajte Direktno',
    'contact.info.email': 'primewwwebsolutions@gmail.com',
    'contact.info.phone': '+387 65 730 100',

    // Footer
    'footer.tagline': 'Pomažemo lokalnim preduzećima da uspiju online.',
    'footer.rights': '© 2024 Prime Web Solutions. Sva prava zadržana.',
  },
};
