# 東京国際ツアーズ — STUDIO コンポーネント定義

## 概要

- **デザインコンセプト**: 舞台裏のオーケストレーター
- **情報構造**: デュアル・ゲートウェイ（クラシック BtoC / MICE BtoB の2入り口）
- **トーン**: エレガント・モダン（明朝体 × 洗練された余白）
- **実装ツール**: STUDIO ビジネスプラン
- **CVゴール**: お問い合わせフォーム送信 / 電話での相談依頼

---

## グローバル共通コンポーネント

### Header [sticky, white bg, border-bottom]
  #### Container [max-width: 1200px, flex, space-between, align-center]
    - Box: Logo — 「東京国際ツアーズ」ロゴ画像 (height: 40px)
    - Box: Nav [flex, gap-32]
      - Link: MICE事業
      - Link: クラシック・音楽旅行
      - Link: パッケージ一覧
      - Link: 会社概要
      - Link: お知らせ
    - Box: CTA Button — 「お問い合わせ」[primary, small]

### Footer [dark bg #1a1a1a, white text]
  #### Container [max-width: 1200px, grid 4-col]
    - Box: Logo + キャッチコピー — 「夢と実績をつなぐ、あなたの旅のオーケストレーター」
    - Box: Nav Column 1 — MICE事業 / 事例 / 料金の目安
    - Box: Nav Column 2 — 音楽旅行 / パッケージ一覧 / よくある質問
    - Box: Nav Column 3 — 会社概要 / お知らせ / リクルート / お問い合わせ
  #### Container [max-width: 1200px, flex, space-between, small text]
    - Box: Copyright — 「© 東京国際ツアーズ All Rights Reserved.」
    - Box: Links — 利用規約 / 電子商取引に基く表記 / 標準旅行業約款 / ご旅行条件

---

## Page: TOP

### Section: Hero [full-width, dark overlay on bg-image, min-height: 100vh]
  #### Container [max-width: 1100px, flex-col, center, text-white]
    - Box: Eyebrow — 「創業以来、音楽と企業の夢に伴走してきた旅行のプロ」[serif, letter-spacing]
    - Box: H1 Headline — 「舞台の成功を、<br>裏から支える力。」[serif, 64px]
    - Box: Subtext — 「音楽旅行からMICEまで。東京国際ツアーズは<br>お客様のあらゆる"本番"を成功へと導きます。」[16px]
    - Box: CTA Group [flex, gap-16, mt-40]
      - Button Primary — 「MICE・法人のお客様はこちら」[bg-white, text-dark]
      - Button Secondary — 「音楽・個人のお客様はこちら」[border-white, text-white]
  #### Container [absolute, bottom-0, full-width]
    - Box: Scroll Indicator [center, animated]

