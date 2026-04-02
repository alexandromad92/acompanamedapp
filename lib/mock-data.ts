// ============================================================
// AcompañaMed — Mock Data
// ============================================================

export type ProtocolTipo = "GLP-1" | "TRT" | "Hormonal Femenino" | "Suplementación";
export type LabStatus = "Revisado por médico" | "Pendiente de revisión";
export type MessageSender = "medico" | "paciente";

// ─── PROTOCOLS ────────────────────────────────────────────

export interface Protocol {
  id: string;
  titulo: string;
  tipo: ProtocolTipo;
  resumen_caso: string;
  diagnostico: string;
  plan: {
    medicacion: string;
    nutricion: string;
    suplementacion: string[];
    ejercicio: string;
    seguimiento: string;
  };
  que_esperar: string;
  que_evitar: string;
  senales_alerta: string;
  proxima_revision: string;
  version: number;
  fecha_actualizacion: string;
}

export interface LabFile {
  id: string;
  nombre: string;
  fecha: string;
  estado: LabStatus;
  tipo: string;
}

export interface ProgressEntry {
  id: string;
  fecha: string;
  mes: string;
  peso: number;
  energia: number;
  sueno: number;
  libido: number;
  notas: string;
}

export interface Message {
  id: string;
  de: MessageSender;
  texto: string;
  fecha: string;
  timestamp: string;
}

export interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  pais: string;
  email: string;
  avatar: string;
  objetivo_principal: string;
  peso_actual: number;
  altura: number;
  imc: number;
  medicamentos_actuales: string;
  supervision_actual: string;
  frustracion_principal: string;
  sintomas: string[];
  energia: number;
  sueno: number;
  libido: number;
  intentos_anteriores: string;
  por_que_fallaron: string;
  condiciones_medicas: string;
  objetivos_3_meses: string;
  resultado_ideal: string;
  fecha_registro: string;
  protocolo_activo: Protocol;
  mensajes: Message[];
  progreso: ProgressEntry[];
  laboratorio: LabFile[];
}

// ═══════════════════════════════════════════════════════════
// PROTOCOLS
// ═══════════════════════════════════════════════════════════

const protocoloMaria: Protocol = {
  id: "proto-maria-001",
  titulo: "Protocolo GLP-1 — Semanas 1 a 8",
  tipo: "GLP-1",
  resumen_caso:
    "Paciente femenina 44 años, usando semaglutida 0.5 mg/semana sin supervisión previa. IMC 31. Objetivo pérdida de peso sostenida con protección de masa muscular.",
  diagnostico:
    "Estás usando semaglutida en dosis de mantenimiento sin el apoyo nutricional ni la suplementación necesaria para proteger tu músculo durante la pérdida de peso. Esto explica el cansancio que sientes y la sensación de niebla mental. La pérdida de músculo en este proceso es el mayor riesgo que queremos evitar juntos.",
  plan: {
    medicacion:
      "Continúa semaglutida 0.5 mg cada lunes. No subas dosis hasta la semana 8. Inyecta siempre en el mismo horario, preferiblemente por la mañana.",
    nutricion:
      "Mínimo 100 g de proteína diaria distribuida en 3 comidas principales. Evita ayunos prolongados. Come algo pequeño 2 horas antes de la inyección para reducir náuseas. Hidratación: mínimo 2 litros de agua al día.",
    suplementacion: [
      "Magnesio glicinato 400 mg antes de dormir",
      "Vitamina D3 5000 UI con la comida principal",
      "Zinc 30 mg con la cena",
      "Proteína en polvo si no llegas a los 100 g diarios",
      "Complejo B (B12 + B6) para energía y niebla mental",
    ],
    ejercicio:
      "Mínimo 3 sesiones de fuerza por semana. Prioridad absoluta sobre cardio para proteger masa muscular. Caminar 20 minutos después de comer ayuda a gestionar la glucosa.",
    seguimiento:
      "Check-in conmigo el día 7 y día 21. Análisis de laboratorio en semana 8. Mide tu peso el mismo día cada semana, en ayunas.",
  },
  que_esperar:
    "Semanas 1-2: reducción notable del apetito, posibles náuseas leves. Semana 3-4: empezarás a ver cambios en la báscula (500 g a 1 kg semanal es el objetivo). Semana 6-8: estabilización del ritmo de pérdida y mejora notable de energía si sigues la suplementación.",
  que_evitar:
    "Alimentos muy grasos el día de la inyección, alcohol, saltarte comidas, subir la dosis por tu cuenta. Evita ejercicio intenso el día de la inyección.",
  senales_alerta:
    "Dolor abdominal intenso que no cede en 2 horas. Vómitos persistentes más de 24 horas. Mareos intensos al levantarte. Visión borrosa. En cualquiera de estos casos escríbeme de inmediato o acude a urgencias.",
  proxima_revision: "2025-02-15",
  version: 2,
  fecha_actualizacion: "hace 3 días",
};

