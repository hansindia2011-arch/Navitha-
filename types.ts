export enum HeaderTheme {
  CLASSIC = 'classic',
  MODERN = 'modern',
  MINIMAL = 'minimal',
}

export interface Header {
  name: string;
  theme: HeaderTheme;
  backgroundColor: string;
  textColor: string;
  logoSrc?: string; // Base64 or URL for the header logo
  tagline?: string; // Optional tagline text
  headerFontFamily: string;
  headerFontSize: string; // Tailwind class, e.g., 'text-4xl'
  headerFontWeight: string; // Tailwind class, e.g., 'font-bold'
  secondaryTextColor: string;
  logoPosition: 'left' | 'center' | 'right';
  // Global text styles, now part of header
  globalFontFamily: string;
  globalTextColor: string;
  globalFontSize: string;
}

export enum ContentPartType {
  TEXT = 'text',
  IMAGE = 'image',
}

export interface TextContentPart {
  id: string;
  type: ContentPartType.TEXT;
  value: string; // Can now contain HTML for bold/italic
  fontFamily: string;
  textColor: string;
  fontSize: string;
}

export interface ImageContentPart {
  id: string;
  type: ContentPartType.IMAGE;
  src: string; // Base64 or URL
  alt: string;
  position: 'left' | 'center' | 'right'; // New: Image positioning
}

export type ArticleContentPart = TextContentPart | ImageContentPart;

export interface Article {
  id: string;
  title: string;
  subtitle?: string; // New: Optional subtitle
  author?: string; // New: Author name
  publishDate?: string; // New: Publish date (e.g., YYYY-MM-DD)
  tags?: string[]; // New: List of tags
  categories?: string[]; // New: List of categories
  content: ArticleContentPart[];
}

export interface Epaper {
  header: Header;
  articles: Article[];
}

export const FONT_OPTIONS = [
  { label: 'Noto Sans Telugu', value: 'Noto Sans Telugu, sans-serif' },
  { label: 'Noto Serif Telugu', value: 'Noto Serif Telugu, serif' },
  { label: 'Palanquin Dark', value: 'Palanquin Dark, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
];

export const FONT_SIZE_OPTIONS = [
  { label: 'చిన్నది (sm)', value: 'text-sm' },
  { label: 'సాధారణం (base)', value: 'text-base' },
  { label: 'మధ్యస్థం (lg)', value: 'text-lg' },
  { label: 'పెద్దది (xl)', value: 'text-xl' },
  { label: 'చాలా పెద్దది (2xl)', value: 'text-2xl' },
];

export const HEADER_FONT_SIZE_OPTIONS = [
  { label: 'చిన్నది (2xl)', value: 'text-2xl' },
  { label: 'సాధారణం (3xl)', value: 'text-3xl' },
  { label: 'మధ్యస్థం (4xl)', value: 'text-4xl' },
  { label: 'పెద్దది (5xl)', value: 'text-5xl' },
  { label: 'చాలా పెద్దది (6xl)', value: 'text-6xl' },
];

export const FONT_WEIGHT_OPTIONS = [
  { label: 'సాధారణం', value: 'font-normal' },
  { label: 'మధ్యస్థం', value: 'font-medium' },
  { label: 'సెమీ-బోల్డ్', value: 'font-semibold' },
  { label: 'బోల్డ్', value: 'font-bold' },
  { label: 'ఎక్స్‌ట్రా-బోల్డ్', value: 'font-extrabold' },
];

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile' | 'printA4';