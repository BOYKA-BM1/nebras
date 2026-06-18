import { useMemo } from "react";
import { BookOpen, PlayCircle, Video, Clock, Check, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { resolveImage } from "@/lib/catalog";
import { useCourses } from "@/hooks/use-catalog";
import { useMyEnrollments } from "@/hooks/use-content";
import { useProfile } from "@/hooks/use-profile";
import { filterCoursesForProfile } from "@/lib/course-filter";

export function Courses({ hideHeader = false }: { hideHeader?: boolean }) {
  const { data: courses = [], isLoading } = useCourses();
  const { data: enrollments = [] } = useMyEnrollments();
  const { data: profile } = useProfile();
  const enrolledIds = useMemo(() => new Set(enrollments.map((e) => e.course_id)), [enrollments]);

  // اعرض فقط دورات سنة/مرحلة الطالب
  const filtered = useMemo(
    () => filterCoursesForProfile(courses, profile),
    [courses, profile],
  );

  return (
    <section id="courses" className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-primary/5 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {!hideHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">الدورات</span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              دورات <span className="text-gradient-gold">سنتك الدراسية</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              كل الدورات المتاحة لسنتك مع أفضل المدرّسين، حصص مباشرة ومحاضرات مسجّلة بالكامل.
            </p>
          </div>
        )}

        {profile?.grade && (
          <div className="mt-8 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-bold text-primary">
              <BookOpen className="h-4 w-4" /> {profile.grade}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => {
              const isEnrolled = enrolledIds.has(course.id);
              const teacherImg = resolveImage(course.teacher?.image_url);
              return (
                <article
                  key={course.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1.5 hover:border-primary/50"
                >
                  <div className="relative flex items-center gap-3 border-b border-border/60 bg-gradient-to-l from-primary/10 to-transparent p-5">
                    {teacherImg ? (
                      <img
                        src={teacherImg}
                        alt={course.teacher?.name ?? ""}
                        loading="lazy"
                        width={512}
                        height={512}
                        className="h-14 w-14 rounded-full border-2 border-primary/50 object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/15 text-lg font-extrabold text-primary">
                        {(course.teacher?.name ?? "؟").trim().charAt(0)}
                      </span>
                    )}
                    <div>
                      {course.teacher_id ? (
                        <Link
                          to="/teachers/$teacherId"
                          params={{ teacherId: course.teacher_id }}
                          className="text-sm font-bold text-foreground hover:text-primary"
                        >
                          {course.teacher?.name ?? "مدرّس"}
                        </Link>
                      ) : (
                        <p className="text-sm font-bold text-foreground">{course.teacher?.name ?? "مدرّس"}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{course.subject}</p>
                    </div>
                    {course.badge && (
                      <span className="absolute left-4 top-4 rounded-full bg-gradient-gold px-3 py-1 text-xs font-bold text-primary-foreground">
                        {course.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold leading-snug">{course.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {course.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {course.live_sessions > 0 && (
                        <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          <Video className="h-3.5 w-3.5" />
                          {course.live_sessions} حصة مباشرة
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold">
                        <PlayCircle className="h-3.5 w-3.5 text-primary" />
                        مسجّلة بالكامل
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {course.lessons_count} درس
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        {course.hours} ساعة
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                      <div className="flex flex-col">
                        {course.old_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {course.old_price} ج.م
                          </span>
                        )}
                        <span className="text-xl font-extrabold text-gradient-gold">
                          {course.price === 0 ? "مجانًا" : `${course.price} ج.م`}
                        </span>
                      </div>
                      {isEnrolled ? (
                        <Link
                          to="/learn/$courseId"
                          params={{ courseId: course.id }}
                          className="flex items-center gap-1.5 rounded-xl bg-primary/15 px-4 py-2 text-sm font-bold text-primary"
                        >
                          <Check className="h-4 w-4" />
                          ادخل الدورة
                        </Link>
                      ) : (
                        <Link
                          to="/courses/$courseId"
                          params={{ courseId: course.id }}
                          className="flex items-center gap-2 rounded-xl bg-gradient-gold px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.04]"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          التفاصيل
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">
            مفيش دورات متاحة لسنتك دلوقتي، تابعنا قريبًا هنضيف المزيد 💪
          </p>
        )}
      </div>
    </section>
  );
}
