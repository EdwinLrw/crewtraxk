export type Language = "en" | "es";

export const messages = {
  en: {
    appName: "Crew Traxk",
    subtitle: "Crew Management System",

    dashboard: "Dashboard",
    jobs: "Jobs",
    workers: "Workers",
    clock: "Clock",
    clockIn: "Clock In",
    clockOut: "Clock Out",
    clockInOut: "Clock In / Out",
    reports: "Reports",
    invoices: "Invoices",
    inspections: "Inspections",
    admin: "Admin",
    worker: "Worker",
    login: "Login",
    logout: "Logout",
    projects: "Projects",
    company: "Company",

    loggedInAs: "Logged in as",
    quickLinks: "Quick Links",
    status: "Status",
    loading: "Loading...",
    noClient: "No client",
    noRole: "No role",
    noPhone: "No phone",

    activeJobs: "Active Jobs",
    openClockIns: "Open Clock-ins",
    crewManagementDescription:
      "Construction crew management for jobs, hours, reports, invoices, and inspections.",

    workerDashboard: "Worker Dashboard",
    submitDailyReport: "Submit Daily Report",
    sendLoginLink: "Send Login Link",
    checkEmailForLogin: "Check your email for login link.",
    email: "Email",

    jobName: "Job name",
    address: "Address",
    clientName: "Client name",
    startDate: "Start date",
    addJob: "Add Job",
    delete: "Delete",
    selectJob: "Select job",
    selectWorker: "Select worker",

    role: "Role",
    phone: "Phone",
    workerName: "Worker name",
    addWorker: "Add Worker",

    statusLabel: "Status",
    clockedOut: "Clocked Out",
    clockedInOn: "Clocked In on",
    clockInTime: "Clock In Time",
    lastHoursWorked: "Last Hours Worked",
    addWorkerAndJobFirst: "Add a worker and a job first.",
    noActiveClockInFound: "No active clock-in found.",

    workersOnSite: "Workers on site",
    hoursWorked: "Hours worked",
    materialsUsed: "Materials used",
    workCompletedToday: "Work completed today",
    startVoiceReport: "Start Voice Report",
    listening: "Listening...",
    stopVoice: "Stop Voice",
    submitReport: "Submit Report",
    dailyReports: "Daily Reports",
    selectAJob: "Select a job.",

    invoiceType: "Invoice type",
    amount: "Amount",
    dueDate: "Due date",
    notes: "Notes / payment instructions",
    createInvoice: "Create Invoice",
    markPaid: "Mark Paid",
    deposit: "Deposit",
    progress: "Progress",
    final: "Final",
    custom: "Custom",
    pending: "Pending",
    sent: "Sent",
    paid: "Paid",
    due: "Due",
    type: "Type",

    inspectionType: "Inspection type",
    addInspection: "Add Inspection",
    scheduled: "Scheduled",
    passed: "Passed",
    failed: "Failed",
    plumbing: "Plumbing",
    electrical: "Electrical",
    inspectionFinal: "Final",

    timeEntries: "Time Entries",

    loginHeroTitle: "Run your crew with confidence",
    loginHeroSubtitle:
      "Login for daily reports, worker tools, job tracking, payroll-ready time entries, invoices, and inspections.",
    loginFeature1: "Fast access with Google or secure email login links",
    loginFeature2: "Admin dashboards for jobs, reports, and crew management",
    loginFeature3: "Built for field teams, office teams, and subcontractors",
    loginFormSubtitle:
      "Sign in with Google or get a secure login link by email.",
    emailPlaceholder: "name@company.com",
    sendingLoginLink: "Sending login link...",
    orContinueWith: "OR CONTINUE WITH",
    google: "Google",
    openingGoogle: "Opening Google...",
    newCompany: "New company?",
    newCompanyText:
      "Start with a trial and set up your crew, jobs, and admin access.",
    startFreeTrial: "Start free trial",
    enterEmail: "Please enter your email.",

    pricingTitle: "Choose your CrewTraxk plan",
    pricingSubtitle:
      "Start your membership and get your crew, jobs, reports, payroll-ready time, invoices, and inspections organized in one place.",
    starterPlan: "Starter",
    proPlan: "Pro",
    businessPlan: "Business",
    mostPopular: "Most Popular",
    starterPlanSubtitle: "Best for smaller crews getting set up fast.",
    proPlanSubtitle: "Best for growing contractors and office teams.",
    businessPlanSubtitle:
      "Best for larger operations and more admin control.",
    startStarter: "Start Starter",
    startPro: "Start Pro",
    startBusiness: "Start Business",
    openingCheckout: "Opening checkout...",
    upTo10Workers: "Up to 10 workers",
    upTo30Workers: "Up to 30 workers",
    upTo100Workers: "Up to 100 workers",
    jobTracking: "Job tracking",
    timeTracking: "Time tracking",
    everythingInStarter: "Everything in Starter",
    everythingInPro: "Everything in Pro",
    subcontractorTracking: "Subcontractor tracking",
    prioritySupport: "Priority support",
    moreAdminAccess: "More admin access",
    scaleReadySetup: "Scale-ready setup",

    paymentSuccessful: "Payment successful",
    subscriptionCompleted:
      "Your subscription checkout was completed successfully.",
    almostDone: "You’re almost done",
    membershipFinalizing:
      "Your CrewTraxk membership is being finalized. You can now go back and sign in to continue setup.",
    goToLogin: "Go to login",

    checkoutCanceled: "Checkout canceled",
    subscriptionNotStarted: "No worries — your subscription was not started.",
    wantToTryAgain: "Want to try again?",
    choosePlanAgain:
      "Go back to pricing and choose the plan that fits your crew best.",
    backToPricing: "Back to pricing",
  },

  es: {
    appName: "Crew Traxk",
    subtitle: "Sistema de Gestión de Cuadrilla",

    dashboard: "Panel",
    jobs: "Trabajos",
    workers: "Trabajadores",
    clock: "Reloj",
    clockIn: "Marcar entrada",
    clockOut: "Marcar salida",
    clockInOut: "Marcar entrada / salida",
    reports: "Reportes",
    invoices: "Facturas",
    inspections: "Inspecciones",
    admin: "Administración",
    worker: "Trabajador",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    projects: "Proyectos",
    company: "Empresa",

    loggedInAs: "Conectado como",
    quickLinks: "Accesos rápidos",
    status: "Estado",
    loading: "Cargando...",
    noClient: "Sin cliente",
    noRole: "Sin puesto",
    noPhone: "Sin teléfono",

    activeJobs: "Trabajos activos",
    openClockIns: "Entradas abiertas",
    crewManagementDescription:
      "Gestión de cuadrilla para trabajos, horas, reportes, facturas e inspecciones.",

    workerDashboard: "Panel del Trabajador",
    submitDailyReport: "Enviar Reporte Diario",
    sendLoginLink: "Enviar enlace de acceso",
    checkEmailForLogin: "Revisa tu correo para el enlace de acceso.",
    email: "Correo electrónico",

    jobName: "Nombre del trabajo",
    address: "Dirección",
    clientName: "Nombre del cliente",
    startDate: "Fecha de inicio",
    addJob: "Agregar trabajo",
    delete: "Eliminar",
    selectJob: "Seleccionar trabajo",
    selectWorker: "Seleccionar trabajador",

    role: "Puesto",
    phone: "Teléfono",
    workerName: "Nombre del trabajador",
    addWorker: "Agregar trabajador",

    statusLabel: "Estado",
    clockedOut: "Fuera de horario",
    clockedInOn: "Marcó entrada en",
    clockInTime: "Hora de entrada",
    lastHoursWorked: "Últimas horas trabajadas",
    addWorkerAndJobFirst: "Primero agrega un trabajador y un trabajo.",
    noActiveClockInFound: "No se encontró una entrada activa.",

    workersOnSite: "Trabajadores en sitio",
    hoursWorked: "Horas trabajadas",
    materialsUsed: "Materiales usados",
    workCompletedToday: "Trabajo completado hoy",
    startVoiceReport: "Iniciar reporte por voz",
    listening: "Escuchando...",
    stopVoice: "Detener voz",
    submitReport: "Enviar reporte",
    dailyReports: "Reportes diarios",
    selectAJob: "Selecciona un trabajo.",

    invoiceType: "Tipo de factura",
    amount: "Monto",
    dueDate: "Fecha de vencimiento",
    notes: "Notas / instrucciones de pago",
    createInvoice: "Crear factura",
    markPaid: "Marcar como pagada",
    deposit: "Depósito",
    progress: "Progreso",
    final: "Final",
    custom: "Personalizada",
    pending: "Pendiente",
    sent: "Enviada",
    paid: "Pagada",
    due: "Vence",
    type: "Tipo",

    inspectionType: "Tipo de inspección",
    addInspection: "Agregar inspección",
    scheduled: "Programada",
    passed: "Aprobada",
    failed: "Fallida",
    plumbing: "Plomería",
    electrical: "Eléctrica",
    inspectionFinal: "Final",

    timeEntries: "Registros de tiempo",

    loginHeroTitle: "Administra tu equipo con confianza",
    loginHeroSubtitle:
      "Inicia sesión para reportes diarios, herramientas para trabajadores, seguimiento de trabajos, horas listas para nómina, facturas e inspecciones.",
    loginFeature1: "Acceso rápido con Google o enlaces seguros por correo",
    loginFeature2:
      "Paneles administrativos para trabajos, reportes y gestión del equipo",
    loginFeature3:
      "Hecho para equipos de campo, oficina y subcontratistas",
    loginFormSubtitle:
      "Inicia sesión con Google o recibe un enlace seguro por correo electrónico.",
    emailPlaceholder: "nombre@empresa.com",
    sendingLoginLink: "Enviando enlace de acceso...",
    orContinueWith: "O CONTINUAR CON",
    google: "Google",
    openingGoogle: "Abriendo Google...",
    newCompany: "¿Empresa nueva?",
    newCompanyText:
      "Empieza con una prueba y configura tu equipo, trabajos y acceso administrativo.",
    startFreeTrial: "Comenzar prueba gratis",
    enterEmail: "Por favor ingresa tu correo electrónico.",

    pricingTitle: "Elige tu plan de CrewTraxk",
    pricingSubtitle:
      "Comienza tu membresía y organiza tu equipo, trabajos, reportes, horas listas para nómina, facturas e inspecciones en un solo lugar.",
    starterPlan: "Starter",
    proPlan: "Pro",
    businessPlan: "Business",
    mostPopular: "Más popular",
    starterPlanSubtitle:
      "Ideal para equipos pequeños que quieren empezar rápido.",
    proPlanSubtitle:
      "Ideal para contratistas en crecimiento y equipos de oficina.",
    businessPlanSubtitle:
      "Ideal para operaciones más grandes y mayor control administrativo.",
    startStarter: "Empezar Starter",
    startPro: "Empezar Pro",
    startBusiness: "Empezar Business",
    openingCheckout: "Abriendo pago...",
    upTo10Workers: "Hasta 10 trabajadores",
    upTo30Workers: "Hasta 30 trabajadores",
    upTo100Workers: "Hasta 100 trabajadores",
    jobTracking: "Seguimiento de trabajos",
    timeTracking: "Seguimiento de horas",
    everythingInStarter: "Todo lo de Starter",
    everythingInPro: "Todo lo de Pro",
    subcontractorTracking: "Seguimiento de subcontratistas",
    prioritySupport: "Soporte prioritario",
    moreAdminAccess: "Más acceso administrativo",
    scaleReadySetup: "Configuración lista para escalar",

    paymentSuccessful: "Pago exitoso",
    subscriptionCompleted:
      "Tu pago de suscripción se completó correctamente.",
    almostDone: "Ya casi terminas",
    membershipFinalizing:
      "Tu membresía de CrewTraxk se está finalizando. Ahora puedes volver e iniciar sesión para continuar la configuración.",
    goToLogin: "Ir al inicio de sesión",

    checkoutCanceled: "Pago cancelado",
    subscriptionNotStarted: "No te preocupes — tu suscripción no comenzó.",
    wantToTryAgain: "¿Quieres intentarlo de nuevo?",
    choosePlanAgain:
      "Vuelve a precios y elige el plan que mejor se adapte a tu equipo.",
    backToPricing: "Volver a precios",
  },
};

export function getLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("crewtraxk_lang");
  return saved === "es" ? "es" : "en";
}

export function setLanguage(lang: Language) {
  localStorage.setItem("crewtraxk_lang", lang);
}