const protocoloJorge: Protocol = {
  id: "proto-jorge-001",
  titulo: "Protocolo TRT Masculino — Fase 1 (Meses 1-3)",
  tipo: "TRT",
  resumen_caso:
    "Paciente masculino 38 años, iniciando TRT con cipionato de testosterona 200 mg/mL hace 3 meses sin supervisión médica formal. Testosterona total en rango bajo. Objetivo: optimización hormonal y recuperación de composición corporal.",
  diagnostico:
    "Tu testosterona libre está por debajo del rango óptimo para tu edad, lo que explica directamente la baja libido, la pérdida de músculo y la fatiga que describes. Llevas 3 meses con cipionato pero sin el protocolo completo — falta gestionar estrógenos y proteger la fertilidad si es relevante para ti.",
  plan: {
    medicacion:
      "Cipionato de testosterona 100 mg subcutáneo dos veces por semana (total 200 mg/semana). Dividir la dosis reduce picos y valles. Inyectar lunes y jueves.",
    nutricion:
      "Dieta alta en proteína: 1.8-2g por kg de peso corporal. Grasas saludables son esenciales para la síntesis de testosterona — no las elimines. Evita el alcohol (reduce testosterona y aumenta conversión a estrógenos).",
    suplementacion: [
      "Vitamina D3 5000 UI diarios (fundamental para testosterona)",
      "Zinc 30 mg con la cena (cofactor esencial)",
      "Magnesio glicinato 400 mg antes de dormir",
      "Omega-3 2g diarios (reduce inflamación)",
      "Ashwagandha 600 mg (si hay estrés elevado)",
    ],
    ejercicio:
      "Entrenamiento de fuerza 4 días por semana. Prioriza ejercicios compuestos: sentadilla, press banca, peso muerto. El músculo es el órgano endocrino más importante en TRT.",
    seguimiento:
      "Análisis completo en semana 6: testosterona total y libre, SHBG, estradiol, hemograma, PSA. Revisión conmigo antes de cualquier ajuste de dosis.",
  },
  que_esperar:
    "Mes 1: mejora de energía y estado de ánimo. Mes 2: inicio de cambios en composición corporal, recuperación de libido. Mes 3: resultados visibles en fuerza y músculo. La libido suele mejorar antes que los cambios físicos.",
  que_evitar:
    "Subir dosis sin análisis previos. No administrar más de 200 mg/semana en fase 1. Evitar alcohol. No pausar el protocolo abruptamente.",
  senales_alerta:
    "Acné severo repentino (estrógenos altos). Sensibilidad o crecimiento en pezones (ginecomastia). Policitemia (sangre espesa — verificar con hematocrito). Cualquier síntoma cardiovascular.",
  proxima_revision: "2025-02-20",
  version: 1,
  fecha_actualizacion: "hace 10 días",
};

