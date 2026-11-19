
function formatPageRange(pages = []) {
    if (!pages.length) return 'Page information unavailable';

    const sorted = [...pages].sort((a, b) => a - b);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    return first === last
        ? `Page ${first}`
        : `Pages ${first}–${last}`;
}

function formatSectionName(name) {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

const CANONICAL_SECTIONS = [
    { number: 1, title: 'Research Overview', sources: ['overview', 'abstract', 'introduction'] },
    { number: 2, title: 'Background & Problem Statement', sources: ['background_problem', 'related_work', 'introduction'] },
    { number: 3, title: 'Methodology', sources: ['methodology', 'method', 'approach'] },
    { number: 4, title: 'Dataset & Experimental Setup', sources: ['dataset_analysis', 'experiments', 'experimental_setup'] },
    { number: 5, title: 'Results & Discussion', sources: ['results_comparisons', 'results', 'discussion'] },
    { number: 6, title: 'Limitations & Conclusion', sources: ['limitations_conclusion', 'limitations', 'conclusion', 'future_work'] },
];

function evidenceItems(value) {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item) => item && item.text)
        .map((item) => ({
            text: item.text,
            page: item.page_number,
        }));
}

function uniqueEvidence(items, limit = 5) {
    const seen = new Set();
    return items.filter((item) => {
        const key = item.text.toLowerCase().replace(/\s+/g, ' ').trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, limit);
}

function sectionEvidence(section, fields, limit = 5) {
    return uniqueEvidence(fields.flatMap((field) => (
        evidenceItems(section?.[field]).map((item) => ({ ...item, field }))
    )), limit);
}

function evidenceText(section, fields, limit = 3) {
    return uniqueEvidence(
        fields.flatMap((field) => evidenceItems(section?.[field])),
        limit,
    ).map((item) => item.text).join(' ');
}

function paperVoice(text) {
    return text
        .replace(/\bWe\b/g, 'The paper')
        .replace(/\bwe\b/g, 'the paper')
        .replace(/\bOur\b/g, "The paper's")
        .replace(/\bour\b/g, "the paper's");
}

function metricLabel(text) {
    const match = text.match(/\b(accuracy|precision|recall|f1(?:[- ]score)?|bleu|rouge|auc|mse|rmse|map|perplexity|exact match)\b/i);
    return match ? match[1].toUpperCase() : '';
}

function canonicalSectionSummaries(structured, sourceSummaries) {
    return CANONICAL_SECTIONS.map((canonical) => {
        const sourceEntries = canonical.sources
            .map((source) => sourceSummaries?.[source])
            .filter(Boolean);
        const evidence = canonical.sources
            .map((source) => structured?.[source]?.evidence)
            .flatMap((items) => evidenceItems(items));
        const summary = sourceEntries.map((entry) => entry.summary).filter(Boolean).join(' ');
        const pages = [...new Set(sourceEntries.flatMap((entry) => entry.pages || []))].sort((a, b) => a - b);
        const fallback = uniqueEvidence(evidence, 3).map((item) => item.text).join(' ');

        return {
            id: `section-${canonical.number}`,
            number: canonical.number,
            title: `${String(canonical.number).padStart(2, '0')} · ${canonical.title}`,
            pageRange: formatPageRange(pages),
            summary: paperVoice(summary || fallback || 'Not explicitly reported in the paper.'),
            keyPoints: [],
        };
    });
}

function extractDatasetName(text) {
    const patterns = [
        /(?:dataset|corpus|benchmark)\s+(?:called|named|known as)\s+["“]?([A-Z][\w-]*(?:\s+[A-Z][\w-]*){0,4})/i,
        /\b([A-Z][\w-]*(?:\s+[A-Z][\w-]*){0,3})\s+(?:dataset|corpus|benchmark)\b/,
        /\b(?:using|on|from)\s+([A-Z][\w-]*(?:\s+[A-Z][\w-]*){0,3})\s+(?:dataset|corpus|benchmark)\b/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match?.[1] && !/\b(?:batch|learning|rate|optimizer|epoch|hidden|layer|parameter)\b/i.test(match[1])) {
            return match[1].trim();
        }
    }
    return 'Not explicitly reported in the paper.';
}

function extractDatasetSize(text) {
    const match = text.match(/\b\d[\d,.]*\s*(?:examples?|samples?|instances?|documents?|images?|records?|subjects?|tokens?)\b/i);
    return match?.[0] || 'Not explicitly reported in the paper.';
}

function methodologyTitle(field, text) {
    if (field === 'experimental_configurations') return 'Experimental setup';
    const firstSentence = text.split(/(?<=[.!?])\s+/)[0].trim();
    if (/\b(architecture|encoder|decoder|transformer|attention|embedding|loss|objective|algorithm|pipeline|model)\b/i.test(firstSentence)) {
        return firstSentence.split(/\s+/).slice(0, 8).join(' ').replace(/[,:;.]$/, '');
    }
    return field === 'approach' ? 'Core research approach' : formatSectionName(field);
}

export function createPaperFromAPI(data) {
    const structured = data.structured_analysis?.analysis_sections
        || data.structured_analysis
        || {};
    const overview = structured.overview || {};
    const methodology = structured.methodology || {};
    const datasets = structured.dataset_analysis || {};
    const results = structured.results_comparisons || {};
    const limitations = structured.limitations_conclusion || {};

    const methodologyEvidence = sectionEvidence(methodology, [
        'approach',
        'architecture',
        'experimental_configurations',
    ]);
    const datasetEvidence = sectionEvidence(datasets, [
        'dataset_names',
        'datasets',
        'sources',
        'sizes',
        'splits',
    ]);
    const findingEvidence = sectionEvidence(results, [
        'metrics',
        'numerical_results',
        'baselines_comparisons',
    ]);
    const limitationItems = sectionEvidence(limitations, ['limitations'], 8);
    const conclusionItems = sectionEvidence(limitations, ['conclusions'], 8);
    const futureWorkItems = sectionEvidence(limitations, ['future_work'], 8);

    const sectionSummaries = canonicalSectionSummaries(
        structured,
        data.section_summaries || {},
    );

    const keywords = (data.keywords || []).map((item) => ({
        term: item.keyword,
        category: 'Extracted',
        score: item.score,
        weight: 'Secondary',
    }));

    const title =
        data.title ||
        data.filename?.replace(/\.pdf$/i, '') ||
        'Untitled Research Paper';

    return {
        id: `upload-${Date.now()}`,
        fileName: data.filename,
        title,

        authors: data.authors || [],

        publication: {
            year: data.publication?.year || 'Not explicitly reported in the paper.',
            venue: data.publication?.venue || 'Not explicitly reported in the paper.',
            doi: data.publication?.doi || 'Not explicitly reported in the paper.',
            citations: data.publication?.citations ?? 'Not explicitly reported in the paper.',
            field: data.publication?.field || 'Research Paper',
        },

        meta: {
            totalPages: data.total_pages || 0,
            readingTimeMinutes: Math.ceil(
                (data.total_characters || 0) / 1000
            ),
            figuresCount: data.figures_count ?? null,
            tablesCount: data.tables_count ?? null,
            referencesCount: data.references_count ?? null,
        },

        quickOverview:
            paperVoice(data.summary || 'No summary could be generated.'),

        detailedSummary:
            paperVoice(data.detailed_summary || 'No detailed summary available.'),

        sectionSummaries,
        keywords,

        researchObjective:
            paperVoice(evidenceText(overview, ['objectives', 'contributions'], 3))
            || 'Not explicitly reported in the paper.',
        methodology: methodologyEvidence.map((item) => ({
            aspect: methodologyTitle(item.field, item.text),
            detail: `${paperVoice(item.text)}${item.page ? ` (Page ${item.page})` : ''}`,
        })),
        datasets: uniqueEvidence(datasetEvidence, 4).map((item) => ({
            name: extractDatasetName(item.text),
            type: 'Paper evidence',
            size: extractDatasetSize(item.text),
            sourcePage: item.page ? `Page ${item.page}` : 'Page information unavailable',
            purpose: paperVoice(item.text),
        })),
        keyFindings: uniqueEvidence(findingEvidence, 5).map((item) => ({
            metric: metricLabel(item.text),
            description: paperVoice(item.text),
            impact: item.page ? `Source page ${item.page}` : 'Not explicitly reported in the paper.',
        })),
        limitations: limitationItems.map((item) => ({
            title: 'Author-reported limitation',
            severity: 'Not classified',
            description: `${paperVoice(item.text)}${item.page ? ` (Page ${item.page})` : ''}`,
        })),
        conclusions: conclusionItems.map((item) => ({
            title: 'Conclusion',
            description: `${paperVoice(item.text)}${item.page ? ` (Page ${item.page})` : ''}`,
        })),
        futureWork: futureWorkItems.map((item) => ({
            title: 'Future direction',
            description: `${paperVoice(item.text)}${item.page ? ` (Page ${item.page})` : ''}`,
        })),

        // Retain original extracted content for Gemini Q&A.
        pages: data.pages || [],
    };
}

export function createPaperFromHistory(record) {
    const paper = createPaperFromAPI(record.analysis || {});

    return {
        ...paper,
        id: record.id,
        fileName: record.filename || paper.fileName,
        title: record.title || paper.title,
        meta: {
            ...paper.meta,
            totalPages: record.totalPages ?? paper.meta.totalPages,
        },
    };
}