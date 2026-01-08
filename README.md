# Image-Based Search

L2 (Euclidean distance) measures the straight‑line distance between feature vectors. Good when the magnitude of features matters. Cosine measures the angle between feature vectors (orientation), ignoring magnitude. Good for comparing overall pattern/shape of features. Rule of thumb: Try cosine for general image similarity (robust to lighting/scale). Use L2 if absolute feature values are meaningful for your dataset.
