export const ERROR_MESSAGES = {
  COMMAND_ERROR: (command: string) => `${command} 명령어 처리 중 오류가 발생했어요.`,
  ACTION_ERROR: (action: string) => `${action} 처리 중 오류가 발생했어요.`,
  GLOBAL_BOT_ERROR: '전역 봇 에러:',
  BOT_INIT_FAILED: '봇 초기화 실패:',

  SESSION_CREATION_ERROR: '세션 생성 중 오류가 발생했어요.',
  STATUS_HANDLER_ERROR: '상태 확인 처리 중 오류가 발생했어요.',
  CANCEL_SESSION_HANDLER_ERROR: '세션 취소 처리 중 오류가 발생했어요.',

  ERROR_FETCHING_NOTIFICATIONS: '알림 조회 중 오류가 발생했어요.',
  ERROR_IN_PROCESSING: '알림 처리 중 오류가 발생했어요.',

  WEBHOOK_SERVER_ERROR: '웹훅 서버 에러:',
  WEBHOOK_SETUP_ERROR: '웹훅 설정 에러:',
  WEBHOOK_REQUEST_ERROR: '웹훅 요청 에러:',

  SHUTDOWN_SIGNAL_RECEIVED: (signal: string) => `${signal} 신호를 받았어요. 서버를 종료 중이에요...`,
  SHUTDOWN_ERROR: '종료 중 오류가 발생했어요:',
  DELETE_SESSION_ACTION: '세션 삭제',
} as const;

export const DEV_LOGS = {
  BOT_RUNNING: '봇이 실행 중이에요.',
  SCHEDULER_INITIALIZED: '스케줄러가 초기화됐어요.',

  NOTIFICATION_SENT_SUCCESS: (notificationId: string) => `알림 전송 성공: ${notificationId}`,
  NO_DUE_NOTIFICATIONS: (timestamp: string) => `${timestamp}에 예정된 알림이 없어요.`,
  PROCESSING_NOTIFICATIONS: (count: number) => `${count}개의 알림을 처리 중이에요.`,
  COMPLETED_PROCESSING: (timestamp: string) => `${timestamp}의 알림 처리를 완료했어요.`,

  WEBHOOK_SERVER_LISTENING: (port: number) => `웹훅 서버가 포트 ${port}에서 실행 중이에요.`,
  WEBHOOK_URL_SET: (url: string) => `웹훅 URL 설정: ${url}`,
  WEBHOOK_REQUEST_RECEIVED: (method: string, path: string) => `웹훅 요청 수신: ${method} ${path}`,
  
  WEBHOOK_UPDATE_RECEIVED: (updateType: string, userId: number, chatId: number) => 
    `[${updateType}] 업데이트 수신 - 사용자: ${userId}, 채팅: ${chatId}`,
  WEBHOOK_MESSAGE_RECEIVED: (userId: number, username: string, firstName: string, chatId: number, text: string) => 
    `[메시지] ${firstName}(@${username || 'unknown'}, ID:${userId}, 채팅:${chatId}): ${text}`,
  WEBHOOK_CALLBACK_RECEIVED: (userId: number, username: string, firstName: string, chatId: number, data: string) => 
    `[콜백] ${firstName}(@${username || 'unknown'}, ID:${userId}, 채팅:${chatId}): ${data}`,
  WEBHOOK_COMMAND_RECEIVED: (userId: number, username: string, firstName: string, chatId: number, command: string) => 
    `[명령어] ${firstName}(@${username || 'unknown'}, ID:${userId}, 채팅:${chatId}): ${command}`,
  WEBHOOK_UNKNOWN_UPDATE: (updateId: number) => `[알 수 없는 업데이트] Update ID: ${updateId}`,
} as const;

export const VALIDATION_ERRORS = {
  INVALID_DATE_FORMAT: (date: string) =>
    `날짜 형식이 잘못됐어요: ${date}. YYYY-MM-DD 형식으로 입력해주세요.`,
  INVALID_TIME_FORMAT: (time: string) =>
    `시간 형식이 잘못됐어요: ${time}. HH:MM 형식으로 입력해주세요.`,
  INVALID_TIMEZONE: (timezone: string) => `시간대가 잘못됐어요: ${timezone}`,
  INVALID_DATETIME: (date: string, time: string, timezone: string) =>
    `날짜/시간이 잘못됐어요: ${date}T${time} (${timezone})`,
} as const;
