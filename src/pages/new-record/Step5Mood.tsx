import { memo, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepHeader } from '../../components/header';
import { PageFooter } from '../../components/footer';
import { useDraft } from './useDraft';
import '../../components/header/Header.css';
import '../../components/card/StepIndicator.css';
import '../../components/footer/PageFooter.css';
import './Step5Mood.css';

export const Step5Mood = memo(function Step5Mood() {
  const navigate = useNavigate();
  const [draft, update] = useDraft();
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(draft.hasVoice);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [notSupported, setNotSupported] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(
    draft.audioDataUrl || null,
  );

  // 检测浏览器是否支持录音
  const isSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined';

  const handleStartRecord = useCallback(async () => {
    setNotSupported(false);
    setPermissionDenied(false);

    if (!isSupported) {
      setNotSupported(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // 停止所有音轨
        stream.getTracks().forEach(t => t.stop());

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setPreviewAudioUrl(dataUrl);
          update({ hasVoice: true, audioDataUrl: dataUrl });
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
      } else {
        setNotSupported(true);
      }
    }
  }, [isSupported, update]);

  const handleStopRecord = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    setRecorded(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleReRecord = useCallback(() => {
    setRecorded(false);
    setElapsed(0);
    setPreviewAudioUrl(null);
    update({ hasVoice: false, audioDataUrl: null });
  }, [update]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="step-mood">
      <StepHeader currentStep={5} totalSteps={6} onBack={() => navigate(-1)} />

      <div className="step-mood__body">
        <div className="step-mood__card">
          {/* ── 语音录制 ── */}
          <div className="mood-section">
            <p className="mood-section__title">🎤 录下此刻的心情</p>
            <p className="mood-section__hint">比打字更真实，以后点开小票就能听到</p>

            <div className="mood-voice">
              {/* 浏览器不支持 */}
              {notSupported && (
                <div className="mood-voice__error">
                  <p className="mood-voice__error-title">当前浏览器不支持录音</p>
                  <p className="mood-voice__error-hint">请使用 Chrome、Edge 或 Safari 打开</p>
                </div>
              )}

              {/* 麦克风权限被拒 */}
              {permissionDenied && (
                <div className="mood-voice__error">
                  <p className="mood-voice__error-title">麦克风权限未开启</p>
                  <p className="mood-voice__error-hint">请在浏览器设置中允许麦克风访问后重试</p>
                </div>
              )}

              {!notSupported && !permissionDenied && (
                <>
                  {recorded ? (
                    /* 已录制 */
                    <div className="mood-voice__done">
                      <div className="mood-voice__done-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <p className="mood-voice__done-text">已录制 {formatTime(elapsed || 5)}</p>
                      {/* 试听按钮 */}
                      {previewAudioUrl && (
                        <button
                          className="mood-voice__play-btn"
                          onClick={() => {
                            const audio = new Audio(previewAudioUrl);
                            audio.play().catch(() => {});
                          }}
                        >
                          ▶ 试听
                        </button>
                      )}
                      <button
                        className="mood-voice__redo-btn"
                        onClick={handleReRecord}
                      >
                        重新录制
                      </button>
                    </div>
                  ) : recording ? (
                    /* 录制中 */
                    <div className="mood-voice__recording">
                      <div className="mood-voice__waves">
                        <span className="mood-voice__wave-bar" />
                        <span className="mood-voice__wave-bar" />
                        <span className="mood-voice__wave-bar" />
                        <span className="mood-voice__wave-bar" />
                        <span className="mood-voice__wave-bar" />
                      </div>
                      <p className="mood-voice__timer">{formatTime(elapsed)}</p>
                      <button
                        className="mood-voice__stop-btn"
                        onClick={handleStopRecord}
                      >
                        <span className="mood-voice__stop-dot" />
                        停止录音
                      </button>
                    </div>
                  ) : (
                    /* 未录制 */
                    <button
                      className="mood-voice__start-btn"
                      onClick={handleStartRecord}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                        <path d="M19 10v2a7 7 0 01-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                      <span>点击开始录音</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── 分隔 ── */}
          <div className="mood-divider">
            <span className="mood-divider__text">或者写下来</span>
          </div>

          {/* ── 文字输入 ── */}
          <div className="mood-section">
            <textarea
              className="mood-textarea"
              placeholder="今天喝这杯奶茶的时候，心情怎么样？"
              rows={4}
              value={draft.moodText}
              onChange={e => update({ moodText: e.target.value })}
            />
            <p className="mood-section__hint">
              {draft.moodText.length > 0
                ? `已输入 ${draft.moodText.length} 字`
                : '文字和语音可以同时保存'}
            </p>
          </div>
        </div>
      </div>

      <PageFooter
        currentStep={5}
        totalSteps={6}
        onPrev={() => navigate('/new/info')}
        onNext={() => navigate('/new/preview')}
      />
    </div>
  );
});
