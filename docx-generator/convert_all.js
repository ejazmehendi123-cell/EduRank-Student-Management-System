const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  HeadingLevel,
  AlignmentType,
  ShadingType,
  PageOrientation
} = require('docx');

const sourceDir = path.resolve(__dirname, '..', 'test-documentation');
const outputDir = path.resolve(__dirname, '..', 'test-documentation-docx');
const altOutputDir = path.resolve(__dirname, '..', 'test-documentation-word');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(altOutputDir)) {
  fs.mkdirSync(altOutputDir, { recursive: true });
}

// LANDSCAPE ORIENTATION (11.0" wide x 8.5" tall)
// Page: 15840 x 12240 dxa. Margins: 720 dxa (0.5 inch) left/right.
// Available horizontal printable width = 15840 - 1440 = 14400 dxa (10.0 full inches!).
const TOTAL_TABLE_WIDTH = 14400;

function cleanMarkdownLinks(text) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function parseFormattedText(rawText, isHeader = false) {
  const text = cleanMarkdownLinks(rawText);
  const tokens = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'normal', text: text.substring(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push({ type: 'bold', text: token.slice(2, -2) });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push({ type: 'code', text: token.slice(1, -1) });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push({ type: 'italic', text: token.slice(1, -1) });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'normal', text: text.substring(lastIndex) });
  }

  const fontSize = 18; // 9pt in tables for crisp rendering

  return tokens.map(t => {
    if (isHeader) {
      return new TextRun({
        text: t.text,
        bold: true,
        color: 'FFFFFF',
        font: 'Segoe UI',
        size: fontSize
      });
    }

    if (t.type === 'bold') {
      const isPass = t.text.trim() === 'PASS' || t.text.trim() === 'PASSED';
      return new TextRun({
        text: t.text,
        bold: true,
        color: isPass ? '15803D' : '0F172A',
        font: 'Segoe UI',
        size: fontSize
      });
    } else if (t.type === 'code') {
      return new TextRun({
        text: ` ${t.text} `,
        font: 'Consolas',
        size: 16,
        color: '0369A1'
      });
    } else if (t.type === 'italic') {
      return new TextRun({
        text: t.text,
        italics: true,
        font: 'Segoe UI',
        size: fontSize,
        color: '475569'
      });
    } else {
      return new TextRun({
        text: t.text,
        font: 'Segoe UI',
        size: fontSize,
        color: '334155'
      });
    }
  });
}

function parseParagraphText(rawText) {
  const text = cleanMarkdownLinks(rawText);
  const tokens = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'normal', text: text.substring(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push({ type: 'bold', text: token.slice(2, -2) });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push({ type: 'code', text: token.slice(1, -1) });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push({ type: 'italic', text: token.slice(1, -1) });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'normal', text: text.substring(lastIndex) });
  }

  return tokens.map(t => {
    if (t.type === 'bold') {
      const isPass = t.text.trim() === 'PASS' || t.text.trim() === 'PASSED';
      return new TextRun({
        text: t.text,
        bold: true,
        color: isPass ? '15803D' : '0F172A',
        font: 'Segoe UI',
        size: 21
      });
    } else if (t.type === 'code') {
      return new TextRun({
        text: ` ${t.text} `,
        font: 'Consolas',
        size: 19,
        color: '0284C7'
      });
    } else if (t.type === 'italic') {
      return new TextRun({
        text: t.text,
        italics: true,
        font: 'Segoe UI',
        size: 21,
        color: '475569'
      });
    } else {
      return new TextRun({
        text: t.text,
        font: 'Segoe UI',
        size: 21,
        color: '334155'
      });
    }
  });
}

/**
 * Computes generous column widths tailored for Landscape layout (14,400 dxa total)
 */