### Section: Dual Gateway [white bg, py-80]
  #### Container [max-width: 1200px, grid 2-col, gap-0]
    - Box: Gateway MICE [bg-#1a1a1a, p-64, text-white]
      - Tag: 「BtoB / 法人・団体」[small, serif]
      - H2: 「MICE・インセンティブ<br>旅行のご担当者様へ」
      - Body: 「国際会議・報奨旅行・研修旅行など、複雑なイベント全体をワンストップでプロデュース。企画立案から現地運営まで伴走します。」
      - Stat Group [flex, gap-32, mt-32]
        - Stat: 「売上比率 70%」+ 「主力事業」
        - Stat: 「大手企業」+ 「実績多数」
      - CTA Link — 「MICE事業を詳しく見る →」[underline]
    - Box: Gateway Classic [bg-#f8f5f0, p-64]
      - Tag: 「BtoC / 個人・団体」[small, serif]
      - H2: 「音楽を愛するすべての<br>方へ」
      - Body: 「海外音大レッスン、国際コンクールサポート、演奏旅行手配。音楽に精通したスタッフが、あなたの夢の実現を支えます。」
      - Stat Group [flex, gap-32, mt-32]
        - Stat: 「120+カ国」+ 「渡航実績」
        - Stat: 「楽器輸送」+ 「保険対応」
      - CTA Link — 「音楽旅行・パッケージを見る →」[underline]

### Section: Value Proposition [bg-#f8f5f0, py-80]
  #### Container [max-width: 1100px, text-center, mb-48]
    - Box: H2 — 「なぜ、東京国際ツアーズが選ばれるのか」[serif]
    - Box: Lead — 「クラシック音楽から生まれたホスピタリティと、MICEで培った実行力。その融合が、他にはない価値を生み出します。」
  #### Container [max-width: 1100px, grid 3-col, gap-32]
    - Box: Value Card 1
      - Icon: [品格のアイコン]
      - H3: 「品位あるホスピタリティ」
      - Body: 「一音一音を大切にするクラシック音楽の精神が、すべてのサービスの根底にあります。」
    - Box: Value Card 2
      - Icon: [実行力のアイコン]
      - H3: 「複雑な手配も完遂する実行力」
      - Body: 「楽器輸送・保険手配から国際会議の現地運営まで。ワンストップで最後まで伴走します。」
    - Box: Value Card 3
      - Icon: [ネットワークのアイコン]
      - H3: 「音楽界との強固なネットワーク」
      - Body: 「東京国際芸術協会との連携により、音楽家が本当に必要とする専門サポートを提供できます。」

### Section: Service Overview [white bg, py-80]
  #### Container [max-width: 1100px, text-center, mb-48]
    - Box: H2 — 「サービス一覧」[serif]
  #### Container [max-width: 1100px, grid 4-col, gap-24]
    - Box: Service Card — 「海外音楽大学マスタークラス」[image + title + brief + link]
    - Box: Service Card — 「海外コンクールサポート」[image + title + brief + link]
    - Box: Service Card — 「公演ツアー・演奏旅行」[image + title + brief + link]
    - Box: Service Card — 「MICE・インセンティブ旅行」[image + title + brief + link]
    - Box: Service Card — 「VISIT JAPAN（インバウンド）」[image + title + brief + link]
    - Box: Service Card — 「社員旅行・研修旅行」[image + title + brief + link]
    - Box: Service Card — 「海外歌劇場チケット手配」[image + title + brief + link]
    - Box: Service Card — 「旅行保険・楽器保険」[image + title + brief + link]
  #### Container [max-width: 1100px, text-center, mt-32]
    - Button — 「すべてのパッケージを見る」[secondary, outlined]

### Section: CTA Banner [bg-#1a1a1a, py-80, text-white, text-center]
  #### Container [max-width: 800px]
    - Box: H2 — 「まずはお気軽にご相談ください」[serif]
    - Box: Subtext — 「法人のご担当者様から個人のお客様まで、ご要望に合わせた最適なプランをご提案します。」
    - Box: CTA Group [flex, gap-16, center, mt-40]
      - Button Primary — 「お問い合わせ・無料相談」[bg-white, text-dark]
      - Button Secondary — 「お電話でのご相談 03-XXXX-XXXX」[border-white, text-white]

### Section: News [bg-#f8f5f0, py-64]
  #### Container [max-width: 1100px, flex, space-between, align-center, mb-32]
    - Box: H2 — 「お知らせ」[serif]
    - Box: Link — 「すべて見る →」
  #### Container [max-width: 1100px, grid 3-col, gap-24]
    - Box: News Card [repeat x3] — [date + category tag + title + link]

---

## Page: MICE事業詳細

### Section: Page Hero [full-width, dark bg, py-120]
  #### Container [max-width: 1100px]
    - Box: Breadcrumb — 「TOP > MICE事業」[small, text-gray]
    - Box: Tag — 「BtoB / 法人・団体向け」[serif, small]
    - Box: H1 — 「MICE・インセンティブ旅行<br>完全ワンストップサービス」[serif, 56px, text-white]
    - Box: Lead — 「企画立案から現地運営まで、イベントの全工程を一貫してプロデュース。複雑なリクエストにも対応する専門チームが、あなたのイベントの成功に伴走します。」[text-white]

### Section: What is MICE [white bg, py-80]
  #### Container [max-width: 1100px, grid 2-col, gap-64, align-center]
    - Box: Content Left
      - H2: 「MICEとは」[serif]
      - Body: 「MICE（Meetings / Incentive Travel / Conferences / Exhibitions）とは、企業が主催する会議・研修旅行・報奨旅行・展示会などの総称です。」
      - List: [チェックマーク付き]
        - 「国際会議・学術会議の企画・運営」
        - 「社員表彰・報奨旅行のプランニング」
        - 「研修旅行・チームビルディング旅行」
        - 「展示会・イベント参加サポート」
    - Box: Image Right [aspect-ratio: 4/3, bg-gray placeholder]

### Section: TI Tours Difference [bg-#f8f5f0, py-80]
  #### Container [max-width: 1100px, text-center, mb-48]
    - Box: H2 — 「一般旅行代理店との違い」[serif]
  #### Container [max-width: 1100px]
    - Box: Comparison Table [full-width]
      - Row: Header [bg-#1a1a1a, text-white] — [比較項目 / 一般旅行代理店 / 東京国際ツアーズ]
      - Row: 「対応範囲」— [チケット・宿泊手配のみ / 企画〜現地運営まで一貫]
      - Row: 「専門性」— [汎用的な対応 / 音楽・文化イベントの深い知見]
      - Row: 「伴走体制」— [手配後は自社対応 / 現場まで担当者が同行]
      - Row: 「カスタマイズ」— [パッケージ中心 / 完全オーダーメイド対応]

### Section: MICE Process [white bg, py-80]
  #### Container [max-width: 1100px, text-center, mb-48]
    - Box: H2 — 「ご依頼からイベント当日まで」[serif]
  #### Container [max-width: 1100px, flex, gap-0]
    - Box: Step 1 [flex-1, text-center, border-right]
      - Number: 「01」[serif, large, color-#1a1a1a]
      - H3: 「ヒアリング・企画提案」
      - Body: 「ご要望・ご予算・目的を丁寧にお聞きし、最適なプランをご提案します。」
    - Box: Step 2 [flex-1, text-center, border-right]
      - Number: 「02」
      - H3: 「詳細打ち合わせ・確定」
      - Body: 「スケジュール・宿泊・現地プログラムを詳細に調整します。」
    - Box: Step 3 [flex-1, text-center, border-right]
      - Number: 「03」
      - H3: 「手配・準備」
      - Body: 「渡航・宿泊・会場・機材・通訳など全手配を一括で進めます。」
    - Box: Step 4 [flex-1, text-center]
      - Number: 「04」
      - H3: 「現地運営・添乗」
      - Body: 「担当者が現地に同行し、イベント当日まで責任をもって伴走します。」

### Section: MICE CTA [bg-#1a1a1a, py-80, text-white, text-center]
  #### Container [max-width: 800px]
    - Box: H2 — 「まずはご要件をお聞かせください」[serif]
    - Box: Subtext — 「規模・予算・目的に応じた最適なプランをご提案します。お気軽にお問い合わせください。」
    - Button Primary — 「無料相談・お問い合わせ」[bg-white, text-dark, mt-32]

---

## Page: クラシック・音楽旅行（代理店事業）

### Section: Page Hero [full-width, bg-#f8f5f0, py-120]
  #### Container [max-width: 1100px]
    - Box: Breadcrumb — 「TOP > 音楽旅行・留学サポート」
    - Box: Tag — 「BtoC / 個人・団体向け」[serif, small]
    - Box: H1 — 「音楽の夢を、<br>世界へ届ける。」[serif, 56px]
    - Box: Lead — 「海外音大レッスンから国際コンクールサポート、演奏旅行まで。音楽に精通したスタッフが、あなたの挑戦に伴走します。」

### Section: Services Grid [white bg, py-80]
  #### Container [max-width: 1100px, text-center, mb-48]
    - Box: H2 — 「サービス・パッケージ」[serif]
  #### Container [max-width: 1100px, grid 3-col, gap-32]
    - Box: Service Card — 「海外音楽大学マスタークラス」[image + description + link]
    - Box: Service Card — 「海外コンクールサポート」[image + description + link]
    - Box: Service Card — 「公演ツアー・演奏旅行」[image + description + link]
    - Box: Service Card — 「海外歌劇場チケット手配」[image + description + link]
    - Box: Service Card — 「オンラインレッスン」[image + description + link]
    - Box: Service Card — 「旅行保険・楽器保険」[image + description + link]

### Section: Feature — 楽器輸送・保険 [bg-#f8f5f0, py-80]
  #### Container [max-width: 1100px, grid 2-col, gap-64, align-center]
    - Box: Image Left [aspect-ratio: 4/3]
    - Box: Content Right
      - H2: 「大切な楽器も、安心してお任せください」[serif]
      - Body: 「楽器の国際輸送・保険手配は、音楽を深く理解しているスタッフが担当。大切な楽器を世界中どこへでも安全にお届けします。」
      - List: [チェック付き]
        - 「楽器専用保険の手配」
        - 「国際輸送の通関手続き」
        - 「現地での受取・保管サポート」

### Section: 東京国際芸術協会との連携 [white bg, py-80]
  #### Container [max-width: 1100px, grid 2-col, gap-64, align-center]
    - Box: Content Left
      - H2: 「東京国際芸術協会との強固な連携」[serif]
      - Body: 「長年にわたるパートナーシップにより、音楽家が本当に必要としているネットワークと機会を提供することができます。」
    - Box: Image Right

### Section: Classic CTA [bg-#1a1a1a, py-80, text-white, text-center]
  #### Container [max-width: 800px]
    - Box: H2 — 「あなたの挑戦を、一緒に計画しましょう」[serif]
    - Box: Subtext — 「パッケージの詳細、個別のご相談はお気軽にどうぞ。音楽に精通したスタッフが丁寧にお答えします。」
    - Button Primary — 「お問い合わせ・無料相談」[bg-white, text-dark, mt-32]

---

## Page: パッケージ詳細（CMSテンプレート）

> このページは CMS で8種類展開。以下の構造を共通テンプレートとして使用。

### Section: Page Hero [full-width, dark overlay on bg-image, py-100]
  #### Container [max-width: 1100px, text-white]
    - Box: Breadcrumb — 「TOP > パッケージ一覧 > [パッケージ名]」
    - Box: Category Tag — [カテゴリ名] [serif, small]
    - Box: H1 — [パッケージ名] [serif, 48px]
    - Box: Lead — [パッケージの一文説明]

### Section: Package Overview [white bg, py-80]
  #### Container [max-width: 1100px, grid 2-col, gap-64]
    - Box: Main Content [flex-col]
      - H2: 「このパッケージについて」
      - Body: [詳細説明テキスト CMS入力]
      - H3: 「含まれるサービス」
      - List: [チェック付き CMS入力]
      - H3: 「こんな方におすすめ」
      - List: [チェック付き CMS入力]
    - Box: Sidebar [bg-#f8f5f0, p-32, sticky]
      - H3: 「ご相談・お問い合わせ」[serif]
      - Body: 「詳細はお気軽にお問い合わせください」
      - Button Primary — 「無料相談・お問い合わせ」[full-width]
      - Divider
      - Body: 「お電話でのご相談」
      - Body: 「03-XXXX-XXXX」[large, serif]
      - Body: 「平日 9:00〜18:00」[small, gray]

### Section: Related Packages [bg-#f8f5f0, py-64]
  #### Container [max-width: 1100px, text-center, mb-32]
    - Box: H2 — 「関連するパッケージ」[serif]
  #### Container [max-width: 1100px, grid 3-col, gap-24]
    - Box: Package Card [repeat x3] — [image + title + brief + link]

---

## Page: お問い合わせ / 無料相談

### Section: Page Hero [bg-#f8f5f0, py-80]
  #### Container [max-width: 800px, text-center]
    - Box: H1 — 「お問い合わせ・無料相談」[serif]
    - Box: Lead — 「法人のご担当者様から個人のお客様まで、まずはお気軽にご相談ください。担当スタッフより2営業日以内にご連絡いたします。」

### Section: Contact Form [white bg, py-80]
  #### Container [max-width: 800px]
    - Box: Inquiry Type Select [flex, gap-16, mb-32]
      - Radio Button — 「MICE・法人のご相談」
      - Radio Button — 「音楽旅行・個人のご相談」
      - Radio Button — 「その他」
    - Box: Form Fields
      - Field: 「お名前」[required, text input]
      - Field: 「会社名・団体名」[optional, text input]
      - Field: 「メールアドレス」[required, email input]
      - Field: 「電話番号」[optional, tel input]
      - Field: 「お問い合わせ種別」[required, select]
        - Options: MICE・インセンティブ旅行 / 音楽旅行・留学 / コンクールサポート / チケット手配 / 保険 / その他
      - Field: 「お問い合わせ内容」[required, textarea, min-height: 200px]
      - Field: 「個人情報保護方針への同意」[required, checkbox + link]
    - Box: Submit Button — 「送信する」[primary, full-width, large]

### Section: Phone Contact [bg-#f8f5f0, py-64, text-center]
  #### Container [max-width: 600px]
    - Box: H2 — 「お電話でのご相談」[serif]
    - Box: Phone Number — 「03-XXXX-XXXX」[serif, 48px]
    - Box: Hours — 「受付時間：平日 9:00〜18:00（土日祝休）」[gray]

---

## Page: 会社概要

### Section: Page Hero [bg-#f8f5f0, py-80]
  #### Container [max-width: 1100px]
    - Box: H1 — 「会社概要」[serif]

### Section: Company Info [white bg, py-80]
  #### Container [max-width: 1100px, grid 2-col, gap-64]
    - Box: Company Table
      - Row: 「会社名」— 「株式会社東京国際ツアーズ」
      - Row: 「代表取締役」— 「本村 善人」
      - Row: 「設立」— [設立年]
      - Row: 「所在地」— [住所]
      - Row: 「事業内容」— 「旅行業（企画・手配・添乗）、MICE事業、留学・コンクールコンサルティング」
      - Row: 「登録番号」— [旅行業登録番号]
    - Box: Company Description
      - H2: 「音楽とビジネスをつなぐ、<br>旅のプロフェッショナル」[serif]
      - Body: 「東京国際ツアーズは、クラシック音楽の世界から生まれた旅行代理店です。音楽への深い理解とホスピタリティを原点に、現在はMICE事業においても多くの大手企業様から信頼をいただいています。」

### Section: Brand Story [bg-#f8f5f0, py-80]
  #### Container [max-width: 1100px, text-center, mb-64]
    - Box: H2 — 「ブランドストーリー」[serif]
  #### Container [max-width: 800px]
    - Box: Story Text — [会社のストーリー・沿革テキスト]

### Section: Philosophy [white bg, py-80]
  #### Container [max-width: 1100px, grid 3-col, gap-32]
    - Box: Philosophy Card — 「ミッション」[serif heading + body]
    - Box: Philosophy Card — 「ビジョン」[serif heading + body]
    - Box: Philosophy Card — 「価値観：品位」[serif heading + body]

---

## Page: お知らせ一覧

### Section: Page Hero [bg-#f8f5f0, py-64]
  #### Container [max-width: 1100px]
    - Box: H1 — 「お知らせ」[serif]

### Section: News List [white bg, py-64]
  #### Container [max-width: 900px]
    - Box: Category Filter [flex, gap-8, mb-40]
      - Tag Button: 「すべて」[active state]
      - Tag Button: 「お知らせ」
      - Tag Button: 「イベント」
      - Tag Button: 「メディア掲載」
    - Box: News Item [repeat, border-bottom, py-24] — CMS出力
      - Inline: Date [small, gray] + Category Tag + Title [link, serif]

### Section: Pagination [white bg, pb-80, text-center]
  #### Container [max-width: 900px]
    - Box: Pager [flex, center, gap-8] — [前へ / 1 / 2 / 3 / 次へ]

---

## デザイントークン（STUDIO CSS Variables 参考値）

| Token | Value | 用途 |
|---|---|---|
| `--color-primary` | `#1a1a1a` | メインテキスト・ダーク背景 |
| `--color-accent` | `#8b6f3e` | ゴールド系アクセント |
| `--color-bg-warm` | `#f8f5f0` | セクション背景（暖かみのあるオフホワイト） |
| `--color-white` | `#ffffff` | 白背景 |
| `--font-serif` | `Noto Serif JP, serif` | 見出し・キャッチコピー |
| `--font-sans` | `Noto Sans JP, sans-serif` | 本文・UI |
| `--font-size-h1` | `56-64px` | ページ・セクション主見出し |
| `--font-size-h2` | `36-40px` | セクション見出し |
| `--font-size-h3` | `20-24px` | カード見出し |
| `--font-size-body` | `16px` | 本文 |
| `--spacing-section` | `80px` | セクション上下余白 |
| `--max-width` | `1100-1200px` | コンテナ最大幅 |
| `--border-radius` | `4px` | カード・ボタン角丸 |

---

## STUDIOページ構成マップ

```
/                     → TOP
/mice                 → MICE事業詳細
/classic              → 音楽旅行・代理店事業
/packages             → パッケージ一覧（CMS）
  /packages/masterclass      → 海外音楽大学マスタークラス
  /packages/competition      → 海外コンクールサポート
  /packages/performance-tour → 公演ツアー・演奏旅行
  /packages/visit-japan      → VISIT JAPAN（インバウンド）
  /packages/company-trip     → 社員旅行・研修旅行
  /packages/opera-ticket     → 海外歌劇場チケット手配
  /packages/online-lesson    → オンラインレッスン
  /packages/insurance        → 旅行保険・楽器保険
/contact              → お問い合わせ・無料相談
/about                → 会社概要
/news                 → お知らせ一覧（CMS）
  /news/:slug               → お知らせ詳細（CMS）
/recruit              → リクルートサイト（移植）
/terms                → 利用規約
/tokushoho            → 電子商取引に基く表記
/travel-conditions    → ご旅行条件・標準旅行業約款
```

---

## TOPページ スクロール導線メモ

ユーザーが「MICE or クラシック」のどちらに関心があっても、スクロールしながら自然にCTAへ到達できる縦の導線設計。

```
[Hero]
  ↓ 2つのCTAボタン（MICE / クラシック）でデュアル・ゲートウェイへの初期分岐を提示
[Dual Gateway]
  ↓ 各ゲートウェイのCTAリンクで /mice または /classic へ離脱可能
  ↓ スクロール継続ユーザーは価値訴求へ進む
[Value Proposition]
  ↓ 「なぜ選ばれるか」で信頼醸成。どちらの顧客層にも共通する3つの強みを訴求
[Service Overview]
  ↓ 8サービスカードのグリッドで具体的なサービスを網羅提示
  ↓ 「すべてのパッケージを見る」ボタンで /packages へ誘導
[CTA Banner]
  ↓ 「まずはご相談を」でハードルを下げ、/contact またはTELへの最終CTAを設置
[News]
  ↓ 最新情報で活動実績を補足し、信頼の最終担保として機能
```

**導線の原則**
- MICEユーザー（法人担当者）: Hero CTA → Dual Gateway MICE → /mice → お問い合わせ
- クラシックユーザー（音楽家・個人）: Hero CTA → Dual Gateway Classic → /classic or /packages → お問い合わせ
- どちらか迷うユーザー: 全セクションをスクロール → CTA Banner で受け止める

---

## Page: パッケージ一覧（/packages）

### Section: Page Hero [bg-#f8f5f0, py-80]
  #### Container [max-width: 1100px]
    - Box: Breadcrumb — 「TOP > パッケージ一覧」[small, text-gray]
    - Box: H1 — 「パッケージ一覧」[serif]
    - Box: Lead — 「海外音楽留学から法人向けMICE旅行まで、東京国際ツアーズの全パッケージをご覧ください。」

### Section: Package Filter + Grid [white bg, py-80]
  #### Container [max-width: 1100px]
    - [Box / Flex-row] Category Filter [gap-8, mb-48]
      - Tag Button: 「すべて」[active state, bg-#1a1a1a, text-white]
      - Tag Button: 「BtoC / 音楽旅行」[outlined]
      - Tag Button: 「BtoB / 法人向け」[outlined]
  #### Container [max-width: 1100px]
    - [Grid 4-col, gap-24]
      - Box: Package Card — 「海外音楽大学マスタークラス」[BtoC]
        - Image [aspect-ratio: 4/3, bg-gray placeholder]
        - Category Tag: 「BtoC」[small, serif, color-accent]
        - H3: 「海外音楽大学マスタークラス」
        - Body: 「世界の名教授に直接師事。夢の海外レッスンをプロがサポートします。」[2行, text-gray]
        - CTA Link: 「詳細を見る →」[underline]
      - Box: Package Card — 「海外コンクールサポート」[BtoC]
      - Box: Package Card — 「公演ツアー・演奏旅行」[BtoC]
      - Box: Package Card — 「海外歌劇場チケット手配」[BtoC]
      - Box: Package Card — 「オンラインレッスン」[BtoC]
      - Box: Package Card — 「旅行保険・楽器保険」[BtoC]
      - Box: Package Card — 「VISIT JAPAN（インバウンド）」[BtoB]
      - Box: Package Card — 「社員旅行・研修旅行」[BtoB]

> **STUDIO実装メモ**: カテゴリフィルターはSTUDIOのConditional Show/Hideまたはタブ機能で実装。カードはCMSコレクションと紐付け、`category`フィールドでBtoC/BtoBを判定してフィルタリング。

### Section: CTA Banner [bg-#1a1a1a, py-80, text-white, text-center]
  #### Container [max-width: 800px]
    - Box: H2 — 「ご希望に合わせたプランも承ります」[serif]
    - Box: Subtext — 「一覧にないご要望もお気軽にご相談ください。専門スタッフがオーダーメイドでご提案します。」
    - [Box / Flex-row] CTA Group [gap-16, center, mt-40]
      - Button Primary — 「お問い合わせ・無料相談」[bg-white, text-dark]
      - Button Secondary — 「お電話でのご相談 03-XXXX-XXXX」[border-white, text-white]

---

## Page: お知らせ詳細（/news/:slug）— CMSテンプレート

> このページはSTUDIO CMSのNewsコレクションから動的生成。以下の構造を共通テンプレートとして使用。

### Section: Page Hero [bg-#f8f5f0, py-64]
  #### Container [max-width: 900px]
    - Box: Breadcrumb — 「TOP > お知らせ > [記事タイトル]」[small, text-gray]
    - [Box / Flex-row] Meta [gap-16, align-center, mt-16, mb-16]
      - Box: Date — [公開日] [small, text-gray]
      - Box: Category Tag — [カテゴリ名] [small, bg-#1a1a1a, text-white, px-12, py-4]
    - Box: H1 — [記事タイトル CMS] [serif, 40px]

### Section: Article Body [white bg, py-64]
  #### Container [max-width: 1100px]
    - [Box / Flex-row] Article Layout [gap-64, align-start]
      - Box: Main Content [flex: 1]
        - Box: Featured Image [full-width, aspect-ratio: 16/9, mb-40, bg-gray placeholder]
        - Box: Rich Text Body [CMS入力, line-height: 1.8]
          - 本文テキスト・段落・見出し（H2/H3）・リスト・引用
        - [Box / Flex-row] Share Links [gap-16, mt-48, pt-32, border-top]
          - Label: 「この記事をシェアする」[small, text-gray]
          - Link: X（旧Twitter）
          - Link: Facebook
      - Box: Sidebar [width: 300px, flex-col, gap-32]
        - Box: CTA Card [bg-#f8f5f0, p-32]
          - H3: 「お問い合わせ」[serif]
          - Body: 「詳細はお気軽にご相談ください」[small]
          - Button Primary — 「無料相談・お問い合わせ」[full-width, mt-16]
        - Box: Category List [bg-#f8f5f0, p-32]
          - H3: 「カテゴリ」[serif, mb-16]
          - List: [お知らせ / イベント / メディア掲載] [link, border-bottom, py-8]

### Section: Related News [bg-#f8f5f0, py-64]
  #### Container [max-width: 1100px, mb-32]
    - Box: H2 — 「関連するお知らせ」[serif]
  #### Container [max-width: 1100px]
    - [Grid 3-col, gap-24]
      - Box: News Card [repeat x3] — [date + category tag + title + link]
  #### Container [max-width: 1100px, text-center, mt-32]
    - Link — 「お知らせ一覧に戻る」[outlined button]

---

## Page: リクルート（/recruit）

### Section: Page Hero [full-width, dark overlay on bg-image, min-height: 60vh]
  #### Container [max-width: 1100px, flex-col, center, text-white]
    - Box: Eyebrow — 「JOIN US」[serif, letter-spacing]
    - Box: H1 — 「音楽と旅行を、<br>仕事にしよう。」[serif, 56px]
    - Box: Lead — 「東京国際ツアーズは、音楽を愛し、世界を舞台に挑戦する仲間を募集しています。」[16px, max-width: 600px]

### Section: Company Appeal [bg-#f8f5f0, py-80]
  #### Container [max-width: 1100px, text-center, mb-48]
    - Box: H2 — 「東京国際ツアーズで働く魅力」[serif]
  #### Container [max-width: 1100px]
    - [Grid 3-col, gap-32]
      - Box: Appeal Card 1
        - Icon: [音楽アイコン]
        - H3: 「音楽×旅行の専門知識が身につく」
        - Body: 「クラシック音楽の世界と旅行業の両方に精通したプロフェッショナルとして成長できます。」
      - Box: Appeal Card 2
        - Icon: [グローバルアイコン]
        - H3: 「世界を相手に仕事ができる」
        - Body: 「120以上の国・地域との取引実績。海外の音楽機関・企業との折衝経験を積めます。」
      - Box: Appeal Card 3
        - Icon: [チームアイコン]
        - H3: 「少数精鋭・裁量のある環境」
        - Body: 「1人ひとりが大きな役割を担う少数精鋭のチーム。若手から重要なプロジェクトに関われます。」

### Section: Job Openings [white bg, py-80]
  #### Container [max-width: 1100px, mb-48]
    - Box: H2 — 「募集職種」[serif]
  #### Container [max-width: 1100px]
    - [Box / Flex-col, gap-24]
      - Box: Job Card 1 [border, p-40]
        - [Box / Flex-row, space-between, align-center, mb-16]
          - H3: 「旅行企画・手配スタッフ」[serif]
          - Tag: 「正社員」[bg-#1a1a1a, text-white, small]
        - [Grid 2-col, gap-32]
          - Box: Job Detail Left
            - Label: 「仕事内容」[small, text-gray]
            - Body: 「音楽旅行・MICE旅行の企画立案、手配、添乗業務全般」
          - Box: Job Detail Right
            - Label: 「求めるスキル」[small, text-gray]
            - Body: 「旅行業務取扱管理者資格（歓迎）、音楽・文化への関心」
        - CTA Link — 「この職種に応募する →」[underline, mt-24]
      - Box: Job Card 2 [border, p-40]
        - H3: 「MICE営業・コーディネーター」[serif]
        - Tag: 「正社員」
        - ※同構成（仕事内容・求めるスキル・応募リンク）

> **STUDIO実装メモ**: 募集職種は静的コンテンツ（STUDIO固定テキスト）または CMSコレクション（採用状況が変動する場合）のどちらでも対応可。採用ページとして Jot FormやGoogle Formへの外部リンクで対応する場合は「応募フォームへ」ボタンに変更。

### Section: Recruit CTA [bg-#1a1a1a, py-80, text-white, text-center]
  #### Container [max-width: 800px]
    - Box: H2 — 「まずはカジュアルにお話しましょう」[serif]
    - Box: Subtext — 「「興味はあるけど、まだ迷っている」という方も大歓迎。カジュアル面談からどうぞ。」
    - Button Primary — 「採用についてお問い合わせ」[bg-white, text-dark, mt-32]

---

## Page: 法的テキストページ 共通テンプレート（/terms, /tokushoho, /travel-conditions）

> 3ページ共通の1カラム構成。テキストコンテンツのみ差し替え。

### ページ別タイトル対応表

| URL | H1タイトル | 概要 |
|---|---|---|
| /terms | 利用規約 | サイト利用に関する規約テキスト |
| /tokushoho | 電子商取引に基く表記 | 特定商取引法に基づく表記 |
| /travel-conditions | ご旅行条件・標準旅行業約款 | 旅行業約款・旅行条件書 |

### Section: Page Hero [bg-#f8f5f0, py-64]
  #### Container [max-width: 900px]
    - Box: Breadcrumb — 「TOP > [ページタイトル]」[small, text-gray]
    - Box: H1 — [ページタイトル] [serif]

### Section: Legal Content [white bg, py-80]
  #### Container [max-width: 900px]
    - Box: Last Updated — 「最終更新日：[日付]」[small, text-gray, mb-48]
    - Box: Rich Text Body [CMS or 静的テキスト入力]
      - H2: 各章見出し [serif, mb-16]
      - Body: 本文テキスト [line-height: 1.8]
      - H3: 小見出し（必要に応じて）
      - Box: 特定商取引法ページのみ → Definition Table [2-col, border]
        - Row: 「販売業者」— 「株式会社東京国際ツアーズ」
        - Row: 「代表者名」— 「本村 善人」
        - Row: 「所在地」— [住所]
        - Row: 「電話番号」— 「03-XXXX-XXXX」
        - Row: 「メールアドレス」— [メールアドレス]
        - Row: 「営業時間」— 「平日 9:00〜18:00（土日祝休）」
        - Row: 「料金」— 「各パッケージページ・お見積りによる」
        - Row: 「お支払い方法」— 「銀行振込・クレジットカード」
        - Row: 「キャンセル・返金」— 「旅行業約款に準ずる」
    - Box: Back Link [mt-64]
      - Link — 「← TOPに戻る」

---

## Studio「箱の構造」アノテーション補足

### 記法チートシート

STUDIOの実装単位に対応した構造記法の一覧。

```
[Section]
  — Studioの「行」（Row）に相当する独立した縦方向ブロック
  — 背景色・padding はセクション単位で設定

  [Container]
    — max-width + 中央寄せ（margin: 0 auto）のラッパー
    — コンテンツの横幅制約はここで行う
    — 標準値: max-width 1100px または 1200px

    [Box / Flex-row]
      — 子要素を横並びに配置（display: flex; flex-direction: row）
      — gap, align-items, justify-content で間隔・揃えを制御

    [Box / Flex-col]
      — 子要素を縦積みに配置（display: flex; flex-direction: column）

    [Grid 2-col]
      — display: grid; grid-template-columns: 1fr 1fr
      — タブレット以下では 1カラムにスタック

    [Grid 3-col]
      — display: grid; grid-template-columns: repeat(3, 1fr)
      — タブレット: 2カラム / モバイル: 1カラム

    [Grid 4-col]
      — display: grid; grid-template-columns: repeat(4, 1fr)
      — タブレット: 2カラム / モバイル: 1カラム
```

### ページ別レイアウト構造サマリー

| ページ | 主要レイアウトパターン |
|---|---|
| TOP（/） | Flex-col Hero → Grid 2-col Gateway → Grid 3-col Values → Grid 4-col Services |
| MICE（/mice） | Flex-col Hero → Grid 2-col → Table → Flex-row Steps → Dark CTA |
| クラシック（/classic） | Flex-col Hero → Grid 3-col Services → Grid 2-col Feature × 2 → Dark CTA |
| パッケージ一覧（/packages） | Flex-col Hero → Flex-row Filter → Grid 4-col Cards → Dark CTA |
| パッケージ詳細（/packages/:slug） | Flex-col Hero → Grid 2-col（Main + Sidebar） → Grid 3-col Related |
| お問い合わせ（/contact） | Flex-col Hero → Flex-col Form（max-width 800px） → Flex-col Phone |
| 会社概要（/about） | Flex-col Hero → Grid 2-col Info → Flex-col Story → Grid 3-col Philosophy |
| お知らせ一覧（/news） | Flex-col Hero → Flex-col List → Flex-row Pager |
| お知らせ詳細（/news/:slug） | Flex-col Hero → Flex-row（Main + Sidebar） → Grid 3-col Related |
| リクルート（/recruit） | Flex-col Hero → Grid 3-col Appeals → Flex-col Jobs → Dark CTA |
| 法的ページ（/terms 等） | Flex-col Hero → Flex-col Text Body（max-width 900px） |

### レスポンシブ対応メモ

```
ブレークポイント（STUDIO標準に準拠）:
  PC     : 1024px 以上 → Grid 3-col / Grid 4-col フル表示
  Tablet : 768px〜1023px → Grid 3-col → 2-col / Grid 4-col → 2-col
  Mobile : 767px 以下 → すべて 1-col スタック / Flex-row → Flex-col

例外:
  Dual Gateway（Grid 2-col）: タブレットでも 2-col を維持し、モバイルのみ縦積み
  Header Nav: モバイルでハンバーガーメニューに切り替え
  Package Detail Sidebar: モバイルでは本文下に移動
```
