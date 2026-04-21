import React, { useState, useEffect, useCallback } from 'react';

// Import all section components
import HeroSection from '../../components/product-experience/sections/HeroSection';
import ProductLineupSection from '../../components/product-experience/sections/ProductLineupSection';
import SmartFilterSection from '../../components/product-experience/sections/SmartFilterSection';
import ComparisonSection from '../../components/product-experience/sections/ComparisonSection';
import AccessoriesSection from '../../components/product-experience/sections/AccessoriesSection';
import EcosystemSection from '../../components/product-experience/sections/EcosystemSection';

// Import shared components
import PageHeader from '../../components/product-experience/core/PageHeader';
import PageFooter from '../../components/product-experience/core/PageFooter';

// --- SIMULATE BACKEND DATA ---
import iphoneTemplate from '../../config/templates/iphone17-premium.json';
import macbookTemplate from '../../config/templates/macbook-premium.json';

// Map section type strings from JSON to the actual components
const SECTION_COMPONENTS = {
  Hero: HeroSection,
  ProductLineup: ProductLineupSection,
  SmartFilter: SmartFilterSection,
  Comparison: ComparisonSection,
  Accessories: AccessoriesSection,
  Ecosystem: EcosystemSection,
};

const ProductExperience = () => {
  // In a real app, you might get the template name from URL params
  const [template, setTemplate] = useState(iphoneTemplate); 
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    template?.sections.forEach(section => {
        if(section.enabled){
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [template]);

  const handleFilterChange = useCallback((filter, themeColor) => {
    setActiveFilter(filter);
    setBgColor(themeColor);
  }, []);

  if (!template) {
    return <div>Loading experience...</div>;
  }

  const currentBgColor = activeFilter === 'All' ? '#FFFFFF' : bgColor;

  // You can add a button or other UI to switch templates, e.g., setTemplate(macbookTemplate)
  return (
    <div
      className="min-h-screen font-sans text-[#1D1D1F] selection:bg-[#0071E3] selection:text-white overflow-x-hidden transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: currentBgColor }}
    >
      <PageHeader scrollY={scrollY} />

      <main>
        {template.sections.map(section => {
          if (!section.enabled) return null;

          const SectionComponent = SECTION_COMPONENTS[section.type];
          if (!SectionComponent) return null;

          const getSectionProps = () => {
              const baseProps = {
                  key: section.id,
                  id: section.id,
                  config: section.config,
                  isVisible: !!visibleSections[section.id],
              }
              
              switch(section.type) {
                  case 'Hero':
                      return {...baseProps, scrollY: scrollY};
                  case 'SmartFilter':
                      return {...baseProps, onFilterChange: handleFilterChange};
                  default:
                      return baseProps;
              }
          }

          return <SectionComponent {...getSectionProps()} />;
        })}
      </main>

      <PageFooter />
    </div>
  );
};

export default ProductExperience;
