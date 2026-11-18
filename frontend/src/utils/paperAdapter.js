
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

export function createPaperFromAPI(data) {
    const sectionSummaries = Object.entries(
        data.section_summaries || {}
    ).map(([name, section], index) => ({
        id: `section-${index + 1}`,
        number: index + 1,
        title: formatSectionName(name),
        pageRange: formatPageRange(section.pages),
        summary: section.summary || 'No summary available.',
        keyPoints: [],
    }));

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

        // Metadata not currently extracted by our backend.
        authors: [],

        publication: {
            year: 'Not identified',
            venue: 'Not identified',
            doi: 'Not identified',
            citations: 'Not available',
            field: 'Research Paper',
        },

        meta: {
            totalPages: data.total_pages || 0,
            readingTimeMinutes: Math.ceil(
                (data.total_characters || 0) / 1000
            ),
            figuresCount: null,
            tablesCount: null,
            referencesCount: null,
        },

        quickOverview:
            data.summary || 'No summary could be generated.',

        detailedSummary:
            data.detailed_summary || 'No detailed summary available.',

        sectionSummaries,
        keywords,

        // Structured research insights are not extracted yet.
        researchObjective: null,
        methodology: [],
        datasets: [],
        keyFindings: [],
        limitations: [],

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