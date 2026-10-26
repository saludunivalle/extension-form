import { useEffect, useState } from "react";
import axios from "axios";
import { downloadFormReport } from "../services/reportServices";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
  CircularProgress,
  Tooltip,
  Checkbox,
  Box,
  Chip,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { config } from "../config";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Print } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  approveFullRequest,
  sendCorrections,
  sendFormsToRevision,
} from "../services/revisionService";
import {
  addWorkflowObservation,
  getWorkflowConsultation,
  getWorkflowQueue,
  getWorkflowObservations,
  registerWorkflowSignature,
  sendWorkflowRequestToDecanato,
  remindWorkflowSignature,
  submitDecanatoCut,
  submitWorkflowDecision,
  updateWorkflowObservation,
} from "../services/workflowService";
import WorkflowRoleView from "./Workflow/WorkflowRoleView";
const API_URL = config.API_URL;

const formatHistoryAction = (action) => {
  const labels = {
    aprobar: "Aprobado",
    devolver: "Devuelta",
    tomar: "Tomada",
    firmar: "Firmada",
    enviar_decanato: "Enviada a Decanato",
    registrar_decision: "Decisión registrada",
  };
  const key = String(action || "").trim().toLowerCase();
  return labels[key] || String(action || "Movimiento");
};

const formatHistoryDate = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Fecha no disponible";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Bogota",
  }).format(parsed);
};

const flattenSolicitudResponse = (data) => {
  if (!data || typeof data !== "object") {
    return {};
  }

  const rootFields = {};
  const nestedFields = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(nestedFields, value);
    } else {
      rootFields[key] = value;
    }
  });

  return Object.keys(nestedFields).length > 0
    ? { ...rootFields, ...nestedFields }
    : data;
};

const parseEstadoFormularios = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  return {};
};

const parseNestedObject = (value) => {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return parseNestedObject(JSON.parse(value));
    } catch {
      return {};
    }
  }
  if (Array.isArray(value)) {
    return value.reduce(
      (result, item) => ({
        ...result,
        ...parseNestedObject(item),
      }),
      {},
    );
  }
  return typeof value === "object" ? value : {};
};

const findEstadoFormularios = (source) => {
  if (!source) return null;

  if (typeof source === "string") {
    try {
      return findEstadoFormularios(JSON.parse(source));
    } catch {
      return null;
    }
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findEstadoFormularios(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof source !== "object") return null;

  const statusEntry = Object.entries(source).find(
    ([key]) =>
      key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === "estadoformularios",
  );
  if (statusEntry) {
    return parseEstadoFormularios(statusEntry[1]);
  }

  for (const value of Object.values(source)) {
    const found = findEstadoFormularios(value);
    if (found) return found;
  }

  return null;
};

const getLegacyEstadoValue = (source, formNumber) => {
  if (!source || typeof source !== "object") return "";

  return (
    source[`estado_formulario_${formNumber}`] ||
    source[`estado_formulario${formNumber}`] ||
    source[`estadoFormulario_${formNumber}`] ||
    source[`estadoFormulario${formNumber}`] ||
    ""
  );
};

const extractEstadoFormularios = (request) => {
  const etapas = parseNestedObject(request?.ETAPAS || request?.etapas);
  const solicitudes = parseNestedObject(request?.SOLICITUDES);
  const estados =
    findEstadoFormularios(etapas) || findEstadoFormularios(request) || {};

  for (let formNumber = 1; formNumber <= 4; formNumber += 1) {
    const legacyState =
      getLegacyEstadoValue(request, formNumber) ||
      getLegacyEstadoValue(solicitudes, formNumber) ||
      getLegacyEstadoValue(etapas, formNumber);

    if (legacyState && !estados[String(formNumber)]) {
      estados[String(formNumber)] = legacyState;
    }
  }

  return estados;
};

const resolveFormStatus = (request, formNumber) => {
  const formKey = String(formNumber);
  let source = extractEstadoFormularios(request);

  // El backend puede entregar el mapa como string JSON.
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      source = {};
    }
  }

  const value =
    source?.[formKey] ??
    getLegacyEstadoValue(request, formNumber) ??
    getLegacyEstadoValue(request?.SOLICITUDES, formNumber) ??
    "";

  // Algunas respuestas antiguas anidan nuevamente el mapa completo.
  if (typeof value === "object" && value !== null) return value[formKey] || "";
  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      return parsed?.[formKey] || "";
    } catch {
      return value;
    }
  }
  return value;
};

const normalizeStatusForMatch = (value) => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};

const isCompletedStatus = (status) => {
  const normalized = normalizeStatusForMatch(status);
  return normalized === "completado" || normalized === "completados";
};

const isCorrectionsStatus = (status) => {
  const normalized = normalizeStatusForMatch(status);
  return normalized.includes("requiere correccion");
};

const hasCorrectionsInRequest = (request) => {
  const estados = request?.estadoFormularios;
  if (
    estados &&
    typeof estados === "object" &&
    Object.values(estados).some((estado) => isCorrectionsStatus(estado))
  ) {
    return true;
  }

  const comments = request?.comentarios;
  return (
    comments &&
    typeof comments === "object" &&
    Object.values(comments).some(
      (items) =>
        Array.isArray(items) &&
        items.some(
          (item) =>
            item?.estado === "pendiente" ||
            item?.estado === "requiere_correcciones",
        ),
    )
  );
};

const getPendingObservations = (observations = []) =>
  observations.filter(
    (observation) =>
      normalizeStatusForMatch(observation?.estado) === "pendiente",
  );

const isLockedForOwner = (status) => {
  const normalized = normalizeStatusForMatch(status);
  return normalized === "enviado a revision" || normalized === "aprobado";
};

const normalizeRequest = (request) => {
  if (Array.isArray(request)) {
    const [
      idSolicitud,
      idUsuario,
      fechaSolicitud,
      nombreSolicitante,
      etapaActualRaw,
      estadoFormulariosRaw,
      nombreActividad,
      paso,
      estadoFormulario,
      estadoGeneral,
      comentariosRaw,
      comentariosPorFormularioRaw,
      etapaCodigo,
      rolResponsable,
      usuarioAsignado,
      estadoEtapa,
      fechaInicio,
      fechaFin,
      etapaAnterior,
      updatedAt,
      version,
    ] = request;

    const estados = parseEstadoFormularios(estadoFormulariosRaw);
    const etapaActual = Number(etapaActualRaw);
    const etapaEsNumerica = Number.isFinite(etapaActual) && etapaActual > 0;
    if (etapaEsNumerica && estadoFormulario && !estados[String(etapaActual)]) {
      estados[String(etapaActual)] = estadoFormulario;
    }

    return {
      idSolicitud: idSolicitud || null,
      id_usuario: idUsuario || null,
      fecha_solicitud: fechaSolicitud || "",
      nombre_solicitante: nombreSolicitante || "",
      formulario: etapaEsNumerica ? etapaActual : 0,
      estado: estadoFormulario || "",
      nombre_actividad: nombreActividad || "",
      paso: Number(paso) || 0,
      etapa_actual: etapaEsNumerica ? etapaActual : 0,
      estadoFormularios: estados,
      estado_general: estadoGeneral || "",
      etapa_codigo: etapaCodigo || (!etapaEsNumerica ? etapaActualRaw : ""),
      rol_responsable: rolResponsable || "",
      usuario_asignado: usuarioAsignado || "",
      estado_etapa: estadoEtapa || "",
      comentarios: parseEstadoFormularios(comentariosRaw),
      comentarios_por_formulario: parseEstadoFormularios(
        comentariosPorFormularioRaw,
      ),
      fecha_inicio: fechaInicio || "",
      fecha_fin: fechaFin || "",
      etapa_anterior: etapaAnterior || "",
      updated_at: updatedAt || "",
      version: version || "",
    };
  }

  return {
    ...request,
    idSolicitud:
      request.idSolicitud ||
      request.id_solicitud ||
      request.id ||
      request.solicitud_id,
    id_usuario:
      request.id_usuario ||
      request.idUsuario ||
      request.userId ||
      request.id_user ||
      request.user_id ||
      request.solicitante_id ||
      request.idSolicitante ||
      request.usuario?.id ||
      request.user?.id ||
      null,
    nombre_actividad:
      request.nombre_actividad ||
      request.nombreActividad ||
      request.solicitud ||
      request.actividad ||
      request.titulo ||
      "",
    nombre_solicitante:
      request.nombre_solicitante ||
      request.nombreSolicitante ||
      request.usuario?.name ||
      request.user?.name ||
      "",
    fecha_solicitud:
      request.fecha_solicitud ||
      request.fechaSolicitud ||
      request.fecha_creacion ||
      request.fechaCreacion ||
      request.ETAPAS?.fecha_creacion ||
      request.etapas?.fecha_creacion ||
      "",
    etapa_actual: Number(request.etapa_actual || request.formulario) || 0,
    paso: Number(request.paso) || 0,
    estadoFormularios: extractEstadoFormularios(request),
    estado_general:
      request.estado_general ||
      request.estadoGeneral ||
      request.ETAPAS?.estado_general ||
      request.etapas?.estado_general ||
      "",
    etapa_codigo:
      request.etapa_codigo ||
      request.etapaCodigo ||
      request.ETAPAS?.etapa_codigo ||
      request.etapas?.etapa_codigo ||
      "",
    etapa_anterior:
      request.etapa_anterior ||
      request.etapaAnterior ||
      request.ETAPAS?.etapa_anterior ||
      request.etapas?.etapa_anterior ||
      "",
    estado_etapa:
      request.estado_etapa ||
      request.estadoEtapa ||
      request.ETAPAS?.estado_etapa ||
      request.etapas?.estado_etapa ||
      "",
    rol_responsable:
      request.rol_responsable ||
      request.rolResponsable ||
      request.ETAPAS?.rol_responsable ||
      request.etapas?.rol_responsable ||
      "",
    historial:
      request.historial ||
      request.historial_etapas ||
      request.HISTORIAL_ETAPAS ||
      [],
  };
};

