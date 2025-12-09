import { NextResponse } from "next/server";
import chromium from "chrome-aws-lambda";

/**
 * LaTeX to HTML converter with fixed layout logic.
 * Distinguishes between centered text (Header) and centered grids (References).
 */
function latexToHtml(latex: string): string {
  let html = latex;

  // 1. CLEANUP & PREAMBLE
  html = html.replace(/%.*$/gm, ""); // Remove comments
  html = html.replace(/\\documentclass[\s\S]*?\\begin\{document\}/, "");
  html = html.replace(/\\end\{document\}/, "");
  html = html.replace(/\\usepackage\{.*?\}/g, "");
  html = html.replace(/\\definecolor\{.*?\}/g, "");

  // 2. HEADER NAME FORMATTING
  // Handle \textbf{\Huge \scshape Name} -> h1
  html = html.replace(
    /\\textbf\{\\Huge \\scshape (.*?)\}/g,
    '<h1 class="name small-caps">$1</h1>',
  );

  // 3. SEPARATORS & SPACING
  // Handle LaTeX Pipe: \ $|$ \ or similar variations
  html = html.replace(/\\?\s*\$\|\$\s*\\?/g, '<span class="pipe">|</span>');

  // Handle Manual Breaks with optional spacing: \\[-2pt]
  // We replace strictly with <br> to ensure stacking in text mode
  html = html.replace(/\\\\[\s]*(\[-.*?\])?/g, "<br/>");

  // 4. SMART CENTER BLOCK DETECTION
  // If a center block contains minipages, it's a GRID (References).
  // If not, it's TEXT (Header).
  html = html.replace(
    /\\begin\{center\}([\s\S]*?)\\end\{center\}/g,
    (match, content) => {
      if (
        content.includes("\\begin{minipage}") ||
        content.includes("minipage")
      ) {
        return `<div class="center-grid">${content}</div>`;
      } else {
        // Wrap content in a paragraph to ensure line breaks work
        return `<div class="center-text"><p>${content}</p></div>`;
      }
    },
  );

  // 5. MINIPAGE (COLUMNS)
  // Strip width args and wrap in col div
  html = html.replace(
    /\\begin\{minipage\}(\[.*?\])?\{.*?\}/g,
    '<div class="minipage-col">',
  );
  html = html.replace(/\\end\{minipage\}/g, "</div>");

  // Remove \hfill (Flexbox handles spacing in grid mode)
  html = html.replace(/\\hfill/g, "");

  // 6. FORMATTING & COLORS
  html = html.replace(/\\scshape\s+/g, '<span class="small-caps">');
  html = html.replace(/\\color\{linkblue\}/g, '<span class="text-blue">');
  html = html.replace(/\\color\{.*?\}/g, "");

  html = html.replace(/\\textbf\{([^}]*)\}/g, "<strong>$1</strong>");
  html = html.replace(/\\textit\{([^}]*)\}/g, "<em>$1</em>");
  html = html.replace(/\\underline\{([^}]*)\}/g, "<u>$1</u>");
  html = html.replace(/\\Huge/g, "");
  html = html.replace(/\\Large/g, "");

  // Links
  html = html.replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '<a href="$1">$2</a>');
  html = html.replace(/\\url\{([^}]*)\}/g, '<a href="$1">$1</a>');

  // 7. SECTIONS
  html = html.replace(
    /\\section\*?\{([^}]*)\}/g,
    '<h2 class="section-title">$1</h2>',
  );

  // 8. LISTS
  // Handle "label={}" (No Bullets)
  html = html.replace(
    /\\begin\{itemize\}\[[^\]]*label=\{\}[^\]]*\]/g,
    '<ul class="resume-list no-bullet">',
  );
  // Standard Lists
  html = html.replace(
    /\\begin\{itemize\}(\[.*?\])?/g,
    '<ul class="resume-list">',
  );
  html = html.replace(/\\resumeItemListStart/g, '<ul class="resume-list">');
  html = html.replace(/\\end\{itemize\}/g, "</ul>");
  html = html.replace(/\\resumeItemListEnd/g, "</ul>");

  // List Items
  html = html.replace(
    /\\item\s+([\s\S]*?)(?=(\\item|\\end|\\resumeItemListEnd))/g,
    "<li>$1</li>",
  );
  html = html.replace(/\\resumeItem\{([\s\S]*?)\}/g, "<li>$1</li>");

  // 9. RESUME ENTRIES
  html = html.replace(
    /\\resumeSubHeadingListStart/g,
    '<div class="resume-group">',
  );
  html = html.replace(/\\resumeSubHeadingListEnd/g, "</div>");

  const subheadingRegex =
    /\\resumeSubheading\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}/g;
  html = html.replace(subheadingRegex, (match, arg1, arg2, arg3, arg4) => {
    return `
      <div class="resume-entry">
        <div class="entry-header">
          <span class="entry-arg1"><strong>${arg1}</strong></span>
          <span class="entry-arg2">${arg2}</span>
        </div>
        <div class="entry-details">
          <span class="entry-arg3"><em>${arg3}</em></span>
          <span class="entry-arg4">${arg4}</span>
        </div>
      </div>
    `;
  });

  // Final Cleanup
  html = html.replace(/\\\|/g, "|");
  html = html.replace(/--/g, "&mdash;");
  html = html.replace(/\\[a-zA-Z]+\{.*?\}/g, "");
  html = html.replace(/\\[a-zA-Z]+/g, "");

  return html;
}

