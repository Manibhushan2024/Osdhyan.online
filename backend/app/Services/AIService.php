<?php

namespace App\Services;

use App\Models\Question;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Arr;

class AIService
{
    protected ?string $openAiApiKey;
    protected ?string $geminiApiKey;
    protected string $provider;
    protected string $model;

    public function __construct()
    {
        $this->openAiApiKey = env('OPENAI_API_KEY');
        $this->geminiApiKey = env('GEMINI_API_KEY');

        $defaultProvider = $this->geminiApiKey ? 'gemini' : 'openai';
        $this->provider = strtolower((string) env('AI_PROVIDER', $defaultProvider));

        $defaultModel = $this->provider === 'gemini'
            ? env('GEMINI_MODEL', 'gemini-2.5-flash')
            : env('OPENAI_MODEL', 'gpt-4o-mini');

        $this->model = (string) env('AI_MODEL', $defaultModel);
    }

    /**
     * Generate a step-by-step textbook explanation for a question and user answer.
     */
    public function generateExplanation(Question $question, $userSelectedOptionId = null)
    {
        if (!$this->hasProviderCredentials()) {
            return $this->getMockExplanation($question, $userSelectedOptionId);
        }

        $optionsText = $question->options->map(function ($opt) {
            return "ID: {$opt->id}, Text: {$opt->option_en} " . ($opt->is_correct ? "(Correct)" : "");
        })->implode("\n");

        $prompt = "You are an expert EdTech tutor for the BPSC AEDO exam. Provide a DETAILED, STEP-BY-STEP textbook-style explanation for the following question.
        
        Question: {$question->question_en}
        Options:
        $optionsText
        
        User Selected Option ID: " . ($userSelectedOptionId ?: "None") . "
        
        Format your response as a JSON object with:
        1. 'step_by_step': A string with markdown formatting for the explanation.
        2. 'key_concept': The core concept being tested.
        3. 'common_pitfall': Why students might get this wrong.
        4. 'improvement_tip': A tip for next time.";

        try {
            $payload = $this->requestStructuredJson(
                'You are a helpful academic assistant.',
                $prompt
            );

            if (is_array($payload)) {
                return json_encode($payload, JSON_UNESCAPED_UNICODE);
            }
        } catch (\Exception $e) {
            // Fallback below.
        }

        return $this->getMockExplanation($question, $userSelectedOptionId);
    }

    /**
     * Predict selection probability based on user performance statistics.
     */
    public function predictSelectionProbability($stats, $weakAreas, $strengths)
    {
        if (!$this->hasProviderCredentials()) {
            $weakTopic = $weakAreas->first() ? $weakAreas->first()->topic_name : 'Bihar History';
            $strengthTopic = $strengths->first() ? $strengths->first()->topic_name : 'General Science';
            
            return [
                'probability' => 65,
                'analysis' => "Based on your current accuracy of {$stats['accuracy_percentage']}%, you are in the **Intermediate** bracket. To ensure 100% selection in BPSC AEDO, focus on your weak areas like **{$weakTopic}**.",
                'action_plan' => [
                    "Increase daily practice in {$weakTopic}",
                    "Review PYQs for {$strengthTopic} to maintain speed.",
                    "Take 2 Full Mock tests this week."
                ]
            ];
        }

        $prompt = "You are the Dean of a top Civil Services Coaching Institute. Analyze the following student performance data for the BPSC AEDO exam and provide a selection probability report.
        
        Stats: Accuracy {$stats['accuracy_percentage']}%, Tests Taken: {$stats['total_tests']}
        Strengths: " . $strengths->pluck('topic_name')->implode(', ') . "
        Weak Areas: " . $weakAreas->pluck('topic_name')->implode(', ') . "
        
        Format your response as a JSON object with:
        1. 'probability': An integer between 0-100.
        2. 'analysis': A motivational and critical analysis of their standing (markdown).
        3. 'action_plan': An array of 3 concrete steps to reach 100% probability.";

        try {
            $payload = $this->requestStructuredJson(
                'You are a strict but encouraging civil services mentor.',
                $prompt
            );

            if (is_array($payload)) {
                return $payload;
            }
        } catch (\Exception $e) {
            // Fallback below.
        }

        return [
            'probability' => 50,
            'analysis' => 'AI analysis temporarily unavailable. Continue practicing to improve your score.',
            'action_plan' => ['Complete more tests', 'Review errors']
        ];
    }