const resolveRequestOwnerId = (request) => {
  return (
    request.id_usuario ||
    request.idUsuario ||
    request.userId ||
    request.id_user ||
    request.user_id ||
    request.solicitante_id ||
    request.idSolicitante ||
    request.usuario?.id ||
    request.user?.id ||
    null
  );
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isOwnRequest = (
  request,
  currentUserId,
  currentUserName,
  currentUserEmail,
) => {
  const ownerId = resolveRequestOwnerId(request);

  if (ownerId) {
    return String(ownerId) === String(currentUserId);
  }

  const requestOwnerName = normalizeText(
    request.nombre_solicitante ||
      request.nombreSolicitante ||
      request.usuario?.name ||
      request.user?.name,
  );
  const requestOwnerEmail = normalizeText(
    request.email_solicitante ||
      request.correo_solicitante ||
      request.usuario?.email ||
      request.user?.email,
  );

  if (requestOwnerEmail && normalizeText(currentUserEmail)) {
    return requestOwnerEmail === normalizeText(currentUserEmail);
  }

  if (requestOwnerName && normalizeText(currentUserName)) {
    return requestOwnerName === normalizeText(currentUserName);
  }

  // Si no hay metadatos del propietario, asumir propia para no romper el flujo existente.
  return true;
};

const mergeUniqueRequests = (requests = []) => {
  return requests.filter(
    (request, index, array) =>
      array.findIndex(
        (item) => String(item.idSolicitud) === String(request.idSolicitud),
      ) === index,
  );
};

const normalizeRevisionRequest = (request) => {
  if (Array.isArray(request)) {
    return normalizeRequest(request);
  }

  const stage = findNestedField(request, ["etapa_codigo", "etapaCodigo"]);

  return {
    ...request,
    idSolicitud:
      request.idSolicitud ||
      request.id_solicitud ||
      request.id ||
      request.solicitud_id,
    id_usuario:
      request.id_usuario ||
      request.idUsuario ||
      request.userId ||
      request.user?.id ||
      request.usuario?.id ||
      null,
    fecha_solicitud:
      request.fecha_solicitud ||
      request.fechaSolicitud ||
      request.fecha ||
      request.fecha_creacion ||
      request.fechaCreacion ||
      request.ETAPAS?.fecha_creacion ||
      request.etapas?.fecha_creacion ||
      "",
    nombre_solicitante:
      request.nombre_solicitante ||
      request.nombreSolicitante ||
      request.name ||
      request.user?.name ||
      request.usuario?.name ||
      "",
    nombre_actividad:
      request.nombre_actividad ||
      request.nombreActividad ||
      request.solicitud ||
      request.actividad ||
      request.titulo ||
      "",
    etapa_actual: Number(request.etapa_actual || request.formulario) || 0,
    paso: Number(request.paso) || 0,
    estadoFormularios: extractEstadoFormularios(request),
    estado_general:
      request.estado_general ||
      request.estadoGeneral ||
      request.ETAPAS?.estado_general ||
      "",
    etapa_codigo: stage,
    estado_etapa:
      request.estado_etapa ||
      request.estadoEtapa ||
      request.ETAPAS?.estado_etapa ||
      request.etapas?.estado_etapa ||
      "",
    rol_responsable:
      request.rol_responsable ||
      request.rolResponsable ||
      request.ETAPAS?.rol_responsable ||
      "",
    historial: request.historial || request.historial_etapas || [],
  };
};

const findNestedField = (source, fieldNames) => {
  if (typeof source === "string") {
    try {
      return findNestedField(JSON.parse(source), fieldNames);
    } catch {
      return "";
    }
  }
  if (!source || typeof source !== "object") return "";
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findNestedField(item, fieldNames);
      if (found) return found;
    }
    return "";
  }

  for (const fieldName of fieldNames) {
    if (source[fieldName]) return source[fieldName];
  }

  for (const value of Object.values(source)) {
    if (value && typeof value === "object") {
      const found = findNestedField(value, fieldNames);
      if (found) return found;
    }
  }
  return "";
};

const getRequestStage = (request) => {
  const rawStage = String(
    findNestedField(request, ["etapa_codigo", "etapaCodigo"]),
  )
    .trim()
    .toLowerCase();
  const stageAliases = {
    "revision 1": "revision_1",
    "revision-1": "revision_1",
    "revision 2": "revision_2",
    "revision-2": "revision_2",
  };
  return stageAliases[rawStage] || rawStage;
};

const getDecanatoResult = (request) =>
  request?.corte_decanato?.resultado ||
  request?.corte_decanato?.estado_final ||
  request?.resultado ||
  request?.estado_final ||
  "";

const getDecanatoResolution = (request) =>
  request?.corte_decanato?.resolucion || request?.resolucion || "";

const getRequestVisualStatus = (request) => {
  const stage = getRequestStage(request);
  const result = String(getDecanatoResult(request) || "")
    .trim()
    .toLowerCase();
  if (stage === "finalizado") {
    return result.includes("rechaz")
      ? { label: "Rechazada · proceso finalizado", tone: "rejected" }
      : { label: "En orden · solicitud aprobada", tone: "ok" };
  }
  if (hasCorrectionsInRequest(request))
    return { label: "Requiere corrección", tone: "correction" };
  if (stage === "firmas" && request.firmas_completas) {
    return {
      label: "Pendiente · lista para enviar a Decanato",
      tone: "pending",
    };
  }
  return { label: "Pendiente", tone: "pending" };
};

