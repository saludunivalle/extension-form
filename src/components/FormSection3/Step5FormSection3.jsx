import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';

function Step5FormSection3({ formData, handleInputChange, totalIngresos, totalGastos, totalGastosImprevistos }) {
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
            <TableRow>
              <TableCell>Total Ingresos</TableCell>
              <TableCell align="right">{totalIngresos}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Gastos</TableCell>
              <TableCell align="right">{totalGastos}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Gastos + Imprevistos</TableCell>
              <TableCell align="right">{totalGastosImprevistos}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={1} style={{ fontWeight: 'bold' }}>TOTAL</TableCell>
              <TableCell align="right" style={{ fontWeight: 'bold' }}>
                {totalIngresos - totalGastosImprevistos}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Observaciones"
          fullWidth
          name="observaciones_presupuesto"
          value={formData.visto_bueno_unidad || ''}
          onChange={handleInputChange}
          required
        />
      </Grid>
    </Grid>
  );
}

export default Step5FormSection3;
