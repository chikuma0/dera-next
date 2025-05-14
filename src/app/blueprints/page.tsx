import React from 'react';
import { Metadata } from 'next';
import { BlueprintCard } from '@/components/blueprint/BlueprintCard';
import { BlueprintService } from '@/lib/services/blueprintService';
import { FilterX, Search, Sliders } from 'lucide-react';
import Link from 'next/link';
import { BlueprintCategory, BlueprintDifficulty, ProgrammingLanguage } from '@/types/blueprint';
import BlueprintList from '@/components/blueprint/BlueprintList';

export const metadata: Metadata = {
  title: 'AI実装ガイド',
  description: 'AIの実装ガイドを探索しよう',
};

type SearchParams = {
  category?: BlueprintCategory;
  difficulty?: BlueprintDifficulty;
  language?: ProgrammingLanguage;
  query?: string;
  page?: string;
};

export default async function BlueprintsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return <BlueprintList searchParams={params} />;
} 