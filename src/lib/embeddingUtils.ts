import OpenAI from "openai";

export const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEYY;
export const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

export const EMBEDDING_MODEL = OPENAI_API_KEY
  ? "text-embedding-3-large"
  : "@cf/baai/bge-large-en-v1.5";

export const EMBEDDING_TABLE = "embeddings_large_1024";

export async function createVectorEmbedding(text: string): Promise<number[]> {
  const openai = new OpenAI({
    apiKey: process.env.CLOUDFLARE_API_KEY,
    baseURL: OPENAI_API_KEY
      ? ""
      : `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
  });

  const embeddings = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  return embeddings.data[0].embedding; // we sent one text, we get one embedding
}

// run("@cf/meta/llama-3-8b-instruct", {
//   messages: [
//     {
//       role: "system",
//       content: "You are a friendly assistan that helps write stories",
//     },
//     {
//       role: "user",
//       content:
//         "Write a short story about a llama that goes on a journey to find an orange cloud ",
//     },
//   ],
// }).then((response) => {
//   console.log(JSON.stringify(response));
// });
