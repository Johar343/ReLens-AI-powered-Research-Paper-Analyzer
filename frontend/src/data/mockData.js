/**
 * Mock data for ReLens (Research Lens)
 * Comprehensive, realistic academic paper analyses and Q&A responses
 * Designed to seamlessly interface with future FastAPI endpoints
 */

export const SAMPLE_PAPERS = [
  {
    id: 'paper-vaswani-2017',
    title: 'Attention Is All You Need: Scalable Multi-Head Attention for Sequence-to-Sequence Modeling',
    shortTitle: 'Attention Is All You Need',
    authors: [
      { name: 'Ashish Vaswani', affiliation: 'Google Brain' },
      { name: 'Noam Shazeer', affiliation: 'Google Brain' },
      { name: 'Niki Parmar', affiliation: 'Google Research' },
      { name: 'Jakob Uszkoreit', affiliation: 'Google Research' },
      { name: 'Llion Jones', affiliation: 'Google Research' },
      { name: 'Aidan N. Gomez', affiliation: 'University of Toronto' },
      { name: 'Łukasz Kaiser', affiliation: 'Google Brain' },
      { name: 'Illia Polosukhin', affiliation: 'Independent' },
    ],
    publication: {
      venue: 'Advances in Neural Information Processing Systems (NeurIPS 2017)',
      year: 2017,
      doi: '10.48550/arXiv.1706.03762',
      arxivId: '1706.03762',
      citations: '138,400+',
      field: 'Natural Language Processing / Deep Learning',
    },
    meta: {
      totalPages: 11,
      fileSize: '2.4 MB',
      fileName: 'vaswani2017_attention_is_all_you_need.pdf',
      readingTimeMinutes: 18,
      figuresCount: 5,
      tablesCount: 5,
      referencesCount: 42,
    },
    quickOverview:
      'Proposes the Transformer, a sequence transduction model based entirely on self-attention mechanisms, dispensing completely with recurrence and convolutions. By eliminating sequential alignment constraints, the architecture enables massive parallelization during training and achieves state-of-the-art translation quality on WMT 2014 benchmarks while drastically cutting training time.',
    detailedSummary:
      'The dominant sequence transduction models prior to 2017 relied on complex recurrent or convolutional neural networks connected via an attention mechanism in an encoder-decoder configuration. Because recurrent models generate a sequence of hidden states h_t as a function of the previous hidden state h_{t-1} and input position t, their sequential nature inherently prevents parallelization within training examples. This creates computational bottlenecks at extended sequence lengths.\n\nThe Transformer circumvents these constraints by relying entirely on multi-head self-attention to compute representations of input and output sequences. The architecture employs an encoder-decoder layout where each encoder layer consists of two sub-layers: a multi-head self-attention mechanism and a position-wise fully connected feed-forward network, accompanied by residual connections and layer normalization. The decoder incorporates an additional third sub-layer performing multi-head attention over the encoder output alongside masked self-attention to maintain the autoregressive property. Positional encodings (sinusoidal frequencies) are injected into the input embeddings to retain sequential token order without recurrent state passing.',
    researchObjective:
      'To design a sequence-to-sequence model architecture that eliminates recurrent and convolutional operations in favor of pure self-attention mechanisms, thereby overcoming sequential computation bottlenecks and unlocking end-to-end parallelizable training on modern hardware accelerators.',
    methodology: [
      {
        aspect: 'Encoder-Decoder Architecture',
        detail:
          'Stack of N = 6 identical encoder layers and N = 6 identical decoder layers. Each layer contains residual connections (x + Sublayer(x)) followed by Layer Normalization with model dimension d_model = 512.',
      },
      {
        aspect: 'Scaled Dot-Product Attention',
        detail:
          'Formulated as Attention(Q, K, V) = softmax(Q K^T / √d_k) V. The scaling factor 1/√d_k counters counteracts extremely small gradients caused by large dot product magnitudes pushing softmax into regions with tiny gradients.',
      },
      {
        aspect: 'Multi-Head Attention',
        detail:
          'Projects queries, keys, and values h = 8 times with learned linear projections to d_k = d_v = 64 dimensions. Enables the model to attend simultaneously to information from distinct representation subspaces at different positions.',
      },
      {
        aspect: 'Positional Encodings',
        detail:
          'Utilizes sinusoidal functions of varying frequencies (PE_(pos, 2i) = sin(pos / 10000^{2i/d_model})) to inject relative and absolute token positioning without adding trainable parameters.',
      },
      {
        aspect: 'Training Mechanics & Optimizer',
        detail:
          'Adam optimizer (β_1 = 0.9, β_2 = 0.98, ε = 10^-9) with a learning rate warmup phase across 4,000 steps followed by inverse square root decay. Regularization includes residual dropout (P_drop = 0.1) and label smoothing (ε_ls = 0.1).',
      },
    ],
    datasets: [
      {
        name: 'WMT 2014 English-to-German',
        type: 'Translation Benchmark',
        size: '4.5 million sentence pairs',
        vocabulary: '37,000 token shared BPE vocabulary',
        purpose: 'Primary benchmark for translation fidelity and compute efficiency',
      },
      {
        name: 'WMT 2014 English-to-French',
        type: 'Translation Benchmark',
        size: '36 million sentence pairs',
        vocabulary: '32,000 word-piece vocabulary',
        purpose: 'Large-scale comparative benchmark against existing ConvS2S and GNMT architectures',
      },
      {
        name: 'Penn Treebank (WSJ Section 23)',
        type: 'Syntactic Parsing Benchmark',
        size: '40,000 training sentences',
        vocabulary: 'Semi-supervised / parsing specific tokens',
        purpose: 'Evaluating generalization to structural constituency parsing without task-specific tuning',
      },
    ],
    keyFindings: [
      {
        metric: '28.4 BLEU on English-to-German',
        description: 'Improves over the existing best ensemble results (including ByteNet and ConvS2S) by over 2.0 BLEU points.',
        impact: 'New state-of-the-art established using a single base Transformer model.',
      },
      {
        metric: '41.8 BLEU on English-to-French',
        description: 'Outperforms all previously published single models and ensembles after 3.5 days of training on 8 P100 GPUs.',
        impact: 'Achieved at only 1/4 the training cost of the previous best model (GNMT ensemble).',
      },
      {
        metric: 'O(1) Sequential Operations',
        description: 'Per-layer sequential path length reduced from O(n) in RNNs to O(1) in Self-Attention.',
        impact: 'Enables massive hardware parallelization across tensor cores.',
      },
      {
        metric: 'Generalization to Constituency Parsing',
        description: 'Transformer (without task-specific architecture) scored 91.3 F1 on WSJ Section 23, beating BerkeleyParser.',
        impact: 'Proves architectural versatility outside pure machine translation.',
      },
    ],
    limitations: [
      {
        title: 'Quadratic Attention Complexity O(n²)',
        severity: 'High',
        description: 'Computational and memory complexity scales quadratically with sequence length n due to full pairwise dot-product comparisons, restricting naive application to document-length or multi-page sequences.',
      },
      {
        title: 'Absence of Inherent Inductive Bias for Order',
        severity: 'Moderate',
        description: 'Unlike RNNs, self-attention possesses permutation equivariance, making the network completely reliant on explicit positional encodings to capture word order and syntax.',
      },
      {
        title: 'Autoregressive Inference Bottleneck',
        severity: 'Moderate',
        description: 'While training is fully parallelized, test-time sequence generation remains sequential (token-by-token), requiring key-value cache memory overhead.',
      },
      {
        title: 'Data-Hungry Pre-Training Requirement',
        severity: 'Moderate',
        description: 'The lack of hard-coded spatial or sequential priors requires larger datasets or higher sample counts to reach convergence compared to convolutional or recurrent alternatives.',
      },
    ],
    keywords: [
      { term: 'Transformer', category: 'Architecture', weight: 'Primary' },
      { term: 'Self-Attention', category: 'Mechanism', weight: 'Primary' },
      { term: 'Multi-Head Attention', category: 'Mechanism', weight: 'Primary' },
      { term: 'Scaled Dot-Product', category: 'Algorithm', weight: 'Secondary' },
      { term: 'Positional Encoding', category: 'Technique', weight: 'Secondary' },
      { term: 'Sequence-to-Sequence', category: 'Task', weight: 'Primary' },
      { term: 'BLEU Metric', category: 'Evaluation', weight: 'Secondary' },
      { term: 'Layer Normalization', category: 'Regularization', weight: 'Secondary' },
      { term: 'Parallelization', category: 'Systems', weight: 'Primary' },
      { term: 'WMT 2014', category: 'Dataset', weight: 'Secondary' },
      { term: 'Autoregressive Decoding', category: 'Inference', weight: 'Secondary' },
      { term: 'Residual Connections', category: 'Architecture', weight: 'Secondary' },
    ],
    sectionSummaries: [
      {
        id: 'sec-1',
        number: '1',
        title: 'Introduction',
        pageRange: 'pp. 1-2',
        summary:
          'Reviews the history of recurrent neural networks (RNNs, LSTMs, GRUs) in sequence transduction. Explains how their sequential alignment prohibits parallelization and establishes the paper’s goal: replacing recurrence entirely with self-attention.',
        keyPoints: [
          'Sequential nature of RNNs prevents parallel processing within batches.',
          'Attention was previously used only as a bridge between recurrent stacks.',
          'The Transformer is the first model relying entirely on self-attention for sequence modeling.',
        ],
      },
      {
        id: 'sec-2',
        number: '2',
        title: 'Background',
        pageRange: 'p. 2',
        summary:
          'Compares the Transformer to prior attempts at reducing sequential computation, such as Extended Neural GPU, ByteNet, and ConvS2S. Highlights that convolutional approaches face logarithmic or linear growth in operations with distance, whereas self-attention maintains constant operations.',
        keyPoints: [
          'ConvS2S requires O(n/k) layers to connect distant input-output positions.',
          'Self-attention computes representations in constant O(1) sequential steps.',
          'Introduces the concept of Multi-Head Attention to counter resolution degradation.',
        ],
      },
      {
        id: 'sec-3',
        number: '3',
        title: 'Model Architecture',
        pageRange: 'pp. 2-5',
        summary:
          'Provides the mathematical and structural blueprint of the Transformer. Describes the 6-layer encoder, 6-layer decoder, Scaled Dot-Product Attention equation, Multi-Head Attention projections, Position-wise Feed-Forward Networks, and sinusoidal Positional Encodings.',
        keyPoints: [
          'Scaled Dot-Product: softmax((Q K^T) / √d_k) * V with scaling factor √d_k = 8.',
          'Multi-Head Attention splits into 8 parallel projection heads of dimension 64.',
          'FFN consists of two linear transformations with a ReLU activation: max(0, xW_1 + b_1)W_2 + b_2.',
          'Sinusoidal positional encoding allows extrapolation to unseen sequence lengths.',
        ],
      },
      {
        id: 'sec-4',
        number: '4',
        title: 'Why Self-Attention',
        pageRange: 'pp. 5-6',
        summary:
          'Analyzes three core criteria comparing Self-Attention, Recurrent, and Convolutional layers: total computational complexity per layer, amount of computation that can be parallelized, and path length between long-range dependencies.',
        keyPoints: [
          'Self-Attention per-layer complexity is O(n² · d); when n < d, it is cheaper than RNN O(n · d²).',
          'Maximum path length is O(1) for self-attention vs O(n) for recurrent.',
          'Self-attention produces highly interpretable attention distributions representing syntactic and semantic dependencies.',
        ],
      },
      {
        id: 'sec-5',
        number: '5',
        title: 'Training',
        pageRange: 'pp. 6-7',
        summary:
          'Details the empirical training setup: 8 NVIDIA Tesla P100 GPUs, Adam optimizer configuration, learning rate warmup equation, residual dropout, and label smoothing.',
        keyPoints: [
          'Base model trained for 100,000 steps (12 hours); Big model trained for 300,000 steps (3.5 days).',
          'Warmup learning rate schedule increases linearly for 4000 steps, then decays proportionally to inverse square root.',
          'Label smoothing value ε_ls = 0.1 hurts perplexity but improves overall BLEU score.',
        ],
      },
      {
        id: 'sec-6',
        number: '6',
        title: 'Results & Ablation Studies',
        pageRange: 'pp. 7-9',
        summary:
          'Reports experimental evaluation on WMT 2014 translation benchmarks and English constituency parsing. Conducts extensive ablation variations: changing head counts, key sizes, layer dropouts, and positional embeddings.',
        keyPoints: [
          'Transformer (Big) achieves 28.4 BLEU on En-De and 41.8 BLEU on En-Fr.',
          'Single-head attention is 0.9 BLEU worse than the optimal 8 heads.',
          'Learned positional embeddings yield virtually identical performance to fixed sinusoidal functions.',
        ],
      },
      {
        id: 'sec-7',
        number: '7',
        title: 'Conclusion',
        pageRange: 'p. 10',
        summary:
          'Summarizes the paradigm shift introduced by pure attention models and outlines future directions, including extending attention to non-textual modalities like images, audio, and video.',
        keyPoints: [
          'Demonstrates that self-attention alone is sufficient for state-of-the-art sequence modeling.',
          'Planned work on local restricted attention mechanisms for long inputs and multi-modal generation.',
        ],
      },
    ],
    chatResponses: {
      'What is the main contribution of this paper?':
        'The main contribution of **Vaswani et al. (2017)** is the introduction of the **Transformer architecture**, which eliminates recurrent and convolutional neural networks entirely from sequence transduction tasks.\n\nKey aspects of this contribution:\n1. **Pure Self-Attention Mechanism**: Replaces sequential hidden-state recurrence with Scaled Dot-Product Attention, calculating direct dependencies between all tokens in constant \\(O(1)\\) sequential operations.\n2. **Multi-Head Attention**: Allows the network to jointly attend to information across multiple representation subspaces and positions simultaneously.\n3. **Radical Parallelization**: Enables training speeds up to 10× faster than recurrent counterparts (GNMT, ByteNet), reaching state-of-the-art translation on WMT 2014 (28.4 BLEU En-De, 41.8 BLEU En-Fr) in just 3.5 days on 8 GPUs.',
      'Explain the methodology.':
        'The Transformer methodology is structured around an **Encoder-Decoder layout** using stacked self-attention and position-wise feed-forward sub-layers:\n\n* **Encoder Stack**: Composed of \\(N = 6\\) identical layers. Each layer has two sub-layers:\n  - Multi-Head Self-Attention\n  - Position-wise Feed-Forward Network (FFN)\n  - Connected via residual connections and Layer Normalization: `LayerNorm(x + SubLayer(x))`.\n\n* **Decoder Stack**: Also \\(N = 6\\) layers, adding a third sub-layer that performs Multi-Head Attention over the encoder’s output representations, with masked self-attention to prevent looking ahead.\n\n* **Scaled Dot-Product Attention**: \\(\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V\\). The \\(\\sqrt{d_k}\\) scaling avoids vanishing gradients in softmax for large inner products.\n\n* **Positional Encodings**: Since no recurrence exists, sine and cosine functions of frequencies \\(10000^{2i/d_{\\text{model}}}\\) are added directly to token embeddings.',
      'What are the key findings?':
        'The key empirical and architectural findings reported in the paper include:\n\n* **State-of-the-Art Translation Quality**: The Transformer (Big) established a new benchmark on WMT 2014 English-to-German with **28.4 BLEU** (+2.0 over previous best) and English-to-French with **41.8 BLEU**.\n* **Drastic Compute Efficiency**: Trained in only 3.5 days on 8 P100 GPUs—an estimated fraction (less than 25%) of the training FLOPs required by recurrent architectures like GNMT or ByteNet.\n* **Subspace Specialization**: Ablation studies revealed that Multi-Head Attention with 8 heads consistently outperforms single-head attention by nearly 1.0 BLEU, proving that heads specialize in distinct syntactic relationships.\n* **Generalization Power**: Without structural adjustments, the model scored 91.3 F1 on English Constituency Parsing (Penn Treebank), outperforming specialized parsers.',
      'What limitations did the authors mention?':
        'While revolutionary, the paper highlights and implies several distinct limitations:\n\n1. **Quadratic Time and Memory Complexity (\\(O(n^2)\\))**: Calculating pairwise attention scores for all token pairs scales quadratically with sequence length \\(n\\), severely limiting context windows on long inputs.\n2. **Lack of Inductive Bias for Order**: The model is inherently permutation-equivariant; without sinusoidal or learned positional encodings, it cannot distinguish word order.\n3. **Sequential Autoregressive Inference**: Although training is fully parallelized across all tokens, inference still generates one token at a time, requiring significant KV-cache memory.\n4. **Data and Resource Hunger**: The absence of hard architectural constraints (like spatial locality in CNNs) demands larger datasets to generalize reliably.',
      'What datasets and benchmarks were evaluated?':
        'The authors evaluated the Transformer on three primary benchmarks:\n\n1. **WMT 2014 English-to-German**: Consisting of 4.5 million sentence pairs encoded with a 37,000 token shared Byte-Pair Encoding (BPE).\n2. **WMT 2014 English-to-French**: A much larger dataset of 36 million sentence pairs using a 32,000 word-piece vocabulary.\n3. **Penn Treebank (WSJ Section 23)**: 40,000 sentences used to evaluate structural constituency parsing in a low-resource scenario.',
    },
  },
  {
    id: 'paper-rag-2020',
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    shortTitle: 'Retrieval-Augmented Generation (RAG)',
    authors: [
      { name: 'Patrick Lewis', affiliation: 'Facebook AI Research / UCL' },
      { name: 'Ethan Perez', affiliation: 'NYU' },
      { name: 'Aleksandra Piktus', affiliation: 'FAIR' },
      { name: 'Fabio Petroni', affiliation: 'FAIR' },
      { name: 'Vladimir Karpukhin', affiliation: 'FAIR' },
      { name: 'Naman Goyal', affiliation: 'FAIR' },
      { name: 'Heinrich Küttler', affiliation: 'FAIR' },
      { name: 'Mike Lewis', affiliation: 'FAIR' },
      { name: 'Scott Yih', affiliation: 'FAIR' },
      { name: 'Tim Rocktäschel', affiliation: 'UCL' },
      { name: 'Sebastian Riedel', affiliation: 'FAIR / UCL' },
      { name: 'Douwe Kiela', affiliation: 'FAIR' },
    ],
    publication: {
      venue: 'Advances in Neural Information Processing Systems (NeurIPS 2020)',
      year: 2020,
      doi: '10.48550/arXiv.2005.11401',
      arxivId: '2005.11401',
      citations: '5,200+',
      field: 'Information Retrieval / Knowledge-Grounded NLP',
    },
    meta: {
      totalPages: 19,
      fileSize: '3.1 MB',
      fileName: 'lewis2020_retrieval_augmented_generation.pdf',
      readingTimeMinutes: 24,
      figuresCount: 6,
      tablesCount: 7,
      referencesCount: 68,
    },
    quickOverview:
      'Introduces RAG, an end-to-end differentiable framework combining a pre-trained parametric memory (BART generator) with a non-parametric memory (dense vector index of Wikipedia accessed via DPR). Demonstrates superior factual accuracy and reduced hallucination across open-domain QA and knowledge-intensive dialogue.',
    detailedSummary:
      'Large pre-trained language models store substantial factual knowledge within their parameters. However, accessing and manipulating this parametric knowledge is imprecise, hallucination-prone, and cannot be updated dynamically without expensive re-training. This paper introduces Retrieval-Augmented Generation (RAG), a general-purpose hybrid architecture uniting parametric memory with an external non-parametric document index.\n\nThe framework explores two models: RAG-Sequence (retrieving once per sequence and conditioning the entire generation on that document) and RAG-Token (retrieving documents dynamically per token generation step). The retriever is initialized from Dense Passage Retrieval (DPR) utilizing a bi-encoder framework with FAISS vector indexing over 21 million Wikipedia passages, while the generator is an autoregressive BART model. Both components are fine-tuned end-to-end without direct supervision on which document to retrieve.',
    researchObjective:
      'To build a general-purpose, end-to-end differentiable hybrid model that fuses non-parametric neural retrieval with parametric sequence-to-sequence generation to solve knowledge-intensive language tasks while minimizing hallucinations.',
    methodology: [
      {
        aspect: 'Retriever: Dense Passage Retrieval (DPR)',
        detail:
          'Bi-encoder architecture based on BERT-base calculating inner-product similarity sim(q, d) = q(x)^T d(z) between query embeddings and pre-indexed 100-word Wikipedia passages.',
      },
      {
        aspect: 'Generator: BART-Large',
        detail:
          'Pre-trained sequence-to-sequence Transformer with 400M parameters acting as the parametric generator conditioned on concatenation of query input and retrieved passages.',
      },
      {
        aspect: 'RAG-Sequence Formulation',
        detail:
          'Marginalizes over the top-K retrieved documents per sequence: p(y|x) = ∑ p_η(z|x) ∏ p_θ(y_i|x, z, y_{1:i-1}).',
      },
      {
        aspect: 'RAG-Token Formulation',
        detail:
          'Marginalizes over retrieved documents at each individual output token step: p(y|x) = ∏ ∑ p_η(z|x) p_θ(y_i|x, z, y_{1:i-1}).',
      },
      {
        aspect: 'End-to-End Backpropagation',
        detail:
          'Retriever query encoder and generator are trained jointly using task cross-entropy loss without explicit supervision on intermediate document relevance.',
      },
    ],
    datasets: [
      {
        name: 'Natural Questions (NQ)',
        type: 'Open-Domain QA',
        size: '79,168 train / 3,610 dev / 3,610 test',
        vocabulary: 'Full English web search queries',
        purpose: 'Evaluating factual extraction against real Google search queries',
      },
      {
        name: 'TriviaQA',
        type: 'Trivia Question Answering',
        size: '78,785 question-answer pairs',
        vocabulary: 'Unfiltered open-domain knowledge',
        purpose: 'Testing long-tail knowledge extraction and multi-entity reasoning',
      },
      {
        name: 'MS-MARCO',
        type: 'Web Search Answering',
        size: '100,000 queries with answers',
        vocabulary: 'Bing search query logs',
        purpose: 'Abstractive generation rather than extractive span matching',
      },
      {
        name: 'Jeopardy! Question Generation',
        type: 'Knowledge-Intensive Generation',
        size: '20,000 answer-to-question pairs',
        vocabulary: 'Highly specific cultural & scientific trivia',
        purpose: 'Testing generation specificity and factual hallucination rates',
      },
    ],
    keyFindings: [
      {
        metric: '44.5% Exact Match on Natural Questions',
        description: 'RAG outperforms standard BART, T5-11B, and closed-book retrieval models on open-domain question answering.',
        impact: 'Achieves state-of-the-art results with dramatically fewer parameters than massive closed-book LLMs.',
      },
      {
        metric: 'Superior Factual Grounding',
        description: 'Human evaluation found RAG generations significantly more factual and specific than standalone BART.',
        impact: 'Substantially reduces hallucination in open-ended Jeopardy question generation.',
      },
      {
        metric: 'Hot-Swappable Non-Parametric Memory',
        description: 'Demonstrated that replacing the underlying Wikipedia index automatically updates the model’s world knowledge without retraining.',
        impact: 'Enables continuous real-time knowledge updating at minimal compute overhead.',
      },
    ],
    limitations: [
      {
        title: 'Retrieval Latency and FAISS Overhead',
        severity: 'Moderate',
        description: 'Calculating top-K passages and passing them through the generator adds inference latency compared to pure parametric generation.',
      },
      {
        title: 'Fixed Passage Chunking Artifacts',
        severity: 'Moderate',
        description: '100-word fixed passage boundaries can fragment multi-sentence facts across chunks, hindering cross-paragraph reasoning.',
      },
      {
        title: 'Vulnerability to Retrieval Poisoning',
        severity: 'High',
        description: 'If the retrieved documents contain inaccurate or conflicting information, the generator often faithfully repeats the factual errors.',
      },
    ],
    keywords: [
      { term: 'RAG', category: 'Architecture', weight: 'Primary' },
      { term: 'Dense Passage Retrieval (DPR)', category: 'Retriever', weight: 'Primary' },
      { term: 'Non-Parametric Memory', category: 'Concept', weight: 'Primary' },
      { term: 'Parametric Memory', category: 'Concept', weight: 'Secondary' },
      { term: 'BART Generator', category: 'Model', weight: 'Secondary' },
      { term: 'Open-Domain QA', category: 'Task', weight: 'Primary' },
      { term: 'FAISS Index', category: 'Systems', weight: 'Secondary' },
      { term: 'Hallucination Reduction', category: 'Safety/Reliability', weight: 'Primary' },
      { term: 'Knowledge-Intensive NLP', category: 'Domain', weight: 'Secondary' },
      { term: 'Marginalization', category: 'Algorithm', weight: 'Secondary' },
    ],
    sectionSummaries: [
      {
        id: 'rag-1',
        number: '1',
        title: 'Introduction',
        pageRange: 'pp. 1-3',
        summary: 'Introduces the limitations of purely parametric models (lack of interpretability, high hallucination rates, update costs) and proposes the hybrid parametric/non-parametric framework.',
        keyPoints: [
          'Pre-trained language models act as soft knowledge bases with unpredictable recall.',
          'RAG decouples knowledge storage (vector index) from language composition (generator).',
        ],
      },
      {
        id: 'rag-2',
        number: '2',
        title: 'Methods: RAG-Sequence & RAG-Token',
        pageRange: 'pp. 3-6',
        summary: 'Formulates the two distinct generation approaches: document-level marginalization (RAG-Sequence) versus token-level marginalization (RAG-Token) alongside the MIPS retrieval equation.',
        keyPoints: [
          'RAG-Sequence assumes the same document context generates the complete response.',
          'RAG-Token can synthesize content by drawing tokens conditioned on different documents.',
          'Maximum Inner Product Search (MIPS) performs sub-millisecond retrieval across 21M passages.',
        ],
      },
      {
        id: 'rag-3',
        number: '3',
        title: 'Experiments & Benchmarks',
        pageRange: 'pp. 6-11',
        summary: 'Compares RAG against state-of-the-art extractive (REALM, DPR) and parametric-only baselines across open-domain QA and generation tasks.',
        keyPoints: [
          'RAG sets new SOTA on Natural Questions, TriviaQA, and WebQuestions.',
          'Outperforms large models like T5-11B while using ~10x fewer parameters.',
        ],
      },
      {
        id: 'rag-4',
        number: '4',
        title: 'Knowledge Update & Index Swapping',
        pageRange: 'pp. 11-13',
        summary: 'Demonstrates a test where world facts change (e.g., political leadership elections); replacing the Wikipedia index immediately updates answers without retraining.',
        keyPoints: [
          'Parametric models fail when tested on updated facts post-training cutoff.',
          'RAG successfully shifts predictions by updating passage index alone.',
        ],
      },
    ],
    chatResponses: {
      'What is the main contribution of this paper?':
        'The primary contribution of **Lewis et al. (2020)** is introducing **Retrieval-Augmented Generation (RAG)**—a hybrid neural framework that marries a pre-trained sequence-to-sequence parametric generator (BART) with a non-parametric dense vector index of Wikipedia (DPR).\n\nKey takeaways:\n1. **End-to-End Fine-Tuning**: Trains both retriever and generator jointly without explicit passage labels.\n2. **Reduced Hallucinations**: Grounds open-ended responses on explicit retrieved texts.\n3. **Modular Knowledge**: World knowledge can be refreshed in real time simply by swapping or updating the non-parametric index.',
      'Explain the methodology.':
        'RAG operates via two core components:\n* **Retriever (DPR)**: Embeds queries and documents using BERT-base bi-encoders. Calculates relevance via maximum inner product search: \\(\\text{sim}(q, d) = q(x)^T d(z)\\).\n* **Generator (BART-Large)**: Autoregressively generates output text conditioned on the concatenation of the original input query and the top-K retrieved passages.\n\nThe paper introduces two variants: **RAG-Sequence** (retrieves top-K once and marginalizes over documents) and **RAG-Token** (allows each output token to attend to different retrieved passages).',
      'What are the key findings?':
        'RAG achieved state-of-the-art results on open-domain QA benchmarks (Natural Questions: 44.5% EM, TriviaQA: 56.1% EM), beating models like T5-11B despite having fewer parameters. Generations were judged by human evaluators to be far more specific and factually accurate than standalone BART.',
      'What limitations did the authors mention?':
        '1. **Computational latency**: Searching through 21M passage vectors with FAISS and feeding multiple passages through the generator increases inference latency.\n2. **Fixed passage chunking**: 100-word chunks can split continuous arguments across passages.\n3. **Sensitivity to noisy retrieval**: Inaccurate or conflicting retrieved passages can propagate errors into the generated output.',
    },
  },
  {
    id: 'paper-biogpt-2022',
    title: 'BioGPT: Generative Pre-trained Transformer for Biomedical Text Generation and Mining',
    shortTitle: 'BioGPT Biomedical AI',
    authors: [
      { name: 'Renqian Luo', affiliation: 'University of Science and Technology of China' },
      { name: 'Liai Sun', affiliation: 'Microsoft Research' },
      { name: 'Yingce Xia', affiliation: 'Microsoft Research' },
      { name: 'Tao Qin', affiliation: 'Microsoft Research' },
      { name: 'Sheng Zhang', affiliation: 'Microsoft Research' },
      { name: 'Hoifung Poon', affiliation: 'Microsoft Research' },
      { name: 'Tie-Yan Liu', affiliation: 'Microsoft Research' },
    ],
    publication: {
      venue: 'Briefings in Bioinformatics (Oxford Academic, 2022)',
      year: 2022,
      doi: '10.1093/bib/bbac409',
      arxivId: '2210.15868',
      citations: '1,850+',
      field: 'Biomedical Informatics / Foundation Models',
    },
    meta: {
      totalPages: 11,
      fileSize: '1.8 MB',
      fileName: 'luo2022_biogpt_biomedical_text_generation.pdf',
      readingTimeMinutes: 16,
      figuresCount: 4,
      tablesCount: 6,
      referencesCount: 54,
    },
    quickOverview:
      'Presents BioGPT, a domain-specific generative pre-trained Transformer trained from scratch on 15 million PubMed abstracts. Achieves superior performance on biomedical relation extraction, question answering (PubMedQA 78.2% accuracy), and text generation compared to general-domain LLMs.',
    detailedSummary:
      'Biomedical natural language processing has historically focused on discriminative models like BioBERT and PubMedBERT for classification and named-entity recognition. However, generative capabilities are crucial for summarizing clinical trials, generating diagnostic hypotheses, and answering complex medical queries.\n\nBioGPT adopts a generative pre-trained Transformer architecture (similar to GPT-2 medium, 24 layers, 1024 hidden size, 16 heads, 347M parameters) trained from scratch on 15 million PubMed abstracts (amounting to 3 billion tokens). By using a specialized in-domain vocabulary and autoregressive language modeling objective, BioGPT learns rich semantic representations of biomedical nomenclature, drug-drug interactions, and genetic disease associations.',
    researchObjective:
      'To build a domain-specific generative foundation model pre-trained exclusively on biomedical literature that excels in biomedical relation extraction, medical question answering, and fluent document synthesis.',
    methodology: [
      {
        aspect: 'Domain Pre-training from Scratch',
        detail:
          'Trained exclusively on 15 million PubMed abstracts using standard autoregressive causal language modeling loss: L = -∑ log P(w_t | w_{<t}).',
      },
      {
        aspect: 'Specialized Biomedical Vocabulary',
        detail:
          'Constructed a 42,384 token Byte-Pair Encoding dictionary directly from PubMed text to avoid excessive subword splitting of complex chemical and biological entities.',
      },
      {
        aspect: 'Model Architecture',
        detail:
          'Transformer decoder-only backbone with 24 layers, 16 attention heads, and embedding dimension 1024 (347 million parameters total).',
      },
      {
        aspect: 'Prompt-Based Relation Extraction',
        detail:
          'Reformulates relation extraction as sequence generation by feeding head-tail entity pairs into prompting templates and decoding relation descriptions.',
      },
    ],
    datasets: [
      {
        name: 'PubMedQA',
        type: 'Biomedical Question Answering',
        size: '1,000 expert-labeled / 211,269 unlabeled pairs',
        vocabulary: 'Clinical & research queries',
        purpose: 'Reasoning about biomedical research conclusions with Yes/No/Maybe outputs',
      },
      {
        name: 'BioCreative V CDR',
        type: 'Chemical-Disease Relation Extraction',
        size: '1,500 PubMed articles',
        vocabulary: 'MeSH chemicals and disease categories',
        purpose: 'Evaluating relation extraction between chemical compounds and induced diseases',
      },
      {
        name: 'DDI Corpus',
        type: 'Drug-Drug Interaction Benchmark',
        size: '792 drug interaction documents',
        vocabulary: 'Pharmacological names & interaction classes',
        purpose: 'Classifying pharmacokinetic interactions between co-prescribed drugs',
      },
    ],
    keyFindings: [
      {
        metric: '78.2% Accuracy on PubMedQA',
        description: 'BioGPT established a new state-of-the-art on biomedical QA, beating previous leading models (PubMedBERT at 75.8%).',
        impact: 'First generative model to surpass discriminative encoders on this benchmark.',
      },
      {
        metric: '44.98 F1 on Chemical-Disease Relation',
        description: 'Surpasses general GPT-2 and BioBERT on complex biomedical relation extraction.',
        impact: 'Proves generative prompting can outperform token classification for relation extraction.',
      },
      {
        metric: 'Zero-Shot Clinical Term Generation',
        description: 'Generates syntactically correct biomedical descriptions for novel compounds without degrading syntax.',
        impact: 'Demonstrates deep domain-specific linguistic fluency.',
      },
    ],
    limitations: [
      {
        title: 'Abstract-Only Training Scope',
        severity: 'Moderate',
        description: 'Trained only on PubMed abstracts rather than full-text articles, missing extensive experimental methodology sections and supplementary data.',
      },
      {
        title: 'Safety and Diagnostic Guardrails',
        severity: 'High',
        description: 'Generative clinical advice must not be deployed directly for patient diagnosis without clinical validation and hallucination filters.',
      },
      {
        title: 'Limited Context Window (1024 Tokens)',
        severity: 'Moderate',
        description: 'Restricted context length prevents ingestion of complete patient health records or multi-study meta-analyses.',
      },
    ],
    keywords: [
      { term: 'BioGPT', category: 'Model', weight: 'Primary' },
      { term: 'Biomedical NLP', category: 'Domain', weight: 'Primary' },
      { term: 'PubMedQA', category: 'Benchmark', weight: 'Primary' },
      { term: 'Relation Extraction', category: 'Task', weight: 'Secondary' },
      { term: 'Autoregressive LM', category: 'Architecture', weight: 'Secondary' },
      { term: 'Chemical-Disease Relation', category: 'Task', weight: 'Secondary' },
      { term: 'Drug Interactions', category: 'Domain', weight: 'Secondary' },
      { term: 'Medical Informatics', category: 'Domain', weight: 'Secondary' },
    ],
    sectionSummaries: [
      {
        id: 'bio-1',
        number: '1',
        title: 'Introduction & Motivation',
        pageRange: 'pp. 1-2',
        summary: 'Examines the need for generative biomedical models over classification models and outlines the pre-training strategy on PubMed.',
        keyPoints: [
          'Discriminative models are constrained to classification and span extraction.',
          'Biomedical generation enables summarization, literature mining, and clinical assistance.',
        ],
      },
      {
        id: 'bio-2',
        number: '2',
        title: 'BioGPT Architecture & Pre-training',
        pageRange: 'pp. 2-5',
        summary: 'Describes the 347M parameter Transformer decoder architecture, the customized vocabulary, and the compute infrastructure.',
        keyPoints: [
          'Pre-trained on 15M abstracts totaling 3.0 billion tokens.',
          'Custom BPE tokenizer with 42,384 vocabulary entries prevents subword fragmentation.',
        ],
      },
      {
        id: 'bio-3',
        number: '3',
        title: 'Empirical Results & Evaluations',
        pageRange: 'pp. 5-9',
        summary: 'Presents benchmarks on PubMedQA, BioCreative V CDR, and DDI datasets showing SOTA results.',
        keyPoints: [
          'BioGPT achieves 78.2% accuracy on PubMedQA.',
          'Outperforms discriminative models on relation extraction benchmarks.',
        ],
      },
      {
        id: 'bio-4',
        number: '4',
        title: 'Discussion & Future Work',
        pageRange: 'pp. 9-11',
        summary: 'Discusses scaling laws in biomedical literature, clinical safety constraints, and planned multi-modal extensions.',
        keyPoints: [
          'Need for scaling to full-text PMC articles.',
          'Importance of factual safety barriers before clinical deployment.',
        ],
      },
    ],
    chatResponses: {
      'What is the main contribution of this paper?':
        'The main contribution of **Luo et al. (2022)** is **BioGPT**, a domain-specific generative pre-trained Transformer developed specifically for the biomedical domain.\n\nKey achievements:\n1. **Pre-trained from Scratch**: Trained on 15 million PubMed abstracts with a domain-optimized BPE vocabulary.\n2. **Breakthrough QA Accuracy**: Achieved 78.2% accuracy on PubMedQA, setting a new benchmark record and surpassing previous discriminative models.\n3. **Generative Relation Extraction**: Proved that relation extraction can be solved via natural language prompt generation rather than rigid classification.',
      'Explain the methodology.':
        'BioGPT uses a **Transformer decoder-only architecture** (24 layers, 1024 hidden dimension, 16 attention heads, 347M parameters). It was pre-trained using causal language modeling on 15M PubMed abstracts. The authors constructed an in-domain BPE vocabulary of 42,384 tokens to properly encode biomedical terms. Downstream tasks like relation extraction and QA are formatted as natural language prompts.',
      'What are the key findings?':
        'BioGPT achieved **78.2% accuracy on PubMedQA**, outperforming PubMedBERT (75.8%) and general GPT-2. On the BC5CDR Chemical-Disease Relation task, it attained 44.98 F1, showing superior capability in understanding complex medical terminology.',
      'What limitations did the authors mention?':
        '1. **Abstracts only**: The model was trained solely on titles and abstracts, excluding methodology details found in full-text articles.\n2. **Clinical Safety**: Generative medical models require rigorous hallucination filtering and cannot be used for direct patient diagnosis.\n3. **Context Length**: The 1024 token limit restricts processing of multi-page medical records.',
    },
  },
];

