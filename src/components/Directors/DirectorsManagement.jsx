import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { userService } from '../../services/api';

const DirectorsManagement = ({ userData }) => {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Estados modal Crear
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Estados modal Editar
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingDirector, setEditingDirector] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editName, setEditName] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Estados modal Eliminar
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [directorToDelete, setDirectorToDelete] = useState(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const normalizedRole = String(userData?.role || '').trim().toLowerCase();
  const isAuthorized = normalizedRole === 'revisor_1' || normalizedRole === 'revisor1' || normalizedRole === 'admin';

  const fetchDirectors = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await userService.getDirectors();
      if (response?.success && Array.isArray(response.directors)) {
        setDirectors(response.directors);
      } else {
        setDirectors([]);
      }
    } catch (err) {
      console.error('Error al cargar directores:', err);
      setErrorMsg(err.response?.data?.error || 'No se pudo cargar la lista de directores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchDirectors();
    }
  }, [isAuthorized]);

  const filteredDirectors = useMemo(() => {
    const term = searchFilter.trim().toLowerCase();
    if (!term) return directors;
    return directors.filter(
      (d) =>
        (d.email && d.email.toLowerCase().includes(term)) ||
        (d.name && d.name.toLowerCase().includes(term))
    );
  }, [directors, searchFilter]);

  // Manejar apertura de Crear
  const handleOpenCreate = () => {
    setCreateEmail('');
    setCreateName('');
    setOpenCreateModal(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Guardar nuevo Director
  const handleCreateDirector = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = createEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Debe ingresar el correo electrónico del director.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('El formato del correo electrónico no es válido.');
      return;
    }

    setSubmittingCreate(true);
    setErrorMsg('');
    try {
      await userService.addDirector({
        email: cleanEmail,
        name: createName.trim(),
      });
      setSuccessMsg(`Director ${cleanEmail} agregado exitosamente.`);
      setOpenCreateModal(false);
      setCreateEmail('');
      setCreateName('');
      await fetchDirectors();
    } catch (err) {
      console.error('Error al crear director:', err);
      setErrorMsg(err.response?.data?.error || 'Error al agregar el director.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Manejar apertura de Editar
  const handleOpenEdit = (director) => {
    setEditingDirector(director);
    setEditEmail(director.email || '');
    setEditName(director.name || '');
    setOpenEditModal(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Guardar edición de Director
  const handleEditDirector = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = editEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('El correo electrónico no puede estar vacío.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('El formato del nuevo correo electrónico no es válido.');
      return;
    }

    setSubmittingEdit(true);
    setErrorMsg('');
    try {
      await userService.updateDirector({
        currentEmail: editingDirector.email,
        newEmail: cleanEmail,
        name: editName.trim(),
      });
      setSuccessMsg(`Datos del director actualizados correctamente.`);
      setOpenEditModal(false);
      setEditingDirector(null);
      await fetchDirectors();
    } catch (err) {
      console.error('Error al editar director:', err);
      setErrorMsg(err.response?.data?.error || 'Error al actualizar el director.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Manejar apertura de Eliminar
  const handleOpenDelete = (director) => {
    setDirectorToDelete(director);
    setOpenDeleteModal(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Confirmar eliminación de Director
  const handleDeleteDirector = async () => {
    if (!directorToDelete) return;
    setSubmittingDelete(true);
    setErrorMsg('');
    try {
      await userService.deleteDirector(directorToDelete.email);
      setSuccessMsg(`Director ${directorToDelete.email} eliminado correctamente.`);
      setOpenDeleteModal(false);
      setDirectorToDelete(null);
      await fetchDirectors();
    } catch (err) {
      console.error('Error al eliminar director:', err);
      setErrorMsg(err.response?.data?.error || 'Error al eliminar el director.');
    } finally {
      setSubmittingDelete(false);
    }
  };

  if (!isAuthorized) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error">
          Acceso denegado: Este módulo está disponible exclusivamente para usuarios con permiso de <strong>Revisor 1</strong>.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Encabezado */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <SupervisorAccountIcon fontSize="large" /> Gestión de Directores
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Administración de usuarios con rol de Director para la firma y revisión de solicitudes de extensión.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' },
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
          }}
        >
          Agregar Director
        </Button>
      </Box>

      {/* Alertas */}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      {/* Barra de Búsqueda y Estadísticas */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 2.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar por correo o nombre..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          sx={{ maxWidth: { xs: '100%', sm: 380 }, backgroundColor: '#fff', borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Total de directores registrados: <strong>{directors.length}</strong>
        </Typography>
      </Box>

      {/* Tabla de Directores */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="tabla de directores">
          <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Correo electrónico</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#374151' }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={36} sx={{ color: '#1976d2', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Cargando directores...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredDirectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <SupervisorAccountIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#6b7280' }}>
                    {searchFilter ? 'No se encontraron directores que coincidan con la búsqueda' : 'No hay directores registrados'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Utilice el botón &quot;Agregar Director&quot; para registrar un nuevo usuario con rol de director.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDirectors.map((director) => {
                const hasGoogleId = Boolean(director.id);
                return (
                  <TableRow
                    key={director.email}
                    sx={{
                      '&:hover': { backgroundColor: '#fcfcfc' },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#1f2937' }}>
                      {director.name || (
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ fontStyle: 'italic', color: '#9ca3af' }}
                        >
                          (Se completará al iniciar sesión)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: '#374151' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                        <span>{director.email}</span>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Director"
                        size="small"
                        sx={{
                          backgroundColor: '#e3f2fd',
                          color: '#1565c0',
                          fontWeight: 700,
                          borderRadius: 1.5,
                          border: '1px solid #90caf9',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {hasGoogleId ? (
                        <Chip
                          icon={<CheckCircleOutlineIcon fontSize="small" />}
                          label="Activo · Vinculado"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      ) : (
                        <Tooltip title="El correo está autorizado. Cuando el director inicie sesión con Google por primera vez, su cuenta quedará vinculada automáticamente.">
                          <Chip
                            icon={<HourglassEmptyIcon fontSize="small" />}
                            label="Pre-registrado"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar correo / datos">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(director)}
                          sx={{
                            color: '#1976d2',
                            mr: 1,
                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar director">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDelete(director)}
                          sx={{
                            color: '#d32f2f',
                            '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Agregar Director */}
      <Dialog
        open={openCreateModal}
        onClose={() => !submittingCreate && setOpenCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleCreateDirector}>
          <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SupervisorAccountIcon /> Agregar Nuevo Director
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Para agregar un nuevo director, <strong>básicamente solo debe ingresar su correo institucional</strong>. Opcionalmente puede ingresar su nombre si lo conoce; de lo contrario, el sistema lo obtendrá automáticamente en su primer inicio de sesión.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField
                required
                fullWidth
                label="Correo electrónico del director"
                placeholder="ejemplo@correounivalle.edu.co"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                disabled={submittingCreate}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                helperText="Debe ser el correo con el que el director iniciará sesión mediante Google."
              />

              <TextField
                fullWidth
                label="Nombre del director (opcional)"
                placeholder="Ej. Dr. Carlos Rodríguez"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                disabled={submittingCreate}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                helperText="Si no lo conoce, déjelo en blanco; se completará automáticamente al iniciar sesión."
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setOpenCreateModal(false)}
              disabled={submittingCreate}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
              disabled={submittingCreate}
            >
              {submittingCreate ? <CircularProgress size={22} color="inherit" /> : 'Guardar Director'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Editar Director */}
      <Dialog
        open={openEditModal}
        onClose={() => !submittingEdit && setOpenEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleEditDirector}>
          <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon /> Editar Correo del Director
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Modifique el correo institucional asociado a este director. Si el correo cambia, el nuevo correo será el habilitado para acceder con rol de director.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField
                required
                fullWidth
                label="Correo electrónico"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                disabled={submittingEdit}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Nombre completo"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={submittingEdit}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setOpenEditModal(false)}
              disabled={submittingEdit}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submittingEdit}
            >
              {submittingEdit ? <CircularProgress size={22} color="inherit" /> : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Confirmar Eliminación */}
      <Dialog
        open={openDeleteModal}
        onClose={() => !submittingDelete && setOpenDeleteModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon /> Eliminar Director
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 1 }}>
            ¿Está seguro de que desea eliminar al director <strong>{directorToDelete?.email}</strong>?
          </Typography>
          {directorToDelete?.name && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Nombre: {directorToDelete.name}
            </Typography>
          )}
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            Esta persona ya no tendrá asignado el rol de Director ni podrá firmar solicitudes en esa etapa.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setOpenDeleteModal(false)}
            disabled={submittingDelete}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteDirector}
            disabled={submittingDelete}
          >
            {submittingDelete ? <CircularProgress size={22} color="inherit" /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

DirectorsManagement.propTypes = {
  userData: PropTypes.shape({
    id: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default DirectorsManagement;