    /**
     * Context-aware study assistant answer used in solution chat drawer.
     */
    public function chatForSolution(
        Question $question,
        ?int $userSelectedOptionId,
        string $message,
        array $history = []
    ): string {
        if (!$this->hasProviderCredentials()) {
            return 'AI service is currently unavailable or the API key is missing. Please check backend .env.';
        }

        $options = $question->options->map(function ($opt) {
            return [
                'id' => $opt->id,
                'en' => $opt->option_en,
                'hi' => $opt->option_hi,
                'is_correct' => (bool) $opt->is_correct,
            ];
        })->values()->all();

        $context = [
            'question_id' => $question->id,
            'question_en' => $question->question_en,
            'question_hi' => $question->question_hi,
            'subject' => $question->subject?->name_en,
            'chapter' => $question->chapter?->name_en,
            'topic' => $question->topic?->name_en,
            'options' => $options,
            'user_selected_option_id' => $userSelectedOptionId,
            'stored_explanation_en' => $question->explanation_en,
            'stored_explanation_hi' => $question->explanation_hi,
        ];

        $systemPrompt = 'You are OSDHYAN AI solution mentor for one active exam question only. '
            . 'Use ONLY the provided question context. Never generate unrelated sample questions. '
            . 'If user asks something unrelated, politely bring them back to this question. '
            . 'Be exam-focused, concise, accurate, and practical. '
            . 'If user selected a wrong option, clearly explain the mistake and correction. '
            . 'Support Hindi if user asks in Hindi.';

        $userPrompt = "ACTIVE QUESTION CONTEXT (STRICT):\n"
            . json_encode($context, JSON_UNESCAPED_UNICODE)
            . "\n\nUSER MESSAGE:\n{$message}\n\n"
            . "RESPONSE FORMAT (plain text):\n"
            . "1) Final Answer\n"
            . "2) Why This Is Correct\n"
            . "3) Mistake In My Attempt (if any)\n"
            . "4) Quick Shortcut / Memory Trick\n"
            . "5) Next 1-Minute Practice Tip";

        $reply = $this->requestText($systemPrompt, $userPrompt, $history);

        return $reply ?: 'I could not process this right now. Please try again in a moment.';
    }