/**
 * Creates a realistic paper analysis object if a user uploads a custom PDF
 */
export function createPaperFromUpload(file) {
  const cleanName = file.name.replace(/\.pdf$/i, '');
  const words = cleanName
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const title = words.length > 5 ? words : `${words}: Advanced Analysis in Deep Learning & NLP`;
  const estimatedPages = Math.max(6, Math.min(28, Math.round(file.size / (1024 * 140)) || 12));
  const fileSizeStr = file.size > 1024 * 1024 
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
    : `${Math.round(file.size / 1024)} KB`;

  return {
    id: `custom-paper-${Date.now()}`,
    title: title,
    shortTitle: words.length > 20 ? words.slice(0, 20) + '...' : words,
    authors: [
      { name: 'Primary Investigator et al.', affiliation: 'Academic Research Consortium' },
      { name: 'Lead Research Fellow', affiliation: 'Institute for Advanced Computational Sciences' },
    ],
    publication: {
      venue: 'International Conference on Machine Learning & NLP (ICML / ACL Track)',
      year: 2024,
      doi: `10.48550/arXiv.${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`,
      arxivId: `${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`,
      citations: 'Extracted from uploaded document',
      field: 'Machine Learning / Empirical Research',
    },
    meta: {
      totalPages: estimatedPages,
      fileSize: fileSizeStr,
      fileName: file.name,
      readingTimeMinutes: Math.round(estimatedPages * 1.8),
      figuresCount: Math.round(estimatedPages * 0.6),
      tablesCount: Math.round(estimatedPages * 0.4),
      referencesCount: Math.round(estimatedPages * 3.5),
    },
    quickOverview: `Extracted and synthesized analysis from uploaded document "${file.name}". The paper presents theoretical motivations, experimental validation, and quantitative evaluations addressing core challenges in modern algorithmic modeling. ReLens has parsed the document hierarchy, extracted methodology frameworks, compiled dataset benchmarks, and indexed all sections for interactive inquiry.`,
    detailedSummary: `The uploaded paper "${title}" investigates foundational methodologies and empirical frameworks in computational research. The authors frame the research gap around scalability, generalization boundaries, and computational complexity inherent in existing baseline systems.\n\nThrough structured evaluations, the manuscript presents a formalized pipeline consisting of architectural refinements, rigorous objective functions, and extensive validation across standard benchmarks. The paper systematically details design trade-offs, ablation outcomes, and statistical significance across multiple experimental trials, providing actionable contributions to academic literature.`,
    researchObjective: `To investigate empirical efficacy, architectural efficiency, and theoretical bounds for the proposed computational pipeline described in ${file.name}, with emphasis on overcoming computational bottlenecks and enhancing generalization accuracy.`,
    methodology: [
      {
        aspect: 'Theoretical Framework & Pipeline Formulation',
        detail: 'Formalized algorithmic equations defining forward state transitions, parameter optimization criteria, and loss convergence proofs.',
      },
      {
        aspect: 'Architectural Implementation',
        detail: 'Modular deep learning architecture utilizing layer normalization, attention or feed-forward transformations, and parameter regularization.',
      },
      {
        aspect: 'Optimization & Experimental Training',
        detail: 'Trained using adaptive gradient methods with learning rate decay schedules, batch gradient accumulation, and cross-validation across data splits.',
      },
      {
        aspect: 'Ablation & Comparative Benchmarking',
        detail: 'Systematic comparison against baseline algorithms, isolating individual component contributions via controlled ablation studies.',
      },
    ],
    datasets: [
      {
        name: 'Benchmark Dataset A (Primary)',
        type: 'Standard Research Benchmark',
        size: 'Primary training corpus',
        vocabulary: 'Domain-specific tokenization',
        purpose: 'Direct quantitative comparison with published baselines',
      },
      {
        name: 'Validation & Generalization Split B',
        type: 'Out-of-distribution Test Set',
        size: 'Independent validation partition',
        vocabulary: 'Unseen evaluation domain',
        purpose: 'Measuring transferability and robustness under distribution shift',
      },
    ],
    keyFindings: [
      {
        metric: 'Statistically Significant Baseline Outperformance',
        description: 'Demonstrates measurable performance gains across primary evaluation metrics relative to standard baselines.',
        impact: 'Establishes empirical superiority of the proposed framework in the analyzed configuration.',
      },
      {
        metric: 'Favorable Compute-Performance Scaling',
        description: 'Achieves target convergence with reduced parameter overhead and lower FLOP count.',
        impact: 'Highlights computational viability for academic and edge research deployments.',
      },
      {
        metric: 'Ablation Component Verification',
        description: 'Ablation trials confirm that each core architectural component contributes positively to overall benchmark stability.',
        impact: 'Validates theoretical motivation outlined in Section 3.',
      },
    ],
    limitations: [
      {
        title: 'Sensitivity to Hyperparameter Tuning',
        severity: 'Moderate',
        description: 'Performance exhibits dependency on precise learning rate schedules and batch size thresholds.',
      },
      {
        title: 'Domain Adaptation Bounds',
        severity: 'Moderate',
        description: 'Evaluated primarily within controlled benchmark conditions; performance under extreme distribution shift requires further inquiry.',
      },
      {
        title: 'Computational Hardware Requirements',
        severity: 'Low',
        description: 'Scaling to larger context windows requires high-memory accelerator configurations.',
      },
    ],
    keywords: [
      { term: 'Empirical Evaluation', category: 'Methodology', weight: 'Primary' },
      { term: 'Architectural Design', category: 'Architecture', weight: 'Primary' },
      { term: 'Ablation Study', category: 'Evaluation', weight: 'Secondary' },
      { term: 'Computational Complexity', category: 'Systems', weight: 'Primary' },
      { term: 'Statistical Significance', category: 'Analysis', weight: 'Secondary' },
      { term: 'Optimization Objective', category: 'Algorithm', weight: 'Secondary' },
      { term: 'Benchmark Generalization', category: 'Task', weight: 'Primary' },
      { term: 'Hyperparameter Sensitivity', category: 'Analysis', weight: 'Secondary' },
    ],
    sectionSummaries: [
      {
        id: 'cust-1',
        number: '1',
        title: 'Introduction & Problem Formulation',
        pageRange: `pp. 1-${Math.min(3, Math.round(estimatedPages * 0.2))}`,
        summary: 'Introduces the core research domain, delineates fundamental limitations in existing baselines, and outlines the principal contributions of the paper.',
        keyPoints: [
          'Motivates the research problem with respect to current state of the art.',
          'Lists key theoretical and empirical contributions.',
          'Structures the organization of subsequent sections.',
        ],
      },
      {
        id: 'cust-2',
        number: '2',
        title: 'Related Work & Prior Art',
        pageRange: `pp. ${Math.min(3, Math.round(estimatedPages * 0.2)) + 1}-${Math.min(5, Math.round(estimatedPages * 0.35))}`,
        summary: 'Surveys background literature, categorizing related techniques into distinct paradigms and identifying the specific gap addressed.',
        keyPoints: [
          'Comprehensive taxonomy of existing approaches.',
          'Highlights methodological bottlenecks in legacy systems.',
        ],
      },
      {
        id: 'cust-3',
        number: '3',
        title: 'Proposed Methodology & Architecture',
        pageRange: `pp. ${Math.min(5, Math.round(estimatedPages * 0.35)) + 1}-${Math.min(8, Math.round(estimatedPages * 0.6))}`,
        summary: 'Presents the mathematical formulation, system architecture, loss functions, and algorithmic implementation details.',
        keyPoints: [
          'Formal mathematical objective definitions.',
          'Detailed pipeline diagram and component breakdown.',
        ],
      },
      {
        id: 'cust-4',
        number: '4',
        title: 'Experimental Setup & Results',
        pageRange: `pp. ${Math.min(8, Math.round(estimatedPages * 0.6)) + 1}-${estimatedPages - 1}`,
        summary: 'Details empirical benchmark datasets, training regimes, ablation experiments, and comparative metric outcomes.',
        keyPoints: [
          'Quantitative evaluation showing competitive metrics.',
          'Ablation analysis demonstrating component efficacy.',
        ],
      },
      {
        id: 'cust-5',
        number: '5',
        title: 'Discussion & Conclusion',
        pageRange: `p. ${estimatedPages}`,
        summary: 'Summarizes key insights, articulates boundary limitations, and proposes promising directions for future inquiry.',
        keyPoints: [
          'Synthesis of verified empirical hypotheses.',
          'Discussion of computational and domain constraints.',
        ],
      },
    ],
    chatResponses: {
      'What is the main contribution of this paper?':
        `Based on our analysis of "${title}", the primary contribution centers on the proposed algorithmic architecture and empirical validation framework.\n\nKey contributions extracted:\n1. **Formalized Methodology**: Introduces a unified mathematical formulation addressing scalability and representational fidelity.\n2. **Empirical Validation**: Demonstrates measurable improvements across key benchmark tasks relative to standard baselines.\n3. **Ablation Transparency**: Isolates the exact contribution of each architectural component, confirming the theoretical motivation.`,
      'Explain the methodology.':
        `The methodology outlined in "${title}" consists of:\n* **Data Preprocessing & Normalization**: Standardized input representation ensuring consistent feature distributions.\n* **Core Architecture**: Modular deep learning layers equipped with residual connections and layer normalization for stable gradient flow.\n* **Objective Optimization**: Formulated around a composite loss function with adaptive optimization schedules.\n* **Evaluation Protocol**: Controlled cross-validation comparing directly against published baseline configurations.`,
      'What are the key findings?':
        `The key findings extracted from this paper include:\n* **Benchmark Superiority**: The proposed pipeline achieves statistically significant gains over baselines on primary evaluation metrics.\n* **Ablation Confirmation**: Systematically confirms that each proposed component contributes directly to robustness and convergence speed.\n* **Scaling Viability**: Demonstrates efficient resource utilization without requiring prohibitive computational budgets.`,
      'What limitations did the authors mention?':
        `The analysis identified several limitations highlighted in the discussion:\n1. **Hyperparameter Sensitivity**: Requires deliberate tuning of learning rate and batch schedules.\n2. **Benchmark Scope**: Evaluated under standard benchmark partitions; real-world edge deployment requires additional stress testing.\n3. **Compute Hardware**: Scaled variants benefit significantly from high-memory GPU accelerators.`,
    },
  };
}

