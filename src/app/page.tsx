"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { apiKeysState } from "@/apiKeys.state";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Inputs = {
  apikey: string;
  knowledgeid: string;
};

export default function Home() {
  const router = useRouter();

  const { register, handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    apiKeysState.driaApiKey = data.apikey;
    apiKeysState.knowledgeId = data.knowledgeid;
    router.push("/game");
  };

  return (
    <main className="flex justify-center px-4 min-h-screen flex-col items-center gap-32">
      <Image
        src="/landing-bg-unsplash.webp"
        alt="background image"
        fill={true}
        objectFit="cover"
        className="absolute z-0"
        priority={true}
      />
      <div className="flex flex-col z-10 p-4 items-center gap-4">
        <h1 className="text-[60px] sm:text-[80px] lg:text-[120px]  font-sans ">
          Realm Refiner
        </h1>
        <h2 className="text-lg backdrop-blur-sm">
          LLM based FRP Game Master powered by dria for custom game environment
        </h2>
        <p className="text-sm backdrop-blur-sm text-center">
          You can simply upload your favorite book to{" "}
          <a href="https://dria.co/" target="_blank">
            <span className="font-bold">dria</span>
          </a>{" "}
          and feed the book to LLM <br /> to inject environment of your book to
          your solo FRP adventure
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-lg p-6 flex w-[385px] z-10 backdrop-blur-sm flex-col gap-2 sm:gap-6"
      >
        <input
          placeholder="Enter your dria API key"
          type="text"
          className="rounded-md px-2 text-black text-sm"
          {...register("apikey", { required: true })}
        />
        <input
          placeholder="Enter dria knowledge id"
          type="text"
          className="rounded-md px-2 text-black text-sm"
          {...register("knowledgeid", { required: true })}
        />
        <button
          type="submit"
          className="button-bg text-2xl font-sans h-14 tracking-wide hover:scale-105"
        >
          submit
        </button>
      </form>
    </main>
  );
}
