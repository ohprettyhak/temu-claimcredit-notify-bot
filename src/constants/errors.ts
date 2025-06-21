export const ERROR_MESSAGES = {
  COMMAND_ERROR: (command: string) => `${command} 명령어 처리 중 오류가 발생했어요.`,
  ACTION_ERROR: (action: string) => `${action} 처리 중 오류가 발생했어요.`,
  GLOBAL_BOT_ERROR: '봇 처리 중 오류가 발생했어요.',
  BOT_INIT_FAILED: '봇 초기화에 실패했어요.',

  SESSION_CREATION_ERROR: '세션 생성 중 오류가 발생했어요.',
  STATUS_HANDLER_ERROR: '상태 확인 처리 중 오류가 발생했어요.',
  CANCEL_SESSION_HANDLER_ERROR: '세션 취소 처리 중 오류가 발생했어요.',

  ERROR_FETCHING_NOTIFICATIONS: '알림 조회 중 오류가 발생했어요.',
  ERROR_IN_PROCESSING: '알림 처리 중 오류가 발생했어요.',
} as const;

export const DEV_LOGS = {
  BOT_RUNNING: '봇이 정상적으로 실행 중이에요.',
  SCHEDULER_INITIALIZED: '알림 스케줄러가 초기화됐어요.',

  NOTIFICATION_SENT_SUCCESS: (notificationId: string) => `알림 전송 성공: ${notificationId}`,
  NO_DUE_NOTIFICATIONS: (timestamp: string) => `${timestamp}에 예정된 알림이 없어요.`,
  PROCESSING_NOTIFICATIONS: (count: number) => `${count}개의 알림을 처리 중이에요.`,
  COMPLETED_PROCESSING: (timestamp: string) => `${timestamp}의 알림 처리를 완료했어요.`,
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
