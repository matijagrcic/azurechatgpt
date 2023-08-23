// import { PromptGPT } from "@/features/chat/chat-api";
import { PromptDataGPT } from "@/features/chat/chat-api-data";

export async function POST(req: Request) {
  const body = await req.json();
  // return await PromptGPT(body);
  return await PromptDataGPT(body);
}
