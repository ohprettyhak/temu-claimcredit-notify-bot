export const MESSAGES = {
  WELCOME: `안녕하세요! 🎉
Temu 크레딧백 알림 봇이에요.
매일 아침·저녁 크레딧백 수령 시점을 알려드려요.

📋 가능한 명령어
/start_session - 알림 세션 시작
/status - 상태 확인
/cancel_session - 세션 취소
/help - 도움말 보기`,

  HELP: `Temu 크레딧백 알림 봇 도움말이에요.

📝 명령어
• /start_session - 알림 세션 시작 (시간 설정)
• /status - 상태 확인
• /cancel_session - 세션 취소
• /help - 도움말 보기

⏰ 알림 시간
아침: 오전 00:00~11:00
저녁: 오후 12:00~23:00

🕒 시간대: Asia/Seoul (한국 표준시)

💡 팁
– 세션은 7일간 유지돼요
– 알림 오면 "✅ 수령 완료" 버튼 눌러주세요
– /cancel_session으로 언제든 멈출 수 있어요`,

  COMMAND_START_SESSION: '알림 세션 시작',
  COMMAND_STATUS: '상태 확인',
  COMMAND_CANCEL_SESSION: '세션 취소',
  COMMAND_HELP: '도움말 보기',

  SELECT_MORNING_TIME: '🌅 아침 알림 시간을 골라주세요.',
  SELECT_EVENING_TIME: '🌙 저녁 알림 시간을 골라주세요.',

  MORNING_TIME_SELECTED: (time: string) => `✅ 아침 시간: ${time}`,
  EVENING_TIME_SELECTED: (time: string) => `✅ 저녁 시간: ${time}`,
  FORM_CONFIRMATION: '위 설정으로 알림을 시작할게요.',

  USE_BUTTONS_FOR_MORNING: '아침 알림 시간은 버튼으로 골라주세요.',
  USE_BUTTONS_FOR_EVENING: '저녁 알림 시간은 버튼으로 골라주세요.',
  USE_CONFIRMATION_BUTTONS: '확인 버튼을 눌러주세요.',
  MISSING_INFO: '정보가 부족해요. /start_session부터 다시 시작해주세요.',
  MISSING_SESSION_DATA: '세션 정보가 부족해요. /start_session부터 다시 시작해주세요.',

  SESSION_CREATION_FAILED: '세션 생성에 실패했어요. 잠시 뒤 다시 시도해주세요.',
  SESSION_CANCELLED: '세션이 취소됐어요.',
  SESSION_CANCELLED_WITH_INFO: (morningTime: string, eveningTime: string) =>
    `세션이 취소됐어요.\n(아침 ${morningTime}, 저녁 ${eveningTime} 알림)`,

  SESSIONS_FETCH_FAILED: '세션 정보 조회 실패했어요.',
  NO_ACTIVE_SESSIONS: '활성 세션이 없어요.',
  ACTIVE_SESSIONS: '현재 활성 세션이에요.',
  STATUS_ERROR: '상태 확인 중 오류가 발생했어요.',

  NO_SESSIONS_TO_CANCEL: '취소할 세션이 없어요.',
  SELECT_SESSION_TO_CANCEL: '취소할 세션을 골라주세요.',
  CANCEL_SESSION_ERROR: '세션 취소 중 오류가 발생했어요.',
  SESSION_CANCEL_ERROR: '세션 조회 중 오류가 발생했어요.',

  MORNING_NOTIFICATION: '🌅 Temu 크레딧백, 아침 수령 시간이에요!',
  EVENING_NOTIFICATION: '🌙 오늘 저녁 크레딧백을 챙기셨나요?',
  NOTIFICATION_NOT_FOUND: '해당 알림을 찾을 수 없어요.',
  MARKED_AS_CLAIMED: '✅ 수령 완료! 표시했어요.',
  NOTIFICATION_SEND_ERROR: (chatId: string, notifId: string) =>
    `알림 전송 실패했어요. (사용자: ${chatId}, ID: ${notifId})`,

  PROCESSING_ERROR: '처리 중 오류가 발생했어요.',
  FAILED_TO_FETCH_SESSIONS: '세션 정보를 가져오는데 실패했어요.',
  SESSION_NOT_FOUND: '세션을 찾을 수 없어요.',

  SESSION_PROCESSING: '⏳ 세션을 생성하고 있어요...',
  SESSION_SUCCESS: '✅ 세션이 등록됐어요! 매일 알림 해드릴게요.',
  SESSION_CREATION_ERROR: '❌ 세션 생성에 실패했어요.',
  SESSION_CANCELLED_STATUS: '❌ 세션이 취소됐어요.',
} as const;

export const ACTION_NAMES = {
  CLAIM_NOTIFICATION: '수령 완료',
  CANCEL_SESSION: '세션 취소',
} as const;
