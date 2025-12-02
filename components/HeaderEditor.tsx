import React from 'react';
import { Header, HeaderTheme, FONT_OPTIONS, HEADER_FONT_SIZE_OPTIONS, FONT_WEIGHT_OPTIONS, FONT_SIZE_OPTIONS } from '../types';
import Button from './Button';
import ImageUploader from './ImageUploader';

interface HeaderEditorProps {
  header: Header;
  onUpdate: (updatedHeader: Header) => void;
  onResetTheme: () => void;
}

// Helper function to convert HEX to RGB
const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

// Helper function to calculate luminance
const getLuminance = (r: number, g: number, b: number) => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Helper function to calculate contrast ratio
const calculateContrastRatio = (color1: string, color2: string): number => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (brighter + 0.05) / (darker + 0.05);
};


const HeaderEditor: React.FC<HeaderEditorProps> = ({ header, onUpdate, onResetTheme }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...header, [name]: value });
  };

  const handleLogoUpload = (base64Image: string) => {
    onUpdate({ ...header, logoSrc: base64Image });
  };

  const currentHeaderStyle: React.CSSProperties = {
    backgroundColor: header.backgroundColor,
    color: header.textColor,
    fontFamily: header.headerFontFamily,
  };

  const logoClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  // Calculate contrast ratio for accessibility
  const contrastRatio = calculateContrastRatio(header.textColor, header.backgroundColor);
  const isAccessible = contrastRatio >= 4.5; // WCAG AA standard for small text

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      <h3 className="text-xl font-bold mb-4 text-blue-700">హెడర్ ప్రివ్యూ (ఎడిటర్‌లో)</h3>
      <div
        className={`w-full p-4 flex flex-col items-center mb-6 rounded-md ${header.headerFontWeight} ${header.headerFontSize}`}
        style={currentHeaderStyle}
      >
        {header.logoSrc && (
          <div className={`w-full flex ${logoClasses[header.logoPosition]} mb-2`}>
            <img src={header.logoSrc} alt="Header Logo" className="max-h-20 object-contain" />
          </div>
        )}
        <h1 className={`${header.headerFontSize} ${header.headerFontWeight} mb-1`} style={{ fontFamily: header.headerFontFamily, color: header.textColor }}>
          {header.name || 'మీ ఇ-పేపర్ పేరు'}
        </h1>
        {header.tagline && (
          <p className="text-base" style={{ color: header.secondaryTextColor }}>
            {header.tagline}
          </p>
        )}
      </div>

      <h3 className="text-xl font-bold mb-4 text-blue-700">హెడర్ ఎడిటర్</h3>
      
      <div className="mb-4">
        <label htmlFor="logoSrc" className="block text-sm font-medium text-gray-700 mb-1">
          లోగో అప్‌లోడ్ చేయండి:
        </label>
        <ImageUploader
          onImageUpload={handleLogoUpload}
          currentImageSrc={header.logoSrc}
          label="లోగో చిత్రం"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="headerName" className="block text-sm font-medium text-gray-700 mb-1">
          హెడర్ పేరు:
        </label>
        <input
          type="text"
          id="headerName"
          name="name"
          value={header.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="మీ ఇ-పేపర్ పేరును నమోదు చేయండి"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
          ట్యాగ్‌లైన్:
        </label>
        <input
          type="text"
          id="tagline"
          name="tagline"
          value={header.tagline || ''}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="మీ ఇ-పేపర్ కోసం ట్యాగ్‌లైన్‌ను నమోదు చేయండి"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="headerTheme" className="block text-sm font-medium text-gray-700 mb-1">
          హెడర్ థీమ్:
        </label>
        <select
          id="headerTheme"
          name="theme"
          value={header.theme}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={HeaderTheme.CLASSIC}>క్లాసిక్</option>
          <option value={HeaderTheme.MODERN}>మోడర్న్</option>
          <option value={HeaderTheme.MINIMAL}>మినిమల్</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="logoPosition" className="block text-sm font-medium text-gray-700 mb-1">
          లోగో స్థానం:
        </label>
        <select
          id="logoPosition"
          name="logoPosition"
          value={header.logoPosition}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="left">ఎడమ</option>
          <option value="center">మధ్య</option>
          <option value="right">కుడి</option>
        </select>
      </div>

      <div className="mb-4 border-t pt-4 border-gray-200">
        <h4 className="text-lg font-semibold mb-2">ఫాంట్ ఎంపికలు (హెడర్ పేరు)</h4>
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="headerFontFamily" className="block text-sm font-medium text-gray-700 mb-1">
              ఫాంట్:
            </label>
            <select
              id="headerFontFamily"
              name="headerFontFamily"
              value={header.headerFontFamily}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="headerFontSize" className="block text-sm font-medium text-gray-700 mb-1">
              సైజు:
            </label>
            <select
              id="headerFontSize"
              name="headerFontSize"
              value={header.headerFontSize}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {HEADER_FONT_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="headerFontWeight" className="block text-sm font-medium text-gray-700 mb-1">
              బరువు:
            </label>
            <select
              id="headerFontWeight"
              name="headerFontWeight"
              value={header.headerFontWeight}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {FONT_WEIGHT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4 border-t pt-4 border-gray-200">
        <h4 className="text-lg font-semibold mb-2">గ్లోబల్ టెక్స్ట్ స్టైల్ సెట్టింగ్‌లు</h4>
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="globalFontFamily" className="block text-sm font-medium text-gray-700 mb-1">
              గ్లోబల్ ఫాంట్:
            </label>
            <select
              id="globalFontFamily"
              name="globalFontFamily"
              value={header.globalFontFamily}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="globalFontSize" className="block text-sm font-medium text-gray-700 mb-1">
              గ్లోబల్ ఫాంట్ సైజు:
            </label>
            <select
              id="globalFontSize"
              name="globalFontSize"
              value={header.globalFontSize}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {FONT_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="globalTextColor" className="block text-sm font-medium text-gray-700 mb-1">
              గ్లోబల్ టెక్స్ట్ రంగు:
            </label>
            <input
              type="color"
              id="globalTextColor"
              name="globalTextColor"
              value={header.globalTextColor}
              onChange={handleChange}
              className="w-16 h-10 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>


      <div className="mb-4 flex space-x-4 border-t pt-4 border-gray-200">
        <div>
          <label htmlFor="headerBgColor" className="block text-sm font-medium text-gray-700 mb-1">
            నేపథ్య రంగు:
          </label>
          <input
            type="color"
            id="headerBgColor"
            name="backgroundColor"
            value={header.backgroundColor}
            onChange={handleChange}
            className="w-16 h-10 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="headerTextColor" className="block text-sm font-medium text-gray-700 mb-1">
            ప్రధాన టెక్స్ట్ రంగు:
          </label>
          <input
            type="color"
            id="headerTextColor"
            name="textColor"
            value={header.textColor}
            onChange={handleChange}
            className="w-16 h-10 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="secondaryTextColor" className="block text-sm font-medium text-gray-700 mb-1">
            ద్వితీయ టెక్స్ట్ రంగు:
          </label>
          <input
            type="color"
            id="secondaryTextColor"
            name="secondaryTextColor"
            value={header.secondaryTextColor}
            onChange={handleChange}
            className="w-16 h-10 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      {!isAccessible && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md" role="alert">
          <p className="font-semibold">యాక్సెసిబిలిటీ హెచ్చరిక:</p>
          <p>ప్రస్తుత హెడర్ టెక్స్ట్ రంగు మరియు నేపథ్య రంగు కాంట్రాస్ట్ నిష్పత్తి ({contrastRatio.toFixed(2)}:1) WCAG AA ప్రమాణం (కనీసం 4.5:1) కంటే తక్కువగా ఉంది. మెరుగైన రీడబిలిటీ కోసం రంగులను మార్చండి.</p>
        </div>
      )}
    </div>
  );
};

export default HeaderEditor;