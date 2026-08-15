"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPerson, updatePerson, Person } from "@/app/actions";
import toast from "react-hot-toast";
import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

type Props = {
  initialData?: Person;
};

export default function PersonForm({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    idNumber: initialData?.idNumber || "",
    mhrsPassword: initialData?.mhrsPassword || "",
    eDevletPassword: initialData?.eDevletPassword || "",
    eNabizPassword: initialData?.eNabizPassword || "",
    dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split("T")[0] : "",
    notes: initialData?.notes || "",
    appointmentDate: initialData?.appointmentDate ? new Date(initialData.appointmentDate).toISOString().slice(0, 16) : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.idNumber) {
      toast.error("الاسم ورقم الهوية مطلوبان");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        idNumber: formData.idNumber,
        mhrsPassword: formData.mhrsPassword || null,
        eDevletPassword: formData.eDevletPassword || null,
        eNabizPassword: formData.eNabizPassword || null,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
        notes: formData.notes || null,
        appointmentDate: formData.appointmentDate ? new Date(formData.appointmentDate) : null,
      };

      if (initialData?.id) {
        await updatePerson(initialData.id, payload);
        toast.success("تم التحديث بنجاح");
        router.push(`/person/${initialData.id}`);
      } else {
        const id = await createPerson(payload);
        toast.success("تمت الإضافة بنجاح");
        router.push(`/`);
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-4 pb-24 min-h-screen">
      <header className="flex items-center gap-4 py-6">
        <Link href={initialData?.id ? `/person/${initialData.id}` : "/"} className="p-2 bg-card rounded-full shadow-sm border border-border hover:bg-muted transition-colors">
          <ArrowRight className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          {initialData ? "تعديل البيانات" : "إضافة شخص جديد"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">الاسم الكامل *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full bg-background border border-border rounded-xl p-3 focus:ring-primary focus:border-primary text-foreground"
            placeholder="مثال: أحمد محمد"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">رقم الهوية *</label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            required
            className="w-full bg-background border border-border rounded-xl p-3 focus:ring-primary focus:border-primary text-foreground text-left"
            dir="ltr"
            placeholder="12345678901"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">تاريخ الميلاد</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl p-3 focus:ring-primary focus:border-primary text-foreground text-left"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">تاريخ ووقت الموعد</label>
            <input
              type="datetime-local"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl p-3 focus:ring-primary focus:border-primary text-foreground text-left"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6 mt-6">
          <h3 className="font-semibold text-lg text-foreground">كلمات المرور (اختياري)</h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">كلمة سر MHRS</label>
            <input
              type="text"
              name="mhrsPassword"
              value={formData.mhrsPassword}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl p-3 focus:ring-primary focus:border-primary text-foreground text-left font-mono"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">كلمة سر E-Devlet</label>
            <input
              type="text"
              name="eDevletPassword"
              value={formData.eDevletPassword}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl p-3 focus:ring-primary focus:border-primary text-foreground text-left font-mono"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">كلمة سر E-Nabız</label>
            <input
              type="text"
              name="eNabizPassword"
              value={formData.eNabizPassword}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl p-3 focus:ring-primary focus:border-primary text-foreground text-left font-mono"
              dir="ltr"
            />
          </div>
        </div>

        <div className="border-t border-border pt-6 mt-6">
          <label className="block text-sm font-medium text-foreground mb-1">ملاحظات</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full bg-background border border-border rounded-xl p-3 focus:ring-primary focus:border-primary text-foreground"
            placeholder="أضف أي ملاحظات إضافية هنا..."
          ></textarea>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground p-4 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            <Save className="w-5 h-5" />
            {loading ? "جاري الحفظ..." : "حفظ البيانات"}
          </button>
        </div>
      </form>
    </main>
  );
}
