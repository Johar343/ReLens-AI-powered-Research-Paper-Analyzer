import { useState } from 'react';
import { X, Copy, Check, Download, FileText, Printer } from 'lucide-react';
import './ExportModal.css';

export default function ExportModal({ paper, onClose }) {
  const [activeFormat, setActiveFormat] = useState('markdown');
  const [copied, setCopied] = useState(false);

  if (!paper) return null;

  const markdownContent = `# Research Analysis Brief: ${paper.title}

**Authors**: ${paper.authors.map((a) => `${a.name} (${a.affiliation})`).join(', ')}  
**Venue**: ${paper.publication.venue} (${paper.publication.year})  
**DOI**: ${paper.publication.doi}  
**Citations**: ${paper.publication.citations} | **Pages**: ${paper.meta.totalPages}

${(paper.sectionSummaries || []).map((section) => (
  `\n---\n\n## ${section.title}\n${section.summary}`
)).join('')}

---

## 7. Extracted Keywords
${paper.keywords.map((k) => `\`${k.term}\` (${k.category})`).join(', ')}

---
_Generated via ReLens AI Academic Research Assistant._
`;

  const bibtexContent = `@article{${paper.id},
  title = {${paper.title}},
  author = {${paper.authors.map((a) => a.name).join(' and ')}},
  journal = {${paper.publication.venue}},
  year = {${paper.publication.year}},
  doi = {${paper.publication.doi}},
  url = {https://doi.org/${paper.publication.doi}}
}`;

  const currentContent = activeFormat === 'markdown' ? markdownContent : bibtexContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const filename = `${paper.shortTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_relens_report.${activeFormat === 'markdown' ? 'md' : 'bib'}`;
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="export-modal-backdrop" onClick={onClose}>
      <div className="export-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <div className="header-left-title">
            <FileText size={20} className="export-modal-icon" />
            <div>
              <h3 className="export-title font-serif">Export Research Summary</h3>
              <span className="export-subtitle">{paper.shortTitle || paper.title}</span>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="format-tabs-strip">
          <button
            type="button"
            className={`format-tab-btn ${activeFormat === 'markdown' ? 'active' : ''}`}
            onClick={() => setActiveFormat('markdown')}
          >
            Markdown Summary (.md)
          </button>
          <button
            type="button"
            className={`format-tab-btn ${activeFormat === 'bibtex' ? 'active' : ''}`}
            onClick={() => setActiveFormat('bibtex')}
          >
            BibTeX Citation (.bib)
          </button>
        </div>

        {/* Content Preview */}
        <div className="export-code-preview">
          <pre className="export-pre">
            <code>{currentContent}</code>
          </pre>
        </div>

        {/* Modal Footer Actions */}
        <div className="export-modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print View</span>
          </button>

          <div className="footer-right-buttons">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? <Check size={14} className="copy-ok" /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
            </button>

            <button type="button" className="btn btn-primary btn-sm" onClick={handleDownload}>
              <Download size={14} />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
