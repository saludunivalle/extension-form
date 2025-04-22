// src/components/FormSection3/OtrosRiesgos.jsx
import { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Checkbox, TextField, Button, 
  CircularProgress, Card, CardContent, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from "prop-types";
import axios from 'axios';

function OtrosRiesgos({ idSolicitud, userData, categoria }) {
  const [riesgos, setRiesgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agregarNuevo, setAgregarNuevo] = useState(false);
  const [nuevoRiesgo, setNuevoRiesgo] = useState({ nombre: '', aplica: false, mitigacion: '' });
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cargar los riesgos específicos para esta categoría
  useEffect(() => {
    const cargarRiesgos = async () => {
      if (!idSolicitud) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`https://siac-extension-server.vercel.app/riesgos?id_solicitud=${idSolicitud}&categoria=${categoria}`);
        if (response.data && response.data.success) {
          setRiesgos(response.data.data || []);
        }
      } catch (error) {
        console.error("Error cargando riesgos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarRiesgos();
  }, [idSolicitud, categoria]);

  const handleGuardarNuevo = async () => {
    if (!nuevoRiesgo.nombre.trim()) return;
    
    setGuardando(true);
    try {
      const response = await axios.post('https://siac-extension-server.vercel.app/riesgos', {
        nombre_riesgo: nuevoRiesgo.nombre,
        aplica: nuevoRiesgo.aplica ? 'Sí' : 'No',
        mitigacion: nuevoRiesgo.mitigacion,
        id_solicitud: idSolicitud,
        categoria: categoria
      });
      
      if (response.data && response.data.success) {
        setRiesgos([...riesgos, response.data.data]);
        setNuevoRiesgo({ nombre: '', aplica: false, mitigacion: '' });
        setAgregarNuevo(false);
      }
    } catch (error) {
      console.error("Error guardando riesgo:", error);
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizarRiesgo = async (id, datos) => {
    setGuardando(true);
    try {
      const response = await axios.put('https://siac-extension-server.vercel.app/riesgos', {
        id_riesgo: id,
        ...datos
      });
      
      if (response.data && response.data.success) {
        setRiesgos(prevRiesgos => 
          prevRiesgos.map(r => r.id_riesgo === id ? response.data.data : r)
        );
        setEditando(null);
      }
    } catch (error) {
      console.error("Error actualizando riesgo:", error);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarRiesgo = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este riesgo?")) return;
    
    try {
      const response = await axios.delete(`https://siac-extension-server.vercel.app/riesgos/${id}`);
      if (response.data && response.data.success) {
        setRiesgos(prevRiesgos => prevRiesgos.filter(r => r.id_riesgo !== id));
      }
    } catch (error) {
      console.error("Error eliminando riesgo:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">OTROS RIESGOS - {categoria.toUpperCase()}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />} 
          onClick={() => setAgregarNuevo(true)}
          disabled={agregarNuevo}
        >
          Agregar riesgo
        </Button>
      </Box>

      {/* Lista de riesgos existentes */}
      {riesgos.length === 0 && !agregarNuevo ? (
        <Typography variant="body2" color="textSecondary" sx={{ my: 2 }}>
          No hay riesgos adicionales en esta categoría.
        </Typography>
      ) : (
        <Box>
          {riesgos.map((riesgo) => (
            <Card key={riesgo.id_riesgo} sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
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
                      checked={editando === riesgo.id_riesgo ? riesgo.aplica_temp === 'Sí' : riesgo.aplica === 'Sí'}
                      onChange={(e) => {
                        if (editando === riesgo.id_riesgo) {
                          const updatedRiesgos = riesgos.map(r => {
                            if (r.id_riesgo === riesgo.id_riesgo) {
                              return { ...r, aplica_temp: e.target.checked ? 'Sí' : 'No' };
                            }
                            return r;
                          });
                          setRiesgos(updatedRiesgos);
                        } else {
                          handleActualizarRiesgo(riesgo.id_riesgo, {
                            aplica: e.target.checked ? 'Sí' : 'No'
                          });
                        }
                      }}
                      disabled={guardando}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {editando === riesgo.id_riesgo 
                        ? (riesgo.aplica_temp === 'Sí' ? 'Sí aplica' : 'No aplica')
                        : (riesgo.aplica === 'Sí' ? 'Sí aplica' : 'No aplica')}
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
                            handleActualizarRiesgo(riesgo.id_riesgo, {
                              nombre_riesgo: riesgo.nombre_riesgo_temp || riesgo.nombre_riesgo,
                              aplica: riesgo.aplica_temp || riesgo.aplica,
                              mitigacion: riesgo.mitigacion_temp || riesgo.mitigacion
                            });
                          }}
                          disabled={guardando}
                          variant="contained"
                        >
                          {guardando ? <CircularProgress size={20} /> : "Guardar"}
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => setEditando(null)}
                          disabled={guardando}
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
                            onClick={() => handleEliminarRiesgo(riesgo.id_riesgo)}
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
                  label="Mitigación"
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
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleGuardarNuevo}
                  disabled={guardando || !nuevoRiesgo.nombre.trim()}
                  startIcon={guardando ? <CircularProgress size={20} /> : null}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
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