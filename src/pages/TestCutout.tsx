/**
 * 🧪 TestCutout — 独立 AI 抠图测试页
 * 绕过所有业务逻辑，只测试 @imgly/background-removal 是否正常工作
 */
import { useState, useCallback } from 'react';

interface LogEntry {
  time: string;
  msg: string;
  type: 'info' | 'error' | 'success';
}

export default function TestCutout() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');

  const log = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, msg, type }]);
    if (type === 'error') console.error(`[TestCutout] ${msg}`);
    else console.log(`[TestCutout] ${msg}`);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setLogs([]);
    setResultUrl(null);
    setProcessing(true);
    setProgress('');

    log(`📁 收到文件: ${file.name} (${(file.size / 1024).toFixed(1)} KB, type="${file.type || '(空)'}")`);

    // 读取为 data URL
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      log(`✅ 文件读取完成, data URL 长度: ${dataUrl.length} 字符`);

      try {
        log('📦 动态导入 @imgly/background-removal...');
        const startTime = performance.now();
        const { removeBackground } = await import('@imgly/background-removal');
        log(`✅ 导入成功 (${(performance.now() - startTime).toFixed(0)}ms)`);

        log('🔍 调用 removeBackground()...');
        log('   配置: model=medium, publicPath=/, debug=true');

        const blob = await removeBackground(dataUrl, {
          model: 'medium',
          publicPath: import.meta.env.BASE_URL,
          debug: true,
          output: { format: 'image/png' },
          progress: (key: string, current: number, total: number) => {
            const pct = Math.round((current / total) * 100);
            const msg = `📊 ${key}: ${pct}% (${(current / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB)`;
            setProgress(msg);
            log(msg, 'info');
          },
        });

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        log(`🎉 抠图完成! 耗时 ${elapsed}s, 结果大小: ${(blob.size / 1024).toFixed(1)} KB`, 'success');

        const url = URL.createObjectURL(blob);
        setResultUrl(url);
      } catch (err: any) {
        log(`❌ 抠图失败: ${err.message || err}`, 'error');
        if (err.stack) {
          log(`   Stack: ${err.stack.split('\n').slice(0, 3).join(' | ')}`, 'error');
        }
      } finally {
        setProcessing(false);
      }
    };

    reader.onerror = () => {
      log('❌ FileReader 读取失败!', 'error');
      setProcessing(false);
    };

    reader.readAsDataURL(file);
  }, [log]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  return (
    <div style={{
      maxWidth: 600,
      margin: '0 auto',
      padding: 24,
      fontFamily: 'system-ui, sans-serif',
      background: '#fbf5ed',
      minHeight: '100vh',
    }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>🧪 AI 抠图独立测试</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
        此页面绕过所有业务逻辑，仅测试 @imgly/background-removal 是否正常
      </p>

      {/* 上传区域 */}
      <div style={{
        border: '2px dashed #c94a3a',
        borderRadius: 12,
        padding: 32,
        textAlign: 'center',
        background: '#fffdf7',
        marginBottom: 20,
      }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="test-file-input"
        />
        <label
          htmlFor="test-file-input"
          style={{
            display: 'block',
            padding: '16px 32px',
            background: '#c94a3a',
            color: '#fff',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: processing ? 'not-allowed' : 'pointer',
            opacity: processing ? 0.5 : 1,
          }}
        >
          {processing ? '⏳ 处理中...' : '📷 选择照片测试抠图'}
        </label>
        <p style={{ color: '#888', fontSize: 12, marginTop: 12 }}>
          选择一张奶茶照片，观察下方日志确认模型加载和推理过程
        </p>
      </div>

      {/* 进度 */}
      {progress && (
        <div style={{
          background: '#fffdf7',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          border: '1px solid #e0d5c0',
          fontSize: 13,
          fontFamily: 'monospace',
          color: '#2f1f12',
        }}>
          {progress}
        </div>
      )}

      {/* 结果预览 */}
      {resultUrl && (
        <div style={{
          background: '#fffdf7',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          textAlign: 'center',
          border: '2px solid #4caf50',
        }}>
          <p style={{ color: '#4caf50', fontWeight: 600, marginBottom: 12 }}>✅ 抠图成功! 透明 PNG:</p>
          <div style={{
            background: 'repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 50% / 20px 20px',
            borderRadius: 8,
            padding: 16,
            display: 'inline-block',
          }}>
            <img
              src={resultUrl}
              alt="Cutout result"
              style={{
                maxWidth: 250,
                maxHeight: 250,
                objectFit: 'contain',
                filter: [
                  'drop-shadow(1px 0 0 #fff)',
                  'drop-shadow(-1px 0 0 #fff)',
                  'drop-shadow(0 1px 0 #fff)',
                  'drop-shadow(0 -1px 0 #fff)',
                  'drop-shadow(1px 1px 0 #fff)',
                  'drop-shadow(-1px -1px 0 #fff)',
                  'drop-shadow(1px -1px 0 #fff)',
                  'drop-shadow(-1px 1px 0 #fff)',
                  'drop-shadow(2px 4px 12px rgba(47,31,18,0.2))',
                ].join(' '),
              }}
            />
          </div>
          <p style={{ color: '#888', fontSize: 11, marginTop: 8 }}>
            ↑ 棋盘格背景 = 透明区域，描边应沿轮廓
          </p>
        </div>
      )}

      {/* 日志区 */}
      <div style={{
        background: '#1e1e1e',
        borderRadius: 8,
        padding: 12,
        maxHeight: 300,
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: 12,
      }}>
        <div style={{ color: '#888', marginBottom: 8 }}>📋 运行日志:</div>
        {logs.length === 0 && (
          <div style={{ color: '#666' }}>等待操作...</div>
        )}
        {logs.map((entry, i) => (
          <div key={i} style={{
            color: entry.type === 'error' ? '#ff6b6b' : entry.type === 'success' ? '#4caf50' : '#aaa',
            marginBottom: 2,
            lineHeight: 1.5,
          }}>
            <span style={{ color: '#666' }}>[{entry.time}]</span> {entry.msg}
          </div>
        ))}
      </div>

      <p style={{ color: '#aaa', fontSize: 11, marginTop: 16, textAlign: 'center' }}>
        Dev server: {window.location.origin} | BASE_URL: {import.meta.env.BASE_URL}
      </p>
    </div>
  );
}