function getColumnWidths(headerRow, numCols) {
  const headerStr = headerRow.join(' ').toLowerCase();

  // 1. Master index reports table (4 cols): [Report Document | Description & Scope | Total Tests | Result]
  if (numCols === 4 && (headerStr.includes('report document') || headerStr.includes('file name'))) {
    return [4000, 6800, 1800, 1800]; // 14400 dxa
  }

  // 2. Master Test Execution Matrix (6 cols): [Test ID | Module | Test Case Name / Scenario | Test Method / Suite | Result | Execution Time]
  if (numCols === 6 && headerStr.includes('test id') && headerStr.includes('module')) {
    return [1600, 2000, 4400, 3800, 1300, 1300]; // 14400 dxa
  }

  // 3. Security integration table (7 cols): [Scenario ID | Test Method | HTTP Request | Role Context | Expected Status | Actual Status | Time]
  if (numCols === 7 && headerStr.includes('scenario id')) {
    return [1500, 3200, 2800, 1800, 1800, 1800, 1500]; // 14400 dxa
  }

  // 4. Leaderboard summary matrix (6 cols): [Test ID | Test Target | Test Scenario / Objective | Expected Ranking / Result | Status | Time]
  if (numCols === 6 && headerStr.includes('expected ranking')) {
    return [1600, 2200, 4600, 3400, 1300, 1300]; // 14400 dxa
  }

  // 5. Points summary matrix (6 cols): [Test ID | Test Target | Test Scenario / Objective | Expected Balance / Outcome | Status | Time]
  if (numCols === 6 && headerStr.includes('expected balance')) {
    return [1600, 2200, 4600, 3400, 1300, 1300]; // 14400 dxa
  }

  // 6. REST API Endpoint contract matrix (5 cols): [Endpoint URI | Method | Permitted Roles | Expected Status Codes | Request / Query Parameters]
  if (numCols === 5 && headerStr.includes('endpoint uri')) {
    return [3600, 1400, 2200, 2200, 5000]; // 14400 dxa
  }

  // 7. Frontend summary matrix (6 cols): [Test Suite | Test Case Name | Target Function / Action | Expected Behavior | Status | Time]
  if (numCols === 6 && headerStr.includes('test suite') && headerStr.includes('expected behavior')) {
    return [2400, 2800, 2800, 3800, 1300, 1300]; // 14400 dxa
  }

  // 8. Android Emulator E2E matrix (6 cols): [Scenario ID | Test Target | Verification Description | Execution Method | Result | Status]
  if (numCols === 6 && headerStr.includes('scenario id') && headerStr.includes('execution method')) {
    return [1600, 2000, 4200, 3600, 1600, 1400]; // 14400 dxa
  }

  // Generic intelligent fallback tailored for 14400 dxa
  const rawColLengths = [];
  for (let c = 0; c < numCols; c++) {
    const colText = cleanMarkdownLinks(headerRow[c] || '');
    rawColLengths.push(Math.max(colText.length, 6));
  }
  const totalRaw = rawColLengths.reduce((a, b) => a + b, 0);
  const widths = rawColLengths.map(l => Math.round((l / totalRaw) * TOTAL_TABLE_WIDTH));
  const sum = widths.reduce((a, b) => a + b, 0);
  if (sum !== TOTAL_TABLE_WIDTH) {
    widths[0] += (TOTAL_TABLE_WIDTH - sum);
  }
  return widths;
}