export async function POST(req: Request) {
  // Set a timeout for Vercel (max is 10 seconds for Hobby, 60 for Pro)
  const timeout = 9000; // 9 seconds for safety
  let browser: any = null;

  try {
    const { latexLikeContent } = await req.json();

    if (!latexLikeContent?.trim()) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 },
      );
    }

    const htmlBody = latexToHtml(latexLikeContent);

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Rezu.me CV</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
            
            * { box-sizing: border-box; }
            
            body {
              font-family: 'Lato', sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              color: #000;
              margin: 0;
            }

            a { color: inherit; text-decoration: none; }
            .text-blue { color: #000080; }
            .small-caps { font-variant: small-caps; }
            strong { font-weight: 700; }
            em { font-style: italic; }

            /* LaTeX Text Commands */
            .textbf { font-weight: 700; color: #000; }
            .textit { font-style: italic; color: #333; }
            .textsc { font-variant: small-caps; letter-spacing: 0.5px; }
            .texttt { 
              font-family: 'Courier New', monospace;
              font-size: 10pt;
              background: #f5f5f5;
              padding: 1px 4px;
              border-radius: 3px;
              border: 1px solid #e0e0e0;
            }
            .underline { text-decoration: underline; }
            .overline { text-decoration: overline; }
            .sout { text-decoration: line-through; }
            .emph { font-style: italic; color: #333; }
            
            /* LaTeX Font Sizes */
            .tiny { font-size: 8pt; }
            .scriptsize { font-size: 9pt; }
            .footnotesize { font-size: 10pt; }
            .small { font-size: 11pt; }
            .normalsize { font-size: 12pt; }
            .large { font-size: 14pt; }
            .Large { font-size: 16pt; }
            .LARGE { font-size: 18pt; }
            .huge { font-size: 22pt; }
            .Huge { font-size: 26pt; }
            
            /* LaTeX Alignment */
            .centering { text-align: center; }
            .raggedright { text-align: left; }
            .raggedleft { text-align: right; }
            .raggedcenter { text-align: center; }
            
            /* LaTeX Spacing */
            .smallskip { margin-bottom: 4pt; }
            .medskip { margin-bottom: 8pt; }
            .bigskip { margin-bottom: 12pt; }
            .vspace-small { height: 4pt; }
            .vspace-medium { height: 8pt; }
            .vspace-large { height: 12pt; }
            
            /* LaTeX Environments */
            .center { text-align: center; margin: 12px 0; }
            .flushleft { text-align: left; }
            .flushright { text-align: right; }
            
            /* LaTeX Rules */
            .hrule { 
              border: none; 
              border-top: 1px solid #ccc; 
              margin: 16px 0; 
              width: 100%; 
            }
            .hrulefill { 
              border: none; 
              border-top: 2px solid #000; 
              margin: 20px 0; 
              width: 100%; 
            }
            
            /* LaTeX Fill */
            .hfill { flex: 1; }
            .vfill { height: auto; }
            
            /* LaTeX Boxes */
            .fbox { 
              border: 1px solid #000; 
              padding: 8px; 
              margin: 8px 0; 
              background: #fff; 
            }
            .framebox { 
              border: 2px solid #000080; 
              padding: 10px; 
              margin: 10px 0; 
              background: #f9f9ff; 
            }
            
            /* LaTeX Lists */
            .itemize { list-style-type: disc; padding-left: 20px; }
            .enumerate { list-style-type: decimal; padding-left: 20px; }
            .description { list-style-type: none; padding-left: 0; }
            
            /* LaTeX Tabular */
            .tabular { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 12pt 0; 
              font-size: 10.5pt; 
            }
            .tabular td, .tabular th { 
              padding: 6pt 8pt; 
              border: 1px solid #ddd; 
              vertical-align: top; 
            }
            .tabular th { 
              background: #f0f0f0; 
              font-weight: 600; 
              text-align: left; 
            }
            
            /* LaTeX Minipage */
            .minipage { 
              display: inline-block; 
              vertical-align: top; 
              padding: 10px; 
              box-sizing: border-box; 
            }
            
            /* LaTeX Verbatim */
            .verbatim { 
              font-family: 'Courier New', monospace;
              font-size: 10pt;
              background: #f5f5f5;
              padding: 10px;
              margin: 10px 0;
              white-space: pre-wrap;
              border-left: 3px solid #333;
            }
            
            /* LaTeX Section Levels */
            .part { font-size: 24pt; font-weight: 700; margin: 20pt 0 10pt; }
            .chapter { font-size: 20pt; font-weight: 700; margin: 18pt 0 9pt; }
            .section { font-size: 16pt; font-weight: 700; margin: 16pt 0 8pt; }
            .subsection { font-size: 14pt; font-weight: 600; margin: 14pt 0 7pt; }
            .subsubsection { font-size: 12pt; font-weight: 500; margin: 12pt 0 6pt; }
            .paragraph { font-size: 11pt; font-weight: 500; margin: 10pt 0 5pt; }
            .subparagraph { font-size: 10pt; font-weight: 400; margin: 8pt 0 4pt; }
            
            /* LaTeX Page Control */
            .pagebreak { page-break-before: always; }
            .newpage { page-break-before: always; }
            .clearpage { page-break-before: always; }
            .cleardoublepage { page-break-before: always; }
            
            /* LaTeX Float */
            .figure { margin: 12px 0; }
            .table { margin: 12px 0; }
            
            /* LaTeX Math */
            .math { 
              font-family: 'Times New Roman', serif;
              font-style: italic;
            }
            .displaystyle { display: block; margin: 10px 0; }
            .textstyle { display: inline; }
            
            /* LaTeX References */
            .label { color: #000080; font-weight: 500; }
            .ref { color: #000080; font-weight: 500; }
            
            /* LaTeX Footnotes */
            .footnote { 
              font-size: 9pt; 
              color: #666; 
              margin-top: 4pt; 
              padding-left: 10pt; 
              border-left: 2px solid #eee; 
            }
            
            /* LaTeX Margins */
            .marginpar { 
              float: right; 
              width: 30%; 
              margin: 0 0 10px 20px; 
              padding: 10px; 
              background: #f9f9f9; 
              font-size: 10pt; 
              border-left: 3px solid #ccc; 
            }
            
            /* --- HEADER (CENTER TEXT) --- */
            .center-text {
                text-align: center;
                width: 100%;
                margin-bottom: 10px;
            }
            .center-text p {
                margin: 0;
                line-height: 1.3; /* Tighter line height for header */
            }
            .name {
                font-size: 24pt;
                margin-bottom: 4pt;
                margin-top: 0;
                line-height: 1;
                text-align: center;
            }
            .pipe {
                margin: 0 8px;
                color: #000;
                vertical-align: middle;
            }

            /* --- REFERENCES (CENTER GRID) --- */
            .center-grid {
                width: 100%;
                display: flex;
                flex-wrap: wrap; 
                justify-content: space-between; 
                gap: 15px; 
                align-items: flex-start;
                margin-top: 10px;
            }

            /* --- SECTIONS --- */
            .section-title {
              font-size: 14pt;
              font-weight: 700;
              text-transform: uppercase;
              border-bottom: 1px solid #000;
              margin-top: 14pt;
              margin-bottom: 6pt;
              padding-bottom: 2pt;
              width: 100%;
            }

            /* --- ENTRIES --- */
            .resume-group { margin-bottom: 0; }
            .resume-entry { margin-bottom: 2pt; }
            
            .entry-header, .entry-details {
              display: flex;
              justify-content: space-between;
              width: 100%;
            }
            .entry-arg1 { font-size: 11pt; } 
            .entry-arg2 { font-style: italic; font-size: 11pt; } 
            .entry-arg3 { font-style: italic; font-size: 11pt; } 
            .entry-arg4 { font-style: italic; font-size: 11pt; }

            /* --- LISTS --- */
            ul.resume-list {
              margin: 2pt 0 8pt 0;
              padding-left: 18pt;
            }
            ul.resume-list li {
              margin-bottom: 2pt;
              text-align: left;
            }
            ul.no-bullet {
                list-style-type: none;
                padding-left: 0;
                margin-left: 0;
            }
            ul.no-bullet li {
                margin-bottom: 4pt;
            }

            /* --- MINIPAGE COLS --- */
            .minipage-col {
              flex: 1;
              min-width: 30%;
              text-align: left;
              font-size: 10.5pt;
            }
            
            /* Print Styles */
            @media print {
              body { font-size: 10.5pt; }
              .section-title { font-size: 12.5pt; }
              .name { font-size: 22pt; }
              a { color: #000; text-decoration: none; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${htmlBody}
        </body>
      </html>
    `;

    // Use chrome-aws-lambda for Vercel compatibility
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Set content with networkidle0 for stability
    await page.setContent(fullHtml, {
      waitUntil: ["networkidle0"],
    });

    // Wait for fonts to load
    await page.evaluateHandle("document.fonts.ready");

    // Generate PDF with timeout
    const pdfPromise = page.pdf({
      format: "Letter",
      margin: {
        top: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
        right: "0.5in",
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    // Handle timeout
    const timeoutPromise = new Promise<Buffer>((_, reject) =>
      setTimeout(() => reject(new Error("PDF generation timeout")), timeout),
    );

    const pdfBuffer = await Promise.race([pdfPromise, timeoutPromise]);

    await browser.close();

    // Create a proper Response with PDF buffer
    // Convert Buffer to ArrayBuffer for Response
    const pdfArrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength,
    );

    // Return the PDF as a response
    return new Response(pdfArrayBuffer, {
      status: 200,
      headers: new Headers({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="rezu-me-cv.pdf"',
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Content-Length": pdfBuffer.length.toString(),
      }),
    });
  } catch (err) {
    // Clean up browser if it exists
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("Error closing browser:", closeErr);
      }
    }

    console.error("PDF generation error:", err);

    // Provide more specific error messages
    let errorMessage = "Failed to generate PDF";
    if (err instanceof Error) {
      if (err.message.includes("timeout")) {
        errorMessage =
          "PDF generation took too long. Please try with less content or contact support.";
      } else if (
        err.message.includes("Chrome") ||
        err.message.includes("browser")
      ) {
        errorMessage = `Browser error: ${err.message}. Please try again or contact support.`;
      } else {
        errorMessage = err.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Important: Configure max duration based on your Vercel plan
export const maxDuration = 60; // 60 seconds for Pro plan, 10 for Hobby
export const dynamic = "force-dynamic";
