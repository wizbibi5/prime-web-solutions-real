'use client';

import { useLanguage } from '@/lib/i18n';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Quote, Star } from 'lucide-react';

export function ResultsSection() {
  const { t } = useLanguage();

  const metrics = [
    {
      valueKey: 'results.metric1.value',
      labelKey: 'results.metric1.label',
    },
    {
      valueKey: 'results.metric2.value',
      labelKey: 'results.metric2.label',
    },
    {
      valueKey: 'results.metric3.value',
      labelKey: 'results.metric3.label',
    },
  ];

  const successStories = [
    {
      image: '/images/generated/successful-small-business-owner.png',
      name: 'Maria Garcia',
      business: 'Café Luna',
      result: '+200% online orders',
    },
    {
      image: '/images/generated/professional-barbershop-interior-vintage.png',
      name: 'John Smith',
      business: 'Classic Cuts Barbershop',
      result: '+150% bookings',
    },
    {
      image: '/images/generated/elegant-fine-dining-restaurant.png',
      name: 'Sophie Laurent',
      business: 'Bella Vita Restaurant',
      result: '+300% reservations',
    },
  ];

  return (
    <section id="results" className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
            className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full backdrop-blur-sm border border-white/10"
          >
            <span className="text-sm font-semibold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Real Results
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t('results.title')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
            {t('results.subtitle')}
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -8 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl relative">
            {/* Quote Icon with gradient */}
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="absolute -top-6 left-8 w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl"
            >
              <Quote className="h-7 w-7 text-white" />
            </motion.div>

            {/* Testimonial Content */}
            <div className="pt-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed mb-8 italic font-medium">
                "{t('results.testimonial.quote')}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Image
                    src="/images/generated/testimonial-avatar-restaurant-owner.png"
                    alt={t('results.testimonial.name')}
                    width={64}
                    height={64}
                    className="rounded-full ring-4 ring-gradient-to-r from-cyan-400 to-purple-400"
                  />
                </motion.div>
                <div>
                  <div className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {t('results.testimonial.name')}
                  </div>
                  <div className="text-gray-600">
                    {t('results.testimonial.business')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Stories Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto"
        >
          {successStories.map((story, index) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="relative rounded-2xl overflow-hidden shadow-xl group"
            >
              <div className="relative h-64">
                <Image
                  src={story.image}
                  alt={story.business}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-2xl font-bold mb-1 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                  {story.result}
                </p>
                <p className="text-sm font-medium">{story.business}</p>
                <p className="text-xs text-gray-300">{story.name}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.labelKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
                {t(metric.valueKey)}
              </div>
              <div className="text-lg sm:text-xl text-gray-300">
                {t(metric.labelKey)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
