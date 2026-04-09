import { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Checkbox, TextField, Button, 
  CircularProgress, Snackbar, Alert, Card, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from "prop-types";
import axios from 'axios'; // Importar axios para las peticiones HTTP
import { config } from '../../config'; // Importar la configuración para obtener la URL del backend
const API_URL = config.API_URL;

const normalizeCategory = (value = '') => {
  if (typeof value !== 'string') return '';

  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (normalized === 'diseno' || normalized === 'diseño') return 'diseno';
  if (normalized === 'locacion' || normalized === 'locaciones') return 'locacion';
  if (normalized === 'otros' || normalized === 'otro') return 'otros';
  if (normalized === 'desarrollo') return 'desarrollo';
  if (normalized === 'cierre') return 'cierre';

  return normalized;
};

function OtrosRiesgos({ idSolicitud, userData, categoria }) {
  const [riesgos, setRiesgos] = useState([]);
  const [loading, setLoading] = useState(true); // Cambiar a true para indicar carga inicial
  const [agregarNuevo, setAgregarNuevo] = useState(false);
  const [nuevoRiesgo, setNuevoRiesgo] = useState({ nombre: '', aplica: false, mitigacion: '' });
  const [editando, setEditando] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Cargar riesgos existentes de esta categoría al iniciar el componente
  useEffect(() => {
    const cargarRiesgos = async () => {
      try {
        setLoading(true);
        // Obtener todos los riesgos de esta solicitud
        const response = await axios.get(`${API_URL}/riesgos?id_solicitud=${idSolicitud}`);
        
        if (response.data.success) {
          // Filtrar solo los riesgos de la categoría específica
          const categoriaObjetivo = normalizeCategory(categoria);
          const riesgosFiltrados = response.data.data.filter(
            (r) => normalizeCategory(r.categoria) === categoriaObjetivo
          );
          setRiesgos(riesgosFiltrados);
        }
      } catch (error) {
        console.error('Error al cargar riesgos:', error);
        setNotification({
          open: true,
          message: 'Error al cargar riesgos',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (idSolicitud) {
      cargarRiesgos();
    }
  }, [idSolicitud, categoria]);

  // Función para agregar un nuevo riesgo (persistente)
  const agregarRiesgo = async () => {
    if (!nuevoRiesgo.nombre.trim()) return;
    
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/riesgos`, {
        nombre_riesgo: nuevoRiesgo.nombre,
        aplica: nuevoRiesgo.aplica ? 'Sí aplica' : 'No aplica',
        mitigacion: nuevoRiesgo.mitigacion || '',
        id_solicitud: idSolicitud,
        id_usuario: userData?.id_usuario,
        name: userData?.name,
        categoria: categoria
      });
      
      if (response.data.success) {
        // Agregar el nuevo riesgo a la lista
        setRiesgos([...riesgos, response.data.data]);
        setNuevoRiesgo({ nombre: '', aplica: false, mitigacion: '' });
        setAgregarNuevo(false);
        
        setNotification({
          open: true,
          message: "Riesgo guardado correctamente",
          severity: "success"
        });
      } else {
        throw new Error(response.data.error || 'Error al crear el riesgo');
      }
    } catch (error) {
      console.error('Error al guardar riesgo:', error);
      setNotification({
        open: true,
        message: error.message || 'Error al guardar el riesgo',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar un riesgo (persistente)
  const actualizarRiesgo = async (id, datos) => {
    try {
      setLoading(true);
      
      const riesgoExistente = riesgos.find(r => r.id_riesgo === id);
      if (!riesgoExistente) {
        throw new Error('Riesgo no encontrado');
      }
      
      const riesgoActualizado = {
        ...riesgoExistente,
        ...datos
      };
      
      const response = await axios.put(`${API_URL}/riesgos`, {
        id_riesgo: id,
        nombre_riesgo: riesgoActualizado.nombre_riesgo,
        aplica: riesgoActualizado.aplica,
        mitigacion: riesgoActualizado.mitigacion,
        id_usuario: userData?.id_usuario,
        name: userData?.name,
        categoria: categoria
      });
      
      if (response.data.success) {
        // Actualizar el riesgo en la lista local
        setRiesgos(riesgos.map(r => r.id_riesgo === id ? response.data.data : r));
        setEditando(null);
        
        setNotification({
          open: true,
          message: "Riesgo actualizado correctamente",
          severity: "success"
        });
      } else {
        throw new Error(response.data.error || 'Error al actualizar el riesgo');
      }
    } catch (error) {
      console.error('Error al actualizar riesgo:', error);
      setNotification({
        open: true,
        message: error.message || 'Error al actualizar el riesgo',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un riesgo (persistente)
  const eliminarRiesgo = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este riesgo?")) return;
    
    try {
      setLoading(true);
      
      const response = await axios.delete(`${API_URL}/riesgos/${id}`);
      
      if (response.data.success) {
        // Eliminar el riesgo de la lista local
        setRiesgos(riesgos.filter(r => r.id_riesgo !== id));
        
        setNotification({
          open: true,
          message: "Riesgo eliminado correctamente",
          severity: "success"
        });
      } else {
        throw new Error(response.data.error || 'Error al eliminar el riesgo');
      }
    } catch (error) {
      console.error('Error al eliminar riesgo:', error);
      setNotification({
        open: true,
        message: error.message || 'Error al eliminar el riesgo',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3, border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, bgcolor: '#f9f9f9' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">OTROS RIESGOS - {categoria.toUpperCase()}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />} 
          onClick={() => setAgregarNuevo(true)}
          disabled={agregarNuevo || loading}
          size="small"
        >
          Agregar riesgo
        </Button>
      </Box>

      {/* Indicador de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress size={30} />
        </Box>
      )}

      {/* Lista de riesgos existentes */}
      {!loading && riesgos.length === 0 && !agregarNuevo ? (
        <Typography variant="body2" color="textSecondary" sx={{ my: 2 }}>
          No hay riesgos adicionales en esta categoría.
        </Typography>
      ) : (
        <Box>
          {riesgos.map((riesgo) => (
            <Card key={riesgo.id_riesgo} sx={{ 
              mb: 2, 
              border: '1px solid #e0e0e0', 
              boxShadow: 'none',
              backgroundColor: '#ffffff'
            }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    {editando === riesgo.id_riesgo ? (
                      <TextField
                        fullWidth
                        label="Nombre del riesgo"
                        value={riesgo.nombre_riesgo_temp || riesgo.nombre_riesgo}
                        onChange={(e) => {
                          const updatedRiesgos = riesgos.map(r => {
                            if (r.id_riesgo === riesgo.id_riesgo) {
                              return { ...r, nombre_riesgo_temp: e.target.value };
                            }
                            return r;
                          });
                          setRiesgos(updatedRiesgos);
                        }}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">{riesgo.nombre_riesgo}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={6} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={editando === riesgo.id_riesgo ? riesgo.aplica_temp === 'Sí aplica' : riesgo.aplica === 'Sí aplica'}
                      onChange={(e) => {
                        if (editando === riesgo.id_riesgo) {
                          const updatedRiesgos = riesgos.map(r => {
                            if (r.id_riesgo === riesgo.id_riesgo) {
                              return { ...r, aplica_temp: e.target.checked ? 'Sí aplica' : 'No aplica' };
                            }
                            return r;
                          });
                          setRiesgos(updatedRiesgos);
                        } else {
                          actualizarRiesgo(riesgo.id_riesgo, {
                            aplica: e.target.checked  ? 'Sí aplica' : 'No aplica'
                          });
                        }
                      }}
                      disabled={loading}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {editando === riesgo.id_riesgo 
                        ? (riesgo.aplica_temp === 'Sí aplica' || riesgo.aplica_temp === 'Sí' ? 'Sí aplica' : 'No aplica')
                        : (riesgo.aplica === 'Sí aplica' || riesgo.aplica === 'Sí' ? 'Sí aplica' : 'No aplica')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {editando === riesgo.id_riesgo ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Mitigación"
                        value={riesgo.mitigacion_temp || riesgo.mitigacion || ''}
                        onChange={(e) => {
                          const updatedRiesgos = riesgos.map(r => {
                            if (r.id_riesgo === riesgo.id_riesgo) {
                              return { ...r, mitigacion_temp: e.target.value };
                            }
                            return r;
                          });
                          setRiesgos(updatedRiesgos);
                        }}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2">
                        {riesgo.mitigacion || "Sin mitigación definida"}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {editando === riesgo.id_riesgo ? (
                      <Box>
                        <Button 
                          size="small" 
                          onClick={() => {
                            actualizarRiesgo(riesgo.id_riesgo, {
                              nombre_riesgo: riesgo.nombre_riesgo_temp || riesgo.nombre_riesgo,
                              aplica: riesgo.aplica_temp || riesgo.aplica,
                              mitigacion: riesgo.mitigacion_temp || riesgo.mitigacion
                            });
                          }}
                          variant="contained"
                        >
                          Guardar
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => setEditando(null)}
                          sx={{ ml: 1 }}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => setEditando(riesgo.id_riesgo)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => eliminarRiesgo(riesgo.id_riesgo)}
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
          ))}
        </Box>
      )}

      {/* Formulario para agregar nuevo riesgo */}
      {agregarNuevo && (
        <Card sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none', bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Nombre del riesgo"
                  value={nuevoRiesgo.nombre}
                  onChange={(e) => setNuevoRiesgo({...nuevoRiesgo, nombre: e.target.value})}
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={6} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox
                  checked={nuevoRiesgo.aplica}
                  onChange={(e) => setNuevoRiesgo({...nuevoRiesgo, aplica: e.target.checked})}
                />
                <Typography variant="body2" color="textSecondary">
                  {nuevoRiesgo.aplica ? 'Sí aplica' : 'No aplica'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Mitigación propuesta"
                  value={nuevoRiesgo.mitigacion}
                  onChange={(e) => setNuevoRiesgo({...nuevoRiesgo, mitigacion: e.target.value})}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setAgregarNuevo(false);
                    setNuevoRiesgo({ nombre: '', aplica: false, mitigacion: '' });
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="contained" 
                  onClick={agregarRiesgo}
                  disabled={!nuevoRiesgo.nombre.trim()}
                >
                  Guardar
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

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

OtrosRiesgos.propTypes = {
  idSolicitud: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userData: PropTypes.shape({
    id_usuario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }).isRequired,
  categoria: PropTypes.string.isRequired,
};

export default OtrosRiesgos;