"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";

type Campus = "H1" | "H2";

const CAMPUSES: {
  value: Campus;
  emoji: string;
  title: string;
  description: string;
  id: string;
}[] = [
  {
    value: "H1",
    emoji: "🏛️",
    title: "서울",
    description: "서울캠퍼스",
    id: "campus-seoul",
  },
  {
    value: "H2",
    emoji: "🌐",
    title: "글로벌",
    description: "글로벌캠퍼스",
    id: "campus-global",
  },
];

export default function Home() {
  const router = useRouter();
  const [campus, setCampus] = useState<Campus>("H1");

  const handleStart = () => {
    document.cookie = `campus=${campus}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.push("/rooms");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        <div className="text-center space-y-2">
          <p className="text-5xl mb-4">📍</p>
          <h1 className="text-3xl font-bold tracking-tight">HUFSpot</h1>
          <p className="text-sm text-muted-foreground">캠퍼스를 선택해주세요</p>
        </div>

        <RadioGroup
          value={campus}
          onValueChange={(v) => setCampus(v as Campus)}
          className="grid grid-cols-2 gap-3 w-full"
        >
          {CAMPUSES.map((c) => (
            <FieldLabel key={c.value} htmlFor={c.id} className="cursor-pointer">
              <Field
                orientation="vertical"
                className="items-center justify-center text-center gap-2"
              >
                <RadioGroupItem value={c.value} id={c.id} className="sr-only" />
                <span className="text-4xl leading-none">{c.emoji}</span>
                <FieldContent className="items-center">
                  <FieldTitle className="text-base font-semibold">
                    {c.title}
                  </FieldTitle>
                  <FieldDescription className="text-xs">
                    {c.description}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </div>

      <div className="pb-10">
        <button
          onClick={handleStart}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-base active:scale-[0.98] transition-transform"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