const protocoloClaudia: Protocol = {
  id: "proto-claudia-001",
  titulo: "Protocolo Hormonal Femenino — Menopausia",
  tipo: "Hormonal Femenino",
  resumen_caso:
    "Paciente femenina 51 años en perimenopausia confirmada sin medicación hormonal actual. Síntomas: sofocos frecuentes, insomnio severo, baja libido, cambios de humor marcados. Sin contraindicaciones para TRH identificadas.",
  diagnostico:
    "Estás en una transición hormonal importante donde el estrógeno fluctúa antes de descender definitivamente. Tus síntomas son la respuesta normal del cuerpo a esa fluctuación. Lo que tenemos que hacer es estabilizar ese proceso con las herramientas correctas — y sí, hay mucho que podemos hacer antes de decidir si necesitas terapia hormonal sustitutiva.",
  plan: {
    medicacion:
      "Por ahora iniciamos con suplementación de soporte. Si en 6 semanas los síntomas no mejoran suficientemente, evaluaremos progesterona bioidéntica y estradiol tópico. No inicio TRH sin análisis hormonales completos primero.",
    nutricion:
      "Aumenta fitoestrógenos naturales: soja, lino, legumbres. Calcio 1200 mg diarios vía alimentación (lácteos, sardinas, brócoli). Reduce cafeína y alcohol — ambos empeoran los sofocos y el sueño.",
    suplementacion: [
      "Magnesio glicinato 400 mg antes de dormir (sueño + sofocos nocturnos)",
      "Vitamina D3 5000 UI + K2 100 mcg (huesos)",
      "Omega-3 2g diarios (humor y cardiovascular)",
      "Cohosh negro 40 mg (sofocos — ciclos de 6 semanas)",
      "Melatonina 1 mg 30 min antes de dormir",
      "Vitamina E 400 UI (sofocos y sequedad)",
    ],
    ejercicio:
      "Ejercicio con pesas 3-4 días por semana es CRÍTICO para la densidad ósea. Yoga o meditación para el estrés y calidad del sueño. El ejercicio también reduce sofocos.",
    seguimiento:
      "Análisis hormonales en 2 semanas: FSH, LH, estradiol, progesterona, testosterona libre, DHEA-S, tiroides completo. Revisión a las 6 semanas para evaluar respuesta.",
  },
  que_esperar:
    "Semanas 1-2: el magnesio y la melatonina deberían mejorar el sueño. Semanas 3-6: reducción gradual de la frecuencia de sofocos. Mes 2-3: si la suplementación no es suficiente, iniciamos la conversación sobre TRH.",
  que_evitar:
    "Cafeína después del mediodía, alcohol, ropa muy ajustada o sintética (empeora sofocos), ambientes muy calurosos por la noche.",
  senales_alerta:
    "Sangrado vaginal inesperado (requiere evaluación inmediata). Dolor en el pecho. Cefalea intensa y repentina. Cambios de humor extremos que afecten tu vida diaria — escríbeme.",
  proxima_revision: "2025-02-10",
  version: 1,
  fecha_actualizacion: "hace 5 días",
};

// ═══════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════

const mensajesMaria: Message[] = [
  {
    id: "m1",
    de: "medico",
    texto:
      "Hola María, revisé tu formulario con detenimiento. Bienvenida a AcompañaMed. Ya subí tu protocolo personalizado — léelo con calma esta tarde y escríbeme si tienes alguna duda.",
    fecha: "hace 5 días",
    timestamp: "2025-01-27 09:15",
  },
  {
    id: "m2",
    de: "paciente",
    texto:
      "Doctor, muchas gracias. Nunca nadie me había explicado lo de la proteína y por qué es tan importante con el ozempic. ¿Cuántas veces a la semana debo inyectarme?",
    fecha: "hace 5 días",
    timestamp: "2025-01-27 11:42",
  },
  {
    id: "m3",
    de: "medico",
    texto:
      "Una vez por semana, siempre el mismo día. Te recomiendo los lunes por la mañana — así si tienes algún malestar las primeras semanas, no te afecta el fin de semana.",
    fecha: "hace 4 días",
    timestamp: "2025-01-28 08:30",
  },
  {
    id: "m4",
    de: "paciente",
    texto:
      "Perfecto. Me inyecté ayer (lunes) y tuve un poco de náuseas por la noche. Comí normal ese día, creo que cometí el error de comer algo grasoso.",
    fecha: "hace 2 días",
    timestamp: "2025-01-30 10:15",
  },
  {
    id: "m5",
    de: "medico",
    texto:
      "Exactamente eso es. Ese día evita comidas grasas o muy abundantes. Come algo ligero 2 horas antes de inyectarte y las náuseas deberían reducirse mucho. Las primeras 3-4 semanas son las más intensas.",
    fecha: "hace 2 días",
    timestamp: "2025-01-30 12:00",
  },
  {
    id: "m6",
    de: "paciente",
    texto:
      "Listo, lo anoto todo. Gracias por responder tan rápido, doctor. Esto es muy diferente a lo que tenía antes — nadie me explicaba nada y me sentía completamente sola con esto.",
    fecha: "hace 1 día",
    timestamp: "2025-01-31 09:45",
  },
];

