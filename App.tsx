import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Article, Epaper, HeaderTheme, ContentPartType, FONT_OPTIONS, FONT_SIZE_OPTIONS, PreviewDevice, Header } from './types';
import HeaderEditor from './components/HeaderEditor';
import ArticleEditor from './components/ArticleEditor';
import EpaperViewer from './components/EpaperViewer';
import Button from './components/Button';
import { exportAsPng, exportAsPdf, exportAsHtml } from './services/exportService';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initial Epaper state
const initialEpaperState: Epaper = {
  header: {
    name: 'ఈరోజు వార్తలు',
    theme: HeaderTheme.CLASSIC,
    backgroundColor: '#3b82f6', // blue-500
    textColor: '#ffffff', // white
    logoSrc: '', // No logo initially
    tagline: 'మీరు తెలుసుకోవలసిన వార్తలు', // Default tagline
    headerFontFamily: FONT_OPTIONS[0].value, // Default header font family
    headerFontSize: 'text-4xl', // Default header font size
    headerFontWeight: 'font-extrabold', // Default header font weight
    secondaryTextColor: '#cccccc', // Default secondary text color
    logoPosition: 'left', // Default logo position
    // Global text styles, now part of header
    globalFontFamily: FONT_OPTIONS[0].value, // Default global font family
    globalTextColor: '#333333', // Default global text color
    globalFontSize: FONT_SIZE_OPTIONS[1].value, // Default global font size (base)
  },
  articles: [],
};

// Extract initial header state for reset functionality
const initialHeaderState: Header = initialEpaperState.header;

const MAX_HISTORY_SIZE = 20;