    /**
     * Extract structured mock-test JSON from uploaded files.
     * $inlineFiles = [['mime_type' => 'application/pdf', 'data' => '<base64>', 'name' => 'paper_en.pdf'], ...]
     */
    public function extractMockTestFromInlineFiles(array $inlineFiles, array $meta = []): array
    {
        if (!$this->hasProviderCredentials()) {
            throw new \RuntimeException('AI provider key is missing.');
        }

        $metaJson = json_encode($meta, JSON_UNESCAPED_UNICODE);

        $prompt = "You are an exam-content extraction engine for bilingual (English/Hindi) competitive tests.\n"
            . "Convert the provided documents into strict JSON.\n"
            . "Meta provided by admin: {$metaJson}\n\n"
            . "Output JSON schema:\n"
            . "{\n"
            . "  \"test\": {\n"
            . "    \"name_en\": \"string\",\n"
            . "    \"name_hi\": \"string\",\n"
            . "    \"description_en\": \"string\",\n"
            . "    \"description_hi\": \"string\",\n"
            . "    \"mode\": \"full_mock\",\n"
            . "    \"duration_sec\": 3600,\n"
            . "    \"negative_marking\": 0.25,\n"
            . "    \"question_mark\": 1\n"
            . "  },\n"
            . "  \"questions\": [\n"
            . "    {\n"
            . "      \"question_no\": 1,\n"
            . "      \"question_en\": \"string\",\n"
            . "      \"question_hi\": \"string\",\n"
            . "      \"difficulty\": \"easy|medium|hard\",\n"
            . "      \"options\": [\n"
            . "        {\"label\":\"A\",\"option_en\":\"string\",\"option_hi\":\"string\",\"is_correct\":false},\n"
            . "        {\"label\":\"B\",\"option_en\":\"string\",\"option_hi\":\"string\",\"is_correct\":true},\n"
            . "        {\"label\":\"C\",\"option_en\":\"string\",\"option_hi\":\"string\",\"is_correct\":false},\n"
            . "        {\"label\":\"D\",\"option_en\":\"string\",\"option_hi\":\"string\",\"is_correct\":false}\n"
            . "      ],\n"
            . "      \"explanation_en\": \"string\",\n"
            . "      \"explanation_hi\": \"string\"\n"
            . "    }\n"
            . "  ]\n"
            . "}\n\n"
            . "Rules:\n"
            . "- Must return pure JSON only.\n"
            . "- Ensure exactly one correct option per question.\n"
            . "- Preserve bilingual text as available.\n"
            . "- If any field is unknown, keep empty string, do not omit keys.\n"
            . "- Do not hallucinate question count; only extract what exists in documents.";

        $response = $this->requestStructuredJsonFromFiles(
            'You are a strict JSON extraction assistant for exam papers.',
            $prompt,
            $inlineFiles
        );

        if (!is_array($response)) {
            throw new \RuntimeException('AI extraction failed to produce valid JSON.');
        }

        return $response;
    }

    protected function getMockExplanation(Question $question, $userSelectedOptionId)
    {
        return json_encode([
            'step_by_step' => "### Textbook Explanation\n\n1. **Analyze the Question**: The question asks about the specific provisions of the Bihar Reorganization Act.\n2. **Identify the Fact**: According to Article 3 of the Constitution, Parliament has the power to form new states.\n3. **Conclusion**: Therefore, option C is correct because it correctly identifies the timeline of the state split.\n\n" . ($userSelectedOptionId ? "You selected an incorrect option because you might have confused the date with the Jharkhand creation." : ""),
            'key_concept' => 'State Reorganization & Constitution',
            'common_pitfall' => 'Confusing the notification date with the implementation date.',
            'improvement_tip' => 'Create a timeline of Bihar history events to avoid date confusion.'
        ]);
    }

    protected function hasProviderCredentials(): bool
    {
        return ($this->provider === 'gemini' && !empty($this->geminiApiKey))
            || ($this->provider !== 'gemini' && !empty($this->openAiApiKey))
            || (!empty($this->geminiApiKey))
            || (!empty($this->openAiApiKey));
    }

    protected function requestStructuredJson(string $systemPrompt, string $userPrompt): ?array
    {
        if ($this->shouldUseGemini()) {
            return $this->requestGeminiJson($systemPrompt, $userPrompt);
        }

        return $this->requestOpenAiJson($systemPrompt, $userPrompt);
    }

    protected function requestStructuredJsonFromFiles(string $systemPrompt, string $userPrompt, array $inlineFiles): ?array
    {
        if ($this->shouldUseGemini()) {
            return $this->requestGeminiJson($systemPrompt, $userPrompt, [], $inlineFiles);
        }

        // OpenAI branch currently handles text-only extraction in this implementation.
        return $this->requestOpenAiJson($systemPrompt, $userPrompt);
    }

    protected function requestText(string $systemPrompt, string $userPrompt, array $history = []): ?string
    {
        if ($this->shouldUseGemini()) {
            return $this->requestGeminiText($systemPrompt, $userPrompt, $history);
        }

        return $this->requestOpenAiText($systemPrompt, $userPrompt, $history);
    }

