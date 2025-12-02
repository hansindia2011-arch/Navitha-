import React, { useRef } from 'react';
import { Article, ArticleContentPart, ContentPartType, FONT_OPTIONS, FONT_SIZE_OPTIONS, TextContentPart, ImageContentPart } from '../types';
import Button from './Button';
import ImageUploader from './ImageUploader';
import { v4 as uuidv4 } from 'uuid';

interface ArticleEditorProps {
  article: Article;
  onUpdate: (updatedArticle: Article) => void;
  onClose: () => void;
  globalFontFamily: string;
  globalTextColor: string;
  globalFontSize: string;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onUpdate, onClose, globalFontFamily, globalTextColor, globalFontSize }) => {
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...article, title: e.target.value });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...article, subtitle: e.target.value });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...article, author: e.target.value });
  };

  const handlePublishDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...article, publishDate: e.target.value });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...article, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '') });
  };

  const handleCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...article, categories: e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat !== '') });
  };

  const handleContentPartChange = (id: string, newContentPart: ArticleContentPart) => {
    const updatedContent = article.content.map(part =>
      part.id === id ? newContentPart : part
    );
    onUpdate({ ...article, content: updatedContent });
  };

  const handleTextPartChange = (id: string, field: keyof TextContentPart, value: string) => {
    const updatedContent = article.content.map(part => {
      if (part.id === id && part.type === ContentPartType.TEXT) {
        return { ...part, [field]: value } as TextContentPart;
      }
      return part;
    });
    onUpdate({ ...article, content: updatedContent });
  };

  const handleImagePartUpload = (id: string, base64Image: string) => {
    const updatedContent = article.content.map(part => {
      if (part.id === id && part.type === ContentPartType.IMAGE) {
        return { ...part, src: base64Image } as ImageContentPart;
      }
      return part;
    });
    onUpdate({ ...article, content: updatedContent });
  };

  const handleImagePartAltChange = (id: string, altText: string) => {
    const updatedContent = article.content.map(part => {
      if (part.id === id && part.type === ContentPartType.IMAGE) {
        return { ...part, alt: altText } as ImageContentPart;
      }
      return part;
    });
    onUpdate({ ...article, content: updatedContent });
  };

  const handleImagePartPositionChange = (id: string, position: 'left' | 'center' | 'right') => {
    const updatedContent = article.content.map(part => {
      if (part.id === id && part.type === ContentPartType.IMAGE) {
        return { ...part, position: position } as ImageContentPart;
      }
      return part;
    });
    onUpdate({ ...article, content: updatedContent });
  };


  const applyTextFormatting = (id: string, tag: string) => {
    const textarea = textareaRefs.current[id];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end, textarea.value.length);

    const newText = `${before}<${tag}>${selectedText}</${tag}>${after}`;
    handleTextPartChange(id, 'value', newText);

    // After updating, manually set cursor position and selection
    // RequestAnimationFrame to ensure textarea value is updated before setting selection
    requestAnimationFrame(() => {
      if (textareaRefs.current[id]) {
        textareaRefs.current[id]!.focus();
        textareaRefs.current[id]!.setSelectionRange(start + `<${tag}>`.length, end + `<${tag}>`.length);
      }
    });
  };

  const addContentPart = (type: ContentPartType) => {
    const newPartId = uuidv4();
    if (type === ContentPartType.TEXT) {
      onUpdate({
        ...article,
        content: [
          ...article.content,
          {
            id: newPartId,
            type: ContentPartType.TEXT,
            value: '',
            fontFamily: globalFontFamily, // Inherit global font
            textColor: globalTextColor, // Inherit global color
            fontSize: globalFontSize, // Inherit global size
          },
        ],
      });
    } else if (type === ContentPartType.IMAGE) {
      onUpdate({
        ...article,
        content: [
          ...article.content,
          { id: newPartId, type: ContentPartType.IMAGE, src: '', alt: 'Image', position: 'center' },
        ],
      });
    }
  };

  const removeContentPart = (id: string) => {
    onUpdate({
      ...article,
      content: article.content.filter(part => part.id !== id),
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      <h3 className="text-xl font-bold mb-4 text-blue-700">ఆర్టికల్ ఎడిటర్</h3>
      <div className="mb-4">
        <label htmlFor="articleTitle" className="block text-sm font-medium text-gray-700 mb-1">
          శీర్షిక:
        </label>
        <input
          type="text"
          id="articleTitle"
          value={article.title}
          onChange={handleTitleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="ఆర్టికల్ శీర్షికను నమోదు చేయండి"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="articleSubtitle" className="block text-sm font-medium text-gray-700 mb-1">
          ఉప-శీర్షిక:
        </label>
        <input
          type="text"
          id="articleSubtitle"
          value={article.subtitle || ''}
          onChange={handleSubtitleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="ఆర్టికల్ ఉప-శీర్షికను నమోదు చేయండి (ఐచ్ఛికం)"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="articleAuthor" className="block text-sm font-medium text-gray-700 mb-1">
            రచయిత:
          </label>
          <input
            type="text"
            id="articleAuthor"
            value={article.author || ''}
            onChange={handleAuthorChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="రచయిత పేరు"
          />
        </div>
        <div>
          <label htmlFor="articlePublishDate" className="block text-sm font-medium text-gray-700 mb-1">
            ప్రచురణ తేదీ:
          </label>
          <input
            type="date"
            id="articlePublishDate"
            value={article.publishDate || ''}
            onChange={handlePublishDateChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="articleTags" className="block text-sm font-medium text-gray-700 mb-1">
            ట్యాగ్‌లు (కామాతో వేరు చేయండి):
          </label>
          <input
            type="text"
            id="articleTags"
            value={article.tags?.join(', ') || ''}
            onChange={handleTagsChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="వార్తలు, స్థానికం, క్రీడలు"
          />
        </div>
        <div>
          <label htmlFor="articleCategories" className="block text-sm font-medium text-gray-700 mb-1">
            కేటగిరీలు (కామాతో వేరు చేయండి):
          </label>
          <input
            type="text"
            id="articleCategories"
            value={article.categories?.join(', ') || ''}
            onChange={handleCategoriesChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="రాష్ట్రం, జాతీయ, అంతర్జాతీయ"
          />
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2">కంటెంట్ విభాగాలు</h4>
        {article.content.map((part) => (
          <div key={part.id} className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50 relative">
            <Button
              variant="danger"
              onClick={() => removeContentPart(part.id)}
              className="absolute top-2 right-2 p-1 text-xs"
              aria-label="తొలగించు కంటెంట్ భాగం"
            >
              తొలగించు
            </Button>
            {part.type === ContentPartType.TEXT ? (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  టెక్స్ట్ కంటెంట్:
                </label>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="p-1 text-sm font-bold"
                    onClick={() => applyTextFormatting(part.id, 'strong')}
                    aria-label="బోల్డ్"
                  >
                    B
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="p-1 text-sm italic"
                    onClick={() => applyTextFormatting(part.id, 'em')}
                    aria-label="ఇటాలిక్"
                  >
                    I
                  </Button>
                </div>
                <textarea
                  ref={(el: HTMLTextAreaElement | null) => { textareaRefs.current[part.id] = el; }}
                  value={part.value}
                  onChange={(e) => handleTextPartChange(part.id, 'value', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32 resize-y"
                  placeholder="టెక్స్ట్ కంటెంట్‌ను నమోదు చేయండి (HTML ట్యాగ్‌లకు మద్దతు ఇస్తుంది)"
                  aria-label="టెక్స్ట్ కంటెంట్"
                />
                <div className="flex flex-wrap gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ఫాంట్:
                    </label>
                    <select
                      value={part.fontFamily}
                      onChange={(e) => handleTextPartChange(part.id, 'fontFamily', e.target.value)}
                      className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      aria-label="ఫాంట్"
                    >
                      {FONT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      టెక్స్ట్ రంగు:
                    </label>
                    <input
                      type="color"
                      value={part.textColor}
                      onChange={(e) => handleTextPartChange(part.id, 'textColor', e.target.value)}
                      className="w-16 h-10 border border-gray-300 rounded-md"
                      aria-label="టెక్స్ట్ రంగు"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ఫాంట్ సైజు:
                    </label>
                    <select
                      value={part.fontSize}
                      onChange={(e) => handleTextPartChange(part.id, 'fontSize', e.target.value)}
                      className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      aria-label="ఫాంట్ సైజు"
                    >
                      {FONT_SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <ImageUploader
                  label="ఆర్టికల్ చిత్రం"
                  currentImageSrc={part.src}
                  onImageUpload={(base64Image) => handleImagePartUpload(part.id, base64Image)}
                />
                <div className="mt-2">
                  <label htmlFor={`image-alt-${part.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    అల్ట్ టెక్స్ట్:
                  </label>
                  <input
                    type="text"
                    id={`image-alt-${part.id}`}
                    value={part.alt}
                    onChange={(e) => handleImagePartAltChange(part.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="చిత్ర వివరణ కోసం అల్ట్ టెక్స్ట్"
                    aria-label="చిత్ర అల్ట్ టెక్స్ట్"
                  />
                </div>
                <div className="mt-2">
                  <label htmlFor={`image-position-${part.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    చిత్ర స్థానం:
                  </label>
                  <select
                    id={`image-position-${part.id}`}
                    value={part.position}
                    onChange={(e) => handleImagePartPositionChange(part.id, e.target.value as 'left' | 'center' | 'right')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    aria-label="చిత్ర స్థానం"
                  >
                    <option value="left">ఎడమ</option>
                    <option value="center">మధ్య</option>
                    <option value="right">కుడి</option>
                  </select>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="flex gap-2 mt-4">
          <Button onClick={() => addContentPart(ContentPartType.TEXT)} variant="secondary" aria-label="టెక్స్ట్ బ్లాక్‌ను జోడించండి">
            టెక్స్ట్ బ్లాక్‌ను జోడించండి
          </Button>
          <Button onClick={() => addContentPart(ContentPartType.IMAGE)} variant="secondary" aria-label="చిత్ర బ్లాక్‌ను జోడించండి">
            చిత్ర బ్లాక్‌ను జోడించండి
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-lg font-semibold mb-2">ఇమేజ్ గ్యాలరీ మేనేజర్ (త్వరలో)</h4>
        <p className="text-gray-600">అన్ని ఆర్టికల్స్‌లో ఇప్పటికే ఉన్న చిత్రాలను ఉపయోగించడానికి మరియు నిర్వహించడానికి ఒక ఇమేజ్ గ్యాలరీ ఇక్కడ ఉంటుంది.</p>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onClose} variant="primary" aria-label="ఎడిటింగ్‌ను పూర్తి చేయండి">
          పూర్తయింది
        </Button>
      </div>
    </div>
  );
};

export default ArticleEditor;