function convertMarkdownToDocx(mdContent) {
  const lines = mdContent.split(/\r?\n/);
  const children = [];

  let inCodeBlock = false;
  let codeBlockLines = [];
  let inTable = false;
  let tableRows = [];

  const flushCodeBlock = () => {
    if (codeBlockLines.length === 0) return;
    const codeText = codeBlockLines.join('\n');
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: codeText,
            font: 'Consolas',
            size: 16,
            color: '1E293B'
          })
        ],
        spacing: { before: 120, after: 120 },
        shading: {
          type: ShadingType.CLEAR,
          fill: 'F8FAFC'
        },
        border: {
          left: { style: BorderStyle.SINGLE, size: 24, color: '0284C7' },
          top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' }
        }
      })
    );
    codeBlockLines = [];
  };

  const flushTable = () => {
    if (tableRows.length === 0) return;

    // Filter separator lines
    const validRows = tableRows.filter(r => !r.every(c => /^[-:| ]+$/.test(c)));
    if (validRows.length === 0) {
      tableRows = [];
      return;
    }

    const numCols = Math.max(...validRows.map(r => r.length));
    const headerRow = validRows[0];
    const colWidths = getColumnWidths(headerRow, numCols);

    const tableElementRows = validRows.map((row, rowIndex) => {
      const isHeader = (rowIndex === 0);
      const cells = [];

      for (let c = 0; c < numCols; c++) {
        const cellText = (row[c] || '').trim();
        const runs = parseFormattedText(cellText, isHeader);
        const colWidth = colWidths[c] || Math.round(TOTAL_TABLE_WIDTH / numCols);

        cells.push(
          new TableCell({
            width: {
              size: colWidth,
              type: WidthType.DXA
            },
            children: [
              new Paragraph({
                children: runs.length > 0 ? runs : [new TextRun({ text: '' })],
                alignment: isHeader ? AlignmentType.LEFT : AlignmentType.LEFT,
                spacing: { before: 50, after: 50, line: 240 }
              })
            ],
            shading: {
              type: ShadingType.CLEAR,
              fill: isHeader ? '1E3A8A' : (rowIndex % 2 === 1 ? 'FFFFFF' : 'F8FAFC')
            },
            margins: {
              top: 80,
              bottom: 80,
              left: 140,
              right: 140
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' }
            }
          })
        );
      }

      return new TableRow({
        children: cells,
        tableHeader: isHeader,
        cantSplit: true
      });
    });

    children.push(
      new Table({
        rows: tableElementRows,
        columnWidths: colWidths,
        width: {
          size: TOTAL_TABLE_WIDTH,
          type: WidthType.DXA
        }
      })
    );
    children.push(new Paragraph({ spacing: { before: 80, after: 80 } }));

    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        if (inTable) {
          flushTable();
          inTable = false;
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cols = line.split('|').slice(1, -1).map(c => c.trim());
      tableRows.push(cols);
      continue;
    } else {
      if (inTable) {
        flushTable();
        inTable = false;
      }
    }

    if (line.trim().length === 0) {
      continue;
    }

    if (line.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: line.substring(2).trim(),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 260, after: 120 },
          children: [
            new TextRun({
              text: line.substring(2).trim(),
              bold: true,
              size: 32,
              font: 'Segoe UI',
              color: '1E3A8A'
            })
          ]
        })
      );
      continue;
    }

    if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: line.substring(3).trim(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 220, after: 100 },
          children: [
            new TextRun({
              text: line.substring(3).trim(),
              bold: true,
              size: 26,
              font: 'Segoe UI',
              color: '2563EB'
            })
          ]
        })
      );
      continue;
    }

    if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: line.substring(4).trim(),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 80 },
          children: [
            new TextRun({
              text: line.substring(4).trim(),
              bold: true,
              size: 23,
              font: 'Segoe UI',
              color: '0F172A'
            })
          ]
        })
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      children.push(
        new Paragraph({
          text: line.substring(5).trim(),
          spacing: { before: 140, after: 60 },
          children: [
            new TextRun({
              text: line.substring(5).trim(),
              bold: true,
              size: 21,
              font: 'Segoe UI',
              color: '334155'
            })
          ]
        })
      );
      continue;
    }

    if (line.trim() === '---' || line.trim() === '***') {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 100 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' }
          }
        })
      );
      continue;
    }

    if (/^[\*\-]\s+/.test(line.trim())) {
      const bulletText = line.trim().replace(/^[\*\-]\s+/, '');
      const runs = parseParagraphText(bulletText);
      children.push(
        new Paragraph({
          children: runs,
          bullet: { level: 0 },
          spacing: { before: 40, after: 40, line: 260 }
        })
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const numText = line.trim().replace(/^\d+\.\s+/, '');
      const match = line.trim().match(/^(\d+)\.\s+/);
      const prefix = match ? match[1] + '. ' : '• ';
      const runs = parseParagraphText(numText);
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: prefix, bold: true, color: '2563EB', font: 'Segoe UI', size: 21 }),
            ...runs
          ],
          spacing: { before: 50, after: 50, line: 260 }
        })
      );
      continue;
    }

    const runs = parseParagraphText(line.trim());
    children.push(
      new Paragraph({
        children: runs,
        spacing: { before: 60, after: 60, line: 270 }
      })
    );
  }

  if (inCodeBlock) flushCodeBlock();
  if (inTable) flushTable();

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 15840,
              height: 12240
            },
            margin: {
              top: 720,    // 0.5 inch
              bottom: 720, // 0.5 inch
              left: 720,   // 0.5 inch
              right: 720   // 0.5 inch
            }
          }
        },
        children
      }
    ]
  });
}

function safeWriteFile(filePath, buffer, fallbackName = null) {
  try {
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (err) {
    if (err.code === 'EBUSY' && fallbackName) {
      const dir = path.dirname(filePath);
      const altPath = path.join(dir, fallbackName);
      fs.writeFileSync(altPath, buffer);
      console.log(`  ! File locked by Word, wrote to fallback: ${path.basename(altPath)}`);
      return altPath;
    }
    throw err;
  }
}

async function run() {
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} markdown documents in ${sourceDir}`);

  for (const file of files) {
    const mdPath = path.join(sourceDir, file);
    const docxName = file.replace(/\.md$/, '.docx');
    const docxPath = path.join(outputDir, docxName);
    const altDocxPath = path.join(altOutputDir, docxName);

    console.log(`Processing ${file} -> ${docxName}...`);
    const content = fs.readFileSync(mdPath, 'utf8');
    const doc = convertMarkdownToDocx(content);
    const buffer = await Packer.toBuffer(doc);

    // 1. Write to test-documentation-word (Always fresh and unlocked)
    fs.writeFileSync(altDocxPath, buffer);
    console.log(`  ✓ Written to test-documentation-word/${docxName} (${(buffer.length / 1024).toFixed(1)} KB)`);

    // 2. Write to test-documentation-docx with fallback if open in Word
    const fallback = docxName.replace('.docx', '_LANDSCAPE.docx');
    const writtenPath = safeWriteFile(docxPath, buffer, fallback);
    console.log(`  ✓ Written to test-documentation-docx/${path.basename(writtenPath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log('\nAll Word documents generated with Landscape Orientation and 14,400 DXA wide tables!');
}

run().catch(err => {
  console.error('Error converting documents:', err);
  process.exit(1);
});
