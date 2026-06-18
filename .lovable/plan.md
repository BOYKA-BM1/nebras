# خطة تطوير منصة نبراس — تنفيذ على مراحل

الخطة دي ضخمة جدًا (نظام LMS متكامل)، ومستحيل تتعمل في خطوة واحدة بجودة كويسة. فهنقسّمها لـ 7 مراحل بالترتيب اللي طلبته، ونخلّص كل مرحلة ونراجعها مع بعض قبل ما ننتقل للي بعدها.

**القرارات المتفق عليها:** صلاحيات Admin + Teacher · فيديو على Bunny Stream · دفع عبر Paymob.

---

## المرحلة 1 — الأساس: قاعدة البيانات + الصلاحيات + لوحة الإدارة
دي أهم مرحلة لأن كل اللي بعدها بيتبنى عليها. هننقل كل البيانات الثابتة من الكود للداتابيز.

**قاعدة البيانات (جداول جديدة):**
- `user_roles` (جدول منفصل + enum `app_role`: admin/teacher/student) + دالة `has_role` آمنة — عشان منع تصعيد الصلاحيات.
- `stages` (المراحل الدراسية: ابتدائي/إعدادي/ثانوي + الشُّعب علمي/أدبي/رياضة).
- `teachers` (الاسم، الصورة، المادة، النبذة، سنوات الخبرة).
- `courses` (العنوان، الوصف، السعر، الخصم، الصورة، ربط بالمرحلة والمدرس، live/recorded).
- تحديث `bookings` لتربط بالـ courses الجديدة في الداتابيز.
- تخزين الصور عبر Storage bucket (`course-images`, `teacher-images`).
- سياسات RLS: القراءة عامة للدورات/المدرسين/المراحل، والتعديل للـ admin فقط (والمدرس على دوراته في مرحلة 2).

**لوحة الإدارة `/_authenticated/admin`:**
- محمية بدور admin.
- إدارة الدورات (إضافة/تعديل/حذف + رفع صورة + سعر + مرحلة + مدرس).
- إدارة المدرسين (إضافة/تعديل/حذف + صورة + نبذة + مادة + خبرة).
- إدارة المراحل الدراسية.
- نظرة عامة (عدد الطلاب/الدورات/المدرسين/الحجوزات).

**الواجهة:** تحديث `Courses.tsx` و`Teachers.tsx` و`Stages.tsx` ليقرأوا من الداتابيز بدل `src/data/site.ts`.

---

## المرحلة 2 — نظام المحتوى والفيديو (Bunny Stream)
- جداول `sections` (وحدات) و`lessons` (دروس) مربوطة بالدورة.
- كل درس: فيديو (Bunny)، ملف PDF، واجب، ملاحظات.
- لوحة المدرس `/_authenticated/teacher`: رفع الفيديوهات والملفات وإدارة دروسه.
- تكامل Bunny Stream لحماية الفيديوهات (signed URLs) — هيحتاج مفتاح API نخزّنه بأمان.
- مشغّل فيديو داخل صفحة الدرس مع حفظ آخر دقيقة شاهدها الطالب.

---

## المرحلة 3 — تتبع التقدم وتجربة الطالب
- جدول `lesson_progress` (نسبة الإكمال + آخر موضع).
- شريط تقدم لكل دورة (مثال: 65%).
- نظام المفضلة (دورات/دروس/ملفات).

---

## المرحلة 4 — الدفع الإلكتروني (Paymob)
- تكامل Paymob (Visa/MasterCard/Meeza/Vodafone Cash) عبر server route للـ webhook.
- جدول `enrollments`/`payments` + ربط الشراء بفتح الدورة.
- نظام كوبونات الخصم.

---

## المرحلة 5 — الامتحانات والتقييم
- بنك أسئلة (`questions`) + اختبارات (`quizzes`/`exams`) لكل درس/وحدة.
- أنواع: اختيار متعدد / صح وخطأ / مقالي.
- تصحيح تلقائي + تحليل نقاط القوة والضعف.

---