const mensajesJorge: Message[] = [
  {
    id: "j1",
    de: "medico",
    texto:
      "Hola Jorge, acabo de revisar tu historia clínica. Llevas 3 meses con cipionato, bien. El siguiente paso más importante ahora mismo es hacer un análisis completo. ¿Tienes acceso a laboratorio cerca?",
    fecha: "hace 8 días",
    timestamp: "2025-01-24 10:00",
  },
  {
    id: "j2",
    de: "paciente",
    texto:
      "Sí, hay un laboratorio a 10 minutos de casa. ¿Qué análisis necesito exactamente? Mi médico de cabecera no sabe nada del tema.",
    fecha: "hace 8 días",
    timestamp: "2025-01-24 11:30",
  },
  {
    id: "j3",
    de: "medico",
    texto:
      "Te preparo la lista en el protocolo. Lo básico: testosterona total y libre, SHBG, estradiol, hemograma completo, hematocrito, PSA, función hepática y renal.",
    fecha: "hace 7 días",
    timestamp: "2025-01-25 09:15",
  },
  {
    id: "j4",
    de: "paciente",
    texto:
      "Perfecto. Una pregunta — ¿por qué dividir la dosis en dos inyecciones semanales? Yo estaba haciendo una sola de 200 mg cada semana.",
    fecha: "hace 6 días",
    timestamp: "2025-01-26 14:20",
  },
  {
    id: "j5",
    de: "medico",
    texto:
      "Excelente pregunta. Con una dosis semanal tienes un pico alto los días 1-2 y luego un valle bajo los días 5-7 (cansancio, mal humor). Al dividirla en dos, mantienes niveles estables — menos efectos secundarios y mejor resultado.",
    fecha: "hace 6 días",
    timestamp: "2025-01-26 15:45",
  },
  {
    id: "j6",
    de: "paciente",
    texto:
      "Tiene mucho sentido. Empiezo la semana que viene con el protocolo nuevo. ¿La libido cuándo debería mejorar?",
    fecha: "hace 5 días",
    timestamp: "2025-01-27 10:00",
  },
  {
    id: "j7",
    de: "medico",
    texto:
      "La libido es de las primeras cosas en mejorar — muchos pacientes notan cambios en 3-6 semanas de niveles estables. Los cambios físicos (músculo) tardan 2-3 meses. Vas por buen camino.",
    fecha: "hace 4 días",
    timestamp: "2025-01-28 09:00",
  },
];

const mensajesClaudia: Message[] = [
  {
    id: "c1",
    de: "medico",
    texto:
      "Hola Claudia, gracias por completar el formulario con tanto detalle. Tu caso es muy claro — estás en perimenopausia y los síntomas que describes son exactamente los que esperamos ver. Tengo buenas noticias: hay mucho que podemos hacer.",
    fecha: "hace 6 días",
    timestamp: "2025-01-26 09:00",
  },
  {
    id: "c2",
    de: "paciente",
    texto:
      "Doctor, gracias. Llevo más de un año con los sofocos y el insomnio y me dijeron que 'era la edad'. Casi no duermo más de 4 horas seguidas. ¿De verdad hay solución?",
    fecha: "hace 6 días",
    timestamp: "2025-01-26 10:15",
  },
  {
    id: "c3",
    de: "medico",
    texto:
      "'Es la edad' es la respuesta más perezosa de la medicina. El insomnio en perimenopausia tiene causas hormonales muy concretas y abordables. Vamos paso a paso — ya subí tu protocolo.",
    fecha: "hace 5 días",
    timestamp: "2025-01-27 08:30",
  },
  {
    id: "c4",
    de: "paciente",
    texto:
      "Ya leí el protocolo. Empecé el magnesio anoche y esta mañana dormí 6 horas seguidas por primera vez en meses. ¿Puede ser tan rápido?",
    fecha: "hace 3 días",
    timestamp: "2025-01-29 09:00",
  },
  {
    id: "c5",
    de: "medico",
    texto:
      "¡Sí puede! El magnesio actúa rápido porque la mayoría de las mujeres en perimenopausia tienen deficiencia sin saberlo, y eso empeora directamente el sueño. Qué buena noticia. Sigue con el protocolo completo y en 2 semanas me cuentas cómo van los sofocos.",
    fecha: "hace 3 días",
    timestamp: "2025-01-29 10:30",
  },
];

