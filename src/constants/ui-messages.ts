export const UI_MESSAGES = {
  WELCOME: `안녕하세요! 👋
Temu 크레딧백 알림 봇이에요.
매일 아침·저녁 크레딧백 수령 시점을 알려드릴게요.

📋 사용 가능한 명령어
/start_session - 알림 세션 시작
/status - 상태 확인
/cancel_session - 세션 취소
/help - 도움말 보기`,

  HELP_MESSAGE: `📋 사용 가능한 명령어

/start_session - 알림 세션 시작
/status - 상태 확인
/cancel_session - 세션 취소
/help - 도움말 보기

💡 팁: 매일 아침/저녁 시간에 테무 크레딧백 수령 알림을 받을 수 있어요.`,

  SELECT_MORNING_TIME: '🌅 아침 알림 시간을 선택해주세요.',
  SELECT_EVENING_TIME: '🌙 저녁 알림 시간을 선택해주세요.',
  MORNING_TIME_SELECTED: (time: string) => `✅ 아침 시간: ${time}`,
  EVENING_TIME_SELECTED: (time: string) => `✅ 저녁 시간: ${time}`,
  FORM_CONFIRMATION: '📝 위 설정으로 알림을 시작할게요.',

  TODAY_CREDIT_QUESTION: '💰 오늘 이미 크레딧백을 수령하셨나요?',
  TODAY_CLAIMED_SELECTED: '✅ 오늘 크레딧백을 수령했다고 기록됐어요.',
  TODAY_NOT_CLAIMED_SELECTED: '📝 오늘부터 알림을 시작할게요.',

  USE_BUTTONS_FOR_MORNING: '🌅 아침 알림 시간은 버튼으로 선택해주세요.',
  USE_BUTTONS_FOR_EVENING: '🌙 저녁 알림 시간은 버튼으로 선택해주세요.',
  USE_CONFIRMATION_BUTTONS: '👆 확인 또는 취소 버튼을 눌러주세요.',
  USE_TODAY_CREDIT_BUTTONS: '👆 오늘 크레딧 수령 여부를 선택해주세요.',

  SESSION_PROCESSING: '⏳ 세션을 생성하고 있어요...',
  SESSION_SUCCESS: '🎉 세션이 등록되었어요! 매일 알림해드릴게요.',
  SESSION_CANCELLED: '❌ 세션이 취소되었어요.',
  SESSION_CANCELLED_WITH_INFO: (morningTime: string, eveningTime: string) =>
    `❌ 세션이 취소되었어요.\n(아침 ${morningTime}, 저녁 ${eveningTime} 알림)`,
  SESSION_CANCELLED_STATUS: '❌ 세션이 취소되었어요.',
  SESSION_DELETED: '🗑️ 세션이 삭제되었어요.',

  NO_ACTIVE_SESSIONS: '📭 활성 세션이 없어요.',
  ACTIVE_SESSIONS: '📋 현재 활성 세션이에요.',
  NO_SESSIONS_TO_CANCEL: '📭 취소할 세션이 없어요.',
  SELECT_SESSION_TO_CANCEL: '👆 취소할 세션을 선택해주세요.',

  MORNING_NOTIFICATION: '🌅 Temu 크레딧백, 아침 수령 시간이에요!',
  EVENING_NOTIFICATION: '🌙 오늘 저녁 크레딧백을 챙기셨나요?',
  CREDIT_CLAIMED: '🎉 크레딧백을 수령했어요!',

  MISSING_INFO: '❗ 정보가 부족해요. /start_session부터 다시 시작해주세요.',
  MISSING_SESSION_DATA: '❗ 세션 정보가 부족해요. /start_session부터 다시 시작해주세요.',
  SESSION_CREATION_FAILED: '세션 생성에 실패했어요. 잠시 후 다시 시도해주세요.',
  SESSION_CREATION_ERROR: '세션 생성에 실패했어요.',
  SESSIONS_FETCH_FAILED: '세션 정보 조회에 실패했어요.',
  STATUS_ERROR: '상태 조회 중 오류가 발생했어요.',
  CANCEL_SESSION_ERROR: '세션 취소 중 오류가 발생했어요.',
  SESSION_CANCEL_ERROR: '세션 조회 중 오류가 발생했어요.',
  PROCESSING_ERROR: '처리 중 오류가 발생했어요.',
  FAILED_TO_FETCH_SESSIONS: '세션 정보를 가져오는데 실패했어요.',
  SESSION_NOT_FOUND: '세션을 찾을 수 없어요.',
  NOTIFICATION_SEND_ERROR: (chatId: string, notifId: string) =>
    `알림 전송에 실패했어요. (사용자: ${chatId}, ID: ${notifId})`,
} as const;

export const BUTTON_TEXTS = {
  CONFIRM: '✅ 확인',
  CANCEL: '❌ 취소',
  CLAIMED: '✅ 수령 완료',
  GO_TO_TEMU: '🔗 Temu로 이동',
  SESSION_PREFIX: '📅 세션 #',
  TODAY_CLAIMED: '✅ 네, 수령했어요',
  TODAY_NOT_CLAIMED: '❌ 아니요, 안했어요',
} as const;

export const ACTION_NAMES = {
  CLAIM_NOTIFICATION: '수령 완료',
  CANCEL_SESSION: '세션 취소',
  DELETE_SESSION: '세션 삭제',
} as const;
