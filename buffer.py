import subprocess
import numpy as np
import cv2
import matplotlib.pyplot as plt

FORMAT = 's16le'
CHANNELS = 1
RATE = 44100
CHUNK = 1024
# MODEL_INPUT_SIZE =  # Define the expected input size for your model
VIDEO_WIDTH = 640
VIDEO_HEIGHT = 480

audio_cmd = [
    'ffmpeg',
    '-f', 'alsa',
    '-ac', str(CHANNELS),
    '-ar', str(RATE),
    '-i', 'default',
    '-acodec', 'pcm_' + FORMAT,
    '-f', 'wav',
    '-'
]

video_cmd = [
    'ffmpeg',
    '-y',
    '-f', 'rawvideo',
    '-s', f'{VIDEO_WIDTH}x{VIDEO_HEIGHT}',
    '-pix_fmt', 'bgr24',
    '-r', '25',
    '-i', '-',
    '-an',  
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-f', 'mpegts',
    'udp://127.0.0.1:1234'  
]

audio_process = subprocess.Popen(audio_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=CHUNK)

cv2.namedWindow("Live Video Feed", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Live Video Feed", VIDEO_WIDTH, VIDEO_HEIGHT)

print("Waiting for audio input...")

while True:
    audio_data = audio_process.stdout.read(CHUNK)
    if len(audio_data) == 0:
        print("No audio data received. Check your microphone and audio settings.")
        break

    audio_array = np.frombuffer(audio_data, dtype=np.int16)

    print(f"Audio data: {len(audio_array)} samples")

    time = np.arange(0, len(audio_array)) / RATE
    plt.figure(figsize=(4, 2), dpi=80)
    plt.plot(time, audio_array, color='blue')
    plt.title('Audio')
    plt.ylim([-32768, 32767])  
    plt.axis('off')  
    plt.savefig('temp_waveform.png', bbox_inches='tight', pad_inches=0, transparent=True)
    plt.close()

    waveform_image = cv2.imread('temp_waveform.png', cv2.IMREAD_GRAYSCALE)

    waveform_image = cv2.resize(waveform_image, (VIDEO_WIDTH, VIDEO_HEIGHT))

    waveform_image_colored = cv2.cvtColor(waveform_image, cv2.COLOR_GRAY2BGR)

    cv2.imshow("Live Video Feed", waveform_image_colored)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

audio_process.terminate()
cv2.destroyAllWindows()