// ═══════════════════════════════════════════════════════════
// PROGRESS
// ═══════════════════════════════════════════════════════════

const progresoMaria: ProgressEntry[] = [
  {
    id: "p1",
    fecha: "2024-12-01",
    mes: "Diciembre 2024",
    peso: 78.5,
    energia: 4,
    sueno: 5,
    libido: 4,
    notas: "Primer mes. Mucho cansancio, poca energía. Las náuseas van mejorando.",
  },
  {
    id: "p2",
    fecha: "2025-01-01",
    mes: "Enero 2025",
    peso: 76.2,
    energia: 6,
    sueno: 6,
    libido: 5,
    notas: "Bajé 2.3 kg este mes. La proteína marca diferencia. Menos niebla mental.",
  },
  {
    id: "p3",
    fecha: "2025-02-01",
    mes: "Febrero 2025",
    peso: 74.8,
    energia: 7,
    sueno: 7,
    libido: 6,
    notas: "Ropa que no me cerraba ya me queda. Más energía para el gimnasio.",
  },
];

const progresoJorge: ProgressEntry[] = [
  {
    id: "j-p1",
    fecha: "2024-11-01",
    mes: "Noviembre 2024",
    peso: 82.0,
    energia: 4,
    sueno: 5,
    libido: 3,
    notas: "Inicio del protocolo. Muy bajo de energía. Libido casi nula.",
  },
  {
    id: "j-p2",
    fecha: "2024-12-01",
    mes: "Diciembre 2024",
    peso: 83.5,
    energia: 6,
    sueno: 6,
    libido: 5,
    notas: "Subí 1.5 kg pero es músculo — noto la diferencia en el espejo.",
  },
  {
    id: "j-p3",
    fecha: "2025-01-01",
    mes: "Enero 2025",
    peso: 85.0,
    energia: 7,
    sueno: 7,
    libido: 7,
    notas: "Gran cambio. Libido recuperada, más fuerza en el gym.",
  },
];

const progresoClaudia: ProgressEntry[] = [
  {
    id: "c-p1",
    fecha: "2024-12-01",
    mes: "Diciembre 2024",
    peso: 67.0,
    energia: 4,
    sueno: 3,
    libido: 2,
    notas: "Terrible. 3-4 sofocos por noche, no duermo. Cambios de humor constantes.",
  },
  {
    id: "c-p2",
    fecha: "2025-01-01",
    mes: "Enero 2025",
    peso: 66.5,
    energia: 5,
    sueno: 5,
    libido: 3,
    notas: "El magnesio ayuda al sueño. Menos sofocos nocturnos.",
  },
  {
    id: "c-p3",
    fecha: "2025-02-01",
    mes: "Febrero 2025",
    peso: 66.0,
    energia: 6,
    sueno: 6,
    libido: 4,
    notas: "Duermo 6-7 horas. Los sofocos son menos intensos.",
  },
];

// ═══════════════════════════════════════════════════════════
// LAB FILES
// ═══════════════════════════════════════════════════════════

const labMaria: LabFile[] = [
  {
    id: "lab-m1",
    nombre: "Hemograma_Completo_Maria_Nov2024.pdf",
    fecha: "15 Nov 2024",
    estado: "Revisado por médico",
    tipo: "Hemograma",
  },
  {
    id: "lab-m2",
    nombre: "Panel_Tiroideo_Maria_Nov2024.pdf",
    fecha: "15 Nov 2024",
    estado: "Revisado por médico",
    tipo: "Tiroides",
  },
  {
    id: "lab-m3",
    nombre: "Glucosa_Insulina_Maria_Ene2025.pdf",
    fecha: "20 Ene 2025",
    estado: "Pendiente de revisión",
    tipo: "Metabólico",
  },
];

