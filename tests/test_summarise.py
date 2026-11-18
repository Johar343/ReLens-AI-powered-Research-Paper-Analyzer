import torch
from src.summarizer import summarize_text

sample_text = """
The Transformer is a neural network architecture based entirely on
attention mechanisms, dispensing with recurrence and convolutions.
It was introduced for sequence transduction tasks such as machine
translation. The model uses an encoder-decoder structure.

The encoder consists of a stack of identical layers. Each layer has
a multi-head self-attention mechanism and a position-wise feed-forward
network. Residual connections and layer normalization are used around
each sub-layer.

The decoder also consists of a stack of identical layers. In addition
to self-attention and feed-forward networks, it uses encoder-decoder
attention to focus on relevant parts of the input sequence.

The Transformer achieves strong results in machine translation while
allowing significantly more parallelization during training than
recurrent neural network architectures. Its attention mechanism
captures relationships between tokens without requiring sequential
processing.
"""

if __name__ == "__main__":
    print("GPU available:", torch.cuda.is_available())

    result = summarize_text(sample_text)

    print("\nTotal chunks:", result["total_chunks"])

    for index, summary in enumerate(result["chunk_summaries"], start=1):
        print(f"\nChunk {index} summary:")
        print(summary)
