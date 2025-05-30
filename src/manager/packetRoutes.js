const express = require('express');
const router = express.Router();
const db = require("../../db");
router.get('/', (req, res) => {
  db.query('SELECT * FROM tbpacket', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM tbpacket WHERE packet_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0]);
  });
});

router.post('/', (req, res) => {
  const { packet_id, packet_name, price } = req.body;
  db.query(
    'INSERT INTO tbpacket (packet_id, packet_name, price) VALUES (?, ?, ?)',
    [packet_id, packet_name, price],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'Packet created successfully', packet_id: result.insertId });
    }
  );
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { packet_id, packet_name, price } = req.body;
  db.query(
    'UPDATE tbpacket SET packet_id = ?, packet_name = ?, price = ? WHERE packet_id = ?',
    [packet_id, packet_name, price, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Packet updated successfully' });
    }
  );
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM tbpacket WHERE packet_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Packet deleted successfully' });
  });
});

module.exports = router;
