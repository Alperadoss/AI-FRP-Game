import { proxy } from "valtio";

export const apiKeysState = proxy({
  driaApiKey: "" as string,
  knowledgeId: "" as string,
});
