<div align="center">
  <a href="https://t.me/ClaimCreditNotifyBot" title="Temu claimcredit event notify Telegram bot">
    <img src="/logo.png?raw=true" alt="Temu claimcredit event notify Telegram bot" width="96" height="96" />
  </a>
<h3 align="center">temu-claimcredit-notify-bot</h3>

![koyeb](https://img.shields.io/badge/-Koyeb-121212?style=flat&logo=koyeb&logoColor=white)
![webhooks](https://img.shields.io/website?url=https://claimcredit.koyeb.app/health)

</div>

<br />

일주일 동안 접속해 수령해야 하는 'claimcredit' 이벤트를 위해 개발한 텔레그램 봇이에요.

세션을 등록한 날부터 7일간 아침(수령하지 않았다면 저녁)에 알림을 보내요.

사용법은 텔레그램 봇을 실행한 후 `/help` 명령어를 입력해 확인할 수 있어요.

<br />

### 직접 실행하기

이 봇은 [Node.js](https://nodejs.org/), [Supabase Database](https://supabase.com/) 환경에서 동작해요.

프로젝트를 클론한 후, 아래의 환경변수(`.env`)를 추가하세요.

```dotenv
TELEGRAM_TOKEN=<your-telegram-bot-token>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>

WEBHOOK_URL=<your-webhook-url> # (optional) 텔레그램 봇을 웹훅으로 실행할 때 사용
```

프로젝트를 빌드하면 텔레그램 봇이 작동할 거예요.

Supabase Database의 SQL 생성 명령어는 [여기](/sql)에 작성되어 있어요.

만약 웹훅을 사용하고 싶지 않다면, `WEBHOOK_URL` 환경변수는 생략하고, `index.ts`에 웹훅 관련 초기화 함수를 실행하지 않으면 돼요.
