'use client';

import { useLanguage } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Globe, Search, ShoppingCart, Headphones } from 'lucide-react';
import Image from 'next/image';

export function ServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      icon: Globe,
      titleKey: 'services.web.title',
      descriptionKey: 'services.web.description',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Search,
      titleKey: 'services.seo.title',
      descriptionKey: 'services.seo.description',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: ShoppingCart,
      titleKey: 'services.ecommerce.title',
      descriptionKey: 'services.ecommerce.description',
      gradient: 'from-green-500 to-teal-600',
    },
    {
      icon: Headphones,
      titleKey: 'services.support.title',
      descriptionKey: 'services.support.description',
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <section id="services" className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
        <Image
          src="/images/generated/modern-professional-web-development.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-cyan-100 to-purple-100 rounded-full"
          >
            <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              Our Services
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('services.title')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            {t('services.subtitle')}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all group overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative z-10">
                  {/* Icon with gradient background */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`mb-6 w-16 h-16 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {t(service.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {t(service.descriptionKey)}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
