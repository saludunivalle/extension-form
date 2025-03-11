import React,{  useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Box, IconButton, Typography, CircularProgress,Tooltip} from '@mui/material';
import { NumericFormat } from 'react-number-format';
import { Add, Remove, Delete, Restore } from '@mui/icons-material';
import PropTypes from "prop-types";

function Step2FormSection2({
  formData,
  handleNumberInputChange,
  updateTotalGastos // Nueva función callback para enviar el total al componente padre
}) {
  const [expandedSections, setExpandedSections] = useState({});
  const [hiddenConcepts, setHiddenConcepts] = useState([]);
  const [extraExpenses, setExtraExpenses] = useState([]);
  const [isAddingExtraExpense, setIsAddingExtraExpense] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  

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

  const handleDeleteConcept = (key) => {
    setLoadingDeleteId(key);
  
    setTimeout(() => {

      setExtraExpenses((prevExpenses) => prevExpenses.filter(expense => expense.id !== key));
  
      setHiddenConcepts((prev) => [...prev, key]);
  
      setLoadingDeleteId(null);
    }, 500);
  };

  const handleRestoreConcepts = () => {
    setHiddenConcepts([]);
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

  const handleAddExtraExpense = () => {
    setIsAddingExtraExpense(true);
  
    setTimeout(() => {
      setExtraExpenses([
        ...extraExpenses,
        { id: Date.now(), name: '', cantidad: 0, vr_unit: 0 },
      ]);
      setIsAddingExtraExpense(false);
    }, 500);
  };
  
  
  const handleRemoveExtraExpense = (id) => {
    setLoadingDeleteId(id);
  
    setTimeout(() => {
      setExtraExpenses(extraExpenses.filter((expense) => expense.id !== id));
      setLoadingDeleteId(null);
    }, 500); // Simula una pequeña espera
  };
  
  const handleExtraExpenseChange = (id, field, value) => {
    setExtraExpenses(
      extraExpenses.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
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
          <TableCell align="center" sx={{ fontWeight: 600 }}>ACCIÓN</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {/* SECCIÓN INGRESOS */}
        <TableRow>
          <TableCell colSpan={5} sx={{ 
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
              inputProps={numericInputProps}
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
              inputProps={numericInputProps}
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
          <TableCell></TableCell>
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
          <TableCell></TableCell>
        </TableRow>
    
        {/* GASTOS HEADER */}
        <TableRow>
          <TableCell colSpan={5} sx={{ mr: 1, color: '#616161', borderColor: '#e0e0e0',
                        '&:hover': { backgroundColor: '#eeeeee', borderColor: '#bdbdbd' },
            py: 1
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>GASTOS</Typography>
              <Box >
                <Button variant="outlined" startIcon={<Add />} onClick={expandAll}>
                  Expandir Todo
                </Button>
                <Button variant="outlined" startIcon={<Remove />} onClick={collapseAll}>
                  Colapsar Todo
                </Button>
                <Button variant="outlined" startIcon={<Restore />} onClick={handleRestoreConcepts}>
                  Restaurar Conceptos
                </Button>
              </Box>
            </Box>
          </TableCell>
        </TableRow>
    
        {/* GASTOS ITEMS */}
        {gastosStructure.map(item => (
          !hiddenConcepts.includes(item.key) && (
            <React.Fragment key={item.key}>
              <TableRow>
                <TableCell>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={500}>{item.label}</Typography>
                    {item.children.length > 0 && (
                      <IconButton size="small" onClick={() => toggleSection(item.key)}>
                        {expandedSections[item.key] ? <Remove /> : <Add />}
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    name={`${item.key}_cantidad`}
                    value={formData[`${item.key}_cantidad`] || 0}
                    onChange={handleNumberInputChange}
                    size="small"
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
                    onValueChange={(values) =>
                      handleNumberInputChange({ target: { name: `${item.key}_vr_unit`, value: values.value } })
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {formatCurrency((formData[`${item.key}_cantidad`] || 0) * (formData[`${item.key}_vr_unit`] || 0))}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Eliminar concepto">
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteConcept(item.key)} 
                      disabled={loadingDeleteId === item.key}>
                      {loadingDeleteId === item.key ? <CircularProgress size={20} /> : <Delete />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>

              {/* Subpuntos */}
              {item.children.length > 0 && expandedSections[item.key] && item.children.map(child => (
                !hiddenConcepts.includes(child.key) && ( // Oculta los subpuntos correctamente
                  <TableRow key={child.key}>
                    <TableCell sx={{ pl: 4 }}>{child.label}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        name={`${child.key}_cantidad`}
                        value={formData[`${child.key}_cantidad`] || 0}
                        onChange={handleNumberInputChange}
                        size="small"
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
                        onValueChange={(values) =>
                          handleNumberInputChange({ target: { name: `${child.key}_vr_unit`, value: values.value } })
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency((formData[`${child.key}_cantidad`] || 0) * (formData[`${child.key}_vr_unit`] || 0))}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Eliminar concepto">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteConcept(child.key)} 
                          disabled={loadingDeleteId === child.key}
                        >
                          {loadingDeleteId === child.key ? <CircularProgress size={20} /> : <Delete />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              ))}
            </React.Fragment>
          )
        ))}

        {/* SECCIÓN GASTOS EXTRAS */}
        <TableRow>
          <TableCell colSpan={5} sx={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0', py: 1, fontWeight: 600 }}>
            15. GASTOS EXTRAS
          </TableCell>
        </TableRow>

        {extraExpenses.map((expense, index) => (
          <TableRow key={expense.id}>
            <TableCell>
              <Box display="flex" alignItems="center">
                <Typography sx={{ mr: 1, fontWeight: 500 }}>{`15.${index + 1}`}</Typography>
                <TextField
                  fullWidth
                  placeholder="Nombre del gasto extra"
                  value={expense.name}
                  onChange={(e) => handleExtraExpenseChange(expense.id, 'name', e.target.value)}
                />
              </Box>
            </TableCell>
            <TableCell align="right">
              <TextField
                type="number"
                value={expense.cantidad}
                onChange={(e) => handleExtraExpenseChange(expense.id, 'cantidad', e.target.value)}
                size="small"
              />
            </TableCell>
            <TableCell align="right">
              <NumericFormat
                customInput={TextField}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$ "
                value={expense.vr_unit}
                onValueChange={(values) => handleExtraExpenseChange(expense.id, 'vr_unit', values.value)}
                size="small"
              />
            </TableCell>
            <TableCell align="right">
              {formatCurrency(expense.cantidad * expense.vr_unit)}
            </TableCell>
            <TableCell align="center">
            <Tooltip title="Eliminar gasto extra">
              <IconButton 
                color="error" 
                onClick={() => handleRemoveExtraExpense(expense.id)}
                disabled={loadingDeleteId === expense.id} // Deshabilita el botón mientras carga
              >
                {loadingDeleteId === expense.id ? <CircularProgress size={20} /> : <Delete />}
              </IconButton>
            </Tooltip>
            </TableCell>
          </TableRow>
        ))}

        <TableRow>
          <TableCell colSpan={5} align="center">
            <Button 
              variant="outlined" 
              startIcon={isAddingExtraExpense ? <CircularProgress size={20} /> : <Add />} 
              onClick={handleAddExtraExpense}
              disabled={isAddingExtraExpense} // Deshabilita el botón mientras carga
            >
              Agregar Gasto Extra
            </Button>
          </TableCell>
        </TableRow>
    
        {/* TOTALES */}
        <TableRow>
          <TableCell colSpan={3} sx={{ fontWeight: 600, borderTop: '1px solid #e0e0e0', pt: 2 }}>
            SUBTOTAL GASTOS
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 600, borderTop: '1px solid #e0e0e0', pt: 2 }}>
            {formatCurrency(subtotalGastos)}
          </TableCell>
          <TableCell></TableCell>
        </TableRow>

        {/* Imprevistos (3%) */}
        <TableRow>
          <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
            Imprevistos (3%)
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 600 }}>
            {formatCurrency(imprevistos)}
          </TableCell>
          <TableCell></TableCell>
        </TableRow>

        {/* Total Gastos + Imprevistos con color */}
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
          <TableCell></TableCell>
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
