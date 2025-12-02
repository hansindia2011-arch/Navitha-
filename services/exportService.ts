import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportAsPng = async (elementId: string, filename: string = 'epaper') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for export:', elementId);
    alert('ఎగుమతి కోసం కంటెంట్ కనుగొనబడలేదు!');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Increase scale for better resolution
      useCORS: true, // Required for images from external URLs
    });
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('PNG ఫైల్‌గా విజయవంతంగా ఎగుమతి చేయబడింది!');
  } catch (error) {
    console.error('Error exporting as PNG:', error);
    alert('PNG ఫైల్‌గా ఎగుమతి చేయడంలో లోపం సంభవించింది.');
  }
};

export const exportAsPdf = async (elementId: string, filename: string = 'epaper') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for export:', elementId);
    alert('ఎగుమతి కోసం కంటెంట్ కనుగొనబడలేదు!');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Increase scale for better resolution
      useCORS: true, // Required for images from external URLs
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height], // Set PDF size to canvas size
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
    alert('PDF ఫైల్‌గా విజయవంతంగా ఎగుమతి చేయబడింది!');
  } catch (error) {
    console.error('Error exporting as PDF:', error);
    alert('PDF ఫైల్‌గా ఎగుమతి చేయడంలో లోపం సంభవించింది.');
  }
};

export const exportAsHtml = async (elementId: string, filename: string = 'epaper') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for export:', elementId);
    alert('ఎగుమతి కోసం కంటెంట్ కనుగొనబడలేదు!');
    return;
  }

  try {
    const htmlContent = element.innerHTML;
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;700&family=Noto+Serif+Telugu:wght@400;700&family=Palanquin+Dark:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Noto Sans Telugu', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f3f4f6; /* bg-gray-100 */
        color: #1f2937; /* text-gray-900 */
      }
      /* Ensure the epaper content takes up appropriate space */
      #epaper-content {
        box-sizing: border-box;
      }
      /* Print styles if needed */
      @media print {
        body {
          background-color: #fff;
          color: #000;
        }
        #epaper-content {
          width: 100% !important;
          min-height: auto !important;
          margin: 0 !important;
          box-shadow: none !important;
        }
      }
    </style>
</head>
<body>
    <div id="epaper-content" class="w-full bg-white shadow-lg print:shadow-none min-h-screen max-w-screen-lg mx-auto">
        ${htmlContent}
    </div>
</body>
</html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up the URL object
    alert('HTML ఫైల్‌గా విజయవంతంగా ఎగుమతి చేయబడింది!');
  } catch (error) {
    console.error('Error exporting as HTML:', error);
    alert('HTML ఫైల్‌గా ఎగుమతి చేయడంలో లోపం సంభవించింది.');
  }
};