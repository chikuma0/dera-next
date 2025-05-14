import { notFound } from 'next/navigation';
import { BlueprintService } from '@/lib/services/blueprintService';
import { BlueprintDetail } from '@/components/blueprint/BlueprintDetail';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Generate metadata dynamically based on the blueprint
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const blueprintService = new BlueprintService();
  const blueprint = await blueprintService.getBlueprintById(id);
  
  if (!blueprint) {
    return {
      title: 'Blueprint Not Found',
      description: 'The requested blueprint could not be found.',
    };
  }
  
  return {
    title: blueprint.title,
    description: blueprint.description,
  };
}

export default async function BlueprintPage({ params }: Props) {
  const { id } = await params;
  const blueprintService = new BlueprintService();
  const blueprint = await blueprintService.getBlueprintById(id);
  
  if (!blueprint) {
    notFound();
  }

  await blueprintService.recordBlueprintView(id);
  
  return <BlueprintDetail blueprint={blueprint} />;
} 