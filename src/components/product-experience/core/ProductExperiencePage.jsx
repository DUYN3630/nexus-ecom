import React, { useState, useEffect, useCallback } from 'react';

// Import all section components
import HeroSection from '../sections/HeroSection';
import ProductLineupSection from '../sections/ProductLineupSection';
import SmartFilterSection from '../sections/SmartFilterSection';
import ComparisonSection from '../sections/ComparisonSection';
import AccessoriesSection from '../sections/AccessoriesSection';
import EcosystemSection from '../sections/EcosystemSection';

// Import shared components
import PageHeader from './PageHeader';
import PageFooter from './PageFooter';

// Map section type strings from JSON to the actual components
const SECTION_COMPONENTS = {
  Hero: HeroSection,
  ProductLineup: ProductLineupSection,
  SmartFilter: SmartFilterSection,
  Comparison: ComparisonSection,
  Accessories: AccessoriesSection,
  Ecosystem: EcosystemSection,
};

const ProductExperiencePage = ({ template }) => {
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

    // Observe only the sections defined in the template
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

  // Determine the correct background color
  const currentBgColor = activeFilter === 'All' ? '#FFFFFF' : bgColor;

  return (
    <div
      className="min-h-screen font-sans text-[#1D1D1F] selection:bg-[#0071E3] selection:text-white overflow-x-hidden transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: currentBgColor }}
    >
      <PageHeader scrollY={scrollY} />

      <main>
        {template.sections.map(section => {
          if (!section.enabled) {
            return null; // Don't render disabled sections
          }

          const SectionComponent = SECTION_COMPONENTS[section.type];

          if (!SectionComponent) {
            console.warn(`No component found for section type: ${section.type}`);
            return null;
          }

          // Pass specific props required by each component
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

export default ProductExperiencePage;
