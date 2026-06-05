# 🧠 PropertyPulse — AI System Diagrams

> رسومات بصرية لنظام الـ AI. بتتعرض مباشرة في VSCode (Markdown Preview) و GitHub.
> لو مش ظاهرة في VSCode، ثبّت إضافة **"Markdown Preview Mermaid Support"**.

---

## 1) المعمارية بالطبقات (Layers)

```mermaid
flowchart TB
    subgraph CLIENT["📱 العميل (web / mobile)"]
        UI["Views → ViewModels → API Services"]
    end

    subgraph SERVER["⚙️ السيرفر (Express)"]
        direction TB
        ROUTES["Routes → Controllers"]
        SERVICES["Services<br/>(report · analysis · chat)"]

        subgraph AI["🤖 طبقة الـ AI"]
            direction TB
            AGENTS["👥 Agents<br/>orchestrator + 5 agents"]
            LLM["🧠 LLM<br/>geminiClient + prompts"]
            RAG["📚 RAG<br/>retriever + embeddings + vectorStore"]
        end
    end

    subgraph EXT["☁️ خدمات خارجية"]
        GEMINI["Gemini API<br/>(توليد + embeddings)"]
        DB[("Supabase<br/>Postgres + pgvector")]
    end

    CORE["📦 ai-core<br/>(العقود: LlmClient · Retriever · types)"]

    UI -->|HTTP /api| ROUTES
    ROUTES --> SERVICES
    SERVICES --> AGENTS
    AGENTS --> LLM
    AGENTS --> RAG
    LLM -->|implements| CORE
    RAG -->|implements| CORE
    LLM --> GEMINI
    RAG --> GEMINI
    RAG --> DB
    SERVICES --> DB

    style AI fill:#eef5ff,stroke:#1f4e78
    style CORE fill:#fff5e6,stroke:#d97706
    style EXT fill:#f0fdf4,stroke:#16a34a
```

---

## 2) خط توليد التقرير (Report Pipeline) — القلب ⭐

```mermaid
flowchart TB
    START(["📩 POST /api/reports<br/>propertyId + assumptions"]) --> SVC["report.service.generate()"]
    SVC --> ORCH["🎯 orchestrator<br/>runAnalysisPipeline()"]

    ORCH --> A1["① dataCollectorAgent<br/>تحقّق: سعر + مدينة ✅"]
    A1 --> A2["② marketDataAgent<br/>جمع سياق السوق"]
    A2 --> A3["③ calculationAgent<br/>🔢 احسب المؤشرات (حتمي)"]
    A3 --> A4["④ reportGeneratorAgent<br/>✍️ ولّد السرد + المخاطر"]
    A4 --> SAVE[("💾 reportRepository.create()")]
    SAVE --> END(["📄 InvestmentReport"])

    A2 -.RAG.-> RET["retriever.retrieve()"]
    A2 -.DB.-> TRENDS["marketRepository<br/>trends + neighborhood"]
    A3 -.shared-utils.-> CALC["computeInvestmentMetrics()"]
    A4 -.LLM.-> GEN["geminiClient.generateJSON() × 2"]

    style A3 fill:#fef3c7,stroke:#d97706
    style A4 fill:#dbeafe,stroke:#1f4e78
    style ORCH fill:#ede9fe,stroke:#7c3aed
```

> 🔑 **القاعدة الذهبية:** الخطوة ③ (المحاسب) بتحسب الأرقام بالكود.
> الخطوة ④ (الكاتب/LLM) بتشرح بس وما تخترعش أرقام.

---

## 3) إزاي الـ RAG شغّال (البحث الدلالي) 📚

```mermaid
flowchart LR
    subgraph INGEST["📥 الإدخال (مرة واحدة)"]
        direction TB
        DOC["مستند طويل"] --> CHUNK["chunking.ts<br/>قصّ لمقاطع"]
        CHUNK --> EMB1["embeddings.ts<br/>كل مقطع → أرقام"]
        EMB1 --> STORE["vectorStore.ts<br/>احفظ في DB"]
    end

    subgraph QUERY["🔍 الاسترجاع (وقت السؤال)"]
        direction TB
        Q["سؤال المستخدم"] --> EMB2["embedText()<br/>السؤال → أرقام"]
        EMB2 --> MATCH["match_rag_chunks()<br/>بحث تشابه cosine"]
        MATCH --> CTX["سياق مرقّم<br/>[1] [2] [3]..."]
    end

    STORE --> DBV[("🗄️ pgvector<br/>rag_chunks")]
    DBV --> MATCH
    CTX --> LLM2["🧠 يُحقَن في الـ prompt"]

    style INGEST fill:#f0fdf4,stroke:#16a34a
    style QUERY fill:#eef5ff,stroke:#1f4e78
```

---

## 4) مسار المحادثة (Chat / Q&A) 💬

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 المستخدم
    participant C as chat.controller
    participant R as retriever
    participant V as pgvector (DB)
    participant G as geminiClient → Gemini

    U->>C: POST /api/chat { question }
    C->>R: retrieve(question, 6)
    R->>G: embed(question)
    G-->>R: متجه أرقام
    R->>V: match_rag_chunks(متجه)
    V-->>R: أقرب 6 مقاطع
    R-->>C: { context, sources }
    C->>G: generate(qaPrompt + context)
    G-->>C: الإجابة
    C-->>U: { answer, sources }
```

---

## 5) خريطة الملفات → الطبقات

```mermaid
flowchart TB
    subgraph L0["📦 ai-core (العقود)"]
        C1["LlmClient.ts"]
        C2["Retriever.ts"]
        C3["types · Agent · promptTemplate"]
    end

    subgraph L1["🧠 LLM"]
        G1["geminiClient.ts ⭐"]
        G2["prompts/<br/>qa · risk · report · comparison"]
    end

    subgraph L2["📚 RAG"]
        R1["embeddings.ts"]
        R2["chunking.ts"]
        R3["vectorStore.ts"]
        R4["retriever.ts ⭐"]
        R5["ingestion.ts"]
    end

    subgraph L3["👥 Agents"]
        AG0["orchestrator.ts 🎯"]
        AG1["dataCollector"]
        AG2["marketData"]
        AG3["calculation 🔢"]
        AG4["reportGenerator ✍️"]
        AG5["monitoring 🔔"]
    end

    G1 -.implements.-> C1
    R4 -.implements.-> C2
    AG0 --> AG1 --> AG2 --> AG3 --> AG4
    AG2 --> R4
    AG4 --> G1
    G1 --> G2
    R4 --> R1 & R3
    R5 --> R2 & R1 & R3

    style L0 fill:#fff5e6,stroke:#d97706
    style L1 fill:#dbeafe,stroke:#1f4e78
    style L2 fill:#f0fdf4,stroke:#16a34a
    style L3 fill:#ede9fe,stroke:#7c3aed
```

---

## 🎨 دليل الألوان

| اللون | الطبقة |
|------|--------|
| 🟠 برتقالي | `ai-core` — العقود المجرّدة |
| 🔵 أزرق | طبقة الـ LLM (التوليد) |
| 🟢 أخضر | طبقة الـ RAG (المعرفة) |
| 🟣 بنفسجي | طبقة الـ Agents (التنسيق) |
| 🟡 أصفر | الحسابات الحتمية (مش من الـ LLM) |