const App: React.FC = () => {
  const [epaper, setEpaper] = useState<Epaper>(initialEpaperState);
  const [history, setHistory] = useState<Epaper[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [copiedArticle, setCopiedArticle] = useState<Article | null>(null);

  // Load from localStorage on initial mount
  useEffect(() => {
    const savedEpaper = localStorage.getItem('epaperEditorState');
    if (savedEpaper) {
      const parsedState: Epaper = JSON.parse(savedEpaper);
      setEpaper(parsedState);
      setHistory([parsedState]); // Start history with the loaded state
      setHistoryIndex(0);
    } else {
      setEpaper(initialEpaperState);
      setHistory([initialEpaperState]); // Start history with initial state
      setHistoryIndex(0);
    }
  }, []);

  // Save to localStorage whenever epaper changes
  useEffect(() => {
    localStorage.setItem('epaperEditorState', JSON.stringify(epaper));
  }, [epaper]);

  // Wrapper for setEpaper to handle history
  const updateEpaperWithHistory = useCallback((newState: Epaper) => {
    setHistory((prevHistory) => {
      // Truncate history if we're not at the end (i.e., we undid something)
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      // Add the new state
      newHistory.push(newState);
      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        return newHistory.slice(newHistory.length - MAX_HISTORY_SIZE); // Keep only the latest MAX_HISTORY_SIZE
      }
      return newHistory;
    });
    setHistoryIndex((prevIndex) => {
      // If history was truncated or not at end, new index is newHistory.length - 1
      const newCalculatedIndex = Math.min(historyIndex + 1, (history.slice(0, historyIndex + 1).length + 1) -1); // Adjust for truncation
      const finalIndex = Math.min(newCalculatedIndex, MAX_HISTORY_SIZE - 1);
      return Math.max(0, finalIndex);
    });
    setEpaper(newState);
  }, [history, historyIndex]); // Depend on history and historyIndex to ensure correct slicing

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setEpaper(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setEpaper(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);


  const updateHeader = useCallback((updatedHeader: Epaper['header']) => {
    updateEpaperWithHistory({ ...epaper, header: updatedHeader });
  }, [epaper, updateEpaperWithHistory]);

  const resetHeaderToThemeDefaults = useCallback(() => {
    const newHeader = {
      ...initialHeaderState, // All default theme properties
      name: epaper.header.name, // Keep current name
      logoSrc: epaper.header.logoSrc, // Keep current logo
    };
    updateEpaperWithHistory({ ...epaper, header: newHeader });
  }, [epaper, updateEpaperWithHistory]);


  const addArticle = useCallback(() => {
    const newArticle: Article = {
      id: uuidv4(),
      title: 'కొత్త ఆర్టికల్ శీర్షిక',
      subtitle: 'ఇది ఒక కొత్త ఉప-శీర్షిక',
      author: 'అజ్ఞాత రచయిత',
      publishDate: getTodayDate(),
      tags: ['వార్తలు', 'స్థానికం'],
      categories: ['సాధారణం'],
      content: [
        {
          id: uuidv4(),
          type: ContentPartType.TEXT,
          value: 'ఇక్కడ మీ ఆర్టికల్ కంటెంట్‌ను నమోదు చేయండి...',
          fontFamily: epaper.header.globalFontFamily || FONT_OPTIONS[0].value, // Inherit global font or default
          textColor: epaper.header.globalTextColor || '#000000', // Inherit global color or default
          fontSize: epaper.header.globalFontSize || FONT_SIZE_OPTIONS[1].value, // Inherit global size or default
        },
      ],
    };
    updateEpaperWithHistory({ ...epaper, articles: [...epaper.articles, newArticle] });
    setSelectedArticleId(newArticle.id); // Automatically open new article for editing
  }, [epaper, updateEpaperWithHistory]);

  const updateArticle = useCallback((updatedArticle: Article) => {
    updateEpaperWithHistory({
      ...epaper,
      articles: epaper.articles.map((art) =>
        art.id === updatedArticle.id ? updatedArticle : art
      ),
    });
  }, [epaper, updateEpaperWithHistory]);

  const deleteArticle = useCallback((id: string) => {
    updateEpaperWithHistory({
      ...epaper,
      articles: epaper.articles.filter((art) => art.id !== id),
    });
    if (selectedArticleId === id) {
      setSelectedArticleId(null);
    }
  }, [epaper, selectedArticleId, updateEpaperWithHistory]);

  const moveArticle = useCallback((id: string, direction: 'up' | 'down') => {
    const articles = [...epaper.articles];
    const index = articles.findIndex((article) => article.id === id);

    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [articles[index - 1], articles[index]] = [articles[index], articles[index - 1]];
    } else if (direction === 'down' && index < articles.length - 1) {
      [articles[index + 1], articles[index]] = [articles[index], articles[index + 1]];
    }
    updateEpaperWithHistory({ ...epaper, articles });
  }, [epaper, updateEpaperWithHistory]);


  const clearAllArticles = useCallback(() => {
    if (window.confirm('మీరు అన్ని ఆర్టికల్స్‌ను తొలగించడానికి ఖచ్చితంగా ఉన్నారా?')) {
      updateEpaperWithHistory({ ...epaper, articles: [] });
      setSelectedArticleId(null);
    }
  }, [epaper, updateEpaperWithHistory]);

  const copyArticle = useCallback((articleToCopy: Article) => {
    setCopiedArticle(articleToCopy);
    alert(`ఆర్టికల్ "${articleToCopy.title}" కాపీ చేయబడింది!`);
  }, []);

  const pasteArticle = useCallback(() => {
    if (copiedArticle) {
      const newArticle: Article = {
        ...copiedArticle,
        id: uuidv4(), // Generate new ID for pasted article
        title: `కాపీ: ${copiedArticle.title}`, // Prefix title
        // Deep copy content parts to ensure new IDs for content parts if needed
        content: copiedArticle.content.map(part => ({ ...part, id: uuidv4() }))
      };
      updateEpaperWithHistory({ ...epaper, articles: [...epaper.articles, newArticle] });
      setSelectedArticleId(newArticle.id);
      alert(`ఆర్టికల్ "${newArticle.title}" పేస్ట్ చేయబడింది!`);
    } else {
      alert('పేస్ట్ చేయడానికి ఆర్టికల్ ఏదీ కాపీ చేయబడలేదు.');
    }
  }, [epaper, copiedArticle, updateEpaperWithHistory]);


  const handleExport = useCallback(async (exportType: 'png' | 'pdf' | 'html') => {
    setIsPreviewMode(true); // Ensure preview is active
    setPreviewDevice('printA4'); // Set to A4 for export purposes

    // Add a small delay to allow React to render the preview mode before capturing
    await new Promise(resolve => setTimeout(resolve, 100));

    if (exportType === 'png') {
      await exportAsPng('epaper-content', epaper.header.name || 'epaper');
    } else if (exportType === 'pdf') {
      await exportAsPdf('epaper-content', epaper.header.name || 'epaper');
    } else if (exportType === 'html') {
      await exportAsHtml('epaper-content', epaper.header.name || 'epaper');
    }
    // Optionally reset previewDevice and isPreviewMode after export
    // setIsPreviewMode(false); // Let the user manually switch back from preview if they wish
    // setPreviewDevice('desktop'); // Keep A4 for subsequent exports or manual reset
  }, [epaper.header.name]);

  const selectedArticle = selectedArticleId
    ? epaper.articles.find((art) => art.id === selectedArticleId)
    : null;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* Sidebar / Controls */}
      <aside className="w-full lg:w-1/4 p-4 bg-gray-800 text-white shadow-lg lg:h-screen lg:overflow-y-auto">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-300">ఇ-పేపర్ ఎడిటర్</h2>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={undo} disabled={!canUndo} variant="secondary" className="w-1/2">
              మునుపటి స్థితికి
            </Button>
            <Button onClick={redo} disabled={!canRedo} variant="secondary" className="w-1/2">
              మళ్లీ చేయి
            </Button>
          </div>

          <Button onClick={addArticle} className="w-full" variant="primary">
            కొత్త ఆర్టికల్ జోడించండి
          </Button>

          <Button onClick={pasteArticle} className="w-full" variant="secondary" disabled={!copiedArticle}>
            ఆర్టికల్‌ను పేస్ట్ చేయి
          </Button>

          <Button onClick={() => { setIsPreviewMode(!isPreviewMode); setPreviewDevice('desktop'); }} className="w-full" variant="secondary">
            {isPreviewMode ? 'ఎడిట్ మోడ్‌కు మారండి' : 'ప్రివ్యూ మోడ్‌కు మారండి'}
          </Button>

          <Button onClick={resetHeaderToThemeDefaults} className="w-full" variant="secondary">
            హెడర్ థీమ్‌ను రీసెట్ చేయి
          </Button>


          <div className="mt-4 pt-4 border-t border-gray-700">
            <h3 className="text-xl font-bold mb-2 text-blue-300">ప్రివ్యూ మోడ్‌లు</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => { setIsPreviewMode(true); setPreviewDevice('desktop'); }}
                variant={previewDevice === 'desktop' && isPreviewMode ? 'primary' : 'secondary'}
                className="text-xs"
              >
                డెస్క్‌టాప్
              </Button>
              <Button
                onClick={() => { setIsPreviewMode(true); setPreviewDevice('tablet'); }}
                variant={previewDevice === 'tablet' && isPreviewMode ? 'primary' : 'secondary'}
                className="text-xs"
              >
                టాబ్లెట్
              </Button>
              <Button
                onClick={() => { setIsPreviewMode(true); setPreviewDevice('mobile'); }}
                variant={previewDevice === 'mobile' && isPreviewMode ? 'primary' : 'secondary'}
                className="text-xs"
              >
                మొబైల్
              </Button>
              <Button
                onClick={() => { setIsPreviewMode(true); setPreviewDevice('printA4'); }}
                variant={previewDevice === 'printA4' && isPreviewMode ? 'primary' : 'secondary'}
                className="text-xs"
              >
                ప్రింట్ (A4)
              </Button>
            </div>
          </div>
          
          <Button onClick={clearAllArticles} className="w-full" variant="danger">
            అన్ని ఆర్టికల్స్‌ను తొలగించండి
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-blue-300">ఆర్టికల్స్ జాబితా</h3>
          {epaper.articles.length === 0 ? (
            <p className="text-gray-400">ప్రస్తుతం ఆర్టికల్స్ లేవు.</p>
          ) : (
            <ul className="space-y-2">
              {epaper.articles.map((article, index) => (
                <li key={article.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                  <span className="text-sm font-medium text-gray-200 truncate pr-2">
                    {article.title}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => copyArticle(article)}
                      variant="secondary"
                      className="text-xs py-1 px-2"
                      aria-label="ఆర్టికల్‌ను కాపీ చేయి"
                    >
                      కాపీ చేయి
                    </Button>
                    <Button
                      onClick={() => moveArticle(article.id, 'up')}
                      variant="secondary"
                      className="text-xs py-1 px-2"
                      disabled={index === 0}
                      aria-label="ఆర్టికల్‌ను పైకి తరలించు"
                    >
                      ▲
                    </Button>
                    <Button
                      onClick={() => moveArticle(article.id, 'down')}
                      variant="secondary"
                      className="text-xs py-1 px-2"
                      disabled={index === epaper.articles.length - 1}
                      aria-label="ఆర్టికల్‌ను కిందికి తరలించు"
                    >
                      ▼
                    </Button>
                    <Button
                      onClick={() => setSelectedArticleId(article.id)}
                      variant="secondary"
                      className="text-xs py-1 px-2"
                      aria-label="ఆర్టికల్‌ను సవరించండి"
                    >
                      సవరించండి
                    </Button>
                    <Button
                      onClick={() => deleteArticle(article.id)}
                      variant="danger"
                      className="text-xs py-1 px-2"
                      aria-label="ఆర్టికల్‌ను తొలగించండి"
                    >
                      తొలగించు
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Export buttons in top-right, visible only in editor mode */}
        {!isPreviewMode && (
          <div className="flex justify-end mb-6">
            <div className="flex space-x-2">
              <h3 className="text-xl font-bold text-gray-800 self-center mr-4">ఎగుమతి:</h3>
              <Button onClick={() => handleExport('png')} variant="secondary">
                PNG
              </Button>
              <Button onClick={() => handleExport('pdf')} variant="secondary">
                PDF
              </Button>
              <Button onClick={() => handleExport('html')} variant="secondary">
                HTML
              </Button>
            </div>
          </div>
        )}

        {isPreviewMode ? (
          <EpaperViewer epaper={epaper} previewDevice={previewDevice} />
        ) : (
          <div className="space-y-6">
            <HeaderEditor header={epaper.header} onUpdate={updateHeader} onResetTheme={resetHeaderToThemeDefaults} />

            {selectedArticle ? (
              <ArticleEditor
                article={selectedArticle}
                onUpdate={updateArticle}
                onClose={() => setSelectedArticleId(null)}
                globalFontFamily={epaper.header.globalFontFamily}
                globalTextColor={epaper.header.globalTextColor}
                globalFontSize={epaper.header.globalFontSize}
              />
            ) : (
              <div className="p-6 bg-white rounded-lg shadow text-center text-gray-600">
                <p className="text-lg">ఆర్టికల్‌ను సవరించడానికి ఎడమవైపున ఉన్న జాబితా నుండి ఎంచుకోండి లేదా కొత్తది సృష్టించండి.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;