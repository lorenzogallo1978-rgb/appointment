"use client";

import { useEffect, useState } from "react";
import { getPerson, deletePerson, Person } from "@/app/actions";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Edit, Trash2, Copy, Calendar, CalendarDays, KeyRound, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import toast from "react-hot-toast";

export default function PersonDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerson();
  }, [id]);

  const fetchPerson = async () => {
    try {
      const data = await getPerson(id);
      if (data) {
        setPerson(data);
      } else {
        toast.error("لم يتم العثور على الشخص");
        router.push("/");
      }
    } catch (error) {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("هل أنت متأكد من حذف هذا السجل بشكل نهائي؟")) {
      await deletePerson(id);
      toast.success("تم الحذف بنجاح");
      router.push("/");
    }
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جاري التحميل...</div>;
  }

  if (!person) return null;

  return (
    <main className="max-w-3xl mx-auto p-4 pb-24 min-h-screen">
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-card rounded-full shadow-sm border border-border hover:bg-muted transition-colors">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">تفاصيل السجل</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/edit/${person.id}`} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full shadow-sm border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors">
            <Edit className="w-5 h-5" />
          </Link>
          <button onClick={handleDelete} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full shadow-sm border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {/* Basic Info Card */}
        <section className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">{person.fullName}</h2>
            <div className="flex items-center justify-between mt-2">
              <p className="text-lg text-muted-foreground font-mono bg-muted px-3 py-1 rounded-lg inline-block tracking-widest">{person.idNumber}</p>
              <button 
                onClick={() => handleCopy(person.idNumber, "رقم الهوية")}
                className="text-primary hover:bg-muted p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                نسخ
              </button>
            </div>
          </div>
          
          {person.dateOfBirth && (
            <div className="flex items-center gap-2 text-muted-foreground pt-4 border-t border-border">
              <CalendarDays className="w-5 h-5" />
              <span>تاريخ الميلاد: {format(new Date(person.dateOfBirth), 'dd/MM/yyyy')}</span>
            </div>
          )}
        </section>

        {/* Appointment Card */}
        {person.appointmentDate && (
          <section className="bg-primary/10 border border-primary/20 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5" />
              موعد الحجز
            </h3>
            <p className="text-xl font-medium text-foreground">
              {format(new Date(person.appointmentDate), 'EEEE, dd MMMM yyyy', { locale: ar })}
            </p>
            <p className="text-lg text-muted-foreground mt-1">
              الساعة {format(new Date(person.appointmentDate), 'hh:mm a')}
            </p>
          </section>
        )}

        {/* Passwords Section */}
        <section className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-muted-foreground" />
            كلمات المرور
          </h3>
          
          <PasswordRow label="MHRS" value={person.mhrsPassword} onCopy={() => handleCopy(person.mhrsPassword || "", "كلمة سر MHRS")} />
          <PasswordRow label="E-Devlet" value={person.eDevletPassword} onCopy={() => handleCopy(person.eDevletPassword || "", "كلمة سر E-Devlet")} />
          <PasswordRow label="E-Nabız" value={person.eNabizPassword} onCopy={() => handleCopy(person.eNabizPassword || "", "كلمة سر E-Nabız")} />
        </section>

        {/* Notes Section */}
        {person.notes && (
          <section className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              ملاحظات
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted p-4 rounded-xl">
              {person.notes}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function PasswordRow({ label, value, onCopy }: { label: string, value: string | null, onCopy: () => void }) {
  if (!value) return null;
  
  return (
    <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
        <p className="font-mono text-lg tracking-wider text-foreground">{value}</p>
      </div>
      <button 
        onClick={onCopy}
        className="p-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors"
        title="نسخ"
      >
        <Copy className="w-5 h-5" />
      </button>
    </div>
  );
}
