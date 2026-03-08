
import React from 'react';
import { Card } from '@/components/ui/card';
import { Store, ShoppingBag, Shield, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const WhyChooseUsSection: React.FC = () => {
  const { t } = useLanguage();
  
  const featuresData = [
    {
      icon: <Store className="h-8 w-8" />,
      titleKey: 'whyChoose.wholesalers.title',
      descriptionKey: 'whyChoose.wholesalers.description',
      color: 'from-primary/80 to-primary',
      benefitKeys: ['whyChoose.wholesalers.benefit1', 'whyChoose.wholesalers.benefit2', 'whyChoose.wholesalers.benefit3'],
    },
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      titleKey: 'whyChoose.sellers.title',
      descriptionKey: 'whyChoose.sellers.description',
      color: 'from-accent to-accent/80',
      benefitKeys: ['whyChoose.sellers.benefit1', 'whyChoose.sellers.benefit2', 'whyChoose.sellers.benefit3'],
    },
    {
      icon: <Shield className="h-8 w-8" />,
      titleKey: 'whyChoose.secure.title',
      descriptionKey: 'whyChoose.secure.description',
      color: 'from-primary to-primary/70',
      benefitKeys: ['whyChoose.secure.benefit1', 'whyChoose.secure.benefit2', 'whyChoose.secure.benefit3'],
    },
  ];
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 font-poppins">
            {t('whyChoose.title')}
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto font-poppins px-2">
            {t('whyChoose.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {featuresData.map((feature, index) => (
            <Card key={index} className="p-6 md:p-8 border border-border shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 bg-card">
              <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <div className="text-primary-foreground">{feature.icon}</div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3 font-poppins">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground mb-6 font-poppins leading-relaxed">{t(feature.descriptionKey)}</p>
              
              <ul className="space-y-3">
                {feature.benefitKeys.map((benefitKey, idx) => (
                  <li key={idx} className="flex items-center text-sm text-foreground font-poppins">
                    <CheckCircle className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                    {t(benefitKey)}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