function Dashboard({ userData }) {
  const [ownRequests, setOwnRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(
    userData?.role?.toLowerCase() === "admin",
  );
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState({});
  const [selectedFormsByRequest, setSelectedFormsByRequest] = useState({});
  const [bulkReviewLoadingByRequest, setBulkReviewLoadingByRequest] = useState(
    {},
  );
  const [reviewAction, setReviewAction] = useState({});
  const [reviewComment, setReviewComment] = useState({});
  const [workflowObservations, setWorkflowObservations] = useState({});
  const [observationDrafts, setObservationDrafts] = useState({});
  const [signatureFiles, setSignatureFiles] = useState({});
  const [signatureNotes, setSignatureNotes] = useState({});
  const [decanatoEmailData, setDecanatoEmailData] = useState({});
  const [sendDecanatoRequest, setSendDecanatoRequest] = useState(null);
  const [decanatoData, setDecanatoData] = useState({});
  const [totalHoursByRequest, setTotalHoursByRequest] = useState({});
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#9c27b0",
      },
      default: {
        main: "#e0e0e0",
      },
    },
  });

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const requestsResponse = await axios.get(`${API_URL}/getRequests`, {
          params: { userId: userData.id },
        });
        console.log("Respuesta de /getRequests:", requestsResponse.data);

        const roleFromApi = requestsResponse.data.role || "";
        const adminFromApi = Boolean(requestsResponse.data?.isAdmin);
        const adminByRole =
          String(roleFromApi).toLowerCase() === "admin" ||
          String(userData?.role || "").toLowerCase() === "admin";
        const adminUser = adminFromApi || adminByRole;

        const activeRequestsData = Array.isArray(
          requestsResponse.data?.activeRequests,
        )
          ? requestsResponse.data.activeRequests
          : [];
        const completedRequestsData = Array.isArray(
          requestsResponse.data?.completedRequests,
        )
          ? requestsResponse.data.completedRequests
          : [];

        const normalizedActive = activeRequestsData.map(normalizeRequest);
        const normalizedCompleted = completedRequestsData.map(normalizeRequest);
        const mergedRequests = mergeUniqueRequests([
          ...normalizedActive,
          ...normalizedCompleted,
        ]).filter((request) => Boolean(request.idSolicitud));

        if (adminUser) {
          const own = mergedRequests.filter((request) =>
            isOwnRequest(request, userData.id, userData.name, userData.email),
          );
          const correctionsFromOthers = mergedRequests.filter(
            (request) =>
              !isOwnRequest(
                request,
                userData.id,
                userData.name,
                userData.email,
              ) && hasCorrectionsInRequest(request),
          );

          setOwnRequests(own);

          try {
            const revisionResponse = await axios.get(
              `${API_URL}/admin/solicitudesRevision`,
              {
                params: { userId: userData.id },
              },
            );

            const revisionData = Array.isArray(revisionResponse.data?.data)
              ? revisionResponse.data.data
              : [];
            console.log("Solicitudes en revisión para admin:", revisionData);

            const normalizedRevisionRequests = revisionData
              .map(normalizeRevisionRequest)
              .filter((request) => Boolean(request.idSolicitud));

            setReceivedRequests(
              mergeUniqueRequests([
                ...normalizedRevisionRequests,
                ...correctionsFromOthers,
              ]),
            );
          } catch (revisionError) {
            console.error(
              "Error al obtener solicitudes en revision para admin:",
              revisionError,
            );
            setReceivedRequests(correctionsFromOthers);
          }
        } else {
          setOwnRequests(mergedRequests);
          setReceivedRequests([]);
        }

        setIsAdmin(adminUser);
        console.log("Solicitudes cargadas desde /getRequests:", mergedRequests);
      } catch (error) {
        // Fallback para mantener compatibilidad con los endpoints actuales.
        try {
          const activeResponse = await axios.get(
            `${API_URL}/getActiveRequests`,
            { params: { userId: userData.id } },
          );

          const activeRequests = Array.isArray(activeResponse.data)
            ? activeResponse.data
            : [];
          const requestsWithStages = activeRequests.map(normalizeRequest);

          let mergedRequests = [...requestsWithStages];

          try {
            const completedResponse = await axios.get(
              `${API_URL}/getCompletedRequests`,
              { params: { userId: userData.id } },
            );

            const fullyCompletedRequests = Array.isArray(completedResponse.data)
              ? completedResponse.data
              : [];
            const fullyCompletedRequestsWithStages =
              fullyCompletedRequests.map(normalizeRequest);

            const allCompleted = requestsWithStages.filter((request) => {
              if (!request.estadoFormularios) return false;
              return Object.values(request.estadoFormularios).every(
                isCompletedStatus,
              );
            });

            mergedRequests = mergeUniqueRequests([
              ...requestsWithStages,
              ...fullyCompletedRequestsWithStages,
              ...allCompleted,
            ]);
          } catch (completedError) {
            if (completedError.response?.status !== 404) {
              console.error(
                "Error al obtener solicitudes completadas:",
                completedError,
              );
            }
          }

          const isAdminFallback =
            String(userData?.role || "").toLowerCase() === "admin";
          const validRequests = mergedRequests.filter((request) =>
            Boolean(request.idSolicitud),
          );

          setIsAdmin(isAdminFallback);

          if (isAdminFallback) {
            const own = validRequests.filter((request) =>
              isOwnRequest(request, userData.id, userData.name, userData.email),
            );
            const correctionsFromOthers = validRequests.filter(
              (request) =>
                !isOwnRequest(
                  request,
                  userData.id,
                  userData.name,
                  userData.email,
                ) && hasCorrectionsInRequest(request),
            );

            setOwnRequests(own);
            setReceivedRequests(correctionsFromOthers);
          } else {
            setOwnRequests(validRequests);
            setReceivedRequests([]);
          }

          console.log("Solicitudes cargadas desde fallback:", mergedRequests);
        } catch (fallbackError) {
          console.error("Error al obtener solicitudes:", error);
          console.error("Error en fallback de solicitudes:", fallbackError);
          setOwnRequests([]);
          setReceivedRequests([]);
        }
      }
      setLoading(false);
    };
    if (userData && userData.id) {
      fetchRequests();
    }
  }, [userData]);

  useEffect(() => {
    const workflowRoles = [
      "revisor_1",
      "revisor_2",
      "presupuesto",
      "decanato",
      "director",
      "admin",
    ];
    if (
      !userData?.id ||
      !workflowRoles.includes(String(userData.role || "").toLowerCase())
    )
      return undefined;
    setIsAdmin(true);
    let active = true;
    const loadWorkflowQueue = async () => {
      try {
        const role = String(userData.role || "").toLowerCase();
        const queueItems =
          role === "decanato"
            ? await getWorkflowQueue()
            : await getWorkflowConsultation();
        if (!active) return;
        const normalized = queueItems
          .map(normalizeRevisionRequest)
          .filter((item) => item.idSolicitud);
        setReceivedRequests((previous) =>
          mergeUniqueRequests([...normalized, ...previous]),
        );
        await Promise.all(
          normalized.map(async (request) => {
            try {
              const observations = await getWorkflowObservations(
                request.idSolicitud,
              );
              if (active)
                setWorkflowObservations((previous) => ({
                  ...previous,
                  [request.idSolicitud]: observations,
                }));
            } catch (error) {
              if (error?.response?.status !== 404) {
                console.error(
                  `No fue posible cargar observaciones de ${request.idSolicitud}:`,
                  error,
                );
              }
            }
          }),
        );
      } catch (error) {
        console.error("No fue posible cargar la cola del workflow:", error);
      }
    };
    loadWorkflowQueue();
    return () => {
      active = false;
    };
  }, [userData]);

  useEffect(() => {
    if (ownRequests.length > 0) {
      console.log(
        "Mis solicitudes:",
        ownRequests.map((request) => ({
          id: request.idSolicitud,
          etapa: request.etapa_actual,
          nombre: request.nombre_actividad,
          estadoFormularios: request.estadoFormularios,
        })),
      );
    }
  }, [ownRequests]);

  useEffect(() => {
    if (!ownRequests.length) return undefined;
    let active = true;
    const loadRequesterObservations = async () => {
      await Promise.all(
        ownRequests.map(async (request) => {
          if (workflowObservations[request.idSolicitud]) return;
          try {
            const observations = await getWorkflowObservations(
              request.idSolicitud,
            );
            if (active) {
              setWorkflowObservations((previous) => ({
                ...previous,
                [request.idSolicitud]: observations,
              }));
            }
          } catch (error) {
            if (error?.response?.status !== 404) {
              console.error(
                `No fue posible cargar observaciones de ${request.idSolicitud}:`,
                error,
              );
            }
          }
        }),
      );
    };
    loadRequesterObservations();
    return () => {
      active = false;
    };
  }, [ownRequests, workflowObservations]);

  const handleCreateNewRequest = async () => {
    try {
      console.log("🆕 Solicitando nuevo ID de solicitud...");
      localStorage.removeItem("id_solicitud");
      localStorage.removeItem("formData");

      const response = await axios.get(`${API_URL}/getLastId`, {
        params: { sheetName: "SOLICITUDES" }, // Asegurar que esté consultando la hoja correcta
      });
      console.log("Respuesta de getLastId:", response.data);

      if (!response.data || response.status !== 200) {
        throw new Error("Respuesta inesperada del servidor.");
      }
      // Generar un nuevo ID sumando 1 al último ID registrado
      const nuevoId = (response.data.lastId || 0) + 1;
      console.log(`✅ Nuevo ID generado: ${nuevoId}`);
      //  Guardar el nuevo ID en localStorage
      localStorage.setItem("id_solicitud", nuevoId);

      //Insertar la nueva fila en Google Sheets para registrar la solicitud
      await axios.post(`${API_URL}/createNewRequest`, {
        id_solicitud: nuevoId,
        fecha_solicitud: new Date().toISOString().split("T")[0], // Fecha actual
        nombre_actividad: "",
        nombre_solicitante: userData.name, // Nombre del usuario autenticado
        dependencia_tipo: "",
        nombre_dependencia: "",
      });

      // Bloquea el primer "Siguiente" durante 1 minuto tras crear la solicitud.
      const initialCooldownUntil = Date.now() + 60 * 1000;
      localStorage.setItem(
        `form1_nextCooldownUntil_${nuevoId}`,
        String(initialCooldownUntil),
      );

      console.log(`✅ Nueva solicitud guardada con ID: ${nuevoId}`);

      //Redirigir al usuario al formulario de la solicitud creada
      navigate(`/formulario/1?solicitud=${nuevoId}&paso=0`);
    } catch (error) {
      console.error("🚨 Error al generar el ID de la solicitud:", error);
      alert(
        "Hubo un problema al crear la nueva solicitud. Inténtalo de nuevo.",
      );
    }
  };

  const handleNavigateToForm = async (
    request,
    formNumber,
    readOnly = false,
  ) => {
    try {
      const { idSolicitud } = request;

      // Limpiar localStorage antes de la navegación
      localStorage.removeItem("formData");
      localStorage.setItem("id_solicitud", idSolicitud);

      // Obtener datos actualizados de la solicitud
      console.log(
        `🔎 Cargando datos para solicitud ${idSolicitud}, formulario ${formNumber}`,
      );
      const response = await axios.get(`${API_URL}/getSolicitud`, {
        params: { id_solicitud: idSolicitud },
      });

      if (response.status === 200 && response.data) {
        // Guardar los datos actualizados en localStorage
        const solicitudData = flattenSolicitudResponse(response.data);
        const solicitudMeta = response.data?.SOLICITUDES || solicitudData;
        const etapaActual = Number(solicitudMeta?.etapa_actual || 0);
        const pasoActual = Number(solicitudMeta?.paso || 0);
        const pasoDestino = formNumber === etapaActual ? pasoActual : 0;
        localStorage.setItem("formData", JSON.stringify(solicitudData));
        console.log(
          `✅ Datos cargados correctamente para solicitud ${idSolicitud}`,
        );

        // Navegar al formulario
        navigate(
          `/formulario/${formNumber}?solicitud=${idSolicitud}&paso=${pasoDestino}${readOnly ? "&readOnly=1" : ""}`,
        );
      } else {
        throw new Error("No se encontraron datos para esta solicitud");
      }
    } catch (error) {
      console.error("Error al cargar los datos de la solicitud:", error);
      alert(
        "Hubo un problema al cargar los datos de la solicitud seleccionada.",
      );
    }
  };

  const formNames = [
    "Aprobación",
    "Presupuesto",
    "Matriz de riesgos",
    "Mercadeo",
  ];

  const getButtonState = (request, formNumber, { isReceived = false } = {}) => {
    const currentStage = Number(request.etapa_actual) || 0;
    const currentForm = formNumber === currentStage;

    // Verificar el estado específico de este formulario
    const formStatus = resolveFormStatus(request, formNumber) || "En progreso";
    const normalizedStatus = normalizeStatusForMatch(formStatus);
    const isThisFormCompleted = isCompletedStatus(formStatus);
    const isApproved = normalizedStatus === "aprobado";
    const isInReview = normalizedStatus === "enviado a revision";
    const isCorrections = isCorrectionsStatus(formStatus);
    const isInProgress = normalizedStatus === "en progreso";

    const blockedForOwner =
      !isAdmin && !isReceived && isLockedForOwner(formStatus);

    if (!isReceived && !isAdmin && getRequestStage(request) === "solicitud") {
      return {
        formEnabled: true,
        reportEnabled: true,
        formColor:
          isCompletedStatus(formStatus) || isApproved ? "#1976d2" : "#90caf9",
        reportColor: "#f0611a",
        cursor: "pointer",
        progress: isCompletedStatus(formStatus) || isApproved ? 100 : 50,
      };
    }

    if (isApproved) {
      return {
        formEnabled: isReceived || !blockedForOwner,
        reportEnabled: true,
        formColor: "#2e7d32",
        reportColor: "#f0611a",
        cursor: blockedForOwner ? "not-allowed" : "pointer",
        progress: 100,
      };
    }

    if (isInReview) {
      return {
        formEnabled: isAdmin || isReceived,
        reportEnabled: isAdmin || isReceived,
        formColor: "#f9a825",
        reportColor: "#f0611a",
        cursor: isAdmin || isReceived ? "pointer" : "not-allowed",
        progress: 100,
      };
    }

    if (isCorrections) {
      return {
        formEnabled: isReceived || !blockedForOwner,
        reportEnabled: isReceived,
        formColor: "#ef6c00",
        reportColor: isReceived ? "#f0611a" : "#e0e0e0",
        cursor: isReceived || !blockedForOwner ? "pointer" : "not-allowed",
        progress: 100,
      };
    }

    if (isInProgress) {
      return {
        formEnabled: !isReceived,
        reportEnabled: false,
        formColor: isReceived ? "#e0e0e0" : "#90caf9",
        reportColor: "#e0e0e0",
        cursor: isReceived ? "not-allowed" : "pointer",
        progress: 50,
      };
    }

    const isCurrentFormComplete = isFormCompleted(request, formNumber);
    const isPast = formNumber < currentStage;
    const isCompleted =
      isFormCompleted(request, formNumber) || isThisFormCompleted;

    // Lógica para solicitudes en creación
    if (isCurrentFormComplete || isPast || isThisFormCompleted) {
      return {
        // Los revisores pueden consultar y descargar formularios completados
        // en modo lectura, aunque no puedan editarlos.
        formEnabled: isReceived || !blockedForOwner,
        reportEnabled: isCompleted,
        formColor: "#1976d2",
        reportColor: isCompleted ? "#f0611a" : "#e0e0e0",
        cursor: "pointer",
        progress: 100,
      };
    } else if (currentForm) {
      // Permitir continuar desde el boton del formulario en curso.
      return {
        formEnabled: true,
        reportEnabled: false,
        formColor: "#90caf9",
        reportColor: "#e0e0e0",
        cursor: "pointer",
        progress: 50,
      };
    } else {
      const allowDirectFormAccess = !isReceived;

      // Permitir acceso directo por boton de formulario cuando es solicitud propia.
      return {
        formEnabled: allowDirectFormAccess,
        reportEnabled: false,
        formColor: allowDirectFormAccess ? "#bcd7f6" : "#e0e0e0",
        reportColor: "#e0e0e0",
        cursor: allowDirectFormAccess ? "pointer" : "not-allowed",
        progress: allowDirectFormAccess ? 10 : 0,
      };
    }
  };

  function isFormCompleted(request, formNumber) {
    const normalizedStatus = normalizeStatusForMatch(
      resolveFormStatus(request, formNumber),
    );
    if (
      isCompletedStatus(normalizedStatus) ||
      normalizedStatus === "aprobado"
    ) {
      return true;
    }

    // 1. Verificar primero si está marcado explícitamente como completado
    if (isCompletedStatus(request[`estado_formulario_${formNumber}`])) {
      return true;
    }

    // 2. Obtener el formulario actual que está trabajando el usuario
    const currentFormNumber = Number(request.etapa_actual) || 0;

    // 3. Si es un formulario pasado (ya completado), debe estar disponible para reporte
    if (formNumber < currentFormNumber) {
      return true;
    }

    // 4. Si es el formulario actual, verificar si ha alcanzado el máximo de pasos
    if (formNumber === currentFormNumber) {
      const maxSteps = { 1: 5, 2: 3, 3: 5, 4: 5 };
      return request.paso >= maxSteps[formNumber];
    }

    // 5. Los formularios futuros nunca están completos excepto si están explícitamente marcados
    return false;
  }

  const handleDownloadFormReport = async (request, formNumber) => {
    const key = `${request.idSolicitud}-${formNumber}`;
    setLoadingReports((prev) => ({ ...prev, [key]: true }));
    try {
      const { idSolicitud } = request;
      if (!idSolicitud || !formNumber) {
        alert("No se puede descargar el informe porque falta información.");
        setLoadingReports((prev) => ({ ...prev, [key]: false }));
        return;
      }
      await downloadFormReport(idSolicitud, formNumber);
    } catch (error) {
      alert("Hubo un problema al descargar el reporte. Inténtalo de nuevo.");
      console.error("Error al descargar el reporte:", error);
    } finally {
      setLoadingReports((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getRequestTotalHours = async (request) => {
    const directHours = Number(
      request?.total_horas ??
        request?.totalHoras ??
        request?.SOLICITUDES?.total_horas,
    );
    if (!Number.isNaN(directHours) && directHours > 0) {
      return directHours;
    }

    try {
      const response = await axios.get(`${API_URL}/getSolicitud`, {
        params: { id_solicitud: request.idSolicitud },
      });
      const solicitudData = flattenSolicitudResponse(response.data);
      const fetchedHours = Number(
        solicitudData?.total_horas ?? solicitudData?.totalHoras,
      );
      return Number.isNaN(fetchedHours) ? 0 : fetchedHours;
    } catch (error) {
      console.warn(
        "No fue posible obtener total_horas para validacion de revision:",
        error,
      );
      return 0;
    }
  };

  useEffect(() => {
    let active = true;
    const loadTotalHours = async () => {
      const entries = await Promise.all(
        ownRequests.map(async (request) => [
          request.idSolicitud,
          await getRequestTotalHours(request),
        ]),
      );
      if (active)
        setTotalHoursByRequest((previous) => ({
          ...previous,
          ...Object.fromEntries(entries),
        }));
    };
    if (ownRequests.length) loadTotalHours();
    return () => {
      active = false;
    };
  }, [ownRequests]);

  const requiresRiskMatrix = (request) => {
    const directValue =
      totalHoursByRequest[request.idSolicitud] ??
      request.total_horas ??
      request.totalHoras ??
      request.SOLICITUDES?.total_horas;
    return Number(directValue) >= 16;
  };

  const isFormSelectableForReview = (request, formNumber) => {
    const formStatus = resolveFormStatus(request, formNumber);
    const normalized = normalizeStatusForMatch(formStatus);
    if (normalized === "aprobado" || normalized === "enviado a revision") {
      return false;
    }

    if (isCorrectionsStatus(formStatus)) {
      return true;
    }

    return isFormCompleted(request, formNumber) || normalized === "completado";
  };

  const areRequiredFormsComplete = (request) =>
    [1, 2, ...(requiresRiskMatrix(request) ? [3] : [])].every((formNumber) => {
      const status = normalizeStatusForMatch(
        resolveFormStatus(request, formNumber),
      );
      return status === "completado" || status === "aprobado";
    });

  const toggleFormSelection = (requestId, formNumber) => {
    setSelectedFormsByRequest((prev) => {
      const currentRequestSelection = prev[requestId] || {};
      return {
        ...prev,
        [requestId]: {
          ...currentRequestSelection,
          [formNumber]: !currentRequestSelection[formNumber],
        },
      };
    });
  };

  const handleSendSelectedFormsToReview = async (
    request,
    submitAllCompleted = false,
  ) => {
    const requestId = request.idSolicitud;
    const pendingObservations = getPendingObservations(
      getRequestObservations(request),
    );
    if (pendingObservations.length > 0) {
      alert(
        "Debes marcar como subsanadas todas las observaciones antes de reenviar la solicitud a revisión.",
      );
      return;
    }
    const selectedMap = selectedFormsByRequest[requestId] || {};
    const selectedForms = (
      submitAllCompleted
        ? [1, 2, 3, 4].map(String).map((formNumber) => [formNumber, true])
        : Object.entries(selectedMap)
    )
      .filter(([formNumber, isSelected]) => {
        if (!isSelected) return false;
        return isFormSelectableForReview(request, Number(formNumber));
      })
      .map(([formNumber]) => Number(formNumber));

    if (selectedForms.length === 0) {
      alert("Seleccione al menos un formulario para enviar a revision.");
      return;
    }

    const normalizedStatus1 = normalizeStatusForMatch(
      resolveFormStatus(request, 1),
    );
    const normalizedStatus2 = normalizeStatusForMatch(
      resolveFormStatus(request, 2),
    );
    const normalizedStatus3 = normalizeStatusForMatch(
      resolveFormStatus(request, 3),
    );

    const isAlreadySatisfied = (normalizedStatus) =>
      normalizedStatus === "aprobado" ||
      normalizedStatus === "enviado a revision";

    const form1Satisfied =
      selectedForms.includes(1) || isAlreadySatisfied(normalizedStatus1);
    const form2Satisfied =
      selectedForms.includes(2) || isAlreadySatisfied(normalizedStatus2);

    if (!form1Satisfied || !form2Satisfied) {
      if (!form1Satisfied && !form2Satisfied) {
        alert(
          "Para enviar a revision debe incluir los formularios 1 y 2, salvo que ya esten aprobados o enviados a revision.",
        );
      } else if (!form1Satisfied) {
        alert(
          "Para enviar a revision debe incluir el formulario 1, salvo que ya este aprobado o enviado a revision.",
        );
      } else {
        alert(
          "Para enviar a revision debe incluir el formulario 2, salvo que ya este aprobado o enviado a revision.",
        );
      }
      return;
    }

    const totalHoras = await getRequestTotalHours(request);
    const form3Satisfied =
      selectedForms.includes(3) || isAlreadySatisfied(normalizedStatus3);
    if (totalHoras >= 16 && !form3Satisfied) {
      alert(
        "Como el total de horas de la actividad es mayor o igual a 16, el formulario 3 es obligatorio para enviar a revision.",
      );
      return;
    }

    setBulkReviewLoadingByRequest((prev) => ({ ...prev, [requestId]: true }));
    try {
      const response = await sendFormsToRevision({
        id_solicitud: requestId,
        userId: userData.id,
        formularios: selectedForms,
      });

      if (response?.success) {
        const responseData = response.data?.data || response.data || response;
        const nextStage =
          responseData.etapa_codigo ||
          responseData.etapaCodigo ||
          responseData.ETAPAS?.etapa_codigo ||
          responseData.etapas?.etapa_codigo ||
          request.etapa_anterior ||
          "revision_1";
        const responseStatuses = extractEstadoFormularios(responseData);

        setOwnRequests((prev) =>
          prev.map((item) => {
            if (String(item.idSolicitud) !== String(requestId)) {
              return item;
            }

            const nextStatuses = { ...(item.estadoFormularios || {}) };
            selectedForms.forEach((formNumber) => {
              nextStatuses[String(formNumber)] = "Enviado a revision";
            });

            return {
              ...item,
              estadoFormularios:
                Object.keys(responseStatuses).length > 0
                  ? responseStatuses
                  : nextStatuses,
              etapa_codigo: nextStage,
              etapa_anterior: "",
            };
          }),
        );

        setSelectedFormsByRequest((prev) => ({ ...prev, [requestId]: {} }));
        alert("Formularios seleccionados enviados a revision correctamente.");
      }
    } catch (error) {
      console.error(
        "Error al enviar formularios seleccionados a revision:",
        error,
      );
      alert(
        error?.response?.data?.message ||
          "No se pudieron enviar los formularios seleccionados a revision.",
      );
    } finally {
      setBulkReviewLoadingByRequest((prev) => ({
        ...prev,
        [requestId]: false,
      }));
    }
  };

  const getReviewerStage = (role) =>
    ({
      revisor_1: "revision_1",
      revisor_2: "revision_2",
      presupuesto: "presupuesto",
    })[String(role || "").toLowerCase()] || "";

  const isDecanatoCloser = (request) =>
    getRequestStage(request) === "decanato" &&
    ["decanato", "revisor_1", "revisor_2"].includes(
      String(userData?.role || "").toLowerCase(),
    );

  const loadRequestObservations = async (requestId) => {
    const observations = await getWorkflowObservations(requestId);
    setWorkflowObservations((previous) => ({
      ...previous,
      [requestId]: observations,
    }));
    return observations;
  };

  const handleLegacyAdminAction = async (request, action) => {
    const requestId = request.idSolicitud;
    const comment = String(reviewComment[requestId] || "").trim();
    if (action !== "approve" && !comment) {
      alert("Escribe una observación antes de devolver la solicitud.");
      return;
    }
    setReviewAction((previous) => ({ ...previous, [requestId]: action }));
    try {
      if (action === "approve") {
        await approveFullRequest({
          id_solicitud: requestId,
          userId: userData.id,
        });
      } else {
        await sendCorrections({
          id_solicitud: requestId,
          userId: userData.id,
          formularios: [1, 2, 3, 4].filter((number) =>
            resolveFormStatus(request, number),
          ),
          comentarios: comment,
          comentarios_por_formulario: { general: comment },
        });
      }
      alert(
        action === "approve"
          ? "Solicitud aprobada correctamente."
          : "Solicitud devuelta con observaciones.",
      );
      window.location.reload();
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudo actualizar la solicitud.",
      );
    } finally {
      setReviewAction((previous) => ({ ...previous, [requestId]: null }));
    }
  };

  const handleAddObservation = async (request) => {
    const requestId = request.idSolicitud;
    const draft = observationDrafts[requestId] || {};
    const text = String(draft.text || "").trim();
    if (!text) {
      alert("Escribe la observación antes de agregarla.");
      return;
    }
    try {
      await addWorkflowObservation(requestId, {
        etapa: request.etapa_codigo,
        observacion: text,
      });
      setObservationDrafts((previous) => ({ ...previous, [requestId]: {} }));
      await loadRequestObservations(requestId);
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudo guardar la observación.",
      );
    }
  };

  const handleObservationStatus = async (request, observation, estado) => {
    try {
      await updateWorkflowObservation(
        request.idSolicitud,
        observation.id_observacion,
        { estado },
      );
      await loadRequestObservations(request.idSolicitud);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "No se pudo actualizar la observación.",
      );
    }
  };

  const getRequestObservations = (request) => {
    const loaded = workflowObservations[request.idSolicitud];
    if (Array.isArray(loaded)) return loaded;
    return Object.values(request.comentarios || {}).flatMap((items) =>
      Array.isArray(items) ? items : [],
    );
  };

  const handleWorkflowSignature = async (request) => {
    const file = signatureFiles[request.idSolicitud];
    if (!file) {
      alert("Selecciona la imagen de la firma.");
      return;
    }
    try {
      const response = await registerWorkflowSignature(request.idSolicitud, {
        file,
        observaciones: signatureNotes[request.idSolicitud] || "",
        destinatariosDecanato: String(
          decanatoEmailData[request.idSolicitud]?.destinatarios || "",
        )
          .split(/[;,\n]/)
          .map((email) => email.trim())
          .filter(Boolean),
        asuntoDecanato: decanatoEmailData[request.idSolicitud]?.asunto || "",
        cuerpoDecanato: decanatoEmailData[request.idSolicitud]?.cuerpo || "",
      });
      alert(
        response?.data?.notificacion?.estado === "fallida"
          ? "La firma se registró, pero el correo no pudo enviarse."
          : "Firma registrada correctamente.",
      );
      window.location.reload();
    } catch (error) {
      alert(error?.response?.data?.message || "No se pudo registrar la firma.");
    }
  };

  const handleSignatureReminder = async (request, tipoFirma) => {
    try {
      const response = await remindWorkflowSignature(
        request.idSolicitud,
        tipoFirma,
      );
      alert(
        response?.data?.notificacion?.estado === "fallida"
          ? "El recordatorio no pudo enviarse."
          : "Recordatorio enviado.",
      );
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudo enviar el recordatorio.",
      );
    }
  };

  const handleSendToDecanato = async () => {
    if (!sendDecanatoRequest) return;
    const requestId = sendDecanatoRequest.idSolicitud;
    const data = decanatoEmailData[requestId] || {};
    try {
      const response = await sendWorkflowRequestToDecanato(requestId, {
        destinatariosDecanato: String(data.destinatarios || "")
          .split(/[;,\n]/)
          .map((email) => email.trim())
          .filter(Boolean),
        asuntoDecanato: data.asunto || "",
        cuerpoDecanato: data.cuerpo || "",
      });
      const failed = (response?.data?.notificaciones_decanato || []).some(
        (notification) => notification.estado === "fallida",
      );
      setSendDecanatoRequest(null);
      alert(
        failed
          ? "La solicitud pasó a Decanato, pero uno o más correos fallaron."
          : "Solicitud enviada a Decanato correctamente.",
      );
      window.location.reload();
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "No se pudo enviar la solicitud a Decanato.",
      );
    }
  };

  const handleDecanatoClosure = async (request) => {
    const data = decanatoData[request.idSolicitud] || {};
    const resultado = data.resultado || "Aprobada";
    const resolucion = String(data.resolucion || "").trim();
    if (!resolucion) {
      alert("La resolución es obligatoria para cerrar la solicitud.");
      return;
    }
    try {
      await submitDecanatoCut({
        idSolicitud: request.idSolicitud,
        resultado,
        resolucion,
        observaciones: data.observaciones || "",
        pdfResolucion: data.pdf,
      });
      alert("Solicitud cerrada correctamente.");
      window.location.reload();
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudo cerrar la solicitud.",
      );
    }
  };

  const handleWorkflowReviewerAction = async (request, action) => {
    const requestId = request.idSolicitud;
    const reviewerStage = getReviewerStage(userData.role);
    const currentStage = getRequestStage(request);
    const comment = String(reviewComment[requestId] || "").trim();
    if (!reviewerStage || currentStage !== reviewerStage) return;
    setReviewAction((prev) => ({ ...prev, [requestId]: action }));
    try {
      const workflowAction = action === "return" ? "devolver" : "aprobar";
      await submitWorkflowDecision(requestId, {
        accion: workflowAction,
        comentario: comment,
        comentarios_por_formulario: comment ? { general: comment } : {},
      });
      alert(
        action === "approve"
          ? "Etapa aprobada."
          : "Solicitud devuelta con observaciones.",
      );
      window.location.reload();
    } catch (error) {
      alert(
        error?.response?.data?.message || "No se pudo actualizar la revisión.",
      );
    } finally {
      setReviewAction((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  if (!userData || !userData.id) {
    return <div>Cargando...</div>;
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <div
          style={{ padding: "20px", marginTop: "130px", textAlign: "center" }}
        >
          <CircularProgress />
        </div>
      </ThemeProvider>
    );
  }

  const flowStages = [
    [
      "Solicitud",
      "El solicitante diligencia y envía los formularios.",
      "Solicitante",
    ],
    [
      "Revisión 1",
      "Validación inicial por Extensión.",
      "Revisor 1 de Extensión",
    ],
    [
      "Revisión 2",
      "Verificación de correcciones y requisitos.",
      "Revisor 2 de Extensión",
    ],
    ["Presupuesto", "Revisión financiera.", "Presupuesto"],
    ["Firmas", "Firma del solicitante y director.", "Solicitante y director"],
    [
      "Decanato",
      "Envío al corte y decisión institucional.",
      "Decanato, Revisor 1 o Revisor 2",
    ],
    ["Finalizado", "Solicitud aprobada o rechazada.", "Proceso finalizado"],
  ];

  const getFlowIndex = (request) => {
    const stageIndex = {
      solicitud: 0,
      revision_1: 1,
      revision_2: 2,
      presupuesto: 3,
      firmas: 4,
      decanato: 5,
      finalizado: 6,
    };
    const explicitStage = getRequestStage(request);
    if (stageIndex[explicitStage] !== undefined)
      return stageIndex[explicitStage];
    const statuses = Object.values(request.estadoFormularios || {}).map(
      normalizeStatusForMatch,
    );
    if (statuses.some((s) => s.includes("requiere correccion"))) return 0;
    if (statuses.some((s) => s === "aprobado")) return 4;
    if (statuses.some((s) => s === "enviado a revision")) return 1;
    if (statuses.every((s) => s === "completado") && statuses.length) return 1;
    return 0;
  };

  const renderRequesterStages = (request) => {
    const currentStage = getFlowIndex(request);
    const riskMatrixRequired = requiresRiskMatrix(request);
    const requestObservations = getRequestObservations(request);
    const pendingObservations = getPendingObservations(requestObservations);
    const stages = [
      {
        name: "Solicitud",
        description: "Diligenciamiento y envío de los formularios.",
        content:
          "Aquí puedes completar tus formularios y enviarlos a revisión.",
      },
      {
        name: "Revisión 1",
        description: "Validación inicial por Extensión.",
        content: "Esta etapa está a cargo del primer revisor de Extensión.",
      },
      {
        name: "Revisión 2",
        description: "Verificación de la solicitud y correcciones.",
        content: "Esta etapa está a cargo del segundo revisor de Extensión.",
      },
      {
        name: "Presupuesto",
        description: "Revisión financiera.",
        content:
          "Presupuesto revisa la información financiera de la solicitud.",
      },
      {
        name: "Firmas",
        description: "Firma del solicitante y del director.",
        content: "La solicitud requiere las firmas correspondientes.",
      },
      {
        name: "Decanato",
        description: "Envío al corte y decisión institucional.",
        content: "La solicitud se presenta en el corte de Decanato.",
      },
      {
        name: "Finalizado",
        description: "Resultado de la solicitud.",
        content: request.estado_general || "La solicitud aún no ha finalizado.",
      },
    ];

    return (
      <Box className="requester-stages">
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
          Seguimiento de la solicitud
        </Typography>
        <Stepper activeStep={currentStage} orientation="vertical">
          {stages.map((stage, index) => {
            const isCurrent = index === currentStage;
            const isPast = index < currentStage;
            return (
              <Step key={stage.name} completed={isPast}>
                <StepLabel
                  optional={
                    <Typography variant="caption" color="text.secondary">
                      {stage.description} · Responsable:{" "}
                      {
                        [
                          "Solicitante",
                          "Revisor 1 de Extensión",
                          "Revisor 2 de Extensión",
                          "Presupuesto",
                          "Solicitante y director",
                          "Decanato, Revisor 1 o Revisor 2",
                          "Proceso finalizado",
                        ][index]
                      }
                    </Typography>
                  }
                >
                  {stage.name}
                </StepLabel>
                <StepContent>
                  <Accordion
                    className={`stage-detail ${isCurrent ? "stage-detail--current" : ""}`}
                    disableGutters
                    elevation={0}
                    defaultExpanded={isCurrent}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2" fontWeight={600}>
                        {isCurrent
                          ? "Etapa actual"
                          : isPast
                            ? "Etapa completada"
                            : "Etapa pendiente"}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {index === 0 ? (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1.5 }}
                          >
                            {stage.content}
                          </Typography>
                          {requestObservations.length > 0 && (
                            <div className="workflow-observations">
                              <Typography variant="body2" fontWeight={600}>
                                Observaciones de la revisión
                              </Typography>
                              {requestObservations.map((observation) => (
                                <div
                                  className="workflow-observation"
                                  key={
                                    observation.id_observacion ||
                                    `${request.idSolicitud}-${observation.observacion}`
                                  }
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="flex-start"
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={
                                        normalizeStatusForMatch(
                                          observation.estado,
                                        ) === "subsanada"
                                      }
                                      disabled={
                                        normalizeStatusForMatch(
                                          observation.estado,
                                        ) === "subsanada"
                                      }
                                      onChange={() =>
                                        handleObservationStatus(
                                          request,
                                          observation,
                                          "subsanada",
                                        )
                                      }
                                      inputProps={{
                                        "aria-label": `Marcar observación como subsanada: ${observation.observacion}`,
                                      }}
                                    />
                                    <Box>
                                      <Typography variant="body2">
                                        {observation.observacion}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {observation.nombre_autor || "Revisión"}{" "}
                                        · {observation.estado}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </div>
                              ))}
                            </div>
                          )}
                          <Typography
                            variant="subtitle2"
                            color="primary"
                            sx={{ mb: 1 }}
                          >
                            Formularios de la solicitud
                          </Typography>
                          <Stack spacing={1}>
                            {[1, 2, 3, 4].map((formNumber) => {
                              const status =
                                resolveFormStatus(request, formNumber) ||
                                "En progreso";
                              const state = getButtonState(request, formNumber);
                              const readOnly = isLockedForOwner(status);
                              return (
                                <Box
                                  className="requester-form"
                                  key={`${request.idSolicitud}-stage-${formNumber}`}
                                >
                                  <Box>
                                    <Stack
                                      direction="row"
                                      spacing={0.75}
                                      alignItems="center"
                                      flexWrap="wrap"
                                    >
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                      >
                                        {formNames[formNumber - 1]}
                                      </Typography>
                                      <Chip
                                        size="small"
                                        variant="outlined"
                                        color={
                                          formNumber <= 2 ||
                                          (formNumber === 3 &&
                                            riskMatrixRequired)
                                            ? "warning"
                                            : "default"
                                        }
                                        label={
                                          formNumber <= 2 ||
                                          (formNumber === 3 &&
                                            riskMatrixRequired)
                                            ? "Obligatorio"
                                            : "Opcional"
                                        }
                                      />
                                    </Stack>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {status}
                                    </Typography>
                                  </Box>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    className="requester-form__actions"
                                  >
                                    <Button
                                      size="small"
                                      variant="contained"
                                      disabled={!state.formEnabled}
                                      onClick={() =>
                                        handleNavigateToForm(
                                          request,
                                          formNumber,
                                          readOnly,
                                        )
                                      }
                                    >
                                      Abrir
                                    </Button>
                                    {state.reportEnabled && (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() =>
                                          handleDownloadFormReport(
                                            request,
                                            formNumber,
                                          )
                                        }
                                      >
                                        Reporte
                                      </Button>
                                    )}
                                  </Stack>
                                </Box>
                              );
                            })}
                          </Stack>
                          <Button
                            sx={{ mt: 1.5 }}
                            variant="contained"
                            color="secondary"
                            onClick={() =>
                              handleSendSelectedFormsToReview(request, true)
                            }
                            disabled={
                              !areRequiredFormsComplete(request) ||
                              pendingObservations.length > 0 ||
                              Boolean(
                                bulkReviewLoadingByRequest[request.idSolicitud],
                              )
                            }
                          >
                            {bulkReviewLoadingByRequest[request.idSolicitud]
                              ? "Enviando..."
                              : "Enviar formularios a revisión"}
                          </Button>
                          {pendingObservations.length > 0 && (
                            <Typography variant="caption" color="warning.main">
                              Marca como subsanadas todas las observaciones
                              pendientes para habilitar el reenvío.
                            </Typography>
                          )}
                          {!areRequiredFormsComplete(request) && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Completa Aprobación y Presupuesto
                              {riskMatrixRequired
                                ? " y Matriz de riesgos (total de horas igual o superior a 16)"
                                : ""}{" "}
                              para habilitar el envío a revisión.
                            </Typography>
                          )}
                        </>
                      ) : index === 4 &&
                        ![
                          "revisor_1",
                          "revisor_2",
                          "presupuesto",
                          "decanato",
                          "director",
                          "admin",
                        ].includes(
                          String(userData?.role || "").toLowerCase(),
                        ) ? (
                        renderWorkflowPanel(request)
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {stage.content}
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
        {request.historial?.length > 0 && (
          <details className="workflow-history">
            <summary>
              Historial de movimientos ({request.historial.length})
            </summary>
            <div className="workflow-history__list">
              {request.historial.map((entry, index) => (
                <div
                  className="workflow-history__item"
                  key={
                    entry.id_historial ||
                    `${request.idSolicitud}-history-${index}`
                  }
                >
                  <strong>{formatHistoryDate(entry.fecha)}</strong>
                  <span>
                    {formatHistoryAction(entry.accion)} ·{" "}
                    {entry.rol_actor || "Sistema"}
                  </span>
                  {entry.comentario && <small>{entry.comentario}</small>}
                </div>
              ))}
            </div>
          </details>
        )}
      </Box>
    );
  };

  const renderRequesterList = (requests) => (
    <div className="requester-list">
      {requests.map((request) => {
        const waitingCorrections = hasCorrectionsInRequest(request);
        const overallStatus =
          request.estado_general ||
          (waitingCorrections ? "Requiere correcciones" : "En proceso");
        return (
          <Accordion
            className={`requester-request request-status-card--${getRequestVisualStatus(request).tone}`}
            key={`requester-${request.idSolicitud}`}
            disableGutters
            elevation={0}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: "100%", pr: 1 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    {request.nombre_actividad ||
                      `Solicitud ${request.idSolicitud}`}
                  </Typography>
                  <span
                    className={`request-status-badge request-status-badge--${getRequestVisualStatus(request).tone}`}
                  >
                    {getRequestVisualStatus(request).label || overallStatus}
                  </span>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {request.fecha_solicitud || "Sin fecha"} · ID{" "}
                  {request.idSolicitud}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails className="requester-request__body">
              {renderRequesterStages(request)}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );

  const renderWorkflowPanel = (request) => {
    const role = String(userData?.role || "").toLowerCase() || "solicitante";
    const stage = getRequestStage(request);
    const reviewerStage = getReviewerStage(role);
    const observations = workflowObservations[request.idSolicitud] || [];
    const draft = observationDrafts[request.idSolicitud] || {};
    const canReview = reviewerStage === stage;
    const canAct = request.puede_actuar !== false;
    const canLegacyAdminReview =
      role === "admin" &&
      canAct &&
      !["decanato", "firmas", "finalizado"].includes(stage);
    const hasRegisteredSignature =
      role === "director"
        ? request.firma_director === true || request.firma_director === "true"
        : request.firma_solicitante === true ||
          request.firma_solicitante === "true";
    const signatureStage =
      stage === "firmas" &&
      ["solicitante", "director"].includes(role) &&
      canAct &&
      !hasRegisteredSignature;

    return (
      <div className="workflow-panel">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="subtitle2" color="primary">
            Acciones
          </Typography>
        </Stack>
        {request.puede_actuar === false && (
          <Typography variant="caption" color="text.secondary">
            Consulta de solo lectura:{" "}
            {request.motivo_sin_permiso ||
              "no tienes permiso para actuar en esta etapa."}
          </Typography>
        )}

        {(canReview || canLegacyAdminReview || stage === "decanato") && (
          <>
            <Typography variant="caption" color="text.secondary">
              {stage === "decanato"
                ? "El cierre final se registra desde Decanato."
                : `Etapa a cargo de ${reviewerStage || role}.`}
            </Typography>
            {observations.length > 0 && (
              <div className="workflow-observations">
                <Typography variant="body2" fontWeight={600}>
                  Observaciones
                </Typography>
                {observations.map((observation) => (
                  <div
                    className="workflow-observation"
                    key={observation.id_observacion}
                  >
                    <div>
                      <Typography variant="body2">
                        {observation.observacion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {observation.formulario
                          ? `Formulario ${observation.formulario}`
                          : "Etapa"}
                        {observation.paso ? ` · Paso ${observation.paso}` : ""}
                        {observation.nombre_autor
                          ? ` · ${observation.nombre_autor}`
                          : ""}
                      </Typography>
                    </div>
                    {canAct && observation.estado === "pendiente" && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          handleObservationStatus(
                            request,
                            observation,
                            "subsanada",
                          )
                        }
                      >
                        Marcar subsanada
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {(canReview || canLegacyAdminReview) && (
              <div className="workflow-observation-form">
                <textarea
                  aria-label="Texto de la observación"
                  placeholder="Agregar observación"
                  value={draft.text || ""}
                  onChange={(event) =>
                    setObservationDrafts((previous) => ({
                      ...previous,
                      [request.idSolicitud]: { text: event.target.value },
                    }))
                  }
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleAddObservation(request)}
                >
                  Agregar observación
                </Button>
              </div>
            )}
          </>
        )}

        {canReview && canAct && (
          <div className="workflow-decision-actions">
            <textarea
              placeholder="Comentario general (opcional)"
              value={reviewComment[request.idSolicitud] || ""}
              onChange={(event) =>
                setReviewComment((previous) => ({
                  ...previous,
                  [request.idSolicitud]: event.target.value,
                }))
              }
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                color="warning"
                onClick={() =>
                  canLegacyAdminReview
                    ? handleLegacyAdminAction(request, "return")
                    : handleWorkflowReviewerAction(request, "return")
                }
                disabled={Boolean(reviewAction[request.idSolicitud])}
              >
                Devolver
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() =>
                  canLegacyAdminReview
                    ? handleLegacyAdminAction(request, "approve")
                    : handleWorkflowReviewerAction(request, "approve")
                }
                disabled={Boolean(reviewAction[request.idSolicitud])}
              >
                Aprobar etapa
              </Button>
            </Stack>
          </div>
        )}

        {signatureStage && (
          <div className="workflow-signature">
            <Typography variant="body2" fontWeight={600}>
              Registrar firma
            </Typography>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) =>
                setSignatureFiles((previous) => ({
                  ...previous,
                  [request.idSolicitud]: event.target.files?.[0],
                }))
              }
            />
            <textarea
              placeholder="Observaciones de la firma (opcional)"
              value={signatureNotes[request.idSolicitud] || ""}
              onChange={(event) =>
                setSignatureNotes((previous) => ({
                  ...previous,
                  [request.idSolicitud]: event.target.value,
                }))
              }
            />
            <Button
              variant="contained"
              onClick={() => handleWorkflowSignature(request)}
            >
              Registrar firma
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                handleSignatureReminder(
                  request,
                  role === "director" ? "solicitante" : "director_escuela",
                )
              }
            >
              Recordar firma pendiente
            </Button>
          </div>
        )}

        {stage === "firmas" &&
          role === "director" &&
          hasRegisteredSignature && (
            <Box className="workflow-signature-confirmation">
              <Typography variant="body2" fontWeight={600}>
                Firma agregada correctamente.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Extensión enviará la solicitud a Decanato cuando estén
                registradas ambas firmas.
              </Typography>
            </Box>
          )}

        {isDecanatoCloser(request) && (
          <div className="workflow-decanato">
            <Typography variant="body2" fontWeight={600}>
              Cierre de Decanato
            </Typography>
            <label htmlFor={`decanato-result-${request.idSolicitud}`}>
              Resultado
            </label>
            <select
              id={`decanato-result-${request.idSolicitud}`}
              className="workflow-decanato__select"
              value={decanatoData[request.idSolicitud]?.resultado || "Aprobada"}
              onChange={(event) =>
                setDecanatoData((previous) => ({
                  ...previous,
                  [request.idSolicitud]: {
                    ...previous[request.idSolicitud],
                    resultado: event.target.value,
                  },
                }))
              }
            >
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
            <label htmlFor={`decanato-resolution-${request.idSolicitud}`}>
              Nombre o número de resolución *
            </label>
            <input
              id={`decanato-resolution-${request.idSolicitud}`}
              type="text"
              placeholder="Resolución"
              value={decanatoData[request.idSolicitud]?.resolucion || ""}
              onChange={(event) =>
                setDecanatoData((previous) => ({
                  ...previous,
                  [request.idSolicitud]: {
                    ...previous[request.idSolicitud],
                    resolucion: event.target.value,
                  },
                }))
              }
            />
            <label htmlFor={`decanato-pdf-${request.idSolicitud}`}>
              PDF de resolución (opcional)
            </label>
            <input
              id={`decanato-pdf-${request.idSolicitud}`}
              type="file"
              accept="application/pdf"
              onChange={(event) =>
                setDecanatoData((previous) => ({
                  ...previous,
                  [request.idSolicitud]: {
                    ...previous[request.idSolicitud],
                    pdf: event.target.files?.[0],
                  },
                }))
              }
            />
            <label htmlFor={`decanato-notes-${request.idSolicitud}`}>
              Observaciones
            </label>
            <textarea
              id={`decanato-notes-${request.idSolicitud}`}
              placeholder="Observaciones del cierre (opcional)"
              value={decanatoData[request.idSolicitud]?.observaciones || ""}
              onChange={(event) =>
                setDecanatoData((previous) => ({
                  ...previous,
                  [request.idSolicitud]: {
                    ...previous[request.idSolicitud],
                    observaciones: event.target.value,
                  },
                }))
              }
            />
            <Button
              variant="contained"
              color="success"
              onClick={() => handleDecanatoClosure(request)}
            >
              Cerrar solicitud
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderWorkflowHistory = (request, keyPrefix = "history") =>
    request.historial?.length > 0 && (
      <details className="workflow-history">
        <summary>Historial de movimientos ({request.historial.length})</summary>
        <div className="workflow-history__list">
          {request.historial.map((entry, index) => (
            <div
              className="workflow-history__item"
              key={
                entry.id_historial ||
                `${request.idSolicitud}-${keyPrefix}-${index}`
              }
            >
              <strong>{formatHistoryDate(entry.fecha)}</strong>
              <span>
                {formatHistoryAction(entry.accion)} · {entry.rol_actor || "Sistema"}
              </span>
              {entry.comentario && <small>{entry.comentario}</small>}
            </div>
          ))}
        </div>
      </details>
    );

  const renderReceivedStageContent = (request, stageIndex, current) => {
    if (stageIndex !== current) return null;

    if (stageIndex === 6) {
      const result = getDecanatoResult(request);
      const resolution = getDecanatoResolution(request);
      return (
        <Box className="workflow-final-result">
          <Typography variant="body1" fontWeight={700}>
            La solicitud ya finalizó.
          </Typography>
          {result && (
            <Typography variant="body2">Resultado: {result}</Typography>
          )}
          {resolution && (
            <Typography variant="body2">Resolución: {resolution}</Typography>
          )}
          {!result && !resolution && (
            <Typography variant="body2" color="text.secondary">
              El backend no devolvió todavía los datos del cierre de Decanato.
            </Typography>
          )}
          {renderWorkflowHistory(request, "final")}
        </Box>
      );
    }

    if (
      stageIndex === 4 &&
      request.firmas_completas &&
      ["revisor_1", "revisor_2"].includes(
        String(userData?.role || "").toLowerCase(),
      )
    ) {
      return (
        <Box className="workflow-stage-content">
          <Box className="workflow-send-decanato">
            <Typography variant="body2" color="text.secondary">
              La solicitud ya cuenta con las firmas del solicitante y del
              director.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setSendDecanatoRequest(request)}
            >
              Enviar a Decanato
            </Button>
          </Box>
          {renderWorkflowHistory(request, "signatures")}
        </Box>
      );
    }

    return (
      <Box className="workflow-stage-content">
        <Typography variant="subtitle2" color="primary">
          Formularios de la solicitud
        </Typography>
        <Stack className="requester-forms" spacing={1}>
          {[1, 2, 3, 4].map((formNumber) => {
            const formStatus =
              resolveFormStatus(request, formNumber) || "En progreso";
            const { formEnabled, reportEnabled, formColor } = getButtonState(
              request,
              formNumber,
              { isReceived: true },
            );
            return (
              <Box
                className="requester-form"
                key={`${request.idSolicitud}-received-form-${formNumber}`}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {formNames[formNumber - 1]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formStatus}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  className="requester-form__actions"
                >
                  <Button
                    size="small"
                    variant="contained"
                    style={{ backgroundColor: formColor }}
                    onClick={() =>
                      handleNavigateToForm(request, formNumber, true)
                    }
                    disabled={!formEnabled}
                  >
                    Abrir
                  </Button>
                  {reportEnabled && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        handleDownloadFormReport(request, formNumber)
                      }
                    >
                      Reporte
                    </Button>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>
        {String(userData?.role || "").toLowerCase() === "admin" ||
        getReviewerStage(userData?.role) === getRequestStage(request) ||
        isDecanatoCloser(request) ||
        String(userData?.role || "").toLowerCase() === "director"
          ? renderWorkflowPanel(request)
          : null}
        {renderWorkflowHistory(request, "stage")}
      </Box>
    );
  };

  const renderRequestList = ({
    requests,
    readOnlyMode = false,
    isReceived = false,
  }) => {
    if (!isReceived && !isAdmin) return renderRequesterList(requests);
    const stageIndexes = {
      solicitud: 0,
      revision_1: 1,
      revision_2: 2,
      presupuesto: 3,
      firmas: 4,
      decanato: 5,
      finalizado: 6,
    };
    const groupedByStage = requests.reduce((groups, request) => {
      const explicitStage = getRequestStage(request);
      const stageIndex = stageIndexes[explicitStage] ?? getFlowIndex(request);
      if (!groups[stageIndex]) groups[stageIndex] = [];
      groups[stageIndex].push(request);
      return groups;
    }, {});
    const groupedRequests = flowStages
      .map(([name], stageIndex) => ({
        name,
        stageIndex,
        requests: groupedByStage[stageIndex] || [],
      }))
      .filter((group) => group.requests.length > 0);

    return (
      <div className="approval-list">
        {groupedRequests.map((group) => (
          <Accordion
            key={`stage-group-${group.stageIndex}`}
            className="workflow-stage-group"
            disableGutters
            defaultExpanded={
              group.stageIndex ===
              Math.min(...groupedRequests.map(({ stageIndex }) => stageIndex))
            }
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: "100%", pr: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {flowStages[group.stageIndex][0]}
                </Typography>
                <Typography className="workflow-stage-count" variant="body2">
                  {group.requests.length}{" "}
                  {group.requests.length === 1 ? "solicitud" : "solicitudes"}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails className="workflow-stage-group__details">
              {group.requests.map((request) => (
                <Accordion
                  key={`${readOnlyMode ? "readonly" : "own"}-${request.idSolicitud}`}
                  className={`approval-card request-status-card--${getRequestVisualStatus(request).tone}`}
                  disableGutters
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ width: "100%", pr: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {request.nombre_actividad ||
                          `Solicitud ${request.idSolicitud}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.fecha_solicitud || "Sin fecha"} · ID{" "}
                        {request.idSolicitud}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails className="approval-card__details">
                    {(() => {
                      const titleText = isReceived
                        ? `${request.fecha_solicitud || "Sin fecha"} - ${request.nombre_solicitante || "Usuario sin nombre"} - ${request.nombre_actividad || `Solicitud ${request.idSolicitud} `} `
                        : request.nombre_actividad ||
                          `Solicitud ${request.idSolicitud}  `;

                      const current = getFlowIndex(request);
                      return (
                        <>
                          <div className="approval-card__header">
                            <div>
                              <Typography variant="h6">{titleText}</Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                ID {request.idSolicitud} ·{" "}
                                {request.fecha_solicitud || "Sin fecha"}
                              </Typography>
                            </div>
                            <div className="approval-card__badges">
                              <span
                                className={`request-status-badge request-status-badge--${getRequestVisualStatus(request).tone}`}
                              >
                                {getRequestVisualStatus(request).label}
                              </span>
                              <span className="flow-badge">
                                {flowStages[current][0]}
                              </span>
                            </div>
                          </div>
                          <div className="flow-track">
                            {flowStages.map(([name, description], index) => (
                              <Accordion
                                className={`flow-step ${index < current ? "done" : index === current ? "current" : ""}`}
                                key={name}
                                disableGutters
                                defaultExpanded={index === current}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                >
                                  <span className="flow-dot">
                                    {index < current ? "✓" : index + 1}
                                  </span>
                                  <strong>{name}</strong>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <small>{description}</small>
                                  <small className="workflow-stage-responsible">
                                    Responsable: {flowStages[index][2]}
                                  </small>
                                  {renderReceivedStageContent(
                                    request,
                                    index,
                                    current,
                                  )}
                                </AccordionDetails>
                              </Accordion>
                            ))}
                          </div>
                        </>
                      );
                    })()}

                    {!isReceived && (
                      <>
                        <Stack
                          className="requester-forms"
                          spacing={1}
                          sx={{ mt: 2 }}
                        >
                          {[1, 2, 3, 4].map((formNumber) => {
                            const formStatus =
                              resolveFormStatus(request, formNumber) ||
                              "En progreso";
                            const {
                              formEnabled,
                              reportEnabled,
                              formColor,
                              reportColor,
                            } = getButtonState(request, formNumber, {
                              isReceived,
                            });
                            const shouldReadOnly =
                              isReceived ||
                              (!isAdmin && isLockedForOwner(formStatus));

                            if (readOnlyMode) {
                              return (
                                <Box
                                  className="requester-form"
                                  key={`view-${request.idSolicitud}-${formNumber}`}
                                >
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                    >
                                      {formNames[formNumber - 1]}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {formStatus}
                                    </Typography>
                                  </Box>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() =>
                                      handleNavigateToForm(
                                        request,
                                        formNumber,
                                        true,
                                      )
                                    }
                                  >
                                    Abrir
                                  </Button>
                                </Box>
                              );
                            }

                            const canSelectForReview =
                              !readOnlyMode &&
                              !isReceived &&
                              !isAdmin &&
                              isFormSelectableForReview(request, formNumber);
                            const isSelected = Boolean(
                              selectedFormsByRequest[request.idSolicitud]?.[
                                formNumber
                              ],
                            );

                            return (
                              <Box
                                className="requester-form"
                                key={`container-${request.idSolicitud}-${formNumber}`}
                              >
                                {!readOnlyMode && !isReceived && !isAdmin && (
                                  <Checkbox
                                    size="small"
                                    checked={isSelected}
                                    onChange={() =>
                                      toggleFormSelection(
                                        request.idSolicitud,
                                        formNumber,
                                      )
                                    }
                                    disabled={
                                      !canSelectForReview ||
                                      bulkReviewLoadingByRequest[
                                        request.idSolicitud
                                      ]
                                    }
                                    sx={{ p: 0.5 }}
                                  />
                                )}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight={600}>
                                    {formNames[formNumber - 1]}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formStatus}
                                  </Typography>
                                </Box>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  className="requester-form__actions"
                                >
                                  <Button
                                    size="small"
                                    variant="contained"
                                    style={{
                                      backgroundColor: formColor,
                                      cursor: formEnabled
                                        ? "pointer"
                                        : "not-allowed",
                                    }}
                                    onClick={() =>
                                      handleNavigateToForm(
                                        request,
                                        formNumber,
                                        shouldReadOnly,
                                      )
                                    }
                                    disabled={!formEnabled}
                                  >
                                    Abrir
                                  </Button>

                                  {reportEnabled ? (
                                    <Tooltip title="Generar reporte">
                                      <span>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          style={{
                                            cursor: loadingReports[
                                              `${request.idSolicitud}-${formNumber}`
                                            ]
                                              ? "wait"
                                              : "pointer",
                                          }}
                                          onClick={() =>
                                            handleDownloadFormReport(
                                              request,
                                              formNumber,
                                            )
                                          }
                                          disabled={
                                            loadingReports[
                                              `${request.idSolicitud}-${formNumber}`
                                            ]
                                          }
                                        >
                                          {loadingReports[
                                            `${request.idSolicitud}-${formNumber}`
                                          ] ? (
                                            <CircularProgress
                                              size={20}
                                              color="inherit"
                                            />
                                          ) : (
                                            <Print
                                              style={{ fontSize: "16px" }}
                                            />
                                          )}
                                        </Button>
                                      </span>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="Formulario no completado">
                                      <span>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          style={{
                                            backgroundColor: reportColor,
                                            cursor: "not-allowed",
                                          }}
                                          disabled
                                        >
                                          <Print style={{ fontSize: "16px" }} />
                                        </Button>
                                      </span>
                                    </Tooltip>
                                  )}
                                </Stack>
                                {request.historial?.length > 0 && (
                                  <details className="workflow-history">
                                    <summary>
                                      Historial de movimientos (
                                      {request.historial.length})
                                    </summary>
                                    <div className="workflow-history__list">
                                      {request.historial.map((entry, index) => (
                                        <div
                                          className="workflow-history__item"
                                          key={
                                            entry.id_historial ||
                                            `${request.idSolicitud}-received-history-${index}`
                                          }
                                        >
                                          <strong>
                                            {formatHistoryDate(entry.fecha)}
                                          </strong>
                                          <span>
                                            {formatHistoryAction(entry.accion)} ·{" "}
                                            {entry.rol_actor || "Sistema"}
                                          </span>
                                          {entry.comentario && (
                                            <small>{entry.comentario}</small>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </details>
                                )}
                              </Box>
                            );
                          })}
                        </Stack>

                        {!readOnlyMode && !isReceived && !isAdmin && (
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() =>
                              handleSendSelectedFormsToReview(request)
                            }
                            disabled={Boolean(
                              bulkReviewLoadingByRequest[request.idSolicitud],
                            )}
                            style={{ minWidth: "190px", justifySelf: "start" }}
                          >
                            {bulkReviewLoadingByRequest[request.idSolicitud]
                              ? "Enviando..."
                              : "Enviar seleccionados a revision"}
                          </Button>
                        )}
                        {isReceived &&
                          (String(userData?.role || "").toLowerCase() ===
                            "admin" ||
                          getReviewerStage(userData?.role) ===
                            getRequestStage(request) ||
                          isDecanatoCloser(request) ||
                          String(userData?.role || "").toLowerCase() ===
                            "director"
                            ? renderWorkflowPanel(request)
                            : null)}
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: "20px", marginTop: "130px" }}>
        <WorkflowRoleView
          role={userData.role}
          userName={userData.name}
          ownRequests={ownRequests}
          receivedRequests={receivedRequests}
          onCreateRequest={handleCreateNewRequest}
          renderOwnRequests={(requests) =>
            renderRequestList({ requests, readOnlyMode: false })
          }
          renderReceivedRequests={(requests) =>
            renderRequestList({
              requests,
              readOnlyMode: false,
              isReceived: true,
            })
          }
        />
        <Dialog
          open={Boolean(sendDecanatoRequest)}
          onClose={() => setSendDecanatoRequest(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Enviar solicitud a Decanato</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Los usuarios con rol Decanato siempre recibirán el correo. Puedes
              agregar destinatarios y personalizar el mensaje.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Destinatarios adicionales"
                placeholder="persona@ejemplo.edu.co, coordinador@ejemplo.edu.co"
                helperText="Sepáralos por coma, punto y coma o salto de línea."
                value={
                  decanatoEmailData[sendDecanatoRequest?.idSolicitud]
                    ?.destinatarios || ""
                }
                onChange={(event) =>
                  setDecanatoEmailData((previous) => ({
                    ...previous,
                    [sendDecanatoRequest.idSolicitud]: {
                      ...previous[sendDecanatoRequest.idSolicitud],
                      destinatarios: event.target.value,
                    },
                  }))
                }
                fullWidth
              />
              <TextField
                label="Asunto"
                placeholder={`Solicitud enviada a Decanato - ${sendDecanatoRequest?.idSolicitud || ""}`}
                value={
                  decanatoEmailData[sendDecanatoRequest?.idSolicitud]?.asunto ||
                  ""
                }
                onChange={(event) =>
                  setDecanatoEmailData((previous) => ({
                    ...previous,
                    [sendDecanatoRequest.idSolicitud]: {
                      ...previous[sendDecanatoRequest.idSolicitud],
                      asunto: event.target.value,
                    },
                  }))
                }
                fullWidth
              />
              <TextField
                label="Cuerpo del correo"
                placeholder="Ejemplo: La solicitud ya cuenta con ambas firmas y está pendiente de revisión."
                helperText="Puedes usar: ID de solicitud, nombre del solicitante, etapa y fecha."
                value={
                  decanatoEmailData[sendDecanatoRequest?.idSolicitud]?.cuerpo ||
                  ""
                }
                onChange={(event) =>
                  setDecanatoEmailData((previous) => ({
                    ...previous,
                    [sendDecanatoRequest.idSolicitud]: {
                      ...previous[sendDecanatoRequest.idSolicitud],
                      cuerpo: event.target.value,
                    },
                  }))
                }
                multiline
                minRows={5}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSendDecanatoRequest(null)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSendToDecanato}
            >
              Enviar a Decanato
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}

Dashboard.propTypes = {
  userData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
};

export default Dashboard;
