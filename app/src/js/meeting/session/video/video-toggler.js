import state from "../simple-state";
import { VideoQuality } from '@zoom/videosdk';
import { VIDEO_CANVAS, VIDEO_CANVAS_DIMS, SELF_VIDEO_ELEMENT, SELF_VIDEO_CANVAS } from './video-render-props';


let prevIsSelfVideoOn = false;
let prevIsParticipantVideoOn = false;

export const toggleSelfVideo = async (mediaStream, isVideoOn) => {
  const isUsingVideoElementToStartVideo =
    typeof window.OffscreenCanvas === 'function' && !mediaStream.isSupportMultipleVideos();
  const isRenderingSingleVideoOnCanvas =
    typeof window.OffscreenCanvas !== 'function' && !mediaStream.isSupportMultipleVideos();
  if (typeof isVideoOn !== 'boolean' || prevIsSelfVideoOn === isVideoOn) {
    return;
  }
  const canvas = isRenderingSingleVideoOnCanvas ? SELF_VIDEO_CANVAS : VIDEO_CANVAS;
  if (isVideoOn) {
    if (isUsingVideoElementToStartVideo) {
      SELF_VIDEO_ELEMENT.style.display = 'block';
      SELF_VIDEO_ELEMENT.style.width = '50%';
      SELF_VIDEO_ELEMENT.style.left = '50%';
      await mediaStream.startVideo({ videoElement: SELF_VIDEO_ELEMENT });
    } else {
      await mediaStream.startVideo();
      if (isRenderingSingleVideoOnCanvas) {
        SELF_VIDEO_CANVAS.style.display = 'block';
        SELF_VIDEO_CANVAS.style.width = '50%';
        SELF_VIDEO_CANVAS.style.height = '50%';
        SELF_VIDEO_CANVAS.style.left = '50%';
        SELF_VIDEO_CANVAS.style.top = '50%';
        SELF_VIDEO_CANVAS.style.transform = 'translateY(-50%)';
        await mediaStream.renderVideo(
          canvas,
          state.selfId,
          VIDEO_CANVAS_DIMS.Width / 2,
          VIDEO_CANVAS_DIMS.Height / 2,
          0,
          0,
          VideoQuality.Video_360P
        );
      } else {
        await mediaStream.renderVideo(
          canvas,
          state.selfId,
          VIDEO_CANVAS_DIMS.Width / 2,
          VIDEO_CANVAS_DIMS.Height,
          VIDEO_CANVAS_DIMS.Width / 2,
          0,
          VideoQuality.Video_360P
        );
      }
    }
  } else {
    await mediaStream.stopVideo();
    if (!isUsingVideoElementToStartVideo) {
      if (isRenderingSingleVideoOnCanvas) {
        SELF_VIDEO_CANVAS.style.display = 'none';
      }
      await mediaStream.stopRenderVideo(canvas, state.selfId);
    } else {
      SELF_VIDEO_ELEMENT.style.display = 'none';
    }
  }
  prevIsSelfVideoOn = isVideoOn;
};

export const toggleParticipantVideo = async (mediaStream, userId, isVideoOn) => {
  if (typeof isVideoOn !== 'boolean' || prevIsParticipantVideoOn === isVideoOn) {
    return;
  }

  if (isVideoOn) {
    await mediaStream.renderVideo(
      VIDEO_CANVAS,
      userId,
      VIDEO_CANVAS_DIMS.Width / 2,
      VIDEO_CANVAS_DIMS.Height,
      0,
      0,
      VideoQuality.Video_360P
    );
  } else {
    await mediaStream.stopRenderVideo(VIDEO_CANVAS, userId);
  }
  prevIsParticipantVideoOn = isVideoOn;
};
