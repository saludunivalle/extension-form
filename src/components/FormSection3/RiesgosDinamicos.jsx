import { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Box, Grid, Checkbox, TextField, Button, 
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Card, CardContent, Divider, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MigrationIcon from '@mui/icons-material/ImportExport';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from "prop-types";
import axios from 'axios';

// Componente para un riesgo individual
function RiesgoItem({ riesgo, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [mitigacion, setMitigacion] = useState(riesgo.mitigacion || '');
  const [aplica, setAplica] = useState(riesgo.aplica === 'Sí');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate({
        id_riesgo: riesgo.id_riesgo,
        aplica: aplica ? 'Sí' : 'No',
        mitigacion: mitigacion
      });
      setEditing(false);
    } catch (error) {
      console.error("Error al actualizar riesgo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              {riesgo.nombre_riesgo}
            </Typography>
            <Chip 
              label={riesgo.categoria} 
              size="small" 
              sx={{ mt: 1, backgroundColor: '#e3f2fd' }} 
            />
          </Grid>
          <Grid item xs={6} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              checked={aplica}
              onChange={(e) => setAplica(e.target.checked)}
              disabled={!editing && !loading}
            />
            <Typography variant="body2" color="textSecondary">
              {aplica ? 'Sí aplica' : 'No aplica'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            {editing ? (
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Mitigación"
                value={mitigacion}
                onChange={(e) => setMitigacion(e.target.value)}
                variant="outlined"
                size="small"
              />
            ) : (
              <Typography variant="body2">
                {mitigacion || "Sin mitigación definida"}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {editing ? (
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : "Guardar"}
              </Button>
            ) : (
              <Box>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => setEditing(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => onDelete(riesgo.id_riesgo)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// Modal para agregar nuevo riesgo
function NuevoRiesgoModal({ open, categorias, onSave, onClose }) {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [aplica, setAplica] = useState(false);
  const [mitigacion, setMitigacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    // Validación
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre del riesgo es obligatorio";
    if (!categoria) newErrors.categoria = "Debe seleccionar una categoría";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await onSave({
        nombre_riesgo: nombre,
        categoria: categoria,
        aplica: aplica ? 'Sí' : 'No',
        mitigacion: mitigacion
      });
      
      // Resetear el formulario
      setNombre('');
      setCategoria('');
      setAplica(false);
      setMitigacion('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error al guardar nuevo riesgo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Nuevo Riesgo</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Nombre del riesgo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            margin="normal"
            error={!!errors.nombre}
            helperText={errors.nombre}
            required
          />
          
          <FormControl fullWidth margin="normal" error={!!errors.categoria} required>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              label="Categoría"
            >
              {categorias.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </MenuItem>
              ))}
            </Select>
            {errors.categoria && (
              <Typography variant="caption" color="error">
                {errors.categoria}
              </Typography>
            )}
          </FormControl>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Checkbox
              checked={aplica}
              onChange={(e) => setAplica(e.target.checked)}
            />
            <Typography>¿Aplica este riesgo?</Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Mitigación propuesta"
            value={mitigacion}
            onChange={(e) => setMitigacion(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RiesgosDinamicos({ idSolicitud, userData }) {
  const [riesgos, setRiesgos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewRiskModal, setShowNewRiskModal] = useState(false);
  const [migrando, setMigrando] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Cargar riesgos y categorías al iniciar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar categorías
        const categoriasResponse = await axios.get('https://siac-extension-server.vercel.app/categorias-riesgo');
        if (categoriasResponse.data.success) {
          setCategorias(categoriasResponse.data.data);
        }
        
        // Cargar riesgos
        const riesgosResponse = await axios.get(`https://siac-extension-server.vercel.app/riesgos?id_solicitud=${idSolicitud}`);
        if (riesgosResponse.data.success) {
          setRiesgos(riesgosResponse.data.data);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Hubo un problema al cargar los riesgos. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    
    if (idSolicitud) {
      loadData();
    }
  }, [idSolicitud]);

  // Agrupar riesgos por categoría
  const riesgosPorCategoria = useMemo(() => {
    return riesgos.reduce((acc, riesgo) => {
      const cat = riesgo.categoria || 'otros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(riesgo);
      return acc;
    }, {});
  }, [riesgos]);

  // Handlers para operaciones CRUD
  const handleSaveRiesgo = async (riesgoData) => {
    try {
      const response = await axios.post('https://siac-extension-server.vercel.app/riesgos', {
        ...riesgoData,
        id_solicitud: idSolicitud
      });
      
      if (response.data.success) {
        setRiesgos(prev => [...prev, response.data.data]);
        setNotification({
          open: true,
          message: 'Riesgo agregado correctamente',
          severity: 'success'
        });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al crear el riesgo');
      }
    } catch (error) {
      console.error("Error al guardar riesgo:", error);
      setNotification({
        open: true,
        message: error.message || 'Error al crear el riesgo',
        severity: 'error'
      });
      throw error;
    }
  };

  const handleUpdateRiesgo = async (riesgoData) => {
    try {
      const response = await axios.put('https://siac-extension-server.vercel.app/riesgos', riesgoData);
      
      if (response.data.success) {
        setRiesgos(prev => 
          prev.map(r => r.id_riesgo === riesgoData.id_riesgo ? response.data.data : r)
        );
        setNotification({
          open: true,
          message: 'Riesgo actualizado correctamente',
          severity: 'success'
        });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al actualizar el riesgo');
      }
    } catch (error) {
      console.error("Error al actualizar riesgo:", error);
      setNotification({
        open: true,
        message: error.message || 'Error al actualizar el riesgo',
        severity: 'error'
      });
      throw error;
    }
  };

  const handleDeleteRiesgo = async (id_riesgo) => {
    if (!window.confirm("¿Está seguro de eliminar este riesgo?")) return;
    
    try {
      const response = await axios.delete(`https://siac-extension-server.vercel.app/riesgos/${id_riesgo}`);
      
      if (response.data.success) {
        setRiesgos(prev => prev.filter(r => r.id_riesgo !== id_riesgo));
        setNotification({
          open: true,
          message: 'Riesgo eliminado correctamente',
          severity: 'success'
        });
      } else {
        throw new Error(response.data.error || 'Error al eliminar el riesgo');
      }
    } catch (error) {
      console.error("Error al eliminar riesgo:", error);
      setNotification({
        open: true,
        message: error.message || 'Error al eliminar el riesgo',
        severity: 'error'
      });
    }
  };

  const migrarRiesgosForm3 = async () => {
    if (!window.confirm("¿Desea migrar los riesgos del formulario 3 al nuevo sistema? Esta acción no se puede deshacer.")) return;
    
    try {
      setMigrando(true);
      
      const response = await axios.post('https://siac-extension-server.vercel.app/migrar-riesgos-form3', {
        id_solicitud: idSolicitud,
        id_usuario: userData.id_usuario,
        name: userData.name
      });
      
      if (response.data.success) {
        // Actualizar la lista con los nuevos riesgos migrados
        setRiesgos(prev => [...prev, ...response.data.data]);
        setNotification({
          open: true,
          message: `Se migraron ${response.data.data.length} riesgos correctamente`,
          severity: 'success'
        });
      } else {
        throw new Error(response.data.error || 'Error en la migración');
      }
    } catch (error) {
      console.error("Error en la migración:", error);
      setNotification({
        open: true,
        message: error.message || 'Error en la migración de riesgos',
        severity: 'error'
      });
    } finally {
      setMigrando(false);
    }
  };

  // Renderizado condicional para estados de carga y error
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Barra de acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, mt: 2 }}>
        <Typography variant="h6">Sistema de Gestión de Riesgos</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<MigrationIcon />}
            onClick={migrarRiesgosForm3}
            disabled={migrando}
            sx={{ mr: 1 }}
          >
            {migrando ? 'Migrando...' : 'Migrar riesgos'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewRiskModal(true)}
          >
            Agregar riesgo
          </Button>
        </Box>
      </Box>

      {/* Secciones de categorías y riesgos */}
      {categorias.length > 0 ? (
        categorias.map(categoria => {
          const riesgosCategoria = riesgosPorCategoria[categoria.id] || [];
          if (riesgosCategoria.length === 0 && categoria.id !== 'otros') return null;
          
          return (
            <Box key={categoria.id} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3">
                  {categoria.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  {riesgosCategoria.length} {riesgosCategoria.length === 1 ? 'riesgo' : 'riesgos'}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {riesgosCategoria.length > 0 ? (
                riesgosCategoria.map(riesgo => (
                  <RiesgoItem 
                    key={riesgo.id_riesgo} 
                    riesgo={riesgo} 
                    onUpdate={handleUpdateRiesgo}
                    onDelete={handleDeleteRiesgo}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No hay riesgos en esta categoría. 
                  <Button 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setShowNewRiskModal(true);
                    }}
                    sx={{ ml: 1 }}
                  >
                    Añadir riesgo
                  </Button>
                </Typography>
              )}
            </Box>
          );
        })
      ) : (
        <Alert severity="info" sx={{ my: 2 }}>
          No hay categorías de riesgos disponibles.
        </Alert>
      )}

      {/* Modal para nuevo riesgo */}
      <NuevoRiesgoModal
        open={showNewRiskModal}
        categorias={categorias}
        onSave={handleSaveRiesgo}
        onClose={() => setShowNewRiskModal(false)}
      />

      {/* Notificación */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

RiesgosDinamicos.propTypes = {
  idSolicitud: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
};

export default RiesgosDinamicos;