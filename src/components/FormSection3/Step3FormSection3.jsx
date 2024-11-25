import React from 'react';
import { Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';

function Step3FormSection3({ formData, handleInputChange }) {
  // Calcular dinámicamente los totales según los datos en formData
  const totalIngresos = (formData.ingresos_cantidad || 0) * (formData.ingresos_vr_unit || 0);

  const fondoComun = totalIngresos * 0.3; // 30% del total de ingresos
  const facultadInstituto = totalIngresos * 0.05; // 5% del total de ingresos
  const escuelaDepartamento =
    ((formData.escuela_departamento_porcentaje || 0) / 100) * totalIngresos; // XX% dinámico

  // Suma total de los aportes
  const totalAportesUnivalle = fondoComun + facultadInstituto + escuelaDepartamento;

  // Formatear valores como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CONCEPTO</TableCell>
              <TableCell align="right">VALOR</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Fondo Común */}
            <TableRow>
              <TableCell>Fondo Común (30%)</TableCell>
              <TableCell align="right">{formatCurrency(fondoComun)}</TableCell>
            </TableRow>

            {/* Facultad o Instituto */}
            <TableRow>
              <TableCell>Facultad o Instituto (5%)</TableCell>
              <TableCell align="right">{formatCurrency(facultadInstituto)}</TableCell>
            </TableRow>

            {/* Escuela/Departamento */}
            <TableRow>
              <TableCell>Escuela, Departamento, Área (XX%)</TableCell>
              <TableCell align="right">
                <TextField
                  type="number"
                  name="escuela_departamento_porcentaje"
                  value={formData.escuela_departamento_porcentaje || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    const valor = totalIngresos * (value / 100); // Calcular según porcentaje ingresado
                    handleInputChange({ target: { name: 'escuela_departamento', value: valor } });
                    handleInputChange({ target: { name: 'escuela_departamento_porcentaje', value } });
                  }}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </TableCell>
            </TableRow>

            {/* Total Aportes */}
            <TableRow>
              <TableCell colSpan={1} style={{ fontWeight: 'bold' }}>Total Recursos</TableCell>
              <TableCell align="right" style={{ fontWeight: 'bold' }}>
                {formatCurrency(totalAportesUnivalle)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
}

export default Step3FormSection3;
