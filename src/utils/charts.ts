import type { Tool, PieSlice } from './types';

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Go: '#00ADD8',
  'C++': '#00599C',
  Rust: '#DEA584',
  Java: '#F89820',
  TypeScript: '#3178C6',
  PHP: '#8892BF',
  HTML: '#E34F26',
  CSS: '#264DE4',
  Shell: '#89E051',
  Ruby: '#701516',
  'C#': '#178600',
  HCL: '#844FBA',
  PowerShell: '#012456',
  Unknown: '#BDC3C7',
};

export function buildPieChart(tools: Tool[]): { slices: PieSlice[]; data: { label: string; value: number; color: string }[] } {
  const languageCounts = tools.reduce((acc: Record<string, number>, tool) => {
    const lang = tool.language || 'Unknown';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});

  const sortedLangs = Object.entries(languageCounts)
    .sort(([, a], [, b]) => b - a);
  const topLangs = sortedLangs.slice(0, 10);
  const othersCount = sortedLangs.slice(10).reduce((acc, [, count]) => acc + count, 0);

  const pieData = topLangs.map(([lang, count]) => ({
    label: lang,
    value: count,
    color: LANGUAGE_COLORS[lang] || '#999',
  }));
  if (othersCount > 0) pieData.push({ label: 'Others', value: othersCount, color: '#999' });

  const total = pieData.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  const slices: PieSlice[] = pieData.map((d) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const x1 = Math.cos(currentAngle);
    const y1 = Math.sin(currentAngle);
    currentAngle += sliceAngle;
    const x2 = Math.cos(currentAngle);
    const y2 = Math.sin(currentAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    return {
      ...d,
      path: `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return { slices, data: pieData };
}
