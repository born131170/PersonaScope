// Извлечение реальных кадров из видео через canvas
export async function extractFrames(
  videoUrl: string,
  count: number = 8,
  duration: number
): Promise<{ timestamp: number; imageData: string }[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    
    const frames: { timestamp: number; imageData: string }[] = [];
    const interval = duration / (count + 1);
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d')!;
    
    video.addEventListener('loadedmetadata', () => {
      const seekTimes = Array.from({ length: count }, (_, i) => interval * (i + 1));
      let currentIdx = 0;
      
      const seekNext = () => {
        if (currentIdx >= seekTimes.length) {
          resolve(frames);
          return;
        }
        video.currentTime = seekTimes[currentIdx];
      };
      
      video.addEventListener('seeked', () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg', 0.7);
          frames.push({
            timestamp: seekTimes[currentIdx],
            imageData,
          });
        } catch (e) {
          // CORS error — пропускаем кадр
        }
        currentIdx++;
        seekNext();
      });
      
      seekNext();
    });
    
    video.addEventListener('error', () => {
      reject(new Error('Не удалось загрузить видео'));
    });
    
    // Таймаут на случай зависания
    setTimeout(() => {
      if (frames.length === 0) reject(new Error('Таймаут извлечения кадров'));
      else resolve(frames);
    }, 15000);
  });
}

// Извлечение одного кадра в конкретное время
export async function extractFrameAt(
  videoUrl: string,
  timestamp: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;
    
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(timestamp, video.duration - 0.1);
    });
    
    video.addEventListener('seeked', () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } catch (e) {
        reject(new Error('Не удалось извлечь кадр'));
      }
    });
    
    video.addEventListener('error', () => reject(new Error('Ошибка видео')));
    setTimeout(() => reject(new Error('Таймаут')), 10000);
  });
}