const labJorge: LabFile[] = [
  {
    id: "lab-j1",
    nombre: "Testosterona_Libre_Total_Jorge_Oct2024.pdf",
    fecha: "10 Oct 2024",
    estado: "Revisado por médico",
    tipo: "Hormonales",
  },
  {
    id: "lab-j2",
    nombre: "Hemograma_PSA_Jorge_Oct2024.pdf",
    fecha: "10 Oct 2024",
    estado: "Revisado por médico",
    tipo: "Hemograma",
  },
];

const labClaudia: LabFile[] = [
  {
    id: "lab-c1",
    nombre: "Panel_Hormonal_Claudia_Dic2024.pdf",
    fecha: "05 Dic 2024",
    estado: "Revisado por médico",
    tipo: "Hormonales",
  },
  {
    id: "lab-c2",
    nombre: "Densitometria_Osea_Claudia_Dic2024.pdf",
    fecha: "05 Dic 2024",
    estado: "Revisado por médico",
    tipo: "Densitometría",
  },
  {
    id: "lab-c3",
    nombre: "Tiroides_Completo_Claudia_Ene2025.pdf",
    fecha: "18 Ene 2025",
    estado: "Pendiente de revisión",
    tipo: "Tiroides",
  },
];

// ═══════════════════════════════════════════════════════════
// PATIENTS
// ═══════════════════════════════════════════════════════════

export const pacientes: Patient[] = [
  {
    id: "maria",
    nombre: "María",
    apellido: "González",
    edad: 44,
    pais: "México",
    email: "maria.gonzalez@email.com",
    avatar: "MG",
    objetivo_principal: "Perder peso de forma sostenida protegiendo el músculo",
    peso_actual: 74.8,
    altura: 162,
    imc: 28.5,
    medicamentos_actuales: "Ozempic (semaglutida) 0.5 mg / semana",
    supervision_actual: "Sin supervisión médica especializada",
    frustracion_principal:
      "Me inyecto sola, nadie me explica qué hacer. Me recetaron el ozempic y punto.",
    sintomas: [
      "Fatiga crónica",
      "Niebla mental",
      "Grasa abdominal persistente",
      "Náuseas post-inyección",
      "Pérdida de masa muscular",
    ],
    energia: 7,
    sueno: 7,
    libido: 6,
    intentos_anteriores: "Dieta keto (6 meses), ayuno intermitente 16:8, Pilates",
    por_que_fallaron:
      "Con la keto perdí peso pero lo recuperé todo. Con ayuno me sentía más cansada.",
    condiciones_medicas: "Sin condiciones crónicas conocidas. Tiroides normal.",
    objetivos_3_meses: "Perder 5-8 kg sin perder músculo. Tener más energía.",
    resultado_ideal:
      "Sentirme bien, tener energía para trabajar y cuidar a mis hijos.",
    fecha_registro: "27 Enero 2025",
    protocolo_activo: protocoloMaria,
    mensajes: mensajesMaria,
    progreso: progresoMaria,
    laboratorio: labMaria,
  },
  {
    id: "jorge",
    nombre: "Jorge",
    apellido: "Martínez",
    edad: 38,
    pais: "España",
    email: "jorge.martinez@email.com",
    avatar: "JM",
    objetivo_principal: "Optimizar testosterona y recuperar composición corporal",
    peso_actual: 85.0,
    altura: 178,
    imc: 26.8,
    medicamentos_actuales: "Cipionato de testosterona 200 mg / semana (automedicado)",
    supervision_actual: "Sin supervisión. Médico de cabecera no conoce el tema.",
    frustracion_principal:
      "Tengo testosterona baja pero mi médico no sabe nada del tema y no me quiere tratar.",
    sintomas: [
      "Baja libido",
      "Pérdida de masa muscular",
      "Fatiga",
      "Baja motivación",
      "Dificultad para concentrarse",
    ],
    energia: 7,
    sueno: 7,
    libido: 7,
    intentos_anteriores: "Suplementos naturales (ashwagandha, zinc, D3)",
    por_que_fallaron:
      "Mejoraron algo pero no suficiente. Testosterona seguía baja en análisis.",
    condiciones_medicas: "Sin condiciones crónicas. Sin historial familiar cardiovascular.",
    objetivos_3_meses: "Testosterona en rango óptimo, recuperar músculo, libido normalizada.",
    resultado_ideal: "Sentirme como tenía 28 años. Energía, libido, músculo y motivación.",
    fecha_registro: "24 Enero 2025",
    protocolo_activo: protocoloJorge,
    mensajes: mensajesJorge,
    progreso: progresoJorge,
    laboratorio: labJorge,
  },
  {
    id: "claudia",
    nombre: "Claudia",
    apellido: "Reyes",
    edad: 51,
    pais: "Argentina",
    email: "claudia.reyes@email.com",
    avatar: "CR",
    objetivo_principal: "Manejar síntomas de menopausia y recuperar calidad de vida",
    peso_actual: 66.0,
    altura: 165,
    imc: 24.2,
    medicamentos_actuales: "Sin medicación hormonal actual",
    supervision_actual: "Médico de cabecera que dijo 'es la edad, acostúmbrate'",
    frustracion_principal:
      "Me dicen que es la edad, pero yo sé que algo hormonal está mal y que hay solución.",
    sintomas: [
      "Sofocos",
      "Insomnio severo",
      "Baja libido",
      "Cambios de humor",
      "Sequedad vaginal",
      "Pérdida de cabello",
    ],
    energia: 6,
    sueno: 6,
    libido: 4,
    intentos_anteriores: "Melatonina (sin efecto). Fitoterapia de farmacia.",
    por_que_fallaron:
      "La melatonina a dosis bajas no hizo nada. Los productos de farmacia son demasiado genéricos.",
    condiciones_medicas: "Sin contraindicaciones para TRH. Mamografía normal (2024).",
    objetivos_3_meses: "Dormir bien, reducir sofocos, estabilizar el humor.",
    resultado_ideal: "Recuperar la versión de mí misma de hace 3 años.",
    fecha_registro: "26 Enero 2025",
    protocolo_activo: protocoloClaudia,
    mensajes: mensajesClaudia,
    progreso: progresoClaudia,
    laboratorio: labClaudia,
  },
];

