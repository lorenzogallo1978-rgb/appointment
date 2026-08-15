"use client";

import { useEffect, useState, useMemo } from "react";
import { getPersons, Person } from "./actions";
import { Plus, Search, Calendar, Users, Moon, Sun, Download, Upload } from "lucide-react";
import Link from "next/link";
import { format, differenceInDays, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";

export default function Home() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    const data = await getPersons();
    // Sort by nearest appointment
    const sorted = data.sort((a, b) => {
      if (!a.appointmentDate) return 1;
      if (!b.appointmentDate) return -1;
      return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
    });
    setPersons(sorted);
  };

  const filteredPersons = useMemo(() => {
    return persons.filter(
      (p) =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.idNumber.includes(searchTerm)
    );
  }, [persons, searchTerm]);

  const handleExport = () => {
    const dataStr = JSON.stringify(persons, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appointments_backup.json";
    a.click();
    toast.success("تم التصدير بنجاح");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("استيراد البيانات سيقوم بتحديث السجلات الحالية. هل أنت متأكد؟")) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          // Assuming JSON is valid array of persons
          // Call action to import
          const { importData } = await import("./actions");
          await importData(json);
          toast.success("تم الاستيراد بنجاح");
          fetchPersons();
        } catch (error) {
          toast.error("حدث خطأ أثناء الاستيراد. تأكد من صحة الملف.");
        }
      };
      reader.readAsText(file);
    }
    // reset input
    e.target.value = '';
  };

  return (
    <main className="max-w-3xl mx-auto p-4 pb-24 min-h-screen">
      <header className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Users className="w-6 h-6" />
            إدارة المواعيد
          </h1>
          <p className="text-sm text-muted-foreground mt-1">تطبيق تنظيم بيانات الأشخاص</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="p-2 bg-card rounded-full shadow-sm cursor-pointer border border-border hover:bg-muted transition-colors">
            <Upload className="w-5 h-5 text-foreground" />
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button
            onClick={handleExport}
            className="p-2 bg-card rounded-full shadow-sm border border-border hover:bg-muted transition-colors"
          >
            <Download className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 bg-card rounded-full shadow-sm border border-border hover:bg-muted transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </header>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          className="bg-card border border-border text-foreground text-sm rounded-xl focus:ring-primary focus:border-primary block w-full pr-10 p-3 shadow-sm"
          placeholder="ابحث بالاسم أو رقم الهوية..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredPersons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            لا يوجد نتائج.
          </div>
        ) : (
          filteredPersons.map((person) => {
            let isUpcoming = false;
            let daysLeft = null;
            if (person.appointmentDate) {
              const date = new Date(person.appointmentDate);
              if (isValid(date)) {
                daysLeft = differenceInDays(date, new Date());
                // Appointment is within 2 days (0, 1, or 2 days left) and not in the past
                isUpcoming = daysLeft >= 0 && daysLeft <= 2;
              }
            }

            return (
              <Link href={`/person/${person.id}`} key={person.id} className="block">
                <div className={`p-4 rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md ${isUpcoming ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{person.fullName}</h2>
                      <p className="text-sm text-muted-foreground mt-1 tracking-wider">{person.idNumber}</p>
                    </div>
                    {person.appointmentDate && (
                      <div className={`flex flex-col items-end text-sm font-medium ${isUpcoming ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(person.appointmentDate), 'dd MMMM yyyy', { locale: ar })}
                        </span>
                        {isUpcoming && <span className="text-xs mt-1 animate-pulse">موعد قريب!</span>}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <Link
        href="/add"
        className="fixed bottom-6 left-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 hover:scale-105 transition-all z-50 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </main>
  );
}
