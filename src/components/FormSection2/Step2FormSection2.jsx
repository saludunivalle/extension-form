import React,{  useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Box, IconButton, Typography } from '@mui/material';
import { NumericFormat } from 'react-number-format';
import { Add, Remove } from '@mui/icons-material';
import PropTypes from "prop-types";

function Step2FormSection2({
  formData,
  handleNumberInputChange,
  updateTotalGastos // Nueva función callback para enviar el total al componente padre
}) {
  const [expandedSections, setExpandedSections] = useState({});

  // Estructura jerárquica de gastos
  const gastosStructure = [
    {
      label: '1. Costos de Personal',
      key: 'costos_personal',
      children: [
        { label: '1.1. Personal Nombrado de la Universidad (Max 70%)', key: 'personal_universidad' },
        { label: '1.2. Honorarios Docentes Externos (Horas)', key: 'honorarios_docentes' },
        { label: '1.3. Otro Personal - Subcontratos', key: 'otro_personal' },
      ],
    },
    {
      label: '2. Materiales y Suministros',
      key: 'materiales_sumi',
      children: [],
    },
    {
      label: '3. Gastos de Alojamiento',
      key: 'gastos_alojamiento',
      children: [],
    },
    {
      label: '4. Gastos de Alimentación',
      key: 'gastos_alimentacion',
      children: [],
    },
    {
      label: '5. Gastos de Transporte',
      key: 'gastos_transporte',
      children: [],
    },
    {
      label: '6. Equipos Alquiler o Compra',
      key: 'equipos_alquiler_compra',
      children: [],
    },
    {
      label: '7. Dotación Participantes',
      key: 'dotacion_participantes',
      children: [
        { label: '7.1. Carpetas', key: 'carpetas' },
        { label: '7.2. Libretas', key: 'libretas' },
        { label: '7.3. Lapiceros', key: 'lapiceros' },
        { label: '7.4. Memorias', key: 'memorias' },
        { label: '7.5. Marcadores, papel, etc.', key: 'marcadores_papel_otros' },
      ],
    },
    {
      label: '8. Impresos',
      key: 'impresos',
      children: [
        { label: '8.1. Labels', key: 'labels' },
        { label: '8.2. Certificados', key: 'certificados' },
        { label: '8.3. Escarapelas', key: 'escarapelas' },
        { label: '8.4. Fotocopias', key: 'fotocopias' },
      ],
    },
    {
      label: '9. Impresos',
      key: 'impresos_2',
      children: [
        { label: '9.1. Estación de café', key: 'estacion_cafe' },
        { label: '9.2. Transporte de mensaje', key: 'transporte_mensaje' },
        { label: '9.3. Refrigerios', key: 'refrigerios' },
      ],
    },
    {
      label: '10. Inversión en Infraestructura Física',
      key: 'infraestructura_fisica',
      children: [],
    },
    {
      label: '11. Gastos Generales',
      key: 'gastos_generales',
      children: [],
    },
    {
      label: '12. Valor Infraestructura Universitaria',
      key: 'infraestructura_universitaria',
      children: [],
    },
    {
      label: '13. Imprevistos (Max 5% del 1 al 8)',
      key: 'imprevistos',
      children: [],
    },
    {
      label: '14. Costos Administrativos del proyecto',
      key: 'costos_administrativos',
      children: [],
    },
  ];

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const newExpanded = {};
    gastosStructure.forEach(item => {
      if (item.children.length > 0) newExpanded[item.key] = true;
    });
    setExpandedSections(newExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  // Calcular dinámicamente el total de ingresos
  const totalIngresos = (formData.ingresos_cantidad || 0) * (formData.ingresos_vr_unit || 0);

  // Calcular el subtotal de gastos
  const calculateSubtotalGastos = () => {
    return gastosStructure.reduce((total, item) => {
      if (item.children.length === 0) {
        const cantidad = parseFloat(formData[`${item.key}_cantidad`] || 0);
        const valorUnitario = parseFloat(formData[`${item.key}_vr_unit`] || 0);
        return total + cantidad * valorUnitario;
      } else {
        // Sumar tanto el item padre como sus hijos
        const parentCantidad = parseFloat(formData[`${item.key}_cantidad`] || 0);
        const parentValorUnitario = parseFloat(formData[`${item.key}_vr_unit`] || 0);
        const parentTotal = parentCantidad * parentValorUnitario;
        const childrenTotal = item.children.reduce((childTotal, child) => {
          const cantidad = parseFloat(formData[`${child.key}_cantidad`] || 0);
          const valorUnitario = parseFloat(formData[`${child.key}_vr_unit`] || 0);
          return childTotal + cantidad * valorUnitario;
        }, 0);
        return total + parentTotal + childrenTotal;
      }
    }, 0);
  };

  const subtotalGastos = calculateSubtotalGastos();
  const imprevistos = subtotalGastos * 0.03; // 3% de los gastos
  const totalGastosImprevistos = subtotalGastos + imprevistos;

  // Llama a la función callback cada vez que se calcule el total
  useEffect(() => {
    updateTotalGastos(totalGastosImprevistos);
  }, [totalGastosImprevistos, updateTotalGastos]);

  // Formatear valores como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  
  const handleCurrencyChange = (name, values) => {
    let value = values.value;
    
    // Eliminar caracteres no numéricos y convertir vacíos a 0
    value = value.replace(/[^0-9]/g, '') || '0';
    
    handleNumberInputChange({
      target: { name, value }
    });
  };

  // Common props for numeric inputs
  const numericInputProps = {
    inputMode: 'numeric',
    min: "0",
    pattern: '[0-9]*',
    required: true,
    placeholder: "0"
  };

  const isPositiveBalance = totalIngresos >= totalGastosImprevistos;

  return (
    <Table sx={{ 
      '& .MuiTableCell-root': { 
        padding: '12px 16px',
        borderBottom: '1px solid rgba(224, 224, 224, 0.3)'
      },
      '& .MuiTableHead-root': {
        backgroundColor: '#fafafa'
      }
    }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600 }}>CONCEPTO</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>CANTIDAD</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>VALOR UNITARIO (COP)</TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>VALOR TOTAL (COP)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {/* SECCIÓN INGRESOS */}
        <TableRow>
          <TableCell colSpan={4} sx={{ 
            backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0',
            py: 1, fontWeight: 600
          }}>
            INGRESOS
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Ingresos por Inscripciones</TableCell>
          <TableCell align="right">
            <TextField
              type="number"
              name="ingresos_cantidad"
              value={formData.ingresos_cantidad || 0}
              onChange={handleNumberInputChange}
              inputProps={{ 
                inputMode: 'numeric',
                min: "0",
                pattern: '[0-9]*',
                placeholder: '0'
              }}
              sx={{ 
                width: 100, 
                '& .MuiInputBase-input': { 
                  textAlign: 'right', 
                  p: '8px 10px',
                  '&::placeholder': { opacity: 0.6 } 
                }
              }}
            />
          </TableCell>
          <TableCell align="right">
            <NumericFormat
              customInput={TextField}
              thousandSeparator="."
              decimalSeparator=","
              prefix="$ "
              name="ingresos_vr_unit"
              value={formData.ingresos_vr_unit || 0}
              onValueChange={(values) => handleCurrencyChange('ingresos_vr_unit', values)}
              onKeyPress={(e) => {
                if (e.key === '.' || e.key === ',') e.preventDefault();
              }}
              inputProps={{ 
                inputMode: 'numeric',
                pattern: '[0-9]*',
                placeholder: '0'
              }}
              allowNegative={false}
              sx={{ 
                width: 150, 
                '& .MuiInputBase-input': { 
                  textAlign: 'right', 
                  p: '8px 10px',
                  '&::placeholder': { opacity: 0.6 } 
                }
              }}
            />
          </TableCell>
          <TableCell align="right">{formatCurrency(totalIngresos)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>TOTAL INGRESOS</TableCell>
          <TableCell 
            align="right"
            sx={{ 
              fontWeight: 'bold',
              backgroundColor: isPositiveBalance ? '#e8f5e9' : '#ffebee',
              color: isPositiveBalance ? '#2e7d32' : '#c62828'
            }}
          >
            {formatCurrency(totalIngresos)}
          </TableCell>
        </TableRow>

        {/* GASTOS HEADER */}
        <TableRow>
          <TableCell colSpan={4} sx={{ 
            backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0',
            py: 1
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>GASTOS</Typography>
              <Box>
                <Button 
                  onClick={expandAll}
                  variant="outlined"
                  size="small"
                  startIcon={<Add fontSize="small" />}
                  sx={{ mr: 1, color: '#616161', borderColor: '#e0e0e0',
                        '&:hover': { backgroundColor: '#eeeeee', borderColor: '#bdbdbd' } }}
                >
                  Expandir
                </Button>
                <Button
                  onClick={collapseAll}
                  variant="outlined"
                  size="small"
                  startIcon={<Remove fontSize="small" />}
                  sx={{ color: '#616161', borderColor: '#e0e0e0',
                        '&:hover': { backgroundColor: '#eeeeee', borderColor: '#bdbdbd' } }}
                >
                  Colapsar
                </Button>
              </Box>
            </Box>
          </TableCell>
        </TableRow>

        {/* GASTOS ITEMS */}
        {gastosStructure.map(item => (
          <React.Fragment key={item.key}>
            {/* Fila principal */}
            <TableRow sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
              <TableCell sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight={500}>{item.label}</Typography>
                {item.children.length > 0 && (
                  <IconButton
                    onClick={() => toggleSection(item.key)}
                    size="small"
                    sx={{
                      color: '#757575',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
                      ml: 2, p: 0, width: 32, height: 32
                    }}
                  >
                    {expandedSections[item.key] ? <Remove fontSize="small" /> : <Add fontSize="small" />}
                  </IconButton>
                )}
              </TableCell>
              <TableCell align="right">
                <TextField
                  type="number"
                  name={`${item.key}_cantidad`}
                  value={formData[`${item.key}_cantidad`] || 0}
                  onChange={handleNumberInputChange}
                  inputProps={numericInputProps}
                  size="small"
                  sx={{ width: 100, '& .MuiInputBase-input': { textAlign: 'right', p: '8px 10px' } }}
                  error={formData[`${item.key}_cantidad`] < 0}
                  helperText={formData[`${item.key}_cantidad`] < 0 && "La cantidad no puede ser negativa"}
                />
              </TableCell>
              <TableCell align="right">
                <NumericFormat
                  customInput={TextField}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$ "
                  name={`${item.key}_vr_unit`}
                  value={formData[`${item.key}_vr_unit`] || 0}
                  onValueChange={(values) => {
                    handleNumberInputChange({
                      target: { name: `${item.key}_vr_unit`, value: values.value }
                    });
                  }}
                  inputProps={numericInputProps}
                  size="small"
                  sx={{ width: 150, '& .MuiInputBase-input': { textAlign: 'right', p: '8px 10px' } }}
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {formatCurrency(
                    (parseFloat(formData[`${item.key}_cantidad`] || 0)) *
                    (parseFloat(formData[`${item.key}_vr_unit`] || 0))
                  )}
                </Typography>
              </TableCell>
            </TableRow>
            {/* Sub-items */}
            {item.children.length > 0 && expandedSections[item.key] && item.children.map(child => (
              <TableRow key={child.key} sx={{ backgroundColor: '#fcfcfc' }}>
                <TableCell sx={{ pl: 4 }}>{child.label}</TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    name={`${child.key}_cantidad`}
                    value={formData[`${child.key}_cantidad`] || 0}
                    onChange={handleNumberInputChange}
                    inputProps={numericInputProps}
                    size="small"
                    sx={{ width: 100, '& .MuiInputBase-input': { textAlign: 'right', p: '8px 10px' } }}
                  />
                </TableCell>
                <TableCell align="right">
                  <NumericFormat
                    customInput={TextField}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="$ "
                    name={`${child.key}_vr_unit`}
                    value={formData[`${child.key}_vr_unit`] || 0}
                    onValueChange={(values) => {
                      const cleanValue = values.value.replace(/[^0-9]/g, '');
                      handleNumberInputChange({
                        target: { name: `${child.key}_vr_unit`, value: cleanValue }
                      });
                    }}
                    inputProps={numericInputProps}
                    size="small"
                    sx={{ width: 150, '& .MuiInputBase-input': { textAlign: 'right', p: '8px 10px' } }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {formatCurrency(
                      (parseFloat(formData[`${child.key}_cantidad`] || 0)) *
                      (parseFloat(formData[`${child.key}_vr_unit`] || 0))
                    )}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </React.Fragment>
        ))}

        {/* TOTALES */}
        <TableRow sx={{ '& td': { borderBottom: 'none' } }}>
          <TableCell colSpan={3} sx={{ fontWeight: 600, borderTop: '1px solid #e0e0e0', pt: 2 }}>
            SUB TOTAL GASTOS
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 600, borderTop: '1px solid #e0e0e0', pt: 2 }}>
            {formatCurrency(subtotalGastos)}
          </TableCell>
        </TableRow>
        <TableRow sx={{ '& td': { borderBottom: 'none' } }}>
          <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
            Imprevistos (3%)
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>
            {formatCurrency(imprevistos)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>
            TOTAL GASTOS + IMPREVISTOS
          </TableCell>
          <TableCell 
            align="right"
            sx={{ 
              fontWeight: 600, 
              backgroundColor: isPositiveBalance ? '#e8f5e9' : '#ffebee',
              color: isPositiveBalance ? '#2e7d32' : '#c62828'
            }}
          >
            {formatCurrency(totalGastosImprevistos)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

Step2FormSection2.propTypes = {
  formData: PropTypes.shape({
    ingresos_cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ingresos_vr_unit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  handleNumberInputChange: PropTypes.func.isRequired,
  updateTotalGastos: PropTypes.func.isRequired,
};

export default Step2FormSection2;
