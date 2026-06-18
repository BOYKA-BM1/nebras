import teacher1 from "@/assets/teacher-1.jpg";
import teacher2 from "@/assets/teacher-2.jpg";
import teacher3 from "@/assets/teacher-3.jpg";
import teacher4 from "@/assets/teacher-4.jpg";
import teacher5 from "@/assets/teacher-5.jpg";
import teacher6 from "@/assets/teacher-6.jpg";

/* ===================== المراحل والصفوف الدراسية ===================== */

export type StageId = "primary" | "prep" | "secondary";
export type TrackId = "all" | "science_sci" | "science_math" | "literary";

export const stages = [
  {
    id: "primary" as StageId,
    name: "المرحلة الابتدائية",
    short: "ابتدائي",
    description: "تأسيس قوي لطلاب الصفوف من الأول حتى السادس الابتدائي.",
    grades: [
      "الصف الأول الابتدائي",
      "الصف الثاني الابتدائي",
      "الصف الثالث الابتدائي",
      "الصف الرابع الابتدائي",
      "الصف الخامس الابتدائي",
      "الصف السادس الابتدائي",
    ],
    icon: "BookA",
  },
  {
    id: "prep" as StageId,
    name: "المرحلة الإعدادية",
    short: "إعدادي",
    description: "شرح متكامل لصفوف الأول والثاني والثالث الإعدادي بكل المواد.",
    grades: [
      "الصف الأول الإعدادي",
      "الصف الثاني الإعدادي",
      "الصف الثالث الإعدادي",
    ],
    icon: "Library",
  },
  {
    id: "secondary" as StageId,
    name: "المرحلة الثانوية",
    short: "ثانوي",
    description:
      "الصف الأول والثاني والثالث الثانوي، بكل الشُّعب: علمي علوم، علمي رياضة، وأدبي.",
    grades: [
      "الصف الأول الثانوي",
      "الصف الثاني الثانوي",
      "الصف الثالث الثانوي",
    ],
    icon: "GraduationCap",
  },
] as const;

export const tracks = [
  { id: "all" as TrackId, label: "كل الشُّعب" },
  { id: "science_sci" as TrackId, label: "علمي علوم" },
  { id: "science_math" as TrackId, label: "علمي رياضة" },
  { id: "literary" as TrackId, label: "أدبي" },
] as const;

/* ===================== المدرّسون ===================== */

export const teachers = [
  {
    id: 1,
    name: "أ. أحمد عبد الباسط",
    subject: "الرياضيات",
    image: teacher1,
    students: "12k+",
    courses: 7,
    rating: 4.9,
    bio: "خبرة 15 عامًا في تدريس الرياضيات للثانوية العامة والإعدادي.",
  },
  {
    id: 2,
    name: "أ. منى يوسف",
    subject: "الأحياء",
    image: teacher2,
    students: "9k+",
    courses: 5,
    rating: 4.8,
    bio: "متخصصة في الأحياء بأسلوب مبسّط يربط المنهج بالحياة العملية.",
  },
  {
    id: 3,
    name: "أ. كريم الشريف",
    subject: "الفيزياء",
    image: teacher3,
    students: "11k+",
    courses: 8,
    rating: 4.9,
    bio: "شرح الفيزياء بالتطبيقات والمسائل المحلولة وامتحانات محاكية.",
  },
  {
    id: 4,
    name: "أ. هشام الجندي",
    subject: "الكيمياء",
    image: teacher4,
    students: "8k+",
    courses: 6,
    rating: 4.8,
    bio: "كيمياء عضوية وغير عضوية بطريقة سهلة الفهم والحفظ.",
  },
  {
    id: 5,
    name: "أ. سلمى عبد الرحمن",
    subject: "اللغة العربية",
    image: teacher5,
    students: "10k+",
    courses: 6,
    rating: 4.9,
    bio: "نحو وبلاغة وأدب وتعبير لكل المراحل بأسلوب شيّق.",
  },
  {
    id: 6,
    name: "أ. مارك نبيل",
    subject: "اللغة الإنجليزية",
    image: teacher6,
    students: "13k+",
    courses: 9,
    rating: 4.9,
    bio: "Grammar وVocabulary وProse مع تدريب مكثّف على الامتحانات.",
  },
] as const;

/* ===================== الدورات ===================== */

export type Course = {
  id: number;
  title: string;
  teacher: string;
  teacherImage: string;
  stage: StageId;
  grade: string;
  track: TrackId;
  subject: string;
  lessons: number;
  videos: number;
  hours: number;
  price: number;
  oldPrice?: number;
  liveSessions: number;
  details: string;
  badge: string;
};

