import { TextField, Box, Typography, Grid } from '@mui/material';

function Step2FormSection4({ formData, handleInputChange, errors }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Atributos del programa
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Básicos: Aportan valor a la audiencia pero no es exclusivo del programa"
            name="atributosBasicos"
            value={formData.atributosBasicos || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
            error={!!errors.atributosBasicos}
            helperText={errors.atributosBasicos}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Diferenciadores: Atributos únicos del programa"
            name="atributosDiferenciadores"
            value={formData.atributosDiferenciadores || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
            error={!!errors.atributosDiferenciadores}
            helperText={errors.atributosDiferenciadores}
          />
        </Grid>
      </Grid>
      <Typography variant="h6" gutterBottom>
        ¿Cuál es la competencia y en qué se diferencia frente al programa? (Valor agregado, precio, ubicación, modalidad)
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Competencia"
            name="competencia"
            value={formData.competencia || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
            error={!!errors.competencia}
            helperText={errors.competencia}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Programa"
            name="programa"
            value={formData.programa || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
            error={!!errors.programa}
            helperText={errors.programa}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        ¿Qué programas similares o iguales ofrecen otras instituciones educativas de la región?
      </Typography>
      <TextField
        label="Programas similares"
        name="programasSimilares"
        value={formData.programasSimilares || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        multiline
        rows={4}
        required
        error={!!errors.programasSimilares}
        helperText={errors.programasSimilares}
      />

      <Typography variant="h6" gutterBottom>
        ¿Qué estrategias ha implementado la competencia para tener la acogida y reconocimiento de su programa?
      </Typography>
      <TextField
        label="Estrategias de la competencia"
        name="estrategiasCompetencia"
        value={formData.estrategiasCompetencia || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        multiline
        rows={4}
        required
        error={!!errors.estrategiasCompetencia}
        helperText={errors.estrategiasCompetencia}
      />
    </Box>
  );
}

export default Step2FormSection4;
