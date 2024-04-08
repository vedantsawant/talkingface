import { KJUR } from 'jsrsasign';

export function generateSessionToken(
  sdkKey,
  sdkSecret,
  topic,
  passWord = '',
  sessionKey = '',
  userIdentity = '',
  roleType = 1,
  cloud_recording_option = '',
  cloud_recording_election = '',
  telemetry_tracking_id = ''
) {
  let signature = '';
  try {
    const iat = Math.round(new Date().getTime() / 1000);
    const exp = iat + 60 * 60 * 2;

    // Header
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    // Payload
    const oPayload = {
      app_key: sdkKey,
      iat,
      exp,
      tpc: topic,
      pwd: passWord,
      user_identity: userIdentity,
      session_key: sessionKey,
      role_type: roleType // role=1, host, role=0 is attendee, only role=1 can start session when session not start
    };
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    if (cloud_recording_option) {
      Object.assign(oPayload, { cloud_recording_option: parseInt(cloud_recording_option, 10) });
    }
    if (cloud_recording_election) {
      Object.assign(oPayload, { cloud_recording_election: parseInt(cloud_recording_election, 10) });
    }
    if (telemetry_tracking_id) {
      Object.assign(oPayload, { telemetry_tracking_id });
    }
    signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret);
  } catch (e) {
    console.error(e);
  }
  return signature;
}

export function isSupportWebCodecs() {
  return typeof MediaStreamTrackProcessor === 'function';
}

export function isAndroidBrowser() {
  return /android/i.test(navigator.userAgent);
}

export function isSupportOffscreenCanvas() {
  return typeof OffscreenCanvas === 'function';
}
