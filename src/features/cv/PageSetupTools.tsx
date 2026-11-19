import { usePageSetup } from '@docx-editor.dev/react';

const sizes = {
  A4: [11906, 16838],
  A3: [16838, 23811],
  A5: [8391, 11906],
  Letter: [12240, 15840],
  Legal: [12240, 20160],
};
const margins = {
  Normal: [1440, 1440],
  Narrow: [720, 720],
  Moderate: [1440, 1080],
  Wide: [1440, 2880],
};

export function PageSetupTools({
  notice,
}: {
  notice: (message: string) => void;
}) {
  const { pageSetup: page, isEnabled, apply } = usePageSetup();
  if (!page) return null;
  const landscape = page.orientation === 'landscape';
  const paper =
    Object.entries(sizes).find(
      ([, dimensions]) =>
        Math.abs(dimensions[landscape ? 1 : 0] - page.pageWidthTwips) < 4 &&
        Math.abs(dimensions[landscape ? 0 : 1] - page.pageHeightTwips) < 4,
    )?.[0] ?? '';
  const m = page.marginsTwips;
  const margin =
    Object.entries(margins).find(
      ([, [v, h]]) =>
        m.top === v && m.bottom === v && m.left === h && m.right === h,
    )?.[0] ?? '';
  const update = (options: Parameters<typeof apply>[0]) => {
    if (!apply({ ...options, scope: 'section' }))
      notice('Mise en page indisponible pour cette section.');
  };
  return (
    <div className="wr-row">
      <label>
        Margins
        <select
          aria-label="Margins"
          disabled={!isEnabled}
          value={margin}
          onChange={(e) => {
            const [v, h] = margins[e.target.value as keyof typeof margins];
            update({
              marginTopTwips: v,
              marginBottomTwips: v,
              marginRightTwips: h,
              marginLeftTwips: h,
            });
          }}
        >
          <option disabled value="">
            Custom
          </option>
          {Object.keys(margins).map((key) => (
            <option key={key}>{key}</option>
          ))}
        </select>
      </label>
      <label>
        Orientation
        <select
          aria-label="Orientation"
          disabled={!isEnabled}
          value={page.orientation}
          onChange={(e) =>
            update({
              orientation: e.target.value as 'portrait' | 'landscape',
              pageWidthTwips: page.pageHeightTwips,
              pageHeightTwips: page.pageWidthTwips,
            })
          }
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </label>
      <label>
        Size
        <select
          aria-label="Paper size"
          disabled={!isEnabled}
          value={paper}
          onChange={(e) => {
            const [w, h] = sizes[e.target.value as keyof typeof sizes];
            update({
              pageWidthTwips: landscape ? h : w,
              pageHeightTwips: landscape ? w : h,
            });
          }}
        >
          <option value="" disabled>
            Custom
          </option>
          {Object.keys(sizes).map((key) => (
            <option key={key}>{key}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
