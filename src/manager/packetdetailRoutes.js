const express = require('express');
const router = express.Router();
const db = require("../../db");
router.get('/', (req, res) => {
  db.query('SELECT * FROM tbpacket_detail', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM tbpacket_detail WHERE packetdetail_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0]);
  });
});

router.post('/', (req, res) => {
  const { packetdetail_id , packet_id, ser_id } = req.body;
  db.query(
    'INSERT INTO tbpacket_detail (packetdetail_id , packet_id, ser_id) VALUES (?, ?, ?)',
    [packetdetail_id , packet_id, ser_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'Packet created successfully', packetdetail_id: result.insertId });
    }
  );
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { packetdetail_id , packet_id, ser_id } = req.body;
  db.query(
    'UPDATE tbpacket_detail SET packetdetail_id = ?, ser_id = ? WHERE packetdetail_id = ?',
    [packet_id, ser_id, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Packet updated successfully' });
    }
  );
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM tbpacket_detail WHERE packetdetail_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Packet deleted successfully' });
  });
});

module.exports = router;