export const courses: Course[] = [
  {
    id: 1,
    title: "الرياضيات — الصف الثالث الثانوي (علمي رياضة)",
    teacher: "أ. أحمد عبد الباسط",
    teacherImage: teacher1,
    stage: "secondary",
    grade: "الصف الثالث الثانوي",
    track: "science_math",
    subject: "الرياضيات",
    lessons: 96,
    videos: 88,
    hours: 64,
    price: 1200,
    oldPrice: 1600,
    liveSessions: 24,
    details: "جبر وتفاضل وتكامل وهندسة فراغية، مع بث مباشر أسبوعي ومراجعات نهائية.",
    badge: "الأكثر طلبًا",
  },
  {
    id: 2,
    title: "الفيزياء — الصف الثالث الثانوي (علمي)",
    teacher: "أ. كريم الشريف",
    teacherImage: teacher3,
    stage: "secondary",
    grade: "الصف الثالث الثانوي",
    track: "science_sci",
    subject: "الفيزياء",
    lessons: 84,
    videos: 76,
    hours: 58,
    price: 1100,
    oldPrice: 1450,
    liveSessions: 20,
    details: "كل وحدات المنهج بالمسائل المحلولة وحصص Zoom مباشرة للأسئلة.",
    badge: "علمي",
  },
  {
    id: 3,
    title: "الأحياء — الصف الثالث الثانوي (علمي علوم)",
    teacher: "أ. منى يوسف",
    teacherImage: teacher2,
    stage: "secondary",
    grade: "الصف الثالث الثانوي",
    track: "science_sci",
    subject: "الأحياء",
    lessons: 70,
    videos: 64,
    hours: 46,
    price: 1000,
    liveSessions: 16,
    details: "وحدات المناعة والاتصال العصبي والوراثة بشرح مبسّط ورسومات توضيحية.",
    badge: "علوم",
  },
  {
    id: 4,
    title: "الكيمياء — الصف الثاني الثانوي (علمي)",
    teacher: "أ. هشام الجندي",
    teacherImage: teacher4,
    stage: "secondary",
    grade: "الصف الثاني الثانوي",
    track: "science_sci",
    subject: "الكيمياء",
    lessons: 60,
    videos: 54,
    hours: 40,
    price: 850,
    liveSessions: 14,
    details: "التحولات الطاقوية والكيمياء العضوية مع تجارب مصوّرة وامتحانات.",
    badge: "كيمياء",
  },
  {
    id: 5,
    title: "اللغة العربية — الصف الثالث الثانوي (لكل الشُّعب)",
    teacher: "أ. سلمى عبد الرحمن",
    teacherImage: teacher5,
    stage: "secondary",
    grade: "الصف الثالث الثانوي",
    track: "all",
    subject: "اللغة العربية",
    lessons: 72,
    videos: 66,
    hours: 48,
    price: 900,
    oldPrice: 1150,
    liveSessions: 18,
    details: "نحو وأدب وبلاغة ونصوص وتعبير، مع تصحيح مباشر في حصص Zoom.",
    badge: "لكل الشُّعب",
  },
  {
    id: 6,
    title: "اللغة الإنجليزية — الصف الثالث الثانوي (لكل الشُّعب)",
    teacher: "أ. مارك نبيل",
    teacherImage: teacher6,
    stage: "secondary",
    grade: "الصف الثالث الثانوي",
    track: "all",
    subject: "اللغة الإنجليزية",
    lessons: 80,
    videos: 74,
    hours: 52,
    price: 950,
    oldPrice: 1250,
    liveSessions: 20,
    details: "Grammar وVocabulary وTranslation وProse مع تدريب مكثف على الامتحان.",
    badge: "الأعلى تقييمًا",
  },
  {
    id: 7,
    title: "الأدبي — التاريخ والجغرافيا (الصف الثالث الثانوي)",
    teacher: "أ. سلمى عبد الرحمن",
    teacherImage: teacher5,
    stage: "secondary",
    grade: "الصف الثالث الثانوي",
    track: "literary",
    subject: "الدراسات الأدبية",
    lessons: 64,
    videos: 58,
    hours: 42,
    price: 850,
    liveSessions: 16,
    details: "تاريخ وجغرافيا وفلسفة ومنطق للشعبة الأدبية مع خرائط ومخططات.",
    badge: "أدبي",
  },
  {
    id: 8,
    title: "المواد الأساسية — الصف الثالث الإعدادي",
    teacher: "أ. أحمد عبد الباسط",
    teacherImage: teacher1,
    stage: "prep",
    grade: "الصف الثالث الإعدادي",
    track: "all",
    subject: "متعدد المواد",
    lessons: 120,
    videos: 110,
    hours: 70,
    price: 700,
    oldPrice: 950,
    liveSessions: 24,
    details: "رياضيات وعلوم ودراسات ولغات، تأسيس قوي قبل المرحلة الثانوية.",
    badge: "إعدادي",
  },
  {
    id: 9,
    title: "العلوم والرياضيات — الصف الأول الإعدادي",
    teacher: "أ. هشام الجندي",
    teacherImage: teacher4,
    stage: "prep",
    grade: "الصف الأول الإعدادي",
    track: "all",
    subject: "علوم ورياضيات",
    lessons: 90,
    videos: 82,
    hours: 54,
    price: 600,
    liveSessions: 18,
    details: "شرح مبسّط للعلوم والرياضيات مع أنشطة تفاعلية ومتابعة مستمرة.",
    badge: "إعدادي",
  },
  {
    id: 10,
    title: "تأسيس اللغة الإنجليزية — الصف الرابع الابتدائي",
    teacher: "أ. مارك نبيل",
    teacherImage: teacher6,
    stage: "primary",
    grade: "الصف الرابع الابتدائي",
    track: "all",
    subject: "اللغة الإنجليزية",
    lessons: 60,
    videos: 56,
    hours: 32,
    price: 450,
    liveSessions: 12,
    details: "تأسيس قراءة وكتابة ومحادثة بطريقة ممتعة ومناسبة لسن الطفل.",
    badge: "ابتدائي",
  },
  {
    id: 11,
    title: "اللغة العربية والحساب — الصف الثاني الابتدائي",
    teacher: "أ. سلمى عبد الرحمن",
    teacherImage: teacher5,
    stage: "primary",
    grade: "الصف الثاني الابتدائي",
    track: "all",
    subject: "عربي وحساب",
    lessons: 54,
    videos: 50,
    hours: 28,
    price: 400,
    liveSessions: 10,
    details: "تأسيس القراءة والكتابة والحساب بأسلوب الألعاب التعليمية.",
    badge: "ابتدائي",
  },
  {
    id: 12,
    title: "الرياضيات — الصف الأول الثانوي",
    teacher: "أ. أحمد عبد الباسط",
    teacherImage: teacher1,
    stage: "secondary",
    grade: "الصف الأول الثانوي",
    track: "all",
    subject: "الرياضيات",
    lessons: 70,
    videos: 64,
    hours: 44,
    price: 750,
    liveSessions: 16,
    details: "جبر وهندسة وحساب مثلثات، تأسيس قوي لطلاب أولى ثانوي.",
    badge: "ثانوي",
  },
];

