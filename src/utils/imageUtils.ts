/* ═══════════════════════════════════════════════════
   图片工具 — 压缩 + blob URL 转 data URL
   解决 localStorage 配额溢出问题
   ═══════════════════════════════════════════════════ */

const MAX_WIDTH = 800;        // 最大宽度 px
const JPEG_QUALITY = 0.7;    // JPEG 压缩质量

/**
 * 将任意图片源（data URL / blob URL / File）压缩为 JPEG data URL
 * 压缩后通常 < 100KB，适合 localStorage 存储
 */
export function compressImage(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const { width, height } = img;
        let w = width;
        let h = height;

        // 限制最大宽度
        if (w > MAX_WIDTH) {
          const ratio = MAX_WIDTH / w;
          w = MAX_WIDTH;
          h = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src); // fallback
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(dataUrl);
      } catch {
        resolve(src); // 压缩失败则用原图
      }
    };

    img.onerror = () => resolve(src); // 加载失败则用原图
    img.src = src;
  });
}

/**
 * 将 blob URL 转为 data URL（解决 blob URL 临时性问题）
 */
export function blobUrlToDataUrl(blobUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(blobUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read blob'));
        reader.readAsDataURL(blob);
      })
      .catch(() => resolve(blobUrl)); // 非 blob URL 直接返回
  });
}

/**
 * 处理抠图结果：blob → data URL（保持 PNG 透明通道）
 * ⚠️ 不能走 JPEG 压缩，否则透明像素变黑
 * 流程：裁剪透明边 → 缩放 → 深色描边 → 贴纸效果
 */
export async function processCutoutResult(blobOrUrl: Blob | string): Promise<string> {
  let dataUrl: string;

  if (typeof blobOrUrl === 'string') {
    if (blobOrUrl.startsWith('blob:')) {
      dataUrl = await blobUrlToDataUrl(blobOrUrl);
    } else {
      dataUrl = blobOrUrl; // 已是 data URL
    }
  } else {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blobOrUrl);
    });
  }

  // 1. 裁剪透明边（去除底纸，紧贴奶茶轮廓）
  const trimmed = await trimTransparentPixels(dataUrl);
  // 2. 缩放到合理尺寸
  const resized = await resizePNG(trimmed, 400);
  // 3. 白色实粗描边（贴纸效果）
  return addStrokeToPNG(resized, 12);
}

/**
 * 裁剪 PNG 四周的透明像素，让图片紧贴实际形状
 * 去除 AI 抠图后残留的透明底纸
 */
function trimTransparentPixels(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.width;
        const h = img.height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        let top = h, bottom = 0, left = w, right = 0;

        for (let py = 0; py < h; py++) {
          for (let px = 0; px < w; px++) {
            if (data[(py * w + px) * 4 + 3] > 10) { // alpha > 10 视为非透明
              if (py < top) top = py;
              if (py > bottom) bottom = py;
              if (px < left) left = px;
              if (px > right) right = px;
            }
          }
        }

        // 全透明图 → 返回原图
        if (left > right || top > bottom) { resolve(dataUrl); return; }

        // 留 4px 呼吸空间 + 描边空间
        const pad = 4;
        const sx = Math.max(0, left - pad);
        const sy = Math.max(0, top - pad);
        const sw = Math.min(w - sx, right - left + 1 + pad * 2);
        const sh = Math.min(h - sy, bottom - top + 1 + pad * 2);

        const out = document.createElement('canvas');
        out.width = sw;
        out.height = sh;
        const outCtx = out.getContext('2d');
        if (!outCtx) { resolve(dataUrl); return; }
        outCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        resolve(out.toDataURL('image/png'));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * 给透明 PNG 的不规则形状添加白色实粗描边
 * 沿 alpha 通道边缘填充白色像素，形成贴纸轮廓
 * 描边后再画原图，保留内部细节
 */
function addStrokeToPNG(dataUrl: string, strokeWidth: number = 2): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.width;
        const h = img.height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; }

        // 先画原图取像素
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const src = imageData.data;

        // 创建描边层（白色填充边缘）
        const strokeLayer = new Uint8ClampedArray(src.length);
        const strokeR = 255;  // 白色实粗描边
        const strokeG = 255;
        const strokeB = 255;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            // 已有颜色的像素跳过
            if (src[idx + 3] > 0) continue;

            // 检查 strokeWidth 范围内是否有非透明邻居
            let edgeDist = Infinity;
            const r = strokeWidth;
            for (let dy = -r; dy <= r; dy++) {
              for (let dx = -r; dx <= r; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                const nidx = (ny * w + nx) * 4;
                if (src[nidx + 3] > 0) {
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < edgeDist) edgeDist = dist;
                }
              }
            }

            if (edgeDist <= r) {
              // 距离越近颜色越深，边缘柔和过渡
              const alpha = Math.round(255 * (1 - edgeDist / (r + 1)));
              strokeLayer[idx] = strokeR;
              strokeLayer[idx + 1] = strokeG;
              strokeLayer[idx + 2] = strokeB;
              strokeLayer[idx + 3] = alpha;
            }
          }
        }

        // 画描边层
        ctx.putImageData(new ImageData(strokeLayer, w, h), 0, 0);

        // 原图画在最上层，保持内部细节
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * 缩放透明 PNG 以减小文件体积（保留透明通道）
 * 用于 localStorage 存储优化
 */
function resizePNG(dataUrl: string, maxDimension: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width <= maxDimension && height <= maxDimension) {
          resolve(dataUrl); // 已经足够小
          return;
        }
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
