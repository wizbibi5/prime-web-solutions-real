'use client';

import { useLanguage } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { PhoneCall, Eye, CheckCircle, Rocket } from 'lucide-react';
import Image from 'next/image';

export function ProcessSection() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: PhoneCall,
      titleKey: 'process.step1.title',
      descriptionKey: 'process.step1.description',
      number: '01',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Eye,
      titleKey: 'process.step2.title',
      descriptionKey: 'process.step2.description',
      number: '02',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: CheckCircle,
      titleKey: 'process.step3.title',
      descriptionKey: 'process.step3.description',
      number: '03',
      gradient: 'from-green-500 to-teal-600',
    },
    {
      icon: Rocket,
      titleKey: 'process.step4.title',
      descriptionKey: 'process.step4.description',
      number: '04',
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <section id="process" className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-5">
        <Image
          src="/images/generated/abstract-visualization-agile-development.png"
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
            className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full"
          >
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Our Process
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('process.title')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            {t('process.subtitle')}
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.titleKey}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative"
                >
                  {/* Connecting Line (hidden on mobile, visible on desktop) */}
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                      className="hidden lg:block absolute top-16 left-full w-full h-1 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 -translate-x-1/2 z-0 origin-left"
                    />
                  )}

                  <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all group">
                    {/* Step Number with gradient */}
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`absolute -top-4 -right-4 w-14 h-14 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center font-bold text-white text-lg shadow-xl`}
                    >
                      {step.number}
                    </motion.div>

                    {/* Icon with gradient background */}
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-6 w-14 h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-md`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t(step.descriptionKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