## المرحلة 6 — لوحة الإدارة المتقدمة + الإشعارات
- إحصائيات إيرادات/اشتراكات + إدارة المستخدمين (إيقاف/حذف).
- إحصائيات المدرس (مشاهدات/طلاب/نسب نجاح).
- إشعارات داخل المنصة + بريد إلكتروني (درس جديد/امتحان/شراء).

---

## المرحلة 7 — الذكاء الاصطناعي والتحسينات التقنية
- مساعد تعليمي ذكي (عبر Lovable AI).
- توليد أسئلة تلقائيًا من المحتوى.
- Analytics (سلوك المستخدمين) + تتبع أخطاء.

---

## التفاصيل التقنية للمرحلة 1 (اللي هنبدأ بيها الآن)

```text
الجداول الجديدة:
  app_role (enum)        admin | teacher | student
  user_roles             user_id, role  → has_role() security definer
  stages                 name, level, track, order
  teachers               name, subject, bio, experience_years, image_url
  courses                title, description, price, discount_price,
                         image_url, stage_id, teacher_id, type(live/recorded),
                         lessons_count, is_published
  bookings (تعديل)        course_id → courses.id

الصلاحيات (RLS):
  courses/teachers/stages → SELECT للجميع (anon+authenticated)
  courses/teachers/stages → INSERT/UPDATE/DELETE لـ admin فقط
  user_roles             → SELECT authenticated، الإدارة عبر admin

التخزين:
  bucket: course-images (عام)
  bucket: teacher-images (عام)

المسارات الجديدة:
  /_authenticated/admin            (نظرة عامة)
  /_authenticated/admin/courses    (إدارة الدورات)
  /_authenticated/admin/teachers   (إدارة المدرسين)
  /_authenticated/admin/stages     (إدارة المراحل)

السيرفر (createServerFn):
  courses.functions.ts   list/create/update/delete (admin محمي)
  teachers.functions.ts  list/create/update/delete
  stages.functions.ts    list/create/update/delete
```

**ملاحظة مهمة:** أول حساب admin هيتعيّن يدويًا في الداتابيز (هنضيف صفك كـ admin بعد ما تسجّل دخول)، لأن مفيش حد المفروض يقدر يدّي نفسه صلاحية admin من الواجهة.

بعد موافقتك على الخطة هبدأ فورًا بمايجريشن المرحلة 1 (الجداول + الصلاحيات + التخزين)، وبعدها أبني لوحة الإدارة.
---

## ✅ سجلّ التنفيذ (محدّث)

- **المرحلة 1** — تمّت: قاعدة البيانات + الصلاحيات + لوحة الإدارة.
- **المرحلة 2** — تمّت: جداول `sections`/`lessons` (فيديو Bunny/YouTube/mp4 + PDF + درس مجاني)، صفحة تفاصيل الدورة `/courses/$id`، مشغّل الدرس `/learn/$id`، إدارة المحتوى `/manage/$id` (أدمن + مدرّس)، لوحة المدرّس `/teacher`.
- **المرحلة 3** — تمّت: `lesson_progress` (شريط تقدّم + تحديد كمكتمل + حفظ الموضع) + المفضّلة `favorites`.
- **المرحلة 4** — جزئيًا: الاشتراك `enrollments` + تسجيل `payments` + كوبونات `/admin/coupons`. **ناقص للتشغيل الحيّ:** ربط بوابة Paymob فعليًا (يحتاج مفاتيح API).
- **المرحلة 5** — قاعدة البيانات جاهزة (`quizzes`/`questions`/`quiz_attempts`)، وواجهة الامتحانات لسه.
- **المرحلة 6** — جزئيًا: إحصائيات الإيرادات/الاشتراكات في لوحة الإدارة + الكوبونات. جدول `notifications` جاهز، الواجهة لسه.
- **المرحلة 7** — لسه (مساعد AI + توليد أسئلة + Analytics).

### محتاج منك عشان نكمّل التشغيل الحيّ:
- **Paymob**: مفاتيح API (API Key + Integration ID + HMAC) لربط الدفع الفعلي.
- **Bunny Stream**: مفتاح API لحماية الفيديوهات بروابط موقّعة (دلوقتي بنشغّل الرابط مباشرة).
