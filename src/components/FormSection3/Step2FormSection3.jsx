import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';

function Step2FormSection3({
  formData,
  handleNumberInputChange,
}) {
  // Calcular dinámicamente el total de ingresos
  const totalIngresos = (formData.ingresos_cantidad || 0) * (formData.ingresos_vr_unit || 0);

  // Calcular el subtotal de gastos
  const calculateSubtotalGastos = () => {
    const fieldsToSum = [
      'costos_personal',
      'personal_universidad',
      'honorarios_docentes',
      'otro_personal',
      'materiales_sumi',
      'gastos_alojamiento',
      'gastos_alimentacion',
      'gastos_transporte',
      'equipos_alquiler_compra',
      'dotacion_participantes',
      'carpetas',
      'libretas',
      'lapiceros',
      'memorias',
      'marcadores_papel_otros',
      'impresos',
      'labels',
      'certificados',
      'escarapelas',
      'fotocopias',
      'estacion_cafe',
      'transporte_mensaje',
      'refrigerios',
      'infraestructura_fisica',
      'gastos_generales',
      'infraestructura_universitaria',
      'imprevistos',
      'costos_administrativos',
    ];

    return fieldsToSum.reduce((total, key) => {
      const cantidad = parseFloat(formData[`${key}_cantidad`] || 0);
      const valorUnitario = parseFloat(formData[`${key}_vr_unit`] || 0);
      return total + cantidad * valorUnitario;
    }, 0);
  };

  const subtotalGastos = calculateSubtotalGastos();
  const imprevistos = subtotalGastos * 0.03; // 3% de los gastos
  const totalGastosImprevistos = subtotalGastos + imprevistos;

  // Formatear valores como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>CONCEPTO</TableCell>
          <TableCell align="right">CANTIDAD</TableCell>
          <TableCell align="right">VALOR UNITARIO (COP)</TableCell>
          <TableCell align="right">VALOR TOTAL (COP)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {/* INGRESOS */}
        <TableRow>
          <TableCell colSpan={4} style={{ fontWeight: 'bold' }}>INGRESOS</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Ingresos por Inscripciones</TableCell>
          <TableCell align="right">
            <TextField
              type="number"
              name="ingresos_cantidad"
              value={formData.ingresos_cantidad || ''}
              onChange={handleNumberInputChange}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </TableCell>
          <TableCell align="right">
            <TextField
              type="number"
              name="ingresos_vr_unit"
              value={formData.ingresos_vr_unit || ''}
              onChange={handleNumberInputChange}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              InputProps={{
                startAdornment: '$', // Añadir símbolo de pesos al input
              }}
            />
          </TableCell>
          <TableCell align="right">{formatCurrency(totalIngresos)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} style={{ fontWeight: 'bold' }}>TOTAL INGRESOS</TableCell>
          <TableCell align="right" style={{ fontWeight: 'bold' }}>
            {formatCurrency(totalIngresos)}
          </TableCell>
        </TableRow>

        {/* GASTOS */}
        <TableRow>
          <TableCell colSpan={4} style={{ fontWeight: 'bold' }}>GASTOS</TableCell>
        </TableRow>
        {[
          { label: '1. Costos de Personal', key: 'costos_personal' },
          { label: '1.1. Personal Nombrado de la Universidad (Max 70%)', key: 'personal_universidad' },
          { label: '1.2. Honorarios Docentes Externos (Horas)', key: 'honorarios_docentes' },
          { label: '1.3. Otro Personal - Subcontratos', key: 'otro_personal' },
          { label: '2. Materiales y Suministros', key: 'materiales_sumi' },
          { label: '3. Gastos de Alojamiento', key: 'gastos_alojamiento' },
          { label: '4. Gastos de Alimentación', key: 'gastos_alimentacion' },
          { label: '5. Gastos de Transporte', key: 'gastos_transporte' },
          { label: '6. Equipos Alquiler o Compra', key: 'equipos_alquiler_compra' },
          { label: '7. Dotación Participantes', key: 'dotacion_participantes' },
          { label: '7.1. Carpetas', key: 'carpetas' },
          { label: '7.2. Libretas', key: 'libretas' },
          { label: '7.3. Lapiceros', key: 'lapiceros' },
          { label: '7.4. Memorias', key: 'memorias' },
          { label: '7.5. Marcadores, papel, etc.', key: 'marcadores_papel_otros' },
          { label: '8. Impresos', key: 'impresos' },
          { label: '8.1. Labels', key: 'labels' },
          { label: '8.2. Certificados', key: 'certificados' },
          { label: '8.3. Escarapelas', key: 'escarapelas' },
          { label: '8.4. Fotocopias', key: 'fotocopias' },
          { label: '9. Impresos', key: 'impresos_2' }, // Para diferenciarlo del anterior 'Impresos'
          { label: '9.1. Estación de café', key: 'estacion_cafe' },
          { label: '9.2. Transporte de mensaje', key: 'transporte_mensaje' },
          { label: '9.3. Refrigerios', key: 'refrigerios' },
          { label: '10. Inversión en Infraestructura Física', key: 'infraestructura_fisica' },
          { label: '11. Gastos Generales', key: 'gastos_generales' },
          { label: '12. Valor Infraestructura Universitaria', key: 'infraestructura_universitaria' },
          { label: '13. Imprevistos (Max 5% del 1 al 8)', key: 'imprevistos' },
          { label: '14. Costos Administrativos del proyecto', key: 'costos_administrativos' }
        ].map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.label}</TableCell>
            <TableCell align="right">
              <TextField
                type="number"
                name={`${item.key}_cantidad`}
                value={formData[`${item.key}_cantidad`] || ''}
                onChange={handleNumberInputChange}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              />
            </TableCell>
            <TableCell align="right">
              <TextField
                type="number"
                name={`${item.key}_vr_unit`}
                value={formData[`${item.key}_vr_unit`] || ''}
                onChange={handleNumberInputChange}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                InputProps={{
                  startAdornment: '$', // Añadir símbolo de pesos al input
                }}
              />
            </TableCell>
            <TableCell align="right">
              {formatCurrency(
                (formData[`${item.key}_cantidad`] || 0) * (formData[`${item.key}_vr_unit`] || 0)
              )}
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell colSpan={3} style={{ fontWeight: 'bold' }}>SUB TOTAL GASTOS</TableCell>
          <TableCell align="right" style={{ fontWeight: 'bold' }}>
            {formatCurrency(subtotalGastos)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} style={{ fontWeight: 'bold' }}>Imprevistos (3%)</TableCell>
          <TableCell align="right" style={{ fontWeight: 'bold' }}>
            {formatCurrency(imprevistos)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} style={{ fontWeight: 'bold' }}>TOTAL GASTOS + IMPREVISTOS</TableCell>
          <TableCell align="right" style={{ fontWeight: 'bold' }}>
            {formatCurrency(totalGastosImprevistos)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default Step2FormSection3;
