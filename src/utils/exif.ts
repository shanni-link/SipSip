/* ═══════════════════════════════════════════════════
   EXIF 日期读取 — 从照片提取拍摄日期
   优先使用自定义轻量解析器，回退到 exif-js
   ═══════════════════════════════════════════════════ */

/**
 * 从 File 中读取 EXIF DateTimeOriginal + 时间
 * 返回 { date: 'YYYY-MM-DD', time: 'HH:MM' }，若无法读取则返回 null
 */
export async function readExifDateTime(file: File): Promise<{ date: string; time: string } | null> {
  // 1. 先尝试自定义 JPEG EXIF 解析器
  try {
    const customResult = await readExifDateTimeCustom(file);
    if (customResult) return customResult;
  } catch { /* fall through */ }

  // 2. 回退到 exif-js 库
  try {
    const exifResult = await readExifDateTimeWithLib(file);
    if (exifResult) return exifResult;
  } catch { /* fall through */ }

  return null;
}

/**
 * 从 File 中读取 EXIF DateTimeOriginal
 * 返回 YYYY-MM-DD 格式字符串，若无法读取则返回 null
 */
export async function readExifDate(file: File): Promise<string | null> {
  // 1. 先尝试自定义 JPEG EXIF 解析器（快速，不加载额外库）
  try {
    const customResult = await readExifDateCustom(file);
    if (customResult) return customResult;
  } catch {
    // 自定义解析失败，继续尝试下一方案
  }

  // 2. 回退到 exif-js 库（覆盖更多边缘情况）
  try {
    const exifResult = await readExifDateWithLib(file);
    if (exifResult) return exifResult;
  } catch {
    // exif-js 也失败了
  }

  console.log('No EXIF date found in photo, will use today\'s date');
  return null;
}

/* ═══════════════════════ 方案 1：自定义 JPEG 解析（含时间） ═══════════════════════ */

function readExifDateTimeCustom(file: File): Promise<{ date: string; time: string } | null> {
  return new Promise((resolve) => {
    if (file.type && !file.type.startsWith('image/')) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buf = reader.result as ArrayBuffer;
        const view = new DataView(buf);
        const result = parseExifDateTimeFull(view);
        resolve(result);
      } catch { resolve(null); }
    };
    reader.onerror = () => resolve(null);
    const slice = file.slice(0, 131072);
    reader.readAsArrayBuffer(slice);
  });
}

function readExifDateTimeWithLib(file: File): Promise<{ date: string; time: string } | null> {
  return new Promise((resolve) => {
    import('exif-js').then((EXIF) => {
      EXIF.getData(file as unknown as string, function (this: unknown) {
        try {
          const exifData = this as Record<string, string>;
          const dateStr = exifData?.DateTimeOriginal || exifData?.DateTimeDigitized;
          if (dateStr && typeof dateStr === 'string' && dateStr.length >= 16) {
            const date = dateStr.substring(0, 10).replace(/:/g, '-');
            const time = dateStr.substring(11, 16);
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              resolve({ date, time });
              return;
            }
          }
          resolve(null);
        } catch { resolve(null); }
      });
    }).catch(() => resolve(null));
  });
}

/* ═══════════════════════ 方案 1：自定义 JPEG 解析 ═══════════════════════ */

function readExifDateCustom(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    // 宽松检查：iOS 相册选图时 file.type 可能为空字符串
    if (file.type && !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buf = reader.result as ArrayBuffer;
        const view = new DataView(buf);
        const dateStr = parseExifDateTime(view);
        resolve(dateStr);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);

    // 只读前 128KB（EXIF 通常在文件头 64KB 内）
    const slice = file.slice(0, 131072);
    reader.readAsArrayBuffer(slice);
  });
}

/* ═══════════════════════ 方案 2：exif-js 库 ═══════════════════════ */

function readExifDateWithLib(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    // 动态导入，避免增加初始包体积
    import('exif-js').then((EXIF) => {
      EXIF.getData(file as unknown as string, function (this: unknown) {
        try {
          const exifData = this as Record<string, string>;
          const dateTimeOriginal = exifData?.DateTimeOriginal;
          const dateTimeDigitized = exifData?.DateTimeDigitized;

          const dateStr = dateTimeOriginal || dateTimeDigitized;
          if (dateStr && typeof dateStr === 'string' && dateStr.length >= 10) {
            // 格式："2026:06:22 14:30:00" → "2026-06-22"
            const result = dateStr.substring(0, 10).replace(/:/g, '-');
            if (/^\d{4}-\d{2}-\d{2}$/.test(result)) {
              resolve(result);
              return;
            }
          }
          resolve(null);
        } catch {
          resolve(null);
        }
      });
    }).catch(() => resolve(null));
  });
}

/* ═══════════════════════ 内部解析 ═══════════════════════ */

function parseExifDateTime(view: DataView): string | null {
  // 检查 SOI (0xFFD8)
  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) return null;

  let offset = 2;
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset);

    // APP1 marker (0xFFE1) — EXIF 数据
    if (marker === 0xFFE1) {
      const exifResult = readExifAPP1(view, offset + 4);
      if (exifResult) return exifResult;
    }

    // 跳过其他 marker
    const length = view.getUint16(offset + 2);
    offset += 2 + length;
  }

  return null;
}

