const Groq = require("groq-sdk");

const aiMedicalRepository = require("./ai-medical.repository");

const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY is missing. Set it before calling the AI medical assistant.");
    }

    return new Groq({ apiKey });
};

const PROHIBITED_EMERGENCY_NUMBERS = ["911", "999"];

const normalizeSeverity = (severity) => {
    const normalizedSeverity = String(severity || "HIGH").trim().toUpperCase();
    const severityAliases = {
        MEDIUM: "MODERATE",
    };

    return severityAliases[normalizedSeverity] || ["LOW", "MODERATE", "HIGH", "CRITICAL"].includes(normalizedSeverity)
        ? severityAliases[normalizedSeverity] || normalizedSeverity
        : "HIGH";
};

const containsProhibitedEmergencyNumber = (text = "") => {
    if (!text) return false;

    const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();

    return PROHIBITED_EMERGENCY_NUMBERS.some((number) => normalized.includes(number.toLowerCase()));
};

const sanitizeAiMedicalResponse = (aiResult = {}) => {
    const sanitized = {
        severity: normalizeSeverity(aiResult.severity),
        summary: aiResult.summary || "The situation may require urgent medical assessment.",
        possibleConditions: aiResult.possibleConditions || "Possible medical issue. Please seek urgent clinical assessment.",
        tags: aiResult.tags || "urgent-care",
        firstAid: aiResult.firstAid || "Stay with the patient, keep them calm, and seek immediate medical care at the nearest suitable facility.",
    };

    const forbiddenPatterns = [
        /\b911\b/gi,
        /\b999\b/gi,
        /call\s+(?:the\s+)?(?:national\s+)?(?:emergency\s+)?(?:service|services|hotline)/gi,
        /dial\s+(?:the\s+)?(?:national\s+)?(?:emergency\s+)?(?:service|services|hotline)/gi,
        /emergency\s+services?/gi,
    ];

    const hasForbiddenEmergencyGuidance = (value = "") => {
        if (!value) return false;
        return forbiddenPatterns.some((pattern) => pattern.test(value));
    };

    const safeMedicalFallback = "Keep the patient calm and still, monitor breathing and responsiveness, and seek urgent medical care at the nearest appropriate facility without delay.";
    const safeSummaryFallback = "This may require urgent medical assessment. Please contact MedLink emergency support or go to the nearest appropriate medical facility without delay.";

    if (!sanitized.summary || hasForbiddenEmergencyGuidance(sanitized.summary)) {
        sanitized.summary = safeSummaryFallback;
    }

    if (!sanitized.possibleConditions || hasForbiddenEmergencyGuidance(sanitized.possibleConditions)) {
        sanitized.possibleConditions = "Possible medical issue. Please seek a prompt clinical assessment at the nearest suitable care facility.";
    }

    if (!sanitized.firstAid || hasForbiddenEmergencyGuidance(sanitized.firstAid)) {
        sanitized.firstAid = safeMedicalFallback;
    }

    return sanitized;
};

const consultMedicalCondition = async ({
    userId,
    userDescription,
    latitude,
    longitude,
    isEmergency,
}) => {
    const prompt = `
You are the medical triage assistant for MEDLINK.

Your job is NOT to provide a definitive diagnosis.

Analyze the user's description and provide a cautious preliminary
triage assessment.

User description:
${userDescription}

Return a structured response containing:

1. A short summary of the situation.
2. Possible medical conditions that could be associated with the
   described symptoms. Clearly indicate that these are possibilities,
   not confirmed diagnoses.
3. Relevant medical tags.
4. Safe first-aid guidance.
5. A severity level.

Severity must be exactly one of:

LOW
MODERATE
HIGH
CRITICAL

Important rules:

- Do not claim certainty or provide a definitive diagnosis.
- Do not prescribe medication or provide medication dosage.
- Do not mention or suggest calling 911, 999, or any other national emergency hotline.
- Do not tell the user to call emergency services or to dial emergency numbers.
- If the description suggests a potentially life-threatening situation,
  classify it as CRITICAL.
- If immediate emergency medical attention may be necessary,
  clearly instruct the user to seek urgent medical care from the nearest appropriate healthcare facility or MedLink emergency support.
- Keep the response practical and understandable.

Respond ONLY with valid JSON matching this exact structure:
{
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "string",
  "possibleConditions": "string",
  "tags": "string",
  "firstAid": "string"
}
`;

    console.log("PROMPT BEING SENT:", prompt);

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            {
                role: "system",
                content: "You are a cautious medical triage assistant. Always respond with valid JSON only. Never suggest prohibited emergency numbers like 911 or 999.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);
    const sanitizedResult = sanitizeAiMedicalResponse(aiResult);

    const medicalEvent = await aiMedicalRepository.createMedicalEvent({
        userId,
        userDescription,
        latitude,
        longitude,
        severity: sanitizedResult.severity,
        isEmergency,
    });

    const savedAIResponse = await aiMedicalRepository.createAIResponse({
        medicalEventId: medicalEvent.id,
        summary: sanitizedResult.summary,
        possibleConditions: sanitizedResult.possibleConditions,
        tags: sanitizedResult.tags,
        firstAid: sanitizedResult.firstAid,
    });

    return {
        medicalEvent,
        aiResponse: savedAIResponse,
    };
};

module.exports = {
    consultMedicalCondition,
    containsProhibitedEmergencyNumber,
    sanitizeAiMedicalResponse,
};
