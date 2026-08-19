const Groq = require("groq-sdk");

const aiMedicalRepository = require("./ai-medical.repository");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

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
MEDIUM
HIGH
CRITICAL

Important rules:

- Do not claim certainty or provide a definitive diagnosis.
- Do not prescribe medication or provide medication dosage.
- If the description suggests a potentially life-threatening situation,
  classify it as CRITICAL.
- If immediate emergency medical attention may be necessary,
  clearly state that emergency medical care should be sought.
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

    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            {
                role: "system",
                content: "You are a cautious medical triage assistant. Always respond with valid JSON only.",
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

    const medicalEvent = await aiMedicalRepository.createMedicalEvent({
        userId,
        userDescription,
        latitude,
        longitude,
        severity: aiResult.severity,
        isEmergency,
    });

    const savedAIResponse = await aiMedicalRepository.createAIResponse({
        medicalEventId: medicalEvent.id,
        summary: aiResult.summary,
        possibleConditions: aiResult.possibleConditions,
        tags: aiResult.tags,
        firstAid: aiResult.firstAid,
    });

    return {
        medicalEvent,
        aiResponse: savedAIResponse,
    };
};

module.exports = {
    consultMedicalCondition,
};
