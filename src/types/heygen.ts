export interface StreamingAvatarEvent {
  detail: {
    message: string;
    [key: string]: string | number | boolean | object | null | undefined;
  };
}

export interface StreamingAvatarEventMap {
  AVATAR_START_TALKING: StreamingAvatarEvent;
  AVATAR_STOP_TALKING: StreamingAvatarEvent;
  AVATAR_TALKING_MESSAGE: StreamingAvatarEvent;
  STREAM_READY: StreamingAvatarEvent;
  STREAM_DISCONNECTED: StreamingAvatarEvent;
  USER_START: StreamingAvatarEvent;
  USER_STOP: StreamingAvatarEvent;
}

export interface StartAvatarResponse {
  videoStream: MediaStream;
  [key: string]: any;
}