// ─── DOCTOR ────────────────────────────────────────────────

export const medico = {
  id: "dr-usuario",
  nombre: "Dr. Usuario",
  especialidad: "Medicina Funcional y Endocrinología",
  avatar: "DR",
  pacientes_activos: 3,
  mensajes_sin_responder: 1,
  videollamadas_pendientes: 0,
};

// ─── HELPERS ───────────────────────────────────────────────

export function getPaciente(id: string): Patient | undefined {
  return pacientes.find((p) => p.id === id);
}

export function getProtocoloColor(tipo: ProtocolTipo): {
  bg: string;
  text: string;
  border: string;
} {
  switch (tipo) {
    case "GLP-1":
      return { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]", border: "border-[#5DCAA5]" };
    case "TRT":
      return { bg: "bg-[#E6F1FB]", text: "text-[#185FA5]", border: "border-[#185FA5]" };
    case "Hormonal Femenino":
      return { bg: "bg-pink-50", text: "text-[#993556]", border: "border-[#993556]" };
    case "Suplementación":
      return { bg: "bg-[#FAEEDA]", text: "text-[#a86a00]", border: "border-[#EF9F27]" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
  }
}

export const testimonios = [
  {
    nombre: "María González",
    edad: 44,
    pais: "México",
    protocolo: "GLP-1",
    texto:
      "Por primera vez alguien me explicó por qué me sentía tan cansada usando ozempic. El protocolo fue un antes y un después. Perdí 6 kg en 2 meses y conservé el músculo.",
    resultado: "−6 kg en 2 meses",
  },
  {
    nombre: "Jorge Martínez",
    edad: 38,
    pais: "España",
    protocolo: "TRT",
    texto:
      "Llevaba 2 años diciéndole a mi médico que algo andaba mal y siempre me decía que estaba 'en rango'. Aquí me dieron el protocolo correcto y en 3 meses volví a ser yo.",
    resultado: "Testosterona óptima en 10 semanas",
  },
  {
    nombre: "Claudia Reyes",
    edad: 51,
    pais: "Argentina",
    protocolo: "Menopausia",
    texto:
      "Un año con insomnio y sofocos y me decían 'es la edad'. En una semana con el protocolo ya dormía 6 horas seguidas. Ojalá hubiera encontrado esto antes.",
    resultado: "Sueño recuperado en 1 semana",
  },
];