/** 同 parseExifDateTime，但同时返回时间 HH:MM */
function parseExifDateTimeFull(view: DataView): { date: string; time: string } | null {
  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) return null;

  let offset = 2;
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset);
    if (marker === 0xFFE1) {
      const result = readExifAPP1Full(view, offset + 4);
      if (result) return result;
    }
    const length = view.getUint16(offset + 2);
    offset += 2 + length;
  }
  return null;
}

function readExifAPP1(view: DataView, start: number): string | null {
  // 检查 "Exif\0\0" 标识
  if (start + 6 > view.byteLength) return null;
  const exifId = String.fromCharCode(
    view.getUint8(start),
    view.getUint8(start + 1),
    view.getUint8(start + 2),
    view.getUint8(start + 3),
  );
  if (exifId !== 'Exif') return null;

  const tiffStart = start + 6; // 跳过 "Exif\0\0"

  // 读取字节序
  const byteOrder = view.getUint16(tiffStart);
  const isLE = byteOrder === 0x4949; // 'II' = little-endian

  // 检查 TIFF 标识 0x002A
  if (view.getUint16(tiffStart + 2, isLE) !== 0x002A) return null;

  // 第一个 IFD 偏移
  let ifdOffset = view.getUint32(tiffStart + 4, isLE);
  ifdOffset += tiffStart;

  return readIFD(view, ifdOffset, isLE, tiffStart);
}

function readExifAPP1Full(view: DataView, start: number): { date: string; time: string } | null {
  if (start + 6 > view.byteLength) return null;
  const exifId = String.fromCharCode(
    view.getUint8(start), view.getUint8(start + 1),
    view.getUint8(start + 2), view.getUint8(start + 3),
  );
  if (exifId !== 'Exif') return null;
  const tiffStart = start + 6;
  const byteOrder = view.getUint16(tiffStart);
  const isLE = byteOrder === 0x4949;
  if (view.getUint16(tiffStart + 2, isLE) !== 0x002A) return null;
  let ifdOffset = view.getUint32(tiffStart + 4, isLE);
  ifdOffset += tiffStart;
  return readIFDFull(view, ifdOffset, isLE, tiffStart);
}

function readIFD(view: DataView, offset: number, isLE: boolean, tiffBase: number): string | null {
  if (offset + 2 > view.byteLength) return null;
  const entryCount = view.getUint16(offset, isLE);
  offset += 2;

  for (let i = 0; i < entryCount; i++) {
    if (offset + 12 > view.byteLength) return null;

    const tag = view.getUint16(offset, isLE);
    const type = view.getUint16(offset + 2, isLE);
    const count = view.getUint32(offset + 4, isLE);

    // DateTimeOriginal tag = 0x9003
    // DateTimeDigitized tag = 0x9004 (fallback)
    if (tag === 0x9003 || tag === 0x9004) {
      const valueOffset = offset + 8;
      let strOffset: number;

      // 如果数据 ≤ 4 字节，内联存储
      const typeSize = getTypeSize(type);
      if (typeSize * count <= 4) {
        strOffset = valueOffset;
      } else {
        strOffset = tiffBase + view.getUint32(valueOffset, isLE);
      }

      const dateStr = readAsciiString(view, strOffset, count);
      if (dateStr && dateStr.length >= 10) {
        // 格式："2026:06:22 14:30:00" → "2026-06-22"
        const result = dateStr.substring(0, 10).replace(/:/g, '-');
        if (/^\d{4}-\d{2}-\d{2}$/.test(result)) {
          return result;
        }
      }
    }

    offset += 12;
  }

  return null;
}

/** 同 readIFD，但同时返回时间 */
function readIFDFull(view: DataView, offset: number, isLE: boolean, tiffBase: number): { date: string; time: string } | null {
  if (offset + 2 > view.byteLength) return null;
  const entryCount = view.getUint16(offset, isLE);
  offset += 2;

  for (let i = 0; i < entryCount; i++) {
    if (offset + 12 > view.byteLength) return null;

    const tag = view.getUint16(offset, isLE);
    const type = view.getUint16(offset + 2, isLE);
    const count = view.getUint32(offset + 4, isLE);

    if (tag === 0x9003 || tag === 0x9004) {
      const valueOffset = offset + 8;
      let strOffset: number;
      const typeSize = getTypeSize(type);
      if (typeSize * count <= 4) {
        strOffset = valueOffset;
      } else {
        strOffset = tiffBase + view.getUint32(valueOffset, isLE);
      }

      const dateStr = readAsciiString(view, strOffset, count);
      if (dateStr && dateStr.length >= 16) {
        // 格式："2026:06:22 14:30:00" → date="2026-06-22", time="14:30"
        const date = dateStr.substring(0, 10).replace(/:/g, '-');
        const time = dateStr.substring(11, 16);
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time)) {
          return { date, time };
        }
      }
    }

    offset += 12;
  }

  return null;
}

function getTypeSize(type: number): number {
  const sizes: Record<number, number> = {
    1: 1,  // BYTE
    2: 1,  // ASCII
    3: 2,  // SHORT
    4: 4,  // LONG
    5: 8,  // RATIONAL
    7: 1,  // UNDEFINED
    9: 4,  // SLONG
    10: 8, // SRATIONAL
  };
  return sizes[type] ?? 1;
}

function readAsciiString(view: DataView, offset: number, maxLen: number): string {
  let str = '';
  for (let i = 0; i < maxLen; i++) {
    if (offset + i >= view.byteLength) break;
    const char = view.getUint8(offset + i);
    if (char === 0) break;
    str += String.fromCharCode(char);
  }
  return str;
}
