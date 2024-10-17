const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Middleware to attach the DB connection to the request
 */
module.exports = (db) => {
  
  /**
   * Endpoint to get all jobs.
   */
  router.get('/', (req, res) => {
    const sql = 'SELECT * FROM jobs';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send({ error: err.message });
      res.send(result);
    });
  });

  /**
   * Endpoint to add a new job.
   */
  router.post('/', (req, res) => {
    const { name, role, company } = req.body;
    const sql = `INSERT INTO jobs (name, role, company, application_count) VALUES (?, ?, ?, ?)`;
    const values = [name, role, company, 0];

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).send({ error: err.message });
      res.status(201).send('Job added successfully!');
    });
  });

  /**
   * Endpoint to apply for a job, increments application count.
   */
  router.post('/apply', (req, res) => {
    const jobId = req.body.jobId;
    const sql = `UPDATE jobs SET application_count = application_count + 1 WHERE idjobs = ?`;

    db.query(sql, [jobId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Error updating application count', error });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.status(200).json({ message: 'Application count updated successfully' });
    });
  });

  /**
   * Endpoint to get all applicants for a specific job.
   */
  router.get('/:jobId/applicants', async (req, res) => {
    const jobId = req.params.jobId;

    try {
      const response = await axios.get(`http://localhost:3001/users/${jobId}/getAllApplicants`);
      res.status(200).json(response.data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};
