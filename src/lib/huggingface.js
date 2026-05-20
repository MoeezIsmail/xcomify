// Auto-detects provider from token prefix:
//   hf_...  → HuggingFace (free, models hosted by HF)
//   gsk_... → Groq (free, fast, recommended)

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

// HuggingFace models hosted on their own servers (hf-inference provider)
const HF_MODELS = [
  'HuggingFaceH4/zephyr-7b-beta',
  'meta-llama/Llama-3.2-3B-Instruct',
  'microsoft/Phi-3.5-mini-instruct',
]

function getProvider(token) {
  if (!token) return null
  if (token.startsWith('gsk_')) return 'groq'
  return 'huggingface'
}

function hfUrl(model) {
  return `https://router.huggingface.co/hf-inference/models/${model}/v1/chat/completions`
}

export { GROQ_MODEL, HF_MODELS, getProvider }
export const HF_URL = hfUrl(HF_MODELS[0])

async function callGroq(token, systemPrompt, userPrompt, maxTokens, temperature) {
  console.log('[AI] Provider: Groq | Model:', GROQ_MODEL)

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  })

  console.log('[AI] Groq HTTP:', res.status)
  const data = await res.json().catch(() => ({}))
  console.log('[AI] Groq response:', data)

  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid Groq token. Check it at console.groq.com/keys')
    if (res.status === 429) throw new Error('Groq rate limit reached. Wait a minute and retry.')
    throw new Error(data?.error?.message || `Groq API error ${res.status}`)
  }

  const text = data?.choices?.[0]?.message?.content
  if (text) return text.trim()
  throw new Error('Groq returned empty response')
}

async function callHuggingFace(token, systemPrompt, userPrompt, maxTokens, temperature) {
  for (const model of HF_MODELS) {
    const url = hfUrl(model)
    console.log('[AI] Provider: HuggingFace | Model:', model)

    let res, data
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: maxTokens,
          temperature,
          stream: false,
        }),
      })
    } catch (netErr) {
      throw new Error(`Network error: ${netErr.message}. Try a VPN or use a Groq token instead.`)
    }

    console.log('[AI] HF HTTP:', res.status)
    data = await res.json().catch(() => ({}))
    console.log('[AI] HF response:', data)

    if (res.status === 200 && data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim()
    }
    if (res.status === 503 || data?.error?.toLowerCase?.().includes('loading')) {
      throw new Error('MODEL_LOADING')
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error('Token rejected (401/403). Get a new token at huggingface.co/settings/tokens')
    }
    // "model not supported" → try next model in list
    if (data?.error?.toLowerCase?.().includes('not supported')) {
      console.warn('[AI] Model not supported, trying next:', model)
      continue
    }
    // Any other error → throw immediately
    throw new Error(data?.error || `HuggingFace error ${res.status}`)
  }

  throw new Error('No HuggingFace model available for hf-inference. Consider using a Groq token instead.')
}

export async function callHF(token, systemPrompt, userPrompt, maxTokens = 600, temperature = 0.7) {
  if (!token) throw new Error('AI token not set. Go to Settings → AI Integration.')

  const provider = getProvider(token)
  if (provider === 'groq') return callGroq(token, systemPrompt, userPrompt, maxTokens, temperature)
  return callHuggingFace(token, systemPrompt, userPrompt, maxTokens, temperature)
}

export async function testHFConnection(token) {
  const result = { token: null, provider: null, url: null, status: null, body: null, error: null, success: false }
  if (!token) { result.error = 'Token is empty — save your token first.'; return result }

  result.token = token.substring(0, 12) + '...'
  const provider = getProvider(token)
  result.provider = provider

  try {
    if (provider === 'groq') {
      result.url = GROQ_URL
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: 'Say OK.' }],
          max_tokens: 5,
        }),
      })
      result.status = res.status
      result.body = await res.json().catch(() => null)
      if (res.status === 200) result.success = true
      else if (res.status === 401) result.error = 'Invalid Groq token. Check at console.groq.com/keys'
      else if (res.status === 429) { result.success = true; result.error = 'Rate limited — but token is valid.' }
      else result.error = result.body?.error?.message || `Error ${res.status}`
    } else {
      // Try HF models in order
      for (const model of HF_MODELS) {
        result.url = hfUrl(model)
        const res = await fetch(result.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'Say OK.' }],
            max_tokens: 5,
            stream: false,
          }),
        })
        result.status = res.status
        result.body = await res.json().catch(() => null)
        if (res.status === 200) { result.success = true; break }
        if (res.status === 503) { result.success = true; result.error = 'Model loading — wait 30s and retry.'; break }
        if (res.status === 401 || res.status === 403) { result.error = 'Token rejected. Get a new one at huggingface.co/settings/tokens'; break }
        if (result.body?.error?.toLowerCase?.().includes('not supported')) continue
        result.error = result.body?.error || `Error ${res.status}`; break
      }
      if (!result.success && !result.error) result.error = 'No supported model found. Use a Groq token instead.'
    }
  } catch (e) {
    result.error = `Network/DNS error: ${e.message}`
  }

  return result
}
