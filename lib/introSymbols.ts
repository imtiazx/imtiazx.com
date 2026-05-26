// Single source of truth for the intro gateway symbol cloud.
//
// A vocabulary drawn from mathematics, statistics, machine learning, deep
// learning, generative AI, distributed systems, inference engines, vector
// databases, GPU compute, and scientific computing. Real terms carry most of
// the weight; a thin layer of math operators and Greek adds texture so the
// field reads as machine cognition rather than a word list.
//
// Invariants: no emoji, no em-dashes, every entry intentional. This file is
// the ONLY place cloud tokens may live -- never hardcode them in a component.

export const introSymbols = [
  // Mathematics and statistics
  "gradient", "tensor", "matrix", "vector", "scalar",
  "eigen", "entropy", "variance", "manifold", "topology",
  "convex", "jacobian", "hessian", "fourier", "laplace",
  "bayes", "prior", "posterior", "markov", "gaussian",
  "poisson", "bernoulli", "covariance", "stochastic", "montecarlo",
  "sampling", "derivative",

  // Machine learning
  "neuron", "weights", "bias", "dropout", "softmax",
  "sigmoid", "relu", "gelu", "backprop", "epoch",
  "minibatch", "optimizer", "momentum", "overfit", "regularize",
  "pooling", "kernel", "stride", "padding", "logits",
  "accuracy", "recall", "precision", "learnrate", "ensemble",

  // Deep learning architectures
  "transformer", "attention", "encoder", "decoder", "embedding",
  "residual", "layernorm", "convnet", "recurrent", "lstm",
  "autoencoder", "unet", "diffusion", "denoise", "latent",
  "perceptron", "activation", "feedforward", "multihead",

  // Generative AI and LLMs
  "prompt", "context", "token", "tokenizer", "pretrain",
  "finetune", "distill", "quantize", "lora", "adapter",
  "rlhf", "reward", "policy", "agent", "reasoning",
  "inference", "sampler", "temperature", "topk", "topp",
  "beam", "perplexity", "alignment", "grounding",

  // Distributed systems and deployment
  "cluster", "shard", "replica", "kvcache", "throughput",
  "latency", "scheduler", "kubernetes", "container", "serving",
  "endpoint", "pipeline", "streaming", "autoscale", "queue",
  "worker", "checkpoint", "rollout", "canary", "failover",
  "gateway", "telemetry",

  // GPU compute and inference engines
  "cuda", "gpu", "tensorrt", "triton", "vllm",
  "flashattn", "fp16", "bf16", "int8", "matmul",
  "einsum", "autograd", "simd", "broadcast", "lowbit",

  // Vector databases and retrieval
  "vectordb", "index", "hnsw", "faiss", "cosine",
  "knn", "ann", "retrieval", "rerank", "chunk",
  "semantic",

  // Math operators and Greek (texture)
  "∇λ", "∂L", "∑x", "∏i", "∫dx",
  "Δσ", "Σθ", "ΦΨ", "Ωμ", "μσ²",
  "P(x)", "argmax", "λ→μ", "⊗⊕",
];
