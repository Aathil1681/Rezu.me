import { NextResponse } from "next/server";

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
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Rezu.me CV</title>
          <style>
            /* IMPORTANT: Print-friendly resume styles */
            @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
            
            * { 
              box-sizing: border-box; 
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Lato', sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              color: #000;
              margin: 0;
              padding: 0.5in;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              width: 8.5in;
              min-height: 11in;
            }

            a { 
              color: inherit; 
              text-decoration: none; 
            }
            
            .text-blue { 
              color: #000080; 
            }
            
            .small-caps { 
              font-variant: small-caps; 
            }
            
            strong { 
              font-weight: 700; 
            }
            
            em { 
              font-style: italic; 
            }
            
            /* --- HEADER (CENTER TEXT) --- */
            .center-text {
              text-align: center;
              width: 100%;
              margin-bottom: 10px;
            }
            
            .center-text p {
              margin: 0;
              line-height: 1.3;
            }
            
            .name {
              font-size: 24pt;
              margin-bottom: 4pt;
              margin-top: 0;
              line-height: 1;
              text-align: center;
              font-weight: bold;
              font-variant: small-caps;
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
              break-after: avoid;
            }

            /* --- ENTRIES --- */
            .resume-group { 
              margin-bottom: 0; 
              break-inside: avoid;
            }
            
            .resume-entry { 
              margin-bottom: 2pt; 
              break-inside: avoid;
            }
            
            .entry-header, .entry-details {
              display: flex;
              justify-content: space-between;
              width: 100%;
            }
            
            .entry-arg1 { 
              font-size: 11pt; 
            } 
            
            .entry-arg2 { 
              font-style: italic; 
              font-size: 11pt; 
            } 
            
            .entry-arg3 { 
              font-style: italic; 
              font-size: 11pt; 
            } 
            
            .entry-arg4 { 
              font-style: italic; 
              font-size: 11pt; 
            }

            /* --- LISTS --- */
            ul.resume-list {
              margin: 2pt 0 8pt 0;
              padding-left: 18pt;
              break-inside: avoid;
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
              break-inside: avoid;
            }
            
            /* Ensure proper page breaks */
            @media print {
              body {
                padding: 0.5in !important;
                margin: 0 !important;
              }
              
              .section-title {
                page-break-after: avoid;
              }
              
              .resume-group,
              .resume-entry,
              .center-grid {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${htmlBody}
        </body>
      </html>
    `;

    return new NextResponse(fullHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