    protected function shouldUseGemini(): bool
    {
        if ($this->provider === 'gemini' && !empty($this->geminiApiKey)) {
            return true;
        }

        return $this->provider !== 'openai' && !empty($this->geminiApiKey) && empty($this->openAiApiKey);
    }

    protected function requestOpenAiJson(string $systemPrompt, string $userPrompt): ?array
    {
        if (empty($this->openAiApiKey)) {
            return null;
        }

        $response = Http::timeout(180)
            ->withToken($this->openAiApiKey)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.2,
            ]);

        if (!$response->successful()) {
            return null;
        }

        $content = data_get($response->json(), 'choices.0.message.content');
        if (!is_string($content) || trim($content) === '') {
            return null;
        }

        $decoded = json_decode($content, true);
        return is_array($decoded) ? $decoded : null;
    }

    protected function requestOpenAiText(string $systemPrompt, string $userPrompt, array $history = []): ?string
    {
        if (empty($this->openAiApiKey)) {
            return null;
        }

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($history as $entry) {
            $role = $entry['role'] ?? null;
            $content = $entry['content'] ?? null;
            if (!in_array($role, ['user', 'assistant'], true) || !is_string($content) || trim($content) === '') {
                continue;
            }
            $messages[] = ['role' => $role, 'content' => $content];
        }

        $messages[] = ['role' => 'user', 'content' => $userPrompt];

        $response = Http::timeout(180)
            ->withToken($this->openAiApiKey)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $this->model,
                'messages' => $messages,
                'temperature' => 0.2,
            ]);

        if (!$response->successful()) {
            return null;
        }

        $content = data_get($response->json(), 'choices.0.message.content');
        return is_string($content) ? trim($content) : null;
    }

    protected function requestGeminiJson(
        string $systemPrompt,
        string $userPrompt,
        array $history = [],
        array $inlineFiles = []
    ): ?array {
        $text = $this->requestGeminiText($systemPrompt, $userPrompt, $history, $inlineFiles, true);
        if (!is_string($text) || trim($text) === '') {
            return null;
        }

        $decoded = json_decode($text, true);
        return is_array($decoded) ? $decoded : null;
    }

    protected function requestGeminiText(
        string $systemPrompt,
        string $userPrompt,
        array $history = [],
        array $inlineFiles = [],
        bool $forceJson = false
    ): ?string {
        if (empty($this->geminiApiKey)) {
            return null;
        }

        $model = $this->model ?: env('GEMINI_MODEL', 'gemini-2.5-flash');
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$this->geminiApiKey}";

        $contents = [];

        foreach ($history as $entry) {
            $role = ($entry['role'] ?? 'user') === 'assistant' ? 'model' : 'user';
            $content = $entry['content'] ?? '';
            if (!is_string($content) || trim($content) === '') {
                continue;
            }
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $content]],
            ];
        }

        $userParts = [['text' => $userPrompt]];
        foreach ($inlineFiles as $file) {
            $mimeType = Arr::get($file, 'mime_type');
            $data = Arr::get($file, 'data');
            if (!is_string($mimeType) || !is_string($data) || $mimeType === '' || $data === '') {
                continue;
            }
            $userParts[] = [
                'inline_data' => [
                    'mime_type' => $mimeType,
                    'data' => $data,
                ],
            ];
        }

        $contents[] = [
            'role' => 'user',
            'parts' => $userParts,
        ];

        $generationConfig = [
            'temperature' => $forceJson ? 0.1 : 0.4,
            'maxOutputTokens' => 8192,
        ];
        if ($forceJson) {
            $generationConfig['responseMimeType'] = 'application/json';
        }

        $payload = [
            'systemInstruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => $contents,
            'generationConfig' => $generationConfig,
        ];

        $response = Http::timeout(240)->post($endpoint, $payload);
        if (!$response->successful()) {
            \Log::error('Gemini API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'endpoint' => $endpoint
            ]);
            return null;
        }

        $text = data_get($response->json(), 'candidates.0.content.parts.0.text');
        return is_string($text) ? trim($text) : null;
    }
}
