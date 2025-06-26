# 結核問診システム（プロトタイプ）

このプロジェクトは、**結核患者および接触者を対象とした問診システムのプロトタイプ**です。保健医療の現場における情報収集負担を大きく軽減していくことを目的にしています。ウェブブラウザからアクセス可能で、スマートフォンにも対応しています。
国立研究開発法人科学技術振興機構(JST) 社会技術研究開発センター(RISTEX) 「SDGs の達成に向けた共創的研究開発プログラム」の支援を受けて実施されている『[感染症制圧用情報技術の実用化に向けた多施設フィールドトライアル](https://www.jst.go.jp/ristex/solve/project/solution/solution23_okumurapj.html)』(研究代表者: [北見工業大学 奥村 貴史](tokumura@mail.kitami-it.ac.jp))において開発されています。
ご質問や取材、講演依頼等、お気軽にコンタクト下さい。

---

## 技術スタック

- Frontend: React + Vite
- Backend: Node.js + TypeScript + Express
- Database: MySQL 8
- Docker: docker-compose

---

## プロジェクトの構成

```bash
tbq/
└── client/ # React + Vite frontend
    └── src/
        ├── apis/
        ├── assets/
        ├── components/
        ├── consts/
        ├── lib/
        ├── index.css
        ├── main.jsx
        ├── TbDialogueWizard.jsx
        └── TbQuestionnaireWizard.jsx
    ├── .env/
    ├── components.json
    ├── Dockerfile
    ├── jsconfig.json
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
└── server/ # Express + TypeScript backend
    ├── src/
        ├── db.ts
        ├── helper.ts
        └── index.ts
    ├── .env
    ├── Dockerfile
    ├── package.json
    ├── tbq-backend.sql
    └── tsconfig.json
├── docker-compose.yml
├── package.json
└── README.md
```

## はじめに

### 1. このリポジトリをクローンする

```bash
git clone https://github.com/taost6/tb-questionnaire.git
cd tb-questionnaire
```

### 2. コンテナの構築と開始

```bash
docker-compose down -v          # optional: clean existing volumes
docker-compose up --build -d    # build and start in background
```

### Frontend

| Location     | Port | Description              |
| ------------ | ---- | ------------------------ |
| React (Vite) | 4173 | Production web interface |

### Backend

| Location    | Port | Description              |
| ----------- | ---- | ------------------------ |
| Express API | 3000 | Node.js REST API service |

### Database

| Service | Port | Description        |
| ------- | ---- | ------------------ |
| MySQL   | 3306 | MySQL 8 persistent |

#### Default MySQL credentials:

```makefile
Host: mysql
User: root
Password: root123
Database: tbq_backend
```

## サンプル URL

- **患者向け問診票（住所・生年月日を非表示）**  
  [http://localhost:4173/#/questionnaire?options=patients,noaddr,nobirthd](http://localhost:4173/#/questionnaire?options=patients,noaddr,nobirthd)  
  → 保健所に発生届が提出された後、保健所から患者に状況報告依頼をする利用を想定しています。

- **接触者向け（住所を非表示）**  
  [http://localhost:4173/#/questionnaire/?options=contacts,noaddr](http://localhost:4173/#/questionnaire?options=contacts,noaddr)  
  → 患者への接触者へと URL を配布することで、接触者の健康状態等を網羅的かつ迅速に収集することができます。

- **完全モード（オプションなし）**  
  [http://localhost:4173/#/questionnaire](http://localhost:4173/#/questionnaire)  
  → 患者・接触者の別を問わず、柔軟に使用可能なモードです

---

## オプション指定によるカスタマイズ

URL に `options` パラメータを付加することで、問診内容を調整することができます。

### 利用可能なオプション

| オプション | 説明                             |
| ---------- | -------------------------------- |
| `patients` | 患者向け問診表                   |
| `contacts` | 接触者向け問診表                 |
| `noaddr`   | 住所に関する質問項目を非表示     |
| `nobirthd` | 生年月日に関する質問項目を非表示 |
| `nocheck`  | 必須入力バリデーションの無効化   |

※ 複数のオプションはカンマ（`,`）で区切って組み合わせ可能です。  
例：`?options=contacts,noaddr`

---

## ライセンス

このプロジェクトは **BSD 3-Clause License** のもとで公開されています。  
詳細は [LICENSE](https://github.com/taost6/tb-questionnaire/blob/main/LICENSE) をご確認ください。
