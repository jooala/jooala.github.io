// Draws the concrete texture off the main thread (see loadConcreteTexture).
// The bitmap is flipped here because WebGL can't flip ImageBitmaps on upload.
import { drawConcrete } from './concrete';

self.onmessage = async ({ data: { seed, size } }) => {
  try {
    const canvas = new OffscreenCanvas(size, size);
    drawConcrete(canvas.getContext('2d'), size, seed);
    const bitmap = await createImageBitmap(canvas, { imageOrientation: 'flipY' });
    self.postMessage({ bitmap }, [bitmap]);
  } catch {
    self.postMessage({ bitmap: null });
  }
};
