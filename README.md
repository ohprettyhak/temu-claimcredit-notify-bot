<div align="center">
  <a href="https://t.me/ClaimCreditNotifyBot" title="Temu claimcredit event notify Telegram bot">
    <img src="/logo.png?raw=true" alt="Temu claimcredit event notify Telegram bot" width="96" height="96" />
  </a>
<h3 align="center">temu-claimcredit-notify-bot</h3>
</div>

## 🎯 **개요**

Temu 크레딧백 알림 텔레그램 봇입니다. 매일 아침/저녁 설정된 시간에 크레딧백 수령을 알려드립니다.

## ✨ **주요 기능**

- 🕐 **맞춤 알림 시간**: 아침/저녁 시간을 자유롭게 설정
- 📊 **세션 상태 추적**: 7일간의 수령 현황 확인
- 🔄 **자동 스케줄링**: 매일 정해진 시간에 자동 알림
- 🌐 **웹훅 지원**: 프로덕션 환경에서 안정적인 웹훅 방식
- 🔧 **폴링 지원**: 개발 환경에서 편리한 폴링 방식

## 🚀 **설치 및 실행**

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경변수 설정
```bash
# 필수 환경변수
TELEGRAM_TOKEN=your_telegram_bot_token
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# 웹훅 설정 (프로덕션 환경)
WEBHOOK_URL=https://yourdomain.com
WEBHOOK_PORT=3000
WEBHOOK_PATH=/webhook
NODE_ENV=production
```

### 3. 빌드
```bash
pnpm build
```

### 4. 실행

#### 개발 환경 (폴링 모드)
```bash
pnpm dev
# 또는
NODE_ENV=development pnpm start
```

#### 프로덕션 환경 (웹훅 모드)
```bash
pnpm start:webhook
# 또는
NODE_ENV=production pnpm start
```

## 🌐 **웹훅 배포**

### 환경변수 설정
```bash
WEBHOOK_URL=https://yourdomain.com  # 실제 도메인 주소
WEBHOOK_PORT=8000                   # 서버 포트 (Koyeb: 8000, 기본값: 3000)
WEBHOOK_PATH=/webhook              # 웹훅 경로 (기본값: /webhook)
NODE_ENV=production                # 프로덕션 모드
```

### 웹훅 엔드포인트
- `POST /webhook` - 텔레그램 웹훅 수신
- `GET /health` - 헬스체크 엔드포인트

### 배포 플랫폼별 설정

#### Koyeb (권장)
```yaml
# koyeb.yaml 파일 사용
name: temu-claimcredit-notify-bot
services:
  - name: webhook-server
    ports:
      - port: 8000
        protocol: http
    env:
      - key: NODE_ENV
        value: production
      - key: WEBHOOK_PORT
        value: "8000"
```

**Koyeb 배포 단계:**
1. GitHub 저장소 연결
2. 환경변수 설정 (TELEGRAM_TOKEN, SUPABASE_URL, SUPABASE_KEY, WEBHOOK_URL)
3. 자동 배포 및 HTTPS 도메인 제공
4. 헬스체크 자동 설정

#### Vercel
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

#### Railway / Render
환경변수만 설정하면 자동으로 배포됩니다.

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start:webhook"]
```

## 📋 **사용법**

1. `/start_session` - 새로운 알림 세션 시작
2. `/status` - 현재 세션 상태 확인
3. `/cancel_session` - 진행 중인 세션 취소
4. `/help` - 도움말 보기

## 🔧 **개발**

### 스크립트
- `pnpm dev` - 개발 모드 (폴링)
- `pnpm dev:webhook` - 개발 모드 (웹훅)
- `pnpm build` - 프로덕션 빌드
- `pnpm start` - 프로덕션 실행
- `pnpm start:webhook` - 웹훅 모드 실행
- `pnpm start:polling` - 폴링 모드 실행

### 기술 스택
- **런타임**: Node.js 18+
- **언어**: TypeScript
- **프레임워크**: Telegraf (텔레그램), Express (웹서버)
- **데이터베이스**: Supabase
- **스케줄링**: node-cron
- **빌드**: SWC

## 📝 **라이선스**

Private
