import chroma from 'chroma-js';
import { default as ensureColorContrastPure } from './pure/ensureColorContrast.js';

export default function (color: string, bg: string, minContrastRatio: number) {
    return ensureColorContrastPure(color, bg, minContrastRatio, chroma);
}
