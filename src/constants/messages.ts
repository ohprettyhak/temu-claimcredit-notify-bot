export const MESSAGES = {
  WELCOME: `안녕하세요! 🎉
Temu 크레딧백 알림 봇이에요.
매일 아침·저녁 크레딧백 수령 시점을 알려드려요.

📋 가능한 명령어
/start_session   알림 세션 시작
/status          상태 확인
/cancel_session 세션 취소
/help            도움말 보기`,

  HELP: `Temu 크레딧백 알림 봇 도움말이에요.

📝 명령어
• /start_session   알림 세션 시작 (시간대·시간 설정)
• /status          상태 확인
• /cancel_session 세션 취소
• /help            도움말 보기

⏰ 알림 시간
아침: 오전 00:00~11:00
저녁: 오후 12:00~23:00

🌏 지원 시간대
– 기본: Asia/Seoul, America/New_York, Europe/London
– 기타: IANA 형식으로 입력 (예: Asia/Seoul)

💡 팁
– 세션은 7일간 유지돼요
– 알림 오면 "✅ 수령 완료" 버튼 눌러주세요
– /cancel_session으로 언제든 멈출 수 있어요`,

  COMMAND_START_SESSION: '알림 세션 시작',
  COMMAND_STATUS: '상태 확인',
  COMMAND_CANCEL_SESSION: '세션 취소',
  COMMAND_HELP: '도움말 보기',

  SELECT_TIMEZONE: '⏰ 시간대를 골라주세요.',
  ENTER_TIMEZONE: '⏰ IANA 형식으로 입력해주세요 (예: Asia/Seoul).',
  SELECT_MORNING_TIME: '🌅 아침 알림 시간을 골라주세요.',
  SELECT_EVENING_TIME: '🌙 저녁 알림 시간을 골라주세요.',

  SESSION_CONFIRMATION: (
    startDate: string,
    endDate: string,
    morningTime: string,
    eveningTime: string,
    timezone: string,
  ) => `알림 정보 확인할게요.
📆 기간: ${startDate} ~ ${endDate}
🌅 아침: ${morningTime} / 🌙 저녁: ${eveningTime}
🕒 시간대: ${timezone}

시작할까요?`,

  INVALID_INPUT: '잘못된 입력이에요. 버튼을 눌러주세요.',
  USE_BUTTONS_FOR_MORNING: '아침 알림 시간은 버튼으로 골라주세요.',
  USE_BUTTONS_FOR_EVENING: '저녁 알림 시간은 버튼으로 골라주세요.',
  USE_CONFIRMATION_BUTTONS: '확인 버튼을 눌러주세요.',
  MISSING_INFO: '정보가 부족해요. /start_session부터 다시 시작해주세요.',
  MISSING_SESSION_DATA: '세션 정보가 부족해요. /start_session부터 다시 시작해주세요.',

  SESSION_CREATION_FAILED: '세션 생성에 실패했어요. 잠시 뒤 다시 시도해주세요.',
  SESSION_CONFIRMED: '세션이 등록됐어요! 🎉 매일 알림 해드릴게요.',
  SESSION_CANCELLED: '세션이 취소됐어요.',

  USER_INFO_FAILED: '사용자 정보를 못 가져왔어요.',
  SESSIONS_FETCH_FAILED: '세션 정보 조회 실패했어요.',
  NO_ACTIVE_SESSIONS: '활성 세션이 없어요.',
  ACTIVE_SESSIONS: '현재 활성 세션이에요.',
  STATUS_ERROR: '상태 확인 중 오류가 발생했어요.',
  SESSIONS_FETCH_ERROR: '세션 조회 중 오류가 발생했어요.',

  NO_SESSIONS_TO_CANCEL: '취소할 세션이 없어요.',
  SELECT_SESSION_TO_CANCEL: '취소할 세션을 골라주세요.',
  CANCEL_SESSION_ERROR: '세션 취소 중 오류가 발생했어요.',
  SESSION_CANCEL_ERROR: '세션 조회 중 오류가 발생했어요.',
  SESSION_CANCELLED_SUCCESS: '세션이 취소됐어요.',

  MORNING_NOTIFICATION: '🌅 Temu 크레딧백, 아침 수령 시간이에요!',
  EVENING_NOTIFICATION: '🌙 오늘 저녁 크레딧백을 챙기셨나요?',
  NOTIFICATION_NOT_FOUND: '해당 알림을 찾을 수 없어요.',
  MARKED_AS_CLAIMED: '✅ 수령 완료! 표시했어요.',
  INVALID_SESSION_ID: '유효하지 않은 세션 ID예요.',
  SESSION_FETCH_ERROR: '알림의 세션 정보를 못 가져왔어요.',
  NOTIFICATION_SEND_ERROR: (chatId: string, notifId: string) =>
    `알림 전송 실패했어요. (사용자: ${chatId}, ID: ${notifId})`,
  BOT_RUNNING: '봇이 정상적으로 실행 중이에요.',

  PROCESSING_ERROR: '처리 중 오류가 발생했어요.',
  COMMAND_ERROR: (command: string) => `${command} 명령어 처리 중 오류가 발생했어요.`,
  ACTION_ERROR: (action: string) => `${action} 처리 중 오류가 발생했어요.`,
  GLOBAL_BOT_ERROR: '봇 처리 중 오류가 발생했어요.',
} as const;
