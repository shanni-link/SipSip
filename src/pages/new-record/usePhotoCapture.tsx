/* ═══════════════════════════════════════════════════
   usePhotoCapture — 可复用的拍照/图库 Hook
   两个独立 file input：
     - 相机：始终带 capture="environment"，直接打开原生相机
     - 图库：不带 capture，Android 直接打开文件选择器
   消除动态设置/移除 capture 属性的竞态条件

   兼容性说明：
     Android Chrome: accept="image/*" 无 capture → 直接打开文件选择器
     iOS Safari:     accept="image/*" 无 capture → 弹出「拍照/图库/文件」选择器
                     (iOS 限制，PWA 无法绕过系统级选择器，原生 App 通过
                     UIImagePickerController 可直接指定 sourceType)

   重要：iOS Safari 不支持对同一个 File 对象并发两个 FileReader。
   必须串行读取（先 data URL，再 EXIF），否则 Promise 永久挂起。
   ═══════════════════════════════════════════════════ */

import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDraft, updateDraft } from './draftStore';
import { readExifDateTime } from '../../utils/exif';

/** 将 File 读取为 data URL（不压缩 — 压缩在 Step1Photo 中统一处理） */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * 判断文件是否为可接受的图片。
 * iOS Safari 从相册选图时 file.type 经常为空字符串，
 * 所以不能仅依赖 `file.type.startsWith('image/')`。
 * 放宽策略：type 以 image/ 开头 或 type 为空（iOS 相册） 或
 * 文件名后缀是常见图片格式 → 都接受。
 */
function isImageFile(file: File): boolean {
  // 标准 MIME：image/jpeg, image/png, image/heic, image/webp …
  if (file.type.startsWith('image/')) return true;

  // iOS 相册：type 为空字符串，靠后缀判断
  if (!file.type) {
    const name = file.name.toLowerCase();
    if (/\.(jpe?g|png|gif|webp|heic|heif|bmp|svg)$/.test(name)) return true;
  }

  return false;
}

/**
 * 拍照/图库 Hook
 * 返回 { triggerCamera, triggerGallery, fileInputElement }
 * 文件选取后串行读取文件 → 更新草稿 store → 导航到 /new/photo
 */
export function usePhotoCapture(date?: string) {
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      e.target.value = '';
      return;
    }

    if (!isImageFile(file)) {
      console.warn('usePhotoCapture: Rejected non-image file:', file.name, file.type);
      e.target.value = '';
      alert('请选择图片文件');
      return;
    }

    // 串行读取：iOS Safari 不支持同一 File 并发两个 FileReader
    // 1. 先读 data URL（必须）
    let dataUrl: string;
    try {
      dataUrl = await readFileAsDataUrl(file);
    } catch (err) {
      console.error('usePhotoCapture: Failed to read file:', err);
      e.target.value = '';
      alert('照片读取失败，请重试');
      return;
    }

    // 2. 读取 EXIF 日期+时间（在导航前完成，避免竞态）
    //    加 2s 超时 — exif-js 在某些浏览器上回调可能永远不触发
    const draft = getDraft();
    let exifDate = date ?? draft.date;
    let exifTime = draft.time;
    try {
      const exifResult = await Promise.race([
        readExifDateTime(file),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('EXIF timeout')), 2_000)
        ),
      ]);
      if (exifResult) {
        exifDate = exifResult.date;
        exifTime = exifResult.time;
        console.log('EXIF extracted:', exifResult);
      }
    } catch (err) {
      console.warn('EXIF read failed, using default date:', err);
    }

    // 3. 保存草稿（EXIF 已完成）
    updateDraft({
      photoDataUrl: dataUrl,
      cutoutDataUrl: null,
      date: exifDate,
      time: exifTime,
    });

    e.target.value = '';
    navigate('/new/photo');
  }, [navigate, date]);

  /** 打开相机拍照 — 专用 input，始终带 capture="environment" */
  const triggerCamera = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  /** 打开相册选图 — 专用 input，不带 capture */
  const triggerGallery = useCallback(() => {
    galleryInputRef.current?.click();
  }, []);

  /** 需要渲染到组件中的两个隐藏 file input
   *  使用 position:absolute + opacity:0 代替 display:none
   *  避免部分 Android WebView 不响应 display:none 元素的 click() */
  const fileInputElement = (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }}
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }}
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  );

  return { triggerCamera, triggerGallery, fileInputElement };
}
