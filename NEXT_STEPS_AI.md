# Next Steps: Adding WebLLM for Parquet Query Generation

## Overview
This document outlines the requirements and implementation strategy for integrating WebLLM into the dev-utils project to enable AI-powered parquet query generation while maintaining the project's core philosophy of 100% client-side operation.

## WebLLM Compatibility Assessment

### ✅ Aligns with Dev-Utils Philosophy
- **100% Client-Side**: WebLLM runs entirely in the browser using WebGPU
- **No External Dependencies**: Self-contained with no server communication required
- **No Data Transmission**: All processing happens locally
- **Modern Browser Support**: Requires WebGPU (Chrome 113+, Edge 113+, Firefox with flag)

### Key WebLLM Characteristics
- **Size**: Models range from 1GB-8GB (significant but manageable)
- **Performance**: Hardware-accelerated via WebGPU
- **Memory**: Requires 4-16GB RAM depending on model
- **Storage**: Uses IndexedDB for model caching

## Technical Requirements

### 1. Browser Requirements
```typescript
// WebGPU Detection
const hasWebGPU = 'gpu' in navigator;
if (!hasWebGPU) {
  throw new Error('WebGPU not supported');
}
```

### 2. Memory Requirements
- **Minimum**: 8GB RAM for small models (1-3B parameters)
- **Recommended**: 16GB+ RAM for larger models (7-8B parameters)
- **VRAM**: 2-8GB GPU memory depending on model size

### 3. Storage Requirements
- **Model Cache**: 1-8GB per model in IndexedDB
- **Temporary**: Additional 1-2GB during model loading

## Implementation Strategy

### Phase 1: Basic Integration
```typescript
// src/ai/webllm.ts
import { CreateMLCEngine } from "@mlc-ai/web-llm";

export class ParquetQueryAI {
  private engine: any = null;
  
  async initialize() {
    // Use smallest viable model for query generation
    this.engine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", {
      initProgressCallback: (progress) => {
        console.log(`Loading AI model: ${progress.text}`);
      }
    });
  }
  
  async generateQuery(schema: any, userRequest: string): Promise<string> {
    const prompt = `Given this Parquet schema: ${JSON.stringify(schema)}
    Generate a query filter for: ${userRequest}
    Return only the filter object in JSON format.`;
    
    const response = await this.engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 200
    });
    
    return response.choices[0].message.content;
  }
}
```

### Phase 2: Enhanced Query Builder
```typescript
// Integration with existing parquet viewer
export const enhanceParquetViewer = async () => {
  const ai = new ParquetQueryAI();
  await ai.initialize();
  
  // Add AI query input to parquet.html
  const aiInput = document.createElement('textarea');
  aiInput.placeholder = 'Describe what you want to filter (e.g., "show records where age > 25")';
  
  const generateBtn = document.createElement('button');
  generateBtn.textContent = 'Generate Filter';
  generateBtn.onclick = async () => {
    const schema = await getParquetSchema(); // Extract from loaded file
    const filter = await ai.generateQuery(schema, aiInput.value);
    applyGeneratedFilter(filter);
  };
};
```

## File Structure Changes

```
dev-utils/
├── src/
│   ├── ai/                          # New AI module
│   │   ├── webllm.ts               # WebLLM integration
│   │   └── parquet-query.ts        # Query generation logic
│   ├── parquet/
│   │   ├── query.ts                # Existing query logic
│   │   └── ai-enhanced.ts          # AI-enhanced querying
│   └── parquet-ai.html             # New AI-enhanced parquet viewer
```

## Build System Updates

### Package.json Changes
```json
{
  "dependencies": {
    "@mlc-ai/web-llm": "^0.2.46"
  },
  "scripts": {
    "build:ai": "tsc && cp -r src/ai dist/ && npm run build"
  }
}
```

