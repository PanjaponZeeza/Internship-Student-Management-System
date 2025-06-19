// models/internship_program.js
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return dateStr.slice(0, 10);
};

const getAllPrograms = () => {
  const sql = `
    SELECT ip.*, u.username AS supervisor_username
    FROM internship_programs ip
    LEFT JOIN users u ON ip.supervisor_id = u.user_id
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

const createPrograms = async (programs) => {
  if (!Array.isArray(programs)) programs = [programs];
  const values = programs.map(p => [
    p.program_id || uuidv4(),
    p.program_name,
    formatDate(p.start_date),
    formatDate(p.end_date),
    p.supervisor_id || null,
    p.details || null,
    p.status || 'active'
  ]);
  const sql =
    `INSERT INTO internship_programs
    (program_id, program_name, start_date, end_date, supervisor_id, details, status)
    VALUES ?`;
  return new Promise((resolve, reject) => {
    db.query(sql, [values], (err, result) => {
      if (err) reject(err);
      resolve({ affected: values.length });
    });
  });
};

const updateProgram = (id, data) => {
  const sql =
    `UPDATE internship_programs
    SET program_name = ?, start_date = ?, end_date = ?, supervisor_id = ?, details = ?, status = ?
    WHERE program_id = ?`;
  const values = [
    data.program_name,
    formatDate(data.start_date),
    formatDate(data.end_date),
    data.supervisor_id || null,
    data.details,
    data.status || 'active',
    id
  ];
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const bulkUpdatePrograms = (programs) => {
  const promises = programs.map(p => {
    const sql =
      `UPDATE internship_programs
      SET program_name = ?, start_date = ?, end_date = ?, supervisor_id = ?, details = ?, status = ?
      WHERE program_id = ?`;
    const values = [
      p.program_name,
      formatDate(p.start_date),
      formatDate(p.end_date),
      p.supervisor_id || null,
      p.details,
      p.status || 'active',
      p.program_id
    ];
    return new Promise((resolve, reject) => {
      db.query(sql, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
  return Promise.all(promises);
};

const deleteProgram = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM internship_programs WHERE program_id = ?', [id], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const bulkDeletePrograms = (ids) => {
  const sql = 'DELETE FROM internship_programs WHERE program_id IN (?)';
  return new Promise((resolve, reject) => {
    db.query(sql, [ids], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const bulkImportPrograms = (programs) => {
  const values = programs.map(p => [
    p.program_name,
    formatDate(p.start_date),
    formatDate(p.end_date),
    p.supervisor_id || null,
    p.details || null,
    p.status || 'active',
  ]);
  const sql = `
    INSERT INTO internship_programs
    (program_name, start_date, end_date, supervisor_id, details, status)
    VALUES ?
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, [values], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  getAllPrograms,
  createPrograms,
  updateProgram,
  bulkUpdatePrograms,
  deleteProgram,
  bulkDeletePrograms,
  bulkImportPrograms,
};
