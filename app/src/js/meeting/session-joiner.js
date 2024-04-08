import { v4 as uuidv4 } from 'uuid';
import sessionConfig from '../config';
import { generateSessionToken } from '../tool';
import initClientEventListeners from './session/client-event-listeners';
import initButtonClickHandlers from './session/button-click-handlers';
import state from './session/simple-state';

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const joinSession = async (zmClient) => {
  // const videoSDKLibDir = '/lib';
  const zmClientInitParams = {
    language: 'en-US'
    // dependentAssets: `${window.location.origin}${videoSDKLibDir}`
  };
  const sessionToken = generateSessionToken(
    sessionConfig.sdkKey,
    sessionConfig.sdkSecret,
    sessionConfig.topic,
    sessionConfig.password,
    sessionConfig.sessionKey,
    '',
    '',
    uuidv4()
  );

  let mediaStream;

  const initAndJoinSession = async () => {
    await zmClient.init(zmClientInitParams.language, zmClientInitParams.dependentAssets);

    try {
      await zmClient.join(sessionConfig.topic, sessionToken, sessionConfig.name, sessionConfig.password);
      mediaStream = zmClient.getMediaStream();
      state.selfId = zmClient.getSessionInfo().userId;
    } catch (e) {
      console.error(e);
    }
  };

  const startAudioMuted = async () => {
    await mediaStream.startAudio();
    state.isStartedAudio = true;
    if (!mediaStream.isAudioMuted()) {
      mediaStream.muteAudio();
    }
  };

  const join = async () => {
    console.log('======= Initializing video session =======');
    await initAndJoinSession();
    console.log('======= Initializing client event handlers =======');
    initClientEventListeners(zmClient, mediaStream);
    console.log('======= Starting audio muted =======');
    if (!isSafari) {
      await startAudioMuted();
    }

    console.log('======= Initializing button click handlers =======');
    await initButtonClickHandlers(zmClient, mediaStream);
    console.log('======= Session joined =======');
  };

  await join();
  return zmClient;
};

export default joinSession;
