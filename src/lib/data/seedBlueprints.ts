import { ImplementationBlueprint } from "@/types/blueprint";

export const seedBlueprints: ImplementationBlueprint[] = [
  {
    id: "1",
    title: "カスタマーサービス用チャットボットの実装",
    description: "日本企業向けのカスタマーサービスチャットボットを構築する完全ガイド。日本語対応、敬語処理、カスタマイズ可能な対応フローを含みます。",
    difficulty: "intermediate",
    category: "chatbot",
    programmingLanguages: ["javascript", "typescript", "python"],
    estimatedTime: 8, // hours
    prerequisites: [
      {
        id: "p1",
        title: "ウェブ開発の基本知識",
        description: "HTML、CSS、JavaScriptの基本的な理解が必要です。"
      },
      {
        id: "p2",
        title: "自然言語処理の基礎",
        description: "基本的なNLPの概念と用語の理解があると役立ちます。"
      }
    ],
    steps: [
      {
        id: "s1",
        order: 1,
        title: "プロジェクトのセットアップ",
        description: "必要なライブラリとツールをインストールし、プロジェクト構造を設定します。",
        codeBlock: {
          language: "bash",
          code: "npm init -y\nnpm install express dotenv openai langchain"
        }
      },
      {
        id: "s2",
        order: 2,
        title: "対話フローの設計",
        description: "日本の顧客サービス標準に合わせた対話フローを設計します。",
        images: ["/images/blueprints/chatbot-flow-diagram.png"]
      },
      {
        id: "s3",
        order: 3,
        title: "日本語処理モデルの設定",
        description: "日本語を効果的に処理するための言語モデルを設定します。",
        codeBlock: {
          language: "javascript",
          code: "const { OpenAI } = require('langchain/llms/openai');\n\nconst model = new OpenAI({\n  modelName: 'gpt-4',\n  temperature: 0.1,\n  systemMessage: '敬語で丁寧に応答してください。あなたは[会社名]のカスタマーサポートです。'\n});"
        }
      }
    ],
    resources: [
      {
        id: "r1",
        title: "LangChain ドキュメント",
        url: "https://js.langchain.com/docs/",
        type: "documentation",
        description: "LangChainのJavaScript/TypeScript実装に関する詳細なドキュメント"
      },
      {
        id: "r2",
        title: "日本語NLP リソース",
        url: "https://github.com/japanese-nlp-resources",
        type: "github",
        description: "日本語NLPのためのオープンソースリソースとツールのコレクション"
      }
    ],
    japaneseContext: {
      culturalConsiderations: "日本では、顧客サービスの敬語の使用と丁寧さが非常に重要です。チャットボットは適切な敬語レベルと謝罪の表現を使用する必要があります。",
      regulatoryNotes: "個人情報保護法（APPI）に準拠し、ユーザーデータの処理と保存に関するガイドラインに従ってください。",
      localMarketAdaptation: "多くの日本の顧客は人間のような応答を好むため、チャットボットが機械的に感じられないようにすることが重要です。また、モバイルでの使用に最適化することも重要です。",
      successExamples: "楽天、ソフトバンク、およびUNIQLOは、パーソナライズされた買い物体験と効率的なサポートのためにAIチャットボットを成功裏に実装しています。"
    },
    author: {
      id: "a1",
      name: "鈴木健太"
    },
    createdAt: "2023-09-15T08:30:00Z",
    updatedAt: "2023-10-02T14:15:00Z",
    rating: 4.8,
    ratingCount: 24,
    viewCount: 1250,
    published: true
  },
  {
    id: "2",
    title: "ECサイト向け商品レコメンデーションエンジン",
    description: "日本のECサイト向けにAIを活用した商品レコメンデーションシステムを構築するための包括的ガイド。",
    difficulty: "advanced",
    category: "recommendation-system",
    programmingLanguages: ["python", "javascript"],
    estimatedTime: 12,
    prerequisites: [
      {
        id: "p1",
        title: "機械学習の基礎知識",
        description: "基本的な機械学習アルゴリズムとコンセプトの理解"
      },
      {
        id: "p2",
        title: "Pythonプログラミング",
        description: "Pythonでのデータ処理とモデル構築の経験"
      }
    ],
    steps: [
      {
        id: "s1",
        order: 1,
        title: "データ準備とEDA",
        description: "ユーザー行動データと製品データを収集し、探索的データ分析を行います。",
        codeBlock: {
          language: "python",
          code: "import pandas as pd\nimport matplotlib.pyplot as plt\n\n# ユーザー行動データの読み込み\nuser_data = pd.read_csv('user_behaviors.csv')\n\n# 基本的な統計を確認\nprint(user_data.describe())\n\n# 購入パターンの可視化\nplt.figure(figsize=(10, 6))\nuser_data.groupby('product_category')['purchase_count'].sum().sort_values(ascending=False).plot(kind='bar')\nplt.title('カテゴリー別購入数')\nplt.tight_layout()\nplt.show()"
        }
      },
      {
        id: "s2",
        order: 2,
        title: "協調フィルタリングモデルの構築",
        description: "ユーザーの行動パターンに基づく協調フィルタリングモデルを実装します。",
        codeBlock: {
          language: "python",
          code: "from surprise import Dataset, Reader, SVD\nfrom surprise.model_selection import train_test_split\n\n# データセットの準備\nreader = Reader(rating_scale=(1, 5))\ndataset = Dataset.load_from_df(ratings_df[['user_id', 'item_id', 'rating']], reader)\n\n# トレーニングセットとテストセットの分割\ntrainset, testset = train_test_split(dataset, test_size=0.25)\n\n# SVDモデルのトレーニング\nmodel = SVD(n_factors=100, n_epochs=20, lr_all=0.005, reg_all=0.02)\nmodel.fit(trainset)\n\n# モデルの評価\npredictions = model.test(testset)\naccuracy.rmse(predictions)"
        }
      }
    ],
    resources: [
      {
        id: "r1",
        title: "Surprise ライブラリドキュメント",
        url: "https://surprise.readthedocs.io/",
        type: "documentation",
        description: "Pythonのレコメンデーションシステム構築のためのSurpriseライブラリの公式ドキュメント"
      },
      {
        id: "r2",
        title: "日本のECサイトにおけるレコメンデーションシステム事例研究",
        url: "https://www.example.com/jp-ecommerce-recommendation",
        type: "article",
        description: "日本市場特有のレコメンデーションシステムの実装事例と成功要因の分析"
      }
    ],
    japaneseContext: {
      culturalConsiderations: "日本の消費者は季節性商品と限定商品に高い関心を示します。また、ギフト文化が強いため、贈答用商品のレコメンデーションも重要です。",
      regulatoryNotes: "個人情報保護法（APPI）に準拠し、ユーザープロファイリングについて透明性を確保する必要があります。オプトアウトメカニズムも提供すべきです。",
      localMarketAdaptation: "日本では、特に若年層を中心にモバイルECの利用率が非常に高いため、モバイルフレンドリーなレコメンデーション表示を最適化する必要があります。",
      successExamples: "日本のAmazon、楽天、ZOZOTOWNなどは、パーソナライズされたレコメンデーションシステムにより、ユーザーあたりの購入数とセッション時間を大幅に向上させています。"
    },
    author: {
      id: "a2",
      name: "佐藤美咲"
    },
    createdAt: "2023-08-20T10:15:00Z",
    updatedAt: "2023-10-05T09:30:00Z",
    rating: 4.6,
    ratingCount: 18,
    viewCount: 980,
    published: true
  },
  {
    id: "3",
    title: "日本語対応AI文書要約システム",
    description: "日本語テキスト文書を効率的に要約するAIシステムを構築するためのガイド。ビジネス文書や法律文書に特化したモデル調整を含みます。",
    difficulty: "beginner",
    category: "nlp",
    programmingLanguages: ["python"],
    estimatedTime: 5,
    prerequisites: [
      {
        id: "p1",
        title: "基本的なPython知識",
        description: "Pythonの基本的な構文と機能の理解"
      }
    ],
    steps: [
      {
        id: "s1",
        order: 1,
        title: "環境のセットアップ",
        description: "必要なライブラリとツールをインストールし、プロジェクト環境を準備します。",
        codeBlock: {
          language: "bash",
          code: "pip install transformers datasets torch sentencepiece"
        }
      },
      {
        id: "s2",
        order: 2,
        title: "事前訓練済みモデルの読み込み",
        description: "日本語に対応した事前訓練済みの要約モデルをロードします。",
        codeBlock: {
          language: "python",
          code: "from transformers import AutoModelForSeq2SeqLM, AutoTokenizer\n\n# 日本語対応の要約モデルをロード\nmodel_name = \"kumapo/t5-japanese-summarization\"\ntokenizer = AutoTokenizer.from_pretrained(model_name)\nmodel = AutoModelForSeq2SeqLM.from_pretrained(model_name)"
        }
      },
      {
        id: "s3",
        order: 3,
        title: "要約関数の実装",
        description: "日本語テキストを受け取り、要約を生成する関数を実装します。",
        codeBlock: {
          language: "python",
          code: "def summarize_japanese_text(text, max_length=150, min_length=40):\n    inputs = tokenizer(text, return_tensors=\"pt\", max_length=1024, truncation=True)\n    summary_ids = model.generate(\n        inputs[\"input_ids\"],\n        max_length=max_length,\n        min_length=min_length,\n        length_penalty=2.0,\n        num_beams=4,\n        early_stopping=True\n    )\n    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)\n    return summary\n\n# 使用例\ntext = \"\"\"日本政府は、新型コロナウイルス感染症（COVID-19）の拡大防止策として、全国の小中学校および高等学校に対して臨時休校を要請しました。この措置は3月2日から春休みまで続く予定です。また、大規模なイベントの中止や延期も要請されています。専門家によると、今後2週間が感染拡大を抑制するための重要な期間であるとされています。政府は国民に対して、不要不急の外出を避け、手洗いやマスク着用などの基本的な感染予防策を徹底するよう呼びかけています。\"\"\"\n\nsummary = summarize_japanese_text(text)\nprint(summary)"
        }
      }
    ],
    resources: [
      {
        id: "r1",
        title: "Hugging Face 日本語モデル",
        url: "https://huggingface.co/models?filter=ja",
        type: "tool",
        description: "日本語処理に特化した各種事前訓練済みモデルのコレクション"
      },
      {
        id: "r2",
        title: "日本語NLPの評価ベンチマーク",
        url: "https://github.com/climate-tech-handbook/japanese-nlp-benchmarks",
        type: "github",
        description: "日本語自然言語処理タスク向けの評価データセットとベンチマーク結果"
      }
    ],
    japaneseContext: {
      culturalConsiderations: "日本語は敬語や文脈に依存する表現が多く、要約システムはこれらのニュアンスを保持する必要があります。また、ビジネス文書では特に敬語の適切な維持が重要です。",
      regulatoryNotes: "要約対象の文書に著作権がある場合は、著作権法に基づく適切な取り扱いが必要です。また、要約結果を公開する場合は出典を明記すべきです。",
      localMarketAdaptation: "法律文書、ビジネスレポート、学術論文など、特定の分野に特化した要約モデルへの需要が高まっています。分野特化型のファインチューニングを検討してください。",
      successExamples: "みずほ銀行は内部資料の要約システムを導入し、資料作成時間を40%削減。また、法律事務所のNishimura & Asahiは契約書要約AIを導入し、法務レビュー効率を大幅に向上させています。"
    },
    author: {
      id: "a3",
      name: "田中洋子"
    },
    createdAt: "2023-09-05T11:20:00Z",
    updatedAt: "2023-09-28T16:45:00Z",
    rating: 4.9,
    ratingCount: 32,
    viewCount: 1560,
    published: true
  }
];

// Function to get all blueprints
export function getAllBlueprints() {
  return seedBlueprints;
}

// Function to get a blueprint by ID
export function getBlueprintById(id: string) {
  return seedBlueprints.find(blueprint => blueprint.id === id);
}

// Function to get published blueprints
export function getPublishedBlueprints() {
  return seedBlueprints.filter(blueprint => blueprint.published);
}

// Function to get top rated blueprints
export function getTopRatedBlueprints(limit: number = 3) {
  return seedBlueprints
    .filter(blueprint => blueprint.published)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
} 