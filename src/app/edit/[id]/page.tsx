import PersonForm from "@/components/PersonForm";
import { getPerson } from "@/app/actions";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPerson(id);
  
  if (!person) {
    notFound();
  }

  return <PersonForm initialData={person} />;
}