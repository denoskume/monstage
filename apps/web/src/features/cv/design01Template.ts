// Measurements and palette sampled from the user's CV-DESIGN_01.pdf (A4).
// This is a separate template from the original Thierry KUME CV.
export const DESIGN01 = {
  id: 'design01',
  pageWidth: 595.32,
  pageHeight: 841.92,
  frameX: 4.5,
  frameY: 5.2,
  frameWidth: 585.0,
  frameHeight: 831.8,
  headerBottom: 102.0,
  railX: 7.5,
  railRight: 180.8,
  railBottom: 833.2,
  mainX: 189.8,
  mainWidth: 391.0,
  // Exact source color values: frame RGB(15,158,213);
  // gray rail #BFBFBF, medium blue headers RGB(33,95,154).
  frameBlue: '#0F9ED5',
  dividerBlue: '#4E95D9',
  darkBlue: '#215F9A',
  railGray: '#BFBFBF',
  // Sidebar dividers measured from the PDF in page-top coordinates.
  sidebarRules: [371.0, 455.0, 601.1, 679.1, 730.1],
} as const;
