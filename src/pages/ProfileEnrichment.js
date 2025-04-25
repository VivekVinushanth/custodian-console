
import React, { useState, useEffect } from "react";
import {
    Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, TextField, Grid, IconButton, Button, MenuItem,
    Checkbox, FormControlLabel
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axios from "axios";

const traitTypes = ["static", "computed"];
const mergeStrategies = ["overwrite", "combine", "ignore"];
const eventTypes = ["identify", "page", "track"];
const maskingStrategies = ["hash", "truncate", "redact"];
const propertyGroups = ["Identity Attribute", "Traits", "Application Data"];
const computationMethods = ["copy", "concat", "count"];
const valueTypes = ["string", "int", "boolean", "date", "arrayOfString", "arrayOfInt"];
const conditionOperators = [
    "equals", "not_equals", "exists", "not_exists",
    "contains", "not_contains", "greater_than", "greater_than_equals",
    "less_than", "less_than_equals"
];

const propertyGroupMap = {
    "Identity Attribute": "identity_attributes",
    "Traits": "traits",
    "Application Data": "application_data"
};

const timeRanges = [
    { label: "Last 15 minutes", value: 900 },
    { label: "Last 30 minutes", value: 1800 },
    { label: "Last 1 hour", value: 3600 },
    { label: "Last 3 hours", value: 10800 },
    { label: "Last 6 hours", value: 21600 },
    { label: "Last 12 hours", value: 43200 },
    { label: "Last 1 day", value: 86400 },
    { label: "Last 3 days", value: 259200 },
    { label: "Last 1 week", value: 604800 },
    { label: "Last 2 weeks", value: 1209600 },
    { label: "Last 1 month", value: 2592000 },
];

const ProfileTraitsPage = () => {
    const [rules, setRules] = useState([]);
    const [form, setForm] = useState({
        trait_name: "",
        description: "",
        trait_type: "static",
        value: "",
        value_type: "string",
        computation: "",
        source_fields: ["", ""],
        time_range: "",
        merge_strategy: "overwrite",
        masking_required: false,
        masking_strategy: "",
        trigger: {
            event_type: "",
            event_name: "",
            conditions: [{ field: "", operator: "", value: "" }]
        },
        enabled: true
    });

    const [propertyGroup, setPropertyGroup] = useState("Identity Attribute");
    const [propertySuffix, setPropertySuffix] = useState("");

    useEffect(() => { loadRules(); }, []);

    const loadRules = async () => {
        try {
            const res = await axios.get("http://localhost:8900/api/v1/enrichment-rules/");
            setRules(res.data || []);
        } catch (err) {
            console.error("Failed to fetch profile traits", err);
        }
    };

    const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
    const updateTrigger = (key, value) => setForm(prev => ({ ...prev, trigger: { ...prev.trigger, [key]: value } }));
    const updateCondition = (index, field, value) => {
        const updated = [...form.trigger.conditions];
        updated[index][field] = value;
        updateTrigger("conditions", updated);
    };

    const addCondition = () => updateTrigger("conditions", [...form.trigger.conditions, { field: "", operator: "", value: "" }]);
    const removeCondition = (index) => updateTrigger("conditions", form.trigger.conditions.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        const fullTraitName = propertySuffix
            ? `${propertyGroupMap[propertyGroup]}.${propertySuffix}`
            : propertyGroupMap[propertyGroup];

        if (form.trait_type === "computed" && form.computation === "copy" && (!form.source_fields[0] || form.source_fields[0].trim() === "")) {
            alert("Source field is required for 'copy' computation.");
            return;
        }

        if (form.trait_type === "computed" && form.computation === "concat" && (form.source_fields.length < 2 || !form.source_fields[0] || !form.source_fields[1])) {
            alert("Two source fields are required for 'concat' computation.");
            return;
        }

        const now = new Date();
        const from = form.computation === "count" && form.time_window
            ? new Date(now.getTime() - parseInt(form.time_window) * 60000).toISOString()
            : undefined;

        const payload = {
            ...form,
            trait_name: fullTraitName,
            value: form.trait_type === "static" ? form.value : undefined,
            computation: form.trait_type === "computed" ? form.computation : undefined,
            source_fields: form.trait_type === "computed" ? form.source_fields.filter(f => f && f.trim() !== "") : undefined,
            from: form.computation === "count" ? from : undefined,
            to: form.computation === "count" ? now.toISOString() : undefined,
            masking_strategy: form.masking_required ? form.masking_strategy : undefined
        };

        try {
            await axios.post("http://localhost:8900/api/v1/enrichment-rules", payload);
            resetForm();
            loadRules();
        } catch (err) {
            console.error("Failed to create profile trait rule", err);
        }
    };

    const resetForm = () => {
        setForm({
            trait_name: "",
            description: "",
            trait_type: "static",
            value: "",
            value_type: "string",
            computation: "",
            source_fields: ["", ""],
            time_window: "",
            merge_strategy: "overwrite",
            masking_required: false,
            masking_strategy: "",
            trigger: {
                event_type: "",
                event_name: "",
                conditions: [{ field: "", operator: "", value: "" }]
            },
            enabled: true
        });
        setPropertySuffix("");
        setPropertyGroup("identity");
    };

    const handleDelete = async (traitId) => {
        try {
            await axios.delete(`http://localhost:8900/api/v1/enrichment-rules/${traitId}`);
            loadRules();
        } catch (err) {
            console.error("Failed to delete trait", err);
        }
    };

    return (
        <Box sx={{ p: 6 }}>
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6">Create Profile Enrichment Trait</Typography>
                    <Grid container spacing={2} mt={1}>
                        <Grid item xs={4}>
                            <TextField select label="Property Group" value={propertyGroup} fullWidth onChange={(e) => setPropertyGroup(e.target.value)}>
                                {propertyGroups.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={8}>
                            <TextField label="Property Suffix" fullWidth value={propertySuffix} onChange={(e) => setPropertySuffix(e.target.value)} placeholder="e.g. full_name" />
                        </Grid>
                        <Grid item xs={6}><TextField label="Description" fullWidth value={form.description} onChange={e => updateForm("description", e.target.value)} /></Grid>
                        <Grid item xs={6}>
                            <TextField select label="Trait Type" fullWidth value={form.trait_type} onChange={e => updateForm("trait_type", e.target.value)}>
                                {traitTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select label="Value Type" fullWidth value={form.value_type} onChange={e => updateForm("value_type", e.target.value)}>
                                {valueTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </TextField>
                        </Grid>

                        {form.trait_type === "static" && (
                            <Grid item xs={6}><TextField label="Value" fullWidth value={form.value} onChange={e => updateForm("value", e.target.value)} /></Grid>
                        )}

                        {form.trait_type === "computed" && (
                            <>
                                <Grid item xs={6}>
                                    <TextField select label="Computation Method" fullWidth value={form.computation} onChange={e => updateForm("computation", e.target.value)}>
                                        {computationMethods.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                    </TextField>
                                </Grid>

                                {form.computation === "copy" && (
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Source Field"
                                            fullWidth
                                            value={form.source_fields[0] || ""}
                                            onChange={e =>
                                                updateForm("source_fields", [e.target.value, form.source_fields[1] || ""])
                                            }
                                        />
                                    </Grid>
                                )}

                                {form.computation === "concat" && (
                                    <>
                                        <Grid item xs={6}><TextField label="First Source Field" fullWidth value={form.source_fields[0] || ""} onChange={e => updateForm("source_fields", [e.target.value, form.source_fields[1] || ""])}/></Grid>
                                        <Grid item xs={6}><TextField label="Second Source Field" fullWidth value={form.source_fields[1] || ""} onChange={e => updateForm("source_fields", [form.source_fields[0] || "", e.target.value])}/></Grid>
                                    </>
                                )}

                                {form.computation === "count" && (
                                    <Grid item xs={6}>
                                        <TextField select label="Time Range" fullWidth value={form.time_window} onChange={e => updateForm("time_window", e.target.value.toString())}>
                                            {timeRanges.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                )}
                            </>
                        )}

                        <Grid item xs={6}>
                            <TextField select label="Merge Strategy" fullWidth value={form.merge_strategy} onChange={e => updateForm("merge_strategy", e.target.value)}>
                                {mergeStrategies.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </TextField>
                        </Grid>

                        <Grid item xs={6}>
                            <FormControlLabel control={<Checkbox checked={form.masking_required} onChange={(e) => updateForm("masking_required", e.target.checked)} />} label="Masking Required" />
                        </Grid>

                        {form.masking_required && (
                            <Grid item xs={6}>
                                <TextField select label="Masking Strategy" fullWidth value={form.masking_strategy} onChange={e => updateForm("masking_strategy", e.target.value)}>
                                    {maskingStrategies.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                </TextField>
                            </Grid>
                        )}
                    </Grid>

                    <Box mt={4} p={2} sx={{ border: "1px solid #ccc", borderRadius: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>Trigger</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField select label="Event Type" fullWidth value={form.trigger.event_type} onChange={e => updateTrigger("event_type", e.target.value)}>
                                    {eventTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={6}><TextField label="Event Name" fullWidth value={form.trigger.event_name} onChange={e => updateTrigger("event_name", e.target.value)} /></Grid>
                        </Grid>

                        <Box mt={2}>
                            <Typography variant="subtitle2">Conditions</Typography>
                            {form.trigger.conditions.map((cond, i) => (
                                <Grid container spacing={2} alignItems="center" key={i} sx={{ mb: 1 }}>
                                    <Grid item xs={3}><TextField label="Field" fullWidth value={cond.field} onChange={e => updateCondition(i, "field", e.target.value)} /></Grid>
                                    <Grid item xs={3}>
                                        <TextField select label="Operator" fullWidth value={cond.operator} onChange={e => updateCondition(i, "operator", e.target.value)}>
                                            {conditionOperators.map(op => <MenuItem key={op} value={op}>{op}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={4}><TextField label="Value" fullWidth value={cond.value} onChange={e => updateCondition(i, "value", e.target.value)} /></Grid>
                                    <Grid item xs={2}><IconButton color="error" onClick={() => removeCondition(i)}><Delete /></IconButton></Grid>
                                </Grid>
                            ))}
                            <Button onClick={addCondition} startIcon={<Add />} sx={{ mb: 2 }}>Add Condition</Button>
                        </Box>
                    </Box>

                    <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Submit</Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6">Existing Traits</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Trait Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Value Type</TableCell>
                                    <TableCell>Merge Strategy</TableCell>
                                    <TableCell>Event</TableCell>
                                    <TableCell>Conditions</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rules.map((rule) => (
                                    <TableRow key={rule.trait_id}>
                                        <TableCell>{rule.trait_name}</TableCell>
                                        <TableCell>{rule.trait_type}</TableCell>
                                        <TableCell>{rule.value_type}</TableCell>
                                        <TableCell>{rule.merge_strategy}</TableCell>
                                        <TableCell>{`${rule.trigger?.event_type || ""} - ${rule.trigger?.event_name || ""}`}</TableCell>
                                        <TableCell>
                                            <ul>
                                                {rule.trigger?.conditions?.map((c, i) => (
                                                    <li key={i}>{`${c.field} ${c.operator} ${c.value}`}</li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="error" onClick={() => handleDelete(rule.trait_id)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ProfileTraitsPage;
