import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  subject: z.string().min(1),
  bio: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  experience_years: z.number().optional(),
  teacher_id: z.string().uuid().optional().nullable(),
});

export const createTeacherAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // تأكّد إن اللي بينفّذ الأمر أدمن
    const { data: adminRows, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .limit(1);
    if (roleErr) throw new Error("تعذّر التحقق من الصلاحيات.");
    if (!adminRows || adminRows.length === 0) {
      throw new Error("غير مصرّح: هذه العملية للإدارة فقط.");
    }

    // أنشئ حساب المدرّس (مؤكّد البريد مباشرة)
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.name },
    });

    if (createErr || !created?.user) {
      const msg = createErr?.message ?? "";
      if (/already.*registered|already.*exists|duplicate/i.test(msg)) {
        throw new Error("هذا البريد مسجّل بالفعل.");
      }
      throw new Error("تعذّر إنشاء الحساب: " + msg);
    }

    const newUserId = created.user.id;

    // امنحه دور المدرّس
    const { error: roleInsErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUserId, role: "teacher" });
    if (roleInsErr && !/duplicate|unique/i.test(roleInsErr.message)) {
      throw new Error("تعذّر منح صلاحية المدرّس.");
    }

    // اربط/أنشئ سجل المدرّس
    let teacherId = data.teacher_id ?? null;
    if (teacherId) {
      const { error: linkErr } = await supabaseAdmin
        .from("teachers")
        .update({ user_id: newUserId })
        .eq("id", teacherId);
      if (linkErr) throw new Error("تعذّر ربط حساب المدرّس بالسجل.");
    } else {
      const { data: teacherRow, error: insErr } = await supabaseAdmin
        .from("teachers")
        .insert({
          name: data.name,
          subject: data.subject,
          bio: data.bio ?? null,
          image_url: data.image_url ?? null,
          experience_years: data.experience_years ?? 0,
          user_id: newUserId,
        })
        .select("id")
        .single();
      if (insErr || !teacherRow) throw new Error("تعذّر إنشاء سجل المدرّس.");
      teacherId = teacherRow.id;
    }

    return { userId: newUserId, teacherId, email: data.email };
  });