/* ===================== مميزات المحاضرات ===================== */

export const lectureFeatures = [
  {
    icon: "Video",
    title: "حصص مباشرة عبر ZOOM و GOOGLE MEET",
    text: "بث مباشر تفاعلي مع المدرّس عبر ZOOM و GOOGLE MEET، تسأل وتشارك لحظة بلحظة، وكل حصة تتسجّل بالكامل.",
  },
  {
    icon: "PlayCircle",
    title: "محاضرات مسجّلة بالكامل",
    text: "كل حصة تُسجَّل بالكامل وتتاح لك في أي وقت، تعيدها وتراجعها بلا حدود.",
  },
  {
    icon: "MessageSquare",
    title: "تفاعل ودردشة مباشرة",
    text: "اسأل أثناء البث، شارك في الاستطلاعات، وتلقّى إجابات فورية من المدرّس.",
  },
  {
    icon: "FileCheck2",
    title: "امتحانات وواجبات",
    text: "اختبارات إلكترونية بعد كل وحدة مع تصحيح فوري وتقرير لمستواك.",
  },
  {
    icon: "Bell",
    title: "تنبيهات المواعيد",
    text: "تذكير قبل كل حصة مباشرة حتى لا تفوّت أي محاضرة.",
  },
  {
    icon: "Smartphone",
    title: "متاح على كل الأجهزة",
    text: "تابع من الموبايل أو الكمبيوتر، في أي مكان وأي وقت.",
  },
] as const;

/* ===================== الأسئلة الشائعة ===================== */

export const faqs = [
  {
    q: "إزاي أحجز دورة على المنصة؟",
    a: "سجّل دخولك أولًا بالبريد الإلكتروني أو حساب جوجل أو آبل، ثم اختر الدورة المناسبة لصفّك واضغط «احجز الآن»، وهتلاقيها مباشرة في لوحة التحكم بتاعتك.",
  },
  {
    q: "المحاضرات مباشرة ولا مسجّلة؟",
    a: "الاتنين! عندنا حصص مباشرة تفاعلية عبر Zoom تقدر تسأل فيها المدرّس، وكمان كل الحصص بتتسجّل بالكامل وتقدر تشوفها في أي وقت وتعيدها زي ما تحب.",
  },
  {
    q: "المنصة بتغطي أي مراحل دراسية؟",
    a: "بنغطي الابتدائي بكل سنينه، والإعدادي بكل سنينه، والثانوي بكل سنينه وكل الشُّعب: علمي علوم، علمي رياضة، وأدبي.",
  },
  {
    q: "أقدر أدفع وأحجز إزاي؟",
    a: "بعد تسجيل الدخول تختار الدورة وتضغط احجز، ويتحجزلك مكان في الدورة ويظهر السعر في ملخص الحجز. الدفع الإلكتروني هيتفعّل قريبًا.",
  },
  {
    q: "نسيت كلمة المرور، أعملها إزاي؟",
    a: "من صفحة تسجيل الدخول اضغط «نسيت كلمة المرور؟»، أدخل بريدك، وهيوصلك رابط لإعادة التعيين بسهولة وأمان.",
  },
];

export const navLinks = [
  { label: "الرئيسية", href: "/#home", gated: false },
  { label: "الدورات", href: "/courses", gated: true },
  { label: "المحاضرات", href: "/lectures", gated: true },
  { label: "المساعدة", href: "/#help", gated: false },
];
