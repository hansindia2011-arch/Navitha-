import React from 'react';
import { Epaper, HeaderTheme, ContentPartType, PreviewDevice } from '../types';

interface EpaperViewerProps {
  epaper: Epaper;
  previewDevice?: PreviewDevice; // New prop for preview mode
}

const EpaperViewer: React.FC<EpaperViewerProps> = ({ epaper, previewDevice }) => {
  const { header } = epaper;

  // Base styles that apply irrespective of theme, but can be overridden
  const baseHeaderStyles: React.CSSProperties = {
    backgroundColor: header.backgroundColor,
    color: header.textColor,
  };

  const logoContainerClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const imagePositionClasses = {
    left: 'float-left mr-4',
    center: 'mx-auto block',
    right: 'float-right ml-4',
  };

  let headerContentClasses = 'flex flex-col items-center'; // Default center alignment

  switch (header.theme) {
    case HeaderTheme.CLASSIC:
      headerContentClasses = 'flex flex-col items-center'; // Centered
      break;
    case HeaderTheme.MODERN:
      headerContentClasses = 'flex flex-col items-start'; // Left-aligned
      break;
    case HeaderTheme.MINIMAL:
      headerContentClasses = 'flex flex-col items-end'; // Right-aligned
      break;
  }

  // Dynamic classes for preview devices
  let previewClasses = '';
  switch (previewDevice) {
    case 'mobile':
      previewClasses = 'w-[375px] mx-auto shadow-xl'; // Common mobile width
      break;
    case 'tablet':
      previewClasses = 'w-[768px] mx-auto shadow-xl'; // Common tablet width
      break;
    case 'printA4':
      // A4 dimensions at 96dpi: 794px width, 1123px height
      previewClasses = 'w-[794px] min-h-[1123px] mx-auto shadow-xl';
      break;
    case 'desktop':
    default:
      previewClasses = 'max-w-screen-lg mx-auto'; // Default for desktop, responsive
      break;
  }

  return (
    <div id="epaper-content" className={`bg-white shadow-lg print:shadow-none min-h-screen ${previewClasses}`}>
      {/* Header */}
      <header
        className="p-4 sm:p-6 md:p-8 border-b-2 border-current" // border-current uses the current text color
        style={baseHeaderStyles}
      >
        <div className={`${headerContentClasses}`}>
          {header.logoSrc && (
            <div className={`w-full flex ${logoContainerClasses[header.logoPosition]} mb-2`}>
              <img src={header.logoSrc} alt="Header Logo" className="max-h-24 object-contain" loading="lazy" />
            </div>
          )}
          <h1
            className={`${header.headerFontSize} ${header.headerFontWeight} select-none leading-tight`}
            style={{ fontFamily: header.headerFontFamily, color: header.textColor }}
          >
            {header.name}
          </h1>
          {header.tagline && (
            <p className="mt-2 text-lg font-light" style={{ color: header.secondaryTextColor }}>
              {header.tagline}
            </p>
          )}
        </div>
      </header>

      {/* Articles */}
      <main className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ fontFamily: header.globalFontFamily, color: header.globalTextColor }}>
        {epaper.articles.length === 0 && (
          <p className="col-span-full text-center text-gray-500 text-xl py-12">
            ఇక్కడ ప్రదర్శించడానికి ప్రస్తుతం ఆర్టికల్స్ లేవు. ఎడమవైపున ఉన్న 'కొత్త ఆర్టికల్ జోడించండి' బటన్‌ను ఉపయోగించండి.
          </p>
        )}
        {epaper.articles.map((article) => (
          <article key={article.id} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-2xl font-bold mb-2 text-blue-800" style={{ fontFamily: header.globalFontFamily }}>{article.title}</h2>
            {article.subtitle && (
              <p className="text-xl text-gray-700 font-semibold mb-3" style={{ fontFamily: header.globalFontFamily }}>{article.subtitle}</p>
            )}
            <div className="text-sm text-gray-600 mb-4 border-b pb-2 border-gray-200" style={{ fontFamily: header.globalFontFamily }}>
              {article.author && <span>రచయిత: {article.author}</span>}
              {article.publishDate && <span className="ml-4">తేదీ: {article.publishDate}</span>}
              {(article.tags && article.tags.length > 0) && (
                <span className="ml-4">ట్యాగ్‌లు: {article.tags.join(', ')}</span>
              )}
              {(article.categories && article.categories.length > 0) && (
                <span className="ml-4">కేటగిరీలు: {article.categories.join(', ')}</span>
              )}
            </div>
            <div className="space-y-4">
              {article.content.map((part) => {
                if (part.type === ContentPartType.TEXT) {
                  return (
                    <p
                      key={part.id}
                      className={`${part.fontSize} leading-relaxed`}
                      style={{ fontFamily: part.fontFamily, color: part.textColor }}
                      dangerouslySetInnerHTML={{ __html: part.value }} // Render HTML content
                    >
                    </p>
                  );
                } else if (part.type === ContentPartType.IMAGE) {
                  return (
                    <div key={part.id} className={`w-full overflow-hidden rounded-md ${imagePositionClasses[part.position]}`}>
                      {part.src ? (
                        <img src={part.src} alt={part.alt} className="w-full h-auto object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                          చిత్రం లేదు
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </article>
        ))}
      </main>
    </div>
  );
};

export default EpaperViewer;