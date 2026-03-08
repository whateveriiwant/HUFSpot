'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CAMPUSES } from '@/entities/campus/model/campus';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Campus } from '@/types/campusType';

export const CampusSelector = () => {
  const router = useRouter();
  const [campus, setCampus] = useState<Campus>('H1');

  const handleStart = () => {
    document.cookie = `campus=${campus}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.push('/rooms');
  };

  return (
    <>
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

      <div className="pb-10 mt-10 w-full">
        <button
          onClick={handleStart}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-base active:scale-[0.98] transition-transform"
        >
          시작하기
        </button>
      </div>
    </>
  );
};
