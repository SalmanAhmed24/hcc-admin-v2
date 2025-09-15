"use client";
import React, { useState, useEffect } from "react";import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const data = [
  { id: 1, task: 'Build Website', taskDescription: 'Make Website for XYZ Client', dueDate: '24/09/2025' },
{ id: 2, task: 'SEO for Client', taskDescription: 'SEO of website for XYZ Client', dueDate: '26/09/2025' }];

const TaskAccordion = ({user, client}) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Click to View Task (Under Development)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Task</TableCell>
                <TableCell>Task Description</TableCell>
                <TableCell>Due Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.task}</TableCell>
                  <TableCell>{row.taskDescription}</TableCell>
                  <TableCell>{row.dueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

export default TaskAccordion;
