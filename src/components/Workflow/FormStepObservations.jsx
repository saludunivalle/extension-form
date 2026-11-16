import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import {
  addWorkflowObservation,
  deleteWorkflowObservation,
  getWorkflowObservations,
  addWorkflowObservationComment,
  updateWorkflowObservation,
} from "../../services/workflowService";

const normalize = (value) => String(value ?? "").trim().toLowerCase();

function FormStepObservations({
  idSolicitud,
  formNumber,
  stepNumber,
  stage,
  canAddObservation,
}) {
  const [observations, setObservations] = useState([]);
  const [draft, setDraft] = useState("");
  const [currentStage, setCurrentStage] = useState(stage || "");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentLoading, setCommentLoading] = useState({});

  useEffect(() => {
    if (stage) setCurrentStage(stage);
  }, [stage]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const stepObservations = useMemo(
    () =>
      observations.filter(
        (observation) =>
          normalize(observation.formulario) === normalize(formNumber) &&
          normalize(observation.paso) === normalize(stepNumber) &&
          (canAddObservation || normalize(observation.estado) !== "subsanada"),
      ),
    [canAddObservation, formNumber, observations, stepNumber],
  );

  useEffect(() => {
    let active = true;
    const loadObservations = async () => {
      if (!idSolicitud) return;
      setLoading(true);
      setError("");
      try {
        const loaded = await getWorkflowObservations(idSolicitud);
        if (active) {
          setObservations(Array.isArray(loaded) ? loaded : []);
          if (loaded?.etapa_actual) setCurrentStage(loaded.etapa_actual);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError?.response?.status === 404
              ? ""
              : "No se pudieron cargar las observaciones de este paso.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadObservations();
    return () => {
      active = false;
    };
  }, [idSolicitud]);

  const handleDeleteStepObservation = async (observationId) => {
    if (!window.confirm("¿Deseas desechar/eliminar esta observación?")) return;
    try {
      await deleteWorkflowObservation(idSolicitud, observationId);
      const loaded = await getWorkflowObservations(idSolicitud);
      setObservations(Array.isArray(loaded) ? loaded : []);
    } catch (err) {
      alert(err?.response?.data?.error || err?.response?.data?.message || "No se pudo eliminar la observación.");
    }
  };

  const handleAddComment = async (observationId) => {
    const text = String(commentDrafts[observationId] || "").trim();
    if (!text) return;
    setCommentLoading((prev) => ({ ...prev, [observationId]: true }));
    try {
      await addWorkflowObservationComment(idSolicitud, observationId, {
        texto: text,
      });
      setCommentDrafts((prev) => ({ ...prev, [observationId]: "" }));
      const loaded = await getWorkflowObservations(idSolicitud);
      setObservations(Array.isArray(loaded) ? loaded : []);
    } catch (err) {
      alert(err?.response?.data?.error || err?.response?.data?.message || "No se pudo guardar el comentario.");
    } finally {
      setCommentLoading((prev) => ({ ...prev, [observationId]: false }));
    }
  };

  const handleToggleSubsanada = async (observation) => {
    const nextStatus = observation.estado === "subsanada" ? "pendiente" : "subsanada";
    try {
      await updateWorkflowObservation(idSolicitud, observation.id_observacion, {
        estado: nextStatus,
      });
      const loaded = await getWorkflowObservations(idSolicitud);
      setObservations(Array.isArray(loaded) ? loaded : []);
    } catch (err) {
      alert(err?.response?.data?.error || err?.response?.data?.message || "No se pudo actualizar el estado.");
    }
  };

  const handleSave = async () => {
    const text = draft.trim();
    if (!text) return;

    setSaving(true);
    setError("");
    try {
      await addWorkflowObservation(idSolicitud, {
        etapa: stage || currentStage || undefined,
        formulario: String(formNumber),
        paso: String(stepNumber),
        observacion: text,
      });
      setDraft("");
      const loaded = await getWorkflowObservations(idSolicitud);
      setObservations(Array.isArray(loaded) ? loaded : []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          "No se pudo guardar la observación.",
      );
    } finally {
      setSaving(false);
    }
  };

  const isReturnedOrDraft = currentStage === "solicitud" || !currentStage;
  const isSolicitante = !canAddObservation;
  const shouldHideFromSolicitante = isSolicitante && !isReturnedOrDraft;

  if (shouldHideFromSolicitante || (!canAddObservation && !stepObservations.length)) {
    return null;
  }

  return (
    <Box
      sx={{
        width: "100%",
        mt: 2,
        p: 2,
        border: "1px solid #dbe3ec",
        borderRadius: 2,
        backgroundColor: "#f8fafc",
      }}
    >
      <Typography variant="subtitle2" color="primary" gutterBottom>
        Observaciones del formulario {formNumber}, paso {stepNumber}
      </Typography>
      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Cargando...
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={1}>
          {stepObservations.map((observation) => (
            <Box
              key={observation.id_observacion}
              sx={{ p: 1.5, backgroundColor: "#fff", borderRadius: 1.5, border: "1px solid #e2e8f0" }}
            >
              <Typography variant="body2" fontWeight={500}>
                {observation.observacion}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {observation.nombre_autor || "Usuario"} ·{" "}
                  <span style={{ fontWeight: 600, color: observation.estado === 'subsanada' ? '#16a34a' : '#d97706' }}>
                    {observation.estado || "pendiente"}
                  </span>
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  {canAddObservation && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        color={observation.estado === "subsanada" ? "warning" : "success"}
                        sx={{ fontSize: "0.7rem", py: "1px", px: "6px", minWidth: "auto" }}
                        onClick={() => handleToggleSubsanada(observation)}
                      >
                        {observation.estado === "subsanada" ? "Marcar pendiente" : "Marcar subsanada"}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        sx={{ fontSize: "0.7rem", py: "1px", px: "6px", minWidth: "auto" }}
                        onClick={() => handleDeleteStepObservation(observation.id_observacion)}
                      >
                        Desechar
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>

              {/* Hilo de comentarios identados sobre la observación */}
              <Box
                sx={{
                  pl: 2,
                  ml: 1,
                  borderLeft: "2px solid #cbd5e1",
                  mt: 1.5,
                  pt: 0.5,
                }}
              >
                {Array.isArray(observation.comentarios) && observation.comentarios.length > 0 && (
                  <Stack spacing={0.75} sx={{ mb: 1 }}>
                    {observation.comentarios.map((com) => (
                      <Box
                        key={com.id_comentario}
                        sx={{
                          p: 0.75,
                          backgroundColor: "#f8fafc",
                          borderRadius: 1,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" fontWeight={600} color="primary">
                            {com.nombre_autor || "Revisor"}
                            {com.rol_autor ? ` (${com.rol_autor === "revisor_2" ? "Revisor 2" : com.rol_autor === "revisor_1" ? "Revisor 1" : com.rol_autor})` : ""}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {com.fecha_creacion ? new Date(com.fecha_creacion).toLocaleDateString() : ""}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontSize: "0.85rem", mt: 0.25, whiteSpace: "pre-wrap" }}>
                          {com.texto}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}

                {canAddObservation && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <TextField
                      placeholder="Comentar esta observación..."
                      size="small"
                      fullWidth
                      value={commentDrafts[observation.id_observacion] || ""}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [observation.id_observacion]: e.target.value,
                        }))
                      }
                      sx={{ backgroundColor: "#fff", "& input": { fontSize: "0.85rem", py: 0.75 } }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!String(commentDrafts[observation.id_observacion] || "").trim() || commentLoading[observation.id_observacion]}
                      onClick={() => handleAddComment(observation.id_observacion)}
                      sx={{ fontSize: "0.75rem", minWidth: 70, height: 32 }}
                    >
                      {commentLoading[observation.id_observacion] ? <CircularProgress size={14} /> : "Comentar"}
                    </Button>
                  </Stack>
                )}
              </Box>
            </Box>
          ))}
          {!stepObservations.length && (
            <Typography variant="body2" color="text.secondary">
              No hay observaciones para este paso.
            </Typography>
          )}
        </Stack>
      )}
      {canAddObservation && (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          <TextField
            label="Agregar observación"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            multiline
            minRows={2}
            fullWidth
            size="small"
          />
          <Button
            variant="outlined"
            onClick={handleSave}
            disabled={saving || !draft.trim()}
            sx={{ alignSelf: "flex-start" }}
          >
            {saving ? (
              <>
                <CircularProgress size={16} sx={{ mr: 0.5 }} />
                Cargando...
              </>
            ) : (
              "Guardar observación"
            )}
          </Button>
        </Stack>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

FormStepObservations.propTypes = {
  idSolicitud: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  formNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  stepNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  stage: PropTypes.string,
  canAddObservation: PropTypes.bool,
};

FormStepObservations.defaultProps = {
  canAddObservation: false,
  stage: "",
};

export default FormStepObservations;
