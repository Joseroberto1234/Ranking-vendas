const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { sequelize } = require('./db');
const salesRouter = require('./routes/sales');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', salesRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

sequelize.sync().then(() => {
  console.log('Banco sincronizado com MySQL');
  app.listen(port, host, () => {
    console.log(`Servidor rodando em http://${host}:${port}`);
    console.log('Se estiver na mesma rede local, use o IP do seu PC no navegador de outro dispositivo.');
  });
}).catch((error) => {
  console.error('Erro ao conectar com o banco:', error);
  process.exit(1);
});
