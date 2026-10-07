export interface CvExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface CvEducation {
  id: string;
  school: string;
  degree: string;
  location: string;
  period: string;
  details: string;
}

export interface CvProject {
  id: string;
  name: string;
  bullets: string[];
}

export interface CvDraft {
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  education: CvEducation[];
  experience: CvExperience[];
  projects: CvProject[];
  skills: string;
  languages: string;
}

const KEY = 'monstage:cv-studio:v1';

export const defaultCvDraft: CvDraft = {
  name: 'Denos Kume',
  headline: 'Data Science | Applied Machine Learning | Computer Vision | Image Processing',
  location: 'Nantes, France',
  email: 'denoskume@yahoo.com',
  phone: '',
  linkedin: 'linkedin.com/in/denoskume',
  github: 'github.com/denoskume',
  summary: 'Final-year MSc student in Data Science, Signal & Image Processing at Centrale Nantes, seeking a 6-month end-of-studies internship from February 2027.',
  education: [
    {
      id: 'ecn',
      school: 'Centrale Nantes',
      degree: 'MSc — Data Science, Signal & Image Processing',
      location: 'Nantes, France',
      period: '2025–2027',
      details: 'Machine learning, computer vision, image processing, signal processing and deep learning.',
    },
    {
      id: 'kju',
      school: 'Kristu Jayanti University',
      degree: 'BSc — Computer Science & Electronics',
      location: 'Bengaluru, India',
      period: '2021–2024',
      details: 'Computer science and electronics, from software fundamentals to hardware and embedded systems.',
    },
  ],
  experience: [
    {
      id: 'unified',
      role: 'Data Analyst Intern',
      company: 'Unified Mentor Pvt. Ltd.',
      location: 'Bengaluru, India',
      period: 'Sep–Dec 2024',
      bullets: [
        'Cleaned and prepared structured datasets using Python, pandas and NumPy.',
        'Performed exploratory analysis to identify trends, distributions and anomalies.',
        'Built Matplotlib visualizations to make results readable and comparable.',
        'Summarized findings in concise reports focused on interpretation and decision-making.',
      ],
    },
    {
      id: 'rws',
      role: 'Speech AI Evaluation Specialist · Freelance',
      company: 'RWS Moravia',
      location: 'Remote',
      period: 'Aug 2026',
      bullets: [
        'Evaluated Speech-to-Speech outputs for quality, coherence, naturalness and usefulness.',
        'Identified linguistic, conversational and audio errors in evaluated responses.',
        'Wrote concise evidence-based rationales for each evaluation decision.',
        'Applied a consistent scoring framework to maintain reproducible evaluations.',
      ],
    },
  ],
  projects: [
    {
      id: 'fraud',
      name: 'Credit Card Fraud Detection',
      bullets: [
        'Built a leakage-safe fraud benchmark on 284,807 transactions including 492 fraud cases.',
        'Compared Logistic Regression, Random Forest, XGBoost and a compact PyTorch MLP using PR-AUC as the primary metric.',
        'Selected XGBoost with 0.8557 PR-AUC, 0.9763 ROC-AUC and 0.8384 recall on the final test set.',
        'Added validation-based threshold selection and global/local SHAP explanations.',
      ],
    },
    {
      id: 'flag',
      name: 'Flag Intelligence',
      bullets: [
        'Built and deployed a MobileNetV3-Small application covering 250 flag classes.',
        'Implemented confidence, decision margin, ranked alternatives and open-set logic.',
        'Evaluated Top-1/Top-5, macro precision/recall/F1, calibration and open-set robustness.',
        'Connected recognition to structured country intelligence generation with PDF/JSON export.',
      ],
    },
  ],
  skills: 'Python, NumPy, pandas, SciPy, scikit-learn, Jupyter, PyTorch, OpenCV, Git, GitHub, Linux, FastAPI, Streamlit, React, TypeScript',
  languages: 'French — Native | English — C1',
};

export function loadCvDraft(): CvDraft {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaultCvDraft, ...JSON.parse(raw) } : defaultCvDraft;
  } catch {
    return defaultCvDraft;
  }
}

export function saveCvDraft(draft: CvDraft): void {
  localStorage.setItem(KEY, JSON.stringify(draft));
}

export function resetCvDraft(): CvDraft {
  localStorage.removeItem(KEY);
  return defaultCvDraft;
}
