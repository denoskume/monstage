export interface CandidateProject {
  name: string;
  keywords: string[];
}

export interface BuiltInCvProfile {
  target: {
    start: string;
    durationMonths: number;
    domains: string[];
  };
  education: Array<{
    school: string;
    degree: string;
    period: string;
    keywords: string[];
  }>;
  skills: Record<string, string[]>;
  projects: CandidateProject[];
  experienceKeywords: string[];
}

export const builtInCvProfile: BuiltInCvProfile = {
  target: {
    start: 'February 2027',
    durationMonths: 6,
    domains: ['machine learning', 'computer vision', 'image processing', 'data science', 'signal processing'],
  },
  education: [
    {
      school: 'Centrale Nantes',
      degree: 'MSc Data Science, Signal & Image Processing',
      period: '2025–2027',
      keywords: ['msc', 'master 2', 'm2', 'data science', 'machine learning', 'computer vision', 'image processing', 'signal processing', 'deep learning'],
    },
    {
      school: 'Kristu Jayanti University',
      degree: 'BSc Computer Science & Electronics',
      period: '2021–2024',
      keywords: ['bsc', 'computer science', 'electronics', 'programming', 'data analysis'],
    },
  ],
  skills: {
    Python: ['python'],
    NumPy: ['numpy'],
    pandas: ['pandas'],
    SciPy: ['scipy'],
    'scikit-learn': ['scikit-learn', 'sklearn'],
    Matplotlib: ['matplotlib'],
    Jupyter: ['jupyter', 'notebook'],
    PyTorch: ['pytorch', 'torch'],
    OpenCV: ['opencv', 'cv2'],
    'Machine Learning': ['machine learning', 'ml'],
    'Deep Learning': ['deep learning', 'neural network', 'cnn'],
    'Computer Vision': ['computer vision', 'vision par ordinateur'],
    'Image Processing': ['image processing', 'traitement image', 'traitement d image'],
    Segmentation: ['segmentation', 'dice', 'iou'],
    'Camera Calibration': ['camera calibration', 'calibration camera', 'calibration caméra'],
    'Feature Tracking': ['feature tracking', 'tracking', 'suivi de points'],
    Git: ['git', 'github'],
    Linux: ['linux', 'wsl'],
    FastAPI: ['fastapi'],
    Streamlit: ['streamlit'],
    React: ['react'],
    TypeScript: ['typescript'],
    XGBoost: ['xgboost'],
    SHAP: ['shap'],
  },
  projects: [
    { name: 'Credit Card Fraud Detection', keywords: ['fraud', 'classification', 'xgboost', 'pytorch', 'machine learning', 'pr-auc', 'roc-auc', 'shap'] },
    { name: 'Flag Intelligence', keywords: ['computer vision', 'mobilenet', 'image classification', 'deep learning', 'pytorch', 'open set', 'top-1', 'top-5'] },
    { name: 'Healthcare Insurance Risk Analysis', keywords: ['machine learning', 'regression', 'classification', 'random forest', 'gradient boosting', 'data science'] },
    { name: 'CLAP Zero-Shot Audio Classification', keywords: ['audio', 'zero-shot', 'classification', 'clap', 'prompt', 'signal processing'] },
    { name: 'Background Subtraction', keywords: ['image processing', 'segmentation', 'fourier', 'morphology', 'dice', 'iou', 'opencv'] },
    { name: 'MSc CORO DASSIP Portfolio', keywords: ['computer vision', 'image processing', 'segmentation', 'camera calibration', 'feature tracking', 'deep learning'] },
    { name: 'MonStage', keywords: ['react', 'typescript', 'cloudflare', 'google apps script', 'full stack'] },
  ],
  experienceKeywords: [
    'data analysis', 'python', 'pandas', 'numpy', 'matplotlib',
    'ai evaluation', 'speech ai', 'quality evaluation', 'error analysis',
  ],
};
