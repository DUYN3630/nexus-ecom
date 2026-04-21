import React from 'react';
import { Camera, Zap, Briefcase, Heart } from 'lucide-react';

const lifestyles = [
  {
    id: 'visionaries',
    icon: Camera,
    title: 'The Visionary',
    description: 'For creators who demand the best camera and display.',
    anchor: '#visionaries'
  },
  {
    id: 'performers',
    icon: Zap,
    title: 'The Performer',
    description: 'For power users who need top speed and performance.',
    anchor: '#performers'
  },
  {
    id: 'all-rounders',
    icon: Heart,
    title: 'The All-Rounder',
    description: 'For those who want a perfect balance of features and value.',
    anchor: '#all-rounders'
  },
  {
    id: 'business',
    icon: Briefcase,
    title: 'The Professional',
    description: 'For business use with long battery life and security.',
    anchor: '#performers' 
  },
];

const LifestyleCard = ({ icon: Icon, title, description, anchor }) => {
  const handleClick = (e) => {
    e.preventDefault();
    const targetElement = document.querySelector(anchor);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <a href={anchor} onClick={handleClick} className="block p-8 bg-paper rounded-2xl border border-soft hover:border-slate-300 transition-all group h-full shadow-md hover:shadow-xl">
      <Icon className="w-8 h-8 text-accent mb-4" strokeWidth={1.5} />
      <h3 className="text-xl font-bold text-charcoal mb-2">{title}</h3>
      <p className="text-slate-500">{description}</p>
    </a>
  );
};

const LifestyleSection = () => {
  return (
    <section>
      <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic text-charcoal">
          Choose by Lifestyle
        </h2>
        <p className="mt-4 text-md text-slate-500">
          Select a profile that best describes you to see our recommendations.
        </p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {lifestyles.map(style => <LifestyleCard key={style.id} {...style} />)}
      </div>
    </section>
  );
};

export default LifestyleSection;