### TypeScript Config
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "es2020",
    "lib": ["es2020", "dom", "webworker"]
  }
}
```

## User Experience Considerations

### 1. Progressive Enhancement
- Detect WebGPU support before showing AI features
- Graceful fallback to manual query building
- Clear messaging about system requirements

### 2. Loading Experience
```typescript
const showAILoadingState = (progress: any) => {
  const status = document.getElementById('ai-status');
  status.textContent = `Loading AI model: ${progress.text} (${progress.progress}%)`;
};
```

### 3. Memory Management
```typescript
// Unload model when not needed
const cleanup = async () => {
  if (engine) {
    await engine.unload();
    engine = null;
  }
};
```

## Security & Privacy Enhancements

### 1. Model Integrity
- Use official MLC-AI hosted models only
- Verify model checksums if available
- No custom model loading to maintain security

### 2. Data Privacy
- All processing remains local (no change to current philosophy)
- Model cache in IndexedDB (user-controlled)
- No telemetry or usage tracking

## Performance Optimizations

### 1. Model Selection
```typescript
// Choose model based on available resources
const selectOptimalModel = async () => {
  const memory = (navigator as any).deviceMemory || 4;
  
  if (memory >= 16) {
    return "Llama-3.2-3B-Instruct-q4f16_1-MLC"; // Better quality
  } else if (memory >= 8) {
    return "Llama-3.2-1B-Instruct-q4f16_1-MLC"; // Balanced
  } else {
    throw new Error("Insufficient memory for AI features");
  }
};
```

### 2. Lazy Loading
```typescript
// Only load AI when user requests it
const enableAIFeatures = async () => {
  const { ParquetQueryAI } = await import('./ai/webllm.js');
  return new ParquetQueryAI();
};
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Add WebLLM dependency
- [ ] Create basic AI module structure
- [ ] Implement WebGPU detection
- [ ] Add model loading UI

### Week 2: Integration
- [ ] Connect AI to parquet schema extraction
- [ ] Implement query generation logic
- [ ] Add AI controls to parquet viewer
- [ ] Test with sample datasets

### Week 3: Polish
- [ ] Optimize model selection logic
- [ ] Improve error handling
- [ ] Add loading states and progress indicators
- [ ] Performance testing and optimization

### Week 4: Documentation
- [ ] Update README with AI features
- [ ] Add system requirements documentation
- [ ] Create user guide for AI query generation
- [ ] Test deployment process

## Potential Challenges & Solutions

### 1. Model Size
**Challenge**: Large model downloads (1-8GB)
**Solution**: 
- Use smallest viable model (1B parameters)
- Implement progressive model loading
- Cache models in IndexedDB for reuse

### 2. Memory Usage
**Challenge**: High RAM requirements
**Solution**:
- Detect available memory before loading
- Provide clear system requirements
- Implement model unloading when not in use

### 3. Browser Compatibility
**Challenge**: WebGPU not universally supported
**Solution**:
- Feature detection and graceful degradation
- Clear messaging about browser requirements
- Maintain existing manual query functionality

## Success Metrics

1. **Functionality**: AI successfully generates valid parquet filters
2. **Performance**: Model loads in <30 seconds on recommended hardware
3. **Usability**: Users can generate complex queries with natural language
4. **Compatibility**: Works on 80%+ of target browsers (Chrome/Edge 113+)
5. **Philosophy**: Maintains 100% client-side operation

## Conclusion

WebLLM integration is highly compatible with dev-utils' philosophy and would significantly enhance the parquet viewer's capabilities. The main considerations are:

1. **Hardware Requirements**: Need to clearly communicate WebGPU and memory requirements
2. **Progressive Enhancement**: Ensure the tool remains functional without AI features
3. **Model Selection**: Choose the smallest model that provides adequate query generation quality
4. **User Experience**: Provide clear loading states and error handling

The integration would position dev-utils as a cutting-edge, privacy-focused data analysis tool while maintaining its core security and client-side principles.