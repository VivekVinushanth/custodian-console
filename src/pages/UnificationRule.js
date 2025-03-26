import React, { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Typography, Box
} from "@mui/material";
import { fetchRules } from "../api/users";
import { Card, CardContent } from "../components/ui/card";

const UnificationRulesPage = () => {
    const [rules, setRules] = useState([]);

    useEffect(() => {
        fetchRules()
            .then((data) => {
                console.log("Fetched rules:", data);
                setRules(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error("Error fetching unification rules:", error);
                setRules([]);
            });
    }, []);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <Box sx={{ p: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Unification Rules
            </Typography>

            <Card>
                <CardContent>
                    {rules.length === 0 ? (
                        <Typography>No unification rules found.</Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Rule Name</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Rules</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rules.map((rule, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{rule.rule_name || "Unnamed Rule"}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={rule.is_active ? "Active" : "Inactive"}
                                                    color={rule.is_active ? "success" : "default"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell><strong>Attribute</strong></TableCell>
                                                            <TableCell><strong>Priority</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {(rule.rules || []).map((subRule, subIndex) => (
                                                            <TableRow key={subIndex}>
                                                                <TableCell>{subRule.attribute}</TableCell>
                                                                <TableCell>{subRule.priority}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default UnificationRulesPage;
