"use client";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { apiKeysState } from "@/apiKeys.state";
import { useSnapshot } from "valtio";
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { DriaRetriever } from "@langchain/community/retrievers/dria";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import Image from "next/image";

type Input = {
  newPrompt: string;
};

export default function Game() {
  const [currentTurn, setCurrentTurn] = useState(1);
  const [chatHistory, setChatHistory] = useState<string>("");
  const [gmAnswer, setGmAnswer] = useState<string>(
    "let's start our adventure if u're ready!"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBtn, setLoadingBtn] = useState<boolean>(false);
  const [choices, setChoices] = useState<string[]>([
    "describe scenery and start game",
  ]);
  const { register, handleSubmit, reset } = useForm<Input>();
  const onSubmit: SubmitHandler<Input> = (data) => {
    setLoading(true);
    setCurrentTurn(currentTurn + 1);
    runQuery(data.newPrompt);
  };

  useEffect(() => {
    const container = document.getElementById("scrollableContainer");
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [gmAnswer]);
  let states = useSnapshot(apiKeysState);

  if (states.knowledgeId.length == 0 || states.driaApiKey.length == 0) {
    return (
      <div>
        <p>Please enter your API keys on homepage to proceed.</p>
      </div>
    );
  }

  const ollamaLlm = new OpenAI({
    modelName: "gpt-4-turbo",
    temperature: 0.5,
    openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY_ALPER,
  });
  const template = `
 You are a game master running a text based adventure RPG with a player. I'm going to have conversation with you and you will describe scenary,
 give quests, randomly make battles and track player's stats based on given context.
 Make the game easy difficulty.
 In each step give 3 choices to user to select one of them. start choices with @ sign. Do not use @ sign anywhere else.
 create only one turn at a time and use previous answers for context.
 Include some elements from Emperor's Soul book in the game.
 You only talk as a game master and I will play as a player.
 Game will be 10 turns in total.
 Your chat has user decisions of turns. Understand that user's decision give them to next turn's decision options
 In the beginning of your answer always state number of turn as "Turn: x"
 When you create answers follow structures as; if it is turn 1 describe a scenery, if it is turn 2 or turn 3 make player get a mission, on turn 4 and 5 create a small battle, on turn 6 and 7 create a travel, on turn 8 and 9 make final battle, on turn 10 fisinh the game and describe ending.
 Your current turn is : {turn}
 Context: {context}
 Chat History: {history}
 Question: {question}`;
  const prompt = PromptTemplate.fromTemplate(template);
  const args = {
    contractId: states.knowledgeId,
    apiKey: states.driaApiKey,
    topK: 10,
  };
  const retriever = new DriaRetriever(args);
  const chain = RunnableSequence.from([
    prompt,
    ollamaLlm,
    new StringOutputParser(),
  ]);
  const addToChatHistory = (newData: string) => {
    setChatHistory((prevChatHistory) => prevChatHistory + newData);
  };
  async function runQuery(query: string) {
    let context = await retriever.driaClient.search(query);
    let contextFiltered = context.map((doc) => doc.metadata).join("\n");
    addToChatHistory("player's input:" + query);
    const answer = await chain.stream({
      question: query,
      history: chatHistory,
      context: contextFiltered,
      turn: currentTurn.toString(),
    });
    setLoading(false);

    let foundChoiceMarker = false;
    let aggregatedAnswer = "";
    let choicesText = "";

    for await (const chunk of answer) {
      if (!foundChoiceMarker) {
        if (chunk.includes("@")) {
          foundChoiceMarker = true;
        } else {
          aggregatedAnswer += chunk;
          setGmAnswer(aggregatedAnswer);
        }
      } else {
        choicesText += chunk;
      }
    }
    setLoadingBtn(false);
    setChoices(choicesText.split("@").filter((str) => str.trim() !== ""));
    addToChatHistory("game master:" + query);
    reset();
  }

  return (
    <main className="flex h-screen p-1 flex-col justify-between items-center gap-5 pb-10">
      <div className="flex z-20 justify-between w-full py-1 px-2">
        <h1 className=" top-2 left-2 z-10 text-[30px] font-sans ">
          Realm Refiner
        </h1>
        <div
          className=" z-20 right-2 top-2 flex flex-col p-0.5 
        bg-white rounded-md border border-[rgb(238,179,114)]"
        >
          <p className="font-inter text-black text-base">powered by</p>
          <Image src="/drialogo.webp" alt="dria logo" width={113} height={40} />
        </div>
      </div>

      <Image
        src="/landing-bg-unsplash.webp"
        alt="background image"
        fill={true}
        objectFit="cover"
        className="absolute -z-10"
      />
      <div className="absolute top-0 w-screen z-0 h-screen bg-black/40"></div>

      <div className="relative overflow-hidden z-20 w-full max-w-[800px] max-h-[600px] border border-gray-800 h-4/5 p-2 sm:p-10 rounded-lg">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/papyrus.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: "-1",
          }}
        ></div>
        <div
          id="scrollableContainer"
          className="relative  z-30 h-full overflow-y-auto"
        >
          <div
            className=" text-black my-2 p-1 "
            dangerouslySetInnerHTML={{ __html: gmAnswer }}
          ></div>
        </div>
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-black/70 z-30">
            <div
              className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"
              role="status"
            ></div>
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative rounded-lg p-4 z-10 bg-black/50 flex flex-col items-center w-full max-w-[800px] gap-2"
      >
        {loadingBtn && (
          <div className="absolute inset-0 flex justify-center items-center bg-black/70 z-30">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"
              role="status"
            ></div>
          </div>
        )}
        {choices.map((item, index) => (
          <div key={index} className="w-full hover:scale-105 flex sm:w-4/5">
            <Image
              src="/btn-end.png"
              width={26}
              height={26}
              alt="btn decoration"
              className="z-20 -mr-2"
            />

            <input type="hidden" value={item} {...register("newPrompt")} />

            <button
              type="submit"
              onClick={() => setLoadingBtn(true)}
              className="bg-black/50 rounded-md text-sm py-1 px-2 border w-full border-[rgb(238,179,114)]"
            >
              {item}
            </button>
            <Image
              src="/btn-end.png"
              width={26}
              height={26}
              alt="btn decoration"
              className="z-20 transform rotate-180 -ml-2"
            />
          </div>
        ))}
      </form>
    </main>
  );
}
