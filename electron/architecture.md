# Application Architecture

## Component Diagram

```mermaid
graph TD
    subgraph RendererProcess[Renderer Process]
        A[Home Component] -->|IPC| B[Preload Bridge]
    end

    subgraph MainProcess[Main Process]
        B --> C[WordsIPC Handler]
        C --> D[AI Service Manager]

        subgraph Services[AI Services]
            D --> E[Kimi Service]
            D --> F[OpenAI Service]
            D --> G[Claude Service]
            D --> H[Qwen Service]
            D --> I[DeepSeek Service]
            D --> J[Gemini Service]
        end

        subgraph Adapters[Adapters]
            E --> K[Kimi Adapter]
        end
    end

    subgraph WebViewLayer[WebView Layer]
        K --> L[Kimi WebView]
    end

    style RendererProcess fill:#f9f,stroke:#333
    style MainProcess fill:#bbf,stroke:#333
    style WebViewLayer fill:#bfb,stroke:#333
```

## Description

This architecture follows a layered approach:

1. **Renderer Process Layer**: Contains the UI components like the Home component which sends messages via IPC
2. **IPC Layer**: Handles inter-process communication between renderer and main processes
3. **Service Management Layer**: AI Service Manager coordinates all AI services
4. **Service Abstraction Layer**: Individual AI services providing a unified interface
5. **Adapter Layer**: Specific adapters for each AI service (example: Kimi Adapter)
6. **WebView Layer**: Actual web views where AI services run

The design encapsulates adapters within services so that consumers only interact with a unified service interface without knowing about the underlying adapter implementation.