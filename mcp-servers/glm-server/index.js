#!/usr/bin/env node

/**
 * GLM 4.7 MCP Server
 * Claude Code'a GLM 4.7 entegrasyonu sağlar
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// GLM API Configuration
const GLM_API_BASE = process.env.GLM_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';
const GLM_API_KEY = process.env.GLM_API_KEY || '';
const GLM_MODEL = process.env.GLM_MODEL || 'glm-4-plus';

/**
 * Call GLM 4.7 API
 */
async function callGLM(prompt, options = {}) {
  const {
    temperature = 0.7,
    maxTokens = 4000,
    systemPrompt = 'Sen yardımcı bir AI asistanısın.'
  } = options;

  if (!GLM_API_KEY) {
    throw new Error('GLM_API_KEY environment variable is not set');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  try {
    const response = await fetch(`${GLM_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_API_KEY}`
      },
      body: JSON.stringify({
        model: GLM_MODEL,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GLM API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from GLM API');
    }

    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  } catch (error) {
    console.error('GLM API Error:', error);
    throw error;
  }
}

/**
 * Create and configure MCP server
 */
const server = new Server(
  {
    name: 'glm-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool: ask_glm
 * Sends a prompt to GLM 4.7 and returns the response
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ask_glm',
        description: 'GLM 4.7 modeline soru sor veya görev ver. Özellikle kod yazma, Çince işleme, terminal komutları için güçlüdür. Claude kotası dolduğunda veya GLM\'in özel yeteneklerinden faydalanmak istediğinizde kullan.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'GLM\'e gönderilecek soru veya görev'
            },
            temperature: {
              type: 'number',
              description: 'Yaratıcılık seviyesi (0-1, varsayılan: 0.7)',
              minimum: 0,
              maximum: 1,
              default: 0.7
            },
            systemPrompt: {
              type: 'string',
              description: 'Sistem prompt\'u (opsiyonel, GLM\'in rolünü tanımlar)',
              default: 'Sen yardımcı bir AI asistanısın.'
            }
          },
          required: ['prompt']
        }
      },
      {
        name: 'ask_glm_code',
        description: 'GLM 4.7\'yi özellikle kod yazma, analiz etme veya debug için kullan. GLM kod görevlerinde çok başarılıdır.',
        inputSchema: {
          type: 'object',
          properties: {
            task: {
              type: 'string',
              description: 'Kod ile ilgili görev (örn: "Bu fonksiyonu optimize et", "Test yaz")'
            },
            code: {
              type: 'string',
              description: 'Üzerinde çalışılacak kod (opsiyonel)'
            },
            language: {
              type: 'string',
              description: 'Programlama dili (örn: javascript, python)',
              default: 'javascript'
            }
          },
          required: ['task']
        }
      }
    ]
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'ask_glm') {
      const { prompt, temperature, systemPrompt } = args;

      const result = await callGLM(prompt, {
        temperature: temperature || 0.7,
        systemPrompt: systemPrompt || 'Sen yardımcı bir AI asistanısın.'
      });

      return {
        content: [
          {
            type: 'text',
            text: `**GLM 4.7 Yanıtı:**\n\n${result.content}\n\n---\n*Model: ${result.model} | Tokens: ${result.usage?.total_tokens || 'N/A'}*`
          }
        ]
      };
    }

    if (name === 'ask_glm_code') {
      const { task, code, language } = args;

      let fullPrompt = `Görev: ${task}\n\n`;

      if (code) {
        fullPrompt += `Kod (${language || 'javascript'}):\n\`\`\`${language || 'javascript'}\n${code}\n\`\`\`\n\n`;
      }

      fullPrompt += 'Lütfen detaylı ve açıklayıcı bir şekilde yardım et.';

      const result = await callGLM(fullPrompt, {
        temperature: 0.5, // Kod için daha düşük temperature
        systemPrompt: `Sen uzman bir yazılım geliştiricisisin. ${language || 'JavaScript'} konusunda çok deneyimlisin. Kod yazarken best practices kullanırsın.`
      });

      return {
        content: [
          {
            type: 'text',
            text: `**GLM 4.7 Kod Asistanı:**\n\n${result.content}\n\n---\n*Model: ${result.model} | Tokens: ${result.usage?.total_tokens || 'N/A'}*`
          }
        ]
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Hata: ${error.message}\n\nGLM API anahtarınızı kontrol edin veya API durumunu inceleyin.`
        }
      ],
      isError: true
    };
  }
});

/**
 * Start server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GLM MCP Server started successfully');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
