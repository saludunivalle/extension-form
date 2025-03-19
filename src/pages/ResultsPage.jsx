import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, Grid, Link, Button, CircularProgress, Paper } from '@mui/material';
import { styled } from '@mui/system';

const StyledContainer = styled(Paper)({
  marginTop: '64px',
  padding: '32px',
  backgroundColor: '#f5f5f5',  
  borderRadius: '8px',
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
});

const StyledTitle = styled(Typography)({
  marginBottom: '24px',
  fontWeight: 'bold',
  color: '#646464', 
});

const StyledGridItem = styled(Grid)({
  paddingBottom: '12px',
});

const StyledLink = styled(Link)({
  marginLeft: '8px',
  color: 'blue',
});

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      const queryParams = new URLSearchParams(location.search);
      const solicitudId = queryParams.get('solicitud');

      try {
        const response = await axios.get('https://siac-extension-server.vercel.app/getFormData', {
          params: { id_solicitud: solicitudId }
        });
        setFormData(response.data);
      } catch (error) {
        console.error('Error al obtener los datos del formulario:', error);
      }
    };

    fetchFormData();
  }, [location.search]);

  if (!formData) {
    return (
      <StyledContainer>
        <Typography variant="h6">Cargando datos...</Typography>
        <CircularProgress style={{ marginTop: '20px' }} />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledTitle variant="h4" gutterBottom>
        Resultados de la Solicitud {formData.id_solicitud}
      </StyledTitle>
      <Grid container spacing={2}>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Fecha de la Solicitud:</strong> {formData.fecha_solicitud}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Nombre de la Actividad:</strong> {formData.nombre_actividad}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Nombre del Solicitante:</strong> {formData.nombre_solicitante}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Nombre de la Dependencia:</strong> {formData.nombre_dependencia}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Tipo:</strong> {formData.tipo}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Modalidad:</strong> {formData.modalidad}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Tipo de Oferta:</strong> {formData.tipo_oferta}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Ofrecido por:</strong> {formData.ofrecido_por}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Unidad Académica:</strong> {formData.unidad_academica}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Ofrecido para:</strong> {formData.ofrecido_para}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Intensidad Horaria:</strong> {formData.total_horas}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Horas Presencial:</strong> {formData.horas_trabajo_presencial}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Horas Sincrónicas:</strong> {formData.horas_sincronicas}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Créditos:</strong> {formData.creditos}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Cupo Mínimo:</strong> {formData.cupo_min}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Cupo Máximo:</strong> {formData.cupo_max}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Nombre del Coordinador:</strong> {formData.nombre_coordinador}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Correo del Coordinador:</strong> {formData.correo_coordinador}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Teléfono del Coordinador:</strong> {formData.tel_coordinador}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Profesor Participante:</strong> {formData.profesor_participante}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Perfil de Competencia:</strong> {formData.pefil_competencia}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Formas de Evaluación:</strong> {formData.formas_evaluacion}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Certificado Solicitado:</strong> {formData.certificado_solicitado}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Calificación Mínima:</strong> {formData.calificacion_minima}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Razón No Certificado:</strong> {formData.razon_no_certificado}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Valor Inscripción:</strong> {formData.valor_inscripcion}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Becas Convenio:</strong> {formData.becas_convenio}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Becas Estudiantes:</strong> {formData.becas_estudiantes}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Becas Docentes:</strong> {formData.becas_docentes}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Becas Otros:</strong> {formData.becas_otros}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Becas Total:</strong> {formData.becas_total}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Fechas de la Actividad:</strong> {formData.fechas_actividad}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Fechas por meses:</strong> {formData.fecha_por_meses}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Fechas de Inicio:</strong> {formData.fecha_inicio}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Fechas Final:</strong> {formData.fecha_final}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Organización de la Actividad:</strong> {formData.organizacion_actividad}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Nombre Firma:</strong> {formData.nombre_firma}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Cargo Firma:</strong> {formData.cargo_firma}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}><Typography variant="body1"><strong>Firma:</strong> {formData.firma}</Typography></StyledGridItem>
        <StyledGridItem item xs={12}>
          <Typography variant="body1"><strong> Matriz de riesgo:</strong>
            {formData.matriz_riesgo ? (
              <StyledLink href={formData.matriz_riesgo} target="_blank" rel="noopener noreferrer">
                Enlace
              </StyledLink>
            ) : ' No disponible'}
          </Typography>
        </StyledGridItem>
      </Grid>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/')} 
        style={{ marginTop: '24px' }}
      >
        Atrás
      </Button>
    </StyledContainer>
  );
}

export default ResultsPage;
