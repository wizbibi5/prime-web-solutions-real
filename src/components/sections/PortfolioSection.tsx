'use client';

import { useLanguage } from '@/lib/i18n';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function PortfolioSection() {
  const { t } = useLanguage();

  const portfolioItems = [
    {
      image: '/images/generated/portfolio-bella-italia-website.png',
      titleKey: 'portfolio.bella.title',
      descriptionKey: 'portfolio.bella.description',
    },
    {
      image: '/images/generated/portfolio-morning-brew-cafe-website.png',
      titleKey: 'portfolio.cafe.title',
      descriptionKey: 'portfolio.cafe.description',
    },
    {
      image: '/images/generated/portfolio-classic-barber-website.png',
      titleKey: 'portfolio.barber.title',
      descriptionKey: 'portfolio.barber.description',
    },
  ];

  return (
    <section id="portfolio" className="py-20 sm:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
              Our Portfolio
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('portfolio.title')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            {t('portfolio.subtitle')}
          </p>
        </motion.div>

        {/* Portfolio Grid */}
        <div className="max-w-6xl mx-auto space-y-12">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-8 items-center`}
            >
              {/* Image */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  whileHover={{ scale: 1.05, rotateZ: 1 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl group"
                >
                  <Image
                    src={item.image}
                    alt={t(item.titleKey)}
                    width={800}
                    height={600}
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Hover Overlay with gradient */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-cyan-600/90 via-purple-600/90 to-pink-600/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileHover={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-white text-center p-6"
                    >
                      <p className="text-2xl font-bold mb-2">View Project</p>
                      <p className="text-sm opacity-90">Click to explore details</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full lg:w-1/2 space-y-4"
              >
                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-cyan-800 to-purple-800 bg-clip-text text-transparent">
                  {t(item.titleKey)}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t(item.descriptionKey)}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Responsive Design', 'Online Booking', 'SEO Optimized'].map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-50 to-purple-50 text-gray-700 rounded-full text-sm font-medium hover:from-cyan-100 hover:to-purple-100 transition-all cursor-default"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
