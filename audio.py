import pyaudio
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# Constants
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
VIDEO_WIDTH = 640
VIDEO_HEIGHT = 480

# Initialize PyAudio
p = pyaudio.PyAudio()

# Open stream
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)

# Create a window for video display
fig, ax = plt.subplots()
x = np.arange(0, 2 * CHUNK, 2)
line, = ax.plot(x, np.random.rand(CHUNK))

ax.set_ylim(0, 255)
ax.set_xlim(0, CHUNK)

# Update function for animation
def update(frame):
    audio_data = np.frombuffer(stream.read(CHUNK), dtype=np.int16)
    line.set_ydata(audio_data)
    return line,

ani = FuncAnimation(fig, update, blit=True)

# Show the plot
plt.show()

# Close the stream and terminate PyAudio
stream.stop_stream()
stream.close()
p.terminate()
