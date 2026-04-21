import React from 'react';
import LegacyProductCardA from '../../legacy/LegacyProductCardA';
import LegacyAccessoryCardB from '../../legacy/LegacyAccessoryCardB';

// Mapping object for easy extension
const CARD_COMPONENTS = {
  LegacyProductCardA,
  LegacyAccessoryCardB,
  // Thêm các component card khác vào đây trong tương lai
  // LegacyMacCardC: LegacyMacCardC
};

const ProductCardAdapter = ({ cardType, product }) => {
  const CardComponent = CARD_COMPONENTS[cardType];

  if (!CardComponent) {
    console.error(`Card component type "${cardType}" is not registered.`);
    return <div className="text-red-500">Error: Card type "{cardType}" not found.</div>;
  }

  // Adapter Logic: Transform standardized 'product' props to legacy props
  const getAdaptedProps = () => {
    switch (cardType) {
      case 'LegacyProductCardA':
        return {
          productName: product.name,
          bgColor: product.colorClass,
          detailsLink: product.detailsUrl,
          buyLink: product.buyUrl
        };
      
      case 'LegacyAccessoryCardB':
        return {
          title: product.name,
          description: product.type,
          price: product.price
        };

      // Example for a hypothetical MacBook card
      // case 'LegacyMacCardC':
      //   return {
      //     modelName: product.model,
      //     chipInfo: product.chip,
      //     image: product.imageUrl,
      //     startingPrice: product.price
      //   };

      default:
        return {};
    }
  };

  const adaptedProps = getAdaptedProps();

  return <CardComponent {...adaptedProps} />;
};

export default ProductCardAdapter;
