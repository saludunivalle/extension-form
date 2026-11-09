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
          normalize(observation.paso) === normalize(stepNumber),
      ),
    [formNumber, observations, stepNumber],
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
              sx={{ p: 1, backgroundColor: "#fff", borderRadius: 1 }}
            >
              <Typography variant="body2">
                {observation.observacion}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {observation.nombre_autor || "Usuario"} ·{" "}
                  {observation.estado || "pendiente"}
                </Typography>
                {canAddObservation && (
                  <Button
                    size="small"
                    color="error"
                    sx={{ fontSize: "0.7rem", p: "2px 6px", minWidth: "auto" }}
                    onClick={() => handleDeleteStepObservation(observation.id_observacion)}
                  >
                    Desechar
                  </Button>
                )}
              </Stack>
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