/**
 * Intelligent academic assistant response generator for any arbitrary question
 */
export function generateAcademicAnswer(paper, question) {
  const qLower = question.toLowerCase().trim();

  // Check direct matches first
  if (paper.chatResponses && paper.chatResponses[question]) {
    return paper.chatResponses[question];
  }

  // Topic matching
  if (qLower.includes('contribution') || qLower.includes('novelty') || qLower.includes('why is this important') || qLower.includes('propose')) {
    return (
      paper.chatResponses?.['What is the main contribution of this paper?'] ||
      `The principal contribution of **${paper.title}** is its novel architectural framework, which directly addresses foundational bottlenecks in ${paper.publication.field}.\n\nSpecifically, the authors contribute:\n1. An optimized methodology formulated to overcome existing sequential or computational constraints.\n2. Empirical validation proving statistically significant improvements on standard benchmarks.\n3. A thorough analysis of trade-offs and design criteria that provide reproducible value to the research community.`
    );
  }

  if (qLower.includes('method') || qLower.includes('architecture') || qLower.includes('how does it work') || qLower.includes('formula') || qLower.includes('model')) {
    return (
      paper.chatResponses?.['Explain the methodology.'] ||
      `The methodology in **${paper.shortTitle || paper.title}** is structured as follows:\n\n${paper.methodology.map((m) => `* **${m.aspect}**: ${m.detail}`).join('\n\n')}\n\n*Reference: See Section 3 of the paper for formal mathematical formulations and hyperparameter configurations.*`
    );
  }

  if (qLower.includes('finding') || qLower.includes('result') || qLower.includes('performance') || qLower.includes('score') || qLower.includes('accuracy') || qLower.includes('bleu')) {
    return (
      paper.chatResponses?.['What are the key findings?'] ||
      `The paper reports several critical empirical findings:\n\n${paper.keyFindings.map((f) => `* **${f.metric}**: ${f.description} _(Impact: ${f.impact})_`).join('\n\n')}\n\nOverall, the results demonstrate that the proposed approach establishes high empirical effectiveness while maintaining computational feasibility.`
    );
  }

  if (qLower.includes('limitation') || qLower.includes('weakness') || qLower.includes('drawback') || qLower.includes('risk') || qLower.includes('future work') || qLower.includes('constraint')) {
    return (
      paper.chatResponses?.['What limitations did the authors mention?'] ||
      `The authors explicitly discuss several limitations and boundary constraints:\n\n${paper.limitations.map((l) => `* **${l.title} [${l.severity} Severity]**: ${l.description}`).join('\n\n')}\n\nThese constraints suggest future research directions, particularly around algorithmic efficiency and broader domain generalization.`
    );
  }

  if (qLower.includes('dataset') || qLower.includes('benchmark') || qLower.includes('corpus') || qLower.includes('data')) {
    return (
      `The empirical evaluations in **${paper.shortTitle || paper.title}** leverage the following datasets:\n\n${paper.datasets.map((d) => `* **${d.name}** (${d.type}): ${d.size}. Purpose: ${d.purpose}`).join('\n\n')}\n\nAll datasets are standard academic benchmarks ensuring reproducibility and fair comparison against prior literature.`
    );
  }

  if (qLower.includes('author') || qLower.includes('who wrote') || qLower.includes('venue') || qLower.includes('published') || qLower.includes('citation')) {
    return (
      `**Publication Details for "${paper.title}":**\n\n* **Authors**: ${paper.authors.map((a) => `${a.name} (${a.affiliation})`).join(', ')}\n* **Venue**: ${paper.publication.venue} (${paper.publication.year})\n* **DOI / ArXiv**: ${paper.publication.doi}\n* **Field**: ${paper.publication.field}\n* **Document Specs**: ${paper.meta.totalPages} pages, ${paper.meta.referencesCount} references, ${paper.meta.figuresCount} figures.`
    );
  }

  if (qLower.includes('keyword') || qLower.includes('topic') || qLower.includes('concept')) {
    return (
      `The core extracted keywords and conceptual tags for this paper are:\n\n${paper.keywords.map((k) => `* \`${k.term}\` — ${k.category} (${k.weight} relevance)`).join('\n')}\n\nYou can click on any keyword tag in the Keywords tab to explore related paper sections!`
    );
  }

  // Academic contextual fallback
  return `Regarding your inquiry on *" ${question} "* in relation to **${paper.shortTitle || paper.title}**:\n\nBased on our index of the ${paper.meta.totalPages}-page manuscript:\n\n1. **Contextual Grounding**: The paper examines this topic primarily in the context of its ${paper.publication.field} methodology, specifically connecting ${paper.keywords.slice(0, 3).map((k) => `\`${k.term}\``).join(', ')}.\n2. **Section Reference**: Detailed discussion can be found across **Section 3 (Methodology)** and **Section 4 (Empirical Evaluation)**.\n3. **Key Synthesis**: The authors argue that system performance relies crucially on balancing structural trade-offs against computational overhead.\n\nWould you like a deeper breakdown of the mathematical formulation, experimental metrics, or limitations?`;
}
