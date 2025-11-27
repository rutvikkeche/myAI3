import { openai } from "@ai-sdk/openai";
import { fireworks } from "@ai-sdk/fireworks";
import { wrapLanguageModel, extractReasoningMiddleware } from "ai";

export const MODEL = openai('gpt-4o');

// If you want to use a Fireworks model, uncomment the following code and set the FIREWORKS_API_KEY in Vercel
// NOTE: Use middleware when the reasoning tag is different than think. (Use ChatGPT to help you understand the middleware)
// export const MODEL = wrapLanguageModel({
//     model: fireworks('fireworks/deepseek-r1-0528'),
//     middleware: extractReasoningMiddleware({ tagName: 'think' }), // Use this only when using Deepseek
// });


function getDateAndTime(): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });
    return `The day today is ${dateStr} and the time right now is ${timeStr}.`;
}

export const DATE_AND_TIME = getDateAndTime();

export const AI_NAME = "EcomQuery";
export const OWNER_NAME = "GroupA1";

export const WELCOME_MESSAGE = `
👋 Welcome! I’m ${AI_NAME}, also known as *Ecom Query Bot* — your Virtual Data Analyst, built by ${OWNER_NAME}.

I help you explore and understand your business data using simple everyday language. You don’t need to know SQL or database structures — just ask a question, and I’ll run the analysis and present clear insights you can use immediately.

Whether you're validating an idea, checking performance, or making data-driven decisions, I streamline the entire analytics workflow by handling query creation, data retrieval, and interpretation for you.

This demo uses synthetic company-style data designed to mimic real e-commerce patterns, giving you a realistic and safe environment to experiment with analytics.
`;
export const CLEAR_CHAT_TEXT = "New";

export const MODERATION_DENIAL_MESSAGE_SEXUAL = "I can't discuss explicit sexual content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SEXUAL_MINORS = "I can't discuss content involving minors in a sexual context. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT = "I can't engage with harassing content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT_THREATENING = "I can't engage with threatening or harassing content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HATE = "I can't engage with hateful content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HATE_THREATENING = "I can't engage with threatening hate speech. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT = "I can't discuss illegal activities. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT_VIOLENT = "I can't discuss violent illegal activities. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM = "I can't discuss self-harm. If you're struggling, please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INTENT = "I can't discuss self-harm intentions. If you're struggling, please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INSTRUCTIONS = "I can't provide instructions related to self-harm. If you're struggling, please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE = "I can't discuss violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE_GRAPHIC = "I can't discuss graphic violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_DEFAULT = "Your message violates our guidelines. I can't answer that.";

export const PINECONE_TOP_K = 40;
export const PINECONE_INDEX_NAME = "my-ai";
